import { Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createRigidBodyFixed } from "../tool/function";

export default class World extends Object3D {
    constructor(meshes, physic) {
        super();
        this.initPhysic(meshes, physic);
        this.initVisual(meshes);
    }

    initPhysic(meshes, physic) {
        for (const mesh of meshes) {
            createRigidBodyFixed(mesh, physic);
        }
    }

    initVisual(meshes) {
        for (const mesh of meshes) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            this.add(mesh);
        }
    }

    // --- Statyczna metoda do asynchronicznego ładowania świata ---
    static async create(path, physic) {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(path);

        // Pobierz tylko obiekty Mesh z całej sceny
        const meshes = [];
        gltf.scene.traverse(child => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });

        // Utwórz World z gotowymi meshami i fizyką
        return new World(meshes, physic);
    }
}
