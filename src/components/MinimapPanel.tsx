import React, { useEffect, useMemo, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Building2,
  Compass,
  Expand,
  Layers,
  MapPin,
  Minimize2,
} from 'lucide-react';
import {
  ArtworkThemeId,
  GpxCourseData,
  GpxTrackPoint,
  SurroundingLandmark,
} from '../types/gpx';
import { ARTWORK_THEMES } from '../utils/gpxParser';

interface MinimapPanelProps {
  course: GpxCourseData;
  currentPoint: GpxTrackPoint;
  progressRatio: number;
  themeId: ArtworkThemeId;
  selectedLandmark: SurroundingLandmark | null;
  onSelectLandmark: (landmark: SurroundingLandmark | null) => void;
  onSeekRatio: (ratio: number) => void;
}

const GpxGooglePolyline: React.FC<{
  course: GpxCourseData;
  currentPoint: GpxTrackPoint;
  strokeColor: string;
}> = ({ course, currentPoint, strokeColor }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLib) return;
    const path = course.points.map((pt) => ({ lat: pt.lat, lng: pt.lng }));

    const casingLine = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor: '#0B0C22',
      strokeOpacity: 0.85,
      strokeWeight: 8,
      map,
    });

    const mainLine = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor,
      strokeOpacity: 1.0,
      strokeWeight: 4.5,
      map,
    });

    return () => {
      casingLine.setMap(null);
      mainLine.setMap(null);
    };
  }, [map, mapsLib, course, strokeColor]);

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: currentPoint.lat, lng: currentPoint.lng });
  }, [map, currentPoint.lat, currentPoint.lng]);

  return null;
};

