# Three.js migration notes (r134 → r161)

## Scope of migration
- Switched from global CDN script (`three.min.js`) to ES modules with import map and package build (`three.module.js`).
- Split monolithic game script into modules:
  - `src/game/state.js`
  - `src/game/world.js`
  - `src/game/player.js`
  - `src/game/camera.js`
  - `src/game/audio.js`
  - `src/main.js`

## API compatibility checks

### Materials
- `MeshLambertMaterial`, `MeshPhongMaterial`, `MeshBasicMaterial`, `PointsMaterial` are still available and API-compatible for current usage.
- No legacy `THREE.Geometry` or removed material properties were used.

### Geometries
- `PlaneGeometry`, `SphereGeometry`, `ConeGeometry`, `CylinderGeometry`, `BoxGeometry`, `IcosahedronGeometry`, `BufferGeometry`, `Float32BufferAttribute` are all valid in r161.
- Existing constructor signatures used in the project are compatible.

### Shadows / renderer
- `renderer.shadowMap.enabled` and `renderer.shadowMap.type = THREE.PCFSoftShadowMap` remain valid.
- Added `renderer.outputColorSpace = THREE.SRGBColorSpace` to align with modern Three.js color management expectations.

### Fog / background
- `scene.fog = new THREE.Fog(...)` remains valid.
- `scene.fog.color = skyColor` and `scene.background = skyColor` usage is compatible.

## Outcome
- The project is migrated to ES module architecture and package-style Three.js loading.
- No breaking API changes were required beyond modern color-space configuration in renderer setup.
