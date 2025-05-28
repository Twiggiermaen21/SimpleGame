import * as THREE from 'three';
import { loadModel } from '../../tool/modelLoader.js';
export default class Treasure extends THREE.Object3D {
    constructor(position, onPickup) {
        super();

        this.mesh = null;
        this.collected = false;
        this.onPickup = onPickup;
        this.time = Math.random() * Math.PI * 2;

        // Pozycja skarbu
        this.position.copy(position);

        // Ścieżka do modelu GLB wpisana w klasie
        loadModel('/models/treasure.glb', 0.01)
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
        this.mesh.position.y = Math.abs(Math.sin(this.time) * 0.13);

        // Pickup: gracz wystarczająco blisko
        const dist = this.position.distanceTo(player.position);
        if (dist < 1.3) {
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
