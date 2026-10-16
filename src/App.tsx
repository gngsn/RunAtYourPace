/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Coins,
  LayoutGrid,
  Sparkles,
  Trophy,
  Upload,
} from 'lucide-react';
import { BottomControlDock } from './components/BottomControlDock';
import { CourseReportModal } from './components/CourseReportModal';
import { MinimapPanel } from './components/MinimapPanel';
import {
  GameStatsUpdate,
  PastelWorldCanvas,
  RunnerControlActions,
} from './components/PastelWorldCanvas';
import { RoutesGridDashboard } from './components/RoutesGridDashboard';
import {
  ArtworkThemeId,
  CameraModeId,
  CharacterModelId,
  GpxCourseData,
  SurroundingLandmark,
} from './types/gpx';
import {
  ARTWORK_THEMES,
  exportCourseToGpxXml,
  formatPace,
  parseGpxFileContent,
  PRESET_COURSES,
} from './utils/gpxParser';
import { soundEngine } from './utils/soundEffects';

const CAMERA_SEQUENCE: CameraModeId[] = [
  'chase',
  'front',
  'side',
  'aerial',
  'first_person',
];

const CHARACTER_SEQUENCE: CharacterModelId[] = [
  'hoodie_kid',
  'flower_orb',
  'topknot_kid',
];

const CHARACTER_NAMES: Record<CharacterModelId, string> = {
  hoodie_kid: 'Felt Hat Runner',
  flower_orb: 'Flower Crown Sprite',
  topknot_kid: 'Cloud Twin-Bun',
};

