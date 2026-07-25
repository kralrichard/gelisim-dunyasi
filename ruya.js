/* =====================================================================
   RÜYA — 40+ mini oyunun rüya mantığıyla birbirine karıştığı sonsuz akış
   Sanal tuval: 400x700. Her sahne kendi türünde bir oyuna gönderme.
   ===================================================================== */
const RUYA = (() => {
const VW = 400, VH = 700;
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const cl = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const sec = arr => arr[Math.floor(Math.random() * arr.length)];

/* ---------- çizim yardımcıları ---------- */
let c;
function rr(x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
const kutu = (x, y, w, h, f, r) => { rr(x, y, w, h, r || 0); c.fillStyle = f; c.fill(); };
const daire = (x, y, r, f) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = f; c.fill(); };
function yazi(s, x, y, size, f, w, al) {
  c.fillStyle = f; c.textAlign = al || 'center'; c.textBaseline = 'middle';
  c.font = (w || 800) + ' ' + size + 'px -apple-system,"Segoe UI",system-ui,sans-serif';
  c.fillText(s, x, y);
}
function emoji(e, x, y, s) { c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = s + 'px serif'; c.fillText(e, x, y); }
function zemin(a, b) {
  const g = c.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, a); g.addColorStop(1, b);
  c.fillStyle = g; c.fillRect(0, 0, VW, VH);
}

/* ---------- 40+ MİNİ OYUN ---------- */
/* her biri: {ad, emir, sure, kur(S), g(S), ciz(S)}  →  S.done = 'win' | 'fail' */
const OYUNLAR = [

/* 1 — Kafa Topu */
{ad:'Kafa Topu', emir:'KAFA AT!', sure:9, kur(S){
  S.v = {x:120, y:560, bx:200, by:160, vx:rnd(-2,2), vy:1.5, gol:0, hedef:2, gr:.22};
}, g(S){ const v = S.v;
  v.x = lerp(v.x, cl(S.p.x, 40, VW-40), .22);
  v.bx += v.vx; v.by += v.vy; v.vy += v.gr;
  if (v.bx < 14 || v.bx > VW-14) v.vx *= -1;
  const dx = v.bx - v.x, dy = v.by - (v.y - 60);
  /* kafa vuruşu kaleye ulaşabilecek kadar güçlü olmalı */
  if (Math.hypot(dx, dy) < 46 && v.vy > 0) { v.vy = -13.6; v.vx += dx * .17; S.ses('ok'); }
  if (v.by > VH - 40) { v.by = VH - 40; v.vy = -8; v.vx *= .7; }
  if (v.by < 112 && v.bx > 100 && v.bx < 300 && v.vy < 0) { v.gol++; S.puanEkle(1); S.ses('ok');
    v.bx = 200; v.by = 300; v.vy = 1; v.vx = rnd(-3,3); if (v.gol >= v.hedef) S.done = 'win'; }
}, ciz(S){ const v = S.v;
  zemin('#38bdf8', '#0c4a6e');
  kutu(0, VH-40, VW, 40, '#4ade80');
  kutu(100, 60, 200, 12, '#f8fafc', 4); kutu(100, 60, 10, 46, '#f8fafc', 4); kutu(290, 60, 10, 46, '#f8fafc', 4);
  emoji('⚽', v.bx, v.by, 30);
  emoji('🧑', v.x, v.y - 30, 64);
  yazi('GOL ' + v.gol + '/' + v.hedef, VW/2, 30, 20, '#fff');
}},

/* 2 — Clash of Clans */
{ad:'Klan Baskını', emir:'ÜSSÜ YIK!', sure:10, kur(S){
  S.v = {bina:[[200,180,60],[130,260,45],[270,260,45]], asker:[], can:0};
  S.v.can = S.v.bina.reduce((a,b)=>a+b[2],0);
}, g(S){ const v = S.v;
  if (S.tap) { v.asker.push({x:S.p.x, y:VH-70, hp:3}); S.ses('tick'); }
  for (const a of v.asker) {
    let h = null, bd = 1e9;
    for (const b of v.bina) if (b[2] > 0) { const d = Math.hypot(b[0]-a.x, b[1]-a.y); if (d < bd) { bd = d; h = b; } }
    if (!h) { S.done = 'win'; return; }
    const ang = Math.atan2(h[1]-a.y, h[0]-a.x);
    a.x += Math.cos(ang)*2.2; a.y += Math.sin(ang)*2.2;
    if (bd < 34) { h[2] -= .35; if (h[2] <= 0) { S.puanEkle(1); S.ses('ok'); } }
  }
  if (v.bina.every(b => b[2] <= 0)) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#84cc16', '#3f6212');
  for (const b of v.bina) if (b[2] > 0) {
    kutu(b[0]-30, b[1]-30, 60, 60, '#a16207', 8);
    kutu(b[0]-30, b[1]-38, 60, 10, '#dc2626', 4);
    kutu(b[0]-30, b[1]-38, 60*cl(b[2]/60,0,1), 10, '#22c55e', 4);
    emoji('🏰', b[0], b[1], 34);
  }
  for (const a of v.asker) emoji('⚔️', a.x, a.y, 22);
  yazi('DOKUN = ASKER', VW/2, 40, 18, '#fff');
}},

/* 3 — GTA kovalamaca */
{ad:'Şehir Kaçışı', emir:'POLİSTEN KAÇ!', sure:11, zamanKazanir:1, kur(S){
  S.v = {x:200, y:VH-120, polis:[], t:0};
}, g(S){ const v = S.v;
  v.x = lerp(v.x, cl(S.p.x, 40, VW-40), .26); v.t++;
  /* polis oyuncunun tam üstüne doğmasın, kaçacak boşluk kalsın */
  if (v.t % 36 === 0) {
    let px, dene = 0;
    do { px = rnd(40, VW-40); } while (Math.abs(px - v.x) < 95 && ++dene < 12);
    v.polis.push({x:px, y:-40, s:rnd(3.2,4.6)});
  }
  for (let i = v.polis.length-1; i >= 0; i--) { const p = v.polis[i]; p.y += p.s;
    if (Math.hypot(p.x-v.x, p.y-v.y) < 30) { S.done = 'fail'; return; }
    if (p.y > VH+40) { v.polis.splice(i,1); S.puanEkle(1); }
  }
}, ciz(S){ const v = S.v;
  zemin('#1f2937', '#0b1220');
  c.fillStyle = '#374151'; c.fillRect(50, 0, VW-100, VH);
  c.fillStyle = '#fbbf24';
  for (let y = (S.t*5)%60 - 60; y < VH; y += 60) c.fillRect(VW/2-4, y, 8, 30);
  for (const p of v.polis) emoji('🚓', p.x, p.y, 40);
  emoji('🚗', v.x, v.y, 44);
}},

/* 4 — FarmVille */
{ad:'Çiftlik', emir:'HEPSİNİ SULA!', sure:9, kur(S){
  S.v = {t:[]};
  for (let i = 0; i < 9; i++) S.v.t.push({x:80+(i%3)*120, y:220+((i/3)|0)*130, s:0});
}, g(S){ const v = S.v;
  if (S.tap) for (const t of v.t) if (Math.hypot(t.x-S.p.x, t.y-S.p.y) < 52 && t.s < 2) { t.s++; S.ses('ok'); S.puanEkle(1); }
  if (v.t.every(t => t.s >= 2)) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#a3e635', '#4d7c0f');
  for (const t of v.t) {
    kutu(t.x-48, t.y-42, 96, 84, '#78350f', 12);
    emoji(['🌱','🌿','🌻'][t.s], t.x, t.y, 46);
  }
  yazi('İKİ KEZ DOKUN', VW/2, 100, 20, '#1a2e05');
}},

/* 5 — Dragon City */
{ad:'Ejderha Yumurtası', emir:'YUMURTAYI KIR!', sure:8, kur(S){ S.v = {v:0, hedef:22, patlak:0}; },
 g(S){ const v = S.v;
  if (S.tap) { v.v++; S.ses('tick'); if (v.v >= v.hedef) { v.patlak = 1; S.puanEkle(3); S.ses('ok'); S.done = 'win'; } }
}, ciz(S){ const v = S.v;
  zemin('#f0abfc', '#701a75');
  const k = 1 + Math.sin(S.t*.4)*.04 + v.v*.008;
  c.save(); c.translate(VW/2, 360); c.scale(k, k);
  emoji(v.patlak ? '🐉' : '🥚', 0, 0, 190); c.restore();
  kutu(70, 560, 260, 22, 'rgba(0,0,0,.35)', 11);
  kutu(70, 560, 260*(v.v/v.hedef), 22, '#fde047', 11);
  yazi('DELİ GİBİ DOKUN', VW/2, 130, 22, '#fff');
}},

/* 6 — Flappy */
{ad:'Kanat Çırp', emir:'ÇARPMA!', sure:11, zamanKazanir:1, kur(S){ S.v = {y:340, vy:0, b:[], t:0, gec:0}; },
 g(S){ const v = S.v;
  if (S.tap) { v.vy = -6.6; S.ses('tick'); }
  v.vy += .42; v.y += v.vy; v.t++;
  if (v.t % 62 === 0) v.b.push({x:VW+40, gy:rnd(170,470), g:150});
  for (let i = v.b.length-1; i >= 0; i--) { const b = v.b[i]; b.x -= 3.4;
    if (Math.abs(b.x-110) < 30 && (v.y < b.gy-b.g/2 || v.y > b.gy+b.g/2)) { S.done = 'fail'; return; }
    if (b.x < 80 && !b.p) { b.p = 1; v.gec++; S.puanEkle(1); }
    if (b.x < -50) v.b.splice(i,1);
  }
  if (v.y < 0 || v.y > VH) S.done = 'fail';
}, ciz(S){ const v = S.v;
  zemin('#7dd3fc', '#0369a1');
  for (const b of v.b) { kutu(b.x-30, 0, 60, b.gy-b.g/2, '#22c55e', 8);
    kutu(b.x-30, b.gy+b.g/2, 60, VH, '#22c55e', 8); }
  c.save(); c.translate(110, v.y); c.rotate(cl(v.vy*.06,-.6,.9)); emoji('🐤', 0, 0, 44); c.restore();
}},

/* 7 — Angry Birds */
{ad:'Sapan', emir:'DOMUZU VUR!', sure:10, kur(S){
  S.v = {hx:rnd(250,350), hy:rnd(300,520), m:null, at:0, vur:0};
}, g(S){ const v = S.v;
  if (S.p.justUp && !v.m) {
    const dx = 70 - S.p.x, dy = 560 - S.p.y;
    v.m = {x:70, y:560, vx:dx*.16, vy:dy*.16}; v.at++; S.ses('tick');
  }
  if (v.m) { v.m.x += v.m.vx; v.m.y += v.m.vy; v.m.vy += .34;
    if (Math.hypot(v.m.x-v.hx, v.m.y-v.hy) < 34) { v.vur++; S.puanEkle(2); S.ses('ok'); S.done = 'win'; }
    if (v.m.y > VH || v.m.x > VW+40) { v.m = null; if (v.at >= 3) S.done = 'fail'; }
  }
}, ciz(S){ const v = S.v;
  zemin('#fde68a', '#d97706');
  kutu(0, VH-70, VW, 70, '#65a30d');
  emoji('🐷', v.hx, v.hy, 52);
  emoji('🪃', 70, 560, 34);
  if (S.p.down && !v.m) { c.strokeStyle = '#7c2d12'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(70,560); c.lineTo(S.p.x, S.p.y); c.stroke(); }
  if (v.m) emoji('🔴', v.m.x, v.m.y, 26);
  yazi('ÇEK ve BIRAK · ' + (3-v.at) + ' hak', VW/2, 40, 18, '#7c2d12');
}},

/* 8 — Fruit Ninja */
{ad:'Meyve Kes', emir:'KES!', sure:9, kur(S){ S.v = {m:[], t:0, k:0, hedef:8}; },
 g(S){ const v = S.v; v.t++;
  if (v.t % 22 === 0) v.m.push({x:rnd(60,VW-60), y:VH+30, vx:rnd(-1.6,1.6), vy:rnd(-15,-12), e:sec(['🍉','🍎','🍊','🍇','🍓','🥝']), k:0});
  for (let i = v.m.length-1; i >= 0; i--) { const m = v.m[i]; m.x += m.vx; m.y += m.vy; m.vy += .34;
    if (!m.k && S.p.down && Math.hypot(m.x-S.p.x, m.y-S.p.y) < 44) { m.k = 1; v.k++; S.puanEkle(1); S.ses('ok');
      if (v.k >= v.hedef) S.done = 'win'; }
    if (m.y > VH + 60) v.m.splice(i,1);
  }
}, ciz(S){ const v = S.v;
  zemin('#1e1b4b', '#0f0a2e');
  for (const m of v.m) { if (m.k) { c.globalAlpha = .35; } emoji(m.e, m.x, m.y, 52); c.globalAlpha = 1; }
  if (S.p.down) daire(S.p.x, S.p.y, 12, 'rgba(255,255,255,.6)');
  yazi(v.k + '/' + v.hedef, VW/2, 40, 24, '#fff');
}},

/* 9 — Temple Run */
{ad:'Tapınak Koşusu', emir:'ŞERİT DEĞİŞ!', sure:11, zamanKazanir:1, kur(S){ S.v = {s:1, eng:[], t:0}; },
 g(S){ const v = S.v; v.t++;
  if (S.sw && Math.abs(S.sw.dx) > 24) { v.s = cl(v.s + (S.sw.dx>0?1:-1), 0, 2); S.ses('tick'); }
  /* aynı anda üç şerit birden kapanmasın, yoksa kaçış imkânsız oluyor */
  if (v.t % 40 === 0) {
    const dolu = v.eng.filter(e => e.y > -260 && e.y < 240).map(e => e.s);
    const bos = [0,1,2].filter(s => !dolu.includes(s));
    if (bos.length > 1) v.eng.push({s: sec(bos.slice(0, bos.length-1)), y:-40});
  }
  for (let i = v.eng.length-1; i >= 0; i--) { const e = v.eng[i]; e.y += 7.4;
    if (e.y > 520 && e.y < 600 && e.s === v.s) { S.done = 'fail'; return; }
    if (e.y > VH+40) { v.eng.splice(i,1); S.puanEkle(1); }
  }
}, ciz(S){ const v = S.v;
  zemin('#78350f', '#1c1108');
  for (let i = 0; i < 3; i++) kutu(50+i*105, 0, 95, VH, i===v.s?'#a16207':'#92400e', 0);
  for (const e of v.eng) emoji('🔥', 97+e.s*105, e.y, 46);
  emoji('🏃', 97+v.s*105, 560, 52);
  yazi('KAYDIR', VW/2, 40, 20, '#fde68a');
}},

/* 10 — Candy Crush */
{ad:'Şeker Patlat', emir:'ÜÇLÜYÜ BUL!', sure:10, kur(S){
  const E = ['🍬','🍭','🍫','🧁'];
  S.v = {g:[], sec:null, k:0};
  for (let i = 0; i < 25; i++) S.v.g.push(sec(E));
}, g(S){ const v = S.v;
  if (S.tap) {
    const gx = Math.floor((S.p.x-40)/64), gy = Math.floor((S.p.y-220)/64);
    if (gx>=0&&gx<5&&gy>=0&&gy<5) { const i = gy*5+gx;
      if (v.sec === null) { v.sec = i; S.ses('tick'); }
      else { const a = v.sec, b = i;
        if (a !== b) { const t = v.g[a]; v.g[a] = v.g[b]; v.g[b] = t; }
        v.sec = null;
        // eşleşme kontrolü
        for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
          const k = y*5+x;
          if (v.g[k] && v.g[k] === v.g[k+1] && v.g[k] === v.g[k+2]) {
            v.g[k] = v.g[k+1] = v.g[k+2] = sec(['🍬','🍭','🍫','🧁']);
            v.k++; S.puanEkle(1); S.ses('ok');
          }
        }
        if (v.k >= 3) S.done = 'win';
      }
    }
  }
}, ciz(S){ const v = S.v;
  zemin('#fbcfe8', '#831843');
  for (let i = 0; i < 25; i++) { const x = 40+(i%5)*64, y = 220+((i/5)|0)*64;
    kutu(x, y, 58, 58, v.sec===i?'#fff':'rgba(255,255,255,.35)', 12);
    emoji(v.g[i], x+29, y+29, 36); }
  yazi('ÜÇ AYNI YAN YANA · ' + v.k + '/3', VW/2, 140, 19, '#fff');
}},

/* 11 — Tetris */
{ad:'Blok Yerleştir', emir:'BOŞLUĞA OTURT!', sure:9, kur(S){
  S.v = {x:200, y:-30, bx:ri(0,5), duvar:[], vy:2.6};
  for (let i = 0; i < 6; i++) S.v.duvar.push(i === S.v.bx ? 0 : ri(90,150));
}, g(S){ const v = S.v;
  v.x = lerp(v.x, cl(S.p.x, 55, VW-55), .25); v.y += v.vy;
  if (v.y > VH-120) { const s = Math.floor((v.x-40)/54);
    if (s === v.bx) { S.puanEkle(2); S.ses('ok'); S.done = 'win'; } else S.done = 'fail'; }
}, ciz(S){ const v = S.v;
  zemin('#0f172a', '#020617');
  for (let i = 0; i < 6; i++) if (v.duvar[i]) kutu(40+i*54, VH-100, 50, v.duvar[i], '#38bdf8', 6);
  kutu(v.x-25, v.y-25, 50, 50, '#f59e0b', 8);
  yazi('BOŞ SÜTUNA GETİR', VW/2, 60, 20, '#fff');
}},

/* 12 — Pac-Man */
{ad:'Nokta Yiyici', emir:'HEPSİNİ YE!', sure:11, kur(S){
  S.v = {x:200, y:400, n:[], h:{x:60,y:100}, ye:0};
  for (let i = 0; i < 10; i++) S.v.n.push({x:rnd(50,VW-50), y:rnd(150,VH-90), v:0});
}, g(S){ const v = S.v;
  v.x = lerp(v.x, S.p.down?S.p.x:v.x, .16); v.y = lerp(v.y, S.p.down?S.p.y:v.y, .16);
  const a = Math.atan2(v.y-v.h.y, v.x-v.h.x);
  v.h.x += Math.cos(a)*1.35; v.h.y += Math.sin(a)*1.35;
  if (Math.hypot(v.h.x-v.x, v.h.y-v.y) < 30) { S.done = 'fail'; return; }
  for (const n of v.n) if (!n.v && Math.hypot(n.x-v.x, n.y-v.y) < 26) { n.v = 1; v.ye++; S.puanEkle(1); S.ses('tick'); }
  if (v.ye >= v.n.length) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#020617', '#0b1220');
  for (const n of v.n) if (!n.v) daire(n.x, n.y, 7, '#fde047');
  emoji('👻', v.h.x, v.h.y, 42);
  emoji('🟡', v.x, v.y, 44);
  yazi('PARMAĞINI SÜRÜKLE', VW/2, 60, 18, '#fff');
}},

/* 13 — Snake */
{ad:'Yılan', emir:'ELMAYI KAP!', sure:10, kur(S){
  S.v = {s:[{x:200,y:400}], d:{x:0,y:-1}, e:{x:200,y:200}, uz:5, ye:0, t:0};
}, g(S){ const v = S.v; v.t++;
  if (S.sw) { if (Math.abs(S.sw.dx) > Math.abs(S.sw.dy)) v.d = {x:Math.sign(S.sw.dx), y:0};
    else v.d = {x:0, y:Math.sign(S.sw.dy)}; }
  if (v.t % 5 === 0) {
    const h = {x:v.s[0].x+v.d.x*20, y:v.s[0].y+v.d.y*20};
    if (h.x < 20 || h.x > VW-20 || h.y < 120 || h.y > VH-20) { S.done = 'fail'; return; }
    v.s.unshift(h); while (v.s.length > v.uz) v.s.pop();
    if (Math.hypot(h.x-v.e.x, h.y-v.e.y) < 22) { v.uz += 3; v.ye++; S.puanEkle(1); S.ses('ok');
      v.e = {x:rnd(40,VW-40), y:rnd(150,VH-40)}; if (v.ye >= 3) S.done = 'win'; }
  }
}, ciz(S){ const v = S.v;
  zemin('#052e16', '#010f07');
  v.s.forEach((p,i) => kutu(p.x-9, p.y-9, 18, 18, i?'#4ade80':'#bbf7d0', 5));
  emoji('🍎', v.e.x, v.e.y, 26);
  yazi('KAYDIRARAK YÖNLENDİR', VW/2, 70, 17, '#86efac');
}},

/* 14 — Space Invaders */
{ad:'Uzaylılar', emir:'ATEŞ ET!', sure:10, kur(S){
  S.v = {x:200, m:[], u:[], t:0, vur:0};
  for (let i = 0; i < 8; i++) S.v.u.push({x:60+(i%4)*90, y:150+((i/4)|0)*70, v:0});
}, g(S){ const v = S.v; v.t++;
  v.x = lerp(v.x, cl(S.p.x, 30, VW-30), .25);
  if (S.tap) { v.m.push({x:v.x, y:VH-90}); S.ses('tick'); }
  for (let i = v.m.length-1; i >= 0; i--) { const m = v.m[i]; m.y -= 9;
    for (const u of v.u) if (!u.v && Math.abs(u.x-m.x) < 28 && Math.abs(u.y-m.y) < 28) {
      u.v = 1; v.vur++; S.puanEkle(1); S.ses('ok'); m.y = -99; }
    if (m.y < -20) v.m.splice(i,1);
  }
  for (const u of v.u) u.y += .18;
  if (v.u.every(u => u.v)) S.done = 'win';
  if (v.u.some(u => !u.v && u.y > VH-140)) S.done = 'fail';
}, ciz(S){ const v = S.v;
  zemin('#020617', '#170b32');
  for (const u of v.u) if (!u.v) emoji('👾', u.x, u.y, 40);
  for (const m of v.m) kutu(m.x-3, m.y-14, 6, 20, '#fde047', 3);
  emoji('🚀', v.x, VH-70, 46);
}},

/* 15 — Frogger */
{ad:'Karşıya Geç', emir:'YOLU GEÇ!', sure:10, kur(S){
  S.v = {x:200, y:VH-50, a:[]};
  for (let i = 0; i < 5; i++) S.v.a.push({y:180+i*80, x:rnd(0,VW), s:rnd(2,4.6)*(i%2?1:-1)});
}, g(S){ const v = S.v;
  if (S.tap) { v.y -= 80; S.ses('tick'); }
  for (const a of v.a) { a.x += a.s; if (a.x > VW+40) a.x = -40; if (a.x < -40) a.x = VW+40;
    if (Math.abs(a.y-v.y) < 26 && Math.abs(a.x-v.x) < 34) { S.done = 'fail'; return; } }
  v.x = lerp(v.x, cl(S.p.x, 20, VW-20), .14);
  if (v.y < 130) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
}, ciz(S){ const v = S.v;
  zemin('#374151', '#111827');
  kutu(0, 100, VW, 50, '#16a34a');
  for (const a of v.a) emoji(a.s>0?'🚙':'🚚', a.x, a.y, 40);
  emoji('🐸', v.x, v.y, 40);
  yazi('DOKUN = İLERİ', VW/2, 60, 18, '#fff');
}},

/* 16 — Whack a mole */
{ad:'Köstebek', emir:'VUR!', sure:8, kur(S){ S.v = {d:Array(9).fill(0), t:0, v:0, hedef:7}; },
 g(S){ const v = S.v; v.t++;
  if (v.t % 26 === 0) v.d[ri(0,8)] = 34;
  for (let i = 0; i < 9; i++) if (v.d[i] > 0) v.d[i]--;
  if (S.tap) { const gx = Math.floor((S.p.x-45)/105), gy = Math.floor((S.p.y-230)/115);
    const i = gy*3+gx;
    if (gx>=0&&gx<3&&gy>=0&&gy<3&&v.d[i]>0) { v.d[i]=0; v.v++; S.puanEkle(1); S.ses('ok');
      if (v.v >= v.hedef) S.done = 'win'; } }
}, ciz(S){ const v = S.v;
  zemin('#a16207', '#451a03');
  for (let i = 0; i < 9; i++) { const x = 45+(i%3)*105, y = 230+((i/3)|0)*115;
    daire(x+45, y+45, 44, '#292524');
    if (v.d[i] > 0) emoji('🐹', x+45, y+40, 52); }
  yazi(v.v + '/' + v.hedef, VW/2, 150, 26, '#fff');
}},

/* 17 — Doodle Jump */
{ad:'Zıpla', emir:'YUKARI ÇIK!', sure:11, zamanKazanir:1, kur(S){
  S.v = {x:200, y:500, vy:-9, p:[], yuk:0};
  for (let i = 0; i < 9; i++) S.v.p.push({x:rnd(50,VW-50), y:VH-i*80});
}, g(S){ const v = S.v;
  v.x = lerp(v.x, cl(S.p.x, 25, VW-25), .2);
  v.vy += .34; v.y += v.vy;
  if (v.y < 320 && v.vy < 0) { const d = 320-v.y; v.y = 320; v.yuk += d;
    for (const p of v.p) { p.y += d; if (p.y > VH+20) { p.y = rnd(-40,10); p.x = rnd(50,VW-50); } } }
  for (const p of v.p) if (v.vy > 0 && Math.abs(v.x-p.x) < 45 && Math.abs(v.y+20-p.y) < 14) {
    v.vy = -11.4; S.ses('tick'); S.puanEkle(1); }
  if (v.y > VH+40) S.done = 'fail';
  if (v.yuk > 1500) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#c4b5fd', '#4c1d95');
  for (const p of v.p) kutu(p.x-42, p.y, 84, 14, '#22c55e', 7);
  emoji('👾', v.x, v.y, 42);
  kutu(20, 60, VW-40, 12, 'rgba(0,0,0,.3)', 6);
  kutu(20, 60, (VW-40)*cl(v.yuk/1500,0,1), 12, '#fde047', 6);
}},

/* 18 — 2048 */
{ad:'2048', emir:'BİRLEŞTİR!', sure:9, kur(S){ S.v = {a:[2,2,4,8], k:0}; },
 g(S){ const v = S.v;
  if (S.sw && Math.abs(S.sw.dx)+Math.abs(S.sw.dy) > 24) {
    const b = [];
    for (let i = 0; i < v.a.length; i++) {
      if (b.length && b[b.length-1] === v.a[i]) { b[b.length-1] *= 2; v.k++; S.puanEkle(1); S.ses('ok'); }
      else b.push(v.a[i]);
    }
    v.a = b;
    if (v.a.length === 1 || v.k >= 2) S.done = 'win';
    else if (!v.k) v.a.push(sec([2,4]));
  }
}, ciz(S){ const v = S.v;
  zemin('#fef3c7', '#92400e');
  v.a.forEach((n,i) => { const x = 40+i*88;
    kutu(x, 320, 78, 78, ['#fde68a','#fbbf24','#f97316','#ef4444','#a855f7'][Math.log2(n)-1]||'#7c3aed', 12);
    yazi(n, x+39, 359, 30, '#422006'); });
  yazi('KAYDIR = BİRLEŞTİR', VW/2, 200, 20, '#451a03');
}},

/* 19 — Piano Tiles */
{ad:'Piyano', emir:'SİYAHA BAS!', sure:9, kur(S){ S.v = {t:[], tt:0, v:0, hedef:10}; },
 g(S){ const v = S.v; v.tt++;
  if (v.tt % 16 === 0) v.t.push({s:ri(0,3), y:-110});
  for (let i = v.t.length-1; i >= 0; i--) { const t = v.t[i]; t.y += 7;
    if (t.y > VH) { if (!t.v) { S.done = 'fail'; return; } v.t.splice(i,1); } }
  if (S.tap) { const s = Math.floor(S.p.x/(VW/4));
    const h = v.t.find(t => !t.v && t.s === s && S.p.y > t.y && S.p.y < t.y+110);
    if (h) { h.v = 1; v.v++; S.puanEkle(1); S.ses('note'+s); if (v.v >= v.hedef) S.done = 'win'; }
    else { S.done = 'fail'; } }
}, ciz(S){ const v = S.v;
  c.fillStyle = '#f8fafc'; c.fillRect(0,0,VW,VH);
  for (let i = 1; i < 4; i++) { c.strokeStyle = '#e2e8f0'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(i*VW/4, 0); c.lineTo(i*VW/4, VH); c.stroke(); }
  for (const t of v.t) kutu(t.s*VW/4+3, t.y, VW/4-6, 106, t.v?'#94a3b8':'#0f172a', 8);
  yazi(v.v + '/' + v.hedef, VW/2, 40, 24, '#0f172a');
}},

/* 20 — Ritim halkaları (osu) */
{ad:'Ritim', emir:'HALKAYA TAM VUR!', sure:9, kur(S){ S.v = {h:[], t:0, v:0, hedef:5}; },
 g(S){ const v = S.v; v.t++;
  if (v.t % 40 === 0) v.h.push({x:rnd(70,VW-70), y:rnd(200,VH-140), r:70});
  for (let i = v.h.length-1; i >= 0; i--) { const h = v.h[i]; h.r -= 1.1;
    if (h.r < 14) { S.done = 'fail'; return; } }
  if (S.tap) { const h = v.h[0];
    if (h && Math.hypot(h.x-S.p.x, h.y-S.p.y) < 46 && h.r < 40) {
      v.h.shift(); v.v++; S.puanEkle(1); S.ses('ok'); if (v.v >= v.hedef) S.done = 'win'; }
    else S.done = 'fail'; }
}, ciz(S){ const v = S.v;
  zemin('#4c0519', '#1a0208');
  v.h.forEach((h,i) => { c.strokeStyle = i?'rgba(255,255,255,.3)':'#f0abfc'; c.lineWidth = 5;
    c.beginPath(); c.arc(h.x, h.y, h.r, 0, TAU); c.stroke();
    daire(h.x, h.y, 26, i?'rgba(255,255,255,.15)':'#fbcfe8'); });
  yazi('HALKA KÜÇÜLÜNCE', VW/2, 90, 18, '#fff');
}},

/* 21 — Breakout */
{ad:'Tuğla Kır', emir:'TUĞLALARI KIR!', sure:11, kur(S){
  /* 11 saniyede 15 tuğla kırılamıyordu — 8 tuğla ve daha hızlı top */
  S.v = {px:200, bx:200, by:480, vx:4.6, vy:-6.4, t:[]};
  for (let i = 0; i < 5; i++) S.v.t.push({x:20+i*74, y:190, v:0});
}, g(S){ const v = S.v;
  v.px = lerp(v.px, cl(S.p.x, 45, VW-45), .3);
  v.bx += v.vx; v.by += v.vy;
  if (v.bx < 10 || v.bx > VW-10) v.vx *= -1;
  if (v.by < 100) v.vy *= -1;
  if (v.by > VH-90 && Math.abs(v.bx-v.px) < 50 && v.vy > 0) { v.vy = -Math.abs(v.vy); v.vx += (v.bx-v.px)*.09; S.ses('tick'); }
  if (v.by > VH) { S.done = 'fail'; return; }
  for (const t of v.t) if (!t.v && Math.abs(t.x+33-v.bx) < 42 && Math.abs(t.y+13-v.by) < 22) {
    t.v = 1; v.vy *= -1; S.puanEkle(1); S.ses('ok'); }
  if (v.t.every(t => t.v)) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#0c4a6e', '#020617');
  v.t.forEach((t,i) => { if (!t.v) kutu(t.x, t.y, 66, 26, ['#f87171','#fbbf24','#4ade80'][i%3], 5); });
  kutu(v.px-45, VH-80, 90, 14, '#f8fafc', 7);
  daire(v.bx, v.by, 9, '#fde047');
}},

/* 22 — Basket */
{ad:'Basket', emir:'POTAYA AT!', sure:9, kur(S){ S.v = {m:null, at:0, sk:0, px:rnd(120,280)}; },
 g(S){ const v = S.v;
  /* fiske: topun üstünden potaya doğru sürükle-bırak (eskiden topun ALTINA
     çekmek gerekiyordu, ekranda o alan yoktu ve oyun kazanılamıyordu) */
  if (S.p.justUp && !v.m) { const dx = S.p.x-200, dy = S.p.y-600;
    v.m = {x:200, y:600, vx:dx*.055, vy:dy*.055}; v.at++; S.ses('tick'); }
  if (v.m) { v.m.x += v.m.vx; v.m.y += v.m.vy; v.m.vy += .32;
    if (Math.abs(v.m.x-v.px) < 34 && Math.abs(v.m.y-240) < 16 && v.m.vy > 0) {
      v.sk++; S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
    if (v.m.y > VH || v.m.x < -40 || v.m.x > VW+40) { v.m = null; if (v.at >= 3) S.done = 'fail'; }
  }
}, ciz(S){ const v = S.v;
  zemin('#f59e0b', '#7c2d12');
  kutu(v.px-40, 200, 80, 12, '#fff', 4);
  kutu(v.px-34, 240, 68, 8, '#dc2626', 4);
  if (v.m) emoji('🏀', v.m.x, v.m.y, 34); else emoji('🏀', 200, 600, 34);
  if (S.p.down && !v.m) { c.strokeStyle = '#fff'; c.lineWidth = 4; c.setLineDash([8,8]);
    c.beginPath(); c.moveTo(200,600); c.lineTo(S.p.x,S.p.y); c.stroke(); c.setLineDash([]); }
  yazi('POTAYA DOĞRU FİSKE · ' + (3-v.at) + ' hak', VW/2, 110, 17, '#fff');
}},

/* 23 — Penaltı */
{ad:'Penaltı', emir:'KÖŞEYİ SEÇ!', sure:7, kur(S){ S.v = {k:ri(0,2), sec:-1, t:0}; },
 g(S){ const v = S.v;
  if (S.tap && v.sec < 0) { v.sec = S.p.x < 150 ? 0 : S.p.x > 250 ? 2 : 1; S.ses('tick'); }
  if (v.sec >= 0) { v.t++;
    if (v.t > 40) { if (v.sec !== v.k) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; } else S.done = 'fail'; } }
}, ciz(S){ const v = S.v;
  zemin('#22c55e', '#14532d');
  kutu(40, 180, 320, 180, 'rgba(255,255,255,.15)', 8);
  kutu(40, 180, 320, 12, '#fff', 4); kutu(40, 180, 12, 180, '#fff', 4); kutu(348, 180, 12, 180, '#fff', 4);
  const kx = [110, 200, 290][v.sec < 0 ? 1 : v.k];
  emoji('🧤', v.sec < 0 ? 200 : kx, 300, 54);
  if (v.sec >= 0) emoji('⚽', [110,200,290][v.sec], 340 - v.t*3, 34);
  else emoji('⚽', 200, 560, 34);
  yazi('SOL · ORTA · SAĞ', VW/2, 110, 20, '#fff');
}},

/* 24 — Balık tut */
{ad:'Balık Tut', emir:'BALIĞI YAKALA!', sure:9, kur(S){
  S.v = {oy:150, b:[], t:0, tut:0, hedef:3};
  for (let i = 0; i < 6; i++) S.v.b.push({x:rnd(0,VW), y:rnd(320,640), s:rnd(1,2.6)*(i%2?1:-1)});
}, g(S){ const v = S.v; v.t++;
  v.oy = S.p.down ? lerp(v.oy, S.p.y, .14) : lerp(v.oy, 150, .06);
  for (const b of v.b) { b.x += b.s; if (b.x > VW+30) b.x = -30; if (b.x < -30) b.x = VW+30;
    if (!b.v && Math.abs(b.y-v.oy) < 22 && Math.abs(b.x-200) < 26) { b.v = 1; v.tut++; S.puanEkle(1); S.ses('ok');
      if (v.tut >= v.hedef) S.done = 'win'; } }
}, ciz(S){ const v = S.v;
  zemin('#38bdf8', '#082f49');
  c.strokeStyle = '#e2e8f0'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(200, 0); c.lineTo(200, v.oy); c.stroke();
  emoji('🪝', 200, v.oy, 30);
  for (const b of v.b) if (!b.v) emoji(b.s>0?'🐟':'🐠', b.x, b.y, 36);
  yazi(v.tut + '/' + v.hedef, VW/2, 40, 24, '#fff');
}},

/* 25 — Diner Dash */
{ad:'Restoran', emir:'SİPARİŞİ VER!', sure:10, kur(S){
  const E = ['🍔','🍕','🍟','🌭'];
  S.v = {ist:sec(E), sec:E, v:0, hedef:5};
}, g(S){ const v = S.v;
  if (S.tap) { const i = Math.floor((S.p.x-20)/95);
    if (i>=0&&i<4&&S.p.y>500&&S.p.y<620) {
      if (v.sec[i] === v.ist) { v.v++; S.puanEkle(1); S.ses('ok'); v.ist = sec(v.sec);
        if (v.v >= v.hedef) S.done = 'win'; }
      else S.done = 'fail'; } }
}, ciz(S){ const v = S.v;
  zemin('#fca5a5', '#7f1d1d');
  emoji('🧑‍🍳', 200, 240, 90);
  kutu(90, 320, 220, 90, '#fff', 16);
  emoji(v.ist, 200, 365, 62);
  v.sec.forEach((e,i) => { kutu(20+i*95, 500, 85, 120, 'rgba(255,255,255,.85)', 16); emoji(e, 62+i*95, 560, 52); });
  yazi(v.v + '/' + v.hedef, VW/2, 140, 24, '#fff');
}},

/* 26 — Plants vs Zombies */
{ad:'Bitki Savunma', emir:'BİTKİ DİK!', sure:11, kur(S){
  S.v = {b:[], z:[], m:[], t:0, gec:0};
}, g(S){ const v = S.v; v.t++;
  if (S.tap && S.p.x < 160) { v.b.push({x:cl(S.p.x,50,140), y:cl(S.p.y,200,600), cd:0}); S.ses('tick'); }
  if (v.t % 60 === 0) v.z.push({x:VW+30, y:sec([240,360,480,580])});
  for (const b of v.b) { b.cd--; if (b.cd <= 0) { b.cd = 45; v.m.push({x:b.x, y:b.y}); } }
  for (let i = v.m.length-1; i >= 0; i--) { const m = v.m[i]; m.x += 6.5;
    for (const z of v.z) if (!z.v && Math.abs(z.y-m.y) < 34 && Math.abs(z.x-m.x) < 26) {
      z.v = 1; v.gec++; S.puanEkle(1); S.ses('ok'); m.x = VW+99; }
    if (m.x > VW) v.m.splice(i,1); }
  for (const z of v.z) if (!z.v) { z.x -= 1.1; if (z.x < 30) { S.done = 'fail'; return; } }
  if (v.gec >= 4) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#65a30d', '#1a2e05');
  c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, 0, 160, VH);
  for (const b of v.b) emoji('🌻', b.x, b.y, 42);
  for (const m of v.m) daire(m.x, m.y, 7, '#bef264');
  for (const z of v.z) if (!z.v) emoji('🧟', z.x, z.y, 44);
  yazi('SOLA DOKUN = BİTKİ', VW/2, 60, 18, '#fff');
}},

