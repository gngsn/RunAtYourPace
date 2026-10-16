import * as THREE from 'three';
import {
  ArtworkThemeConfig,
  ArtworkThemeId,
  CharacterModelId,
  SurroundingLandmark,
} from '../types/gpx';

/**
 * Generates a procedural needle-felted wool / fuzzy bump & normal texture
 * so all 3D characters, trees, and hills have the tactile fuzzy look from the reference artwork.
 */
export function createFuzzyFeltBumpTexture(
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 3200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 3 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    const shade = Math.floor(95 + Math.random() * 145);
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = 0.8 + Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates a soft radial contact shadow texture to ground the runner and buildings.
 */
export function createSoftShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.06,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(10, 12, 34, 0.55)');
  grad.addColorStop(0.55, 'rgba(10, 12, 34, 0.22)');
  grad.addColorStop(1, 'rgba(10, 12, 34, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates a pastel architectural window grid texture for surrounding urban buildings.
 */
export function createPastelBuildingTexture(
  baseHex: string,
  windowHex: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 512);

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, 'rgba(255,255,255,0.22)');
  grad.addColorStop(1, 'rgba(15,18,46,0.28)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  const cols = 4;
  const rows = 10;
  const padX = 22;
  const padY = 26;
  const cellW = (256 - padX * 2) / cols;
  const cellH = (512 - padY * 2) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = (r * 3 + c * 7) % 5 !== 0;
      ctx.fillStyle = lit ? windowHex : 'rgba(255, 255, 255, 0.18)';
      const wx = padX + c * cellW + 6;
      const wy = padY + r * cellH + 6;
      const ww = cellW - 12;
      const wh = cellH - 14;
      ctx.beginPath();
      ctx.roundRect(wx, wy, ww, wh, 6);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Creates a physical material with velvet/felt sheen and fuzzy bump map.
 */
export function createFeltMaterial(
  colorHex: string,
  bumpMap: THREE.Texture,
  options?: {
    sheenColorHex?: string;
    emissiveHex?: string;
    emissiveIntensity?: number;
    roughness?: number;
    bumpScale?: number;
  }
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: options?.roughness ?? 0.88,
    metalness: 0.02,
    sheen: 1.0,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(options?.sheenColorHex ?? '#FFF5FA'),
    bumpMap,
    bumpScale: options?.bumpScale ?? 0.035,
    emissive: new THREE.Color(options?.emissiveHex ?? colorHex),
    emissiveIntensity: options?.emissiveIntensity ?? 0.08,
  });
}

export interface FeltRunnerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftKneePivot: THREE.Group;
  rightKneePivot: THREE.Group;
  fishCompanionGroup: THREE.Group;
  hatGroup: THREE.Group;
  flowerCrownGroup: THREE.Group;
  topknotGroup: THREE.Group;
  sweaterMat: THREE.MeshPhysicalMaterial;
  pantsMat: THREE.MeshPhysicalMaterial;
  hatMat: THREE.MeshPhysicalMaterial;
  updateThemeStyle: (
    theme: ArtworkThemeConfig,
    themeId: ArtworkThemeId
  ) => void;
  setCharacterModel: (modelId: CharacterModelId) => void;
}

/**
 * Builds the 14-part articulated Needle-Felt Runner character with 2-joint legs (hip + knee + shoe)
 * so forward running strides look natural, plus 3 selectable character headgear/styles.
 */
