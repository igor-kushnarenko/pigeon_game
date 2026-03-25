import * as THREE from 'three';
import { CONSTANTS } from './state.js';

export function onMouseMove(state, event) {
  if (!state.isPointerLocked || !state.gameRunning) return;

  if (state.isOrbiting) {
    state.orbitYaw -= event.movementX * CONSTANTS.ORBIT_SENS;
    state.orbitPitch -= event.movementY * CONSTANTS.ORBIT_SENS;
    state.orbitPitch = THREE.MathUtils.clamp(state.orbitPitch, CONSTANTS.ORBIT_PITCH_MIN, CONSTANTS.ORBIT_PITCH_MAX);
    return;
  }

  state.targetYaw -= event.movementX * state.mouseSensitivity;
  state.cameraPitch -= event.movementY * CONSTANTS.MOUSE_SENS_PITCH;
  state.cameraPitch = THREE.MathUtils.clamp(state.cameraPitch, CONSTANTS.CAMERA_PITCH_MIN, CONSTANTS.CAMERA_PITCH_MAX);
}

export function updateCamera(state) {
  const lookAtPos = state.player.position.clone();
  lookAtPos.y += 4.0 * state.player.scale.y;

  const yaw = state.player.rotation.y;
  const offset = new THREE.Vector3(0, CONSTANTS.CAMERA_HEIGHT, CONSTANTS.CAMERA_DISTANCE);
  offset.applyEuler(new THREE.Euler(state.cameraPitch, yaw, 0, 'YXZ'));

  const desiredPos = state.player.position.clone().add(offset);
  state.camera.position.lerp(desiredPos, CONSTANTS.CAMERA_LERP);
  state.camera.lookAt(lookAtPos);
}
