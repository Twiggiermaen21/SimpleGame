import { Object3D } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import Gamepad from '../control/gamepad';

const SPEED = 3
const loaderFBX = new FBXLoader();

export default class Player extends Object3D {

    ctrl = new Gamepad()
    constructor(mesh, physic) {
        super();

        // Resetujemy pozycję lokalną modelu względem this.position
        mesh.position.set(0, 0, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.add(mesh);

        // Pozycja startowa ciała fizycznego
        const startY = 15;
        const rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(0, startY, 0);
        const rigidBody = physic.createRigidBody(rigidBodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5); // Możesz dobrać inny kształt, np. kapsułę
        physic.createCollider(colliderDesc, rigidBody);

        this.rigidBody = rigidBody;
        this.mesh = mesh;
    }

    update() {
        const pos = this.rigidBody.translation();
        this.position.set(pos.x, pos.y, pos.z);
        this.updatePhysic()
    }

    // === ZAŁADUJ Z .fbx ===
    static async load(path, physic) {
        const fbx = await loaderFBX.loadAsync(path);

        // FBX zwykle zwraca grupę z całą postacią
        const playerMesh = fbx;
        // Możesz dodać scale, jeśli FBX ma inną jednostkę
        playerMesh.scale.set(0.01, 0.01, 0.01); // często potrzebne przy FBX z Mixamo itp.

        const player = new Player(playerMesh, physic);
        return player;
    }

    updatePhysic() {
        const x = this.ctrl.x * SPEED
        const z = this.ctrl.z * SPEED
        const y = this.rigidBody.linvel().y
        this.rigidBody.setLinvel({ x, y, z }, true)
    }

}
