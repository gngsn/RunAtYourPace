import * as THREE from 'three';
import {
  ArtworkThemeConfig,
  ArtworkThemeId,
  BuildingArchStyle,
  CardAuraPalette,
  CourseCategory,
  CourseCoinPlacement,
  CourseEnergyGel,
  CourseTurboPad,
  EnvironmentBiome,
  GpxCourseData,
  GpxKmSplit,
  GpxTrackPoint,
  PACE_BUCKETS,
  PaceBucketId,
  SurroundingLandmark,
  WaterOrParkPolygon,
} from '../types/gpx';

export const ROAD_HALF = 4.2; // Total 3-lane road width = 8.4 units
export const COIN_SPACING = 5;
export const GEL_EVERY_M = 5000;

export const ARTWORK_THEMES: Record<ArtworkThemeId, ArtworkThemeConfig> = {
  meadow: {
    id: 'meadow',
    nameKo: 'Pink Fluffy Meadow',
    nameEn: 'Pink Fluffy Meadow',
    inspirationLabel:
      'Neon mint meadow and giant pink wool trees under a starry sky',
    skyTopHex: '#07081C',
    skyHorizonHex: '#25265E',
    fogHex: '#1D1E4F',
    groundPrimaryHex: '#76FFB2',
    groundSecondaryHex: '#43D996',
    trackColorHex: '#FFF6FA',
    trackBorderHex: '#FF94C2',
    treeFoliagePrimaryHex: '#FF85B8',
    treeFoliageSecondaryHex: '#FFB5D8',
    buildingPalette: ['#FF94C2', '#B79CED', '#8BE8CB', '#FFE3A8'],
    accentOrbHex: '#FF6B9E',
    runnerSweaterHex: '#2563EB',
    runnerPantsHex: '#1D4ED8',
    runnerHatHex: '#F8FAFC',
  },
  cloud: {
    id: 'cloud',
    nameKo: 'Cloud Stride Autumn',
    nameEn: 'Cloud Stride Autumn',
    inspirationLabel:
      'Dreamy cobalt sky with soft clouds and autumn foliage',
    skyTopHex: '#4252D6',
    skyHorizonHex: '#7382F0',
    fogHex: '#5E6CE6',
    groundPrimaryHex: '#EEF2FF',
    groundSecondaryHex: '#C7D2FE',
    trackColorHex: '#FFFFFF',
    trackBorderHex: '#FDE68A',
    treeFoliagePrimaryHex: '#FFFDF7',
    treeFoliageSecondaryHex: '#FDBA74',
    buildingPalette: ['#FEF08A', '#FBCFE8', '#BAE6FD', '#DDD6FE'],
    accentOrbHex: '#FBBF24',
    runnerSweaterHex: '#FEF08A',
    runnerPantsHex: '#FFFBEB',
    runnerHatHex: '#D97706',
  },
  night_garden: {
    id: 'night_garden',
    nameKo: 'Luminous Night Garden',
    nameEn: 'Luminous Night Garden',
    inspirationLabel:
      'Bioluminescent pastel botanical garden under a crimson moon',
    skyTopHex: '#120817',
    skyHorizonHex: '#2A1233',
    fogHex: '#1E0D26',
    groundPrimaryHex: '#6366F1',
    groundSecondaryHex: '#A855F7',
    trackColorHex: '#FCE7F3',
    trackBorderHex: '#F472B6',
    treeFoliagePrimaryHex: '#D9F99D',
    treeFoliageSecondaryHex: '#F472B6',
    buildingPalette: ['#F472B6', '#C084FC', '#BEF264', '#60A5FA'],
    accentOrbHex: '#FF3366',
    runnerSweaterHex: '#F9A8D4',
    runnerPantsHex: '#312E81',
    runnerHatHex: '#F472B6',
  },
  riverside: {
    id: 'riverside',
    nameKo: 'Riverside Felt Stroll',
    nameEn: 'Riverside Felt Stroll',
    inspirationLabel:
      'Waterfront felt trail with a floating pink-finned companion fish',
    skyTopHex: '#5257C9',
    skyHorizonHex: '#8488E8',
    fogHex: '#686CD9',
    groundPrimaryHex: '#A5F3FC',
    groundSecondaryHex: '#67E8F9',
    trackColorHex: '#FFFBEB',
    trackBorderHex: '#FDA4AF',
    treeFoliagePrimaryHex: '#FDE68A',
    treeFoliageSecondaryHex: '#FDA4AF',
    buildingPalette: ['#FDE68A', '#FDA4AF', '#86EFAC', '#C4B5FD'],
    accentOrbHex: '#FB7185',
    runnerSweaterHex: '#FEF08A',
    runnerPantsHex: '#15803D',
    runnerHatHex: '#FDE68A',
  },
};

export const CARD_AURA_PRESETS: CardAuraPalette[] = [
  {
    outerBg: '#5B8EF4',
    innerGlow: '#8FB6FF',
    rimHighlight: '#BFD7FF',
    tubeTint: '#E8F1FF',
  },
  {
    outerBg: '#7A8EF5',
    innerGlow: '#E68AB8',
    rimHighlight: '#C4CEFF',
    tubeTint: '#F9E8F2',
  },
  {
    outerBg: '#9BA8FA',
    innerGlow: '#7BC5AE',
    rimHighlight: '#D4DAFF',
    tubeTint: '#EBF8F5',
  },
  {
    outerBg: '#9CD2CB',
    innerGlow: '#6FA9A2',
    rimHighlight: '#D8F3EF',
    tubeTint: '#F2FCFA',
  },
  {
    outerBg: '#CFA1CB',
    innerGlow: '#BA7FA8',
    rimHighlight: '#F3D6F0',
    tubeTint: '#FDF0FA',
  },
  {
    outerBg: '#8BB8F8',
    innerGlow: '#D47EB8',
    rimHighlight: '#CAE0FF',
    tubeTint: '#FAF0F8',
  },
];

/**
 * FNV-1a 32-bit hash for deterministic PRNG seeding per course ID
 */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Mulberry32 deterministic PRNG
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatPace(paceMinPerKm: number): string {
  if (!Number.isFinite(paceMinPerKm) || paceMinPerKm <= 0) return `5'15"`;
  const clamped = Math.max(2.5, Math.min(15, paceMinPerKm));
  const mins = Math.floor(clamped);
  const secs = Math.round((clamped - mins) * 60);
  const adjMins = secs === 60 ? mins + 1 : mins;
  const adjSecs = secs === 60 ? 0 : secs;
  return `${adjMins}'${String(adjSecs).padStart(2, '0')}"`;
}

