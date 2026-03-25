import * as THREE from 'three';
import { CONSTANTS } from './state.js';

export function createPigeon(state) {
  state.player = new THREE.Group();
  state.wings = [];
  state.wingPoseBlend = 0;
  state.legs = [];
  state.tailFeathers = [];
  state.bodyFeathers = [];
  state.neckFeathers = [];

  const bodyMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 24), bodyMat);
  body.scale.set(1.7, 1.2, 2.3);
  body.castShadow = true;
  state.player.add(body);
  state.pigeonBody = body;
  state.originalBodyColor = body.material.color.clone();

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 20), bodyMat);
  head.position.set(0, 1.4, 2.1);
  head.castShadow = true;
  state.player.add(head);
  state.pigeonHead = head;

  const bodyFeatherMat = new THREE.MeshPhongMaterial({ color: 0x8f8f8f });
  const bodyFeatherGeo = new THREE.ConeGeometry(0.1, 0.38, 5, 1);
  const bodyRings = 5;
  const bodyBaseCount = 14;
  const bodyRadiusX = 2.35;
  const bodyRadiusY = 1.55;
  const bodyRadiusZ = 3.1;
  const upAxis = new THREE.Vector3(0, 1, 0);
  for (let ring = 0; ring < bodyRings; ring++) {
    const ringT = ring / (bodyRings - 1);
    const yNorm = -0.72 + ringT * 1.44;
    const y = yNorm * bodyRadiusY;
    const perRing = bodyBaseCount + Math.round((1 - Math.abs(yNorm)) * 6);
    for (let i = 0; i < perRing; i++) {
      const angle = (i / perRing) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
      const feather = new THREE.Mesh(bodyFeatherGeo, bodyFeatherMat);
      feather.castShadow = true;

      feather.position.set(
        Math.cos(angle) * (bodyRadiusX + (Math.random() - 0.5) * 0.12),
        y + (Math.random() - 0.5) * 0.1,
        Math.sin(angle) * (bodyRadiusZ + (Math.random() - 0.5) * 0.14)
      );

      const normal = new THREE.Vector3(
        feather.position.x / (bodyRadiusX * bodyRadiusX),
        feather.position.y / (bodyRadiusY * bodyRadiusY),
        feather.position.z / (bodyRadiusZ * bodyRadiusZ)
      ).normalize();
      feather.quaternion.setFromUnitVectors(upAxis, normal);
      feather.rotateZ((Math.random() - 0.5) * 0.3);

      feather.userData.baseRotX = feather.rotation.x;
      feather.userData.baseRotY = feather.rotation.y;
      feather.userData.baseRotZ = feather.rotation.z;
      feather.userData.flutterPhase = Math.random() * Math.PI * 2;
      feather.userData.flutterSpeed = 7 + Math.random() * 4;

      state.player.add(feather);
      state.bodyFeathers.push(feather);
    }
  }

  const neckFeatherMat = new THREE.MeshPhongMaterial({
    color: 0x4f5f6b,
    specular: 0x7fa2c0,
    shininess: 40
  });
  const neckFeatherGeo = new THREE.ConeGeometry(0.08, 0.34, 6, 1);
  const neckCenter = new THREE.Vector3(0, 1.15, 1.72);
  const neckRadiusX = 0.8;
  const neckRadiusZ = 0.62;
  const neckCount = 16;
  for (let i = 0; i < neckCount; i++) {
    const angle = (i / neckCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const feather = new THREE.Mesh(neckFeatherGeo, neckFeatherMat);
    feather.castShadow = true;
    feather.position.set(
      neckCenter.x + Math.cos(angle) * (neckRadiusX + (Math.random() - 0.5) * 0.06),
      neckCenter.y + (Math.random() - 0.5) * 0.05,
      neckCenter.z + Math.sin(angle) * (neckRadiusZ + (Math.random() - 0.5) * 0.06)
    );

    const neckNormal = new THREE.Vector3(Math.cos(angle), 0.35, Math.sin(angle) * 1.2).normalize();
    feather.quaternion.setFromUnitVectors(upAxis, neckNormal);
    feather.rotateZ((Math.random() - 0.5) * 0.22);

    feather.userData.baseRotX = feather.rotation.x;
    feather.userData.baseRotY = feather.rotation.y;
    feather.userData.baseRotZ = feather.rotation.z;
    feather.userData.flutterPhase = Math.random() * Math.PI * 2;
    feather.userData.flutterSpeed = 9 + Math.random() * 4;

    state.player.add(feather);
    state.neckFeathers.push(feather);
  }

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.3, 4), new THREE.MeshPhongMaterial({ color: 0xffaa22 }));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 1.3, 2.9);
  beak.castShadow = true;
  state.player.add(beak);

  const eyeMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
  [-0.5, 0.5].forEach((x) => {
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), eyeMat);
    white.position.set(x, 1.55, 2.65);
    white.castShadow = true;
    state.player.add(white);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), pupilMat);
    pupil.position.set(x, 1.55, 2.78);
    pupil.castShadow = true;
    state.player.add(pupil);
  });

  const legMat = new THREE.MeshPhongMaterial({ color: 0xff8800 });
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 4.2, 8), legMat);
  leftLeg.position.set(-0.85, -1.6, 0.9);
  leftLeg.rotation.x = 0.6;
  leftLeg.castShadow = true;
  state.player.add(leftLeg);
  state.legs.push(leftLeg);

  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.85;
  state.player.add(rightLeg);
  state.legs.push(rightLeg);

  const wingMat = new THREE.MeshPhongMaterial({ color: 0x777777 });
  const featherMat = new THREE.MeshPhongMaterial({ color: 0x5f5f5f, side: THREE.DoubleSide });

  const createWing = (side) => {
    const wingRoot = new THREE.Group();
    wingRoot.position.set(side * 1.9, 0.8, 0.45);
    state.player.add(wingRoot);

    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.75), wingMat);
    shoulder.position.set(side * 0.65, 0.05, 0.08);
    shoulder.castShadow = true;
    wingRoot.add(shoulder);

    const forearmPivot = new THREE.Group();
    forearmPivot.position.set(side * 1.2, -0.05, -0.03);
    wingRoot.add(forearmPivot);

    const forearm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.48), wingMat);
    forearm.position.set(side * 0.78, -0.04, -0.1);
    forearm.castShadow = true;
    forearmPivot.add(forearm);

    const feathers = [];
    for (let i = 0; i < 5; i++) {
      const feather = new THREE.Mesh(new THREE.PlaneGeometry(1.35 + i * 0.12, 0.28), featherMat);
      feather.position.set(side * (1 + i * 0.23), -0.12 - i * 0.03, -0.3 - i * 0.18);
      feather.rotation.x = 0.1 + i * 0.05;
      feather.rotation.y = side > 0 ? Math.PI : 0;
      feather.rotation.z = side * (0.08 + i * 0.09);
      feather.castShadow = true;
      forearmPivot.add(feather);
      feathers.push(feather);
    }

    state.wings.push({
      root: wingRoot,
      forearm: forearmPivot,
      feathers,
      side,
      flapPhaseOffset: (Math.random() - 0.5) * 0.7,
      flapAmplitudeScale: 0.9 + Math.random() * 0.2,
      microPhase: Math.random() * Math.PI * 2
    });
  };

  createWing(-1);
  createWing(1);

  const tailMat = new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide });
  for (let i = -2; i <= 2; i++) {
    const feather = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.7), tailMat);
    feather.position.set(i * 0.52, -0.35, -1.95);
    feather.rotation.x = 0.78 + i * 0.11;
    feather.rotation.y = i * 0.13;
    feather.castShadow = true;
    state.player.add(feather);
    state.tailFeathers.push(feather);
  }

  state.scene.add(state.player);
}

