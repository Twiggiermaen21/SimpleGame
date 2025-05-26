import { Scene } from 'three';

import Camera from './engine/camera';

import Light from './engine/Light';
import Graphic from './engine/graphic';
import loader from './tool/loader';
import physic from './engine/physic';
import World from './entity/world';
import Player from './entity/player/player';
import Enemy from './entity/enemy/enemy';

import * as THREE from 'three'
import BoxEntity from './entity/box';
const visuals = await loader('./glb/world.glb');

// === SETUP ===
const scene = new Scene();
const camera = new Camera();
const world = new World(visuals, physic);
const light = new Light();

const box = new BoxEntity(new THREE.Vector3(0, 10, 0), physic); // startuje 10 jednostek nad ziemią
// const player = await Player.create('player/skin.fbx', physic);
const player = await Player.create('./entity/player/tung/skin.fbx', physic);


const load = new THREE.CubeTextureLoader();
const texture = load.load([
    './cubeBox/posx.jpg',
    './cubeBox/negx.jpg',
    './cubeBox/posy.jpg',
    './cubeBox/negy.jpg',
    './cubeBox/posz.jpg',
    './cubeBox/negz.jpg',
]);

const enemies = [];

const patrolGroups = [
    [ // patrol 1 – kwadrat
        new THREE.Vector3(10, 10, -20),
        new THREE.Vector3(15, 10, -25),
        new THREE.Vector3(15, 10, -25),
        new THREE.Vector3(10, 10, -20),
    ],
    [ // patrol 2 – kwadrat
        new THREE.Vector3(-10, 5, -15),
        new THREE.Vector3(-5, 5, -15),
        new THREE.Vector3(-5, 5, -15),
        new THREE.Vector3(-10, 5, -15),
    ],
    [ // patrol 3 – prostokąt
        new THREE.Vector3(10, 5, -15),
        new THREE.Vector3(15, 5, -15),
        new THREE.Vector3(15, 5, -12),
        new THREE.Vector3(10, 5, -12),
    ],
];

for (const path of patrolGroups) {
    const enemy = await Enemy.create(
        path,
        physic,
        './entity/player/player/skin.fbx',            // Twój model
        './entity/player/player/'          // Folder z idle.fbx, walk.fbx, run.fbx
    );
    enemy.setTarget(player);
    // enemy.setObstacles([world]);
    scene.add(enemy.model);
    enemies.push(enemy);

}



scene.background = texture
// === CREATE WORLD ===
// scene.add(new THREE.AxesHelper(5));
// scene.add(new THREE.GridHelper(100, 100));
scene.add(light);
scene.add(world);
scene.add(box);
scene.add(player);


camera.collidableObjects = [world];
const graphic = new Graphic(scene, camera);


graphic.onUpdate((dt) => {
    physic.step();
    player.update(dt)
    for (const enemy of enemies) {
        enemy.update(dt);
    }
    box.update();
    camera.update(player)
});


