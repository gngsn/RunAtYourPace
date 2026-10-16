/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Coins,
  Flag,
  Gauge,
  LayoutGrid,
  Sparkles,
  Trophy,
  Upload,
  Zap,
} from 'lucide-react';
import { BottomControlDock } from './components/BottomControlDock';
import { CourseReportModal } from './components/CourseReportModal';
import { MinimapPanel } from './components/MinimapPanel';
import {
  CharacterScreenOverlay,
  FIVE_CHARACTERS,
  GameOverScreenOverlay,
  HomeScreenOverlay,
  PreviewScreenOverlay,
  ResultScreenOverlay,
  StatsScreenOverlay,
} from './components/PaceRunnerScreens';
import {
  CourseCompletePayload,
  GameStatsUpdate,
  LaneIndex,
  PastelWorldCanvas,
  POINTS_PER_COIN,
  RunnerControlActions,
} from './components/PastelWorldCanvas';
import {
  CompletedRunSummary,
  RoutesGridDashboard,
} from './components/RoutesGridDashboard';
import {
  ArtworkThemeId,
  CameraModeId,
  CharacterModelId,
  CourseRunRecord,
  GpxCourseData,
  ScreenId,
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

const PLAY_CAMERA_SEQUENCE: CameraModeId[] = [
  'chase',
  'front',
  'side',
  'aerial',
  'first_person',
];

const STORAGE_KEY_RECORDS = 'pace_runner_course_records_v1';
const STORAGE_KEY_MAIN_CHAR = 'pace_runner_main_character_v1';

export default function App() {
  const [courses, setCourses] = useState<GpxCourseData[]>(PRESET_COURSES);
  const [activeCourseId, setActiveCourseId] = useState<string>(
    PRESET_COURSES[0].id
  );
  const [themeId, setThemeId] = useState<ArtworkThemeId>(
    PRESET_COURSES[0].recommendedTheme
  );

  // Main runner (persisted, shown in menus) vs Race runner (selected for current race)
  const [mainCharacterId, setMainCharacterId] = useState<CharacterModelId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAIN_CHAR) as CharacterModelId | null;
      if (saved && FIVE_CHARACTERS.some((c) => c.id === saved)) {
        return saved;
      }
    } catch {
      // Ignore storage error
    }
    return 'hoodie_kid';
  });
  const [raceCharacterId, setRaceCharacterId] =
    useState<CharacterModelId>(mainCharacterId);

  // Screen state machine: 'home' | 'select' | 'stats' | 'preview' | 'character' | 'play' | 'result' | 'over'
  // Default to 'select' (My Routes Grid Dashboard) so the user immediately sees the grid or can switch to 'home' / 'play'
  const [screen, setScreen] = useState<ScreenId>('select');
  const [statsReturnScreen, setStatsReturnScreen] = useState<'home' | 'select'>(
    'select'
  );
  const [isLoadingRuns, setIsLoadingRuns] = useState<boolean>(false);

  // Play phase: intro (1.3s) -> countdown (3s) -> running -> ending
  const [playPhase, setPlayPhase] = useState<
    'intro' | 'countdown' | 'running' | 'ending'
  >('running');
  const [countdownNumber, setCountdownNumber] = useState<number>(3);

  const [playCameraMode, setPlayCameraMode] = useState<CameraModeId>('chase');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
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
    totalCoins: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    isFever: false,
    feverTimeLeft: 0,
    lastEventLabel: null,
    currentLane: 0,
    carriedItems: ['Magnet Fever', 'Coin Surge +3'],
    runElapsedSeconds: 0,
    vsPastYouSeconds: -1.2,
  });

  // Saved Course Coin Scores & Run Records
  const [courseRecords, setCourseRecords] = useState<
    Record<string, CourseRunRecord>
  >(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (raw) {
        return JSON.parse(raw) as Record<string, CourseRunRecord>;
      }
    } catch {
      // Ignore storage error
    }
    return {};
  });
  const [lastCompletedSummary, setLastCompletedSummary] =
    useState<CompletedRunSummary | null>(null);
  const [lastRunWasNewBest, setLastRunWasNewBest] = useState<boolean>(false);

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
    const timer = setTimeout(() => setToastMessage(null), 3400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Determine which character is shown in the 3D scene:
  // Spec: "Menus always show the main runner."
  const displayedCharacterId: CharacterModelId =
    screen === 'home' || screen === 'select' || screen === 'stats'
      ? mainCharacterId
      : raceCharacterId;

  // Determine the active 3D camera mode from the Screen state machine table:
  // home -> portrait | select -> portrait | stats -> portrait | preview -> overview
  // character -> portrait_char_select | play -> chase (or finish) | result -> finish | over -> chase
  const effectiveCameraMode: CameraModeId =
    screen === 'home' || screen === 'select' || screen === 'stats'
      ? 'portrait'
      : screen === 'preview'
      ? 'overview'
      : screen === 'character'
      ? 'portrait_char_select'
      : screen === 'result'
      ? 'finish'
      : screen === 'over'
      ? 'chase'
      : playPhase === 'ending'
      ? 'finish'
      : playCameraMode;

  const handleSelectMainCharacter = (id: CharacterModelId) => {
    setMainCharacterId(id);
    setRaceCharacterId(id);
    try {
      localStorage.setItem(STORAGE_KEY_MAIN_CHAR, id);
    } catch {
      // Ignore storage error
    }
    const meta = FIVE_CHARACTERS.find((c) => c.id === id);
    if (meta) {
      showToast(`Main Runner set to ${meta.name}`);
    }
  };

  // Start a race on a given course (with intro 1.3s -> countdown 3s -> running)
  const startRaceWithCountdown = useCallback(
    (courseToRun: GpxCourseData, skipCountdown = false) => {
      setActiveCourseId(courseToRun.id);
      setThemeId(courseToRun.recommendedTheme);
      setProgressRatio(0);
      setCurrentPointIdx(0);
      setSelectedLandmark(courseToRun.landmarks[0] || null);
      runnerActionsRef.current?.resetCollectibles();
      setScreen('play');

      if (skipCountdown) {
        setPlayPhase('running');
        setIsPlaying(true);
      } else {
        setPlayPhase('intro');
        setIsPlaying(false);
        setCountdownNumber(3);
      }
    },
    []
  );

  // Handle intro (1.3s) -> countdown (3s) -> running transition
  useEffect(() => {
    if (screen !== 'play') return;
    if (playPhase === 'intro') {
      const t = setTimeout(() => {
        setPlayPhase('countdown');
        setCountdownNumber(3);
      }, 1300);
      return () => clearTimeout(t);
    }
    if (playPhase === 'countdown') {
      if (countdownNumber > 0) {
        const t = setTimeout(() => {
          setCountdownNumber((n) => n - 1);
        }, 950);
        return () => clearTimeout(t);
      } else {
        setPlayPhase('running');
        setIsPlaying(true);
      }
    }
  }, [screen, playPhase, countdownNumber]);

  // Save Coin Score when a run completes from start to finish and return to Dashboard / Result!
  const handleCourseComplete = useCallback(
    (payload: CourseCompletePayload) => {
      const targetCourse =
        courses.find((c) => c.id === payload.courseId) || activeCourse;
      const earnedScore = payload.coins * POINTS_PER_COIN;

      let isNewBest = false;
      let updatedRecord: CourseRunRecord;

      setCourseRecords((prev) => {
        const existing = prev[targetCourse.id];
        isNewBest = !existing || earnedScore >= existing.bestScore;
        const bestScore = existing
          ? Math.max(existing.bestScore, earnedScore)
          : earnedScore;
        const bestCoins = existing
          ? Math.max(existing.bestCoins, payload.coins)
          : payload.coins;
        const bestTimeSeconds = existing
          ? Math.min(existing.bestTimeSeconds, payload.elapsedSeconds)
          : payload.elapsedSeconds;
        const completedRuns = (existing?.completedRuns || 0) + 1;

        updatedRecord = {
          courseId: targetCourse.id,
          bestScore,
          bestCoins,
          lastScore: earnedScore,
          lastCoins: payload.coins,
          totalCoinsAvailable: payload.totalCoins,
          bestTimeSeconds,
          lastTimeSeconds: payload.elapsedSeconds,
          vsPastYouDeltaSeconds: payload.vsPastYouSeconds,
          completedRuns,
          lastCompletedAtIso: new Date().toISOString(),
        };

        const nextMap = {
          ...prev,
          [targetCourse.id]: updatedRecord,
        };
        try {
          localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(nextMap));
        } catch {
          // Ignore storage error
        }

        setLastCompletedSummary({
          courseId: targetCourse.id,
          courseTitle: targetCourse.title,
          coins: payload.coins,
          totalCoins: payload.totalCoins,
          score: earnedScore,
          bestScore,
          completedRuns,
          isNewBest,
        });
        setLastRunWasNewBest(isNewBest);

        return nextMap;
      });

      setIsPlaying(false);
      setPlayPhase('ending');

      // Show toast & return to the Dashboard ('select') with the saved coin score!
      showToast(
        `Finished '${targetCourse.shortTitle}'! Saved ${earnedScore.toLocaleString()} PTS (${
          payload.coins
        } Coins)`
      );

      // Brief 650ms finish celebration, then return to Dashboard ('select') where the saved score banner & Result modal are visible
      setTimeout(() => {
        setProgressRatio(0);
        setCurrentPointIdx(0);
        setScreen('select');
      }, 650);
    },
    [courses, activeCourse, showToast]
  );

  // Global Keyboard Shortcuts from Spec:
  // Esc quits a run (-> My Routes 'select')
  // Enter / Space on result / game-over retries ('play' with same course & character)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Escape') {
        if (screen === 'play') {
          setIsPlaying(false);
          setScreen('select');
          showToast('Run paused — Returned to My Routes');
        } else if (
          screen === 'preview' ||
          screen === 'character' ||
          screen === 'result' ||
          screen === 'over'
        ) {
          setScreen('select');
        } else if (screen === 'stats') {
          setScreen(statsReturnScreen);
        }
      } else if (
        (e.code === 'Enter' || e.code === 'Space') &&
        (screen === 'result' || screen === 'over')
      ) {
        e.preventDefault();
        startRaceWithCountdown(activeCourse, true);
      } else if (e.code === 'KeyH' && screen === 'play') {
        setIsDockCollapsed((v) => !v);
      } else if (e.code === 'KeyC' && screen === 'play') {
        setPlayCameraMode((prev) => {
          const idx = PLAY_CAMERA_SEQUENCE.indexOf(prev);
          return PLAY_CAMERA_SEQUENCE[(idx + 1) % PLAY_CAMERA_SEQUENCE.length];
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, statsReturnScreen, activeCourse, startRaceWithCountdown, showToast]);

  const handleClickMyRunsFromHome = () => {
    setIsLoadingRuns(true);
    setTimeout(() => {
      setIsLoadingRuns(false);
      setScreen('select');
    }, 700);
  };

  const handlePreviewCourse = (course: GpxCourseData) => {
    setActiveCourseId(course.id);
    setThemeId(course.recommendedTheme);
    setProgressRatio(0);
    setCurrentPointIdx(0);
    setSelectedLandmark(course.landmarks[0] || null);
    setIsPlaying(false);
    setScreen('preview');
  };

  const handleQuickLaunchCourse = (course: GpxCourseData) => {
    setRaceCharacterId(mainCharacterId);
    startRaceWithCountdown(course, true);
    showToast(
      `Running '${course.shortTitle}' at 2.0x Speed — Collect Coins to Save Score!`
    );
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
      setThemeId(parsedCourse.recommendedTheme);
      setProgressRatio(0);
      setCurrentPointIdx(0);
      setSelectedLandmark(parsedCourse.landmarks[0] || null);
      setScreen('preview');
      showToast(
        `Imported GPX: ${parsedCourse.title} (${parsedCourse.totalDistanceKm.toFixed(
          2
        )} km · Flat Non-Overlapping 3-Lane Track)`
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

  const totalSavedCoins = Object.values(courseRecords).reduce(
    (acc, r) => acc + r.bestCoins,
    0
  );
  const totalSavedScore = Object.values(courseRecords).reduce(
    (acc, r) => acc + r.bestScore,
    0
  );

  const currentTheme = ARTWORK_THEMES[themeId];
  const currentRunnerMeta =
    FIVE_CHARACTERS.find((c) => c.id === displayedCharacterId) ||
    FIVE_CHARACTERS[0];

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

      {/* Full-Viewport 3D 3-Lane Non-Overlapping Flat Pastel Running World */}
      <PastelWorldCanvas
        course={activeCourse}
        themeId={themeId}
        characterId={displayedCharacterId}
        cameraMode={effectiveCameraMode}
        isPlaying={screen === 'play' && isPlaying}
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
        onCourseComplete={handleCourseComplete}
      />

      {/* 1. HOME SCREEN (#screen-home) */}
      {screen === 'home' && (
        <HomeScreenOverlay
          isLoadingRuns={isLoadingRuns}
          totalSavedCoins={totalSavedCoins}
          totalSavedScore={totalSavedScore}
          onClickMyRuns={handleClickMyRunsFromHome}
          onClickMyStats={() => {
            setStatsReturnScreen('home');
            setScreen('stats');
          }}
          onTriggerUploadGpx={() => fileInputRef.current?.click()}
        />
      )}

      {/* 2. MY ROUTES GRID DASHBOARD (#screen-select) */}
      {screen === 'select' && (
        <RoutesGridDashboard
          courses={courses}
          activeCourse={activeCourse}
          themeId={themeId}
          characterId={mainCharacterId}
          gameStats={gameStats}
          courseRecords={courseRecords}
          lastCompletedSummary={lastCompletedSummary}
          onDismissCompletedSummary={() => setLastCompletedSummary(null)}
          onSelectAndLaunchCourse={handleQuickLaunchCourse}
          onPreviewCourse={handlePreviewCourse}
          onInspectCourseReport={(course) => {
            setActiveCourseId(course.id);
            setIsReportModalOpen(true);
          }}
          onChangeTheme={(newTheme) => {
            setThemeId(newTheme);
            showToast(`Atmosphere: ${ARTWORK_THEMES[newTheme].nameEn}`);
          }}
          onChangeCharacter={handleSelectMainCharacter}
          onTriggerUploadGpx={() => fileInputRef.current?.click()}
          onReturnTo3DWorld={() => handleQuickLaunchCourse(activeCourse)}
          onOpenStats={() => {
            setStatsReturnScreen('select');
            setScreen('stats');
          }}
          onOpenHome={() => setScreen('home')}
        />
      )}

      {/* 3. MY STATS SCREEN (#screen-stats) */}
      {screen === 'stats' && (
        <StatsScreenOverlay
          courses={courses}
          courseRecords={courseRecords}
          mainCharacterId={mainCharacterId}
          onSelectMainCharacter={handleSelectMainCharacter}
          onBack={() => setScreen(statsReturnScreen)}
          onSelectCourseFromStats={(course) => handlePreviewCourse(course)}
        />
      )}

      {/* 4. COURSE PREVIEW SCREEN (#screen-preview) */}
      {screen === 'preview' && (
        <PreviewScreenOverlay
          course={activeCourse}
          record={courseRecords[activeCourse.id]}
          onBackToSelect={() => setScreen('select')}
          onRunThisCourse={() => {
            // Preselect the main runner when entering the character picker
            setRaceCharacterId(mainCharacterId);
            setScreen('character');
          }}
        />
      )}

      {/* 5. CHARACTER PICKER SCREEN (#screen-character) */}
      {screen === 'character' && (
        <CharacterScreenOverlay
          course={activeCourse}
          mainCharacterId={mainCharacterId}
          raceCharacterId={raceCharacterId}
          onSelectRaceCharacter={setRaceCharacterId}
          onBackToPreview={() => setScreen('preview')}
          onStartRunning={() => startRaceWithCountdown(activeCourse, true)}
        />
      )}

      {/* 6. PLAY HUD (#hud) — Minimal: ONLY Coins & Map visible while running */}
      {screen === 'play' && (
        <div id="hud" className="pointer-events-none">
          {/* Top-Left Live Coin Counter */}
          <div className="fixed top-5 left-5 z-20 flex items-center gap-2.5 bg-[#0B0C22]/85 backdrop-blur-md border border-[#FACC15]/45 rounded-2xl px-4 py-2.5 shadow-2xl pointer-events-auto">
            <Coins className="w-5 h-5 text-[#FACC15]" />
            <div className="flex items-baseline gap-2 font-mono-tabular">
              <span className="text-lg font-extrabold text-[#FACC15]">
                {gameStats.coins}
              </span>
              {gameStats.totalCoins > 0 && (
                <span className="text-xs font-bold text-slate-400">
                  / {gameStats.totalCoins}
                </span>
              )}
            </div>
          </div>

          {/* Top-Right Live Route Map */}
          <div className="fixed top-5 right-5 z-20 pointer-events-auto">
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
        </div>
      )}

      {/* 7. RESULT SCREEN (#screen-result) */}
      {screen === 'result' && (
        <ResultScreenOverlay
          course={activeCourse}
          characterId={raceCharacterId}
          stats={gameStats}
          record={courseRecords[activeCourse.id]}
          isNewBest={lastRunWasNewBest}
          onCourses={() => setScreen('select')}
          onRunAgain={() => startRaceWithCountdown(activeCourse, true)}
        />
      )}

      {/* 8. GAME OVER SCREEN (#screen-over) */}
      {screen === 'over' && (
        <GameOverScreenOverlay
          course={activeCourse}
          progressRatio={progressRatio}
          stats={gameStats}
          onCourses={() => setScreen('select')}
          onTryAgain={() => startRaceWithCountdown(activeCourse, true)}
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
          setScreen('play');
          setPlayPhase('running');
          setIsPlaying(true);
        }}
        onSelectLandmark={(lm) => {
          setSelectedLandmark(lm);
          setScreen('play');
          setPlayPhase('running');
          setIsPlaying(true);
        }}
      />

      {/* Drag-and-Drop GPX Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 bg-[#0B0C22]/85 border-4 border-dashed border-[#76FFB2] flex flex-col items-center justify-center gap-3 pointer-events-none">
          <Upload className="w-12 h-12 text-[#76FFB2]" />
          <p className="text-xl font-bold text-white">
            Drop your .GPX file here to generate a Flat 3-Lane Pastel Course
          </p>
          <p className="text-sm text-slate-300">
            Supports Strava, Garmin, Nike Run Club, and Apple Watch GPX tracks
          </p>
        </div>
      )}

      {/* Toast Notification (hidden during active running so only Map & Coins are visible) */}
      {toastMessage && screen !== 'play' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#11132E] border border-[#76FFB2]/50 text-xs font-medium text-white shadow-2xl flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#76FFB2]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