export function createFeltRunnerRig(
  bumpMap: THREE.Texture,
  shadowTex: THREE.Texture,
  initialTheme: ArtworkThemeConfig,
  initialCharacter: CharacterModelId = 'hoodie_kid'
): FeltRunnerRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Soft contact shadow on ground
  const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.03;
  root.add(shadowMesh);

  const skinMat = createFeltMaterial('#FFE4E1', bumpMap, {
    sheenColorHex: '#FFF0F5',
    roughness: 0.85,
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#1E1B4B' });
  const blushMat = createFeltMaterial('#FF8DA1', bumpMap, {
    emissiveHex: '#FF8DA1',
    emissiveIntensity: 0.25,
  });
  const sweaterMat = createFeltMaterial(
    initialTheme.runnerSweaterHex,
    bumpMap,
    {
      sheenColorHex: '#FFFFFF',
      bumpScale: 0.05,
    }
  );
  const collarMat = createFeltMaterial('#FF9EBB', bumpMap, {
    sheenColorHex: '#FFF5F7',
  });
  const pantsMat = createFeltMaterial(initialTheme.runnerPantsHex, bumpMap, {
    sheenColorHex: '#E2E8F0',
    bumpScale: 0.045,
  });
  const shoeMat = createFeltMaterial('#FF94B2', bumpMap, {
    sheenColorHex: '#FFE4E6',
    roughness: 0.75,
  });
  const hatMat = createFeltMaterial(initialTheme.runnerHatHex, bumpMap, {
    sheenColorHex: '#FFFFFF',
  });

  // 1. Torso (cozy rounded wool sweater)
  const torsoGeo = new THREE.CapsuleGeometry(0.42, 0.54, 12, 24);
  const torsoMesh = new THREE.Mesh(torsoGeo, sweaterMat);
  torsoMesh.position.y = 1.44;
  torsoMesh.castShadow = true;
  bodyGroup.add(torsoMesh);

  // Sweater ribbed collar & waist band
  const collarGeo = new THREE.TorusGeometry(0.29, 0.075, 12, 24);
  const collarMesh = new THREE.Mesh(collarGeo, collarMat);
  collarMesh.rotation.x = Math.PI / 2;
  collarMesh.position.y = 1.85;
  bodyGroup.add(collarMesh);

  // Cozy backpack / felt pouch on back (-Z) so back-view looks extra detailed
  const backpackGeo = new THREE.BoxGeometry(0.46, 0.48, 0.24);
  const backpackMesh = new THREE.Mesh(backpackGeo, collarMat);
  backpackMesh.position.set(0, 1.48, -0.34);
  backpackMesh.castShadow = true;
  bodyGroup.add(backpackMesh);

  const hemGeo = new THREE.TorusGeometry(0.4, 0.06, 12, 24);
  const hemMesh = new THREE.Mesh(hemGeo, collarMat);
  hemMesh.rotation.x = Math.PI / 2;
  hemMesh.position.y = 1.09;
  bodyGroup.add(hemMesh);

  // 2. Head, Eyes & Blushing Cheeks (Facing +Z)
  const headGroup = new THREE.Group();
  headGroup.position.y = 2.25;
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.39, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.scale.set(1.05, 0.98, 1.0);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const eyeGeo = new THREE.SphereGeometry(0.042, 10, 10);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.14, 0.04, 0.35);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.14, 0.04, 0.35);
  headGroup.add(leftEye, rightEye);

  const cheekGeo = new THREE.SphereGeometry(0.078, 12, 12);
  const leftCheek = new THREE.Mesh(cheekGeo, blushMat);
  leftCheek.position.set(-0.23, -0.05, 0.32);
  const rightCheek = new THREE.Mesh(cheekGeo, blushMat);
  rightCheek.position.set(0.23, -0.05, 0.32);
  headGroup.add(leftCheek, rightCheek);

  // 3A. Style 1: Brimmed Felt Hat (hoodie_kid)
  const hatGroup = new THREE.Group();
  headGroup.add(hatGroup);

  const brimGeo = new THREE.CylinderGeometry(0.56, 0.6, 0.08, 24);
  const brimMesh = new THREE.Mesh(brimGeo, hatMat);
  brimMesh.position.y = 0.16;
  const crownGeo = new THREE.SphereGeometry(
    0.4,
    20,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.6
  );
  const crownMesh = new THREE.Mesh(crownGeo, hatMat);
  crownMesh.position.y = 0.14;
  const ribbonGeo = new THREE.TorusGeometry(0.39, 0.045, 10, 24);
  const ribbonMesh = new THREE.Mesh(ribbonGeo, collarMat);
  ribbonMesh.rotation.x = Math.PI / 2;
  ribbonMesh.position.y = 0.21;
  hatGroup.add(brimMesh, crownMesh, ribbonMesh);

  // 3B. Style 2: Pastel Flower-Orb Petal Halo (flower_orb)
  const flowerCrownGroup = new THREE.Group();
  headGroup.add(flowerCrownGroup);
  const petalMat = createFeltMaterial('#FF85B8', bumpMap, {
    emissiveHex: '#FF85B8',
    emissiveIntensity: 0.32,
  });
  const centerGemMat = createFeltMaterial('#FEF08A', bumpMap, {
    emissiveHex: '#FACC15',
    emissiveIntensity: 0.45,
  });
  for (let p = 0; p < 6; p++) {
    const ang = (p / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      petalMat
    );
    petal.position.set(Math.cos(ang) * 0.28, 0.36, Math.sin(ang) * 0.28);
    petal.scale.set(1.1, 0.65, 1.1);
    flowerCrownGroup.add(petal);
  }
  const topBud = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 14, 14),
    centerGemMat
  );
  topBud.position.set(0, 0.44, 0);
  flowerCrownGroup.add(topBud);

  // 3C. Style 3: Twin Cloud Topknot & Earmuffs (topknot_kid)
  const topknotGroup = new THREE.Group();
  headGroup.add(topknotGroup);
  const bunMat = createFeltMaterial('#C4B5FD', bumpMap, {
    emissiveHex: '#A78BFA',
    emissiveIntensity: 0.24,
  });
  const leftBun = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 14),
    bunMat
  );
  leftBun.position.set(-0.28, 0.34, -0.04);
  const rightBun = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 14, 14),
    bunMat
  );
  rightBun.position.set(0.28, 0.34, -0.04);
  topknotGroup.add(leftBun, rightBun);

  // 3D. Style 4: Mint Aero Visor & Wing Headband (mint_sprinter)
  const mintVisorGroup = new THREE.Group();
  headGroup.add(mintVisorGroup);
  const visorMat = createFeltMaterial('#6EE7B7', bumpMap, {
    emissiveHex: '#34D399',
    emissiveIntensity: 0.3,
  });
  const bandRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.39, 0.055, 10, 24),
    visorMat
  );
  bandRing.rotation.x = Math.PI / 2;
  bandRing.position.y = 0.16;
  const visorBill = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.48, 0.05, 20, 1, false, -0.9, 1.8),
    visorMat
  );
  visorBill.position.set(0, 0.14, 0.15);
  mintVisorGroup.add(bandRing, visorBill);

  // 3E. Style 5: Starlight Felt Fox Ears & Star Crest (starlight_fox)
  const foxEarsGroup = new THREE.Group();
  headGroup.add(foxEarsGroup);
  const foxMat = createFeltMaterial('#FDBA74', bumpMap, {
    emissiveHex: '#FB923C',
    emissiveIntensity: 0.28,
  });
  const leftEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.17, 0.36, 12),
    foxMat
  );
  leftEar.position.set(-0.24, 0.42, 0.02);
  leftEar.rotation.z = 0.25;
  const rightEar = new THREE.Mesh(
    new THREE.ConeGeometry(0.17, 0.36, 12),
    foxMat
  );
  rightEar.position.set(0.24, 0.42, 0.02);
  rightEar.rotation.z = -0.25;
  const starCrest = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.14, 0),
    centerGemMat
  );
  starCrest.position.set(0, 0.52, 0.12);
  foxEarsGroup.add(leftEar, rightEar, starCrest);

  // 4. Articulated Left & Right Arms
  const createArm = (side: -1 | 1) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.52, 1.72, 0);

    const armGeo = new THREE.CapsuleGeometry(0.135, 0.44, 10, 16);
    const armMesh = new THREE.Mesh(armGeo, sweaterMat);
    armMesh.position.y = -0.25;
    armMesh.castShadow = true;
    pivot.add(armMesh);

    const cuffGeo = new THREE.TorusGeometry(0.13, 0.04, 10, 18);
    const cuffMesh = new THREE.Mesh(cuffGeo, collarMat);
    cuffMesh.rotation.x = Math.PI / 2;
    cuffMesh.position.y = -0.46;
    pivot.add(cuffMesh);

    const handGeo = new THREE.SphereGeometry(0.125, 14, 14);
    const handMesh = new THREE.Mesh(handGeo, skinMat);
    handMesh.position.y = -0.58;
    pivot.add(handMesh);

    bodyGroup.add(pivot);
    return pivot;
  };

  const leftArmPivot = createArm(-1);
  const rightArmPivot = createArm(1);

  // 5. 2-Joint Articulated Legs (Hip Pivot + Knee Pivot + Felt Running Shoe)
  const createArticulatedLeg = (side: -1 | 1) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(side * 0.21, 1.04, 0);

    // Upper Thigh
    const thighGeo = new THREE.CapsuleGeometry(0.155, 0.26, 10, 16);
    const thighMesh = new THREE.Mesh(thighGeo, pantsMat);
    thighMesh.position.y = -0.2;
    thighMesh.castShadow = true;
    hipPivot.add(thighMesh);

    // Knee Pivot
    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.4, 0);
    hipPivot.add(kneePivot);

    // Lower Shin
    const shinGeo = new THREE.CapsuleGeometry(0.135, 0.26, 10, 16);
    const shinMesh = new THREE.Mesh(shinGeo, pantsMat);
    shinMesh.position.y = -0.2;
    shinMesh.castShadow = true;
    kneePivot.add(shinMesh);

    // Felt Sneaker (pointing forward along +Z)
    const shoeGeo = new THREE.CapsuleGeometry(0.145, 0.24, 10, 16);
    const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    shoeMesh.rotation.x = Math.PI / 2;
    shoeMesh.position.set(0, -0.42, 0.09);
    shoeMesh.castShadow = true;
    kneePivot.add(shoeMesh);

    bodyGroup.add(hipPivot);
    return { hipPivot, kneePivot };
  };

  const leftLeg = createArticulatedLeg(-1);
  const rightLeg = createArticulatedLeg(1);

  // 6. Companion Floating Pastel Felt Fish
  const fishCompanionGroup = new THREE.Group();
  fishCompanionGroup.position.set(1.35, 1.65, 0.2);
  root.add(fishCompanionGroup);

  const fishBodyMat = createFeltMaterial('#FFF3B0', bumpMap, {
    sheenColorHex: '#FFAFCC',
    emissiveHex: '#FFF3B0',
    emissiveIntensity: 0.14,
  });
  const fishFinMat = createFeltMaterial('#FF85B3', bumpMap, {
    sheenColorHex: '#FFE5EC',
    emissiveHex: '#FF85B3',
    emissiveIntensity: 0.22,
  });

  const fishBodyGeo = new THREE.CapsuleGeometry(0.26, 0.75, 12, 20);
  const fishBody = new THREE.Mesh(fishBodyGeo, fishBodyMat);
  fishBody.rotation.x = Math.PI / 2;
  fishBody.scale.set(0.85, 1.0, 1.15);
  fishCompanionGroup.add(fishBody);

  const dorsalGeo = new THREE.ConeGeometry(0.22, 0.52, 12);
  const dorsalFin = new THREE.Mesh(dorsalGeo, fishFinMat);
  dorsalFin.position.set(0, 0.3, -0.05);
  dorsalFin.rotation.x = -0.35;
  dorsalFin.scale.set(0.3, 1, 1.4);
  fishCompanionGroup.add(dorsalFin);

  const tailUpper = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.45, 10),
    fishFinMat
  );
  tailUpper.position.set(0, 0.16, -0.68);
  tailUpper.rotation.x = -Math.PI * 0.65;
  tailUpper.scale.set(0.28, 1, 1.1);

  const tailLower = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.4, 10),
    fishFinMat
  );
  tailLower.position.set(0, -0.14, -0.66);
  tailLower.rotation.x = -Math.PI * 0.35;
  tailLower.scale.set(0.28, 1, 1.1);
  fishCompanionGroup.add(tailUpper, tailLower);

  let currentCharId: CharacterModelId = initialCharacter;

  const CHAR_OUTFITS: Record<
    CharacterModelId,
    {
      skin: string;
      sweater: string;
      collar: string;
      pants: string;
      shoe: string;
      hat: string;
    }
  > = {
    // 1. Mint (Image 1: Teal head/limbs, beige bucket hat, peach-coral tunic, coral boots)
    mint_sprinter: {
      skin: '#0FB5BA',
      sweater: '#F5A66B',
      collar: '#EC7E6D',
      pants: '#0FB5BA',
      shoe: '#EC836D',
      hat: '#EED09D',
    },
    // 2. Bloom (Image 2: Aqua-lavender-pink orb, sprouting flower, pink limbs, pink-aqua boots)
    flower_orb: {
      skin: '#5BE2D8',
      sweater: '#F86CC8',
      collar: '#5BE2D8',
      pants: '#FCA5E0',
      shoe: '#E87AD8',
      hat: '#F779E6',
    },
    // 3. Momo (Image 3: Cream-to-aqua head, pink romper, teal limbs, pink boots)
    topknot_kid: {
      skin: '#BEE3C8',
      sweater: '#F39CE0',
      collar: '#F497DA',
      pants: '#1FC8B5',
      shoe: '#EE99E2',
      hat: '#EDE8B8',
    },
    // 4. Sunny (Image 4: Pink face, cozy yellow-to-aqua hoodie, pink legs, aqua boots)
    hoodie_kid: {
      skin: '#F5B1B3',
      sweater: '#FCE192',
      collar: '#18C5C4',
      pants: '#F5B1B3',
      shoe: '#18C5C4',
      hat: '#FCE192',
    },
    // 5. Coco (Image 5: Warm peach head, X-eyes, teal romper, pink limbs, coral shoes)
    starlight_fox: {
      skin: '#F5B882',
      sweater: '#0FB8B9',
      collar: '#10B8B9',
      pants: '#F5B1B3',
      shoe: '#EF8A6B',
      hat: '#F6D48F',
    },
  };

  const setCharacterModel = (modelId: CharacterModelId) => {
    currentCharId = modelId;
    // Both hoodie_kid (Sunny) and mint_sprinter (Mint) wear the rounded dome hat/hood
    hatGroup.visible = modelId === 'hoodie_kid' || modelId === 'mint_sprinter';
    flowerCrownGroup.visible = modelId === 'flower_orb';
    topknotGroup.visible =
      modelId === 'topknot_kid' || modelId === 'starlight_fox';
    mintVisorGroup.visible = false;
    foxEarsGroup.visible = false;

    const outfit = CHAR_OUTFITS[modelId] || CHAR_OUTFITS.hoodie_kid;
    skinMat.color.set(outfit.skin);
    sweaterMat.color.set(outfit.sweater);
    sweaterMat.emissive.set(outfit.sweater);
    collarMat.color.set(outfit.collar);
    collarMat.emissive.set(outfit.collar);
    pantsMat.color.set(outfit.pants);
    pantsMat.emissive.set(outfit.pants);
    shoeMat.color.set(outfit.shoe);
    shoeMat.emissive.set(outfit.shoe);
    hatMat.color.set(outfit.hat);
    hatMat.emissive.set(outfit.hat);
    bunMat.color.set(outfit.hat);
    bunMat.emissive.set(outfit.hat);
  };

  const updateThemeStyle = (
    theme: ArtworkThemeConfig,
    themeId: ArtworkThemeId
  ) => {
    const outfit = CHAR_OUTFITS[currentCharId];
    if (!outfit) {
      sweaterMat.color.set(theme.runnerSweaterHex);
      sweaterMat.emissive.set(theme.runnerSweaterHex);
      pantsMat.color.set(theme.runnerPantsHex);
      pantsMat.emissive.set(theme.runnerPantsHex);
      hatMat.color.set(theme.runnerHatHex);
      hatMat.emissive.set(theme.runnerHatHex);
    }

    fishCompanionGroup.visible =
      themeId === 'riverside' ||
      themeId === 'cloud' ||
      currentCharId === 'flower_orb';
  };

  setCharacterModel(initialCharacter);
  updateThemeStyle(initialTheme, initialTheme.id);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot: leftLeg.hipPivot,
    rightLegPivot: rightLeg.hipPivot,
    leftKneePivot: leftLeg.kneePivot,
    rightKneePivot: rightLeg.kneePivot,
    fishCompanionGroup,
    hatGroup,
    flowerCrownGroup,
    topknotGroup,
    sweaterMat,
    pantsMat,
    hatMat,
    updateThemeStyle,
    setCharacterModel,
  };
}

