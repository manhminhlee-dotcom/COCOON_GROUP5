import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE } from '../types';
import { KeyChestInteraction } from './KeyChestInteraction';

const BOOKSHELF_GROUP_Y = -0.1;
const SHELF_LEVEL_CENTERS = [-1.2, -0.4, 0.45, 1.15];
const SHELF_SURFACES = SHELF_LEVEL_CENTERS.map((centerY) => BOOKSHELF_GROUP_Y + centerY + 0.03);

export function BookshelfBay() {
  const oakMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#2C1609',
        roughness: 0.86,
        metalness: 0.04,
        clearcoat: 0.12,
      }),
    []
  );

  return (
    <group position={[0, BOOKSHELF_GROUP_Y, -0.6]}>
      <mesh position={[0, 0, -0.32]} receiveShadow>
        <boxGeometry args={[4.4, 3.4, 0.04]} />
        <meshPhysicalMaterial color="#160B04" roughness={0.92} />
      </mesh>
      <mesh position={[-2.15, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.4, 0.65]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[2.15, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 3.4, 0.65]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.72, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 3.4, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0.72, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, 3.4, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.42, 0.08, 0.68]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.38, 0.06, 0.62]} />
        <primitive object={oakMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -0.37, 0.28]}>
        <boxGeometry args={[4.3, 0.012, 0.012]} />
        <meshBasicMaterial color="#94581C" />
      </mesh>
    </group>
  );
}