export default function App() {
  const [courses, setCourses] = useState<GpxCourseData[]>(PRESET_COURSES);
  const [activeCourseId, setActiveCourseId] = useState<string>(
    PRESET_COURSES[0].id
  );
  const [themeId, setThemeId] = useState<ArtworkThemeId>(
    PRESET_COURSES[0].recommendedTheme
  );
  const [characterId, setCharacterId] = useState<CharacterModelId>('hoodie_kid');
  const [cameraMode, setCameraMode] = useState<CameraModeId>('chase');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [currentPointIdx, setCurrentPointIdx] = useState<number>(0);
  const [selectedLandmark, setSelectedLandmark] =
    useState<SurroundingLandmark | null>(
      PRESET_COURSES[0].landmarks[0] || null
    );

  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState<GameStatsUpdate>({
    coins: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    isFever: false,
    feverTimeLeft: 0,
    lastEventLabel: null,
    currentLane: 0,
  });

  // Open the new Routes Grid Dashboard View so the user can browse all squircle route cards
  // or click any card / "Resume 3D Run" to dive into the 3-Lane 3D Pastel World.
  const [isGridDashboardOpen, setIsGridDashboardOpen] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const runnerActionsRef = useRef<RunnerControlActions | null>(null);

  const activeCourse =
    courses.find((c) => c.id === activeCourseId) || courses[0];
  const currentPoint =
    activeCourse.points[
      Math.min(activeCourse.points.length - 1, currentPointIdx)
    ] || activeCourse.points[0];

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'KeyH') {
        setIsDockCollapsed((v) => !v);
      } else if (e.code === 'KeyG' || e.code === 'Escape') {
        setIsGridDashboardOpen((v) => !v);
      } else if (e.code === 'KeyC') {
        setCameraMode((prev) => {
          const idx = CAMERA_SEQUENCE.indexOf(prev);
          return CAMERA_SEQUENCE[(idx + 1) % CAMERA_SEQUENCE.length];
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSelectCourse = (course: GpxCourseData) => {
    setActiveCourseId(course.id);
    setThemeId(course.recommendedTheme);
    setProgressRatio(0);
    setCurrentPointIdx(0);
    setSelectedLandmark(course.landmarks[0] || null);
    setIsPlaying(true);
    setIsGridDashboardOpen(false);
    showToast(`Launched '${course.title}' — 3-Lane Track & Coins Ready!`);
  };

  const handleSeekRatio = useCallback(
    (ratio: number) => {
      const clamped = Math.max(0, Math.min(0.999, ratio));
      setProgressRatio(clamped);
      const nextIdx = Math.min(
        activeCourse.points.length - 1,
        Math.floor(clamped * activeCourse.points.length)
      );
      setCurrentPointIdx(nextIdx);
    },
    [activeCourse.points.length]
  );

  const handleProgressTick = useCallback(
    (newRatio: number, nextIdx: number) => {
      setProgressRatio(newRatio);
      setCurrentPointIdx(nextIdx);
    },
    []
  );

  const handleGpxFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      const parsedCourse = parseGpxFileContent(text, file.name);
      setCourses((prev) => [parsedCourse, ...prev]);
      setActiveCourseId(parsedCourse.id);
      setProgressRatio(0);
      setCurrentPointIdx(0);
      setSelectedLandmark(parsedCourse.landmarks[0] || null);
      setIsPlaying(true);
      setIsGridDashboardOpen(false);
      showToast(
        `Imported GPX: ${parsedCourse.title} (${parsedCourse.totalDistanceKm.toFixed(
          2
        )} km · 3-Lane Track Generated)`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to parse the uploaded .GPX file.';
      showToast(message);
    }
  };

  const handleDownloadCurrentGpx = () => {
    const xml = exportCourseToGpxXml(activeCourse);
    const blob = new Blob([xml], {
      type: 'application/gpx+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCourse.id}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded '${activeCourse.title}.gpx'`);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.isMuted = next;
      return next;
    });
  };

  const currentTheme = ARTWORK_THEMES[themeId];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0B0C22] select-none"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingFile(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setIsDraggingFile(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          handleGpxFileUpload(file);
        }
      }}
    >
      {/* Hidden File Input for GPX Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx,.xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleGpxFileUpload(file);
            e.target.value = '';
          }
        }}
      />

      {/* Full-Viewport 3D 3-Lane Pastel Running World */}
      <PastelWorldCanvas
        course={activeCourse}
        themeId={themeId}
        characterId={characterId}
        cameraMode={cameraMode}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        progressRatio={progressRatio}
        isAutoPlay={isAutoPlay}
        selectedLandmarkId={selectedLandmark?.id || null}
        actionsRef={runnerActionsRef}
        onProgressTick={handleProgressTick}
        onSelectLandmark={(lm) => {
          setSelectedLandmark(lm);
          if (lm) {
            showToast(`${lm.name} (${lm.distKm.toFixed(2)} km mark)`);
          }
        }}
        onGameStatsUpdate={setGameStats}
      />

      {/* Routes Grid Dashboard View (Squircle Pastel Aura Grid with 3D Frosted GPX Loops) */}
      {isGridDashboardOpen && (
        <RoutesGridDashboard
          courses={courses}
          activeCourse={activeCourse}
          themeId={themeId}
          characterId={characterId}
          gameStats={gameStats}
          onSelectAndLaunchCourse={handleSelectCourse}
          onInspectCourseReport={(course) => {
            setActiveCourseId(course.id);
            setIsReportModalOpen(true);
          }}
          onChangeTheme={(newTheme) => {
            setThemeId(newTheme);
            showToast(`Atmosphere: ${ARTWORK_THEMES[newTheme].nameEn}`);
          }}
          onChangeCharacter={(newChar) => {
            setCharacterId(newChar);
            showToast(`Runner Style: ${CHARACTER_NAMES[newChar]}`);
          }}
          onTriggerUploadGpx={() => fileInputRef.current?.click()}
          onReturnTo3DWorld={() => setIsGridDashboardOpen(false)}
        />
      )}

      {/* Top Navigation Bar (Strict 3-Zone Contract in 3D World View) */}
      {!isGridDashboardOpen && (
        <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0B0C22]/88 border-b border-white/10">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setIsGridDashboardOpen(true);
            }}
            className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0"
          >
            Somteol Run
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => setIsGridDashboardOpen(true)}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Routes Grid ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => {
                const nextChar =
                  CHARACTER_SEQUENCE[
                    (CHARACTER_SEQUENCE.indexOf(characterId) + 1) %
                      CHARACTER_SEQUENCE.length
                  ];
                setCharacterId(nextChar);
                showToast(`Runner Style: ${CHARACTER_NAMES[nextChar]}`);
              }}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Runner: {CHARACTER_NAMES[characterId]}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextCam =
                  CAMERA_SEQUENCE[
                    (CAMERA_SEQUENCE.indexOf(cameraMode) + 1) %
                      CAMERA_SEQUENCE.length
                  ];
                setCameraMode(nextCam);
              }}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Camera Angle (C)
            </button>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Splits Report
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-semibold text-[#0B0C22] bg-[#FF85B8] hover:bg-[#ff9cc5] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import .GPX</span>
            </button>
          </div>
        </header>
      )}

      {/* Top-Left Compact Course & 3-Lane Game Summary Banner (Hidden in Zen Mode or Grid Dashboard) */}
      {!isGridDashboardOpen && !isDockCollapsed && (
        <section className="fixed top-18 left-6 z-10 max-w-md pointer-events-auto">
          <div className="bg-[#11132E]/92 border border-white/15 rounded-2xl px-4 py-3 shadow-xl space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-base font-bold text-white tracking-tight truncate">
                {activeCourse.title}
              </h1>
              <button
                type="button"
                onClick={() => setIsGridDashboardOpen(true)}
                className="text-xs font-semibold text-[#76FFB2] hover:underline whitespace-nowrap shrink-0 flex items-center gap-1"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Routes Grid</span>
              </button>
            </div>

            {/* Unboxed Course Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono-tabular">
              <span className="text-white font-semibold">
                {activeCourse.totalDistanceKm.toFixed(2)} km
              </span>
              <span aria-hidden="true">·</span>
              <span>Avg {formatPace(activeCourse.avgPaceMinPerKm)}/km</span>
              <span aria-hidden="true">·</span>
              <span>Gain +{activeCourse.elevationGainM}m</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#FF85B8] font-sans">
                {currentTheme.nameEn}
              </span>
            </div>

            {/* 3-Lane Coin & Best Combo Strip */}
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between gap-3 text-xs font-mono-tabular">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[#FACC15] font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  {gameStats.coins} Coins
                </span>
                <span className="text-slate-600" aria-hidden="true">
                  ·
                </span>
                <span className="flex items-center gap-1 text-white font-semibold">
                  <Trophy className="w-3.5 h-3.5 text-[#76FFB2]" />
                  Best {gameStats.maxCombo}x Combo
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-sans font-medium text-white transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#76FFB2]" />
                <span>Splits & Landmarks</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Top-Right Live Google Maps / Pastel Vector Minimap & Surrounding Landmarks */}
      {!isGridDashboardOpen && !isDockCollapsed && (
        <div className="fixed top-18 right-6 z-10 pointer-events-auto">
          <MinimapPanel
            course={activeCourse}
            currentPoint={currentPoint}
            progressRatio={progressRatio}
            themeId={themeId}
            selectedLandmark={selectedLandmark}
            onSelectLandmark={setSelectedLandmark}
            onSeekRatio={handleSeekRatio}
          />
        </div>
      )}

      {/* Collapsible Unified Bottom Control Dock + 3-Lane Arcade Pad */}
      {!isGridDashboardOpen && (
        <BottomControlDock
          course={activeCourse}
          currentPoint={currentPoint}
          progressRatio={progressRatio}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          themeId={themeId}
          cameraMode={cameraMode}
          isCollapsed={isDockCollapsed}
          isAutoPlay={isAutoPlay}
          isMuted={isMuted}
          gameStats={gameStats}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onSeekRatio={handleSeekRatio}
          onChangeSpeed={setPlaybackSpeed}
          onChangeTheme={(newTheme) => {
            setThemeId(newTheme);
            showToast(
              `${ARTWORK_THEMES[newTheme].nameEn} — ${ARTWORK_THEMES[newTheme].inspirationLabel}`
            );
          }}
          onChangeCamera={setCameraMode}
          onToggleCollapse={() => setIsDockCollapsed((v) => !v)}
          onDownloadGpx={handleDownloadCurrentGpx}
          onMoveLeft={() => {
            setIsAutoPlay(false);
            runnerActionsRef.current?.moveLeft();
          }}
          onMoveRight={() => {
            setIsAutoPlay(false);
            runnerActionsRef.current?.moveRight();
          }}
          onJump={() => {
            runnerActionsRef.current?.jump();
          }}
          onToggleAutoPlay={() => {
            setIsAutoPlay((prev) => {
              const next = !prev;
              showToast(
                next
                  ? 'AI Coin-Seeking Auto-Pilot Enabled!'
                  : 'Manual Control Mode Active (A/D to switch lanes, Space to jump).'
              );
              return next;
            });
          }}
          onToggleMute={handleToggleMute}
          onResetGame={() => runnerActionsRef.current?.resetCollectibles()}
        />
      )}

      {/* 1km Splits & Surrounding Landmarks Report Modal */}
      <CourseReportModal
        course={activeCourse}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onJumpToDistanceKm={(distKm) => {
          const ratio = distKm / Math.max(0.1, activeCourse.totalDistanceKm);
          handleSeekRatio(ratio);
          setIsGridDashboardOpen(false);
        }}
        onSelectLandmark={(lm) => {
          setSelectedLandmark(lm);
          setIsGridDashboardOpen(false);
        }}
      />

      {/* Drag-and-Drop GPX Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-[#0B0C22]/85 border-4 border-dashed border-[#76FFB2] flex flex-col items-center justify-center gap-3 pointer-events-none">
          <Upload className="w-12 h-12 text-[#76FFB2]" />
          <p className="text-xl font-bold text-white">
            Drop your .GPX file here to generate a 3-Lane Pastel Running World
          </p>
          <p className="text-sm text-slate-300">
            Supports Strava, Garmin, Nike Run Club, and Apple Watch GPX tracks
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#11132E] border border-[#76FFB2]/50 text-xs font-medium text-white shadow-2xl flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#76FFB2]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
