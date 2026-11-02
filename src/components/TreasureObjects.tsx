import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { CHEST_CONFIG, KEY_CONFIG, TREASURE_CONFIG } from '../config/treasure';

const BRASS = KEY_CONFIG.brassColor;
const HIGHLIGHT = KEY_CONFIG.highlightColor;
const DARK_BRASS = KEY_CONFIG.darkBrassColor;

function makeKeyRoughnessTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  // A restrained, non-periodic roughness field breaks up the broad studio
  // reflections without painting scratches into the brass color.
  context.fillStyle = 'rgb(78,78,78)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 0x6d2b79f5;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let index = 0; index < 460; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 2 + random() * 15;
    context.strokeStyle = random() > 0.48 ? 'rgba(220,220,220,0.18)' : 'rgba(25,25,25,0.16)';
    context.lineWidth = 0.35 + random() * 0.65;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length, y + (random() - 0.5) * 1.2);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function makeQuatrefoilGeometry() {
  const centerX = -0.29;
  const centerY = 0.025;
  const shape = new THREE.Shape();
  const steps = 128;
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const radius = 0.157 + 0.055 * Math.cos(angle * 4);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  for (const [offsetX, offsetY, radiusX, radiusY] of [
    [0, 0, 0.072, 0.072],
    [0, 0.12, 0.047, 0.045],
    [0.12, 0, 0.047, 0.045],
    [0, -0.12, 0.047, 0.045],
    [-0.12, 0, 0.047, 0.045],
  ]) {
    const opening = new THREE.Path();
    opening.absellipse(centerX + offsetX, centerY + offsetY, radiusX, radiusY, 0, Math.PI * 2, false, 0);
    shape.holes.push(opening);
  }
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.038,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.009,
    bevelThickness: 0.006,
    curveSegments: 24,
  });
}

function makeKeyScrolls() {
  const center = new THREE.Vector3(-0.29, 0.025, 0);
  const base = [
    [-0.096, 0.045], [-0.15, 0.092], [-0.15, 0.162], [-0.094, 0.198],
    [-0.042, 0.171], [-0.047, 0.128], [-0.078, 0.125], [-0.088, 0.145], [-0.067, 0.157],
  ];
  return Array.from({ length: 4 }, (_, index) => {
    const angle = index * Math.PI / 2;
    const points = base.map(([x, y]) => {
      const dx = x * Math.cos(angle) - y * Math.sin(angle);
      const dy = x * Math.sin(angle) + y * Math.cos(angle);
      return new THREE.Vector3(center.x + dx, center.y + dy, 0.052);
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35), 42, 0.008, 8, false);
  });
}

function makeDiamondGeometry(size: number, depth: number) {
  const diamond = new THREE.Shape();
  diamond.moveTo(0, size);
  diamond.lineTo(size * 0.78, 0);
  diamond.lineTo(0, -size);
  diamond.lineTo(-size * 0.78, 0);
  diamond.closePath();
  return new THREE.ExtrudeGeometry(diamond, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.006,
    bevelThickness: 0.004,
    curveSegments: 12,
  });
}

