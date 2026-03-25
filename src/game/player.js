import * as THREE from 'three';
import { CONSTANTS } from './state.js';

export function createPigeon(state) {
  state.player = new THREE.Group();
  state.wings = [];
  state.legs = [];
  state.tailFeathers = [];

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

  const wingMat = new THREE.MeshPhongMaterial({ color: 0x777777, side: THREE.DoubleSide });
  const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.1), wingMat);
  leftWing.position.set(-2.2, 0.8, 0.4);
  leftWing.rotation.y = Math.PI / 2;
  leftWing.castShadow = true;
  state.player.add(leftWing);
  state.wings.push(leftWing);

  const rightWing = leftWing.clone();
  rightWing.position.x = 2.2;
  rightWing.rotation.y = -Math.PI / 2;
  state.player.add(rightWing);
  state.wings.push(rightWing);

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
    const flap = Math.sin(state.clock.getElapsedTime() * 15) * 0.85;
    state.wings[0].rotation.z = flap;
    state.wings[1].rotation.z = -flap;
  } else {
    state.velocityY -= CONSTANTS.GRAVITY * delta;
    state.wings[0].rotation.z = 0.4;
    state.wings[1].rotation.z = -0.4;
  }

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

  state.seeds.forEach((s) => {
    if (!s.userData.collected) {
      s.rotation.y += delta * 1.85;
      s.rotation.x = Math.sin(state.clock.getElapsedTime() * 2 + s.position.x) * 0.15;
      s.position.y = s.userData.initialY + Math.sin(state.clock.getElapsedTime() * 3 + s.position.x) * 0.12;
    }
  });

  collectSeeds(state, onEat, onScoreChange);
}
