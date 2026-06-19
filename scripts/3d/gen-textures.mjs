// Generador de texturas pixel-art "voxel suave" (32x32, paleta pastel, tileables) — SIN IA.
// Node + pngjs (encoder PNG puro JS, seguro en Windows ARM). Determinista (PRNG sembrado).
//
//   node scripts/3d/gen-textures.mjs
//
// Salidas:
//   public/game3d/textures/*.png   (tiles 32x32 de bloques/props)
//   public/game3d/skins/*.png      (caras de personajes 32x32)
//   public/game3d/_contact-sheet.png  (mosaico upscaled para revisión visual)
//
// Las texturas de CARA SUPERIOR/lados que se repiten en el suelo son SEAMLESS (ruido con
// wrap-around, sin gradiente direccional global) para que no se vea el patrón de cuadrícula.
// El "suave" lo dan la paleta pastel + grano fino + el sombreado 3D del propio renderer.

import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const S = 32;                                  // tamaño del tile
const OUT = path.resolve(process.cwd(), 'public/game3d');
const TEX = path.join(OUT, 'textures');
const SKIN = path.join(OUT, 'skins');
mkdirSync(TEX, { recursive: true });
mkdirSync(SKIN, { recursive: true });

// ───────────────────────── helpers ─────────────────────────
const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

const makeCanvas = () => ({ data: new Float64Array(S * S * 4), a: new Float64Array(S * S).fill(0) });
function setpx(cv, x, y, c, alpha = 255) {
    x = ((x % S) + S) % S; y = ((y % S) + S) % S;          // wrap-around (tileable)
    const i = (y * S + x) * 4;
    cv.data[i] = clamp(c[0]); cv.data[i + 1] = clamp(c[1]); cv.data[i + 2] = clamp(c[2]); cv.data[i + 3] = alpha;
}
const fill = (cv, c) => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) setpx(cv, x, y, c); };

// Ruido de valor periódico (tileable): retícula period×period, interpolación suave.
function valueNoise(seed, period) {
    const r = mulberry32(seed);
    const g = Array.from({ length: period }, () => Array.from({ length: period }, () => r()));
    const cell = S / period;
    const sm = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
        const fx = x / cell, fy = y / cell;
        const xi = Math.floor(fx), yi = Math.floor(fy);
        const x0 = ((xi % period) + period) % period, y0 = ((yi % period) + period) % period;
        const x1 = (x0 + 1) % period, y1 = (y0 + 1) % period;
        const tx = sm(fx - xi), ty = sm(fy - yi);
        const a = lerp(g[y0][x0], g[y0][x1], tx);
        const b = lerp(g[y1][x0], g[y1][x1], tx);
        return lerp(a, b, ty);
    };
}

// Material base: rampa de 3 tonos (dark→base→light) modulada por ruido + grano fino.
function ramp(cv, { base, dark, light, seed, period = 8, grain = 0.14 }) {
    const n = valueNoise(seed, period);
    const r = mulberry32(seed ^ 0x9e3779b9);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        let v = n(x, y) + (r() - 0.5) * grain;
        v = Math.max(0, Math.min(1, v));
        const c = v < 0.5 ? mix(dark, base, v * 2) : mix(base, light, (v - 0.5) * 2);
        setpx(cv, x, y, c);
    }
}
// Salpicar n píxeles de un color (tileable).
function scatter(cv, seed, n, color, alpha = 255) {
    const r = mulberry32(seed);
    for (let k = 0; k < n; k++) setpx(cv, Math.floor(r() * S), Math.floor(r() * S), color, alpha);
}

