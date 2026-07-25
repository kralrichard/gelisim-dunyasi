/* ===== MİNİ OYUN MOTORLARI =====
   Her oyun: {ad, ipucu, start(S), update(S), draw(S,c)}
   S: {W,H,skin,A(alan),t,done,score,goal,p:{x,y,down,justDown},keys}
   Kazanmak için S.done='win', kaybetmek için S.done='lose'.
*/
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function glow(c, x, y, r, col, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = a; c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.globalAlpha = 1;
}
function txt(c, s, x, y, size, col, w = 700, al = 'center') {
  c.fillStyle = col; c.textAlign = al; c.textBaseline = 'middle';
  c.font = w + ' ' + size + 'px -apple-system, "Segoe UI", system-ui, sans-serif';
  c.fillText(s, x, y);
}
function burst(S, x, y, col, n = 14, sp = 5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, v = rnd(sp * .3, sp);
    S.fx.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: col, s: rnd(2, 5)});
  }
}
function fxStep(S, c) {
  for (let i = S.fx.length - 1; i >= 0; i--) {
    const p = S.fx[i];
    p.x += p.vx; p.y += p.vy; p.vy += .12; p.l -= .026;
    if (p.l <= 0) { S.fx.splice(i, 1); continue; }
    c.globalAlpha = Math.max(0, p.l); c.fillStyle = p.c;
    c.beginPath(); c.arc(p.x, p.y, p.s, 0, TAU); c.fill();
  }
  c.globalAlpha = 1;
}

/* ---------- ortak: ilerleme rozeti ---------- */
function hud(S, c, label) {
  c.save();
  c.font = '800 15px -apple-system, "Segoe UI", system-ui, sans-serif';
  const w = Math.max(120, c.measureText(label).width + 30);
  const y = 66; // üstteki başlık çubuğunun altında kalsın
  rr(c, 14, y, w, 34, 17);
  c.fillStyle = 'rgba(0,0,0,.4)'; c.fill();
  txt(c, label, 14 + w / 2, y + 18, 15, '#fff', 800);
  c.restore();
}

const GAMES = {};

/* ================= 1) UÇUŞ ================= */
GAMES.ucus = {
  ad: 'Uçuş', ipucu: 'Parmağını sürükle · kapılardan geç',
  start(S) {
    const sea = S.skin === 'boat', sub = S.skin === 'sub';
    S.g = {
      y: S.H / 2, vy: 0, x: S.W * .26, gates: [], next: 0, passed: 0, hit: 0,
      speed: S.W / 260, sea, sub, tilt: 0,
      stars: Array.from({length: 70}, () => ({x: Math.random(), y: Math.random(), r: rnd(.6, 2), s: rnd(.2, 1)})),
      clouds: Array.from({length: 8}, () => ({x: Math.random(), y: rnd(.05, .8), s: rnd(.5, 1.4)})),
    };
    S.goal = 6;
    for (let i = 0; i < 7; i++) S.g.gates.push({x: S.W + i * S.W * .62, gy: rnd(S.H * .28, S.H * .72), gap: S.H * .3, done: false});
  },
  update(S) {
    const g = S.g;
    // hedefe yumuşak takip
    let ty = g.y;
    if (S.p.down) ty = S.p.y;
    if (S.keys.up) ty = g.y - 60;
    if (S.keys.down) ty = g.y + 60;
    g.vy = lerp(g.vy, (ty - g.y) * .16, .28);
    g.y = clamp(g.y + g.vy, 30, S.H - 30);
    g.tilt = lerp(g.tilt, clamp(g.vy / 9, -.5, .5), .16);

    for (const gt of g.gates) {
      gt.x -= g.speed * 1.5;
      if (!gt.done && gt.x < g.x) {
        const inGap = g.y > gt.gy - gt.gap / 2 && g.y < gt.gy + gt.gap / 2;
        gt.done = true;
        if (inGap) { g.passed++; S.score = g.passed; burst(S, g.x + 40, g.y, '#ffe066', 18, 6); S.sfx('ok'); }
        else { g.hit++; burst(S, g.x, g.y, '#ff5c7a', 20, 7); S.sfx('bad'); }
      }
      if (gt.x < -80) { gt.x += 7 * S.W * .62; gt.gy = rnd(S.H * .28, S.H * .72); gt.done = false; }
    }
    if (g.passed >= S.goal) S.done = 'win';
    if (g.hit >= 3) S.done = 'lose';
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    // arka plan
    const bg = c.createLinearGradient(0, 0, 0, H);
    if (g.sub) { bg.addColorStop(0, '#0d5a6e'); bg.addColorStop(1, '#02202c'); }
    else if (g.sea) { bg.addColorStop(0, '#7dd3fc'); bg.addColorStop(.55, '#38bdf8'); bg.addColorStop(1, '#0c4a6e'); }
    else if (S.skin === 'ship') { bg.addColorStop(0, '#0a0424'); bg.addColorStop(1, '#25104d'); }
    else { bg.addColorStop(0, '#4a92f7'); bg.addColorStop(.65, '#9ecbff'); bg.addColorStop(1, '#dbeeff'); }
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    if (S.skin === 'ship') {
      for (const s of g.stars) {
        const px = (s.x * W - S.t * s.s * 1.4) % W;
        c.globalAlpha = .4 + s.s * .6; c.fillStyle = '#fff';
        c.fillRect(px < 0 ? px + W : px, s.y * H, s.r, s.r);
      }
      c.globalAlpha = 1;
      glow(c, W * .8, H * .25, 160, '#7c4dff', .35);
    } else if (!g.sub) {
      for (const cl of g.clouds) {
        const px = ((cl.x * W - S.t * .5) % (W + 200)) - 100;
        c.globalAlpha = .55; c.fillStyle = '#fff';
        for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(px + i * 26 * cl.s, cl.y * H + (i % 2) * 8, 22 * cl.s, 0, TAU); c.fill(); }
      }
      c.globalAlpha = 1;
    } else {
      for (const s of g.stars) {
        const px = (s.x * W - S.t * .6) % W;
        c.globalAlpha = .25; c.fillStyle = '#bff';
        c.beginPath(); c.arc(px < 0 ? px + W : px, (s.y * H + S.t * .3) % H, s.r * 1.6, 0, TAU); c.fill();
      }
      c.globalAlpha = 1;
    }
    if (g.sea) { c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, H * .62, W, H); }

    // kapılar
    for (const gt of g.gates) {
      if (gt.x < -80 || gt.x > W + 80) continue;
      const top = gt.gy - gt.gap / 2, bot = gt.gy + gt.gap / 2;
      c.fillStyle = gt.done ? 'rgba(255,255,255,.22)' : S.A.b;
      rr(c, gt.x, -10, 26, top + 10, 13); c.fill();
      rr(c, gt.x, bot, 26, H - bot + 10, 13); c.fill();
      c.strokeStyle = S.A.a; c.lineWidth = 3;
      c.beginPath(); c.moveTo(gt.x + 13, top); c.lineTo(gt.x + 13, bot); c.stroke();
      glow(c, gt.x + 13, top, 26, S.A.a, .5);
      glow(c, gt.x + 13, bot, 26, S.A.a, .5);
    }

    // araç
    c.save();
    c.translate(g.x, g.y); c.rotate(g.tilt);
    drawCraft(c, S.skin, S.t, S.A);
    c.restore();

    fxStep(S, c);
    hud(S, c, 'Kapı ' + g.passed + '/' + S.goal + '   ❤' + (3 - g.hit));
  }
};

