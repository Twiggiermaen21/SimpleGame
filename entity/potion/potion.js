import * as THREE from 'three';

function createPotionGeometry() {
    // Profil mikstury: szerszy brzuszek, dłuższa szyjka i lekki korek
    const points = [];
    points.push(new THREE.Vector2(0.0, 0.0));   // dno
    points.push(new THREE.Vector2(0.22, 0.0));
    points.push(new THREE.Vector2(0.29, 0.3));  // dół butelki
    points.push(new THREE.Vector2(0.20, 0.65)); // brzuszek wyżej
    points.push(new THREE.Vector2(0.11, 0.95)); // długa szyjka!
    points.push(new THREE.Vector2(0.13, 1.08)); // korek początek
    points.push(new THREE.Vector2(0.10, 1.15)); // koniec korka
    points.push(new THREE.Vector2(0.0, 1.15));  // górny środek korka
    return new THREE.LatheGeometry(points, 48);
}

export default class Potion extends THREE.Object3D {
    constructor(position, onPickup) {
        super();
        const geometry = createPotionGeometry();
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xd22a2a,      // Czerwona mikstura!
            metalness: 0.18,
            roughness: 0.3,
            emissive: 0x440000,
            emissiveIntensity: 0.09
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.add(this.mesh);

        // --- Opcjonalnie: animacja (obrót i podskakiwanie)
        this.time = Math.random() * Math.PI * 2;

        this.position.copy(position);
        this.onPickup = onPickup;
        this.collected = false;
    }

    update(player) {
        if (this.collected) return;

        // Animacja: obrót i lekkie podskakiwanie
        this.time += 0.045;
        this.mesh.rotation.y += 0.045;
        this.mesh.position.y = Math.abs(Math.sin(this.time) * 0.11);

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
