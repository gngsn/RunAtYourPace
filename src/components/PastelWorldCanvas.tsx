import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createFeltMaterial,
  createFeltRunnerRig,
  createFuzzyFeltBumpTexture,
  createLandmarkBuildingGroup,
  createSoftShadowTexture,
  FeltRunnerRig,
} from '../three/pastelWorldBuilders';
import {
  ArtworkThemeId,
  CameraModeId,
  CharacterModelId,
  GpxCourseData,
  SurroundingLandmark,
} from '../types/gpx';
import { ARTWORK_THEMES } from '../utils/gpxParser';
import { soundEngine } from '../utils/soundEffects';

export type LaneIndex = -1 | 0 | 1;
export const LANE_WIDTH = 1.55; // Distance between adjacent lanes (-1.55, 0, +1.55)

export interface GameStatsUpdate {
  coins: number;
  score: number;
  combo: number;
  maxCombo: number;
  isFever: boolean;
  feverTimeLeft: number;
  lastEventLabel: string | null;
  currentLane: LaneIndex;
}

export interface RunnerControlActions {
  moveLeft: () => void;
  moveRight: () => void;
  jump: () => void;
  resetCollectibles: () => void;
}

// Pre-allocated math objects outside render loop (Zero GC)
const _curvePos = new THREE.Vector3();
const _samplePos = new THREE.Vector3();
const _tangent = new THREE.Vector3(0, 0, 1);
const _smoothedTangent = new THREE.Vector3(0, 0, 1);
const _up = new THREE.Vector3(0, 1, 0);
const _right = new THREE.Vector3();
const _runnerTargetPos = new THREE.Vector3();
const _camDesiredPos = new THREE.Vector3();
const _camDesiredLook = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

interface CloudParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  scale: number;
  maxLife: number;
  life: number;
  kind: 'cloud' | 'leaf' | 'coin_burst';
  rotSpeed: THREE.Vector3;
  rot: THREE.Euler;
}

interface TrackCollectible {
  id: number;
  t: number; // 0..1 spline ratio
  lane: LaneIndex;
  type: 'coin' | 'boost_star' | 'cloud_hurdle';
  elevOffset: number; // 0 for normal, 1.35 for high jump arc coin
  worldPos: THREE.Vector3;
  tangentAngle: number;
  collected: boolean;
}

/**
 * Generates a high-contrast 3-LANE running track texture with 2 crisp dashed lane dividers,
 * alternating lane shading, and directional chevrons in each of the 3 lanes.
 */
