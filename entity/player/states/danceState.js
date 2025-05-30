import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import { state } from './state'
export const dance = (() => {
    class DanceState extends state.State {
        constructor(parent) {
            super(parent);

            this._FinishedCallback = () => {
                this._Finished();
            }
        }

        get Name() {
            return 'dance';
        }

        Enter(prevState) {
            const curAction = this._parent._proxy._animations['dance'].action;
            const mixer = curAction.getMixer();
            mixer.addEventListener('finished', this._FinishedCallback);

            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name].action;

                curAction.reset();
                curAction.setLoop(THREE.LoopOnce, 1);
                curAction.clampWhenFinished = true;
                curAction.crossFadeFrom(prevAction, 0.2, true);
                curAction.play();
            } else {
                curAction.play();
            }
        }

        _Finished() {
            this._Cleanup();
            this._parent.SetState('idle');
        }

        _Cleanup() {
            const action = this._parent._proxy._animations['dance'].action;
            action.getMixer().removeEventListener('finished', this._CleanupCallback);
        }

        Exit() {
            this._Cleanup();
        }

        Update(_) {
        }
    };
    return {
        DanceState: DanceState
    };

})();