/**
 * Creates a composite 5-9 part 3D landmark building model representing a real-world surrounding structure.
 */
export function createLandmarkBuildingGroup(
  landmark: SurroundingLandmark,
  bumpMap: THREE.Texture,
  maxAnisotropy: number
): THREE.Group {
  const group = new THREE.Group();
  group.userData = { landmark };

  const primaryMat = createFeltMaterial(landmark.primaryColor, bumpMap, {
    emissiveHex: landmark.primaryColor,
    emissiveIntensity: 0.18,
    roughness: 0.72,
  });
  const accentMat = createFeltMaterial(landmark.accentColor, bumpMap, {
    emissiveHex: landmark.accentColor,
    emissiveIntensity: 0.28,
    roughness: 0.6,
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(landmark.accentColor),
  });

  const scaleH = Math.max(0.75, Math.min(1.65, landmark.heightMeters / 36));

  switch (landmark.archStyle) {
    case 'observation_spire': {
      const basePodium = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 3.1, 1.6, 24),
        primaryMat
      );
      basePodium.position.y = 0.8;
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 1.15, 7.5 * scaleH, 20),
        primaryMat
      );
      shaft.position.y = 1.6 + (7.5 * scaleH) / 2;

      const podLower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 1.5, 1.2, 24),
        accentMat
      );
      podLower.position.y = 1.6 + 6.2 * scaleH;

      const podRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.05, 0.22, 12, 28),
        glowMat
      );
      podRing.rotation.x = Math.PI / 2;
      podRing.position.y = 1.6 + 6.5 * scaleH;

      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 3.4 * scaleH, 16),
        accentMat
      );
      spire.position.y = 1.6 + 8.4 * scaleH;

      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 16, 16),
        glowMat
      );
      beacon.position.y = 1.6 + 10.1 * scaleH;

      group.add(basePodium, shaft, podLower, podRing, spire, beacon);
      break;
    }

    case 'bridge_arch': {
      const leftPillar = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.85, 3.6 * scaleH, 10, 16),
        primaryMat
      );
      leftPillar.position.set(-2.6, 2.2 * scaleH, 0);

      const rightPillar = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.85, 3.6 * scaleH, 10, 16),
        primaryMat
      );
      rightPillar.position.set(2.6, 2.2 * scaleH, 0);

      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.8, 0.52, 14, 32, Math.PI),
        accentMat
      );
      arch.position.set(0, 3.2 * scaleH, 0);

      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 0.45, 2.2),
        primaryMat
      );
      deck.position.set(0, 2.1 * scaleH, 0);

      for (let i = -2; i <= 2; i++) {
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 12, 12),
          glowMat
        );
        orb.position.set(
          i * 1.1,
          2.6 * scaleH + (2 - Math.abs(i)) * 0.45,
          1.15
        );
        group.add(orb);
      }

      group.add(leftPillar, rightPillar, arch, deck);
      break;
    }

    case 'floating_lotus': {
      const waterPad = new THREE.Mesh(
        new THREE.CylinderGeometry(3.8, 4.0, 0.35, 28),
        accentMat
      );
      waterPad.position.y = 0.18;

      const mainDome = new THREE.Mesh(
        new THREE.SphereGeometry(
          2.2,
          24,
          18,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.62
        ),
        primaryMat
      );
      mainDome.position.y = 0.3;

      const sidePetalLeft = new THREE.Mesh(
        new THREE.SphereGeometry(1.35, 20, 16),
        accentMat
      );
      sidePetalLeft.position.set(-1.9, 1.1, 0.8);
      sidePetalLeft.scale.set(1, 1.35, 0.9);

      const sidePetalRight = new THREE.Mesh(
        new THREE.SphereGeometry(1.25, 20, 16),
        accentMat
      );
      sidePetalRight.position.set(1.85, 1.0, -0.6);
      sidePetalRight.scale.set(1, 1.25, 0.9);

      const crownPearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 16, 16),
        glowMat
      );
      crownPearl.position.set(0, 2.8, 0);

      group.add(
        waterPad,
        mainDome,
        sidePetalLeft,
        sidePetalRight,
        crownPearl
      );
      break;
    }

    case 'dome_pavilion': {
      const hillBase = new THREE.Mesh(
        new THREE.CylinderGeometry(3.2, 3.8, 1.4, 24),
        accentMat
      );
      hillBase.position.y = 0.7;

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 24, 20),
        primaryMat
      );
      dome.position.y = 2.4;
      dome.scale.set(1.1, 1.25, 1.1);

      const haloRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.65, 0.18, 12, 28),
        glowMat
      );
      haloRing.rotation.x = Math.PI / 2;
      haloRing.position.y = 2.1;

      group.add(hillBase, dome, haloRing);
      break;
    }

    case 'atelier_brick':
    case 'pastel_tower':
    default: {
      const winTex = createPastelBuildingTexture(
        landmark.primaryColor,
        landmark.accentColor,
        maxAnisotropy
      );
      const buildingMat = new THREE.MeshStandardMaterial({
        map: winTex,
        roughness: 0.55,
        metalness: 0.08,
        emissive: new THREE.Color(landmark.primaryColor),
        emissiveIntensity: 0.12,
      });

      const mainTowerH = 6.2 * scaleH;
      const mainTower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.65, mainTowerH, 20),
        buildingMat
      );
      mainTower.position.y = mainTowerH / 2;

      const mainRoof = new THREE.Mesh(
        new THREE.SphereGeometry(1.55, 20, 16),
        accentMat
      );
      mainRoof.position.y = mainTowerH;
      mainRoof.scale.set(1, 0.65, 1);

      const subTowerH = 4.1 * scaleH;
      const subTower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.3, subTowerH, 18),
        primaryMat
      );
      subTower.position.set(2.1, subTowerH / 2, 0.9);

      const subRoof = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 18, 14),
        glowMat
      );
      subRoof.position.set(2.1, subTowerH, 0.9);
      subRoof.scale.set(1, 0.7, 1);

      group.add(mainTower, mainRoof, subTower, subRoof);
      break;
    }
  }

  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}
