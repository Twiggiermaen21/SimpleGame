import { idle } from './states/idleState.js';
import { walk } from './states/walkState.js';
import { run } from './states/runState.js';
import { jump } from './states/jumpState.js';
import { dance } from './states/danceState.js';
import { attack1 } from './states/attack1.js';
import { attack2 } from './states/attack2.js';
import { dead } from './states/deadState.js';
export const FSM = (() => {

    class FiniteStateMachine {
        constructor() {
            this._states = {};
            this._currentState = null;
        }

        _AddState(name, type) {
            this._states[name] = type;
        }

        SetState(name) {
            const prevState = this._currentState;

            if (prevState) {
                if (prevState.Name == name) {
                    return;
                }
                prevState.Exit();
            }

            const state = new this._states[name](this);

            this._currentState = state;
            state.Enter(prevState);
        }

        Update(timeElapsed, input) {
            if (this._currentState) {
                this._currentState.Update(timeElapsed, input);
            }
        }
    };


    class CharacterFSM extends FiniteStateMachine {
        constructor(proxy) {
            super();
            this._proxy = proxy;
            this._Init();
        }

        _Init() {
            this._AddState('idle', idle.IdleState);
            this._AddState('walk', walk.WalkState);
            this._AddState('run', run.RunState);
            this._AddState('dance', dance.DanceState);
            this._AddState('jump', jump.JumpState);
            this._AddState('attack1', attack1.Attack1State);
            this._AddState('attack2', attack2.Attack2State);
            this._AddState('dead', dead.DeadState); // Reusing Attack1State for Attack3
        }
    };

    return {
        CharacterFSM: CharacterFSM,
        FiniteStateMachine: FiniteStateMachine
    };
})();