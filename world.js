/* =====================================================================
   GELİŞİM DÜNYASI — çok diyarlı voxel motoru (ham WebGL, kütüphanesiz)
   5 diyar · gökyüzü shaderı · varlıklar · futbol · ruh avı · yetenekler
   ===================================================================== */
const W = (() => {

const CX = 16, CY = 64, CZ = 16;
const IDX = (x, y, z) => x + (z << 4) + (y << 8);
const TAU = Math.PI * 2;
const cl = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------------- bloklar ---------------- */
const B = {AIR:0, CIM:1, TOPRAK:2, TAS:3, KUM:4, ODUN:5, YAPRAK:6, SU:7, KAR:8,
  TAHTA:9, CAM:10, ALTIN:11, LAMBA:12, TUGLA:13, OBSIDYEN:14,
  REGOLIT:15, LAV:16, MERCAN:17, NEON:18, BUZ:19, YOSUN:20, KIZILKUM:21, KRISTAL:22};
const BDEF = {
  1:{t:[0,2,1], ad:'Çim'},        2:{t:[2,2,2], ad:'Toprak'},    3:{t:[3,3,3], ad:'Taş'},
  4:{t:[4,4,4], ad:'Kum'},        5:{t:[6,6,5], ad:'Odun'},      6:{t:[7,7,7], ad:'Yaprak', saydam:1},
  7:{t:[8,8,8], ad:'Su', sivi:1, saydam:1},                      8:{t:[13,2,13], ad:'Kar'},
  9:{t:[9,9,9], ad:'Tahta'},     10:{t:[10,10,10], ad:'Cam', saydam:1},
 11:{t:[11,11,11], ad:'Altın'},  12:{t:[12,12,12], ad:'Lamba', isik:1},
 13:{t:[14,14,14], ad:'Tuğla'},  14:{t:[15,15,15], ad:'Obsidyen'},
 15:{t:[16,16,16], ad:'Regolit'},17:{t:[18,18,18], ad:'Mercan'},
 16:{t:[17,17,17], ad:'Lav', sivi:1, isik:1, yakar:1},
 18:{t:[19,19,19], ad:'Neon', isik:1},  19:{t:[20,20,20], ad:'Buz', saydam:1},
 20:{t:[21,21,21], ad:'Yosun'},  21:{t:[22,22,22], ad:'Kızıl Kum'},
 22:{t:[23,23,23], ad:'Kristal', isik:1},
};
const kati = id => id !== 0 && !BDEF[id].sivi;
const opak = id => id !== 0 && !BDEF[id].saydam;

/* ---------------- diyarlar ---------------- */
const DIYARLAR = [
  {id:'dunya', ad:'Dünya',        ikon:'🌍', g:26,  zip:8.6, deniz:24, sivi:B.SU,
   gruplar:['Mühendislik','Spor'], gok:[0.42,0.60,0.86], ufuk:[0.72,0.84,0.98], bulut:1, yildiz:0, dip:6},
  {id:'ay', ad:'Ay',              ikon:'🌙', g:5.2, zip:7.4, deniz:-1, sivi:0,
   gruplar:['Bilim'],             gok:[0.02,0.02,0.05], ufuk:[0.10,0.10,0.16], bulut:0, yildiz:1, dip:3, dunyaGoster:1},
  {id:'derin', ad:'Derin Okyanus',ikon:'🌊', g:9,   zip:6.2, deniz:58, sivi:B.SU, suAlti:1,
   gruplar:['Doğa'],              gok:[0.02,0.14,0.24], ufuk:[0.05,0.28,0.42], bulut:0, yildiz:0, dip:2},
  {id:'volkan', ad:'Volkan',      ikon:'🌋', g:26,  zip:8.6, deniz:14, sivi:B.LAV,
   gruplar:['Sağlık'],            gok:[0.16,0.03,0.02], ufuk:[0.52,0.14,0.04], bulut:.5, yildiz:0, dip:5, kul:1},
  {id:'ruya', ad:'Rüya',          ikon:'✨', g:11,  zip:8.2, deniz:-1, sivi:0, ucanAda:1,
   gruplar:['Sosyal','Dil'],      gok:[0.16,0.05,0.28], ufuk:[0.62,0.24,0.62], bulut:.35, yildiz:1, dip:0},
];
let D = DIYARLAR[0];
const DIYAR_OF = Object.fromEntries(DIYARLAR.map(d => [d.id, d]));

/* ---------------- gürültü ---------------- */
let SEED = 1337;
function hash2(x, z) {
  let h = x * 374761393 + z * 668265263 + SEED * 69069;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
function hash3(x, y, z) {
  let h = x * 374761393 + y * 1103515245 + z * 668265263 + SEED * 69069;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
const sm = t => t * t * (3 - 2 * t);
function noise2(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  const u = sm(xf), v = sm(zf);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = sm(x - xi), v = sm(y - yi), w = sm(z - zi);
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  const x00 = lerp(c(0,0,0), c(1,0,0), u), x10 = lerp(c(0,1,0), c(1,1,0), u);
  const x01 = lerp(c(0,0,1), c(1,0,1), u), x11 = lerp(c(0,1,1), c(1,1,1), u);
  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w);
}
function fbm(x, z, oct, sc) {
  let s = 0, a = .5, f = sc;
  for (let i = 0; i < oct; i++) { s += noise2(x * f, z * f) * a; a *= .5; f *= 2; }
  return s;
}

/* ---------------- diyara göre arazi ---------------- */
function yukseklik(x, z) {
  switch (D.id) {
    case 'ay': {
      const t = fbm(x, z, 4, .010) * 22 + 20;
      // krater
      const cxk = Math.round(x / 46) * 46, czk = Math.round(z / 46) * 46;
      const dd = Math.hypot(x - cxk, z - czk), r = 9 + hash2(cxk, czk) * 11;
      let h = t;
      if (dd < r) h -= (1 - dd / r) * (r * .8);
      else if (dd < r + 3) h += (r + 3 - dd) * .8;
      return Math.floor(h);
    }
    case 'derin': {
      return Math.floor(10 + fbm(x, z, 4, .012) * 34 + Math.pow(fbm(x + 700, z, 3, .004), 3) * 30);
    }
    case 'volkan': {
      const k = Math.pow(fbm(x, z, 5, .009), 1.6) * 52;
      return Math.floor(8 + k + fbm(x - 300, z + 300, 3, .03) * 6);
    }
    case 'ruya': return 34;
    default: {
      const dag = Math.pow(fbm(x, z, 4, .006), 2.1) * 46;
      const tepe = fbm(x + 900, z - 400, 4, .018) * 13;
      return Math.floor(22 + dag + tepe);
    }
  }
}
function nem(x, z) { return fbm(x - 3100, z + 2400, 3, .0045); }
function biyom(x, z) {
  if (D.id === 'ay') return 'kraterler';
  if (D.id === 'derin') return 'resif';
  if (D.id === 'volkan') return 'lav tarlası';
  if (D.id === 'ruya') return 'uçan adalar';
  const h = yukseklik(x, z), m = nem(x, z);
  if (h > 46) return 'kar';
  if (m < .38) return 'çöl';
  if (m > .62) return 'orman';
  return 'ova';
}

/* ---------------- kuleler ---------------- */
const KULE = [];
let TUM_ALAN = [];
function kuleKur() {
  KULE.length = 0;
  const list = TUM_ALAN.filter(a => D.gruplar.includes(a.grp));
  const GA = Math.PI * (3 - Math.sqrt(5));
  list.forEach((a, i) => {
    const r = 44 + Math.sqrt(i + 1) * 32;
    const th = i * GA;
    KULE.push({a, x: Math.round(Math.cos(th) * r), y: 0, z: Math.round(Math.sin(th) * r)});
  });
}
function kuleTaban(k) {
  if (D.ucanAda) return 34;
  return Math.max((D.deniz > 0 ? D.deniz + 1 : 4), yukseklik(k.x, k.z));
}
function kuleYakin(x, z, r) {
  let best = null, bd = r * r;
  for (const k of KULE) {
    const d = (k.x - x) ** 2 + (k.z - z) ** 2;
    if (d < bd) { bd = d; best = k; }
  }
  return best;
}

/* ---------------- chunk üretimi ---------------- */
const chunks = new Map();
const EDITS = {};                     // diyar -> Map
const ck = (cx, cz) => cx + ',' + cz;
function editMap() { return EDITS[D.id] || (EDITS[D.id] = new Map()); }

function uretChunk(cx, cz) {
  const d = new Uint8Array(CX * CY * CZ);
  const ox = cx * CX, oz = cz * CZ;
  const deniz = D.deniz, sivi = D.sivi;

  for (let x = 0; x < CX; x++) for (let z = 0; z < CZ; z++) {
    const wx = ox + x, wz = oz + z;

    if (D.ucanAda) {                                    // ---- RÜYA: uçan adalar
      for (let y = 8; y < CY - 6; y++) {
        const n = noise3(wx * .045, y * .09, wz * .045);
        const bant = 1 - Math.abs(y - 34) / 26;
        if (n * bant > .46) {
          const ust = noise3(wx * .045, (y + 1) * .09, wz * .045) * (1 - Math.abs(y + 1 - 34) / 26) <= .46;
          d[IDX(x, y, z)] = ust ? (hash2(wx, wz) > .82 ? B.NEON : B.YOSUN)
                                : (hash2(wx + 3, wz) > .93 ? B.KRISTAL : B.TAS);
        }
      }
      continue;
    }

    const h = Math.min(CY - 8, yukseklik(wx, wz));
    const bio = biyom(wx, wz);
    for (let y = 0; y <= h; y++) {
      let id = B.TAS;
      if (D.id === 'ay') id = y === h ? B.REGOLIT : (y > h - 5 ? B.REGOLIT : B.TAS);
      else if (D.id === 'volkan') id = y === h ? (hash2(wx, wz) > .88 ? B.OBSIDYEN : B.KIZILKUM) : (y > h - 4 ? B.KIZILKUM : B.OBSIDYEN);
      else if (D.id === 'derin') id = y === h ? (hash2(wx * 3, wz * 3) > .80 ? B.MERCAN : B.KUM) : (y > h - 4 ? B.KUM : B.TAS);
      else {
        if (y === h) id = bio === 'çöl' ? B.KUM : bio === 'kar' ? B.KAR : B.CIM;
        else if (y > h - 4) id = bio === 'çöl' ? B.KUM : B.TOPRAK;
        if (h < deniz && y > h - 3) id = B.KUM;
      }
      d[IDX(x, y, z)] = id;
    }
    if (deniz > 0) for (let y = h + 1; y <= deniz; y++) d[IDX(x, y, z)] = sivi;

    // cevher / kristal
    if (hash2(wx * 7, wz * 13) > .992) {
      const gy = 4 + Math.floor(hash2(wx, wz + 5) * Math.max(6, h - 6));
      if (gy < h) d[IDX(x, gy, z)] = D.id === 'ay' ? B.KRISTAL : D.id === 'volkan' ? B.LAV : B.ALTIN;
    }
    // bitki örtüsü
    if (D.id === 'dunya' && h > deniz && (bio === 'orman' || bio === 'ova')
        && hash2(wx * 31, wz * 17) > (bio === 'orman' ? .965 : .992)
        && x > 2 && x < CX - 3 && z > 2 && z < CZ - 3) {
      const th = 4 + Math.floor(hash2(wx + 1, wz + 1) * 3);
      for (let y = 1; y <= th; y++) if (h + y < CY) d[IDX(x, h + y, z)] = B.ODUN;
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = -1; dy <= 2; dy++) {
        const lx = x + dx, ly = h + th + dy, lz = z + dz;
        if (lx < 0 || lz < 0 || lx >= CX || lz >= CZ || ly >= CY) continue;
        if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) > 3) continue;
        if (!d[IDX(lx, ly, lz)]) d[IDX(lx, ly, lz)] = B.YAPRAK;
      }
    }
    if (D.id === 'derin' && h < deniz && hash2(wx * 19, wz * 23) > .972) {
      const th = 2 + Math.floor(hash2(wx, wz) * 5);
      for (let y = 1; y <= th; y++) if (h + y < CY) d[IDX(x, h + y, z)] = B.MERCAN;
    }
  }

  // bilgi kuleleri
  for (const k of KULE) {
    if (k.x < ox - 6 || k.x >= ox + CX + 6 || k.z < oz - 6 || k.z >= oz + CZ + 6) continue;
    const base = kuleTaban(k);
    k.y = base;
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
      const lx = k.x + dx - ox, lz = k.z + dz - oz;
      if (lx < 0 || lz < 0 || lx >= CX || lz >= CZ) continue;
      const kenar = Math.max(Math.abs(dx), Math.abs(dz));
      for (let y = base - 3; y <= base; y++) if (y >= 0 && y < CY) d[IDX(lx, y, lz)] = B.TUGLA;
      if (kenar === 3 && Math.abs(dx) === 3 && Math.abs(dz) === 3)
        for (let y = base + 1; y <= base + 5; y++) if (y < CY) d[IDX(lx, y, lz)] = B.OBSIDYEN;
      if (kenar <= 1)
        for (let y = base + 1; y <= base + 7 - kenar * 2; y++) if (y < CY) d[IDX(lx, y, lz)] = kenar === 0 ? B.LAMBA : B.ALTIN;
    }
  }
  // oyuncu düzenlemeleri
  for (const [key, id] of editMap()) {
    const p = key.split(',');
    const wx = +p[0], wy = +p[1], wz = +p[2];
    if (wx < ox || wx >= ox + CX || wz < oz || wz >= oz + CZ || wy < 0 || wy >= CY) continue;
    d[IDX(wx - ox, wy, wz - oz)] = id;
  }
  return {cx, cz, d, mesh: null, saydamMesh: null, kirli: true};
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
  return getChunk(cx, cz, true).d[IDX(wx - (cx << 4), wy, wz - (cz << 4))];
}
function blokKoy(wx, wy, wz, id) {
  if (wy < 0 || wy >= CY) return;
  const cx = wx >> 4, cz = wz >> 4;
  const c = getChunk(cx, cz, true);
  c.d[IDX(wx - (cx << 4), wy, wz - (cz << 4))] = id;
  editMap().set(wx + ',' + wy + ',' + wz, id);
  c.kirli = true;
  const lx = wx - (cx << 4), lz = wz - (cz << 4);
  if (lx === 0) { const n = getChunk(cx - 1, cz); if (n) n.kirli = true; }
  if (lx === CX - 1) { const n = getChunk(cx + 1, cz); if (n) n.kirli = true; }
  if (lz === 0) { const n = getChunk(cx, cz - 1); if (n) n.kirli = true; }
  if (lz === CZ - 1) { const n = getChunk(cx, cz + 1); if (n) n.kirli = true; }
}