export function TreasureKeyModel() {
  const quatrefoil = useMemo(makeQuatrefoilGeometry, []);
  const scrolls = useMemo(makeKeyScrolls, []);
  const bossBacking = useMemo(() => makeDiamondGeometry(0.091, 0.014), []);
  const bossFace = useMemo(() => makeDiamondGeometry(0.073, 0.018), []);
  const bitGeometry = useMemo(() => {
    const bit = new THREE.Shape();
    bit.moveTo(0.265, 0.05);
    bit.lineTo(0.355, 0.05);
    bit.lineTo(0.355, -0.018);
    bit.lineTo(0.38, -0.018);
    bit.lineTo(0.38, -0.064);
    bit.lineTo(0.337, -0.064);
    bit.lineTo(0.337, -0.045);
    bit.lineTo(0.303, -0.045);
    bit.lineTo(0.303, -0.092);
    bit.lineTo(0.258, -0.092);
    bit.lineTo(0.258, -0.018);
    bit.lineTo(0.265, -0.018);
    bit.closePath();
    return new THREE.ExtrudeGeometry(bit, {
      depth: 0.045,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.004,
      bevelThickness: 0.003,
      curveSegments: 8,
    });
  }, []);
  const roughnessTexture = useMemo(makeKeyRoughnessTexture, []);
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: BRASS,
    metalness: 0.86,
    roughness: 0.2,
    roughnessMap: roughnessTexture ?? undefined,
    clearcoat: 0.8,
    clearcoatRoughness: 0.18,
  }), [roughnessTexture]);
  const brightBrass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: HIGHLIGHT,
    metalness: 0.94,
    roughness: 0.14,
    roughnessMap: roughnessTexture ?? undefined,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  }), [roughnessTexture]);
  const darkBrass = useMemo(() => new THREE.MeshStandardMaterial({
    color: DARK_BRASS,
    metalness: 0.82,
    roughness: 0.35,
    roughnessMap: roughnessTexture ?? undefined,
  }), [roughnessTexture]);

  useEffect(() => () => {
    quatrefoil.dispose();
    scrolls.forEach((geometry) => geometry.dispose());
    bossBacking.dispose();
    bossFace.dispose();
    bitGeometry.dispose();
    roughnessTexture?.dispose();
    brass.dispose();
    brightBrass.dispose();
    darkBrass.dispose();
  }, [quatrefoil, scrolls, bossBacking, bossFace, bitGeometry, roughnessTexture, brass, brightBrass, darkBrass]);

  return (
    <group rotation={[0, 0, 0.08]}>
      <mesh geometry={quatrefoil} material={brass} castShadow receiveShadow />
      {scrolls.map((geometry, index) => (
        <React.Fragment key={index}>
          <mesh geometry={geometry} position={[0, 0, -0.006]} material={darkBrass} castShadow />
          <mesh geometry={geometry} position={[0, 0, 0.002]} material={brightBrass} castShadow />
        </React.Fragment>
      ))}
      <mesh geometry={bossBacking} position={[-0.29, 0.025, 0.044]} material={darkBrass} castShadow />
      <mesh geometry={bossFace} position={[-0.29, 0.025, 0.061]} material={brightBrass} castShadow />
      <mesh position={[-0.29, 0.025, 0.084]} castShadow>
        <sphereGeometry args={[0.008, 16, 10]} />
        <primitive object={darkBrass} attach="material" />
      </mesh>

      {/* Turned profile keeps the shaft continuous through both collar joints. */}
      <mesh position={[-0.084, 0.025, 0.022]} rotation={[0, 0, -Math.PI / 2]} material={brass} castShadow receiveShadow>
        <latheGeometry args={[
          [
            new THREE.Vector2(0, 0), new THREE.Vector2(0.016, 0), new THREE.Vector2(0.022, 0.012),
            new THREE.Vector2(0.019, 0.025), new THREE.Vector2(0.017, 0.047), new THREE.Vector2(0.018, 0.067),
            new THREE.Vector2(0.018, 0.29), new THREE.Vector2(0.023, 0.302), new THREE.Vector2(0.019, 0.314),
            new THREE.Vector2(0.017, 0.333), new THREE.Vector2(0.017, 0.37), new THREE.Vector2(0.021, 0.383),
            new THREE.Vector2(0.018, 0.397), new THREE.Vector2(0.018, 0.425), new THREE.Vector2(0.014, 0.435),
            new THREE.Vector2(0, 0.435),
          ],
          36,
        ]} />
      </mesh>
      {[[-0.042, 0.021], [-0.027, 0.019], [0.018, 0.022], [0.245, 0.02], [0.258, 0.02], [0.273, 0.019]].map(([x, radius], index) => (
        <mesh key={`${x}:${index}`} position={[x, 0.025, 0.022]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[radius, index === 1 || index === 4 ? 0.0022 : 0.0032, 8, 32]} />
          <primitive object={index === 1 || index === 4 ? darkBrass : brightBrass} attach="material" />
        </mesh>
      ))}

      <mesh geometry={bitGeometry} position={[0, 0, 0.001]} material={brass} castShadow receiveShadow />
      <mesh position={[0.29, -0.055, 0.048]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.018, 0.012, 0.002]} />
        <primitive object={darkBrass} attach="material" />
      </mesh>
    </group>
  );
}

