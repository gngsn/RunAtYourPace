import React from 'react';
import {
  Award,
  Building2,
  Flame,
  Mountain,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react';
import { GpxCourseData, SurroundingLandmark } from '../types/gpx';
import { formatDuration, formatPace } from '../utils/gpxParser';

interface CourseReportModalProps {
  course: GpxCourseData;
  isOpen: boolean;
  onClose: () => void;
  onJumpToDistanceKm: (distKm: number) => void;
  onSelectLandmark: (landmark: SurroundingLandmark) => void;
}

export const CourseReportModal: React.FC<CourseReportModalProps> = ({
  course,
  isOpen,
  onClose,
  onJumpToDistanceKm,
  onSelectLandmark,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#11132E] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <div className="text-xs text-[#76FFB2] font-medium">
              GPX Course Report & 1km Split Analytics
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              {course.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 bg-[#0B0C22]/70 border-b border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#FF85B8]" />
              <span>Total Distance</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-white mt-1">
              {course.totalDistanceKm.toFixed(2)} km
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-[#76FFB2]" />
              <span>Avg Pace · Time</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-[#76FFB2] mt-1">
              {formatPace(course.avgPaceMinPerKm)}
              <span className="text-xs text-slate-300 font-normal ml-1.5">
                ({formatDuration(course.totalDurationSeconds)})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-[#FDE68A]" />
              <span>Elevation Gain</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-white mt-1">
              +{course.elevationGainM} m
              <span className="text-xs text-slate-400 font-normal ml-1.5">
                (Peak {course.maxElevationM}m)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FB7185]" />
              <span>Calories · Cadence</span>
            </div>
            <div className="text-xl font-bold font-mono-tabular text-white mt-1">
              {course.caloriesKcal} kcal
              <span className="text-xs text-slate-400 font-normal ml-1.5">
                · {course.avgCadenceSpm} spm
              </span>
            </div>
          </div>
        </div>

        {/* 1km Splits Table */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#76FFB2]" />
                1km Splits (Click any row to warp 3D Runner to that split)
              </h3>
              <span className="text-xs text-slate-400">
                {course.splits.length} splits total
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0C22]/60">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 bg-white/5">
                    <th className="py-2.5 px-4 font-medium">Split</th>
                    <th className="py-2.5 px-4 font-medium">Pace</th>
                    <th className="py-2.5 px-4 font-medium">Pace Bar</th>
                    <th className="py-2.5 px-4 font-medium text-right">
                      Duration
                    </th>
                    <th className="py-2.5 px-4 font-medium text-right">
                      Elevation Δ
                    </th>
                    <th className="py-2.5 px-4 font-medium text-right">
                      Avg Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-tabular">
                  {course.splits.map((sp) => {
                    const barRatio = Math.max(
                      0.25,
                      Math.min(1, (7.2 - sp.paceMinPerKm) / 3.2)
                    );
                    return (
                      <tr
                        key={sp.km}
                        onClick={() => {
                          onJumpToDistanceKm(sp.startDistKm);
                          onClose();
                        }}
                        className="hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-semibold text-white">
                          {sp.km} km
                        </td>
                        <td className="py-2.5 px-4 text-[#76FFB2] font-semibold">
                          {formatPace(sp.paceMinPerKm)}/km
                        </td>
                        <td className="py-2.5 px-4 w-44">
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#FF85B8]"
                              style={{ width: `${Math.round(barRatio * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-300">
                          {formatDuration(sp.durationSeconds)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-300">
                          +{sp.elevationGainM}m / -{sp.elevationLossM}m
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-300">
                          {sp.avgGradePercent >= 0 ? '+' : ''}
                          {sp.avgGradePercent.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Surrounding Landmarks Reflected in 3D World */}
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2.5">
              <Building2 className="w-4 h-4 text-[#FF85B8]" />
              Surrounding 3D Buildings & Landmarks Along Route
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.landmarks.map((lm) => (
                <button
                  key={lm.id}
                  type="button"
                  onClick={() => {
                    onSelectLandmark(lm);
                    onJumpToDistanceKm(lm.distKm);
                    onClose();
                  }}
                  className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: lm.primaryColor }}
                      />
                      <span>{lm.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {lm.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono-tabular text-[#76FFB2] shrink-0">
                    {lm.distKm.toFixed(1)} km
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