/* ---------------- meshleme ---------------- */
const FACE = [
  {n:[ 1,0,0], o:[1,0,0], u:[0,0,1], v:[0,1,0], t:2, l:.72},
  {n:[-1,0,0], o:[0,0,1], u:[0,0,-1],v:[0,1,0], t:2, l:.72},
  {n:[0, 1,0], o:[0,1,0], u:[1,0,0], v:[0,0,1], t:0, l:1.0},
  {n:[0,-1,0], o:[0,0,1], u:[1,0,0], v:[0,0,-1],t:1, l:.45},
  {n:[0,0, 1], o:[1,0,1], u:[-1,0,0],v:[0,1,0], t:2, l:.86},
  {n:[0,0,-1], o:[0,0,0], u:[1,0,0], v:[0,1,0], t:2, l:.60},
];
const AOL = [.42, .60, .80, 1.0];
const ATL = 8, ATS = 1 / ATL;

function mesheChunk(c) {
  const ox = c.cx * CX, oz = c.cz * CZ;
  const V = [], VS = [];
  for (let y = 0; y < CY; y++) for (let z = 0; z < CZ; z++) for (let x = 0; x < CX; x++) {
    const id = c.d[IDX(x, y, z)];
    if (!id) continue;
    const def = BDEF[id], wx = ox + x, wz = oz + z;
    const hedef = def.saydam || def.sivi ? VS : V;
    for (let f = 0; f < 6; f++) {
      const F = FACE[f];
      const nx = wx + F.n[0], ny = y + F.n[1], nz = wz + F.n[2];
      const nb = blok(nx, ny, nz);
      if (def.sivi) { if (nb === id || opak(nb)) continue; }
      else if (opak(nb) || nb === id) continue;
      const karo = def.t[F.t], tx = karo % ATL, ty = (karo / ATL) | 0;
      const e = .0016, u0 = tx * ATS + e, v0 = ty * ATS + e, du = ATS - e * 2;
      const ao = [], P = [];
      for (let ci = 0; ci < 4; ci++) {
        const cu = (ci === 1 || ci === 2) ? 1 : 0, cv = ci >= 2 ? 1 : 0;
        const su = cu ? 1 : -1, sv = cv ? 1 : -1;
        const s1 = opak(blok(nx + F.u[0]*su, ny + F.u[1]*su, nz + F.u[2]*su)) ? 1 : 0;
        const s2 = opak(blok(nx + F.v[0]*sv, ny + F.v[1]*sv, nz + F.v[2]*sv)) ? 1 : 0;
        const cr = opak(blok(nx + F.u[0]*su + F.v[0]*sv, ny + F.u[1]*su + F.v[1]*sv, nz + F.u[2]*su + F.v[2]*sv)) ? 1 : 0;
        ao.push((s1 && s2) ? 0 : 3 - (s1 + s2 + cr));
        P.push([wx + F.o[0] + F.u[0]*cu + F.v[0]*cv, y + F.o[1] + F.u[1]*cu + F.v[1]*cv, wz + F.o[2] + F.u[2]*cu + F.v[2]*cv]);
      }
      if (def.sivi && f === 2) P.forEach(p => p[1] -= .12);
      const UV = [[u0, v0+du], [u0+du, v0+du], [u0+du, v0], [u0, v0]];
      const li = i => def.isik ? 1 : F.l * AOL[ao[i]];
      const q = (a, b2, cc) => [a, b2, cc].forEach(i =>
        hedef.push(P[i][0], P[i][1], P[i][2], UV[i][0], UV[i][1], li(i)));
      if (ao[0] + ao[2] > ao[1] + ao[3]) { q(1,2,3); q(1,3,0); } else { q(0,1,2); q(0,2,3); }
    }
  }
  c.mesh = yukleMesh(c.mesh, V);
  c.saydamMesh = yukleMesh(c.saydamMesh, VS);
  c.kirli = false;
}

