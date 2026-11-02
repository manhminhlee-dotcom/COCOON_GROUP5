import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CHEST_CONFIG, KEY_CONFIG, TREASURE_CONFIG } from '../config/treasure';
import { TreasureChestModel, TreasureKeyModel } from './TreasureObjects';

type InteractionStage = 'idle' | 'dragging' | 'returning' | 'unlocking' | 'opening' | 'fading' | 'playing' | 'resetting';

function placeScreenLabel(
  element: HTMLDivElement | null,
  world: THREE.Vector3,
  text: string,
  visible: boolean,
  camera: THREE.Camera,
  size: { width: number; height: number },
  ndc: THREE.Vector3,
) {
  if (!element) return;
  if (element.textContent !== text) element.textContent = text;
  ndc.copy(world).project(camera);
  const inView = visible && ndc.z >= -1 && ndc.z <= 1;
  element.style.display = inView ? 'block' : 'none';
  if (!inView) return;
  const x = (ndc.x * 0.5 + 0.5) * size.width;
  const y = (-ndc.y * 0.5 + 0.5) * size.height;
  element.style.left = `${THREE.MathUtils.clamp(x, element.offsetWidth / 2 + 8, size.width - element.offsetWidth / 2 - 8)}px`;
  element.style.top = `${THREE.MathUtils.clamp(y, element.offsetHeight + 8, size.height - 8)}px`;
}

