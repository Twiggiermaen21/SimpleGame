import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loaderGLB = new GLTFLoader();

export default async function loadAssets(worldPath) {
    const worldGLB = await loaderGLB.loadAsync(worldPath);

    const visuals = extractVisuals(worldGLB);

    return visuals;
}

function extractVisuals(glb) {
    const visuals = [];
    glb.scene.traverse(child => {
        if (child.isMesh) {
            visuals.push(child);
        }
    });
    return visuals;
}
