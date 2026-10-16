export type ArtworkThemeId = 'meadow' | 'cloud' | 'night_garden' | 'riverside';

export type CharacterModelId =
  | 'hoodie_kid'
  | 'flower_orb'
  | 'topknot_kid'
  | 'mint_sprinter'
  | 'starlight_fox';

export type ScreenId =
  | 'home'
  | 'select'
  | 'stats'
  | 'preview'
  | 'character'
  | 'play'
  | 'result'
  | 'over';

export type CameraModeId =
  | 'portrait'
  | 'portrait_char_select'
  | 'overview'
  | 'chase'
  | 'finish'
  | 'front'
  | 'side'
  | 'aerial'
  | 'first_person';

export type EnvironmentBiome =
  | 'riverside'
  | 'park'
  | 'urban_pastel'
  | 'bridge'
  | 'mountain';

export type CourseCategory = 'waterfront' | 'forest' | 'elevation' | 'custom';

export type BuildingArchStyle =
  | 'pastel_tower'
  | 'dome_pavilion'
  | 'observation_spire'
  | 'bridge_arch'
  | 'atelier_brick'
  | 'floating_lotus';

export type PaceBucketId = 0 | 1 | 2 | 3;

export interface PaceBucketSpec {
  bucket: PaceBucketId;
  label: 'Fast' | 'Steady' | 'Slow' | 'Very slow';
  color: string;
  speedCap: number;
}

export const PACE_BUCKETS: Record<PaceBucketId, PaceBucketSpec> = {
  0: { bucket: 0, label: 'Fast', color: '#3fc39a', speedCap: 1.0 },
  1: { bucket: 1, label: 'Steady', color: '#f5d04f', speedCap: 0.85 },
  2: { bucket: 2, label: 'Slow', color: '#f5a04f', speedCap: 0.7 },
  3: { bucket: 3, label: 'Very slow', color: '#ee6767', speedCap: 0.55 },
};

export interface CourseTurboPad {
  id: number;
  s: number; // 0..gameLength
  t: number; // 0..1
  lateral: number; // lateral offset within ±(ROAD_HALF - 1.6 - 0.3)
  bucket: PaceBucketId;
}

export interface CourseCoinPlacement {
  id: number;
  rowId: number;
  s: number; // 0..gameLength
  t: number; // 0..1
  lateral: number; // lateral offset within ±(ROAD_HALF - 1.1)
  shape: 'straight' | 'diagonal' | 'arc';
}

export interface CourseEnergyGel {
  id: number;
  realMeters: number; // 5000, 10000, ...
  s: number; // 0..gameLength
  t: number; // 0..1
  lateral: 0;
}

export interface SurroundingLandmark {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  lat: number;
  lng: number;
  distKm: number;
  side: 'left' | 'right';
  offsetMeters: number;
  heightMeters: number;
  archStyle: BuildingArchStyle;
  primaryColor: string;
  accentColor: string;
  description: string;
}

export interface GpxTrackPoint {
  index: number;
  lat: number;
  lng: number;
  ele: number;
  timeIso: string;
  elapsedSeconds: number;
  distKm: number;
  paceMinPerKm: number;
  speedKmh: number;
  gradePercent: number;
  biome: EnvironmentBiome;
  worldX: number;
  worldY: number;
  worldZ: number;
  s: number; // Game arc-length distance 0..gameLength
  paceBucket: PaceBucketId; // 0=Fast, 1=Steady, 2=Slow, 3=Very slow (±8-sample majority smoothed)
  bucketColor: string;
  speedCap: number; // 1.0 | 0.85 | 0.7 | 0.55
  curvature: number; // Signed curvature k = cross(t_i, t_{i+1})/ds averaged over ±5 samples
  isOverpass?: boolean;
}

export interface GpxKmSplit {
  km: number;
  distanceKm: number;
  durationSeconds: number;
  paceMinPerKm: number;
  elevationGainM: number;
  elevationLossM: number;
  avgGradePercent: number;
  startDistKm: number;
}

export interface WaterOrParkPolygon {
  id: string;
  name: string;
  type: 'water' | 'park' | 'urban_zone';
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface CardAuraPalette {
  outerBg: string;
  innerGlow: string;
  rimHighlight: string;
  tubeTint: string;
}

export interface GpxCourseData {
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  locationLabel: string;
  category: CourseCategory;
  recommendedTheme: ArtworkThemeId;
  cardAura: CardAuraPalette;
  totalDistanceKm: number;
  totalDurationSeconds: number;
  avgPaceMinPerKm: number;
  minPaceMinPerKm: number;
  maxPaceMinPerKm: number;
  gameLength: number; // clamp(km*400 + 400, 1400, 3200)
  maxElevationM: number;
  minElevationM: number;
  elevationGainM: number;
  caloriesKcal: number;
  avgCadenceSpm: number;
  points: GpxTrackPoint[]; // N = 1200 evenly spaced samples
  splits: GpxKmSplit[];
  landmarks: SurroundingLandmark[];
  mapPolygons: WaterOrParkPolygon[];
  turboPads: CourseTurboPad[];
  coins: CourseCoinPlacement[];
  energyGels: CourseEnergyGel[];
  paceMixRatios: Record<PaceBucketId, number>;
  paceBucketRanges: Record<PaceBucketId, { minPace: number; maxPace: number }>;
}

export interface CourseRunRecord {
  courseId: string;
  bestScore: number;
  bestCoins: number;
  lastScore: number;
  lastCoins: number;
  totalCoinsAvailable: number;
  bestTimeSeconds: number;
  lastTimeSeconds: number;
  vsPastYouDeltaSeconds: number;
  completedRuns: number;
  lastCompletedAtIso: string;
}

export interface ArtworkThemeConfig {
  id: ArtworkThemeId;
  nameKo: string;
  nameEn: string;
  inspirationLabel: string;
  skyTopHex: string;
  skyHorizonHex: string;
  fogHex: string;
  groundPrimaryHex: string;
  groundSecondaryHex: string;
  trackColorHex: string;
  trackBorderHex: string;
  treeFoliagePrimaryHex: string;
  treeFoliageSecondaryHex: string;
  buildingPalette: string[];
  accentOrbHex: string;
  runnerSweaterHex: string;
  runnerPantsHex: string;
  runnerHatHex: string;
}
