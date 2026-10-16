import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  Check,
  Coins,
  Layers,
  MapPin,
  Play,
  Search,
  Sparkles,
  Trophy,
  Upload,
  User,
  X,
} from 'lucide-react';
import {
  ArtworkThemeId,
  CharacterModelId,
  CourseCategory,
  CourseRunRecord,
  GpxCourseData,
} from '../types/gpx';
import { ARTWORK_THEMES, formatPace } from '../utils/gpxParser';
import { GameStatsUpdate, POINTS_PER_COIN } from './PastelWorldCanvas';

export interface CompletedRunSummary {
  courseId: string;
  courseTitle: string;
  coins: number;
  totalCoins: number;
  score: number;
  bestScore: number;
  completedRuns: number;
  isNewBest: boolean;
}

interface RoutesGridDashboardProps {
  courses: GpxCourseData[];
  activeCourse: GpxCourseData;
  themeId: ArtworkThemeId;
  characterId: CharacterModelId;
  gameStats: GameStatsUpdate;
  courseRecords: Record<string, CourseRunRecord>;
  lastCompletedSummary: CompletedRunSummary | null;
  onDismissCompletedSummary: () => void;
  onSelectAndLaunchCourse: (course: GpxCourseData) => void;
  onPreviewCourse?: (course: GpxCourseData) => void;
  onInspectCourseReport: (course: GpxCourseData) => void;
  onChangeTheme: (themeId: ArtworkThemeId) => void;
  onChangeCharacter: (charId: CharacterModelId) => void;
  onTriggerUploadGpx: () => void;
  onReturnTo3DWorld: () => void;
  onOpenStats?: () => void;
  onOpenHome?: () => void;
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
  { id: 'mint_sprinter', label: 'Mint Sprinter', badgeColor: '#6EE7B7' },
  { id: 'starlight_fox', label: 'Starlight Fox', badgeColor: '#FB923C' },
];

/**
 * Renders the course's flat, 100% non-overlapping 2D GPX path as a 3D-like translucent
 * frosted-glass tubular sculpture suspended inside the pastel squircle card.
 */