/* ---------------- WebGL ---------------- */
let gl, prog, loc, gokProg, gokLoc, tex, cvs, gokBuf, dinBuf;

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
uniform mat4 uMVP; uniform vec3 uCam; uniform float uUzak;
varying vec2 vUV; varying float vL; varying float vF;
void main(){
  gl_Position = uMVP * vec4(aPos,1.0);
  vUV = aUV; vL = aL;
  vF = clamp((length(aPos-uCam) - uUzak*0.45) / (uUzak*0.55), 0.0, 1.0);
}`;
const FSH = `
precision mediump float;
uniform sampler2D uTex; uniform vec3 uSis; uniform float uGun; uniform vec3 uTint;
varying vec2 vUV; varying float vL; varying float vF;
void main(){
  vec4 c = texture2D(uTex, vUV);
  if (c.a < 0.35) discard;
  vec3 col = c.rgb * vL * uGun * uTint;
  gl_FragColor = vec4(mix(col, uSis, vF), c.a);
}`;

/* gökyüzü: tam ekran üçgen, yön ışınından prosedürel gök */
const GVSH = `attribute vec2 aP; varying vec2 vP; void main(){ vP=aP; gl_Position=vec4(aP,0.999,1.0); }`;
const GFSH = `
precision highp float;
varying vec2 vP;
uniform vec3 uR,uU,uF;         // kamera bazları
uniform float uTan,uAr,uT;
uniform vec3 uGok,uUfuk;       // zenit / ufuk rengi
uniform vec3 uGunes;           // güneş yönü
uniform float uYildiz,uBulut,uGece,uDunya;
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float n2(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float fbm2(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=n2(p)*a; p*=2.02; a*=0.5; } return s; }
void main(){
  vec3 d = normalize(uF + uR*(vP.x*uAr*uTan) + uU*(vP.y*uTan));
  float t = clamp(d.y*0.5+0.5, 0.0, 1.0);
  vec3 col = mix(uUfuk, uGok, pow(t, 0.62));
  // yıldızlar
  if (uYildiz > 0.01) {
    vec3 q = floor(d*260.0);
    float s = fract(sin(dot(q, vec3(12.9898,78.233,37.719)))*43758.5453);
    float par = smoothstep(0.9972, 1.0, s) * (0.55+0.45*sin(uT*2.0+s*90.0));
    col += vec3(par) * uYildiz;
  }
  // güneş
  float sd = dot(d, uGunes);
  col += vec3(1.0,0.86,0.62) * pow(max(sd,0.0), 900.0) * 2.2;
  col += vec3(1.0,0.72,0.42) * pow(max(sd,0.0), 24.0) * 0.30 * (1.0-uGece);
  // ay
  float md = dot(d, -uGunes);
  col += vec3(0.88,0.92,1.0) * pow(max(md,0.0), 1600.0) * 1.8 * uGece;
  // gökteki dev Dünya (Ay diyarı)
  if (uDunya > 0.5) {
    vec3 dp = normalize(vec3(0.45,0.30,-0.84));
    float dd = dot(d, dp);
    float disk = smoothstep(0.9975, 0.9988, dd);
    vec2 uvp = vec2(dot(d, normalize(cross(vec3(0,1,0),dp))), d.y) * 46.0;
    float kara = step(0.52, fbm2(uvp*0.7+3.0));
    col = mix(col, mix(vec3(0.12,0.32,0.72), vec3(0.20,0.62,0.26), kara), disk);
    col += vec3(0.25,0.45,0.9)*smoothstep(0.995,0.9985,dd)*0.35;
  }
  // bulutlar
  if (uBulut > 0.01 && d.y > 0.015) {
    vec2 p = d.xz/(d.y+0.10)*0.55 + vec2(uT*0.006, uT*0.003);
    float c = fbm2(p*1.1);
    float a = smoothstep(0.52,0.78,c) * smoothstep(0.02,0.22,d.y) * uBulut;
    col = mix(col, mix(vec3(1.0), uUfuk, 0.18)*(1.0-uGece*0.72), a*0.85);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

function shader(t, src) {
  const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

/* ---------------- doku atlası 8x8 ---------------- */
function atlasYap() {
  const T = 32, N = ATL, c = document.createElement('canvas');
  c.width = c.height = T * N;
  const x = c.getContext('2d');
  const P = i => [(i % N) * T, ((i / N) | 0) * T];
  const gur = (i, r, g, b, k) => { const p = P(i);
    for (let a = 0; a < T; a++) for (let bq = 0; bq < T; bq++) {
      const n = (Math.random() - .5) * k;
      x.fillStyle = `rgb(${cl(r+n,0,255)|0},${cl(g+n,0,255)|0},${cl(b+n,0,255)|0})`;
      x.fillRect(p[0] + a, p[1] + bq, 1, 1);
    } return p; };
  let p;
  gur(0, 106,170,80, 26);
  p = gur(1, 134,96,67, 22);
    x.fillStyle = '#6aaa50'; x.fillRect(p[0], p[1], T, 7);
    for (let i = 0; i < T; i += 2) x.fillRect(p[0]+i, p[1]+7, 1, 2 + ((i*7)%4));
  gur(2, 134,96,67, 24);
  gur(3, 128,128,130, 22);
  gur(4, 219,205,150, 18);
  p = gur(5, 104,78,47, 16);
    x.fillStyle = 'rgba(70,50,28,.75)';
    for (let i = 2; i < T; i += 7) x.fillRect(p[0]+i, p[1], 2, T);
  p = gur(6, 148,118,74, 14);
    x.strokeStyle = 'rgba(90,66,36,.8)'; x.lineWidth = 2;
    for (let r = 4; r < T/2; r += 5) { x.beginPath(); x.arc(p[0]+T/2, p[1]+T/2, r, 0, TAU); x.stroke(); }
  p = P(7); x.clearRect(p[0], p[1], T, T);
    for (let i = 0; i < T; i++) for (let j = 0; j < T; j++) {
      if (Math.random() < .17) continue;
      const g2 = 96 + Math.random()*54;
      x.fillStyle = `rgb(${(30+g2*.28)|0},${g2|0},${(34+g2*.2)|0})`;
      x.fillRect(p[0]+i, p[1]+j, 1, 1);
    }
  gur(8, 54,118,196, 16);
  p = gur(9, 176,139,92, 14);
    x.fillStyle = 'rgba(120,90,56,.6)';
    for (let j = 0; j < T; j += 8) x.fillRect(p[0], p[1]+j, T, 1);
  p = P(10); x.clearRect(p[0], p[1], T, T);
    x.fillStyle = 'rgba(196,232,255,.30)'; x.fillRect(p[0], p[1], T, T);
    x.fillStyle = '#cfeaff'; x.fillRect(p[0],p[1],T,3); x.fillRect(p[0],p[1]+T-3,T,3);
    x.fillRect(p[0],p[1],3,T); x.fillRect(p[0]+T-3,p[1],3,T);
  p = gur(11, 128,128,130, 18);
    x.fillStyle = '#ffcf3d';
    for (let i = 0; i < 9; i++) x.fillRect(p[0]+3+((i*11)%24), p[1]+4+((i*17)%23), 5, 5);
  p = gur(12, 255,214,120, 16);
    x.fillStyle = '#fff6cf'; x.fillRect(p[0]+6, p[1]+6, T-12, T-12);
  gur(13, 242,246,252, 10);
  p = gur(14, 150,76,66, 12);
    x.fillStyle = 'rgba(228,222,214,.85)';
    for (let j = 0; j < T; j += 8) { x.fillRect(p[0], p[1]+j, T, 2);
      for (let i = (j % 16 ? 0 : 8); i < T; i += 16) x.fillRect(p[0]+i, p[1]+j, 2, 8); }
  p = gur(15, 38,30,54, 14);
    x.fillStyle = 'rgba(150,110,220,.45)';
    for (let i = 0; i < 6; i++) x.fillRect(p[0]+((i*13)%26), p[1]+((i*19)%26), 4, 4);
  // yeni bloklar
  p = gur(16, 168,166,160, 20);                                   // regolit
    x.fillStyle = 'rgba(90,88,84,.5)';
    for (let i = 0; i < 7; i++) x.beginPath(), x.arc(p[0]+((i*9)%28)+2, p[1]+((i*13)%28)+2, 2.5, 0, TAU), x.fill();
  p = gur(17, 226,84,20, 26);                                     // lav
    x.fillStyle = 'rgba(60,16,6,.75)';
    for (let i = 0; i < 5; i++) x.fillRect(p[0]+((i*11)%26), p[1]+((i*17)%26), 7, 3);
    x.fillStyle = '#ffe089';
    for (let i = 0; i < 5; i++) x.fillRect(p[0]+((i*7)%28), p[1]+((i*19)%28), 3, 3);
  p = gur(18, 235,110,160, 22);                                   // mercan
    x.fillStyle = 'rgba(255,220,240,.6)';
    for (let i = 0; i < 8; i++) x.fillRect(p[0]+((i*13)%28), p[1]+((i*7)%28), 4, 4);
  p = gur(19, 226,58,220, 18);                                    // neon
    x.fillStyle = 'rgba(255,255,255,.55)';
    for (let j = 4; j < T; j += 10) x.fillRect(p[0], p[1]+j, T, 2);
  p = P(20); x.clearRect(p[0], p[1], T, T);                       // buz
    x.fillStyle = 'rgba(168,222,255,.55)'; x.fillRect(p[0], p[1], T, T);
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(p[0]+i*9, p[1]); x.lineTo(p[0]+i*9+12, p[1]+T); x.stroke(); }
  p = gur(21, 74,128,58, 20);                                     // yosun
    x.fillStyle = 'rgba(140,190,90,.6)';
    for (let i = 0; i < 22; i++) x.fillRect(p[0]+((i*11)%30), p[1]+((i*13)%30), 2, 4);
  p = gur(22, 176,72,44, 20);                                     // kızıl kum
  p = gur(23, 96,232,238, 20);                                    // kristal
    x.fillStyle = 'rgba(255,255,255,.6)';
    x.beginPath(); x.moveTo(p[0]+16,p[1]+3); x.lineTo(p[0]+27,p[1]+16);
    x.lineTo(p[0]+16,p[1]+29); x.lineTo(p[0]+5,p[1]+16); x.closePath(); x.fill();
  p = gur(24, 250,250,252, 8);                                    // top (deri)
    x.fillStyle = '#15171c';
    x.beginPath(); x.moveTo(p[0]+16,p[1]+6); x.lineTo(p[0]+25,p[1]+13);
    x.lineTo(p[0]+21,p[1]+24); x.lineTo(p[0]+11,p[1]+24); x.lineTo(p[0]+7,p[1]+13); x.closePath(); x.fill();
  p = gur(25, 150,240,255, 26);                                   // ruh
    x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(p[0]+8, p[1]+8, 16, 16);
  return c;
}

/* ---------------- matris ---------------- */
function persp(f2, ar, zn, zf) {
  const f = 1/Math.tan(f2/2), nf = 1/(zn-zf);
  return [f/ar,0,0,0, 0,f,0,0, 0,0,(zf+zn)*nf,-1, 0,0,2*zf*zn*nf,0];
}
function lookAt(e, c2) {
  let zx=e[0]-c2[0], zy=e[1]-c2[1], zz=e[2]-c2[2];
  let l=Math.hypot(zx,zy,zz)||1; zx/=l; zy/=l; zz/=l;
  let xx=zz, xy=0, xz=-zx;
  l=Math.hypot(xx,xy,xz)||1; xx/=l; xy/=l; xz/=l;
  const yx=zy*xz-zz*xy, yy=zz*xx-zx*xz, yz=zx*xy-zy*xx;
  return [xx,yx,zx,0, xy,yy,zy,0, xz,yz,zz,0,
    -(xx*e[0]+xy*e[1]+xz*e[2]), -(yx*e[0]+yy*e[1]+yz*e[2]), -(zx*e[0]+zy*e[1]+zz*e[2]), 1];
}
function mul(a, b) {
  const o = new Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
    o[i*4+j] = a[j]*b[i*4] + a[4+j]*b[i*4+1] + a[8+j]*b[i*4+2] + a[12+j]*b[i*4+3];
  return o;
}

/* ---------------- oyuncu + yetenekler ---------------- */
const P = {x:.5, y:60, z:.5, vx:0, vy:0, vz:0, yaw:0, pitch:0, yer:false, ucus:false,
  comel:false, ziplaKalan:2, suzul:false, can:100};
const GENIS = .3;
let BOY = 1.72, GOZ = 1.62;
const girdi = {ileri:0, sag:0, zipla:0, in:0, kos:0};
const YET = {cengel:null, dashT:0, ziplaEdge:false};
let sarsinti = 0, ekranEfekt = '';

function suIcinde() {
  const b = blok(Math.floor(P.x), Math.floor(P.y + GOZ), Math.floor(P.z));
  return BDEF[b] && BDEF[b].sivi ? b : 0;
}
function carpisma(dt) {
  const sivi = suIcinde();
  let g = P.ucus ? 0 : D.g;
  if (sivi === B.SU) g *= .28;
  if (sivi === B.LAV) { g *= .35; P.can -= dt * 22; sarsinti = .5; }
  if (P.suzul && P.vy < 0 && !P.yer) g *= .18;
  P.vy -= g * dt;
  if (P.ucus) P.vy *= .86;
  if (sivi) P.vy = Math.max(P.vy, -3.2);
  if (P.suzul && P.vy < -2.4) P.vy = -2.4;

  const adim = (v, ax) => {
    if (!v) return;
    const eski = P[ax];
    P[ax] += v;
    const x0 = Math.floor(P.x-GENIS), x1 = Math.floor(P.x+GENIS);
    const y0 = Math.floor(P.y), y1 = Math.floor(P.y+BOY);
    const z0 = Math.floor(P.z-GENIS), z1 = Math.floor(P.z+GENIS);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
      if (!kati(blok(x, y, z))) continue;
      P[ax] = eski;
      if (ax === 'y') { if (v < 0) { P.yer = true; P.ziplaKalan = 2; } P.vy = 0; }
      return;
    }
  };
  P.yer = false;
  adim(P.vy*dt, 'y'); adim(P.vx*dt, 'x'); adim(P.vz*dt, 'z');
  if (P.y < -12) { P.y = D.ucanAda ? 50 : 80; P.vy = 0; P.can -= 18; }
  if (P.can < 100) P.can = Math.min(100, P.can + dt * 3.5);
  if (P.can <= 0) { P.can = 100; dogumaDon(); }
}
function guncelleOyuncu(dt) {
  const sivi = suIcinde();
  BOY = P.comel ? 1.15 : 1.72; GOZ = P.comel ? 1.05 : 1.62;
  let hiz = P.ucus ? 12 : P.comel ? 1.9 : girdi.kos ? 7.6 : 4.8;
  if (sivi) hiz *= .62;
  if (YET.dashT > 0) { hiz *= 3.4; YET.dashT -= dt; }
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
  let dx = (-sy*girdi.ileri + cy*girdi.sag), dz = (-cy*girdi.ileri - sy*girdi.sag);
  const l = Math.hypot(dx, dz);
  if (l > 1) { dx /= l; dz /= l; }
  P.vx = dx*hiz; P.vz = dz*hiz;

  // çengel
  if (YET.cengel) {
    const c2 = YET.cengel;
    const ddx = c2.x - P.x, ddy = c2.y - P.y, ddz = c2.z - P.z;
    const d = Math.hypot(ddx, ddy, ddz);
    if (d < 1.8) YET.cengel = null;
    else { const s = 17 / d; P.vx += ddx*s*.55; P.vy = ddy*s*.55; P.vz += ddz*s*.55; c2.t -= dt; if (c2.t <= 0) YET.cengel = null; }
  }
  // zıplama / süzülme
  P.suzul = false;
  if (girdi.zipla) {
    if (P.ucus) P.vy = 9;
    else if (sivi) P.vy = 3.4;
    else if (P.yer) { P.vy = D.zip; P.ziplaKalan = 1; YET.ziplaEdge = false; }
    else if (!YET.ziplaEdge && P.ziplaKalan > 0) { P.vy = D.zip * .92; P.ziplaKalan--; YET.ziplaEdge = true; sarsinti = .12; }
    else if (P.vy < 0) P.suzul = true;
  } else YET.ziplaEdge = false;
  if (P.ucus && girdi.in) P.vy = -9;
  carpisma(dt);
}
function dogumaDon() {
  const k = KULE[0];
  if (k) { const b = kuleTaban(k); P.x = k.x+.5; P.z = k.z+2.5; P.y = b+1; }
  else { P.x = .5; P.z = .5; P.y = yukseklik(0,0)+2; }
  P.vx = P.vy = P.vz = 0;
}

/* ---------------- ışın ---------------- */
function isin(uzunluk) {
  const cp = Math.cos(P.pitch);
  const dx = -Math.sin(P.yaw)*cp, dy = Math.sin(P.pitch), dz = -Math.cos(P.yaw)*cp;
  let x = P.x, y = P.y+GOZ, z = P.z, once = null;
  const L = uzunluk || 6;
  for (let t = 0; t < L; t += .03) {
    const bx = Math.floor(x), by = Math.floor(y), bz = Math.floor(z);
    const id = blok(bx, by, bz);
    if (kati(id)) return {x:bx, y:by, z:bz, id, once};
    once = {x:bx, y:by, z:bz};
    x += dx*.03; y += dy*.03; z += dz*.03;
  }
  return null;
}

/* ---------------- varlıklar ---------------- */
let ruhlar = [], top = null, kaleler = null, skor = {bizim:0}, yagmur = [], parcalar = [];
function ruhDoldur() {
  ruhlar = [];
  const n = 7;
  for (let i = 0; i < n; i++) ruhDogur();
}
function ruhDogur() {
  const a = Math.random()*TAU, r = 16 + Math.random()*40;
  const x = P.x + Math.cos(a)*r, z = P.z + Math.sin(a)*r;
  const y = zeminUst(Math.floor(x), Math.floor(z)) + 1.2;
  ruhlar.push({x, y, z, vx:0, vz:0, ph:Math.random()*TAU, kacis:0});
}
function zeminUst(x, z) {
  for (let y = CY-1; y > 0; y--) if (kati(blok(x, y, z))) return y+1;
  return D.ucanAda ? 34 : 2;
}
function ruhGuncelle(dt) {
  for (let i = ruhlar.length-1; i >= 0; i--) {
    const r = ruhlar[i];
    const d = Math.hypot(r.x-P.x, r.z-P.z), dy = Math.abs(r.y-P.y);
    r.ph += dt*2.4;
    if (d < 1.5 && dy < 2.2) {                       // yakalandı
      parcala(r.x, r.y, r.z, 22);
      ruhlar.splice(i, 1);
      if (cbGlobal.ruh) cbGlobal.ruh();
      ruhDogur();
      continue;
    }
    const gorur = d < (P.comel ? 5.5 : 15);
    if (gorur) { r.kacis = 1; }
    r.kacis = Math.max(0, r.kacis - dt*.5);
    if (r.kacis > 0) {
      const a = Math.atan2(r.z-P.z, r.x-P.x);
      const h = P.comel ? 2.6 : 6.4;
      r.vx = lerp(r.vx, Math.cos(a)*h, .12); r.vz = lerp(r.vz, Math.sin(a)*h, .12);
    } else {
      r.vx = lerp(r.vx, Math.cos(r.ph*.7)*1.5, .04);
      r.vz = lerp(r.vz, Math.sin(r.ph*.53)*1.5, .04);
    }
    r.x += r.vx*dt; r.z += r.vz*dt;
    const hedefY = zeminUst(Math.floor(r.x), Math.floor(r.z)) + 1.1 + Math.sin(r.ph)*.28;
    r.y = lerp(r.y, hedefY, .10);
    if (Math.hypot(r.x-P.x, r.z-P.z) > 90) { ruhlar.splice(i,1); ruhDogur(); }
  }
}
function parcala(x, y, z, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random()*TAU, e = Math.random()*Math.PI - Math.PI/2;
    const s = 2 + Math.random()*5;
    parcalar.push({x, y, z, vx:Math.cos(a)*Math.cos(e)*s, vy:Math.sin(e)*s+3, vz:Math.sin(a)*Math.cos(e)*s, t:1, karo:23});
  }
}
function parcaGuncelle(dt) {
  for (let i = parcalar.length-1; i >= 0; i--) {
    const p = parcalar[i];
    p.x += p.vx*dt; p.y += p.vy*dt; p.z += p.vz*dt; p.vy -= 16*dt; p.t -= dt*1.35;
    if (p.t <= 0) parcalar.splice(i, 1);
  }
}
/* ---- futbol ---- */
function sahaKur() {
  const bx = Math.floor(P.x), bz = Math.floor(P.z);
  const taban = zeminUst(bx, bz) - 1;
  for (let dx = -13; dx <= 13; dx++) for (let dz = -9; dz <= 9; dz++) {
    for (let y = taban+1; y < taban+7; y++) blokKoy(bx+dx, y, bz+dz, 0);
    blokKoy(bx+dx, taban, bz+dz, (dx === 0 || Math.abs(dx) === 13 || Math.abs(dz) === 9) ? B.KAR : B.CIM);
  }
  const direk = (gx) => {
    for (let dz = -3; dz <= 3; dz++) for (let y = 1; y <= 4; y++)
      if (Math.abs(dz) === 3 || y === 4) blokKoy(bx+gx, taban+y, bz+dz, B.TAHTA);
  };
  direk(-13); direk(13);
  kaleler = {ax: bx-13, bx: bx+13, z: bz, taban};
  // top oyuncunun üstünde doğmasın, yoksa anında tekmelenir
  top = {x: bx+.5, y: taban+1.6, z: bz+2.2, vx:0, vy:0, vz:0, bek:0};
  skor = {sol:0, sag:0};
  return true;
}
function topGuncelle(dt) {
  if (!top) return;
  top.vy -= 22*dt;
  const carp = (ax, v) => {
    const eski = top[ax]; top[ax] += v;
    if (kati(blok(Math.floor(top.x), Math.floor(top.y), Math.floor(top.z)))) {
      top[ax] = eski;
      if (ax === 'y') { top.vy = -top.vy*.52; if (Math.abs(top.vy) < 1.2) top.vy = 0; }
      else { top['v'+ax] = -top['v'+ax]*.62; }
    }
  };
  carp('y', top.vy*dt); carp('x', top.vx*dt); carp('z', top.vz*dt);
  top.vx *= .988; top.vz *= .988;
  if (top.y < -6) { top.y = 60; top.vy = 0; }
  if (kaleler) {
    if (Math.abs(top.x-kaleler.ax) < 1.2 && Math.abs(top.z-kaleler.z) < 3 && top.y < kaleler.taban+5) golAt('sol');
    if (Math.abs(top.x-kaleler.bx) < 1.2 && Math.abs(top.z-kaleler.z) < 3 && top.y < kaleler.taban+5) golAt('sag');
  }
  // oyuncu teması = şut (üst üste tetiklenmesin)
  if (top.bek > 0) top.bek -= dt;
  const d = Math.hypot(top.x-P.x, top.z-P.z), dy = top.y-(P.y+.4);
  if (top.bek <= 0 && d < 1.15 && Math.abs(dy) < 1.6) {
    const a = Math.atan2(top.z-P.z, top.x-P.x);
    const guc = 9 + Math.hypot(P.vx, P.vz)*1.4;
    top.vx = Math.cos(a)*guc; top.vz = Math.sin(a)*guc; top.vy = Math.max(top.vy, 5.5);
    top.bek = .35;
  }
}
function golAt(hangi) {
  skor[hangi]++;
  parcala(top.x, top.y, top.z, 26);
  const bx = (kaleler.ax + kaleler.bx)/2;
  top.x = bx+.5; top.z = kaleler.z+2.2; top.y = kaleler.taban+2;
  top.vx = top.vy = top.vz = 0; top.bek = .6;
  if (cbGlobal.gol) cbGlobal.gol(skor);
}
function sut() {
  if (!top) return false;
  const d = Math.hypot(top.x-P.x, top.z-P.z);
  if (d > 5) return false;
  top.bek = .35;
  const cp = Math.cos(P.pitch);
  top.vx = -Math.sin(P.yaw)*cp*20; top.vz = -Math.cos(P.yaw)*cp*20;
  top.vy = 8 + Math.sin(P.pitch)*12;
  return true;
}
/* ---- hava ---- */
let havaTip = 0;   // 0 açık, 1 yağmur/kar, 2 fırtına
function havaGuncelle(dt) {
  const hedef = havaTip ? 180 : 0;
  while (yagmur.length < hedef) yagmur.push({x:P.x+(Math.random()-.5)*36, y:P.y+9+Math.random()*14, z:P.z+(Math.random()-.5)*36, v:14+Math.random()*10});
  while (yagmur.length > hedef) yagmur.pop();
  for (const r of yagmur) {
    r.y -= r.v*dt;
    if (r.y < P.y-12 || Math.abs(r.x-P.x) > 22 || Math.abs(r.z-P.z) > 22) {
      r.x = P.x+(Math.random()-.5)*36; r.z = P.z+(Math.random()-.5)*36; r.y = P.y+12+Math.random()*10;
    }
  }
}

