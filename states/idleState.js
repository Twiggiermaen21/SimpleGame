import { state } from './state'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export const idle = (() => {
    class IdleState extends state.State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'idle';
        }

        Enter(prevState) {
            const idleAction = this._parent._proxy._animations['idle'].action;
            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name].action;
                idleAction.time = 0.0;
                idleAction.enabled = true;
                idleAction.setEffectiveTimeScale(1.0);
                idleAction.setEffectiveWeight(1.0);
                idleAction.crossFadeFrom(prevAction, 0.5, true);
                idleAction.play();
            } else {
                idleAction.play();
            }
        }

        Exit() {
        }

        Update(_, input) {
            if (input._keys.forward || input._keys.backward) {
                this._parent.SetState('walk');
            } else if (input._keys.one) {
                this._parent.SetState('dance');
            } else if (input._keys.space) {
                this._parent.SetState('jump');
            }
        }
    };
    return {
        IdleState: IdleState
    };

})();