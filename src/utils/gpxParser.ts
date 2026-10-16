import {
  ArtworkThemeConfig,
  ArtworkThemeId,
  BuildingArchStyle,
  CardAuraPalette,
  CourseCategory,
  EnvironmentBiome,
  GpxCourseData,
  GpxKmSplit,
  GpxTrackPoint,
  SurroundingLandmark,
  WaterOrParkPolygon,
} from '../types/gpx';

export const ARTWORK_THEMES: Record<ArtworkThemeId, ArtworkThemeConfig> = {
  meadow: {
    id: 'meadow',
    nameKo: 'Pink Fluffy Meadow',
    nameEn: 'Pink Fluffy Meadow',
    inspirationLabel: 'Neon mint hills and giant pink wool trees under a starry sky',
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
    inspirationLabel: 'Dreamy cobalt sky with soft clouds and autumn foliage',
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
    inspirationLabel: 'Bioluminescent pastel botanical garden under a crimson moon',
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
    inspirationLabel: 'Waterfront felt trail with a floating pink-finned companion fish',
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
  // 1. Periwinkle Blue with soft sky-white core (like "Exhale" top-left in reference)
  {
    outerBg: '#5B8EF4',
    innerGlow: '#8FB6FF',
    rimHighlight: '#BFD7FF',
    tubeTint: '#E8F1FF',
  },
  // 2. Periwinkle-Violet with warm rose-pink radial core (like "Flow" top-right in reference)
  {
    outerBg: '#7A8EF5',
    innerGlow: '#E68AB8',
    rimHighlight: '#C4CEFF',
    tubeTint: '#F9E8F2',
  },
  // 3. Soft Lavender-Blue with cool aqua-mint core (like "Between" middle-left in reference)
  {
    outerBg: '#9BA8FA',
    innerGlow: '#7BC5AE',
    rimHighlight: '#D4DAFF',
    tubeTint: '#EBF8F5',
  },
  // 4. Seafoam Sage Mint with luminous pearl core (like "Presence" middle-right in reference)
  {
    outerBg: '#9CD2CB',
    innerGlow: '#6FA9A2',
    rimHighlight: '#D8F3EF',
    tubeTint: '#F2FCFA',
  },
  // 5. Rose-Lilac Orchid with warm blush core (like "Ignite" bottom-left in reference)
  {
    outerBg: '#CFA1CB',
    innerGlow: '#BA7FA8',
    rimHighlight: '#F3D6F0',
    tubeTint: '#FDF0FA',
  },
  // 6. Sky-Cyan border with vibrant magenta-violet core (like "Echo" bottom-right in reference)
  {
    outerBg: '#8BB8F8',
    innerGlow: '#D47EB8',
    rimHighlight: '#CAE0FF',
    tubeTint: '#FAF0F8',
  },
];

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
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
  if (!Number.isFinite(paceMinPerKm) || paceMinPerKm <= 0) return `5'30"`;
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
  ele: number;
  timeMs?: number;
  biome?: EnvironmentBiome;
}

/**
 * Removes micro-jitter or duplicate GPS points that could cause sharp spline kinks.
 */
