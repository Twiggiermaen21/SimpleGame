import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Potion extends THREE.Object3D {
    constructor(position, onPickup) {
        super();

        this.mesh = null;
        this.collected = false;
        this.onPickup = onPickup;
        this.time = Math.random() * Math.PI * 2;

        // Ustaw pozycję mikstury
        this.position.copy(position);

        // === ŚCIEŻKA do Twojego modelu GLB (wrzuć do public/) ===
        const glbPath = '/models/potion.glb'; // <- popraw ścieżkę jak potrzeba

        // Wczytaj model GLB mikstury
        const loader = new GLTFLoader();
        loader.load(glbPath, (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.mesh.scale.set(1, 1, 1); // dostosuj skalę, jeśli model za duży/mały
            this.add(this.mesh);
        });
    }

    update(player) {
        if (this.collected || !this.mesh) return;

        // Animacja: obrót i podskakiwanie
        this.time += 0.045;
        this.mesh.rotation.y += 0.045;
        this.mesh.position.y = Math.abs(Math.sin(this.time) * 0.11);

        // Pickup: jeśli gracz blisko mikstury
        const dist = this.position.distanceTo(player.position);
        if (dist < 1.2) {
            this.collected = true;
            if (this.onPickup) this.onPickup();
            this.visible = false;
        }
    }

    respawn() {
        this.collected = false;
        this.visible = true;
    }
}
