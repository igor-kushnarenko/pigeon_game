import * as THREE from 'three';
import { CONSTANTS, createGameState } from './game/state.js';
import { createWorld, createStars, createSeeds } from './game/world.js';
import { createPigeon, updatePlayer } from './game/player.js';
import { onMouseMove, updateCamera } from './game/camera.js';
import { initAudio, playFootstep, playEatSound } from './game/audio.js';

const state = createGameState();

function init() {
  state.clock = new THREE.Clock();
  state.raycaster = new THREE.Raycaster();

  state.scene = new THREE.Scene();
  state.scene.fog = new THREE.Fog(0x88ccff, 280, 1100);
  state.scene.background = new THREE.Color(0x88ccff);

  state.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1600);

  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  state.renderer.outputColorSpace = THREE.SRGBColorSpace; // API migration note (r15x+)
  document.body.appendChild(state.renderer.domElement);

  state.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  state.scene.add(state.ambientLight);

  state.sunLight = new THREE.DirectionalLight(0xffee99, 1.85);
  state.sunLight.castShadow = true;
  state.sunLight.shadow.mapSize.width = 2048;
  state.sunLight.shadow.mapSize.height = 2048;
  state.sunLight.shadow.camera.near = 10;
  state.sunLight.shadow.camera.far = 1800;
  state.sunLight.shadow.camera.left = -650;
  state.sunLight.shadow.camera.right = 650;
  state.sunLight.shadow.camera.top = 650;
  state.sunLight.shadow.camera.bottom = -650;
  state.scene.add(state.sunLight);

  state.sun = new THREE.Mesh(
    new THREE.SphereGeometry(22, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffee44 })
  );
  state.scene.add(state.sun);

  createStars(state);
  initAudio(state);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshLambertMaterial({ color: 0x3d8a35 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  state.scene.add(ground);

  createWorld(state);
  createPigeon(state);
  createSeeds(state);

  window.addEventListener('resize', onWindowResize);
  document.addEventListener('keydown', (e) => { state.keys[e.code] = true; });
  document.addEventListener('keyup', (e) => { state.keys[e.code] = false; });

  const canvas = state.renderer.domElement;
  canvas.tabIndex = 1;

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && state.gameRunning) {
      canvas.requestPointerLock();
      document.getElementById('clickToPlay').style.display = 'none';
    }
    if (e.button === 2 && state.gameRunning) state.isOrbiting = true;
  });

  document.addEventListener('mouseup', (e) => { if (e.button === 2) state.isOrbiting = false; });
  document.addEventListener('pointerlockchange', () => {
    state.isPointerLocked = document.pointerLockElement !== null;
  });
  document.addEventListener('mousemove', (e) => onMouseMove(state, e));
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  const clickToPlayEl = document.getElementById('clickToPlay');
  clickToPlayEl.addEventListener('click', () => {
    if (state.gameRunning) {
      state.renderer.domElement.requestPointerLock();
      clickToPlayEl.style.display = 'none';
    }
  });

  document.getElementById('restartButton').addEventListener('click', restartGame);

  startGame();
}

function startGame() {
  state.score = 0;
  state.timeLeft = 600;
  state.slowDownEndTime = 0;
  state.poisonEndTime = 0;
  state.startTime = state.clock.getElapsedTime();

  state.player.position.set(0, 5, 40);
  state.targetYaw = Math.PI;
  state.player.rotation.y = Math.PI;
  state.moveVelocity.set(0, 0, 0);
  state.player.scale.set(0.5, 0.5, 0.5);

  document.getElementById('clickToPlay').style.display = 'flex';
  document.getElementById('clickToPlay').style.pointerEvents = 'auto';

  updateUI();
  state.gameRunning = true;
  document.getElementById('gameOver').style.display = 'none';
  state.renderer.domElement.focus();

  animate();
  startTimer();
}

function update(delta) {
  if (!state.gameRunning) return;

  updateSunAndSky();
  updatePlayer(
    state,
    delta,
    () => playFootstep(state),
    () => playEatSound(state),
    updateUI
  );
  updateCamera(state);
}

function updateSunAndSky() {
  const progress = (state.clock.getElapsedTime() - state.startTime) / 600;
  const theta = progress * Math.PI;
  const radius = 1100;

  state.sun.position.set(
    radius * Math.cos(theta) * 0.82,
    radius * Math.sin(theta),
    radius * Math.sin(theta) * 0.25 - 220
  );
  state.sunLight.position.copy(state.sun.position);
  state.sunLight.intensity = 1.85 * Math.max(0, Math.sin(theta));
  state.sun.visible = state.sun.position.y >= 0;

  const skyColor = new THREE.Color(0x88ccff);
  let ambientInt = 0.45;
  let sunInt = 1.85;

  if (progress < 0.23) {
    const t = progress / 0.23;
    skyColor.lerpColors(new THREE.Color(0x1C2A44), new THREE.Color(0x6EB8FF), t);
    ambientInt = 0.11 + t * 0.29;
    sunInt = 0.32 + t * 1.18;
  } else if (progress > 0.74) {
    const t = (progress - 0.74) / 0.26;
    skyColor.lerpColors(new THREE.Color(0xFF6A2E), new THREE.Color(0x2C1A38), t);
    ambientInt = 0.49 - t * 0.39;
    sunInt = 1.28 - t * 1.22;
  }

  state.scene.background = skyColor;
  state.scene.fog.color = skyColor;
  state.ambientLight.intensity = ambientInt;
  state.sunLight.intensity = sunInt;
}

function updateUI() {
  document.getElementById('score').textContent = state.score;
  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  document.getElementById('timer').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}

function startTimer() {
  if (state.timerId !== null) clearInterval(state.timerId);

  state.timerId = setInterval(() => {
    if (!state.gameRunning) return;
    state.timeLeft -= 1;
    updateUI();
    if (state.timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  state.gameRunning = false;
  disposeAllRemainingSeeds();
  document.exitPointerLock();
  document.getElementById('finalScore').textContent = state.score;
  document.getElementById('gameOver').style.display = 'block';
}

function disposeObjectTree(root) {
  if (!root) return;

  const materialRefs = new Map();
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => {
      materialRefs.set(mat.uuid, (materialRefs.get(mat.uuid) || 0) + 1);
    });
  });

  const disposeNode = (node) => {
    for (let i = node.children.length - 1; i >= 0; i--) disposeNode(node.children[i]);

    if (node.isMesh) {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat) => {
          if ((materialRefs.get(mat.uuid) || 0) <= 1) mat.dispose();
        });
      }
    }

    if (node.parent) node.parent.remove(node);
  };

  disposeNode(root);
}

function disposeAllRemainingSeeds() {
  for (let i = state.seeds.length - 1; i >= 0; i--) {
    const seed = state.seeds[i];
    state.scene.remove(seed);
    if (seed.geometry) seed.geometry.dispose();
  }
  state.seeds = [];
}

function restartGame() {
  disposeAllRemainingSeeds();
  disposeObjectTree(state.player);
  disposeObjectTree(state.worldRoot);

  state.worldRoot = null;
  state.worldGroups = null;
  state.wings = [];
  state.wingPoseBlend = 0;
  state.legs = [];
  state.tailFeathers = [];
  state.buildingBoxes = [];
  state.cameraObstacles = [];

  createWorld(state);
  createPigeon(state);
  createSeeds(state);

  startGame();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(state.clock.getDelta(), 0.1);
  if (state.gameRunning) update(delta);
  state.renderer.render(state.scene, state.camera);
}

function onWindowResize() {
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
