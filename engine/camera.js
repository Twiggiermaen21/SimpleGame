import { PerspectiveCamera, } from 'three'
import * as THREE from 'three'
export default class Camera extends PerspectiveCamera {
    constructor() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        super(fov, aspect, near, far)
    }
    update(player) {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(player.quaternion);
        const camPos = player.position.clone();
        camPos.add(forward.multiplyScalar(10));
        camPos.y += 4;
        this.position.copy(camPos);
        this.lookAt(player.position.x, player.position.y + 2, player.position.z);
    }

}