function makeProceduralWoodMaps() {
  const width = 1024;
  const height = 512;

  // 1. Diffuse / Color Map Canvas
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d');

  // 2. Bump / Height Map Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d');

  if (!ctx || !bumpCtx) return { colorTexture: null, bumpTexture: null };

  // Base rich mahogany / dark aged walnut background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#5C2713');
  grad.addColorStop(0.3, '#6A3018');
  grad.addColorStop(0.7, '#4E200E');
  grad.addColorStop(1, '#3A1509');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, width, height);

  // Distinct horizontal wood plank joints with deep bevels
  const plankHeights = [0, 128, 256, 384, height];
  for (let p = 0; p < plankHeights.length - 1; p++) {
    const y0 = plankHeights[p];
    const y1 = plankHeights[p + 1];
    // subtle plank-to-plank tonal variation
    const plankTone = (p % 2 === 0 ? 'rgba(255, 180, 110, 0.05)' : 'rgba(15, 6, 3, 0.08)');
    ctx.fillStyle = plankTone;
    ctx.fillRect(0, y0, width, y1 - y0);

    // Plank seam groove
    ctx.fillStyle = 'rgba(18, 6, 2, 0.85)';
    ctx.fillRect(0, y1 - 2, width, 4);

    // Plank seam bevel highlight
    ctx.fillStyle = 'rgba(235, 175, 115, 0.22)';
    ctx.fillRect(0, y1 + 2, width, 2);

    // Bump seam groove
    bumpCtx.fillStyle = '#222222';
    bumpCtx.fillRect(0, y1 - 2, width, 4);
    bumpCtx.fillStyle = '#C0C0C0';
    bumpCtx.fillRect(0, y1 + 2, width, 2);
  }

  // Pseudo-random deterministic generator for consistent grain
  let seed = 0x48a51c9d;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  // 180+ fine longitudinal growth grain fibers
  for (let i = 0; i < 220; i++) {
    const baseY = (i / 220) * height;
    const amp1 = 3 + random() * 8;
    const amp2 = 2 + random() * 5;
    const freq1 = 0.005 + random() * 0.008;
    const freq2 = 0.012 + random() * 0.015;
    const isLightGrain = i % 3 === 0;

    ctx.strokeStyle = isLightGrain
      ? `rgba(235, 168, 102, ${0.12 + random() * 0.18})`
      : `rgba(24, 8, 3, ${0.18 + random() * 0.22})`;
    ctx.lineWidth = 0.8 + random() * 1.6;
    ctx.beginPath();

    bumpCtx.strokeStyle = isLightGrain ? 'rgba(200, 200, 200, 0.18)' : 'rgba(50, 50, 50, 0.22)';
    bumpCtx.lineWidth = ctx.lineWidth;
    bumpCtx.beginPath();

    for (let x = 0; x <= width; x += 16) {
      const dy = Math.sin(x * freq1) * amp1 + Math.cos(x * freq2) * amp2;
      const y = baseY + dy;
      if (x === 0) {
        ctx.moveTo(x, y);
        bumpCtx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        bumpCtx.lineTo(x, y);
      }
    }
    ctx.stroke();
    bumpCtx.stroke();
  }

  // Realistic elliptical knots with concentric annual growth rings
  const knots = [
    { x: 195, y: 72, rx: 32, ry: 14 },
    { x: 740, y: 195, rx: 28, ry: 12 },
    { x: 420, y: 345, rx: 36, ry: 15 },
    { x: 890, y: 440, rx: 24, ry: 10 },
  ];

  knots.forEach(({ x, y, rx, ry }) => {
    // Knot dark core
    ctx.fillStyle = 'rgba(20, 6, 2, 0.72)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 0.45, ry * 0.45, 0.06, 0, Math.PI * 2);
    ctx.fill();

    bumpCtx.fillStyle = '#181818';
    bumpCtx.beginPath();
    bumpCtx.ellipse(x, y, rx * 0.45, ry * 0.45, 0.06, 0, Math.PI * 2);
    bumpCtx.fill();

    // Concentric growth rings
    for (let ring = 1; ring <= 6; ring++) {
      const scale = 0.45 + ring * 0.25;
      ctx.strokeStyle = ring % 2 === 0 ? 'rgba(235, 168, 102, 0.25)' : 'rgba(24, 7, 2, 0.38)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y, rx * scale, ry * scale, 0.06, 0, Math.PI * 2);
      ctx.stroke();

      bumpCtx.strokeStyle = ring % 2 === 0 ? 'rgba(190, 190, 190, 0.22)' : 'rgba(60, 60, 60, 0.28)';
      bumpCtx.lineWidth = 1.2;
      bumpCtx.beginPath();
      bumpCtx.ellipse(x, y, rx * scale, ry * scale, 0.06, 0, Math.PI * 2);
      bumpCtx.stroke();
    }
  });

  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
  colorTexture.repeat.set(1.4, 1);
  colorTexture.anisotropy = 8;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(1.4, 1);
  bumpTexture.anisotropy = 8;

  return { colorTexture, bumpTexture };
}