function drawCraft(c, skin, t, A) {
  c.lineJoin = 'round';
  if (skin === 'ship') {
    // gelişmiş uzay gemisi
    const fl = 18 + Math.sin(t * .5) * 7;
    const gg = c.createLinearGradient(-30, 0, 30, 0);
    gg.addColorStop(0, '#ff9d4d'); gg.addColorStop(1, 'rgba(255,80,0,0)');
    c.fillStyle = gg;
    c.beginPath(); c.moveTo(-22, -7); c.lineTo(-22 - fl, 0); c.lineTo(-22, 7); c.closePath(); c.fill();
    c.fillStyle = '#dfe7ff';
    c.beginPath(); c.moveTo(34, 0); c.quadraticCurveTo(6, -13, -22, -9);
    c.lineTo(-22, 9); c.quadraticCurveTo(6, 13, 34, 0); c.closePath(); c.fill();
    c.fillStyle = '#8fa6d8';
    c.beginPath(); c.moveTo(2, -9); c.lineTo(-16, -26); c.lineTo(-20, -9); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(2, 9); c.lineTo(-16, 26); c.lineTo(-20, 9); c.closePath(); c.fill();
    c.fillStyle = '#4fd1ff';
    c.beginPath(); c.ellipse(10, 0, 9, 5.5, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(10, 0, 9, 5.5, 0, 0, TAU); c.stroke();
    glow(c, -26, 0, 26, '#ff8a3d', .7);
  } else if (skin === 'plane' || skin === 'balon' && false) {
    // ayrıntılı yolcu uçağı
    c.fillStyle = '#f3f6ff';
    c.beginPath(); c.moveTo(36, 0); c.quadraticCurveTo(14, -10, -18, -8);
    c.quadraticCurveTo(-30, -7, -30, 0); c.quadraticCurveTo(-30, 7, -18, 8);
    c.quadraticCurveTo(14, 10, 36, 0); c.closePath(); c.fill();
    c.fillStyle = '#c9d6f2';
    c.beginPath(); c.moveTo(6, -4); c.lineTo(-14, -24); c.lineTo(-2, -24); c.lineTo(14, -4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(6, 4); c.lineTo(-14, 24); c.lineTo(-2, 24); c.lineTo(14, 4); c.closePath(); c.fill();
    c.fillStyle = '#9fb4dd';
    c.beginPath(); c.moveTo(-24, -3); c.lineTo(-34, -16); c.lineTo(-26, -16); c.lineTo(-18, -3); c.closePath(); c.fill();
    c.fillStyle = '#5b7fd4';
    c.beginPath(); c.ellipse(-2, -8, 6, 3.4, -.2, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(-2, 8, 6, 3.4, .2, 0, TAU); c.fill();
    c.fillStyle = '#4fd1ff';
    for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(10 + i * 6, -1.5, 1.5, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.beginPath(); c.moveTo(-30, -3); c.lineTo(-30 - (10 + Math.sin(t * .4) * 5), 0); c.lineTo(-30, 3); c.closePath(); c.fill();
  } else if (skin === 'boat') {
    c.fillStyle = '#f4f7ff';
    c.beginPath(); c.moveTo(-28, -2); c.lineTo(26, -2); c.lineTo(18, 12); c.lineTo(-22, 12); c.closePath(); c.fill();
    c.fillStyle = '#dbe4f7'; rr(c, -12, -18, 24, 16, 4); c.fill();
    c.fillStyle = A.b; rr(c, 2, -28, 8, 12, 3); c.fill();
    c.fillStyle = '#4fd1ff';
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-6 + i * 8, -11, 2, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.5)';
    c.beginPath(); c.ellipse(-30, 10, 12 + Math.sin(t * .4) * 4, 3, 0, 0, TAU); c.fill();
  } else if (skin === 'sub') {
    c.fillStyle = '#ffd166';
    c.beginPath(); c.ellipse(0, 0, 30, 13, 0, 0, TAU); c.fill();
    c.fillStyle = '#e0a92e'; rr(c, -6, -22, 14, 12, 4); c.fill();
    c.strokeStyle = '#e0a92e'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-30, 0); c.lineTo(-40, -8); c.moveTo(-30, 0); c.lineTo(-40, 8); c.stroke();
    c.fillStyle = '#0ea5e9';
    c.beginPath(); c.arc(12, 0, 6, 0, TAU); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(12, 0, 6, 0, TAU); c.stroke();
    glow(c, 26, 0, 30, '#ffe9a8', .35);
  } else { // balon
    c.fillStyle = A.a;
    c.beginPath(); c.arc(0, -14, 22, 0, TAU); c.fill();
    c.fillStyle = A.b;
    c.beginPath(); c.arc(0, -14, 22, -1.1, .4); c.lineTo(0, -14); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-10, 4); c.lineTo(-6, 14); c.moveTo(10, 4); c.lineTo(6, 14); c.stroke();
    c.fillStyle = '#a16207'; rr(c, -8, 13, 16, 11, 3); c.fill();
  }
}

/* ================= 2) DİŞLİ ================= */
GAMES.disli = {
  ad: 'Mekanizma', ipucu: 'İşaret yeşil bölgeye gelince dokun',
  start(S) {
    S.g = {a: 0, sp: .028, zone: rnd(.6, 2.4), size: .5, ok: 0, miss: 0, flash: 0};
    S.goal = 5;
  },
  update(S) {
    const g = S.g;
    g.a = (g.a + g.sp) % TAU;
    if (g.flash > 0) g.flash -= .06;
    if (S.p.justDown) {
      let d = Math.abs(((g.a - g.zone + Math.PI * 3) % TAU) - Math.PI);
      d = Math.PI - d;
      if (d < g.size) {
        g.ok++; S.score = g.ok; g.flash = 1; S.sfx('ok');
        burst(S, S.W / 2, S.H / 2, S.A.a, 18, 6);
        g.zone = rnd(0, TAU); g.sp = (.028 + g.ok * .008) * (Math.random() < .4 ? -1 : 1);
        g.size = Math.max(.28, .5 - g.ok * .04);
      } else { g.miss++; S.sfx('bad'); }
    }
    if (g.ok >= S.goal) S.done = 'win';
    if (g.miss >= 4) S.done = 'lose';
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H, cx = W / 2, cy = H / 2, R = Math.min(W, H) * .3;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#22252e'); bg.addColorStop(1, '#0f1117');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    glow(c, cx, cy, R * 2.2, S.A.a, .18 + g.flash * .25);

    // hedef bölge
    c.strokeStyle = 'rgba(80,230,140,.9)'; c.lineWidth = 20; c.lineCap = 'round';
    c.beginPath(); c.arc(cx, cy, R, g.zone - g.size, g.zone + g.size); c.stroke();

    // dişli
    c.save(); c.translate(cx, cy); c.rotate(g.a);
    const teeth = 14;
    c.fillStyle = S.skin === 'robot' ? '#9aa7ff' : S.skin === 'motor' ? '#ff9b9b' : '#c9d1e0';
    c.beginPath();
    for (let i = 0; i < teeth; i++) {
      const a0 = i / teeth * TAU, a1 = (i + .5) / teeth * TAU, a2 = (i + 1) / teeth * TAU;
      c.lineTo(Math.cos(a0) * R * .78, Math.sin(a0) * R * .78);
      c.lineTo(Math.cos(a0 + .06) * R * .93, Math.sin(a0 + .06) * R * .93);
      c.lineTo(Math.cos(a1 - .06) * R * .93, Math.sin(a1 - .06) * R * .93);
      c.lineTo(Math.cos(a1) * R * .78, Math.sin(a1) * R * .78);
    }
    c.closePath(); c.fill();
    c.fillStyle = '#1b1e26'; c.beginPath(); c.arc(0, 0, R * .3, 0, TAU); c.fill();
    c.strokeStyle = S.A.a; c.lineWidth = 6;
    c.beginPath(); c.moveTo(R * .32, 0); c.lineTo(R * .95, 0); c.stroke();
    c.fillStyle = S.A.a; c.beginPath(); c.arc(R * .98, 0, 8, 0, TAU); c.fill();
    c.restore();

    fxStep(S, c);
    hud(S, c, 'Kilit ' + g.ok + '/' + S.goal + '   ✕' + g.miss);
  }
};

/* ================= 3) DEVRE ================= */
GAMES.devre = {
  ad: 'Devre', ipucu: 'Boruları döndür · akımı lambaya ulaştır',
  start(S) {
    const n = 3;
    const grid = [];
    // çözülmüş bir yol kur, sonra rastgele döndür
    const path = [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) grid.push({x, y, conn: 0, rot: 0, on: false});
    const at = (x, y) => grid[y * n + x];
    const DIR = {'1,0': 1, '0,1': 2, '-1,0': 4, '0,-1': 8};
    for (let i = 0; i < path.length; i++) {
      const [x, y] = path[i];
      const cell = at(x, y);
      if (i > 0) { const [px, py] = path[i - 1]; cell.conn |= DIR[(px - x) + ',' + (py - y)]; }
      if (i < path.length - 1) { const [nx, ny] = path[i + 1]; cell.conn |= DIR[(nx - x) + ',' + (ny - y)]; }
    }
    for (const g of grid) { if (!g.conn) g.conn = [3, 5, 6, 9][Math.floor(Math.random() * 4)]; g.rot = Math.floor(Math.random() * 4); }
    S.g = {n, grid, moves: 0};
    S.goal = 1;
  },
  update(S) {
    const g = S.g, W = S.W, H = S.H;
    const cell = Math.min(W, H) * .8 / g.n, ox = (W - cell * g.n) / 2, oy = (H - cell * g.n) / 2;
    if (S.p.justDown) {
      const gx = Math.floor((S.p.x - ox) / cell), gy = Math.floor((S.p.y - oy) / cell);
      if (gx >= 0 && gy >= 0 && gx < g.n && gy < g.n) {
        g.grid[gy * g.n + gx].rot = (g.grid[gy * g.n + gx].rot + 1) % 4;
        g.moves++; S.sfx('tick');
      }
    }
    // akım yayılımı
    for (const q of g.grid) q.on = false;
    const rot = q => ((q.conn << q.rot) | (q.conn >> (4 - q.rot))) & 15;
    const st = [[0, 0]]; const seen = new Set(['0,0']);
    while (st.length) {
      const [x, y] = st.pop();
      const q = g.grid[y * g.n + x]; q.on = true;
      const m = rot(q);
      const nb = [[1, 0, 1, 4], [0, 1, 2, 8], [-1, 0, 4, 1], [0, -1, 8, 2]];
      for (const [dx, dy, bit, back] of nb) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= g.n || ny >= g.n) continue;
        if (!(m & bit)) continue;
        const o = g.grid[ny * g.n + nx];
        if (!(rot(o) & back)) continue;
        const k = nx + ',' + ny;
        if (seen.has(k)) continue;
        seen.add(k); st.push([nx, ny]);
      }
    }
    const last = g.grid[g.grid.length - 1];
    S.score = g.grid.filter(q => q.on).length;
    if (last.on) { if (!S.done) { burst(S, W / 2, H / 2, '#ffe066', 26, 8); S.sfx('ok'); } S.done = 'win'; }
    if (g.moves > 40) S.done = 'lose';
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#12161f'); bg.addColorStop(1, '#080a10');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const cell = Math.min(W, H) * .8 / g.n, ox = (W - cell * g.n) / 2, oy = (H - cell * g.n) / 2;
    const rot = q => ((q.conn << q.rot) | (q.conn >> (4 - q.rot))) & 15;
    for (const q of g.grid) {
      const x = ox + q.x * cell, y = oy + q.y * cell, cx = x + cell / 2, cy = y + cell / 2;
      rr(c, x + 4, y + 4, cell - 8, cell - 8, 14);
      c.fillStyle = 'rgba(255,255,255,.05)'; c.fill();
      const m = rot(q);
      c.strokeStyle = q.on ? S.A.a : 'rgba(255,255,255,.28)';
      c.lineWidth = 9; c.lineCap = 'round';
      c.beginPath();
      if (m & 1) { c.moveTo(cx, cy); c.lineTo(x + cell - 6, cy); }
      if (m & 2) { c.moveTo(cx, cy); c.lineTo(cx, y + cell - 6); }
      if (m & 4) { c.moveTo(cx, cy); c.lineTo(x + 6, cy); }
      if (m & 8) { c.moveTo(cx, cy); c.lineTo(cx, y + 6); }
      c.stroke();
      if (q.on) glow(c, cx, cy, cell * .5, S.A.a, .3);
    }
    // kaynak ve lamba
    const s = g.grid[0], e = g.grid[g.grid.length - 1];
    txt(c, S.skin === 'sinir' ? '🧠' : '⚡', ox + s.x * cell + cell / 2, oy + s.y * cell + cell / 2, cell * .34, '#fff');
    txt(c, e.on ? '💡' : '🔌', ox + e.x * cell + cell / 2, oy + e.y * cell + cell / 2, cell * .34, '#fff');
    fxStep(S, c);
    hud(S, c, 'Bağlı ' + S.score + '/' + g.grid.length);
  }
};