/* 27 — Keskin nişancı */
{ad:'Hedefi Bul', emir:'DOĞRU OLANI BUL!', sure:8, kur(S){
  S.v = {k:[], h:ri(0,17)};
  for (let i = 0; i < 18; i++) S.v.k.push({x:40+(i%4)*95, y:200+((i/4)|0)*95, e:i===S.v.h?'🤠':'🧑'});
}, g(S){ const v = S.v;
  if (S.tap) { const i = v.k.findIndex(k => Math.hypot(k.x-S.p.x, k.y-S.p.y) < 40);
    if (i === v.h) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
    else if (i >= 0) S.done = 'fail'; }
}, ciz(S){ const v = S.v;
  zemin('#292524', '#0c0a09');
  for (const k of v.k) emoji(k.e, k.x, k.y, 46);
  yazi('ŞAPKALIYI BUL', VW/2, 130, 22, '#fbbf24');
}},

/* 28 — Park et */
{ad:'Park', emir:'BOŞLUĞA PARK ET!', sure:9, kur(S){ S.v = {x:60, y:600, hedef:{x:rnd(90,310), y:rnd(200,380)}}; },
 g(S){ const v = S.v;
  if (S.p.down) { v.x = lerp(v.x, S.p.x, .09); v.y = lerp(v.y, S.p.y, .09); }
  if (Math.hypot(v.x-v.hedef.x, v.y-v.hedef.y) < 22) { S.puanEkle(2); S.ses('ok'); S.done = 'win'; }
}, ciz(S){ const v = S.v;
  zemin('#475569', '#0f172a');
  c.strokeStyle = '#fbbf24'; c.lineWidth = 4; c.setLineDash([10,8]);
  c.strokeRect(v.hedef.x-38, v.hedef.y-52, 76, 104); c.setLineDash([]);
  emoji('🅿️', v.hedef.x, v.hedef.y, 40);
  emoji('🚙', v.x, v.y, 50);
  yazi('SÜRÜKLE', VW/2, 90, 20, '#fff');
}},