export function BackgroundShelfBooks() {
  const bookColors = [
    '#1A0E08',
    '#0B150F',
    '#0F131C',
    '#1F1108',
    '#250C0E',
    '#12150A',
    '#18130C',
    '#1B0E07',
    '#0B1519',
  ];

  const books = useMemo(() => {
    const list = [];
    // Tầng 2 (tầng giữa): Gian trái chia 2 bên để chừa ô giữa [x = -1.22] cho chìa khóa tỏa sáng
    [-1.88, -1.77, -1.66].forEach((x, i) => {
      list.push({
        pos: [x, 0, -0.55],
        size: [0.08, 0.42 + (i % 2) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[i % bookColors.length],
        rot: [0, 0, 0],
      });
    });
    [-0.92, -0.81].forEach((x, i) => {
      list.push({
        pos: [x, 0, -0.55],
        size: [0.08, 0.43, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 3) % bookColors.length],
        rot: [0, 0, 0],
      });
    });

    // Tầng 2: Gian giữa bên cạnh cuốn sách báo cáo [x = -0.05]
    for (let i = 0; i < 3; i++) {
      list.push({
        pos: [-0.45 + i * 0.1, 0, -0.55],
        size: [0.075, 0.44 + (i % 2) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 4) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    for (let i = 0; i < 3; i++) {
      list.push({
        pos: [0.25 + i * 0.1, 0, -0.55],
        size: [0.075, 0.46, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 1) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    // Tầng 2: Gian phải
    for (let i = 0; i < 8; i++) {
      list.push({
        pos: [0.95 + i * 0.11, 0, -0.55],
        size: [0.08, 0.45 + (i % 3) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[1],
        color: bookColors[(i + 2) % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.03, 0],
      });
    }

    // Tầng 3 (tầng trên): Gian giữa chia đều 2 bên rương báu hoàng kim [0, 0.38, -0.42]
    [-0.58, -0.48, -0.38].forEach((x, i) => {
      list.push({
        pos: [x, 0, -0.55],
        size: [0.075, 0.45 + (i % 2) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[2],
        color: bookColors[(i + 1) % bookColors.length],
        rot: [0, 0, 0],
      });
    });
    [0.38, 0.48, 0.58].forEach((x, i) => {
      list.push({
        pos: [x, 0, -0.55],
        size: [0.075, 0.43 + (i % 2) * 0.05, 0.3],
        shelfSurfaceY: SHELF_SURFACES[2],
        color: bookColors[(i + 4) % bookColors.length],
        rot: [0, 0, 0],
      });
    });
    for (let i = 0; i < 5; i++) {
      list.push({
        pos: [0.95 + i * 0.1, 0, -0.55],
        size: [0.075, 0.42 + (i % 3) * 0.04, 0.3],
        shelfSurfaceY: SHELF_SURFACES[2],
        color: bookColors[(i + 6) % bookColors.length],
        rot: [0, (Math.random() - 0.5) * 0.03, 0],
      });
    }

    // Tầng 1 (tầng dưới): Gian giữa và gian phải
    for (let i = 0; i < 5; i++) {
      list.push({
        pos: [-0.25 + i * 0.12, 0, -0.55],
        size: [0.08, 0.42, 0.3],
        shelfSurfaceY: SHELF_SURFACES[0],
        color: bookColors[(i + 2) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    for (let i = 0; i < 6; i++) {
      list.push({
        pos: [1.0 + i * 0.11, 0, -0.55],
        size: [0.08, 0.44 + (i % 3) * 0.04, 0.32],
        shelfSurfaceY: SHELF_SURFACES[0],
        color: bookColors[(i + 5) % bookColors.length],
        rot: [0, 0, 0],
      });
    }
    return list;
  }, []);

  return (
    <group>
      {books.map((b, idx) => (
        <mesh
          key={idx}
          position={[b.pos[0], b.shelfSurfaceY + b.size[1] / 2 + 0.002, b.pos[2]]}
          rotation={b.rot as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={b.size as [number, number, number]} />
          <meshPhysicalMaterial color={b.color} roughness={0.88} metalness={0.02} />
        </mesh>
      ))}

      {/* Đèn ngủ trang trí trên kệ giảm cường độ để không lấn át 3 chủ thể */}
      <group position={[-1.25, SHELF_SURFACES[2] + 0.15, -0.45]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.16, 0.18, 32]} />
          <meshPhysicalMaterial
            color="#E8CEAC"
            emissive="#B8782E"
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
        <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.06, 32]} />
          <meshPhysicalMaterial color="#3A2210" roughness={0.9} />
        </mesh>
        <pointLight color="#E59838" intensity={0.22} distance={1.2} decay={2} />
      </group>

      <mesh position={[1.48, SHELF_SURFACES[2] + 0.18, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.36, 24]} />
        <meshPhysicalMaterial color="#8A7A6A" roughness={0.65} clearcoat={0.1} />
      </mesh>
    </group>
  );
}

function placeBookLabel(
  element: HTMLDivElement | null,
  world: THREE.Vector3,
  visible: boolean,
  camera: THREE.Camera,
  size: { width: number; height: number },
  ndc: THREE.Vector3,
) {
  if (!element) return;
  if (element.textContent !== 'BÁO CÁO') element.textContent = 'BÁO CÁO';
  ndc.copy(world).project(camera);
  const inView = visible && ndc.z >= -1 && ndc.z <= 1;
  element.style.display = inView ? 'block' : 'none';
  if (!inView) return;
  const x = (ndc.x * 0.5 + 0.5) * size.width;
  const y = (-ndc.y * 0.5 + 0.5) * size.height;
  element.style.left = `${THREE.MathUtils.clamp(x, element.offsetWidth / 2 + 8, size.width - element.offsetWidth / 2 - 8)}px`;
  element.style.top = `${THREE.MathUtils.clamp(y, element.offsetHeight + 8, size.height - 8)}px`;
}

function createAntiqueBookGeometry() {
  const width = 0.16;
  const height = 0.54;
  const radius = 0.026;
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2 + radius, -height / 2);
  shape.lineTo(width / 2 - radius, -height / 2);
  shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
  shape.lineTo(width / 2, height / 2 - radius);
  shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
  shape.lineTo(-width / 2 + radius, height / 2);
  shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
  shape.lineTo(-width / 2, -height / 2 + radius);
  shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.38,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.009,
    bevelThickness: 0.008,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -0.19);
  geometry.computeVertexNormals();
  return geometry;
}

function createLeatherMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#38261c';
  context.fillRect(0, 0, canvas.width, canvas.height);
  let seed = 48271;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let index = 0; index < 2200; index += 1) {
    const x = random() * canvas.width;
    const y = random() * canvas.height;
    const length = 2 + random() * 15;
    context.strokeStyle = random() > 0.5 ? 'rgba(209,161,103,0.10)' : 'rgba(13,7,4,0.13)';
    context.lineWidth = 0.5 + random() * 1.3;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length, y + (random() - 0.5) * 2);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += 3) {
    context.fillStyle = y % 6 === 0 ? 'rgba(235,194,139,0.025)' : 'rgba(6,3,2,0.025)';
    context.fillRect(0, y, canvas.width, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1.4);
  return texture;
}

function createSpineTitleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1536;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 'bold 134px Georgia, serif';
  context.shadowColor = 'rgba(20, 9, 3, .9)';
  context.shadowBlur = 8;
  context.shadowOffsetY = 4;
  context.fillStyle = '#f0d18a';
  context.fillText('BÁO', 256, 650);
  context.fillText('CÁO', 256, 865);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function HeroBookOnShelf({
  onOpenBook,
  isReading,
  interactionsLocked = false,
  reportLabelRef,
  bookPullRef,
}: {
  onOpenBook: () => void;
  isReading: boolean;
  interactionsLocked?: boolean;
  reportLabelRef: React.RefObject<HTMLDivElement | null>;
  bookPullRef: React.MutableRefObject<(() => void) | null>;
}) {
  const { camera, size } = useThree();
  const [hovered, setHovered] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const bookGroupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const pullElapsed = useRef(0);
  const pullStarted = useRef(false);
  const labelWorld = useRef(new THREE.Vector3());
  const labelNdc = useRef(new THREE.Vector3());
  const basePosition = useMemo(() => new THREE.Vector3(-0.05, SHELF_SURFACES[1] + 0.54 / 2 + 0.002, -0.45), []);
  const bookGeometry = useMemo(createAntiqueBookGeometry, []);
  const leatherMap = useMemo(createLeatherMap, []);
  const titleMap = useMemo(createSpineTitleTexture, []);

  useEffect(() => {
    if (interactionsLocked || isReading) setHovered(false);
    if (isReading) {
      setIsPulling(false);
      pullStarted.current = false;
    }
  }, [interactionsLocked, isReading]);

  useEffect(() => {
    if (!interactionsLocked && !isReading) document.body.style.cursor = hovered ? 'pointer' : 'default';
  }, [hovered, isReading, interactionsLocked]);

  useEffect(() => {
    const requestPull = () => {
      if (isReading || interactionsLocked || isPulling || pullStarted.current) return;
      pullElapsed.current = 0;
      pullStarted.current = false;
      setIsPulling(true);
      setHovered(false);
    };
    bookPullRef.current = requestPull;
    return () => {
      if (bookPullRef.current === requestPull) bookPullRef.current = null;
    };
  }, [bookPullRef, interactionsLocked, isPulling, isReading]);

  useFrame((state, delta) => {
    const book = bookGroupRef.current;
    if (!book) return;
    let pull = 0;
    if (isPulling) {
      pullElapsed.current += delta;
      pull = THREE.MathUtils.smoothstep(pullElapsed.current / 0.62, 0, 1);
      book.position.z = basePosition.z + pull * 0.36;
      book.position.y = basePosition.y + Math.sin(pull * Math.PI) * 0.075;
      book.rotation.y = -pull * 0.09;
      if (pull >= 1 && !pullStarted.current) {
        pullStarted.current = true;
        setIsPulling(false);
        onOpenBook();
      }
    } else {
      book.position.copy(basePosition);
      book.rotation.set(0, 0, 0);
    }

    const activeHover = hovered && !interactionsLocked && !isReading && !isPulling;
    if (glowLightRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 1.6) + 1) * 0.5;
      const targetIntensity = activeHover ? 0.82 + pulse * 0.22 : 0.38 + pulse * 0.10;
      glowLightRef.current.intensity = THREE.MathUtils.lerp(glowLightRef.current.intensity, targetIntensity, 1 - Math.exp(-delta * 4));
    }

    book.updateMatrix();
    book.updateMatrixWorld(true);
    labelWorld.current.set(0, 0.34, 0.24).applyMatrix4(book.matrixWorld);
    placeBookLabel(reportLabelRef.current, labelWorld.current, !isReading && !isPulling && !interactionsLocked, camera, size, labelNdc.current);
  });

  const leatherMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      map: leatherMap ?? undefined,
      roughness: 0.68,
      metalness: 0.025,
      clearcoat: 0.18,
      clearcoatRoughness: 0.62,
      bumpMap: leatherMap ?? undefined,
      bumpScale: 0.004,
      emissive: '#45280c',
      emissiveIntensity: 0.025,
    }),
    [leatherMap],
  );
  const antiqueBrass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#654824', metalness: 0.48, roughness: 0.52, clearcoat: 0.08 }),
    [],
  );
  const agedGold = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#a98244', metalness: 0.58, roughness: 0.46, clearcoat: 0.08 }),
    [],
  );
  const pageMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#bcae91', roughness: 0.92, metalness: 0 }),
    [],
  );
  const silkMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#69251e', roughness: 0.52, clearcoat: 0.12 }),
    [],
  );
  const titleMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: titleMap ?? undefined, transparent: true, depthWrite: false, toneMapped: false }),
    [titleMap],
  );

  return (
    <group
      ref={bookGroupRef}
      position={basePosition.toArray()}
      raycast={interactionsLocked || isReading || isPulling ? () => null : undefined}
      onClick={(event) => {
        event.stopPropagation();
        bookPullRef.current?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (!isReading && !interactionsLocked && !isPulling) setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
    >
      <mesh position={[0, -0.276, -0.015]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.30, 0.45]} />
        <meshBasicMaterial color="#060302" transparent opacity={0.46} depthWrite={false} />
      </mesh>

      {/* Rounded, worn leather cover around a visible block of aged paper. */}
      <mesh geometry={bookGeometry} material={leatherMaterial} castShadow receiveShadow />
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.132, 0.505, 0.35]} />
        <primitive object={pageMaterial} attach="material" />
      </mesh>

      {/* Hand-tooled spine bands and softly worn brass corner caps. */}
      {[-0.205, -0.105, 0.105, 0.205].map((y) => (
        <mesh key={y} position={[0, y, 0.197]} castShadow>
          <boxGeometry args={[0.145, 0.012, 0.008]} />
          <primitive object={antiqueBrass} attach="material" />
        </mesh>
      ))}
      {[
        [-0.058, 0.238], [0.058, 0.238], [-0.058, -0.238], [0.058, -0.238],
      ].map(([x, y], index) => (
        <group key={index} position={[x, y, 0.201]}>
          <mesh castShadow>
            <sphereGeometry args={[0.012, 12, 8]} />
            <primitive object={antiqueBrass} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.004]}>
            <sphereGeometry args={[0.004, 8, 6]} />
            <primitive object={agedGold} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Small inset title cartouche, legible on the book and echoed by its shelf label. */}
      <mesh position={[0, 0.005, 0.204]} castShadow>
        <boxGeometry args={[0.094, 0.27, 0.009]} />
        <primitive object={antiqueBrass} attach="material" />
      </mesh>
      <mesh position={[0, 0.005, 0.212]}>
        <planeGeometry args={[0.079, 0.249]} />
        <meshStandardMaterial color="#382719" roughness={0.58} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0.005, 0.213]}>
        <planeGeometry args={[0.077, 0.245]} />
        <primitive object={titleMaterial} attach="material" />
      </mesh>
      {[-0.162, 0.172].map((y) => (
        <mesh key={y} position={[0, y, 0.216]}>
          <boxGeometry args={[0.064, 0.003, 0.002]} />
          <primitive object={agedGold} attach="material" />
        </mesh>
      ))}

      {/* A restrained silk marker hangs from the lower edge. */}
      <group position={[0.026, -0.31, 0.09]} rotation={[0.08, 0, -0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.018, 0.10, 0.004]} />
          <primitive object={silkMaterial} attach="material" />
        </mesh>
      </group>

      <pointLight position={[0, 0.32, 0.3]} color="#FFE7BD" intensity={0.34} distance={0.82} decay={2} />
      <pointLight ref={glowLightRef} position={[0, -0.02, 0.32]} color="#E5AE4A" intensity={0.4} distance={1.15} decay={2} />
      <Sparkles
        count={hovered && !isPulling ? 7 : 3}
        scale={[0.36, 0.62, 0.34]}
        size={hovered && !isPulling ? 1.3 : 0.8}
        speed={hovered && !isPulling ? 0.15 : 0.055}
        color="#E8C77D"
        opacity={hovered && !isPulling ? 0.3 : 0.14}
      />
    </group>
  );
}

