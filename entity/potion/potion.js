import * as THREE from 'three';
import { loadModel } from '../../tool/modelLoader.js';

export default class Potion extends THREE.Object3D {
    constructor(position, onPickup) {
        super();
        this.mesh = null;
        this.collected = false;
        this.onPickup = onPickup;
        this.time = Math.random() * Math.PI * 2;
        this.position.copy(position);

        // === ŚCIEŻKA do Twojego modelu GLB (wrzuć do public/) ===
        loadModel('/models/potion.glb', 1)
            .then(model => {
                this.mesh = model;
                this.add(this.mesh);
            })
            .catch(err => console.error('Error loading treasure:', err));
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
