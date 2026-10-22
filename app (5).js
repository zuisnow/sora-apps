'use strict';
/* ===== utils ===== */
const R = Math.random;
function randn(){let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const pick=a=>a[Math.floor(R()*a.length)];
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
function wpick(items,weights){let s=0;for(const w of weights)s+=w;let x=R()*s;for(let i=0;i<items.length;i++){x-=weights[i];if(x<0)return items[i];}return items[items.length-1];}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const pad=n=>String(n).padStart(2,'0');
function fmtT(s){s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${pad(m)}:${pad(x)}`:`${m}:${pad(x)}`;}
function fmtPace(p){p=Math.round(p);return `${Math.floor(p/60)}'${pad(p%60)}"`;}
function fmtGap(s){return (s==null||s<0.5)?'—':'+'+fmtT(s);}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ===== courses ===== */
function prof(L,segs){const n=Math.ceil(L-1e-9),a=new Array(n).fill(0);
  for(const [x,y,dh] of segs){const per=dh/(y-x);for(let k=0;k<n;k++){const lo=Math.max(x,k),hi=Math.min(y,k+1,L);if(hi>lo)a[k]+=per*(hi-lo);}}
  return a;}
const flat=L=>new Array(Math.ceil(L-1e-9)).fill(0);
/* scenery zones: [from km, to km, theme, place name]; landmarks: [km, kind, name] */
function Z(list){return list.map(([a,b,th,place])=>({a,b,th,place}));}
function LM(list){return list.map(([km,k,name])=>({km,k,name}));}
function mirrorZ(z,L0,L1){const f=L1/L0;return z.map(o=>({a:+((L0-o.b)*f).toFixed(2),b:+((L0-o.a)*f).toFixed(2),th:o.th,place:o.place})).sort((x,y)=>x.a-y.a);}
function mirrorLM(l,L0,L1){const f=L1/L0;return l.map(o=>({km:+((L0-o.km)*f).toFixed(2),k:o.k,name:o.name}));}

const Z1=Z([[0,1.6,'city','大手町・日比谷'],[1.6,4.5,'city','新橋・芝'],[4.5,8,'city','品川'],[8,14,'town','大森・蒲田'],[14,17.4,'town','蒲田・雑色'],[17.4,18.4,'bridge','六郷橋（多摩川）'],[18.4,21.3,'city','川崎・鶴見']]);
const Z2=Z([[0,3,'town','鶴見・生麦'],[3,9,'city','横浜駅前'],[9,11,'town','保土ヶ谷'],[11,13.5,'suburb','権太坂'],[13.5,19.5,'suburb','東戸塚'],[19.5,23.1,'town','戸塚の坂']]);
const Z3=Z([[0,3,'town','戸塚'],[3,7,'town','藤沢・遊行寺坂'],[7,10,'suburb','藤沢'],[10,16.5,'coast','湘南海岸（国道134号）'],[16.5,17.5,'bridge','湘南大橋（相模川）'],[17.5,21.4,'town','平塚']]);
const L3=LM([[13,'eboshi','烏帽子岩']]);
const Z4=Z([[0,3,'town','平塚'],[3,8,'coast','大磯'],[8,15,'coast','二宮・国府津'],[15,18,'town','小田原市内'],[18,18.6,'bridge','酒匂橋（酒匂川）'],[18.6,20.9,'town','小田原・風祭']]);
const Z5=Z([[0,2.5,'town','風祭・箱根湯本駅前'],[2.5,4.2,'onsen','箱根湯本温泉'],[4.2,7,'mountain','大平台のヘアピン'],[7,8.5,'onsen','宮ノ下'],[8.5,11,'mountain','小涌園前'],[11,16.3,'mountain','芦之湯・最高地点へ'],[16.3,19,'mountain','元箱根への下り'],[19,20.8,'lake','芦ノ湖']]);
const L5=LM([[4.8,'train','登山電車の鉄橋'],[7.6,'hotel','宮ノ下の老舗ホテル'],[10.2,'resort','小涌園'],[16.3,'sign874','国道1号最高地点（874m）'],[19.7,'toriiLake','芦ノ湖の鳥居'],[20.2,'ship','芦ノ湖の遊覧船']]);
const Z2b=Z([[0,4.5,'town','鶴見・川崎'],[4.5,5.5,'bridge','六郷橋（多摩川）'],[5.5,12,'town','蒲田・大森'],[12,15.5,'city','品川'],[15.5,19,'city','田町・新橋'],[19,21,'city','銀座'],[21,22.3,'city','日本橋'],[22.3,23,'city','大手町']]);

const COURSES={
  hakone:{id:'hakone',name:'新春大学駅伝',short:'新春',area:'東京・大手町〜箱根・芦ノ湖',big:true,season:'winter',startHour:[8,8],kuriage:[600,1200],
    days:[{name:'往路',secs:[0,1,2,3,4]},{name:'復路',secs:[5,6,7,8,9]}],
    secs:[
      {name:'1区',from:'大手町',to:'鶴見',L:21.3,elev:prof(21.3,[[17.4,17.9,12],[17.9,18.4,-12]]),wind:.3,note:'平坦。集団の駆け引き',zones:Z1,lm:LM([[18,'rokugo','六郷橋']])},
      {name:'2区',from:'鶴見',to:'戸塚',L:23.1,elev:prof(23.1,[[11,13.5,45],[13.5,15,-25],[19.5,22,35]]),wind:0,note:'エース区間。権太坂と終盤の上り',zones:Z2,lm:[]},
      {name:'3区',from:'戸塚',to:'平塚',L:21.4,elev:prof(21.4,[[3,7,-55]]),wind:1,note:'序盤下り、後半は海沿いの風と富士山',zones:Z3,lm:L3},
      {name:'4区',from:'平塚',to:'小田原',L:20.9,elev:prof(20.9,[[0,15,10],[15,20.9,30]]),wind:.6,note:'終盤じわじわ上る',zones:Z4,lm:[]},
      {name:'5区',from:'小田原',to:'芦ノ湖',L:20.8,elev:prof(20.8,[[0,4,40],[4,16.3,790],[16.3,17,30],[17,20.8,-145]]),wind:.2,dt:-3,note:'山上り。標高差約860m',zones:Z5,lm:L5},
      {name:'6区',from:'芦ノ湖',to:'小田原',L:20.8,elev:prof(20.8,[[0,4.5,150],[4.5,16.8,-790],[16.8,20.8,-75]]),wind:.2,dt:-6,down:true,note:'山下り。早朝の冷え込み',zones:mirrorZ(Z5,20.8,20.8),lm:mirrorLM(L5,20.8,20.8)},
      {name:'7区',from:'小田原',to:'平塚',L:21.3,elev:prof(21.3,[[0,6,-30],[6,21.3,-5]]),wind:.6,dt:2,note:'寒暖差が大きい',zones:mirrorZ(Z4,20.9,21.3),lm:[]},
      {name:'8区',from:'平塚',to:'戸塚',L:21.4,elev:prof(21.4,[[14.4,18.4,45],[18.4,21.4,10]]),wind:1,dt:2,note:'終盤に遊行寺の上り坂',zones:mirrorZ(Z3,21.4,21.4),lm:mirrorLM(L3,21.4,21.4)},
      {name:'9区',from:'戸塚',to:'鶴見',L:23.1,elev:prof(23.1,[[0,3.6,-35],[8.1,9.6,25],[9.6,12.1,-45]]),wind:0,dt:2,note:'復路のエース区間',zones:mirrorZ(Z2,23.1,23.1),lm:[]},
      {name:'10区',from:'鶴見',to:'大手町',L:23.0,elev:prof(23.0,[[4.5,5,12],[5,5.5,-12]]),wind:.3,dt:3,note:'アンカー。都心のビル風',zones:Z2b,lm:LM([[5,'rokugo','六郷橋']])},
    ]},
  izumo:{id:'izumo',name:'秋季大学駅伝',short:'秋季',area:'出雲大社〜出雲ドーム',season:'early',startHour:[13],kuriage:[Infinity],
    days:[{name:'',secs:[0,1,2,3,4,5]}],
    secs:[
      {name:'1区',from:'出雲大社',to:'第1中継所',L:8.0,elev:prof(8,[[0,1.5,-10],[4,8,-5]]),wind:.5,note:'大鳥居をくぐって市街へ',zones:Z([[0,1.2,'shrine','出雲大社 勢溜の鳥居前'],[1.2,2.5,'town','神門通り'],[2.5,8,'town','出雲市街']]),lm:LM([[0.05,'toriiWood','勢溜の大鳥居'],[1.4,'toriiBig','宇迦橋の大鳥居']])},
      {name:'2区',from:'第1中継所',to:'第2中継所',L:5.8,elev:flat(5.8),wind:.5,note:'最短区間。平坦な国道',zones:Z([[0,5.8,'suburb','国道9号']]),lm:[]},
      {name:'3区',from:'第2中継所',to:'第3中継所',L:8.5,elev:prof(8.5,[[3,5,6],[5,7,-6]]),wind:1,note:'田園地帯。強い風に注意',zones:Z([[0,8.5,'rural','斐川の田園（築地松）']]),lm:[]},
      {name:'4区',from:'第3中継所',to:'第4中継所',L:6.2,elev:prof(6.2,[[5.2,5.7,12],[5.7,6.2,-12]]),wind:.8,note:'平坦だがラスト1kmに起伏',zones:Z([[0,6.2,'rural','田園地帯']]),lm:[]},
      {name:'5区',from:'第4中継所',to:'第5中継所',L:6.4,elev:prof(6.4,[[1,2,10],[2,3,-10],[4,5,12],[5,6,-8]]),wind:.6,note:'山と田園を望むうねる道',zones:Z([[0,6.4,'rural','山あいの田園']]),lm:[]},
      {name:'6区',from:'第5中継所',to:'出雲ドーム',L:10.2,elev:prof(10.2,[[6,8,10],[8,9,-10]]),wind:.6,note:'最長のアンカー区間',zones:Z([[0,5,'suburb','出雲市郊外'],[5,9.4,'town','出雲市内'],[9.4,10.2,'park','出雲ドーム前']]),lm:LM([[10.25,'dome','出雲ドーム']])},
    ]},
  zennihon:{id:'zennihon',name:'全国大学駅伝',short:'全国',area:'熱田神宮〜伊勢神宮',season:'autumn',startHour:[8.2],kuriage:[600],
    days:[{name:'',secs:[0,1,2,3,4,5,6,7]}],
    secs:[
      {name:'1区',from:'熱田神宮',to:'藤前',L:9.5,elev:flat(9.5),wind:.3,note:'名古屋の市街地',zones:Z([[0,1,'shrine','熱田神宮'],[1,8.5,'city','名古屋市内'],[8.5,9.5,'bridge','庄内川']]),lm:LM([[0.1,'toriiWood','熱田神宮の鳥居']])},
      {name:'2区',from:'藤前',to:'長島',L:11.1,elev:prof(11.1,[[8.5,9,8],[9.5,10,-8]]),wind:.6,note:'大河を渡る',zones:Z([[0,4,'suburb','港区・蟹江'],[4,5,'bridge','日光川'],[5,8.5,'rural','弥富'],[8.5,10,'bridge','木曽川'],[10,11.1,'suburb','長島']]),lm:[]},
      {name:'3区',from:'長島',to:'四日市',L:11.9,elev:prof(11.9,[[0.5,1,8],[1,1.5,-8]]),wind:.6,note:'工場地帯へ',zones:Z([[0,1.5,'bridge','揖斐川・長良川'],[1.5,6,'town','桑名'],[6,11.9,'industrial','四日市・霞ケ浦']]),lm:[]},
      {name:'4区',from:'四日市',to:'鈴鹿',L:11.8,elev:prof(11.8,[[2,4,10],[8,10,-10]]),wind:.5,note:'準エース区間',zones:Z([[0,4,'industrial','四日市'],[4,8,'suburb','四日市南部'],[8,11.8,'suburb','鈴鹿']]),lm:[]},
      {name:'5区',from:'鈴鹿',to:'河芸',L:12.4,elev:flat(12.4),wind:.7,note:'起伏が少なく走りやすい',zones:Z([[0,6,'rural','鈴鹿の田園'],[6,12.4,'coast','伊勢湾沿い']]),lm:[]},
      {name:'6区',from:'河芸',to:'津',L:12.8,elev:prof(12.8,[[4,6,10],[6,8,-10]]),wind:.7,note:'順位が動きやすい',zones:Z([[0,7,'coast','津の海岸'],[7,12.8,'town','津市内']]),lm:[]},
      {name:'7区',from:'津',to:'松阪',L:17.6,elev:flat(17.6),wind:.6,note:'長距離区間',zones:Z([[0,8,'suburb','津南部'],[8,14,'rural','三雲'],[14,17.6,'town','松阪']]),lm:[]},
      {name:'8区',from:'松阪',to:'伊勢神宮',L:19.7,elev:prof(19.7,[[15,18.8,45]]),wind:.6,note:'最長区間。終盤の長い上り',zones:Z([[0,8,'rural','松阪・明和'],[8,15,'rural','伊勢平野'],[15,18.8,'town','伊勢市内の上り'],[18.8,19.7,'shrine','伊勢神宮内宮']]),lm:LM([[19.75,'uji','宇治橋の鳥居']])},
    ]},
};
const YOSEN_SEC={name:'予選会',from:'',to:'',L:21.1,elev:flat(21.1),wind:0};
const FLAT5={L:5,elev:flat(5),wind:0}, FLAT10={L:10,elev:flat(10),wind:0}, FLATH={L:21.1,elev:flat(21.1),wind:0};
const NEUTRAL_W={sky:'曇り',temp:10,wind:0};
const WIND_LABEL=['無風','弱い','やや強い','強い'];

/* ===== names ===== */
const SURN='佐藤 鈴木 高橋 田中 伊藤 渡辺 山本 中村 小林 加藤 吉田 山田 佐々木 山口 松本 井上 木村 林 斎藤 清水 山崎 森 池田 橋本 阿部 石川 山下 中島 石井 小川 前田 岡田 長谷川 藤田 後藤 近藤 村上 遠藤 青木 坂本 福田 太田 西村 藤井 金子 岡本 藤原 三浦 中野 中川 原田 松田 竹内 小野 田村 中山 和田 石田 森田 上田 原 内田 柴田 酒井 宮崎 横山 高木 安藤 宮本 大野 小島 谷口 工藤 高田 丸山 今井 河野 藤本 村田 武田 上野 杉山 増田 平野 大塚 千葉 久保 松井 小西 岩崎 桜井 野口 松尾 菅原 野村 木下 菊地 佐野 大西 杉本 新井'.split(' ');
const GIVN='翔 大輝 蓮 悠斗 陽向 湊 颯太 大和 陸 海斗 拓海 健太 翼 直樹 優斗 駿 隼人 航 樹 蒼 涼 慎吾 遼 和真 圭吾 誠 啓太 洸 光希 智也 雄大 晴 瑛太 匠 響 迅 篤 怜 康平 亮 一輝 奏太 旭 玲央 景 勇人 敦也 大地 創 悠真 瑞樹 健 爽 渉 拓真 剛 浩二 修平 歩夢 凌 碧 哲也 俊介 隆之介 晃 慧'.split(' ');
const PREFS='北海道 青森 岩手 宮城 秋田 山形 福島 茨城 栃木 群馬 埼玉 千葉 東京 神奈川 新潟 富山 石川 福井 山梨 長野 岐阜 静岡 愛知 三重 滋賀 京都 大阪 兵庫 奈良 和歌山 鳥取 島根 岡山 広島 山口 徳島 香川 愛媛 高知 福岡 佐賀 長崎 熊本 大分 宮崎 鹿児島 沖縄'.split(' ');
const UNIVS='東都 青嶺 桜川 北辰 白鷺 武蔵台 鳳凰 明星台 若葉台 朱雀 蒼穹 雲雀 秀峰 緑風 銀河 暁 天城 楓 海鳴 紅陵 碧海 鶴ヶ丘 東雲 葵 千歳 光陵 琥珀 椿 彩雲'.split(' ');
const TEAM_COLORS=[{n:'藍',c:'#2257b8'},{n:'紅',c:'#b3261e'},{n:'緑',c:'#1b7a4a'},{n:'紫',c:'#6a3fb5'},{n:'橙',c:'#c25e00'},{n:'青緑',c:'#0b7680'}];
const DIFFS={
  meimon:{name:'名門',rep:84,seed:true,desc:'評判が高く有力選手がそろう。優勝が当然の目標'},
  chuken:{name:'中堅',rep:64,seed:true,desc:'シード権を持つ中堅校。上位進出を狙う'},
  shinko:{name:'新興',rep:32,seed:false,desc:'まずは予選会突破から。一から強豪を作る'},
};

/* ===== abilities & traits ===== */
const STATS=['spd','sta','tgh','spt'];
const STAT_LABEL={spd:'スピード',sta:'スタミナ',tgh:'タフネス',spt:'スパート'};
const STAT_SHORT={spd:'スピ',sta:'スタ',tgh:'タフ',spt:'スパ'};
const STAT_DESC={spd:'平地の巡航スピード。短い区間ほど重要',sta:'長い距離でもペースが落ちない力',tgh:'疲れ・故障・ブレーキへの強さ。坂や風にも効く',spt:'ラスト1.5kmの切り替えと競り合い'};
const GRADE_MARK=['✕','－','○','◎'];
const WEAK={cold:'寒さ',heat:'暑さ',bad:'悪天候'};
const WEAK_DESC={cold:'気温5℃以下でペースが落ちる',heat:'気温17℃以上でペースが落ちる',bad:'雨・雪・強い風でペースが落ちる'};
function rankOf(v){const L=v>=90?'S':v>=80?'A':v>=70?'B':v>=60?'C':v>=50?'D':v>=40?'E':v>=30?'F':'G';const b=v>=90?90:Math.floor(v/10)*10;return L+((L!=='G'||v>=25)&&v-b>=5&&v<100?'+':'');}
function xpNeed(g){return 100+g*60;}

/* ===== training ===== */
/* per-runner training menus; numbers are per month and are applied 1/30 per day */
const MENUS={
  balance:{name:'おまかせ',short:'おまかせ',desc:'全体をまんべんなく',w:{spd:.9,sta:.9,tgh:.45,spt:.35},upX:4,dnX:4,fat:12,scene:'suburb'},
  spd:{name:'スピード',short:'スピ',desc:'トラックのポイント練習',w:{spd:1.7,sta:.35,tgh:.2,spt:.6},fat:15,scene:'track'},
  sta:{name:'スタミナ',short:'スタ',desc:'距離走・ロング走',w:{spd:.35,sta:1.7,tgh:.7,spt:.1},upX:6,dnX:2,fat:18,scene:'rural'},
  tgh:{name:'タフネス',short:'タフ',desc:'補強とクロカン。故障しにくい',w:{spd:.2,sta:.5,tgh:1.7,spt:.2},fat:11,safe:true,scene:'park'},
  spt:{name:'スパート',short:'スパ',desc:'ラストの切り替えと競り合い',w:{spd:.7,sta:.2,tgh:.3,spt:1.7},fat:14,scene:'track'},
  up:{name:'上り',short:'上り',desc:'坂道の上り練習',w:{spd:.2,sta:.6,tgh:.5,spt:.1},upX:26,fat:16,scene:'mountain'},
  dn:{name:'下り',short:'下り',desc:'下り坂の脚づくり',w:{spd:.4,sta:.3,tgh:.5,spt:.1},dnX:26,fat:15,scene:'mountain'},
  weak:{name:'苦手克服',short:'苦手',desc:'暑さは6〜9月、寒さは11月以降、悪天候はいつでも',w:{spd:.4,sta:.5,tgh:.5,spt:.2},fat:13,overcome:.24,scene:'rain'},
  rest:{name:'休養',short:'休養',desc:'疲労を抜いて調子を上げる',w:{spd:.12,sta:.12,tgh:.08,spt:.08},fat:-25,scene:'park'},
};
const LOADS={low:{name:'控えめ',g:.7,f:.6},mid:{name:'普通',g:1,f:1},high:{name:'強め',g:1.3,f:1.45}};
const AI_MENU={4:'balance',5:'spd',6:'spd',7:'balance',8:'sta',9:'sta',10:'balance',11:'up',12:'rest',13:'rest'};
const MLEN={4:30,5:31,6:30,7:31,8:31,9:30,10:31,11:30,12:31};
const EVENT_DAYS={'10-12':'izumo','10-18':'yosen','11-2':'zennihon','13-2':'hakone'};
const CAMP={from:[8,5],to:[8,25]};
const STRATS={even:'イーブン',fast:'突っ込み',neg:'後半勝負'};
/* ===== pace model ===== */
function wSpd(L){return clamp(0.38-0.008*(L-10),0.18,0.38);}
function flatBase(r,L){const ws=wSpd(L),wt=0.48-ws;return 182-ws*(r.spd-60)-wt*(r.sta-60)-Math.max(0,15-L)*0.6;}
function nKm(sec){return Math.ceil(sec.L-1e-9);}
const UPC=[1.3,1.05,0.85,0.66],DNC=[0.12,0.22,0.33,0.45];
function weakHits(r,w,sec){const wk=r.weak||{},t=w.temp+((sec&&sec.dt)||0),o=[];
  if(wk.cold&&t<=5)o.push('cold');if(wk.heat&&t>=17)o.push('heat');if(wk.bad&&(w.sky==='雨'||w.sky==='雪'||w.wind>=2))o.push('bad');return o;}
function kmTime(r,sec,k,c){
  const len=Math.min(1,sec.L-k),mid=k+len/2,frac=mid/sec.L,w=c.w||NEUTRAL_W,temp=w.temp+(sec.dt||0),rem=sec.L-mid;
  let p=flatBase(r,sec.L);
  if(mid>12)p+=(mid-12)*Math.max(0,72-r.sta)*0.012*(1.15-r.tgh/200);
  p-=(c.cond||0)*3;p+=c.form||0;
  p+=Math.max(0,temp-12)*0.35*(1.2-r.sta/100);
  if(w.sky==='雨')p+=1.2;else if(w.sky==='雪')p+=2.5;
  p+=(sec.wind||0)*w.wind*1.4*(1.1-r.tgh/250);
  const wk=r.weak;if(wk){if(wk.cold&&temp<=5)p+=2.5;if(wk.heat&&temp>=17)p+=3;if(wk.bad&&(w.sky==='雨'||w.sky==='雪'||w.wind>=2))p+=2.5;}
  if(c.strat==='fast')p+=frac<0.35?-2.5:1.0+Math.max(0,72-r.sta)*0.05*frac;
  else if(c.strat==='neg')p+=frac<0.4?1.3:(frac>0.6?-(0.6+r.sta*0.012):0);
  if(rem<1.5)p-=(r.spt-50)*0.06;
  if(c.blowKm!=null&&k>=c.blowKm)p+=c.blowSev;
  if(c.boost)p-=c.boost;
  if(c.draft){p-=0.8;if(rem<2)p-=(r.spt-50)*0.03;}
  if(sec.down&&mid>15&&r.dnG<=1)p+=(2-r.dnG)*3*(1.2-r.tgh/100);
  if(c.inj)p+=8;
  if(c.noise)p+=randn()*1.5;
  let t=p*len;const dh=sec.elev[k]||0;
  t+=dh>0?dh*UPC[r.upG]*(1.08-r.tgh*0.0016):dh*DNC[r.dnG];
  return Math.max(t,148*len);
}
function predict(r,sec,w,cond){let t=0;const c={w:w||NEUTRAL_W,cond:cond||0,inj:r.inj>0};const n=nKm(sec);for(let k=0;k<n;k++)t+=kmTime(r,sec,k,c);return t;}
function quickRun(r,sec,w){const c={w,cond:r.cond||0,noise:true,inj:r.inj>0,form:randn()*(0.6+(100-r.tgh)*0.02)};
  if(R()<0.02*(1.3-r.tgh/100)){c.blowKm=ri(2,nKm(sec)-2);c.blowSev=5+R()*15;}
  let t=0;const n=nKm(sec);for(let k=0;k<n;k++)t+=kmTime(r,sec,k,c);return t;}
function ovr(r){return Math.round(r.spd*.42+r.sta*.38+r.tgh*.1+r.spt*.1);}

/* ===== race simulation ===== */
function relayName(sec){return /中継所$/.test(sec.to)?sec.to:sec.to+'中継所';}
class Race{
  constructor(o){
    this.course=o.course;this.dayIdx=o.dayIdx;this.day=o.course.days[o.dayIdx];
    this.secs=this.day.secs.map(i=>o.course.secs[i]);this.gidx=this.day.secs;
    this.w=o.weather;this.userTid=o.userTid;this.thr=o.course.kuriage[o.dayIdx]??Infinity;
    this.records=o.records||[];
    this.t=0;this.ents=[];this.first={};this.cnt={};this.arr=this.secs.map(()=>0);this.leadArr=[];
    this.ev=[];this.T={};this.done=false;this.finishOrder=[];this.lastLeader=null;this.firstFin=null;
    this.cum=[0];for(const s of this.secs)this.cum.push(this.cum[this.cum.length-1]+s.L);
    this.total=this.cum[this.cum.length-1];
    for(const e of o.teams){
      this.T[e.team.id]={team:e.team,runners:e.runners,strats:e.strats,times:[],started:[],kuri:[],done:false,finT:null,offset:e.offset||0,issei:!!e.issei,boost:[],lastRank:null};
    }
    for(const e of o.teams)this.spawn(e.team.id,0,e.offset||0,!!e.issei);
    const dn=this.day.name?this.course.name+' '+this.day.name:this.course.name;
    this.log(0,`${dn} スタート（${this.w.sky}・気温${this.w.temp}℃・風${WIND_LABEL[this.w.wind]}）`,'sys');
    if(o.dayIdx>0){const n=o.teams.filter(x=>x.issei).length;if(n)this.log(0,`${n}校が10分差で一斉スタート`,'sys');}
  }
  own(tid){return tid===this.userTid;}
  log(t,txt,cls){this.ev.push({t,txt,cls:cls||''});}
  spawn(tid,s,t0,kuri){
    const T=this.T[tid];T.started[s]=true;T.kuri[s]=kuri;
    const r=T.runners[s],sec=this.secs[s];
    const c={w:this.w,cond:r.cond||0,strat:T.strats[s]||'even',noise:true,inj:r.inj>0,
      form:randn()*(0.6+(100-r.tgh)*0.02)+(r.grade===1&&this.course.big?Math.abs(randn())*0.6:0)};
    const bp=0.02*(1.3-r.tgh/100)+Math.max(0,(r.fat||0)-60)*0.0015;
    if(R()<bp){c.blowKm=ri(2,Math.max(2,nKm(sec)-2));c.blowSev=5+R()*15;}
    const e={tid,s,r,t0,d:0,k:-1,kmT:1,kmT0:t0,kmD:0,kmLen:1,done:false,c,lastKey:null,lastT:null,kuri};
    this.ents.push(e);this.startKm(e,t0);return e;
  }
  startKm(e,T){
    e.k++;const sec=this.secs[e.s];const len=Math.min(1,sec.L-e.k);const myD=e.k*1000;let draft=false;
    for(const o of this.ents){if(o!==e&&!o.done&&o.s===e.s&&o.t0<=T&&o.d>myD&&o.d-myD<=30){draft=true;break;}}
    e.c.draft=draft;e.kmLen=len;e.kmT=kmTime(e.r,sec,e.k,e.c);e.kmT0=T;e.kmD=e.k*1000;
  }
  step(dt){
    if(this.done)return;const nt=this.t+dt;
    for(let i=0;i<this.ents.length;i++){const e=this.ents[i];if(e.done||e.t0>nt)continue;
      for(let guard=0;guard<50;guard++){const end=e.kmT0+e.kmT;
        if(end<=nt){this.passKm(e,end);if(e.k+1>=nKm(this.secs[e.s])){this.finish(e,end);break;}this.startKm(e,end);}
        else{e.d=e.kmD+Math.max(0,nt-e.kmT0)/e.kmT*e.kmLen*1000;break;}
      }
    }
    this.t=nt;this.checkKuri();
    if(Object.values(this.T).every(x=>x.done))this.done=true;
  }
  passKm(e,T){
    const sec=this.secs[e.s];e.d=e.kmD+e.kmLen*1000;const key=e.s+':'+(e.k+1);
    this.cnt[key]=(this.cnt[key]||0)+1;const rank=this.cnt[key];const TT=this.T[e.tid];
    const isLastKm=e.k+1>=nKm(sec);
    if(this.first[key]==null){this.first[key]=T;
      if(!isLastKm&&this.lastLeader!=null&&this.lastLeader!==e.tid)
        this.log(T,`${sec.name} ${e.k+1}km 首位交代、${TT.team.name}の${e.r.name}がトップに`,this.own(e.tid)?'own':'lead');
      this.lastLeader=e.tid;}
    e.lastKey=key;e.lastT=T;
    const furthest=!TT.started[e.s+1];
    if(this.own(e.tid)&&furthest&&!isLastKm){
      if(TT.lastRank!=null&&rank!==TT.lastRank){
        if(rank<TT.lastRank)this.log(T,`${sec.name} ${e.k+1}km ${e.r.name}、${rank}位に浮上`,'own');
        else if(rank>TT.lastRank+0)this.log(T,`${sec.name} ${e.k+1}km ${e.r.name}、${rank}位に後退`,'own');}
      TT.lastRank=rank;}
    if(e.c.blowKm!=null&&e.k===e.c.blowKm&&(this.own(e.tid)||rank<=6))
      this.log(T,`${sec.name} ${TT.team.name}の${e.r.name}、ペースが上がらない`,this.own(e.tid)?'own bad':'');
  }
  finish(e,T){
    const sec=this.secs[e.s],TT=this.T[e.tid],rp=relayName(sec);e.done=true;e.finT=T;e.d=sec.L*1000;
    const time=T-e.t0;TT.times[e.s]=time;this.arr[e.s]++;const order=this.arr[e.s];
    if(this.leadArr[e.s]==null)this.leadArr[e.s]=T;const gap=T-this.leadArr[e.s];
    const last=e.s===this.secs.length-1,own=this.own(e.tid);
    if(!last){
      if(!TT.started[e.s+1]){this.spawn(e.tid,e.s+1,T,false);
        const nx=TT.runners[e.s+1];
        if(order<=3||own)this.log(T,`${rp} ${order}位 ${TT.team.name}（${order===1?'トップ':fmtGap(gap)}） ${e.r.name}→${nx.name}`,own?'own':'');
        if(own)TT.lastRank=order;
      }else if(own)this.log(T,`${rp} ${e.r.name}到着（すでに繰り上げスタート済み）`,'own bad');
    }else{
      TT.done=true;TT.finT=T;this.finishOrder.push(e.tid);if(this.firstFin==null)this.firstFin=T;
      if(order<=3||own)this.log(T,`${order===1?'優勝 ':''}${TT.team.name} ${order}位でフィニッシュ（${order===1?fmtT(T):fmtGap(T-this.firstFin)}）`,own?'own':(order===1?'lead':''));
    }
    const rec=this.records[this.gidx[e.s]];
    if(rec&&time<rec.t)this.log(T,`${sec.name} ${TT.team.name}の${e.r.name}が区間新記録 ${fmtT(time)}`,'rec'+(own?' own':''));
    const st=this.T[e.tid].boost[e.s];if(st&&own)st.done=true;
  }
  checkKuri(){
    for(let s=0;s<this.secs.length-1;s++){const la=this.leadArr[s];if(la==null)continue;const tk=la+this.thr;if(this.t<tk)continue;
      for(const TT of Object.values(this.T)){if(!TT.started[s+1]){this.spawn(TT.team.id,s+1,tk,true);
        this.log(tk,`${relayName(this.secs[s])} ${TT.team.name} 繰り上げスタート`,this.own(TT.team.id)?'own bad':'');}}}
  }
  cheer(tid){
    const e=this.furthest(tid);if(!e||e.done||e.t0>this.t)return false;const TT=this.T[tid];
    if(TT.boost[e.s])return false;
    const v=Math.max(0.3,0.6+e.r.tgh*0.012+e.r.spt*0.01+randn()*0.5);e.c.boost=v;TT.boost[e.s]={v};
    this.log(this.t,`監督から${e.r.name}へ声かけ`,'own');return true;
  }
  furthest(tid){let b=null;for(const e of this.ents)if(e.tid===tid&&(!b||e.s>b.s||(e.s===b.s&&e.d>b.d)))b=e;return b;}
  standings(){
    const rows=Object.values(this.T).map(TT=>{const e=this.furthest(TT.team.id);
      let gap=null;if(TT.done)gap=TT.finT-this.firstFin;else if(e&&e.lastKey)gap=e.lastT-this.first[e.lastKey];
      return{TT,e,gap,pos:TT.done?Infinity:(e?this.cum[e.s]*1000+e.d:0)};});
    rows.sort((a,b)=>{if(a.TT.done&&b.TT.done)return a.TT.finT-b.TT.finT;return b.pos-a.pos;});
    return rows;
  }
  results(){const o={};for(const TT of Object.values(this.T))o[TT.team.id]={times:TT.times.slice(),kuri:TT.kuri.slice(),issei:TT.issei,total:TT.times.reduce((a,b)=>a+b,0),rids:TT.runners.map(r=>r.id),strats:TT.strats.slice()};return o;}
  runToEnd(){let g=0;while(!this.done&&g<200000){this.step(4);g++;}}
}

/* ===== auto order ===== */
function autoAssign(runners,secs,ws){
  const n=secs.length;let pool=runners.filter(r=>!r.inj);
  if(pool.length<n)pool=pool.concat(runners.filter(r=>r.inj).slice(0,n-pool.length));
  const cost=pool.map(r=>secs.map((s,i)=>predict(r,s,ws[i],(r.cond||0)-Math.max(0,(r.fat||0)-60)*0.01)));
  const assign=new Array(n).fill(-1),used=new Set();
  const order=[...Array(n).keys()].sort((a,b)=>secs[b].L-secs[a].L);
  for(const i of order){let bj=-1,bv=Infinity;for(let j=0;j<pool.length;j++){if(used.has(j))continue;if(cost[j][i]<bv){bv=cost[j][i];bj=j;}}assign[i]=bj;used.add(bj);}
  for(let it=0,imp=true;imp&&it<200;it++){imp=false;
    for(let i=0;i<n;i++)for(let j=0;j<pool.length;j++){const a=assign[i];if(j===a)continue;const m=assign.indexOf(j);
      if(m<0){if(cost[j][i]-cost[a][i]<-0.01){assign[i]=j;imp=true;}}
      else{const d=cost[j][i]+cost[a][m]-cost[a][i]-cost[j][m];if(d<-0.01){assign[i]=j;assign[m]=a;imp=true;}}}}
  return assign.map(j=>pool[j]);
}
/* ===== state ===== */
let S=null;
const SAVE_KEY='ekiden-kantoku-v1';
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}if(typeof cloudAuto==='function')cloudAuto();}
function loadSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?migrate(JSON.parse(s)):null;}catch(e){return null;}}
function nid(){return ++S.nextId;}
function userTeam(){return S.teams.find(t=>t.user);}
function teamById(id){return S.teams.find(t=>t.id===id);}
function runnerIn(team,id){return team.runners.find(r=>r.id===id);}
function repLabel(rep){return rep>=75?'名門':rep>=60?'強豪':rep>=45?'中堅':rep>=30?'新興':'無名';}
function teamPower(t){const a=t.runners.filter(r=>!r.inj).map(ovr).sort((x,y)=>y-x).slice(0,10);return a.length?Math.round(a.reduce((p,c)=>p+c,0)/a.length):0;}
function recruitBase(rep){return 35+0.25*rep;}

