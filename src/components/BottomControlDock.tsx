import React, { useMemo, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Camera,
  ChevronDown,
  ChevronUp,
  Coins,
  Download,
  Gamepad2,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  ArtworkThemeId,
  CameraModeId,
  GpxCourseData,
  GpxTrackPoint,
} from '../types/gpx';
import { ARTWORK_THEMES, formatDuration, formatPace } from '../utils/gpxParser';
import { GameStatsUpdate, LaneIndex } from './PastelWorldCanvas';

interface BottomControlDockProps {
  course: GpxCourseData;
  currentPoint: GpxTrackPoint;
  progressRatio: number;
  isPlaying: boolean;
  playbackSpeed: number;
  themeId: ArtworkThemeId;
  cameraMode: CameraModeId;
  isCollapsed: boolean;
  isAutoPlay: boolean;
  isMuted: boolean;
  gameStats: GameStatsUpdate;
  onTogglePlay: () => void;
  onSeekRatio: (ratio: number) => void;
  onChangeSpeed: (speed: number) => void;
  onChangeTheme: (theme: ArtworkThemeId) => void;
  onChangeCamera: (mode: CameraModeId) => void;
  onToggleCollapse: () => void;
  onDownloadGpx: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onToggleAutoPlay: () => void;
  onToggleMute: () => void;
  onResetGame: () => void;
}

const SPEED_OPTIONS = [1, 2, 4, 8];

const CAMERA_LABELS: Array<{ id: CameraModeId; label: string }> = [
  { id: 'chase', label: '3rd-Person Chase' },
  { id: 'front', label: 'Front Look' },
  { id: 'side', label: 'Side Felt' },
  { id: 'aerial', label: 'Drone Aerial' },
  { id: 'first_person', label: 'First-Person' },
];