function sanitizeRawPoints(inputPoints: RawPointInput[]): RawPointInput[] {
  if (inputPoints.length <= 2) return inputPoints;
  const filtered: RawPointInput[] = [inputPoints[0]];
  for (let i = 1; i < inputPoints.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = inputPoints[i];
    const distMeters =
      haversineDistanceKm(prev.lat, prev.lng, curr.lat, curr.lng) * 1000;
    if (distMeters >= 4.0 || i === inputPoints.length - 1) {
      filtered.push(curr);
    }
  }
  return filtered.length >= 2 ? filtered : inputPoints;
}

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
  const rawPoints = sanitizeRawPoints(params.rawPoints);
  const count = rawPoints.length;

  // Center coordinates for 3D projection
  const avgLat = rawPoints.reduce((acc, p) => acc + p.lat, 0) / count;
  const avgLng = rawPoints.reduce((acc, p) => acc + p.lng, 0) / count;
  const minEle = Math.min(...rawPoints.map((p) => p.ele));
  const maxEle = Math.max(...rawPoints.map((p) => p.ele));

  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos((avgLat * Math.PI) / 180);

  // Scale factor so a ~5km route spans ~440 scene units for lush 3D traversal
  const rawSpanMeters = Math.max(
    400,
    ...rawPoints.map((p) => {
      const dx = (p.lng - avgLng) * metersPerDegLng;
      const dz = (p.lat - avgLat) * metersPerDegLat;
      return Math.hypot(dx, dz);
    })
  );
  const worldScale = 230 / rawSpanMeters;

  const points: GpxTrackPoint[] = [];
  let cumulativeDistKm = 0;
  let cumulativeSeconds = 0;
  let totalEleGain = 0;

  for (let i = 0; i < count; i++) {
    const curr = rawPoints[i];
    const prev = i > 0 ? rawPoints[i - 1] : curr;

    const segDistKm =
      i > 0 ? haversineDistanceKm(prev.lat, prev.lng, curr.lat, curr.lng) : 0;
    cumulativeDistKm += segDistKm;

    const eleDiff = curr.ele - prev.ele;
    if (eleDiff > 0) totalEleGain += eleDiff;

    const segDistMeters = segDistKm * 1000;
    const gradePercent =
      segDistMeters > 1
        ? Math.max(-18, Math.min(18, (eleDiff / segDistMeters) * 100))
        : 0;

    let segSeconds = 0;
    let paceMinPerKm = 5.2;

    if (i > 0) {
      if (curr.timeMs && prev.timeMs && curr.timeMs > prev.timeMs) {
        segSeconds = (curr.timeMs - prev.timeMs) / 1000;
        if (segDistKm > 0.0005) {
          paceMinPerKm = Math.max(
            3.2,
            Math.min(10.5, segSeconds / 60 / segDistKm)
          );
        }
      } else {
        // Synthesize realistic runner pace affected by grade & rhythm
        const gradeFactor = gradePercent * 0.11;
        const waveFactor = Math.sin(i * 0.25) * 0.28;
        paceMinPerKm = Math.max(
          3.6,
          Math.min(8.2, 5.15 + gradeFactor + waveFactor)
        );
        segSeconds = segDistKm * paceMinPerKm * 60;
      }
    }

    cumulativeSeconds += segSeconds;
    const speedKmh = paceMinPerKm > 0 ? 60 / paceMinPerKm : 11.5;

    const dxMeters = (curr.lng - avgLng) * metersPerDegLng;
    const dzMeters = -(curr.lat - avgLat) * metersPerDegLat; // North = -Z in Three.js
    const worldX = dxMeters * worldScale;
    const worldZ = dzMeters * worldScale;
    const worldY = (curr.ele - minEle) * 0.28;

    points.push({
      index: i,
      lat: curr.lat,
      lng: curr.lng,
      ele: Number(curr.ele.toFixed(1)),
      timeIso: new Date(
        Date.UTC(2026, 9, 15, 11, 0, 0) + cumulativeSeconds * 1000
      ).toISOString(),
      elapsedSeconds: Math.round(cumulativeSeconds),
      distKm: Number(cumulativeDistKm.toFixed(3)),
      paceMinPerKm: Number(paceMinPerKm.toFixed(2)),
      speedKmh: Number(speedKmh.toFixed(1)),
      gradePercent: Number(gradePercent.toFixed(1)),
      biome: curr.biome || 'park',
      worldX,
      worldY,
      worldZ,
      isOverpass: false,
    });
  }

  // Automatic 3D De-Overlapping & Skywalk Grade-Separation Pass:
  // Prevents any overlapping / out-and-back / self-crossing segments from colliding in 3D space.
  const minTrackSeparation = 11.5;
  const lateralOffsetsX = new Float32Array(points.length);
  const lateralOffsetsZ = new Float32Array(points.length);
  const verticalOverpassY = new Float32Array(points.length);

  for (let i = 10; i < points.length; i++) {
    const pi = points[i];
    const prevI = points[Math.max(0, i - 1)];
    let dirX = pi.worldX - prevI.worldX;
    let dirZ = pi.worldZ - prevI.worldZ;
    const dirLen = Math.hypot(dirX, dirZ) || 1;
    dirX /= dirLen;
    dirZ /= dirLen;
    const rightX = -dirZ;
    const rightZ = dirX;

    for (let j = 0; j < i - 10; j++) {
      const isLoopClosure = i > points.length - 8 && j < 8;
      const dx = pi.worldX - points[j].worldX;
      const dz = pi.worldZ - points[j].worldZ;
      const dist = Math.hypot(dx, dz);

      if (dist < minTrackSeparation && !isLoopClosure) {
        const overlapRatio = 1 - dist / minTrackSeparation;
        lateralOffsetsX[i] += rightX * overlapRatio * 8.5;
        lateralOffsetsZ[i] += rightZ * overlapRatio * 8.5;
        verticalOverpassY[i] = Math.max(
          verticalOverpassY[i],
          overlapRatio * 3.8
        );
        pi.isOverpass = true;
      }
    }
  }

  for (let pass = 0; pass < 3; pass++) {
    for (let i = 2; i < points.length - 2; i++) {
      lateralOffsetsX[i] =
        (lateralOffsetsX[i - 2] +
          lateralOffsetsX[i - 1] +
          lateralOffsetsX[i] +
          lateralOffsetsX[i + 1] +
          lateralOffsetsX[i + 2]) /
        5;
      lateralOffsetsZ[i] =
        (lateralOffsetsZ[i - 2] +
          lateralOffsetsZ[i - 1] +
          lateralOffsetsZ[i] +
          lateralOffsetsZ[i + 1] +
          lateralOffsetsZ[i + 2]) /
        5;
      verticalOverpassY[i] =
        (verticalOverpassY[i - 2] +
          verticalOverpassY[i - 1] +
          verticalOverpassY[i] +
          verticalOverpassY[i + 1] +
          verticalOverpassY[i + 2]) /
        5;
    }
  }

  for (let i = 0; i < points.length; i++) {
    points[i].worldX += lateralOffsetsX[i];
    points[i].worldZ += lateralOffsetsZ[i];
    points[i].worldY += verticalOverpassY[i];
    if (
      Math.abs(lateralOffsetsX[i]) > 0.01 ||
      Math.abs(lateralOffsetsZ[i]) > 0.01
    ) {
      points[i].lng =
        avgLng + points[i].worldX / worldScale / metersPerDegLng;
      points[i].lat =
        avgLat - points[i].worldZ / worldScale / metersPerDegLat;
    }
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
      let gain = 0;
      let loss = 0;
      for (let j = splitStartIdx + 1; j <= i; j++) {
        const diff = points[j].ele - points[j - 1].ele;
        if (diff > 0) gain += diff;
        else loss += Math.abs(diff);
      }
      const avgGrade = ((pt.ele - startPt.ele) / (dKm * 1000)) * 100;

      splits.push({
        km: splitKmIndex,
        distanceKm: Number(dKm.toFixed(2)),
        durationSeconds: Math.round(dSec),
        paceMinPerKm: Number((dSec / 60 / dKm).toFixed(2)),
        elevationGainM: Math.round(gain),
        elevationLossM: Math.round(loss),
        avgGradePercent: Number(avgGrade.toFixed(1)),
        startDistKm: startPt.distKm,
      });

      splitKmIndex++;
      splitStartIdx = i;
    }
  }

  const totalDistanceKm = Number(cumulativeDistKm.toFixed(2));
  const totalDurationSeconds = Math.round(cumulativeSeconds);
  const avgPaceMinPerKm =
    totalDistanceKm > 0
      ? Number((totalDurationSeconds / 60 / totalDistanceKm).toFixed(2))
      : 5.2;

  return {
    id: params.id,
    title: params.title,
    shortTitle: params.shortTitle,
    subtitle: params.subtitle,
    locationLabel: params.locationLabel,
    category: params.category,
    recommendedTheme: params.recommendedTheme,
    cardAura: params.cardAura,
    totalDistanceKm,
    totalDurationSeconds,
    avgPaceMinPerKm,
    maxElevationM: Math.round(maxEle),
    minElevationM: Math.round(minEle),
    elevationGainM: Math.round(totalEleGain),
    caloriesKcal: Math.round(totalDistanceKm * 64),
    avgCadenceSpm: Math.round(172 + (5.5 - avgPaceMinPerKm) * 4),
    points,
    splits,
    landmarks: params.landmarks,
    mapPolygons: params.mapPolygons,
  };
}

