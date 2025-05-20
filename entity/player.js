import { Object3D } from "three";
import { createRigidBodyEnity} from "../tool/function";

export default class Player extends Object3D {
    collider = null;
    rigidBody = null;
    mesh = null;
    constructor(meshes, physic) {
        super();
        this.position.copy(meshes.position)
        this.initPhysic(physic);
        this.initVisual(meshes);
    }

    initPhysic(physic) {
        const { rigidBody, collider } = createRigidBodyEnity(this.position, physic)
        this.rigidBody = rigidBody;
        this.collider = collider
    }

    initVisual(meshes) {

        meshes.receiveShadow = true;
        meshes.castShadow = true;
        this.add(meshes);
    }

    update() {
        this.updatePhysic()
        this.updateVisual()
    }


    updatePhysic() {

    }


    updateVisual() {
        this.position.copy(this.rigidBody.translation());
    }
}