/* 29 — Helix Jump */
{ad:'Delikten Geç', emir:'DELİĞE DÜŞ!', sure:10, kur(S){
  S.v = {y:120, vy:0, d:[], gec:0};
  for (let i = 0; i < 5; i++) S.v.d.push({y:260+i*110, gx:rnd(70,330)});
}, g(S){ const v = S.v;
  v.vy += .4; v.y += v.vy;
  const x = cl(S.p.down ? S.p.x : 200, 20, VW-20);
  for (const d of v.d) if (!d.g && v.y > d.y-8 && v.y < d.y+16 && v.vy > 0) {
    if (Math.abs(x-d.gx) < 42) { d.g = 1; v.gec++; S.puanEkle(1); S.ses('ok'); }
    else { v.vy = -8; S.ses('bad'); }
  }
  if (v.gec >= 4) S.done = 'win';
  if (v.y < 40) S.done = 'fail';
  v.x = x;
}, ciz(S){ const v = S.v;
  zemin('#f0abfc', '#4a044e');
  for (const d of v.d) if (!d.g) { kutu(0, d.y, d.gx-42, 16, '#a21caf', 6);
    kutu(d.gx+42, d.y, VW, 16, '#a21caf', 6); }
  daire(v.x || 200, v.y, 16, '#fde047');
  yazi(v.gec + '/4', VW/2, 60, 24, '#fff');
}},