function makeRunner(base,grade){
  const g=grade-1,pot=wpick([1,2,3,4,5],[1,3,4,2,1]),grow=g*(4.5+pot*0.6);
  const st=(b,sd)=>clamp(b+randn()*sd,22,96);
  const gr=()=>wpick([0,1,2,3],[15,45,30,10]);
  const weak={};for(const k of Object.keys(WEAK))if(R()<0.18)weak[k]=true;
  return{id:nid(),name:pick(SURN)+' '+pick(GIVN),home:pick(PREFS),grade,
    spd:st(base+grow,5),sta:st(base+grow,5),tgh:st(44+g*4,11),spt:st(46+g*3,12),
    upG:Math.min(3,gr()+(g>=2&&R()<0.3?1:0)),dnG:gr(),upX:0,dnX:0,weak,focus:'balance',
    look:{hair:ri(0,5),skin:ri(0,3)},pot,fat:15+ri(0,15),cond:0,inj:0,hist:[]};
}
function migrateRunner(r){
  if(r.tgh==null){r.tgh=clamp(r.men??50,22,96);}
  if(r.spt==null){r.spt=clamp(42+(r.spd-50)*0.5+randn()*9,22,96);}
  if(r.upG==null){const g=v=>v>=72?3:v>=56?2:v>=40?1:0;r.upG=g(r.up??50);r.dnG=g(r.dn??50);r.upX=0;r.dnX=0;}
  if(!r.weak){r.weak={};for(const k of Object.keys(WEAK))if(R()<0.18)r.weak[k]=true;}
  if(!r.focus)r.focus='none';if(!r.look)r.look={hair:ri(0,5),skin:ri(0,3)};
  delete r.men;delete r.up;delete r.dn;if(!MENUS[r.focus])r.focus='balance';return r;
}
function migrate(s){if(!s)return s;if((s.v||1)<2){for(const t of s.teams)for(const r of t.runners)migrateRunner(r);
  if(s.scout&&s.scout.list)for(const r of s.scout.list)migrateRunner(r);s.v=2;}
  if(s.v<3){const fm={none:'balance',spd:'spd',sta:'sta',tgh:'tgh',spt:'spt',up:'up',dn:'dn',weak:'weak'};
    for(const t of s.teams)for(const r of t.runners){r.focus=fm[r.focus]||'balance';r.inj=(r.inj||0)*30;}
    if(s.day==null)s.day=1;s.dayLog=[];if(s.stage==='report'){s.stage='month';s.queue=[];}
    if(s.month===13&&s.day<2)s.day=2;s.v=3;}
  return s;}
function makeTeam(name,color,rep,user){
  const t={id:nid(),name,short:name.replace(/大学?$/,''),color,rep,user:!!user,runners:[]};
  const b=recruitBase(rep);for(let g=1;g<=4;g++)for(let i=0;i<5;i++)t.runners.push(makeRunner(b,g));
  return t;
}
function initRecords(){
  const elite={spd:84,sta:84,tgh:80,spt:80,upG:3,dnG:3,inj:0};const rec={};
  for(const c of Object.values(COURSES))rec[c.id]=c.secs.map((s,i)=>({t:Math.round(predict(elite,s,NEUTRAL_W,0.6)),name:'大会記録',team:'',year:0}));
  return rec;
}
function newGame(name,colorIdx,diffKey){
  S={v:3,nextId:0,year:1,month:4,day:1,dayLog:[],stage:'month',teams:[],seeds:[],field:null,records:null,history:[],
     cur:{},queue:[],report:null,ev:null,yearEnd:null,scout:null};
  const d=DIFFS[diffKey];
  if(!/大$|大学$/.test(name))name+='大';
  const u=makeTeam(name,TEAM_COLORS[colorIdx].c,d.rep,true);S.teams.push(u);
  const names=shuffle(UNIVS);
  names.forEach((n,i)=>{const rep=clamp(Math.round(88-i*2.3+randn()*3),18,92);
    const hue=Math.round((i*137.5)%360);S.teams.push(makeTeam(n+'大',`hsl(${hue} 55% 48%)`,rep,false));});
  const ai=S.teams.filter(t=>!t.user).sort((a,b)=>b.rep-a.rep);
  S.seeds=ai.slice(0,d.seed?9:10).map(t=>t.id);if(d.seed)S.seeds.push(u.id);
  S.records=initRecords();
  save();
}

/* ===== training ===== */
/* ===== daily training ===== */
const STAT_KEYS=['spd','sta','tgh','spt'];
function inCamp(m,d){return m===CAMP.from[0]&&d>=CAMP.from[1]&&d<=CAMP.to[1];}
function applyDay(team,lkey,month,day,aiMenu){
  const L=LOADS[lkey],out={ups:[],inj:[],back:[],traits:[]},camp=inCamp(month,day);
  const seasonOK=k=>k==='bad'||(k==='heat'&&month>=6&&month<=9)||(k==='cold'&&(month>=11||month<=3));
  for(const r of team.runners){
    if(r.inj>0){r.inj--;r.fat=clamp(r.fat-0.7,0,100);if(r.inj===0)out.back.push(r);r.cond=clamp(r.cond*0.97-0.01,-1,1);continue;}
    const mk=aiMenu||r.focus||'balance',P=MENUS[mk]||MENUS.balance;
    const potF=0.45+0.25*r.pot,grF=[1.15,1.0,0.85,0.7][r.grade-1]||0.7,tired=r.fat>75?0.7:1,campF=camp?1.3:1;
    const before=team.user?STAT_KEYS.map(k=>rankOf(r[k])):null;
    for(const k of STAT_KEYS){const dim=clamp((99-r[k])/40,0.15,1.2);
      r[k]=Math.min(99,r[k]+0.55*potF*grF*P.w[k]*L.g*dim*(0.55+0.9*R())*tired*campF*(camp&&k==='sta'?1.2:1)/30);}
    if(before)STAT_KEYS.forEach((k,i)=>{const now=rankOf(r[k]);if(now!==before[i])out.ups.push({r,k,from:before[i],to:now});});
    for(const [gk,xk,pk] of [['upG','upX','upX'],['dnG','dnX','dnX']]){
      if(r[gk]>=3||!P[pk])continue;
      r[xk]+=P[pk]*grF*L.g*(0.55+0.9*R())*potF*tired/30;
      if(r[xk]>=xpNeed(r[gk])){r[xk]-=xpNeed(r[gk]);r[gk]++;out.traits.push({r,txt:`${gk==='upG'?'上り':'下り'}適性 ${GRADE_MARK[r[gk]-1]}→${GRADE_MARK[r[gk]]}`});if(r[gk]>=3)r[xk]=0;}}
    if(P.overcome){const ws=Object.keys(r.weak||{}).filter(k=>r.weak[k]&&seasonOK(k));
      if(ws.length&&R()<P.overcome*L.g*potF/1.2/30){const k=ws[0];delete r.weak[k];out.traits.push({r,txt:`${WEAK[k]}の苦手を克服`});}}
    if(P.fat<0)r.fat=clamp(r.fat+(P.fat-10)/30,0,100);else r.fat=clamp(r.fat+(P.fat*L.f*(camp?1.2:1)-10)/30,0,100);
    const pInj=(Math.max(0,r.fat-55)*0.0025*L.f+(lkey==='high'?0.008:0))*(1.3-r.tgh/100)*(P.safe?0.5:1)/30;
    if(R()<pInj){r.inj=ri(14,70);out.inj.push(r);}
    const target=(r.fat<35?0.3:r.fat>70?-0.4:0)+(mk==='rest'?0.3:0);
    r.cond=clamp(r.cond+(target-r.cond)*0.08+randn()*0.07,-1,1);
  }
  return out;
}
function dateLabel(m,d){const y=2025+S.year+(m>12?1:0),mm=m>12?m-12:m;const dt=new Date(y,mm-1,d);return `${mm}月${d}日（${'日月火水木金土'[dt.getDay()]}）`;}
function todayEvent(){return EVENT_DAYS[S.month+'-'+S.day]||null;}
function advanceDate(){S.day++;if(S.month<=12&&S.day>MLEN[S.month]){S.month++;S.day=1;}if(S.month===13&&S.day<2)S.day=2;}
function nextEventInfo(){let m=S.month,d=S.day,n=0;while(n<400){const k=EVENT_DAYS[m+'-'+d];if(k)return{key:k,days:n,m,d};d++;if(m<=12&&d>MLEN[m]){m++;d=1;}if(m===13&&d<2)d=2;if(m>13)break;n++;}return null;}
function dayTurn(lkey){
  if(todayEvent())return null;
  const u=userTeam(),m=S.month,d=S.day;
  const res=applyDay(u,lkey,m,d);
  for(const t of S.teams)if(!t.user)applyDay(t,'mid',m,d,AI_MENU[m]||'balance');
  const rep={m,d,label:dateLabel(m,d),camp:inCamp(m,d),ups:res.ups.map(x=>({id:x.r.id,k:x.k,from:x.from,to:x.to})),traits:res.traits.map(x=>({id:x.r.id,txt:x.txt})),inj:res.inj.map(r=>r.id),back:res.back.map(r=>r.id)};
  S.dayLog=[rep].concat(S.dayLog||[]).slice(0,30);
  advanceDate();save();return rep;
}
function startTodayEvent(){const k=todayEvent();if(!k)return;S.queue=[k];proceed();}
function proceed(){
  S.report=null;
  if(S.queue.length){startEvent(S.queue[0]);}
  else if(S.month===13){yearEnd();}
  else S.stage='month';
  save();
}

/* ===== events ===== */
const EVENT_INFO={yosen:{name:'予選会'},izumo:{course:'izumo'},zennihon:{course:'zennihon'},hakone:{course:'hakone'}};
function byRep(ids){return ids.slice().sort((a,b)=>teamById(b).rep-teamById(a).rep);}
function fieldFor(key){
  const all=S.teams.map(t=>t.id);
  if(key==='hakone')return S.field||S.seeds.concat(byRep(all.filter(id=>!S.seeds.includes(id))).slice(0,10));
  const others=byRep(all.filter(id=>!S.seeds.includes(id)));
  if(key==='izumo')return S.seeds.concat(others.slice(0,2));
  if(key==='zennihon')return S.seeds.concat(others.slice(0,5));
  return all;
}
function genWeather(key){
  const base={izumo:20,zennihon:13,hakone:4,yosen:17}[key];
  const sky=wpick(['晴れ','曇り','雨','雪'],key==='hakone'?[60,27,9,4]:[55,30,15,0]);
  return{sky,temp:Math.round(base+randn()*3),wind:wpick([0,1,2,3],[30,40,20,10])};
}
function startEvent(key){
  const u=userTeam();
  if(key==='yosen'){
    const y=runYosen();S.cur.yosen=y.list.find(x=>x.tid===u.id)?.rank??null;
    if(y.list.some(x=>x.tid===u.id)){S.ev={key,phase:'yosen',yosen:y};S.stage='event';}
    else{S.queue.shift();if(todayEvent()==='yosen')advanceDate();proceed();}
    return;
  }
  const c=COURSES[EVENT_INFO[key].course],field=fieldFor(key);
  const weather=c.days.map(()=>genWeather(key));
  const wsec=c.secs.map((s,i)=>weather[c.days.findIndex(d=>d.secs.includes(i))]);
  const entries={};
  for(const tid of field){const t=teamById(tid);if(t.user)continue;
    const arr=autoAssign(t.runners,c.secs,wsec);entries[tid]={rids:arr.map(r=>r.id),strats:c.secs.map(()=>'even')};}
  S.ev={key,course:c.id,field,weather,entries,day:0,results:[],phase:'entry',userIn:field.includes(u.id)};
  S.stage='event';
  if(!S.ev.userIn){for(let d=0;d<c.days.length;d++){const r=makeRace(d);r.runToEnd();S.ev.results[d]=r.results();}finalizeEvent();}
}
function setUserEntry(rids,strats){S.ev.entries[userTeam().id]={rids,strats};S.ev.phase='live';S.ev.day=0;save();}
function makeRace(dayIdx){
  const ev=S.ev,c=COURSES[ev.course],day=c.days[dayIdx],u=userTeam();
  let lead=0,prev=null;
  if(dayIdx>0){prev=ev.results[dayIdx-1];lead=Math.min(...ev.field.map(tid=>prev[tid].total));}
  const teams=ev.field.map(tid=>{const t=teamById(tid),en=ev.entries[tid];
    const runners=day.secs.map(i=>runnerIn(t,en.rids[i])),strats=day.secs.map(i=>en.strats[i]);
    let offset=0,issei=false;if(prev){const g=prev[tid].total-lead;if(g>600){offset=600;issei=true;}else offset=g;}
    return{team:t,runners,strats,offset,issei};});
  return new Race({course:c,dayIdx,weather:ev.weather[dayIdx],userTid:u.id,teams,records:S.records[c.id]});
}
function dayDone(dayIdx,res){
  const ev=S.ev,c=COURSES[ev.course];ev.results[dayIdx]=res;
  if(dayIdx<c.days.length-1){ev.phase='dayResult';}else finalizeEvent();
  save();
}
function nextDay(){S.ev.day++;S.ev.phase='live';save();}
function finalizeEvent(){
  const ev=S.ev,c=COURSES[ev.course],u=userTeam();
  const totals=ev.field.map(tid=>({tid,days:ev.results.map(r=>r[tid].total),total:ev.results.reduce((a,r)=>a+r[tid].total,0)})).sort((a,b)=>a.total-b.total);
  totals.forEach((x,i)=>x.rank=i+1);
  const secRanks=[],secTop=[],newRecs=[];
  c.secs.forEach((sec,gi)=>{const di=c.days.findIndex(d=>d.secs.includes(gi)),li=c.days[di].secs.indexOf(gi);
    const list=ev.field.map(tid=>({tid,rid:ev.entries[tid].rids[gi],t:ev.results[di][tid].times[li]})).sort((a,b)=>a.t-b.t);
    const rk={};list.forEach((x,i)=>rk[x.tid]=i+1);secRanks[gi]=rk;
    const top=list[0],tt=teamById(top.tid),rr=runnerIn(tt,top.rid);
    let isNew=false;
    if(top.t<S.records[c.id][gi].t){S.records[c.id][gi]={t:Math.round(top.t),name:rr.name,team:tt.name,year:S.year};isNew=true;newRecs.push(gi);}
    secTop[gi]={tid:top.tid,name:rr.name,grade:rr.grade,t:top.t,isNew};
    for(const x of list){const t=teamById(x.tid),r=runnerIn(t,x.rid);r.fat=clamp(r.fat+10,0,100);r.cond*=0.5;
      if(t.user)r.hist.push({y:S.year,ev:c.short,sec:sec.name,t:Math.round(x.t),rk:rk[x.tid]});}
  });
  ev.final={totals,secRanks,secTop,newRecs};ev.phase='final';
  const ur=totals.find(x=>x.tid===u.id);
  if(ev.key!=='hakone'){S.cur[ev.key]=ur?ur.rank:null;
    for(const x of totals){const t=teamById(x.tid);t.rep=clamp(t.rep+(x.rank<=3?2:x.rank<=8?1:x.rank>totals.length-3?-1:0),15,95);}}
  else{S.cur.hakone=ur?ur.rank:null;S.lastHakone={totals:totals.map(x=>({tid:x.tid,rank:x.rank,total:x.total}))};}
  S.cur['champ_'+ev.key]=teamById(totals[0].tid).name;
}
function eventDone(){const k=S.queue.shift();S.ev=null;if(S.month!==13&&!S.queue.length&&todayEvent()===k)advanceDate();proceed();}

