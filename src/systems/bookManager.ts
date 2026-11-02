import * as THREE from 'three';
import { CONFIG } from '../config';
import { HERO_BOOKS } from '../data/heroBooks';
import { HeroBookData, BookInteractionState } from '../types/books';
import { createHeroBookMesh } from '../geometry/bookGeometry';
import { createPageEdgeTexture } from '../materials/proceduralTextures';

export interface BookManagerCallbacks {
  onHoverChange: (book: HeroBookData | null) => void;
  onStateChange: (state: BookInteractionState, book: HeroBookData | null) => void;
}

export class BookManager {
  public booksGroup: THREE.Group;
  public heroBookMeshes: Map<string, THREE.Group> = new Map();
  public decorativeMeshes: THREE.InstancedMesh[] = [];
  public adjacentNeighborMeshes: Map<string, { right?: THREE.Mesh }> = new Map();

  // Interaction state
  public currentState: BookInteractionState = 'idle';
  public hoveredBook: HeroBookData | null = null;
  public activeBook: HeroBookData | null = null;
  public activeBookMesh: THREE.Group | null = null;

  // Animation timelines & progress
  public animProgress: number = 0; // 0 to 1
  public isReversing: boolean = false;
  public animStartTime: number = 0;
  public animDuration: number = CONFIG.timings.totalPullDuration;

  // Transform caches
  private restPosition = new THREE.Vector3();
  private restRotation = new THREE.Euler();
  private heldPosition = new THREE.Vector3();
  private heldRotation = new THREE.Euler();
  private currentInterpolatedPos = new THREE.Vector3();
  private currentInterpolatedRot = new THREE.Euler();

  // Arcball rotation in held state
  public arcballYaw: number = 0;
  public arcballPitch: number = 0;
  public arcballZoom: number = 1.0;
  private targetYaw: number = 0;
  private targetPitch: number = 0;
  private targetZoom: number = 1.0;
  private isDraggingArcball: boolean = false;
  private lastPointerPos = { x: 0, y: 0 };

  // Callbacks to UI
  private callbacks: BookManagerCallbacks;

  // Reduced motion preference
  public reducedMotion: boolean = false;

  constructor(callbacks: BookManagerCallbacks) {
    this.callbacks = callbacks;
    this.booksGroup = new THREE.Group();
    this.booksGroup.name = 'all_books_manager';

    this.checkReducedMotion();
    this.buildBookshelfContents();
  }

  private checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  /**
   * Generates rich procedural spine textures for decorative book batches.
   */
  private createDecorativeSpineTexture(baseColor: string, accentColor: string, spinePattern: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base tone
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 128, 512);