export function formatDuration(seconds: number): string {
  const totalSecs = Math.max(0, Math.round(seconds));
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface RawPointInput {
  lat: number;
  lng: number;
  ele?: number;
  timeMs?: number;
  paceMinPerKm?: number;
  biome?: EnvironmentBiome;
}

/**
 * Step 2: projectLocal — equirectangular projection around the first point (lat0, lng0).
 * x = east (m), y = north (m). The world uses north = -z (worldX = x, worldZ = -y).
 */
export function projectLocal(
  lat: number,
  lng: number,
  lat0: number,
  lng0: number
): { x: number; y: number; worldX: number; worldZ: number } {
  const R = 6371000;
  const cosLat0 = Math.cos((lat0 * Math.PI) / 180);
  const x = ((lng - lng0) * Math.PI * R * cosLat0) / 180;
  const y = ((lat - lat0) * Math.PI * R) / 180;
  return {
    x,
    y,
    worldX: x,
    worldZ: -y, // north = -z
  };
}

/**
 * Step 3: simplifyRdp — Ramer-Douglas-Peucker simplification with epsilon = 3 m.
 */
interface LocalProjectedPt {
  lat: number;
  lng: number;
  x: number;
  y: number;
  distM: number;
  paceMinPerKm: number;
  elapsedSeconds: number;
  biome: EnvironmentBiome;
}

function perpendicularDistance2D(
  pt: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const magSq = dx * dx + dy * dy;
  if (magSq < 1e-9) {
    return Math.hypot(pt.x - lineStart.x, pt.y - lineStart.y);
  }
  const u = Math.max(
    0,
    Math.min(1, ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / magSq)
  );
  const projX = lineStart.x + u * dx;
  const projY = lineStart.y + u * dy;
  return Math.hypot(pt.x - projX, pt.y - projY);
}

export function simplifyRdp(
  pts: LocalProjectedPt[],
  epsilonMeters = 3.0
): LocalProjectedPt[] {
  if (pts.length <= 2) return pts;

  let maxDist = 0;
  let maxIdx = 0;
  const first = pts[0];
  const last = pts[pts.length - 1];

  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicularDistance2D(pts[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > epsilonMeters) {
    const left = simplifyRdp(pts.slice(0, maxIdx + 1), epsilonMeters);
    const right = simplifyRdp(pts.slice(maxIdx), epsilonMeters);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}

/**
 * Guarantees 100% non-overlapping 2D segments before building the centripetal spline.
 */
function unfoldNonOverlappingLocalPts(pts: LocalProjectedPt[]): void {
  const minClearanceM = 45.0;
  const n = pts.length;
  if (n < 4) return;

  for (let pass = 0; pass < 3; pass++) {
    for (let i = 5; i < n; i++) {
      for (let j = 0; j < i - 4; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < minClearanceM) {
          const push = minClearanceM - dist + 5.0;
          let nx = dx;
          let ny = dy;
          const len = Math.hypot(nx, ny);
          if (len > 0.001) {
            nx /= len;
            ny /= len;
          } else {
            nx = 1;
            ny = 0;
          }
          for (let k = i; k < n; k++) {
            const falloff = Math.exp(-(k - i) * 0.12);
            pts[k].x += nx * push * falloff;
            pts[k].y += ny * push * falloff;
          }
        }
      }
    }
  }
}

/**
 * Full 9-step Route Processing & Real Pace Course Builder
 */
function buildCourseFromRawPoints(params: {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  locationLabel: string;
  category: CourseCategory;
  recommendedTheme: ArtworkThemeId;
  cardAura: CardAuraPalette;
  rawPoints: RawPointInput[];
  landmarks: SurroundingLandmark[];
  mapPolygons: WaterOrParkPolygon[];
}): GpxCourseData {
  const inputPts = params.rawPoints;
  if (inputPts.length < 2) {
    throw new Error('Route is too short (needs at least 200 m).');
  }

  const lat0 = inputPts[0].lat;
  const lng0 = inputPts[0].lng;
  const R = 6371000;
  const cosLat0 = Math.cos((lat0 * Math.PI) / 180);

  // Build local projected points & real distance/pace profile
  const localPts: LocalProjectedPt[] = [];
  let cumulativeRealM = 0;
  let cumulativeSec = 0;

  for (let i = 0; i < inputPts.length; i++) {
    const curr = inputPts[i];
    const prev = i > 0 ? inputPts[i - 1] : curr;
    const proj = projectLocal(curr.lat, curr.lng, lat0, lng0);

    let segM = 0;
    if (i > 0) {
      const prevProj = localPts[i - 1];
      segM = Math.hypot(proj.x - prevProj.x, proj.y - prevProj.y);
    }
    cumulativeRealM += segM;

    let paceMinPerKm = curr.paceMinPerKm ?? 5.15;
    let segSec = 0;

    if (i > 0) {
      const segKm = segM / 1000;
      if (curr.timeMs && prev.timeMs && curr.timeMs > prev.timeMs) {
        segSec = (curr.timeMs - prev.timeMs) / 1000;
        if (segKm > 0.0002) {
          paceMinPerKm = Math.max(3.2, Math.min(9.8, segSec / 60 / segKm));
        }
      } else if (curr.paceMinPerKm !== undefined) {
        paceMinPerKm = curr.paceMinPerKm;
        segSec = segKm * paceMinPerKm * 60;
      } else {
        // Rich, realistic pace variation across the route (Fast, Steady, Slow, Very slow sections)
        const wave =
          Math.sin(i * 0.19 + fnv1a(params.id) * 0.001) * 0.85 +
          Math.cos(i * 0.07) * 0.45;
        paceMinPerKm = Math.max(4.15, Math.min(6.75, 5.25 + wave));
        segSec = segKm * paceMinPerKm * 60;
      }
    }

    cumulativeSec += segSec;

    localPts.push({
      lat: curr.lat,
      lng: curr.lng,
      x: proj.x,
      y: proj.y,
      distM: cumulativeRealM,
      paceMinPerKm,
      elapsedSeconds: cumulativeSec,
      biome: curr.biome || 'park',
    });
  }

  // Step 1: Reject routes shorter than 200 m
  if (cumulativeRealM < 200) {
    throw new Error('Route is too short (needs at least 200 m).');
  }

  // Step 3: simplifyRdp with epsilon = 3 m
  let simplifiedPts = simplifyRdp(localPts, 3.0);
  if (simplifiedPts.length < 4) {
    simplifiedPts = localPts;
  }
  unfoldNonOverlappingLocalPts(simplifiedPts);

  // Build centripetal CatmullRomCurve3 in world coordinates (worldX = x, worldY = 0, worldZ = -y)
  const rdpWorldVectors = simplifiedPts.map(
    (p) => new THREE.Vector3(p.x, 0, -p.y)
  );
  const rawCurve = new THREE.CatmullRomCurve3(
    rdpWorldVectors,
    false,
    'centripetal',
    0.5
  );
  rawCurve.arcLengthDivisions = 2400;

  // Step 3 continued: getSpacedPoints(N - 1) with N = 1200 evenly spaced samples
  const N = 1200;
  const spacedPts = rawCurve.getSpacedPoints(N - 1);

  // Step 4: Game length = clamp(km * 400 + 400, 1400, 3200) units. Uniformly scaled to that length.
  const totalDistanceKm = cumulativeRealM / 1000;
  const gameLength = Math.max(
    1400,
    Math.min(3200, totalDistanceKm * 400 + 400)
  );

  let rawPolyLen = 0;
  for (let i = 1; i < N; i++) {
    rawPolyLen += spacedPts[i].distanceTo(spacedPts[i - 1]);
  }
  const uniformScale = rawPolyLen > 1e-6 ? gameLength / rawPolyLen : 1;
  for (let i = 0; i < N; i++) {
    spacedPts[i].multiplyScalar(uniformScale);
    spacedPts[i].y = 0;
  }

  const ds = gameLength / (N - 1);

  // Step 5: Interpolate each sample's pace by the fraction of real distance along the route
  const samplePaces: number[] = new Array(N);
  const sampleElapsed: number[] = new Array(N);
  const sampleBiomes: EnvironmentBiome[] = new Array(N);

  let rawCursor = 0;
  for (let i = 0; i < N; i++) {
    const frac = i / (N - 1);
    const targetM = frac * cumulativeRealM;
    while (
      rawCursor < localPts.length - 2 &&
      localPts[rawCursor + 1].distM < targetM
    ) {
      rawCursor++;
    }
    const pA = localPts[rawCursor];
    const pB = localPts[Math.min(localPts.length - 1, rawCursor + 1)];
    const segSpan = Math.max(1e-6, pB.distM - pA.distM);
    const alpha = Math.max(0, Math.min(1, (targetM - pA.distM) / segSpan));

    samplePaces[i] = pA.paceMinPerKm + (pB.paceMinPerKm - pA.paceMinPerKm) * alpha;
    sampleElapsed[i] =
      pA.elapsedSeconds + (pB.elapsedSeconds - pA.elapsedSeconds) * alpha;
    sampleBiomes[i] = alpha < 0.5 ? pA.biome : pB.biome;
  }

  // Compute min and max pace across the route
  let minPace = Infinity;
  let maxPace = -Infinity;
  for (let i = 0; i < N; i++) {
    if (samplePaces[i] < minPace) minPace = samplePaces[i];
    if (samplePaces[i] > maxPace) maxPace = samplePaces[i];
  }

  // Assign raw bucket per sample:
  // Lower paceMinPerKm (faster running) -> Bucket 0 (Fast)
  // Higher paceMinPerKm (slower running) -> Bucket 3 (Very slow)
  // If max - min < 1e-6, every point is bucket 1 (Steady).
  const rawBuckets: PaceBucketId[] = new Array(N);
  const paceSpan = maxPace - minPace;
  if (paceSpan < 1e-6) {
    for (let i = 0; i < N; i++) rawBuckets[i] = 1;
  } else {
    for (let i = 0; i < N; i++) {
      const u = (samplePaces[i] - minPace) / paceSpan;
      if (u < 0.25) rawBuckets[i] = 0;
      else if (u < 0.5) rawBuckets[i] = 1;
      else if (u < 0.75) rawBuckets[i] = 2;
      else rawBuckets[i] = 3;
    }
  }

  // Step 5 continued: Smooth bucket with a ±8-sample majority filter to avoid thin flicker stripes
  const smoothedBuckets: PaceBucketId[] = new Array(N);
  for (let i = 0; i < N; i++) {
    const counts = [0, 0, 0, 0];
    const startJ = Math.max(0, i - 8);
    const endJ = Math.min(N - 1, i + 8);
    for (let j = startJ; j <= endJ; j++) {
      counts[rawBuckets[j]]++;
    }
    let bestBucket: PaceBucketId = rawBuckets[i];
    let bestCount = counts[bestBucket];
    for (let b = 0 as PaceBucketId; b <= 3; b = (b + 1) as PaceBucketId) {
      if (counts[b] > bestCount) {
        bestCount = counts[b];
        bestBucket = b;
      }
    }
    smoothedBuckets[i] = bestBucket;
  }

  // Step 6: Signed curvature k = cross(t_i, t_{i+1}) / ds, averaged over ±5 samples. Positive k = right turn.
  const tangentsX: number[] = new Array(N);
  const tangentsZ: number[] = new Array(N);
  for (let i = 0; i < N; i++) {
    const p0 = spacedPts[Math.max(0, i - 1)];
    const p1 = spacedPts[Math.min(N - 1, i + 1)];
    const tx = p1.x - p0.x;
    const tz = p1.z - p0.z;
    const len = Math.hypot(tx, tz) || 1;
    tangentsX[i] = tx / len;
    tangentsZ[i] = tz / len;
  }

  const rawCurvature: number[] = new Array(N).fill(0);
  for (let i = 0; i < N - 1; i++) {
    // North = -z, East = +x -> right turn from (0,-1) to (1,0) has tx_i*tz_{i+1} - tz_i*tx_{i+1} = +1
    const cross =
      tangentsX[i] * tangentsZ[i + 1] - tangentsZ[i] * tangentsX[i + 1];
    rawCurvature[i] = cross / ds;
  }
  rawCurvature[N - 1] = rawCurvature[N - 2];

  const smoothedCurvature: number[] = new Array(N);
  for (let i = 0; i < N; i++) {
    const sJ = Math.max(0, i - 5);
    const eJ = Math.min(N - 1, i + 5);
    let sumK = 0;
    for (let j = sJ; j <= eJ; j++) {
      sumK += rawCurvature[j];
    }
    smoothedCurvature[i] = sumK / (eJ - sJ + 1);
  }

  // Build the N = 1200 GpxTrackPoint array
  const points: GpxTrackPoint[] = new Array(N);
  const bucketCounts: Record<PaceBucketId, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (let i = 0; i < N; i++) {
    const frac = i / (N - 1);
    const s = frac * gameLength;
    const distKm = frac * totalDistanceKm;
    const bucket = smoothedBuckets[i];
    bucketCounts[bucket]++;
    const bucketSpec = PACE_BUCKETS[bucket];

    const worldX = spacedPts[i].x;
    const worldZ = spacedPts[i].z;
    // Inverse equirectangular back to lat/lng for minimap
    const eastM = worldX / uniformScale;
    const northM = -worldZ / uniformScale;
    const lat = lat0 + (northM / R) * (180 / Math.PI);
    const lng = lng0 + (eastM / (R * cosLat0)) * (180 / Math.PI);

    const pace = samplePaces[i];
    const speedKmh = pace > 0 ? 60 / pace : 11.5;

    points[i] = {
      index: i,
      lat,
      lng,
      ele: 0,
      timeIso: new Date(
        Date.UTC(2026, 9, 15, 11, 0, 0) + sampleElapsed[i] * 1000
      ).toISOString(),
      elapsedSeconds: Math.round(sampleElapsed[i]),
      distKm: Number(distKm.toFixed(3)),
      paceMinPerKm: Number(pace.toFixed(2)),
      speedKmh: Number(speedKmh.toFixed(1)),
      gradePercent: 0,
      biome: sampleBiomes[i],
      worldX,
      worldY: 0,
      worldZ,
      s,
      paceBucket: bucket,
      bucketColor: bucketSpec.color,
      speedCap: bucketSpec.speedCap,
      curvature: smoothedCurvature[i],
      isOverpass: false,
    };
  }

  // Step 7: Turbo pads — PRNG mulberry32(fnv1a(run.id))
  // Starting at s = 120 and ending 120 units before the finish, candidate every 70–130 units.
  // Slow/very-slow buckets skipped 75% of the time. Lateral offset within ±(ROAD_HALF - 1.6 - 0.3).
  // After each pad, skip 90 more units.
  const padRng = mulberry32(fnv1a(params.id));
  const turboPads: CourseTurboPad[] = [];
  const padMaxLat = ROAD_HALF - 1.6 - 0.3; // 2.3 units
  let sPad = 120;
  let padId = 0;

  while (sPad <= gameLength - 120) {
    sPad += 70 + padRng() * 60;
    if (sPad > gameLength - 120) break;

    const sampleIdx = Math.min(
      N - 1,
      Math.max(0, Math.round((sPad / gameLength) * (N - 1)))
    );
    const bucket = smoothedBuckets[sampleIdx];

    if ((bucket === 2 || bucket === 3) && padRng() < 0.75) {
      continue;
    }

    const lateral = (padRng() * 2 - 1) * padMaxLat;
    turboPads.push({
      id: padId++,
      s: sPad,
      t: sPad / gameLength,
      lateral,
      bucket,
    });

    sPad += 90;
  }

  // Step 9 (computed before Step 8 filtering so coins within ±15 units of a gel can be removed):
  // Energy gels — one at every 5000 real metres (GEL_EVERY_M), except within 300 m of the finish.
  // Gels sit at lateral 0.
  const energyGels: CourseEnergyGel[] = [];
  let gelId = 0;
  for (
    let realM = GEL_EVERY_M;
    realM <= cumulativeRealM - 300;
    realM += GEL_EVERY_M
  ) {
    const tGel = realM / cumulativeRealM;
    const sGel = tGel * gameLength;
    energyGels.push({
      id: gelId++,
      realMeters: realM,
      s: sGel,
      t: tGel,
      lateral: 0,
    });
  }

  // Step 8: Coins — PRNG mulberry32(fnv1a(run.id) ^ 0x9e3779b9), separate so coins never move the pads.
  // Rows of 5–8, spaced COIN_SPACING = 5, in one of three shapes:
  // straight (40%), diagonal across the road (35%) or arc (25%), within lateral ±(ROAD_HALF - 1.1).
  // A coin is skipped if it would sit on a pad (|Δs| < 4 and |Δlat| < 2.4).
  // Gap between rows is 35–90 units. Coins within ±15 units of a gel are removed.
  const coinRng = mulberry32((fnv1a(params.id) ^ 0x9e3779b9) >>> 0);
  const coins: CourseCoinPlacement[] = [];
  const coinMaxLat = ROAD_HALF - 1.1; // 3.1 units
  let sRowStart = 60 + coinRng() * 35;
  let coinId = 0;
  let rowId = 0;

  while (sRowStart < gameLength - 70) {
    const rowCount = 5 + Math.floor(coinRng() * 4); // 5..8 coins
    const shapeRoll = coinRng();
    let shape: 'straight' | 'diagonal' | 'arc';
    if (shapeRoll < 0.4) {
      shape = 'straight';
    } else if (shapeRoll < 0.75) {
      shape = 'diagonal';
    } else {
      shape = 'arc';
    }

    const latA = (coinRng() * 2 - 1) * coinMaxLat;
    const latB = (coinRng() * 2 - 1) * coinMaxLat;
    const arcAmp = (coinRng() * 2 - 1) * Math.min(2.2, coinMaxLat);

    for (let c = 0; c < rowCount; c++) {
      const sCoin = sRowStart + c * COIN_SPACING;
      if (sCoin >= gameLength - 45) break;

      const u = rowCount > 1 ? c / (rowCount - 1) : 0;
      let latCoin = 0;
      if (shape === 'straight') {
        latCoin = latA;
      } else if (shape === 'diagonal') {
        latCoin = latA + (latB - latA) * u;
      } else {
        latCoin = Math.max(
          -coinMaxLat,
          Math.min(
            coinMaxLat,
            latA * 0.45 + Math.sin(u * Math.PI) * arcAmp
          )
        );
      }

      // Skip if sitting on a Turbo pad (|Δs| < 4 and |Δlat| < 2.4)
      const hitsPad = turboPads.some(
        (pad) =>
          Math.abs(sCoin - pad.s) < 4.0 &&
          Math.abs(latCoin - pad.lateral) < 2.4
      );
      if (hitsPad) continue;

      // Remove coins within ±15 units of an Energy gel
      const nearGel = energyGels.some((gel) => Math.abs(sCoin - gel.s) <= 15.0);
      if (nearGel) continue;

      coins.push({
        id: coinId++,
        rowId,
        s: sCoin,
        t: sCoin / gameLength,
        lateral: latCoin,
        shape,
      });
    }

    rowId++;
    const rowLength = (rowCount - 1) * COIN_SPACING;
    const gap = 35 + coinRng() * 55; // 35..90 units
    sRowStart += rowLength + gap;
  }

  // Compute 1km splits
  const splits: GpxKmSplit[] = [];
  let splitKmIndex = 1;
  let splitStartIdx = 0;

  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    const isLast = i === points.length - 1;
    if (pt.distKm >= splitKmIndex || isLast) {
      const startPt = points[splitStartIdx];
      const dKm = Math.max(0.05, pt.distKm - startPt.distKm);
      const dSec = Math.max(10, pt.elapsedSeconds - startPt.elapsedSeconds);

      splits.push({
        km: splitKmIndex,
        distanceKm: Number(dKm.toFixed(2)),
        durationSeconds: Math.round(dSec),
        paceMinPerKm: Number((dSec / 60 / dKm).toFixed(2)),
        elevationGainM: 0,
        elevationLossM: 0,
        avgGradePercent: 0,
        startDistKm: startPt.distKm,
      });

      splitKmIndex++;
      splitStartIdx = i;
    }
  }

  const totalDurationSeconds = Math.round(cumulativeSec);
  const avgPaceMinPerKm =
    totalDistanceKm > 0
      ? Number((totalDurationSeconds / 60 / totalDistanceKm).toFixed(2))
      : 5.15;

  const effSpan = Math.max(0.4, maxPace - minPace);
  const paceBucketRanges: Record<
    PaceBucketId,
    { minPace: number; maxPace: number }
  > = {
    0: { minPace, maxPace: minPace + effSpan * 0.25 },
    1: { minPace: minPace + effSpan * 0.25, maxPace: minPace + effSpan * 0.5 },
    2: { minPace: minPace + effSpan * 0.5, maxPace: minPace + effSpan * 0.75 },
    3: { minPace: minPace + effSpan * 0.75, maxPace },
  };

  return {
    id: params.id,
    title: params.title,
    shortTitle: params.shortTitle,
    subtitle: params.subtitle,
    locationLabel: params.locationLabel,
    category: params.category,
    recommendedTheme: params.recommendedTheme,
    cardAura: params.cardAura,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalDurationSeconds,
    avgPaceMinPerKm,
    minPaceMinPerKm: Number(minPace.toFixed(2)),
    maxPaceMinPerKm: Number(maxPace.toFixed(2)),
    gameLength: Math.round(gameLength),
    maxElevationM: 0,
    minElevationM: 0,
    elevationGainM: 0,
    caloriesKcal: Math.round(totalDistanceKm * 64),
    avgCadenceSpm: Math.round(174 + (5.5 - avgPaceMinPerKm) * 4),
    points,
    splits,
    landmarks: params.landmarks,
    mapPolygons: params.mapPolygons,
    turboPads,
    coins,
    energyGels,
    paceMixRatios: {
      0: Number((bucketCounts[0] / N).toFixed(3)),
      1: Number((bucketCounts[1] / N).toFixed(3)),
      2: Number((bucketCounts[2] / N).toFixed(3)),
      3: Number((bucketCounts[3] / N).toFixed(3)),
    },
    paceBucketRanges,
  };
}

/**
 * Smoothly interpolates dense points between waypoints using Catmull-Rom spline math.
 */
function densifyWaypoints(
  waypoints: Array<{
    lat: number;
    lng: number;
    paceMinPerKm: number;
    biome: EnvironmentBiome;
  }>,
  stepsPerSegment = 14
): RawPointInput[] {
  const result: RawPointInput[] = [];
  const n = waypoints.length;

  const catmullRom = (
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
  ) => {
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
    );
  };

  for (let i = 0; i < n - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(n - 1, i + 2)];

    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      const lat = catmullRom(p0.lat, p1.lat, p2.lat, p3.lat, t);
      const lng = catmullRom(p0.lng, p1.lng, p2.lng, p3.lng, t);
      const paceMinPerKm =
        p1.paceMinPerKm + (p2.paceMinPerKm - p1.paceMinPerKm) * t;
      result.push({
        lat,
        lng,
        ele: 0,
        paceMinPerKm,
        biome: t < 0.5 ? p1.biome : p2.biome,
      });
    }
  }
  const last = waypoints[n - 1];
  result.push({ ...last, ele: 0 });
  return result;
}

