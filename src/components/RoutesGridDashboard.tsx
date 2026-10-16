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
import { Character3DThumbnail, FIVE_CHARACTERS } from './PaceRunnerScreens';

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
  courseRecords,
  lastCompletedSummary,
  onDismissCompletedSummary,
  onSelectAndLaunchCourse,
  onPreviewCourse,
  onChangeTheme,
  onChangeCharacter,
  onTriggerUploadGpx,
  onReturnTo3DWorld,
  onOpenHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort courses by newest first (most recently completed or newest added first)
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matching = courses.filter((c) => {
      return (
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.shortTitle.toLowerCase().includes(q) ||
        c.locationLabel.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.landmarks.some((lm) => lm.name.toLowerCase().includes(q))
      );
    });

    return [...matching].sort((a, b) => {
      const recA = courseRecords[a.id]?.lastCompletedAtIso
        ? Date.parse(courseRecords[a.id].lastCompletedAtIso)
        : 0;
      const recB = courseRecords[b.id]?.lastCompletedAtIso
        ? Date.parse(courseRecords[b.id].lastCompletedAtIso)
        : 0;
      if (recB !== recA) return recB - recA;

      const timeA = a.points[0]?.timeIso ? Date.parse(a.points[0].timeIso) : 0;
      const timeB = b.points[0]?.timeIso ? Date.parse(b.points[0].timeIso) : 0;
      if (timeB !== timeA) return timeB - timeA;

      return courses.indexOf(a) - courses.indexOf(b);
    });
  }, [courses, courseRecords, searchQuery]);

  return (
    <section
      id="screen-select"
      className="fixed inset-0 z-30 bg-[#ebd7f0] overflow-y-auto text-[#1E1B4B] select-none"
      style={{ backgroundColor: '#ebd7f0' }}
    >
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-20 space-y-7">
        {/* Top Bar with 'Run At Your pace' Brand + Search + Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand Title + Search Pill */}
          <div className="flex flex-wrap items-center gap-4 flex-1 min-w-[280px]">
            <button
              type="button"
              onClick={onOpenHome}
              title="Run At Your pace — Home"
              className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
            >
              <div
                className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center shadow-sm border border-white/60 bg-[#d1bcd6] group-hover:scale-105 transition-transform"
                style={{ backgroundColor: '#d1bcd6' }}
              >
                <Sparkles className="w-5 h-5 text-[#1E1B4B]" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold font-display tracking-tight text-[#1E1B4B] leading-tight">
                  Run At Your pace
                </div>
                <div className="text-[11px] text-[#4C3B63] font-medium">
                  The route you ran becomes the course
                </div>
              </div>
            </button>

            <div
              className="flex-1 min-w-[220px] max-w-md flex items-center gap-2.5 bg-[#d1bcd6] border border-white/60 rounded-full px-4 py-2.5 shadow-sm text-[#1E1B4B]"
              style={{ backgroundColor: '#d1bcd6' }}
            >
              <Search className="w-4 h-4 text-[#4C3B63] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search My Routes..."
                className="w-full bg-transparent text-sm text-[#1E1B4B] placeholder:text-[#4C3B63] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#4C3B63] hover:text-[#1E1B4B] font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Quick Actions: Import GPX & Return to Live 3D World (Stats removed) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onTriggerUploadGpx}
              className="px-4 py-3 rounded-full bg-[#d1bcd6] hover:bg-[#decce3] border border-white/60 text-xs font-bold text-[#1E1B4B] flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              style={{ backgroundColor: '#d1bcd6' }}
            >
              <Upload className="w-4 h-4 text-[#FF85B8]" />
              <span>Import .GPX</span>
            </button>

            <button
              type="button"
              onClick={onReturnTo3DWorld}
              className="px-5 py-3 rounded-full bg-[#d1bcd6] hover:bg-[#decce3] border border-white/60 text-[#1E1B4B] text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              style={{ backgroundColor: '#d1bcd6' }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start / Resume 3D Run</span>
            </button>
          </div>
        </div>

        {/* Celebratory Banner when Returning to Dashboard After Completing a Run */}
        {lastCompletedSummary && (
          <div
            className="relative rounded-3xl p-5 bg-[#d1bcd6] border-2 border-white/70 shadow-md flex flex-wrap items-center justify-between gap-4 text-[#1E1B4B]"
            style={{ backgroundColor: '#d1bcd6' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/50 border border-white/70 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-[#D97706]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4C3B63]">
                    Course Completed · Score Saved!
                  </span>
                  {lastCompletedSummary.isNewBest && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FACC15] text-[#070818] text-[10px] font-extrabold">
                      NEW BEST RECORD
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1E1B4B] mt-0.5">
                  {lastCompletedSummary.courseTitle}
                </h2>
                <p className="text-xs text-[#4C3B63] mt-0.5">
                  You finished the entire route at 1.3x speed and saved your coin score to the dashboard!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right font-mono-tabular bg-white/45 px-4 py-2.5 rounded-2xl border border-white/60">
                <div className="text-xs text-[#4C3B63]">Earned Coin Score</div>
                <div className="text-xl font-extrabold text-[#1E1B4B] flex items-center justify-end gap-1.5">
                  <Coins className="w-4 h-4 text-[#D97706]" />
                  <span>{lastCompletedSummary.score.toLocaleString()} PTS</span>
                </div>
                <div className="text-[11px] text-[#4C3B63]">
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
                className="px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-[#1E1B4B] text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Again</span>
              </button>

              <button
                type="button"
                onClick={onDismissCompletedSummary}
                className="p-2 rounded-full bg-white/40 hover:bg-white/70 text-[#4C3B63] hover:text-[#1E1B4B] transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Two-Column Layout: Left Settings Sidebar + Right Newest-First Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[265px_1fr] gap-7 items-start">
          {/* Left Settings Sidebar (Theme Switcher + Runner Style — Background #d1bcd6, Stats removed) */}
          <aside
            className="bg-[#d1bcd6] border border-white/60 rounded-3xl p-5 space-y-6 lg:sticky lg:top-6 shadow-md text-[#1E1B4B]"
            style={{ backgroundColor: '#d1bcd6' }}
          >
            {/* 1. Theme Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4C3B63] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E1B4B]" />
                  <span>Settings · Theme</span>
                </span>
              </div>
              <div className="space-y-2">
                {(Object.keys(ARTWORK_THEMES) as ArtworkThemeId[]).map((tId) => {
                  const tCfg = ARTWORK_THEMES[tId];
                  const active = themeId === tId;
                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => onChangeTheme(tId)}
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                        active
                          ? 'bg-white text-[#1E1B4B] font-bold border-white shadow-sm'
                          : 'bg-white/40 text-[#1E1B4B] border-white/50 hover:bg-white/65'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/15"
                          style={{
                            background: `linear-gradient(135deg, ${tCfg.treeFoliagePrimaryHex}, ${tCfg.groundPrimaryHex})`,
                          }}
                        />
                        <span className="truncate">{tCfg.nameEn}</span>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Runner Style Picker (Grid with Short Nicknames) */}
            <div className="pt-4 border-t border-white/40 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4C3B63] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF85B8]" />
                <span>Main Runner</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {FIVE_CHARACTERS.map((char) => {
                  const active = characterId === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => onChangeCharacter(char.id)}
                      className={`p-2 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-white border-white ring-2 ring-white/80 shadow-sm'
                          : 'bg-white/40 border-white/50 hover:bg-white/65'
                      }`}
                    >
                      <Character3DThumbnail char={char} size={42} />
                      <span className="text-[11px] font-extrabold text-[#1E1B4B] truncate">
                        {char.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Newest-First Routes Grid */}
          <div className="space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1B4B]/15">
              <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-[#1E1B4B]">
                My Routes
              </h2>
              <span className="text-xs font-mono-tabular font-semibold text-[#4C3B63]">
                Sorted by Newest · {filteredCourses.length} Routes
              </span>
            </div>

            {/* Squircle Pastel Aura Route Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
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
                        ? 'ring-3 ring-white shadow-[0_12px_35px_rgba(120,82,145,0.25)] -translate-y-1'
                        : 'hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(120,82,145,0.22)]'
                    }`}
                    style={{
                      background: `radial-gradient(circle at 50% 54%, ${course.cardAura.innerGlow} 0%, ${course.cardAura.outerBg} 74%)`,
                      boxShadow: `inset 0 1px 2px ${course.cardAura.rimHighlight}`,
                    }}
                  >
                    {/* Top Row: Active / Completed Score Badge (Report stats button removed, dark pill backgrounds -> #d1bcd6) */}
                    <div className="w-full flex items-center justify-between gap-2 z-10">
                      {record ? (
                        <span
                          className="px-2.5 py-1 rounded-full bg-[#d1bcd6] text-[11px] font-bold text-[#1E1B4B] flex items-center gap-1 border border-white/60 shadow-xs"
                          style={{ backgroundColor: '#d1bcd6' }}
                        >
                          <Trophy className="w-3 h-3 text-[#D97706]" />
                          <span>
                            Best {record.bestScore.toLocaleString()} PTS ·{' '}
                            {record.bestCoins} Coins
                          </span>
                        </span>
                      ) : isSelected ? (
                        <span
                          className="px-2.5 py-0.5 rounded-full bg-[#d1bcd6] text-[11px] font-semibold text-[#1E1B4B] flex items-center gap-1 border border-white/60 shadow-xs"
                          style={{ backgroundColor: '#d1bcd6' }}
                        >
                          <Check className="w-3 h-3 text-[#1E1B4B]" />
                          <span>Active Route</span>
                        </span>
                      ) : (
                        <span
                          className="px-2.5 py-0.5 rounded-full bg-[#d1bcd6] text-[11px] font-medium text-[#1E1B4B] border border-white/50"
                          style={{ backgroundColor: '#d1bcd6' }}
                        >
                          {course.totalDistanceKm.toFixed(1)} km · 1.3x
                        </span>
                      )}
                    </div>

                    {/* Top-Centered Editorial Title & Duration Subtitle */}
                    <div className="text-center mt-1 z-10">
                      <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight drop-shadow-sm">
                        {course.shortTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5">
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
                    <div className="w-full pt-2 border-t border-white/25 flex items-center justify-between gap-2 text-xs text-white/95 z-10">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{course.title}</div>
                        <div className="text-[11px] text-white/80 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{course.locationLabel}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {record ? (
                          <span
                            className="text-[11px] font-mono-tabular font-semibold bg-[#d1bcd6] text-[#1E1B4B] px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/60"
                            style={{ backgroundColor: '#d1bcd6' }}
                          >
                            <Award className="w-3 h-3" />
                            <span>{record.completedRuns}× Clear</span>
                          </span>
                        ) : (
                          <span
                            className="text-[11px] font-mono-tabular bg-[#d1bcd6] text-[#1E1B4B] px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/50"
                            style={{ backgroundColor: '#d1bcd6' }}
                          >
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
                          className="w-8 h-8 rounded-full bg-white text-[#1E1B4B] flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Upload Custom GPX Squircle Card (Dark background -> #d1bcd6) */}
              <button
                type="button"
                onClick={onTriggerUploadGpx}
                className="group relative rounded-[38px] p-6 flex flex-col items-center justify-center gap-4 min-h-[355px] border-2 border-dashed border-white/70 hover:border-[#FF85B8] bg-[#d1bcd6] hover:bg-[#decce3] transition-all duration-300 text-center cursor-pointer shadow-sm"
                style={{ backgroundColor: '#d1bcd6' }}
              >
                <div className="w-16 h-16 rounded-3xl bg-white/50 group-hover:bg-white/80 flex items-center justify-center transition-colors">
                  <Upload className="w-7 h-7 text-[#FF85B8]" />
                </div>
                <div className="space-y-1 max-w-[220px]">
                  <h3 className="text-lg font-bold text-[#1E1B4B]">
                    Import Your GPX
                  </h3>
                  <p className="text-xs text-[#4C3B63] leading-relaxed">
                    Drop any Strava, Garmin, Nike Run Club, or Apple Watch .GPX file
                    to generate a flat, non-overlapping 3-lane world.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full bg-white/75 group-hover:bg-white text-xs font-bold text-[#1E1B4B] transition-colors shadow-xs">
                  Choose .GPX File
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
