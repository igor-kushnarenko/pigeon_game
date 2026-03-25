import * as THREE from 'three';
import { CONSTANTS } from './state.js';

export function initWorldGroups(state) {
  state.worldRoot = new THREE.Group();
  state.worldRoot.name = 'worldRoot';
  state.worldGroups = {
    roads: new THREE.Group(),
    mountains: new THREE.Group(),
    forest: new THREE.Group(),
    city: new THREE.Group(),
    buildings: new THREE.Group()
  };

  Object.entries(state.worldGroups).forEach(([name, group]) => {
    group.name = name;
    state.worldRoot.add(group);
  });

  state.scene.add(state.worldRoot);
}

export function createWorld(state) {
  initWorldGroups(state);
  createRoads(state);
  createMountains(state);
  createForest(state);
  createBuildings(state);
  createCityVegetation(state);
}

function createRoads(state) {
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f, flatShading: true });

  for (let x = -340; x <= 340; x += 96) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 920, 1, 48), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.2, 0);
    road.receiveShadow = true;
    state.worldGroups.roads.add(road);
  }

  for (let z = -340; z <= 340; z += 96) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(920, 16, 48, 1), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.2, z);
    road.receiveShadow = true;
    state.worldGroups.roads.add(road);
  }
}

function isOnRoad(x, z) {
  const roadX = Math.abs(x % 96);
  const roadZ = Math.abs(z % 96);
  return roadX < 14 || roadZ < 14;
}

function createMountains(state) {
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x555566 });
  const numMountains = 16;

  for (let i = 0; i < numMountains; i++) {
    const angle = (i / numMountains) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist = 920 + Math.random() * 260;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    const radius = 85 + Math.random() * 105;
    const height = 165 + Math.random() * 195;

    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 5 + Math.floor(Math.random() * 4)),
      rockMat
    );

    mountain.position.set(x, height * 0.5, z);
    mountain.rotation.y = Math.random() * Math.PI * 2;
    mountain.castShadow = true;
    mountain.receiveShadow = true;
    state.worldGroups.mountains.add(mountain);
  }
}

function createForest(state) {
  const numTrees = 320;
  const numBushes = 480;

  for (let i = 0; i < numTrees; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = CONSTANTS.FOREST_INNER_RADIUS + Math.random() * (CONSTANTS.FOREST_OUTER_RADIUS - CONSTANTS.FOREST_INNER_RADIUS);
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    if (isOnRoad(x, z)) continue;
    createTree(state, x, z, 0.7 + Math.random() * 1.4, true);
  }

  for (let i = 0; i < numBushes; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = CONSTANTS.FOREST_INNER_RADIUS + Math.random() * (CONSTANTS.FOREST_OUTER_RADIUS - CONSTANTS.FOREST_INNER_RADIUS) * 0.95;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    if (isOnRoad(x, z)) continue;
    createBush(state, x, z, 0.6 + Math.random() * 1.1);
  }
}

function createCityVegetation(state) {
  for (let i = 0; i < 22; i++) {
    const x = (Math.random() - 0.5) * (CONSTANTS.CITY_SIZE * 1.75);
    const z = (Math.random() - 0.5) * (CONSTANTS.CITY_SIZE * 1.75);
    if (isOnRoad(x, z)) continue;
    createTree(state, x, z, 0.55 + Math.random() * 0.45, false);
  }

  for (let i = 0; i < 35; i++) {
    const x = (Math.random() - 0.5) * (CONSTANTS.CITY_SIZE * 1.8);
    const z = (Math.random() - 0.5) * (CONSTANTS.CITY_SIZE * 1.8);
    if (isOnRoad(x, z)) continue;
    createCityBush(state, x, z, 0.7 + Math.random() * 0.6);
  }
}

function createCityBush(state, x, z, scale = 1) {
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(6.2 * scale, 7, 7),
    new THREE.MeshLambertMaterial({ color: 0x1a5c1a })
  );
  bush.position.set(x, 5 * scale, z);
  state.worldGroups.city.add(bush);
}

function createTree(state, x, z, scale = 1, isForest = false) {
  const trunkHeight = 17 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1 * scale, 3.7 * scale, trunkHeight, 6),
    new THREE.MeshLambertMaterial({ color: 0x8B5F2B })
  );
  trunk.position.set(x, trunkHeight / 2, z);

  const targetGroup = isForest ? state.worldGroups.forest : state.worldGroups.city;
  targetGroup.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(14.5 * scale, 29 * scale, 7),
    new THREE.MeshLambertMaterial({ color: 0x0f6b22 })
  );
  leaves.position.set(x, trunkHeight + 8 * scale, z);
  targetGroup.add(leaves);
}

function createBush(state, x, z, scale = 1) {
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(6.2 * scale, 7, 7),
    new THREE.MeshLambertMaterial({ color: 0x1a5c1a })
  );
  bush.position.set(x, 5 * scale, z);
  state.worldGroups.forest.add(bush);
}