/* 30 — Renk değiştir */
{ad:'Renk Kapısı', emir:'AYNI RENGE GİR!', sure:9, kur(S){
  const R = ['#ef4444','#3b82f6','#22c55e','#eab308'];
  /* top sabit hızla yükselir, sen sadece rengi ayarlarsın —
     eskiden zıplama yüksekliği kapılara yetmiyordu, oyun bitirilemiyordu */
  S.v = {R, renk:0, y:640, vy:-2.3, k:[], gec:0};
  for (let i = 0; i < 4; i++) S.v.k.push({y:500-i*130, r:ri(0,3)});
}, g(S){ const v = S.v;
  if (S.tap) { v.renk = (v.renk+1) % 4; S.ses('note1'); }
  v.y += v.vy;
  for (const k of v.k) if (!k.g && Math.abs(v.y-k.y) < 14) {
    if (k.r === v.renk) { k.g = 1; v.gec++; S.puanEkle(1); S.ses('ok'); }
    else { S.done = 'fail'; return; } }
  if (v.gec >= 4) S.done = 'win';
  if (v.y < -30) S.done = 'fail';
}, ciz(S){ const v = S.v;
  zemin('#0f172a', '#020617');
  for (const k of v.k) if (!k.g) kutu(60, k.y-9, VW-120, 18, v.R[k.r], 9);
  daire(200, v.y, 17, v.R[v.renk]);
  yazi('DOKUN = RENK DEĞİŞTİR', VW/2, 60, 18, '#fff');
  yazi(v.gec + '/4', VW/2, 92, 22, '#fde047');
}},

