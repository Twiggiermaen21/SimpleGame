// Enemy.js – Klasa Enemy, AI, patrol, fizyka, animacje

import * as THREE from 'three';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import EnemyFSM from './EnemyFSM.js';

export default class Enemy {
    constructor(physicsWorld) {
        this.physicsWorld = physicsWorld;
        this.speed = 1;
        this.detectionRange = 15;
        this.stopRange = 1.5;

        this.halfHeight = 1.0;
        this.smoothRotationSpeed = 5;

        this.rigidBody = null;
        this.model = null;
        this.target = null;

        this.animations = {};
        this._mixer = null;
        this.fsm = new EnemyFSM(this);

        this.patrolPath = [];
        this.currentPatrolIndex = 0;
    }

    async loadModel(path, animPath) {
        const loader = new FBXLoader();
        const fbx = await loader.loadAsync(path);

        fbx.scale.set(0.01, 0.01, 0.01);
        fbx.position.y = -this.halfHeight;
        fbx.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const container = new THREE.Object3D();
        container.add(fbx);
        this.model = container;

        this._mixer = new THREE.AnimationMixer(fbx);

        // Animacje
        const manager = new THREE.LoadingManager();
        manager.onLoad = () => this.fsm.setState('idle');
        const animLoader = new FBXLoader(manager);

        const loadAnim = (name, file) => {
            animLoader.load(animPath + file, (anim) => {
                const clip = anim.animations[0];
                this.animations[name] = {
                    clip,
                    action: this._mixer.clipAction(clip)
                };
            });
        };

        loadAnim('idle', 'idle.fbx');
        loadAnim('walk', 'walk.fbx');
        loadAnim('run', 'run.fbx');
    }

    _initPhysics(position) {
        const startY = position.y + this.halfHeight;
        const desc = RigidBodyDesc.dynamic()
            .setTranslation(position.x, startY, position.z)
            .lockRotations();

        this.rigidBody = this.physicsWorld.createRigidBody(desc);
        const collider = ColliderDesc.cuboid(0.5, this.halfHeight, 0.5);
        this.physicsWorld.createCollider(collider, this.rigidBody);

        this.model.position.set(position.x, startY, position.z);
    }

    setTarget(target) {
        this.target = target;
    }

    update(deltaTime) {
        if (!this.rigidBody || this.patrolPath.length === 0) return;

        const pos = this.rigidBody.translation();
        this.model.position.set(pos.x, pos.y, pos.z);

        this.fsm.update();
        this._mixer?.update(deltaTime);

        let direction, dist;

        if (
            this.target &&
            this.model.position.distanceTo(this.target.position) < this.detectionRange
        ) {
            dist = this.model.position.distanceTo(this.target.position);
            if (dist > this.stopRange) {
                direction = new THREE.Vector3().subVectors(this.target.position, this.model.position).normalize();
                const currentVel = this.rigidBody.linvel();
                const desiredSpeed = this.speed * 1.5;
                this.rigidBody.setLinvel({
                    x: direction.x * desiredSpeed,
                    y: currentVel.y,
                    z: direction.z * desiredSpeed,
                }, true);
            } else {
                this.rigidBody.setLinvel({ x: 0, y: this.rigidBody.linvel().y, z: 0 }, true);
                if (this.animations['idle']) {
                    Object.values(this.animations).forEach(a => a.action.stop());
                    this.animations['idle'].action.reset().play();
                }
            }
        } else {
            // Patrol
            const targetPoint = this.patrolPath[this.currentPatrolIndex];
            direction = new THREE.Vector3().subVectors(targetPoint, this.model.position);
            dist = direction.length();

            if (dist < 0.3) {
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
            }

            direction.normalize();
            const currentVel = this.rigidBody.linvel();
            this.rigidBody.setLinvel({
                x: direction.x * this.speed,
                y: currentVel.y,
                z: direction.z * this.speed,
            }, true);
        }

        // Smooth obrót
        const currentVel = this.rigidBody.linvel();
        const velocityVec = new THREE.Vector3(currentVel.x, 0, currentVel.z);
        if (velocityVec.lengthSq() > 0.001) {
            const lookAt = new THREE.Vector3().copy(this.model.position).add(velocityVec.normalize());
            const dummy = new THREE.Object3D();
            dummy.position.copy(this.model.position);
            dummy.lookAt(lookAt);
            this.model.quaternion.slerp(dummy.quaternion, deltaTime * this.smoothRotationSpeed);
        }
    }

    static async create(patrolPath, physicsWorld, modelPath, animPath) {
        const enemy = new Enemy(physicsWorld);
        enemy.patrolPath = patrolPath.map(p => p.clone());
        await enemy.loadModel(modelPath, animPath);
        enemy._initPhysics(patrolPath[0]);
        return enemy;
    }
}