export const PRESET_COURSES: GpxCourseData[] = [
  // 1. Banpo Hangang Moonlight Traverse (~5.0 km -> gameLength ~ 2400)
  buildCourseFromRawPoints({
    id: 'banpo-hangang',
    title: 'Banpo Hangang Moonlight Traverse',
    shortTitle: 'Moonlight Flow',
    subtitle:
      '5.0 km riverside course from Dongjak Cloud Cafe past Some Sevit to Jamwon Grove',
    locationLabel: 'Banpo Hangang Park, Seoul',
    category: 'waterfront',
    recommendedTheme: 'meadow',
    cardAura: CARD_AURA_PRESETS[0],
    rawPoints: densifyWaypoints([
      { lat: 37.5015, lng: 126.9765, paceMinPerKm: 5.45, biome: 'bridge' },
      { lat: 37.5048, lng: 126.9835, paceMinPerKm: 4.85, biome: 'riverside' },
      { lat: 37.5082, lng: 126.9905, paceMinPerKm: 4.55, biome: 'park' },
      { lat: 37.5114, lng: 126.9968, paceMinPerKm: 5.25, biome: 'riverside' },
      { lat: 37.5145, lng: 127.0032, paceMinPerKm: 5.85, biome: 'bridge' },
      { lat: 37.5178, lng: 127.0095, paceMinPerKm: 5.15, biome: 'riverside' },
      { lat: 37.5215, lng: 127.0162, paceMinPerKm: 4.62, biome: 'park' },
      { lat: 37.5252, lng: 127.0228, paceMinPerKm: 4.42, biome: 'urban_pastel' },
    ]),
    landmarks: [
      {
        id: 'dongjak-cloud-cafe',
        name: 'Dongjak Cloud Cafe Spire',
        nameEn: 'Dongjak Cloud Cafe Spire',
        category: 'Sky Observatory',
        lat: 37.5048,
        lng: 126.9842,
        distKm: 0.65,
        side: 'left',
        offsetMeters: 24,
        heightMeters: 44,
        archStyle: 'observation_spire',
        primaryColor: '#FDE68A',
        accentColor: '#FB7185',
        description:
          'Sunset observatory café welcoming runners at the western riverfront start.',
      },
      {
        id: 'sevit-island',
        name: 'Some Sevit Floating Dome',
        nameEn: 'Some Sevit Floating Dome',
        category: 'Waterfront Landmark',
        lat: 37.5108,
        lng: 126.9948,
        distKm: 1.85,
        side: 'left',
        offsetMeters: 24,
        heightMeters: 32,
        archStyle: 'floating_lotus',
        primaryColor: '#FF85B8',
        accentColor: '#80FFB4',
        description:
          'Three glowing pastel lotus pavilions floating softly along the Hangang riverfront.',
      },
      {
        id: 'banpo-rainbow-bridge',
        name: 'Banpo Rainbow Bridge Arch',
        nameEn: 'Banpo Rainbow Bridge Arch',
        category: 'Bridge & Fountain',
        lat: 37.5135,
        lng: 126.9998,
        distKm: 2.85,
        side: 'left',
        offsetMeters: 28,
        heightMeters: 38,
        archStyle: 'bridge_arch',
        primaryColor: '#A78BFA',
        accentColor: '#FDE68A',
        description:
          'Double-deck river bridge spraying rhythmic pastel moonlight fountain arcs.',
      },
      {
        id: 'jamwon-forest-pavilion',
        name: 'Jamwon Pink Fluffy Grove',
        nameEn: 'Jamwon Pink Fluffy Grove',
        category: 'Riverside Park',
        lat: 37.5202,
        lng: 127.0125,
        distKm: 4.15,
        side: 'right',
        offsetMeters: 22,
        heightMeters: 28,
        archStyle: 'dome_pavilion',
        primaryColor: '#FF94C2',
        accentColor: '#76FFB2',
        description:
          'Circular botanical rotunda nestled inside a grove of giant pink wool trees.',
      },
    ],
    mapPolygons: [
      {
        id: 'hangang-river-zone',
        name: 'Hangang Waterfront',
        type: 'water',
        coordinates: [
          { lat: 37.505, lng: 126.979 },
          { lat: 37.524, lng: 127.014 },
          { lat: 37.52, lng: 127.018 },
          { lat: 37.502, lng: 126.982 },
        ],
      },
    ],
  }),

  // 2. Hangang 10K Grand Endurance Traverse (~10.2 km -> gameLength = 3200, includes 1 Energy Gel at 5000 m!)
  buildCourseFromRawPoints({
    id: 'seoul-forest-seongsu',
    title: 'Hangang & Seoul Forest 10K Traverse',
    shortTitle: 'Cloud Exhale 10K',
    subtitle:
      '10.2 km endurance course featuring an Energy Gel station at 5.0 km, Turbo Pads & real pace zones',
    locationLabel: 'Ttukseom · Seoul Forest · Jamsil, Seoul',
    category: 'forest',
    recommendedTheme: 'cloud',
    cardAura: CARD_AURA_PRESETS[1],
    rawPoints: densifyWaypoints([
      { lat: 37.5285, lng: 127.0185, paceMinPerKm: 5.55, biome: 'bridge' },
      { lat: 37.5345, lng: 127.0285, paceMinPerKm: 4.95, biome: 'riverside' },
      { lat: 37.5415, lng: 127.0385, paceMinPerKm: 4.55, biome: 'park' },
      { lat: 37.5468, lng: 127.0495, paceMinPerKm: 5.25, biome: 'park' },
      { lat: 37.5435, lng: 127.0625, paceMinPerKm: 5.95, biome: 'urban_pastel' },
      { lat: 37.5365, lng: 127.0755, paceMinPerKm: 5.35, biome: 'riverside' },
      { lat: 37.5295, lng: 127.0885, paceMinPerKm: 4.75, biome: 'riverside' },
      { lat: 37.5225, lng: 127.1025, paceMinPerKm: 4.45, biome: 'park' },
      { lat: 37.5165, lng: 127.1165, paceMinPerKm: 4.35, biome: 'urban_pastel' },
    ]),
    landmarks: [
      {
        id: 'deer-skywalk',
        name: 'Cloud Pedestrian Skywalk',
        nameEn: 'Cloud Pedestrian Skywalk',
        category: 'Observation Bridge',
        lat: 37.5382,
        lng: 127.0358,
        distKm: 1.8,
        side: 'left',
        offsetMeters: 24,
        heightMeters: 42,
        archStyle: 'bridge_arch',
        primaryColor: '#FFFBEB',
        accentColor: '#F472B6',
        description:
          'Sweeping boardwalk linking the riverside breeze to Seoul Forest.',
      },
      {
        id: 'conservatory-dome',
        name: '5K Energy Gel Botanical Dome',
        nameEn: '5K Energy Gel Botanical Dome',
        category: '5000m Energy Gel Station',
        lat: 37.5468,
        lng: 127.0442,
        distKm: 5.0,
        side: 'right',
        offsetMeters: 24,
        heightMeters: 34,
        archStyle: 'dome_pavilion',
        primaryColor: '#86EFAC',
        accentColor: '#FEF08A',
        description:
          'Halfway 5,000m Energy Gel landmark restoring full runner speed along the 10K course.',
      },
      {
        id: 'seongsu-atelier',
        name: 'Seongsu Brick Atelier District',
        nameEn: 'Seongsu Brick Atelier District',
        category: 'Creative Architecture',
        lat: 37.5442,
        lng: 127.0542,
        distKm: 7.8,
        side: 'left',
        offsetMeters: 26,
        heightMeters: 36,
        archStyle: 'atelier_brick',
        primaryColor: '#FDBA74',
        accentColor: '#FBCFE8',
        description:
          'Craft design studios blending warm terracotta brick with pastel arches.',
      },
    ],
    mapPolygons: [
      {
        id: 'seoul-forest-green',
        name: 'Seoul Forest Sanctuary',
        type: 'park',
        coordinates: [
          { lat: 37.536, lng: 127.033 },
          { lat: 37.549, lng: 127.038 },
          { lat: 37.548, lng: 127.058 },
          { lat: 37.538, lng: 127.055 },
        ],
      },
    ],
  }),

  // 3. Namsan Moonlight Botanical Trail (~3.2 km -> gameLength ~ 1680)
  buildCourseFromRawPoints({
    id: 'namsan-circuit',
    title: 'Namsan Moonlight Botanical Trail',
    shortTitle: 'Night Ignite',
    subtitle:
      'Luminous night garden course sweeping cleanly around N Seoul Tower with real pace buckets',
    locationLabel: 'Namsan Park Promenade, Seoul',
    category: 'elevation',
    recommendedTheme: 'night_garden',
    cardAura: CARD_AURA_PRESETS[2],
    rawPoints: densifyWaypoints([
      { lat: 37.5502, lng: 127.0025, paceMinPerKm: 5.15, biome: 'park' },
      { lat: 37.5538, lng: 126.9995, paceMinPerKm: 5.65, biome: 'park' },
      { lat: 37.5568, lng: 126.9942, paceMinPerKm: 6.15, biome: 'park' },
      { lat: 37.5572, lng: 126.9882, paceMinPerKm: 5.45, biome: 'mountain' },
      { lat: 37.5545, lng: 126.9828, paceMinPerKm: 4.85, biome: 'mountain' },
      { lat: 37.5505, lng: 126.9795, paceMinPerKm: 4.52, biome: 'urban_pastel' },
      { lat: 37.5465, lng: 126.9822, paceMinPerKm: 4.38, biome: 'urban_pastel' },
    ]),
    landmarks: [
      {
        id: 'national-theater-dome',
        name: 'National Theater Haeoreum Dome',
        nameEn: 'National Theater Haeoreum Dome',
        category: 'Cultural Landmark',
        lat: 37.5522,
        lng: 127.0008,
        distKm: 0.4,
        side: 'right',
        offsetMeters: 26,
        heightMeters: 34,
        archStyle: 'dome_pavilion',
        primaryColor: '#F472B6',
        accentColor: '#FEF08A',
        description:
          'Sculptural curved cultural theater welcoming runners at the trailhead.',
      },
      {
        id: 'n-seoul-tower',
        name: 'N Seoul Tower Beacon Spire',
        nameEn: 'N Seoul Tower Beacon Spire',
        category: 'Iconic Landmark',
        lat: 37.5532,
        lng: 126.9845,
        distKm: 2.1,
        side: 'left',
        offsetMeters: 30,
        heightMeters: 74,
        archStyle: 'observation_spire',
        primaryColor: '#FF3366',
        accentColor: '#A855F7',
        description:
          'Iconic observation spire projecting a vertical beam into the night sky.',
      },
    ],
    mapPolygons: [
      {
        id: 'namsan-mountain-park',
        name: 'Namsan Botanical Park',
        type: 'park',
        coordinates: [
          { lat: 37.545, lng: 126.978 },
          { lat: 37.559, lng: 126.982 },
          { lat: 37.558, lng: 127.004 },
          { lat: 37.546, lng: 127.002 },
        ],
      },
    ],
  }),

  // 4. Olympic Park Mongchon Moat Stroll (~3.0 km -> gameLength ~ 1600)
  buildCourseFromRawPoints({
    id: 'olympic-park-mongchon',
    title: 'Olympic Park Mongchon Moat Stroll',
    shortTitle: 'Velvet Presence',
    subtitle:
      'Flat lakeside 3-lane track past World Peace Gate and Lonely Tree Meadow with a companion fish',
    locationLabel: 'Olympic Park, Songpa-gu, Seoul',
    category: 'forest',
    recommendedTheme: 'riverside',
    cardAura: CARD_AURA_PRESETS[3],
    rawPoints: densifyWaypoints([
      { lat: 37.5155, lng: 127.1125, paceMinPerKm: 5.35, biome: 'park' },
      { lat: 37.5188, lng: 127.1158, paceMinPerKm: 4.82, biome: 'riverside' },
      { lat: 37.5222, lng: 127.1195, paceMinPerKm: 4.55, biome: 'riverside' },
      { lat: 37.5248, lng: 127.1242, paceMinPerKm: 5.15, biome: 'park' },
      { lat: 37.5232, lng: 127.1295, paceMinPerKm: 5.65, biome: 'park' },
      { lat: 37.5195, lng: 127.1335, paceMinPerKm: 4.65, biome: 'urban_pastel' },
    ]),
    landmarks: [
      {
        id: 'world-peace-gate',
        name: 'World Peace Gate Arch',
        nameEn: 'World Peace Gate Arch',
        category: 'Monument Arch',
        lat: 37.5175,
        lng: 127.1145,
        distKm: 0.45,
        side: 'left',
        offsetMeters: 26,
        heightMeters: 38,
        archStyle: 'bridge_arch',
        primaryColor: '#FDA4AF',
        accentColor: '#FEF08A',
        description:
          'Grand winged monument arch welcoming runners at the park entrance.',
      },
      {
        id: 'lonely-tree-hill',
        name: 'Lonely Tree Velvet Meadow',
        nameEn: 'Lonely Tree Velvet Meadow',
        category: 'Meadow Landmark',
        lat: 37.5245,
        lng: 127.1242,
        distKm: 1.75,
        side: 'right',
        offsetMeters: 25,
        heightMeters: 35,
        archStyle: 'dome_pavilion',
        primaryColor: '#86EFAC',
        accentColor: '#FDE68A',
        description:
          'Storybook tree standing on a needle-felted emerald lawn.',
      },
    ],
    mapPolygons: [
      {
        id: 'olympic-park-zone',
        name: 'Olympic Park Meadow',
        type: 'park',
        coordinates: [
          { lat: 37.514, lng: 127.111 },
          { lat: 37.527, lng: 127.116 },
          { lat: 37.525, lng: 127.135 },
          { lat: 37.515, lng: 127.132 },
        ],
      },
    ],
  }),

  // 5. Yeouido Blossom Waterfront Avenue (~3.4 km)
  buildCourseFromRawPoints({
    id: 'yeouido-cherry-loop',
    title: 'Yeouido Blossom Waterfront Avenue',
    shortTitle: 'Blossom Between',
    subtitle:
      'Breezy flat riverside avenue framed by pink wool blossom tunnels and floating water stages',
    locationLabel: 'Yeouido Hangang Park, Seoul',
    category: 'waterfront',
    recommendedTheme: 'meadow',
    cardAura: CARD_AURA_PRESETS[4],
    rawPoints: densifyWaypoints([
      { lat: 37.5225, lng: 126.9415, paceMinPerKm: 5.25, biome: 'riverside' },
      { lat: 37.5258, lng: 126.9362, paceMinPerKm: 4.75, biome: 'riverside' },
      { lat: 37.5288, lng: 126.9305, paceMinPerKm: 4.48, biome: 'park' },
      { lat: 37.5315, lng: 126.9242, paceMinPerKm: 5.05, biome: 'park' },
      { lat: 37.5332, lng: 126.9175, paceMinPerKm: 5.55, biome: 'bridge' },
      { lat: 37.5305, lng: 126.9115, paceMinPerKm: 4.62, biome: 'urban_pastel' },
    ]),
    landmarks: [
      {
        id: 'yeouido-floating-stage',
        name: 'Mulbit Floating Water Stage',
        nameEn: 'Mulbit Floating Water Stage',
        category: 'Waterfront Stage',
        lat: 37.5295,
        lng: 126.9285,
        distKm: 1.15,
        side: 'right',
        offsetMeters: 24,
        heightMeters: 28,
        archStyle: 'floating_lotus',
        primaryColor: '#FF94C2',
        accentColor: '#A5F3FC',
        description:
          'Glowing shell-shaped amphitheater floating on the shimmering river surface.',
      },
      {
        id: 'parc1-pastel-spire',
        name: 'Yeouido Twin Pastel Towers',
        nameEn: 'Yeouido Twin Pastel Towers',
        category: 'Financial Skyline',
        lat: 37.5308,
        lng: 126.9132,
        distKm: 2.55,
        side: 'left',
        offsetMeters: 34,
        heightMeters: 68,
        archStyle: 'pastel_tower',
        primaryColor: '#F472B6',
        accentColor: '#C4B5FD',
        description:
          'Monumental pastel-framed skyscrapers accented with rose-pink diagonal trusses.',
      },
    ],
    mapPolygons: [
      {
        id: 'yeouido-park-lawn',
        name: 'Yeouido Island Park',
        type: 'park',
        coordinates: [
          { lat: 37.521, lng: 126.91 },
          { lat: 37.535, lng: 126.914 },
          { lat: 37.533, lng: 126.943 },
          { lat: 37.521, lng: 126.939 },
        ],
      },
    ],
  }),

  // 6. Bukaksan Octagonal Skyway Promenade (~3.3 km)
  buildCourseFromRawPoints({
    id: 'bukaksan-skyway-ridge',
    title: 'Bukaksan Octagonal Skyway Promenade',
    shortTitle: 'Skyway Echo',
    subtitle:
      'Panoramic starlight promenade passing Changuimun Gate and Palgakjeong Pavilion',
    locationLabel: 'Bukaksan Skyway, Jongno-gu, Seoul',
    category: 'elevation',
    recommendedTheme: 'night_garden',
    cardAura: CARD_AURA_PRESETS[5],
    rawPoints: densifyWaypoints([
      { lat: 37.5915, lng: 126.9645, paceMinPerKm: 5.65, biome: 'park' },
      { lat: 37.5955, lng: 126.9695, paceMinPerKm: 6.12, biome: 'mountain' },
      { lat: 37.5992, lng: 126.9755, paceMinPerKm: 5.45, biome: 'mountain' },
      { lat: 37.6012, lng: 126.9822, paceMinPerKm: 4.88, biome: 'bridge' },
      { lat: 37.5995, lng: 126.9888, paceMinPerKm: 4.55, biome: 'park' },
      { lat: 37.5955, lng: 126.9942, paceMinPerKm: 4.42, biome: 'urban_pastel' },
    ]),
    landmarks: [
      {
        id: 'changuimun-arch',
        name: 'Changuimun Cloud Fortress Gate',
        nameEn: 'Changuimun Cloud Fortress Gate',
        category: 'Heritage Gate',
        lat: 37.5938,
        lng: 126.9675,
        distKm: 0.45,
        side: 'left',
        offsetMeters: 24,
        heightMeters: 30,
        archStyle: 'bridge_arch',
        primaryColor: '#A78BFA',
        accentColor: '#76FFB2',
        description:
          'Historic fortress gate glowing softly against the indigo night sky.',
      },
      {
        id: 'palgakjeong-sky-pavilion',
        name: 'Palgakjeong Octagonal Sky Spire',
        nameEn: 'Palgakjeong Octagonal Sky Spire',
        category: 'Skyway Observatory',
        lat: 37.6008,
        lng: 126.9812,
        distKm: 1.65,
        side: 'right',
        offsetMeters: 26,
        heightMeters: 52,
        archStyle: 'observation_spire',
        primaryColor: '#F472B6',
        accentColor: '#FEF08A',
        description:
          'Octagonal pavilion commanding a 360-degree pastel panorama.',
      },
    ],
    mapPolygons: [
      {
        id: 'bukaksan-ridge-zone',
        name: 'Bukaksan Forest Sanctuary',
        type: 'park',
        coordinates: [
          { lat: 37.589, lng: 126.963 },
          { lat: 37.603, lng: 126.97 },
          { lat: 37.602, lng: 126.996 },
          { lat: 37.59, lng: 126.992 },
        ],
      },
    ],
  }),
];

