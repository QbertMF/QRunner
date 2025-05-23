import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Player } from './player.js';
import { Monster } from './monster.js';

// Define the vertices of the box
const vertices = new Float32Array([
  -1.0, -0.1, 1.0, // 0: bottom-left-front
  1.0, -0.1, 1.0, // 1: bottom-right-front
  1.0, 0.1, 1.0, // 2: top-right-front
  -1.0, 0.1, 1.0, // 3: top-left-front
  -1.0, -0.1, -1.0, // 4: bottom-left-back
  1.0, -0.1, -1.0, // 5: bottom-right-back
  1.0, 0.1, -1.0, // 6: top-right-back
  -1.0, 0.1, -1.0 // 7: top-left-back
]);


const indices = new Uint16Array([
  0, 1, 2, 0, 2, 3, // front face
  4, 5, 6, 4, 6, 7, // back face
  0, 3, 7, 0, 7, 4, // left face
  1, 2, 6, 1, 6, 5, // right face
  3, 2, 6, 3, 6, 7, // top face
  0, 1, 5, 0, 5, 4 // bottom face
]);

// Initialize the player
let player;
let monster;
let monster4
const clock = new THREE.Clock();

let cameraSpeed = 0.2;
let characterSpeed = 0.5;

let isMouseDown = false; // Zustand, ob die Maustaste gedrückt ist

let rotationSpeed = 0.002; // Rotationsgeschwindigkeit
let panningSpeed = 0.2; // Rotationsgeschwindigkeit

// Variablen für die Kamerarotation
let yaw = 0; // Horizontal (Y-Achse)
let pitch = 0; // Vertikal (X-Achse)

let panX = 0; // Pan-X
let panY = 0; // Pan-Y 

const keys = {};



// current positions of the street to continue
let streetleft = -200;
let streetRight = 200;

const path = [
  {pos: 2, angle: 0.0, color: 0x50ffff},
  {pos: 1, angle: 0.2, color: 0xff4f60},
  {pos: 1, angle: 0.2, color: 0x50ff60},
  {pos: 1, angle: 0.2, color: 0xff4f60},
  {pos: 1, angle: 0.2, color: 0x50ff60},
  {pos: 2, angle: 0.0, color: 0xff4fff},
  {pos: 1, angle: -0.5, color: 0x50ff60},
  {pos: 1, angle: -0.5, color: 0xff4f60},
  {pos: 1, angle: -0.5, color: 0x50ff60},
  {pos: 1, angle: -0.5, color: 0xff4f60},
  {pos: 2, angle: 0.0, color: 0x3f3f3f},
]

let pathIndex = 0;

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth-100, window.innerHeight-100);
document.body.appendChild(renderer.domElement);

// Create platform
const geometry = new THREE.BoxGeometry(10, 1, 10);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const platform = new THREE.Mesh(geometry, material);
platform.position.y = -1;
scene.add(platform);

// Create character
const charGeometry = new THREE.BoxGeometry(1, 2, 1);
const charMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const character = new THREE.Mesh(charGeometry, charMaterial);
character.position.y = 1;
scene.add(character);

// Add AxesHelper
const axes = new THREE.AxesHelper(3); // The parameter is the length of the axes
scene.add(axes);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Add ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add OrbitControls
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.listenToKeyEvents(window); // or document.body

function initPlayer() {
  player = new Player(scene, '../assets/test.glb', 0.02);
}
initPlayer();

function initMonster() {
  monster4 = new Monster(scene, '../assets/monster4.gltf', 1.0, (model) => {
    model.position.set(5, 0, -5);
    model.rotation.set(-Math.PI/2, 0, 0);
    console.log('Monster4 loaded');
  });

  monster = new Monster(scene, '../assets/monster3.gltf', 1.0, (model) => {
    model.position.set(3, 0, -5); 
    model.rotation.set(-Math.PI/2, 0, 0);
    console.log('Monster loaded');
  });
}

initMonster();


function createPath(){
  for (let i = 0; i < path.length; i++) {
    updatePlatform(i);
  }
}