export const MinimapPanel: React.FC<MinimapPanelProps> = ({
  course,
  currentPoint,
  progressRatio,
  themeId,
  selectedLandmark,
  onSelectLandmark,
  onSeekRatio,
}) => {
  const rawEnvKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const hasValidFormatKey =
    rawEnvKey.startsWith('AIza') && rawEnvKey.length > 20;

  const [mapMode, setMapMode] = useState<'pastel_vector' | 'google_live'>(
    'pastel_vector'
  );
  const [googleMapUnavailable, setGoogleMapUnavailable] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const onAuthErr = () => {
      setGoogleMapUnavailable(true);
      setMapMode('pastel_vector');
    };
    window.addEventListener('gmp-map-auth-error', onAuthErr);
    return () => window.removeEventListener('gmp-map-auth-error', onAuthErr);
  }, []);

  const theme = ARTWORK_THEMES[themeId];

  const bounds = useMemo(() => {
    const lats = course.points.map((p) => p.lat);
    const lngs = course.points.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = Math.max(0.0016, (maxLat - minLat) * 0.22);
    const padLng = Math.max(0.0016, (maxLng - minLng) * 0.22);
    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
    };
  }, [course]);

  const projectLatLng = (lat: number, lng: number) => {
    const x =
      ((lng - bounds.minLng) / Math.max(0.0001, bounds.maxLng - bounds.minLng)) *
      280;
    const y =
      (1 -
        (lat - bounds.minLat) /
          Math.max(0.0001, bounds.maxLat - bounds.minLat)) *
      200;
    return { x, y };
  };

  const buildingFootprints = useMemo(() => {
    const boxes: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      rot: number;
      color: string;
    }> = [];
    const step = Math.max(2, Math.floor(course.points.length / 28));
    for (let i = 0; i < course.points.length; i += step) {
      const pt = course.points[i];
      const p = projectLatLng(pt.lat, pt.lng);
      const side = i % 2 === 0 ? 1 : -1;
      const offset = 15 + (i % 3) * 6;
      const angle = i * 0.5;
      boxes.push({
        x: p.x + Math.cos(angle) * offset * side,
        y: p.y + Math.sin(angle) * offset * side,
        w: 6 + (i % 4) * 2.5,
        h: 5 + ((i * 3) % 4) * 2.2,
        rot: (i * 23) % 90,
        color: theme.buildingPalette[i % theme.buildingPalette.length],
      });
    }
    return boxes;
  }, [course, bounds, theme]);

  const trackSvgPoints = useMemo(() => {
    return course.points
      .map((pt) => {
        const { x, y } = projectLatLng(pt.lat, pt.lng);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [course, bounds]);

  const traversedSvgPoints = useMemo(() => {
    const maxIdx = Math.max(
      1,
      Math.floor(progressRatio * (course.points.length - 1))
    );
    return course.points
      .slice(0, maxIdx + 1)
      .map((pt) => {
        const { x, y } = projectLatLng(pt.lat, pt.lng);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [course, bounds, progressRatio]);

  const directionArrows = useMemo(() => {
    const arrows: Array<{ x: number; y: number; deg: number }> = [];
    const count = 7;
    for (let i = 1; i <= count; i++) {
      const idx = Math.min(
        course.points.length - 2,
        Math.floor((i / (count + 1)) * course.points.length)
      );
      const p1 = projectLatLng(course.points[idx].lat, course.points[idx].lng);
      const p2 = projectLatLng(
        course.points[idx + 1].lat,
        course.points[idx + 1].lng
      );
      const deg =
        (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
      arrows.push({ x: p1.x, y: p1.y, deg });
    }
    return arrows;
  }, [course, bounds]);

  const kmMarkers = useMemo(() => {
    const list: Array<{ km: number; x: number; y: number }> = [];
    const maxKm = Math.floor(course.totalDistanceKm);
    for (let k = 1; k <= maxKm; k++) {
      const pt =
        course.points.find((p) => p.distKm >= k) ||
        course.points[course.points.length - 1];
      const proj = projectLatLng(pt.lat, pt.lng);
      list.push({ km: k, x: proj.x, y: proj.y });
    }
    return list;
  }, [course, bounds]);

  const startProjected = projectLatLng(
    course.points[0].lat,
    course.points[0].lng
  );
  const runnerProjected = projectLatLng(currentPoint.lat, currentPoint.lng);

  const nextIdx = Math.min(course.points.length - 1, currentPoint.index + 1);
  const nextProjected = projectLatLng(
    course.points[nextIdx].lat,
    course.points[nextIdx].lng
  );
  const headingDeg =
    (Math.atan2(
      nextProjected.y - runnerProjected.y,
      nextProjected.x - runnerProjected.x
    ) *
      180) /
    Math.PI;

  const biomeLabelMap: Record<string, string> = {
    riverside: 'Waterfront Trail · Shimmering River',
    park: 'Pink Fluffy Grove · Neon Meadow',
    urban_pastel: 'Urban Pastel Skyline District',
    bridge: 'Cloud Arch Bridge · Sky Overlook',
    mountain: 'Moonlight Ridge · Forest Climb',
  };

  return (
    <aside
      className={`transition-transform duration-200 ${
        isExpanded ? 'w-[380px]' : 'w-[325px]'
      } bg-[#11132E]/95 border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-slate-100`}
    >
      {/* Minimap Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <Compass className="w-4 h-4 text-[#FF85B8] shrink-0" />
          <span className="text-xs font-semibold tracking-tight truncate">
            {course.locationLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {hasValidFormatKey && !googleMapUnavailable && (
            <button
              type="button"
              onClick={() =>
                setMapMode((m) =>
                  m === 'pastel_vector' ? 'google_live' : 'pastel_vector'
                )
              }
              className="px-2 py-1 text-[11px] font-medium rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap shrink-0"
              title="Toggle Map View"
            >
              {mapMode === 'google_live' ? 'Pastel Vector' : 'Google Maps'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Collapse Minimap' : 'Expand Minimap'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Expand className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Map Viewport */}
      <div
        className={`relative w-full ${
          isExpanded ? 'h-[250px]' : 'h-[205px]'
        } bg-[#080A1C] overflow-hidden`}
      >
        {mapMode === 'google_live' &&
        hasValidFormatKey &&
        !googleMapUnavailable ? (
          <APIProvider apiKey={rawEnvKey} language="en" region="US">
            <div className="w-full h-full">
              <GoogleMap
                defaultCenter={{
                  lat: currentPoint.lat,
                  lng: currentPoint.lng,
                }}
                defaultZoom={15}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                disableDefaultUI={true}
                gestureHandling="greedy"
                className="w-full h-full"
              >
                <GpxGooglePolyline
                  course={course}
                  currentPoint={currentPoint}
                  strokeColor={theme.treeFoliagePrimaryHex}
                />
                {course.landmarks.map((lm) => (
                  <AdvancedMarker
                    key={lm.id}
                    position={{ lat: lm.lat, lng: lm.lng }}
                    onClick={() => onSelectLandmark(lm)}
                  >
                    <div
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-md border border-white/40 cursor-pointer"
                      style={{
                        backgroundColor: lm.primaryColor,
                        color: '#0B0C22',
                      }}
                    >
                      {lm.name}
                    </div>
                  </AdvancedMarker>
                ))}
                <AdvancedMarker
                  position={{ lat: currentPoint.lat, lng: currentPoint.lng }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#76FFB2] border-2 border-white shadow-lg" />
                </AdvancedMarker>
              </GoogleMap>
            </div>
          </APIProvider>
        ) : (
          <svg
            viewBox="0 0 280 200"
            className="w-full h-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = ((e.clientX - rect.left) / rect.width) * 280;
              const clickY = ((e.clientY - rect.top) / rect.height) * 200;
              let bestIdx = 0;
              let bestDist = Infinity;
              course.points.forEach((pt, idx) => {
                const p = projectLatLng(pt.lat, pt.lng);
                const d = Math.hypot(p.x - clickX, p.y - clickY);
                if (d < bestDist) {
                  bestDist = d;
                  bestIdx = idx;
                }
              });
              onSeekRatio(bestIdx / Math.max(1, course.points.length - 1));
            }}
          >
            <defs>
              <radialGradient id="pastelMapGlow" cx="50%" cy="50%" r="60%">
                <stop
                  offset="0%"
                  stopColor={theme.treeFoliagePrimaryHex}
                  stopOpacity="0.22"
                />
                <stop offset="100%" stopColor="#080A1C" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="280" height="200" fill="url(#pastelMapGlow)" />
            {[40, 80, 120, 160, 200, 240].map((gx) => (
              <line
                key={`gx-${gx}`}
                x1={gx}
                y1={0}
                x2={gx}
                y2={200}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            ))}
            {[40, 80, 120, 160].map((gy) => (
              <line
                key={`gy-${gy}`}
                x1={0}
                y1={gy}
                x2={280}
                y2={gy}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            ))}

            {/* Water & Park Terrain Polygons */}
            {course.mapPolygons.map((poly) => {
              const pts = poly.coordinates
                .map((c) => {
                  const p = projectLatLng(c.lat, c.lng);
                  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                })
                .join(' ');
              return (
                <polygon
                  key={poly.id}
                  points={pts}
                  fill={
                    poly.type === 'water'
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'rgba(118, 255, 178, 0.15)'
                  }
                  stroke={
                    poly.type === 'water'
                      ? 'rgba(56, 189, 248, 0.4)'
                      : 'rgba(118, 255, 178, 0.35)'
                  }
                  strokeWidth="1"
                />
              );
            })}

            {/* Surrounding 2.5D Building Footprints */}
            {buildingFootprints.map((b, idx) => (
              <rect
                key={`bld-${idx}`}
                x={b.x - b.w / 2}
                y={b.y - b.h / 2}
                width={b.w}
                height={b.h}
                rx={1.5}
                fill={b.color}
                fillOpacity={0.28}
                stroke={b.color}
                strokeOpacity={0.6}
                strokeWidth={0.8}
                transform={`rotate(${b.rot} ${b.x} ${b.y})`}
              />
            ))}

            {/* 1. Wide Outer Route Glow */}
            <polyline
              fill="none"
              stroke={theme.treeFoliagePrimaryHex}
              strokeOpacity="0.28"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trackSvgPoints}
            />

            {/* 2. Crisp Dark Roadbed Casing */}
            <polyline
              fill="none"
              stroke="#050714"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trackSvgPoints}
            />

            {/* 3. Full GPX Course Base Line */}
            <polyline
              fill="none"
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trackSvgPoints}
            />

            {/* 4. Dashed Center Lane Markings */}
            <polyline
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.7"
              strokeWidth="1.4"
              strokeDasharray="4 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trackSvgPoints}
            />

            {/* 5. Active Traversed GPX Segment */}
            <polyline
              fill="none"
              stroke={theme.groundPrimaryHex}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={traversedSvgPoints}
            />

            {/* 6. Directional Chevrons along the GPX Track */}
            {directionArrows.map((arr, idx) => (
              <g
                key={`arr-${idx}`}
                transform={`translate(${arr.x}, ${arr.y}) rotate(${arr.deg})`}
              >
                <polygon
                  points="-3,-3.5 4,0 -3,3.5"
                  fill="#FFFFFF"
                  fillOpacity="0.9"
                />
              </g>
            ))}

            {/* 7. Kilometer Split Markers */}
            {kmMarkers.map((m) => (
              <g key={`km-${m.km}`} transform={`translate(${m.x}, ${m.y})`}>
                <rect
                  x="-11"
                  y="-7"
                  width="22"
                  height="14"
                  rx="4"
                  fill="#0B0C22"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="7.5"
                  fontWeight="700"
                >
                  {m.km}K
                </text>
              </g>
            ))}

            {/* 8. START Badge */}
            <g
              transform={`translate(${startProjected.x}, ${startProjected.y})`}
            >
              <circle
                r="6"
                fill="#FF85B8"
                stroke="#FFFFFF"
                strokeWidth="1.8"
              />
              <text
                x="0"
                y="2.5"
                textAnchor="middle"
                fill="#0B0C22"
                fontSize="7"
                fontWeight="800"
              >
                S
              </text>
            </g>

            {/* 9. Surrounding Landmark Pins */}
            {course.landmarks.map((lm) => {
              const p = projectLatLng(lm.lat, lm.lng);
              const isSelected = selectedLandmark?.id === lm.id;
              return (
                <g
                  key={lm.id}
                  className="cursor-pointer"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelectLandmark(lm);
                    onSeekRatio(
                      Math.min(
                        0.99,
                        lm.distKm / Math.max(0.1, course.totalDistanceKm)
                      )
                    );
                  }}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 7.5 : 5}
                    fill={lm.primaryColor}
                    stroke="#0B0C22"
                    strokeWidth="1.5"
                  />
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="8.5"
                    fontWeight="600"
                  >
                    {lm.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

            {/* 10. Current Runner Directional Cone & Glowing Marker */}
            <g
              transform={`translate(${runnerProjected.x}, ${runnerProjected.y})`}
            >
              <g transform={`rotate(${headingDeg})`}>
                <polygon
                  points="0,0 22,-9 22,9"
                  fill={theme.groundPrimaryHex}
                  fillOpacity="0.4"
                />
              </g>
              <circle
                r="7.5"
                fill={theme.groundPrimaryHex}
                stroke="#0B0C22"
                strokeWidth="2.2"
              />
              <circle r="3" fill="#FFFFFF" />
            </g>
          </svg>
        )}

        {/* Live GPS Coordinate Readout Overlay */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono-tabular text-slate-300 bg-[#0B0C22]/90 px-2.5 py-1 rounded-lg border border-white/10">
          <span>
            {currentPoint.lat.toFixed(4)}°N · {currentPoint.lng.toFixed(4)}°E
          </span>
          <span className="text-[#76FFB2]">Click path to warp</span>
        </div>
      </div>

      {/* Surrounding Environment & Landmark Inspector */}
      <div className="p-3 space-y-2.5 bg-[#131636]">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium text-white">
            <Layers className="w-3.5 h-3.5 text-[#76FFB2]" />
            Surrounding Biome
          </span>
          <span className="text-[11px] text-slate-300">
            {biomeLabelMap[currentPoint.biome] || 'Pastel Meadow Terrain'}
          </span>
        </div>

        {/* Landmark Quick Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {course.landmarks.map((lm) => {
            const active = selectedLandmark?.id === lm.id;
            return (
              <button
                key={lm.id}
                type="button"
                onClick={() => {
                  onSelectLandmark(lm);
                  onSeekRatio(
                    Math.min(
                      0.99,
                      lm.distKm / Math.max(0.1, course.totalDistanceKm)
                    )
                  );
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                  active
                    ? 'bg-white text-[#0B0C22] border-white shadow-sm'
                    : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10'
                }`}
              >
                <Building2 className="w-3 h-3 shrink-0" />
                <span>{lm.name}</span>
                <span className="opacity-70 font-mono-tabular">
                  {lm.distKm.toFixed(1)}km
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Landmark Detail Box */}
        {selectedLandmark && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF85B8]" />
                {selectedLandmark.name}
              </span>
              <span className="font-mono-tabular text-[11px] text-slate-300">
                {selectedLandmark.distKm.toFixed(2)} km · Height{' '}
                {selectedLandmark.heightMeters}m
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {selectedLandmark.description}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
