import * as THREE from 'three';
import { HeroBookData } from '../types/books';
import {
  createHeroCoverTexture,
  createPageEdgeTexture,
} from '../materials/proceduralTextures';

/**
 * Adjusts UVs of a BoxGeometry face so it maps to a specific sub-rectangle [u0, v0, u1, v1] of a texture.
 */
function remapBoxFaceUV(geo: THREE.BufferGeometry, faceIndex: number, u0: number, v0: number, u1: number, v1: number) {
  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
  // In BoxGeometry, each face has 4 vertices (2 triangles)
  // Face 0: +X, Face 1: -X, Face 2: +Y, Face 3: -Y, Face 4: +Z, Face 5: -Z
  const startVert = faceIndex * 4;
  uvAttr.setXY(startVert + 0, u0, v1);
  uvAttr.setXY(startVert + 1, u1, v1);
  uvAttr.setXY(startVert + 2, u0, v0);
  uvAttr.setXY(startVert + 3, u1, v0);
  uvAttr.needsUpdate = true;
}

/**
 * Remaps cylinder UVs horizontally to [u0, u1].
 */
function remapCylinderUV(geo: THREE.BufferGeometry, u0: number, u1: number) {
  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
  const count = uvAttr.count;
  for (let i = 0; i < count; i++) {
    const rawU = uvAttr.getX(i);
    const remappedU = u0 + rawU * (u1 - u0);
    uvAttr.setX(i, remappedU);
  }
  uvAttr.needsUpdate = true;
}

/**
 * Creates an articulated 3-part book mesh for Hero books.
 * Coordinate conventions:
 * - Spine faces +Z (outward toward the room when resting on the shelf).
 * - Page block is recessed inside and extends toward -Z (into the bookcase).
 * - Front cover is at +X, Back cover is at -X.
 * - Rotating around Y by -90 deg (-PI/2) faces the front cover directly to the viewer.
 */
export function createHeroBookMesh(book: HeroBookData): THREE.Group {
  const group = new THREE.Group();
  group.name = `hero_book_${book.id}`;

  const { height, depth, thickness } = book;
  const boardThickness = 0.0028; // 2.8mm thick hardcover board
  const overhang = 0.0032; // 3.2mm overhang
  const pageH = height - overhang * 2;
  const pageD = depth - overhang - 0.004;
  const pageT = thickness - boardThickness * 2;

  // Textures
  const { map: coverMap, roughnessMap: coverRoughMap } = createHeroCoverTexture(book);
  const pageMap = createPageEdgeTexture();

  // Cover Material with PBR gold foil sheen
  const coverMaterial = new THREE.MeshPhysicalMaterial({
    map: coverMap,
    roughnessMap: coverRoughMap,
    roughness: 0.38,
    metalness: 0.18,
    clearcoat: 0.35,
    clearcoatRoughness: 0.15,
  });

  // Page edge paper material
  const pageMaterial = new THREE.MeshStandardMaterial({
    map: pageMap,
    roughness: 0.88,
    color: 0xf3ede2,
  });

  // Headband cloth material
  const headbandMaterial = new THREE.MeshStandardMaterial({
    color: book.foilColor,
    roughness: 0.5,
    metalness: 0.3,
  });

  // 1. Inset Page Block
  const pageGeo = new THREE.BoxGeometry(pageT, pageH, pageD);
  const pageMesh = new THREE.Mesh(pageGeo, pageMaterial);
  pageMesh.position.set(0, 0, -0.004);
  pageMesh.castShadow = true;
  pageMesh.receiveShadow = true;
  group.add(pageMesh);

  // 2. Cover Boards:
  // Back Cover (at -X, outside face is -X which is face 1)
  // Texture layout: Back Cover [0.0 to 0.44], Spine [0.44 to 0.56], Front Cover [0.56 to 1.0]
  const backCoverGeo = new THREE.BoxGeometry(boardThickness, height, depth);
  remapBoxFaceUV(backCoverGeo, 1, 0.0, 0.0, 0.44, 1.0);
  const backCover = new THREE.Mesh(backCoverGeo, coverMaterial);
  backCover.position.set(-thickness / 2 + boardThickness / 2, 0, 0);
  backCover.castShadow = true;
  backCover.receiveShadow = true;
  group.add(backCover);

  // Front Cover (at +X, outside face is +X which is face 0)
  const frontCoverGeo = new THREE.BoxGeometry(boardThickness, height, depth);
  remapBoxFaceUV(frontCoverGeo, 0, 0.56, 0.0, 1.0, 1.0);
  const frontCover = new THREE.Mesh(frontCoverGeo, coverMaterial);
  frontCover.position.set(thickness / 2 - boardThickness / 2, 0, 0);
  frontCover.castShadow = true;
  frontCover.receiveShadow = true;
  group.add(frontCover);

  // Rounded Spine facing +Z (outward toward room)
  const spineRadius = thickness / 2;
  const spineGeo = new THREE.CylinderGeometry(
    spineRadius,
    spineRadius,
    height,
    20,
    1,
    true,
    0,
    Math.PI
  );
  remapCylinderUV(spineGeo, 0.44, 0.56);
  const spineMesh = new THREE.Mesh(spineGeo, coverMaterial);
  spineMesh.position.set(0, 0, depth / 2 - spineRadius);
  spineMesh.rotation.y = -Math.PI / 2;
  spineMesh.castShadow = true;
  spineMesh.receiveShadow = true;
  group.add(spineMesh);

  // 3. Headband cloth accents
  const headbandGeo = new THREE.CylinderGeometry(
    spineRadius * 0.96,
    spineRadius * 0.96,
    0.004,
    16,
    1,
    false,
    0,
    Math.PI
  );
  const topHeadband = new THREE.Mesh(headbandGeo, headbandMaterial);
  topHeadband.position.set(0, height / 2 - 0.003, depth / 2 - spineRadius);
  topHeadband.rotation.y = -Math.PI / 2;
  group.add(topHeadband);

  const botHeadband = topHeadband.clone();
  botHeadband.position.y = -height / 2 + 0.003;
  group.add(botHeadband);

  // Store metadata
  group.userData = {
    heroBookData: book,
    isHeroBook: true,
    restingPosition: new THREE.Vector3(),
    restingRotation: new THREE.Euler(),
  };

  return group;
}
