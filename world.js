/* =====================================================================
   GELİŞİM DÜNYASI — voxel dünya motoru (ham WebGL, kütüphanesiz)
   Prosedürel arazi, chunk meshleme, AO, blok kır/koy, gündüz-gece,
   dünyaya dağılmış Bilgi Kuleleri.
   ===================================================================== */
const W = (() => {

/* ---------------- sabitler ---------------- */
const CX = 16, CY = 56, CZ = 16;          // chunk boyutu
const SEA = 24;                            // deniz seviyesi
const REACH = 6;                           // blok erişim mesafesi
const IDX = (x, y, z) => x + (z << 4) + (y << 8);

const B = {AIR:0, CIM:1, TOPRAK:2, TAS:3, KUM:4, ODUN:5, YAPRAK:6, SU:7, KAR:8,
           TAHTA:9, CAM:10, ALTIN:11, LAMBA:12, TUGLA:13, OBSIDYEN:14};
/* t: [üst, alt, yan] karo indeksi */
const BDEF = {
  1:{t:[0,2,1], ad:'Çim'},      2:{t:[2,2,2], ad:'Toprak'},   3:{t:[3,3,3], ad:'Taş'},
  4:{t:[4,4,4], ad:'Kum'},      5:{t:[6,6,5], ad:'Odun'},     6:{t:[7,7,7], ad:'Yaprak', saydam:1},
  7:{t:[8,8,8], ad:'Su', sivi:1, saydam:1},                   8:{t:[13,2,13], ad:'Kar'},
  9:{t:[9,9,9], ad:'Tahta'},   10:{t:[10,10,10], ad:'Cam', saydam:1},
 11:{t:[11,11,11], ad:'Altın'},12:{t:[12,12,12], ad:'Lamba', isik:1},
 13:{t:[14,14,14], ad:'Tuğla'},14:{t:[15,15,15], ad:'Obsidyen'},
};
const kati = id => id !== 0 && id !== B.SU;
const opak = id => id !== 0 && !BDEF[id].saydam;

/* ---------------- gürültü ---------------- */
let SEED = 1337;
function hash2(x, z) {
  let h = x * 374761393 + z * 668265263 + SEED * 69069;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
const smooth = t => t * t * (3 - 2 * t);
function noise2(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  const u = smooth(xf), v = smooth(zf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function fbm(x, z, oct, sc) {
  let s = 0, a = .5, f = sc;
  for (let i = 0; i < oct; i++) { s += noise2(x * f, z * f) * a; a *= .5; f *= 2; }
  return s;
}

/* ---------------- kuleler (alanlar dünyaya dağılır) ---------------- */
const KULE = [];           // {a, x, z, y}
const KULE_MAP = new Map();
function kuleKur(alanlar) {
  KULE.length = 0; KULE_MAP.clear();
  const GA = Math.PI * (3 - Math.sqrt(5));
  alanlar.forEach((a, i) => {
    const r = 46 + Math.sqrt(i + 1) * 34;
    const th = i * GA;
    const x = Math.round(Math.cos(th) * r), z = Math.round(Math.sin(th) * r);
    const k = {a, x, z, y: 0};
    KULE.push(k);
    KULE_MAP.set(x + ',' + z, k);
  });
}
function kuleYakin(x, z, r) {
  let best = null, bd = r * r;
  for (const k of KULE) {
    const d = (k.x - x) * (k.x - x) + (k.z - z) * (k.z - z);
    if (d < bd) { bd = d; best = k; }
  }
  return best;
}

/* ---------------- arazi ---------------- */
function yukseklik(x, z) {
  const dag = Math.pow(fbm(x, z, 4, .006), 2.1) * 46;
  const tepe = fbm(x + 900, z - 400, 4, .018) * 13;
  return Math.floor(22 + dag + tepe);
}
function nem(x, z) { return fbm(x - 3100, z + 2400, 3, .0045); }
function biyom(x, z) {
  const h = yukseklik(x, z), m = nem(x, z);
  if (h > 44) return 'kar';
  if (m < .38) return 'çöl';
  if (m > .62) return 'orman';
  return 'ova';
}

/* ---------------- chunk ---------------- */
const chunks = new Map();
const EDIT = new Map();     // "x,y,z" -> id  (oyuncunun değişiklikleri)
const ck = (cx, cz) => cx + ',' + cz;

function uretChunk(cx, cz) {
  const d = new Uint8Array(CX * CY * CZ);
  const ox = cx * CX, oz = cz * CZ;
  for (let x = 0; x < CX; x++) for (let z = 0; z < CZ; z++) {
    const wx = ox + x, wz = oz + z;
    const h = Math.min(CY - 12, yukseklik(wx, wz));
    const bio = biyom(wx, wz);
    for (let y = 0; y <= h; y++) {
      let id = B.TAS;
      if (y === h) id = bio === 'çöl' ? B.KUM : bio === 'kar' ? B.KAR : B.CIM;
      else if (y > h - 4) id = bio === 'çöl' ? B.KUM : B.TOPRAK;
      if (y <= h && h < SEA && y > h - 3) id = B.KUM;
      d[IDX(x, y, z)] = id;
    }
    for (let y = h + 1; y <= SEA; y++) d[IDX(x, y, z)] = B.SU;
    // altın damarı
    if (hash2(wx * 7, wz * 13) > .994) {
      const gy = 4 + Math.floor(hash2(wx, wz + 5) * 12);
      if (gy < h) d[IDX(x, gy, z)] = B.ALTIN;
    }
    // ağaç
    if (h > SEA && (bio === 'orman' || bio === 'ova') && hash2(wx * 31, wz * 17) > (bio === 'orman' ? .965 : .992)
        && x > 2 && x < CX - 3 && z > 2 && z < CZ - 3) {
      const th = 4 + Math.floor(hash2(wx + 1, wz + 1) * 3);
      for (let y = 1; y <= th; y++) if (h + y < CY) d[IDX(x, h + y, z)] = B.ODUN;
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = -1; dy <= 2; dy++) {
        const lx = x + dx, ly = h + th + dy, lz = z + dz;
        if (lx < 0 || lz < 0 || lx >= CX || lz >= CZ || ly >= CY) continue;
        if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) > 3) continue;
        if (d[IDX(lx, ly, lz)] === 0) d[IDX(lx, ly, lz)] = B.YAPRAK;
      }
    }
  }
  // bilgi kuleleri
  for (const k of KULE) {
    if (k.x < ox - 6 || k.x >= ox + CX + 6 || k.z < oz - 6 || k.z >= oz + CZ + 6) continue;
    const base = Math.max(SEA + 1, yukseklik(k.x, k.z));
    k.y = base;
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
      const lx = k.x + dx - ox, lz = k.z + dz - oz;
      if (lx < 0 || lz < 0 || lx >= CX || lz >= CZ) continue;
      const kenar = Math.max(Math.abs(dx), Math.abs(dz));
      // platform
      for (let y = base - 3; y <= base; y++) if (y >= 0 && y < CY) d[IDX(lx, y, lz)] = B.TUGLA;
      if (kenar === 3) { // köşe sütunları
        if (Math.abs(dx) === 3 && Math.abs(dz) === 3)
          for (let y = base + 1; y <= base + 5; y++) if (y < CY) d[IDX(lx, y, lz)] = B.OBSIDYEN;
      }
      if (kenar <= 1) { // ışık kolonu
        for (let y = base + 1; y <= base + 7 + kenar * -2; y++) if (y < CY) d[IDX(lx, y, lz)] = kenar === 0 ? B.LAMBA : B.ALTIN;
      }
    }
  }
  // oyuncu değişiklikleri
  for (const [key, id] of EDIT) {
    const p = key.split(',');
    const wx = +p[0], wy = +p[1], wz = +p[2];
    if (wx < ox || wx >= ox + CX || wz < oz || wz >= oz + CZ || wy < 0 || wy >= CY) continue;
    d[IDX(wx - ox, wy, wz - oz)] = id;
  }
  return {cx, cz, d, mesh: null, suMesh: null, kirli: true};
}
function getChunk(cx, cz, uret) {
  const k = ck(cx, cz);
  let c = chunks.get(k);
  if (!c && uret) { c = uretChunk(cx, cz); chunks.set(k, c); }
  return c;
}
function blok(wx, wy, wz) {
  if (wy < 0 || wy >= CY) return 0;
  const cx = wx >> 4, cz = wz >> 4;
  const c = getChunk(cx, cz, true);
  return c.d[IDX(wx - (cx << 4), wy, wz - (cz << 4))];
}
function blokKoy(wx, wy, wz, id) {
  if (wy < 0 || wy >= CY) return;
  const cx = wx >> 4, cz = wz >> 4;
  const c = getChunk(cx, cz, true);
  c.d[IDX(wx - (cx << 4), wy, wz - (cz << 4))] = id;
  EDIT.set(wx + ',' + wy + ',' + wz, id);
  c.kirli = true;
  // komşu chunk sınırı
  const lx = wx - (cx << 4), lz = wz - (cz << 4);
  if (lx === 0) { const n = getChunk(cx - 1, cz); if (n) n.kirli = true; }
  if (lx === CX - 1) { const n = getChunk(cx + 1, cz); if (n) n.kirli = true; }
  if (lz === 0) { const n = getChunk(cx, cz - 1); if (n) n.kirli = true; }
  if (lz === CZ - 1) { const n = getChunk(cx, cz + 1); if (n) n.kirli = true; }
}

/* ---------------- yüz tanımları ---------------- */
/* her yön: normal, köşe başlangıcı, u ekseni, v ekseni, karo seçimi */
const FACE = [
  {n:[ 1,0,0], o:[1,0,0], u:[0,0,1], v:[0,1,0], t:2, l:.72},
  {n:[-1,0,0], o:[0,0,1], u:[0,0,-1],v:[0,1,0], t:2, l:.72},
  {n:[0, 1,0], o:[0,1,0], u:[1,0,0], v:[0,0,1], t:0, l:1.0},
  {n:[0,-1,0], o:[0,0,1], u:[1,0,0], v:[0,0,-1],t:1, l:.45},
  {n:[0,0, 1], o:[1,0,1], u:[-1,0,0],v:[0,1,0], t:2, l:.86},
  {n:[0,0,-1], o:[0,0,0], u:[1,0,0], v:[0,1,0], t:2, l:.60},
];
const AOL = [.42, .60, .80, 1.0];

function mesheChunk(c) {
  const ox = c.cx * CX, oz = c.cz * CZ;
  const V = [], VS = [];            // katı, su/saydam
  const push = (arr, x, y, z, u, v, l) => { arr.push(x, y, z, u, v, l); };
  for (let y = 0; y < CY; y++) for (let z = 0; z < CZ; z++) for (let x = 0; x < CX; x++) {
    const id = c.d[IDX(x, y, z)];
    if (!id) continue;
    const def = BDEF[id];
    const wx = ox + x, wz = oz + z;
    const hedef = def.saydam ? VS : V;
    for (let f = 0; f < 6; f++) {
      const F = FACE[f];
      const nx = wx + F.n[0], ny = y + F.n[1], nz = wz + F.n[2];
      const nb = blok(nx, ny, nz);
      if (id === B.SU) { if (nb === B.SU || opak(nb)) continue; }
      else if (opak(nb) || nb === id) continue;
      const karo = def.t[F.t];
      const tx = karo & 3, ty = karo >> 2;
      const e = .003, s = .25;
      const u0 = tx * s + e, v0 = ty * s + e, du = s - e * 2;
      const yTop = (id === B.SU && f === 2) ? .88 : 1;
      const ao = [];
      for (let ci = 0; ci < 4; ci++) {
        const cu = (ci === 1 || ci === 2) ? 1 : 0, cv = (ci >= 2) ? 1 : 0;
        const su = cu ? 1 : -1, sv = cv ? 1 : -1;
        const s1 = opak(blok(nx + F.u[0] * su, ny + F.u[1] * su, nz + F.u[2] * su)) ? 1 : 0;
        const s2 = opak(blok(nx + F.v[0] * sv, ny + F.v[1] * sv, nz + F.v[2] * sv)) ? 1 : 0;
        const cr = opak(blok(nx + F.u[0] * su + F.v[0] * sv, ny + F.u[1] * su + F.v[1] * sv, nz + F.u[2] * su + F.v[2] * sv)) ? 1 : 0;
        ao.push((s1 && s2) ? 0 : 3 - (s1 + s2 + cr));
      }
      const P = [];
      for (let ci = 0; ci < 4; ci++) {
        const cu = (ci === 1 || ci === 2) ? 1 : 0, cv = (ci >= 2) ? 1 : 0;
        P.push([
          wx + F.o[0] + F.u[0] * cu + F.v[0] * cv,
          y + F.o[1] + (F.u[1] * cu + F.v[1] * cv) * (F.t === 0 ? 1 : 1),
          wz + F.o[2] + F.u[2] * cu + F.v[2] * cv
        ]);
      }
      if (id === B.SU && f === 2) P.forEach(p => p[1] -= .12);
      const UV = [[u0, v0 + du], [u0 + du, v0 + du], [u0 + du, v0], [u0, v0]];
      const li = ci => (def.isik ? 1 : F.l * AOL[ao[ci]]);
      const q = (a, b2, cc) => {
        [a, b2, cc].forEach(i => push(hedef, P[i][0], P[i][1], P[i][2], UV[i][0], UV[i][1], li(i)));
      };
      if (ao[0] + ao[2] > ao[1] + ao[3]) { q(1, 2, 3); q(1, 3, 0); }
      else { q(0, 1, 2); q(0, 2, 3); }
    }
  }
  c.mesh = yukleMesh(c.mesh, V);
  c.suMesh = yukleMesh(c.suMesh, VS);
  c.kirli = false;
}

/* ---------------- WebGL ---------------- */
let gl, prog, loc, tex, cvs;
let buffers = new WeakMap();

function yukleMesh(eski, arr) {
  if (!arr.length) { if (eski) gl.deleteBuffer(eski.buf); return null; }
  const b = eski && eski.buf ? eski : {buf: gl.createBuffer()};
  gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
  b.n = arr.length / 6;
  return b;
}

const VSH = `
attribute vec3 aPos; attribute vec2 aUV; attribute float aL;
uniform mat4 uMVP; uniform vec3 uCam;
varying vec2 vUV; varying float vL; varying float vF;
void main(){
  vec4 p = uMVP * vec4(aPos,1.0);
  gl_Position = p;
  vUV = aUV; vL = aL;
  float d = length(aPos - uCam);
  vF = clamp((d - 34.0) / 42.0, 0.0, 1.0);
}`;
const FSH = `
precision mediump float;
uniform sampler2D uTex; uniform vec3 uSis; uniform float uGun;
varying vec2 vUV; varying float vL; varying float vF;
void main(){
  vec4 c = texture2D(uTex, vUV);
  if (c.a < 0.35) discard;
  vec3 col = c.rgb * vL * uGun;
  gl_FragColor = vec4(mix(col, uSis, vF), c.a);
}`;

function shader(t, src) {
  const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

/* ---------------- doku atlası (prosedürel) ---------------- */
function atlasYap() {
  const T = 32, N = 4, c = document.createElement('canvas');
  c.width = c.height = T * N;
  const x = c.getContext('2d');
  const gur = (bx, by, r, g, b, k) => {
    for (let i = 0; i < T; i++) for (let j = 0; j < T; j++) {
      const n = (Math.random() - .5) * k;
      x.fillStyle = `rgb(${(r + n) | 0},${(g + n) | 0},${(b + n) | 0})`;
      x.fillRect(bx + i, by + j, 1, 1);
    }
  };
  const P = i => [(i % N) * T, ((i / N) | 0) * T];
  let p;
  p = P(0);  gur(p[0], p[1], 106, 170, 80, 26);                     // çim üst
  p = P(1);  gur(p[0], p[1], 134, 96, 67, 22);                       // çim yan
             x.fillStyle = '#6aaa50'; x.fillRect(p[0], p[1], T, 7);
             for (let i = 0; i < T; i += 2) x.fillRect(p[0] + i, p[1] + 7, 1, 2 + ((i * 7) % 4));
  p = P(2);  gur(p[0], p[1], 134, 96, 67, 24);                       // toprak
  p = P(3);  gur(p[0], p[1], 128, 128, 130, 22);                     // taş
  p = P(4);  gur(p[0], p[1], 219, 205, 150, 18);                     // kum
  p = P(5);  gur(p[0], p[1], 104, 78, 47, 16);                       // odun yan
             x.fillStyle = 'rgba(70,50,28,.75)';
             for (let i = 2; i < T; i += 7) x.fillRect(p[0] + i, p[1], 2, T);
  p = P(6);  gur(p[0], p[1], 148, 118, 74, 14);                      // odun üst
             x.strokeStyle = 'rgba(90,66,36,.8)'; x.lineWidth = 2;
             for (let r = 4; r < T / 2; r += 5) { x.beginPath(); x.arc(p[0] + T / 2, p[1] + T / 2, r, 0, 6.3); x.stroke(); }
  p = P(7);  x.clearRect(p[0], p[1], T, T);                          // yaprak (delikli)
             for (let i = 0; i < T; i++) for (let j = 0; j < T; j++) {
               if (Math.random() < .17) continue;
               const g2 = 96 + Math.random() * 54;
               x.fillStyle = `rgb(${(30 + g2 * .28) | 0},${g2 | 0},${(34 + g2 * .2) | 0})`;
               x.fillRect(p[0] + i, p[1] + j, 1, 1);
             }
  p = P(8);  gur(p[0], p[1], 54, 118, 196, 16);                      // su
  p = P(9);  gur(p[0], p[1], 176, 139, 92, 14);                      // tahta
             x.fillStyle = 'rgba(120,90,56,.6)';
             for (let j = 0; j < T; j += 8) x.fillRect(p[0], p[1] + j, T, 1);
  p = P(10); x.clearRect(p[0], p[1], T, T);                          // cam
             x.fillStyle = 'rgba(196,232,255,.30)'; x.fillRect(p[0], p[1], T, T);
             x.fillStyle = '#cfeaff'; x.fillRect(p[0], p[1], T, 3); x.fillRect(p[0], p[1] + T - 3, T, 3);
             x.fillRect(p[0], p[1], 3, T); x.fillRect(p[0] + T - 3, p[1], 3, T);
  p = P(11); gur(p[0], p[1], 128, 128, 130, 18);                     // altın cevheri
             x.fillStyle = '#ffcf3d';
             for (let i = 0; i < 9; i++) x.fillRect(p[0] + 3 + ((i * 11) % 24), p[1] + 4 + ((i * 17) % 23), 5, 5);
  p = P(12); gur(p[0], p[1], 255, 214, 120, 16);                     // lamba
             x.fillStyle = '#fff6cf'; x.fillRect(p[0] + 6, p[1] + 6, T - 12, T - 12);
  p = P(13); gur(p[0], p[1], 242, 246, 252, 10);                     // kar
  p = P(14); gur(p[0], p[1], 150, 76, 66, 12);                       // tuğla
             x.fillStyle = 'rgba(228,222,214,.85)';
             for (let j = 0; j < T; j += 8) { x.fillRect(p[0], p[1] + j, T, 2);
               for (let i = (j % 16 ? 0 : 8); i < T; i += 16) x.fillRect(p[0] + i, p[1] + j, 2, 8); }
  p = P(15); gur(p[0], p[1], 38, 30, 54, 14);                        // obsidyen
             x.fillStyle = 'rgba(150,110,220,.45)';
             for (let i = 0; i < 6; i++) x.fillRect(p[0] + ((i * 13) % 26), p[1] + ((i * 19) % 26), 4, 4);
  return c;
}

/* ---------------- matris ---------------- */
function persp(fovy, ar, zn, zf) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (zn - zf);
  return [f / ar,0,0,0, 0,f,0,0, 0,0,(zf + zn) * nf,-1, 0,0,2 * zf * zn * nf,0];
}
function lookAt(e, c2, up) {
  let zx = e[0]-c2[0], zy = e[1]-c2[1], zz = e[2]-c2[2];
  let l = Math.hypot(zx,zy,zz); zx/=l; zy/=l; zz/=l;
  let xx = up[1]*zz - up[2]*zy, xy = up[2]*zx - up[0]*zz, xz = up[0]*zy - up[1]*zx;
  l = Math.hypot(xx,xy,xz) || 1; xx/=l; xy/=l; xz/=l;
  const yx = zy*xz - zz*xy, yy = zz*xx - zx*xz, yz = zx*xy - zy*xx;
  return [xx,yx,zx,0, xy,yy,zy,0, xz,yz,zz,0,
    -(xx*e[0]+xy*e[1]+xz*e[2]), -(yx*e[0]+yy*e[1]+yz*e[2]), -(zx*e[0]+zy*e[1]+zz*e[2]), 1];
}
function mul(a, b) {
  const o = new Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    o[i*4+j] = a[j]*b[i*4] + a[4+j]*b[i*4+1] + a[8+j]*b[i*4+2] + a[12+j]*b[i*4+3];
  }
  return o;
}