/* ---------------- dinamik geometri (varlıklar) ---------------- */
const dinVerts = [];
function kutu(x, y, z, s, karo, l, sy) {
  const h = s/2, hy = (sy || s)/2;
  const tx = karo % ATL, ty = (karo/ATL)|0, e = .002;
  const u0 = tx*ATS+e, v0 = ty*ATS+e, du = ATS-e*2;
  for (let f = 0; f < 6; f++) {
    const F = FACE[f], Pn = [];
    for (let ci = 0; ci < 4; ci++) {
      const cu = (ci === 1 || ci === 2) ? 1 : 0, cv = ci >= 2 ? 1 : 0;
      Pn.push([
        x + (F.o[0] + F.u[0]*cu + F.v[0]*cv - .5)*s,
        y + (F.o[1] + F.u[1]*cu + F.v[1]*cv - .5)*(sy || s) + hy,
        z + (F.o[2] + F.u[2]*cu + F.v[2]*cv - .5)*s]);
    }
    const UV = [[u0,v0+du],[u0+du,v0+du],[u0+du,v0],[u0,v0]];
    const li = F.l*l;
    [[0,1,2],[0,2,3]].forEach(tri => tri.forEach(i =>
      dinVerts.push(Pn[i][0], Pn[i][1], Pn[i][2], UV[i][0], UV[i][1], li)));
  }
}
function dinamikYap() {
  dinVerts.length = 0;
  for (const r of ruhlar) kutu(r.x, r.y, r.z, .55, 25, 1.0);
  if (top) kutu(top.x, top.y, top.z, .62, 24, 1.0);
  for (const p of parcalar) kutu(p.x, p.y, p.z, .16*Math.max(.2,p.t), p.karo, 1.0);
  for (const r of yagmur) kutu(r.x, r.y, r.z, .045, D.id === 'dunya' && havaTip === 1 && D.deniz > 0 ? 8 : 8, .9, .7);
  if (YET.cengel) {   // çengel ipi
    const c2 = YET.cengel, n = 12;
    for (let i = 1; i <= n; i++) {
      const t = i/n;
      kutu(lerp(P.x,c2.x,t), lerp(P.y+GOZ*.7,c2.y,t), lerp(P.z,c2.z,t), .07, 12, 1);
    }
  }
}