// ───────────────────────── paleta pastel ─────────────────────────
const P = {
    grass: { base: hex('#86d07a'), dark: hex('#63b066'), light: hex('#abe89b') },
    dirt: { base: hex('#c39a6b'), dark: hex('#a87c4f'), light: hex('#d8b78c') },
    stone: { base: hex('#c3c6cf'), dark: hex('#a4a7b2'), light: hex('#dee1e7') },
    sand: { base: hex('#ecdcad'), dark: hex('#d9c68d'), light: hex('#f6eccc') },
    pathd: { base: hex('#cbb085'), dark: hex('#ad9165'), light: hex('#ddc6a1') },
    log: { base: hex('#c8a172'), dark: hex('#a07c4f'), light: hex('#ddbd92') },
    ring: hex('#8f6a42'),
    leaves: { base: hex('#6fc06a'), dark: hex('#4d9b50'), light: hex('#8ed885') },
    leafhole: hex('#3f8038'),
    water: { base: hex('#9ed7ea'), dark: hex('#7fc3da'), light: hex('#c4ecf6') },
    glint: hex('#ffffff'),
    plank: { base: hex('#d2a878'), dark: hex('#b1864f'), light: hex('#e3c298') },
    seam: hex('#8a6238'),
    hedge: { base: hex('#5aa64f'), dark: hex('#3f8038'), light: hex('#74bf63') },
    metal: hex('#b9bcc4'), metalD: hex('#8e9099'),
    gold: hex('#e8c14f'), goldD: hex('#bf9531'),
    mortar: hex('#9a9da6'),
};

// ───────────────────────── tiles de bloques ─────────────────────────
const tiles = {};
const T = (name, fn) => { const cv = makeCanvas(); fn(cv); tiles[name] = cv; };

T('grass_top', (cv) => {
    ramp(cv, { ...P.grass, seed: 101, period: 8, grain: 0.18 });
    scatter(cv, 102, 46, P.grass.light);          // briznas claras
    scatter(cv, 103, 22, P.grass.dark);           // sombras de pasto
});
T('grass_side', (cv) => {
    ramp(cv, { ...P.dirt, seed: 110, period: 8, grain: 0.16 });   // base tierra
    const edgeNoise = valueNoise(120, 16);
    const grassNoise = valueNoise(111, 8);
    for (let x = 0; x < S; x++) {
        const edge = 9 + Math.round(edgeNoise(x, 0) * 5);          // borde irregular del pasto
        for (let y = 0; y < edge; y++) {
            const v = grassNoise(x, y);
            setpx(cv, x, y, v < 0.5 ? mix(P.grass.dark, P.grass.base, v * 2) : mix(P.grass.base, P.grass.light, (v - 0.5) * 2));
        }
        if ((x % 3) === 0) setpx(cv, x, edge, P.grass.dark);       // briznas colgando bajo el borde
    }
});
T('dirt', (cv) => { ramp(cv, { ...P.dirt, seed: 130, period: 8, grain: 0.22 }); scatter(cv, 131, 16, P.dirt.dark); });
T('stone', (cv) => {
    ramp(cv, { ...P.stone, seed: 140, period: 8, grain: 0.12 });
    // grietas finas
    const r = mulberry32(141);
    for (let c = 0; c < 3; c++) {
        let x = Math.floor(r() * S), y = Math.floor(r() * S);
        for (let s = 0; s < 7; s++) { setpx(cv, x, y, P.stone.dark); x += r() < 0.5 ? 1 : 0; y += 1; }
    }
});
T('sand', (cv) => { ramp(cv, { ...P.sand, seed: 150, period: 6, grain: 0.26 }); });
T('path', (cv) => { ramp(cv, { ...P.pathd, seed: 160, period: 8, grain: 0.18 }); scatter(cv, 161, 10, P.pathd.dark); });
T('log_top', (cv) => {
    ramp(cv, { ...P.log, seed: 170, period: 4, grain: 0.1 });
    const cx = 16, cy = 16;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (Math.round(d) % 4 === 0 && d < 15) setpx(cv, x, y, P.ring);   // anillos
    }
});
T('log_side', (cv) => {
    ramp(cv, { ...P.log, seed: 180, period: 4, grain: 0.08 });
    for (let x = 0; x < S; x += 4) for (let y = 0; y < S; y++) if ((x + (y % 2)) % 8 < 1) setpx(cv, x, y, P.log.dark); // veta vertical
    // nudo
    for (let y = 10; y < 16; y++) for (let x = 20; x < 26; x++) { const d = Math.sqrt((x - 23) ** 2 + (y - 13) ** 2); if (d < 3) setpx(cv, x, y, P.ring); }
});
T('leaves', (cv) => {
    ramp(cv, { ...P.leaves, seed: 190, period: 8, grain: 0.2 });
    scatter(cv, 191, 28, P.leaves.light);
    scatter(cv, 192, 18, P.leafhole);
});
T('hedge', (cv) => {
    ramp(cv, { ...P.hedge, seed: 200, period: 8, grain: 0.22 });
    scatter(cv, 201, 30, P.hedge.light);
    scatter(cv, 202, 26, P.hedge.dark);
});
T('water', (cv) => {
    ramp(cv, { ...P.water, seed: 210, period: 8, grain: 0.06 });
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {            // ondas horizontales tileables
        const w = Math.sin((x / S) * Math.PI * 4 + y * 0.6) * 0.5 + 0.5;
        if (w > 0.82) setpx(cv, x, y, P.water.light);
    }
    scatter(cv, 211, 6, P.glint);
});
T('plank', (cv) => {
    ramp(cv, { ...P.plank, seed: 220, period: 4, grain: 0.1 });
    for (let y = 0; y < S; y += 8) for (let x = 0; x < S; x++) setpx(cv, x, y, P.seam);   // tablones
    for (let x = 0; x < S; x += 4) for (let y = 0; y < S; y++) if ((y % 8) > 1 && (x % 16 === (y < 8 ? 4 : 12))) setpx(cv, x, y, P.plank.dark);
});
T('stonebrick', (cv) => {
    ramp(cv, { ...P.stone, seed: 230, period: 6, grain: 0.1 });
    for (let y = 0; y < S; y += 8) for (let x = 0; x < S; x++) setpx(cv, x, y, P.mortar);       // mortero horizontal
    for (let band = 0; band < 4; band++) { const off = band % 2 ? 8 : 0; for (let y = band * 8; y < band * 8 + 8; y++) setpx(cv, off, y, P.mortar); setpx(cv, (off + 16) % S, band * 8 + 4, P.mortar); }
});
// caras del cofre (no tileables, son caras concretas)
T('chest_side', (cv) => { ramp(cv, { ...P.plank, seed: 240, period: 4, grain: 0.1 }); for (let y = 0; y < S; y += 10) for (let x = 0; x < S; x++) setpx(cv, x, y, P.seam); for (let x = 0; x < S; x++) { setpx(cv, x, 15, P.metalD); setpx(cv, x, 16, P.metal); } });
T('chest_front', (cv) => {
    ramp(cv, { ...P.plank, seed: 241, period: 4, grain: 0.1 });
    for (let y = 0; y < S; y += 10) for (let x = 0; x < S; x++) setpx(cv, x, y, P.seam);
    for (let x = 0; x < S; x++) { setpx(cv, x, 15, P.metalD); setpx(cv, x, 16, P.metal); }        // banda metálica
    for (let y = 13; y < 21; y++) for (let x = 13; x < 19; x++) setpx(cv, x, y, P.gold);           // candado
    for (let y = 13; y < 21; y++) { setpx(cv, 13, y, P.goldD); setpx(cv, 18, y, P.goldD); }
    setpx(cv, 15, 18, P.goldD); setpx(cv, 16, 18, P.goldD);                                        // ojo de cerradura
});