/* ---------------- oyuncu ---------------- */
const P = {x: .5, y: 60, z: .5, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, yer: false, ucus: false};
const GENIS = .3, BOY = 1.72, GOZ = 1.62;
const girdi = {ileri:0, sag:0, zipla:0, in:0, kos:0};

function carpisma(dt) {
  const g = P.ucus ? 0 : 26;
  P.vy -= g * dt;
  if (P.ucus) P.vy *= .86;
  const adim = (v, ax) => {
    const eski = {x:P.x, y:P.y, z:P.z};
    P[ax] += v;
    const x0 = Math.floor(P.x - GENIS), x1 = Math.floor(P.x + GENIS);
    const y0 = Math.floor(P.y), y1 = Math.floor(P.y + BOY);
    const z0 = Math.floor(P.z - GENIS), z1 = Math.floor(P.z + GENIS);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      if (!kati(blok(x, y, z))) continue;
      P[ax] = eski[ax];
      if (ax === 'y') { if (v < 0) P.yer = true; P.vy = 0; }
      return;
    }
  };
  P.yer = false;
  adim(P.vy * dt, 'y');
  adim(P.vx * dt, 'x');
  adim(P.vz * dt, 'z');
  if (P.y < -8) { P.y = 70; P.vy = 0; }
}
function guncelleOyuncu(dt) {
  const hiz = (P.ucus ? 11 : girdi.kos ? 7.4 : 4.7);
  const sy = Math.sin(P.yaw), cy2 = Math.cos(P.yaw);
  let dx = (-sy * girdi.ileri + cy2 * girdi.sag);
  let dz = (-cy2 * girdi.ileri - sy * girdi.sag);
  const l = Math.hypot(dx, dz);
  if (l > 1) { dx /= l; dz /= l; }
  P.vx = dx * hiz; P.vz = dz * hiz;
  if (P.ucus) {
    if (girdi.zipla) P.vy = 8;
    else if (girdi.in) P.vy = -8;
  } else if (girdi.zipla && P.yer) P.vy = 8.6;
  carpisma(dt);
}