function RivetInstances({ positions, radius = 0.013 }: { positions: [number, number, number][]; radius?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const helper = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 14, 10), [radius]);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: HIGHLIGHT,
        metalness: 0.88,
        roughness: 0.18,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
      }),
    []
  );
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    positions.forEach((position, index) => {
      helper.position.set(...position);
      helper.scale.setScalar(1);
      helper.updateMatrix();
      meshRef.current!.setMatrixAt(index, helper.matrix);
    });
    meshRef.current.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [helper, positions]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <instancedMesh ref={meshRef} args={[geometry, material, positions.length]} castShadow receiveShadow />;
}

export function TreasureChestModel({
  lidRef,
  glowRef,
  hovered,
  opened,
  onHover,
}: {
  lidRef: React.RefObject<THREE.Group | null>;
  glowRef: React.RefObject<THREE.PointLight | null>;
  hovered: boolean;
  opened: boolean;
  onHover: (value: boolean) => void;
}) {
  const { colorTexture, bumpTexture } = useMemo(makeProceduralWoodMaps, []);
  const wood = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: CHEST_CONFIG.woodColor,
    map: colorTexture ?? undefined,
    bumpMap: bumpTexture ?? undefined,
    bumpScale: 0.018,
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 0.42,
    clearcoatRoughness: 0.25,
    reflectivity: 0.6,
    emissive: '#180702',
    emissiveIntensity: 0.08,
  }), [colorTexture, bumpTexture]);
  const darkWood = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#240F06',
    roughness: 0.72,
    metalness: 0.08,
  }), []);
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: CHEST_CONFIG.brassColor,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 0.85,
    clearcoatRoughness: 0.14,
    reflectivity: 0.85,
  }), []);
  const brightBrass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: CHEST_CONFIG.highlightColor,
    metalness: 0.94,
    roughness: 0.12,
    clearcoat: 0.95,
    clearcoatRoughness: 0.1,
    reflectivity: 0.95,
  }), []);
  const keyhole = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0A0402', metalness: 0.6, roughness: 0.4 }), []);
  const lidShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.3, 0);
    shape.lineTo(0.3, 0);
    shape.lineTo(0.3, 0.035);
    shape.quadraticCurveTo(0.3, 0.19, 0, 0.225);
    shape.quadraticCurveTo(-0.3, 0.19, -0.3, 0.035);
    shape.closePath();
    return shape;
  }, []);
  const lidGeometry = useMemo(() => new THREE.ExtrudeGeometry(lidShape, { depth: 0.36, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.009, bevelThickness: 0.007, curveSegments: 28 }), [lidShape]);
  const bodyRivets = useMemo<[number, number, number][]>(() => [-0.205, 0, 0.205].flatMap((x) => [-0.092, -0.025, 0.1].map((y) => [x, 0.125 + y, 0.218])), []);
  const lidRivets = useMemo<[number, number, number][]>(() => [-0.205, 0, 0.205].flatMap((x) => [0.015, 0.17].map((y) => [x, y, 0.372])), []);
  const archTrim = useMemo(() => {
    const points = [
      new THREE.Vector3(-0.292, 0.035, 0.365),
      new THREE.Vector3(-0.276, 0.145, 0.365),
      new THREE.Vector3(-0.18, 0.208, 0.365),
      new THREE.Vector3(0, 0.222, 0.365),
      new THREE.Vector3(0.18, 0.208, 0.365),
      new THREE.Vector3(0.276, 0.145, 0.365),
      new THREE.Vector3(0.292, 0.035, 0.365),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 54, 0.01, 10, false);
  }, []);

  useEffect(() => () => {
    colorTexture?.dispose();
    bumpTexture?.dispose();
    wood.dispose();
    darkWood.dispose();
    brass.dispose();
    brightBrass.dispose();
    keyhole.dispose();
    lidGeometry.dispose();
    archTrim.dispose();
  }, [colorTexture, bumpTexture, wood, darkWood, brass, brightBrass, keyhole, lidGeometry, archTrim]);

  return (
    <group
      position={TREASURE_CONFIG.chest.position}
      onPointerOver={(event) => { event.stopPropagation(); onHover(true); }}
      onPointerOut={(event) => { event.stopPropagation(); onHover(false); }}
    >
      {/* Contact shadow sâu dưới đáy rương */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.44]} />
        <meshBasicMaterial color="#080402" transparent opacity={0.65} depthWrite={false} />
      </mesh>

      {/* Đáy rương gỗ dày & chân đế */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.036, 0.34]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* Mặt trước rương & đường xẻ rãnh ván gỗ */}
      <mesh position={[0, 0.13, 0.165]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.23, 0.03]} />
        <primitive object={wood} attach="material" />
      </mesh>
      {/* Khung viền gỗ nổi 3D (Stiles & Rails) tạo chiều sâu chạm trổ thủ công */}
      <mesh position={[0, 0.235, 0.178]} castShadow>
        <boxGeometry args={[0.605, 0.018, 0.012]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[0, 0.025, 0.178]} castShadow>
        <boxGeometry args={[0.605, 0.018, 0.012]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[-0.292, 0.13, 0.178]} castShadow>
        <boxGeometry args={[0.022, 0.21, 0.012]} />
        <primitive object={wood} attach="material" />
      </mesh>
      <mesh position={[0.292, 0.13, 0.178]} castShadow>
        <boxGeometry args={[0.022, 0.21, 0.012]} />
        <primitive object={wood} attach="material" />
      </mesh>

      {/* Rãnh ván ngang trên mặt trước */}
      {[-0.045, 0.038].map((offsetY) => (
        <mesh key={offsetY} position={[0, 0.13 + offsetY, 0.181]}>
          <boxGeometry args={[0.56, 0.005, 0.004]} />
          <primitive object={darkWood} attach="material" />
        </mesh>
      ))}

      {/* Mặt sau rương */}
      <mesh position={[0, 0.13, -0.165]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.23, 0.03]} />
        <primitive object={wood} attach="material" />
      </mesh>

      {/* Hai vách hông trái & phải */}
      {[-0.295, 0.295].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.13, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.03, 0.23, 0.33]} />
            <primitive object={wood} attach="material" />
          </mesh>
          {/* Quai kéo tròn cổ điển 2 bên hông theo đúng chest-reference.png */}
          <group position={[x > 0 ? x + 0.015 : x - 0.015, 0.13, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            {/* Đế gắn quai hình vuông bo góc */}
            <mesh castShadow>
              <boxGeometry args={[0.065, 0.045, 0.012]} />
              <primitive object={brass} attach="material" />
            </mesh>
            {/* Chốt gắn */}
            <mesh position={[0, 0.005, 0.01]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.018, 16]} />
              <primitive object={brightBrass} attach="material" />
            </mesh>
            {/* Vòng xách kim loại thả lủng lẳng */}
            <mesh position={[0, -0.045, 0.014]} rotation={[0.08, 0, 0]} castShadow>
              <torusGeometry args={[0.044, 0.008, 12, 32]} />
              <primitive object={brightBrass} attach="material" />
            </mesh>
          </group>
        </group>
      ))}

      {/* Lòng trong rương tối màu */}
      <mesh position={[0, 0.065, 0]} receiveShadow>
        <boxGeometry args={[0.52, 0.055, 0.27]} />
        <primitive object={darkWood} attach="material" />
      </mesh>

      {/* 4 nẹp góc kim loại gia cố ở các chân đế (Corner Brackets) */}
      {[
        [-0.29, 0.035, 0.16],
        [0.29, 0.035, 0.16],
        [-0.29, 0.035, -0.16],
        [0.29, 0.035, -0.16],
      ].map(([cx, cy, cz], idx) => (
        <group key={`corner-${idx}`} position={[cx, cy, cz]}>
          <mesh castShadow>
            <boxGeometry args={[0.042, 0.065, 0.042]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
        </group>
      ))}

      {/* NẮP RƯƠNG VÒM CONG (BARREL-VAULT LID) có bản lề xoay phía sau */}
      <group ref={lidRef} position={[0, 0.25, -0.18]}>
        <mesh geometry={lidGeometry} material={wood} castShadow receiveShadow />
        <mesh geometry={archTrim} material={brightBrass} castShadow />

        {/* 3 đai đồng vòm cong bao quanh nắp rương từ trước ra sau */}
        {[-0.205, 0, 0.205].map((x) => (
          <group key={x} position={[x, 0.095, 0.36]}>
            <mesh castShadow>
              <boxGeometry args={[0.038, 0.185, 0.018]} />
              <primitive object={brass} attach="material" />
            </mesh>
          </group>
        ))}

        <RivetInstances positions={lidRivets} />

        {/* BIỂU TƯỢNG HOA LA BÀN 8 CÁNH (STAR COMPASS MEDALLION) TRÊN ĐAI GIỮA NẮP RƯƠNG */}
        <group position={[0, 0.155, 0.366]}>
          {/* Đế mề đay hình tròn viền nổi */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.048, 0.048, 0.01, 32]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
          {/* Ngôi sao la bàn 4 cánh chính (chữ thập dài) */}
          <mesh position={[0, 0, 0.006]} castShadow>
            <boxGeometry args={[0.064, 0.014, 0.008]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.006]} castShadow>
            <boxGeometry args={[0.014, 0.064, 0.008]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
          {/* Ngôi sao la bàn 4 cánh phụ (chéo 45 độ ngắn hơn) */}
          <mesh position={[0, 0, 0.006]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.044, 0.01, 0.007]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.006]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <boxGeometry args={[0.01, 0.044, 0.007]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
          {/* Đinh tán trung tâm mề đay */}
          <mesh position={[0, 0, 0.011]} castShadow>
            <sphereGeometry args={[0.008, 16, 12]} />
            <primitive object={brightBrass} attach="material" />
          </mesh>
        </group>

        {/* Tai khoá treo (Hasp clasp latch) gắn từ mép nắp rủ xuống */}
        <mesh position={[0, 0.015, 0.366]} castShadow>
          <boxGeometry args={[0.046, 0.045, 0.016]} />
          <primitive object={brass} attach="material" />
        </mesh>
      </group>

      {/* 3 ĐAI ĐỒNG ĐỨNG VÀ ĐINH TÁN TRÊN THÂN RƯƠNG TRƯỚC */}
      {[-0.205, 0, 0.205].map((x) => (
        <group key={x} position={[x, 0.125, 0.188]}>
          <mesh castShadow>
            <boxGeometry args={[0.038, 0.245, 0.018]} />
            <primitive object={brass} attach="material" />
          </mesh>
        </group>
      ))}
      <RivetInstances positions={bodyRivets} />

      {/* Ổ KHOÁ CỔ ĐỒNG THAU CHÍNH DIỆN (PADLOCK DROP CLASP) */}
      <group position={[0, 0.145, 0.208]}>
        {/* Tấm đế khóa bản đồng chạm trổ viền */}
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.135, 0.022]} />
          <primitive object={brass} attach="material" />
        </mesh>
        {/* Đuôi nhọn vát dưới của ổ khóa theo mẫu */}
        <mesh position={[0, -0.075, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          <primitive object={brass} attach="material" />
        </mesh>
        {/* Quai móc khóa phía trên (Padlock shackle) */}
        <mesh position={[0, 0.07, 0]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.028, 0.007, 8, 24]} />
          <primitive object={brightBrass} attach="material" />
        </mesh>
        {/* Lỗ khóa tròn phía trên */}
        <mesh position={[0, 0.02, 0.013]}>
          <circleGeometry args={[0.018, 24]} />
          <primitive object={keyhole} attach="material" />
        </mesh>
        {/* Khe cắm chìa khóa phía dưới */}
        <mesh position={[0, -0.02, 0.014]}>
          <boxGeometry args={[0.012, 0.046, 0.003]} />
          <primitive object={keyhole} attach="material" />
        </mesh>
      </group>

      {/* Ánh sáng ấm và đèn chiếu điểm điện ảnh từ đỉnh rương (Rim Light) */}
      <pointLight position={[0, 0.48, 0.12]} color="#FFF2DA" intensity={1.4} distance={1.3} decay={2} />
      <pointLight position={[0, 0.17, 0.62]} color={CHEST_CONFIG.fillLightColor} intensity={CHEST_CONFIG.fillLightIntensity} distance={1.2} decay={2} />
      <pointLight ref={glowRef} position={[0, 0.2, 0.32]} color={CHEST_CONFIG.glowColor} intensity={hovered ? CHEST_CONFIG.hoverGlowIntensity : CHEST_CONFIG.glowIntensity} distance={1.05} decay={2} />
      <pointLight position={[0, 0.2, -0.015]} color="#FFD36A" intensity={opened ? 2.1 : 0.025} distance={1.05} decay={2} />
      {opened && <Sparkles count={16} scale={[0.5, 0.38, 0.28]} size={2.0} speed={0.25} color="#F8D581" opacity={0.8} />}
      {hovered && <Sparkles count={12} scale={[0.8, 0.65, 0.5]} size={1.5} speed={0.2} color="#E5B75E" opacity={0.65} />}
    </group>
  );
}
