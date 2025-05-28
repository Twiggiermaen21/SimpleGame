import { state } from './state';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export const jump = (() => {
    class JumpState extends state.State {
        constructor(parent) {
            super(parent);
            this._FinishedCallback = () => this._Finished();
        }

        get Name() {
            return 'jump';
        }

        Enter(prevState) {
            const action = this._parent._proxy._animations['jump'].action;
            const mixer = action.getMixer();
            mixer.addEventListener('finished', this._FinishedCallback);

            action.reset();
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.time = 0.0;

            if (prevState) {
                const prevAction = this._parent._proxy._animations[prevState.Name]?.action;
                if (prevAction) {
                    action.crossFadeFrom(prevAction, 0.2, true);
                }
            }

            action.play();
            this._jumpStartTime = performance.now();
            this._hasJumped = false;
        }

        _Finished() {
            const rb = this._parent._proxy.rigidBody;

            const velY = rb.linvel().y;
            const onGround = Math.abs(velY) < 0.01;
            if (onGround) {
                this._parent.SetState('idle');
            }
        }

        Exit() {
        }

        Update(_, input) {
            const now = performance.now();
            const elapsed = now - this._jumpStartTime;

            const rb = this._parent._proxy.rigidBody;

            const vel = rb.linvel();

            if (!this._hasJumped && elapsed > 650) {
                rb.setLinvel({ x: vel.x, y: 8, z: vel.z }, true);
                this._hasJumped = true;
            }

            const onGround = Math.abs(rb.linvel().y) < 0.01;
            if (this._hasJumped && onGround) {
                if (input._keys.forward || input._keys.backward) {
                    this._parent.SetState('walk');
                } else {
                    this._parent.SetState('idle');
                }
            }
        }
    }

    return { JumpState };
})();
