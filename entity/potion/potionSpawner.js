import Potion from './potion.js';

export default class PotionSpawner {
    constructor(scene, positions, onPickup) {
        this.scene = scene;
        this.potions = [];

        for (let pos of positions) {
            const potion = new Potion(pos, () => onPickup(potion));
            this.potions.push(potion);
            this.scene.add(potion);
        }
    }

    // Wywołuj w game loop
    update(player) {
        for (let potion of this.potions) {
            potion.update(player);
        }
    }

    // Możesz użyć tej funkcji do respawnu wszystkich mikstur (np. po śmierci gracza)
    respawnAll() {
        for (let potion of this.potions) {
            potion.respawn();
        }
    }
}
