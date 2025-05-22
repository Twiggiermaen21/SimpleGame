import { Object3D, Mesh, PlaneGeometry, MeshStandardMaterial } from "three";
import { createRigidBodyFixed } from "../tool/function";

export default class Ground extends Object3D {
    constructor(physic) {
        super();

        const groundMesh = new Mesh(
            new PlaneGeometry(100, 100),
            new MeshStandardMaterial({ color: 0xfffff })
        );
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;

        createRigidBodyFixed(groundMesh, physic);

        this.add(groundMesh);
        this.position.y = 1;
    }
}