/* ================= 4) İNŞA ================= */
GAMES.insa = {
  ad: 'İnşa', ipucu: 'Blok üst üste gelince dokun',
  start(S) {
    S.g = {stack: [{x: S.W / 2 - 70, w: 140}], cur: {x: 0, w: 140, dir: 1}, sp: S.W / 130, drop: null, h: 0};
    S.goal = 6;
  },
  update(S) {
    const g = S.g, W = S.W;
    if (g.drop) {
      g.drop.y += 16;
      const targetY = S.H - 90 - g.stack.length * 34;
      if (g.drop.y >= targetY) {
        const top = g.stack[g.stack.length - 1];
        const l = Math.max(g.drop.x, top.x), r = Math.min(g.drop.x + g.drop.w, top.x + top.w);
        const w = r - l;
        if (w <= 12) { S.done = 'lose'; return; }
        g.stack.push({x: l, w});
        burst(S, l + w / 2, targetY, S.A.a, 12, 4); S.sfx('ok');
        S.score = g.stack.length - 1;
        if (g.stack.length - 1 >= S.goal) { S.done = 'win'; return; }
        g.cur = {x: 0, w, dir: 1}; g.drop = null; g.sp *= 1.08;
      }
      return;
    }
    g.cur.x += g.sp * g.cur.dir;
    if (g.cur.x + g.cur.w > W - 10) g.cur.dir = -1;
    if (g.cur.x < 10) g.cur.dir = 1;
    if (S.p.justDown) g.drop = {x: g.cur.x, w: g.cur.w, y: 90};
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, S.skin === 'mimar' ? '#2a1f3d' : '#1a2030'); bg.addColorStop(1, '#080b12');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, H - 60, W, 60);
    const drawBlk = (x, y, w) => {
      const gr = c.createLinearGradient(x, y, x + w, y + 30);
      gr.addColorStop(0, S.A.a); gr.addColorStop(1, S.A.b);
      c.fillStyle = gr; rr(c, x, y, w, 30, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.18)'; rr(c, x + 4, y + 3, w - 8, 7, 4); c.fill();
    };
    g.stack.forEach((b, i) => drawBlk(b.x, H - 90 - i * 34 + 4, b.w));
    if (g.drop) drawBlk(g.drop.x, g.drop.y, g.drop.w);
    else drawBlk(g.cur.x, 90, g.cur.w);
    fxStep(S, c);
    hud(S, c, 'Kat ' + (g.stack.length - 1) + '/' + S.goal);
  }
};