export function CozyRoomScene({
  onOpenBook,
  isReading,
  interactionsLocked,
  clipOpen,
  onFadeStart,
  onOpenClip,
  onInteractionBusyChange,
  onKeyAudioActivityChange,
  onChestCueChange,
  keyLabelRef,
  chestLabelRef,
  reportLabelRef,
  bookPullRef,
}: {
  onOpenBook: () => void;
  isReading: boolean;
  interactionsLocked: boolean;
  clipOpen: boolean;
  onFadeStart: () => void;
  onOpenClip: () => void;
  onInteractionBusyChange: (busy: boolean) => void;
  onKeyAudioActivityChange: (active: boolean) => void;
  onChestCueChange: (near: boolean) => void;
  keyLabelRef: React.RefObject<HTMLDivElement | null>;
  chestLabelRef: React.RefObject<HTMLDivElement | null>;
  reportLabelRef: React.RefObject<HTMLDivElement | null>;
  bookPullRef: React.MutableRefObject<(() => void) | null>;
}) {
  return (
    <>
      <color attach="background" args={[PALETTE.darkRoom]} />
      {/* Ánh sáng môi trường giảm mạnh (từ 0.28 xuống 0.14) để tôn độ tương phản sâu của chiaroscuro */}
      <ambientLight intensity={0.14} color="#FFD8B5" />
      <directionalLight
        position={[3.5, 2.8, 2.2]}
        intensity={0.55}
        color="#FFA84A"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 3.2, 1.2]} intensity={0.32} color="#FFDFB0" decay={2} distance={6} />
      <pointLight position={[0, 1.8, 1.5]} intensity={0.35} color="#FFDFB0" decay={2} distance={4} />

      {/* 3 ĐÈN CHIẾU ĐIỂM ĐIỆN ẢNH TÔN NỔI KHỐI RỰC RỠ CHO 3 CHỦ THỂ CHÍNH */}
      {/* 1. Đèn rương báu hoàng kim (tầng trên ở giữa [0, 0.38, -0.42]) */}
      <pointLight position={[0, 1.45, 0.72]} intensity={0.95} color="#FFE6B5" decay={2} distance={2.5} />
      <pointLight position={[0, 0.55, 0.48]} intensity={0.65} color="#FFD88A" decay={2} distance={1.6} />

      {/* 2. Đèn cuốn sách báo cáo hoàng kim (tầng giữa ở giữa [-0.05, -0.20, -0.45]) */}
      <pointLight position={[-0.05, 0.75, 0.65]} intensity={0.95} color="#FFE3B0" decay={2} distance={2.2} />
      <pointLight position={[-0.05, -0.15, 0.28]} intensity={0.48} color="#FFD88B" decay={2} distance={1.4} />

      {/* 3. Đèn chìa khóa đồng hoàng kim (tầng giữa bên trái [-1.22, -0.06, -0.10]) */}
      <pointLight position={[-0.98, 0.48, 0.68]} intensity={1.15} color="#FFE8B8" decay={2} distance={2.2} />
      <pointLight position={[-0.98, -0.06, 0.35]} intensity={0.65} color="#FFDF85" decay={2} distance={1.4} />

      <Environment resolution={128} background={false} frames={1}>
        <Lightformer form="rect" intensity={0.9} color="#FFD9A5" position={[0, 1.5, 3]} scale={[3.5, 1.8, 1]} />
        <Lightformer form="rect" intensity={0.45} color="#D99645" position={[-3, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.6, 3, 1]} />
      </Environment>

      <BookshelfBay />
      <BackgroundShelfBooks />
      <HeroBookOnShelf
        onOpenBook={onOpenBook}
        isReading={isReading}
        interactionsLocked={interactionsLocked}
        reportLabelRef={reportLabelRef}
        bookPullRef={bookPullRef}
      />
      <KeyChestInteraction
        isReading={isReading}
        interactionsLocked={interactionsLocked}
        clipOpen={clipOpen}
        onFadeStart={onFadeStart}
        onOpenClip={onOpenClip}
        onInteractionBusyChange={onInteractionBusyChange}
        onKeyAudioActivityChange={onKeyAudioActivityChange}
        onChestCueChange={onChestCueChange}
        keyLabelRef={keyLabelRef}
        chestLabelRef={chestLabelRef}
      />

      <mesh position={[0, -1.75, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshPhysicalMaterial color="#1C0E07" roughness={0.6} metalness={0.08} clearcoat={0.15} />
      </mesh>

      <ContactShadows position={[0, -1.74, 0]} opacity={0.65} scale={8} blur={2.4} far={2} />
    </>
  );
}
