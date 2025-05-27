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

        this.hp = 100;
        this.isDead = false;

        this._createHealthBar2D();
    }

    _createHealthBar2D() {
        this.healthBar2D = document.createElement('div');
        this.healthBar2D.className = 'enemy-healthbar';
        this.healthBar2DInner = document.createElement('div');
        this.healthBar2DInner.className = 'enemy-healthbar-inner';
        this.healthBar2DInner.style.width = '100%';
        this.healthBar2D.appendChild(this.healthBar2DInner);
        document.body.appendChild(this.healthBar2D);
    }

    updateHealthBar2D(camera) {
        if (!this.healthBar2D) return;
        const enemyWorldPos = new THREE.Vector3();
        this.model.getWorldPosition(enemyWorldPos);
        enemyWorldPos.y += this.halfHeight * 1.3;
        const vector = enemyWorldPos.project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        this.healthBar2D.style.left = `${x}px`;
        this.healthBar2D.style.top = `${y}px`;

        const perc = Math.max(0, this.hp) / 100 * 100;
        this.healthBar2DInner.style.width = perc + '%';
        if (perc > 60) this.healthBar2DInner.style.background = '#0f0';
        else if (perc > 30) this.healthBar2DInner.style.background = '#ff0';
        else this.healthBar2DInner.style.background = '#f00';

        if (vector.z < -1 || vector.z > 1) {
            this.healthBar2D.style.display = 'none';
        } else {
            this.healthBar2D.style.display = 'block';
        }
    }

    removeHealthBar2D() {
        if (this.healthBar2D && this.healthBar2D.parentNode) {
            this.healthBar2D.parentNode.removeChild(this.healthBar2D);
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp <= 0 && !this.isDead) {
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.rigidBody.setLinvel({ x: 0, y: this.rigidBody.linvel().y, z: 0 }, true);
        if (this.animations['idle']) {
            Object.values(this.animations).forEach(a => a.action.stop());
        }
        if (this.animations['dead']) {
            this.animations['dead'].action
                .reset()
                .setLoop(THREE.LoopOnce, 1);
            this.animations['dead'].action.clampWhenFinished = true;
            this.animations['dead'].action.play();
        }
        this.removeHealthBar2D();
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
                const action = this._mixer.clipAction(clip);
                if (name === 'dead') {
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true;
                }
                this.animations[name] = { clip, action };
            });
        };

        loadAnim('idle', 'idle.fbx');
        loadAnim('walk', 'walk.fbx');
        loadAnim('run', 'run.fbx');
        loadAnim('dead', 'dead.fbx');
        loadAnim('attack', 'attack.fbx'); // nowa animacja ataku
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
        if (this.isDead) {
            if (this._mixer) this._mixer.update(deltaTime);
            return;
        }
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

            // Jeśli bardzo blisko gracza, atakuj!
            if (dist < this.stopRange) {
                this.fsm.setState('attack');
                this.rigidBody.setLinvel({ x: 0, y: this.rigidBody.linvel().y, z: 0 }, true);
            } else {
                this.fsm.setState('run');
                direction = new THREE.Vector3().subVectors(this.target.position, this.model.position).normalize();
                const currentVel = this.rigidBody.linvel();
                const desiredSpeed = this.speed * 1.5;
                this.rigidBody.setLinvel({
                    x: direction.x * desiredSpeed,
                    y: currentVel.y,
                    z: direction.z * desiredSpeed,
                }, true);
            }
        } else {
            // Patrol
            this.fsm.setState('walk');
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
