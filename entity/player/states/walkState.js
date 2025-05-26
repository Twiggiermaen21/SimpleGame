import { state } from './state';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export const walk = (() => {
    class WalkState extends state.State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'walk';
        }

        Enter(prevState) {
            const action = this._parent._proxy._animations['walk'].action;

            action.enabled = true;
            action.setEffectiveTimeScale(1.0);
            action.setEffectiveWeight(1.0);
            action.time = 0.0;

            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name]?.action;
                if (prevAction) {
                    action.crossFadeFrom(prevAction, 0.3, true);
                }
            }

            action.play();
        }

        Exit() {

        }

        Update(_, input) {
            if (input._keys.shift) { this._parent.SetState('run'); return; }
            if (input._keys.space) { this._parent.SetState('jump'); return; }
            if (input._keys.dance) { this._parent.SetState('dance'); return; }
            if (input._keys.attack1) { this._parent.SetState('attack1'); return; }
            if (input._keys.attack2) { this._parent.SetState('attack2'); return; }
            if (!input._keys.forward && !input._keys.backward) { this._parent.SetState('idle'); return; }
        }
    }

    return { WalkState };
})();