function runYosen(){
  const parts=S.teams.filter(t=>!S.seeds.includes(t.id)),w=genWeather('yosen');
  const list=parts.map(t=>{const pool=t.runners.filter(r=>!r.inj).sort((a,b)=>predict(a,YOSEN_SEC,w)-predict(b,YOSEN_SEC,w)).slice(0,12);
    const runs=pool.map(r=>({id:r.id,name:r.name,grade:r.grade,t:quickRun(r,YOSEN_SEC,w)})).sort((a,b)=>a.t-b.t);
    const score=runs.slice(0,10).reduce((a,x)=>a+x.t,0);return{tid:t.id,score,runs};}).sort((a,b)=>a.score-b.score);
  list.forEach((x,i)=>{x.rank=i+1;x.pass=i<10;});
  S.field=S.seeds.concat(list.filter(x=>x.pass).map(x=>x.tid));
  for(const x of list){const t=teamById(x.tid);if(t.user)for(const run of x.runs){const r=runnerIn(t,run.id);r.hist.push({y:S.year,ev:'予選会',sec:'個人',t:Math.round(run.t),rk:null});}
    for(const run of x.runs){const r=runnerIn(t,run.id);r.fat=clamp(r.fat+8,0,100);}}
  return{list,weather:w};
}

/* ===== year end / scouting ===== */
function yearEnd(){
  const u=userTeam(),fin=S.lastHakone;
  const tot=fin.totals,repBefore=u.rep;
  const delta=rk=>rk==null?-4:rk===1?8:rk<=3?5:rk<=6?3:rk<=10?1:rk<=15?-1:-3;
  for(const t of S.teams){const x=tot.find(y=>y.tid===t.id);t.rep=clamp(Math.round(t.rep+delta(x?x.rank:null)+(50-t.rep)*0.03),15,95);}
  const urank=tot.find(x=>x.tid===u.id)?.rank??null;
  S.seeds=tot.slice(0,10).map(x=>x.tid);S.field=null;
  S.history.push({year:S.year,yosen:S.cur.yosen??null,izumo:S.cur.izumo??null,zennihon:S.cur.zennihon??null,hakone:urank,
    champ:{izumo:S.cur.champ_izumo,zennihon:S.cur.champ_zennihon,hakone:S.cur.champ_hakone},time:tot.find(x=>x.tid===u.id)?.total??null});
  const grads=u.runners.filter(r=>r.grade===4).map(r=>({name:r.name,home:r.home,ovr:ovr(r),hist:r.hist.filter(h=>h.ev==='新春')}));
  for(const t of S.teams){t.runners=t.runners.filter(r=>r.grade<4);for(const r of t.runners)r.grade++;}
  S.yearEnd={rank:urank,repBefore,repAfter:u.rep,seed:S.seeds.includes(u.id),champ:S.cur.champ_hakone,grads};
  S.stage='yearEnd';S.ev=null;S.queue=[];
}
function genScout(){
  const u=userTeam(),b=recruitBase(u.rep),list=[];
  for(let i=0;i<14;i++){const base=b+randn()*5+2;const r=makeRunner(base,1);r.pot=wpick([1,2,3,4,5],[1,2,4,3,2]);
    const o=ovr(r),p=1/(1+Math.exp(-((u.rep*0.35+31)-o)/3.5));
    r.acc=p;r.shown={};for(const k of STATS)r.shown[k]=Math.round(r[k]+randn()*3);r.weakKnown=R()<0.7;
    r.potShown=clamp(r.pot+(R()<0.25?(R()<0.5?-1:1):0),1,5);list.push(r);}
  list.sort((a,b)=>ovr(b)-ovr(a));
  S.scout={list,picked:null,joined:null};S.stage='scout';save();
}
function scoutCommit(ids){
  const u=userTeam(),sc=S.scout;const joined=[],declined=[];
  for(const r of sc.list)if(ids.includes(r.id)){if(R()<r.acc&&joined.length<7)joined.push(r);else declined.push(r);}
  const need=Math.max(5,20-u.runners.length);const walk=[];while(joined.length+walk.length<need){walk.push(makeRunner(recruitBase(u.rep)-6,1));}
  for(const r of joined.concat(walk)){const c={...r};delete c.acc;delete c.shown;delete c.potShown;delete c.weakKnown;c.hist=[];u.runners.push(c);}
  sc.joined=joined.map(r=>r.id);sc.declined=declined.map(r=>r.id);sc.walk=walk.map(r=>r.name);sc.picked=ids;save();
}
function newYear(){
  S.year++;S.month=4;S.day=1;S.dayLog=[];S.cur={};S.scout=null;S.yearEnd=null;S.lastHakone=null;
  for(const t of S.teams){
    if(!t.user){const b=recruitBase(t.rep);for(let i=0;i<5;i++)t.runners.push(makeRunner(b,1));}
    for(const r of t.runners){r.fat=Math.max(10,r.fat-30);r.inj=Math.max(0,r.inj-60);r.cond=0;}
  }
  S.stage='month';save();
}
/* ===== pixel core: raster helpers, colour, athlete rig ===== */
function h2(a,b){let x=(Math.imul(a|0,374761393)+Math.imul((b|0)+1013,668265263))|0;x=Math.imul(x^(x>>>13),1274126177);x^=x>>>16;return (x>>>0)/4294967296;}
function P(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
const lerp=(a,b,t)=>a+(b-a)*t;
/* crisp capsule: one fillRect per scanline */
function cap(c,x0,y0,x1,y1,r,col){
  const dx=x1-x0,dy=y1-y0,L2=dx*dx+dy*dy||1e-6,r2=r*r;
  const minx=Math.floor(Math.min(x0,x1)-r),maxx=Math.ceil(Math.max(x0,x1)+r),miny=Math.floor(Math.min(y0,y1)-r),maxy=Math.ceil(Math.max(y0,y1)+r);
  c.fillStyle=col;
  for(let y=miny;y<=maxy;y++){const py=y+0.5;let a=-1,b=-1;
    for(let x=minx;x<=maxx;x++){const px=x+0.5;let t=((px-x0)*dx+(py-y0)*dy)/L2;t=t<0?0:t>1?1:t;const ex=x0+t*dx-px,ey=y0+t*dy-py;if(ex*ex+ey*ey<=r2){if(a<0)a=x;b=x;}}
    if(a>=0)c.fillRect(a,y,b-a+1,1);}}
function disc(c,x,y,r,col){cap(c,x,y,x+0.001,y,r,col);}
/* crisp polygon (even-odd scanline) */
function poly(c,pts,col){let miny=1e9,maxy=-1e9;for(const p of pts){if(p[1]<miny)miny=p[1];if(p[1]>maxy)maxy=p[1];}
  c.fillStyle=col;const n=pts.length;
  for(let y=Math.floor(miny);y<=Math.ceil(maxy);y++){const py=y+0.5,xs=[];
    for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];if((a[1]<=py&&b[1]>py)||(b[1]<=py&&a[1]>py))xs.push(a[0]+(py-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
    xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2){const x0=Math.round(xs[i]),x1=Math.round(xs[i+1]);if(x1>x0)c.fillRect(x0,y,x1-x0,1);}}}
/* colour */
function hex2rgb(h){if(h.startsWith('hsl')){const m=h.match(/[\d.]+/g).map(Number);return hsl2rgb(m[0],m[1]/100,m[2]/100);}h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function hsl2rgb(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return[Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];}
function rgb2hex(r,g,b){return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
const _shc=new Map();
function shade(h,f){const k=h+'|'+f;let v=_shc.get(k);if(v)return v;const [r,g,b]=hex2rgb(h);v=f<1?rgb2hex(r*f,g*f,b*f):rgb2hex(r+(255-r)*(f-1),g+(255-g)*(f-1),b+(255-b)*(f-1));_shc.set(k,v);return v;}
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t);}
function lum(h){const [r,g,b]=hex2rgb(h);return (0.299*r+0.587*g+0.114*b)/255;}

/* ---- team kit ---- */
const _kits=new Map();
function teamKit(team){const key=team.id+'|'+team.color;let k=_kits.get(key);if(k)return k;
  const base=rgb2hex(...hex2rgb(team.color)),id=team.id;
  const pats=['solid','band','sash','side','yoke','chest','solid','band'];
  const pat=team.user?'band':pats[(h2(id,302)*pats.length)|0];
  const secs=['#f4f4f0','#151a2c','#e9b92e',shade(base,.5),'#f4f4f0'];
  let sec=team.user?'#f4f4f0':secs[(h2(id,303)*secs.length)|0];if(Math.abs(lum(sec)-lum(base))<0.18)sec=lum(base)>0.5?'#151a2c':'#f4f4f0';
  const shorts=h2(id,304)<.55?shade(base,.72):(lum(sec)>0.8?'#1d2236':sec);
  const tas=h2(id,305)<.75?shade(base,1.12):sec;
  k={base,dark:shade(base,.72),sec,pat,shorts,shortsD:shade(shorts,.75),tas,tasEdge:lum(tas)>0.7?'#c9c9c9':'#f2f2ee'};_kits.set(key,k);return k;}

/* ---- athlete look derived from runner ---- */
const SKIN=[['#f2c7a0','#dba985'],['#e8b48b','#cf9a72'],['#d9a074','#bf875e'],['#c78d63','#a9724c']];
const HAIRC=['#16120f','#231a14','#2e2219','#0f0f12','#3b2a1d','#1c1d24'];
const SHOES=['#ff4f9a','#ff7a1f','#3ddc84','#f4f4f4','#2fc6ff','#ffd21f','#ff3d3d','#c8ff2e','#8a7dff'];
function athleteLook(r){const id=r.id||1,lk=r.look||{};
  return{skin:SKIN[(lk.skin||0)%4],hair:HAIRC[(lk.hair||0)%6],style:(lk.hair||0)%6,shoe:SHOES[(h2(id,401)*SHOES.length)|0],
    sock:h2(id,402)<.6?'#f2f2f2':'#1a1a1f',glove:h2(id,403)<.55?(h2(id,404)<.5?'#f2f2f2':'#1b1b20'):null,
    sleeve:h2(id,405)<.3,shades:h2(id,406)<.22,band:h2(id,407)<.18,
    armAmp:0.62+h2(id,408)*0.22,heel:0.88+h2(id,409)*0.3,cadOff:(h2(id,410)-0.5)*0.16,reach:(h2(id,411)-0.5)*0.06,bounce:0.8+h2(id,412)*0.4};}

/* ---- gait model (metres, hip-relative, y up from ground) ---- */
const L1=0.45,L2=0.44,FL=0.15;
function gaitParams(v,grade,look){v=Math.max(1.5,v);grade=grade||0;
  const cad=Math.max(2.6,Math.min(3.45,3.02+0.13*(v-5.5)+look.cadOff+grade*1.6));   // steps per second
  const tc=Math.max(0.15,Math.min(0.30,0.185*Math.pow(5.5/v,0.85)*(1+grade*1.5)));    // ground contact (s)
  const T=2/cad;
  return{v,cad,T,tc,ds:Math.min(0.42,tc/T),reach:0.25+0.035*(v-5.5)+look.reach-grade*1.2,heel:look.heel*(0.75+0.05*v)*(1-grade*2),
    lean:0.10+grade*1.3,armAmp:look.armAmp*(0.85+0.03*v),osc:0.038*look.bounce};}
function crom(a,b,c,d,t){return 0.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
function legAt(phi,g){const a=g.reach;
  const stance=s=>{const C=a-g.v*g.tc*s,al=s<0.45?0:Math.pow((s-0.45)/0.55,1.3)*1.05;return{ax:C-FL*Math.cos(al),ay:0.075+FL*Math.sin(al),tx:C+0.055,ty:0.012};};
  if(phi<g.ds)return stance(phi/g.ds);
  const s=(phi-g.ds)/(1-g.ds),k0=stance(1),st=g.v/5.6,hh=g.heel;
  const K=[[k0.ax,k0.ay],[-0.42*st-0.06,0.40*hh],[-0.16*st,0.52*hh],[a+0.10,0.25],[a-FL,0.075]];
  const u=s*4,i=Math.min(3,Math.floor(u)),f=u-i,p0=K[Math.max(0,i-1)],p1=K[i],p2=K[i+1],p3=K[Math.min(4,i+2)];
  const ax=crom(p0[0],p1[0],p2[0],p3[0],f),ay=Math.max(0.07,crom(p0[1],p1[1],p2[1],p3[1],f));
  const ang=s<0.35?lerp(-0.95,-1.35,s/0.35):s<0.85?lerp(-1.35,-0.22,(s-0.35)/0.5):lerp(-0.22,-0.04,(s-0.85)/0.15);
  return{ax,ay,tx:ax+FL*1.15*Math.cos(ang),ty:Math.max(0.005,ay+FL*1.15*Math.sin(ang))};}
function ik(hx,hy,ax,ay){let dx=ax-hx,dy=ay-hy,d=Math.hypot(dx,dy);const m=L1+L2-0.004;if(d>m){ax=hx+dx/d*m;ay=hy+dy/d*m;dx=ax-hx;dy=ay-hy;d=m;}
  const th=Math.atan2(dy,dx),a1=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));
  const k1=[hx+L1*Math.cos(th+a1),hy+L1*Math.sin(th+a1)],k2=[hx+L1*Math.cos(th-a1),hy+L1*Math.sin(th-a1)];
  return{kx:(k1[0]>k2[0]?k1:k2)[0],ky:(k1[0]>k2[0]?k1:k2)[1],ax,ay};}
/* full pose: phi = cycle phase of near leg [0,1) */
function runPose(phi,g){
  const p=(phi*2)%1,ds2=Math.min(0.84,g.ds*2);
  const hy=0.915+(p<ds2?-g.osc*Math.sin(Math.PI*p/ds2):g.osc*0.55*Math.sin(Math.PI*(p-ds2)/(1-ds2)));
  const near=legAt(phi,g),far=legAt((phi+0.5)%1,g);
  const lean=g.lean,ux=Math.sin(lean),uy=Math.cos(lean),fx=Math.cos(lean),fy=-Math.sin(lean);
  const sh=[0.5*ux,hy+0.5*uy];
  const arm=(ph,side)=>{const sw=side*Math.cos(2*Math.PI*ph),th=g.armAmp*sw+0.04+lean,fl=1.25+0.55*(0.5+0.5*sw);
    const ex=sh[0]+0.29*Math.sin(th),ey=sh[1]-0.29*Math.cos(th);return{ex,ey,hx:ex+0.26*Math.sin(th+fl),hy:ey-0.26*Math.cos(th+fl)};};
  return{hip:[0,hy],sh,ux,uy,fx,fy,lean,near:{...near,...ik(0,hy,near.ax,near.ay)},far:{...far,...ik(0,hy,far.ax,far.ay)},
    armN:arm(phi,-1),armF:arm(phi,1),head:[sh[0]+0.19*Math.sin(lean*0.55)+0.025,sh[1]+0.19*Math.cos(lean*0.55)]};}
function standPose(t,kind){const b=kind==='bent';const hy=b?0.80:0.905+0.012*Math.sin(t*9);const lean=b?0.95:0.06;
  const ux=Math.sin(lean),uy=Math.cos(lean);const sh=[0.5*ux,hy+0.5*uy];
  const near={ax:b?0.08:0.10+0.03*Math.sin(t*9),ay:0.075,tx:b?0.25:0.27,ty:0.01},far={ax:b?-0.12:-0.08,ay:0.075,tx:b?0.05:0.09,ty:0.01};
  const N={...near,...ik(0,hy,near.ax,near.ay)},F={...far,...ik(0,hy,far.ax,far.ay)};
  const arm=(s)=>{if(b){const k=s<0?N:F;return{ex:(sh[0]+k.kx)/2+0.04,ey:(sh[1]+k.ky)/2,hx:k.kx+0.03,hy:k.ky+0.04};}
    const th=0.15+s*0.1,ex=sh[0]+0.29*Math.sin(th),ey=sh[1]-0.29*Math.cos(th);return{ex,ey,hx:ex+0.24,hy:ey+0.08};};
  return{hip:[0,hy],sh,ux,uy,fx:Math.cos(lean),fy:-Math.sin(lean),lean,near:N,far:F,armN:arm(-1),armF:arm(1),head:[sh[0]+0.19*Math.sin(lean*0.6)+0.02,sh[1]+0.19*Math.cos(lean*0.6)]};}

/* ---- draw athlete. sx,fy = screen x of hip & ground y; K = px per metre ---- */
const OUTL='rgba(18,14,24,.82)';
function drawAthlete(c,sx,fy,K,pose,kit,lk,o){o=o||{};
  const X=m=>sx+m*K,Y=m=>fy-m*K,s=K/24;
  const sk=lk.skin[0],skd=lk.skin[1];
  const limb=(x0,y0,x1,y1,r,col)=>{cap(c,X(x0),Y(y0),X(x1),Y(y1),r*s+0.7,OUTL);cap(c,X(x0),Y(y0),X(x1),Y(y1),r*s,col);};
  if(!o.noShadow){c.globalAlpha=.28;const sw=(o.shadowW||0.62)*K;P(c,sx-sw*0.45,fy-1,sw,2,'#10141c');c.globalAlpha=1;}
  const leg=(L,dark)=>{const skc=dark?skd:sk,shc=dark?kit.shortsD:kit.shorts;
    const mx=lerp(0,L.kx,0.42),my=lerp(pose.hip[1],L.ky,0.42);
    limb(0,pose.hip[1],L.kx,L.ky,1.75,skc);limb(L.kx,L.ky,L.ax,L.ay,1.25,skc);
    if(lk.sleeve&&!dark)limb(lerp(L.kx,L.ax,0.25),lerp(L.ky,L.ay,0.25),lerp(L.kx,L.ax,0.85),lerp(L.ky,L.ay,0.85),1.3,'#16161c');
    cap(c,X(0),Y(pose.hip[1]),X(mx),Y(my),2.05*s,shc);
    cap(c,X(L.ax),Y(L.ay),X(lerp(L.ax,L.kx,0.12)),Y(lerp(L.ay,L.ky,0.12)),1.3*s,dark?shade(lk.sock,.8):lk.sock);
    const hlx=L.ax-(L.tx-L.ax)*0.35,hly=L.ay-(L.ty-L.ay)*0.35-0.02;
    cap(c,X(hlx),Y(hly),X(L.tx),Y(L.ty),1.15*s+0.6,OUTL);cap(c,X(hlx),Y(hly),X(L.tx),Y(L.ty),1.15*s,dark?shade(lk.shoe,.78):lk.shoe);
    cap(c,X(hlx),Y(hly-0.025),X(L.tx),Y(L.ty-0.02),0.45*s,'#f4f4f0');};
  const arm=(A,dark)=>{const skc=dark?skd:sk;const gc=lk.glove?(dark?shade(lk.glove,.8):lk.glove):skc;
    const up=lk.sleeve?(dark?'#0e0e12':'#1a1a20'):skc;
    limb(pose.sh[0],pose.sh[1],A.ex,A.ey,1.15,up);limb(A.ex,A.ey,A.hx,A.hy,0.95,lk.sleeve?up:skc);disc(c,X(A.hx),Y(A.hy),1.25*s,gc);};
  // far side
  arm(pose.armF,true);leg(pose.far,true);
  // torso
  const H=pose.hip,S=pose.sh,fx=pose.fx,fy2=pose.fy,ux=pose.ux,uy=pose.uy;
  const pt=(b,f,u)=>[X(b[0]+fx*f+ux*u),Y(b[1]+fy2*f+uy*u)];
  const torso=[pt(H,-0.105,0.02),pt(H,0.10,0.02),pt(S,0.125,-0.06),pt(S,0.09,0.03),pt(S,-0.07,0.04),pt(S,-0.12,-0.04)];
  poly(c,torso.map(p=>[p[0]-0.8,p[1]]),OUTL);poly(c,torso.map(p=>[p[0]+0.8,p[1]]),OUTL);poly(c,torso.map(p=>[p[0],p[1]-0.8]),OUTL);
  poly(c,torso,kit.base);
  // kit pattern
  const band=(u0,u1,col)=>poly(c,[pt(H,-0.105,u0),pt(H,0.11,u0),pt(H,0.12,u1),pt(H,-0.11,u1)],col);
  if(kit.pat==='band')band(0.24,0.31,kit.sec);
  else if(kit.pat==='chest')band(0.30,0.44,kit.sec);
  else if(kit.pat==='yoke')poly(c,[pt(S,-0.12,-0.04),pt(S,0.125,-0.06),pt(S,0.11,-0.13),pt(S,-0.12,-0.13)],kit.sec);
  else if(kit.pat==='side')poly(c,[pt(H,-0.02,0.02),pt(H,0.03,0.02),pt(S,0.03,-0.04),pt(S,-0.02,-0.04)],kit.sec);
  else if(kit.pat==='sash')poly(c,[pt(S,-0.06,0.0),pt(S,0.02,0.0),pt(H,0.11,0.12),pt(H,0.11,0.04)],kit.sec);
  P(c,X(H[0]+fx*0.03+ux*0.30),Y(H[1]+fy2*0.03+uy*0.30+0.035),Math.max(2,0.09*K),Math.max(2,0.08*K),'#f6f6f2');
  // tasuki: over the left shoulder, down to the right hip
  const t0=pt(S,-0.04,0.03),t1=pt(H,0.10,0.05);
  cap(c,t0[0],t0[1],t1[0],t1[1],1.25*s+0.5,kit.tasEdge);cap(c,t0[0],t0[1],t1[0],t1[1],1.15*s,kit.tas);
  // shorts top
  poly(c,[pt(H,-0.11,0.05),pt(H,0.105,0.05),pt(H,0.10,-0.06),pt(H,-0.10,-0.07)],kit.shorts);
  // neck & head
  const hd=pose.head,hr=0.108*K;
  limb(S[0]+ux*0.02,S[1]+uy*0.02,hd[0]-0.01,hd[1]-0.07,1.0,skd);
  disc(c,X(hd[0]),Y(hd[1]),hr+0.8,OUTL);
  disc(c,X(hd[0]),Y(hd[1]),hr,sk);
  const st=lk.style;
  if(st===0||st===4){disc(c,X(hd[0]-0.02),Y(hd[1]+0.025),hr*0.92,lk.hair);disc(c,X(hd[0]+0.03),Y(hd[1]-0.012),hr*0.8,sk);}
  else{disc(c,X(hd[0]-0.018),Y(hd[1]+0.03),hr*1.02,lk.hair);disc(c,X(hd[0]+0.035),Y(hd[1]-0.022),hr*0.78,sk);
    if(st===1||st===5)P(c,X(hd[0]+0.03),Y(hd[1]+0.07),Math.max(1,0.05*K),1,lk.hair);
    if(st===2){P(c,X(hd[0]-0.05),Y(hd[1]+0.13),1,1,lk.hair);P(c,X(hd[0]+0.01),Y(hd[1]+0.135),1,1,lk.hair);}
    if(st===3)P(c,X(hd[0]-0.11),Y(hd[1]+0.01),Math.max(1,0.05*K),Math.max(2,0.08*K),lk.hair);}
  P(c,X(hd[0]-0.01),Y(hd[1]+0.005),1,Math.max(1,0.04*K),skd);
  if(lk.shades||st===5)P(c,X(hd[0]+0.03),Y(hd[1]+0.03),Math.max(2,0.08*K),Math.max(1,0.035*K),'#15161c');
  else P(c,X(hd[0]+0.065),Y(hd[1]+0.025),1,1,'#1d1714');
  if(lk.band||st===4)cap(c,X(hd[0]-0.09),Y(hd[1]+0.05),X(hd[0]+0.09),Y(hd[1]+0.06),0.6*s,kit.sec==='#f4f4f0'?'#f4f4f0':kit.base);
  // near side
  leg(pose.near,false);arm(pose.armN,false);
  if(o.me){const yy=Y(hd[1]+0.36)+Math.sin(o.t*3)*1;poly(c,[[sx-4*s,yy],[sx+4*s,yy],[sx,yy+5*s]],'#ffd23f');}
  return{mouth:[X(hd[0]+0.11),Y(hd[1]-0.02)]};
}
/* ===== broadcast camera: real-scale side view ===== */
const VW=384,VH=216,KPX=32,CXR=150;
const Y_HOR=104,Y_MIDB=134,Y_CROWD=151,Y_ROAD0=154,Y_ROAD1=206;
const LANE_Y=[166,173,180,187,194];
const S_FAR=0.026,S_MID=0.225,S_CROWD=0.64,S_FG=1.35;
const laneScale=y=>0.9+(y-166)/28*0.18;
function zoneAt(sec,km){const z=sec.zones;if(!z||!z.length)return{th:'suburb',place:''};for(const o of z)if(km>=o.a&&km<o.b)return o;return km<z[0].a?z[0]:z[z.length-1];}
const SEAS={winter:{tree:'#2d5236',treeL:'#3d6a45',bare:'#6b5a4a',grass:'#8a8b62',grassD:'#74765a',field:'#a69567',leaf:'#7c6a52'},
  early:{tree:'#3a7038',treeL:'#4f8a45',bare:'#5d4a3a',grass:'#7ea656',grassD:'#6a9048',field:'#d2ad4f',leaf:'#79a24a'},
  autumn:{tree:'#3b6438',treeL:'#5a7f40',bare:'#6b5040',grass:'#8aa05c',grassD:'#748a4e',field:'#c6a24c',leaf:'#d58a32'},
  summer:{tree:'#357f3a',treeL:'#4c9a44',bare:'#5d4a3a',grass:'#72b257',grassD:'#5f9a48',field:'#6aa84a',leaf:'#5fae4a'}};
const THEME={
  city:{far:'skyline',crowd:.95,curb:'curb',band:'plaza',near:'pave'},town:{far:'hills',crowd:.7,curb:'curb',band:'lot',near:'pave'},
  suburb:{far:'hills',crowd:.5,curb:'curb',band:'lot',near:'pave'},coast:{far:'sea',crowd:.4,curb:'wall',band:'beach',near:'sand'},
  mountain:{far:'mount',crowd:.22,curb:'guard',band:'slope',near:'verge'},onsen:{far:'valley',crowd:.85,curb:'curb',band:'lot',near:'pave'},
  lake:{far:'lake',crowd:.8,curb:'curb',band:'water',near:'verge'},rural:{far:'fields',crowd:.18,curb:'none',band:'paddy',near:'verge'},
  industrial:{far:'factory',crowd:.3,curb:'mesh',band:'lot',near:'pave'},bridge:{far:'river',crowd:.4,curb:'rail',band:'water',near:'deck'},
  shrine:{far:'forest',crowd:.95,curb:'curb',band:'gravel',near:'pave'},park:{far:'hills',crowd:.7,curb:'curb',band:'lawn',near:'pave'},
  highland:{far:'alps',crowd:0,curb:'none',band:'meadow',near:'verge'},track:{far:'stadium',crowd:0,curb:'none',band:'lawn',near:'infield'}};
