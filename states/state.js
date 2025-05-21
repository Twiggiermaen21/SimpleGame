export const state = (() => {
    class State {
        constructor(parent) {
            this._parent = parent;
        }

        Enter() { }
        Exit() { }
        Update() { }
    };
    return {
        State: State
    };
})();