import * as THREE from 'three';
import { CONFIG } from '../config';

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  public targetLookAt = new THREE.Vector3(...CONFIG.camera.restTarget);
  public currentLookAt = new THREE.Vector3(...CONFIG.camera.restTarget);

  // Parallax offsets
  private mouseTargetX: number = 0;
  private mouseTargetY: number = 0;
  private mouseCurrentX: number = 0;
  private mouseCurrentY: number = 0;

  // Base positions
  public basePosition = new THREE.Vector3(...CONFIG.camera.restPosition);
  public dollyTargetPos = new THREE.Vector3(...CONFIG.camera.restPosition);
  public currentDollyPos = new THREE.Vector3(...CONFIG.camera.restPosition);

  // Reduced motion
  public reducedMotion: boolean = false;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(CONFIG.camera.restFov, aspect, 0.1, 50);
    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(this.targetLookAt);

    this.checkReducedMotion();
    this.applyShiftLens();
  }

  private checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  /**
   * Emulates an architectural tilt-shift lens so vertical lines stay parallel.
   */
  public applyShiftLens() {
    const height = 1000;
    const width = 1000 * this.camera.aspect;
    const shiftY = height * CONFIG.camera.filmOffsetY;
    this.camera.setViewOffset(width, height, 0, -shiftY, width, height);
  }

  public updateAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.applyShiftLens();
  }

  /**
   * Pointer movement for idle parallax.
   */
  public onPointerMove(normalizedX: number, normalizedY: number) {
    if (this.reducedMotion) return;
    this.mouseTargetX = normalizedX;
    this.mouseTargetY = normalizedY;
  }

  /**
   * Dollies camera closer toward a target shelf bay during book pull.
   */
  public setDollyTarget(bayX: number, isPulling: boolean) {
    if (isPulling) {
      // Gentle dolly in toward that bay
      this.dollyTargetPos.set(bayX * 0.35, 1.25, 4.4);
      this.targetLookAt.set(bayX * 0.25, 1.22, 0);
    } else {
      // Return to wide rest view
      this.dollyTargetPos.set(...CONFIG.camera.restPosition);
      this.targetLookAt.set(...CONFIG.camera.restTarget);
    }
  }

  public update(delta: number) {
    // Parallax damping
    const damping = CONFIG.camera.mouseParallax.damping;
    this.mouseCurrentX += (this.mouseTargetX - this.mouseCurrentX) * damping;
    this.mouseCurrentY += (this.mouseTargetY - this.mouseCurrentY) * damping;

    // Dolly position easing
    this.currentDollyPos.lerp(this.dollyTargetPos, 0.08);
    this.currentLookAt.lerp(this.targetLookAt, 0.08);

    // Apply parallax offset
    const maxOffset = CONFIG.camera.mouseParallax.maxOffsetM;
    const px = this.mouseCurrentX * maxOffset;
    const py = -this.mouseCurrentY * maxOffset * 0.7;

    this.camera.position.set(
      this.currentDollyPos.x + px,
      this.currentDollyPos.y + py,
      this.currentDollyPos.z
    );

    this.camera.lookAt(this.currentLookAt);
  }
}