const SKY={'晴れ':{z:'#3f8fd6',h:'#bfe1f6'},'曇り':{z:'#8995a3',h:'#cfd5db'},'雨':{z:'#56626f',h:'#949ea8'},'雪':{z:'#949ea8',h:'#d7dce1'}};
const PPL=['#2b3550','#1e1f26','#6b4b3a','#b23a32','#e8e4da','#4a5a3a','#3d4f78','#7a6f60','#2f6f6a','#8c3a5e','#c9a24a','#5a5f69'];

/* ---------- sky & far ---------- */
function skyCols(w,hour){const b=SKY[w.sky]||SKY['晴れ'];let z=b.z,h=b.h;
  if(hour<9.5){const k=(9.5-Math.max(7,hour))/2.5;h=mix(h,'#f2d6ae',0.55*k);z=mix(z,'#5a7fb5',0.25*k);}
  else if(hour>14.5){const k=Math.min(1,(hour-14.5)/2);h=mix(h,'#efd9b0',0.45*k);}
  return{z,h};}
function drawSky(c,w,t,hour,cam){const {z,h}=skyCols(w,hour);const n=12,bh=Math.ceil(Y_HOR/n);
  for(let i=0;i<n;i++){const col=mix(z,h,Math.pow(i/(n-1),1.3));P(c,0,i*bh,VW,bh,col);if(i<n-1){const nx=mix(z,h,Math.pow((i+1)/(n-1),1.3));for(let x=(i%2);x<VW;x+=2)P(c,x,i*bh+bh-1,1,1,nx);}}
  if(w.sky==='晴れ'){const sx=hour<12?300:hour<14?250:120,sy=hour<10?44:hour<14?20:36;disc(c,sx,sy,9,mix(h,'#fff7d8',0.7));disc(c,sx,sy,6,'#fffbea');}
  const cnt=w.sky==='晴れ'?5:w.sky==='曇り'?12:10,lit=w.sky==='晴れ'?'#ffffff':w.sky==='曇り'?'#e2e6ea':'#a9b1ba',sh=w.sky==='晴れ'?'#d9e6f0':w.sky==='曇り'?'#b9c1ca':'#87909a';
  for(let i=0;i<cnt;i++){const s=26+h2(i,9)*40,span=VW+200,x=((h2(i,7)*span-(cam*0.012+t*(0.8+w.wind)*1.5))%span+span)%span-100,y=8+h2(i,8)*(w.sky==='晴れ'?40:56);
    cap(c,x,y+6,x+s,y+6,4,sh);cap(c,x+4,y+3,x+s-6,y+3,4.5,lit);disc(c,x+s*0.35,y,6,lit);disc(c,x+s*0.6,y+1,5,lit);P(c,x+2,y+9,s-2,1,sh);}}
function ridge(c,off,base,amp,f,seed,col,tex){for(let x=0;x<VW;x+=2){const X=x+off;const y=base-amp*(0.5+0.3*Math.sin(X*f+seed)+0.2*Math.sin(X*f*2.3+seed*1.7)+0.08*Math.sin(X*f*7.1+seed));
  P(c,x,y,2,Y_MIDB+20-y,col);if(tex&&((x/2+(y|0))%5===0))P(c,x,y+2+((X*13)%7),1,1,tex);}}
function fuji(c,x,base,haze){const body=mix('#5f7593',haze,0.25),snow=mix('#f4f7fb',haze,0.15),snowS=mix('#c9d5e3',haze,0.2);
  for(let dx=-78;dx<=78;dx++){const a=Math.abs(dx);const hh=62*Math.pow(1-a/78,1.35)-(a<7?1.5:0);if(hh<=0)continue;P(c,x+dx,base-hh,1,hh,body);
    if(hh>36){const sl=(hh-36)*0.9+((dx*7+3)%5===0?5:(dx*3)%4===0?2:0);P(c,x+dx,base-hh,1,sl,dx<0?snow:snowS);}}}
function water(c,y0,y1,col,hi,t,cam){P(c,0,y0,VW,y1-y0,col);P(c,0,y0,VW,1,hi);for(let i=0;i<70;i++){const x=((h2(i,11)*VW*2-cam*0.6)%VW+VW)%VW,y=y0+2+h2(i,12)*(y1-y0-3);if(((t*2.2+i*0.37)|0)%3===0)P(c,x,y,2+(i%3),1,hi);}}
function drawFar(c,kind,cam,t,env){const o=cam*KPX*S_FAR,hz=skyCols(env.w,env.hour).h;
  switch(kind){
  case 'skyline':ridge(c,o*0.5,Y_HOR+4,10,.02,1,mix('#9fb0c2',hz,.35));
    for(const [par,tw,hmin,hr,col,sd] of [[0.6,14,22,46,mix('#9daec2',hz,.3),3],[1.2,18,14,40,mix('#8292a8',hz,.15),5]]){const off=o*par,i0=Math.floor(off/tw);
      for(let i=i0;i<i0+VW/tw+2;i++){const x=i*tw-off,hh=hmin+h2(i,sd)*hr;P(c,x,Y_MIDB-hh,tw-2,hh,col);if(h2(i,sd+1)<.25)P(c,x+tw/2-1,Y_MIDB-hh-8,2,8,col);
        for(let yy=Y_MIDB-hh+3;yy<Y_MIDB-2;yy+=3)for(let xx=x+2;xx<x+tw-3;xx+=3)if(h2(i*31+xx,yy)<.55)P(c,xx,yy,1,1,shade(col,1.12));}}break;
  case 'hills':ridge(c,o*0.6,Y_HOR+2,16,.018,1,mix('#93a99f',hz,.4));ridge(c,o*1.2,Y_HOR+14,12,.03,2,mix('#7a957f',hz,.2),'#6c8670');break;
  case 'sea':{ridge(c,o*0.3,Y_HOR-2,6,.015,4,mix('#8ea6bb',hz,.5));if(env.fuji)fuji(c,282-o*0.2,Y_HOR-1,hz);if(env.enoshima){const ex=70-o*0.4;P(c,ex,Y_HOR-10,46,10,mix('#4f6b5a',hz,.4));cap(c,ex+6,Y_HOR-12,ex+40,Y_HOR-12,5,mix('#4f6b5a',hz,.4));P(c,ex+24,Y_HOR-26,2,16,mix('#c8cdd2',hz,.3));}
    water(c,Y_HOR-1,Y_MIDB,mix('#2f6f9f',hz,.25),mix('#8fc0de',hz,.2),t,cam);for(let y=Y_HOR+2;y<Y_MIDB;y+=4)P(c,0,y,VW,1,mix('#3d7fb0',hz,.2));break;}
  case 'mount':ridge(c,o*0.4,Y_HOR-8,40,.012,1,mix('#7a92ab',hz,.35));if(env.fuji)fuji(c,90-o*0.15,Y_HOR-8,hz);ridge(c,o*0.9,Y_HOR+6,34,.02,3,mix('#4b6d58',hz,.15),'#3f5f4c');ridge(c,o*1.6,Y_HOR+22,26,.03,5,'#3a5a45','#2f4c3a');break;
  case 'valley':ridge(c,o*0.8,Y_HOR-4,46,.016,2,mix('#5e7f64',hz,.2),'#526f58');ridge(c,o*1.6,Y_HOR+16,38,.026,5,'#3f6149','#34523d');break;
  case 'lake':ridge(c,o*0.4,Y_HOR-2,26,.015,1,mix('#7890a8',hz,.35));if(env.fuji)fuji(c,250-o*0.15,Y_HOR-2,hz);ridge(c,o*0.9,Y_HOR+6,12,.03,6,mix('#45694f',hz,.2),'#3b5d45');
    water(c,Y_HOR+6,Y_MIDB,mix('#2f6687',hz,.2),mix('#89b8d4',hz,.2),t,cam);break;
  case 'fields':ridge(c,o*0.3,Y_HOR-2,22,.014,2,mix('#7f97ad',hz,.45));ridge(c,o*0.7,Y_HOR+6,12,.025,4,mix('#5f7f68',hz,.25),'#557560');break;
  case 'factory':{ridge(c,o*0.5,Y_HOR+6,8,.02,1,mix('#a7b3bb',hz,.4));const off=o*1.2;for(let i=Math.floor(off/52);i<off/52+VW/52+2;i++){const x=i*52-off;
      if(h2(i,31)<.65){const hh=54+h2(i,32)*30;P(c,x,Y_MIDB-hh,5,hh,'#ececec');for(let y=Y_MIDB-hh;y<Y_MIDB-hh+22;y+=8)P(c,x,y,5,4,'#c64a3c');
        for(let k=0;k<4;k++){const py=Y_MIDB-hh-5-k*6-((t*5)%6),px=x+2+k*4+Math.sin(t+k+i)*2;c.globalAlpha=.45-k*.1;disc(c,px,py,3+k,'#e3e6e9');c.globalAlpha=1;}}
      if(h2(i,33)<.6){const tx=x+16;P(c,tx,Y_MIDB-22,26,22,'#c4cbd1');cap(c,tx,Y_MIDB-22,tx+26,Y_MIDB-22,3,'#c4cbd1');P(c,tx+4,Y_MIDB-16,18,1,'#aab2b9');}}break;}
  case 'river':ridge(c,o*0.5,Y_HOR+2,10,.02,1,mix('#9fb1bf',hz,.4));{const off=o*1.1;for(let i=Math.floor(off/20);i<off/20+VW/20+2;i++){const hh=8+h2(i,41)*22;P(c,i*20-off,Y_HOR+8-hh,18,hh,mix('#8e9fb0',hz,.3));}}
    water(c,Y_HOR+8,Y_MIDB,mix('#3c7aa4',hz,.2),mix('#9cc6e0',hz,.15),t,cam);break;
  case 'forest':ridge(c,o*0.8,Y_HOR+4,30,.04,2,'#2f5338','#28472f');ridge(c,o*1.4,Y_HOR+16,24,.06,4,'#24402b','#1f3825');break;
  case 'alps':ridge(c,o*0.3,Y_HOR-18,58,.012,1,mix('#6f88a6',hz,.3));for(let x=0;x<VW;x+=2){const X=x+o*0.3,y=Y_HOR-18-58*(0.5+0.3*Math.sin(X*.012+1)+0.2*Math.sin(X*.0276+1.7)+0.08*Math.sin(X*.0852+1));if(y<Y_HOR-50)P(c,x,y,2,(Y_HOR-50-y)*0.8+2,'#eef2f6');}
    ridge(c,o*0.9,Y_HOR+10,22,.03,3,'#5b8a56','#4f7a4b');break;
  case 'stadium':P(c,0,Y_HOR-30,VW,Y_MIDB-Y_HOR+30,'#8a9199');for(let y=Y_HOR-28;y<Y_MIDB-4;y+=5){P(c,0,y,VW,1,'#737a82');for(let x=(y*3)%7;x<VW;x+=7)P(c,x,y+1,3,3,['#c43','#36c','#eb3','#ddd','#3a5'][(x*7+y)%5]);}
    P(c,0,Y_HOR-34,VW,4,'#5b6168');for(const lx of [40,340]){P(c,lx,6,3,Y_HOR-40,'#9aa1a8');P(c,lx-10,2,24,8,'#eef2f5');}break;}}

/* ---------- mid plane props (px at 7.2 px/m) ---------- */
const MPPM=KPX*S_MID;
function genMid(ctx){const th=ctx.th,r=h2(ctx.n,1),seed=(ctx.n*7919)|0;let kind,wpx;
  if(ctx.lm&&(ctx.ux==null||ctx.ux>VW*0.45)){const L=ctx.lm;ctx.lm=null;return{kind:'lm:'+L.k,w:LM_W[L.k]/MPPM,seed,th,name:L.name};}
  switch(th){
  case 'city':[kind,wpx]=r<.42?['office',70+h2(seed,2)*60]:r<.72?['shopbldg',56+h2(seed,2)*30]:r<.86?['streettree',26]:r<.94?['signal',16]:['vending',22];break;
  case 'town':[kind,wpx]=r<.4?['house',52+h2(seed,2)*16]:r<.62?['shop',46+h2(seed,2)*14]:r<.78?['pole',10]:r<.88?['apt',70]:r<.95?['vending',22]:['streettree',24];break;
  case 'suburb':[kind,wpx]=r<.34?['house',54+h2(seed,2)*14]:r<.5?['pole',10]:r<.64?['tree',30]:r<.74?['conbini',78]:r<.86?['apt',72]:['wall',36];break;
  case 'coast':[kind,wpx]=r<.55?['pines',40+h2(seed,2)*20]:r<.8?['open',30]:r<.92?['lamp',16]:['hut',34];break;
  case 'mountain':[kind,wpx]=r<.55?['cedars',36+h2(seed,2)*18]:r<.72?['retain',60]:r<.82?['mirror',12]:r<.9?['rsign',22]:['cedars',30];break;
  case 'onsen':[kind,wpx]=r<.48?['ryokan',78+h2(seed,2)*20]:r<.72?['souvenir',54]:r<.86?['cedars',30]:['lanternpost',12];break;
  case 'lake':[kind,wpx]=r<.4?['bigcedar',30]:r<.62?['open',36]:r<.8?['stonelantern',14]:['bigcedar',26];break;
  case 'rural':[kind,wpx]=ctx.izumo&&r<.35?['tsukiji',86]:r<.5?['farmhouse',62]:r<.7?['open',44]:r<.84?['hazakake',48]:r<.94?['kaki',30]:['shed',32];break;
  case 'industrial':[kind,wpx]=r<.5?['factory',96]:r<.72?['tank',52]:r<.88?['pipes',60]:['fencegap',30];break;
  case 'bridge':[kind,wpx]=r<.6?['lamp',22]:['open',30];break;
  case 'shrine':[kind,wpx]=r<.5?['bigtree',56]:r<.72?['stonelantern',16]:r<.88?['shopfront',50]:['bigtree',44];break;
  case 'park':[kind,wpx]=r<.6?['tree',34]:r<.8?['open',30]:['bench',24];break;
  case 'highland':[kind,wpx]=r<.6?['birch',22]:['open',30];break;
  case 'track':[kind,wpx]=['open',40];break;
  default:[kind,wpx]=['tree',30];}
  return{kind,w:wpx/MPPM,seed,th};}
const LM_W={toriiLake:70,ship:60,eboshi:30,train:150,hotel:120,resort:140,sign874:40,toriiWood:110,toriiBig:150,uji:180,dome:220,rokugo:240};
function bandFill(c,x,w,th,se,t,cam){const b=THEME[th]?.band||'lot';
  switch(b){
  case 'plaza':P(c,x,Y_MIDB-6,w,6,'#b9b3a8');break;
  case 'lot':P(c,x,Y_MIDB-4,w,4,'#a9a49b');break;
  case 'beach':P(c,x,Y_MIDB-8,w,8,'#d8c79c');for(let k=0;k<w;k+=6)if(((k+((t*14)|0))%18)<6)P(c,x+k,Y_MIDB-10,5,1,'#f4f6f6');break;
  case 'slope':P(c,x,Y_MIDB-14,w,14,'#3b4a33');for(let k=0;k<w;k+=3)P(c,x+k,Y_MIDB-14+((k*7)%9),1,1,'#4c5d40');break;
  case 'water':break;
  case 'paddy':{P(c,x,Y_MIDB-24,w,24,se.field);for(let y=Y_MIDB-22;y<Y_MIDB;y+=3)for(let k=(y%2);k<w;k+=4)P(c,x+k,y,2,1,shade(se.field,.82));break;}
  case 'gravel':P(c,x,Y_MIDB-6,w,6,'#cfc8b8');for(let k=0;k<w;k+=3)P(c,x+k,Y_MIDB-5+(k%4),1,1,'#b4ad9e');break;
  case 'lawn':P(c,x,Y_MIDB-8,w,8,se.grass);break;
  case 'meadow':P(c,x,Y_MIDB-16,w,16,se.grass);for(let k=0;k<w;k+=4)P(c,x+k,Y_MIDB-15+((k*5)%13),1,2,se.grassD);break;}}
function windows(c,x,y,w,h,cw,ch,gx,gy,col,dark,seed){for(let yy=y;yy+ch<=y+h;yy+=ch+gy)for(let xx=x;xx+cw<=x+w;xx+=cw+gx){P(c,xx,yy,cw,ch,h2(seed+xx,yy)<.18?dark:col);P(c,xx,yy,cw,1,shade(col,.8));}}
function signGlyphs(c,x,y,w,col,seed){let k=0;while(k<w-3){const gw=3+((h2(seed,k)*3)|0);P(c,x+k,y,gw-1,1,col);P(c,x+k+1,y+2,1,2,col);if(h2(seed,k+9)<.5)P(c,x+k,y+4,gw-1,1,col);k+=gw+1;}}
function tree(c,x,base,w,h,se,bare){const tx=x+w/2;P(c,tx-2,base-h*0.4,4,h*0.4,'#5b4434');P(c,tx-2,base-h*0.4,1,h*0.4,'#4a372a');
  if(bare){for(let k=0;k<7;k++){const a=-1.6+(k-3)*0.32,L=h*0.45;cap(c,tx,base-h*0.35,tx+Math.cos(a)*L*0.7,base-h*0.35+Math.sin(a)*L,0.6,se.bare);}return;}
  const g=se.tree,gl=se.treeL;disc(c,tx,base-h*0.62,w*0.42,g);disc(c,tx-w*0.22,base-h*0.5,w*0.3,g);disc(c,tx+w*0.22,base-h*0.52,w*0.3,g);disc(c,tx-w*0.08,base-h*0.72,w*0.26,gl);disc(c,tx+w*0.12,base-h*0.62,w*0.16,gl);}
function cedar(c,x,base,h,col,colL){const w=Math.max(10,h*0.26);for(let k=0;k<h;k++){const ww=Math.min(w,2+k*0.32);P(c,x-ww/2,base-h+k,ww,1,(k%4===0)?shade(col,.8):col);if(k%4===1)P(c,x-ww/2,base-h+k,Math.max(1,ww*0.35),1,colL);}P(c,x-2,base-5,4,5,'#5a3f2e');}
function pineTree(c,x,base,h,seed){const lean=(h2(seed,1)-0.5)*14;cap(c,x,base,x+lean,base-h*0.75,1.6,'#6a4a34');
  const g='#2a4d33',gl='#3e6a46';for(let k=0;k<4;k++){const cx=x+lean*(0.6+k*0.12)+(h2(seed,k+3)-0.5)*16,cy=base-h*(0.62+k*0.11);cap(c,cx-9,cy,cx+9,cy,3.2,g);cap(c,cx-5,cy-2,cx+3,cy-2,1.4,gl);}}
