'use client';
// Utilidades compartidas del estilo "Duolingo": gradientMap toon suave + sombra blob barata (sin shadow maps).
import * as THREE from 'three';

// gradientMap toon de 3 pasos suaves → MeshToonMaterial discretiza la luz en bandas (look flat-suave).
let _grad: THREE.DataTexture | null = null;
export function toonGradient(): THREE.DataTexture {
    if (!_grad) {
        const data = new Uint8Array([140, 215, 255]);
        const t = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
        t.minFilter = THREE.NearestFilter;
        t.magFilter = THREE.NearestFilter;
        t.generateMipmaps = false;
        t.needsUpdate = true;
        _grad = t;
    }
    return _grad;
}

// Textura RGBA con alpha radial → sombra de contacto "blob" (un quad bajo cada objeto). Cero shadow maps.
let _blob: THREE.DataTexture | null = null;
function blobTexture(): THREE.DataTexture {
    if (!_blob) {
        const S = 64;
        const data = new Uint8Array(S * S * 4);
        for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
            const dx = (x / (S - 1) - 0.5) * 2, dy = (y / (S - 1) - 0.5) * 2;
            const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
            const a = Math.pow(1 - d, 1.8) * 255;
            const i = (y * S + x) * 4;
            data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = a;
        }
        const t = new THREE.DataTexture(data, S, S);
        t.needsUpdate = true;
        _blob = t;
    }
    return _blob;
}

export function BlobShadow({ radius = 0.45, opacity = 0.3, y = 0.05 }: { radius?: number; opacity?: number; y?: number }) {
    return (
        <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
            <planeGeometry args={[radius * 2, radius * 2]} />
            <meshBasicMaterial map={blobTexture()} transparent opacity={opacity} depthWrite={false} />
        </mesh>
    );
}