/* ---------------- ana döngü ---------------- */
let ready = false, gunSaat = .30, sonKule = null, cbGlobal = {};
let cizilen = 0, fps = 60, fpsT = 0, fpsN = 0, MESAFE = 5, zaman = 0;
let gecis = null;   // diyar geçiş sahnesi

function init(canvas, alanlar, kayit, callbacks) {
  cvs = canvas; cbGlobal = callbacks || {};
  TUM_ALAN = alanlar;
  gl = cvs.getContext('webgl', {antialias:false, alpha:false, powerPreference:'high-performance'});
  if (!gl) return false;
  prog = program(VSH, FSH);
  loc = {pos:gl.getAttribLocation(prog,'aPos'), uv:gl.getAttribLocation(prog,'aUV'), l:gl.getAttribLocation(prog,'aL'),
    mvp:gl.getUniformLocation(prog,'uMVP'), cam:gl.getUniformLocation(prog,'uCam'), uzak:gl.getUniformLocation(prog,'uUzak'),
    tex:gl.getUniformLocation(prog,'uTex'), sis:gl.getUniformLocation(prog,'uSis'), gun:gl.getUniformLocation(prog,'uGun'),
    tint:gl.getUniformLocation(prog,'uTint')};
  gokProg = program(GVSH, GFSH);
  gokLoc = {p:gl.getAttribLocation(gokProg,'aP'),
    R:gl.getUniformLocation(gokProg,'uR'), U:gl.getUniformLocation(gokProg,'uU'), F:gl.getUniformLocation(gokProg,'uF'),
    tan:gl.getUniformLocation(gokProg,'uTan'), ar:gl.getUniformLocation(gokProg,'uAr'), t:gl.getUniformLocation(gokProg,'uT'),
    gok:gl.getUniformLocation(gokProg,'uGok'), ufuk:gl.getUniformLocation(gokProg,'uUfuk'),
    gunes:gl.getUniformLocation(gokProg,'uGunes'), yildiz:gl.getUniformLocation(gokProg,'uYildiz'),
    bulut:gl.getUniformLocation(gokProg,'uBulut'), gece:gl.getUniformLocation(gokProg,'uGece'),
    dunya:gl.getUniformLocation(gokProg,'uDunya')};
  gokBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gokBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  dinBuf = gl.createBuffer();

  tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasYap());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);

  if (kayit && kayit.diyar && DIYAR_OF[kayit.diyar]) D = DIYAR_OF[kayit.diyar];
  if (kayit && kayit.edits) for (const dk in kayit.edits) {
    EDITS[dk] = new Map(Object.entries(kayit.edits[dk]).map(([k, v]) => [k, +v]));
  }
  kuleKur();
  if (kayit && kayit.p) { P.x=kayit.p[0]; P.y=kayit.p[1]; P.z=kayit.p[2]; P.yaw=kayit.p[3]; P.pitch=kayit.p[4]; }
  else dogumaDon();
  ruhDoldur();
  ready = true;
  return true;
}
function boyut() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cvs.width = Math.floor(innerWidth*dpr); cvs.height = Math.floor(innerHeight*dpr);
  if (gl) gl.viewport(0, 0, cvs.width, cvs.height);
}
function chunkYonet() {
  const pcx = Math.floor(P.x)>>4, pcz = Math.floor(P.z)>>4;
  let butce = 2;
  for (let r = 0; r <= MESAFE && butce > 0; r++) {
    for (let dx = -r; dx <= r && butce > 0; dx++) for (let dz = -r; dz <= r; dz++) {
      if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
      const c = getChunk(pcx+dx, pcz+dz, true);
      if (c.kirli) { mesheChunk(c); if (--butce <= 0) break; }
    }
  }
  if (chunks.size > (MESAFE*2+5)**2) {
    for (const [k, c] of chunks) {
      if (Math.max(Math.abs(c.cx-pcx), Math.abs(c.cz-pcz)) > MESAFE+2) {
        if (c.mesh) gl.deleteBuffer(c.mesh.buf);
        if (c.saydamMesh) gl.deleteBuffer(c.saydamMesh.buf);
        chunks.delete(k);
      }
    }
  }
}