function roofTiles(c,x,y,w,h,col){P(c,x,y,w,h,col);for(let yy=y+1;yy<y+h;yy+=2)P(c,x,yy,w,1,shade(col,.82));for(let xx=x+((y/2)|0)%3;xx<x+w;xx+=3)P(c,xx,y,1,h,shade(col,.88));}
function drawMid(c,it,x,t,env){const se=env.se,B=Y_MIDB,s=it.seed,w=it.w*MPPM;bandFill(c,x,w,it.th,se,t,env.cam);
  switch(it.kind){
  case 'office':{const h=110+h2(s,3)*120,col=['#b8b2a6','#9ea8b2','#c7c0b0','#8b95a2','#d4cec2','#a49e95','#7f8c99'][(h2(s,4)*7)|0];
    P(c,x,B-h,w-4,h,col);P(c,x+w-6,B-h,2,h,shade(col,.8));P(c,x,B-h,w-4,2,shade(col,.75));
    const glass=h2(s,5)<.4;if(glass){for(let yy=B-h+4;yy<B-22;yy+=6){P(c,x+3,yy,w-10,4,mix('#6f8fb0',env.sky,.3));P(c,x+3,yy,w-10,1,'#9fbbd4');}}
    else windows(c,x+4,B-h+6,w-12,h-30,3,4,2,3,'#d9e3ea','#5e6f80',s);
    P(c,x,B-20,w-4,20,shade(col,.7));P(c,x+4,B-16,w-12,12,'#3c4652');for(let k=6;k<w-10;k+=10)P(c,x+4+k,B-16,1,12,'#6c7a88');break;}
  case 'shopbldg':{const h=64+h2(s,3)*46,col=['#d8d0c0','#c2b6a2','#b9c0c6','#e2dccf'][(h2(s,4)*4)|0];P(c,x,B-h,w-3,h,col);
    windows(c,x+4,B-h+6,w-10,h-36,5,6,4,5,'#cfdbe5','#6b7c8d',s);const sc=['#c0392b','#1f5aa8','#e2a33a','#2f7d4f','#7d3c98'][(h2(s,5)*5)|0];
    P(c,x+2,B-30,w-7,9,sc);signGlyphs(c,x+6,B-28,w-16,'#ffffff',s);P(c,x+2,B-21,w-7,21,'#43505c');P(c,x+5,B-18,w-13,15,'#a9c2d3');P(c,x+5,B-11,w-13,1,'#8aa5b8');break;}
  case 'streettree':tree(c,x,B,w,64,se,env.season==='winter'&&h2(s,6)<.7);break;
  case 'tree':tree(c,x,B,w,46+h2(s,3)*16,se,false);break;
  case 'signal':P(c,x+7,B-62,2,62,'#7c8288');P(c,x+7,B-62,20,2,'#7c8288');P(c,x+14,B-66,14,6,'#2e3238');disc(c,x+17,B-63,1.5,'#3a7');disc(c,x+21,B-63,1.5,'#555');disc(c,x+25,B-63,1.5,'#555');break;
  case 'vending':{const vc=['#d8342b','#1f6fb8','#f2f2ef','#2c8a4e'][(h2(s,3)*4)|0];P(c,x+4,B-26,14,26,vc);P(c,x+5,B-24,12,9,'#e9eef2');for(let k=0;k<4;k++)P(c,x+6+k*3,B-22,2,4,['#c33','#3a6','#36c','#fc3'][k]);P(c,x+5,B-12,12,2,'#333');P(c,x+4,B-26,14,1,shade(vc,1.2));break;}
  case 'house':{const h=36+h2(s,3)*14,wall=['#e6dfcf','#d2c9b6','#cfc7ba','#bdb4a3','#ece6da'][(h2(s,4)*5)|0],rf=['#4b5563','#5b4a3f','#3d4c63','#6a4d3c','#565b62'][(h2(s,5)*5)|0];
    P(c,x+2,B-h,w-6,h,wall);P(c,x+2,B-h/2-1,w-6,2,shade(wall,.85));roofTiles(c,x-2,B-h-6,w+2,6,rf);roofTiles(c,x+4,B-h-11,w-10,5,rf);P(c,x-2,B-h/2-3,w+2,3,rf);
    P(c,x+6,B-h+6,10,8,'#88a0b4');P(c,x+6,B-h+6,10,1,'#6d8597');P(c,x+w-20,B-h+6,10,8,'#88a0b4');P(c,x+w-18,B-16,8,16,'#6e5540');P(c,x+6,B-14,12,8,'#88a0b4');break;}
  case 'shop':{const h=40+h2(s,3)*10,wall=['#d9cdb5','#c8bda8','#e0d8c8'][(h2(s,4)*3)|0];P(c,x+1,B-h,w-3,h,wall);roofTiles(c,x-2,B-h-5,w+2,5,'#4b5563');
    const aw=['#b8322a','#1f5aa8','#2f7d4f','#d2862a'][(h2(s,5)*4)|0];P(c,x+1,B-22,w-3,4,aw);for(let k=0;k<w-3;k+=4)P(c,x+1+k,B-18,2,2,aw);
    P(c,x+4,B-16,w-9,16,'#556270');P(c,x+5,B-15,w-11,14,'#e8dcc0');for(let k=0;k<w-14;k+=4)P(c,x+7+k,B-14,2,6,['#c33','#36c','#ec3','#3a6','#c6c'][(h2(s,k)*5)|0]);
    P(c,x+4,B-h+5,w-9,8,'#f4f1ea');signGlyphs(c,x+7,B-h+7,w-15,'#2a2a2a',s);break;}
  case 'pole':{P(c,x+4,B-92,3,92,'#8a8478');P(c,x+4,B-92,1,92,'#6e695f');P(c,x-6,B-84,24,2,'#6e695f');P(c,x-4,B-74,20,2,'#6e695f');P(c,x+7,B-70,7,10,'#9aa0a4');
    for(const [yy,sag] of [[-84,8],[-74,10],[-60,6]]){for(let k=-90;k<0;k+=2){const tt=(k+90)/90,yy2=B+yy+Math.sin(tt*Math.PI)*sag;P(c,x+5+k,yy2,2,1,'rgba(30,30,34,.7)');}}break;}
  case 'apt':{const h=74+h2(s,3)*20,col=['#e4ddd0','#cfd3d6','#d8cdb9'][(h2(s,4)*3)|0];P(c,x,B-h,w-3,h,col);for(let yy=B-h+6;yy<B-6;yy+=14){P(c,x+3,yy,w-9,8,'#9cb2c3');P(c,x+2,yy+8,w-7,3,shade(col,.8));for(let k=0;k<w-10;k+=6)P(c,x+4+k,yy+8,1,3,'#9a948a');}break;}
  case 'conbini':{P(c,x,B-34,w-4,34,'#f3f1ec');const cs=[['#2b8f4e','#1f5aa8'],['#1f5aa8','#e2552a'],['#e2552a','#2b8f4e']][(h2(s,3)*3)|0];P(c,x,B-34,w-4,4,cs[0]);P(c,x,B-30,w-4,2,cs[1]);
    P(c,x+4,B-24,w-12,20,'#a9c7da');for(let k=0;k<w-14;k+=8)P(c,x+4+k,B-24,1,20,'#e8ecef');P(c,x+w/2-6,B-24,10,24,'#7d9bb0');break;}
  case 'wall':P(c,x,B-12,w,12,'#b7b2a7');for(let k=0;k<w;k+=8)P(c,x+k,B-12,1,12,'#9f9a90');P(c,x,B-8,w,1,'#9f9a90');break;
  case 'pines':pineTree(c,x+w*0.35,B-6,56+h2(s,3)*20,s);if(w>48)pineTree(c,x+w*0.8,B-6,46+h2(s,4)*16,s+5);break;
  case 'hut':P(c,x+4,B-24,26,18,'#c2a37a');P(c,x+2,B-28,30,4,'#5a4a3a');break;
  case 'lamp':P(c,x+w/2,B-60,2,60,'#8a9098');P(c,x+w/2,B-60,9,2,'#8a9098');P(c,x+w/2+6,B-59,5,3,'#f3ebc2');break;
  case 'cedars':{const n=3;for(let k=0;k<n;k++)cedar(c,x+6+k*(w-10)/n+h2(s,k)*6,B-4+h2(s,k+5)*4,70+h2(s,k+9)*50,k%2?se.tree:shade(se.tree,.85),se.treeL);break;}
  case 'retain':{P(c,x,B-46,w,46,'#a4a39b');for(let yy=B-46;yy<B;yy+=10)P(c,x,yy,w,1,'#8d8c84');for(let k=0;k<w;k+=12)P(c,x+k,B-46,1,46,'#8d8c84');
    for(let k=0;k<w;k+=3)P(c,x+k,B-50+((k*7)%5),3,5,se.tree);if(env.snow)for(let k=0;k<w;k+=5)P(c,x+k,B-48,4,2,'#f2f4f6');break;}
  case 'mirror':P(c,x+5,B-48,2,48,'#e07b28');disc(c,x+6,B-52,5,'#e07b28');disc(c,x+6,B-52,3.5,'#cfe3ef');break;
  case 'rsign':P(c,x+3,B-40,2,40,'#8a9098');P(c,x+w-5,B-40,2,40,'#8a9098');P(c,x,B-58,w,20,'#1f5fb0');P(c,x+1,B-57,w-2,18,'#2a6fc4');signGlyphs(c,x+3,B-54,w-6,'#ffffff',s);signGlyphs(c,x+3,B-47,w-8,'#ffffff',s+3);break;
  case 'ryokan':{const h=58+h2(s,3)*14;P(c,x+2,B-h,w-6,h,'#7d5236');for(let k=0;k<w-8;k+=6)P(c,x+4+k,B-h,1,h,'#5d3a24');P(c,x,B-h/2-2,w-2,4,'#3a3d44');roofTiles(c,x-4,B-h-6,w+6,6,'#3a3d44');roofTiles(c,x+2,B-h-11,w-6,5,'#3a3d44');
    for(let k=0;k<w-14;k+=12){P(c,x+6+k,B-h+6,9,10,'#efe4c6');P(c,x+6+k,B-h/2+4,9,8,'#efe4c6');}for(let k=0;k<w-8;k+=10){disc(c,x+6+k,B-h/2+1,2,'#d0402e');P(c,x+5+k,B-h/2-1,2,1,'#222');}
    P(c,x+w/2-8,B-14,16,10,'#2a4a7a');for(let k=0;k<3;k++){c.globalAlpha=.32-k*.08;disc(c,x+w*0.7+Math.sin(t*1.2+k+s)*3,B-h-14-k*7-((t*6)%7),4+k,'#f4f4f4');c.globalAlpha=1;}break;}
  case 'souvenir':{P(c,x+2,B-40,w-6,40,'#d8c8a8');roofTiles(c,x-2,B-46,w+2,6,'#4b4f56');P(c,x+4,B-34,w-10,8,'#f6f2e6');signGlyphs(c,x+7,B-32,w-16,'#7a1f1a',s);P(c,x+4,B-24,w-10,24,'#6a4a32');
    for(let k=0;k<w-14;k+=5)P(c,x+6+k,B-20,3,6,['#e6c35a','#c94c3c','#f2e9d8','#7fa86a'][(h2(s,k)*4)|0]);for(let k=0;k<w-10;k+=8)disc(c,x+6+k,B-37,2,'#d0402e');break;}
  case 'lanternpost':P(c,x+5,B-30,3,30,'#5a3f2e');P(c,x+2,B-40,9,10,'#f1e3c0');P(c,x+2,B-40,9,1,'#3a2a20');P(c,x+2,B-31,9,1,'#3a2a20');break;
  case 'bigcedar':{const tx=x+w/2;P(c,tx-5,B-150,10,150,'#5e4232');P(c,tx-5,B-150,3,150,'#4a3326');for(let y=B-140;y<B;y+=9)P(c,tx-2,y,1,5,'#3e2b20');cap(c,tx-16,B-118,tx+18,B-128,7,se.tree);cap(c,tx-12,B-138,tx+14,B-146,6,shade(se.tree,.9));break;}
  case 'stonelantern':{const tx=x+w/2;P(c,tx-3,B-8,6,8,'#9a988f');P(c,tx-1,B-20,2,12,'#9a988f');P(c,tx-4,B-24,8,4,'#a8a69d');P(c,tx-3,B-28,6,4,'#b5b3aa');P(c,tx-5,B-30,10,2,'#8a887f');P(c,tx-1,B-33,2,3,'#8a887f');break;}
  case 'tsukiji':{const hx=x+10;P(c,x,B-54,w*0.62,54,'#284a2e');for(let k=0;k<w*0.62;k+=7)disc(c,x+k+3,B-55,4,'#2b5032');for(let k=0;k<70;k++)P(c,x+h2(s,k)*w*0.6,B-56+h2(s,k+80)*54,2,1,'#3a6440');P(c,x,B-58,w*0.62,2,'#1f3b25');
    P(c,hx+18,B-28,46,28,'#ece5d4');roofTiles(c,hx+14,B-36,54,8,'#454a52');roofTiles(c,hx+22,B-42,38,6,'#454a52');P(c,hx+24,B-20,10,8,'#7f95a9');P(c,hx+46,B-16,8,16,'#6b5640');break;}
  case 'farmhouse':{P(c,x+6,B-30,w-14,30,'#e4dccb');roofTiles(c,x+2,B-40,w-6,10,'#4a4f57');roofTiles(c,x+10,B-46,w-22,6,'#4a4f57');P(c,x+10,B-22,10,8,'#7f95a9');P(c,x+w-18,B-18,8,18,'#6b5640');break;}
  case 'hazakake':{for(const xx of [x+2,x+w-6])P(c,xx,B-30,2,30,'#6b4f2f');P(c,x+2,B-30,w-6,2,'#6b4f2f');P(c,x+3,B-28,w-8,14,'#d4b24c');for(let k=0;k<w-8;k+=2)P(c,x+3+k,B-15+(k%3),1,2,'#b8963a');break;}
  case 'kaki':tree(c,x,B,w,48,se,false);if(env.season!=='winter')for(let k=0;k<8;k++)disc(c,x+6+h2(s,k)*(w-12),B-40+h2(s,k+9)*18,1.2,'#e8822e');break;
  case 'shed':P(c,x+4,B-22,w-8,22,'#8a7a62');P(c,x+2,B-26,w-4,4,'#6a6f76');break;
  case 'factory':{P(c,x,B-52,w-4,52,'#a0a9b1');for(let k=0;k<w-4;k+=12){poly(c,[[x+k,B-52],[x+k+12,B-52],[x+k+12,B-62]],'#8c959e');}windows(c,x+4,B-44,w-12,10,6,4,3,2,'#c5d1da','#7e8a94',s);P(c,x+8,B-26,18,26,'#6d7780');P(c,x+30,B-24,w-40,2,'#c1c8ce');break;}
  case 'tank':{P(c,x+4,B-36,w-10,36,'#d2d7db');cap(c,x+4,B-36,x+w-6,B-36,4,'#d2d7db');P(c,x+4,B-22,w-10,1,'#b4bbc1');P(c,x+w-12,B-48,2,12,'#9aa2a8');break;}
  case 'pipes':for(let k=0;k<4;k++)P(c,x,B-14-k*7,w,3,['#b6bdc3','#c9a13a','#9aa2a8','#b6bdc3'][k]);for(let k=0;k<w;k+=14)P(c,x+k,B-40,2,40,'#80888f');break;
  case 'fencegap':break;
  case 'bigtree':{const tx=x+w/2;P(c,tx-4,B-40,8,40,'#4e3a2c');const g='#2c4f35';disc(c,tx,B-62,w*0.42,g);disc(c,tx-w*0.25,B-50,w*0.3,g);disc(c,tx+w*0.27,B-52,w*0.3,g);disc(c,tx-w*0.1,B-72,w*0.24,'#3b6845');break;}
  case 'shopfront':{P(c,x+2,B-34,w-6,34,'#7a5636');roofTiles(c,x-2,B-40,w+2,6,'#3b3f46');P(c,x+5,B-30,w-12,6,'#efe5cc');signGlyphs(c,x+8,B-29,w-18,'#4a2a1a',s);P(c,x+5,B-22,w-12,22,'#3c2a1f');P(c,x+w/2-6,B-18,10,10,'#2a4a7a');break;}
  case 'bench':P(c,x+4,B-8,16,2,'#7a5a3e');P(c,x+5,B-6,1,6,'#555');P(c,x+18,B-6,1,6,'#555');break;
  case 'birch':for(const dx of [4,14]){P(c,x+dx,B-70,3,70,'#efefe9');for(let y=B-66;y<B;y+=7)P(c,x+dx,y,2,1,'#2b2b2b');disc(c,x+dx+1,B-72,8,'#7cb35a');disc(c,x+dx+4,B-80,6,'#8fc46a');}break;
  case 'open':break;
  default:if(it.kind.startsWith('lm:'))drawLandmark(c,it.kind.slice(3),x,w,t,env);}}
function torii(c,x,base,h,w,col,top){const pw=Math.max(3,w*0.08);P(c,x,base-h,pw,h,col);P(c,x+w-pw,base-h,pw,h,col);P(c,x+pw*0.3,base-h,1,h,shade(col,1.15));
  P(c,x-w*0.06,base-h+h*0.16,w*1.12,Math.max(3,h*0.05),col);P(c,x-w*0.14,base-h-h*0.05,w*1.28,Math.max(3,h*0.06),top);P(c,x-w*0.1,base-h+h*0.01,w*1.2,Math.max(2,h*0.04),col);
  P(c,x-w*0.18,base-h-h*0.08,Math.max(2,w*0.06),Math.max(2,h*0.04),top);P(c,x+w*1.12,base-h-h*0.08,Math.max(2,w*0.06),Math.max(2,h*0.04),top);P(c,x+w/2-2,base-h+1,4,h*0.16,col);}
function drawLandmark(c,k,x,w,t,env){const B=Y_MIDB;
  switch(k){
  case 'toriiLake':torii(c,x+10,B+2,58,46,'#d6452f','#2a2a2a');c.globalAlpha=.3;P(c,x+10,B+2,4,8,'#d6452f');P(c,x+52,B+2,4,8,'#d6452f');c.globalAlpha=1;break;
  case 'ship':P(c,x+4,B-12,52,8,'#6e3424');P(c,x+10,B-20,40,8,'#ece4d2');P(c,x+16,B-26,26,6,'#d9cfb9');P(c,x+24,B-52,2,30,'#4a3326');P(c,x+38,B-44,2,22,'#4a3326');P(c,x+14,B-50,12,18,'#f3efe4');P(c,x+30,B-42,10,14,'#f3efe4');P(c,x+22,B-56,8,4,'#c0392b');break;
  case 'eboshi':P(c,x+10,B-30,10,22,'#34383c');P(c,x+6,B-18,20,10,'#34383c');P(c,x+13,B-36,4,6,'#34383c');break;
  case 'train':{P(c,x,B-70,w,5,'#a8382b');for(let k=0;k<w;k+=10){cap(c,x+k,B-65,x+k+5,B-40,0.8,'#a8382b');cap(c,x+k+10,B-65,x+k+5,B-40,0.8,'#a8382b');}P(c,x,B-40,w,2,'#a8382b');
    const tx=x+20+((t*6)%40);P(c,tx,B-90,60,20,'#c0392b');P(c,tx,B-80,60,2,'#f1f1f1');for(let k=0;k<5;k++)P(c,tx+4+k*11,B-87,7,6,'#cfe3ef');P(c,tx+28,B-96,1,6,'#333');P(c,tx+20,B-97,16,1,'#333');break;}
  case 'hotel':{P(c,x+6,B-64,w-12,64,'#efe9dc');for(let k=6;k<w-6;k+=10)P(c,x+k,B-64,2,64,'#6b4a33');P(c,x+6,B-34,w-12,2,'#6b4a33');
    roofTiles(c,x,B-72,w,8,'#4a3f3a');roofTiles(c,x+12,B-80,w-24,8,'#4a3f3a');roofTiles(c,x+w/2-20,B-88,40,8,'#4a3f3a');cap(c,x+w/2-18,B-90,x+w/2+18,B-90,2,'#4a3f3a');
    for(let k=10;k<w-14;k+=10){P(c,x+k,B-58,6,12,'#7f93a5');P(c,x+k,B-28,6,12,'#7f93a5');}break;}
  case 'resort':P(c,x,B-80,w-4,80,'#e8e4da');P(c,x,B-82,w-4,3,'#9a9690');windows(c,x+4,B-76,w-12,68,4,5,3,4,'#7f93a5','#55697a',77);break;
  case 'sign874':{P(c,x+6,B-56,3,56,'#8a9098');P(c,x+w-9,B-56,3,56,'#8a9098');P(c,x,B-84,w,30,'#1d58a8');P(c,x+2,B-82,w-4,26,'#2a6cc4');
    P(c,x+5,B-78,12,1,'#fff');P(c,x+5,B-74,8,1,'#fff');P(c,x+5,B-70,14,1,'#fff');P(c,x+22,B-79,2,9,'#fff');P(c,x+26,B-79,6,1,'#fff');P(c,x+26,B-75,6,1,'#fff');P(c,x+26,B-71,6,1,'#fff');P(c,x+5,B-64,w-10,1,'#fff');break;}
  case 'toriiWood':torii(c,x+18,B+2,96,74,'#7a5a3e','#4c3826');break;
  case 'toriiBig':torii(c,x+20,B+4,150,110,'#dcd8cf','#bdb8ad');break;
  case 'uji':{P(c,x+10,B-12,w-20,5,'#a07a52');for(let k=10;k<w-10;k+=8)P(c,x+k,B-24,2,12,'#8a6644');P(c,x+10,B-24,w-20,2,'#8a6644');torii(c,x,B-8,70,40,'#b58c62','#7a5a3e');torii(c,x+w-44,B-8,70,40,'#b58c62','#7a5a3e');break;}
  case 'dome':for(let dx=0;dx<w;dx++){const u=(dx/w)*2-1,h=Math.sqrt(Math.max(0,1-u*u))*90;P(c,x+dx,B-h,1,h,(dx%14===0)?'#c4bca9':'#f2efe8');if(dx%14===1)P(c,x+dx,B-h,1,h,'#e6e1d6');}P(c,x,B-4,w,4,'#c9c3b4');break;
  case 'rokugo':for(let dx=0;dx<w;dx+=1){const u=(dx/w)*2-1,y=B-6-80*(1-u*u);P(c,x+dx,y,1,3,'#5d8db3');if(dx%12===0)P(c,x+dx,y,1,B-6-y,'#6e9cc0');}P(c,x,B-8,w,3,'#5d8db3');break;}}

/* ---------- crowd plane (px per m = 20.4) ---------- */
const CPPM=KPX*S_CROWD;
function genCrowd(ctx){const r=h2(ctx.n,61),seed=(ctx.n*104729)|0;const d=ctx.dens;
  if(d<=0)return{kind:'none',w:1.2,seed};
  if(r<0.05&&d>0.3)return{kind:'staff',w:0.9,seed,th:ctx.th};
  if(r<0.07&&d>0.3)return{kind:'police',w:0.9,seed,th:ctx.th};
  if(r<0.11&&d>0.5)return{kind:'banner',w:2.6,seed,th:ctx.th,team:ctx.teams[(h2(seed,3)*ctx.teams.length)|0]};
  if(r<0.13&&d>0.4)return{kind:'nobori',w:0.7,seed,th:ctx.th,team:ctx.teams[(h2(seed,4)*ctx.teams.length)|0]};
  if(h2(ctx.n,62)>d)return{kind:'none',w:0.5+h2(seed,5)*1.5,seed,th:ctx.th};
  return{kind:h2(seed,6)<.12?'kid':'person',w:0.52+h2(seed,7)*0.2,seed,th:ctx.th,back:h2(seed,8)<d*0.85};}
function spectator(c,x,feet,s,seed,t,kid,flagCols,dim){const S=(kid?0.72:1)*(0.94+h2(seed,1)*0.1)*s*1.02;const H=34*S,cx=x;
  const coat=PPL[(h2(seed,2)*PPL.length)|0],pants=h2(seed,3)<.6?'#2a2d36':'#3b4a66',skin=SKIN[(h2(seed,4)*4)|0][0];
  const c1=dim?mix(coat,'#7a8796',.35):coat;
  P(c,cx-3*S,feet-H*0.42,2.4*S,H*0.42,pants);P(c,cx+0.8*S,feet-H*0.42,2.4*S,H*0.42,pants);
  P(c,cx-4.5*S,feet-H*0.8,9*S,H*0.42,c1);P(c,cx-4.5*S,feet-H*0.8,1,H*0.42,shade(c1,.8));
  if(h2(seed,5)<.4)P(c,cx-3.5*S,feet-H*0.8,7*S,2*S,['#c33','#e8e4da','#2f4f8f','#d9a03a'][(h2(seed,6)*4)|0]);
  const hy=feet-H*0.94;disc(c,cx,hy,3*S,skin);const hat=h2(seed,7);
  if(hat<.35){cap(c,cx-3*S,hy-1.5*S,cx+3*S,hy-1.5*S,2.2*S,['#b8322a','#2b3550','#e8e4da','#4a5a3a','#d48a2a'][(h2(seed,8)*5)|0]);}else{cap(c,cx-2.6*S,hy-2*S,cx+2.6*S,hy-2*S,1.6*S,HAIRC[(h2(seed,9)*6)|0]);}
  const act=h2(seed,10),ph=t*(5+h2(seed,11)*3)+seed;
  if(act<.45){const up=Math.sin(ph)>0?1:0;const hx=cx+4.5*S,hy2=feet-H*(0.95+up*0.12);cap(c,cx+4*S,feet-H*0.74,hx,hy2,1.1*S,c1);
    P(c,hx,hy2-9*S,1,10*S,'#d8d8d8');const fc=flagCols[(h2(seed,12)*flagCols.length)|0];P(c,hx+1,hy2-9*S+(up?0:1),7*S,5*S,'#f4f4f0');P(c,hx+1,hy2-9*S+(up?0:1),7*S,1.6*S,fc);
    cap(c,cx-4*S,feet-H*0.74,cx-5*S,feet-H*0.5,1.1*S,c1);}
  else if(act<.7){const k=Math.sin(ph*1.6)>0?1.5:3.5;cap(c,cx-4*S,feet-H*0.74,cx-k*S*0.4,feet-H*0.62,1.1*S,c1);cap(c,cx+4*S,feet-H*0.74,cx+k*S*0.4,feet-H*0.62,1.1*S,c1);}
  else{cap(c,cx-4*S,feet-H*0.74,cx-5*S,feet-H*0.48,1.1*S,c1);cap(c,cx+4*S,feet-H*0.74,cx+5*S,feet-H*0.48,1.1*S,c1);}}
function drawCrowdItem(c,it,x,feet,t,env){const s=1;
  switch(it.kind){
  case 'person':case 'kid':if(it.back)spectator(c,x+5,feet-5,0.86,it.seed+7,t,false,env.flags,true);spectator(c,x+5,feet,1,it.seed,t,it.kind==='kid',env.flags,false);break;
  case 'staff':{const S=1;P(c,x+3,feet-14,2,14,'#2a2d36');P(c,x+7,feet-14,2,14,'#2a2d36');P(c,x+1,feet-28,11,15,'#f2b01e');P(c,x+1,feet-22,11,2,'#e6e6e6');disc(c,x+6,feet-31,3,SKIN[1][0]);cap(c,x+3,feet-34,x+9,feet-34,1.8,'#2b3550');break;}
  case 'police':{P(c,x+3,feet-14,2,14,'#1d2438');P(c,x+7,feet-14,2,14,'#1d2438');P(c,x+1,feet-28,11,15,'#22305a');P(c,x+5,feet-26,2,2,'#d8b74a');disc(c,x+6,feet-31,3,SKIN[0][0]);P(c,x+2,feet-36,9,3,'#1d2438');P(c,x+5,feet-36,3,1,'#d8b74a');break;}
  case 'banner':{for(let k=0;k<3;k++)spectator(c,x+6+k*18,feet,1,it.seed+k*13,t,false,env.flags,false);const kit=it.team?teamKit(it.team):{base:'#b8322a'};
    P(c,x+1,feet-30,52,13,kit.base);P(c,x+1,feet-30,52,1,shade(kit.base,1.25));signGlyphs(c,x+5,feet-27,44,'#ffffff',it.seed);break;}
  case 'nobori':{const kit=it.team?teamKit(it.team):{base:'#b8322a',sec:'#fff'};P(c,x+4,feet-62,2,62,'#c9c9c9');P(c,x+6,feet-60,9,40,kit.base);P(c,x+6,feet-60,9,2,kit.sec||'#fff');for(let y=feet-55;y<feet-24;y+=6)P(c,x+8,y,5,3,'#ffffff');break;}}}

/* ---------- vehicles (drawn at px/m = K) ---------- */
function drawBike(c,x,y,K,t){const s=K/24;cap(c,x-16*s,y-5*s,x-16*s,y-5*s,5*s,'#1b1b1f');cap(c,x+18*s,y-5*s,x+18*s,y-5*s,5*s,'#1b1b1f');disc(c,x-16*s,y-5*s,2*s,'#9a9aa0');disc(c,x+18*s,y-5*s,2*s,'#9a9aa0');
  poly(c,[[x-20*s,y-12*s],[x+20*s,y-12*s],[x+24*s,y-20*s],[x+8*s,y-24*s],[x-14*s,y-20*s]],'#f4f4f4');P(c,x-8*s,y-16*s,20*s,2*s,'#1f4fa3');P(c,x+16*s,y-30*s,4*s,8*s,'#cfe3ef');
  P(c,x-4*s,y-40*s,10*s,18*s,'#1f2f63');disc(c,x+1*s,y-44*s,4.2*s,'#f4f4f4');P(c,x+3*s,y-45*s,3*s,2*s,'#222');cap(c,x+4*s,y-34*s,x+14*s,y-26*s,1.4*s,'#1f2f63');
  P(c,x-12*s,y-28*s,3*s,5*s,(t*4|0)%2?'#ff3b30':'#7a1a16');}
function drawCar(c,x,y,K,flag){const s=K/24;poly(c,[[x,y-10*s],[x+108*s,y-10*s],[x+108*s,y-26*s],[x+82*s,y-30*s],[x+66*s,y-46*s],[x+28*s,y-46*s],[x+16*s,y-30*s],[x,y-28*s]],'#f2f2f0');
  P(c,x+30*s,y-43*s,16*s,12*s,'#2c3e56');P(c,x+50*s,y-43*s,16*s,12*s,'#2c3e56');P(c,x,y-20*s,108*s,2*s,'#c9ccd0');P(c,x+104*s,y-24*s,4*s,4*s,'#ffe9a8');
  for(const wx of [22,86]){disc(c,x+wx*s,y-9*s,8*s,'#1a1a1d');disc(c,x+wx*s,y-9*s,4*s,'#a3a7ad');}
  P(c,x+36*s,y-52*s,28*s,6*s,'#ffffff');P(c,x+36*s,y-52*s,28*s,1,'#888');P(c,x+38*s,y-50*s,24*s,1,'#c0392b');
  if(flag){P(c,x+96*s,y-60*s,1.5*s,30*s,'#cfcfcf');P(c,x+97*s,y-60*s,14*s,9*s,flag);}}

