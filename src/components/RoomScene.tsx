import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
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

export function HeroBookOnShelf({
  onOpenBook,
  isReading,
  interactionsLocked = false,
}: {
  onOpenBook: () => void;
  isReading: boolean;
  interactionsLocked?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const bookGroupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  // When key interaction is active or book is opened, immediately clear hover and release cursor
  useEffect(() => {
    if (interactionsLocked || isReading) {
      setHovered(false);
    }
  }, [interactionsLocked, isReading]);

  useEffect(() => {
    if (interactionsLocked || isReading) {
      return;
    }
    document.body.style.cursor = hovered ? 'pointer' : 'default';
  }, [hovered, isReading, interactionsLocked]);

  useFrame((state, delta) => {
    if (!bookGroupRef.current) return;
    const isActivelyHovered = hovered && !interactionsLocked && !isReading;
    const targetZ = isActivelyHovered ? -0.22 : -0.45;
    const targetRotY = isActivelyHovered ? 0.16 : 0.0;
    const targetRotX = isActivelyHovered ? -0.04 : 0.0;

    bookGroupRef.current.position.z = THREE.MathUtils.lerp(
      bookGroupRef.current.position.z,
      targetZ,
      delta * 6
    );
    bookGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.y,
      targetRotY,
      delta * 6
    );
    bookGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      bookGroupRef.current.rotation.x,
      targetRotX,
      delta * 6
    );

    if (glowLightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
      const targetIntensity = isActivelyHovered ? 1.6 + pulse : 0.45 + pulse * 0.1;
      glowLightRef.current.intensity = THREE.MathUtils.lerp(
        glowLightRef.current.intensity,
        targetIntensity,
        delta * 6
      );
    }
  });

  // Materials for the heirloom gold book
  const leatherMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#34140D',
        roughness: 0.28,
        metalness: 0.14,
        clearcoat: 0.82,
        clearcoatRoughness: 0.2,
        emissive: '#B8860B',
        emissiveIntensity: 0.06,
      }),
    []
  );

  const goldPlateMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#F4CA42',
        metalness: 0.96,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.98,
        emissive: '#D4AF37',
        emissiveIntensity: 0.38,
      }),
    []
  );

  const brightGoldMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#FFF2A8',
        metalness: 0.98,
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        reflectivity: 1.0,
        emissive: '#FFDF66',
        emissiveIntensity: 0.52,
      }),
    []
  );

  const darkGoldBorder = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#9C6F1E',
        metalness: 0.9,
        roughness: 0.22,
        clearcoat: 0.7,
      }),
    []
  );

  const paperEdgeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#F5EADB',
        roughness: 0.88,
        metalness: 0.02,
      }),
    []
  );

  const ribbonMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#A81822',
        roughness: 0.32,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
      }),
    []
  );

  return (
    <group
      ref={bookGroupRef}
      position={[-0.05, SHELF_SURFACES[1] + 0.54 / 2 + 0.002, -0.45]}
      raycast={interactionsLocked || isReading ? () => null : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (isReading || interactionsLocked) return;
        onOpenBook();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (isReading || interactionsLocked) return;
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {/* Contact shadow sâu dưới chân sách */}
      <mesh position={[0, -0.268, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.26, 0.44]} />
        <meshBasicMaterial color="#060302" transparent opacity={0.78} depthWrite={false} />
      </mesh>

      {/* Thân sách bọc da cổ điển dập nổi */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.54, 0.38]} />
        <primitive object={leatherMaterial} attach="material" />
      </mesh>

      {/* 4 GỜ CHỈ NỔI 3D TRÊN SỐNG SÁCH (RAISED LEATHER SPINE RIBS) */}
      {[-0.18, -0.06, 0.06, 0.18].map((y) => (
        <group key={y} position={[0, y, 0.194]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.156, 16]} />
            <primitive object={leatherMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0, 0.004]} castShadow>
            <boxGeometry args={[0.152, 0.0035, 0.003]} />
            <primitive object={brightGoldMaterial} attach="material" />
          </mesh>
        </group>
      ))}

      {/* 4 CHÂN NẸP GÓC MẠ VÀNG CHẠM KHẮC (ANTIQUE GOLD CORNER BRACKETS) */}
      {[
        [-0.064, 0.245],
        [0.064, 0.245],
        [-0.064, -0.245],
        [0.064, -0.245],
      ].map(([cx, cy], idx) => (
        <mesh key={`corner-${idx}`} position={[cx, cy, 0.193]} castShadow>
          <boxGeometry args={[0.024, 0.024, 0.004]} />
          <primitive object={goldPlateMaterial} attach="material" />
        </mesh>
      ))}

      {/* TẤM BẢNG VÀNG 24K KHẮC NHAN ĐỀ ĐA TẦNG (MULTI-TIER GOLD TITLE CARTOUCHE) */}
      {/* Khung viền đồng thau sẫm */}
      <mesh position={[0, 0, 0.192]}>
        <planeGeometry args={[0.125, 0.44]} />
        <primitive object={darkGoldBorder} attach="material" />
      </mesh>

      {/* Tấm dát vàng 24K phản chiếu ánh sáng */}
      <mesh position={[0, 0, 0.195]}>
        <planeGeometry args={[0.095, 0.38]} />
        <primitive object={goldPlateMaterial} attach="material" />
      </mesh>

      {/* Mề đay kim cương vàng sáng trung tâm */}
      <mesh position={[0, 0, 0.198]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.032, 0.032, 0.004]} />
        <primitive object={brightGoldMaterial} attach="material" />
      </mesh>

      {/* Các đường chỉ vàng chạm trổ tượng trưng cho tựa sách thư viện */}
      {[0.12, 0.06, -0.06, -0.12].map((y) => (
        <mesh key={y} position={[0, y, 0.197]}>
          <boxGeometry args={[0.065, 0.004, 0.002]} />
          <primitive object={brightGoldMaterial} attach="material" />
        </mesh>
      ))}

      {/* DẢI RUY BĂNG ĐÁNH DẤU TRANG LỤA ĐỎ THẢ LỬNG (DANGLING SILK BOOKMARK) */}
      <group position={[0.028, -0.31, 0.09]} rotation={[0.08, 0, -0.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.022, 0.11, 0.003]} />
          <primitive object={ribbonMaterial} attach="material" />
        </mesh>
        <mesh position={[0, -0.055, 0]} castShadow>
          <boxGeometry args={[0.024, 0.012, 0.004]} />
          <primitive object={brightGoldMaterial} attach="material" />
        </mesh>
      </group>

      {/* Cạnh trang giấy xếp lớp trên và dưới */}
      <mesh position={[0, 0.265, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.36]} />
        <primitive object={paperEdgeMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -0.265, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.36]} />
        <primitive object={paperEdgeMaterial} attach="material" />
      </mesh>

      {/* Đèn chiếu điểm đỉnh gáy sách (Rim Light) */}
      <pointLight position={[0, 0.42, 0.35]} color="#FFF5DC" intensity={1.5} distance={1.3} decay={2} />

      <pointLight
        ref={glowLightRef}
        position={[0, 0, 0.25]}
        color="#F0BF3E"
        intensity={0.5}
        distance={1.5}
        decay={2}
      />

      <Sparkles
        count={hovered ? 38 : 14}
        scale={0.85}
        size={hovered ? 2.6 : 1.6}
        speed={hovered ? 0.5 : 0.2}
        color="#F2C744"
        opacity={hovered ? 0.8 : 0.35}
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
  keyLabelRef,
  chestLabelRef,
}: {
  onOpenBook: () => void;
  isReading: boolean;
  interactionsLocked: boolean;
  clipOpen: boolean;
  onFadeStart: () => void;
  onOpenClip: () => void;
  onInteractionBusyChange: (busy: boolean) => void;
  keyLabelRef: React.RefObject<HTMLDivElement | null>;
  chestLabelRef: React.RefObject<HTMLDivElement | null>;
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
      <pointLight position={[0, 1.45, 0.72]} intensity={2.4} color="#FFE6B5" decay={2} distance={2.5} />
      <pointLight position={[0, 0.55, 0.48]} intensity={1.6} color="#FFD88A" decay={2} distance={1.6} />

      {/* 2. Đèn cuốn sách báo cáo hoàng kim (tầng giữa ở giữa [-0.05, -0.20, -0.45]) */}
      <pointLight position={[-0.05, 0.75, 0.65]} intensity={2.2} color="#FFE090" decay={2} distance={2.2} />
      <pointLight position={[-0.05, -0.15, 0.28]} intensity={1.2} color="#FFD36A" decay={2} distance={1.4} />

      {/* 3. Đèn chìa khóa đồng hoàng kim (tầng giữa bên trái [-1.22, -0.06, -0.10]) */}
      <pointLight position={[-1.22, 0.48, 0.68]} intensity={2.4} color="#FFE8B8" decay={2} distance={2.2} />
      <pointLight position={[-1.22, -0.06, 0.35]} intensity={1.3} color="#FFDF85" decay={2} distance={1.4} />

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
      />
      <KeyChestInteraction
        isReading={isReading}
        interactionsLocked={interactionsLocked}
        clipOpen={clipOpen}
        onFadeStart={onFadeStart}
        onOpenClip={onOpenClip}
        onInteractionBusyChange={onInteractionBusyChange}
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
