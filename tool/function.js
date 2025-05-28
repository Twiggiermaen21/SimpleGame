import { ColliderDesc, RigidBodyDesc } from "@dimforge/rapier3d-compat";

function createColliderGeo(geo, rigidBody, physic) {
    const vertices = new Float32Array(geo.attributes.position.array);
    const indices = new Float32Array(geo.index.array);
    const colliderDesc = ColliderDesc.trimesh(vertices, indices);
    return physic.createCollider(colliderDesc, rigidBody);
}

export function createRigidBodyFixed(mesh, physic) {
    const rigidBodyDesc = RigidBodyDesc.fixed();
    const rigidBody = physic.createRigidBody(rigidBodyDesc);
    const collider = createColliderGeo(mesh.geometry, rigidBody, physic);
}



export function initPhysicsBody(physic, position) {
    // 1) Opis ruchomego ciała, zablokowane obroty
    const desc = RigidBodyDesc
        .dynamic()
        .setTranslation(position.x, position.y, position.z)
        .lockRotations();

    // 2) Utworzenie ciała w świecie fizyki
    const body = physic.createRigidBody(desc);

    // 3) Dodanie prostej bryły kolizyjnej (kostka 1×1×1)
    const colliderDesc = ColliderDesc.cuboid(0.5, 0.5, 0.5);
    physic.createCollider(colliderDesc, body);

    // 4) Zwracamy ciało, by klasa mogła je zapisać
    return body;
}


