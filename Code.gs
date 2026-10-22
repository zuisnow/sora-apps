/**
 * 駅伝監督 — cloud save (Google Apps Script web app)
 *
 *   GET  ?ping                              health check
 *   POST {action:'save'|'load'|'info', slot, pass, data}
 * The game sends POST bodies as text/plain, so the browser needs no CORS preflight.
 * Saves live in Google Drive: ekiden-data/ekiden_<slot>.json (+ one backup per day, newest 5 kept).
 *
 * First time: set PASS_PHRASE, run setup() once, then
 * Deploy > New deployment > Web app (Execute as: Me / Who has access: Anyone).
 */
const PASS_PHRASE = 'ここを自分だけの合言葉に変える';
const DATA_FOLDER = 'ekiden-data';
const KEEP_BACKUPS = 5;

function setup() {
  if (!PASS_PHRASE || PASS_PHRASE.indexOf('ここを') === 0) throw new Error('PASS_PHRASE を書き換えてから実行してください');
  PropertiesService.getScriptProperties().setProperty('PASS', PASS_PHRASE);
  const f = dataFolder_();
  Logger.log('準備完了。セーブの保存先: ' + f.getName() + ' ' + f.getUrl());
}

function doGet() {
  return json_({ ok: true, service: 'ekiden', time: new Date().toISOString() });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }
  if (!checkPass_(req.pass)) return json_({ ok: false, error: 'auth' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json_({ ok: false, error: 'busy' });
  try {
    return json_(handle_(req));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function handle_(req) {
  const slot = String(req.slot || 'main').replace(/[^\w-]/g, '').slice(0, 32) || 'main';
  const name = 'ekiden_' + slot + '.json';
  const folder = dataFolder_();
  const file = findFile_(folder, name);
  if (req.action === 'save') {
    if (!req.data || !req.data.teams) return { ok: false, error: 'empty save' };
    const updated = Date.now();
    const body = JSON.stringify({ updated: updated, year: req.data.year, month: req.data.month, day: req.data.day, data: req.data });
    if (file) { backup_(folder, name, file); file.setContent(body); }
    else folder.createFile(name, body, MimeType.PLAIN_TEXT);
    return { ok: true, updated: updated };
  }
  if (req.action === 'load') {
    if (!file) return { ok: true, data: null };
    const o = JSON.parse(file.getBlob().getDataAsString());
    return { ok: true, updated: o.updated, data: o.data };
  }
  if (req.action === 'info') {
    if (!file) return { ok: true, exists: false };
    const o = JSON.parse(file.getBlob().getDataAsString());
    return { ok: true, exists: true, updated: o.updated, year: o.year, month: o.month, day: o.day };
  }
  return { ok: false, error: 'unknown action' };
}

/* one backup per day, newest KEEP_BACKUPS kept */
function backup_(folder, name, file) {
  const day = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
  const base = name.replace('.json', '');
  const bname = base + '_backup_' + day + '.json';
  const content = file.getBlob().getDataAsString();
  const existing = findFile_(folder, bname);
  if (existing) existing.setContent(content); else folder.createFile(bname, content, MimeType.PLAIN_TEXT);
  const list = [], it = folder.getFiles();
  while (it.hasNext()) { const f = it.next(); if (f.getName().indexOf(base + '_backup_') === 0) list.push(f); }
  list.sort(function (a, b) { return a.getName() < b.getName() ? 1 : -1; });
  list.slice(KEEP_BACKUPS).forEach(function (f) { f.setTrashed(true); });
}

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
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
