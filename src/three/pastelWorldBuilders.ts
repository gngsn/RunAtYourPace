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
 * Creates a smooth vertical gradient texture (top -> bottom on Three.js primitives).
 */
function createVerticalGradientTexture(
  stops: Array<{ offset: number; color: string }>
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  for (const s of stops) {
    grad.addColorStop(s.offset, s.color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Smooth, soft-gloss 3D vinyl/clay material matching the 5 reference character renders.
 */
function createToyMaterial(
  colorOrMap: string | THREE.Texture,
  options?: {
    roughness?: number;
    clearcoat?: number;
    emissiveHex?: string;
    emissiveIntensity?: number;
  }
): THREE.MeshPhysicalMaterial {
  const isTex = typeof colorOrMap !== 'string';
  return new THREE.MeshPhysicalMaterial({
    color: isTex ? new THREE.Color('#FFFFFF') : new THREE.Color(colorOrMap),
    map: isTex ? colorOrMap : null,
    roughness: options?.roughness ?? 0.32,
    metalness: 0.02,
    clearcoat: options?.clearcoat ?? 0.35,
    clearcoatRoughness: 0.28,
    sheen: 0.25,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#FFFFFF'),
    emissive: new THREE.Color(
      options?.emissiveHex ?? (isTex ? '#222222' : colorOrMap)
    ),
    emissiveIntensity: options?.emissiveIntensity ?? 0.06,
  });
}

/**
 * Builds the articulated 3D Runner with 5 distinct full-body character models matching the 5 reference images:
 * - hoodie_kid (Main: 03_hoodie.png)
 * - topknot_kid (01_sprout_smile.png)
 * - starlight_fox (02_peach_xeyes.png)
 * - flower_orb (04_flower.png)
 * - mint_sprinter (05_beanie.png)
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

  // Legacy material refs kept for interface compatibility
  const sweaterMat = createFeltMaterial(initialTheme.runnerSweaterHex, bumpMap);
  const pantsMat = createFeltMaterial(initialTheme.runnerPantsHex, bumpMap);
  const hatMat = createFeltMaterial(initialTheme.runnerHatHex, bumpMap);
  const hatGroup = new THREE.Group();
  const flowerCrownGroup = new THREE.Group();
  const topknotGroup = new THREE.Group();

  // Shared materials
  const whiteEyeMat = createToyMaterial('#FFFFFF', {
    roughness: 0.18,
    clearcoat: 0.6,
  });
  const darkPupilMat = createToyMaterial('#18181B', {
    roughness: 0.12,
    clearcoat: 0.85,
  });
  const pinkSkinMat = createToyMaterial('#FBBAB6');
  const blushPinkMat = createToyMaterial('#F68BA2', {
    emissiveHex: '#F68BA2',
    emissiveIntensity: 0.15,
  });
  const aquaHairMat = createToyMaterial('#10D4C6');
  const yellowHoodMat = createToyMaterial('#FDE69E');
  const aquaBootMat = createToyMaterial('#1EE0D2');
  const yellowCuffMat = createToyMaterial('#FDE294');

  const momoTealLimbMat = createToyMaterial('#08C6B8');
  const momoPinkTrimMat = createToyMaterial('#F9A8E8');
  const momoPinkBootMat = createToyMaterial('#F68CE4');
  const momoCoralLipMat = createToyMaterial('#FC8E62');

  const cocoPeachLimbMat = createToyMaterial('#F9B7AC');
  const cocoTealRomperMat = createToyMaterial('#09B8BE');
  const cocoCoralBootMat = createToyMaterial('#F5906C');
  const cocoMouthMat = createToyMaterial('#F94C66', {
    emissiveHex: '#F43F5E',
    emissiveIntensity: 0.15,
  });

  const bloomPinkLimbMat = createToyMaterial('#FCA2E6');
  const bloomYellowLipMat = createToyMaterial('#FFE619', {
    emissiveHex: '#FACC15',
    emissiveIntensity: 0.15,
  });
  const bloomLeafMat = createToyMaterial('#06C896');
  const bloomPetalMat = createToyMaterial('#F875E8');
  const bloomPotRimMat = createToyMaterial('#14D4C0');

  const mintTealMat = createToyMaterial('#06BFC4');
  const mintBeanieMat = createToyMaterial('#FDE29C');
  const mintBeanieBrimMat = createToyMaterial('#FDD57E');
  const mintSleeveMat = createToyMaterial('#FCA568');
  const mintBootMat = createToyMaterial('#FA8B68');

  // Gradient textures matching the 5 reference images
  const hoodieGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#FFF0A8' },
    { offset: 0.48, color: '#F2E8A6' },
    { offset: 0.82, color: '#26D8CB' },
    { offset: 1.0, color: '#05C2C4' },
  ]);
  const hoodieGradMat = createToyMaterial(hoodieGradTex);

  const momoHeadGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#FEF2BA' },
    { offset: 0.52, color: '#C5ECC8' },
    { offset: 0.85, color: '#28CEBE' },
    { offset: 1.0, color: '#09BFC0' },
  ]);
  const momoHeadMat = createToyMaterial(momoHeadGradTex);

  const momoRomperGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#FCDAD8' },
    { offset: 0.45, color: '#FAA8E4' },
    { offset: 1.0, color: '#F25CE0' },
  ]);
  const momoRomperMat = createToyMaterial(momoRomperGradTex);

  const sproutPlumeGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#FFF0AC' },
    { offset: 0.65, color: '#D4EBB8' },
    { offset: 1.0, color: '#14C8B8' },
  ]);
  const sproutPlumeMat = createToyMaterial(sproutPlumeGradTex);

  const cocoHeadGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#FDE4AF' },
    { offset: 0.55, color: '#FAB88A' },
    { offset: 1.0, color: '#F4956E' },
  ]);
  const cocoHeadMat = createToyMaterial(cocoHeadGradTex);

  const bloomOrbGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#42F2D6' },
    { offset: 0.35, color: '#7CE4E8' },
    { offset: 0.58, color: '#C4B2F8' },
    { offset: 0.82, color: '#FF6AD5' },
    { offset: 1.0, color: '#FF42BF' },
  ]);
  const bloomOrbMat = createToyMaterial(bloomOrbGradTex, {
    roughness: 0.24,
    clearcoat: 0.5,
  });

  const bloomBootGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#7CD4F8' },
    { offset: 0.5, color: '#C4A8F8' },
    { offset: 1.0, color: '#FF5AD0' },
  ]);
  const bloomBootMat = createToyMaterial(bloomBootGradTex);

  const mintTunicGradTex = createVerticalGradientTexture([
    { offset: 0.0, color: '#FECA6A' },
    { offset: 0.58, color: '#FCA46C' },
    { offset: 1.0, color: '#FA7A72' },
  ]);
  const mintTunicMat = createToyMaterial(mintTunicGradTex);

  // ============================================================================
  // TORSO & HEAD GROUPS PER CHARACTER
  // ============================================================================
  const headGroup = new THREE.Group();
  headGroup.position.y = 2.15;
  bodyGroup.add(headGroup);

  const charTorsoGroups: Record<CharacterModelId, THREE.Group> = {
    hoodie_kid: new THREE.Group(),
    topknot_kid: new THREE.Group(),
    starlight_fox: new THREE.Group(),
    flower_orb: new THREE.Group(),
    mint_sprinter: new THREE.Group(),
  };
  const charHeadGroups: Record<CharacterModelId, THREE.Group> = {
    hoodie_kid: new THREE.Group(),
    topknot_kid: new THREE.Group(),
    starlight_fox: new THREE.Group(),
    flower_orb: new THREE.Group(),
    mint_sprinter: new THREE.Group(),
  };

  (Object.keys(charTorsoGroups) as CharacterModelId[]).forEach((k) => {
    bodyGroup.add(charTorsoGroups[k]);
    headGroup.add(charHeadGroups[k]);
  });

  // Helper to build big round white + black eyes (used by Hoodie & Beanie)
  const addBigWhiteBlackEyes = (
    parent: THREE.Group,
    zFront: number,
    cheekMat: THREE.Material
  ) => {
    [-1, 1].forEach((side) => {
      const sclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 18, 18),
        whiteEyeMat
      );
      sclera.scale.set(0.95, 1.08, 0.52);
      sclera.position.set(side * 0.13, 0.01, zFront);
      parent.add(sclera);

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.074, 16, 16),
        darkPupilMat
      );
      pupil.scale.set(0.95, 1.05, 0.55);
      pupil.position.set(side * 0.13, 0.01, zFront + 0.032);
      parent.add(pupil);

      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 10, 10),
        whiteEyeMat
      );
      catchlight.position.set(side * 0.13 - 0.025, 0.035, zFront + 0.068);
      parent.add(catchlight);

      const cheek = new THREE.Mesh(
        new THREE.SphereGeometry(0.072, 14, 14),
        cheekMat
      );
      cheek.scale.set(1.25, 0.72, 0.5);
      cheek.position.set(side * 0.22, -0.075, zFront - 0.035);
      parent.add(cheek);
    });

    // Cute black '◡' smile arc
    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.017, 10, 20, Math.PI),
      darkPupilMat
    );
    smile.rotation.z = Math.PI;
    smile.position.set(0, -0.07, zFront + 0.02);
    parent.add(smile);
  };

  // Helper to build topknot double hairband + 4 plumes (used by Momo & Coco)
  const addSproutTopknot = (
    parent: THREE.Group,
    bandBottomMat: THREE.Material,
    bandTopMat: THREE.Material,
    plumeMat: THREE.Material
  ) => {
    const band1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.046, 14, 24),
      bandBottomMat
    );
    band1.rotation.x = Math.PI / 2;
    band1.position.set(0, 0.46, 0);
    parent.add(band1);

    const band2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.155, 0.044, 14, 24),
      bandTopMat
    );
    band2.rotation.x = Math.PI / 2;
    band2.position.set(0, 0.525, 0);
    parent.add(band2);

    // 4 rounded teardrop plumes fanning out from the band
    const plumeConfigs = [
      { x: -0.14, y: 0.67, z: 0.02, rz: 0.62, rx: 0.08, s: 1.05 },
      { x: 0.14, y: 0.67, z: 0.02, rz: -0.62, rx: 0.08, s: 1.05 },
      { x: 0.0, y: 0.68, z: 0.08, rz: 0.0, rx: 0.35, s: 0.92 },
      { x: 0.0, y: 0.71, z: -0.05, rz: 0.0, rx: -0.22, s: 1.0 },
    ];
    plumeConfigs.forEach((cfg) => {
      const plume = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.072 * cfg.s, 0.16 * cfg.s, 12, 16),
        plumeMat
      );
      plume.position.set(cfg.x, cfg.y, cfg.z);
      plume.rotation.set(cfg.rx, 0, cfg.rz);
      parent.add(plume);
    });
  };

  // ----------------------------------------------------------------------------
  // 1. HOODIE_KID (Main — 03_hoodie.png)
  // ----------------------------------------------------------------------------
  {
    const tGrp = charTorsoGroups.hoodie_kid;
    const hGrp = charHeadGroups.hoodie_kid;

    // Bell-shaped yellow-to-aqua gradient hoodie torso
    const bellTorso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.49, 0.72, 28),
      hoodieGradMat
    );
    bellTorso.position.y = 1.38;
    tGrp.add(bellTorso);

    const torsoTopDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 16),
      yellowHoodMat
    );
    torsoTopDome.scale.set(1, 0.55, 1);
    torsoTopDome.position.y = 1.72;
    tGrp.add(torsoTopDome);

    const torsoBottomCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.49, 0.44, 0.1, 28),
      aquaHairMat
    );
    torsoBottomCap.position.y = 1.0;
    tGrp.add(torsoBottomCap);

    // Aqua drawstrings with round beads on chest (+Z)
    [-1, 1].forEach((side) => {
      const cord = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.022, 0.19, 8, 12),
        aquaHairMat
      );
      cord.position.set(side * 0.075, 1.63, 0.35);
      cord.rotation.z = side * 0.22;
      cord.rotation.x = -0.18;
      tGrp.add(cord);

      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.044, 12, 12),
        aquaHairMat
      );
      bead.position.set(side * 0.098, 1.52, 0.38);
      tGrp.add(bead);
    });

    // Oversized cream-yellow outer hood sphere
    const outerHood = new THREE.Mesh(
      new THREE.SphereGeometry(0.51, 28, 24),
      yellowHoodMat
    );
    outerHood.scale.set(1.06, 1.02, 1.02);
    hGrp.add(outerHood);

    // Thick rolled hood opening rim on the front (+Z)
    const hoodRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.43, 0.078, 16, 32),
      yellowHoodMat
    );
    hoodRim.position.set(0, 0.0, 0.21);
    hGrp.add(hoodRim);

    // Inner soft pink face sphere
    const pinkFace = new THREE.Mesh(
      new THREE.SphereGeometry(0.415, 24, 24),
      pinkSkinMat
    );
    pinkFace.position.set(0, 0.0, 0.07);
    hGrp.add(pinkFace);

    // Parted glossy aqua-teal bangs inside top of hood
    [-1, 1].forEach((side) => {
      const bangLobe = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.125, 0.26, 12, 16),
        aquaHairMat
      );
      bangLobe.position.set(side * 0.17, 0.2, 0.36);
      bangLobe.rotation.z = side * 1.02;
      bangLobe.rotation.y = -side * 0.28;
      bangLobe.scale.set(1.0, 1.0, 0.55);
      hGrp.add(bangLobe);
    });

    addBigWhiteBlackEyes(hGrp, 0.44, blushPinkMat);
  }

  // ----------------------------------------------------------------------------
  // 2. TOPKNOT_KID (Momo — 01_sprout_smile.png)
  // ----------------------------------------------------------------------------
  {
    const tGrp = charTorsoGroups.topknot_kid;
    const hGrp = charHeadGroups.topknot_kid;

    // Rounded pink gradient romper torso
    const romperBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 26, 24),
      momoRomperMat
    );
    romperBody.scale.set(0.96, 1.08, 0.88);
    romperBody.position.y = 1.38;
    tGrp.add(romperBody);

    // Pink shoulder trim rings & leg cuff rings
    [-1, 1].forEach((side) => {
      const armTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.145, 0.036, 12, 20),
        momoPinkTrimMat
      );
      armTrim.rotation.y = Math.PI / 2;
      armTrim.rotation.x = side * 0.25;
      armTrim.position.set(side * 0.35, 1.56, 0);
      tGrp.add(armTrim);

      const legTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.155, 0.035, 12, 20),
        momoPinkTrimMat
      );
      legTrim.rotation.x = Math.PI / 2;
      legTrim.rotation.y = side * 0.25;
      legTrim.position.set(side * 0.19, 1.04, 0);
      tGrp.add(legTrim);
    });

    // Big cream-to-aqua gradient head sphere
    const headSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 28, 24),
      momoHeadMat
    );
    headSphere.scale.set(1.05, 0.98, 1.0);
    hGrp.add(headSphere);

    // Happy arched black eyes (◠ ◠)
    [-1, 1].forEach((side) => {
      const archEye = new THREE.Mesh(
        new THREE.TorusGeometry(0.068, 0.022, 10, 20, Math.PI),
        darkPupilMat
      );
      archEye.position.set(side * 0.125, 0.075, 0.455);
      hGrp.add(archEye);
    });

    // Cute round coral-orange nose button
    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.054, 14, 14),
      momoCoralLipMat
    );
    nose.position.set(0, 0.005, 0.49);
    hGrp.add(nose);

    // Thick puffy coral-orange lips
    const lips = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.048, 14, 24),
      momoCoralLipMat
    );
    lips.scale.set(1.35, 0.78, 0.7);
    lips.position.set(0, -0.11, 0.455);
    hGrp.add(lips);

    addSproutTopknot(
      hGrp,
      createToyMaterial('#F46CE0'),
      createToyMaterial('#FBB8F0'),
      sproutPlumeMat
    );
  }

  // ----------------------------------------------------------------------------
  // 3. STARLIGHT_FOX (Coco — 02_peach_xeyes.png)
  // ----------------------------------------------------------------------------
  {
    const tGrp = charTorsoGroups.starlight_fox;
    const hGrp = charHeadGroups.starlight_fox;

    // Rounded bright teal romper torso
    const romperBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 26, 24),
      cocoTealRomperMat
    );
    romperBody.scale.set(0.96, 1.08, 0.88);
    romperBody.position.y = 1.38;
    tGrp.add(romperBody);

    // Teal shoulder trim rings & leg cuff rings
    [-1, 1].forEach((side) => {
      const armTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.145, 0.036, 12, 20),
        cocoTealRomperMat
      );
      armTrim.rotation.y = Math.PI / 2;
      armTrim.rotation.x = side * 0.25;
      armTrim.position.set(side * 0.35, 1.56, 0);
      tGrp.add(armTrim);

      const legTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.155, 0.035, 12, 20),
        cocoTealRomperMat
      );
      legTrim.rotation.x = Math.PI / 2;
      legTrim.rotation.y = side * 0.25;
      legTrim.position.set(side * 0.19, 1.04, 0);
      tGrp.add(legTrim);
    });

    // Big warm peach gradient head sphere
    const headSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 28, 24),
      cocoHeadMat
    );
    headSphere.scale.set(1.05, 0.98, 1.0);
    hGrp.add(headSphere);

    // Playful 'X X' eyes
    [-1, 1].forEach((side) => {
      const xGrp = new THREE.Group();
      xGrp.position.set(side * 0.13, 0.065, 0.465);
      const bar1 = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.02, 0.11, 8, 12),
        darkPupilMat
      );
      bar1.rotation.z = Math.PI / 4;
      const bar2 = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.02, 0.11, 8, 12),
        darkPupilMat
      );
      bar2.rotation.z = -Math.PI / 4;
      xGrp.add(bar1, bar2);
      hGrp.add(xGrp);
    });

    // Big D-shaped open laughing red-pink mouth
    const mouth = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.135,
        0.135,
        0.06,
        24,
        1,
        false,
        0,
        Math.PI
      ),
      cocoMouthMat
    );
    mouth.rotation.z = -Math.PI / 2;
    mouth.rotation.y = Math.PI / 2;
    mouth.position.set(0, -0.055, 0.445);
    hGrp.add(mouth);

    addSproutTopknot(
      hGrp,
      createToyMaterial('#05B2B2'),
      createToyMaterial('#12D8D8'),
      yellowHoodMat
    );
  }

  // ----------------------------------------------------------------------------
  // 4. FLOWER_ORB (Bloom — 04_flower.png)
  // ----------------------------------------------------------------------------
  {
    const tGrp = charTorsoGroups.flower_orb;

    // Giant all-in-one aqua-lavender-pink gradient orb body/head!
    const giantOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 32, 28),
      bloomOrbMat
    );
    giantOrb.scale.set(1.02, 0.98, 0.98);
    giantOrb.position.set(0, 1.66, 0);
    tGrp.add(giantOrb);

    // Big glossy black button eyes right on the front of the orb
    [-1, 1].forEach((side) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.092, 18, 18),
        darkPupilMat
      );
      eye.scale.set(1.0, 1.0, 0.65);
      eye.position.set(side * 0.155, 1.72, 0.61);
      tGrp.add(eye);

      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 10),
        whiteEyeMat
      );
      shine.position.set(side * 0.155 - 0.028, 1.75, 0.66);
      tGrp.add(shine);
    });

    // Puffy bright yellow duck lips
    const duckLips = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.052, 14, 24),
      bloomYellowLipMat
    );
    duckLips.scale.set(1.42, 0.78, 0.75);
    duckLips.position.set(0, 1.54, 0.61);
    tGrp.add(duckLips);

    // Top planter rim + 5 green leaves + curved stem + 7-petal pink daisy flower
    const potRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.038, 12, 24),
      bloomPotRimMat
    );
    potRim.rotation.x = Math.PI / 2;
    potRim.position.set(0, 2.27, 0);
    tGrp.add(potRim);

    for (let lf = 0; lf < 5; lf++) {
      const ang = (lf / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.068, 0.16, 10, 14),
        bloomLeafMat
      );
      leaf.position.set(Math.cos(ang) * 0.12, 2.38, Math.sin(ang) * 0.1);
      leaf.rotation.z = -Math.cos(ang) * 0.55;
      leaf.rotation.x = Math.sin(ang) * 0.45;
      tGrp.add(leaf);
    }

    // Curved green flower stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.3, 0),
      new THREE.Vector3(0.02, 2.58, 0.02),
      new THREE.Vector3(0.1, 2.82, 0.05),
    ]);
    const stemMesh = new THREE.Mesh(
      new THREE.TubeGeometry(stemCurve, 16, 0.034, 10, false),
      bloomLeafMat
    );
    tGrp.add(stemMesh);

    // Tilted 7-petal pink flower with bright yellow center at top of stem
    const flowerHead = new THREE.Group();
    flowerHead.position.set(0.12, 2.86, 0.06);
    flowerHead.rotation.set(0.35, 0.15, -0.32);

    const yellowCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 16, 16),
      bloomYellowLipMat
    );
    yellowCenter.scale.set(1.0, 0.65, 1.0);
    flowerHead.add(yellowCenter);

    for (let p = 0; p < 7; p++) {
      const a = (p / 7) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.078, 0.12, 10, 14),
        bloomPetalMat
      );
      petal.position.set(Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17);
      petal.rotation.x = Math.PI / 2;
      petal.rotation.z = -a + Math.PI / 2;
      petal.scale.set(1.0, 1.0, 0.58);
      flowerHead.add(petal);
    }
    tGrp.add(flowerHead);
  }

  // ----------------------------------------------------------------------------
  // 5. MINT_SPRINTER (Mint — 05_beanie.png)
  // ----------------------------------------------------------------------------
  {
    const tGrp = charTorsoGroups.mint_sprinter;
    const hGrp = charHeadGroups.mint_sprinter;

    // Flared A-line yellow-to-coral gradient tunic dress
    const tunicMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.49, 0.76, 28),
      mintTunicMat
    );
    tunicMesh.position.y = 1.38;
    tGrp.add(tunicMesh);

    // Big glossy aqua-teal head sphere
    const headSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 28, 24),
      mintTealMat
    );
    headSphere.scale.set(1.05, 0.98, 1.0);
    hGrp.add(headSphere);

    // Cream-yellow dome beanie with thick rolled torus brim
    const beanieGroup = new THREE.Group();
    beanieGroup.position.set(0, 0.19, 0);
    beanieGroup.rotation.z = -0.05;
    beanieGroup.rotation.x = -0.06;

    const beanieDome = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.455,
        24,
        18,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55
      ),
      mintBeanieMat
    );
    beanieDome.scale.set(1.04, 0.92, 1.02);
    beanieGroup.add(beanieDome);

    const beanieBrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.43, 0.088, 16, 32),
      mintBeanieBrimMat
    );
    beanieBrim.rotation.x = Math.PI / 2;
    beanieBrim.scale.set(1.04, 1.02, 0.95);
    beanieBrim.position.y = 0.04;
    beanieGroup.add(beanieBrim);

    hGrp.add(beanieGroup);

    addBigWhiteBlackEyes(hGrp, 0.44, blushPinkMat);
  }

  // ============================================================================
  // ARTICULATED ARMS (Per-Character Styled Meshes Inside Shared Arm Pivots)
  // ============================================================================
  const createArm = (side: -1 | 1) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.44, 1.66, 0);

    const styleGroups: Record<CharacterModelId, THREE.Group> = {
      hoodie_kid: new THREE.Group(),
      topknot_kid: new THREE.Group(),
      starlight_fox: new THREE.Group(),
      flower_orb: new THREE.Group(),
      mint_sprinter: new THREE.Group(),
    };

    // 1. Hoodie Arm (gradient sleeve + pink hand)
    {
      const g = styleGroups.hoodie_kid;
      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.145, 0.44, 16),
        hoodieGradMat
      );
      sleeve.position.set(side * 0.08, -0.22, 0);
      sleeve.rotation.z = side * 0.32;
      g.add(sleeve);

      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 14, 14),
        pinkSkinMat
      );
      hand.position.set(side * 0.16, -0.47, 0);
      g.add(hand);
    }

    // 2. Momo Arm (curved teal arm + round ball hand)
    {
      const g = styleGroups.topknot_kid;
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.085, 0.34, 10, 14),
        momoTealLimbMat
      );
      arm.position.set(side * 0.08, -0.2, 0);
      arm.rotation.z = side * 0.32;
      g.add(arm);

      const ballHand = new THREE.Mesh(
        new THREE.SphereGeometry(0.135, 16, 16),
        momoTealLimbMat
      );
      ballHand.position.set(side * 0.15, -0.42, 0);
      g.add(ballHand);
    }

    // 3. Coco Arm (peach arm + round ball hand)
    {
      const g = styleGroups.starlight_fox;
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.085, 0.34, 10, 14),
        cocoPeachLimbMat
      );
      arm.position.set(side * 0.08, -0.2, 0);
      arm.rotation.z = side * 0.35;
      g.add(arm);

      const ballHand = new THREE.Mesh(
        new THREE.SphereGeometry(0.135, 16, 16),
        cocoPeachLimbMat
      );
      ballHand.position.set(side * 0.16, -0.42, 0);
      g.add(ballHand);
    }

    // 4. Bloom Arm (long pink arm on side of giant orb)
    {
      const g = styleGroups.flower_orb;
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.56, 10, 14),
        bloomPinkLimbMat
      );
      arm.position.set(side * 0.2, -0.26, 0);
      arm.rotation.z = side * 0.08;
      g.add(arm);

      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 14, 14),
        bloomPinkLimbMat
      );
      hand.position.set(side * 0.22, -0.58, 0);
      g.add(hand);
    }

    // 5. Mint Beanie Arm (short peach sleeve + teal forearm & hand)
    {
      const g = styleGroups.mint_sprinter;
      const shortSleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.135, 0.22, 16),
        mintSleeveMat
      );
      shortSleeve.position.set(side * 0.04, -0.1, 0);
      shortSleeve.rotation.z = side * 0.35;
      g.add(shortSleeve);

      const forearm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.24, 10, 14),
        mintTealMat
      );
      forearm.position.set(side * 0.12, -0.28, 0);
      forearm.rotation.z = side * 0.32;
      g.add(forearm);

      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 14, 14),
        mintTealMat
      );
      hand.position.set(side * 0.18, -0.44, 0);
      g.add(hand);
    }

    (Object.keys(styleGroups) as CharacterModelId[]).forEach((k) => {
      pivot.add(styleGroups[k]);
    });

    bodyGroup.add(pivot);
    return { pivot, styleGroups };
  };

  const leftArm = createArm(-1);
  const rightArm = createArm(1);

  // ============================================================================
  // 2-JOINT ARTICULATED LEGS & CHUNKY BOOTS (Matching Reference Boots & Cuffs)
  // ============================================================================
  const createArticulatedLeg = (side: -1 | 1) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(side * 0.18, 1.02, 0);

    const thighMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.095, 0.24, 10, 16),
      pinkSkinMat
    );
    thighMesh.position.y = -0.18;
    hipPivot.add(thighMesh);

    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.36, 0);
    hipPivot.add(kneePivot);

    const shinMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.092, 0.22, 10, 16),
      pinkSkinMat
    );
    shinMesh.position.y = -0.16;
    kneePivot.add(shinMesh);

    // Ankle Cuff Ring (Yellow on Hoodie/Momo/Coco/Mint, Teal on Bloom)
    const cuffRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.115, 0.034, 12, 20),
      yellowCuffMat
    );
    cuffRing.rotation.x = Math.PI / 2;
    cuffRing.position.set(0, -0.28, 0);
    kneePivot.add(cuffRing);

    // Chunky Glossy Boot Shaft + Rounded Toe Box + Sole Rim
    const bootShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.14, 0.2, 18),
      aquaBootMat
    );
    bootShaft.position.set(0, -0.39, 0);
    kneePivot.add(bootShaft);

    const bootToe = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.135, 0.18, 12, 18),
      aquaBootMat
    );
    bootToe.rotation.x = Math.PI / 2;
    bootToe.scale.set(1.08, 1.0, 0.85);
    bootToe.position.set(0, -0.45, 0.075);
    kneePivot.add(bootToe);

    bodyGroup.add(hipPivot);
    return {
      hipPivot,
      kneePivot,
      thighMesh,
      shinMesh,
      cuffRing,
      bootShaft,
      bootToe,
    };
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

  const setCharacterModel = (modelId: CharacterModelId) => {
    currentCharId = modelId;

    (Object.keys(charTorsoGroups) as CharacterModelId[]).forEach((k) => {
      const active = k === modelId;
      charTorsoGroups[k].visible = active;
      charHeadGroups[k].visible = active;
      leftArm.styleGroups[k].visible = active;
      rightArm.styleGroups[k].visible = active;
    });

    // Apply per-character leg, ankle cuff, and boot materials
    const legSkinByChar: Record<CharacterModelId, THREE.Material> = {
      hoodie_kid: pinkSkinMat,
      topknot_kid: momoTealLimbMat,
      starlight_fox: cocoPeachLimbMat,
      flower_orb: bloomPinkLimbMat,
      mint_sprinter: mintTealMat,
    };
    const cuffByChar: Record<CharacterModelId, THREE.Material> = {
      hoodie_kid: yellowCuffMat,
      topknot_kid: yellowCuffMat,
      starlight_fox: yellowCuffMat,
      flower_orb: bloomPotRimMat,
      mint_sprinter: yellowCuffMat,
    };
    const bootByChar: Record<CharacterModelId, THREE.Material> = {
      hoodie_kid: aquaBootMat,
      topknot_kid: momoPinkBootMat,
      starlight_fox: cocoCoralBootMat,
      flower_orb: bloomBootMat,
      mint_sprinter: mintBootMat,
    };

    [leftLeg, rightLeg].forEach((leg) => {
      leg.thighMesh.material = legSkinByChar[modelId];
      leg.shinMesh.material = legSkinByChar[modelId];
      leg.cuffRing.material = cuffByChar[modelId];
      leg.bootShaft.material = bootByChar[modelId];
      leg.bootToe.material = bootByChar[modelId];
    });
  };

  const updateThemeStyle = (
    _theme: ArtworkThemeConfig,
    themeId: ArtworkThemeId
  ) => {
    fishCompanionGroup.visible =
      themeId === 'riverside' ||
      themeId === 'cloud' ||
      currentCharId === 'flower_orb';
  };

  // Ensure shadows are enabled on all character parts
  bodyGroup.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  setCharacterModel(initialCharacter);
  updateThemeStyle(initialTheme, initialTheme.id);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot: leftArm.pivot,
    rightArmPivot: rightArm.pivot,
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