function hasCollision(state, pos) {
  state.tmpCollisionSize.set(5 * state.player.scale.x, 6 * state.player.scale.y, 6 * state.player.scale.z);
  state.tmpBox.setFromCenterAndSize(pos, state.tmpCollisionSize);
  return state.buildingBoxes.some((b) => state.tmpBox.intersectsBox(b));
}

function handlePoisonEffect(state) {
  const now = state.clock.getElapsedTime();
  if (state.poisonEndTime > now) {
    const intensity = Math.max(0, (state.poisonEndTime - now) / 15);
    const greenShift = 0.4 + 0.6 * (1 - intensity);
    if (state.pigeonBody) state.pigeonBody.material.color.setRGB(greenShift, 1, greenShift);
    if (state.pigeonHead) state.pigeonHead.material.color.setRGB(greenShift, 1, greenShift);
  } else if (state.pigeonBody && state.pigeonHead) {
    state.pigeonBody.material.color.copy(state.originalBodyColor);
    state.pigeonHead.material.color.copy(state.originalBodyColor);
  }
}

function collectSeeds(state, onEat, onScoreChange) {
  for (let i = state.seeds.length - 1; i >= 0; i--) {
    const s = state.seeds[i];
    if (!s.userData.collected && state.player.position.distanceTo(s.position) < 4.5) {
      s.userData.collected = true;
      state.scene.remove(s);
      if (s.geometry) s.geometry.dispose();
      state.seeds.splice(i, 1);
      onEat();

      if (s.userData.type === 'tsar') state.score += Math.floor(Math.random() * 26) + 5;
      else if (s.userData.type === 'toxic') {
        state.score = Math.max(0, state.score - 15);
        state.slowDownEndTime = state.clock.getElapsedTime() + 15;
        state.poisonEndTime = state.clock.getElapsedTime() + 15;
      } else state.score += 1;

      const scaleVal = 0.5 + (2 - 0.5) * (state.score / CONSTANTS.MAX_SCORE);
      state.player.scale.set(scaleVal, scaleVal, scaleVal);
      onScoreChange();
    }
  }
}