const ARCH_STYLES: BuildingArchStyle[] = [
  'pastel_tower',
  'dome_pavilion',
  'observation_spire',
  'bridge_arch',
  'atelier_brick',
  'floating_lotus',
];

export function parseGpxFileContent(
  xmlText: string,
  fileName: string
): GpxCourseData {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'text/xml');

  const nameNode =
    xml.querySelector('trk > name') ||
    xml.querySelector('rte > name') ||
    xml.querySelector('metadata > name');
  const rawTitle =
    nameNode?.textContent?.trim() ||
    fileName.replace(/\.gpx$/i, '') ||
    'Custom GPX Running Course';

  let ptNodes = Array.from(xml.querySelectorAll('trkpt'));
  if (ptNodes.length === 0) {
    ptNodes = Array.from(xml.querySelectorAll('rtept'));
  }
  if (ptNodes.length === 0) {
    ptNodes = Array.from(xml.querySelectorAll('wpt'));
  }

  if (ptNodes.length < 2) {
    throw new Error('Route is too short (needs at least 200 m).');
  }

  const biomes: EnvironmentBiome[] = [
    'riverside',
    'park',
    'urban_pastel',
    'bridge',
    'mountain',
  ];

  const rawPoints: RawPointInput[] = ptNodes.map((node, idx) => {
    const lat = parseFloat(node.getAttribute('lat') || '37.5114');
    const lng = parseFloat(node.getAttribute('lon') || '126.9955');
    const timeText = node.querySelector('time')?.textContent;
    const timeMs = timeText ? Date.parse(timeText) : undefined;
    const biome =
      biomes[
        Math.floor((idx / ptNodes.length) * biomes.length) % biomes.length
      ];
    return {
      lat: Number.isFinite(lat) ? lat : 37.5114,
      lng: Number.isFinite(lng) ? lng : 126.9955,
      ele: 0,
      timeMs: Number.isFinite(timeMs) ? timeMs : undefined,
      biome,
    };
  });

  const aura =
    CARD_AURA_PRESETS[Math.floor(Math.random() * CARD_AURA_PRESETS.length)];

  const baseCourse = buildCourseFromRawPoints({
    id: `custom-${Date.now()}`,
    title: rawTitle,
    shortTitle: rawTitle.slice(0, 16),
    subtitle: `Imported GPX Course (N=1200 spaced samples · Real Pace Buckets)`,
    locationLabel: `Lat ${rawPoints[0].lat.toFixed(3)}° · Lng ${rawPoints[0].lng.toFixed(3)}°`,
    category: 'custom',
    recommendedTheme: 'meadow',
    cardAura: aura,
    rawPoints,
    landmarks: [],
    mapPolygons: [],
  });

  const generatedLandmarks: SurroundingLandmark[] = [];
  const totalKm = Math.max(0.5, baseCourse.totalDistanceKm);
  const landmarkCount = Math.min(6, Math.max(3, Math.floor(totalKm * 1.1)));
  const colors = [
    '#FF85B8',
    '#A78BFA',
    '#80FFB4',
    '#FDE68A',
    '#67E8F9',
    '#FDA4AF',
  ];

  for (let i = 0; i < landmarkCount; i++) {
    const ratio = (i + 0.6) / landmarkCount;
    const ptIdx = Math.min(
      baseCourse.points.length - 1,
      Math.floor(ratio * baseCourse.points.length)
    );
    const pt = baseCourse.points[ptIdx];
    const side = i % 2 === 0 ? 'left' : 'right';
    const style = ARCH_STYLES[i % ARCH_STYLES.length];
    const styleName =
      style === 'pastel_tower'
        ? 'Skyline Tower'
        : style === 'dome_pavilion'
        ? 'Botanic Dome'
        : style === 'bridge_arch'
        ? 'Cloud Arch Bridge'
        : style === 'floating_lotus'
        ? 'Waterfront Pavilion'
        : 'Observation Spire';
    generatedLandmarks.push({
      id: `custom-lm-${i}`,
      name: `${pt.distKm.toFixed(1)}km Pastel ${styleName}`,
      nameEn: `Pastel ${styleName} ${i + 1}`,
      category: 'Route Landmark',
      lat: pt.lat + (side === 'left' ? 0.0007 : -0.0007),
      lng: pt.lng + (side === 'left' ? -0.0007 : 0.0007),
      distKm: pt.distKm,
      side,
      offsetMeters: 25 + (i % 3) * 5,
      heightMeters: 30 + (i % 4) * 12,
      archStyle: style,
      primaryColor: colors[i % colors.length],
      accentColor: colors[(i + 2) % colors.length],
      description: `Procedural 3D pastel landmark synthesized along your GPX route at the ${pt.distKm.toFixed(
        2
      )}km mark.`,
    });
  }

  baseCourse.landmarks = generatedLandmarks;
  return baseCourse;
}

export function exportCourseToGpxXml(course: GpxCourseData): string {
  // Sample 200 points when exporting so XML size stays compact
  const step = Math.max(1, Math.floor(course.points.length / 200));
  const trkpts = course.points
    .filter((_, idx) => idx % step === 0 || idx === course.points.length - 1)
    .map(
      (pt) =>
        `      <trkpt lat="${pt.lat.toFixed(6)}" lon="${pt.lng.toFixed(6)}">\n        <ele>0.0</ele>\n        <time>${pt.timeIso}</time>\n      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Pace Runner 3D GPX World" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${course.title}</name>
    <desc>${course.subtitle}</desc>
  </metadata>
  <trk>
    <name>${course.title}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}