function ciz(dt) {
  zaman += dt;
  gunSaat = (gunSaat + dt/380) % 1;
  const gunAci = gunSaat*TAU;
  const gunes = [Math.cos(gunAci)*.42, Math.sin(gunAci), Math.sin(gunAci*.5)*.3];
  const gl2 = Math.hypot(...gunes); gunes.forEach((v,i) => gunes[i] = v/gl2);
  const gecelik = cl(-gunes[1]*1.5+.5, 0, 1);
  const isikK = D.id === 'ay' ? Math.max(.35, gunes[1]*.7+.5)
    : D.id === 'volkan' ? .78 : D.id === 'ruya' ? .82 : D.id === 'derin' ? .55
    : Math.max(.24, gunes[1]*.62+.55);

  const sis = [lerp(D.gok[0], D.ufuk[0], .55)*isikK*1.5, lerp(D.gok[1], D.ufuk[1], .55)*isikK*1.5, lerp(D.gok[2], D.ufuk[2], .55)*isikK*1.5];
  const suAlti = suIcinde();
  const tint = suAlti === B.SU ? [.45,.72,1.0] : suAlti === B.LAV ? [1.0,.55,.3] : D.suAlti ? [.62,.86,1.0] : [1,1,1];

  gl.clearColor(sis[0], sis[1], sis[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const ar = cvs.width/cvs.height, fov = 1.28 + Math.min(.28, Math.hypot(P.vx,P.vz)*.016);
  const tanF = Math.tan(fov/2);
  const cp = Math.cos(P.pitch);
  let ex = P.x, ey = P.y+GOZ, ez = P.z;
  if (sarsinti > 0) { ex += (Math.random()-.5)*sarsinti*.35; ey += (Math.random()-.5)*sarsinti*.35; sarsinti -= dt*1.6; }
  const fwd = [-Math.sin(P.yaw)*cp, Math.sin(P.pitch), -Math.cos(P.yaw)*cp];
  const right = [Math.cos(P.yaw), 0, -Math.sin(P.yaw)];
  const up = [right[1]*fwd[2]-right[2]*fwd[1], right[2]*fwd[0]-right[0]*fwd[2], right[0]*fwd[1]-right[1]*fwd[0]];

  // --- gökyüzü ---
  if (!D.suAlti && !suAlti) {
    gl.useProgram(gokProg);
    gl.disable(gl.DEPTH_TEST);
    gl.bindBuffer(gl.ARRAY_BUFFER, gokBuf);
    gl.enableVertexAttribArray(gokLoc.p);
    gl.vertexAttribPointer(gokLoc.p, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(gokLoc.R, right); gl.uniform3fv(gokLoc.U, up); gl.uniform3fv(gokLoc.F, fwd);
    gl.uniform1f(gokLoc.tan, tanF); gl.uniform1f(gokLoc.ar, ar); gl.uniform1f(gokLoc.t, zaman);
    gl.uniform3f(gokLoc.gok, D.gok[0]*isikK*1.6, D.gok[1]*isikK*1.6, D.gok[2]*isikK*1.6);
    gl.uniform3f(gokLoc.ufuk, D.ufuk[0]*isikK*1.5, D.ufuk[1]*isikK*1.5, D.ufuk[2]*isikK*1.5);
    gl.uniform3fv(gokLoc.gunes, gunes);
    gl.uniform1f(gokLoc.yildiz, Math.max(D.yildiz, gecelik*.9));
    gl.uniform1f(gokLoc.bulut, D.bulut * (havaTip ? 1.6 : 1));
    gl.uniform1f(gokLoc.gece, gecelik);
    gl.uniform1f(gokLoc.dunya, D.dunyaGoster ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.DEPTH_TEST);
    gl.disableVertexAttribArray(gokLoc.p);
  }

  // --- dünya ---
  const mvp = mul(persp(fov, ar, .1, 400), lookAt([ex,ey,ez], [ex+fwd[0], ey+fwd[1], ez+fwd[2]]));
  gl.useProgram(prog);
  gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp));
  gl.uniform3f(loc.cam, ex, ey, ez);
  gl.uniform1f(loc.uzak, MESAFE*16);
  gl.uniform3fv(loc.sis, new Float32Array(sis));
  gl.uniform1f(loc.gun, isikK);
  gl.uniform3fv(loc.tint, new Float32Array(tint));
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc.tex, 0);
  gl.enableVertexAttribArray(loc.pos); gl.enableVertexAttribArray(loc.uv); gl.enableVertexAttribArray(loc.l);
  const bagla = m => {
    gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 24, 12);
    gl.vertexAttribPointer(loc.l, 1, gl.FLOAT, false, 24, 20);
    gl.drawArrays(gl.TRIANGLES, 0, m.n);
  };
  const pcx = Math.floor(P.x)>>4, pcz = Math.floor(P.z)>>4, liste = [];
  for (const c of chunks.values())
    if (Math.max(Math.abs(c.cx-pcx), Math.abs(c.cz-pcz)) <= MESAFE) liste.push(c);
  cizilen = 0;
  for (const c of liste) if (c.mesh) { bagla(c.mesh); cizilen++; }

  // varlıklar
  dinamikYap();
  if (dinVerts.length) {
    gl.bindBuffer(gl.ARRAY_BUFFER, dinBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dinVerts), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 24, 12);
    gl.vertexAttribPointer(loc.l, 1, gl.FLOAT, false, 24, 20);
    gl.drawArrays(gl.TRIANGLES, 0, dinVerts.length/6);
  }
  gl.depthMask(false);
  for (const c of liste) if (c.saydamMesh) bagla(c.saydamMesh);
  gl.depthMask(true);

  fpsN++; fpsT += dt;
  if (fpsT > .5) { fps = Math.round(fpsN/fpsT); fpsN = 0; fpsT = 0; }
}

