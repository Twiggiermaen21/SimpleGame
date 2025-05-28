import * as THREE from 'three';
import { Scene } from 'three';
import Camera from './engine/camera';
import Light from './engine/Light';
import Graphic from './engine/graphic';
import physic from './engine/physic';
import loadSkybox from './tool/loadSkybox';
import World from './entity/world';
import Player from './entity/player/player';
import Enemy from './entity/enemy/enemy';
import BoxEntity from './entity/box';
import PotionSpawner from './entity/potion/potionSpawner';
import TreasureSpawner from './entity/treasure/tresureSpawner';
import TreasureCounter from './entity/treasure/treasureCounter.js';
// Enemy patrol paths
const patrolGroups = [

    [
        new THREE.Vector3(-10, 5, -15),
        new THREE.Vector3(-5, 5, -15),
        new THREE.Vector3(-5, 5, -15),
        new THREE.Vector3(-10, 5, -15),
    ],
    [
        new THREE.Vector3(4, 5, -60),
        new THREE.Vector3(8, 5, -50),

    ],
    [
        new THREE.Vector3(10, 5, -15),
        new THREE.Vector3(15, 5, -15),
        new THREE.Vector3(15, 5, -12),
        new THREE.Vector3(10, 5, -12),
    ],
    [
        new THREE.Vector3(-8, 5, -60),
        new THREE.Vector3(-8, 5, -60),
        new THREE.Vector3(-4, 5, -62),
        new THREE.Vector3(-4, 5, -62),
    ],
    [ // front – ruch w Z
        new THREE.Vector3(19.14, -3, -171.2),
        new THREE.Vector3(19.14, -3, -167.2)
    ],
    [ // right – ruch w Z
        new THREE.Vector3(35.9, -3, -195.38 - 1),
        new THREE.Vector3(35.9, -3, -195.38 + 1)
    ],
    [ // back – ruch w Z
        new THREE.Vector3(18.58, -3, -219.48),
        new THREE.Vector3(18.58, -3, -215.48)
    ],
    [ // left – ruch w Z
        new THREE.Vector3(1.2, -3, -193.34 - 1),
        new THREE.Vector3(1.2, -3, -193.34 + 1)
    ]
];

const potionPositions = [
    new THREE.Vector3(0, 4.5, 10),
    new THREE.Vector3(-8, 4.5, -40),
    new THREE.Vector3(12, 1, 30),
    new THREE.Vector3(2.4, -4.5, -169.2),    // lewy przedni róg
    new THREE.Vector3(35.88, -4.5, -169.3),  // prawy przedni
    new THREE.Vector3(35.96, -4.5, -217.46), // prawy tylny
    new THREE.Vector3(1.20, -4.5, -217.48)   // lewy tylny
];
const treasurePositions = [
    new THREE.Vector3(0, 5, -10),
    new THREE.Vector3(19, -4, -193.32),
];


// === ASYNC INIT ===
async function startGame() {

    // Załaduj świat i tekstury
    const scene = new Scene();
    scene.background = loadSkybox();
    // Światło, kamera, świat, obiekty
    const light = new Light();
    const camera = new Camera();
    const world = await World.create('./models/world.glb', physic);
    const box = new BoxEntity(new THREE.Vector3(0, 10, 0), physic);
    const player = await Player.create(new THREE.Vector3(0, 15, 0), physic, './entity/player/tung/skin.fbx', './entity/player/tung/');

    // Tworzenie wrogów
    const enemies = [];
    for (const path of patrolGroups) {
        const enemy = await Enemy.create(path, physic,
            './entity/player/player/skin.fbx',       // Model
            './entity/player/player/'                // Folder z animacjami
        );
        enemy.setTarget(player);
        scene.add(enemy.model);
        enemies.push(enemy);
    }

    // Dodanie obiektów do sceny
    scene.add(light);
    scene.add(world);
    scene.add(box);
    scene.add(player);

    camera.collidableObjects = [world];

    function onPotionPickup(potion) {
        player.healthBar.increase(25)
        // Możesz zrespawnować po czasie:
        setTimeout(() => potion.respawn(), 10000); // 10 sekund
    }

    // Tworzenie i dodanie do sceny:
    const potionSpawner = new PotionSpawner(scene, potionPositions, onPotionPickup);
    function onTreasurePickup(treasure) {
        treasureCounter.increment();
        // Przykład: respawn po 30 sekundach
        setTimeout(() => treasure.respawn(), 30000);
    }

    // Tworzenie i dodanie do sceny:
    const treasureSpawner = new TreasureSpawner(scene, treasurePositions, onTreasurePickup);
    const treasureCounter = new TreasureCounter();
    treasureCounter.setMax(treasurePositions.length);


    // Graphic / render loop setup
    const graphic = new Graphic(scene, camera);
    graphic.onUpdate((dt) => {
        physic.step();
        player.update(dt, enemies);

        enemies.forEach(enemy => {
            enemy.update(dt);
            enemy.updateHealthBar2D(camera, player.position);
            console.log(enemy);

        });
        box.update();
        camera.update(player);
        potionSpawner.update(player);
        treasureSpawner.update(player);
    });

}





document.getElementById('start-button').onclick = async () => {
    hideStartScreen();
    showLoadingScreen();
    // Tu start gry, ładowanie świata, gracza, assetów, itd.
    await startGame(); // Twoja funkcja
    hideLoadingScreen();
    showCrosshair();
}


function showLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'flex';
}
function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
    document.body.style.cursor = 'none';
}

function hideStartScreen() {
    document.getElementById('start-screen').style.display = 'none';
}

function showCrosshair() {
    document.getElementById('crosshair').style.display = 'block';
}