function createPlatform(color) {
  // Kopiere die vertices, damit jede Plattform ihre eigenen hat
  const platformVertices = new Float32Array(vertices);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(platformVertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));

  const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
  return new THREE.Mesh(geometry, material);
}

function updatePlatform(pathIndex) {
  //curColor = (curColor + 1) % 2;
  //const colorGreen = curColor === 0 ? 0x50ff60 : 0x5060ff;

  const platform = createPlatform(path[pathIndex].color);
  scene.add(platform);

  // Create a vector between the front left and right vertice
  const frontLeft = new THREE.Vector3(vertices[0], vertices[1], vertices[2]);
  const frontRight = new THREE.Vector3(vertices[3], vertices[4], vertices[5]);
  const base = new THREE.Vector3(frontLeft-frontRight).normalize();

  const yAxis = new THREE.Vector3(0, 1, 0); // y-Achse
  // Rotiere den Vektor um die y-Achse
  base.applyAxisAngle(yAxis, pitch);
  
  // Kopiere back vertices to front
  for (let i = 0; i < 12; i++) {
    vertices[i] = vertices[i+12];
  }

  moveAndRotateBackVertices(vertices, 
                            path[pathIndex].pos,
                            path[pathIndex].angle);

}

function moveAndRotateBackVertices(vertices, moveAmount, rotationAngle, color) {
  // Extrahiere die hinteren Vertices (Back-Vertices)
  const backVertices = [
    new THREE.Vector3(vertices[12], vertices[13], vertices[14]), // 4: bottom-left-back
    new THREE.Vector3(vertices[15], vertices[16], vertices[17]), // 5: bottom-right-back
    new THREE.Vector3(vertices[18], vertices[19], vertices[20]), // 6: top-right-back
    new THREE.Vector3(vertices[21], vertices[22], vertices[23])  // 7: top-left-back
  ];

  // Berechne den Mittelpunkt der Front-Vertices
  const frontVertices = [
    new THREE.Vector3(vertices[0], vertices[1], vertices[2]), // 0: bottom-left-front
    new THREE.Vector3(vertices[3], vertices[4], vertices[5]), // 1: bottom-right-front
    new THREE.Vector3(vertices[6], vertices[7], vertices[8]), // 2: top-right-front
    new THREE.Vector3(vertices[9], vertices[10], vertices[11]) // 3: top-left-front
  ];

  const frontCenter = new THREE.Vector3();
  for (let i = 0; i < frontVertices.length; i++) {
    frontCenter.add(frontVertices[i]);
  }
  frontCenter.divideScalar(frontVertices.length); // Mittelwert der Front-Vertices

  // Berechne den Normalenvektor der Ebene
  const edge1 = new THREE.Vector3().subVectors(backVertices[1], backVertices[0]); // Vektor von 4 nach 5
  const edge2 = new THREE.Vector3().subVectors(backVertices[3], backVertices[0]); // Vektor von 4 nach 7
  const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize(); // Normalenvektor berechnen

  // Verschiebe die Back-Vertices in Richtung des Normalenvektors
  for (let i = 0; i < backVertices.length; i++) {
    backVertices[i].add(normal.clone().multiplyScalar(-moveAmount));
  }

  // Rotiere die Back-Vertices um die Y-Achse
  const rotationAxis = new THREE.Vector3(0, 1, 0); // Y-Achse
  for (let i = 0; i < backVertices.length; i++) {
    // Verschiebe den Vertex relativ zum Rotationszentrum
    backVertices[i].sub(frontCenter);
    // Rotiere den Vertex um die Y-Achse
    backVertices[i].applyAxisAngle(rotationAxis, rotationAngle);
    // Verschiebe den Vertex zurück
    backVertices[i].add(frontCenter);
  }

  // Speichere die aktualisierten Back-Vertices zurück in das vertices-Array
  for (let i = 0; i < backVertices.length; i++) {
    vertices[12 + i * 3] = backVertices[i].x;
    vertices[13 + i * 3] = backVertices[i].y;
    vertices[14 + i * 3] = backVertices[i].z;
  }
}  

// Set camera position
camera.position.y = 4;

