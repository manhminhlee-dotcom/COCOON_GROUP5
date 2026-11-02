import * as THREE from 'three';
import { CONFIG } from '../config';

export interface LightingRig {
  group: THREE.Group;
  sunLight: THREE.DirectionalLight;
  shelfPointLight: THREE.PointLight;
  floorPointLight: THREE.PointLight;
  candlePointLight: THREE.PointLight;
  update: (time: number, delta: number) => void;
}

/**
 * Creates the photorealistic studio lighting rig and atmospheric dust particle system.
 */
export function setupLightingAndAtmosphere(scene: THREE.Scene): LightingRig {
  const group = new THREE.Group();
  group.name = 'lighting_and_atmosphere';

  const { lighting, atmosphere } = CONFIG;

  // 1. Warm Golden Hour Sunlight (3200K) raking from the right window
  const sunLight = new THREE.DirectionalLight(lighting.sun.color, lighting.sun.intensity);
  sunLight.position.set(...lighting.sun.position);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = lighting.sun.shadowMapSize;
  sunLight.shadow.mapSize.height = lighting.sun.shadowMapSize;
  sunLight.shadow.bias = lighting.sun.shadowBias;
  sunLight.shadow.normalBias = lighting.sun.shadowNormalBias;

  // Tight shadow camera frustum covering the bookshelf and floor
  const d = 3.2;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 12.0;
  sunLight.target.position.set(0, 1.25, 0);
  group.add(sunLight);
  group.add(sunLight.target);

  // 2. Window Sky Fill (7000K cool soft fill from the sky)
  const skyFill = new THREE.DirectionalLight(lighting.skyFill.color, lighting.skyFill.intensity);
  skyFill.position.set(...lighting.skyFill.position);
  group.add(skyFill);

  // 3. Ambient Room Bounce
  const ambientLight = new THREE.AmbientLight(lighting.ambient.color, lighting.ambient.intensity);
  group.add(ambientLight);

  // 4. Practical Lights:
  // Small Shelf Lamp
  const shelfPointLight = new THREE.PointLight(
    lighting.practicals.shelfLamp.color,
    lighting.practicals.shelfLamp.intensity,
    lighting.practicals.shelfLamp.distance,
    1.6
  );
  shelfPointLight.position.set(...lighting.practicals.shelfLamp.pos);
  group.add(shelfPointLight);

  // Floor Lamp
  const floorPointLight = new THREE.PointLight(
    lighting.practicals.floorLamp.color,
    lighting.practicals.floorLamp.intensity,
    lighting.practicals.floorLamp.distance,
    1.8
  );
  floorPointLight.position.set(...lighting.practicals.floorLamp.pos);
  group.add(floorPointLight);

  // Candle light with flame flicker
  const candlePointLight = new THREE.PointLight(
    lighting.practicals.candle.color,
    lighting.practicals.candle.intensity,
    lighting.practicals.candle.distance,
    2.0
  );
  candlePointLight.position.set(...lighting.practicals.candle.pos);
  group.add(candlePointLight);

  // 5. Volumetric Light Shafts (Sunbeams raking through window)
  const beamGeo = new THREE.CylinderGeometry(0.3, 1.8, 4.8, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffe2b8,
    transparent: true,
    opacity: 0.032,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sunBeam = new THREE.Mesh(beamGeo, beamMat);
  sunBeam.position.set(1.9, 1.7, 1.8);
  sunBeam.rotation.z = Math.PI / 4.5;
  sunBeam.rotation.y = -Math.PI / 5;
  group.add(sunBeam);

  // 6. Floating Dust Motes (Sunlit particles drifting with Brownian motion & updraft)
  const count = atmosphere.dustMotesCount;
  const dustGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Distribute around reading area and sunlight shaft
    positions[i * 3 + 0] = (Math.random() - 0.5) * 4.0 + 0.5;
    positions[i * 3 + 1] = Math.random() * 2.8 + 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5 + 1.2;

    velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.03;
    velocities[i * 3 + 1] = atmosphere.dustThermalUpdraft + (Math.random() - 0.5) * 0.01;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;

    sizes[i] = Math.random() * 3.0 + 1.5;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Point material for dust motes
  const dustMat = new THREE.PointsMaterial({
    color: 0xffe9c2,
    size: 0.016,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const dustPoints = new THREE.Points(dustGeo, dustMat);
  group.add(dustPoints);

  scene.add(group);

  // Per-frame animation update for candle flicker and dust drifting
  const update = (time: number, delta: number) => {
    // Candle flame flicker
    const { flickerFreq, flickerAmp } = lighting.practicals.candle;
    const noise =
      Math.sin(time * flickerFreq) * 0.6 +
      Math.sin(time * flickerFreq * 2.3) * 0.25 +
      Math.sin(time * 19.0) * 0.15;
    candlePointLight.intensity =
      lighting.practicals.candle.intensity * (1.0 + noise * flickerAmp);

    // Dust particles drift
    const posAttr = dustGeo.attributes.position as THREE.BufferAttribute;
    const p = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      p[idx + 0] += velocities[idx + 0] * delta;
      p[idx + 1] += velocities[idx + 1] * delta;
      p[idx + 2] += velocities[idx + 2] * delta;

      // Wrap around bounds
      if (p[idx + 1] > 3.0) {
        p[idx + 1] = 0.2;
        p[idx + 0] = (Math.random() - 0.5) * 4.0 + 0.5;
        p[idx + 2] = (Math.random() - 0.5) * 3.5 + 1.2;
      }
    }
    posAttr.needsUpdate = true;
  };

  return {
    group,
    sunLight,
    shelfPointLight,
    floorPointLight,
    candlePointLight,
    update,
  };
}
