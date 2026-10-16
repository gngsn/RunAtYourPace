import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  Coins,
  Compass,
  MapPin,
  Mountain,
  Play,
  Search,
  Sparkles,
  Trophy,
  Upload,
  User,
} from 'lucide-react';
import {
  ArtworkThemeId,
  CharacterModelId,
  CourseCategory,
  GpxCourseData,
} from '../types/gpx';
import {
  ARTWORK_THEMES,
  formatDuration,
  formatPace,
} from '../utils/gpxParser';
import { GameStatsUpdate } from './PastelWorldCanvas';

interface RoutesGridDashboardProps {
  courses: GpxCourseData[];
  activeCourse: GpxCourseData;
  themeId: ArtworkThemeId;
  characterId: CharacterModelId;
  gameStats: GameStatsUpdate;
  onSelectAndLaunchCourse: (course: GpxCourseData) => void;
  onInspectCourseReport: (course: GpxCourseData) => void;
  onChangeTheme: (themeId: ArtworkThemeId) => void;
  onChangeCharacter: (charId: CharacterModelId) => void;
  onTriggerUploadGpx: () => void;
  onReturnTo3DWorld: () => void;
}

type FilterTabId = 'all' | CourseCategory;

const CHARACTER_OPTIONS: Array<{
  id: CharacterModelId;
  label: string;
  badgeColor: string;
}> = [
  { id: 'hoodie_kid', label: 'Felt Hat Runner', badgeColor: '#FDE68A' },
  { id: 'flower_orb', label: 'Flower Crown Sprite', badgeColor: '#FF85B8' },
  { id: 'topknot_kid', label: 'Cloud Twin-Bun', badgeColor: '#C4B5FD' },
];

/**
 * Renders the course's GPX path as a 3D-like translucent frosted-glass tubular sculpture
 * inspired directly by the reference image's floating 3D glass loops.
 */