// Animate character
function animate() {
  requestAnimationFrame(animate);
  if (character.position.z > -5.0) {
    character.position.z -= 0.1;
  }

  const deltaTime = clock.getDelta();

  // Update the player animations
  if (player) {
      player.update(deltaTime);
  }
 
  if (monster) {
    monster.update(deltaTime);
  }
  if (monster4) {
    monster4.update(deltaTime);
  }

  let playerPosZ = -Math.floor(character.position.z)
  //console.log(playerPosZ)
  if ((playerPosZ >= 0) && (playerPosZ < path.length)) {
    if (playerPosZ != pathIndex) {
      pathIndex = playerPosZ
      console.log("pathIndex: ", pathIndex)
      // add new platform with alternating color
      //updatePlatform();
    }
  }
  
  // Update the camera position to follow the character
  //camera.position.z = character.position.z + 10;
  //camera.position.x = character.position.x;
  //camera.position.y = character.position.y;


  // Ensure the camera is always looking at the character
  //camera.lookAt(character.position);

  updateCamera(); // Update camera position and rotation
  //controls.update(); // Update controls
  
  renderer.render(scene, camera);
}

createPath();

animate();


// Event-Listener für Tasteneingaben
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});
document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

// Event-Listener für Maustasten
document.addEventListener('mousedown', () => {
  isMouseDown = true; // Maustaste gedrückt
});

document.addEventListener('mouseup', () => {
  isMouseDown = false; // Maustaste losgelassen
  panX = 0;
  panY = 0;
});


// Event-Listener für Mausbewegung
document.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    yaw -= event.movementX * rotationSpeed; // Horizontal drehen
    pitch -= event.movementY * rotationSpeed; // Vertikal drehen
  
    panX = event.movementX  * panningSpeed;
    panY = event.movementY  * panningSpeed;
    // Begrenze den Pitch-Winkel, damit die Kamera nicht "überdreht"
    //pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  }
});

// Funktion zur Aktualisierung der Kamera
function updateCamera() {
  // Bewegung basierend auf der Blickrichtung
  const forward = new THREE.Vector3(
    Math.sin(yaw),
    0,
    Math.cos(yaw)
  ).normalize();
  const right = new THREE.Vector3(
    Math.sin(yaw + Math.PI / 2),
    0,
    Math.cos(yaw + Math.PI / 2)
  ).normalize();

  // Definiere die X-Achse als Rotationsachse
  const xAxis = new THREE.Vector3(1, 0, 0); // X-Achse
  // Rotiere den Vektor um die X-Achse
  forward.applyAxisAngle(xAxis, pitch);
  right.applyAxisAngle(xAxis, pitch);

  // Bewegung basierend auf den gedrückten Tasten
  if (keys['Control']) {
    console.log('control pressed')
    camera.position.add(right.multiplyScalar(panX));
    camera.position.add(new THREE.Vector3(0, panY, 0));
    panX = 0;
    panY = 0;
    
  } else {
    if (keys['w']) {
      camera.position.add(forward.multiplyScalar(-cameraSpeed));
    }
    if (keys['s']) {
      camera.position.add(forward.multiplyScalar(cameraSpeed));
    }
    if (keys['a']) {
      camera.position.add(right.multiplyScalar(-cameraSpeed));
    }
    if (keys['d']) {
      camera.position.add(right.multiplyScalar(cameraSpeed));
    }
    if (keys['q']) {
      camera.position.add(new THREE.Vector3(0, cameraSpeed, 0));
    }
    if (keys['y']) {
      camera.position.add(new THREE.Vector3(0, -cameraSpeed, 0));
    }

    if (keys['r']) {
      camera.position.set(0,0,4);
    }

    if (keys['t']) {
      player.playAnimation('Capoeira');
    }
    if (keys['z']) {
      player.playAnimation('RumbaDancing');
    }
     // console.log('keys', keys)

    // Kamera-Rotation anwenden
    camera.rotation.set(pitch, yaw, 0);
    //console.log(camera.rotation.x, camera.rotation.y, camera.rotation.z) 
  }
 
}

