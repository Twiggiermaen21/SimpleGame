import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import { state } from './state'
export const walk = (() => {
    class WalkState extends state.State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'walk';
        }

        Enter(prevState) {
            const curAction = this._parent._proxy._animations['walk'].action;
            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name].action;

                curAction.enabled = true;

                if (prevState.Name == 'run') {
                    const ratio = curAction.getClip().duration / prevAction.getClip().duration;
                    curAction.time = prevAction.time * ratio;
                } else {
                    curAction.time = 0.0;
                    curAction.setEffectiveTimeScale(1.0);
                    curAction.setEffectiveWeight(1.0);
                }

                curAction.crossFadeFrom(prevAction, 0.5, true);
                curAction.play();
            } else {
                curAction.play();
            }
        }

        Exit() {
        }

        Update(timeElapsed, input) {
            if ((input._keys.forward || input._keys.backward) && !input._keys.space) {
                if (input._keys.shift) {
                    this._parent.SetState('run');
                }
                return;
            } else if (input._keys.space) {
                this._parent.SetState('jump');
                return;
            }

            this._parent.SetState('idle');
        }
    };


    return {
        WalkState: WalkState
    };

})();