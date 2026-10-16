import React from 'react';
import {
  ArrowLeft,
  Award,
  Check,
  Coins,
  Compass,
  Flame,
  Gauge,
  MapPin,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react';
import {
  CharacterModelId,
  CourseRunRecord,
  GpxCourseData,
} from '../types/gpx';
import { formatDuration, formatPace } from '../utils/gpxParser';
import { GameStatsUpdate, POINTS_PER_COIN } from './PastelWorldCanvas';

export interface CharacterMeta {
  id: CharacterModelId;
  name: string;
  role: string;
  perk: string;
  primaryHex: string;
  secondaryHex: string;
  hatHex: string;
}

export const FIVE_CHARACTERS: CharacterMeta[] = [
  {
    id: 'hoodie_kid',
    name: 'Felt Hat Runner',
    role: 'All-Rounder Pacer',
    perk: 'Balanced 3-lane stride & steady cadence',
    primaryHex: '#FEF08A',
    secondaryHex: '#93C5FD',
    hatHex: '#FDE047',
  },
  {
    id: 'flower_orb',
    name: 'Flower Crown Sprite',
    role: 'Meadow Glider',
    perk: 'Summons floating companion fish & smooth jumps',
    primaryHex: '#FBCFE8',
    secondaryHex: '#A7F3D0',
    hatHex: '#FF85B8',
  },
  {
    id: 'topknot_kid',
    name: 'Cloud Twin-Bun',
    role: 'Skyline Agile',
    perk: 'Quick lane-switch responsiveness across 3 lanes',
    primaryHex: '#DDD6FE',
    secondaryHex: '#FDE68A',
    hatHex: '#C4B5FD',
  },
  {
    id: 'mint_sprinter',
    name: 'Mint Aero Sprinter',
    role: 'Tempo Specialist',
    perk: 'Aero visor tuned for 2.0x locked speed runs',
    primaryHex: '#6EE7B7',
    secondaryHex: '#38BDF8',
    hatHex: '#34D399',
  },
  {
    id: 'starlight_fox',
    name: 'Starlight Fox',
    role: 'Night Trail Seeker',
    perk: 'Star crest highlights golden coin streaks',
    primaryHex: '#FED7AA',
    secondaryHex: '#C4B5FD',
    hatHex: '#FB923C',
  },
];

/**
 * 3D-shaded SVG Thumbnail for each of the 5 needle-felt characters
 */
export const Character3DThumbnail: React.FC<{
  char: CharacterMeta;
  size?: number;
}> = ({ char, size = 68 }) => {
  const gradId = `char-3d-${char.id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="shrink-0 drop-shadow-md"
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="45%" stopColor={char.primaryHex} stopOpacity="1" />
          <stop offset="100%" stopColor={char.secondaryHex} stopOpacity="0.95" />
        </radialGradient>
      </defs>
      {/* Background Aura Circle */}
      <circle
        cx="40"
        cy="40"
        r="36"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="2"
      />
      {/* Headgear */}
      {char.id === 'hoodie_kid' && (
        <g>
          <ellipse cx="40" cy="24" rx="22" ry="6" fill={char.hatHex} />
          <path
            d="M 24 24 C 24 10, 56 10, 56 24 Z"
            fill={char.hatHex}
          />
        </g>
      )}
      {char.id === 'flower_orb' && (
        <g>
          <circle cx="27" cy="20" r="6" fill="#FF85B8" />
          <circle cx="40" cy="16" r="7" fill="#FACC15" />
          <circle cx="53" cy="20" r="6" fill="#FF85B8" />
        </g>
      )}
      {char.id === 'topknot_kid' && (
        <g>
          <circle cx="24" cy="21" r="8" fill="#C4B5FD" />
          <circle cx="56" cy="21" r="8" fill="#C4B5FD" />
        </g>
      )}
      {char.id === 'mint_sprinter' && (
        <g>
          <rect x="21" y="20" width="38" height="7" rx="3.5" fill="#34D399" />
          <path d="M 22 25 Q 40 31 58 25" stroke="#FFFFFF" strokeWidth="3" fill="none" />
        </g>
      )}
      {char.id === 'starlight_fox' && (
        <g>
          <polygon points="22,28 27,11 35,24" fill="#FB923C" />
          <polygon points="58,28 53,11 45,24" fill="#FB923C" />
          <circle cx="40" cy="15" r="4.5" fill="#FACC15" />
        </g>
      )}
      {/* Felt Head */}
      <circle cx="40" cy="37" r="14" fill="#FFE4E1" />
      {/* Eyes & Blush */}
      <circle cx="34.5" cy="36" r="2.2" fill="#1E1B4B" />
      <circle cx="45.5" cy="36" r="2.2" fill="#1E1B4B" />
      <circle cx="30" cy="40" r="3" fill="#FF8DA1" opacity="0.65" />
      <circle cx="50" cy="40" r="3" fill="#FF8DA1" opacity="0.65" />
      {/* Sweater Torso */}
      <path
        d="M 25 68 C 25 51, 55 51, 55 68 Z"
        fill={char.primaryHex}
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
    </svg>
  );
};

/* ============================================================================
 * 1. HOME SCREEN (#screen-home | camera: portrait)
 * ========================================================================== */
export const HomeScreenOverlay: React.FC<{
  isLoadingRuns: boolean;
  totalSavedCoins: number;
  totalSavedScore: number;
  onClickMyRuns: () => void;
  onClickMyStats: () => void;
  onTriggerUploadGpx: () => void;
}> = ({
  isLoadingRuns,
  totalSavedCoins,
  totalSavedScore,
  onClickMyRuns,
  onClickMyStats,
  onTriggerUploadGpx,
}) => {
  return (
    <section
      id="screen-home"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-12 select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 bg-[#0B0C22]/85 backdrop-blur-md border border-white/15 rounded-full px-4 py-2">
          <Sparkles className="w-4 h-4 text-[#76FFB2]" />
          <span className="text-xs font-semibold text-white">
            3-Lane GPX Course World · 2.0x Speed
          </span>
          {totalSavedScore > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono-tabular font-bold text-[#FACC15] flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {totalSavedScore.toLocaleString()} PTS ({totalSavedCoins} Coins)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClickMyStats}
            className="px-4 py-2.5 rounded-full bg-[#11132E]/90 hover:bg-[#191C42] border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg"
          >
            <Trophy className="w-4 h-4 text-[#FACC15]" />
            <span>My Stats</span>
          </button>

          <button
            type="button"
            onClick={onTriggerUploadGpx}
            className="px-4 py-2.5 rounded-full bg-[#11132E]/90 hover:bg-[#191C42] border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-lg"
          >
            <Upload className="w-4 h-4 text-[#FF85B8]" />
            <span>Import .GPX</span>
          </button>
        </div>
      </div>

      {/* Left-aligned Hero Typography so the 3D Main Runner stands on the right on wide screens */}
      <div className="my-auto max-w-2xl space-y-6 pointer-events-auto">
        <div className="space-y-3">
          <h1
            className="font-display font-extrabold tracking-tight text-white leading-[0.94] drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
            style={{
              fontSize: 'clamp(3.2rem, min(13vw, 22vh), 8.5rem)',
            }}
          >
            Pace
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#76FFB2] via-[#FF85B8] to-[#FDE68A]">
              Runner
            </span>
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-slate-200 tracking-tight drop-shadow">
            The route you ran becomes the course.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 pt-2">
          <button
            type="button"
            onClick={onClickMyRuns}
            disabled={isLoadingRuns}
            className="px-8 py-4 rounded-full bg-[#76FFB2] hover:bg-[#93ffbe] active:scale-95 text-[#070818] text-base font-extrabold flex items-center gap-3 transition-all shadow-[0_0_35px_rgba(118,255,178,0.4)] cursor-pointer"
          >
            {isLoadingRuns ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-[#070818] border-t-transparent animate-spin" />
                <span>Loading Runs...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>My Runs</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClickMyStats}
            className="px-6 py-4 rounded-full bg-[#11132E]/90 hover:bg-[#1B1F48] border border-white/20 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-xl cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#FACC15]" />
            <span>My Stats</span>
          </button>
        </div>
      </div>

      {/* Bottom Subtle Feature Strip */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-[#0B0C22]/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 w-fit pointer-events-auto">
        <span className="text-[#76FFB2] font-semibold">3-Lane Course</span>
        <span>·</span>
        <span>Locked 2.0x Speed</span>
        <span>·</span>
        <span>Flat 0m Non-Overlapping Routes</span>
        <span>·</span>
        <span className="text-[#FACC15] font-semibold">
          1 Coin = {POINTS_PER_COIN} PTS Saved on Finish
        </span>
      </div>
    </section>
  );
};

/* ============================================================================
 * 2. MY STATS SCREEN (#screen-stats | camera: portrait)
 * ========================================================================== */
export const StatsScreenOverlay: React.FC<{
  courses: GpxCourseData[];
  courseRecords: Record<string, CourseRunRecord>;
  mainCharacterId: CharacterModelId;
  onSelectMainCharacter: (id: CharacterModelId) => void;
  onBack: () => void;
  onSelectCourseFromStats: (course: GpxCourseData) => void;
}> = ({
  courses,
  courseRecords,
  mainCharacterId,
  onSelectMainCharacter,
  onBack,
  onSelectCourseFromStats,
}) => {
  const recordsList = Object.values(courseRecords);
  const totalRuns = recordsList.reduce((s, r) => s + r.completedRuns, 0);
  const totalBestCoins = recordsList.reduce((s, r) => s + r.bestCoins, 0);
  const totalBestScore = recordsList.reduce((s, r) => s + r.bestScore, 0);
  const totalDistKm = courses.reduce((s, c) => {
    const runs = courseRecords[c.id]?.completedRuns || 0;
    return s + c.totalDistanceKm * runs;
  }, 0);

  return (
    <section
      id="screen-stats"
      className="fixed inset-0 z-30 bg-[#050611]/88 backdrop-blur-md overflow-y-auto p-6 sm:p-10 text-white select-none"
    >
      <div className="max-w-4xl mx-auto lg:mr-auto lg:ml-6 space-y-6 pb-16">
        {/* Header with ← Back button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
                My Stats
              </h1>
              <p className="text-xs text-slate-400">
                Main-runner picker, running summary, pace mix & saved course coin bests
              </p>
            </div>
          </div>
        </div>

        {/* 1. Main-Runner Picker */}
        <div className="bg-[#11132E]/95 border border-white/15 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF85B8]" />
              <span>Main Runner Picker (Shown in all menus & preselected for races)</span>
            </h2>
            <span className="text-xs text-[#76FFB2] font-semibold">
              Active Main: {FIVE_CHARACTERS.find((c) => c.id === mainCharacterId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {FIVE_CHARACTERS.map((char) => {
              const isMain = char.id === mainCharacterId;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => onSelectMainCharacter(char.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center gap-2 relative ${
                    isMain
                      ? 'bg-white/15 border-[#76FFB2] shadow-[0_0_20px_rgba(118,255,178,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isMain && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#76FFB2] text-[#070818] text-[10px] font-extrabold">
                      Main
                    </span>
                  )}
                  <Character3DThumbnail char={char} size={56} />
                  <div className="text-center">
                    <div className="text-xs font-bold text-white truncate">
                      {char.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {char.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Running Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#11132E]/95 border border-white/15 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Saved Coin Score</div>
            <div className="text-2xl font-extrabold font-mono-tabular text-[#FACC15] mt-1">
              {totalBestScore.toLocaleString()} PTS
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              1 Coin = {POINTS_PER_COIN} PTS
            </div>
          </div>

          <div className="bg-[#11132E]/95 border border-white/15 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Best Coins Collected</div>
            <div className="text-2xl font-extrabold font-mono-tabular text-[#76FFB2] mt-1">
              {totalBestCoins} Coins
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {recordsList.length} cleared routes
            </div>
          </div>

          <div className="bg-[#11132E]/95 border border-white/15 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Completed Runs</div>
            <div className="text-2xl font-extrabold font-mono-tabular text-white mt-1">
              {totalRuns} Runs
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              At locked 2.0x speed
            </div>
          </div>

          <div className="bg-[#11132E]/95 border border-white/15 rounded-2xl p-4">
            <div className="text-xs text-slate-400">Total Distance Logged</div>
            <div className="text-2xl font-extrabold font-mono-tabular text-[#FF85B8] mt-1">
              {totalDistKm.toFixed(1)} km
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Flat 0m non-overlapping
            </div>
          </div>
        </div>

        {/* 3. Pace Mix */}
        <div className="bg-[#11132E]/95 border border-white/15 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Pace Mix Breakdown</h2>
            <span className="text-xs text-slate-400 font-mono-tabular">
              4 Pace Zones Across {courses.length} Courses
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-black/40 border border-white/10">
            <div
              className="h-full bg-[#FF85B8]"
              style={{ width: '24%' }}
              title="Sprint (< 4'45&quot;/km): 24%"
            />
            <div
              className="h-full bg-[#76FFB2]"
              style={{ width: '38%' }}
              title="Fast (4'45&quot;–5'30&quot;/km): 38%"
            />
            <div
              className="h-full bg-[#67E8F9]"
              style={{ width: '26%' }}
              title="Steady (5'30&quot;–6'15&quot;/km): 26%"
            />
            <div
              className="h-full bg-[#FDE68A]"
              style={{ width: '12%' }}
              title="Easy (> 6'15&quot;/km): 12%"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF85B8]" />
              <span>Sprint (&lt;4&apos;45&quot;) · 24%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76FFB2]" />
              <span>Fast (4&apos;45&quot;–5&apos;30&quot;) · 38%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#67E8F9]" />
              <span>Steady (5&apos;30&quot;–6&apos;15&quot;) · 26%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDE68A]" />
              <span>Easy (&gt;6&apos;15&quot;) · 12%</span>
            </div>
          </div>
        </div>

        {/* 4. Course Bests */}
        <div className="bg-[#11132E]/95 border border-white/15 rounded-3xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FACC15]" />
            <span>Course Bests (Saved Coin Scores & Times)</span>
          </h2>

          <div className="divide-y divide-white/10">
            {courses.map((course) => {
              const rec = courseRecords[course.id];
              return (
                <div
                  key={course.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-bold text-white">
                      {course.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono-tabular">
                      {course.totalDistanceKm.toFixed(2)} km · Avg{' '}
                      {formatPace(course.avgPaceMinPerKm)}/km · {course.locationLabel}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {rec ? (
                      <div className="text-right font-mono-tabular">
                        <div className="text-sm font-extrabold text-[#FACC15]">
                          {rec.bestScore.toLocaleString()} PTS ({rec.bestCoins} Coins)
                        </div>
                        <div className="text-[11px] text-[#76FFB2]">
                          Best Time {formatDuration(rec.bestTimeSeconds)} ·{' '}
                          {rec.completedRuns}× Clear
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Not yet finished
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectCourseFromStats(course)}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#76FFB2] text-white hover:text-[#070818] text-xs font-bold transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
 * 3. COURSE PREVIEW SCREEN (#screen-preview | camera: overview)
 * ========================================================================== */
export const PreviewScreenOverlay: React.FC<{
  course: GpxCourseData;
  record?: CourseRunRecord;
  onBackToSelect: () => void;
  onRunThisCourse: () => void;
}> = ({ course, record, onBackToSelect, onRunThisCourse }) => {
  const pathPoints = React.useMemo(() => {
    const pts = course.points;
    const xs = pts.map((p) => p.worldX);
    const zs = pts.map((p) => p.worldZ);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);
    const span = Math.max(1, maxX - minX, maxZ - minZ);
    return pts
      .map((p) => {
        const x = 130 + ((p.worldX - (minX + maxX) * 0.5) / span) * 195;
        const y = 100 + ((p.worldZ - (minZ + maxZ) * 0.5) / span) * 150;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [course]);

  return (
    <section
      id="screen-preview"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={onBackToSelect}
          className="px-4 py-2.5 rounded-full bg-[#11132E]/90 hover:bg-[#1B1F46] border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Routes</span>
        </button>

        <div className="px-4 py-2 rounded-full bg-[#11132E]/90 border border-white/15 text-xs font-semibold text-[#76FFB2]">
          Overview Camera · 100% Non-Overlapping Flat 3-Lane Track
        </div>
      </div>

      {/* Preview Card Panel */}
      <div className="my-auto max-w-lg w-full bg-[#0E1028]/92 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 pointer-events-auto">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#FF85B8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{course.locationLabel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            {course.title}
          </h1>
          <p className="text-xs text-slate-300 mt-1">{course.subtitle}</p>
        </div>

        {/* Route Map Vector Preview */}
        <div className="relative h-44 rounded-2xl bg-[#070919] border border-white/10 overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 260 200" className="w-full h-full">
            <polyline
              fill="none"
              stroke="rgba(118,255,178,0.25)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pathPoints}
            />
            <polyline
              fill="none"
              stroke="#76FFB2"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pathPoints}
            />
          </svg>
          {record && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 border border-[#FACC15]/50 text-[11px] font-mono-tabular font-bold text-[#FACC15] flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>
                Best: {record.bestScore.toLocaleString()} PTS ({record.bestCoins} Coins)
              </span>
            </div>
          )}
        </div>

        {/* Distance / Real time / Avg pace */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400">Distance</div>
            <div className="text-lg font-extrabold font-mono-tabular text-white mt-0.5">
              {course.totalDistanceKm.toFixed(2)} km
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400">Real Time</div>
            <div className="text-lg font-extrabold font-mono-tabular text-[#76FFB2] mt-0.5">
              {formatDuration(course.totalDurationSeconds)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400">Avg Pace</div>
            <div className="text-lg font-extrabold font-mono-tabular text-[#FF85B8] mt-0.5">
              {formatPace(course.avgPaceMinPerKm)}/km
            </div>
          </div>
        </div>

        {/* Pace Legend with Ranges */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300">
            Pace Legend & Ranges
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-tabular">
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF85B8]" />
              <span>&lt;4&apos;45&quot; Sprint</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76FFB2]" />
              <span>4&apos;45&quot;–5&apos;30&quot;</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#67E8F9]" />
              <span>5&apos;30&quot;–6&apos;15&quot;</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDE68A]" />
              <span>&gt;6&apos;15&quot; Easy</span>
            </div>
          </div>
        </div>

        {/* How-To Hint */}
        <div className="p-3.5 rounded-2xl bg-[#16193A] border border-white/10 text-xs text-slate-200 space-y-1">
          <div className="font-bold text-[#FACC15] flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" />
            <span>How to Play (2.0x Locked Speed · 3-Lane Coin Rush)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Switch across <strong>3 Lanes</strong> with <strong>A / D</strong> or{' '}
            <strong>← / →</strong>. Press <strong>Space</strong> to jump &amp; use
            your oldest item, or <strong>1 / 2 / 3</strong> for item slots. Every
            coin adds <strong>+{POINTS_PER_COIN} PTS</strong>—finish the course to
            save your score!
          </p>
        </div>

        <button
          type="button"
          onClick={onRunThisCourse}
          className="w-full py-4 rounded-2xl bg-[#76FFB2] hover:bg-[#93ffbe] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run this course</span>
        </button>
      </div>
    </section>
  );
};

/* ============================================================================
 * 4. CHARACTER SELECT SCREEN (#screen-character | camera: portrait_char_select)
 * ========================================================================== */
export const CharacterScreenOverlay: React.FC<{
  course: GpxCourseData;
  mainCharacterId: CharacterModelId;
  raceCharacterId: CharacterModelId;
  onSelectRaceCharacter: (id: CharacterModelId) => void;
  onBackToPreview: () => void;
  onStartRunning: () => void;
}> = ({
  course,
  mainCharacterId,
  raceCharacterId,
  onSelectRaceCharacter,
  onBackToPreview,
  onStartRunning,
}) => {
  return (
    <section
      id="screen-character"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={onBackToPreview}
          className="px-4 py-2.5 rounded-full bg-[#11132E]/90 hover:bg-[#1B1F46] border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Course Preview</span>
        </button>

        <div className="px-4 py-2 rounded-full bg-[#11132E]/90 border border-white/15 text-xs font-semibold text-white">
          Course: <span className="text-[#76FFB2]">{course.shortTitle}</span>
        </div>
      </div>

      {/* Right-aligned Panel on wide screens so the 3D character stands clearly on the left (via 2.3u camera pan) */}
      <div className="my-auto ml-auto max-w-xl w-full bg-[#0E1028]/92 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 pointer-events-auto">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#76FFB2]">
            3-Lane Runner Lineup
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-0.5">
            Who&apos;s running?
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Your <strong>Main</strong> runner is preselected. Picking another
            runner only changes this race.
          </p>
        </div>

        {/* 5 Character Cards with Rendered 3D Thumbnails */}
        <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-1">
          {FIVE_CHARACTERS.map((char) => {
            const isSelected = char.id === raceCharacterId;
            const isMain = char.id === mainCharacterId;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectRaceCharacter(char.id)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-[#76FFB2] shadow-[0_0_25px_rgba(118,255,178,0.22)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Character3DThumbnail char={char} size={58} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {char.name}
                      </span>
                      {isMain && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FACC15] text-[#070818] text-[10px] font-extrabold uppercase">
                          Main
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#76FFB2] font-medium">
                      {char.role}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate mt-0.5">
                      {char.perk}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-[#76FFB2] text-[#070818]'
                      : 'border border-white/25 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onStartRunning}
          className="w-full py-4 rounded-2xl bg-[#76FFB2] hover:bg-[#93ffbe] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start running</span>
        </button>
      </div>
    </section>
  );
};

/* ============================================================================
 * 5. RESULT SCREEN (#screen-result | camera: finish)
 * ========================================================================== */
export const ResultScreenOverlay: React.FC<{
  course: GpxCourseData;
  characterId: CharacterModelId;
  stats: GameStatsUpdate;
  record?: CourseRunRecord;
  isNewBest: boolean;
  onCourses: () => void;
  onRunAgain: () => void;
}> = ({
  course,
  characterId,
  stats,
  record,
  isNewBest,
  onCourses,
  onRunAgain,
}) => {
  const charMeta =
    FIVE_CHARACTERS.find((c) => c.id === characterId) || FIVE_CHARACTERS[0];
  const vsDelta = stats.vsPastYouSeconds;
  const beatPastYou = vsDelta <= 0;

  return (
    <section
      id="screen-result"
      className="fixed inset-0 z-30 bg-[#050611]/75 backdrop-blur-md flex items-center justify-center p-6 select-none"
    >
      <div className="max-w-xl w-full bg-[#0E1028]/95 border-2 border-[#FACC15]/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(250,204,21,0.25)] space-y-6 text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#76FFB2]">
                Course Finished · Coin Score Saved!
              </span>
              {isNewBest && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FACC15] text-[#070818] text-[10px] font-extrabold">
                  NEW BEST SCORE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
              {course.title}
            </h1>
          </div>
          <Character3DThumbnail char={charMeta} size={58} />
        </div>

        {/* Hero Time & vs Past You Strip */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#151838] border border-white/10">
          <div>
            <div className="text-xs text-slate-400">Finish Time (2.0x)</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-white mt-0.5">
              {formatDuration(Math.max(1, Math.round(stats.runElapsedSeconds)))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">vs Past You</div>
            <div
              className={`text-xl sm:text-2xl font-extrabold font-mono-tabular mt-0.5 ${
                beatPastYou ? 'text-[#76FFB2]' : 'text-[#FF85B8]'
              }`}
            >
              {vsDelta <= 0 ? `${vsDelta.toFixed(1)}s Faster!` : `+${vsDelta.toFixed(1)}s`}
            </div>
          </div>
        </div>

        {/* 6 Core Run Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono-tabular">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-[#FACC15]/40">
            <div className="text-[11px] text-slate-400 font-sans">
              Saved Coin Score
            </div>
            <div className="text-lg font-extrabold text-[#FACC15] mt-0.5">
              {stats.score.toLocaleString()} PTS
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              Coins Collected
            </div>
            <div className="text-lg font-extrabold text-[#76FFB2] mt-0.5">
              {stats.coins} / {stats.totalCoins || stats.coins}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              Distance Run
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {course.totalDistanceKm.toFixed(2)} km
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              Avg Course Pace
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatPace(course.avgPaceMinPerKm)}/km
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              Max Coin Combo
            </div>
            <div className="text-lg font-extrabold text-[#FF85B8] mt-0.5">
              {stats.maxCombo}x Combo
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              All-Time Best
            </div>
            <div className="text-lg font-extrabold text-[#FACC15] mt-0.5">
              {(record?.bestScore ?? stats.score).toLocaleString()} PTS
            </div>
          </div>
        </div>

        {/* Action Buttons: Courses (→ My Routes Dashboard) | Run again (→ Play) */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <button
            type="button"
            onClick={onCourses}
            className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#76FFB2]" />
            <span>Courses (Dashboard)</span>
          </button>

          <button
            type="button"
            onClick={onRunAgain}
            className="py-3.5 rounded-2xl bg-[#76FFB2] hover:bg-[#93ffbe] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Run again (Enter)</span>
          </button>
        </div>
      </div>
    </section>
  );
};

/* ============================================================================
 * 6. GAME OVER SCREEN (#screen-over | camera: chase)
 * ========================================================================== */
export const GameOverScreenOverlay: React.FC<{
  course: GpxCourseData;
  progressRatio: number;
  stats: GameStatsUpdate;
  onCourses: () => void;
  onTryAgain: () => void;
}> = ({ course, progressRatio, stats, onCourses, onTryAgain }) => {
  return (
    <section
      id="screen-over"
      className="fixed inset-0 z-30 bg-[#050611]/80 backdrop-blur-md flex items-center justify-center p-6 select-none"
    >
      <div className="max-w-md w-full bg-[#0E1028]/95 border border-rose-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto">
          <Flame className="w-7 h-7 text-rose-400" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Run Interrupted
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-1">
            Past you got away
          </h1>
          <p className="text-xs text-slate-300 mt-1">{course.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono-tabular">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400 font-sans">Progress</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {Math.round(progressRatio * 100)}%
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400 font-sans">Coins Collected</div>
            <div className="text-2xl font-extrabold text-[#FACC15] mt-0.5">
              {stats.coins} ({stats.score.toLocaleString()} PTS)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onCourses}
            className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Courses</span>
          </button>

          <button
            type="button"
            onClick={onTryAgain}
            className="py-3.5 rounded-2xl bg-[#FF85B8] hover:bg-[#ff9bc4] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try again (Enter)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
