import { state } from './state';

export const idle = (() => {
    class IdleState extends state.State {
        constructor(parent) {
            super(parent);
        }

        get Name() {
            return 'idle';
        }

        Enter(prevState) {
            const action = this._parent._proxy._animations['idle'].action;

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
            if (input._keys.dance) { this._parent.SetState('dance'); return; }
            if (input._keys.space) { this._parent.SetState('jump'); return; }
            if (input._keys.forward) { this._parent.SetState('walk'); return; }
            if (input._keys.mouseAttack === 1) { this._parent.SetState('attack1'); input.keys["MouseAttack"] = 0; return; }
            if (input._keys.mouseAttack === 2) { this._parent.SetState('attack2'); input.keys["MouseAttack"] = 0; return; }
            if (input._keys.backward) { this._parent.SetState('walk'); return; }
        }
    }

    return { IdleState };
})();
