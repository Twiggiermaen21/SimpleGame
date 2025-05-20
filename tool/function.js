import { ColliderDesc, RigidBodyDesc } from "@dimforge/rapier3d-compat";

function createColliderGeo(geo, rigidBody, physic) {
    const vertices = new Float32Array(geo.attributes.position.array);
    const indices = new Float32Array(geo.index.array);
    const colliderDesc = ColliderDesc.trimesh(vertices, indices);
    return physic.createCollider(colliderDesc, rigidBody);
}

function createColliderBall(radius, rigidBody, physic) {
    const colliderDesc = ColliderDesc.ball(radius)
    return physic.createCollider(colliderDesc, rigidBody)
}


export function createRigidBodyFixed(mesh, physic) {
    const rigidBodyDesc = RigidBodyDesc.fixed();
    const rigidBody = physic.createRigidBody(rigidBodyDesc);
    const collider = createColliderGeo(mesh.geometry, rigidBody, physic);

}

export function createRigidBodyEnity(position, physic) {
    const rigidBodyDesc = RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(...position)
    const rigidBody = physic.createRigidBody(rigidBodyDesc);
    const collider = createColliderBall(0.25, rigidBody, physic);
    return { rigidBody, collider }
}