let sonZaman = 0;
function kare(t) {
  if (!ready) return;
  const dt = Math.min(.05, (t - sonZaman)/1000 || .016);
  sonZaman = t;
  if (gecis) {
    gecis.t += dt;
    P.y += dt * gecis.hiz; P.vy = 0; P.pitch = lerp(P.pitch, .55, .05);
    if (gecis.t > gecis.sure) { const g = gecis; gecis = null; diyarUygula(g.hedef); }
  } else {
    guncelleOyuncu(dt);
    ruhGuncelle(dt);
    topGuncelle(dt);
    havaGuncelle(dt);
  }
  parcaGuncelle(dt);
  chunkYonet();
  ciz(dt);
  const k = kuleYakin(P.x, P.z, 6);
  if (k !== sonKule) { sonKule = k; if (cbGlobal.kule) cbGlobal.kule(k); }
}

/* ---------------- diyar geçişi ---------------- */
function diyarUygula(id) {
  const yeni = DIYAR_OF[id]; if (!yeni) return;
  for (const c of chunks.values()) {
    if (c.mesh) gl.deleteBuffer(c.mesh.buf);
    if (c.saydamMesh) gl.deleteBuffer(c.saydamMesh.buf);
  }
  chunks.clear();
  D = yeni;
  kuleKur();
  dogumaDon();
  P.ucus = false; P.pitch = -.1; P.can = 100;
  top = null; kaleler = null;
  havaTip = 0;
  ruhDoldur();
  if (cbGlobal.diyar) cbGlobal.diyar(D);
}
function diyarGec(id, sahne) {
  if (D.id === id) return;
  if (sahne) { gecis = {t:0, sure:1.9, hedef:id, hiz:26}; P.ucus = true; if (cbGlobal.firlat) cbGlobal.firlat(); }
  else diyarUygula(id);
}