/* ---------------- ışın (blok seçimi) ---------------- */
function isin() {
  const cp = Math.cos(P.pitch), sp = Math.sin(P.pitch);
  const dx = -Math.sin(P.yaw) * cp, dy = sp, dz = -Math.cos(P.yaw) * cp;
  let x = P.x, y = P.y + GOZ, z = P.z, once = null;
  for (let t = 0; t < REACH; t += .03) {
    const bx = Math.floor(x), by = Math.floor(y), bz = Math.floor(z);
    const id = blok(bx, by, bz);
    if (id && id !== B.SU) return {x:bx, y:by, z:bz, id, once};
    once = {x:bx, y:by, z:bz};
    x += dx * .03; y += dy * .03; z += dz * .03;
  }
  return null;
}

/* ---------------- API ---------------- */
let ready = false, kamAci = 0, gunSaat = .28, sonKule = null, cb = {};
let cizilenChunk = 0, fps = 60, fpsT = 0, fpsN = 0;

function init(canvas, alanlar, kayit, callbacks) {
  cvs = canvas; cb = callbacks || {};
  kuleKur(alanlar);
  if (kayit) {
    if (kayit.p) { P.x = kayit.p[0]; P.y = kayit.p[1]; P.z = kayit.p[2]; P.yaw = kayit.p[3]; P.pitch = kayit.p[4]; }
    if (kayit.edit) for (const k in kayit.edit) EDIT.set(k, kayit.edit[k]);
  } else {
    // ilk açılışta ilk Bilgi Kulesi'nin platformunda başla
    const k = KULE[0], base = Math.max(SEA + 1, yukseklik(k.x, k.z));
    P.x = k.x + .5; P.z = k.z + 2.5; P.y = base + 1;
    P.yaw = 0; P.pitch = -.12;
  }
  gl = cvs.getContext('webgl', {antialias: false, alpha: false, powerPreference: 'high-performance'});
  if (!gl) return false;
  const p = gl.createProgram();
  gl.attachShader(p, shader(gl.VERTEX_SHADER, VSH));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, FSH));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  prog = p; gl.useProgram(p);
  loc = {
    pos: gl.getAttribLocation(p, 'aPos'), uv: gl.getAttribLocation(p, 'aUV'), l: gl.getAttribLocation(p, 'aL'),
    mvp: gl.getUniformLocation(p, 'uMVP'), cam: gl.getUniformLocation(p, 'uCam'),
    tex: gl.getUniformLocation(p, 'uTex'), sis: gl.getUniformLocation(p, 'uSis'), gun: gl.getUniformLocation(p, 'uGun')
  };
  tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasYap());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);
  ready = true;
  return true;
}

