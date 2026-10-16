export type ArtworkThemeId = 'meadow' | 'cloud' | 'night_garden' | 'riverside';

export type CharacterModelId = 'flower_orb' | 'hoodie_kid' | 'topknot_kid';

export type CameraModeId =
  | 'chase'
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
  maxElevationM: number;
  minElevationM: number;
  elevationGainM: number;
  caloriesKcal: number;
  avgCadenceSpm: number;
  points: GpxTrackPoint[];
  splits: GpxKmSplit[];
  landmarks: SurroundingLandmark[];
  mapPolygons: WaterOrParkPolygon[];
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
