import { PerspectiveCamera, } from 'three'
import * as THREE from 'three'
export default class Camera extends PerspectiveCamera {
    constructor() {
        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        super(fov, aspect, near, far)
        // this.position.set(10, 7, 10);
        // this.lookAt(0, 0, 0);



        // this._camera.position.set(25, 10, 25);

    }

    // update(player) {
    //     this.position.copy(player.position);
    //     this.position.y += 4
    //     this.position.x -= 10
    //     this.position.z += 14
    // }
    update(player) {
        // wektor, który reprezentuje "do przodu" w lokalnych współrzędnych gracza
        const forward = new THREE.Vector3(0, 0, -1);

        // zamieniamy go na światowe współrzędne, uwzględniając rotację gracza
        forward.applyQuaternion(player.quaternion);

        // pozycja kamery = pozycja gracza
        const camPos = player.position.clone();

        // przesuwamy kamerę za gracza (np. 10 jednostek do tyłu względem forward)
        camPos.add(forward.multiplyScalar(-10));

        // unosimy kamerę o 4 jednostki w osi Y (nad głową gracza)
        camPos.y += 4;

        // ustawiamy pozycję kamery
        this.position.copy(camPos);

        // kamera patrzy na gracza (można też patrzeć nieco ponad, np. głowę)
        this.lookAt(player.position.x, player.position.y + 2, player.position.z);
    }

}