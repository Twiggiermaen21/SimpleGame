import { Mesh, BoxGeometry, MeshStandardMaterial, Object3D } from 'three';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';

export default class BoxEntity extends Object3D {
    constructor(position, physic) {
        super();

        // === MESH ===
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.add(mesh);

        // === PHYSICS ===
        const rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(
            position.x,
            position.y,
            position.z
        );
        const rigidBody = physic.createRigidBody(rigidBodyDesc);
        const colliderDesc = ColliderDesc.cuboid(0.5, 0.5, 0.5); 
        const collider = physic.createCollider(colliderDesc, rigidBody);

        this.rigidBody = rigidBody;
        this.mesh = mesh;
    }

    update() {
        const pos = this.rigidBody.translation();
        this.position.set(pos.x, pos.y, pos.z);
    }
}