function boyut() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cvs.width = Math.floor(innerWidth * dpr);
  cvs.height = Math.floor(innerHeight * dpr);
  if (gl) gl.viewport(0, 0, cvs.width, cvs.height);
}

let MESAFE = 5;
function chunkYonet() {
  const pcx = Math.floor(P.x) >> 4, pcz = Math.floor(P.z) >> 4;
  let butce = 2;
  for (let r = 0; r <= MESAFE && butce > 0; r++) {
    for (let dx = -r; dx <= r && butce > 0; dx++) for (let dz = -r; dz <= r; dz++) {
      if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
      const c = getChunk(pcx + dx, pcz + dz, true);
      if (c.kirli) { mesheChunk(c); if (--butce <= 0) break; }
    }
  }
  // uzaktakileri at
  if (chunks.size > (MESAFE * 2 + 5) * (MESAFE * 2 + 5)) {
    for (const [k, c] of chunks) {
      if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cz - pcz)) > MESAFE + 2) {
        if (c.mesh) gl.deleteBuffer(c.mesh.buf);
        if (c.suMesh) gl.deleteBuffer(c.suMesh.buf);
        chunks.delete(k);
      }
    }
  }
}

function ciz(dt) {
  gunSaat = (gunSaat + dt / 420) % 1;
  const gunes = Math.max(.22, Math.sin(gunSaat * Math.PI * 2) * .55 + .58);
  const gece = 1 - Math.min(1, gunes);
  const sis = [.42 * gunes + .04, .60 * gunes + .05, .86 * gunes + .10];
  gl.clearColor(sis[0], sis[1], sis[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const ar = cvs.width / cvs.height;
  const cp = Math.cos(P.pitch);
  const ex = P.x, ey = P.y + GOZ, ez = P.z;
  const dir = [-Math.sin(P.yaw) * cp, Math.sin(P.pitch), -Math.cos(P.yaw) * cp];
  const mvp = mul(persp(1.28, ar, .1, 160), lookAt([ex, ey, ez], [ex + dir[0], ey + dir[1], ez + dir[2]], [0, 1, 0]));

  gl.useProgram(prog);
  gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp));
  gl.uniform3f(loc.cam, ex, ey, ez);
  gl.uniform3f(loc.sis, sis[0], sis[1], sis[2]);
  gl.uniform1f(loc.gun, gunes);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(loc.tex, 0);
  gl.enableVertexAttribArray(loc.pos); gl.enableVertexAttribArray(loc.uv); gl.enableVertexAttribArray(loc.l);

  const pcx = Math.floor(P.x) >> 4, pcz = Math.floor(P.z) >> 4;
  const liste = [];
  for (const c of chunks.values()) {
    if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cz - pcz)) > MESAFE) continue;
    liste.push(c);
  }
  const bagla = m => {
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 24, 12);
    gl.vertexAttribPointer(loc.l, 1, gl.FLOAT, false, 24, 20);
    gl.drawArrays(gl.TRIANGLES, 0, m.n);
  };
  cizilenChunk = 0;
  for (const c of liste) if (c.mesh) { bagla(c.mesh); cizilenChunk++; }
  gl.depthMask(false);
  for (const c of liste) if (c.suMesh) bagla(c.suMesh);
  gl.depthMask(true);

  // fps
  fpsN++; fpsT += dt;
  if (fpsT > .5) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
}