export function KeyChestInteraction({
  isReading,
  interactionsLocked,
  clipOpen,
  onFadeStart,
  onOpenClip,
  onInteractionBusyChange,
  keyLabelRef,
  chestLabelRef,
}: {
  isReading: boolean;
  interactionsLocked: boolean;
  clipOpen: boolean;
  onFadeStart: () => void;
  onOpenClip: () => void;
  onInteractionBusyChange: (busy: boolean) => void;
  keyLabelRef: React.RefObject<HTMLDivElement | null>;
  chestLabelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { camera, gl, size } = useThree();
  const keyRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const keyGlowRef = useRef<THREE.PointLight>(null);
  const dragPlane = useRef(new THREE.Plane());
  const rayPoint = useRef(new THREE.Vector3());
  const planeNormal = useRef(new THREE.Vector3());
  const dragStart = useRef(new THREE.Vector3());
  const dragTarget = useRef(new THREE.Vector3(...KEY_CONFIG.home));
  const returnStart = useRef(new THREE.Vector3());
  const keyTip = useRef(new THREE.Vector3());
  const unlockTarget = useRef(new THREE.Vector3());
  const scratch = useRef(new THREE.Vector3());
  const keyLabelWorld = useRef(new THREE.Vector3());
  const chestLabelWorld = useRef(new THREE.Vector3());
  const labelNdc = useRef(new THREE.Vector3());
  const keyLabelLocal = useMemo(() => new THREE.Vector3(-0.075, 0.38, 0.055), []);
  const chestLabelLocal = useMemo(() => new THREE.Vector3(0, 0.45, 0.04), []);
  const homeTarget = useMemo(() => new THREE.Vector3(...KEY_CONFIG.home), []);
  const chestRootPosition = useMemo(() => new THREE.Vector3(...CHEST_CONFIG.position), []);
  const lockWorld = useMemo(
    () => new THREE.Vector3(...CHEST_CONFIG.position).add(new THREE.Vector3(...CHEST_CONFIG.lock)),
    [],
  );
  const timer = useRef(0);
  const fadeTriggered = useRef(false);
  const [stage, setStage] = useState<InteractionStage>('idle');
  const [keyHovered, setKeyHovered] = useState(false);
  const [chestHovered, setChestHovered] = useState(false);
  const [nearChest, setNearChest] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const setNear = (value: boolean) => {
    setNearChest((current) => current === value ? current : value);
  };

  const updateDragTarget = (event: ThreeEvent<PointerEvent>) => {
    if (!event.ray.intersectPlane(dragPlane.current, rayPoint.current)) return false;
    dragTarget.current.set(
      THREE.MathUtils.clamp(rayPoint.current.x + scratch.current.x, ...KEY_CONFIG.dragBounds.x),
      THREE.MathUtils.clamp(rayPoint.current.y + scratch.current.y, ...KEY_CONFIG.dragBounds.y),
      rayPoint.current.z + scratch.current.z,
    );
    keyTip.current
      .set(KEY_CONFIG.tip[0] * KEY_CONFIG.scale, 0, 0)
      .applyAxisAngle(planeNormal.current.set(0, 0, 1), 0.08)
      .add(dragTarget.current);
    setNear(keyTip.current.distanceTo(lockWorld) <= TREASURE_CONFIG.nearDistance);
    return true;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (stage !== 'dragging') return;
    const previousTouchAction = gl.domElement.style.touchAction;
    gl.domElement.style.touchAction = 'none';
    return () => { gl.domElement.style.touchAction = previousTouchAction; };
  }, [stage, gl]);

  useEffect(() => {
    if (clipOpen || stage !== 'playing') return;
    timer.current = 0;
    setStage('resetting');
  }, [clipOpen, stage]);

  useEffect(() => () => { document.body.style.cursor = 'default'; }, []);
  useEffect(() => {
    document.body.style.cursor = stage === 'dragging' ? 'grabbing' : keyHovered && stage === 'idle' && !isReading ? 'grab' : 'default';
  }, [keyHovered, stage, isReading]);

  const pointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (stage !== 'idle' || isReading || clipOpen || !keyRef.current) return;
    event.stopPropagation();
    keyRef.current.updateWorldMatrix(true, false);
    dragStart.current.setFromMatrixPosition(keyRef.current.matrixWorld);
    dragTarget.current.copy(dragStart.current);
    returnStart.current.copy(dragStart.current);
    dragPlane.current.setFromNormalAndCoplanarPoint(camera.getWorldDirection(planeNormal.current).normalize(), dragStart.current);
    if (event.ray.intersectPlane(dragPlane.current, rayPoint.current)) scratch.current.subVectors(dragStart.current, rayPoint.current);
    timer.current = 0;
    (event.target as unknown as { setPointerCapture: (pointerId: number) => void }).setPointerCapture(event.pointerId);
    onInteractionBusyChange(true);
    setKeyHovered(false);
    setStage('dragging');
  };

  const pointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (stage !== 'dragging') return;
    event.stopPropagation();
    updateDragTarget(event);
  };

  const pointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (stage !== 'dragging' || !keyRef.current) return;
    event.stopPropagation();
    updateDragTarget(event);
    (event.target as unknown as { releasePointerCapture: (pointerId: number) => void }).releasePointerCapture(event.pointerId);
    timer.current = 0;
    returnStart.current.copy(keyRef.current.position);
    // The last few centimeters are magnetic: a near-perfect drop snaps the key into the lock.
    if (keyTip.current.distanceTo(lockWorld) <= TREASURE_CONFIG.nearDistance) {
      setNear(false);
      setStage('unlocking');
    } else {
      setNear(false);
      setStage('returning');
    }
  };

  const cancelDrag = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (stage !== 'dragging' || !keyRef.current) return;
    returnStart.current.copy(keyRef.current.position);
    timer.current = 0;
    setNear(false);
    setStage('returning');
  };

  useFrame((state, delta) => {
    const key = keyRef.current;
    const lid = lidRef.current;
    if (!key || !lid) return;

    const reducedScale = prefersReducedMotion ? 0.35 : 1;
    const easing = 1 - Math.exp(-delta * 16);

    if (stage === 'idle') {
      key.position.x = KEY_CONFIG.home[0];
      key.position.y = KEY_CONFIG.home[1] + Math.sin(state.clock.elapsedTime * KEY_CONFIG.floatFrequency) * KEY_CONFIG.floatAmplitude * reducedScale;
      key.position.z = KEY_CONFIG.home[2];
      key.rotation.z = 0.08;
      key.rotation.y = Math.sin(state.clock.elapsedTime * KEY_CONFIG.rotationSpeed) * 0.045 * reducedScale;
      const scale = KEY_CONFIG.scale * (keyHovered ? KEY_CONFIG.hoverScale : 1);
      key.scale.lerp(scratch.current.setScalar(scale), easing);
    } else if (stage === 'dragging') {
      key.position.lerp(dragTarget.current, 1 - Math.exp(-delta * KEY_CONFIG.dragDamping));
      key.rotation.z = THREE.MathUtils.lerp(key.rotation.z, THREE.MathUtils.clamp((dragTarget.current.y - key.position.y) * 0.75, -0.18, 0.18) + 0.08, easing);
      key.rotation.y = THREE.MathUtils.lerp(key.rotation.y, THREE.MathUtils.clamp((dragTarget.current.x - key.position.x) * 0.5, -0.16, 0.16), easing);
    } else if (stage === 'returning') {
      timer.current += delta;
      const t = THREE.MathUtils.smoothstep(timer.current / (prefersReducedMotion ? 0.25 : 0.58), 0, 1);
      key.position.lerpVectors(returnStart.current, homeTarget, t);
      key.rotation.z = THREE.MathUtils.lerp(key.rotation.z, 0.08, easing);
      key.rotation.y = THREE.MathUtils.lerp(key.rotation.y, 0, easing);
      if (t >= 1) { setStage('idle'); onInteractionBusyChange(false); }
    } else if (stage === 'unlocking') {
      timer.current += delta;
      const t = THREE.MathUtils.smoothstep(timer.current / (prefersReducedMotion ? 0.38 : TREASURE_CONFIG.unlockDuration), 0, 1);
      unlockTarget.current.copy(lockWorld).add(scratch.current.set(-KEY_CONFIG.tip[0] * KEY_CONFIG.scale, 0, 0.012));
      key.position.lerpVectors(returnStart.current, unlockTarget.current, t);
      key.rotation.z = THREE.MathUtils.lerp(0.08, Math.PI / 2 + 0.08, t);
      if (t >= 1) { timer.current = 0; setStage('opening'); }
    } else if (stage === 'opening') {
      timer.current += delta;
      const t = THREE.MathUtils.smoothstep(timer.current / (prefersReducedMotion ? 0.45 : TREASURE_CONFIG.lidOpenDuration), 0, 1);
      const overshoot = t > 0.86 ? Math.sin(((t - 0.86) / 0.14) * Math.PI) * 0.035 : 0;
      lid.rotation.x = TREASURE_CONFIG.chest.lidOpenRadians * t - overshoot;
      if (t >= 1) { timer.current = 0; fadeTriggered.current = false; setStage('fading'); }
    } else if (stage === 'fading') {
      timer.current += delta;
      if (!fadeTriggered.current) { fadeTriggered.current = true; onFadeStart(); }
      if (timer.current >= (prefersReducedMotion ? 0.45 : TREASURE_CONFIG.fadeDuration)) {
        setStage('playing');
        onOpenClip();
      }
    } else if (stage === 'resetting') {
      timer.current += delta;
      const t = THREE.MathUtils.smoothstep(timer.current / (prefersReducedMotion ? 0.3 : TREASURE_CONFIG.resetDuration), 0, 1);
      lid.rotation.x = THREE.MathUtils.lerp(TREASURE_CONFIG.chest.lidOpenRadians, 0, t);
      unlockTarget.current.copy(lockWorld).add(scratch.current.set(-KEY_CONFIG.tip[0] * KEY_CONFIG.scale, 0, 0.012));
      key.position.lerpVectors(unlockTarget.current, homeTarget, t);
      key.rotation.z = THREE.MathUtils.lerp(Math.PI / 2 + 0.08, 0.08, t);
      if (t >= 1) { timer.current = 0; fadeTriggered.current = false; setStage('idle'); onInteractionBusyChange(false); }
    }

    if (glowRef.current) {
      const base = stage === 'opening' || stage === 'fading' || stage === 'playing'
        ? 1.2
        : nearChest ? CHEST_CONFIG.nearGlowIntensity
          : chestHovered ? CHEST_CONFIG.hoverGlowIntensity
            : CHEST_CONFIG.glowIntensity;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, base + Math.sin(state.clock.elapsedTime * 2.3) * 0.035, easing);
    }
    if (keyGlowRef.current) {
      const target = keyHovered && stage === 'idle' ? KEY_CONFIG.hoverGlow : KEY_CONFIG.idleGlow;
      keyGlowRef.current.intensity = THREE.MathUtils.lerp(keyGlowRef.current.intensity, target, easing);
    }

    // HTML labels follow 3D anchors in screen space; this avoids portal/occlusion glitches.
    key.updateMatrix();
    key.updateMatrixWorld(true);
    keyLabelWorld.current.copy(keyLabelLocal).applyMatrix4(key.matrixWorld);
    placeScreenLabel(keyLabelRef.current, keyLabelWorld.current, promptTextFor(stage, keyHovered), !isReading && !['fading', 'playing', 'resetting'].includes(stage), camera, size, labelNdc.current);
    chestLabelWorld.current.copy(chestLabelLocal).add(chestRootPosition);
    placeScreenLabel(chestLabelRef.current, chestLabelWorld.current, nearChest ? 'THẢ CHÌA ĐỂ MỞ' : 'Xem clip ở ĐÂY', showChestPrompt && !isReading && !['unlocking', 'opening', 'fading', 'playing', 'resetting'].includes(stage), camera, size, labelNdc.current);
  });

  const showChestPrompt = chestHovered || nearChest;
  return (
    <>
      <TreasureChestModel
        lidRef={lidRef}
        glowRef={glowRef}
        hovered={showChestPrompt}
        opened={stage === 'opening' || stage === 'fading' || stage === 'playing'}
        onHover={setChestHovered}
      />
      {nearChest && (
        <mesh position={lockWorld} renderOrder={4}>
          <torusGeometry args={[0.076, 0.006, 8, 32]} />
          <meshBasicMaterial color="#F0C66B" transparent opacity={0.72} depthWrite={false} />
        </mesh>
      )}
      {stage === 'opening' || stage === 'fading' || stage === 'playing' ? (
        <Sparkles count={prefersReducedMotion ? 5 : 20} scale={[0.65, 0.7, 0.7]} size={2.2} speed={prefersReducedMotion ? 0.05 : 0.28} color="#F2C56B" opacity={0.8} />
      ) : null}
      <group
        ref={keyRef}
        position={KEY_CONFIG.home}
        scale={KEY_CONFIG.scale}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={cancelDrag}
        onPointerOver={(event) => {
          event.stopPropagation();
          if (stage === 'idle') {
            setKeyHovered(true);
            onInteractionBusyChange(true);
          }
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (stage === 'idle') {
            setKeyHovered(false);
            onInteractionBusyChange(false);
          }
        }}
      >
        {/* A quiet, camera-facing target keeps the fine key silhouette easy to grab. */}
        <mesh position={[0.04, 0.02, 0.045]}>
          <boxGeometry args={[0.56, 0.3, 0.06]} />
          <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
        </mesh>
        <TreasureKeyModel />
        <pointLight ref={keyGlowRef} position={[0, 0.02, 0.22]} color="#FFE0A0" intensity={KEY_CONFIG.idleGlow} distance={0.9} decay={2} />
        <pointLight position={[-0.15, 0.12, -0.06]} color="#FFCA68" intensity={0.45} distance={0.8} decay={2} />
        {/* Bóng mờ chiếu lên vách kệ sau chìa khóa */}
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[0.52, 0.26]} />
          <meshBasicMaterial color="#0A0503" transparent opacity={0.38} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

function promptTextFor(stage: InteractionStage, keyHovered: boolean) {
  if (stage === 'dragging') return 'Đưa đầu chìa đến ổ khóa';
  return keyHovered ? 'HÃY KÉO VÀO RƯƠNG' : 'KHÓA MỞ CLIP';
}