/* 31 — İpi kes */
{ad:'İpi Kes', emir:'İPİ KES!', sure:8, kur(S){
  S.v = {x:200, y:220, vy:0, kesildi:0, agiz:{x:rnd(90,310), y:600}};
}, g(S){ const v = S.v;
  if (!v.kesildi) { if (S.p.down && Math.abs(S.p.x-200) < 60 && Math.abs(S.p.y-160) < 60) { v.kesildi = 1; S.ses('tick'); } }
  else { v.vy += .34; v.y += v.vy; v.x = lerp(v.x, v.agiz.x, .05);
    if (Math.hypot(v.x-v.agiz.x, v.y-v.agiz.y) < 42) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
    if (v.y > VH) S.done = 'fail'; }
}, ciz(S){ const v = S.v;
  zemin('#a3e635', '#365314');
  if (!v.kesildi) { c.strokeStyle = '#78350f'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(200, 60); c.lineTo(v.x, v.y); c.stroke(); }
  emoji('🍬', v.x, v.y, 40);
  emoji('🐸', v.agiz.x, v.agiz.y, 66);
  if (!v.kesildi) yazi('İPE DOKUN', VW/2, 150, 20, '#1a2e05');
}},

/* 32 — Balon patlat (renk seçici) */
{ad:'Balon', emir:'SADECE KIRMIZI!', sure:9, kur(S){ S.v = {b:[], t:0, v:0, hedef:6}; },
 g(S){ const v = S.v; v.t++;
  if (v.t % 18 === 0) v.b.push({x:rnd(40,VW-40), y:VH+30, k:Math.random()<.5, s:rnd(1.8,3.4)});
  for (let i = v.b.length-1; i >= 0; i--) { const b = v.b[i]; b.y -= b.s;
    if (S.tap && Math.hypot(b.x-S.p.x, b.y-S.p.y) < 34) {
      if (b.k) { v.v++; S.puanEkle(1); S.ses('ok'); if (v.v >= v.hedef) S.done = 'win'; }
      else { S.done = 'fail'; return; }
      v.b.splice(i,1); continue; }
    if (b.y < -40) v.b.splice(i,1); }
}, ciz(S){ const v = S.v;
  zemin('#bae6fd', '#0369a1');
  for (const b of v.b) emoji(b.k ? '🎈' : '🔵', b.x, b.y, 44);
  yazi(v.v + '/' + v.hedef + '  (mavi = kayıp)', VW/2, 50, 18, '#0c4a6e');
}},

