// EnemyFSM.js – Prosta maszyna stanów dla wroga

export default class EnemyFSM {
    constructor(enemy) {
        this.enemy = enemy;
        this.state = null;
        this.isAttacking = false;
    }

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;

        const anim = this.enemy.animations[newState];
        
        if (anim) {
            Object.values(this.enemy.animations).forEach(a => a.action.stop());
            anim.action.reset().play();

            if (newState === 'attack') {
                this.enemy.isAttacking = true;

                // Blokuje zmianę stanu do końca animacji ataku:
                const mixer = anim.action.getMixer();
                const onFinished = (e) => {
                    if (e.action === anim.action) {
                        this.enemy.isAttacking = false;
                        mixer.removeEventListener('finished', onFinished);
                    }
                };
                mixer.addEventListener('finished', onFinished);
            }
        }
    }

    update() {
        if (!this.enemy.target) return;

        const dist = this.enemy.model.position.distanceTo(this.enemy.target.position);
        if (dist < this.enemy.stopRange) {
            this.setState('attack');
        } else if (dist < this.enemy.detectionRange) {
            this.setState('run');
        } else {
            this.setState('walk');
        }
    }
}