export function updatePlayer(state, delta, onFootstep, onEat, onScoreChange) {
  state.isFlying = state.keys.Space;
  state.wingPoseBlend = state.wingPoseBlend ?? 0;
  handlePoisonEffect(state);

  state.player.rotation.y = THREE.MathUtils.lerp(state.player.rotation.y, state.targetYaw, CONSTANTS.BODY_TURN_LERP);

  const forward = state.tmpVecForward.set(0, 0, 1).applyQuaternion(state.player.quaternion);
  forward.y = 0;
  forward.normalize();

  const right = state.tmpVecRight.set(1, 0, 0).applyQuaternion(state.player.quaternion);
  right.y = 0;
  right.normalize();

  const moveDir = state.tmpMoveDir.set(0, 0, 0);
  if (state.keys.KeyW) moveDir.add(forward);
  if (state.keys.KeyS) moveDir.sub(forward);
  if (state.keys.KeyA) moveDir.add(right);
  if (state.keys.KeyD) moveDir.sub(right);

  const speedMultiplier = 2 - (2 - 0.6667) * (state.score / CONSTANTS.MAX_SCORE);
  let speed = state.isFlying ? CONSTANTS.MOVE_SPEED_FLY * speedMultiplier : CONSTANTS.MOVE_SPEED_GROUND * speedMultiplier;
  if (!state.isFlying && (state.keys.ShiftLeft || state.keys.ShiftRight)) speed *= CONSTANTS.SPRINT_MULTIPLIER;
  if (state.slowDownEndTime > state.clock.getElapsedTime()) speed *= 0.5;

  if (moveDir.lengthSq() > 0) state.moveVelocity.lerp(moveDir.normalize().multiplyScalar(speed), 0.26);
  else state.moveVelocity.multiplyScalar(state.isFlying ? CONSTANTS.FRICTION_FLY : CONSTANTS.FRICTION_GROUND);

  const newPos = state.tmpNewPos.copy(state.player.position).addScaledVector(state.moveVelocity, delta);
  if (!hasCollision(state, newPos)) {
    state.player.position.x = newPos.x;
    state.player.position.z = newPos.z;
  } else {
    const nx = state.tmpAxisPos.copy(state.player.position);
    nx.x += state.moveVelocity.x * delta;
    if (!hasCollision(state, nx)) state.player.position.x = nx.x;

    const nz = state.tmpAxisPos.copy(state.player.position);
    nz.z += state.moveVelocity.z * delta;
    if (!hasCollision(state, nz)) state.player.position.z = nz.z;
  }

  if (state.isFlying) {
    state.velocityY = CONSTANTS.FLY_FORCE;
  } else {
    state.velocityY -= CONSTANTS.GRAVITY * delta;
  }

  const elapsed = state.clock.getElapsedTime();
  const targetWingPoseBlend = state.isFlying ? 1 : 0;
  state.wingPoseBlend = THREE.MathUtils.lerp(state.wingPoseBlend, targetWingPoseBlend, Math.min(1, delta * 6));

  const wingRotLerp = Math.min(1, delta * 12);
  state.wings.forEach((wing) => {
    const wingSide = wing.side;
    const openPose = state.wingPoseBlend;
    const microAmp = 0.92 + (wing.flapAmplitudeScale - 0.9);
    const flapPhase = elapsed * 14 * microAmp + wing.flapPhaseOffset;
    const flightFlap = Math.sin(flapPhase) * 0.92 * openPose * wing.flapAmplitudeScale;
    const microMovement = Math.sin(elapsed * 9 + wing.microPhase) * 0.05 * (0.9 + openPose * 0.5);

    const targetRootY = -wingSide * (1.15 + openPose * 1.08);
    const targetRootX = 0.2 + THREE.MathUtils.lerp(0, -0.45 + flightFlap, openPose) + microMovement * 0.25;
    const targetRootZ = wingSide * THREE.MathUtils.lerp(0.45, 0.1, openPose);

    wing.root.rotation.x = THREE.MathUtils.lerp(wing.root.rotation.x, targetRootX, wingRotLerp);
    wing.root.rotation.y = THREE.MathUtils.lerp(wing.root.rotation.y, targetRootY, wingRotLerp);
    wing.root.rotation.z = THREE.MathUtils.lerp(wing.root.rotation.z, targetRootZ, wingRotLerp);

    const targetForearmX = THREE.MathUtils.lerp(0.35, -0.25 + flightFlap * 0.4, openPose) + microMovement * 0.35;
    const targetForearmZ = wingSide * THREE.MathUtils.lerp(0.42, 0.14 + flightFlap * 0.35, openPose);
    wing.forearm.rotation.x = THREE.MathUtils.lerp(wing.forearm.rotation.x, targetForearmX, wingRotLerp);
    wing.forearm.rotation.z = THREE.MathUtils.lerp(wing.forearm.rotation.z, targetForearmZ, wingRotLerp);

    wing.feathers.forEach((feather, i) => {
      const featherSpread = 0.08 + i * 0.09;
      feather.rotation.z = wingSide * (featherSpread + openPose * 0.17 + flightFlap * 0.12);
      feather.rotation.x = 0.1 + i * 0.05 + openPose * 0.06 + microMovement * 0.2;
    });
  });

  const oldY = state.player.position.y;
  state.player.position.y += state.velocityY * delta;
  if (hasCollision(state, state.player.position)) {
    if (state.velocityY < 0) {
      let maxRoof = 0;
      state.buildingBoxes.forEach((b) => {
        state.tmpPlayerXZ.set(state.player.position.x, 0, state.player.position.z);
        state.tmpPlayerXZSize.set(5 * state.player.scale.x, 1000, 6 * state.player.scale.z);
        const playerXZ = state.tmpPlayerXZBox.setFromCenterAndSize(state.tmpPlayerXZ, state.tmpPlayerXZSize);
        if (playerXZ.intersectsBox(b)) maxRoof = Math.max(maxRoof, b.max.y);
      });
      state.player.position.y = maxRoof + CONSTANTS.BASE_PIGEON_HEIGHT * state.player.scale.y;
      state.velocityY = 0;
    } else {
      state.player.position.y = oldY;
      state.velocityY = 0;
    }
  }

  if (state.player.position.y < CONSTANTS.BASE_PIGEON_HEIGHT * state.player.scale.y) {
    state.player.position.y = CONSTANTS.BASE_PIGEON_HEIGHT * state.player.scale.y;
    state.velocityY = 0;
  }

  if (!state.isFlying && moveDir.lengthSq() > 0) {
    const walk = state.clock.getElapsedTime() * 14;
    state.legs[0].rotation.x = Math.sin(walk) * 1.1 + 0.6;
    state.legs[1].rotation.x = Math.sin(walk + Math.PI) * 1.1 + 0.6;
  } else {
    state.legs[0].rotation.x = 0.6;
    state.legs[1].rotation.x = 0.6;
  }

  const currentTime = state.clock.getElapsedTime();
  const isMovingOnGround = !state.isFlying && moveDir.lengthSq() > 0.1;
  if (isMovingOnGround && currentTime - state.lastFootstepTime > 0.28) {
    onFootstep();
    state.lastFootstepTime = currentTime;
  }

  const tailFlap = state.isFlying ? Math.sin(state.clock.getElapsedTime() * 18) * 0.38 : 0;
  const tailWalk = (!state.isFlying && moveDir.lengthSq() > 0) ? Math.sin(state.clock.getElapsedTime() * 22) * 0.22 : 0;
  state.tailFeathers.forEach((f, i) => {
    f.rotation.z = tailFlap + tailWalk * ((i % 2) ? -1 : 1) * 0.7;
  });

  const moveIntensity = THREE.MathUtils.clamp(state.moveVelocity.length() / 12, 0, 1);
  const flapIntensity = state.isFlying ? (0.55 + 0.45 * Math.abs(Math.sin(elapsed * 14))) : 0;
  const featherOscillation = 0.008 + moveIntensity * 0.016 + flapIntensity * 0.018;
  const neckOscillation = featherOscillation * 1.15;
  const neckLift = state.isFlying ? Math.sin(elapsed * 18) * 0.01 : 0;

  state.bodyFeathers.forEach((feather) => {
    const flutter = Math.sin(elapsed * feather.userData.flutterSpeed + feather.userData.flutterPhase);
    feather.rotation.x = feather.userData.baseRotX + flutter * featherOscillation;
    feather.rotation.y = feather.userData.baseRotY + flutter * featherOscillation * 0.6;
    feather.rotation.z = feather.userData.baseRotZ + flutter * featherOscillation * 0.8;
  });

  state.neckFeathers.forEach((feather) => {
    const flutter = Math.sin(elapsed * feather.userData.flutterSpeed + feather.userData.flutterPhase);
    feather.rotation.x = feather.userData.baseRotX + flutter * neckOscillation + neckLift;
    feather.rotation.y = feather.userData.baseRotY + flutter * neckOscillation * 0.7;
    feather.rotation.z = feather.userData.baseRotZ + flutter * neckOscillation * 0.9;
  });

  state.seeds.forEach((s) => {
    if (!s.userData.collected) {
      s.rotation.y += delta * 1.85;
      s.rotation.x = Math.sin(state.clock.getElapsedTime() * 2 + s.position.x) * 0.15;
      s.position.y = s.userData.initialY + Math.sin(state.clock.getElapsedTime() * 3 + s.position.x) * 0.12;
    }
  });

  collectSeeds(state, onEat, onScoreChange);
}
