import { state } from './state';
import * as THREE from 'three';

export const dead = (() => {
    class DeadState extends state.State {
        constructor(parent) {
            super(parent);
            this.entered = false; // <- dodaj flagę
        }

        get Name() {
            return 'dead';
        }

        Enter(prevState) {
            if (this.entered) return;
            this.entered = true;

            const action = this._parent._proxy._animations['dead']?.action;
            if (!action) return;

            action.enabled = true;
            action.setEffectiveTimeScale(1.0);
            action.setEffectiveWeight(1.0);
            action.reset();
            action.time = 0.0;
            action.clampWhenFinished = true;
            action.setLoop(THREE.LoopOnce, 1); // <-- TO JEST KLUCZOWE!

            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name]?.action;
                if (prevAction) {
                    action.crossFadeFrom(prevAction, 0.3, true);
                }
            }

            action.play();
        }


        Exit() {
            // nie musi nic robić
        }

        Update(_, input) {
            // martwy = brak przejść stanów
        }
    }

    return { DeadState };
})();

