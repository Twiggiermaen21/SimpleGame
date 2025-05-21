import { Scene } from 'three';

import Camera from './engine/camera';

import Light from './engine/Light';
import Graphic from './engine/graphic';
import loader from './tool/loader';
import physic from './engine/physic';
import World from './entity/world';
import Player from './entity/playerv2';
import * as THREE from 'three'
import BoxEntity from './entity/box';
const { visuals, player: playerModel } = await loader('./glb/world.glb', './glb/model.glb');

// === SETUP ===
const scene = new Scene();
const camera = new Camera();


const world = new World(visuals, physic);
const light = new Light();

const box = new BoxEntity(new THREE.Vector3(0, 10, 0), physic); // startuje 10 jednostek nad ziemią
const player2 = await Player.load('./player/skin.fbx', physic);

// === CREATE WORLD ===
// scene.add(new THREE.AxesHelper(5));
// scene.add(new THREE.GridHelper(100, 100));
scene.add(light);
scene.add(world);
scene.add(box);
scene.add(player2);

const graphic = new Graphic(scene, camera);
graphic.onUpdate((dt) => {
    physic.step();
    player2.update()

    box.update();
    camera.update(player2)
});