function createBuildings(state) {
  state.buildingBoxes = [];
  state.cameraObstacles = [];
  const step = 60;

  for (let x = -340; x <= 340; x += step) {
    for (let z = -340; z <= 340; z += step) {
      if (Math.random() < 0.15) continue;
      if (Math.random() < 0.30) createNYSkyscraper(state, x, z);
      else createNormalBuilding(state, x, z);
    }
  }
}

function createNormalBuilding(state, x, z) {
  const h = 25 + Math.random() * 65;
  const mat = new THREE.MeshLambertMaterial({ color: 0x4a4a5a + Math.random() * 0x222222 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(24, h, 24), mat);
  b.position.set(x, h / 2, z);
  b.castShadow = true;
  b.receiveShadow = true;
  state.worldGroups.buildings.add(b);
  state.buildingBoxes.push(new THREE.Box3().setFromObject(b));
  state.cameraObstacles.push(b);
}

function createNYSkyscraper(state, x, z) {
  const h = 155 + Math.random() * 95;
  const colors = [0x4A7EFF, 0x9C4EFF, 0xFF4E7A, 0x4EFFB5, 0xFFDB4E, 0xFF7A4E, 0x6B8CFF];
  const mat = new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
  const b = new THREE.Mesh(new THREE.BoxGeometry(34, h, 34), mat);
  b.position.set(x, h / 2, z);
  b.castShadow = true;
  b.receiveShadow = true;
  state.worldGroups.buildings.add(b);
  state.buildingBoxes.push(new THREE.Box3().setFromObject(b));
  state.cameraObstacles.push(b);
}

export function createStars(state) {
  const vertices = [];
  for (let i = 0; i < 1800; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(2200),
      THREE.MathUtils.randFloatSpread(1800) + 400,
      THREE.MathUtils.randFloatSpread(2200)
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0xdddddd, size: 2.4, transparent: true, opacity: 0.85 });
  state.stars = new THREE.Points(geometry, material);
  state.scene.add(state.stars);
}

export function createSeeds(state) {
  state.seeds = [];
  const spawnMinDistance = 8.5;
  const gridCellSize = 10;
  const seedSpatialIndex = new Map();

  const totalRegular = Math.floor(Math.random() * 301) + 650;
  const numTsar = Math.floor(Math.random() * 5) + 3;
  const numToxic = Math.floor(Math.random() * 6) + 3;

  if (!state.seedMaterial) {
    state.seedMaterial = new THREE.MeshPhongMaterial({ color: 0xffee33 });
  }

  function createSeedMesh(type) {
    let size = 0.48;
    if (type === 'tsar') size *= 3;
    return new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), state.seedMaterial);
  }

  function placeSeed(seed, type) {
    let attempts = 0;
    let x;
    let z;
    let y = 2;

    do {
      if (Math.random() < 0.70) {
        x = (Math.random() - 0.5) * 720;
        z = (Math.random() - 0.5) * 720;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const dist = 420 + Math.random() * 520;
        x = Math.cos(angle) * dist;
        z = Math.sin(angle) * dist;
      }
      attempts += 1;
    } while (isTooCloseToOtherSeeds(x, z, seedSpatialIndex, gridCellSize, spawnMinDistance) && attempts < 40);

    if (Math.random() < 0.28 && state.buildingBoxes.length) {
      const b = state.buildingBoxes[Math.floor(Math.random() * state.buildingBoxes.length)];
      x = (b.min.x + b.max.x) * 0.5 + (Math.random() - 0.5) * 18;
      z = (b.min.z + b.max.z) * 0.5 + (Math.random() - 0.5) * 18;
      y = b.max.y + 3;
    }

    seed.position.set(x, y, z);
    seed.userData = { collected: false, initialY: y, type };
    state.scene.add(seed);
    state.seeds.push(seed);
    addSeedToSpatialIndex(seed, seedSpatialIndex, gridCellSize);
  }

  for (let i = 0; i < totalRegular; i++) placeSeed(createSeedMesh('regular'), 'regular');
  for (let i = 0; i < numTsar; i++) placeSeed(createSeedMesh('tsar'), 'tsar');
  for (let i = 0; i < numToxic; i++) placeSeed(createSeedMesh('toxic'), 'toxic');
}

function getSeedCellKey(x, z, cellSize) {
  return `${Math.floor(x / cellSize)},${Math.floor(z / cellSize)}`;
}

function addSeedToSpatialIndex(seed, spatialIndex, cellSize) {
  const key = getSeedCellKey(seed.position.x, seed.position.z, cellSize);
  if (!spatialIndex.has(key)) spatialIndex.set(key, []);
  spatialIndex.get(key).push(seed);
}

function isTooCloseToOtherSeeds(x, z, spatialIndex, cellSize, minDistance) {
  const baseCellX = Math.floor(x / cellSize);
  const baseCellZ = Math.floor(z / cellSize);

  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const neighborSeeds = spatialIndex.get(`${baseCellX + dx},${baseCellZ + dz}`);
      if (!neighborSeeds) continue;
      for (const s of neighborSeeds) {
        if (Math.hypot(s.position.x - x, s.position.z - z) < minDistance) return true;
      }
    }
  }

  return false;
}