    // Fine cloth weave or leather texture simulation
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let i = 0; i < 128; i += 3) {
      ctx.fillRect(i, 0, 1, 512);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let j = 0; j < 512; j += 4) {
      ctx.fillRect(0, j, 128, 1);
    }

    // Spine edge shading for rounded look
    const edgeGrad = ctx.createLinearGradient(0, 0, 128, 0);
    edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    edgeGrad.addColorStop(0.18, 'rgba(0, 0, 0, 0.0)');
    edgeGrad.addColorStop(0.82, 'rgba(0, 0, 0, 0.0)');
    edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, 128, 512);

    // Gold foil bands
    ctx.fillStyle = accentColor;
    const topY = 40 + spinePattern * 8;
    const botY = 460 - spinePattern * 8;
    ctx.fillRect(10, topY, 108, 3);
    ctx.fillRect(10, topY + 7, 108, 1.5);
    ctx.fillRect(10, botY, 108, 1.5);
    ctx.fillRect(10, botY + 7, 108, 3);

    // Title box
    const boxY = 120 + spinePattern * 15;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(14, boxY, 100, 160);

    // Simulated embossed title lines
    const lineCount = 3 + (spinePattern % 3);
    for (let l = 0; l < lineCount; l++) {
      const lw = 60 + Math.sin(l * 1.5) * 20;
      ctx.fillRect((128 - lw) / 2, boxY + 30 + l * 20, lw, 3.5);
    }

    // Raised spine ribs (horizontal leather cords)
    const ribs = [80, 100, 300, 320, 420];
    ribs.forEach((ry) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(6, ry + 2, 116, 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(6, ry - 1, 116, 1.5);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Generates ~800 decorative books in 6 distinct aesthetic batches and places 12 hero books.
   */
  private buildBookshelfContents() {
    const { shelf } = CONFIG;
    const bayWidth = (shelf.totalWidth - shelf.uprightThickness * (shelf.bays + 1)) / shelf.bays;
    const shelfYOffset = shelf.plinthHeight;
    const usableHeight = shelf.totalHeight - shelf.plinthHeight - shelf.crownHeight;
    const shelfSpacing = usableHeight / (shelf.shelvesPerBay - 1);

    // Palettes for 6 decorative batches
    const batchPalettes = [
      { base: '#1b324a', accent: '#e8c56c', roughness: 0.45 }, // Navy cloth & gold
      { base: '#4a1e23', accent: '#f0d278', roughness: 0.42 }, // Crimson cloth & gold
      { base: '#1c3e32', accent: '#dfc264', roughness: 0.48 }, // Forest buckram
      { base: '#7c4d21', accent: '#f7d884', roughness: 0.38 }, // Ochre canvas
      { base: '#2b1d16', accent: '#d4af37', roughness: 0.35 }, // Dark leather
      { base: '#263b38', accent: '#e2caa0', roughness: 0.50 }, // Teal linen
    ];

    // Create 6 InstancedMeshes
    const decGeo = new THREE.BoxGeometry(0.03, 0.235, 0.16);
    const batchMeshes: THREE.InstancedMesh[] = [];
    const batchDummyCounts: number[] = [0, 0, 0, 0, 0, 0];
    const maxPerBatch = 200;

    batchPalettes.forEach((palette, idx) => {
      const spineTex = this.createDecorativeSpineTexture(palette.base, palette.accent, idx);
      const mat = new THREE.MeshStandardMaterial({
        map: spineTex,
        roughness: palette.roughness,
        metalness: 0.15,
      });
      const im = new THREE.InstancedMesh(decGeo, mat, maxPerBatch);
      im.castShadow = true;
      im.receiveShadow = true;
      batchMeshes.push(im);
      this.decorativeMeshes.push(im);
      this.booksGroup.add(im);
    });

    const dummy = new THREE.Object3D();

    // Map of hero books keyed by `bay_shelf_slot`
    const heroSlotMap = new Map<string, HeroBookData>();
    HERO_BOOKS.forEach((hb) => {
      heroSlotMap.set(`${hb.bay}_${hb.shelf}_${hb.slotIndex}`, hb);
    });

    let globalBookIndex = 0;

    for (let b = 0; b < shelf.bays; b++) {
      const bayLeftX =
        -shelf.totalWidth / 2 +
        shelf.uprightThickness +
        b * (bayWidth + shelf.uprightThickness);

      for (let s = 0; s < shelf.shelvesPerBay - 1; s++) {
        // Shelf surface Y
        const shelfY = shelfYOffset + s * shelfSpacing + shelf.shelfThickness / 2;

        let currentSlotX = 0.025; // 2.5cm margin from left upright
        let slotIndex = 0;

        while (currentSlotX < bayWidth - 0.04) {
          const slotKey = `${b}_${s}_${slotIndex}`;
          const isHeroSlot = heroSlotMap.has(slotKey);

          if (isHeroSlot) {
            const heroData = heroSlotMap.get(slotKey)!;
            const bookMesh = createHeroBookMesh(heroData);

            const bookCenterX = bayLeftX + currentSlotX + heroData.thickness / 2;
            const bookCenterY = shelfY + heroData.height / 2;
            const bookCenterZ = 0.04;

            bookMesh.position.set(bookCenterX, bookCenterY, bookCenterZ);
            bookMesh.userData.restingPosition.copy(bookMesh.position);
            bookMesh.userData.restingRotation.copy(bookMesh.rotation);

            this.booksGroup.add(bookMesh);
            this.heroBookMeshes.set(heroData.id, bookMesh);

            // Create adjacent physical reaction mesh for realistic neighbor lean
            const adjMat = new THREE.MeshStandardMaterial({ color: 0x2b1c14, roughness: 0.5 });
            const adjGeo = new THREE.BoxGeometry(0.028, heroData.height * 0.96, 0.155);
            const adjMesh = new THREE.Mesh(adjGeo, adjMat);
            adjMesh.position.set(bookCenterX + heroData.thickness / 2 + 0.016, bookCenterY, bookCenterZ);
            adjMesh.castShadow = true;
            this.booksGroup.add(adjMesh);
            this.adjacentNeighborMeshes.set(heroData.id, { right: adjMesh });

            currentSlotX += heroData.thickness + 0.003;
          } else {
            // Distribute across the 6 batches
            const batchIdx = (globalBookIndex * 7 + (slotIndex % 3)) % 6;
            const instMesh = batchMeshes[batchIdx];
            const currentCount = batchDummyCounts[batchIdx];

            const bookThickness = 0.022 + ((globalBookIndex * 3) % 4) * 0.005;
            const bookHeight = 0.21 + ((globalBookIndex * 5) % 6) * 0.007;
            const bookDepth = 0.155 + (slotIndex % 3) * 0.004;

            const instX = bayLeftX + currentSlotX + bookThickness / 2;
            const instY = shelfY + bookHeight / 2;
            const instZ = 0.035 + ((slotIndex * 3) % 4) * 0.003;

            dummy.position.set(instX, instY, instZ);
            dummy.scale.set(bookThickness / 0.03, bookHeight / 0.235, bookDepth / 0.16);

            // Subtle natural lean on random books (0.5 to 2.5 degrees)
            const leanChance = (globalBookIndex * 11) % 12;
            if (leanChance === 0 && currentSlotX < bayWidth - 0.08) {
              dummy.rotation.z = (Math.PI / 180) * 2.2;
            } else if (leanChance === 11) {
              dummy.rotation.z = -(Math.PI / 180) * 1.8;
            } else {
              dummy.rotation.z = 0;
            }

            dummy.updateMatrix();
            if (currentCount < maxPerBatch) {
              instMesh.setMatrixAt(currentCount, dummy.matrix);
              batchDummyCounts[batchIdx]++;
            }

            currentSlotX += bookThickness + 0.003;
          }

          slotIndex++;
          globalBookIndex++;
        }
      }
    }

    // Finalize counts
    batchMeshes.forEach((im, idx) => {
      im.count = batchDummyCounts[idx];
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
    });
  }

  /**
   * Hover handling (slides out 8mm in 180ms).
   */
  public handleHover(bookId: string | null) {
    if (this.currentState !== 'idle' && this.currentState !== 'hover') return;

    if (!bookId) {
      if (this.hoveredBook && this.activeBookMesh) {
        // Slide back to rest
        this.activeBookMesh.position.copy(this.activeBookMesh.userData.restingPosition);
      }
      this.hoveredBook = null;
      this.currentState = 'idle';
      this.callbacks.onHoverChange(null);
      return;
    }

    const mesh = this.heroBookMeshes.get(bookId);
    if (!mesh) return;

    this.hoveredBook = mesh.userData.heroBookData;
    this.activeBookMesh = mesh;
    this.currentState = 'hover';

    // Slide out along shelf normal (positive Z)
    const restPos = mesh.userData.restingPosition as THREE.Vector3;
    mesh.position.set(restPos.x, restPos.y, restPos.z + CONFIG.timings.hoverDistance);

    this.callbacks.onHoverChange(this.hoveredBook);
  }

  /**
   * Triggers the full physical 2.2s pull-out sequence.
   */
  public pullBook(bookId: string, cameraPosition: THREE.Vector3) {
    const mesh = this.heroBookMeshes.get(bookId);
    if (!mesh) return;

    this.activeBook = mesh.userData.heroBookData;
    this.activeBookMesh = mesh;
    this.isReversing = false;
    this.currentState = 'pulling';
    this.animStartTime = performance.now();
    this.animDuration = this.reducedMotion
      ? CONFIG.timings.reducedMotionDuration
      : CONFIG.timings.totalPullDuration;
    this.animProgress = 0;

    // Record rest transform
    this.restPosition.copy(mesh.userData.restingPosition);
    this.restRotation.copy(mesh.userData.restingRotation);

    // Calculate held transform relative to the camera
    // Positioned slightly left of camera centerline (-0.08) so info panel fits comfortably on right
    this.heldPosition.set(
      cameraPosition.x - 0.16,
      1.24,
      cameraPosition.z - CONFIG.camera.heldDistance
    );

    // Rotated so front cover faces the viewer
    this.heldRotation.set(
      -(CONFIG.camera.heldTiltDeg * Math.PI) / 180,
      -Math.PI / 2, // Front cover faces viewer
      0
    );

    // Reset arcball orientation
    this.arcballYaw = 0;
    this.arcballPitch = 0;
    this.arcballZoom = 1.0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.targetZoom = 1.0;

    this.callbacks.onStateChange('pulling', this.activeBook);
  }

  /**
   * Smoothly returns the book to its shelf slot (~1.6s). Interruptible.
   */
  public returnBook() {
    if (!this.activeBookMesh || this.currentState === 'idle') return;

    this.isReversing = true;
    this.currentState = 'returning';
    this.animStartTime = performance.now();
    this.animDuration = this.reducedMotion
      ? CONFIG.timings.reducedMotionDuration
      : CONFIG.timings.returnDuration;

    this.callbacks.onStateChange('returning', this.activeBook);
  }

  /**
   * Pointer interactions for Arcball rotation and inspection in HELD state.
   */
  public onPointerDown(x: number, y: number) {
    if (this.currentState !== 'held') return;
    this.isDraggingArcball = true;
    this.lastPointerPos = { x, y };
  }

  public onPointerMove(x: number, y: number) {
    if (!this.isDraggingArcball || this.currentState !== 'held') return;

    const dx = x - this.lastPointerPos.x;
    const dy = y - this.lastPointerPos.y;
    this.lastPointerPos = { x, y };

    const sensitivity = 0.005;
    this.targetYaw += dx * sensitivity;
    this.targetPitch += dy * sensitivity;

    // Clamp pitch
    const maxPitch = CONFIG.arcball.maxPitch;
    this.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, this.targetPitch));
  }

  public onPointerUp() {
    this.isDraggingArcball = false;
  }

  public onWheelZoom(deltaY: number) {
    if (this.currentState !== 'held') return;
    const zoomFactor = deltaY > 0 ? 0.95 : 1.05;
    this.targetZoom = Math.max(
      CONFIG.arcball.zoomMin,
      Math.min(CONFIG.arcball.zoomMax, this.targetZoom * zoomFactor)
    );
  }

  /**
   * Per-frame animation update for pull-out, held breathing, and physical neighbor reactions.
   */
  public update(time: number, delta: number, cameraPosition: THREE.Vector3) {
    if (!this.activeBookMesh) return;

    // 1. PULLING ANIMATION
    if (this.currentState === 'pulling') {
      const elapsed = performance.now() - this.animStartTime;
      const rawT = Math.min(1.0, elapsed / this.animDuration);
      // Expo-out smooth curve
      const t = rawT === 1.0 ? 1.0 : 1 - Math.pow(2, -10 * rawT);
      this.animProgress = t;

      this.interpolateBookTrajectory(t, cameraPosition);

      // Neighbor reaction: adjacent book leans into vacated slot
      if (this.activeBook) {
        const neighbor = this.adjacentNeighborMeshes.get(this.activeBook.id);
        if (neighbor?.right) {
          neighbor.right.rotation.z = Math.sin(t * Math.PI) * 0.045; // ~2.5 deg lean
        }
      }

      if (rawT >= 1.0) {
        this.currentState = 'held';
        this.callbacks.onStateChange('held', this.activeBook);
      }
    }

    // 2. RETURNING ANIMATION
    else if (this.currentState === 'returning') {
      const elapsed = performance.now() - this.animStartTime;
      const rawT = Math.min(1.0, elapsed / this.animDuration);
      // Ease out return
      const t = 1.0 - (rawT === 1.0 ? 1.0 : 1 - Math.pow(2, -8 * rawT));
      this.animProgress = t;

      this.interpolateBookTrajectory(t, cameraPosition);

      // Settle neighbor book back
      if (this.activeBook) {
        const neighbor = this.adjacentNeighborMeshes.get(this.activeBook.id);
        if (neighbor?.right) {
          neighbor.right.rotation.z = t * 0.045;
        }
      }

      if (rawT >= 1.0) {
        this.currentState = 'idle';
        this.activeBookMesh.position.copy(this.restPosition);
        this.activeBookMesh.rotation.copy(this.restRotation);
        this.activeBookMesh = null;
        this.activeBook = null;
        this.callbacks.onStateChange('idle', null);
      }
    }

    // 3. HELD STATE — Handheld sway & Arcball inspection
    else if (this.currentState === 'held') {
      // Damped arcball orientation
      const damping = CONFIG.arcball.inertiaDamping;
      this.arcballYaw += (this.targetYaw - this.arcballYaw) * (1 - damping);
      this.arcballPitch += (this.targetPitch - this.arcballPitch) * (1 - damping);
      this.arcballZoom += (this.targetZoom - this.arcballZoom) * (1 - damping);

      // Handheld gentle sway (~0.22 Hz breathing)
      let swayRot = 0;
      let swayY = 0;
      if (!this.reducedMotion) {
        const { freq, rotAmp, posAmp } = CONFIG.camera.handheldSway;
        swayRot = Math.sin(time * freq * Math.PI * 2) * rotAmp;
        swayY = Math.cos(time * freq * Math.PI * 2) * posAmp;
      }

      // Recompute held position relative to current camera
      this.heldPosition.set(
        cameraPosition.x - 0.16,
        1.24 + swayY,
        cameraPosition.z - CONFIG.camera.heldDistance
      );

      this.activeBookMesh.position.copy(this.heldPosition);
      this.activeBookMesh.scale.setScalar(this.arcballZoom);

      this.activeBookMesh.rotation.set(
        this.heldRotation.x + this.arcballPitch,
        this.heldRotation.y + this.arcballYaw + swayRot,
        this.heldRotation.z
      );
    }
  }

  /**
   * Trajectory math: Tilting out -> Sliding along normal -> Lifting -> Arcing to held pose.
   */
  private interpolateBookTrajectory(t: number, cameraPosition: THREE.Vector3) {
    if (!this.activeBookMesh) return;

    // Recalculate heldPosition target to follow current camera
    this.heldPosition.set(
      cameraPosition.x - 0.16,
      1.24,
      cameraPosition.z - CONFIG.camera.heldDistance
    );

    // Stage 1: 0 to 0.45 — Tilt top edge & slide out 13cm
    if (t < 0.45) {
      const subT = t / 0.45;
      const tilt = subT * (CONFIG.timings.bookTiltAngleDeg * Math.PI) / 180;
      const slide = subT * CONFIG.timings.bookSlideDistance;

      this.currentInterpolatedPos.set(
        this.restPosition.x,
        this.restPosition.y,
        this.restPosition.z + slide
      );
      this.currentInterpolatedRot.set(tilt, this.restRotation.y, this.restRotation.z);
    }
    // Stage 2: 0.45 to 1.0 — Lift and travel along curved Bezier path to held pose
    else {
      const subT = (t - 0.45) / 0.55;
      // Start of stage 2
      const startP = new THREE.Vector3(
        this.restPosition.x,
        this.restPosition.y + CONFIG.timings.bookLiftHeight,
        this.restPosition.z + CONFIG.timings.bookSlideDistance
      );

      // Mid-air control point
      const midP = new THREE.Vector3(
        (startP.x + this.heldPosition.x) / 2,
        startP.y + 0.12,
        (startP.z + this.heldPosition.z) / 2 + 0.15
      );

      // Quadratic Bezier interpolation for silky curved path
      const invT = 1 - subT;
      this.currentInterpolatedPos.x =
        invT * invT * startP.x + 2 * invT * subT * midP.x + subT * subT * this.heldPosition.x;
      this.currentInterpolatedPos.y =
        invT * invT * startP.y + 2 * invT * subT * midP.y + subT * subT * this.heldPosition.y;
      this.currentInterpolatedPos.z =
        invT * invT * startP.z + 2 * invT * subT * midP.z + subT * subT * this.heldPosition.z;

      // Rotation interpolate from tilt to held facing
      const startRotX = (CONFIG.timings.bookTiltAngleDeg * Math.PI) / 180;
      this.currentInterpolatedRot.x = THREE.MathUtils.lerp(startRotX, this.heldRotation.x, subT);
      this.currentInterpolatedRot.y = THREE.MathUtils.lerp(0, this.heldRotation.y, subT);
      this.currentInterpolatedRot.z = 0;
    }

    this.activeBookMesh.position.copy(this.currentInterpolatedPos);
    this.activeBookMesh.rotation.copy(this.currentInterpolatedRot);
  }
}
