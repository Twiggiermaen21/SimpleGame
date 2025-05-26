import * as THREE from 'three';
import { RigidBodyDesc, ColliderDesc } from '@dimforge/rapier3d-compat';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

class EnemyFSM {
  constructor(enemy) {
    this.enemy = enemy;
    this.state = null;
    this.raycaster = new THREE.Raycaster();

    // 🔧 Tutaj zmień zasięg wykrywania gracza
    this.maxViewDistance = 100;       // np. 10 jednostek
    this.fov = Math.PI / 3;          // 60 stopni pola widzenia
  }

  isPlayerVisible() {
    const from = this.enemy.model.position.clone();
    const to = this.enemy.target.position.clone();
    const dir = new THREE.Vector3().subVectors(to, from);
    const distance = dir.length();

    if (distance > this.maxViewDistance) return false;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.enemy.model.quaternion);
    const angle = forward.angleTo(dir.clone().normalize());
    if (angle > this.fov / 2) return false;

    this.raycaster.set(from, dir.normalize());
    const hits = this.raycaster.intersectObjects(this.enemy.obstacles, true);
    if (hits.length && hits[0].distance < distance) return false;

    return true;
  }

  update() {
    if (!this.enemy.target) return;
    this.setState(this.isPlayerVisible() ? 'run' : 'walk');
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;

    const anim = this.enemy.animations[state];
    if (anim) {
      Object.values(this.enemy.animations).forEach(a => a.action.stop());
      anim.action.reset().play();
    }
  }
}

export default class Enemy {
  constructor(physicsWorld) {
    this.physicsWorld = physicsWorld;
    this.speed = 1;

    this.rigidBody = null;
    this.model = null;
    this.target = null;

    this.halfHeight = 1.0;
    this.smoothRotationSpeed = 5;
    this.animations = {};
    this._mixer = null;
    this.obstacles = [];

    this.fsm = new EnemyFSM(this);
    this.patrolPath = [];
    this.currentPatrolIndex = 0;
  }

  async loadModel(modelPath, animPath) {
    const loader = new FBXLoader();
    const fbx = await loader.loadAsync(modelPath);

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

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => this.fsm.setState('idle');

    const animLoader = new FBXLoader(manager);
    const loadAnim = (name) => {
      animLoader.load(`${animPath}${name}.fbx`, (anim) => {
        const clip = anim.animations[0];
        this.animations[name] = {
          clip,
          action: this._mixer.clipAction(clip),
        };
      });
    };

    ['idle', 'walk', 'run'].forEach(loadAnim);
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

  setObstacles(obstacles) {
    this.obstacles = obstacles;
  }

  update(deltaTime) {
    if (!this.rigidBody || !this.patrolPath.length) return;

    const pos = this.rigidBody.translation();
    this.model.position.set(pos.x, pos.y, pos.z);

    this.fsm.update();
    if (this._mixer) this._mixer.update(deltaTime);

    // patrol lub pościg
    const shouldChase = this.fsm.state === 'run';
    const targetPoint = shouldChase ? this.target.position : this.patrolPath[this.currentPatrolIndex];

    const direction = new THREE.Vector3().subVectors(targetPoint, this.model.position);
    const distance = direction.length();

    if (!shouldChase && distance > 0.001 && distance < 0.3) {
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
    }

    direction.normalize();

    const currentVel = this.rigidBody.linvel();
    const speed = shouldChase ? this.speed * 1.5 : this.speed;

    this.rigidBody.setLinvel({
      x: direction.x * speed,
      y: currentVel.y,
      z: direction.z * speed,
    }, true);

    // obrót
    const horizontalVel = new THREE.Vector3(currentVel.x, 0, currentVel.z);
    if (horizontalVel.lengthSq() > 0.001) {
      const lookAt = new THREE.Vector3().copy(this.model.position).add(horizontalVel.normalize());
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
