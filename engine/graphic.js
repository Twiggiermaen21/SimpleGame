import { Clock, WebGLRenderer } from "three";

export default class Graphic extends WebGLRenderer {

    scene = null;
    clock = new Clock();
    camera = null;
    cbUpdate = null;

    constructor(scene, camera) {
        super({ canvas: document.querySelector("canvas") });
        this.scene = scene;
        this.camera = camera;
        this.shadowMap.enabled = true;

        this.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", () => {
            this.setSize(window.innerWidth, window.innerHeight);

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        this.loop = this.loop.bind(this);
        this.loop();
    }

    loop() {
        const dt = this.clock.getDelta();
        if (this.cbUpdate) this.cbUpdate(dt);
        this.render(this.scene, this.camera);
        requestAnimationFrame(this.loop);
    }

    onUpdate(callback) {
        this.cbUpdate = callback;
    }
}