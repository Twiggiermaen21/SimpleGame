import { Object3D } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import Gamepad from '../control/gamepad';
import * as THREE from 'three'


const loaderFBX = new FBXLoader();

export default class Player extends Object3D {

    ctrl = new Gamepad()
    constructor(mesh, physic) {
        super();
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.add(mesh);
        mesh.position.set(0, -0.5, 0);
        // Pozycja startowa ciała fizycznego
        const startY = 15;
        const rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(0, startY, 0);
        const rigidBody = physic.createRigidBody(rigidBodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5)

        physic.createCollider(colliderDesc, rigidBody);

        this.rigidBody = rigidBody;
        this.mesh = mesh;
    }


    

    update() {
        const pos = this.rigidBody.translation();
        this.position.set(pos.x, pos.y, pos.z);
        const ROTATION_SPEED = 0.03;
        this.rotation.y -= this.ctrl.x * ROTATION_SPEED;

        this.updatePhysic();

    }

    static async load(path, physic) {
        const playerMesh = await loaderFBX.loadAsync(path);
        playerMesh.scale.set(0.01, 0.01, 0.01);
        return new Player(playerMesh, physic);
    }


    updatePhysic() {
        let SPEED = 3;
        if (this.ctrl.sprint) SPEED = 6;

        const localMove = new THREE.Vector3(0, 0, -this.ctrl.z);
        const globalMove = localMove.applyQuaternion(this.quaternion);
        globalMove.multiplyScalar(SPEED);

        const velocity = this.rigidBody.linvel();
        let y = velocity.y;

        const canJump = Math.abs(velocity.y) < 0.01; // czyli "stoi na ziemi"
        if (this.ctrl.jump && canJump) {
            y = 8; // wysokość skoku – dostosuj według potrzeb
        }

        this.rigidBody.setLinvel({ x: globalMove.x, y, z: globalMove.z }, true);

    }

}