// ───────────────────────── skins (caras de personajes) ─────────────────────────
const skins = {};
function face(name, { skin, skinD, hair, hairStyle = 'short', hat = null, cheeks = hex('#f3a9a0'), accent = null }) {
    const cv = makeCanvas();
    fill(cv, skin);
    // sombreado lateral suave
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { if (x < 3 || x > 28) setpx(cv, x, y, skinD); }
    // pelo / sombrero arriba
    if (hat) {
        for (let y = 0; y < 7; y++) for (let x = 0; x < S; x++) setpx(cv, x, y, hat.c);
        for (let x = 0; x < S; x++) setpx(cv, x, 7, hat.band);                 // cinta del sombrero
        if (hat.brim) for (let x = 0; x < S; x++) setpx(cv, x, 8, hat.band);
    } else {
        for (let y = 0; y < 8; y++) for (let x = 0; x < S; x++) setpx(cv, x, y, hair);
        if (hairStyle === 'short') { for (let y = 8; y < 12; y++) { for (let x = 0; x < 5; x++) setpx(cv, x, y, hair); for (let x = 27; x < S; x++) setpx(cv, x, y, hair); } }
        if (hairStyle === 'long') { for (let y = 8; y < 24; y++) { for (let x = 0; x < 6; x++) setpx(cv, x, y, hair); for (let x = 26; x < S; x++) setpx(cv, x, y, hair); } }
    }
    // ojos
    const eye = (ex) => {
        for (let y = 12; y < 16; y++) for (let x = ex; x < ex + 5; x++) setpx(cv, x, y, hex('#ffffff'));
        for (let y = 13; y < 16; y++) for (let x = ex + 2; x < ex + 4; x++) setpx(cv, x, y, hex('#3a2c22'));
        setpx(cv, ex + 2, 13, hex('#ffffff'));     // brillo
    };
    eye(8); eye(19);
    // cachetes
    for (let y = 18; y < 20; y++) { for (let x = 6; x < 8; x++) setpx(cv, x, y, cheeks); for (let x = 24; x < 26; x++) setpx(cv, x, y, cheeks); }
    // sonrisa
    for (let x = 13; x < 19; x++) setpx(cv, x, 22, hex('#b5654a'));
    setpx(cv, 12, 21, hex('#b5654a')); setpx(cv, 19, 21, hex('#b5654a'));
    if (accent) for (let x = 11; x < 21; x++) setpx(cv, x, 24, accent);   // detalle (p.ej. red de apicultor)
    skins[name] = cv;
}

