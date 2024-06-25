import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const planets = [];
const orbits = [];
let haveSun = true

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Criando o sol
const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunLight = new THREE.PointLight(0xffffff, 1000, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight)


// Dados dos planetas (distância em milhões de km e tamanho relativo à Terra)
const planetData = [
    { name: 'Mercury', distance: 57.9, size: 0.383, color: 0x888888, img: './img/mercury.jpeg' },
    { name: 'Venus', distance: 108.2, size: 0.949, color: 0xffa500, img: './img/venus.jpeg' },
    { name: 'Earth', distance: 149.6, size: 1, color: 0x0000ff, img: './img/earth.jpeg' },
    { name: 'Mars', distance: 227.9, size: 0.532, color: 0xFF5733, img: './img/mars.jpeg' },
    { name: 'Jupiter', distance: 778.5, size: 11.209, color: 0xDDBA6A, img: './img/jupiter.jpeg' },
    { name: 'Saturn', distance: 1433.4, size: 9.449, color: 0xE0CD9F, img: './img/saturn.jpeg' },
    { name: 'Uranus', distance: 2872.5, size: 4.007, color: 0xA4DDED, img: './img/uranus.jpeg' },
    { name: 'Neptune', distance: 4495.1, size: 3.883, color: 0x3F5EFB, img: './img/neptune.jpeg' }
];

planetData.forEach(data => {
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load(
            data.img
        )
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.x = data.distance / 10;

    scene.add(planet);
    planets.push(planet);


    const points = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = (data.distance / 10) * Math.cos(theta);
        const z = (data.distance / 10) * Math.sin(theta);
        points.push(new THREE.Vector3(x, 0, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
    orbits.push(orbit);
});

camera.position.set(0, 100, 0);
camera.lookAt(scene.position);

function animate() {
    requestAnimationFrame(animate);

    if (haveSun) {
        const time = performance.now();
        const planetRotationSpeed = 0.00005;

        planets.forEach((planet, index) => {
            const planetAngle = time * planetRotationSpeed * (index + 1);
            const distance = planetData[index].distance / 10;

            //Paneta rotação
            planet.rotation.y += 0.01;
            updatePlanetPosition(planet, distance, planetAngle);
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

function updatePlanetPosition(planet, distance, angle) {
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);
    planet.position.set(x, 0, z);
}

animate();

function changeOrbit() {
    const speed = 0.0001; // Velocidade de movimento em unidades por frame
    let elapsedTime = 0;

    // Remover o sol da cena
    scene.remove(sun);
    haveSun = false;

    planets.forEach((planet, index) => {
        let currentDirection = new THREE.Vector3(); // Armazenar a direção atual do planeta

        // Clonar a posição atual do planeta para a nova órbita
        const initialPosition = planet.position.clone();

        // Calcular a direção atual do planeta
        currentDirection.subVectors(planet.position, new THREE.Vector3(0, 0, 0)).normalize();

        // Rotacionar a direção 
        const sideDirection = new THREE.Vector3(-currentDirection.z, 0, currentDirection.x).normalize();

        // Criar uma nova geometria para a órbita com base na posição atual do planeta
        const newOrbitGeometry = new THREE.BufferGeometry();
        const orbitPositions = new Float32Array([
            initialPosition.x, initialPosition.y, initialPosition.z // Ponto inicial na posição atual do planeta
        ]);
        newOrbitGeometry.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));

        // Criar um material para a nova órbita
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        // Criar a nova órbita
        const newOrbit = new THREE.Line(newOrbitGeometry, orbitMaterial);

        // Adicionar a nova órbita à cena
        scene.add(newOrbit);

        function movePlanetSide() {
            // Atualizar o tempo decorrido
            elapsedTime += 1;

            // Atualizar a posição da órbita ao longo do tempo
            newOrbit.geometry.attributes.position.array[0] = initialPosition.x + sideDirection.x * speed * elapsedTime;
            newOrbit.geometry.attributes.position.array[2] = initialPosition.z + sideDirection.z * speed * elapsedTime;
            newOrbit.geometry.attributes.position.needsUpdate = true;

            // Atualizar a posição do planeta para acompanhar a nova órbita
            planet.position.add(sideDirection.clone().multiplyScalar(speed * elapsedTime));

            // Atualiza para o próximo quadro de animação
            requestAnimationFrame(movePlanetSide);
        }

        movePlanetSide();
    });
}

const changeOrbitButton = document.createElement('button');
changeOrbitButton.textContent = 'Remover Sol';
changeOrbitButton.onclick = changeOrbit;
document.body.appendChild(changeOrbitButton);
