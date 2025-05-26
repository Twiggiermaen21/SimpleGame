import * as THREE from 'three';
import { Object3D } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import Gamepad from '../../control/gamepad';
import { FSM } from './FSM';
import { HealthBar } from './bar.js';

const loaderFBX = new FBXLoader();

class BasicCharacterControllerProxy {
    constructor(animations, rigidBody) {
        this._animations = animations;
        this.rigidBody = rigidBody;
    }

    get animations() {
        return this._animations;
    }
}

export default class Player extends Object3D {
    ctrl = new Gamepad();

    constructor(physic) {
        super();
        this.physic = physic;
        this.mesh = null;
        this.rigidBody = null;
        this.healthBar = new HealthBar(); // albo przekazuj elementId jeśli chcesz
        this.hp = 100;
        this.isDead = false;

        this._animations = {};
        this._mixer = null;
        this._jumpScheduled = false;
        this._jumpTime = 0;
        this._stateMachine = null;
    }

    async loadModel(path) {
        const fbx = await loaderFBX.loadAsync(path);
        // fbx.scale.set(0.01, 0.01, 0.01);
        fbx.scale.set(0.001, 0.001, 0.001);
        fbx.position.set(0, -0.5, 0);

        fbx.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.mesh = fbx;
        this.add(fbx);
        this._mixer = new THREE.AnimationMixer(fbx);

        const manager = new THREE.LoadingManager();
        manager.onLoad = () => {
            this._stateMachine = new FSM.CharacterFSM(
                new BasicCharacterControllerProxy(this._animations, this.rigidBody)
            );
            this._stateMachine.SetState('idle');
        };

        const animLoader = new FBXLoader(manager);
        // animLoader.setPath('./player/');
        animLoader.setPath('entity/player/tung/');
        const loadAnim = (name, file) => {
            animLoader.load(file, (anim) => {
                const clip = anim.animations[0];
                this._animations[name] = {
                    clip,
                    action: this._mixer.clipAction(clip),
                };
            });
        };

        loadAnim('idle', 'idle.fbx');
        loadAnim('walk', 'walk.fbx');
        loadAnim('run', 'run.fbx');
        loadAnim('jump', 'jump.fbx');
        loadAnim('dance', 'dance.fbx');
        loadAnim('attack1', 'attack1.fbx');
        loadAnim('attack2', 'attack2.fbx');
        loadAnim('dead', 'dead.fbx');
        this.initPhysics();
    }

    initPhysics() {
        const rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(0, 15, 0);
        const rigidBody = this.physic.createRigidBody(rigidBodyDesc);
        const colliderDesc = ColliderDesc.ball(0.5);
        // colliderDesc.setTranslation(0, -0.5, 0);
        this.physic.createCollider(colliderDesc, rigidBody);
        this.rigidBody = rigidBody;
    }

    takeDamage(amount) {
        if (this.isDead) return; // nie dostaje więcej obrażeń po śmierci
        this.hp = Math.max(0, this.hp - amount);
        this.healthBar.set(this.hp);
        if (this.hp <= 0 && !this.isDead) {
            if (this._stateMachine) {
                this._stateMachine.SetState('dead'); // animacja śmierci
                this.isDead = true;
            }
            document.getElementById('game-over').style.display = 'block';
            const restart = () => {
                window.location.reload();
            };
            window.addEventListener('mousedown', restart, { once: true });
            window.addEventListener('keydown', restart, { once: true });
        }
    }

    update(delta, enemies) {
        if (!this.rigidBody) return;

        // Jeśli martwy - tylko animacja śmierci działa!
        if (this.isDead) {
            if (this._mixer) this._mixer.update(delta);
            if (this._stateMachine) this._stateMachine.Update(delta, this.ctrl); // żeby animacja dead się odpaliła
            return;
        }

        // NORMALNY UPDATE
        const pos = this.rigidBody.translation();
        this.position.set(pos.x, pos.y, pos.z);
        this.rotation.y -= this.ctrl.x * 0.03;

        if (this._mixer) this._mixer.update(delta);
        if (this._stateMachine) this._stateMachine.Update(delta, this.ctrl);

        if (!this.lastHitTime) this.lastHitTime = 0;
        const now = performance.now();
        for (let enemy of enemies) {
            const dist = this.position.distanceTo(enemy.model.position);
            if (dist < 1.5 && now - this.lastHitTime > 1000) {
                this.takeDamage(10);
                this.lastHitTime = now;
            }
        }
        this.updatePhysic();
    }


    updatePhysic() {
        const SPEED = this.ctrl.sprint ? 6 : 3;
        const localMove = new THREE.Vector3(0, 0, -this.ctrl.z);
        const globalMove = localMove.applyQuaternion(this.quaternion).multiplyScalar(SPEED);

        const velocity = this.rigidBody.linvel();
        let y = velocity.y;

        this.rigidBody.setLinvel({ x: globalMove.x, y, z: globalMove.z }, true);
    }

    static async create(path, physic) {
        const player = new Player(physic);
        await player.loadModel(path);
        return player;
    }
}
