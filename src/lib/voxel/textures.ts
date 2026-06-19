// Carga + cache de las texturas PNG generadas (public/game3d). Pixel-art → NearestFilter.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

function load(url: string): THREE.Texture {
    let t = cache.get(url);
    if (!t) {
        t = loader.load(url);
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        t.generateMipmaps = false;
        t.colorSpace = THREE.SRGBColorSpace;
        cache.set(url, t);
    }
    return t;
}

/** Textura de bloque/prop: public/game3d/textures/{name}.png */
export const tex = (name: string) => load(`/game3d/textures/${name}.png`);
/** Cara de personaje: public/game3d/skins/{name}.png */
export const skinTex = (name: string) => load(`/game3d/skins/${name}.png`);
