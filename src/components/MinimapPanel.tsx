import React, { useEffect, useMemo, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  ArtworkThemeId,
  GpxCourseData,
  GpxTrackPoint,
  PACE_BUCKETS,
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
    const padLat = Math.max(0.0014, (maxLat - minLat) * 0.2);
    const padLng = Math.max(0.0014, (maxLng - minLng) * 0.2);
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
      240;
    const y =
      (1 -
        (lat - bounds.minLat) /
          Math.max(0.0001, bounds.maxLat - bounds.minLat)) *
      180;
    return { x, y };
  };

  const trackSvgPoints = useMemo(() => {
    return course.points
      .map((pt) => {
        const { x, y } = projectLatLng(pt.lat, pt.lng);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [course, bounds]);

  // Pace-colored route segments on the map
  const paceSegments = useMemo(() => {
    const segs: Array<{ points: string; color: string }> = [];
    const pts = course.points;
    if (pts.length < 2) return segs;

    const step = Math.max(1, Math.floor(pts.length / 180));
    let currentBucket = pts[0].paceBucket ?? 1;
    let currentCoords: string[] = [];

    for (let i = 0; i < pts.length; i += step) {
      const pt = pts[i];
      const proj = projectLatLng(pt.lat, pt.lng);
      const coord = `${proj.x.toFixed(1)},${proj.y.toFixed(1)}`;
      const bucket = pt.paceBucket ?? 1;

      if (bucket !== currentBucket && currentCoords.length >= 2) {
        currentCoords.push(coord);
        segs.push({
          points: currentCoords.join(' '),
          color: PACE_BUCKETS[currentBucket]?.color || '#3fc39a',
        });
        currentBucket = bucket;
        currentCoords = [coord];
      } else {
        currentCoords.push(coord);
      }
    }

    const lastPt = pts[pts.length - 1];
    const lastProj = projectLatLng(lastPt.lat, lastPt.lng);
    currentCoords.push(`${lastProj.x.toFixed(1)},${lastProj.y.toFixed(1)}`);

    if (currentCoords.length >= 2) {
      segs.push({
        points: currentCoords.join(' '),
        color: PACE_BUCKETS[currentBucket]?.color || '#3fc39a',
      });
    }
    return segs;
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

  const startProjected = projectLatLng(
    course.points[0].lat,
    course.points[0].lng
  );
  const finishProjected = projectLatLng(
    course.points[course.points.length - 1].lat,
    course.points[course.points.length - 1].lng
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

  return (
    <aside className="w-[220px] sm:w-[250px] bg-[#0B0C22]/85 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
      <div className="relative w-full h-[165px] sm:h-[185px] bg-[#080A1C] overflow-hidden">
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
                  <div className="w-4 h-4 rounded-full bg-[#d1bcd6] border-2 border-white shadow-lg" />
                </AdvancedMarker>
              </GoogleMap>
            </div>
          </APIProvider>
        ) : (
          <svg
            viewBox="0 0 240 180"
            className="w-full h-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = ((e.clientX - rect.left) / rect.width) * 240;
              const clickY = ((e.clientY - rect.top) / rect.height) * 180;
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
                  stopOpacity="0.2"
                />
                <stop offset="100%" stopColor="#080A1C" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="240" height="180" fill="url(#pastelMapGlow)" />
            {[40, 80, 120, 160, 200].map((gx) => (
              <line
                key={`gx-${gx}`}
                x1={gx}
                y1={0}
                x2={gx}
                y2={180}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}
            {[45, 90, 135].map((gy) => (
              <line
                key={`gy-${gy}`}
                x1={0}
                y1={gy}
                x2={240}
                y2={gy}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            ))}

            {/* 1. Outer Route Glow */}
            <polyline
              fill="none"
              stroke={theme.treeFoliagePrimaryHex}
              strokeOpacity="0.22"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trackSvgPoints}
            />

            {/* 2. Dark Roadbed Casing */}
            <polyline
              fill="none"
              stroke="#050714"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trackSvgPoints}
            />

            {/* 3. Real Pace Colored Route Segments */}
            {paceSegments.map((seg, i) => (
              <polyline
                key={`pace-seg-${i}`}
                fill="none"
                stroke={seg.color}
                strokeOpacity="0.55"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={seg.points}
              />
            ))}

            {/* 4. Active Traversed Segment */}
            <polyline
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={traversedSvgPoints}
            />

            {/* 5. START Marker */}
            <g
              transform={`translate(${startProjected.x}, ${startProjected.y})`}
            >
              <circle
                r="5"
                fill="#3fc39a"
                stroke="#0B0C22"
                strokeWidth="1.5"
              />
            </g>

            {/* 6. FINISH Marker */}
            <g
              transform={`translate(${finishProjected.x}, ${finishProjected.y})`}
            >
              <circle
                r="5.5"
                fill="#FACC15"
                stroke="#0B0C22"
                strokeWidth="1.5"
              />
            </g>

            {/* 7. Current Runner Directional Cone & Glowing Marker */}
            <g
              transform={`translate(${runnerProjected.x}, ${runnerProjected.y})`}
            >
              <g transform={`rotate(${headingDeg})`}>
                <polygon
                  points="0,0 18,-7 18,7"
                  fill={theme.groundPrimaryHex}
                  fillOpacity="0.45"
                />
              </g>
              <circle
                r="6.5"
                fill={theme.groundPrimaryHex}
                stroke="#0B0C22"
                strokeWidth="2"
              />
              <circle r="2.5" fill="#FFFFFF" />
            </g>
          </svg>
        )}
      </div>
    </aside>
  );
};