/* 33 — Koyun güt */
{ad:'Koyun Güt', emir:'AĞILA SOK!', sure:11, kur(S){
  S.v = {k:[], agil:{x:330, y:150}};
  for (let i = 0; i < 4; i++) S.v.k.push({x:rnd(60,250), y:rnd(350,600), vx:0, vy:0, i:0});
}, g(S){ const v = S.v;
  for (const k of v.k) { if (k.i) continue;
    if (S.p.down) { const d = Math.hypot(k.x-S.p.x, k.y-S.p.y);
      if (d < 130) { const a = Math.atan2(k.y-S.p.y, k.x-S.p.x); k.vx += Math.cos(a)*.5; k.vy += Math.sin(a)*.5; } }
    k.vx *= .93; k.vy *= .93; k.x = cl(k.x+k.vx, 20, VW-20); k.y = cl(k.y+k.vy, 100, VH-20);
    if (Math.hypot(k.x-v.agil.x, k.y-v.agil.y) < 55) { k.i = 1; S.puanEkle(1); S.ses('ok'); } }
  if (v.k.every(k => k.i)) S.done = 'win';
}, ciz(S){ const v = S.v;
  zemin('#86efac', '#166534');
  c.strokeStyle = '#a16207'; c.lineWidth = 8;
  c.strokeRect(v.agil.x-55, v.agil.y-55, 110, 110);
  for (const k of v.k) emoji(k.i ? '✅' : '🐑', k.x, k.y, 40);
  if (S.p.down) daire(S.p.x, S.p.y, 22, 'rgba(255,255,255,.35)');
  yazi('KÖPEK OL, İTEKLE', VW/2, 60, 18, '#14532d');
}},

/* 34 — Mario */
{ad:'Bayrağa Koş', emir:'ÇUKURU ATLA!', sure:10, kur(S){
  S.v = {x:40, y:520, vy:0, yer:1, c:[]};
  for (let i = 0; i < 3; i++) S.v.c.push({x:130+i*110, w:52});
}, g(S){ const v = S.v;
  v.x += 2.6;
  if (S.tap && v.yer) { v.vy = -11.5; v.yer = 0; S.ses('tick'); }
  v.vy += .55; v.y += v.vy;
  const bosluk = v.c.some(cc => v.x > cc.x && v.x < cc.x+cc.w);
  if (v.y >= 520) { if (bosluk) { if (v.y > 700) { S.done = 'fail'; return; } }
    else { v.y = 520; v.vy = 0; v.yer = 1; } }
  if (v.x > 470) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
}, ciz(S){ const v = S.v;
  zemin('#60a5fa', '#1e3a8a');
  c.save(); c.translate(-Math.max(0, v.x-160), 0);
  kutu(0, 560, 500, 140, '#a16207');
  for (const cc of v.c) { c.clearRect(cc.x, 560, cc.w, 140); }
  emoji('🚩', 480, 520, 50);
  emoji('🍄', v.x, v.y, 42);
  c.restore();
  yazi('DOKUN = ZIPLA', VW/2, 80, 20, '#fff');
}},

/* 35 — Roket indir */
{ad:'Roketi İndir', emir:'YUMUŞAK İN!', sure:10, kur(S){ S.v = {y:120, vy:0, x:200, yakit:100}; },
 g(S){ const v = S.v;
  if (S.p.down && v.yakit > 0) { v.vy -= .52; v.yakit -= .8; }   // itki frenlemeye yetsin
  v.vy += .17; v.y += v.vy;
  v.x = lerp(v.x, S.p.down ? cl(S.p.x,60,340) : v.x, .05);
  if (v.y > 580) { if (v.vy < 3.4 && Math.abs(v.x-200) < 70) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
    else S.done = 'fail'; }
}, ciz(S){ const v = S.v;
  zemin('#1e1b4b', '#020617');
  kutu(130, 600, 140, 20, '#94a3b8', 6);
  emoji('🚀', v.x, v.y, 52);
  if (S.p.down && v.yakit > 0) emoji('🔥', v.x, v.y+34, 30);
  kutu(20, 60, 120, 12, 'rgba(255,255,255,.25)', 6);
  kutu(20, 60, 120*cl(v.yakit/100,0,1), 12, '#f59e0b', 6);
  yazi('BASILI TUT = İTKİ', VW/2, 110, 18, '#fff');
}},

/* 36 — Zombi savuştur */
{ad:'Zombi', emir:'HEPSİNİ SAVUŞTUR!', sure:10, kur(S){ S.v = {z:[], t:0, v:0, hedef:8}; },
 g(S){ const v = S.v; v.t++;
  if (v.t % 20 === 0) { const a = rnd(0,TAU);
    v.z.push({x:200+Math.cos(a)*260, y:420+Math.sin(a)*300, hp:1}); }
  for (let i = v.z.length-1; i >= 0; i--) { const z = v.z[i];
    const a = Math.atan2(420-z.y, 200-z.x); z.x += Math.cos(a)*1.5; z.y += Math.sin(a)*1.5;
    if (S.p.down && Math.hypot(z.x-S.p.x, z.y-S.p.y) < 40) { v.z.splice(i,1); v.v++; S.puanEkle(1); S.ses('ok');
      if (v.v >= v.hedef) S.done = 'win'; continue; }
    if (Math.hypot(z.x-200, z.y-420) < 34) { S.done = 'fail'; return; } }
}, ciz(S){ const v = S.v;
  zemin('#3f1d38', '#0b0410');
  emoji('🏠', 200, 420, 60);
  for (const z of v.z) emoji('🧟', z.x, z.y, 40);
  if (S.p.down) daire(S.p.x, S.p.y, 26, 'rgba(255,80,80,.35)');
  yazi(v.v + '/' + v.hedef, VW/2, 50, 24, '#fff');
}},

/* 37 — Kelime yaz */
{ad:'Hızlı Seç', emir:'DOĞRU KELİMEYİ SEÇ!', sure:8, kur(S){
  const p = S.kelime();
  S.v = {tr:p[0], dogru:p[1], secenek:S.karistir([p[1], S.kelime()[1], S.kelime()[1]])};
}, g(S){ const v = S.v;
  if (S.tap) { const i = Math.floor((S.p.y-330)/100);
    if (i>=0&&i<3) { if (v.secenek[i] === v.dogru) { S.puanEkle(2); S.ses('ok'); S.done = 'win'; } else S.done = 'fail'; } }
}, ciz(S){ const v = S.v;
  zemin('#0ea5e9', '#0c4a6e');
  yazi(v.tr, VW/2, 230, 40, '#fff');
  v.secenek.forEach((s,i) => { kutu(40, 330+i*100, VW-80, 80, 'rgba(255,255,255,.9)', 18);
    yazi(s, VW/2, 370+i*100, 24, '#0c4a6e'); });
}},

