'use strict';
/* 脳と医工学 — reader for the news collected by the sora-apps GAS backend */
const TAGS={bci:'BCI',stim:'神経刺激',imaging:'計測・イメージング',rehab:'神経補綴・リハビリ',device:'デバイス',ai:'AI×脳'};
const LS={cache:'news-cache-v1',read:'news-read-v1',bm:'news-bm-v1',cfg:'news-cfg-v1'};
const app=document.getElementById('app');
const st={view:'feed',filter:'all',q:'',feed:null,loading:false,err:'',limit:60,msg:'',msgBad:false,search:false,busy:false};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lsGet(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function cfg(){const c=lsGet(LS.cfg,{});
  return{url:c.url||(window.NEWS_CONFIG&&window.NEWS_CONFIG.gasUrl)||'',pass:c.pass||'',ja:c.ja!==false,img:c.img!==false};}
function setCfg(k,v){const c=lsGet(LS.cfg,{});c[k]=v;lsSet(LS.cfg,c);}
const readSet=new Set(lsGet(LS.read,[]));
function markRead(id){readSet.add(id);const a=[...readSet];lsSet(LS.read,a.slice(-4000));}
function bmGet(){return lsGet(LS.bm,{updated:0,items:{}});}
const pad=n=>String(n).padStart(2,'0');
function ago(ms){const m=Math.round((Date.now()-ms)/60000);if(m<1)return'たった今';if(m<60)return m+'分前';const h=Math.round(m/60);if(h<24)return h+'時間前';const d=new Date(ms);return `${d.getMonth()+1}/${d.getDate()}`;}
function dayKey(ms){const d=new Date(ms);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
function dayLabel(ms){const d=new Date(ms),t=new Date();const y=new Date(t.getFullYear(),t.getMonth(),t.getDate()-1);
  const w='日月火水木金土'[d.getDay()];const md=`${d.getMonth()+1}月${d.getDate()}日`;
  if(dayKey(ms)===dayKey(t.getTime()))return['今日',md+'（'+w+'）'];if(dayKey(ms)===dayKey(y.getTime()))return['昨日',md+'（'+w+'）'];return[md,'（'+w+'）'];}
function fmtWhen(ms){if(!ms)return'—';const d=new Date(ms);return `${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}

/* ---------- data ---------- */
const SAMPLE={updated:0,sample:true,items:[
  {id:'s1',t:'（表示例）ブレイン・コンピュータ・インターフェースに関する英語記事の見出しがここに並びます',s:'Google News',d:Date.now()-36e5,k:'news',g:['bci','rehab'],l:'ja',x:''},
  {id:'s2',t:'（表示例）脳深部刺激や集束超音波など、神経刺激の研究ニュース',s:'Neuroscience News',d:Date.now()-5*36e5,k:'news',g:['stim'],l:'ja',x:'英語記事の要約の冒頭が2行まで表示されます。'},
  {id:'s3',t:'（表示例）Journal of Neural Engineering や PubMed の新着論文',s:'PubMed',d:Date.now()-26*36e5,k:'paper',g:['imaging','ai'],l:'ja',x:'著者名が表示されます'},
]};
function feedItems(){return st.feed?st.feed.items||[]:[];}
async function loadFeed(force){const c=cfg();
  if(!st.feed){const cached=lsGet(LS.cache,null);st.feed=cached||(c.url?null:SAMPLE);}
  if(!c.url){st.feed=st.feed&&!st.feed.sample?st.feed:SAMPLE;render();return;}
  st.loading=true;st.err='';render();
  try{const sep=c.url.includes('?')?'&':'?';const r=await fetch(c.url+sep+'t='+Date.now());const j=await r.json();
    if(!j.ok)throw new Error(j.error||'取得できませんでした');st.feed=j;lsSet(LS.cache,j);}
  catch(e){st.err=navigator.onLine===false?'オフラインです。前回取得した記事を表示しています':'ニュースを取得できませんでした。設定のURLを確認してください';}
  st.loading=false;render();}
async function post(body){const c=cfg();if(!c.url)throw new Error('GASのURLが未設定です');if(!c.pass)throw new Error('合言葉が未設定です');
  let r;try{r=await fetch(c.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({app:'news',pass:c.pass},body))});}catch(e){throw new Error('GASに接続できません');}
  const j=await r.json();if(!j.ok)throw new Error(j.error==='auth'?'合言葉が違います':j.error||'失敗しました');return j;}
let bmTimer=null;
function toggleBm(id){const b=bmGet();if(b.items[id])delete b.items[id];else{const it=feedItems().find(x=>x.id===id);if(!it)return;b.items[id]=Object.assign({},it,{saved:Date.now()});}
  b.updated=Date.now();lsSet(LS.bm,b);render();
  const c=cfg();if(c.url&&c.pass){clearTimeout(bmTimer);bmTimer=setTimeout(()=>{post({action:'bm-save',items:bmGet().items}).then(j=>{const x=bmGet();x.updated=j.updated;lsSet(LS.bm,x);}).catch(()=>{});},2500);}}
async function syncBm(){const c=cfg();if(!c.url||!c.pass)return;try{const j=await post({action:'bm-load'});const local=bmGet();
  if((j.updated||0)>local.updated){lsSet(LS.bm,{updated:j.updated,items:j.items||{}});render();}
  else if(local.updated>(j.updated||0)&&Object.keys(local.items).length){const s=await post({action:'bm-save',items:local.items});local.updated=s.updated;lsSet(LS.bm,local);}}catch(e){}}

/* ---------- view ---------- */
const ICON={refresh:'<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
  bm:'<svg viewBox="0 0 24 24"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg>'};
function trace(){let d='M0 11';for(let x=2;x<=240;x+=2){const y=11+Math.sin(x*0.26)*3.2+Math.sin(x*0.07)*2+(x%46===0?-7:0)+(x%46===2?6:0);d+=` L${x} ${y.toFixed(1)}`;}
  return `<svg class="trace" viewBox="0 0 240 22" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>`;}
function matchQ(it,q){if(!q)return true;q=q.toLowerCase();return (it.t+' '+(it.tj||'')+' '+it.s+' '+(it.x||'')).toLowerCase().includes(q);}
function itemHtml(it,c){const tags=(it.g||[]).filter(g=>TAGS[g]).map(g=>`<span class="tag" style="--c:var(--${g})">${TAGS[g]}</span>`).join('');
  const saved=!!bmGet().items[it.id],ja=it.l==='ja';
  const img=c.img&&it.im?`<img class="thumb" src="${esc(it.im)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:'';
  return `<article class="${readSet.has(it.id)?'read':''}">
    <div class="meta"><span class="src">${esc(it.s)}</span><span class="time">${ago(it.d)}</span>${it.k==='paper'?'<span class="kind">論文</span>':''}${st.feed&&st.feed.sample?'<span class="sample">表示例</span>':''}</div>
    <div class="body"><a class="ttl ${ja?'ja':''}" href="${esc(it.u||'#')}" target="_blank" rel="noopener" data-read="${esc(it.id)}">${esc(it.t)}</a>
      ${c.ja&&it.tj&&!ja?`<div class="tj">${esc(it.tj)}</div>`:''}${it.x?`<div class="snip">${esc(it.x)}</div>`:''}${tags?`<div class="tags">${tags}</div>`:''}</div>
    <div class="side">${img}<button class="bm ${saved?'on':''}" data-bm="${esc(it.id)}" aria-label="${saved?'保存を外す':'保存する'}">${ICON.bm}</button></div></article>`;}
function listHtml(items,c){if(!items.length)return `<p class="empty">${st.q?'見つかりませんでした':'記事はまだありません'}</p>`;
  let h='',last='';for(const it of items){const k=dayKey(it.d);if(k!==last){last=k;const [a,b]=dayLabel(it.d);h+=`<div class="day"><b>${a}</b>${b}</div>`;}h+=itemHtml(it,c);}return h;}
function feedView(c){const all=feedItems().filter(it=>matchQ(it,st.q));
  const count=f=>f==='all'?all.length:f==='paper'?all.filter(i=>i.k==='paper').length:all.filter(i=>(i.g||[]).includes(f)).length;
  const filters=[['all','すべて',''],...Object.entries(TAGS).map(([k,n])=>[k,n,`var(--${k})`]),['paper','論文','var(--paper)']];
  const shown=all.filter(it=>st.filter==='all'||(st.filter==='paper'?it.k==='paper':(it.g||[]).includes(st.filter)));
  return `<div class="g"><div class="chips" role="tablist">${filters.map(([k,n,col])=>`<button class="chip ${st.filter===k?'on':''}" style="${col?'--c:'+col:''}" data-f="${k}">${col?'<i></i>':''}${n}<b>${count(k)}</b></button>`).join('')}</div>
    ${st.search?`<div class="search"><input id="q" type="search" placeholder="キーワード（英語・日本語）" value="${esc(st.q)}" autocomplete="off"></div>`:''}
    ${!c.url?setupPanel():''}${st.err?`<p class="msg bad">${esc(st.err)}</p>`:''}
    ${listHtml(shown.slice(0,st.limit),c)}${shown.length>st.limit?`<button class="btn more" data-more="1">さらに表示（残り${shown.length-st.limit}件）</button>`:''}</div>`;}
function savedView(c){const items=Object.values(bmGet().items).sort((a,b)=>(b.saved||0)-(a.saved||0));
  return `<div class="g">${items.length?listHtml(items,c):'<p class="empty">しおりを付けた記事がここに並びます</p>'}</div>`;}
function setupPanel(){return `<section class="panel"><h2>ニュースの取得先を設定</h2><ol>
  <li>ニュース用の GAS プロジェクトに gas/news/Code.gs を貼り、setup を一度実行</li><li>ウェブアプリとしてデプロイし、URL をコピー</li><li>この画面の「設定」に URL を貼る</li></ol>
  <div class="row"><button class="btn primary" data-view="settings">設定を開く</button></div></section>`;}
function settingsView(c){const srcs=(st.feed&&st.feed.sources)||[];
  return `<div class="g"><section class="panel"><h2>取得先</h2>
    <label class="lbl" for="s_url">ニュース用 GAS のウェブアプリURL</label><input id="s_url" class="inp" data-cfg="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(c.url)}">
    <label class="lbl" for="s_pass">合言葉（しおりの同期と手動収集に使います）</label><input id="s_pass" class="inp" type="password" data-cfg="pass" autocomplete="off" value="${esc(c.pass)}">
    <label class="chk"><input type="checkbox" data-cfg="ja" ${c.ja?'checked':''}> 英語記事に日本語の見出しを添える</label>
    <label class="chk"><input type="checkbox" data-cfg="img" ${c.img?'checked':''}> 記事の画像を表示する</label>
    <div class="row"><button class="btn primary" data-act="reload" ${st.busy?'disabled':''}>保存して読み込む</button><button class="btn" data-act="collect" ${st.busy?'disabled':''}>今すぐ収集する</button></div>
    ${st.msg?`<p class="msg ${st.msgBad?'bad':''}">${esc(st.msg)}</p>`:''}</section>
    <section class="panel"><h2>収集元の状態</h2><p class="msg">最終収集 ${fmtWhen(st.feed&&st.feed.updated)}・1時間ごとに自動更新</p>
    ${srcs.length?`<table class="src-list">${srcs.map(s=>`<tr><td>${esc(s.name)}</td><td class="r ${s.ok?'ok':'ng'}">${s.ok?'+'+s.n:esc(s.error||'失敗')}</td></tr>`).join('')}</table>`:'<p class="msg">まだ収集していません</p>'}</section></div>`;}
function render(){const c=cfg();const nSaved=Object.keys(bmGet().items).length;
  const upd=st.feed&&st.feed.updated?`更新 ${fmtWhen(st.feed.updated)}`:'';
  const body=st.view==='saved'?savedView(c):st.view==='settings'?settingsView(c):feedView(c);
  const y=scrollY,ae=document.activeElement&&document.activeElement.id;
  app.innerHTML=`<header><div class="g"><div class="hd"><h1>脳と医工学</h1>${trace()}
      <button class="iconbtn" data-act="search" aria-label="検索">${ICON.search}</button><button class="iconbtn ${st.loading?'spin':''}" data-act="refresh" aria-label="再読み込み">${ICON.refresh}</button></div>
    <div class="tabs">${[['feed','新着'],['saved','しおり'],['settings','設定']].map(([k,n])=>`<button class="tab ${st.view===k?'on':''}" data-view="${k}">${n}${k==='saved'&&nSaved?`<span class="n">${nSaved}</span>`:''}</button>`).join('')}
      <span class="meta-bar" style="margin-left:auto">${upd}</span></div></div></header>${body}`;
  scrollTo(0,y);if(ae){const el=document.getElementById(ae);if(el){el.focus();if(el.setSelectionRange&&el.type!=='checkbox'){const n=el.value.length;try{el.setSelectionRange(n,n);}catch(e){}}}}}

/* ---------- events ---------- */
app.addEventListener('click',async e=>{const t=e.target.closest('[data-f],[data-bm],[data-view],[data-act],[data-more],[data-read]');if(!t)return;
  if(t.dataset.read){markRead(t.dataset.read);setTimeout(render,300);return;}
  if(t.dataset.f){st.filter=t.dataset.f;st.limit=60;render();return;}
  if(t.dataset.bm){toggleBm(t.dataset.bm);return;}
  if(t.dataset.view){st.view=t.dataset.view;st.msg='';render();scrollTo(0,0);return;}
  if(t.dataset.more){st.limit+=60;render();return;}
  const a=t.dataset.act;
  if(a==='search'){st.search=!st.search;if(!st.search)st.q='';render();if(st.search)document.getElementById('q')?.focus();}
  else if(a==='refresh'){loadFeed(true);syncBm();}
  else if(a==='reload'){st.view='feed';await loadFeed(true);syncBm();}
  else if(a==='collect'){st.busy=true;st.msg='収集しています（1分ほどかかります）…';st.msgBad=false;render();
    try{const j=await post({action:'refresh'});st.msg=`収集しました。新しい記事 ${j.added}件${j.failed?`・取得できなかった収集元 ${j.failed}件`:''}`;await loadFeed(true);}catch(err){st.msg=err.message;st.msgBad=true;}
    st.busy=false;render();}});
app.addEventListener('input',e=>{if(e.target.id==='q'){st.q=e.target.value;st.limit=60;render();}});
app.addEventListener('change',e=>{const k=e.target.dataset.cfg;if(!k)return;setCfg(k,e.target.type==='checkbox'?e.target.checked:e.target.value.trim());if(e.target.type==='checkbox')render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&st.feed&&Date.now()-(st.feed.fetchedAt||0)>15*60e3){st.feed.fetchedAt=Date.now();loadFeed(true);}});

render();loadFeed(true);syncBm();
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('./sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)location.reload();});}
