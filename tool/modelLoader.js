// modelLoader.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * Ładuje model GLTF/GLB lub FBX i zwraca Promise<THREE.Object3D>
 * @param {string} path  – URL do pliku .glb, .gltf lub .fbx w public/
 * @param {number} [scale=1] – wartość skali, ustawiana na wszystkie osie
 * @returns {Promise<THREE.Object3D>}
 */
export async function loadModel(path, scale = 1) {
    const ext = path.split('.').pop().toLowerCase();
    let scene;

    if (ext === 'fbx') {
        const loader = new FBXLoader();
        // FBXLoader ma metodę loadAsync
        const fbx = await loader.loadAsync(path);
        // W przypadku FBX zwykle zwraca Group bez .scene
        scene = fbx.scene || fbx;
    }
    else if (ext === 'glb' || ext === 'gltf') {
        const loader = new GLTFLoader();
        // GLTFLoader od r.0.127 ma metodę loadAsync
        const gltf = await loader.loadAsync(path);
        scene = gltf.scene;
    }
    else {
        throw new Error(`Unsupported model format: .${ext}`);
    }

    // Ustawiamy cienie i skalę
    scene.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.scale.set(scale, scale, scale);

    return scene;
}
