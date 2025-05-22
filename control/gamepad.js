
const ATTACK = 0;
const JUMP = 1;
const LOCK = 7;
const X = 0;
const Z = 1;

export default class Input {
    keys = {};
    lastLogged = {
        x: null,
        z: null,
        attack: false,
        jump: false,
        lock: false,
        sprint: false,
    };

    constructor() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }

    get gamepad() {
        return navigator.getGamepads()[0] || null;
    }

    get x() {
        const gp = this.gamepad;
        let value = 0;

        if (gp && gp.axes.length > X) {
            value = gp.axes[X];
        } else {
            if (this.keys["ArrowLeft"] || this.keys["KeyA"]) value = -1;
            if (this.keys["ArrowRight"] || this.keys["KeyD"]) value = 1;
        }

        if (value !== this.lastLogged.x) {
            this.lastLogged.x = value;
        }

        return value;
    }

    get z() {
        const gp = this.gamepad;
        let value = 0;

        if (gp && gp.axes.length > Z) {
            value = gp.axes[Z];
        } else {
            if (this.keys["ArrowUp"] || this.keys["KeyW"]) value = -1;
            if (this.keys["ArrowDown"] || this.keys["KeyS"]) value = 1;
        }

        if (value !== this.lastLogged.z) {
            this.lastLogged.z = value;
        }
        return value;
    }

    get attack() {
        const pressed = this.gamepad?.buttons[ATTACK]?.pressed || this.keys["KeyF"];
        if (pressed && !this.lastLogged.attack) {
            console.log("Attack triggered");
        }
        this.lastLogged.attack = pressed;
        return pressed;
    }

    get jump() {
        const pressed = this.gamepad?.buttons[JUMP]?.pressed || this.keys["Space"];
        if (pressed && !this.lastLogged.jump) {
        }
        this.lastLogged.jump = pressed;
        return pressed;
    }

    get lock() {
        const pressed = this.gamepad?.buttons[LOCK]?.pressed || this.keys["KeyL"];
        if (pressed && !this.lastLogged.lock) {
            console.log("Lock triggered");
        }
        this.lastLogged.lock = pressed;
        return pressed;
    }
    get sprint() {
        const pressed = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
        if (pressed && !this.lastLogged.sprint) {

        }
        this.lastLogged.sprint = pressed;
        return pressed;

    }


}
