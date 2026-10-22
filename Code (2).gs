/**
 * 脳と医工学 — news collector (Google Apps Script web app)
 *
 *   GET  (no parameters)                     latest items as JSON (public)
 *   POST {action:'bm-load'|'bm-save'|'refresh', pass, items}
 * Collects every hour from RSS / Atom / PubMed / arXiv, keeps only brain-related biomedical
 * engineering, tags each item, adds a Japanese headline with the built-in translator.
 * Data lives in Google Drive: news-data/news_items.json, news_feed.json, news_bookmarks.json
 *
 * First time: set PASS_PHRASE, run setup() once (installs the hourly trigger and collects),
 * then Deploy > New deployment > Web app (Execute as: Me / Who has access: Anyone).
 * To change sources, edit NEWS_FEEDS below.
 */
const PASS_PHRASE = 'ここを自分だけの合言葉に変える';
const DATA_FOLDER = 'news-data';

const NEWS_FEEDS = [
  { name: 'Google News', q: '"brain-computer interface" OR "brain-machine interface"', trust: true },
  { name: 'Google News', q: 'Neuralink OR Synchron OR "Precision Neuroscience" OR Paradromics OR "Blackrock Neurotech"', trust: true },
  { name: 'Google News', q: 'neurotechnology OR "neural implant" OR "brain implant" OR neuroprosthetic', trust: true },
  { name: 'Google News', q: '"deep brain stimulation" OR neuromodulation OR "focused ultrasound" brain' },
  { name: 'Google News', q: '"spinal cord" (implant OR stimulation) paralysis' },
  { name: 'Google News', q: 'ブレイン・マシン・インターフェース OR ブレイン・コンピューター・インターフェース OR ニューロテック OR 脳波 デバイス', lang: 'ja' },
  { name: 'Neuroscience News', url: 'https://neurosciencenews.com/neuroscience-topics/neurotech/feed/', trust: true },
  { name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org/feeds/topic/biomedical.rss' },
  { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/mind_brain/neuroscience.xml' },
  { name: 'Medical Xpress', url: 'https://medicalxpress.com/rss-feed/neuroscience-news/' },
  { name: 'Nature Biomedical Engineering', url: 'https://www.nature.com/natbiomedeng.rss', kind: 'paper' },
  { name: 'Journal of Neural Engineering', url: 'https://iopscience.iop.org/journal/rss/1741-2552', kind: 'paper', trust: true },
  { name: 'PubMed', pubmed: '("brain-computer interface"[tiab] OR "brain-machine interface"[tiab] OR "neural interface"[tiab] OR intracortical[tiab] OR neuroprosthe*[tiab] OR "deep brain stimulation"[tiab] OR "transcranial magnetic stimulation"[tiab] OR "transcranial focused ultrasound"[tiab])', kind: 'paper' },
  { name: 'arXiv', arxiv: 'abs:"brain-computer interface" OR abs:"brain-machine interface" OR abs:"neural decoding" OR abs:"intracortical"', kind: 'paper', trust: true },
];
const NEWS_KEEP_DAYS = 120, NEWS_KEEP_MAX = 2500, NEWS_SERVE_MAX = 600, NEWS_TRANSLATE_PER_RUN = 80;


function setup() {
  if (!PASS_PHRASE || PASS_PHRASE.indexOf('ここを') === 0) throw new Error('PASS_PHRASE を書き換えてから実行してください');
  PropertiesService.getScriptProperties().setProperty('PASS', PASS_PHRASE);
  dataFolder_();
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'updateNews') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('updateNews').timeBased().everyHours(1).create();
  const r = updateNews();
  Logger.log('準備完了。1時間ごとの自動収集を設定しました: ' + JSON.stringify(r));
}

function doGet() {
  try { return newsGet_(); } catch (err) { return json_({ ok: false, error: String(err && err.message || err) }); }
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }
  if (!checkPass_(req.pass)) return json_({ ok: false, error: 'auth' });
  try { return json_(newsPost_(req)); } catch (err) { return json_({ ok: false, error: String(err && err.message || err) }); }
}

/* ---------- shared helpers ---------- */
function checkPass_(p) {
  const want = PropertiesService.getScriptProperties().getProperty('PASS');
  return !!want && typeof p === 'string' && p === want;
}
function dataFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder(DATA_FOLDER);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}
function findFile_(folder, name) {
  const it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}