const FrostedGpxTubeSculpture: React.FC<{
  course: GpxCourseData;
  isActive: boolean;
}> = ({ course, isActive }) => {
  const { smoothPathD, landmarkDots, startDot, endDot } = useMemo(() => {
    const pts = course.points;
    if (pts.length < 2) {
      return {
        smoothPathD: 'M 45 145 C 80 65, 140 65, 175 145',
        landmarkDots: [],
        startDot: { x: 45, y: 145 },
        endDot: { x: 175, y: 145 },
      };
    }

    const xs = pts.map((p) => p.worldX);
    const zs = pts.map((p) => p.worldZ);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const spanX = Math.max(1, maxX - minX);
    const spanZ = Math.max(1, maxZ - minZ);
    const uniformSpan = Math.max(spanX, spanZ);

    const sampleCount = 32;
    const sampled: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.min(
        pts.length - 1,
        Math.floor((i / (sampleCount - 1)) * (pts.length - 1))
      );
      const pt = pts[idx];
      const nx = (pt.worldX - (minX + maxX) * 0.5) / uniformSpan;
      const ny = (pt.worldZ - (minZ + maxZ) * 0.5) / uniformSpan;
      const x = 110 + nx * 136;
      const y = 110 + ny * 136;
      sampled.push({ x, y });
    }

    // Build smooth cubic Bezier / Catmull-Rom SVG path from the non-overlapping 2D points
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
        r: 4.2 + (idx % 2) * 1.5,
      };
    });

    return {
      smoothPathD: d,
      landmarkDots: lmDots,
      startDot: sampled[0],
      endDot: sampled[sampled.length - 1],
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
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.46"
        />

        {/* 2. Translucent Inner Core */}
        <path
          d={smoothPathD}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />

        {/* 3. Crisp Specular Rim Highlight (3D blown-glass tube depth) */}
        <path
          d={smoothPathD}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.96"
        />

        {/* 4. Sculptural 3D Landmark Pearl Nodes along the GPX Tube */}
        {landmarkDots.map((dot) => (
          <g key={dot.id} transform={`translate(${dot.x}, ${dot.y})`}>
            <circle r={dot.r + 3.5} fill="#FFFFFF" fillOpacity="0.32" />
            <circle r={dot.r} fill="#FFFFFF" fillOpacity="0.92" />
          </g>
        ))}

        {/* 5. Start Luminous Pearl Node */}
        <g transform={`translate(${startDot.x}, ${startDot.y})`}>
          <circle r="8.5" fill="#FFFFFF" fillOpacity="0.45" />
          <circle r="4.8" fill="#FFFFFF" />
        </g>

        {/* 6. Finish Golden Coin Node */}
        <g transform={`translate(${endDot.x}, ${endDot.y})`}>
          <circle r="9.5" fill="#FACC15" fillOpacity="0.45" />
          <circle r="5.5" fill="#FACC15" stroke="#FFFFFF" strokeWidth="1.5" />
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
  courseRecords,
  lastCompletedSummary,
  onDismissCompletedSummary,
  onSelectAndLaunchCourse,
  onPreviewCourse,
  onInspectCourseReport,
  onChangeTheme,
  onChangeCharacter,
  onTriggerUploadGpx,
  onReturnTo3DWorld,
  onOpenStats,
  onOpenHome,
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

  const totalSavedStats = useMemo(() => {
    const records = Object.values(courseRecords);
    const totalBestScore = records.reduce((acc, r) => acc + r.bestScore, 0);
    const totalBestCoins = records.reduce((acc, r) => acc + r.bestCoins, 0);
    const totalRuns = records.reduce((acc, r) => acc + r.completedRuns, 0);
    return {
      totalBestScore,
      totalBestCoins,
      totalRuns,
      completedCoursesCount: records.length,
    };
  }, [courseRecords]);

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
    { id: 'elevation', label: 'Night Run', count: categoryCounts.elevation },
    ...(categoryCounts.custom > 0
      ? [
          {
            id: 'custom' as FilterTabId,
            label: 'Custom GPX',
            count: categoryCounts.custom,
          },
        ]
      : []),
  ];

  return (
    <section
      id="screen-select"
      className="fixed inset-0 z-30 bg-[#050611]/92 backdrop-blur-xl overflow-y-auto text-white select-none"
    >
      {/* Subtle Ambient Background Aura */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(122, 142, 245, 0.28), transparent 45%), radial-gradient(circle at 80% 75%, rgba(230, 138, 184, 0.22), transparent 50%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-20 space-y-7">
        {/* Top Pill Bar (Inspired directly by the reference image's top avatar + prompt bar + menu button) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search / Route Prompt Pill */}
          <div className="flex-1 min-w-[260px] max-w-xl flex items-center gap-3.5 bg-[#121428]/90 border border-white/12 rounded-full p-2 pr-4 shadow-2xl">
            {/* Glowing Felt Avatar Orb (Click to return to Home Screen) */}
            <button
              type="button"
              onClick={onOpenHome}
              title="Pace Runner Home"
              className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center shadow-inner border border-white/30 cursor-pointer hover:scale-105 transition-transform"
              style={{
                background:
                  'radial-gradient(circle at 35% 30%, #FF94C2, #5B8EF4 70%, #1E1B4B)',
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search My Routes (non-overlapping 3-lane GPX courses)..."
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

          {/* Right Quick Actions: My Stats, Import GPX & Return to Live 3D World */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenStats && (
              <button
                type="button"
                onClick={onOpenStats}
                className="px-4 py-3 rounded-full bg-[#151832] hover:bg-[#1E2246] border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-[#FACC15]" />
                <span>My Stats</span>
              </button>
            )}

            <button
              type="button"
              onClick={onTriggerUploadGpx}
              className="px-4 py-3 rounded-full bg-[#151832] hover:bg-[#1E2246] border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#FF85B8]" />
              <span>Import .GPX</span>
            </button>

            <button
              type="button"
              onClick={onReturnTo3DWorld}
              className="px-5 py-3 rounded-full bg-[#76FFB2] hover:bg-[#93ffbe] text-[#070818] text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start / Resume 3D Run</span>
            </button>
          </div>
        </div>

        {/* Celebratory Banner when Returning to Dashboard After Completing a Run */}
        {lastCompletedSummary && (
          <div className="relative rounded-3xl p-5 bg-gradient-to-r from-[#1A1D42] via-[#231B49] to-[#16273E] border-2 border-[#FACC15]/70 shadow-[0_0_40px_rgba(250,204,21,0.22)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/20 border border-[#FACC15]/50 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-[#FACC15]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#76FFB2]">
                    Course Completed · Score Saved!
                  </span>
                  {lastCompletedSummary.isNewBest && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FACC15] text-[#070818] text-[10px] font-extrabold">
                      NEW BEST RECORD
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {lastCompletedSummary.courseTitle}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  You finished the entire route at 2.0x speed and saved your coin score to the dashboard!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right font-mono-tabular bg-black/30 px-4 py-2.5 rounded-2xl border border-white/10">
                <div className="text-xs text-slate-300">Earned Coin Score</div>
                <div className="text-xl font-extrabold text-[#FACC15] flex items-center justify-end gap-1.5">
                  <Coins className="w-4 h-4" />
                  <span>{lastCompletedSummary.score.toLocaleString()} PTS</span>
                </div>
                <div className="text-[11px] text-[#76FFB2]">
                  {lastCompletedSummary.coins}
                  {lastCompletedSummary.totalCoins > 0
                    ? ` / ${lastCompletedSummary.totalCoins}`
                    : ''}{' '}
                  Coins Collected (1 Coin = {POINTS_PER_COIN} PTS)
                </div>
              </div>

              <button
                type="button"
                onClick={onReturnTo3DWorld}
                className="px-4 py-2.5 rounded-2xl bg-[#76FFB2] hover:bg-[#93ffbe] text-[#070818] text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Again</span>
              </button>

              <button
                type="button"
                onClick={onDismissCompletedSummary}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Runner Customization & Saved Coin Score Telemetry Strip */}
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

          {/* Saved Total Score & Coins Across Completed Runs */}
          <div className="flex items-center gap-3 text-xs font-mono-tabular">
            <span className="flex items-center gap-1 text-[#FACC15] font-bold">
              <Coins className="w-3.5 h-3.5" />
              {totalSavedStats.totalBestCoins > 0
                ? `${totalSavedStats.totalBestCoins} Saved Coins`
                : `${gameStats.coins} Coins`}
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-[#76FFB2] font-bold">
              <Trophy className="w-3.5 h-3.5" />
              {totalSavedStats.totalBestScore > 0
                ? `${totalSavedStats.totalBestScore.toLocaleString()} Total PTS`
                : `${gameStats.score.toLocaleString()} PTS`}
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
            const record = courseRecords[course.id];
            const durationMins = Math.max(
              1,
              Math.round(course.totalDurationSeconds / 60)
            );

            return (
              <div
                key={course.id}
                onClick={() =>
                  onPreviewCourse
                    ? onPreviewCourse(course)
                    : onSelectAndLaunchCourse(course)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onPreviewCourse) {
                      onPreviewCourse(course);
                    } else {
                      onSelectAndLaunchCourse(course);
                    }
                  }
                }}
                className={`group relative rounded-[38px] p-6 flex flex-col items-center justify-between min-h-[355px] cursor-pointer transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'ring-3 ring-white shadow-[0_0_45px_rgba(255,255,255,0.22)] -translate-y-1'
                    : 'hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
                }`}
                style={{
                  background: `radial-gradient(circle at 50% 54%, ${course.cardAura.innerGlow} 0%, ${course.cardAura.outerBg} 74%)`,
                  boxShadow: `inset 0 1px 2px ${course.cardAura.rimHighlight}, inset 0 -10px 28px rgba(15, 23, 42, 0.18)`,
                }}
              >
                {/* Top Row: Active / Completed Score Badge & Report Quick Action */}
                <div className="w-full flex items-center justify-between gap-2 z-10">
                  {record ? (
                    <span className="px-2.5 py-1 rounded-full bg-black/35 backdrop-blur-md text-[11px] font-bold text-[#FACC15] flex items-center gap-1 border border-[#FACC15]/40">
                      <Trophy className="w-3 h-3 text-[#FACC15]" />
                      <span>
                        Best {record.bestScore.toLocaleString()} PTS ·{' '}
                        {record.bestCoins} Coins
                      </span>
                    </span>
                  ) : isSelected ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-md text-[11px] font-semibold text-white flex items-center gap-1 border border-white/30">
                      <Check className="w-3 h-3 text-[#76FFB2]" />
                      <span>Active Route</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-medium text-white/95">
                      {course.totalDistanceKm.toFixed(1)} km · 2.0x
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

                {/* Top-Centered Editorial Title & Duration Subtitle */}
                <div className="text-center mt-1 z-10">
                  <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight drop-shadow-sm">
                    {course.shortTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/85 font-medium mt-0.5">
                    {durationMins} min · {formatPace(course.avgPaceMinPerKm)}/km · 3 Lanes
                  </p>
                </div>

                {/* Centerpiece: 3D Frosted Glass Tubular Non-Overlapping GPX Route Sculpture */}
                <div className="my-1 flex items-center justify-center z-10">
                  <FrostedGpxTubeSculpture
                    course={course}
                    isActive={isSelected}
                  />
                </div>

                {/* Bottom Subtle Course Location & Saved Coin Record Footer */}
                <div className="w-full pt-2 border-t border-white/20 flex items-center justify-between gap-2 text-xs text-white/95 z-10">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{course.title}</div>
                    <div className="text-[11px] text-white/75 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{course.locationLabel}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {record ? (
                      <span className="text-[11px] font-mono-tabular font-semibold bg-black/30 text-[#76FFB2] px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#76FFB2]/30">
                        <Award className="w-3 h-3" />
                        <span>{record.completedRuns}× Clear</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono-tabular bg-black/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>Flat 0m</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAndLaunchCourse(course);
                      }}
                      title="Quick Launch 3D Run"
                      className="w-8 h-8 rounded-full bg-white text-[#0B0C22] flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Upload Custom GPX Squircle Card */}
          <button
            type="button"
            onClick={onTriggerUploadGpx}
            className="group relative rounded-[38px] p-6 flex flex-col items-center justify-center gap-4 min-h-[355px] border-2 border-dashed border-white/20 hover:border-[#FF85B8] bg-[#10132A]/60 hover:bg-[#151936]/80 transition-all duration-300 text-center"
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
                to generate a flat, non-overlapping 3-lane world.
              </p>
            </div>
            <span className="px-4 py-2 rounded-full bg-white/10 group-hover:bg-white text-xs font-semibold text-white group-hover:text-[#0B0C22] transition-colors">
              Choose .GPX File
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