let sonZaman = 0;
function kare(t) {
  if (!ready) return;
  const dt = Math.min(.05, (t - sonZaman) / 1000 || .016);
  sonZaman = t;
  guncelleOyuncu(dt);
  chunkYonet();
  ciz(dt);
  const k = kuleYakin(P.x, P.z, 6);
  if (k !== sonKule) { sonKule = k; if (cb.kule) cb.kule(k); }
}

function kaydet() {
  const e = {};
  let n = 0;
  for (const [k, v] of EDIT) { e[k] = v; if (++n > 4000) break; }
  return {p: [P.x, P.y, P.z, P.yaw, P.pitch], edit: e};
}

return {
  init, boyut, kare, isin, blok, blokKoy, kaydet,
  P, girdi, B, BDEF, KULE, biyom, yukseklik,
  get fps() { return fps; },
  get chunkSayisi() { return cizilenChunk; },
  get saat() { return gunSaat; },
  set mesafe(v) { MESAFE = v; },
  get mesafe() { return MESAFE; },
  yakinKule: () => sonKule,
  isinla(x, z) {
    P.x = x + .5; P.z = z + .5;
    P.y = Math.max(SEA + 2, yukseklik(x, z)) + 4;
    P.vy = 0;
  },
  /* kulenin platformuna ışınla (her zaman su üstünde) */
  isinlaKule(k) {
    const base = Math.max(SEA + 1, yukseklik(k.x, k.z));
    P.x = k.x + .5; P.z = k.z + 2.5; P.y = base + 1;
    P.vx = P.vy = P.vz = 0;
    P.yaw = 0; P.pitch = -.15;
  },
  kuleTaban(k) { return Math.max(SEA + 1, yukseklik(k.x, k.z)); }
};
})();
