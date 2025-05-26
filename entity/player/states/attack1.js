import { state } from './state';
import * as THREE from 'three';

export const attack1 = (() => {
  class Attack1State extends state.State {
    constructor(parent) {
      super(parent);
    }

    get Name() {
      return 'attack1';
    }

    Enter(prevState) {
      const action = this._parent._proxy._animations['attack1'].action;

      action.enabled = true;
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;

      if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name]?.action;
        if (prevAction) {
          action.crossFadeFrom(prevAction, 0.2, true);
        }
      }

      action.play();
      this._finished = false;

      action.getMixer().addEventListener('finished', this._onComplete = () => {
        this._finished = true;
      });
    }

    Exit() {

    }

    Update(_, input) {
      if (this._finished) {
        this._parent.SetState('idle');
      }
    }
  }

  return { Attack1State };
})();
