import * as THREE from 'three';


export default function loadSkybox() {

const skyboxPaths = [
    './cubeBox/posx.jpg',
    './cubeBox/negx.jpg',
    './cubeBox/posy.jpg',
    './cubeBox/negy.jpg',
    './cubeBox/posz.jpg',
    './cubeBox/negz.jpg',
];


    const loader = new THREE.CubeTextureLoader();
    return loader.load(skyboxPaths);
}