/* 38 — Mayın */
{ad:'Mayın', emir:'GÜVENLİYE BAS!', sure:8, kur(S){
  S.v = {m:[], v:0};
  for (let i = 0; i < 12; i++) S.v.m.push({m:Math.random()<.25, a:0});
}, g(S){ const v = S.v;
  if (S.tap) { const gx = Math.floor((S.p.x-40)/110), gy = Math.floor((S.p.y-240)/110);
    const i = gy*3+gx;
    if (gx>=0&&gx<3&&gy>=0&&gy<4&&!v.m[i].a) { v.m[i].a = 1;
      if (v.m[i].m) { S.done = 'fail'; } else { v.v++; S.puanEkle(1); S.ses('ok'); if (v.v >= 4) S.done = 'win'; } } }
}, ciz(S){ const v = S.v;
  zemin('#94a3b8', '#1e293b');
  v.m.forEach((m,i) => { const x = 40+(i%3)*110, y = 240+((i/3)|0)*110;
    kutu(x, y, 100, 100, m.a ? (m.m?'#ef4444':'#22c55e') : '#475569', 14);
    if (m.a) emoji(m.m ? '💣' : '✅', x+50, y+50, 40); });
  yazi(v.v + '/4 güvenli', VW/2, 170, 20, '#fff');
}},

/* 39 — Simon */
{ad:'Sırayı Tekrarla', emir:'SIRAYI TEKRARLA!', sure:11, kur(S){
  S.v = {s:[ri(0,3), ri(0,3), ri(0,3)], i:0, goster:1, gi:0, gt:0};
}, g(S){ const v = S.v;
  if (v.goster) { v.gt++;
    v.gi = Math.floor(v.gt/34);
    if (v.gi >= v.s.length) { v.goster = 0; v.gi = -1; }
    else if (v.gt % 34 === 1) S.ses('note'+v.s[v.gi]);
    return; }
  if (S.tap) { const i = (S.p.y > 420 ? 2 : 0) + (S.p.x > 200 ? 1 : 0);
    S.ses('note'+i);
    if (i === v.s[v.i]) { v.i++; S.puanEkle(1); if (v.i >= v.s.length) S.done = 'win'; }
    else S.done = 'fail'; }
}, ciz(S){ const v = S.v;
  zemin('#111827', '#030712');
  const R = ['#ef4444','#eab308','#22c55e','#3b82f6'];
  for (let i = 0; i < 4; i++) { const x = 30+(i%2)*180, y = 240+((i/2)|0)*180;
    kutu(x, y, 160, 160, (v.goster && v.s[v.gi] === i) ? '#fff' : R[i], 22); }
  yazi(v.goster ? 'İZLE…' : 'TEKRARLA', VW/2, 150, 24, '#fff');
}},

/* 40 — Kule dizme */
{ad:'Kule', emir:'ÜST ÜSTE KOY!', sure:10, kur(S){ S.v = {y:VH-90, x:40, d:1, k:[], n:0}; },
 g(S){ const v = S.v;
  v.x += v.d*4.6; if (v.x > VW-90 || v.x < 10) v.d *= -1;
  if (S.tap) { const ust = v.k.length ? v.k[v.k.length-1] : {x:150, w:100};
    const sol = Math.max(v.x, ust.x), sag = Math.min(v.x+80, ust.x+ust.w);
    if (sag-sol < 12) { S.done = 'fail'; return; }
    v.k.push({x:sol, w:sag-sol, y:v.y}); v.y -= 26; v.n++; S.puanEkle(1); S.ses('ok');
    if (v.n >= 5) S.done = 'win'; }
}, ciz(S){ const v = S.v;
  zemin('#fb7185', '#4c0519');
  kutu(150, VH-64, 100, 26, '#fff', 5);
  for (const k of v.k) kutu(k.x, k.y, k.w, 24, '#fde047', 5);
  kutu(v.x, v.y-30, 80, 24, '#38bdf8', 5);
  yazi(v.n + '/5', VW/2, 60, 24, '#fff');
}},

/* 41 — Kabarcık nişan */
{ad:'Baloncuk', emir:'AYNI RENGE AT!', sure:9, kur(S){
  const R = ['#ef4444','#3b82f6','#22c55e','#eab308'];
  S.v = {R, top:ri(0,3), hedef:[], m:null, v:0};
  for (let i = 0; i < 5; i++) S.v.hedef.push({x:60+i*70, y:200, r:ri(0,3)});
}, g(S){ const v = S.v;
  if (S.tap && !v.m) { const a = Math.atan2(S.p.y-620, S.p.x-200);
    v.m = {x:200, y:620, vx:Math.cos(a)*11, vy:Math.sin(a)*11}; S.ses('tick'); }
  if (v.m) { v.m.x += v.m.vx; v.m.y += v.m.vy;
    if (v.m.x < 12 || v.m.x > VW-12) v.m.vx *= -1;
    for (const h of v.hedef) if (!h.v && Math.hypot(h.x-v.m.x, h.y-v.m.y) < 30) {
      if (h.r === v.top) { h.v = 1; v.v++; S.puanEkle(1); S.ses('ok'); v.top = ri(0,3);
        if (v.v >= 3) { S.done = 'win'; return; } } else S.ses('bad');
      v.m = null; break; }
    if (v.m && v.m.y < 40) v.m = null; }
}, ciz(S){ const v = S.v;
  zemin('#312e81', '#020617');
  for (const h of v.hedef) if (!h.v) daire(h.x, h.y, 26, v.R[h.r]);
  if (v.m) daire(v.m.x, v.m.y, 16, v.R[v.top]);
  daire(200, 620, 20, v.R[v.top]);
  yazi(v.v + '/3', VW/2, 90, 24, '#fff');
}},

/* 42 — Kaz (Lemmings/madenci) */
{ad:'Kaz', emir:'HAZİNEYE KAZ!', sure:9, kur(S){
  S.v = {g:[], hazine:ri(6,17), a:0};
  for (let i = 0; i < 24; i++) S.v.g.push(0);
}, g(S){ const v = S.v;
  if (S.tap) { const gx = Math.floor((S.p.x-25)/88), gy = Math.floor((S.p.y-230)/88);
    const i = gy*4+gx;
    if (gx>=0&&gx<4&&gy>=0&&gy<6&&!v.g[i]) { v.g[i] = 1; v.a++; S.ses('tick');
      if (i === v.hazine) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; }
      else if (v.a >= 6) S.done = 'fail'; } }
}, ciz(S){ const v = S.v;
  zemin('#78350f', '#1c1108');
  v.g.forEach((g,i) => { const x = 25+(i%4)*88, y = 230+((i/4)|0)*88;
    kutu(x, y, 80, 80, g ? '#292524' : '#a16207', 10);
    if (g) emoji(i === v.hazine ? '💎' : '🪨', x+40, y+40, 34); });
  yazi('6 kazma hakkın var · ' + v.a, VW/2, 170, 18, '#fde68a');
}},

/* 43 — Trafik ışığı (refleks) */
{ad:'Refleks', emir:'YEŞİLDE BAS!', sure:8, kur(S){ S.v = {t:0, yesil:ri(70,140), bastı:0}; },
 g(S){ const v = S.v; v.t++;
  if (S.tap) { if (v.t >= v.yesil) { S.puanEkle(3); S.ses('ok'); S.done = 'win'; } else S.done = 'fail'; }
  if (v.t > v.yesil + 90) S.done = 'fail';
}, ciz(S){ const v = S.v;
  const y = S.v.t >= S.v.yesil;
  zemin(y ? '#052e16' : '#450a0a', '#020617');
  daire(200, 300, 90, y ? '#22c55e' : '#ef4444');
  yazi(y ? 'ŞİMDİ!' : 'BEKLE…', VW/2, 300, 34, '#fff');
}},

/* 44 — Denge */
{ad:'Denge', emir:'DÜŞÜRME!', sure:10, zamanKazanir:1, kur(S){ S.v = {a:0, va:0}; },
 g(S){ const v = S.v;
  const hedef = S.p.down ? (S.p.x-200)*.0016 : 0;
  v.va += rnd(-.0016,.0016) + v.a*.0022 - hedef*.9;
  v.a += v.va; v.va *= .985;
  if (Math.abs(v.a) > .62) { S.done = 'fail'; return; }
  if (S.t > S.sureKare*.9) { S.puanEkle(3); S.done = 'win'; }
}, ciz(S){ const v = S.v;
  zemin('#fbbf24', '#78350f');
  c.save(); c.translate(200, 560); c.rotate(v.a);
  kutu(-8, -220, 16, 220, '#7c2d12', 6);
  emoji('🍽️', 0, -240, 54);
  c.restore();
  yazi('EKRANI SAĞ/SOL TUT', VW/2, 120, 18, '#451a03');
}},

