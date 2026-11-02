import * as THREE from 'three';
import { CONFIG } from '../config';
import {
  createWoodTexture,
  createKilimRugTexture,
} from '../materials/proceduralTextures';

/**
 * Builds the complete photographic room scene, bookshelf carcass, and props matching REF_ROOM.png.
 */
export function buildRoomScene(): {
  roomGroup: THREE.Group;
  shelfGroup: THREE.Group;
  candleMesh: THREE.Mesh;
  shelfLampMesh: THREE.Mesh;
  floorLampMesh: THREE.Mesh;
} {
  const roomGroup = new THREE.Group();
  roomGroup.name = 'room_surroundings';

  const shelfGroup = new THREE.Group();
  shelfGroup.name = 'bookshelf_carcass';
  roomGroup.add(shelfGroup);

  const { shelf, room } = CONFIG;
  const { map: woodMap, roughnessMap: woodRoughMap } = createWoodTexture();

  // Honey-Oak material for bookshelf and furniture
  const woodMaterial = new THREE.MeshStandardMaterial({
    map: woodMap,
    roughnessMap: woodRoughMap,
    roughness: shelf.woodRoughness,
    metalness: shelf.woodMetalness,
    color: new THREE.Color(shelf.woodColor),
  });

  // Darker Walnut floor material
  const floorWoodMaterial = new THREE.MeshStandardMaterial({
    map: woodMap,
    roughness: 0.36,
    metalness: 0.06,
    color: new THREE.Color('#382214'), // Rich dark walnut
  });

  // Warm painted wall material (warm creamy eggshell)
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(room.wallColor),
    roughness: 0.88,
    metalness: 0.0,
  });

  // ----------------------------------------------------
  // 1. BOOKSHELF CARCASS (Centered on back wall)
  // ----------------------------------------------------
  const bayWidth = (shelf.totalWidth - shelf.uprightThickness * (shelf.bays + 1)) / shelf.bays;
  const shelfYOffset = shelf.plinthHeight;
  const usableHeight = shelf.totalHeight - shelf.plinthHeight - shelf.crownHeight;
  const shelfSpacing = usableHeight / (shelf.shelvesPerBay - 1);

  // Plinth base (bottom kick plate)
  const plinthGeo = new THREE.BoxGeometry(shelf.totalWidth, shelf.plinthHeight, shelf.totalDepth);
  const plinth = new THREE.Mesh(plinthGeo, woodMaterial);
  plinth.position.set(0, shelf.plinthHeight / 2, 0);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  shelfGroup.add(plinth);

  // Crown molding (top trim)
  const crownGeo = new THREE.BoxGeometry(shelf.totalWidth + 0.08, shelf.crownHeight, shelf.totalDepth + 0.05);
  const crown = new THREE.Mesh(crownGeo, woodMaterial);
  crown.position.set(0, shelf.totalHeight - shelf.crownHeight / 2, 0);
  crown.castShadow = true;
  crown.receiveShadow = true;
  shelfGroup.add(crown);

  // Back panel
  const backPanelGeo = new THREE.BoxGeometry(shelf.totalWidth, shelf.totalHeight, shelf.backPanelDepth);
  const backPanel = new THREE.Mesh(backPanelGeo, woodMaterial);
  backPanel.position.set(0, shelf.totalHeight / 2, -shelf.totalDepth / 2 + shelf.backPanelDepth / 2);
  backPanel.receiveShadow = true;
  shelfGroup.add(backPanel);

  // Upright dividers
  const uprightHeight = shelf.totalHeight - shelf.plinthHeight - shelf.crownHeight;
  const uprightGeo = new THREE.BoxGeometry(shelf.uprightThickness, uprightHeight, shelf.totalDepth);

  for (let i = 0; i <= shelf.bays; i++) {
    const x = -shelf.totalWidth / 2 + shelf.uprightThickness / 2 + i * (bayWidth + shelf.uprightThickness);
    const upright = new THREE.Mesh(uprightGeo, woodMaterial);
    upright.position.set(x, shelfYOffset + uprightHeight / 2, 0);
    upright.castShadow = true;
    upright.receiveShadow = true;
    shelfGroup.add(upright);
  }

  // Horizontal shelves per bay
  for (let b = 0; b < shelf.bays; b++) {
    const bayCenterX = -shelf.totalWidth / 2 + shelf.uprightThickness + bayWidth / 2 + b * (bayWidth + shelf.uprightThickness);

    for (let s = 0; s < shelf.shelvesPerBay; s++) {
      const shelfY = shelfYOffset + s * shelfSpacing;
      const shelfGeo = new THREE.BoxGeometry(bayWidth, shelf.shelfThickness, shelf.totalDepth - 0.015);
      const shelfMesh = new THREE.Mesh(shelfGeo, woodMaterial);
      shelfMesh.position.set(bayCenterX, shelfY, 0.008);
      shelfMesh.castShadow = true;
      shelfMesh.receiveShadow = true;
      shelfGroup.add(shelfMesh);
    }
  }

  // ----------------------------------------------------
  // 2. ROOM SHELL & ARCHITECTURE
  // ----------------------------------------------------
  // Wide Floor covering full perspective
  const floorGeo = new THREE.PlaneGeometry(16, 16);
  const floor = new THREE.Mesh(floorGeo, floorWoodMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 3.0);
  floor.receiveShadow = true;
  roomGroup.add(floor);

  // Back wall
  const backWallGeo = new THREE.PlaneGeometry(16, 4.5);
  const backWall = new THREE.Mesh(backWallGeo, wallMaterial);
  backWall.position.set(0, 2.25, -shelf.totalDepth / 2 - 0.04);
  backWall.receiveShadow = true;
  roomGroup.add(backWall);

  // Right wall (window wall)
  const rightWallGeo = new THREE.PlaneGeometry(16, 4.5);
  const rightWall = new THREE.Mesh(rightWallGeo, wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(room.width / 2, 2.25, 3.0);
  rightWall.receiveShadow = true;
  roomGroup.add(rightWall);

  // Left wall
  const leftWallGeo = new THREE.PlaneGeometry(16, 4.5);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-room.width / 2, 2.25, 3.0);
  leftWall.receiveShadow = true;
  roomGroup.add(leftWall);

  // Ceiling
  const ceilingGeo = new THREE.PlaneGeometry(16, 16);
  const ceiling = new THREE.Mesh(ceilingGeo, wallMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 3.4, 3.0);
  roomGroup.add(ceiling);

  // ----------------------------------------------------
  // 3. RIGHT WINDOW & SHEER CURTAINS
  // ----------------------------------------------------
  const windowGroup = new THREE.Group();
  windowGroup.position.set(room.width / 2 - 0.06, 1.85, 2.6);
  windowGroup.rotation.y = -Math.PI / 2;

  // Window frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.45 });
  const wFrameGeo = new THREE.BoxGeometry(room.windowWidth, room.windowHeight, 0.08);
  const wFrame = new THREE.Mesh(wFrameGeo, frameMat);
  windowGroup.add(wFrame);

  // Window glass
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff4df,
    transmission: 0.75,
    opacity: 0.9,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
  });
  const glassGeo = new THREE.PlaneGeometry(room.windowWidth - 0.12, room.windowHeight - 0.12);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.z = 0.01;
  windowGroup.add(glass);

  // Sheer linen curtains
  const curtainMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffcf5,
    transparent: true,
    opacity: 0.72,
    roughness: 0.85,
    sheen: 0.85,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(0xffeedd),
    side: THREE.DoubleSide,
  });
  const curtainGeo = new THREE.PlaneGeometry(0.75, room.windowHeight + 0.7, 8, 8);
  const leftCurtain = new THREE.Mesh(curtainGeo, curtainMat);
  leftCurtain.position.set(-room.windowWidth / 2 + 0.32, -0.15, 0.08);
  windowGroup.add(leftCurtain);

  const rightCurtain = new THREE.Mesh(curtainGeo, curtainMat);
  rightCurtain.position.set(room.windowWidth / 2 - 0.32, -0.15, 0.08);
  windowGroup.add(rightCurtain);

  roomGroup.add(windowGroup);

  // ----------------------------------------------------
  // 4. KILIM RUG IN FOREGROUND
  // ----------------------------------------------------
  const rugTex = createKilimRugTexture();
  const rugMat = new THREE.MeshPhysicalMaterial({
    map: rugTex,
    roughness: 0.92,
    sheen: 0.75,
    sheenColor: new THREE.Color(0xdca358),
    sheenRoughness: 0.6,
  });
  const rugGeo = new THREE.PlaneGeometry(3.5, 2.4);
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.1, 0.003, 3.1);
  rug.receiveShadow = true;
  roomGroup.add(rug);

  // ----------------------------------------------------
  // 5. RUSTIC COFFEE TABLE & CANDLE (Foreground bottom)
  // ----------------------------------------------------
  const tableGroup = new THREE.Group();
  tableGroup.position.set(0.12, 0, 4.3);

  // Wood tabletop
  const tableTopGeo = new THREE.BoxGeometry(1.4, 0.05, 0.58);
  const tableTop = new THREE.Mesh(tableTopGeo, woodMaterial);
  tableTop.position.y = 0.38;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  tableGroup.add(tableTop);

  // Table legs
  const legGeo = new THREE.BoxGeometry(0.065, 0.38, 0.065);
  const legPositions = [
    [-0.62, 0.19, -0.23],
    [0.62, 0.19, -0.23],
    [-0.62, 0.19, 0.23],
    [0.62, 0.19, 0.23],
  ];
  legPositions.forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, woodMaterial);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    tableGroup.add(leg);
  });

  // Candle in glass jar
  const candleJarGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.09, 16);
  const candleJarMat = new THREE.MeshPhysicalMaterial({
    color: 0xffedd0,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
  });
  const candleJar = new THREE.Mesh(candleJarGeo, candleJarMat);
  candleJar.position.set(-0.06, 0.38 + 0.045, 0.0);
  candleJar.castShadow = true;
  tableGroup.add(candleJar);

  // Candle flame
  const flameGeo = new THREE.SphereGeometry(0.012, 12, 12);
  flameGeo.scale(0.8, 1.8, 0.8);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9922 });
  const candleFlame = new THREE.Mesh(flameGeo, flameMat);
  candleFlame.position.set(-0.06, 0.38 + 0.095, 0.0);
  tableGroup.add(candleFlame);

  // Ceramic tea cups with saucers
  const cupGeo = new THREE.CylinderGeometry(0.04, 0.028, 0.055, 16);
  const ceramicMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4eee1,
    roughness: 0.2,
    clearcoat: 0.8,
  });
  const cup1 = new THREE.Mesh(cupGeo, ceramicMat);
  cup1.position.set(0.24, 0.38 + 0.03, -0.06);
  cup1.castShadow = true;
  tableGroup.add(cup1);

  const cup2 = new THREE.Mesh(cupGeo, ceramicMat);
  cup2.position.set(-0.3, 0.38 + 0.03, 0.08);
  cup2.castShadow = true;
  tableGroup.add(cup2);

  roomGroup.add(tableGroup);

  // ----------------------------------------------------
  // 6. FLOOR LAMP (Left side)
  // ----------------------------------------------------
  const floorLampGroup = new THREE.Group();
  floorLampGroup.position.set(-2.6, 0, 2.7);

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.25,
  });
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xffeed5,
    roughness: 0.8,
    emissive: 0xffeed5,
    emissiveIntensity: 0.5,
    side: THREE.DoubleSide,
  });

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 24), brassMat);
  lampBase.position.y = 0.012;
  floorLampGroup.add(lampBase);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.55, 16), brassMat);
  lampStem.position.y = 0.8;
  floorLampGroup.add(lampStem);

  const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.32, 24, 1, true), shadeMat);
  lampShade.position.y = 1.62;
  floorLampGroup.add(lampShade);

  roomGroup.add(floorLampGroup);

  // ----------------------------------------------------
  // 7. SMALL SHELF LAMP (Bay 0, Shelf 3)
  // ----------------------------------------------------
  const shelfLampGroup = new THREE.Group();
  const bay0X = -shelf.totalWidth / 2 + shelf.uprightThickness + bayWidth / 2;
  const shelf3Y = shelfYOffset + 3 * shelfSpacing + shelf.shelfThickness / 2;
  shelfLampGroup.position.set(bay0X - 0.18, shelf3Y, 0.06);

  const sLampBase = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), ceramicMat);
  sLampBase.scale.set(1, 1.2, 1);
  sLampBase.position.y = 0.07;
  shelfLampGroup.add(sLampBase);

  const sLampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.12, 16, 1, true), shadeMat);
  sLampShade.position.y = 0.18;
  shelfLampGroup.add(sLampShade);

  shelfGroup.add(shelfLampGroup);

  // ----------------------------------------------------
  // 8. CERAMIC VASES, JUGS & PROPS ON SHELVES
  // ----------------------------------------------------
  const vaseMat = new THREE.MeshPhysicalMaterial({
    color: 0x9b5838,
    roughness: 0.25,
    clearcoat: 0.7,
  });
  const vaseGeo = new THREE.CylinderGeometry(0.07, 0.04, 0.22, 16);
  const vase = new THREE.Mesh(vaseGeo, vaseMat);
  const bay2X = -shelf.totalWidth / 2 + shelf.uprightThickness + bayWidth / 2 + 2 * (bayWidth + shelf.uprightThickness);
  const shelf5Y = shelfYOffset + 5 * shelfSpacing + shelf.shelfThickness / 2;
  vase.position.set(bay2X + 0.18, shelf5Y + 0.11, 0.02);
  vase.castShadow = true;
  shelfGroup.add(vase);

  // Photo frame
  const photoFrameMat = new THREE.MeshStandardMaterial({ color: 0x221a14, roughness: 0.5 });
  const photoFrameGeo = new THREE.BoxGeometry(0.12, 0.15, 0.015);
  const photoFrame = new THREE.Mesh(photoFrameGeo, photoFrameMat);
  const bay1X = -shelf.totalWidth / 2 + shelf.uprightThickness + bayWidth / 2 + 1 * (bayWidth + shelf.uprightThickness);
  const shelf4Y = shelfYOffset + 4 * shelfSpacing + shelf.shelfThickness / 2;
  photoFrame.position.set(bay1X - 0.22, shelf4Y + 0.075, 0.05);
  photoFrame.rotation.y = 0.2;
  photoFrame.castShadow = true;
  shelfGroup.add(photoFrame);

  // Trailing pothos plant
  const plantGroup = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: 0xf5f0ea, roughness: 0.4 });
  const potGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.12, 16);
  const pot = new THREE.Mesh(potGeo, potMat);
  plantGroup.add(pot);

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2e5a27,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 24; i++) {
    const leafGeo = new THREE.CircleGeometry(0.025, 8);
    leafGeo.scale(1, 1.4, 1);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const angle = i * 0.4;
    const dist = 0.06 + (i / 24) * 0.14;
    const dropY = -0.04 - (i / 24) * 0.42;
    leaf.position.set(Math.cos(angle) * dist, dropY, Math.sin(angle) * dist + 0.06);
    leaf.rotation.set(0.6 + Math.sin(i) * 0.3, 0, Math.cos(i) * 0.3);
    plantGroup.add(leaf);
  }
  const shelf6Y = shelfYOffset + 6 * shelfSpacing + shelf.shelfThickness / 2;
  plantGroup.position.set(bay0X + 0.24, shelf6Y + 0.06, 0.04);
  shelfGroup.add(plantGroup);

  // ----------------------------------------------------
  // 9. STRING FAIRY LIGHTS ACROSS UPPER SHELF
  // ----------------------------------------------------
  const fairyLightsGroup = new THREE.Group();
  const fairyBulbGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const fairyBulbMat = new THREE.MeshBasicMaterial({ color: 0xffdf88 });

  for (let i = 0; i < CONFIG.lighting.practicals.fairyLights.count; i++) {
    const t = i / (CONFIG.lighting.practicals.fairyLights.count - 1);
    const fx = -shelf.totalWidth / 2 + 0.15 + t * (shelf.totalWidth - 0.3);
    const fy = shelfYOffset + 5.85 * shelfSpacing + Math.sin(t * Math.PI * 4) * 0.035;
    const fz = shelf.totalDepth / 2 + 0.02;

    const bulb = new THREE.Mesh(fairyBulbGeo, fairyBulbMat);
    bulb.position.set(fx, fy, fz);
    fairyLightsGroup.add(bulb);
  }
  shelfGroup.add(fairyLightsGroup);

  // ----------------------------------------------------
  // 10. FOREGROUND MONSTERA PLANT (Left corner, blurred in DoF)
  // ----------------------------------------------------
  const monsteraGroup = new THREE.Group();
  monsteraGroup.position.set(-2.5, 0, 4.4);

  const mBasket = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.36, 16), woodMaterial);
  mBasket.position.y = 0.18;
  monsteraGroup.add(mBasket);

  const mLeafMat = new THREE.MeshPhysicalMaterial({
    color: 0x1f4625,
    roughness: 0.35,
    clearcoat: 0.3,
    side: THREE.DoubleSide,
  });

  for (let l = 0; l < 8; l++) {
    const lAngle = (l / 8) * Math.PI * 2;
    const lGeo = new THREE.CircleGeometry(0.2, 12);
    lGeo.scale(0.8, 1.6, 1);
    const mLeaf = new THREE.Mesh(lGeo, mLeafMat);
    mLeaf.position.set(Math.cos(lAngle) * 0.28, 0.45 + l * 0.05, Math.sin(lAngle) * 0.28);
    mLeaf.rotation.set(-0.7, lAngle, 0.3);
    monsteraGroup.add(mLeaf);
  }
  roomGroup.add(monsteraGroup);

  return {
    roomGroup,
    shelfGroup,
    candleMesh: candleFlame,
    shelfLampMesh: sLampShade,
    floorLampMesh: lampShade,
  };
}