const SKIN1 = hex('#f0c79f'), SKIN1D = hex('#d8a87e');
const SKIN2 = hex('#f4d0aa'), SKIN2D = hex('#e0b489');
face('steve', { skin: SKIN1, skinD: SKIN1D, hair: hex('#6b4a2f'), hairStyle: 'short' });          // jugador
face('lily', { skin: SKIN2, skinD: SKIN2D, hair: hex('#7a5536'), hairStyle: 'long', hat: { c: hex('#e6c878'), band: hex('#c89b4a'), brim: true } }); // granjerita (sombrero de paja)
face('sam', { skin: SKIN1, skinD: SKIN1D, hair: hex('#3e2c1c'), hairStyle: 'short', hat: { c: hex('#eef0f2'), band: hex('#cdd2d8') }, accent: hex('#dfe3e8') }); // apicultor (sombrero claro + red)
face('max', { skin: SKIN1, skinD: SKIN1D, hair: hex('#2f2a26'), hairStyle: 'short' });             // npc1 genérico

// ───────────────────────── escritura PNG ─────────────────────────
function writePNG(file, w, h, getRGBA) {
    const png = new PNG({ width: w, height: h });
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const [r, g, b, a] = getRGBA(x, y); const i = (y * w + x) * 4;
        png.data[i] = clamp(r); png.data[i + 1] = clamp(g); png.data[i + 2] = clamp(b); png.data[i + 3] = clamp(a);
    }
    writeFileSync(file, PNG.sync.write(png));
}
const cvAt = (cv) => (x, y) => { const i = (y * S + x) * 4; return [cv.data[i], cv.data[i + 1], cv.data[i + 2], cv.data[i + 3]]; };

let count = 0;
for (const [name, cv] of Object.entries(tiles)) { writePNG(path.join(TEX, `${name}.png`), S, S, cvAt(cv)); count++; }
for (const [name, cv] of Object.entries(skins)) { writePNG(path.join(SKIN, `${name}.png`), S, S, cvAt(cv)); count++; }

// hoja de contacto (upscale x6, 5 columnas, fondo gris)
const all = [...Object.entries(tiles), ...Object.entries(skins)];
const SC = 6, COLS = 5, CELL = S * SC + 8, ROWS = Math.ceil(all.length / COLS);
const CW = COLS * CELL, CH = ROWS * CELL;
writePNG(path.join(OUT, '_contact-sheet.png'), CW, CH, (x, y) => {
    const col = Math.floor(x / CELL), row = Math.floor(y / CELL), idx = row * COLS + col;
    const lx = x - col * CELL - 4, ly = y - row * CELL - 4;
    if (idx < all.length && lx >= 0 && ly >= 0 && lx < S * SC && ly < S * SC) {
        const cv = all[idx][1]; const px = cvAt(cv)(Math.floor(lx / SC), Math.floor(ly / SC));
        if (px[3] > 0) return px;
    }
    return [40, 42, 48, 255];   // fondo
});

console.log(`OK — ${count} texturas en public/game3d/ (${Object.keys(tiles).length} bloques, ${Object.keys(skins).length} skins) + _contact-sheet.png`);
console.log('Bloques:', Object.keys(tiles).join(', '));
console.log('Skins:', Object.keys(skins).join(', '));
