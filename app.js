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
        new THREE.Vector3(4, 5, -60),
        new THREE.Vector3(8, 5, -60),
        new THREE.Vector3(8, 15, -60),
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
];
const potionPositions = [
    new THREE.Vector3(0, 10, 10),
    new THREE.Vector3(-8, 10, -40),
    new THREE.Vector3(12, 10, 30),
];
const treasurePositions = [
    new THREE.Vector3(0, 5, -10),

];


// === ASYNC INIT ===
async function startGame() {

    // Załaduj świat i tekstury
    const scene = new Scene();
    scene.background = loadSkybox();
    // Światło, kamera, świat, obiekty
    const light = new Light();
    const camera = new Camera();
    const world = await World.create('./glb/world.glb', physic);
    const box = new BoxEntity(new THREE.Vector3(0, 10, 0), physic);
    const player = await Player.create('./entity/player/tung/skin.fbx', physic);

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
        // Przykład: dodanie punktów, wyświetlenie komunikatu
        console.log('Znalazłeś skarb!');
        // Przykład: respawn po 30 sekundach
        setTimeout(() => treasure.respawn(), 30000);
    }

    // Tworzenie i dodanie do sceny:
    const treasureSpawner = new TreasureSpawner(scene, treasurePositions, onTreasurePickup);



    // Graphic / render loop setup
    const graphic = new Graphic(scene, camera);
    graphic.onUpdate((dt) => {
        physic.step();
        player.update(dt, enemies);
        // console.log(player.position);

        enemies.forEach(enemy => {
            enemy.update(dt);
            enemy.updateHealthBar2D(camera);
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