/* ---------- broadcast scene state ---------- */
class Broadcast{
  constructor(canvas){this.cv=canvas;this.c=canvas.getContext('2d');this.c.imageSmoothingEnabled=false;this.cam=0;this.t=0;
    this.mid={items:[],end:null,n:0};this.crowd={items:[],end:null,n:0};this.fg={items:[],end:null,n:0};
    this.st=new Map();this.puffs=[];this.ghost=null;this.farA=null;this.farB=null;this.fade=1;this.usedLm=new Set();this.targetKey=null;this.cx=CXR;this.flash=0;this.lastTh=null;}
  reset(){this.mid={items:[],end:null,n:0};this.crowd={items:[],end:null,n:0};this.fg={items:[],end:null,n:0};this.st.clear();this.puffs=[];this.ghost=null;this.usedLm.clear();}
  strip(S,s,gen,ctx){const ppm=KPX*s,left=this.cam-(this.cx+80)/ppm,right=this.cam+(VW-this.cx+80)/ppm;if(S.end==null||S.end<left-50)S.end=left;
    let g=0;while(S.end<right&&g++<300){ctx.n=++S.n;ctx.u=S.end;ctx.ux=this.cx+(S.end-this.cam)*ppm;const it=gen(ctx);it.u=S.end;S.end+=it.w;S.items.push(it);}
    if(S.items.length>400||S.items[0]&&S.items[0].u+S.items[0].w<left)S.items=S.items.filter(it=>it.u+it.w>left);}
  /* info: {sec,km,v,grade,w,hour,season,fuji,izumo,teams,temp,remain,runners:[{key,team,runner,gap,v,me,lane,target}],gates:[{gap,type,waiting:[{team,runner,me}]}],vehicles:[{k,gap,flag}],dt,targetKey,handoff}*/
  frame(info){const c=this.c,dt=Math.min(0.1,info.dt||0.016);this.t+=dt;const t=this.t;
    if(info.targetKey!==this.targetKey){if(this.targetKey&&info.handoff&&this.lastTarget){const L=this.lastTarget;this.ghost={x:this.cx,lane:L.lane,team:L.team,runner:L.runner,age:0};}
      else if(!info.handoff){this.reset();}this.targetKey=info.targetKey;}
    const v=Math.max(0,info.v||0);this.cam+=v*dt;
    const sec=info.sec,z=zoneAt(sec,info.km),th=THEME[z.th]?z.th:'suburb';
    const cxT=info.remain!=null&&info.remain<40?lerp(CXR,64,(40-info.remain)/40):CXR;this.cx+=(cxT-this.cx)*Math.min(1,dt*3);const CX=this.cx;
    if(this.lastTh&&this.lastTh!==th){this.mid={items:[],end:null,n:this.mid.n};this.crowd={items:[],end:null,n:this.crowd.n};this.flash=0.22;}
    this.lastTh=th;
    const se=SEAS[info.season]||SEAS.winter;
    const snow=info.w.sky==='雪'||(info.temp<=1&&(th==='mountain'||th==='lake'));
    const env={se,season:info.season,w:info.w,hour:info.hour,fuji:info.fuji&&(th==='coast'||th==='lake'||(th==='mountain'&&info.km>11)),enoshima:info.fuji&&th==='coast'&&/湘南/.test(z.place)&&info.km<15&&sec.name==='3区',cam:this.cam,flags:info.flagCols,sky:skyCols(info.w,info.hour).h,snow};
    // landmarks: inject when the sim position approaches
    for(const lm of sec.lm||[]){const key=sec.name+lm.k+lm.km;if(!this.usedLm.has(key)&&info.km>=lm.km-0.30&&info.km<=lm.km+0.05){this.usedLm.add(key);this.pendLm=lm;
      const keep=this.mid.items.filter(it=>CX+(it.u-this.cam)*KPX*S_MID<VW*0.45);this.mid.items=keep;this.mid.end=keep.length?keep[keep.length-1].u+keep[keep.length-1].w:null;}}
    const midCtx={th,izumo:info.izumo,lm:null};if(this.pendLm){midCtx.lm=this.pendLm;}
    const before=this.mid.n;this.strip(this.mid,S_MID,genMid,midCtx);if(this.pendLm&&this.mid.n>before&&!midCtx.lm)this.pendLm=null;
    const relayDense=info.remain!=null&&info.remain<500||info.km<0.4;
    this.strip(this.crowd,S_CROWD,genCrowd,{th,dens:(THEME[th].crowd)*(relayDense?1.3:1)*(info.crowdMul??1),teams:info.teams||[]});
    // far crossfade
    const farK=THEME[th].far;if(this.farB!==farK){this.farA=this.farB;this.farB=farK;this.fade=this.farA?0:1;}this.fade=Math.min(1,this.fade+dt*0.8);
    drawSky(c,info.w,t,info.hour,this.cam);
    if(this.farA&&this.fade<1){drawFar(c,this.farA,this.cam,t,env);c.globalAlpha=this.fade;drawFar(c,this.farB,this.cam,t,env);c.globalAlpha=1;}else drawFar(c,this.farB,this.cam,t,env);
    for(const it of this.mid.items){const x=CX+(it.u-this.cam)*KPX*S_MID;if(x>VW+10||x+it.w*MPPM<-10)continue;drawMid(c,it,x,t,env);}
    // slope (exaggerated slightly so the climb reads on screen)
    const g=(info.grade||0)*1.4,off=(x,s)=>-g*(x-CX)*s;
    // near ground + crowd
    for(let x=0;x<VW;x+=4){const oo=off(x,S_CROWD);const nt=THEME[th].near;const col=nt==='pave'?'#b3ada3':nt==='sand'?'#d3c39a':nt==='deck'?'#a3a19b':nt==='infield'?'#6fa84f':se.grass;
      P(c,x,Y_MIDB+oo-2,4,Y_ROAD0-Y_MIDB+2+Math.abs(g)*VW,col);if(snow&&nt==='verge')P(c,x,Y_MIDB+oo-2+((x*7)%5),4,3,'#eef1f4');}
    const cr=this.crowd.items.filter(it=>it.kind!=='none').map(it=>({it,x:CX+(it.u-this.cam)*CPPM})).filter(o=>o.x>-60&&o.x<VW+20);
    for(const o of cr)drawCrowdItem(c,o.it,o.x,Y_CROWD+off(o.x+5,S_CROWD),t,env);
    // curb / barrier
    const curb=THEME[th].curb;
    for(let x=0;x<VW;x+=2){const y=Y_ROAD0+off(x,1);
      if(curb==='guard'){P(c,x,y-12,2,5,'#d3d8dc');P(c,x,y-10,2,1,'#aab0b6');}
      else if(curb==='wall')P(c,x,y-7,2,7,'#a9a69c');
      else if(curb==='rail'){P(c,x,y-16,2,2,'#dadada');P(c,x,y-9,2,1,'#c4c4c4');}
      else if(curb==='mesh'){if(x%4===0)P(c,x,y-22,1,22,'rgba(110,120,130,.45)');P(c,x,y-22,2,1,'#8a949c');}
      P(c,x,y-2,2,2,'#c9c6bf');}
    if(curb==='guard'||curb==='rail'){const step=curb==='guard'?48:36,o2=((this.cam*KPX)%step+step)%step;for(let x=-o2;x<VW;x+=step){const y=Y_ROAD0+off(x,1);P(c,x,y-(curb==='guard'?12:16),2,curb==='guard'?12:16,'#9aa1a7');}}
    // road
    const wet=info.w.sky==='雨'||info.w.sky==='雪';
    for(let x=0;x<VW;x+=2){const oo=off(x,1);P(c,x,Y_ROAD0+oo,2,Y_ROAD1-Y_ROAD0,info.track?'#b8553e':wet?'#4a4e55':'#5a5e65');P(c,x,Y_ROAD0+oo,2,1,'#7b8088');
      P(c,x,Y_ROAD1+oo,2,VH-Y_ROAD1+Math.abs(g)*VW,info.track?'#6fa84f':THEME[th].near==='pave'?'#b3ada3':se.grass);P(c,x,Y_ROAD1+oo,2,2,'#c9c6bf');}
    if(info.track){for(let y=Y_ROAD0+8;y<Y_ROAD1;y+=8)for(let x=0;x<VW;x+=2)P(c,x,y+off(x,1),2,1,'#f2e9e4');}
    else{const wp=this.cam*KPX;for(let x=0;x<VW;x+=2){const oo=off(x,1);P(c,x,Y_ROAD0+3+oo,2,1,'#e6e6e6');P(c,x,Y_ROAD1-4+oo,2,1,'#e6e6e6');
        const wx=Math.floor((wp+x-CX)/2);if(((wx*2)%240+240)%240<120)P(c,x,((Y_ROAD0+Y_ROAD1)/2|0)+oo,2,2,'#ece6c8');}
      for(let i=0;i<140;i++){const wx=Math.floor(wp/6)*6+i*13;const sx=CX+(wx-wp)-150+((h2(i,91)*20)|0);const xx=((sx%VW)+VW)%VW;P(c,xx,Y_ROAD0+6+h2(Math.floor((wp+xx)/9),92)*(Y_ROAD1-Y_ROAD0-10)+off(xx,1),1,1,h2(i,93)<.5?'#4c5057':'#6a6e75');}
      if(wet)for(let i=0;i<30;i++){const xx=((h2(i,94)*VW*3-this.cam*KPX)%VW+VW)%VW;P(c,xx,Y_ROAD0+10+h2(i,95)*40+off(xx,1),6+h2(i,96)*10,1,'#6e7680');}}
    // gates (back part)
    const gx=gt=>CX+gt.gap*KPX;
    for(const gt of info.gates||[]){const x=gx(gt);if(x<-80||x>VW+80)continue;const col=gt.type==='relay'?'#b8322a':'#1d4c9c';const yb=Y_ROAD0+off(x,1);
      P(c,x-30,yb-74,3,74,'#d0d0d0');P(c,x+30,yb-74,3,74,'#d0d0d0');P(c,x-34,yb-90,70,18,col);P(c,x-34,yb-90,70,2,shade(col,1.3));P(c,x-34,yb-73,70,1,shade(col,.7));signGlyphs(c,x-28,yb-85,58,'#ffffff',gt.type.length*7);
      for(let k=0;k<Y_ROAD1-Y_ROAD0;k+=1)P(c,x-1+k*0.1,yb+k,3,1,'#f4f4f4');}
    // actors
    const items=[];
    for(const gt of info.gates||[]){const x=gx(gt);if(!gt.waiting||x<-60||x>VW+60)continue;gt.waiting.forEach((wr,k)=>{const lane=LANE_Y[(k*2+1)%5],sx=x+20+k*24;items.push({y:lane,f:()=>{const K=KPX*laneScale(lane);drawAthlete(c,sx,lane+off(sx,1),K,standPose(t+k,'stand'),teamKit(wr.team),athleteLook(wr.runner),{me:wr.me,t});}});});}
    if(this.ghost){const G=this.ghost;G.age+=dt;G.x-=v*dt*KPX;if(G.x<-60||G.age>8)this.ghost=null;else{const lane=LANE_Y[G.lane%5];items.push({y:lane,f:()=>drawAthlete(c,G.x,lane+off(G.x,1),KPX*laneScale(lane),standPose(t,'bent'),teamKit(G.team),athleteLook(G.runner),{})});}}
    for(const vh of info.vehicles||[]){const x=CX+vh.gap*KPX;const lane=vh.k==='car'?LANE_Y[0]-4:LANE_Y[0]-2;if(x<-140||x>VW+60)continue;
      items.push({y:lane-10,f:()=>{if(vh.k==='car')drawCar(c,x,lane+off(x+50,1),KPX*laneScale(lane),vh.flag);else drawBike(c,x,lane+off(x,1),KPX*laneScale(lane),t);}});}
    const seen=new Set();
    for(const R of info.runners){seen.add(R.key);let st=this.st.get(R.key);if(!st){st={ph:h2(R.runner.id,5),x:R.gap,step:0};this.st.set(R.key,st);}
      const look=athleteLook(R.runner),gp=gaitParams(R.v,R.grade,look);st.ph=(st.ph+dt*gp.cad/2)%1;
      const diff=R.gap-st.x;if(Math.abs(diff)>25)st.x=R.gap;else{const mx=2.2*dt;st.x+=Math.max(-mx,Math.min(mx,diff));}
      if(R.target)st.x=0;
      const lane=LANE_Y[R.lane%5],K=KPX*laneScale(lane),sx=CX+st.x*KPX;if(sx<-40||sx>VW+40)continue;
      const stepNo=Math.floor(st.ph*2);
      items.push({y:lane,f:()=>{const m=drawAthlete(c,sx,lane+off(sx,1),K,runPose(st.ph,gp),teamKit(R.team),look,{me:R.me,t});
        if(info.temp<=4&&stepNo!==st.step){this.puffs.push({x:m.mouth[0]+1,y:m.mouth[1],a:0});}st.step=stepNo;}});
      if(R.target)this.lastTarget={lane:R.lane,team:R.team,runner:R.runner};}
    for(const k of [...this.st.keys()])if(!seen.has(k))this.st.delete(k);
    items.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
    // breath
    for(const p of this.puffs){p.a+=dt;p.x-=dt*(v*KPX*0.6+6);p.y-=dt*3;}
    this.puffs=this.puffs.filter(p=>p.a<0.8);for(const p of this.puffs){c.globalAlpha=0.45*(1-p.a/0.8);disc(c,p.x+p.a*4,p.y,1.2+p.a*3,'#f4f7fa');}c.globalAlpha=1;
    // gate front post
    for(const gt of info.gates||[]){const x=gx(gt);if(x<-80||x>VW+80)continue;P(c,x+12,Y_ROAD1+off(x,1)-96,4,96+12,'#dcdcdc');P(c,x+12,Y_ROAD1+off(x,1)-96,1,96,'#f4f4f4');}
    // weather
    if(info.w.sky==='雨'){c.globalAlpha=.5;for(let i=0;i<110;i++){const x=((h2(i,81)*VW*1.3+t*(60+info.w.wind*40)-this.cam*KPX*0.3)%(VW*1.3)+VW*1.3)%(VW*1.3)-30,y=((h2(i,82)*VH+t*320+i*5)%(VH+12))-6;cap(c,x,y,x-1.5-info.w.wind,y+6,0.5,'#dce7f1');}c.globalAlpha=1;}
    if(info.w.sky==='雪'){for(let i=0;i<120;i++){const x=((h2(i,83)*VW-this.cam*KPX*0.5+t*(8+info.w.wind*14)+Math.sin(t+i)*5)%VW+VW)%VW,y=(h2(i,84)*VH+t*28+i*3)%VH;P(c,x,y,h2(i,85)<.3?2:1,h2(i,85)<.3?2:1,'#ffffff');}}
    if(info.w.sky!=='晴れ'){c.globalAlpha=info.w.sky==='曇り'?.07:.13;P(c,0,0,VW,VH,'#2d3a48');c.globalAlpha=1;}
    if(this.flash>0){this.flash-=dt;c.globalAlpha=Math.max(0,this.flash/0.22)*0.85;P(c,0,0,VW,VH,'#0b0f16');c.globalAlpha=1;}
    if(info.hour<9.3){c.globalAlpha=0.07*(9.3-Math.max(7.5,info.hour));P(c,0,0,VW,VH,'#ffb35c');c.globalAlpha=1;}
    return z;}
}
/* static portrait */
function drawPortrait(c,r,team){c.clearRect(0,0,c.canvas.width,c.canvas.height);const K=c.canvas.height/2.05;drawAthlete(c,c.canvas.width*0.45,c.canvas.height-3,K,standPose(0.3,'stand'),teamKit(team),athleteLook(r),{noShadow:false,shadowW:0.5});}
/* ===== UI ===== */
const app=document.getElementById('app');
const ui={slowRelay:true,tab:'home',sort:'ovr',dir:-1,player:null,recTab:'hakone',resTab:'total',entry:null,live:null,speed:120,
  pol:'balance',load:'mid',scoutSel:[],ng:{name:'',color:0,diff:'chuken'},confirmReset:false,msg:''};

function condMark(c){return c>0.4?'◎':c>0?'○':c>-0.4?'△':'×';}
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n);}
function monthLabel(){if(S.stage==='yearEnd'||S.stage==='scout')return '1月';return `${S.month>12?1:S.month}/${S.day||1}`;}
function evName(key){return key==='yosen'?'予選会':COURSES[EVENT_INFO[key].course].name;}
function wText(w){return `${w.sky}・${w.temp}℃・風${WIND_LABEL[w.wind]}`;}
function dayName(c,d){return c.days[d].name||'';}
function secWeather(ev,c,gi){return ev.weather[c.days.findIndex(d=>d.secs.includes(gi))];}
function dot(color){return `<i class="dot" style="background:${color}"></i>`;}
function pos(n){return `<span class="pos ${n<=3?'p'+n:''}">${n}</span>`;}

function go(tab){ui.tab=tab;ui.player=null;render(true);}
function render(top){
  if(ui.live&&!(S&&S.stage==='event'&&S.ev&&S.ev.phase==='live'&&ui.tab==='home'))stopLive();
  if(!S){app.innerHTML=ui.newgame?newGameScreen():titleScreen();if(top)scrollTo(0,0);startAnims();return;}
  document.documentElement.style.setProperty('--team',userTeam().color);
  if(S.stage==='event'&&S.ev&&S.ev.phase==='live'&&ui.tab==='home'){renderLive();if(top)scrollTo(0,0);return;}
  let body='';
  if(ui.tab==='home')body=stageScreen();
  else if(ui.tab==='roster')body=ui.player?playerScreen():rosterScreen();
  else if(ui.tab==='records')body=recordsScreen();
  else body=settingsScreen();
  app.innerHTML=headerBar()+body+navBar();
  if(top)scrollTo(0,0);startAnims();
}
function headerBar(){const u=userTeam();
  return `<header class="top"><div class="tl"><span class="swatch" style="background:${u.color}"></span><b>${esc(u.name)}</b></div>
  <div class="tr"><span>${S.year}年目<b>${monthLabel()}</b></span><span>評判 ${repLabel(u.rep)}<b>${Math.round(u.rep)}</b></span></div></header>`;}
function navBar(){const t=[['home','ホーム'],['roster','選手'],['records','記録'],['settings','設定']];
  return `<nav class="nav">${t.map(([k,n])=>`<button class="${ui.tab===k?'on':''}" data-a="tab" data-k="${k}">${n}</button>`).join('')}</nav>`;}

/* ----- title / new game ----- */
function titleScreen(){const has=!!loadSave();
  return `<div class="title"><div class="stage tstage"><canvas id="titlecv" data-anim="title" width="${VW}" height="${VH}"></canvas></div>
  <div class="logo"><div class="mark">駅伝監督</div><div class="kicker">大学駅伝シミュレーション</div></div>
  <div class="stack">${has?'<button class="btn primary" data-a="continue">つづきから</button>':''}
  ${cloudReady()?`<button class="btn ${has?'':'primary'}" data-a="cloudContinue" ${ui.cloudBusy?'disabled':''}>クラウドから続き</button>`:''}
  <button class="btn ${has||cloudReady()?'':'primary'}" data-a="newgame">はじめから</button>${ui.msg?`<p class="small bad">${esc(ui.msg)}</p>`:''}</div></div>`;}
function newGameScreen(){const g=ui.ng;
  return `<div class="pad"><h2>新しいチーム</h2>
  <section class="card"><label class="lbl">大学名</label><input id="ngname" class="inp" maxlength="10" placeholder="例：府中工科大" value="${esc(g.name)}">
  <label class="lbl">チームカラー</label><div class="swatches">${TEAM_COLORS.map((c,i)=>`<button class="sw ${g.color===i?'on':''}" data-a="ngcolor" data-i="${i}" style="background:${c.c}" aria-label="${c.n}"></button>`).join('')}</div>
  <label class="lbl">スタート時の立場</label><div class="opts">${Object.entries(DIFFS).map(([k,d])=>`<button class="opt ${g.diff===k?'on':''}" data-a="ngdiff" data-k="${k}"><b>${d.name}</b><span>${d.desc}</span></button>`).join('')}</div></section>
  <div class="row2"><button class="btn" data-a="ngback">戻る</button><button class="btn primary" data-a="ngstart">監督に就任する</button></div>
  ${ui.msg?`<p class="err">${ui.msg}</p>`:''}</div>`;}

/* ----- stage router ----- */
function stageScreen(){
  if(S.stage==='month')return trainingScreen();
  if(S.stage==='yearEnd')return yearEndScreen();
  if(S.stage==='scout')return scoutScreen();
  if(S.stage==='event'){const p=S.ev.phase;
    if(p==='yosen')return yosenScreen();if(p==='entry')return entryScreen();
    if(p==='dayResult')return resultScreen(false);if(p==='final')return resultScreen(true);}
  return '';
}

/* ----- training ----- */
function scheduleRows(){const u=userTeam(),seed=S.seeds.includes(u.id),m=S.month;const rows=[];
  const st=(key,month)=>{const v=S.cur[key];if(v!==undefined)return v==null?'不出場':`${v}位`;return null;};
  const yz=S.cur.yosen;
  rows.push(['10/12','秋季大学駅伝',st('izumo')??(fieldFor('izumo').includes(u.id)?'出場予定':'出場権なし')]);
  rows.push(['10/18','予選会',seed?'シード校のため免除':(yz!==undefined?(yz==null?'—':`${yz}位${yz<=10?'（本戦へ）':'（敗退）'}`):'上位10校が新春大学駅伝へ')]);
  rows.push(['11/2','全国大学駅伝',st('zennihon')??(fieldFor('zennihon').includes(u.id)?'出場予定':'出場権なし')]);
  rows.push(['1/2・3','新春大学駅伝',S.cur.hakone!==undefined?(S.cur.hakone==null?'不出場':`${S.cur.hakone}位`):(seed?'シード校':(S.field?(S.field.includes(u.id)?'出場決定':'出場権なし'):'予選会突破が必要'))]);
  return rows;}
function rkChip(l,up){return `<span class="rkc rk${l[0]} ${up?'up':''}">${l}</span>`;}
function growthCard(){const u=userTeam(),runs=ui.lastRun||(S.dayLog&&S.dayLog.length?[S.dayLog[0]]:[]);
  if(!runs.length)return `<section class="card"><h2>成長した部員</h2><p class="sub small">練習を進めると、能力ランクが上がった部員がここに出ます。</p></section>`;
  let rows='',nUp=0;
  for(const rp of runs){const lines=[];
    for(const x of rp.ups){const r=runnerIn(u,x.id);if(!r)continue;nUp++;lines.push(`<div class="uprow"><span class="nm">${esc(r.name)} <small>${r.grade}年</small></span><span class="st">${STAT_LABEL[x.k]}</span><span class="ch">${rkChip(x.from)}<i>→</i>${rkChip(x.to,true)}</span></div>`);}
    for(const x of rp.traits){const r=runnerIn(u,x.id);if(r){nUp++;lines.push(`<div class="uprow"><span class="nm">${esc(r.name)} <small>${r.grade}年</small></span><span class="st tr">${esc(x.txt)}</span></div>`);}}
    for(const id of rp.inj){const r=runnerIn(u,id);if(r)lines.push(`<div class="uprow bad"><span class="nm">${esc(r.name)}</span><span class="st">故障（全治${r.inj}日）</span></div>`);}
    for(const id of rp.back){const r=runnerIn(u,id);if(r)lines.push(`<div class="uprow"><span class="nm">${esc(r.name)}</span><span class="st">練習に復帰</span></div>`);}
    if(lines.length)rows+=`${runs.length>1?`<div class="update">${esc(rp.label)}</div>`:''}${lines.join('')}`;}
  const lab=runs.length>1?`${esc(runs[runs.length-1].label)}〜${esc(runs[0].label)}`:esc(runs[0].label);
  return `<section class="card growth"><h2>成長した部員</h2><p class="sub small">${lab}${runs.some(r=>r.camp)?'　夏合宿':''}</p>${rows||'<p class="sub">能力ランクの上がった部員はいませんでした</p>'}</section>`;}
function menuCard(){const u=userTeam();const list=u.runners.slice().sort((a,b)=>b.grade-a.grade||ovr(b)-ovr(a));
  return `<section class="card"><div class="h-row"><h2>練習メニュー</h2><select class="bulk" data-ch="menuAll" aria-label="全員のメニューをまとめて変更"><option value="">全員まとめて…</option>${Object.entries(MENUS).map(([k,m])=>`<option value="${k}">${m.name}</option>`).join('')}</select></div>
  <div class="mtable">${list.map(r=>`<div class="mrow ${r.inj?'injr':''}"><button class="mname" data-a="player" data-k="${r.id}"><b>${esc(r.name)}</b><small>${r.grade}年${r.inj?` <span class="bad">故障 残り${r.inj}日</span>`:''}</small></button>
    <span class="mst">${STAT_KEYS.map(k=>`<i class="rk${rankOf(r[k])[0]}">${rankOf(r[k])}</i>`).join('')}</span><span class="mfat ${r.fat>70?'bad':''}">${Math.round(r.fat)}</span>
    <select data-ch="menu" data-i="${r.id}" ${r.inj?'disabled':''}>${Object.entries(MENUS).map(([k,m])=>`<option value="${k}" ${r.focus===k?'selected':''}>${m.name}</option>`).join('')}</select></div>`).join('')}</div>
  <p class="sub small">左から スピード・スタミナ・タフネス・スパート のランクと疲労。${MENUS.weak.name}：${esc(MENUS.weak.desc)}</p></section>`;}
function trainingScreen(){const u=userTeam(),ev=todayEvent(),nx=nextEventInfo();
  const inj=u.runners.filter(r=>r.inj),avgF=Math.round(u.runners.reduce((a,r)=>a+r.fat,0)/u.runners.length),good=u.runners.filter(r=>!r.inj&&r.cond>0.4).length;
  const camp=inCamp(S.month,S.day);
  const evName=k=>k==='yosen'?'予選会':COURSES[EVENT_INFO[k].course].name;
  const nextTxt=nx&&!ev?`${evName(nx.key)}まで あと${nx.days}日`:'';
  return `<div class="pad">
  <div class="stage banner"><canvas id="traincv" data-anim="train" width="${VW}" height="${VH}"></canvas><div class="tv tl"><b>${dateLabel(S.month,S.day)}</b>${camp?'夏合宿':ev?'大会当日':'練習'}<span>${LOADS[ui.load].name}</span></div></div>
  <section class="card day"><div class="h-row"><div><div class="datebig">${dateLabel(S.month,S.day)}</div><div class="sub small">${S.year}年目${camp?'　夏合宿中（成長・疲労とも増える）':''}</div></div>${nextTxt?`<span class="tag">${nextTxt}</span>`:''}</div>
  ${ev?`<div class="evtoday">本日　${evName(ev)}</div><button class="btn primary wide big" data-a="goEvent">${evName(ev)}へ</button>`
     :`<div class="trainbtns"><button class="btn primary big" data-a="train">1日進める</button><button class="btn" data-a="train7">7日進める</button></div>`}
  <label class="lbl">練習の強度</label><div class="seg">${Object.entries(LOADS).map(([k,l])=>`<button class="${ui.load===k?'on':''}" data-a="load" data-k="${k}">${l.name}</button>`).join('')}</div>
  <p class="sub small">平均疲労 ${avgF}　調子が良い ${good}人${inj.length?`　故障 ${inj.length}人`:''}</p></section>
  ${growthCard()}${menuCard()}
  <section class="card"><h3>チーム状況</h3><div class="stats4">
   <div><span class="sub">チーム力</span><b>${teamPower(u)}</b></div><div><span class="sub">部員</span><b>${u.runners.length}</b></div>
   <div><span class="sub">故障者</span><b>${inj.length}</b></div><div><span class="sub">平均疲労</span><b>${avgF}</b></div></div></section>
  <section class="card"><h3>今季の日程</h3><table class="t">${scheduleRows().map(r=>`<tr><td class="sub">${r[0]}</td><td>${r[1]}</td><td class="r">${r[2]}</td></tr>`).join('')}</table></section>
  ${rankingCard()}</div>`;}
