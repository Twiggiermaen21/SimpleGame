import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loaderGLB = new GLTFLoader();


export default async function loadAssets(worldPath, playerPath) {
    const [worldGLB, playerGLB] = await Promise.all([
        loaderGLB.loadAsync(worldPath),
        loaderGLB.loadAsync(playerPath),
    ]);

    const visuals = extractVisuals(worldGLB);
    const colliders = extractColliders(worldGLB); // opcjonalnie — np. po nazwie
    const player = preparePlayer(playerGLB);

    return { visuals, colliders, player };
}


function extractVisuals(glb) {
    const visuals = [];
    console.log(glb.scene)
    glb.scene.traverse(child => {
        if (child.isMesh) {

            visuals.push(child);

        }
    });
    return visuals;
}


function extractColliders(glb) {
    const colliders = [];
    glb.scene.traverse(child => {
        if (child.isMesh && child.name.toLowerCase().includes('collider')) {
            child.visible = false; // collider nie musi być widoczny
            colliders.push(child);
        }
    });
    return colliders;
}


function preparePlayer(glb) {
    const player = [];
    glb.scene.traverse(child => {
        if (child.isMesh) {
            player.push(child);
        }
    });
    return player;
}