function createThreeLaneTrackTexture(
  roadHex: string,
  stripeHex: string,
  borderHex: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const W = 512;
  const H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = roadHex;
  ctx.fillRect(0, 0, W, H);

  const shoulderW = 28;
  const innerW = W - shoulderW * 2;
  const laneW = innerW / 3;

  // 3 Distinct Lanes with subtle surface contrast
  ctx.fillStyle = 'rgba(15, 23, 42, 0.09)';
  ctx.fillRect(shoulderW, 0, laneW, H);
  ctx.fillRect(shoulderW + laneW * 2, 0, laneW, H);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(shoulderW + laneW, 0, laneW, H);

  // Bold outer shoulder curbs
  ctx.fillStyle = borderHex;
  ctx.fillRect(0, 0, shoulderW, H);
  ctx.fillRect(W - shoulderW, 0, shoulderW, H);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(shoulderW - 6, 0, 6, H);
  ctx.fillRect(W - shoulderW, 0, 6, H);

  // Two crisp dashed lane divider lines
  const div1X = shoulderW + laneW;
  const div2X = shoulderW + laneW * 2;

  ctx.fillStyle = '#FFFFFF';
  for (let y = 0; y < H; y += 64) {
    ctx.beginPath();
    ctx.roundRect(div1X - 4, y + 10, 8, 36, 4);
    ctx.roundRect(div2X - 4, y + 10, 8, 36, 4);
    ctx.fill();
  }

  // Forward directional chevrons (>>>) inside each of the 3 lanes
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const laneCenters = [
    shoulderW + laneW * 0.5,
    shoulderW + laneW * 1.5,
    shoulderW + laneW * 2.5,
  ];

  laneCenters.forEach((cx, laneIdx) => {
    ctx.strokeStyle = laneIdx === 1 ? borderHex : stripeHex;
    for (let y = 44; y < H; y += 128) {
      ctx.beginPath();
      ctx.moveTo(cx - 24, y + 22);
      ctx.lineTo(cx, y);
      ctx.lineTo(cx + 24, y + 22);
      ctx.stroke();
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

interface PastelWorldCanvasProps {
  course: GpxCourseData;
  themeId: ArtworkThemeId;
  characterId: CharacterModelId;
  cameraMode: CameraModeId;
  isPlaying: boolean;
  playbackSpeed: number;
  progressRatio: number;
  isAutoPlay: boolean;
  selectedLandmarkId: string | null;
  actionsRef: React.MutableRefObject<RunnerControlActions | null>;
  onProgressTick: (newRatio: number, currentPointIdx: number) => void;
  onSelectLandmark: (landmark: SurroundingLandmark | null) => void;
  onGameStatsUpdate: (stats: GameStatsUpdate) => void;
}

export const PastelWorldCanvas: React.FC<PastelWorldCanvasProps> = ({
  course,
  themeId,
  characterId,
  cameraMode,
  isPlaying,
  playbackSpeed,
  progressRatio,
  isAutoPlay,
  selectedLandmarkId,
  actionsRef,
  onProgressTick,
  onSelectLandmark,
  onGameStatsUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    course,
    themeId,
    characterId,
    cameraMode,
    isPlaying,
    playbackSpeed,
    progressRatio,
    isAutoPlay,
    selectedLandmarkId,
    currentLane: 0 as LaneIndex,
    laneOffset: 0,
    jumpY: 0,
    jumpVel: 0,
    sprintBoost: 0,
    feverTimer: 0,
    coins: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    lastEventLabel: null as string | null,
  });

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.playbackSpeed = playbackSpeed;
    stateRef.current.cameraMode = cameraMode;
    stateRef.current.isAutoPlay = isAutoPlay;
    stateRef.current.selectedLandmarkId = selectedLandmarkId;
  }, [isPlaying, playbackSpeed, cameraMode, isAutoPlay, selectedLandmarkId]);

  useEffect(() => {
    if (Math.abs(stateRef.current.progressRatio - progressRatio) > 0.002) {
      stateRef.current.progressRatio = progressRatio;
    }
  }, [progressRatio]);

  const rebuildCourseRef = useRef<((newCourse: GpxCourseData) => void) | null>(
    null
  );
  const applyThemeRef = useRef<((newThemeId: ArtworkThemeId) => void) | null>(
    null
  );
  const applyCharacterRef = useRef<
    ((newCharId: CharacterModelId) => void) | null
  >(null);

  useEffect(() => {
    rebuildCourseRef.current?.(course);
  }, [course]);

  useEffect(() => {
    applyThemeRef.current?.(themeId);
  }, [themeId]);

  useEffect(() => {
    stateRef.current.characterId = characterId;
    applyCharacterRef.current?.(characterId);
  }, [characterId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    const scene = new THREE.Scene();
    const initialTheme = ARTWORK_THEMES[stateRef.current.themeId];
    scene.background = new THREE.Color(initialTheme.skyTopHex);
    scene.fog = new THREE.FogExp2(initialTheme.fogHex, 0.004);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.2,
      550
    );
    camera.position.set(0, 5, 14);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isHeadless ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    pmremGenerator.dispose();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const fuzzyBumpTex = createFuzzyFeltBumpTexture(maxAnisotropy);
    const softShadowTex = createSoftShadowTexture();

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(
      initialTheme.skyHorizonHex,
      initialTheme.groundPrimaryHex,
      1.15
    );
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF5E4', 1.65);
    keyLight.position.set(35, 65, 40);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.set(1024, 1024);
    const d = 55;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 180;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.DirectionalLight('#FF88C2', 0.95);
    rimLight.position.set(-40, 30, -45);
    scene.add(rimLight);

    // Sky Moon & Vertical Light Beam
    const skyDecorGroup = new THREE.Group();
    scene.add(skyDecorGroup);

    const moonMat = new THREE.MeshBasicMaterial({
      color: initialTheme.accentOrbHex,
    });
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(6.5, 32, 32),
      moonMat
    );
    moonMesh.position.set(0, 62, -145);
    skyDecorGroup.add(moonMesh);

    const moonHaloMat = new THREE.MeshBasicMaterial({
      color: initialTheme.accentOrbHex,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
    const moonHaloMesh = new THREE.Mesh(
      new THREE.SphereGeometry(14.5, 32, 32),
      moonHaloMat
    );
    moonHaloMesh.position.copy(moonMesh.position);
    skyDecorGroup.add(moonHaloMesh);

    const beamMat = new THREE.MeshBasicMaterial({
      color: initialTheme.accentOrbHex,
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 12, 120, 20, 1, true),
      beamMat
    );
    beamMesh.position.set(0, 10, -145);
    skyDecorGroup.add(beamMesh);

    // Floating Luminous Sky Capsules
    const skyCapsulesGeo = new THREE.CapsuleGeometry(0.65, 2.8, 8, 16);
    const skyCapsulesMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
    const skyCapsulesInst = new THREE.InstancedMesh(
      skyCapsulesGeo,
      skyCapsulesMat,
      36
    );
    const capsuleColors = [
      '#FF85B8',
      '#80FFB4',
      '#FDE68A',
      '#A78BFA',
      '#67E8F9',
    ];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const rad = 65 + (i % 4) * 28;
      _dummy.position.set(
        Math.cos(angle) * rad,
        24 + (i % 5) * 9,
        Math.sin(angle) * rad
      );
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.setScalar(0.6 + (i % 3) * 0.35);
      _dummy.updateMatrix();
      skyCapsulesInst.setMatrixAt(i, _dummy.matrix);
      skyCapsulesInst.setColorAt(
        i,
        _color.set(capsuleColors[i % capsuleColors.length])
      );
    }
    skyCapsulesInst.computeBoundingSphere();
    scene.add(skyCapsulesInst);

    // Vast Ground Meadow Plane
    const groundMat = createFeltMaterial(
      initialTheme.groundPrimaryHex,
      fuzzyBumpTex,
      {
        sheenColorHex: '#FFFFFF',
        emissiveHex: initialTheme.groundSecondaryHex,
        emissiveIntensity: 0.14,
        roughness: 0.9,
        bumpScale: 0.08,
      }
    );
    const groundGeo = new THREE.CircleGeometry(420, 64);
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.45;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Needle-Felt Runner Rig + Fever Aura Ring
    const runnerRig: FeltRunnerRig = createFeltRunnerRig(
      fuzzyBumpTex,
      softShadowTex,
      initialTheme,
      stateRef.current.characterId
    );
    scene.add(runnerRig.root);

    const feverRingGeo = new THREE.TorusGeometry(0.95, 0.08, 12, 32);
    const feverRingMat = new THREE.MeshBasicMaterial({
      color: '#FDE047',
      transparent: true,
      opacity: 0,
    });
    const feverRingMesh = new THREE.Mesh(feverRingGeo, feverRingMat);
    feverRingMesh.rotation.x = Math.PI / 2;
    feverRingMesh.position.y = 0.25;
    runnerRig.root.add(feverRingMesh);

    // Particle Pool: Cloud Puffs, Autumn Leaves & Golden Coin Burst Stars
    const MAX_PARTICLES = 110;
    const cloudPuffGeo = new THREE.SphereGeometry(0.48, 14, 14);
    const cloudPuffMat = createFeltMaterial('#FFFFFF', fuzzyBumpTex, {
      sheenColorHex: '#FFE4E6',
      emissiveHex: '#FFFBEB',
      emissiveIntensity: 0.22,
      roughness: 0.92,
    });
    const cloudInstMesh = new THREE.InstancedMesh(
      cloudPuffGeo,
      cloudPuffMat,
      MAX_PARTICLES
    );
    cloudInstMesh.frustumCulled = false;
    scene.add(cloudInstMesh);

    const leafGeo = new THREE.ConeGeometry(0.28, 0.65, 5);
    leafGeo.scale(1, 1, 0.22);
    const leafMat = createFeltMaterial('#E58249', fuzzyBumpTex, {
      sheenColorHex: '#FDE68A',
      emissiveHex: '#EA580C',
      emissiveIntensity: 0.18,
    });
    const leafInstMesh = new THREE.InstancedMesh(
      leafGeo,
      leafMat,
      MAX_PARTICLES
    );
    leafInstMesh.frustumCulled = false;
    scene.add(leafInstMesh);

    const burstStarGeo = new THREE.OctahedronGeometry(0.26, 0);
    const burstStarMat = new THREE.MeshBasicMaterial({ color: '#FDE047' });
    const burstInstMesh = new THREE.InstancedMesh(
      burstStarGeo,
      burstStarMat,
      MAX_PARTICLES
    );
    burstInstMesh.frustumCulled = false;
    scene.add(burstInstMesh);

    const particles: CloudParticle[] = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        pos: new THREE.Vector3(0, -999, 0),
        vel: new THREE.Vector3(),
        scale: 0.001,
        maxLife: 1,
        life: 0,
        kind: 'cloud',
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        rot: new THREE.Euler(),
      });
    }
    let nextParticleIdx = 0;

    const spawnParticles = (
      origin: THREE.Vector3,
      count: number,
      kind: 'cloud' | 'leaf' | 'coin_burst',
      spread = 1.1
    ) => {
      for (let c = 0; c < count; c++) {
        const p = particles[nextParticleIdx];
        nextParticleIdx = (nextParticleIdx + 1) % MAX_PARTICLES;
        p.pos.set(
          origin.x + (Math.random() - 0.5) * spread,
          origin.y + (kind === 'coin_burst' ? 1.2 : 0.2) + Math.random() * 0.4,
          origin.z + (Math.random() - 0.5) * spread
        );
        const speedMult = kind === 'coin_burst' ? 3.5 : 1.5;
        p.vel.set(
          (Math.random() - 0.5) * speedMult,
          (kind === 'coin_burst' ? 1.8 : 0.7) + Math.random() * 1.8,
          (Math.random() - 0.5) * speedMult
        );
        p.scale =
          kind === 'coin_burst'
            ? 0.7 + Math.random() * 0.6
            : 0.6 + Math.random() * 0.9;
        p.maxLife = kind === 'coin_burst' ? 0.55 : 0.9 + Math.random() * 0.6;
        p.life = p.maxLife;
        p.kind = kind;
      }
    };

    const courseGroup = new THREE.Group();
    scene.add(courseGroup);

    // Collectibles InstancedMeshes
    const MAX_COINS = 160;
    const coinOuterGeo = new THREE.TorusGeometry(0.42, 0.14, 12, 24);
    const coinOuterMat = new THREE.MeshPhysicalMaterial({
      color: '#FACC15',
      roughness: 0.25,
      metalness: 0.65,
      clearcoat: 0.8,
      emissive: new THREE.Color('#F59E0B'),
      emissiveIntensity: 0.35,
    });
    const coinOuterInst = new THREE.InstancedMesh(
      coinOuterGeo,
      coinOuterMat,
      MAX_COINS
    );
    coinOuterInst.frustumCulled = false;
    scene.add(coinOuterInst);

    const coinCoreGeo = new THREE.OctahedronGeometry(0.26, 0);
    const coinCoreMat = new THREE.MeshBasicMaterial({ color: '#FEF08A' });
    const coinCoreInst = new THREE.InstancedMesh(
      coinCoreGeo,
      coinCoreMat,
      MAX_COINS
    );
    coinCoreInst.frustumCulled = false;
    scene.add(coinCoreInst);

    const MAX_BOOST_STARS = 24;
    const boostStarGeo = new THREE.OctahedronGeometry(0.62, 0);
    const boostStarMat = new THREE.MeshPhysicalMaterial({
      color: '#FF85B8',
      roughness: 0.18,
      metalness: 0.3,
      transmission: 0.4,
      emissive: new THREE.Color('#76FFB2'),
      emissiveIntensity: 0.55,
    });
    const boostStarInst = new THREE.InstancedMesh(
      boostStarGeo,
      boostStarMat,
      MAX_BOOST_STARS
    );
    boostStarInst.frustumCulled = false;
    scene.add(boostStarInst);

    const MAX_HURDLES = 30;
    const hurdleGeo = new THREE.CapsuleGeometry(0.45, 0.75, 12, 18);
    hurdleGeo.rotateZ(Math.PI / 2);
    const hurdleMat = createFeltMaterial('#FDA4AF', fuzzyBumpTex, {
      sheenColorHex: '#FFFFFF',
      emissiveHex: '#FB7185',
      emissiveIntensity: 0.25,
      bumpScale: 0.07,
    });
    const hurdleInst = new THREE.InstancedMesh(
      hurdleGeo,
      hurdleMat,
      MAX_HURDLES
    );
    hurdleInst.frustumCulled = false;
    scene.add(hurdleInst);

    let collectibles: TrackCollectible[] = [];

    let activeCurve: THREE.CatmullRomCurve3 | null = null;
    let landmarkMeshes: THREE.Object3D[] = [];
    let treeCanopyMat: THREE.MeshPhysicalMaterial | null = null;
    let treePillarsMat: THREE.MeshPhysicalMaterial | null = null;
    let hillMat: THREE.MeshPhysicalMaterial | null = null;
    let trackSurfaceMat: THREE.MeshStandardMaterial | null = null;
    let trackCurbMat: THREE.MeshStandardMaterial | null = null;
    let trackRoadTex: THREE.CanvasTexture | null = null;

    const emitGameStats = () => {
      const st = stateRef.current;
      onGameStatsUpdate({
        coins: st.coins,
        score: st.score,
        combo: st.combo,
        maxCombo: st.maxCombo,
        isFever: st.feverTimer > 0,
        feverTimeLeft: st.feverTimer,
        lastEventLabel: st.lastEventLabel,
        currentLane: st.currentLane,
      });
    };

    const generateCourseCollectibles = (curve: THREE.CatmullRomCurve3) => {
      collectibles = [];
      const lanes: LaneIndex[] = [-1, 0, 1];
      let idCounter = 0;

      const totalWaves = 28;
      for (let w = 0; w < totalWaves; w++) {
        const baseT = 0.02 + (w / totalWaves) * 0.94;
        const laneChoice = lanes[(w * 7 + 1) % 3];

        if (w % 4 === 3) {
          const hurdleLane = lanes[w % 3];
          const tHurdle = baseT;
          curve.getPointAt(tHurdle, _curvePos);
          curve.getTangentAt(tHurdle, _tangent).normalize();
          _right.crossVectors(_tangent, _up).normalize();
          const hPos = _curvePos
            .clone()
            .addScaledVector(_right, hurdleLane * LANE_WIDTH);
          hPos.y += 0.58;
          const angle = Math.atan2(_tangent.x, _tangent.z);

          collectibles.push({
            id: idCounter++,
            t: tHurdle,
            lane: hurdleLane,
            type: 'cloud_hurdle',
            elevOffset: 0,
            worldPos: hPos,
            tangentAngle: angle,
            collected: false,
          });

          const jumpCoinPos = hPos.clone();
          jumpCoinPos.y += 1.35;
          collectibles.push({
            id: idCounter++,
            t: tHurdle,
            lane: hurdleLane,
            type: 'coin',
            elevOffset: 1.35,
            worldPos: jumpCoinPos,
            tangentAngle: angle,
            collected: false,
          });

          const starLane = lanes[(w + 1) % 3];
          const tStar = Math.min(0.99, baseT + 0.012);
          curve.getPointAt(tStar, _curvePos);
          curve.getTangentAt(tStar, _tangent).normalize();
          _right.crossVectors(_tangent, _up).normalize();
          const sPos = _curvePos
            .clone()
            .addScaledVector(_right, starLane * LANE_WIDTH);
          sPos.y += 1.15;
          collectibles.push({
            id: idCounter++,
            t: tStar,
            lane: starLane,
            type: 'boost_star',
            elevOffset: 0.2,
            worldPos: sPos,
            tangentAngle: Math.atan2(_tangent.x, _tangent.z),
            collected: false,
          });
        } else {
          const isDiagonal = w % 3 === 2;
          for (let c = 0; c < 5; c++) {
            const tCoin = Math.min(0.99, baseT + c * 0.0055);
            const coinLane: LaneIndex = isDiagonal
              ? lanes[c % 3]
              : laneChoice;
            curve.getPointAt(tCoin, _curvePos);
            curve.getTangentAt(tCoin, _tangent).normalize();
            _right.crossVectors(_tangent, _up).normalize();
            const cPos = _curvePos
              .clone()
              .addScaledVector(_right, coinLane * LANE_WIDTH);
            cPos.y += 1.05;

            collectibles.push({
              id: idCounter++,
              t: tCoin,
              lane: coinLane,
              type: 'coin',
              elevOffset: 0,
              worldPos: cPos,
              tangentAngle: Math.atan2(_tangent.x, _tangent.z),
              collected: false,
            });
          }
        }
      }
    };

    const isFarFromTrack = (
      x: number,
      z: number,
      sampledTrackPts: THREE.Vector3[],
      minClearance: number
    ) => {
      const minSq = minClearance * minClearance;
      for (let i = 0; i < sampledTrackPts.length; i++) {
        const dx = x - sampledTrackPts[i].x;
        const dz = z - sampledTrackPts[i].z;
        if (dx * dx + dz * dz < minSq) return false;
      }
      return true;
    };

    const buildCourseWorld = (courseData: GpxCourseData) => {
      while (courseGroup.children.length > 0) {
        const child = courseGroup.children[0];
        courseGroup.remove(child);
      }
      landmarkMeshes = [];

      const theme = ARTWORK_THEMES[stateRef.current.themeId];
      const curveVectors = courseData.points.map(
        (pt) => new THREE.Vector3(pt.worldX, pt.worldY, pt.worldZ)
      );

      // Centripetal Catmull-Rom spline with high arcLengthDivisions prevents any self-intersecting loops or kinks
      activeCurve = new THREE.CatmullRomCurve3(
        curveVectors,
        false,
        'centripetal',
        0.5
      );
      activeCurve.arcLengthDivisions = 2400;

      // Initialize smoothed tangent to the starting direction
      activeCurve.getTangentAt(0, _smoothedTangent).normalize();

      generateCourseCollectibles(activeCurve);

      const segments = Math.max(280, courseData.points.length * 4);
      const sampledTrackPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        sampledTrackPts.push(activeCurve.getPointAt(i / 160));
      }

      // 1. Wide 3-Lane Raised 3D Running Roadbed (width = 5.2)
      const trackWidth = 5.2;
      const roadHeight = 0.22;
      const trackPositions: number[] = [];
      const trackNormals: number[] = [];
      const trackUvs: number[] = [];
      const trackIndices: number[] = [];

      const leftCurbPoints: THREE.Vector3[] = [];
      const rightCurbPoints: THREE.Vector3[] = [];

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        activeCurve.getPointAt(t, _curvePos);
        activeCurve.getTangentAt(t, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();

        const leftPt = _curvePos
          .clone()
          .addScaledVector(_right, -trackWidth * 0.5);
        const rightPt = _curvePos
          .clone()
          .addScaledVector(_right, trackWidth * 0.5);

        leftCurbPoints.push(
          new THREE.Vector3(leftPt.x, leftPt.y + roadHeight + 0.08, leftPt.z)
        );
        rightCurbPoints.push(
          new THREE.Vector3(rightPt.x, rightPt.y + roadHeight + 0.08, rightPt.z)
        );

        trackPositions.push(leftPt.x, leftPt.y + roadHeight, leftPt.z);
        trackPositions.push(rightPt.x, rightPt.y + roadHeight, rightPt.z);
        trackNormals.push(0, 1, 0, 0, 1, 0);
        trackUvs.push(0, t * 65, 1, t * 65);

        if (i < segments) {
          const base = i * 2;
          trackIndices.push(base, base + 1, base + 2);
          trackIndices.push(base + 1, base + 3, base + 2);
        }
      }

      const trackGeo = new THREE.BufferGeometry();
      trackGeo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(trackPositions, 3)
      );
      trackGeo.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(trackNormals, 3)
      );
      trackGeo.setAttribute('uv', new THREE.Float32BufferAttribute(trackUvs, 2));
      trackGeo.setIndex(trackIndices);

      trackRoadTex = createThreeLaneTrackTexture(
        theme.trackColorHex,
        theme.groundPrimaryHex,
        theme.trackBorderHex,
        maxAnisotropy
      );

      trackSurfaceMat = new THREE.MeshStandardMaterial({
        map: trackRoadTex,
        roughness: 0.55,
        metalness: 0.05,
        emissive: new THREE.Color(theme.trackColorHex),
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
      });

      const trackMesh = new THREE.Mesh(trackGeo, trackSurfaceMat);
      trackMesh.receiveShadow = true;
      courseGroup.add(trackMesh);

      const leftCurbCurve = new THREE.CatmullRomCurve3(
        leftCurbPoints,
        false,
        'centripetal',
        0.5
      );
      const rightCurbCurve = new THREE.CatmullRomCurve3(
        rightCurbPoints,
        false,
        'centripetal',
        0.5
      );
      trackCurbMat = new THREE.MeshStandardMaterial({
        color: theme.trackBorderHex,
        emissive: new THREE.Color(theme.trackBorderHex),
        emissiveIntensity: 0.65,
        roughness: 0.3,
      });

      const leftCurbMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftCurbCurve, segments, 0.16, 8, false),
        trackCurbMat
      );
      const rightCurbMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightCurbCurve, segments, 0.16, 8, false),
        trackCurbMat
      );
      courseGroup.add(leftCurbMesh, rightCurbMesh);

      // Kilometer Arch Gates
      const archMat = new THREE.MeshStandardMaterial({
        color: theme.accentOrbHex,
        emissive: new THREE.Color(theme.accentOrbHex),
        emissiveIntensity: 0.55,
        roughness: 0.35,
      });
      const totalKmFloor = Math.max(1, Math.floor(courseData.totalDistanceKm));
      for (let k = 0; k <= totalKmFloor; k++) {
        const ratio = Math.min(
          0.99,
          k / Math.max(0.5, courseData.totalDistanceKm)
        );
        activeCurve.getPointAt(ratio, _curvePos);
        activeCurve.getTangentAt(ratio, _tangent).normalize();

        const archGroup = new THREE.Group();
        archGroup.position.copy(_curvePos);
        archGroup.position.y += roadHeight;
        const lookAtTarget = _curvePos.clone().add(_tangent);
        archGroup.lookAt(lookAtTarget);

        const archTorus = new THREE.Mesh(
          new THREE.TorusGeometry(trackWidth * 0.54, 0.18, 12, 32, Math.PI),
          archMat
        );
        archGroup.add(archTorus);
        courseGroup.add(archGroup);
      }

      // 2. Rolling Neon-Mint & Pastel Hillsides
      const maxHills = 80;
      const hillGeo = new THREE.SphereGeometry(1, 20, 16);
      hillMat = createFeltMaterial(theme.groundPrimaryHex, fuzzyBumpTex, {
        sheenColorHex: '#FFFFFF',
        emissiveHex: theme.groundSecondaryHex,
        emissiveIntensity: 0.16,
        bumpScale: 0.06,
      });
      const hillsInst = new THREE.InstancedMesh(hillGeo, hillMat, maxHills);
      let validHills = 0;

      for (let i = 0; i < maxHills * 2 && validHills < maxHills; i++) {
        const t = (i * 0.6180339) % 1;
        activeCurve.getPointAt(t, _curvePos);
        activeCurve.getTangentAt(t, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();

        const side = i % 2 === 0 ? -1 : 1;
        const radius = 5 + ((i * 5) % 9);
        const distOut = 16 + radius + ((i * 7) % 22);

        _samplePos.copy(_curvePos).addScaledVector(_right, side * distOut);
        if (
          !isFarFromTrack(
            _samplePos.x,
            _samplePos.z,
            sampledTrackPts,
            radius * 1.35 + 5.5
          )
        ) {
          continue;
        }

        _dummy.position.copy(_samplePos);
        _dummy.position.y = _curvePos.y - radius * 0.55;
        _dummy.scale.set(radius * 1.25, radius * 0.55, radius * 1.25);
        _dummy.rotation.set(0, (i * 0.7) % Math.PI, 0);
        _dummy.updateMatrix();
        hillsInst.setMatrixAt(validHills, _dummy.matrix);

        const tint =
          validHills % 3 === 0
            ? theme.groundPrimaryHex
            : theme.groundSecondaryHex;
        hillsInst.setColorAt(validHills, _color.set(tint));
        validHills++;
      }
      hillsInst.count = validHills;
      hillsInst.receiveShadow = true;
      hillsInst.computeBoundingSphere();
      courseGroup.add(hillsInst);

      // 3. Giant Fluffy Pink Wool Trees & Tall Pastel Pillars
      const maxTrees = 140;
      const treePillarGeo = new THREE.CapsuleGeometry(1.35, 3.2, 12, 20);
      treePillarsMat = createFeltMaterial(
        theme.treeFoliagePrimaryHex,
        fuzzyBumpTex,
        {
          sheenColorHex: '#FFF0F6',
          emissiveHex: theme.treeFoliageSecondaryHex,
          emissiveIntensity: 0.22,
          bumpScale: 0.085,
        }
      );
      const treePillarsInst = new THREE.InstancedMesh(
        treePillarGeo,
        treePillarsMat,
        maxTrees
      );

      const treeDomeGeo = new THREE.SphereGeometry(1.85, 18, 16);
      treeCanopyMat = createFeltMaterial(
        theme.treeFoliageSecondaryHex,
        fuzzyBumpTex,
        {
          sheenColorHex: '#FFFFFF',
          emissiveHex: theme.treeFoliagePrimaryHex,
          emissiveIntensity: 0.2,
          bumpScale: 0.085,
        }
      );
      const treeDomesInst = new THREE.InstancedMesh(
        treeDomeGeo,
        treeCanopyMat,
        maxTrees
      );

      let validTrees = 0;
      for (let i = 0; i < maxTrees * 2 && validTrees < maxTrees; i++) {
        const t = ((i * 1.37) % maxTrees) / maxTrees;
        activeCurve.getPointAt(t, _curvePos);
        activeCurve.getTangentAt(t, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();

        const side = i % 2 === 0 ? -1 : 1;
        const offset = 7.5 + ((i * 11) % 26);
        const hScale = 0.65 + ((i * 13) % 10) * 0.16;

        _samplePos.copy(_curvePos).addScaledVector(_right, side * offset);
        if (!isFarFromTrack(_samplePos.x, _samplePos.z, sampledTrackPts, 6.2)) {
          continue;
        }

        _dummy.position.copy(_samplePos);
        _dummy.position.y = _curvePos.y + hScale * 1.8;
        _dummy.scale.set(
          0.85 + (i % 3) * 0.2,
          hScale,
          0.85 + (i % 3) * 0.2
        );
        _dummy.rotation.set(0, i * 0.4, 0);
        _dummy.updateMatrix();
        treePillarsInst.setMatrixAt(validTrees, _dummy.matrix);

        _dummy.position.y = _curvePos.y + 0.85;
        const bushScale = 0.65 + (i % 4) * 0.25;
        _dummy.scale.set(bushScale * 1.15, bushScale * 0.85, bushScale * 1.15);
        _dummy.updateMatrix();
        treeDomesInst.setMatrixAt(validTrees, _dummy.matrix);

        const colHex =
          validTrees % 2 === 0
            ? theme.treeFoliagePrimaryHex
            : theme.treeFoliageSecondaryHex;
        treePillarsInst.setColorAt(validTrees, _color.set(colHex));
        treeDomesInst.setColorAt(
          validTrees,
          _color.set(
            theme.buildingPalette[validTrees % theme.buildingPalette.length]
          )
        );
        validTrees++;
      }
      treePillarsInst.count = validTrees;
      treeDomesInst.count = validTrees;
      treePillarsInst.castShadow = true;
      treePillarsInst.receiveShadow = true;
      treePillarsInst.computeBoundingSphere();
      treeDomesInst.castShadow = true;
      treeDomesInst.receiveShadow = true;
      treeDomesInst.computeBoundingSphere();
      courseGroup.add(treePillarsInst, treeDomesInst);

      // 4. Cute Pastel Spectator Figures Cheering Beside the Track
      const spectatorCount = 48;
      const specBodyGeo = new THREE.CapsuleGeometry(0.24, 0.55, 8, 12);
      const specHeadGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const specMat = createFeltMaterial('#FFFFFF', fuzzyBumpTex, {
        emissiveHex: '#A5F3FC',
        emissiveIntensity: 0.22,
      });
      const specBodiesInst = new THREE.InstancedMesh(
        specBodyGeo,
        specMat,
        spectatorCount
      );
      const specHeadsInst = new THREE.InstancedMesh(
        specHeadGeo,
        specMat,
        spectatorCount
      );
      const specPalette = [
        '#7DD3FC',
        '#F472B6',
        '#A78BFA',
        '#6EE7B7',
        '#FDE047',
      ];

      let validSpecs = 0;
      for (let i = 0; i < spectatorCount; i++) {
        const clusterIdx = Math.floor(i / 4);
        const withinCluster = i % 4;
        const t = ((clusterIdx + 0.5) / (spectatorCount / 4)) % 1;
        activeCurve.getPointAt(t, _curvePos);
        activeCurve.getTangentAt(t, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();

        const side = clusterIdx % 2 === 0 ? -1 : 1;
        const offset = 4.2 + withinCluster * 0.7;

        _samplePos.copy(_curvePos).addScaledVector(_right, side * offset);
        if (!isFarFromTrack(_samplePos.x, _samplePos.z, sampledTrackPts, 3.6)) {
          continue;
        }

        _dummy.position.copy(_samplePos);
        _dummy.position.y = _curvePos.y + 0.48;
        _dummy.scale.setScalar(0.85 + (i % 3) * 0.12);
        _dummy.updateMatrix();
        specBodiesInst.setMatrixAt(validSpecs, _dummy.matrix);

        _dummy.position.y = _curvePos.y + 1.05;
        _dummy.updateMatrix();
        specHeadsInst.setMatrixAt(validSpecs, _dummy.matrix);

        specBodiesInst.setColorAt(
          validSpecs,
          _color.set(specPalette[validSpecs % specPalette.length])
        );
        specHeadsInst.setColorAt(validSpecs, _color.set('#FFF5F7'));
        validSpecs++;
      }
      specBodiesInst.count = validSpecs;
      specHeadsInst.count = validSpecs;
      specBodiesInst.computeBoundingSphere();
      specHeadsInst.computeBoundingSphere();
      courseGroup.add(specBodiesInst, specHeadsInst);

      // 5. Surrounding Urban Pastel Skyline Blocks
      const cityBlockCount = 60;
      const cityGeo = new THREE.CylinderGeometry(1.6, 1.75, 1, 16);
      const cityMat = createFeltMaterial('#C4B5FD', fuzzyBumpTex, {
        emissiveHex: '#818CF8',
        emissiveIntensity: 0.15,
        roughness: 0.7,
      });
      const cityInst = new THREE.InstancedMesh(cityGeo, cityMat, cityBlockCount);

      let validCity = 0;
      for (let i = 0; i < cityBlockCount * 2 && validCity < cityBlockCount; i++) {
        const t = (i / cityBlockCount) % 1;
        activeCurve.getPointAt(t, _curvePos);
        activeCurve.getTangentAt(t, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();

        const side = i % 2 === 0 ? 1 : -1;
        const dist = 24 + ((i * 9) % 30);
        const bh = 6 + ((i * 7) % 18);

        _samplePos.copy(_curvePos).addScaledVector(_right, side * dist);
        if (!isFarFromTrack(_samplePos.x, _samplePos.z, sampledTrackPts, 10)) {
          continue;
        }

        _dummy.position.copy(_samplePos);
        _dummy.position.y = _curvePos.y + bh * 0.45;
        _dummy.scale.set(1.1 + (i % 3) * 0.4, bh, 1.1 + (i % 3) * 0.4);
        _dummy.updateMatrix();
        cityInst.setMatrixAt(validCity, _dummy.matrix);
        cityInst.setColorAt(
          validCity,
          _color.set(
            theme.buildingPalette[validCity % theme.buildingPalette.length]
          )
        );
        validCity++;
      }
      cityInst.count = validCity;
      cityInst.computeBoundingSphere();
      courseGroup.add(cityInst);

      // 6. Real-World Surrounding Landmarks
      courseData.landmarks.forEach((lm) => {
        if (!activeCurve) return;
        const ratio = Math.max(
          0.02,
          Math.min(0.98, lm.distKm / Math.max(0.1, courseData.totalDistanceKm))
        );
        activeCurve.getPointAt(ratio, _curvePos);
        activeCurve.getTangentAt(ratio, _tangent).normalize();
        _right.crossVectors(_tangent, _up).normalize();

        const sideSign = lm.side === 'left' ? -1 : 1;
        const lmGroup = createLandmarkBuildingGroup(
          lm,
          fuzzyBumpTex,
          maxAnisotropy
        );
        lmGroup.position
          .copy(_curvePos)
          .addScaledVector(_right, sideSign * (10.2 + (lm.offsetMeters % 6)));
        lmGroup.position.y = _curvePos.y;
        lmGroup.lookAt(_curvePos.x, _curvePos.y, _curvePos.z);

        courseGroup.add(lmGroup);
        landmarkMeshes.push(lmGroup);
      });
    };

    const updateThemeColors = (newThemeId: ArtworkThemeId) => {
      const theme = ARTWORK_THEMES[newThemeId];
      stateRef.current.themeId = newThemeId;

      scene.background = new THREE.Color(theme.skyTopHex);
      scene.fog = new THREE.FogExp2(theme.fogHex, 0.004);
      hemiLight.color.set(theme.skyHorizonHex);
      hemiLight.groundColor.set(theme.groundPrimaryHex);

      groundMat.color.set(theme.groundPrimaryHex);
      groundMat.emissive.set(theme.groundSecondaryHex);

      moonMat.color.set(theme.accentOrbHex);
      moonHaloMat.color.set(theme.accentOrbHex);
      beamMat.color.set(theme.accentOrbHex);

      if (hillMat) {
        hillMat.color.set(theme.groundPrimaryHex);
        hillMat.emissive.set(theme.groundSecondaryHex);
      }
      if (treePillarsMat) {
        treePillarsMat.color.set(theme.treeFoliagePrimaryHex);
        treePillarsMat.emissive.set(theme.treeFoliageSecondaryHex);
      }
      if (treeCanopyMat) {
        treeCanopyMat.color.set(theme.treeFoliageSecondaryHex);
        treeCanopyMat.emissive.set(theme.treeFoliagePrimaryHex);
      }
      if (trackSurfaceMat) {
        const newTex = createThreeLaneTrackTexture(
          theme.trackColorHex,
          theme.groundPrimaryHex,
          theme.trackBorderHex,
          maxAnisotropy
        );
        trackRoadTex?.dispose();
        trackRoadTex = newTex;
        trackSurfaceMat.map = newTex;
        trackSurfaceMat.emissive.set(theme.trackColorHex);
        trackSurfaceMat.needsUpdate = true;
      }
      if (trackCurbMat) {
        trackCurbMat.color.set(theme.trackBorderHex);
        trackCurbMat.emissive.set(theme.trackBorderHex);
      }

      runnerRig.updateThemeStyle(theme, newThemeId);
    };

    const moveLaneLeft = () => {
      const st = stateRef.current;
      if (st.currentLane > -1) {
        st.currentLane = (st.currentLane - 1) as LaneIndex;
        soundEngine.playLaneSwitch();
        emitGameStats();
      }
    };

    const moveLaneRight = () => {
      const st = stateRef.current;
      if (st.currentLane < 1) {
        st.currentLane = (st.currentLane + 1) as LaneIndex;
        soundEngine.playLaneSwitch();
        emitGameStats();
      }
    };

    const triggerJump = () => {
      const st = stateRef.current;
      if (st.jumpY <= 0.08) {
        st.jumpVel = 7.4;
        soundEngine.playJump();
        spawnParticles(runnerRig.root.position, 12, 'cloud', 1.6);
      }
    };

    const resetCollectibles = () => {
      collectibles.forEach((c) => {
        c.collected = false;
      });
      stateRef.current.coins = 0;
      stateRef.current.score = 0;
      stateRef.current.combo = 0;
      stateRef.current.feverTimer = 0;
      stateRef.current.lastEventLabel = 'Coin track reset!';
      emitGameStats();
    };

    actionsRef.current = {
      moveLeft: moveLaneLeft,
      moveRight: moveLaneRight,
      jump: triggerJump,
      resetCollectibles,
    };

    rebuildCourseRef.current = (newCourse: GpxCourseData) => {
      stateRef.current.course = newCourse;
      buildCourseWorld(newCourse);
      resetCollectibles();
    };

    applyThemeRef.current = (newThemeId: ArtworkThemeId) => {
      updateThemeColors(newThemeId);
    };

    applyCharacterRef.current = (newCharId: CharacterModelId) => {
      runnerRig.setCharacterModel(newCharId);
      runnerRig.updateThemeStyle(
        ARTWORK_THEMES[stateRef.current.themeId],
        stateRef.current.themeId
      );
    };

    buildCourseWorld(stateRef.current.course);
    renderer.compile(scene, camera);

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        moveLaneLeft();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        moveLaneRight();
      } else if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'KeyW'
      ) {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(landmarkMeshes, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.landmark) {
          obj = obj.parent;
        }
        if (obj?.userData?.landmark) {
          onSelectLandmark(obj.userData.landmark as SurroundingLandmark);
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const onResize = () => {
      if (!container) return;
      camera.aspect =
        container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animFrameId = 0;
    let stepAccumulator = 0;
    let uiSyncTimer = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const st = stateRef.current;
      const activeCourse = st.course;

      if (st.feverTimer > 0) {
        st.feverTimer = Math.max(0, st.feverTimer - dt);
        feverRingMat.opacity = 0.55 + Math.sin(elapsed * 12) * 0.25;
        feverRingMesh.scale.setScalar(1 + Math.sin(elapsed * 8) * 0.08);
      } else {
        feverRingMat.opacity = 0;
      }

      st.sprintBoost = THREE.MathUtils.damp(
        st.sprintBoost,
        st.feverTimer > 0 ? 0.55 : 0,
        3.0,
        dt
      );

      const pointCount = activeCourse.points.length;
      const currentIdx = Math.min(
        pointCount - 1,
        Math.floor(st.progressRatio * pointCount)
      );
      const currentPt =
        activeCourse.points[currentIdx] || activeCourse.points[0];

      const paceSpeedFactor = THREE.MathUtils.clamp(
        5.4 / Math.max(3.0, currentPt.paceMinPerKm),
        0.65,
        1.65
      );

      if (st.isPlaying) {
        const baseRate =
          0.014 *
          st.playbackSpeed *
          paceSpeedFactor *
          (1 + st.sprintBoost * 0.65);
        st.progressRatio += baseRate * dt;
        if (st.progressRatio >= 1) {
          st.progressRatio = 0;
          collectibles.forEach((c) => {
            c.collected = false;
          });
        }
        uiSyncTimer += dt;
        if (uiSyncTimer >= 0.06) {
          uiSyncTimer = 0;
          const nextIdx = Math.min(
            pointCount - 1,
            Math.floor(st.progressRatio * pointCount)
          );
          onProgressTick(st.progressRatio, nextIdx);
        }
      }

      // Auto-Play AI Pilot
      if (st.isPlaying && st.isAutoPlay) {
        let nextTarget: TrackCollectible | null = null;
        let minDeltaT = 0.035;
        for (let i = 0; i < collectibles.length; i++) {
          const item = collectibles[i];
          if (item.collected) continue;
          const dT = item.t - st.progressRatio;
          if (dT > 0.001 && dT < minDeltaT) {
            minDeltaT = dT;
            nextTarget = item;
          }
        }
        if (nextTarget) {
          if (nextTarget.type === 'cloud_hurdle') {
            if (
              nextTarget.lane === st.currentLane &&
              minDeltaT < 0.011 &&
              st.jumpY <= 0.05
            ) {
              triggerJump();
            }
          } else if (nextTarget.lane !== st.currentLane) {
            st.currentLane = nextTarget.lane;
          }
        }
      }

      if (activeCurve) {
        const clampedT = THREE.MathUtils.clamp(st.progressRatio, 0, 0.9995);

        // Exact instantaneous position and tangent at clampedT (never skewed across curves)
        activeCurve.getPointAt(clampedT, _curvePos);
        activeCurve.getTangentAt(clampedT, _tangent).normalize();

        // Smoothly damp forward heading so character rotation never snaps or wobbles
        const headingDamp = 1 - Math.exp(-16 * dt);
        _smoothedTangent.lerp(_tangent, headingDamp).normalize();
        _right.crossVectors(_smoothedTangent, _up).normalize();

        // Smooth 3-lane snap interpolation
        const targetLaneX = st.currentLane * LANE_WIDTH;
        const prevLaneOffset = st.laneOffset;
        st.laneOffset = THREE.MathUtils.damp(
          st.laneOffset,
          targetLaneX,
          13,
          dt
        );

        // Jump physics
        if (st.jumpY > 0 || st.jumpVel !== 0) {
          st.jumpY += st.jumpVel * dt;
          st.jumpVel -= 19.5 * dt;
          if (st.jumpY <= 0) {
            st.jumpY = 0;
            st.jumpVel = 0;
            spawnParticles(runnerRig.root.position, 7, 'cloud', 1.3);
          }
        }

        _runnerTargetPos
          .copy(_curvePos)
          .addScaledVector(_right, st.laneOffset);
        _runnerTargetPos.y += 0.22;
        runnerRig.root.position.copy(_runnerTargetPos);

        const lookTarget = _runnerTargetPos.clone().add(_smoothedTangent);
        lookTarget.y = runnerRig.root.position.y;
        runnerRig.root.lookAt(lookTarget);

        // Natural 2-Joint Forward Running Gait Cycle (Hip + Knee + Opposite Arm)
        const strideFreq =
          (st.isPlaying ? 9.5 : 1.8) *
          paceSpeedFactor *
          (1 + st.sprintBoost * 0.4);
        const swingAngle = st.isPlaying ? 0.68 * paceSpeedFactor : 0.06;
        const phase = elapsed * strideFreq;

        const leftSin = Math.sin(phase);
        const rightSin = Math.sin(phase + Math.PI);

        // Negative X rotation swings thigh forward (+Z); positive knee rotation bends lower leg backward (-Z)
        runnerRig.leftLegPivot.rotation.x = -leftSin * swingAngle;
        runnerRig.rightLegPivot.rotation.x = -rightSin * swingAngle;

        runnerRig.leftKneePivot.rotation.x = st.isPlaying
          ? Math.max(0.08, (Math.cos(phase - 0.4) + 0.5) * 0.62 * paceSpeedFactor)
          : 0.08;
        runnerRig.rightKneePivot.rotation.x = st.isPlaying
          ? Math.max(
              0.08,
              (Math.cos(phase + Math.PI - 0.4) + 0.5) * 0.62 * paceSpeedFactor
            )
          : 0.08;

        // Opposite arm swings forward in sync with opposite leg
        runnerRig.leftArmPivot.rotation.x = -rightSin * swingAngle * 0.85;
        runnerRig.rightArmPivot.rotation.x = -leftSin * swingAngle * 0.85;

        const bounce = st.isPlaying
          ? Math.abs(Math.cos(phase)) * 0.2 * paceSpeedFactor
          : Math.sin(elapsed * 2) * 0.04;
        runnerRig.bodyGroup.position.y = bounce + st.jumpY;
        runnerRig.bodyGroup.rotation.x = st.isPlaying
          ? 0.14 * paceSpeedFactor + st.sprintBoost * 0.12
          : 0;
        runnerRig.bodyGroup.rotation.z = (prevLaneOffset - targetLaneX) * 0.22;

        runnerRig.fishCompanionGroup.position.y =
          1.55 + Math.sin(elapsed * 3.2) * 0.24 + st.jumpY * 0.6;
        runnerRig.fishCompanionGroup.rotation.y =
          Math.sin(elapsed * 4.5) * 0.18;

        if (st.isPlaying) {
          stepAccumulator += dt * paceSpeedFactor * (1 + st.sprintBoost);
          if (stepAccumulator > 0.085) {
            stepAccumulator = 0;
            const kind =
              st.feverTimer > 0
                ? 'coin_burst'
                : st.themeId === 'cloud' && Math.random() < 0.4
                ? 'leaf'
                : 'cloud';
            spawnParticles(runnerRig.root.position, 2, kind, 0.95);
          }
        }

        // Update & Check Collisions for 3-Lane Coins, Boost Stars, and Cloud Hurdles
        let coinIdx = 0;
        let starIdx = 0;
        let hurdleIdx = 0;
        let statsDirty = false;

        for (let i = 0; i < collectibles.length; i++) {
          const item = collectibles[i];
          if (!item.collected) {
            // Spline-window check guarantees runner only interacts with items on the CURRENT path segment
            const splineDiff = Math.abs(item.t - st.progressRatio);
            if (splineDiff < 0.03) {
              const dx = item.worldPos.x - runnerRig.root.position.x;
              const dz = item.worldPos.z - runnerRig.root.position.z;
              const horizDist = Math.hypot(dx, dz);

              // Magnet pull during Fever mode
              if (
                st.feverTimer > 0 &&
                item.type === 'coin' &&
                horizDist < 7.5 &&
                item.t >= st.progressRatio - 0.005
              ) {
                item.worldPos.lerp(runnerRig.root.position, dt * 9);
              }

              const sameLane =
                Math.abs(item.lane * LANE_WIDTH - st.laneOffset) < 0.95;

              if (item.type === 'coin') {
                const pickupRadius = st.feverTimer > 0 ? 2.1 : 1.45;
                const heightMatch =
                  item.elevOffset > 0.5 ? st.jumpY > 0.45 : true;
                if (
                  horizDist < pickupRadius &&
                  (sameLane || st.feverTimer > 0) &&
                  heightMatch
                ) {
                  item.collected = true;
                  st.coins += 1;
                  st.combo += 1;
                  st.maxCombo = Math.max(st.maxCombo, st.combo);
                  const mult = st.feverTimer > 0 ? 2 : 1;
                  const pts = (100 + Math.min(10, st.combo) * 15) * mult;
                  st.score += pts;
                  st.lastEventLabel =
                    item.elevOffset > 0.5
                      ? `Jump Coin! +${pts}`
                      : `Coin +${pts} (${st.combo}x Combo)`;
                  soundEngine.playCoin(st.combo);
                  spawnParticles(item.worldPos, 10, 'coin_burst', 1.2);
                  statsDirty = true;
                }
              } else if (item.type === 'boost_star') {
                if (horizDist < 1.65 && sameLane) {
                  item.collected = true;
                  st.coins += 5;
                  st.combo += 3;
                  st.maxCombo = Math.max(st.maxCombo, st.combo);
                  st.score += 500;
                  st.feverTimer = 4.5;
                  st.lastEventLabel =
                    'Star Fever Boost! +500 (Magnet & 2x Score)';
                  soundEngine.playBoostStar();
                  spawnParticles(item.worldPos, 18, 'coin_burst', 1.8);
                  statsDirty = true;
                }
              } else if (item.type === 'cloud_hurdle') {
                if (horizDist < 1.15 && sameLane) {
                  item.collected = true;
                  if (st.jumpY > 0.55 || st.feverTimer > 0) {
                    st.combo += 2;
                    st.maxCombo = Math.max(st.maxCombo, st.combo);
                    st.score += 250;
                    st.lastEventLabel = 'Nice Cloud Hurdle Jump! +250';
                    soundEngine.playCoin(st.combo + 4);
                    spawnParticles(item.worldPos, 10, 'cloud', 1.5);
                  } else {
                    st.combo = 0;
                    st.lastEventLabel =
                      'Bumped Fluffy Cloud Hurdle! (Press Space to Jump)';
                    soundEngine.playCloudBump();
                    spawnParticles(item.worldPos, 14, 'cloud', 1.8);
                  }
                  statsDirty = true;
                }
              }
            }
          }

          if (item.type === 'coin' && coinIdx < MAX_COINS) {
            if (item.collected) {
              _dummy.position.set(0, -999, 0);
              _dummy.scale.setScalar(0.0001);
            } else {
              _dummy.position.copy(item.worldPos);
              _dummy.position.y += Math.sin(elapsed * 4 + item.id) * 0.14;
              _dummy.rotation.set(0, elapsed * 3.2 + item.id * 0.4, 0);
              _dummy.scale.setScalar(1);
            }
            _dummy.updateMatrix();
            coinOuterInst.setMatrixAt(coinIdx, _dummy.matrix);
            coinCoreInst.setMatrixAt(coinIdx, _dummy.matrix);
            coinIdx++;
          } else if (
            item.type === 'boost_star' &&
            starIdx < MAX_BOOST_STARS
          ) {
            if (item.collected) {
              _dummy.position.set(0, -999, 0);
              _dummy.scale.setScalar(0.0001);
            } else {
              _dummy.position.copy(item.worldPos);
              _dummy.position.y += Math.sin(elapsed * 5 + item.id) * 0.2;
              _dummy.rotation.set(
                elapsed * 2,
                elapsed * 3.8,
                elapsed * 1.5
              );
              const pulse = 1 + Math.sin(elapsed * 6) * 0.18;
              _dummy.scale.setScalar(pulse);
            }
            _dummy.updateMatrix();
            boostStarInst.setMatrixAt(starIdx, _dummy.matrix);
            starIdx++;
          } else if (
            item.type === 'cloud_hurdle' &&
            hurdleIdx < MAX_HURDLES
          ) {
            if (item.collected) {
              _dummy.position.set(0, -999, 0);
              _dummy.scale.setScalar(0.0001);
            } else {
              _dummy.position.copy(item.worldPos);
              _dummy.rotation.set(0, item.tangentAngle, 0);
              _dummy.scale.set(1.1, 0.78, 0.9);
            }
            _dummy.updateMatrix();
            hurdleInst.setMatrixAt(hurdleIdx, _dummy.matrix);
            hurdleIdx++;
          }
        }

        coinOuterInst.count = coinIdx;
        coinCoreInst.count = coinIdx;
        boostStarInst.count = starIdx;
        hurdleInst.count = hurdleIdx;
        coinOuterInst.instanceMatrix.needsUpdate = true;
        coinCoreInst.instanceMatrix.needsUpdate = true;
        boostStarInst.instanceMatrix.needsUpdate = true;
        hurdleInst.instanceMatrix.needsUpdate = true;

        if (statsDirty) {
          emitGameStats();
        }

        keyLight.position.set(
          runnerRig.root.position.x + 25,
          runnerRig.root.position.y + 45,
          runnerRig.root.position.z + 25
        );
        keyLight.target.position.copy(runnerRig.root.position);

        skyDecorGroup.position.set(
          runnerRig.root.position.x * 0.65,
          0,
          runnerRig.root.position.z * 0.65
        );

        const mode = st.cameraMode;
        if (mode === 'chase') {
          _camDesiredPos
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, -8.8)
            .addScaledVector(_right, st.laneOffset * 0.42);
          _camDesiredPos.y = runnerRig.root.position.y + 4.5;

          _camDesiredLook
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, 8.0);
          _camDesiredLook.y = runnerRig.root.position.y + 1.4;
        } else if (mode === 'front') {
          _camDesiredPos
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, 6.8)
            .addScaledVector(_right, 1.2);
          _camDesiredPos.y = runnerRig.root.position.y + 2.8;

          _camDesiredLook.copy(runnerRig.root.position);
          _camDesiredLook.y = runnerRig.root.position.y + 1.5;
        } else if (mode === 'side') {
          _camDesiredPos
            .copy(runnerRig.root.position)
            .addScaledVector(_right, 7.2)
            .addScaledVector(_smoothedTangent, 0.8);
          _camDesiredPos.y = runnerRig.root.position.y + 2.3;

          _camDesiredLook.copy(runnerRig.root.position);
          _camDesiredLook.y = runnerRig.root.position.y + 1.65;
        } else if (mode === 'aerial') {
          _camDesiredPos
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, -18)
            .addScaledVector(_right, 10);
          _camDesiredPos.y = runnerRig.root.position.y + 18;

          _camDesiredLook
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, 8);
          _camDesiredLook.y = runnerRig.root.position.y + 1.0;
        } else {
          _camDesiredPos
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, 0.9);
          _camDesiredPos.y = runnerRig.root.position.y + 2.55 + bounce * 0.4;

          _camDesiredLook
            .copy(runnerRig.root.position)
            .addScaledVector(_smoothedTangent, 16);
          _camDesiredLook.y = runnerRig.root.position.y + 2.0;
        }

        const dampFactor = 1 - Math.exp(-6.5 * dt);
        camera.position.lerp(_camDesiredPos, dampFactor);
        camera.lookAt(_camDesiredLook);

        const targetFov =
          50 + (paceSpeedFactor - 1) * 8 + st.sprintBoost * 6;
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 4, dt);
        camera.updateProjectionMatrix();
      }

      // Update Particles
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        if (p.life > 0) {
          p.life -= dt;
          p.pos.addScaledVector(p.vel, dt);
          p.rot.x += p.rotSpeed.x * dt;
          p.rot.y += p.rotSpeed.y * dt;
          p.rot.z += p.rotSpeed.z * dt;

          const lifeRatio = Math.max(0, p.life / p.maxLife);
          const smoothScale = Math.sin(lifeRatio * Math.PI) * p.scale;

          _dummy.position.copy(p.pos);
          _dummy.rotation.copy(p.rot);

          if (p.kind === 'leaf') {
            _dummy.scale.setScalar(smoothScale);
            _dummy.updateMatrix();
            leafInstMesh.setMatrixAt(i, _dummy.matrix);
            _dummy.scale.setScalar(0.0001);
            _dummy.updateMatrix();
            cloudInstMesh.setMatrixAt(i, _dummy.matrix);
            burstInstMesh.setMatrixAt(i, _dummy.matrix);
          } else if (p.kind === 'coin_burst') {
            _dummy.scale.setScalar(smoothScale);
            _dummy.updateMatrix();
            burstInstMesh.setMatrixAt(i, _dummy.matrix);
            _dummy.scale.setScalar(0.0001);
            _dummy.updateMatrix();
            cloudInstMesh.setMatrixAt(i, _dummy.matrix);
            leafInstMesh.setMatrixAt(i, _dummy.matrix);
          } else {
            _dummy.scale.set(
              smoothScale * 1.25,
              smoothScale * 0.85,
              smoothScale * 1.25
            );
            _dummy.updateMatrix();
            cloudInstMesh.setMatrixAt(i, _dummy.matrix);
            _dummy.scale.setScalar(0.0001);
            _dummy.updateMatrix();
            leafInstMesh.setMatrixAt(i, _dummy.matrix);
            burstInstMesh.setMatrixAt(i, _dummy.matrix);
          }
        } else {
          _dummy.position.set(0, -999, 0);
          _dummy.scale.setScalar(0.0001);
          _dummy.updateMatrix();
          cloudInstMesh.setMatrixAt(i, _dummy.matrix);
          leafInstMesh.setMatrixAt(i, _dummy.matrix);
          burstInstMesh.setMatrixAt(i, _dummy.matrix);
        }
      }
      cloudInstMesh.instanceMatrix.needsUpdate = true;
      leafInstMesh.instanceMatrix.needsUpdate = true;
      burstInstMesh.instanceMatrix.needsUpdate = true;

      landmarkMeshes.forEach((lmGroup) => {
        const lm = lmGroup.userData?.landmark as
          | SurroundingLandmark
          | undefined;
        const isSel = lm && lm.id === st.selectedLandmarkId;
        const targetScale = isSel ? 1.18 + Math.sin(elapsed * 5) * 0.05 : 1.0;
        lmGroup.scale.setScalar(
          THREE.MathUtils.damp(lmGroup.scale.x, targetScale, 6, dt)
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      trackRoadTex?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