function rankingCard(){const list=S.teams.slice().sort((a,b)=>b.rep-a.rep).slice(0,12);
  return `<section class="card"><h3>評判ランキング</h3><table class="t">${list.map((t,i)=>`<tr class="${t.user?'me':''}"><td>${pos(i+1)}</td><td>${dot(t.color)}${esc(t.name)}</td><td class="r">${Math.round(t.rep)}</td><td class="r sub">${S.seeds.includes(t.id)?'シード':''}</td></tr>`).join('')}</table></section>`;}

/* ----- yosen ----- */
function yosenScreen(){const y=S.ev.yosen,u=userTeam(),me=y.list.find(x=>x.tid===u.id);
  return `<div class="pad"><section class="card"><h2>予選会 結果</h2><p class="sub">ハーフマラソン　各校上位10人の合計タイム（${wText(y.weather)}）</p>
  <p class="big ${me.pass?'good':'bad'}">${me.rank}位　${me.pass?'新春大学駅伝 出場決定':'本戦出場ならず'}</p>
  <table class="t">${y.list.map(x=>{const t=teamById(x.tid);return `<tr class="${t.user?'me':''} ${x.rank===10?'line':''}"><td>${pos(x.rank)}</td><td>${dot(t.color)}${esc(t.name)}</td><td class="r">${fmtT(x.score)}</td><td class="r sub">${x.pass?'通過':''}</td></tr>`;}).join('')}</table></section>
  <section class="card"><h3>自校の個人成績</h3><table class="t">${me.runs.map((r,i)=>`<tr class="${i>=10?'dim':''}"><td>${esc(r.name)} <span class="sub">${r.grade}年</span></td><td class="r">${fmtT(r.t)}</td></tr>`).join('')}</table>
  <button class="btn primary wide" data-a="evdone">次へ</button></section></div>`;}

/* ----- entry ----- */
function ensureEntry(){const ev=S.ev,c=COURSES[ev.course],u=userTeam();const key=S.year+ev.key;
  if(!ui.entry||ui.entry.key!==key){const ws=c.secs.map((s,i)=>secWeather(ev,c,i));const a=autoAssign(u.runners,c.secs,ws);
    ui.entry={key,rids:a.map(r=>r.id),strats:c.secs.map(()=>'even')};}
  return ui.entry;}
function entryScreen(){const ev=S.ev,c=COURSES[ev.course],u=userTeam(),en=ensureEntry();
  const cnt={};en.rids.forEach(id=>cnt[id]=(cnt[id]||0)+1);const dup=Object.values(cnt).some(v=>v>1);
  let total=0;
  const rows=c.days.map((d,di)=>{const w=ev.weather[di];
    return `<h3>${d.name?d.name+'　':''}<span class="sub">予報 ${wText(w)}</span></h3>`+d.secs.map(gi=>{const sec=c.secs[gi];
      const opts=u.runners.map(r=>({r,t:predict(r,sec,w,r.cond),wk:weakHits(r,w,sec)})).sort((a,b)=>a.t-b.t);
      const cur=runnerIn(u,en.rids[gi]);const pt=cur?predict(cur,sec,w,cur.cond):0;total+=pt;
      return `<div class="erow ${cnt[en.rids[gi]]>1?'dup':''}"><div class="einfo"><b>${sec.name}</b> <span>${sec.L}km</span> <span class="sub">${esc(sec.from)}→${esc(sec.to)}</span><div class="sub small">${esc(sec.note)}${sec.dt?`　気温${w.temp+sec.dt}℃`:''}　区間記録 ${fmtT(S.records[c.id][gi].t)}</div></div>
      <div class="esel"><select data-ch="er" data-i="${gi}">${opts.map(o=>`<option value="${o.r.id}" ${o.r.id===en.rids[gi]?'selected':''}>${esc(o.r.name)} ${o.r.grade}年 ${fmtT(o.t)} ${o.r.inj?'故障':condMark(o.r.cond)}${o.wk.length?' ['+o.wk.map(k=>WEAK[k]+'×').join('')+']':''}${sec.elev.some(x=>x>20)?' 上'+GRADE_MARK[o.r.upG]:''}${sec.down?' 下'+GRADE_MARK[o.r.dnG]:''}</option>`).join('')}</select>
      <select data-ch="es" data-i="${gi}" class="strat">${Object.entries(STRATS).map(([k,n])=>`<option value="${k}" ${en.strats[gi]===k?'selected':''}>${n}</option>`).join('')}</select></div></div>`;}).join('');}).join('');
  const field=ev.field.map(id=>teamById(id));
  return `<div class="pad"><section class="card"><h2>${c.name} 区間エントリー</h2>
  <p class="sub small">${esc(c.area)}　調子 ◎○△×</p>
  ${rows}
  <p class="sum">予測合計 <b>${fmtT(total)}</b></p>
  ${dup?'<p class="err">同じ選手が複数の区間に入っています</p>':''}
  <div class="row2"><button class="btn" data-a="autoEntry">おすすめ配置</button><button class="btn primary" data-a="startRace" ${dup?'disabled':''}>スタート</button></div></section>
  <section class="card"><h3>出場校（${field.length}校）</h3><p class="small">${field.map(t=>`<span class="chip">${dot(t.color)}${esc(t.name)}</span>`).join('')}</p></section></div>`;}

/* ----- live ----- */
function renderLive(){
  const ev=S.ev,c=COURSES[ev.course],d=c.days[ev.day];
  if(!ui.live||ui.live.day!==ev.day||ui.live.key!==S.year+ev.key){stopLive();ui.live={race:makeRace(ev.day),day:ev.day,key:S.year+ev.key,paused:false,last:0,lastDraw:0,lastScene:0,raf:0,finished:false,anim:0,cam:'own'};}
  const r=ui.live.race;
  const P=km=>(2+km/r.total*96).toFixed(2);
  const ticks=r.cum.map(k=>`<i class="tk" style="left:${P(k)}%"></i>`).join('');
  const labels=r.secs.map((s,i)=>`<span style="left:${P((r.cum[i]+r.cum[i+1])/2)}%">${s.name}</span>`).join('');
  app.innerHTML=`<div class="live">
  <div class="stage"><canvas id="scene" width="${VW}" height="${VH}"></canvas>
   <div class="tv tl" id="tvtl"></div><div class="tv tr"><span class="small">${c.name}${d.name?' '+d.name:''}</span><b id="lclock">0:00</b></div>
   <div class="tv bl" id="tvbl"></div><div class="tv br" id="tvbr"></div></div>
  <div class="pad">
  <div class="h-row camrow"><span class="sub small">${wText(r.w)}</span><div class="seg sm cam">${[['own','自校を映す'],['lead','先頭を映す']].map(([k,n])=>`<button class="${ui.live.cam===k?'on':''}" data-a="lcam" data-k="${k}">${n}</button>`).join('')}</div></div>
  <div class="stripw"><div class="track">${ticks}<div id="ldots"></div></div><div class="slbls">${labels}</div></div>
  <section class="card own" id="lown"></section>
  <div class="ctrl"><button class="btn sm" data-a="lpause" id="lpause">${ui.live.paused?'再開':'一時停止'}</button>
   <div class="seg sm">${[1,30,120,600].map(v=>`<button class="${ui.speed===v?'on':''}" data-a="lspeed" data-k="${v}">${v===1?'等倍':'×'+v}</button>`).join('')}</div>
   <button class="btn sm" data-a="lskipSec">区間終了まで</button><button class="btn sm" data-a="lskipAll">最後まで</button></div>
  <div class="lgrid"><section class="card"><h3>通過順位</h3><div id="lrank"></div></section><section class="card"><h3>実況</h3><div id="lfeed" class="feed"></div></section></div></div></div>`;
  const cv=document.getElementById('scene');ui.live.bc=new Broadcast(cv);
  drawLive(true);drawScene(0);
  if(!ui.live.raf){ui.live.last=performance.now();ui.live.raf=requestAnimationFrame(liveLoop);}
}
function stopLive(){if(ui.live&&ui.live.raf)cancelAnimationFrame(ui.live.raf);if(ui.live)ui.live.raf=0;}
function liveLoop(ts){const L=ui.live;if(!L)return;const r=L.race;
  if(!document.getElementById('scene')){L.raf=0;return;}
  let dt=(ts-L.last)/1000;L.last=ts;dt=Math.min(dt,0.1);
  if(!L.paused&&!r.done){const {e}=camTarget(L);let sp=ui.speed;
    if(e&&!e.done&&ui.slowRelay){const rem=r.secs[e.s].L*1000-e.d;if(rem<45||e.d<6)sp=Math.min(sp,1);else if(rem<260)sp=Math.min(sp,6);}
    L.effSpeed=sp;let g=dt*sp;while(g>0&&!r.done){const s=Math.min(2,g);r.step(s);g-=s;}}
  drawScene(L.paused?0:dt);
  if(ts-L.lastDraw>150||(r.done&&!L.finished)){if(r.done)L.finished=true;drawLive(true);L.lastDraw=ts;}
  L.raf=requestAnimationFrame(liveLoop);}
function camTarget(L){const r=L.race,u=userTeam();const rows=r.standings();
  const lead=rows.find(x=>x.e&&!x.e.done&&x.e.t0<=r.t)?.e;let e=null;
  if(L.cam==='own'){const f=r.furthest(u.id);if(f&&!f.done&&f.t0<=r.t)e=f;}
  if(!e)e=lead||rows[0].e;return{e,lead};}
const laneOf=tid=>(h2(tid,5)*5)|0;
function entSpeed(o){return o.done||!o.kmT?0:1000*o.kmLen/o.kmT;}
function entGrade(o,sec){const k=Math.max(0,Math.min(nKm(sec)-1,Math.floor(o.d/1000)));return (sec.elev[k]||0)/(1000*Math.min(1,sec.L-k));}
function drawScene(dt){const L=ui.live;if(!L||!L.bc)return;const r=L.race,u=userTeam(),c=COURSES[S.ev.course];
  const {e,lead}=camTarget(L);if(!e)return;const sec=r.secs[e.s],last=e.s===r.secs.length-1,remain=sec.L*1000-e.d;
  const runners=[];
  for(const o of r.ents){if(o.s!==e.s||o.done||o.t0>r.t)continue;const gap=o.d-e.d;if(gap<-10||gap>14)continue;
    runners.push({key:o.tid+'-'+o.s,team:r.T[o.tid].team,runner:o.r,gap,v:entSpeed(o),grade:entGrade(o,sec),me:o.tid===u.id,lane:o===e?2:laneOf(o.tid),target:o===e});}
  const gates=[];
  if(remain<12){const wait=[];if(!last){const tl=Object.values(r.T).filter(TT=>!TT.started[e.s+1]).sort((a,b)=>(b.team.user?1:0)-(a.team.user?1:0));for(const TT of tl.slice(0,3))wait.push({team:TT.team,runner:TT.runners[e.s+1],me:TT.team.user});}
    gates.push({gap:remain,type:last?'finish':'relay',waiting:wait});}
  if(e.d<14)gates.push({gap:-e.d,type:e.s===0?'start':'relay'});
  const rows0=r.standings(),trueLead=rows0[0]&&!rows0[0].TT.done?rows0[0].e:null;
  const veh=[];if(e===trueLead&&e.t0<=r.t&&remain>14)veh.push({k:'bike',gap:5.2},{k:'bike',gap:8.2});
  if((e.tid===u.id||e!==lead)&&e.d>12)veh.push({k:'car',gap:-6.6,flag:r.T[e.tid].team.color});
  const key=e.tid+'-'+e.s;const handoff=L.lastKey&&L.lastKey.split('-')[0]===String(e.tid)&&+L.lastKey.split('-')[1]===e.s-1;L.lastKey=key;
  const hour=(c.startHour[S.ev.day]??c.startHour[0])+(r.t/3600);
  const flagCols=Object.values(r.T).slice(0,8).map(TT=>TT.team.color);
  L.zone=L.bc.frame({dt,sec,km:e.d/1000,v:e.t0<=r.t?entSpeed(e):0,grade:entGrade(e,sec),w:r.w,hour,season:c.season,fuji:c.id==='hakone',izumo:c.id==='izumo',
    teams:Object.values(r.T).map(TT=>TT.team),flagCols,temp:r.w.temp+(sec.dt||0),remain,runners,gates,vehicles:veh,targetKey:key,handoff});
  L.camE=e;}
function drawLive(full){const L=ui.live;if(!L)return;const r=L.race,u=userTeam();
  const clock=document.getElementById('lclock');if(!clock)return;clock.textContent=fmtT(r.t);
  {const ce=L.camE,tl=document.getElementById('tvtl'),bl=document.getElementById('tvbl'),br=document.getElementById('tvbr');
   if(ce&&tl){const sec=r.secs[ce.s],km=ce.d/1000,z=zoneAt(sec,km);const near=(sec.lm||[]).find(l=>Math.abs(l.km-km)<0.35);
     tl.innerHTML=`<b>${sec.name}</b> ${esc(near?near.name:z.place||'')}<span>${km.toFixed(1)}km / ${sec.L}km</span>`;
     const TT=r.T[ce.tid];const ahead=[],behind=[];for(const o of r.ents){if(o===ce||o.s!==ce.s||o.done||o.t0>r.t)continue;(o.d>ce.d?ahead:behind).push(o);}
     ahead.sort((a,b)=>a.d-b.d);behind.sort((a,b)=>b.d-a.d);const sp=1000/(ce.kmT/ce.kmLen);
     bl.innerHTML=`<i style="background:${TT.team.color}"></i>${esc(TT.team.name)} <b>${esc(ce.r.name)}</b>`;
     const rws=r.standings(),ri=rws.findIndex(x=>x.TT.team.id===ce.tid),pv=ri>0?rws[ri-1]:null;
     br.innerHTML=(ahead[0]?`前 ${esc(r.T[ahead[0].tid].team.short)} ${Math.max(1,Math.round((ahead[0].d-ce.d)/sp))}秒`:pv?`前 ${esc(pv.TT.team.short)} ${pv.TT.done?'ゴール済':Math.max(1,Math.round((rws[ri].gap??0)-(pv.gap??0)))+'秒'}`:'先頭')+(behind[0]?`　後 ${esc(r.T[behind[0].tid].team.short)} ${Math.max(1,Math.round((ce.d-behind[0].d)/sp))}秒`:'');}}
  const P=km=>(2+km/r.total*96).toFixed(2);const rows=r.standings();
  document.getElementById('ldots').innerHTML=rows.slice().reverse().map(x=>{const e=x.e;if(!e)return'';const km=x.TT.done?r.total:r.cum[e.s]+e.d/1000;const me=x.TT.team.user;
    return `<b class="${me?'me':''}" style="left:${P(km)}%;background:${x.TT.team.color}"></b>`;}).join('');
  const myIdx=rows.findIndex(x=>x.TT.team.id===u.id),me=rows[myIdx],own=document.getElementById('lown');
  if(me){const e=me.e,TT=me.TT;let h='';
    if(TT.done)h=`<div class="h-row"><b>フィニッシュ</b><span class="big">${myIdx+1}位</span></div><p class="sub">トップと ${fmtGap(me.gap)}</p>`;
    else if(e.t0>r.t)h=`<div class="h-row"><b>${r.secs[e.s].name} ${esc(e.r.name)}</b><span class="sub">スタート待ち</span></div><p class="sub">${fmtT(e.t0)}に${TT.issei?'一斉':'時差'}スタート</p>`;
    else{const sec=r.secs[e.s];const used=!!TT.boost[e.s];
      h=`<div class="h-row"><div><b>${sec.name} ${esc(e.r.name)}</b> <span class="sub">${e.r.grade}年</span>${e.kuri?' <span class="tag bad">繰上</span>':''}</div><span class="big">${myIdx+1}位</span></div>
      ${elevSvg(sec,e.d)}
      <div class="h-row small"><span>${(e.d/1000).toFixed(1)} / ${sec.L}km　${fmtPace(e.kmT/e.kmLen)}/km　区間 ${fmtT(r.t-e.t0)}</span><span>トップと ${fmtGap(me.gap)}</span></div>
      <button class="btn sm ${used?'':'primary'}" data-a="cheer" ${used||e.k<1?'disabled':''}>${used?'声かけ済み':'声かけ（この区間1回）'}</button>`;}
    own.innerHTML=h+(L.finished?`<button class="btn primary wide" data-a="liveFinish">結果を見る</button>`:'');}
  document.getElementById('lrank').innerHTML=rows.map((x,i)=>{const e=x.e,TT=x.TT;const nm=TT.done?'フィニッシュ':(e?(e.t0>r.t?'スタート待ち':`${r.secs[e.s].name} ${esc(e.r.name)}`):'');
    return `<div class="rrow ${TT.team.user?'me':''}"><span class="rk">${i+1}</span>${dot(TT.team.color)}<span class="tn">${esc(TT.team.name)}${TT.issei?'<em>一斉</em>':''}${e&&e.kuri&&!TT.done?'<em>繰上</em>':''}</span><span class="rn">${nm}</span><span class="gp">${i===0?'':fmtGap(x.gap)}</span></div>`;}).join('');
  const fe=document.getElementById('lfeed');const evs=r.ev.slice(-40).reverse();
  fe.innerHTML=evs.map(v=>`<div class="${v.cls}"><span class="ft">${fmtT(v.t)}</span>${esc(v.txt)}</div>`).join('');
  const pb=document.getElementById('lpause');if(pb)pb.textContent=L.paused?'再開':'一時停止';
}

function elevSvg(sec,d){const n=nKm(sec);let h=0;const pts=[[0,0]];for(let k=0;k<n;k++){h+=sec.elev[k]||0;pts.push([Math.min(k+1,sec.L),h]);}
  const mn=Math.min(...pts.map(p=>p[1])),mx=Math.max(...pts.map(p=>p[1])),rg=Math.max(40,mx-mn);
  const X=km=>(km/sec.L*300).toFixed(1),Y=v=>(34-(v-mn)/rg*28).toFixed(1);
  const path=pts.map((p,i)=>(i?'L':'M')+X(p[0])+' '+Y(p[1])).join(' ');const km=d/1000;
  let cur=0;for(let k=0;k<n;k++){const len=Math.min(1,sec.L-k);if(km>=k+len)cur+=sec.elev[k]||0;else{cur+=(sec.elev[k]||0)*Math.max(0,km-k)/len;break;}}
  return `<svg class="elev" viewBox="0 0 300 38" preserveAspectRatio="none"><path d="${path} L300 38 L0 38 Z" class="ea"/><path d="${path}" class="el"/><line x1="${X(km)}" x2="${X(km)}" y1="0" y2="38" class="em"/></svg><div class="h-row small sub elevlbl"><span>${esc(sec.from)}</span><span>${mx-mn>30?'高低差 '+Math.round(mx-mn)+'m':'ほぼ平坦'}</span><span>${esc(sec.to)}</span></div>`;}

/* ----- results ----- */
function secRanksFor(ev,c){const out=[];c.secs.forEach((s,gi)=>{const di=c.days.findIndex(d=>d.secs.includes(gi));const res=ev.results[di];if(!res)return;const li=c.days[di].secs.indexOf(gi);
  const list=ev.field.map(tid=>({tid,t:res[tid].times[li]})).sort((a,b)=>a.t-b.t);const rk={};list.forEach((x,i)=>rk[x.tid]=i+1);out[gi]={rk,best:list[0]};});return out;}
function resultScreen(final){const ev=S.ev,c=COURSES[ev.course],u=userTeam();const sr=secRanksFor(ev,c);
  let rows,title,btn;
  if(!final){const d=ev.day,res=ev.results[d];rows=ev.field.map(tid=>({tid,total:res[tid].total})).sort((a,b)=>a.total-b.total);
    title=`${c.name} ${c.days[d].name}結果`;btn=`<button class="btn primary wide" data-a="nextDay">${c.days[d+1].name}へ</button>`;}
  else{rows=ev.final.totals;title=`${c.name} ${c.days.length>1?'総合':''}結果`;btn=`<button class="btn primary wide" data-a="evdone">次へ</button>`;}
  const lead=rows[0].total,my=rows.findIndex(x=>x.tid===u.id);
  const tabs=final?`<div class="seg">${[['total','総合'],['sec','区間賞'],['own','自校']].map(([k,n])=>`<button class="${ui.resTab===k?'on':''}" data-a="resTab" data-k="${k}">${n}</button>`).join('')}</div>`:'';
  const tab=final?ui.resTab:'total';
  let body='';
  if(tab==='total'){
    const multi=final&&c.days.length>1;
    body=`<table class="t"><tr><th></th><th>大学</th>${multi?'<th class="r">往路</th><th class="r">復路</th>':''}<th class="r">タイム</th><th class="r">差</th></tr>${rows.map((x,i)=>{const t=teamById(x.tid);
      const dr=multi?c.days.map((d,di)=>{const arr=ev.field.map(tid=>ev.results[di][tid].total).sort((a,b)=>a-b);return `<td class="r sub">${arr.indexOf(ev.results[di][x.tid].total)+1}</td>`;}).join(''):'';
      return `<tr class="${t.user?'me':''} ${c.id==='hakone'&&final&&i===9?'line':''}"><td>${pos(i+1)}</td><td>${dot(t.color)}${esc(t.name)}</td>${dr}<td class="r">${fmtT(x.total)}</td><td class="r sub">${i?fmtGap(x.total-lead):''}</td></tr>`;}).join('')}</table>
      ${c.id==='hakone'&&final?'<p class="sub small">10位までが来年のシード権</p>':''}`;}
  else if(tab==='sec'){body=`<table class="t"><tr><th>区間</th><th>区間賞</th><th class="r">タイム</th></tr>${c.secs.map((s,gi)=>{const b=ev.final.secTop[gi],t=teamById(b.tid);
      return `<tr class="${t.user?'me':''}"><td>${s.name}</td><td>${esc(b.name)} <span class="sub">${esc(t.short)}${b.grade}年</span></td><td class="r">${fmtT(b.t)}${b.isNew?' <span class="tag rec">区間新</span>':''}</td></tr>`;}).join('')}</table>`;}
  else body=ownSecTable(ev,c,sr);
  const ownSum=ev.userIn?`<div class="h-row" style="margin:4px 0 12px"><span class="big">${pos(my+1)} ${my+1}位</span><span class="num" style="font-size:20px">${fmtT(rows[my].total)}<span class="sub" style="font-size:15px">${my?'　トップと'+fmtGap(rows[my].total-lead):''}</span></span></div>`:`<p class="sub">今大会は出場権がありませんでした。</p>`;
  return `<div class="pad"><section class="card"><h2>${title}</h2>${ownSum}${tabs}${body}${!final&&ev.userIn?'<h3>自校の区間成績</h3>'+ownSecTable(ev,c,sr):''}${btn}</section></div>`;}
function ownSecTable(ev,c,sr){const u=userTeam();if(!ev.userIn)return '<p class="sub">出場なし</p>';const en=ev.entries[u.id];
  return `<table class="t"><tr><th>区間</th><th>選手</th><th class="r">タイム</th><th class="r">順位</th></tr>${c.secs.map((s,gi)=>{if(!sr[gi])return'';const di=c.days.findIndex(d=>d.secs.includes(gi)),li=c.days[di].secs.indexOf(gi);
    const r=runnerIn(u,en.rids[gi]);const t=ev.results[di][u.id].times[li];const k=sr[gi].rk[u.id];
    return `<tr><td>${s.name}</td><td>${esc(r?r.name:'')} <span class="sub">${STRATS[en.strats[gi]]}</span></td><td class="r">${fmtT(t)}</td><td class="r ${k===1?'good':''}">${k}位</td></tr>`;}).join('')}</table>`;}

/* ----- year end / scout ----- */
function yearEndScreen(){const y=S.yearEnd;const d=Math.round(y.repAfter-y.repBefore);
  return `<div class="pad"><section class="card"><h2>${S.year}年目 シーズン終了</h2>
  <p class="big">${y.rank?`新春大学駅伝 ${y.rank}位`:'新春大学駅伝 不出場'}</p>
  <p>優勝：${esc(y.champ||'')}</p><p>評判 ${Math.round(y.repBefore)} → ${Math.round(y.repAfter)}（${d>=0?'+':''}${d}）　${y.seed?'来季シード権を獲得':'来季は予選会から'}</p></section>
  <section class="card"><h3>卒業生</h3><table class="t">${y.grads.map(g=>`<tr><td>${esc(g.name)} <span class="sub">${esc(g.home)}出身</span></td><td class="r small">${g.hist.length?g.hist.map(h=>`${h.sec} ${h.rk}位`).join('／'):'新春出走なし'}</td></tr>`).join('')}</table>
  <button class="btn primary wide" data-a="toScout">スカウトへ</button></section></div>`;}
