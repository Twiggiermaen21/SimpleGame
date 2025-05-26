import { state } from './state';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export const example = (() => {
    class ExampleState extends state.State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'example';
        }

        Enter(prevState) {
            const action = this._parent._proxy._animations['example'].action;

            action.enabled = true;
            action.setEffectiveTimeScale(1.0);
            action.setEffectiveWeight(1.0);
            action.reset();
            action.time = 0.0;
            action.clampWhenFinished = true;

            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name]?.action;
                if (prevAction) {
                    action.crossFadeFrom(prevAction, 0.3, true);
                }
            }

            action.play();
        }

        Exit() {
            const action = this._parent._proxy._animations['example'].action;
            action.stop();
        }

        Update(_, input) {
            // Tutaj logika przejścia np. if (input._keys.attack) ...
        }
    }

    return { ExampleState };
})();
