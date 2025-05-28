import * as THREE from 'three';
import { Object3D } from 'three';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import Gamepad from '../../control/gamepad';
import { FSM } from './FSM';
import { HealthBar } from './bar.js';
import { loadModel } from '../../tool/modelLoader.js'; // wspólny loader dla FBX/GLB
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'; // poprawny import
import { BasicCharacterControllerProxy } from './characterProxy.js';
import { initPhysicsBody } from '../../tool/function.js';
export default class Player extends Object3D {
    ctrl = new Gamepad();

    constructor(physic) {
        super();
        this.physic = physic;
        this.mesh = null;
        this.rigidBody = null;
        this.healthBar = new HealthBar();
        this.hp = 100;
        this.isDead = false;
        this._attackHasHit = false;
        this._animations = {};
        this._mixer = null;
        this._jumpScheduled = false;
        this._jumpTime = 0;
        this._stateMachine = null;
    }


    async loadModel(path, animPath) {
        // 1) Mesh postaci
        const character = await loadModel(path, 0.001);
        character.position.set(0, -0.5, 0);
        this.mesh = character;
        this.add(character);


        this._mixer = new THREE.AnimationMixer(character);
        const manager = new THREE.LoadingManager();
        manager.onLoad = () => {
            this._stateMachine = new FSM.CharacterFSM(
                new BasicCharacterControllerProxy(this._animations, this.rigidBody)
            );
            this._stateMachine.SetState('idle');
        };
        const animLoader = new FBXLoader(manager);

        const loadAnim = (name, file) => {
            animLoader.load(animPath + file, (anim) => {
                const clip = anim.animations[0];
                this._animations[name] = {
                    clip,
                    action: this._mixer.clipAction(clip),
                };
            });
        };
        ['idle', 'walk', 'run', 'jump', 'dance', 'attack1', 'attack2', 'dead'].forEach(name => {
            loadAnim(name, `${name}.fbx`);
        });



    }

    _initPhysics(position) {

        this.rigidBody = initPhysicsBody(this.physic, position);
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp = Math.max(0, this.hp - amount);
        this.healthBar.set(this.hp);
        if (this.hp <= 0 && !this.isDead) {
            this._stateMachine?.SetState('dead');
            this.isDead = true;
            document.getElementById('game-over').style.display = 'block';
            const restart = () => window.location.reload();
            window.addEventListener('mousedown', restart, { once: true });
            window.addEventListener('keydown', restart, { once: true });
        }
    }

    update(delta, enemies) {
        if (!this.rigidBody) return;
        // Śmierć
        if (this.isDead) {
            this._mixer?.update(delta);
            this._stateMachine?.Update(delta, this.ctrl);
            return;
        }
        // Pozycja z fizyki
        const pos = this.rigidBody.translation();
        this.position.set(pos.x, pos.y, pos.z);
        this.rotation.y -= this.ctrl.x * 0.03;
        // Animacje i FSM
        this._mixer?.update(delta);
        this._stateMachine?.Update(delta, this.ctrl);
        // Kolizja z wrogami
        const now = performance.now();
        this.lastHitTime ??= 0;
        for (let enemy of enemies) {
            const d = this.position.distanceTo(enemy.model.position);
            if (d < 1.5 && now - this.lastHitTime > 1000 && !enemy.isDead) {
                this.takeDamage(10);
                this.lastHitTime = now;
            }
        }
        // Atak
        const state = this._stateMachine?._currentState?.Name;
        const isAttacking = state === 'attack1' || state === 'attack2';
        if (isAttacking && !this._attackHasHit) {
            for (let enemy of enemies) {
                const d = this.position.distanceTo(enemy.model.position);
                if (d < 1.5 && !enemy.isDead) {
                    enemy.takeDamage(25);
                    this._attackHasHit = true;
                }
            }
        }
        if (!isAttacking) this._attackHasHit = false;
        // Ruch fizyczny
        this.updatePhysic();
    }

    updatePhysic() {
        const SPEED = this.ctrl.sprint ? 6 : 3;
        const local = new THREE.Vector3(0, 0, -this.ctrl.z);
        const global = local.applyQuaternion(this.quaternion).multiplyScalar(SPEED);
        const vel = this.rigidBody.linvel();
        this.rigidBody.setLinvel({ x: global.x, y: vel.y, z: global.z }, true);
    }

    static async create(position, physic, path, animPath) {
        const player = new Player(physic);
        await player.loadModel(path, animPath);
        player._initPhysics(position);
        return player;
    }
}