const LANE_NAMES: Record<LaneIndex, string> = {
  [-1]: 'Lane 1 (Left)',
  [0]: 'Lane 2 (Center)',
  [1]: 'Lane 3 (Right)',
};

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  course,
  currentPoint,
  progressRatio,
  isPlaying,
  playbackSpeed,
  themeId,
  cameraMode,
  isCollapsed,
  isAutoPlay,
  isMuted,
  gameStats,
  onTogglePlay,
  onSeekRatio,
  onChangeSpeed,
  onChangeTheme,
  onChangeCamera,
  onToggleCollapse,
  onDownloadGpx,
  onMoveLeft,
  onMoveRight,
  onJump,
  onToggleAutoPlay,
  onToggleMute,
  onResetGame,
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);

  const theme = ARTWORK_THEMES[themeId];

  const { eleAreaPath, eleLinePath, paceLinePath } = useMemo(() => {
    const W = 680;
    const H = 52;
    const pts = course.points;
    const minE = course.minElevationM;
    const maxE = Math.max(minE + 5, course.maxElevationM);

    const coords = pts.map((pt, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * W;
      const y = H - 6 - ((pt.ele - minE) / (maxE - minE)) * (H - 14);
      return { x, y };
    });

    const line = coords
      .map(
        (c, idx) =>
          `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`
      )
      .join(' ');
    const area = `${line} L${W},${H} L0,${H} Z`;

    const paceCoords = pts.map((pt, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * W;
      const normPace = Math.max(0, Math.min(1, (8.0 - pt.paceMinPerKm) / 4.5));
      const y = H - 8 - normPace * (H - 18);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return {
      eleAreaPath: area,
      eleLinePath: line,
      paceLinePath: paceCoords.join(' '),
    };
  }, [course]);

  const handleScrubPointer = (clientX: number) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / Math.max(1, rect.width))
    );
    onSeekRatio(ratio);
  };

  return (
    <div className="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-20 w-[min(980px,95vw)] flex flex-col items-center pointer-events-auto">
      {/* Tactile 3-Lane Arcade Action Pad + Live Coin/Score Bar */}
      <div className="mb-2 flex flex-wrap items-center justify-center gap-2.5 bg-[#11132E]/95 border border-white/15 rounded-2xl px-3.5 py-2 shadow-xl">
        {/* Live Coin & Score Readout */}
        <div className="flex items-center gap-3 pr-2 border-r border-white/10 text-xs font-mono-tabular">
          <div className="flex items-center gap-1.5 text-[#FACC15] font-bold">
            <Coins className="w-4 h-4 text-[#FACC15]" />
            <span>{gameStats.coins}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <div className="text-white font-bold">
            {gameStats.score.toLocaleString()}
            <span className="text-[11px] font-normal text-slate-400 ml-1">
              pts
            </span>
          </div>
          <span className="text-slate-600" aria-hidden="true">
            ·
          </span>
          <div
            className={`font-semibold ${
              gameStats.combo >= 5 ? 'text-[#76FFB2]' : 'text-slate-300'
            }`}
          >
            {gameStats.combo}x Combo
          </div>
          {gameStats.isFever && (
            <>
              <span className="text-slate-600" aria-hidden="true">
                ·
              </span>
              <span className="text-[#FF85B8] font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                FEVER {gameStats.feverTimeLeft.toFixed(1)}s
              </span>
            </>
          )}
        </div>

        {/* 3-Lane Tactile Buttons (◀ Left | ▲ Jump | Right ▶) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMoveLeft}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white flex items-center gap-1 transition-all whitespace-nowrap shrink-0 border border-white/10"
            title="Switch to Left Lane (Keyboard A or ←)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#76FFB2]" />
            <span>Left (A)</span>
          </button>

          <button
            type="button"
            onClick={onJump}
            className="px-3.5 py-1.5 rounded-xl bg-[#76FFB2] hover:bg-[#95ffbe] active:scale-95 text-xs font-bold text-[#0B0C22] flex items-center gap-1 transition-all whitespace-nowrap shrink-0 shadow-sm"
            title="Jump over Cloud Hurdles & grab Air Coins (Space or ↑)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Jump (Space)</span>
          </button>

          <button
            type="button"
            onClick={onMoveRight}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white flex items-center gap-1 transition-all whitespace-nowrap shrink-0 border border-white/10"
            title="Switch to Right Lane (Keyboard D or →)"
          >
            <span>Right (D)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#76FFB2]" />
          </button>
        </div>

        {/* Current Lane & Auto-Pilot / Sound Controls */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
          <span className="text-[11px] text-slate-300 font-medium px-1.5 whitespace-nowrap">
            {LANE_NAMES[gameStats.currentLane]}
          </span>

          <button
            type="button"
            onClick={onToggleAutoPlay}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 border ${
              isAutoPlay
                ? 'bg-[#FF85B8] text-[#0B0C22] border-[#FF85B8]'
                : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
            }`}
            title="Toggle AI Coin-Seeking Auto-Pilot"
          >
            {isAutoPlay ? (
              <>
                <Bot className="w-3.5 h-3.5" />
                <span>AI Auto-Pilot ON</span>
              </>
            ) : (
              <>
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Manual Control</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#76FFB2]" />
            )}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#FF85B8]" />
                <span>Expand Dock</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#76FFB2]" />
                <span>Zen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="w-full bg-[#11132E]/95 border border-white/15 rounded-2xl shadow-2xl px-5 py-3 space-y-2.5">
          {/* Row 1: Live GPX Telemetry + Interactive Elevation & Pace Scrubber */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-4 flex items-center justify-between lg:justify-start gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-2 lg:pb-0 lg:pr-4">
              <div>
                <div className="text-[11px] text-slate-400">Distance</div>
                <div className="text-base font-bold font-mono-tabular text-white">
                  {currentPoint.distKm.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    / {course.totalDistanceKm.toFixed(2)} km
                  </span>
                </div>
              </div>

              <div className="text-slate-600" aria-hidden="true">
                ·
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Current Pace</div>
                <div className="text-base font-bold font-mono-tabular text-[#76FFB2]">
                  {formatPace(currentPoint.paceMinPerKm)}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                    /km
                  </span>
                </div>
              </div>

              <div className="text-slate-600" aria-hidden="true">
                ·
              </div>

              <div>
                <div className="text-[11px] text-slate-400">
                  Elevation · Grade
                </div>
                <div className="text-sm font-semibold font-mono-tabular text-[#FF85B8]">
                  {currentPoint.ele.toFixed(0)}m
                  <span className="text-xs text-slate-300 ml-1">
                    ({currentPoint.gradePercent >= 0 ? '+' : ''}
                    {currentPoint.gradePercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Elevation & Pace Timeline Scrubber */}
            <div className="lg:col-span-8 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>
                  Elevation Profile ({course.minElevationM}m –{' '}
                  {course.maxElevationM}m) · Elapsed{' '}
                  <strong className="font-mono-tabular text-white">
                    {formatDuration(currentPoint.elapsedSeconds)}
                  </strong>
                </span>
                <span className="text-[#FACC15] font-medium truncate max-w-[290px]">
                  {gameStats.lastEventLabel ||
                    'Use A/D or Arrow keys to switch 3 lanes & Space to jump!'}
                </span>
              </div>

              <div className="relative w-full h-12 bg-[#090B1F] rounded-xl border border-white/10 overflow-hidden">
                <svg
                  ref={chartRef}
                  viewBox="0 0 680 52"
                  preserveAspectRatio="none"
                  className="w-full h-full cursor-ew-resize"
                  onPointerDown={(e) => {
                    isDraggingRef.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    handleScrubPointer(e.clientX);
                  }}
                  onPointerMove={(e) => {
                    if (isDraggingRef.current) {
                      handleScrubPointer(e.clientX);
                    }
                  }}
                  onPointerUp={(e) => {
                    isDraggingRef.current = false;
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }}
                >
                  <defs>
                    <linearGradient id="eleFillGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={theme.treeFoliagePrimaryHex}
                        stopOpacity="0.5"
                      />
                      <stop
                        offset="100%"
                        stopColor={theme.treeFoliagePrimaryHex}
                        stopOpacity="0.04"
                      />
                    </linearGradient>
                  </defs>

                  <path d={eleAreaPath} fill="url(#eleFillGrad)" />
                  <path
                    d={eleLinePath}
                    fill="none"
                    stroke={theme.treeFoliagePrimaryHex}
                    strokeWidth="2"
                  />
                  <path
                    d={paceLinePath}
                    fill="none"
                    stroke={theme.groundPrimaryHex}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity="0.75"
                  />

                  {course.landmarks.map((lm) => {
                    const lx =
                      (lm.distKm / Math.max(0.1, course.totalDistanceKm)) * 680;
                    return (
                      <line
                        key={lm.id}
                        x1={lx}
                        y1={0}
                        x2={lx}
                        y2={52}
                        stroke="rgba(255,255,255,0.18)"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    );
                  })}

                  <line
                    x1={progressRatio * 680}
                    y1={0}
                    x2={progressRatio * 680}
                    y2={52}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Row 2: Unified Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTogglePlay}
                className="px-4 py-1.5 rounded-xl bg-[#FF85B8] hover:bg-[#ff9bc4] text-[#0B0C22] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md whitespace-nowrap shrink-0"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Run</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSeekRatio(0);
                  onResetGame();
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Restart Course & Reset Coins"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-[#090B1F] p-1 rounded-xl border border-white/10">
                {SPEED_OPTIONS.map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onChangeSpeed(spd)}
                    className={`px-2 py-1 rounded-lg text-xs font-mono-tabular font-medium transition-colors whitespace-nowrap shrink-0 ${
                      playbackSpeed === spd
                        ? 'bg-white text-[#0B0C22]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#090B1F] p-1 rounded-xl border border-white/10">
              <Camera className="w-3.5 h-3.5 text-slate-400 ml-2 shrink-0" />
              {CAMERA_LABELS.map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => onChangeCamera(cam.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    cameraMode === cam.id
                      ? 'bg-[#76FFB2] text-[#0B0C22] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-[#090B1F] p-1 rounded-xl border border-white/10">
                <Palette className="w-3.5 h-3.5 text-[#FF85B8] ml-2 shrink-0" />
                {(Object.keys(ARTWORK_THEMES) as ArtworkThemeId[]).map(
                  (tId) => {
                    const tCfg = ARTWORK_THEMES[tId];
                    const active = themeId === tId;
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => onChangeTheme(tId)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-white text-[#0B0C22] font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                          style={{
                            backgroundColor: tCfg.treeFoliagePrimaryHex,
                          }}
                        />
                        <span>{tCfg.nameEn}</span>
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={onDownloadGpx}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                title="Download Current Course as .GPX"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export GPX</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