function kaydet() {
  const edits = {};
  for (const dk in EDITS) {
    const o = {}; let n = 0;
    for (const [k, v] of EDITS[dk]) { o[k] = v; if (++n > 3000) break; }
    edits[dk] = o;
  }
  return {diyar: D.id, p: [P.x, P.y, P.z, P.yaw, P.pitch], edits};
}

return {
  init, boyut, kare, isin, blok, blokKoy, kaydet, biyom, yukseklik,
  P, girdi, B, BDEF, KULE, DIYARLAR,
  get diyar() { return D; },
  diyarGec,
  get fps() { return fps; },
  get chunkSayisi() { return cizilen; },
  get saat() { return gunSaat; },
  get gecisVar() { return !!gecis; },
  get skor() { return skor; },
  get topVar() { return !!top; },
  get topKonum() { return top ? {x: top.x, y: top.y, z: top.z, vx: top.vx, vz: top.vz} : null; },
  get kaleKonum() { return kaleler; },
  get ruhSayisi() { return ruhlar.length; },
  set mesafe(v) { MESAFE = v; },
  get mesafe() { return MESAFE; },
  set hava(v) { havaTip = v; },
  get hava() { return havaTip; },
  yakinKule: () => sonKule,
  kuleTaban,
  sahaKur, sut,
  cengelAt() {
    const h = isin(42);
    if (!h) return false;
    YET.cengel = {x: h.x+.5, y: h.y+1.2, z: h.z+.5, t: 2.2};
    return true;
  },
  dash() { if (YET.dashT <= 0) { YET.dashT = .28; sarsinti = .25; return true; } return false; },
  comel(v) { P.comel = v; },
  isinla(x, z) { P.x = x+.5; P.z = z+.5; P.y = zeminUst(x, z)+2; P.vy = 0; },
  isinlaKule(k) {
    const base = kuleTaban(k);
    P.x = k.x+.5; P.z = k.z+2.5; P.y = base+1;
    P.vx = P.vy = P.vz = 0; P.yaw = 0; P.pitch = -.15;
  },
  dogumaDon,
};
})();
