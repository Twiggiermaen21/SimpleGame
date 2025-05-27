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

        _addState(name, StateClass) {
            this._states[name] = StateClass;
        }

        SetState(name) {
            const prevState = this._currentState;
            if (prevState) {
                if (prevState.Name === name) return;
                prevState.Exit();
            }

            const StateClass = this._states[name];
            if (!StateClass) throw new Error(`FSM: No state registered as '${name}'`);
            const state = new StateClass(this);
            this._currentState = state;
            state.Enter(prevState);
        }

        Update(timeElapsed, input) {
            this._currentState?.Update(timeElapsed, input);
        }
    }

    class CharacterFSM extends FiniteStateMachine {
        constructor(proxy) {
            super();
            this._proxy = proxy;
            this._init();
        }

        _init() {
            this._addState('idle', idle.IdleState);
            this._addState('walk', walk.WalkState);
            this._addState('run', run.RunState);
            this._addState('dance', dance.DanceState);
            this._addState('jump', jump.JumpState);
            this._addState('attack1', attack1.Attack1State);
            this._addState('attack2', attack2.Attack2State);
            this._addState('dead', dead.DeadState);
        }
    }

    return {
        CharacterFSM,
        FiniteStateMachine,
    };
})();