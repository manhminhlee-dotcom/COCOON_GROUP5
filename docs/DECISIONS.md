# Architectural and Lookdev Decisions

## 1. Scene Pipeline & Renderer Architecture
- **Rendering Environment**: Headless cloud environment lacks native Blender 4.x / GPU Cycles hardware rendering (Debian container without discrete GPU). In compliance with Section 4.1 fallback instructions, high-fidelity procedural geometry, HDR lighting, baked ambient occlusion, and WebGL2 PBR shader compilation are driven directly in Three.js with realistic lightmaps, soft contact shadows, procedural high-density wood/leather/cloth PBR textures, and real-time volumetric sun shafts.
- **Color Pipeline**: ACESFilmic / AgX tone mapping with `outputColorSpace = THREE.SRGBColorSpace`, exposure 1.05. Linear color space math throughout.
- **Ghost-Shadow Rule**: Interactive hero books are separated from static shelf bakes. At rest, hero books match their neighbours with calibrated cavity AO, contact shadows, and real-time sun/sky lighting so there is zero brightness/tone popping when resting vs moving.
- **Architectural Shift Lens**: Implemented via camera projection offset (`filmOffset` / perspective matrix shearing) so the camera positioned at 1.28m looking at a 2.5m tall bookcase keeps vertical lines perfectly parallel, exactly as in high-end architectural interior photography.

## 2. 2D UI Shell Art Direction (Taste Skill & Frontend Design)
- **Art Direction**: Based on the dealt `uneven-photographs` / `quiet-reading-room` direction:
  - Warm off-white literary typography on dark ambient scene (`#f7f3ee` and `#e3ded6`).
  - No decorative AI-slop badges, no neon gradients, no glowing status dots, no thick colored left borders.
  - Primary button in warm book-cloth ochre/amber accent (`#d48834`), used with restraint for the primary action "Rút một cuốn bất kỳ".
  - Vietnamese editorial typography with `Lora` (literary serif) and `Plus Jakarta Sans` (humanist sans-serif).
  - Clean floating info card adjacent to the held book (never occluding the cover or spine), appearing with an expo-out fade-in 300ms after the book reaches held pose.

## 3. Geometry & Realism Micro-Details
- Shelf geometry features a 4-bay honey-oak carcass with 22mm thick shelves, subtle 2.5mm sagging under heavy book loads, rounded bevels on all front uprights and shelf edges to catch rim highlights, recessed back panelling, plinth base (12cm), and crown trim (8cm).
- Books have realistic 3-part construction: rounded spine with hinge groove, 3mm cover overhang past the paper block, slightly curved paper block front edge, and headbands.
- Decorative books (~800 books) are instanced via `InstancedMesh` with high-density procedural spine canvas textures, earthy palette variation, publisher marks, and title typography.
- Hero books (12 books) are independent, fully articulated meshes with dedicated 2048x3072 covers (front, spine, back) with metallic gold foil stamping and normal maps.

## 4. Interaction & Physical Response
- Non-blocking, interruptible timeline using stateful interpolation: if the user clicks return or presses Esc mid-animation, the book reverses smoothly from its current position and orientation without snapping.
- Neighbor books react physically: adjacent book leans 2-4 degrees into the vacated slot when pulled, simulating natural mechanical resting behavior.
- Arcball rotation in held state allows full 360-degree inspection of spine, back cover, and paper block edges with inertial damping and pinch/wheel zoom (+-25%).