/**
 * Smoothly interpolates dense points between waypoints using Catmull-Rom spline math.
 * Zero endpoint discontinuities: t=0 and t=1 match exact waypoint coordinates.
 */
function densifyWaypoints(
  waypoints: Array<{
    lat: number;
    lng: number;
    ele: number;
    biome: EnvironmentBiome;
  }>,
  stepsPerSegment = 12
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
      const smoothT = t * t * (3 - 2 * t);
      const lat = catmullRom(p0.lat, p1.lat, p2.lat, p3.lat, t);
      const lng = catmullRom(p0.lng, p1.lng, p2.lng, p3.lng, t);
      const ele = p1.ele + (p2.ele - p1.ele) * smoothT;
      result.push({
        lat,
        lng,
        ele,
        biome: t < 0.5 ? p1.biome : p2.biome,
      });
    }
  }
  const last = waypoints[n - 1];
  result.push({ ...last });
  return result;
}

export const PRESET_COURSES: GpxCourseData[] = [
  // 1. Banpo Hangang Moonlight Circuit
  buildCourseFromRawPoints({
    id: 'banpo-hangang',
    title: 'Banpo Hangang Moonlight Circuit',
    shortTitle: 'Moonlight Flow',
    subtitle:
      'Scenic waterfront loop from Some Sevit Island through Jamwon Grove to Dongjak Cloud Cafe',
    locationLabel: 'Banpo Hangang Park, Seoul',
    category: 'waterfront',
    recommendedTheme: 'meadow',
    cardAura: CARD_AURA_PRESETS[0],
    rawPoints: densifyWaypoints(
      [
        { lat: 37.5116, lng: 126.9942, ele: 14, biome: 'riverside' },
        { lat: 37.5142, lng: 126.9982, ele: 16, biome: 'bridge' },
        { lat: 37.5174, lng: 127.0035, ele: 19, biome: 'riverside' },
        { lat: 37.5162, lng: 127.0082, ele: 18, biome: 'park' },
        { lat: 37.5115, lng: 127.0068, ele: 21, biome: 'urban_pastel' },
        { lat: 37.5068, lng: 127.0012, ele: 17, biome: 'urban_pastel' },
        { lat: 37.5038, lng: 126.9935, ele: 16, biome: 'park' },
        { lat: 37.5046, lng: 126.9862, ele: 24, biome: 'bridge' },
        { lat: 37.5086, lng: 126.9888, ele: 15, biome: 'riverside' },
        { lat: 37.5109, lng: 126.9928, ele: 14, biome: 'riverside' },
      ],
      12
    ),
    landmarks: [
      {
        id: 'sevit-island',
        name: 'Some Sevit Floating Dome',
        nameEn: 'Some Sevit Floating Dome',
        category: 'Waterfront Landmark',
        lat: 37.5122,
        lng: 126.995,
        distKm: 0.25,
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
        lat: 37.5152,
        lng: 126.9998,
        distKm: 0.85,
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
        lat: 37.5168,
        lng: 127.0068,
        distKm: 1.65,
        side: 'right',
        offsetMeters: 22,
        heightMeters: 28,
        archStyle: 'dome_pavilion',
        primaryColor: '#FF94C2',
        accentColor: '#76FFB2',
        description:
          'Circular botanical rotunda nestled inside a grove of giant pink wool trees.',
      },
      {
        id: 'acroriver-pastel-towers',
        name: 'Banpo Pastel Skyline Towers',
        nameEn: 'Banpo Pastel Skyline Towers',
        category: 'Urban Skyline',
        lat: 37.5082,
        lng: 127.0032,
        distKm: 2.75,
        side: 'left',
        offsetMeters: 34,
        heightMeters: 56,
        archStyle: 'pastel_tower',
        primaryColor: '#C4B5FD',
        accentColor: '#F9A8D4',
        description:
          'Rounded pastel high-rise towers framing the southern Hangang parkland.',
      },
      {
        id: 'dongjak-cloud-cafe',
        name: 'Dongjak Cloud Cafe Spire',
        nameEn: 'Dongjak Cloud Cafe Spire',
        category: 'Sky Observatory',
        lat: 37.5052,
        lng: 126.9868,
        distKm: 3.95,
        side: 'right',
        offsetMeters: 25,
        heightMeters: 44,
        archStyle: 'observation_spire',
        primaryColor: '#FDE68A',
        accentColor: '#FB7185',
        description:
          'Elevated sunset observatory café perched high above the river clouds.',
      },
    ],
    mapPolygons: [
      {
        id: 'hangang-river-zone',
        name: 'Hangang Waterfront',
        type: 'water',
        coordinates: [
          { lat: 37.507, lng: 126.982 },
          { lat: 37.521, lng: 127.006 },
          { lat: 37.517, lng: 127.011 },
          { lat: 37.504, lng: 126.985 },
        ],
      },
      {
        id: 'banpo-grass-park',
        name: 'Banpo Picnic Lawn',
        type: 'park',
        coordinates: [
          { lat: 37.503, lng: 126.986 },
          { lat: 37.516, lng: 127.008 },
          { lat: 37.509, lng: 127.01 },
          { lat: 37.501, lng: 126.99 },
        ],
      },
    ],
  }),

  // 2. Seoul Forest & Seongsu Cloud Loop
  buildCourseFromRawPoints({
    id: 'seoul-forest-seongsu',
    title: 'Seoul Forest & Seongsu Cloud Loop',
    shortTitle: 'Cloud Exhale',
    subtitle:
      'Dreamy trail connecting Mirror Pond, Brick Ateliers, and the Pedestrian Cloud Skywalk',
    locationLabel: 'Seoul Forest · Seongsu-dong, Seoul',
    category: 'forest',
    recommendedTheme: 'cloud',
    cardAura: CARD_AURA_PRESETS[1],
    rawPoints: densifyWaypoints(
      [
        { lat: 37.5444, lng: 127.0374, ele: 18, biome: 'park' },
        { lat: 37.5472, lng: 127.0412, ele: 21, biome: 'park' },
        { lat: 37.5462, lng: 127.0468, ele: 19, biome: 'urban_pastel' },
        { lat: 37.5425, lng: 127.0495, ele: 20, biome: 'urban_pastel' },
        { lat: 37.5388, lng: 127.0455, ele: 16, biome: 'park' },
        { lat: 37.5372, lng: 127.0395, ele: 26, biome: 'bridge' },
        { lat: 37.5405, lng: 127.0355, ele: 15, biome: 'riverside' },
        { lat: 37.5436, lng: 127.0366, ele: 18, biome: 'park' },
      ],
      14
    ),
    landmarks: [
      {
        id: 'mirror-pond',
        name: 'Mirror Pond Lotus Pavilion',
        nameEn: 'Mirror Pond Lotus Pavilion',
        category: 'Eco Park',
        lat: 37.5458,
        lng: 127.0392,
        distKm: 0.4,
        side: 'left',
        offsetMeters: 22,
        heightMeters: 24,
        archStyle: 'floating_lotus',
        primaryColor: '#BAE6FD',
        accentColor: '#FDE68A',
        description:
          'Shallow reflective pond mirroring pastel trees and drifting cotton clouds.',
      },
      {
        id: 'conservatory-dome',
        name: 'Botanical Glass Conservatory',
        nameEn: 'Botanical Glass Conservatory',
        category: 'Greenhouse Dome',
        lat: 37.5464,
        lng: 127.0435,
        distKm: 1.05,
        side: 'right',
        offsetMeters: 24,
        heightMeters: 34,
        archStyle: 'dome_pavilion',
        primaryColor: '#86EFAC',
        accentColor: '#FEF08A',
        description:
          'Warm glowing botanical glasshouse filled with tropical pastel flora.',
      },
      {
        id: 'seongsu-atelier',
        name: 'Seongsu Brick Atelier District',
        nameEn: 'Seongsu Brick Atelier District',
        category: 'Creative Architecture',
        lat: 37.5432,
        lng: 127.0488,
        distKm: 1.85,
        side: 'left',
        offsetMeters: 26,
        heightMeters: 36,
        archStyle: 'atelier_brick',
        primaryColor: '#FDBA74',
        accentColor: '#FBCFE8',
        description:
          'Craft design studios blending warm terracotta brick with pastel arches.',
      },
      {
        id: 'deer-skywalk',
        name: 'Cloud Pedestrian Skywalk',
        nameEn: 'Cloud Pedestrian Skywalk',
        category: 'Observation Bridge',
        lat: 37.5378,
        lng: 127.0402,
        distKm: 3.1,
        side: 'right',
        offsetMeters: 24,
        heightMeters: 42,
        archStyle: 'bridge_arch',
        primaryColor: '#FFFBEB',
        accentColor: '#F472B6',
        description:
          'Sweeping aerial boardwalk linking Seoul Forest to the riverside breeze.',
      },
    ],
    mapPolygons: [
      {
        id: 'seoul-forest-green',
        name: 'Seoul Forest Sanctuary',
        type: 'park',
        coordinates: [
          { lat: 37.539, lng: 127.035 },
          { lat: 37.548, lng: 127.038 },
          { lat: 37.547, lng: 127.046 },
          { lat: 37.538, lng: 127.043 },
        ],
      },
    ],
  }),

  // 3. Namsan North Trail Moonlight Climb
  buildCourseFromRawPoints({
    id: 'namsan-circuit',
    title: 'Namsan North Trail Moonlight Climb',
    shortTitle: 'Night Ignite',
    subtitle:
      'Dynamic elevation climb and sweeping downhill loop beneath N Seoul Tower',
    locationLabel: 'Namsan Park North Circuit, Seoul',
    category: 'elevation',
    recommendedTheme: 'night_garden',
    cardAura: CARD_AURA_PRESETS[2],
    rawPoints: densifyWaypoints(
      [
        { lat: 37.5522, lng: 126.9995, ele: 68, biome: 'mountain' },
        { lat: 37.5558, lng: 126.9952, ele: 96, biome: 'mountain' },
        { lat: 37.5572, lng: 126.9895, ele: 128, biome: 'park' },
        { lat: 37.5548, lng: 126.9845, ele: 158, biome: 'mountain' },
        { lat: 37.5515, lng: 126.9882, ele: 215, biome: 'mountain' },
        { lat: 37.5495, lng: 126.9928, ele: 175, biome: 'park' },
        { lat: 37.5508, lng: 126.9972, ele: 112, biome: 'urban_pastel' },
        { lat: 37.5518, lng: 126.9991, ele: 72, biome: 'mountain' },
      ],
      14
    ),
    landmarks: [
      {
        id: 'national-theater-dome',
        name: 'National Theater Haeoreum Dome',
        nameEn: 'National Theater Haeoreum Dome',
        category: 'Cultural Landmark',
        lat: 37.5526,
        lng: 126.9988,
        distKm: 0.3,
        side: 'right',
        offsetMeters: 26,
        heightMeters: 34,
        archStyle: 'dome_pavilion',
        primaryColor: '#F472B6',
        accentColor: '#FEF08A',
        description:
          'Sculptural curved cultural theater welcoming runners at the Namsan trailhead.',
      },
      {
        id: 'north-trail-observatory',
        name: 'Luminous Trail Deck',
        nameEn: 'Luminous Trail Deck',
        category: 'Scenic Overlook',
        lat: 37.5568,
        lng: 126.9905,
        distKm: 1.5,
        side: 'left',
        offsetMeters: 22,
        heightMeters: 30,
        archStyle: 'floating_lotus',
        primaryColor: '#BEF264',
        accentColor: '#C084FC',
        description:
          'Bioluminescent pastel garden terrace overlooking the downtown skyline.',
      },
      {
        id: 'n-seoul-tower',
        name: 'N Seoul Tower Beacon Spire',
        nameEn: 'N Seoul Tower Beacon Spire',
        category: 'Iconic Landmark',
        lat: 37.5512,
        lng: 126.9882,
        distKm: 3.3,
        side: 'left',
        offsetMeters: 30,
        heightMeters: 74,
        archStyle: 'observation_spire',
        primaryColor: '#FF3366',
        accentColor: '#A855F7',
        description:
          'Iconic hilltop observation spire projecting a vertical beam into the night sky.',
      },
      {
        id: 'namsan-pastel-village',
        name: 'Pildong Pastel Terraces',
        nameEn: 'Pildong Pastel Terraces',
        category: 'Hillside Village',
        lat: 37.5504,
        lng: 126.9962,
        distKm: 4.6,
        side: 'right',
        offsetMeters: 28,
        heightMeters: 42,
        archStyle: 'pastel_tower',
        primaryColor: '#60A5FA',
        accentColor: '#F472B6',
        description:
          'Colorful low-rise hillside studio buildings lining the downhill stretch.',
      },
    ],
    mapPolygons: [
      {
        id: 'namsan-mountain-park',
        name: 'Namsan Mountain Park',
        type: 'park',
        coordinates: [
          { lat: 37.547, lng: 126.982 },
          { lat: 37.559, lng: 126.984 },
          { lat: 37.558, lng: 127.002 },
          { lat: 37.548, lng: 127.001 },
        ],
      },
    ],
  }),

  // 4. Olympic Park Mongchon Moat Loop
  buildCourseFromRawPoints({
    id: 'olympic-park-mongchon',
    title: 'Olympic Park Mongchon Moat Loop',
    shortTitle: 'Velvet Presence',
    subtitle:
      'Healing lakeside loop past Lonely Tree Hill with a floating felt companion fish',
    locationLabel: 'Olympic Park, Songpa-gu, Seoul',
    category: 'forest',
    recommendedTheme: 'riverside',
    cardAura: CARD_AURA_PRESETS[3],
    rawPoints: densifyWaypoints(
      [
        { lat: 37.5182, lng: 127.1155, ele: 22, biome: 'park' },
        { lat: 37.5218, lng: 127.1188, ele: 28, biome: 'riverside' },
        { lat: 37.5245, lng: 127.1235, ele: 38, biome: 'park' },
        { lat: 37.5215, lng: 127.1282, ele: 31, biome: 'park' },
        { lat: 37.5168, lng: 127.1265, ele: 24, biome: 'urban_pastel' },
        { lat: 37.5152, lng: 127.1205, ele: 20, biome: 'riverside' },
        { lat: 37.5177, lng: 127.1159, ele: 22, biome: 'park' },
      ],
      14
    ),
    landmarks: [
      {
        id: 'world-peace-gate',
        name: 'World Peace Gate Arch',
        nameEn: 'World Peace Gate Arch',
        category: 'Monument Arch',
        lat: 37.5185,
        lng: 127.116,
        distKm: 0.25,
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
        id: 'mongchon-moat',
        name: 'Mongchon Moat Waterfront',
        nameEn: 'Mongchon Moat Waterfront',
        category: 'Lakeside Trail',
        lat: 37.5215,
        lng: 127.1185,
        distKm: 0.95,
        side: 'left',
        offsetMeters: 22,
        heightMeters: 26,
        archStyle: 'floating_lotus',
        primaryColor: '#67E8F9',
        accentColor: '#FDA4AF',
        description:
          'Tranquil moat where pink-finned felt fish glide alongside the track.',
      },
      {
        id: 'lonely-tree-hill',
        name: 'Lonely Tree Velvet Hill',
        nameEn: 'Lonely Tree Velvet Hill',
        category: 'Meadow Hilltop',
        lat: 37.5242,
        lng: 127.1232,
        distKm: 1.85,
        side: 'right',
        offsetMeters: 25,
        heightMeters: 35,
        archStyle: 'dome_pavilion',
        primaryColor: '#86EFAC',
        accentColor: '#FDE68A',
        description:
          'Storybook tree standing atop a rolling needle-felted emerald hill.',
      },
      {
        id: 'lotte-world-tower-distant',
        name: 'Jamsil Pastel Sky Tower',
        nameEn: 'Jamsil Pastel Sky Tower',
        category: 'Supertall Spire',
        lat: 37.5162,
        lng: 127.1245,
        distKm: 3.4,
        side: 'right',
        offsetMeters: 38,
        heightMeters: 78,
        archStyle: 'observation_spire',
        primaryColor: '#C4B5FD',
        accentColor: '#FDE68A',
        description:
          'Soaring pastel supertall spire rising into the clouds beyond the park.',
      },
    ],
    mapPolygons: [
      {
        id: 'olympic-park-zone',
        name: 'Olympic Park Meadow',
        type: 'park',
        coordinates: [
          { lat: 37.514, lng: 127.114 },
          { lat: 37.526, lng: 127.116 },
          { lat: 37.525, lng: 127.13 },
          { lat: 37.514, lng: 127.128 },
        ],
      },
      {
        id: 'mongchon-water-lake',
        name: 'Mongchon Moat & Lake',
        type: 'water',
        coordinates: [
          { lat: 37.519, lng: 127.116 },
          { lat: 37.523, lng: 127.118 },
          { lat: 37.522, lng: 127.122 },
          { lat: 37.518, lng: 127.12 },
        ],
      },
    ],
  }),

  // 5. Yeouido Cherry Blossom Island Loop
  buildCourseFromRawPoints({
    id: 'yeouido-cherry-loop',
    title: 'Yeouido Blossom Island Loop',
    shortTitle: 'Blossom Between',
    subtitle:
      'Breezy riverside island circuit framed by pink wool blossom tunnels and floating stages',
    locationLabel: 'Yeouido Hangang Park, Seoul',
    category: 'waterfront',
    recommendedTheme: 'meadow',
    cardAura: CARD_AURA_PRESETS[4],
    rawPoints: densifyWaypoints(
      [
        { lat: 37.5284, lng: 126.9325, ele: 12, biome: 'riverside' },
        { lat: 37.5318, lng: 126.9262, ele: 14, biome: 'park' },
        { lat: 37.5335, lng: 126.9188, ele: 16, biome: 'park' },
        { lat: 37.5292, lng: 126.9145, ele: 19, biome: 'bridge' },
        { lat: 37.5238, lng: 126.9192, ele: 22, biome: 'urban_pastel' },
        { lat: 37.5218, lng: 126.9275, ele: 18, biome: 'urban_pastel' },
        { lat: 37.5252, lng: 126.9342, ele: 15, biome: 'riverside' },
        { lat: 37.5279, lng: 126.9329, ele: 12, biome: 'riverside' },
      ],
      13
    ),
    landmarks: [
      {
        id: 'yeouido-floating-stage',
        name: 'Mulbit Floating Water Stage',
        nameEn: 'Mulbit Floating Water Stage',
        category: 'Waterfront Stage',
        lat: 37.5305,
        lng: 126.9285,
        distKm: 0.65,
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
        id: 'yunjungno-cherry-dome',
        name: 'Yunjung-ro Pink Blossom Canopy',
        nameEn: 'Yunjung-ro Pink Blossom Canopy',
        category: 'Blossom Boulevard',
        lat: 37.5322,
        lng: 126.9168,
        distKm: 1.75,
        side: 'left',
        offsetMeters: 22,
        heightMeters: 32,
        archStyle: 'dome_pavilion',
        primaryColor: '#FFB5D8',
        accentColor: '#FEF08A',
        description:
          'Dreamlike boulevard of oversized pink needle-felted cherry blossom trees.',
      },
      {
        id: 'parc1-pastel-spire',
        name: 'Yeouido Twin Pastel Towers',
        nameEn: 'Yeouido Twin Pastel Towers',
        category: 'Financial Skyline',
        lat: 37.5245,
        lng: 126.9265,
        distKm: 3.1,
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
          { lat: 37.521, lng: 126.915 },
          { lat: 37.534, lng: 126.916 },
          { lat: 37.532, lng: 126.935 },
          { lat: 37.522, lng: 126.933 },
        ],
      },
    ],
  }),

  // 6. Bukaksan Skyway & Seokchon Echo Ridge
  buildCourseFromRawPoints({
    id: 'bukaksan-skyway-ridge',
    title: 'Bukaksan Octagonal Skyway Ridge',
    shortTitle: 'Skyway Echo',
    subtitle:
      'High-altitude ridge run along the pastel fortress wall to Palgakjeong Pavilion',
    locationLabel: 'Bukaksan Skyway, Jongno-gu, Seoul',
    category: 'elevation',
    recommendedTheme: 'night_garden',
    cardAura: CARD_AURA_PRESETS[5],
    rawPoints: densifyWaypoints(
      [
        { lat: 37.5925, lng: 126.9685, ele: 145, biome: 'mountain' },
        { lat: 37.5968, lng: 126.9732, ele: 198, biome: 'mountain' },
        { lat: 37.6005, lng: 126.9795, ele: 265, biome: 'mountain' },
        { lat: 37.6012, lng: 126.9858, ele: 312, biome: 'bridge' },
        { lat: 37.5972, lng: 126.9885, ele: 254, biome: 'park' },
        { lat: 37.5922, lng: 126.9835, ele: 188, biome: 'urban_pastel' },
        { lat: 37.5898, lng: 126.9755, ele: 152, biome: 'park' },
        { lat: 37.5919, lng: 126.9692, ele: 146, biome: 'mountain' },
      ],
      13
    ),
    landmarks: [
      {
        id: 'changuimun-arch',
        name: 'Changuimun Cloud Fortress Gate',
        nameEn: 'Changuimun Cloud Fortress Gate',
        category: 'Heritage Gate',
        lat: 37.5932,
        lng: 126.9695,
        distKm: 0.35,
        side: 'left',
        offsetMeters: 24,
        heightMeters: 30,
        archStyle: 'bridge_arch',
        primaryColor: '#A78BFA',
        accentColor: '#76FFB2',
        description:
          'Mountain ridge gate glowing softly against the indigo night sky.',
      },
      {
        id: 'palgakjeong-sky-pavilion',
        name: 'Palgakjeong Octagonal Sky Spire',
        nameEn: 'Palgakjeong Octagonal Sky Spire',
        category: 'Summit Observatory',
        lat: 37.6008,
        lng: 126.9812,
        distKm: 2.15,
        side: 'right',
        offsetMeters: 26,
        heightMeters: 52,
        archStyle: 'observation_spire',
        primaryColor: '#F472B6',
        accentColor: '#FEF08A',
        description:
          'Summit pavilion at 312m elevation commanding a 360-degree pastel panorama.',
      },
      {
        id: 'samcheong-garden-dome',
        name: 'Samcheong Woodland Botanic Dome',
        nameEn: 'Samcheong Woodland Botanic Dome',
        category: 'Forest Sanctuary',
        lat: 37.5915,
        lng: 126.9815,
        distKm: 3.65,
        side: 'left',
        offsetMeters: 24,
        heightMeters: 34,
        archStyle: 'dome_pavilion',
        primaryColor: '#67E8F9',
        accentColor: '#F9A8D4',
        description:
          'Tranquil woodland sanctuary tucked beneath the descending mountain ridge.',
      },
    ],
    mapPolygons: [
      {
        id: 'bukaksan-ridge-zone',
        name: 'Bukaksan Forest Ridge',
        type: 'park',
        coordinates: [
          { lat: 37.589, lng: 126.967 },
          { lat: 37.603, lng: 126.972 },
          { lat: 37.602, lng: 126.99 },
          { lat: 37.588, lng: 126.985 },
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
    throw new Error(
      'Not enough valid GPX track points (<trkpt> or <rtept>) found in file.'
    );
  }

  const maxPoints = 200;
  const stride = Math.max(1, Math.floor(ptNodes.length / maxPoints));
  const sampledNodes = ptNodes.filter(
    (_, idx) => idx % stride === 0 || idx === ptNodes.length - 1
  );

  const biomes: EnvironmentBiome[] = [
    'riverside',
    'park',
    'urban_pastel',
    'bridge',
    'mountain',
  ];

  const rawPoints: RawPointInput[] = sampledNodes.map((node, idx) => {
    const lat = parseFloat(node.getAttribute('lat') || '37.5114');
    const lng = parseFloat(node.getAttribute('lon') || '126.9955');
    const eleText = node.querySelector('ele')?.textContent;
    const ele = eleText ? parseFloat(eleText) : 15 + Math.sin(idx * 0.2) * 8;
    const timeText = node.querySelector('time')?.textContent;
    const timeMs = timeText ? Date.parse(timeText) : undefined;
    const biome =
      biomes[
        Math.floor((idx / sampledNodes.length) * biomes.length) % biomes.length
      ];
    return {
      lat: Number.isFinite(lat) ? lat : 37.5114,
      lng: Number.isFinite(lng) ? lng : 126.9955,
      ele: Number.isFinite(ele) ? ele : 15,
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
    subtitle: `Imported GPX Track (${sampledNodes.length} trackpoints mapped)`,
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
      category: `Elevation ${pt.ele.toFixed(0)}m Surroundings`,
      lat: pt.lat + (side === 'left' ? 0.0007 : -0.0007),
      lng: pt.lng + (side === 'left' ? -0.0007 : 0.0007),
      distKm: pt.distKm,
      side,
      offsetMeters: 25 + (i % 3) * 5,
      heightMeters: 30 + (i % 4) * 12,
      archStyle: style,
      primaryColor: colors[i % colors.length],
      accentColor: colors[(i + 2) % colors.length],
      description: `Procedural 3D pastel landmark synthesized from terrain and elevation (${pt.ele.toFixed(
        1
      )}m) at the ${pt.distKm.toFixed(2)}km mark.`,
    });
  }

  baseCourse.landmarks = generatedLandmarks;
  return baseCourse;
}

export function exportCourseToGpxXml(course: GpxCourseData): string {
  const trkpts = course.points
    .map(
      (pt) =>
        `      <trkpt lat="${pt.lat.toFixed(6)}" lon="${pt.lng.toFixed(6)}">\n        <ele>${pt.ele.toFixed(1)}</ele>\n        <time>${pt.timeIso}</time>\n      </trkpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Somteol Run 3D GPX World" xmlns="http://www.topografix.com/GPX/1/1">
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
