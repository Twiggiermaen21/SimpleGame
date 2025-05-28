
export class BasicCharacterControllerProxy {
    constructor(animations, rigidBody) {
        this._animations = animations;
        this.rigidBody = rigidBody;
    }

    get animations() {
        return this._animations;
    }
}