function readJson_(name, fallback) {
  const f = findFile_(dataFolder_(), name);
  if (!f) return fallback;
  try { return JSON.parse(f.getBlob().getDataAsString()); } catch (e) { return fallback; }
}
function writeJson_(name, obj) {
  const folder = dataFolder_(), body = JSON.stringify(obj), f = findFile_(folder, name);
  if (f) f.setContent(body); else folder.createFile(name, body, MimeType.PLAIN_TEXT);
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- collection ---------- */
function updateNews() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(2000)) return { busy: true, added: 0, failed: 0 };
  try { return collect_(); } finally { lock.releaseLock(); }
}

function collect_() {
  const started = Date.now();
  const store = readJson_('news_items.json', { items: [] });
  const byId = {}; store.items.forEach(function (it) { byId[it.id] = it; });
  const seenTitle = {}; store.items.forEach(function (it) { seenTitle[normTitle(it.t)] = it.id; });
  const status = [];
  const reqs = NEWS_FEEDS.map(function (f) { return { url: feedUrl(f), muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (sora-apps news reader)' } }; });
  const res = UrlFetchApp.fetchAll(reqs);
  let added = 0;
  NEWS_FEEDS.forEach(function (f, i) {
    const label = f.name + (f.q ? '：' + f.q.slice(0, 24) : '');
    try {
      const code = res[i].getResponseCode();
      if (code >= 400) { status.push({ name: label, ok: false, error: 'HTTP ' + code }); return; }
      let raw = [];
      if (f.pubmed) raw = pubmedItems_(res[i].getContentText());
      else raw = parseFeed(res[i].getContentText());
      let n = 0;
      raw.slice(0, 40).forEach(function (r) {
        const it = normalizeItem(r, f);
        if (!it) return;
        const nt = normTitle(it.t);
        if (byId[it.id] || seenTitle[nt]) return;
        byId[it.id] = it; seenTitle[nt] = it.id; n++; added++;
      });
      status.push({ name: label, ok: true, n: n, total: raw.length });
    } catch (err) {
      status.push({ name: label, ok: false, error: String(err && err.message || err).slice(0, 120) });
    }
  });
  // Japanese titles with Apps Script's built-in translator (free, quota-limited)
  let tr = 0;
  const all = Object.keys(byId).map(function (k) { return byId[k]; }).sort(function (a, b) { return b.d - a.d; });
  for (let i = 0; i < all.length && tr < NEWS_TRANSLATE_PER_RUN; i++) {
    const it = all[i];
    if (it.l === 'ja' || it.tj || it.tjFail) continue;
    try { it.tj = LanguageApp.translate(it.t, 'en', 'ja'); tr++; } catch (e) { it.tjFail = 1; break; }
  }
  const cutoff = Date.now() - NEWS_KEEP_DAYS * 864e5;
  const kept = all.filter(function (it) { return it.d >= cutoff; }).slice(0, NEWS_KEEP_MAX);
  writeJson_('news_items.json', { updated: Date.now(), items: kept });
  const feed = { ok: true, updated: Date.now(), items: kept.slice(0, NEWS_SERVE_MAX).map(function (it) { const o = Object.assign({}, it); delete o.tjFail; return o; }), sources: status };
  writeJson_('news_feed.json', feed);
  cachePut_('news', JSON.stringify(feed));
  return { added: added, translated: tr, total: kept.length, ms: Date.now() - started, failed: status.filter(function (s) { return !s.ok; }).length };
}

function newsGet_() {
  let body = cacheGet_('news');
  if (!body) { const f = findFile_(dataFolder_(), 'news_feed.json'); body = f ? f.getBlob().getDataAsString() : JSON.stringify({ ok: true, updated: 0, items: [], sources: [] }); cachePut_('news', body); }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function newsPost_(req) {
  if (req.action === 'bm-load') return Object.assign({ ok: true }, readJson_('news_bookmarks.json', { updated: 0, items: {} }));
  if (req.action === 'bm-save') { const o = { updated: Date.now(), items: req.items || {} }; writeJson_('news_bookmarks.json', o); return { ok: true, updated: o.updated }; }
  if (req.action === 'refresh') { const r = updateNews(); return r.busy ? { ok: false, error: 'busy' } : Object.assign({ ok: true }, r); }
  return { ok: false, error: 'unknown action' };
}

/* ---------- source helpers ---------- */
function feedUrl(f) {
  if (f.url) return f.url;
  if (f.q) {
    const ja = f.lang === 'ja';
    return 'https://news.google.com/rss/search?q=' + encodeURIComponent(f.q + ' when:7d') + (ja ? '&hl=ja&gl=JP&ceid=JP:ja' : '&hl=en-US&gl=US&ceid=US:en');
  }
  if (f.pubmed) return 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=40&sort=pub_date&datetype=edat&reldate=14&term=' + encodeURIComponent(f.pubmed);
  if (f.arxiv) return 'https://export.arxiv.org/api/query?sortBy=submittedDate&sortOrder=descending&max_results=30&search_query=' + encodeURIComponent(f.arxiv);
  return '';
}
function pubmedItems_(searchJson) {
  const ids = (JSON.parse(searchJson).esearchresult || {}).idlist || [];
  if (!ids.length) return [];
  const r = UrlFetchApp.fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + ids.join(','), { muteHttpExceptions: true });
  return pubmedSummaryToItems(JSON.parse(r.getContentText()));
}
function cachePut_(key, str) {
  const c = CacheService.getScriptCache(), size = 90000, parts = {};
  const n = Math.ceil(str.length / size);
  for (let i = 0; i < n; i++) parts[key + '_' + i] = str.slice(i * size, (i + 1) * size);
  parts[key + '_n'] = String(n);
  try { c.putAll(parts, 21600); } catch (e) {}
}
function cacheGet_(key) {
  const c = CacheService.getScriptCache(), n = +(c.get(key + '_n') || 0);
  if (!n) return null;
  const keys = []; for (let i = 0; i < n; i++) keys.push(key + '_' + i);
  const got = c.getAll(keys); let s = '';
  for (let i = 0; i < n; i++) { if (got[keys[i]] == null) return null; s += got[keys[i]]; }
  return s;
}

/* ---------- pure functions (no Apps Script services; tested outside GAS) ---------- */
function decodeEntities(s) {
  return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); })
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function stripTags(s) { return decodeEntities(String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function tagText(block, names) {
  for (let i = 0; i < names.length; i++) {
    const m = block.match(new RegExp('<' + names[i] + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + names[i] + '>', 'i'));
    if (m) return m[1];
  }
  return '';
}
function attr(block, tag, name, where) {
  const re = new RegExp('<' + tag + '\\b([^>]*)>', 'gi'); let m;
  while ((m = re.exec(block))) {
    if (where && !where.test(m[1])) continue;
    const a = m[1].match(new RegExp(name + '\\s*=\\s*"([^"]*)"', 'i')) || m[1].match(new RegExp(name + "\\s*=\\s*'([^']*)'", 'i'));
    if (a) return decodeEntities(a[1]);
  }
  return '';
}
/* RSS 2.0, RSS 1.0 (RDF) and Atom */
function parseFeed(xml) {
  xml = String(xml || '');
  const atom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = xml.match(atom ? /<entry[\s>][\s\S]*?<\/entry>/gi : /<item[\s>][\s\S]*?<\/item>/gi) || [];
  return blocks.map(function (b) {
    let link = '';
    if (atom) link = attr(b, 'link', 'href', /rel\s*=\s*["']alternate["']/i) || attr(b, 'link', 'href');
    else link = stripTags(tagText(b, ['link'])) || attr(b, 'item', 'rdf:about') || stripTags(tagText(b, ['guid']));
    const descRaw = tagText(b, ['description', 'summary', 'content:encoded', 'content']);
    const img = attr(b, 'media:content', 'url') || attr(b, 'media:thumbnail', 'url') || attr(b, 'enclosure', 'url', /type\s*=\s*["']image/i) ||
      ((decodeEntities(descRaw).match(/<img[^>]+src\s*=\s*["']([^"']+)["']/i) || [])[1] || '');
    return {
      title: stripTags(tagText(b, ['title', 'dc:title'])),
      link: link.trim(),
      guid: stripTags(tagText(b, ['guid', 'id'])),
      date: stripTags(tagText(b, ['pubDate', 'published', 'dc:date', 'updated', 'prism:publicationDate'])),
      desc: stripTags(descRaw),
      source: stripTags(tagText(b, ['source', 'prism:publicationName'])),
      author: stripTags(tagText(b, ['dc:creator', 'name'])),
      image: img
    };
  }).filter(function (r) { return r.title && r.link; });
}
function pubmedSummaryToItems(sum) {
  const res = sum.result || {}, uids = res.uids || [];
  return uids.map(function (id) {
    const r = res[id] || {};
    const d = (r.sortpubdate || r.epubdate || r.pubdate || '').replace(/\//g, '-').replace(' ', 'T');
    const authors = (r.authors || []).slice(0, 3).map(function (a) { return a.name; }).join(', ') + ((r.authors || []).length > 3 ? ' ほか' : '');
    return { title: stripTags(r.title || ''), link: 'https://pubmed.ncbi.nlm.nih.gov/' + id + '/', guid: 'pmid:' + id, date: d, desc: authors, source: r.fulljournalname || r.source || 'PubMed', image: '' };
  }).filter(function (r) { return r.title; });
}

const NEWS_TAGS = [
  ['bci', /brain[\s\-‐–]*(computer|machine)[\s\-‐–]*interface|\bBCIs?\b|\bBMIs?\b(?![\s-]*(index|score|of|value))|neural interface|neuralink|synchron|precision neuroscience|blackrock neurotech|paradromics|intracortical|speech (decod|neuroprosthe)|brain implant|neural implant|ブレイン.?(マシン|コンピュータ|コンピューター).?インター|脳.?(コンピュータ|機械).?インター/i],
  ['stim', /deep brain stimulat|\bDBS\b|transcranial (magnetic|direct|alternating|focused|ultrasound)|\bTMS\b|\btDCS\b|neuromodulat|vagus nerve stimulat|spinal cord stimulat|focused ultrasound|optogenet|closed[\s-]loop stimulat|脳深部刺激|経頭蓋|神経刺激|ニューロモデュレーション/i],
  ['imaging', /\bf?MRI\b|\bEEG\b|\bMEG\b|\bPET\b|fNIRS|neuroimaging|electroencephalo|magnetoencephalo|diffusion tensor|connectom|brain imaging|brain scan|脳波|脳画像|MRI/i],
  ['rehab', /prosthe(sis|tic|ses)|exoskeleton|paraly[sz]|tetrapleg|quadripleg|spinal cord injur|stroke rehab|rehabilitat|cochlear implant|retinal (implant|prosthe)|bionic|regain(ed)? (movement|speech|walking)|リハビリ|義手|義足|麻痺/i],
  ['device', /electrode|neural probe|implantable|wearable|flexible electronic|microelectrode|neurotech|neural dust|hydrogel|biosensor|chip\b|ultrasound device|デバイス|電極|ウェアラブル/i],
  ['ai', /\bAI\b|artificial intelligence|deep learning|machine learning|neural decod|foundation model|language model|transformer|人工知能|機械学習|生成AI/i],
];
const NEURO_RE = /brain|neur(o|al|on)|cortex|cortical|cerebr|spinal|nerve|cochlear|retinal|epilep|parkinson|alzheimer|dementia|stroke|\bALS\b|amyotrophic|paraly|seizure|cognit|psychiatr|depress|脳|神経|脊髄|てんかん|パーキンソン|認知症|ALS/i;
const TECH_RE = /interface|implant|stimulat|imaging|scan|MRI|EEG|MEG|electrode|device|prosthe|robot|exoskeleton|ultrasound|sensor|chip|decod|algorithm|wearable|neurotech|engineer|optogenet|\bAI\b|machine learning|deep learning|surgical|therapy system|インターフェース|インプラント|刺激|デバイス|電極|装置|工学|AI|ロボット/i;

function classify(text, feed) {
  const tags = NEWS_TAGS.filter(function (t) { return t[1].test(text); }).map(function (t) { return t[0]; });
  const neuro = NEURO_RE.test(text), tech = TECH_RE.test(text);
  const accept = tags.indexOf('bci') >= 0 || (neuro && tech) || (!!(feed && feed.trust) && neuro);
  return { tags: tags, accept: accept };
}
function normTitle(t) { return String(t || '').toLowerCase().replace(/\s+-\s+[^-]+$/, '').replace(/[^\w぀-ヿ一-鿿]+/g, '').slice(0, 90); }
function hashId(s) { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function normalizeItem(r, f) {
  let title = r.title, source = r.source || f.name;
  if (f.q) { const m = title.match(/^(.*)\s+-\s+([^-]{2,60})$/); if (m) { title = m[1]; if (!r.source) source = m[2]; } }
  const text = title + ' ' + (r.desc || '');
  const c = classify(text, f);
  if (!c.accept) return null;
  let d = Date.parse(r.date); if (!isFinite(d)) d = Date.now();
  if (d > Date.now() + 864e5) d = Date.now();
  let snip = (r.desc || '').replace(/\s+/g, ' ');
  if (f.q) snip = '';
  if (snip.length > 260) snip = snip.slice(0, 257) + '…';
  const ja = f.lang === 'ja' || /[぀-ヿ]/.test(title);
  return { id: hashId(r.link || r.guid || title), t: title, u: r.link, s: source, d: d, x: snip, im: r.image || '', k: f.kind || 'news', g: c.tags, l: ja ? 'ja' : 'en', f: Date.now() };
}