/* ================= 5) TEŞHİS (eşleştirme) ================= */
const TESHIS_SET = {
  klinik: ['🫀', '🫁', '🦴', '🧠', '🩸', '🌡️'], kalp: ['❤️', '🫀', '🩸', '📈', '🩺', '💊'],
  hayvan: ['🐕', '🐈', '🐄', '🐑', '🐇', '🦜'], zihin: ['😊', '😢', '😠', '😨', '😴', '🤔'],
  hucre: ['🧫', '🧬', '🔬', '🌱', '🦠', '🍄'], dna: ['🧬', '🧫', '🔬', '🧪', '📊', '🩸'],
  adalet: ['⚖️', '📜', '🔨', '🏛️', '📝', '🔍']
};
GAMES.teshis = {
  ad: 'Eşleştir', ipucu: 'Aynı çifti bul',
  start(S) {
    const set = (TESHIS_SET[S.skin] || ['🔵', '🟢', '🟡', '🟣', '🔴', '🟠']).slice(0, 4);
    const cards = [...set, ...set].map((e, i) => ({e, i, up: false, gone: false}));
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    S.g = {cards, sel: [], wait: 0, tries: 0};
    S.goal = 4;
  },
  update(S) {
    const g = S.g;
    if (g.wait > 0) {
      g.wait--;
      if (g.wait === 0) {
        const [a, b] = g.sel;
        if (g.cards[a].e === g.cards[b].e) { g.cards[a].gone = g.cards[b].gone = true; S.score++; S.sfx('ok'); burst(S, S.W / 2, S.H / 2, S.A.a, 16, 5); }
        else { g.cards[a].up = g.cards[b].up = false; S.sfx('bad'); }
        g.sel = [];
        if (S.score >= S.goal) S.done = 'win';
        if (g.tries >= 12 && S.score < S.goal) S.done = 'lose';
      }
      return;
    }
    if (S.p.justDown) {
      const {cw, ch, ox, oy} = layout(S);
      const cx = Math.floor((S.p.x - ox) / cw), cy = Math.floor((S.p.y - oy) / ch);
      const idx = cy * 4 + cx;
      if (cx >= 0 && cx < 4 && cy >= 0 && cy < 2 && idx < 8) {
        const card = g.cards[idx];
        if (!card.up && !card.gone && g.sel.length < 2) {
          card.up = true; g.sel.push(idx); S.sfx('tick');
          if (g.sel.length === 2) { g.wait = 34; g.tries++; }
        }
      }
    }
    function layout(S) {
      const cw = Math.min(S.W * .22, 110), ch = cw * 1.15;
      return {cw, ch, ox: (S.W - cw * 4) / 2, oy: (S.H - ch * 2) / 2};
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#161a28'); bg.addColorStop(1, '#0a0d15');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const cw = Math.min(W * .22, 110), ch = cw * 1.15, ox = (W - cw * 4) / 2, oy = (H - ch * 2) / 2;
    g.cards.forEach((card, i) => {
      const x = ox + (i % 4) * cw + 5, y = oy + Math.floor(i / 4) * ch + 5, w = cw - 10, h = ch - 10;
      if (card.gone) { c.globalAlpha = .2; }
      rr(c, x, y, w, h, 16);
      if (card.up || card.gone) {
        const gr = c.createLinearGradient(x, y, x + w, y + h);
        gr.addColorStop(0, S.A.a); gr.addColorStop(1, S.A.b);
        c.fillStyle = gr; c.fill();
        txt(c, card.e, x + w / 2, y + h / 2, w * .48, '#fff');
      } else {
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fill();
        txt(c, '?', x + w / 2, y + h / 2, w * .4, 'rgba(255,255,255,.35)', 800);
      }
      c.globalAlpha = 1;
    });
    fxStep(S, c);
    hud(S, c, 'Çift ' + S.score + '/' + S.goal);
  }
};

/* ================= 6) KARIŞIM ================= */
GAMES.karisim = {
  ad: 'Karışım', ipucu: 'Doğru orana gelince “Tamam”a dokun',
  start(S) {
    S.g = {a: 0, b: 0, need: [3, 2], round: 0, tol: .12, btn: null};
    S.goal = 3;
    S.g.need = [Math.floor(rnd(2, 5)), Math.floor(rnd(1, 4))];
  },
  update(S) {
    const g = S.g, W = S.W, H = S.H;
    if (S.p.justDown) {
      const y = S.p.y;
      if (y > H - 130) {
        // onay
        const tot = g.a + g.b;
        const want = g.need[0] / (g.need[0] + g.need[1]);
        const got = tot ? g.a / tot : -1;
        if (tot >= 3 && Math.abs(got - want) < g.tol) {
          g.round++; S.score = g.round; S.sfx('ok'); burst(S, W / 2, H / 2, S.A.a, 22, 7);
          g.a = g.b = 0; g.need = [Math.floor(rnd(2, 6)), Math.floor(rnd(1, 5))];
          if (g.round >= S.goal) S.done = 'win';
        } else { S.sfx('bad'); g.a = g.b = 0; g.miss = (g.miss || 0) + 1; if (g.miss >= 3) S.done = 'lose'; }
      } else if (S.p.x < W / 2) { g.a++; S.sfx('tick'); }
      else { g.b++; S.sfx('tick'); }
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    c.fillStyle = '#0d1119'; c.fillRect(0, 0, W, H);
    txt(c, 'Hedef oran  ' + g.need[0] + ' : ' + g.need[1], W / 2, 56, 22, '#fff', 800);
    // iki sütun
    const colW = W / 2 - 30;
    [[30, g.a, S.A.a, 'A'], [W / 2 + 10, g.b, S.A.b, 'B']].forEach(([x, v, col, lbl]) => {
      rr(c, x, 100, colW - 10, H - 250, 20);
      c.fillStyle = 'rgba(255,255,255,.06)'; c.fill();
      const hgt = Math.min(H - 260, v * 26);
      rr(c, x + 6, H - 156 - hgt, colW - 22, hgt, 14);
      c.fillStyle = col; c.fill();
      txt(c, lbl + '  ' + v, x + colW / 2 - 5, H - 175, 20, '#fff', 800);
    });
    rr(c, W / 2 - 90, H - 110, 180, 56, 28);
    c.fillStyle = S.A.a; c.fill();
    txt(c, 'Tamam', W / 2, H - 82, 20, '#08101e', 800);
    fxStep(S, c);
    hud(S, c, 'Karışım ' + g.round + '/' + S.goal);
  }
};

/* ================= 7) KAZI ================= */
GAMES.kazi = {
  ad: 'Kazı', ipucu: 'Kareleri kaz · sıcaklık seni yönlendirir',
  start(S) {
    const n = 6, finds = [];
    while (finds.length < 3) {
      const p = Math.floor(Math.random() * n * n);
      if (!finds.includes(p)) finds.push(p);
    }
    S.g = {n, finds, dug: new Set(), left: 14};
    S.goal = 3;
  },
  update(S) {
    const g = S.g, W = S.W, H = S.H;
    const cell = Math.min(W * .9, H * .7) / g.n, ox = (W - cell * g.n) / 2, oy = (H - cell * g.n) / 2 + 10;
    if (S.p.justDown) {
      const gx = Math.floor((S.p.x - ox) / cell), gy = Math.floor((S.p.y - oy) / cell);
      const i = gy * g.n + gx;
      if (gx >= 0 && gy >= 0 && gx < g.n && gy < g.n && !g.dug.has(i)) {
        g.dug.add(i); g.left--;
        if (g.finds.includes(i)) { S.score++; S.sfx('ok'); burst(S, ox + gx * cell + cell / 2, oy + gy * cell + cell / 2, '#ffe066', 20, 6); }
        else S.sfx('tick');
        if (S.score >= S.goal) S.done = 'win';
        else if (g.left <= 0) S.done = 'lose';
      }
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    const soil = S.skin === 'rontgen' ? ['#1b2230', '#0a0e16'] : S.skin === 'orman' ? ['#1e3326', '#0b140f'] : ['#3a2a1a', '#14100a'];
    bg.addColorStop(0, soil[0]); bg.addColorStop(1, soil[1]);
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const cell = Math.min(W * .9, H * .7) / g.n, ox = (W - cell * g.n) / 2, oy = (H - cell * g.n) / 2 + 10;
    for (let y = 0; y < g.n; y++) for (let x = 0; x < g.n; x++) {
      const i = y * g.n + x, px = ox + x * cell, py = oy + y * cell;
      rr(c, px + 3, py + 3, cell - 6, cell - 6, 10);
      if (!g.dug.has(i)) { c.fillStyle = 'rgba(255,255,255,.09)'; c.fill(); }
      else if (g.finds.includes(i)) {
        c.fillStyle = S.A.a; c.fill();
        txt(c, S.skin === 'rontgen' ? '🔎' : S.skin === 'maden' ? '💎' : S.skin === 'orman' ? '🌱' : '🏺', px + cell / 2, py + cell / 2, cell * .42, '#fff');
      } else {
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fill();
        // sıcaklık: en yakın buluntuya uzaklık
        let best = 99;
        for (const f of g.finds) best = Math.min(best, Math.abs(f % g.n - x) + Math.abs(Math.floor(f / g.n) - y));
        const col = best <= 1 ? '#ff7a4d' : best === 2 ? '#ffc94d' : '#5b8fd6';
        txt(c, best <= 1 ? 'sıcak' : best === 2 ? 'ılık' : 'soğuk', px + cell / 2, py + cell / 2, cell * .21, col, 800);
      }
    }
    fxStep(S, c);
    hud(S, c, 'Buluntu ' + S.score + '/3   ⛏' + g.left);
  }
};

/* ================= 8) SIRALA ================= */
GAMES.sirala = {
  ad: 'Sırala', ipucu: 'İki kutuya dokun · yerlerini değiştir',
  start(S) {
    const vals = [];
    while (vals.length < 5) { const v = Math.floor(rnd(1, 60)); if (!vals.includes(v)) vals.push(v); }
    S.g = {vals, sel: -1, moves: 0, max: 12};
    S.goal = 1;
  },
  update(S) {
    const g = S.g, W = S.W, H = S.H;
    const bw = Math.min(W * .17, 88), gap = 10, tot = 5 * bw + 4 * gap, ox = (W - tot) / 2, oy = H / 2 - bw / 2;
    if (S.p.justDown) {
      const i = Math.floor((S.p.x - ox) / (bw + gap));
      const inRow = S.p.y > oy - 20 && S.p.y < oy + bw + 20;
      if (i >= 0 && i < 5 && inRow) {
        if (g.sel < 0) { g.sel = i; S.sfx('tick'); }
        else if (g.sel === i) { g.sel = -1; }
        else {
          [g.vals[g.sel], g.vals[i]] = [g.vals[i], g.vals[g.sel]];
          g.sel = -1; g.moves++; S.sfx('tick');
        }
      }
    }
    const sorted = g.vals.every((v, i) => i === 0 || g.vals[i - 1] <= v);
    S.score = g.vals.filter((v, i) => i === 0 || g.vals[i - 1] <= v).length;
    if (sorted) { if (S.done !== 'win') { burst(S, W / 2, H / 2, S.A.a, 24, 7); S.sfx('ok'); } S.done = 'win'; }
    else if (g.moves >= g.max) S.done = 'lose';
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    c.fillStyle = '#0c1018'; c.fillRect(0, 0, W, H);
    txt(c, 'Küçükten büyüğe sırala', W / 2, 60, 19, 'rgba(255,255,255,.75)', 700);
    const bw = Math.min(W * .17, 88), gap = 10, tot = 5 * bw + 4 * gap, ox = (W - tot) / 2, oy = H / 2 - bw / 2;
    g.vals.forEach((v, i) => {
      const x = ox + i * (bw + gap), sel = g.sel === i;
      rr(c, x, sel ? oy - 10 : oy, bw, bw, 18);
      const gr = c.createLinearGradient(x, oy, x + bw, oy + bw);
      gr.addColorStop(0, S.A.a); gr.addColorStop(1, S.A.b);
      c.fillStyle = gr; c.fill();
      if (sel) { c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); }
      txt(c, v, x + bw / 2, (sel ? oy - 10 : oy) + bw / 2, bw * .38, '#08101e', 800);
    });
    fxStep(S, c);
    hud(S, c, 'Hamle ' + g.moves + '/' + g.max);
  }
};

/* ================= 9) HASSAS ================= */
GAMES.hassas = {
  ad: 'Hassas El', ipucu: 'Parmağını koridorda tut · sağa ilerle',
  start(S) {
    S.g = {prog: 0, strikes: 0, amp: S.H * .16, k: 3.2 / S.W, hw: 30, live: false, shake: 0};
    S.goal = 1;
  },
  cy(S, x) { return S.H / 2 + Math.sin(x * S.g.k * 2) * S.g.amp * .6 + Math.sin(x * S.g.k * .7 + 1) * S.g.amp * .4; },
  update(S) {
    const g = S.g;
    if (g.shake > 0) g.shake -= .05;
    if (S.p.down) {
      const cy = this.cy(S, S.p.x);
      const inside = Math.abs(S.p.y - cy) < g.hw;
      if (!g.live) { if (S.p.x < S.W * .22 && inside) g.live = true; }
      else if (!inside) { g.live = false; g.strikes++; g.shake = 1; S.sfx('bad'); if (g.strikes >= 3) S.done = 'lose'; }
      else { g.prog = Math.max(g.prog, S.p.x); }
    } else if (g.live) { g.live = false; }
    S.score = Math.round(g.prog / (S.W * .9) * 100);
    if (g.prog > S.W * .9) { if (S.done !== 'win') { burst(S, g.prog, this.cy(S, g.prog), S.A.a, 24, 7); S.sfx('ok'); } S.done = 'win'; }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, S.skin === 'tuval' ? '#1d1626' : '#0d1620'); bg.addColorStop(1, '#05080d');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    if (g.shake > 0) { c.save(); c.translate(rnd(-6, 6) * g.shake, rnd(-6, 6) * g.shake); }
    // koridor
    c.strokeStyle = 'rgba(255,255,255,.10)'; c.lineWidth = g.hw * 2; c.lineCap = 'round';
    c.beginPath();
    for (let x = 10; x <= W - 10; x += 6) { const y = this.cy(S, x); x === 10 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    // ilerleme
    c.strokeStyle = S.A.a; c.lineWidth = 6;
    c.beginPath();
    for (let x = 10; x <= Math.max(12, g.prog); x += 6) { const y = this.cy(S, x); x === 10 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    // başlangıç ve bitiş
    c.fillStyle = 'rgba(255,255,255,.7)';
    c.beginPath(); c.arc(14, this.cy(S, 14), 9, 0, TAU); c.fill();
    txt(c, '🎯', W - 22, this.cy(S, W - 22), 26, '#fff');
    // uç
    if (g.live) {
      glow(c, S.p.x, S.p.y, 44, S.A.a, .55);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(S.p.x, S.p.y, 8, 0, TAU); c.fill();
    }
    if (g.shake > 0) c.restore();
    fxStep(S, c);
    hud(S, c, '%' + S.score + '   ✕' + g.strikes);
  }
};

/* ================= 10) RİTİM ================= */
GAMES.ritim = {
  ad: 'Ritim', ipucu: 'Sırayı izle · sonra tekrarla',
  start(S) {
    S.g = {seq: [Math.floor(Math.random() * 4)], step: 0, showing: true, showI: 0, timer: 0, round: 0};
    S.goal = 4;
  },
  update(S) {
    const g = S.g;
    if (g.showing) {
      g.timer++;
      const per = 34;
      g.showI = Math.floor(g.timer / per);
      if (g.showI >= g.seq.length) { g.showing = false; g.step = 0; g.timer = 0; g.showI = -1; }
      else if (g.timer % per === 1) S.sfx('note' + g.seq[g.showI]);
      return;
    }
    if (S.p.justDown) {
      const i = padAt(S);
      if (i >= 0) {
        S.sfx('note' + i);
        if (i === g.seq[g.step]) {
          g.step++;
          if (g.step >= g.seq.length) {
            g.round++; S.score = g.round;
            if (g.round >= S.goal) { S.done = 'win'; burst(S, S.W / 2, S.H / 2, S.A.a, 26, 8); return; }
            g.seq.push(Math.floor(Math.random() * 4));
            g.showing = true; g.timer = 0; g.showI = 0;
          }
        } else { S.sfx('bad'); S.done = 'lose'; }
      }
    }
    function padAt(S) {
      const {ox, oy, pw} = padLayout(S);
      const x = Math.floor((S.p.x - ox) / pw), y = Math.floor((S.p.y - oy) / pw);
      if (x < 0 || y < 0 || x > 1 || y > 1) return -1;
      return y * 2 + x;
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    c.fillStyle = '#0b0e16'; c.fillRect(0, 0, W, H);
    const {ox, oy, pw} = padLayout(S);
    const cols = ['#ff6b8b', '#ffd166', '#6ee7b7', '#8fa0ff'];
    for (let i = 0; i < 4; i++) {
      const x = ox + (i % 2) * pw, y = oy + Math.floor(i / 2) * pw;
      const lit = g.showing && g.seq[g.showI] === i;
      rr(c, x + 8, y + 8, pw - 16, pw - 16, 22);
      c.fillStyle = lit ? cols[i] : 'rgba(255,255,255,.08)';
      c.fill();
      if (lit) glow(c, x + pw / 2, y + pw / 2, pw * .6, cols[i], .5);
      txt(c, ['🎵', '🎶', '🎼', '🎹'][i], x + pw / 2, y + pw / 2, pw * .22, lit ? '#12131a' : 'rgba(255,255,255,.3)');
    }
    txt(c, g.showing ? 'İzle…' : 'Tekrarla', W / 2, oy - 28, 20, '#fff', 800);
    fxStep(S, c);
    hud(S, c, 'Tur ' + g.round + '/' + S.goal);
  }
};
function padLayout(S) {
  const pw = Math.min(S.W * .42, S.H * .3, 150);
  return {pw, ox: S.W / 2 - pw, oy: S.H / 2 - pw};
}

/* ================= 11) NİŞAN ================= */
GAMES.nisan = {
  ad: 'Atış', ipucu: 'Geri çek ve bırak',
  start(S) {
    S.g = {bx: 50, by: S.H - 70, drag: null, ball: null, hits: 0, shots: 0, target: newT(S)};
    S.goal = 3;
    function newT(S) { return {x: rnd(S.W * .55, S.W - 60), y: rnd(S.H * .25, S.H - 110), r: 26}; }
    S.g.newT = newT;
  },
  update(S) {
    const g = S.g;
    if (S.p.justDown && !g.ball) g.drag = {x: S.p.x, y: S.p.y};
    if (g.drag && !S.p.down) {
      const dx = g.bx - S.p.x, dy = g.by - S.p.y;
      g.ball = {x: g.bx, y: g.by, vx: clamp(dx * .16, -22, 22), vy: clamp(dy * .16, -24, 24)};
      g.drag = null; g.shots++; S.sfx('tick');
    }
    if (g.ball) {
      g.ball.x += g.ball.vx; g.ball.y += g.ball.vy; g.ball.vy += .5;
      S.fx.push({x: g.ball.x, y: g.ball.y, vx: 0, vy: 0, l: .6, c: S.A.a, s: 3});
      const t = g.target;
      if (Math.hypot(g.ball.x - t.x, g.ball.y - t.y) < t.r + 8) {
        g.hits++; S.score = g.hits; S.sfx('ok');
        burst(S, t.x, t.y, '#ffe066', 26, 8);
        g.target = g.newT(S); g.ball = null;
        if (g.hits >= S.goal) S.done = 'win';
      } else if (g.ball.y > S.H + 40 || g.ball.x > S.W + 60 || g.ball.x < -60) {
        g.ball = null;
        if (g.shots - g.hits >= 6) S.done = 'lose';
      }
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#141b2e'); bg.addColorStop(1, '#070a12');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, H - 40, W, 40);
    // hedef
    const t = g.target;
    glow(c, t.x, t.y, t.r * 2.4, S.A.a, .35);
    for (let i = 3; i > 0; i--) {
      c.beginPath(); c.arc(t.x, t.y, t.r * i / 3, 0, TAU);
      c.fillStyle = i % 2 ? '#fff' : S.A.b; c.fill();
    }
    // yay çizgisi
    if (g.drag && S.p.down) {
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; c.setLineDash([6, 6]);
      c.beginPath(); c.moveTo(g.bx, g.by); c.lineTo(S.p.x, S.p.y); c.stroke();
      c.setLineDash([]);
      let px = g.bx, py = g.by, vx = clamp((g.bx - S.p.x) * .16, -22, 22), vy = clamp((g.by - S.p.y) * .16, -24, 24);
      c.fillStyle = 'rgba(255,255,255,.35)';
      for (let i = 0; i < 22; i++) { px += vx * 2; py += vy * 2; vy += 1; c.beginPath(); c.arc(px, py, 2.5, 0, TAU); c.fill(); }
    }
    // top / fırlatıcı
    c.fillStyle = S.A.b; rr(c, g.bx - 16, g.by + 4, 32, 26, 8); c.fill();
    const b = g.ball || {x: g.bx, y: g.by};
    c.fillStyle = S.A.a; c.beginPath(); c.arc(b.x, b.y, 9, 0, TAU); c.fill();
    fxStep(S, c);
    hud(S, c, 'İsabet ' + g.hits + '/' + S.goal + '   ⌖' + g.shots);
  }
};

/* ================= 12) DİL ================= */
GAMES.dil = {
  ad: 'Kelime Eşleştir', ipucu: 'Türkçesine dokun · sonra karşılığına',
  start(S) {
    const pairs = (S.words || []).slice(0, 4);
    const right = pairs.map((p, i) => ({t: p[1], i})).sort(() => Math.random() - .5);
    S.g = {pairs, right, selL: -1, ok: [], wrong: 0};
    S.goal = pairs.length || 4;
  },
  update(S) {
    const g = S.g, W = S.W, H = S.H;
    if (!g.pairs.length) { S.done = 'win'; return; }
    const rowH = Math.min(64, (H - 160) / g.pairs.length), top = (H - rowH * g.pairs.length) / 2 + 10;
    if (S.p.justDown) {
      const i = Math.floor((S.p.y - top) / rowH);
      if (i >= 0 && i < g.pairs.length) {
        if (S.p.x < W / 2) { if (!g.ok.includes(i)) { g.selL = i; S.sfx('tick'); } }
        else if (g.selL >= 0) {
          const r = g.right[i];
          if (r.i === g.selL && !g.ok.includes(r.i)) {
            g.ok.push(r.i); S.score = g.ok.length; S.sfx('ok');
            burst(S, W / 2, top + i * rowH + rowH / 2, S.A.a, 16, 5);
            if (g.ok.length >= g.pairs.length) S.done = 'win';
          } else { g.wrong++; S.sfx('bad'); if (g.wrong >= 5) S.done = 'lose'; }
          g.selL = -1;
        }
      }
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#151a2b'); bg.addColorStop(1, '#080b13');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    if (!g.pairs.length) return;
    const rowH = Math.min(64, (H - 160) / g.pairs.length), top = (H - rowH * g.pairs.length) / 2 + 10;
    txt(c, 'Türkçe', W / 4, top - 26, 15, 'rgba(255,255,255,.5)', 700);
    txt(c, S.langName || 'Karşılığı', W * .75, top - 26, 15, 'rgba(255,255,255,.5)', 700);
    g.pairs.forEach((p, i) => {
      const y = top + i * rowH, done = g.ok.includes(i);
      rr(c, 14, y + 4, W / 2 - 24, rowH - 10, 14);
      c.fillStyle = done ? S.A.b : g.selL === i ? S.A.a : 'rgba(255,255,255,.08)';
      c.fill();
      txt(c, p[0], W / 4, y + rowH / 2 - 1, Math.min(19, rowH * .34), done || g.selL === i ? '#08101e' : '#fff', 700);
    });
    g.right.forEach((r, i) => {
      const y = top + i * rowH, done = g.ok.includes(r.i);
      rr(c, W / 2 + 10, y + 4, W / 2 - 24, rowH - 10, 14);
      c.fillStyle = done ? S.A.b : 'rgba(255,255,255,.08)';
      c.fill();
      txt(c, r.t, W * .75, y + rowH / 2 - 1, Math.min(19, rowH * .34), done ? '#08101e' : '#fff', 700);
    });
    fxStep(S, c);
    hud(S, c, 'Eşleşme ' + g.ok.length + '/' + g.pairs.length);
  }
};

/* ================= 13) SPOR ================= */
const SPOR_FIG = {
  push: '💪', run: '🏃', lift: '🏋️', core: '🤸', flex: '🧘',
  hiit: '⚡', swim: '🏊', bike: '🚴', bar: '🧗', rec: '🧊'
};
GAMES.spor = {
  ad: 'Tempo', ipucu: 'İşaret yeşil alandayken dokun',
  start(S) {
    S.g = {x: 0, dir: 1, sp: .011, reps: 0, miss: 0, zone: .5, zw: .16, pulse: 0};
    S.goal = 8;
  },
  update(S) {
    const g = S.g;
    g.x += g.sp * g.dir;
    if (g.x > 1) { g.x = 1; g.dir = -1; }
    if (g.x < 0) { g.x = 0; g.dir = 1; }
    if (g.pulse > 0) g.pulse -= .07;
    if (S.p.justDown) {
      if (Math.abs(g.x - g.zone) < g.zw / 2) {
        g.reps++; S.score = g.reps; g.pulse = 1; S.sfx('ok');
        burst(S, S.W / 2, S.H * .42, S.A.a, 14, 5);
        g.zone = rnd(.2, .8); g.sp = .011 + g.reps * .0016;
        g.zw = Math.max(.09, .16 - g.reps * .007);
        if (g.reps >= S.goal) S.done = 'win';
      } else { g.miss++; S.sfx('bad'); if (g.miss >= 4) S.done = 'lose'; }
    }
  },
  draw(S, c) {
    const g = S.g, W = S.W, H = S.H;
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, S.A.b); bg.addColorStop(1, '#080b12');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // figür
    const s = 1 + g.pulse * .18 + Math.sin(S.t * .1) * .03;
    c.save(); c.translate(W / 2, H * .38); c.scale(s, s);
    txt(c, SPOR_FIG[S.skin] || '💪', 0, 0, Math.min(W, H) * .22, '#fff');
    c.restore();
    txt(c, 'Tekrar ' + g.reps + ' / ' + S.goal, W / 2, H * .58, 24, '#fff', 800);
    // tempo çubuğu
    const bx = W * .1, bw = W * .8, by = H * .68, bh = 34;
    rr(c, bx, by, bw, bh, 17); c.fillStyle = 'rgba(255,255,255,.10)'; c.fill();
    rr(c, bx + bw * (g.zone - g.zw / 2), by, bw * g.zw, bh, 17);
    c.fillStyle = 'rgba(90,230,150,.85)'; c.fill();
    const mx = bx + bw * g.x;
    c.fillStyle = '#fff'; rr(c, mx - 4, by - 9, 8, bh + 18, 4); c.fill();
    glow(c, mx, by + bh / 2, 40, '#fff', .35);
    txt(c, 'Form: ' + Math.max(0, 100 - g.miss * 25) + '%', W / 2, H * .8, 17, 'rgba(255,255,255,.7)', 700);
    fxStep(S, c);
    hud(S, c, 'Tekrar ' + g.reps + '/' + S.goal + '   ✕' + g.miss);
  }
};