/* 45 — Uzay kaçış */
{ad:'Asteroit', emir:'ÇARPMADAN GEÇ!', sure:11, zamanKazanir:1, kur(S){ S.v = {x:200, a:[], t:0}; },
 g(S){ const v = S.v; v.t++;
  v.x = lerp(v.x, cl(S.p.x, 30, VW-30), .38);
  if (v.t % 34 === 0) {
    let ax, dene = 0;
    do { ax = rnd(30, VW-30); } while (Math.abs(ax - v.x) < 85 && ++dene < 12);
    v.a.push({x:ax, y:-40, s:rnd(3.6,5.4)});
  }
  for (let i = v.a.length-1; i >= 0; i--) { const a = v.a[i]; a.y += a.s;
    if (Math.hypot(a.x-v.x, a.y-(VH-110)) < 29) { S.done = 'fail'; return; }
    if (a.y > VH+40) { v.a.splice(i,1); S.puanEkle(1); } }
}, ciz(S){ const v = S.v;
  zemin('#0b1120', '#000');
  for (let i = 0; i < 40; i++) daire((i*97)%VW, ((i*173)+S.t*3)%VH, 1.6, '#fff');
  for (const a of v.a) emoji('☄️', a.x, a.y, 42);
  emoji('🛸', v.x, VH-110, 50);
}},
];

/* ---------- rüya saçmalıkları (geçiş metinleri) ---------- */
const SACMA = [
  'Anneannen bir ejderha oldu.',
  'Sınava geç kaldın ama uçabiliyorsun.',
  'Dişlerin dökülüyor ve hepsi şeker.',
  'Kedin senden kredi istiyor.',
  'Okulun koridoru artık bir otoban.',
  'Yerçekimi bugün izinli.',
  'Herkes senin adını unuttu, sen de.',
  'Asansör yana doğru gidiyor.',
  'Deniz tuzlu değil, gazoz.',
  'Ayakkabıların seni terk etti.',
  'Patron bir penguen ve dans etmek istiyor.',
  'Telefonun ekranında yüzün var, sana el sallıyor.',
  'Ev ödevin seni yapıyor.',
  'Gökyüzü aşağı düştü, kimse fark etmedi.',
  'Aynadaki sen daha erken uyanmış.',
  'Otobüs durağı seni bekliyor, sen geç kaldın.',
  'Bütün kapılar buzdolabına çıkıyor.',
  'Saat 25:00 ve hâlâ pazartesi.',
  'Köpeğin matematik öğretmeni oldu.',
  'Merdivenler yukarı çıkarken aşağı iniyor.',
];

/* ---------- motor ---------- */
let S = null, tuval = null, sonOyunlar = [];
const durum = {puan:0, can:3, derinlik:1, rekor:0, sahne:0, kazanma:0, calisiyor:false};

function yeniSahne() {
  let o;
  do { o = sec(OYUNLAR); } while (OYUNLAR.length > 6 && sonOyunlar.includes(o.ad));
  sonOyunlar.push(o.ad); if (sonOyunlar.length > 4) sonOyunlar.shift();
  const hizlanma = cl(1 + (durum.derinlik-1)*.09, 1, 2.1);
  S.oyun = o;
  S.t = 0;
  S.sureKare = Math.max(150, (o.sure * 60) / hizlanma);
  S.done = null;
  S.emirT = 46;
  S.v = {};
  S.kabus = durum.derinlik >= 3 ? sec(['', '', 'ters', 'ayna', 'titre', 'sis']) : '';
  o.kur(S);
  durum.sahne++;
}
function gecisBaslat(tip) { S.gecis = {t:0, sure:26, tip: tip || sec(['erime','spiral','iris','piksel']), yazi: sec(SACMA)}; }

function kur(canvasEl, ctx2, cbs) {
  tuval = canvasEl; c = ctx2;
  S = {p:{x:VW/2, y:VH/2, down:false, justDown:false, justUp:false}, tap:false, sw:null,
    t:0, sureKare:600, done:null, oyun:null, v:{}, emirT:0, gecis:null, kabus:'',
    ses: cbs.ses || (()=>{}), puanEkle(n){ durum.puan += n; }, kelime: cbs.kelime, karistir: a => a.sort(()=>Math.random()-.5),
    fisilti: cbs.fisilti};
  return S;
}
function baslat() {
  durum.puan = 0; durum.can = 3; durum.derinlik = 1; durum.sahne = 0; durum.kazanma = 0; durum.calisiyor = true;
  sonOyunlar = [];
  yeniSahne();
}
function guncelle() {
  if (!durum.calisiyor) return;
  S.t++;
  if (S.gecis) {
    S.gecis.t++;
    if (S.gecis.t >= S.gecis.sure) { S.gecis = null; yeniSahne(); }
    return;
  }
  if (S.emirT > 0) { S.emirT--; return; }
  if (!S.done) S.oyun.g(S);
  if (!S.done && S.t > S.sureKare) S.done = S.oyun.zamanKazanir ? 'win' : 'fail';
  if (S.done) {
    if (S.done === 'win') {
      durum.puan += 5; S.ses('ok');
      /* her 4. kazanmada bir katman aşağı — sahne numarasının tesadüfüne bağlı değil */
      durum.kazanma++;
      if (durum.kazanma % 4 === 0) { durum.derinlik++; if (S.fisilti) S.fisilti(); }
    } else { durum.can--; S.ses('bad'); if (durum.can <= 0) { durum.calisiyor = false; return; } }
    gecisBaslat();
  }
}
/* üst şerit — geçişte de görünür kalsın, yanıp sönmesin */
function ustSerit(w, h, k, oyunda) {
  c.save();
  c.setTransform(1,0,0,1,0,0);
  c.translate((w-VW*k)/2, (h-VH*k)/2); c.scale(k, k);
  kutu(0, 0, VW, 26, 'rgba(5,7,13,.55)');
  yazi('❤'.repeat(Math.max(0,durum.can)), 34, 13, 14, '#fb7185', 800);
  yazi('PUAN ' + durum.puan, VW/2, 13, 14, '#fff', 800);
  yazi('DERİNLİK ' + durum.derinlik, VW-56, 13, 14, '#c4b5fd', 800);
  if (oyunda) {
    const kalan = 1 - cl(S.t/S.sureKare, 0, 1);
    kutu(0, 26, VW*kalan, 4, kalan < .3 ? '#ef4444' : '#4ade80');
    if (S.emirT > 0) {
      c.fillStyle = 'rgba(5,7,13,.66)'; c.fillRect(0, 0, VW, VH);
      const s = 1 + Math.sin(S.emirT*.25)*.06;
      c.save(); c.translate(VW/2, VH/2); c.scale(s, s);
      yazi(S.oyun.emir, 0, 0, 40, '#fff', 900);
      yazi(S.oyun.ad, 0, 48, 18, '#a78bfa', 700);
      if (S.kabus) yazi('⚠ ' + {ters:'HER ŞEY TERS', ayna:'AYNA DÜNYA', titre:'ZEMİN SALLANIYOR', sis:'SİS BASTI'}[S.kabus], 0, 84, 15, '#f0abfc', 800);
      c.restore();
    }
  }
  c.restore();
}
function ciz(w, h) {
  // sanal tuvali ekrana oturt
  const k = Math.min(w/VW, h/VH);
  c.save();
  c.setTransform(1,0,0,1,0,0);
  c.fillStyle = '#05070d'; c.fillRect(0, 0, w, h);
  c.translate((w-VW*k)/2, (h-VH*k)/2); c.scale(k, k);
  c.beginPath(); c.rect(0,0,VW,VH); c.clip();

  if (S.kabus === 'ters') { c.translate(0, VH); c.scale(1, -1); }
  if (S.kabus === 'ayna') { c.translate(VW, 0); c.scale(-1, 1); }
  if (S.kabus === 'titre') c.translate(Math.sin(S.t*.7)*4, Math.cos(S.t*.9)*4);

  if (S.gecis) {
    const p = S.gecis.t / S.gecis.sure;
    zemin('#1b1036', '#05010f');
    c.save(); c.translate(VW/2, VH/2); c.rotate(p*TAU*(S.gecis.tip==='spiral'?1:0));
    const r = S.gecis.tip === 'iris' ? (1-Math.abs(p-.5)*2)*280 : 200;
    daire(0, 0, r, 'rgba(124,58,237,.35)');
    c.restore();
    yazi(S.gecis.yazi, VW/2, VH/2, 22, '#fff', 700);
    yazi('…rüya kayıyor…', VW/2, VH/2+50, 15, '#a78bfa', 700);
    c.restore();
    ustSerit(w, h, k, false);
    return;
  }

  S.oyun.ciz(S);

  if (S.kabus === 'sis') { c.fillStyle = 'rgba(120,80,200,.22)'; c.fillRect(0,0,VW,VH); }
  c.restore();
  ustSerit(w, h, k, true);
}
/* girdi — ekran koordinatını sanal koordinata çevirir */
function nokta(cx, cy, w, h) {
  const k = Math.min(w/VW, h/VH);
  return {x: (cx - (w-VW*k)/2)/k, y: (cy - (h-VH*k)/2)/k};
}
return {kur, baslat, guncelle, ciz, nokta, durum, get S(){ return S; }, OYUNLAR, VW, VH};
})();