function weakText(r,known){const w=Object.keys(r.weak||{}).filter(k=>r.weak[k]);if(known===false)return '不明';return w.length?w.map(k=>WEAK[k]).join('・'):'なし';}
function traitChips(r,known){return `<span class="chip2">上り ${GRADE_MARK[r.upG]}</span><span class="chip2">下り ${GRADE_MARK[r.dnG]}</span><span class="chip2 ${known!==false&&Object.keys(r.weak||{}).length?'warn':''}">苦手 ${weakText(r,known)}</span>`;}
function scoutScreen(){const sc=S.scout,u=userTeam();
  if(sc.joined){const j=sc.list.filter(r=>sc.joined.includes(r.id)),dcl=sc.list.filter(r=>sc.declined.includes(r.id));
    return `<div class="pad"><section class="card"><h2>スカウト結果</h2><h3>入学決定</h3>${j.length?`<p>${j.map(r=>esc(r.name)).join('、')}</p>`:'<p class="sub">なし</p>'}
    ${dcl.length?`<h3>他校へ</h3><p class="sub">${dcl.map(r=>esc(r.name)).join('、')}</p>`:''}${sc.walk.length?`<h3>一般入部</h3><p>${sc.walk.map(esc).join('、')}</p>`:''}
    <button class="btn primary wide" data-a="newYear">${S.year+1}年目を始める</button></section></div>`;}
  const n=ui.scoutSel.length;
  return `<div class="pad"><section class="card"><h2>スカウト</h2><p class="sub small">声をかけられるのは8人まで。入学は7人まで</p>
  ${sc.list.map(r=>{const on=ui.scoutSel.includes(r.id);const a=r.acc>0.6?'高':r.acc>0.3?'中':'低';
    return `<button class="scout ${on?'on':''}" data-a="scoutSel" data-k="${r.id}"><div class="h-row"><b>${esc(r.name)}</b><span class="sub">${esc(r.home)}</span></div>
    <div class="sgrid">${STATS.map(k=>`<div><span>${STAT_LABEL[k]}</span><b>${rankOf(r.shown[k])} ${r.shown[k]}</b></div>`).join('')}</div>
    <div class="chips">${traitChips(r,r.weakKnown)}</div><div class="h-row small"><span>素質 ${stars(r.potShown)}</span><span>獲得見込み ${a}</span></div></button>`;}).join('')}
  <button class="btn primary wide" data-a="scoutGo" ${n?'':'disabled'}>${n}人に声をかける</button></section></div>`;}

/* ----- roster / player ----- */
function rosterScreen(){const u=userTeam();const key=ui.sort;
  const val=(r,k)=>k==='ovr'?ovr(r):k==='name'?r.name:k==='weak'?Object.keys(r.weak||{}).length:r[k];
  const list=u.runners.slice().sort((a,b)=>{const x=val(a,key),y=val(b,key);return (typeof x==='string'?x.localeCompare(y):x-y)*ui.dir;});
  const cols=[['grade','学年'],['ovr','総合'],['spd','スピ'],['sta','スタ'],['tgh','タフ'],['spt','スパ'],['upG','上り'],['dnG','下り'],['weak','苦手'],['cond','調子'],['fat','疲労']];
  const wk=r=>Object.keys(r.weak||{}).map(k=>WEAK[k][0]).join('')||'—';
  return `<div class="pad"><section class="card"><h2>選手一覧 <span class="sub">${u.runners.length}人</span></h2><div class="scroll-x"><table class="t roster"><tr><th data-a="sort" data-k="name">選手</th>${cols.map(([k,n])=>`<th class="r ${key===k?'on':''}" data-a="sort" data-k="${k}">${n}</th>`).join('')}</tr>
  ${list.map(r=>`<tr data-a="player" data-k="${r.id}"><td class="nm">${esc(r.name)}${r.inj?' <span class="tag bad">故障</span>':''}${r.focus&&r.focus!=='balance'&&MENUS[r.focus]?` <span class="tag">${MENUS[r.focus].short}</span>`:''}</td><td class="r">${r.grade}</td><td class="r b">${ovr(r)}</td>${STATS.map(k=>`<td class="r"><span class="rk rk${rankOf(r[k])[0]}">${rankOf(r[k])}</span>${Math.round(r[k])}</td>`).join('')}<td class="r">${GRADE_MARK[r.upG]}</td><td class="r">${GRADE_MARK[r.dnG]}</td><td class="r ${Object.keys(r.weak||{}).length?'bad':'sub'}">${wk(r)}</td><td class="r">${condMark(r.cond)}</td><td class="r ${r.fat>70?'bad':''}">${Math.round(r.fat)}</td></tr>`).join('')}</table></div>
  <p class="sub small">寒＝寒さ　暑＝暑さ　悪＝悪天候</p></section></div>`;}
function playerScreen(){const u=userTeam(),r=runnerIn(u,ui.player);if(!r){ui.player=null;return rosterScreen();}
  const c=COURSES.hakone;const apt=c.secs.map((s,gi)=>{const w={sky:'晴れ',temp:5,wind:1};const mine=predict(r,s,w);const rank=u.runners.filter(o=>predict(o,s,w)<mine).length+1;return{s,mine,rank};}).sort((a,b)=>a.rank-b.rank||a.mine-b.mine).slice(0,3);
  const bar=(k)=>`<div class="srow"><span>${STAT_LABEL[k]}</span><div class="bar"><i style="width:${r[k]}%"></i></div><b><span class="rk rk${rankOf(r[k])[0]}">${rankOf(r[k])}</span>${Math.round(r[k])}</b></div>`;
  const xp=(g,x)=>g>=3?'最高段階':`次の段階まで ${Math.round(x/xpNeed(g)*100)}%`;
  const ws=Object.keys(WEAK);
  return `<div class="pad"><button class="btn sm" data-a="back">一覧へ戻る</button>
  <section class="card"><div class="phead"><canvas id="portrait" class="portrait" width="40" height="84" data-rid="${r.id}"></canvas><div><div class="h-row"><h2>${esc(r.name)}</h2><span>${r.grade}年</span></div><p class="sub">${esc(r.home)}出身　素質 ${stars(r.pot)}　総合 ${ovr(r)}</p>
  <p class="small">調子 ${condMark(r.cond)}　疲労 ${Math.round(r.fat)}${r.inj?`　<span class="bad">故障中（残り${r.inj}日）</span>`:''}</p></div></div>
  <h3>能力</h3>${STATS.map(bar).join('')}
  <h3>特性</h3><div class="traits">
   <div><span>上り適性</span><b class="gm">${GRADE_MARK[r.upG]}</b><small>${xp(r.upG,r.upX)}</small></div>
   <div><span>下り適性</span><b class="gm">${GRADE_MARK[r.dnG]}</b><small>${xp(r.dnG,r.dnX)}</small></div></div>
  <div class="weak">${ws.map(k=>`<div class="${r.weak&&r.weak[k]?'on':''}"><b>${WEAK[k]}</b><span>${r.weak&&r.weak[k]?'苦手':'問題なし'}</span></div>`).join('')}</div>
  <p class="sub small">${ws.filter(k=>r.weak&&r.weak[k]).map(k=>WEAK_DESC[k]).join('。')||'苦手な条件はありません'}</p></section>
  <section class="card"><h3>練習メニュー</h3>
  <select id="focussel" data-ch="focus" data-i="${r.id}">${Object.entries(MENUS).map(([k,m])=>`<option value="${k}" ${r.focus===k?'selected':''}>${m.name}</option>`).join('')}</select>
  <p class="sub small">${r.focus==='up'||r.focus==='dn'?'坂道練習で適性の段階が上がりやすくなる。':r.focus==='weak'?'苦手を1つずつ克服していく。「悪条件対策」の月と組み合わせると効果大。':r.focus&&r.focus!=='none'?STAT_DESC[r.focus]+'を重点的に伸ばす。':'チーム方針どおりに練習する。'}</p></section>
  <section class="card"><h3>推定記録</h3><table class="t"><tr><td>5000m</td><td class="r">${fmtT(predict(r,FLAT5,NEUTRAL_W)-15)}</td></tr><tr><td>10000m</td><td class="r">${fmtT(predict(r,FLAT10,NEUTRAL_W)-30)}</td></tr><tr><td>ハーフ</td><td class="r">${fmtT(predict(r,FLATH,NEUTRAL_W))}</td></tr></table>
  <h3>新春大学駅伝の適性区間</h3><p>${apt.map(a=>`${a.s.name}（チーム内${a.rank}番手・${fmtT(a.mine)}）`).join('<br>')}</p></section>
  <section class="card"><h3>出場記録</h3>${r.hist.length?`<table class="t">${r.hist.slice().reverse().map(h=>`<tr><td class="sub">${h.y}年目</td><td>${h.ev} ${h.sec}</td><td class="r">${fmtT(h.t)}</td><td class="r">${h.rk?h.rk+'位':''}</td></tr>`).join('')}</table>`:'<p class="sub">まだありません</p>'}</section></div>`;}

/* ----- records / settings ----- */
function recordsScreen(){const tabs=[['hakone','新春'],['zennihon','全国'],['izumo','秋季'],['hist','歴代成績']];
  let body='';
  if(ui.recTab==='hist'){body=S.history.length?`<div class="scroll-x"><table class="t"><tr><th>年</th><th class="r">予選</th><th class="r">秋季</th><th class="r">全国</th><th class="r">新春</th><th>新春優勝</th></tr>${S.history.slice().reverse().map(h=>`<tr><td>${h.year}年目</td><td class="r">${h.yosen??'—'}</td><td class="r">${h.izumo??'—'}</td><td class="r">${h.zennihon??'—'}</td><td class="r b">${h.hakone??'—'}</td><td class="small">${esc(h.champ.hakone||'')}</td></tr>`).join('')}</table></div>`:'<p class="sub">1シーズン目が終わると記録されます</p>';}
  else{const c=COURSES[ui.recTab];body=`<table class="t"><tr><th>区間</th><th class="r">記録</th><th>記録者</th></tr>${c.secs.map((s,gi)=>{const x=S.records[c.id][gi];return `<tr class="${x.team===userTeam().name?'me':''}"><td>${s.name} <span class="sub">${s.L}km</span></td><td class="r">${fmtT(x.t)}</td><td class="small">${x.year?`${esc(x.name)}（${esc(x.team)}）${x.year}年目`:'<span class="sub">大会記録</span>'}</td></tr>`;}).join('')}</table>`;}
  return `<div class="pad"><section class="card"><h2>記録</h2><div class="seg">${tabs.map(([k,n])=>`<button class="${ui.recTab===k?'on':''}" data-a="recTab" data-k="${k}">${n}</button>`).join('')}</div>${body}</section></div>`;}
/* ===== cloud save (Google Apps Script) ===== */
const CLOUD_KEY='ekiden-cloud-v1';
function cloudCfg(){const def={url:(window.EKIDEN_CONFIG&&window.EKIDEN_CONFIG.gasUrl)||'',pass:'',slot:'main',auto:true,last:0};
  try{const o=JSON.parse(localStorage.getItem(CLOUD_KEY)||'{}');const c=Object.assign(def,o);if(!c.url)c.url=def.url;return c;}catch(e){return def;}}
function cloudSet(c){try{localStorage.setItem(CLOUD_KEY,JSON.stringify(c));}catch(e){}}
const cloudReady=()=>{const c=cloudCfg();return !!(c.url&&c.pass);};
async function cloudCall(body){const c=cloudCfg();if(!c.url)throw new Error('GASのURLが未設定です');if(!c.pass)throw new Error('合言葉が未設定です');
  let res;try{res=await fetch(c.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({app:'ekiden',slot:c.slot||'main',pass:c.pass},body)),redirect:'follow'});}
  catch(e){throw new Error('GASに接続できません。URLとネット接続を確認してください');}
  let j;try{j=await res.json();}catch(e){throw new Error('GASの応答を読めません。デプロイの「アクセスできるユーザー」が「全員」か確認してください');}
  if(!j.ok)throw new Error(j.error==='auth'?'合言葉が違います':j.error==='busy'?'混み合っています。少し待ってから試してください':(j.error||'失敗しました'));return j;}
function fmtWhen(ms){if(!ms)return '—';const d=new Date(ms);return `${d.getMonth()+1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}
async function cloudSaveNow(){if(!S)throw new Error('保存するデータがありません');const j=await cloudCall({action:'save',data:S});const c=cloudCfg();c.last=j.updated;cloudSet(c);return j;}
let cloudTimer=null;
function cloudAuto(){const c=cloudCfg();if(!c.url||!c.pass||!c.auto||!S)return;clearTimeout(cloudTimer);
  cloudTimer=setTimeout(()=>{cloudSaveNow().then(()=>{ui.cloudMsg='自動保存しました（'+fmtWhen(Date.now())+'）';}).catch(e=>{ui.cloudMsg='自動保存できませんでした：'+e.message;});},5000);}
function settingsScreen(){const c=cloudCfg(),busy=!!ui.cloudBusy;
  return `<div class="pad"><section class="card"><h2>クラウド保存</h2>
  <p class="sub small">Google Apps Script に保存すると、スマホとPCで同じデータを続けられます。</p>
  <label class="lbl" for="cl_url">駅伝用 GAS のウェブアプリURL</label><input id="cl_url" class="inp" data-ch="cloud" data-k="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(c.url)}">
  <label class="lbl" for="cl_pass">合言葉</label><input id="cl_pass" class="inp" type="password" data-ch="cloud" data-k="pass" autocomplete="off" value="${esc(c.pass)}">
  <label class="lbl" for="cl_slot">保存スロット</label><input id="cl_slot" class="inp" data-ch="cloud" data-k="slot" maxlength="32" value="${esc(c.slot)}">
  <label class="chk"><input id="cl_auto" type="checkbox" data-ch="cloud" data-k="auto" ${c.auto?'checked':''}> 進めるたびに自動で保存する</label>
  <div class="row2"><button class="btn primary" data-a="cloudSave" ${busy?'disabled':''}>今すぐ保存</button><button class="btn" data-a="cloudLoad" ${busy?'disabled':''}>${ui.confirmCloud?'上書きして読み込む':'読み込む'}</button></div>
  <div class="h-row" style="margin-top:10px"><button class="btn sm" data-a="cloudTest" ${busy?'disabled':''}>接続を確認</button><span class="sub small">最後の保存 ${fmtWhen(c.last)}</span></div>
  ${ui.cloudMsg?`<p class="small ${/できません|違います|未設定|読めません|失敗/.test(ui.cloudMsg)?'bad':''}">${esc(ui.cloudMsg)}</p>`:''}
  ${ui.confirmCloud?'<p class="small bad">この端末のデータはクラウドのデータで置き換わります</p>':''}</section>
  <section class="card"><h2>この端末のデータ</h2>
  <div class="row2"><button class="btn" data-a="exportSave">書き出し</button><button class="btn" data-a="importSave">読み込み</button></div>
  <textarea id="savebox" class="inp" rows="4" placeholder="書き出したデータをここに貼り付けて読み込み"></textarea>
  ${ui.msg?`<p class="sub">${esc(ui.msg)}</p>`:''}
  <h3>最初からやり直す</h3><button class="btn danger" data-a="reset">${ui.confirmReset?'本当に削除する（元に戻せません）':'セーブを削除してタイトルへ'}</button></section></div>`;}

/* ===== small animated canvases ===== */
let animRaf=0,animLast=0;const bcs=new WeakMap();
function sceneCourse(th){return{name:'',L:1e6,zones:[{a:-1e9,b:1e9,th,place:''}],lm:[],elev:[0]};}
function startAnims(){const p=document.getElementById('portrait');
  if(p){const r=runnerIn(userTeam(),+p.dataset.rid);const c=p.getContext('2d');c.imageSmoothingEnabled=false;if(r)drawPortrait(c,r,userTeam());}
  if(document.querySelector('canvas[data-anim]')&&!animRaf){animLast=performance.now();animRaf=requestAnimationFrame(animLoop);}}
const TITLE_TEAMS=[{id:901,color:'#2257b8'},{id:902,color:'#b3261e'},{id:903,color:'#1b7a4a'},{id:904,color:'#c25e00'}];
function animLoop(ts){const cvs=document.querySelectorAll('canvas[data-anim]');if(!cvs.length){animRaf=0;return;}
  const dt=Math.min(0.1,(ts-animLast)/1000);animLast=ts;
  cvs.forEach(cv=>{let bc=bcs.get(cv);if(!bc){bc=new Broadcast(cv);bcs.set(cv,bc);}
    if(cv.dataset.anim==='title'){const rs=TITLE_TEAMS.map((tm,k)=>({key:'t'+k,team:tm,runner:{id:50+k,look:{hair:k+1,skin:k%4}},gap:[0,-1.6,1.1,-3.2][k],v:5.7,grade:0,lane:[2,0,4,1][k],target:k===0}));
      bc.frame({dt,sec:Object.assign(sceneCourse('coast'),{name:'3区'}),km:12,v:5.7,grade:0,w:{sky:'晴れ',temp:3,wind:1},hour:9.2,season:'winter',fuji:true,teams:TITLE_TEAMS,flagCols:TITLE_TEAMS.map(x=>x.color),temp:3,runners:rs,gates:[],vehicles:[{k:'bike',gap:5.2},{k:'bike',gap:8.2}],targetKey:'title',crowdMul:1});}
    else if(cv.dataset.anim==='train'&&S){const u=userTeam(),m=Math.min(12,S.month),cnt={};for(const r of u.runners)if(!r.inj)cnt[r.focus||'balance']=(cnt[r.focus||'balance']||0)+1;
      const mk=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0]||'balance',P0=Object.assign({},MENUS[mk]);if(inCamp(S.month,S.day))P0.scene='highland';const th=P0.scene==='rain'?'town':P0.scene;
      const v=P0.fat<0?3.4:P0.scene==='track'?6.3:P0.scene==='mountain'?4.3:4.9,grade=P0.scene==='mountain'?0.06:0;
      const rs=u.runners.filter(r=>!r.inj).slice(0,5).map((r,k)=>({key:'r'+r.id,team:u,runner:r,gap:[0,-1.4,1.3,-2.8,2.6][k],v,grade,lane:[2,0,4,1,3][k],target:k===0}));
      const w=P0.scene==='rain'?{sky:'雨',temp:12,wind:1}:{sky:m===6?'曇り':'晴れ',temp:[0,0,0,0,16,20,22,27,29,25,19,13,7][m]||15,wind:0};
      bc.frame({dt,sec:sceneCourse(th),km:1,v,grade,w,hour:16,season:m>=6&&m<=9?'summer':m>=10?'autumn':'early',teams:[u],flagCols:[u.color],temp:w.temp,runners:rs,gates:[],vehicles:[],targetKey:'train'+th,crowdMul:0,track:P0.scene==='track'});}});
  animRaf=requestAnimationFrame(animLoop);}

/* ===== actions ===== */
const ACT={
  tab:d=>go(d.k),
  continue:()=>{S=loadSave();ui.tab='home';render(true);},
  newgame:()=>{ui.newgame=true;ui.msg='';render(true);},
  ngback:()=>{ui.newgame=false;render(true);},
  ngcolor:d=>{ui.ng.name=document.getElementById('ngname').value;ui.ng.color=+d.i;render();},
  ngdiff:d=>{ui.ng.name=document.getElementById('ngname').value;ui.ng.diff=d.k;render();},
  ngstart:()=>{const n=document.getElementById('ngname').value.trim();if(!n){ui.msg='大学名を入力してください';render();return;}
    newGame(n,ui.ng.color,ui.ng.diff);ui.newgame=false;ui.msg='';ui.tab='home';render(true);},
  load:d=>{ui.load=d.k;render();},
  train:()=>{const rp=dayTurn(ui.load);ui.lastRun=rp?[rp]:null;render();},
  train7:()=>{const runs=[];for(let i=0;i<7;i++){if(todayEvent())break;const rp=dayTurn(ui.load);if(!rp)break;runs.unshift(rp);}ui.lastRun=runs.length?runs:null;render();},
  goEvent:()=>{ui.lastRun=null;startTodayEvent();ui.resTab='total';render(true);},
  proceed:()=>{proceed();ui.resTab='total';render(true);},
  evdone:()=>{eventDone();ui.resTab='total';render(true);},
  autoEntry:()=>{ui.entry=null;render();},
  startRace:()=>{const en=ui.entry;setUserEntry(en.rids.slice(),en.strats.slice());render(true);},
  lpause:()=>{ui.live.paused=!ui.live.paused;drawLive();},
  lspeed:d=>{ui.speed=+d.k;document.querySelectorAll('[data-a=lspeed]').forEach(b=>b.classList.toggle('on',b.dataset.k===d.k));},
  lskipSec:()=>{const r=ui.live.race,e=r.furthest(userTeam().id);let g=0;while(!r.done&&e&&!e.done&&g++<100000)r.step(2);drawLive();},
  lcam:d=>{ui.live.cam=d.k;document.querySelectorAll('[data-a=lcam]').forEach(b=>b.classList.toggle('on',b.dataset.k===d.k));},
  lskipAll:()=>{ui.live.race.runToEnd();drawLive(true);},
  cheer:()=>{ui.live.race.cheer(userTeam().id);drawLive();},
  liveFinish:()=>{const L=ui.live;stopLive();ui.live=null;dayDone(S.ev.day,L.race.results());render(true);},
  nextDay:()=>{nextDay();render(true);},
  resTab:d=>{ui.resTab=d.k;render();},
  toScout:()=>{ui.scoutSel=[];genScout();render(true);},
  scoutSel:d=>{const id=+d.k,i=ui.scoutSel.indexOf(id);if(i>=0)ui.scoutSel.splice(i,1);else if(ui.scoutSel.length<8)ui.scoutSel.push(id);render();},
  scoutGo:()=>{scoutCommit(ui.scoutSel.slice());render(true);},
  newYear:()=>{newYear();ui.scoutSel=[];render(true);},
  sort:d=>{if(ui.sort===d.k)ui.dir*=-1;else{ui.sort=d.k;ui.dir=d.k==='name'||d.k==='fat'||d.k==='weak'?1:-1;}render();},
  player:d=>{ui.player=+d.k;render(true);},
  back:()=>{ui.player=null;render(true);},
  recTab:d=>{ui.recTab=d.k;render();},
  cloudSave:async()=>{ui.cloudBusy=true;ui.cloudMsg='保存しています…';render();try{await cloudSaveNow();ui.cloudMsg='保存しました';}catch(e){ui.cloudMsg=e.message;}ui.cloudBusy=false;render();},
  cloudTest:async()=>{ui.cloudBusy=true;ui.cloudMsg='確認しています…';render();try{const j=await cloudCall({action:'info'});ui.cloudMsg=j.exists?`接続OK。クラウドに${j.month>12?'1月':j.month+'月'}時点のデータがあります（${fmtWhen(j.updated)}）`:'接続OK。まだクラウドにデータはありません';}catch(e){ui.cloudMsg=e.message;}ui.cloudBusy=false;render();},
  cloudLoad:async()=>{if(S&&!ui.confirmCloud){ui.confirmCloud=true;render();return;}ui.confirmCloud=false;ui.cloudBusy=true;ui.cloudMsg='読み込んでいます…';render();
    try{const j=await cloudCall({action:'load'});if(!j.data){ui.cloudMsg='クラウドにデータがありません';}else{S=migrate(j.data);try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}ui.cloudMsg='読み込みました（'+fmtWhen(j.updated)+'の保存）';ui.entry=null;ui.live=null;}}catch(e){ui.cloudMsg=e.message;}
    ui.cloudBusy=false;if(S&&ui.cloudMsg.startsWith('読み込みました')&&ui.fromTitle){ui.fromTitle=false;ui.tab='home';render(true);}else render();},
  cloudContinue:async()=>{ui.fromTitle=true;ui.confirmCloud=true;await ACT.cloudLoad();if(!S){ui.msg=ui.cloudMsg;render();}},
  exportSave:()=>{const b=document.getElementById('savebox');b.value=JSON.stringify(S);b.select();try{navigator.clipboard.writeText(b.value);ui.msg='コピーしました';}catch(e){ui.msg='';}},
  importSave:()=>{const v=document.getElementById('savebox').value.trim();try{const o=JSON.parse(v);if(!o||!o.teams)throw 0;S=o;save();ui.msg='読み込みました';ui.tab='home';render(true);}catch(e){ui.msg='データの形式が正しくありません';render();}},
  reset:()=>{if(!ui.confirmReset){ui.confirmReset=true;render();return;}try{localStorage.removeItem(SAVE_KEY);}catch(e){}S=null;ui.confirmReset=false;ui.entry=null;ui.live=null;ui.tab='home';render(true);},
};
app.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el||el.disabled)return;const f=ACT[el.dataset.a];if(f){e.preventDefault();f(el.dataset,el);}});
app.addEventListener('change',e=>{const el=e.target;if(!el.dataset.ch)return;const i=+el.dataset.i;
  if(el.dataset.ch==='cloud'){const c=cloudCfg();c[el.dataset.k]=el.type==='checkbox'?el.checked:el.value.trim();cloudSet(c);return;}
  if(el.dataset.ch==='er')ui.entry.rids[i]=+el.value;else if(el.dataset.ch==='es')ui.entry.strats[i]=el.value;
  else if(el.dataset.ch==='focus'||el.dataset.ch==='menu'){const r=runnerIn(userTeam(),i);if(r){r.focus=el.value;save();}if(el.dataset.ch==='menu')return;}
  else if(el.dataset.ch==='menuAll'){if(!el.value)return;for(const r of userTeam().runners)r.focus=el.value;save();}
  const y=scrollY;render();scrollTo(0,y);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ui.live&&!ui.live.paused){ui.live.paused=true;drawLive();}});

/* ===== boot ===== */
S=null;render();
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){let reloaded=false;const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('./sw.js').catch(()=>{});
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!reloaded&&!(ui.live)){reloaded=true;location.reload();}});}
