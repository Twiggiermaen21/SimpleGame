import Treasure from './treasure.js';

export default class TreasureSpawner {
    constructor(scene, positions, onPickup) {
        this.scene = scene;
        this.treasures = [];

        for (let pos of positions) {
            const treasure = new Treasure(pos, () => onPickup(treasure));
            this.treasures.push(treasure);
            this.scene.add(treasure);
        }
    }

    update(player) {
        for (let treasure of this.treasures) {
            treasure.update(player);
        }
    }

    respawnAll() {
        for (let treasure of this.treasures) {
            treasure.respawn();
        }
    }
}