const FrostedGpxTubeSculpture: React.FC<{
  course: GpxCourseData;
  isActive: boolean;
}> = ({ course, isActive }) => {
  const { smoothPathD, landmarkDots, startDot } = useMemo(() => {
    const pts = course.points;
    if (pts.length < 2) {
      return {
        smoothPathD: 'M 60 110 C 60 50, 160 50, 160 110 C 160 170, 60 170, 60 110 Z',
        landmarkDots: [],
        startDot: { x: 60, y: 110 },
      };
    }

    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const spanLat = Math.max(0.0005, maxLat - minLat);
    const spanLng = Math.max(0.0005, maxLng - minLng);

    // Sample ~28 points around the route and add a subtle 3D ribbon wave so every GPX track
    // looks like a sculptural 3D glass knot suspended inside the pastel squircle card
    const sampleCount = 28;
    const sampled: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.min(
        pts.length - 1,
        Math.floor((i / (sampleCount - 1)) * (pts.length - 1))
      );
      const pt = pts[idx];
      const nx = (pt.lng - minLng) / spanLng - 0.5;
      const ny = 0.5 - (pt.lat - minLat) / spanLat;
      const ribbonWave = (pt.ele - course.minElevationM) * 0.18;
      const angle = (i / sampleCount) * Math.PI * 4;
      const x = 110 + nx * 116 + Math.sin(angle) * 8;
      const y = 110 + ny * 108 + Math.cos(angle) * 6 - Math.min(10, ribbonWave);
      sampled.push({ x, y });
    }

    // Build smooth cubic Bezier / Catmull-Rom SVG path
    let d = `M ${sampled[0].x.toFixed(1)} ${sampled[0].y.toFixed(1)}`;
    for (let i = 0; i < sampled.length - 1; i++) {
      const p0 = sampled[Math.max(0, i - 1)];
      const p1 = sampled[i];
      const p2 = sampled[i + 1];
      const p3 = sampled[Math.min(sampled.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(
        1
      )} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const lmDots = course.landmarks.map((lm, idx) => {
      const sIdx = Math.min(
        sampled.length - 1,
        Math.floor(
          (lm.distKm / Math.max(0.1, course.totalDistanceKm)) *
            (sampled.length - 1)
        )
      );
      return {
        id: lm.id,
        x: sampled[sIdx].x,
        y: sampled[sIdx].y,
        r: 4.5 + (idx % 2) * 1.8,
      };
    });

    return {
      smoothPathD: d,
      landmarkDots: lmDots,
      startDot: sampled[0],
    };
  }, [course]);

  const filterId = `frosted-glow-${course.id}`;
  const gradId = `frosted-tube-${course.id}`;

  return (
    <svg
      viewBox="0 0 220 220"
      className={`w-44 h-44 sm:w-48 sm:h-48 transition-transform duration-500 ${
        isActive ? 'scale-105' : 'group-hover:scale-105'
      }`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop
            offset="50%"
            stopColor={course.cardAura.tubeTint}
            stopOpacity="0.68"
          />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.88" />
        </linearGradient>
        <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="8"
            floodColor="#090D26"
            floodOpacity="0.28"
          />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* 1. Outer Soft Frosted Glass Tube Casing */}
        <path
          d={smoothPathD}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.46"
        />

        {/* 2. Translucent Inner Core */}
        <path
          d={smoothPathD}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.68"
        />

        {/* 3. Crisp Specular Rim Highlight (gives 3D blown-glass tube depth) */}
        <path
          d={smoothPathD}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.96"
        />

        {/* 4. Sculptural 3D Landmark Pearl Nodes along the GPX Tube */}
        {landmarkDots.map((dot) => (
          <g key={dot.id} transform={`translate(${dot.x}, ${dot.y})`}>
            <circle r={dot.r + 4} fill="#FFFFFF" fillOpacity="0.32" />
            <circle r={dot.r} fill="#FFFFFF" fillOpacity="0.92" />
          </g>
        ))}

        {/* 5. Start/Finish Luminous Node */}
        <g transform={`translate(${startDot.x}, ${startDot.y})`}>
          <circle r="9" fill="#FFFFFF" fillOpacity="0.45" />
          <circle r="5" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );
};

export const RoutesGridDashboard: React.FC<RoutesGridDashboardProps> = ({
  courses,
  activeCourse,
  themeId,
  characterId,
  gameStats,
  onSelectAndLaunchCourse,
  onInspectCourseReport,
  onChangeTheme,
  onChangeCharacter,
  onTriggerUploadGpx,
  onReturnTo3DWorld,
}) => {
  const [selectedTab, setSelectedTab] = useState<FilterTabId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryCounts = useMemo(() => {
    return {
      all: courses.length,
      waterfront: courses.filter((c) => c.category === 'waterfront').length,
      forest: courses.filter((c) => c.category === 'forest').length,
      elevation: courses.filter((c) => c.category === 'elevation').length,
      custom: courses.filter((c) => c.category === 'custom').length,
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesTab =
        selectedTab === 'all' ? true : c.category === selectedTab;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.shortTitle.toLowerCase().includes(q) ||
        c.locationLabel.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.landmarks.some((lm) => lm.name.toLowerCase().includes(q));
      return matchesTab && matchesQuery;
    });
  }, [courses, selectedTab, searchQuery]);

  const tabs: Array<{ id: FilterTabId; label: string; count: number }> = [
    { id: 'all', label: 'For You', count: categoryCounts.all },
    { id: 'waterfront', label: 'Waterfront', count: categoryCounts.waterfront },
    { id: 'forest', label: 'Forest & Park', count: categoryCounts.forest },
    { id: 'elevation', label: 'Night Climb', count: categoryCounts.elevation },
    ...(categoryCounts.custom > 0
      ? [{ id: 'custom' as FilterTabId, label: 'Custom GPX', count: categoryCounts.custom }]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-30 bg-[#050611]/95 backdrop-blur-xl overflow-y-auto text-white select-none">
      {/* Subtle Ambient Background Aura */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(122, 142, 245, 0.28), transparent 45%), radial-gradient(circle at 80% 75%, rgba(230, 138, 184, 0.22), transparent 50%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-20 space-y-8">
        {/* Top Pill Bar (Inspired directly by the reference image's top avatar + prompt bar + menu button) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search / Route Prompt Pill */}
          <div className="flex-1 min-w-[260px] max-w-xl flex items-center gap-3.5 bg-[#121428]/90 border border-white/12 rounded-full p-2 pr-4 shadow-2xl">
            {/* Glowing Felt Avatar Orb */}
            <div
              className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center shadow-inner border border-white/30"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #FF94C2, #5B8EF4 70%, #1E1B4B)',
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search GPX courses, parks, or landmarks..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Quick Actions: Upload GPX & Return to Live 3D World */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onTriggerUploadGpx}
              className="px-4 py-3 rounded-full bg-[#151832] hover:bg-[#1E2246] border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <Upload className="w-4 h-4 text-[#FF85B8]" />
              <span>Import .GPX</span>
            </button>

            <button
              type="button"
              onClick={onReturnTo3DWorld}
              className="px-5 py-3 rounded-full bg-[#76FFB2] hover:bg-[#93ffbe] text-[#070818] text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume 3D Run</span>
            </button>
          </div>
        </div>

        {/* Runner Customization & Session Telemetry Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#101226]/80 border border-white/10 rounded-3xl px-5 py-3.5">
          {/* Character Style Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-1">
              <User className="w-3.5 h-3.5 text-[#FF85B8]" />
              <span>Runner Style:</span>
            </span>
            {CHARACTER_OPTIONS.map((char) => {
              const active = characterId === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => onChangeCharacter(char.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-[#070818] font-semibold shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: char.badgeColor }}
                  />
                  <span>{char.label}</span>
                </button>
              );
            })}
          </div>

          {/* World Atmosphere Theme Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Atmosphere:</span>
            {(Object.keys(ARTWORK_THEMES) as ArtworkThemeId[]).map((tId) => {
              const tCfg = ARTWORK_THEMES[tId];
              const active = themeId === tId;
              return (
                <button
                  key={tId}
                  type="button"
                  onClick={() => onChangeTheme(tId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-[#070818] font-semibold shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tCfg.treeFoliagePrimaryHex }}
                  />
                  <span>{tCfg.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Current Session Coins & Best Combo */}
          <div className="flex items-center gap-3 text-xs font-mono-tabular">
            <span className="flex items-center gap-1 text-[#FACC15] font-bold">
              <Coins className="w-3.5 h-3.5" />
              {gameStats.coins} Coins
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-[#76FFB2] font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              Best {gameStats.maxCombo}x
            </span>
          </div>
        </div>

        {/* Category Filter Tabs with Superscript Numbers (Exact Editorial Match to Reference Image) */}
        <div className="flex items-baseline gap-7 sm:gap-9 overflow-x-auto pb-1 border-b border-white/10">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`pb-3 transition-colors whitespace-nowrap flex items-start gap-1 border-b-2 ${
                  isActive
                    ? 'text-white font-semibold border-white'
                    : 'text-slate-500 hover:text-slate-300 font-normal border-transparent'
                }`}
              >
                <span className="text-2xl sm:text-[26px] tracking-tight font-display">
                  {tab.label}
                </span>
                <sup className="text-xs font-mono-tabular mt-1 opacity-80">
                  {tab.count}
                </sup>
              </button>
            );
          })}
        </div>

        {/* Squircle Pastel Aura Route Cards Grid (2 Columns on Mobile/Tablet, 3 Columns on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredCourses.map((course) => {
            const isSelected = course.id === activeCourse.id;
            const durationMins = Math.max(
              1,
              Math.round(course.totalDurationSeconds / 60)
            );

            return (
              <div
                key={course.id}
                onClick={() => onSelectAndLaunchCourse(course)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAndLaunchCourse(course);
                  }
                }}
                className={`group relative rounded-[38px] p-6 flex flex-col items-center justify-between min-h-[340px] cursor-pointer transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'ring-3 ring-white shadow-[0_0_45px_rgba(255,255,255,0.22)] -translate-y-1'
                    : 'hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                }`}
                style={{
                  background: `radial-gradient(circle at 50% 54%, ${course.cardAura.innerGlow} 0%, ${course.cardAura.outerBg} 74%)`,
                  boxShadow: `inset 0 1px 2px ${course.cardAura.rimHighlight}, inset 0 -10px 28px rgba(15, 23, 42, 0.18)`,
                }}
              >
                {/* Active Selection Badge & Report Quick Action */}
                <div className="w-full flex items-center justify-between z-10">
                  {isSelected ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1 border border-white/30">
                      <Check className="w-3 h-3 text-[#76FFB2]" />
                      <span>Active Route</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-medium text-white/90">
                      {course.totalDistanceKm.toFixed(1)} km
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectCourseReport(course);
                    }}
                    className="p-2 rounded-full bg-black/20 hover:bg-black/35 text-white/90 hover:text-white transition-colors backdrop-blur-md"
                    title="Inspect 1km Splits & 3D Landmarks"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Top-Centered Editorial Title & Duration Subtitle (Exact Reference Layout) */}
                <div className="text-center mt-1 z-10">
                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight drop-shadow-sm">
                    {course.shortTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-medium mt-0.5">
                    {durationMins} min · {formatPace(course.avgPaceMinPerKm)}/km
                  </p>
                </div>

                {/* Centerpiece: 3D Frosted Glass Tubular GPX Route Sculpture */}
                <div className="my-1 flex items-center justify-center z-10">
                  <FrostedGpxTubeSculpture
                    course={course}
                    isActive={isSelected}
                  />
                </div>

                {/* Bottom Subtle Course Location & Elevation Footer */}
                <div className="w-full pt-2 border-t border-white/20 flex items-center justify-between gap-2 text-xs text-white/95 z-10">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{course.title}</div>
                    <div className="text-[11px] text-white/75 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{course.locationLabel}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-mono-tabular bg-black/20 px-2 py-1 rounded-full flex items-center gap-1">
                      <Mountain className="w-3 h-3" />+{course.elevationGainM}m
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white text-[#0B0C22] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Upload Custom GPX Squircle Card */}
          <button
            type="button"
            onClick={onTriggerUploadGpx}
            className="group relative rounded-[38px] p-6 flex flex-col items-center justify-center gap-4 min-h-[340px] border-2 border-dashed border-white/20 hover:border-[#FF85B8] bg-[#10132A]/60 hover:bg-[#151936]/80 transition-all duration-300 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/10 group-hover:bg-[#FF85B8]/20 flex items-center justify-center transition-colors">
              <Upload className="w-7 h-7 text-[#FF85B8]" />
            </div>
            <div className="space-y-1 max-w-[220px]">
              <h3 className="text-lg font-semibold text-white">
                Import Your GPX
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Drop any Strava, Garmin, Nike Run Club, or Apple Watch .GPX file
                to generate a 3-lane pastel world.
              </p>
            </div>
            <span className="px-4 py-2 rounded-full bg-white/10 group-hover:bg-white text-xs font-semibold text-white group-hover:text-[#0B0C22] transition-colors">
              Choose .GPX File
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
