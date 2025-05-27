// EnemyFSM.js – Prosta maszyna stanów dla wroga

export default class EnemyFSM {
    constructor(enemy) {
        this.enemy = enemy;
        this.state = null;
    }

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;

        const anim = this.enemy.animations[newState];
        if (anim) {
            Object.values(this.enemy.animations).forEach(a => a.action.stop());
            anim.action.reset().play();
        }
    }

    update() {
        if (!this.enemy.target) return;

        const dist = this.enemy.model.position.distanceTo(this.enemy.target.position);
        if (dist < this.enemy.detectionRange) {
            this.setState('run');
        } else {
            this.setState('walk');
        }
    }
}
