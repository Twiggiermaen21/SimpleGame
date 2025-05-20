import { Scene } from 'three';

import Camera from './engine/camera';
import Light from './engine/Light';
import Graphic from './engine/graphic';
import loader from './tool/loader';
import physic from './engine/physic';
import World from './entity/world';
import Player from './entity/player';
import * as THREE from 'three'
const { visuals, player: playerModel } = await loader('./glb/world.glb', './glb/model.glb');

// === SETUP ===
const scene = new Scene();
const camera = new Camera();
console.log(visuals)
const world = new World(visuals, physic);

const player = new Player(playerModel[0], physic); // Zakładam, że player to obiekt FBX
const light = new Light();


// === CREATE WORLD ===


console.log(world)
scene.add(light);
scene.add(world);
world.position.set(0, -10, 0)

scene.add(player);
console.log(player.position)



const graphic = new Graphic(scene, camera);
graphic.onUpdate((dt) => {
    physic.step();
    player.update()
});
