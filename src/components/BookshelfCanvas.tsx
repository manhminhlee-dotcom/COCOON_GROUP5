import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { CONFIG } from '../config';
import { HeroBookData, BookInteractionState } from '../types/books';
import { BookManager } from '../systems/bookManager';
import { CameraRig } from '../systems/cameraRig';
import { buildRoomScene } from '../geometry/roomGeometry';
import { setupLightingAndAtmosphere } from '../systems/lightingAtmosphere';

interface BookshelfCanvasProps {
  onHoverChange: (book: HeroBookData | null) => void;
  onStateChange: (state: BookInteractionState, book: HeroBookData | null) => void;
  onCanvasReady: () => void;
  selectedBookId: string | null;
  interactionState: BookInteractionState;
  onReturnRequest: () => void;
}

export const BookshelfCanvas: React.FC<BookshelfCanvasProps> = ({
  onHoverChange,
  onStateChange,
  onCanvasReady,
  selectedBookId,
  interactionState,
  onReturnRequest,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const bookManagerRef = useRef<BookManager | null>(null);
  const cameraRigRef = useRef<CameraRig | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Renderer
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x120f0c);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 4. Camera Rig with Shift Lens
    const cameraRig = new CameraRig(width / height);
    cameraRigRef.current = cameraRig;

    // 5. Build Room, Furniture, and Props
    const { roomGroup, candleMesh } = buildRoomScene();
    scene.add(roomGroup);

    // 6. Lighting and Atmosphere
    const lightingRig = setupLightingAndAtmosphere(scene);

    // 7. Book Manager (instanced decorative books + 12 hero books)
    const bookManager = new BookManager({
      onHoverChange,
      onStateChange,
    });
    bookManagerRef.current = bookManager;
    scene.add(bookManager.booksGroup);

    // 8. Post-Processing Setup (Bloom & Tone Mapping)
    let composer: EffectComposer | null = null;
    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, cameraRig.camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        CONFIG.atmosphere.bloomStrength,
        CONFIG.atmosphere.bloomRadius,
        CONFIG.atmosphere.bloomThreshold
      );
      composer.addPass(bloomPass);

      const outputPass = new OutputPass();
      composer.addPass(outputPass);
    }

    // 9. Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getRaycastIntersections = (event: MouseEvent | Touch) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRig.camera);
      const heroMeshes = Array.from(bookManager.heroBookMeshes.values());
      return raycaster.intersectObjects(heroMeshes, true);
    };

    const handlePointerMove = (e: MouseEvent) => {
      // Parallax update
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      cameraRig.onPointerMove(normX, normY);

      // Arcball drag in held state
      if (bookManager.currentState === 'held') {
        bookManager.onPointerMove(e.clientX, e.clientY);
        return;
      }

      // Hover check at idle
      if (bookManager.currentState === 'idle' || bookManager.currentState === 'hover') {
        const intersects = getRaycastIntersections(e);
        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData?.isHeroBook && topObj.parent) {
            topObj = topObj.parent;
          }
          if (topObj?.userData?.isHeroBook) {
            renderer.domElement.style.cursor = 'pointer';
            bookManager.handleHover(topObj.userData.heroBookData.id);
            return;
          }
        }
        renderer.domElement.style.cursor = 'default';
        bookManager.handleHover(null);
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (bookManager.currentState === 'held') {
        bookManager.onPointerDown(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = () => {
      bookManager.onPointerUp();
    };

    const handleClick = (e: MouseEvent) => {
      // If book is held and user clicks outside, return it
      if (bookManager.currentState === 'held') {
        // Return book if clicked outside
        const intersects = getRaycastIntersections(e);
        if (intersects.length === 0) {
          bookManager.returnBook();
          cameraRig.setDollyTarget(0, false);
        }
        return;
      }

      if (bookManager.currentState === 'idle' || bookManager.currentState === 'hover') {
        const intersects = getRaycastIntersections(e);
        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData?.isHeroBook && topObj.parent) {
            topObj = topObj.parent;
          }
          if (topObj?.userData?.isHeroBook) {
            const data = topObj.userData.heroBookData as HeroBookData;
            bookManager.pullBook(data.id, cameraRig.camera.position);
            cameraRig.setDollyTarget(topObj.position.x, true);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (bookManager.currentState === 'held') {
        e.preventDefault();
        bookManager.onWheelZoom(e.deltaY);
      }
    };

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      cameraRig.updateAspect(w / h);
      renderer.setSize(w, h);
      composer?.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 10. Pre-warm shaders
    if (!isSoftwareGl) {
      renderer.compile(scene, cameraRig.camera);
    }

    // Notify ready for poster crossfade
    onCanvasReady();

    // 11. Render Loop
    let animationFrameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          animationFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          animationFrameId = window.setTimeout(cb, 80);
        }
      };
      animationFrameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Update systems
      cameraRig.update(delta);
      lightingRig.update(time, delta);
      bookManager.update(time, delta, cameraRig.camera.position);

      // Render
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, cameraRig.camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Cleanup
    return () => {
      if (isSoftwareGl) {
        clearTimeout(animationFrameId);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Handle external book selection (via UI buttons, keyboard, or random picker)
  useEffect(() => {
    if (selectedBookId && bookManagerRef.current && cameraRigRef.current) {
      const mesh = bookManagerRef.current.heroBookMeshes.get(selectedBookId);
      if (mesh) {
        bookManagerRef.current.pullBook(selectedBookId, cameraRigRef.current.camera.position);
        cameraRigRef.current.setDollyTarget(mesh.position.x, true);
      }
    }
  }, [selectedBookId]);

  // Handle external return request
  useEffect(() => {
    if (interactionState === 'returning' && bookManagerRef.current && cameraRigRef.current) {
      bookManagerRef.current.returnBook();
      cameraRigRef.current.setDollyTarget(0, false);
    }
  }, [interactionState]);

  return <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-default" />;
};
