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
  ArtworkThemeId,
  CharacterModelId,
  CourseRunRecord,
  GpxCourseData,
} from '../types/gpx';
import { ARTWORK_THEMES, formatDuration, formatPace } from '../utils/gpxParser';
import { GameStatsUpdate, POINTS_PER_COIN } from './PastelWorldCanvas';

export interface CharacterMeta {
  id: CharacterModelId;
  name: string;
  role: string;
  perk: string;
  primaryHex: string;
  secondaryHex: string;
  hatHex: string;
  bgHex: string;
}

export const FIVE_CHARACTERS: CharacterMeta[] = [
  {
    id: 'mint_sprinter',
    name: 'Mint',
    role: 'Teal Bucket-Hat Walker',
    perk: 'Turquoise character with beige bucket hat & coral tunic',
    primaryHex: '#0FB5BA',
    secondaryHex: '#F6B76B',
    hatHex: '#EED09D',
    bgHex: '#79C2E6',
  },
  {
    id: 'flower_orb',
    name: 'Bloom',
    role: 'Flower Planter Orb',
    perk: 'Aqua-to-pink gradient orb with sprouting pink flower',
    primaryHex: '#5BE2D8',
    secondaryHex: '#F86CC8',
    hatHex: '#F779E6',
    bgHex: '#E8C5A5',
  },
  {
    id: 'topknot_kid',
    name: 'Momo',
    role: 'Sprout Topknot Kid',
    perk: 'Happy arch-eyes with sprout topknot & pink romper',
    primaryHex: '#F5A3E0',
    secondaryHex: '#1FC8B5',
    hatHex: '#EDE8B8',
    bgHex: '#CE9CE8',
  },
  {
    id: 'hoodie_kid',
    name: 'Sunny',
    role: 'Cozy Yellow Hoodie',
    perk: 'Yellow-to-aqua hoodie with teal bangs & drawstrings',
    primaryHex: '#FCE192',
    secondaryHex: '#1CC7C6',
    hatHex: '#FCE192',
    bgHex: '#7CC8F2',
  },
  {
    id: 'starlight_fox',
    name: 'Coco',
    role: 'X-Eye Topknot Kid',
    perk: 'Playful X-eyes, peach head, teal band & romper',
    primaryHex: '#F7C58E',
    secondaryHex: '#0FB8B9',
    hatHex: '#F6D48F',
    bgHex: '#79C9F2',
  },
];

/**
 * 3D-shaded full-character illustration matching each of the 5 attached 3D character images
 */
export const Character3DThumbnail: React.FC<{
  char: CharacterMeta;
  size?: number;
}> = ({ char, size = 76 }) => {
  const uid = `char3d-${char.id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 112"
      className="shrink-0 rounded-2xl overflow-hidden shadow-md"
    >
      <defs>
        {/* Soft 3D Specular Highlight Overlay */}
        <radialGradient id={`${uid}-shine`} cx="32%" cy="26%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.52" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </radialGradient>

        {/* 1. Mint (Teal head + beige hat + peach-coral tunic) gradients */}
        <radialGradient id={`${uid}-teal`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#5CE6E9" />
          <stop offset="55%" stopColor="#0FB5BA" />
          <stop offset="100%" stopColor="#087E84" />
        </radialGradient>
        <linearGradient id={`${uid}-tunic`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F7C97E" />
          <stop offset="55%" stopColor="#F5A66B" />
          <stop offset="100%" stopColor="#EC7E6D" />
        </linearGradient>
        <linearGradient id={`${uid}-hat`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8E2B8" />
          <stop offset="100%" stopColor="#DEC08A" />
        </linearGradient>

        {/* 2. Bloom (Aqua-lavender-pink orb + flower) gradients */}
        <linearGradient id={`${uid}-orb`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5BE2D8" />
          <stop offset="48%" stopColor="#C8B6F6" />
          <stop offset="100%" stopColor="#F85CC4" />
        </linearGradient>

        {/* 3. Momo (Cream-to-aqua head + pink romper) gradients */}
        <linearGradient id={`${uid}-momo-head`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F3E8BC" />
          <stop offset="60%" stopColor="#BEE3C8" />
          <stop offset="100%" stopColor="#26C2BE" />
        </linearGradient>
        <linearGradient id={`${uid}-momo-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAD0EC" />
          <stop offset="60%" stopColor="#F39CE0" />
          <stop offset="100%" stopColor="#DA5BD2" />
        </linearGradient>

        {/* 4. Sunny (Yellow-to-aqua hoodie + pink face) gradients */}
        <linearGradient id={`${uid}-hoodie`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE59B" />
          <stop offset="62%" stopColor="#EFE3A7" />
          <stop offset="100%" stopColor="#12C4C3" />
        </linearGradient>
        <radialGradient id={`${uid}-pink-skin`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFD6D6" />
          <stop offset="65%" stopColor="#F5B1B3" />
          <stop offset="100%" stopColor="#E09397" />
        </radialGradient>

        {/* 5. Coco (Peach head + teal romper) gradients */}
        <radialGradient id={`${uid}-peach`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FBE0B4" />
          <stop offset="60%" stopColor="#F5B882" />
          <stop offset="100%" stopColor="#EC8C6B" />
        </radialGradient>
      </defs>

      {/* Studio Backdrop matching each reference photo */}
      <rect width="100" height="112" rx="16" fill={char.bgHex} />
      <ellipse cx="50" cy="103" rx="28" ry="4.5" fill="rgba(0,0,0,0.12)" />

      {/* =====================================================================
       * CHARACTER 1: MINT (Image 1 - Teal head, beige bucket hat, peach tunic)
       * =================================================================== */}
      {char.id === 'mint_sprinter' && (
        <g>
          {/* Teal Legs & Coral Boots */}
          <rect x="38" y="78" width="7.5" height="17" rx="3.5" fill="#0CA2A7" />
          <rect x="53" y="78" width="7.5" height="17" rx="3.5" fill="#0FB5BA" />
          <path d="M 35 92 H 48 V 101 C 48 103, 33 103, 33 99 Z" fill="#EC836D" />
          <rect x="36" y="90" width="11" height="3.5" rx="1.5" fill="#F5C078" />
          <path d="M 51 92 H 66 C 68 92, 69 101, 66 102 H 51 Z" fill="#EC836D" />
          <rect x="51" y="90" width="11" height="3.5" rx="1.5" fill="#F5C078" />

          {/* Bell-shaped Peach-to-Coral Tunic */}
          <path
            d="M 34 55 C 27 63, 25 81, 30 83 H 70 C 75 81, 73 63, 66 55 Z"
            fill={`url(#${uid}-tunic)`}
          />
          {/* Short Sleeve & Teal Arm */}
          <rect x="44" y="55" width="11" height="9" rx="4.5" fill="#F5A66B" />
          <path
            d="M 46 62 L 44 74 M 46 62 L 49 75 M 46 62 L 53 72"
            stroke="#0FB5BA"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Big Round Teal Head */}
          <circle cx="50" cy="37" r="21" fill={`url(#${uid}-teal)`} />

          {/* Eyes, Cheeks & Smile */}
          <ellipse cx="44" cy="38" rx="4.6" ry="5.2" fill="#FFFFFF" />
          <ellipse cx="57" cy="38" rx="4.6" ry="5.2" fill="#FFFFFF" />
          <circle cx="44.5" cy="38.5" r="3" fill="#17253B" />
          <circle cx="57.5" cy="38.5" r="3" fill="#17253B" />
          <circle cx="43.5" cy="37" r="1" fill="#FFFFFF" />
          <circle cx="56.5" cy="37" r="1" fill="#FFFFFF" />
          <ellipse cx="37" cy="43.5" rx="4.2" ry="2.5" fill="#EF9DB6" />
          <ellipse cx="63" cy="43.5" rx="4.2" ry="2.5" fill="#EF9DB6" />
          <path
            d="M 47.5 43.5 Q 51 47.5 54.5 43.5"
            stroke="#17253B"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Beige Dome Bucket Hat */}
          <path
            d="M 31 22 C 32 9, 68 9, 69 22 Z"
            fill={`url(#${uid}-hat)`}
          />
          <rect x="27" y="19" width="46" height="6.5" rx="3.2" fill={`url(#${uid}-hat)`} />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 2: BLOOM (Image 2 - Gradient Orb with Top Sprout & Pink Flower)
       * =================================================================== */}
      {char.id === 'flower_orb' && (
        <g>
          {/* Pink Legs & Gradient Boots */}
          <rect x="38" y="76" width="6.5" height="19" rx="3" fill="#FCA5E0" />
          <rect x="55" y="76" width="6.5" height="19" rx="3" fill="#FCA5E0" />
          <path d="M 32 94 H 46 V 101 C 46 103, 31 103, 32 94 Z" fill="#E87AD8" />
          <path d="M 54 94 H 68 C 69 103, 54 103, 54 101 Z" fill="#E87AD8" />
          <rect x="37" y="92.5" width="8.5" height="2.5" rx="1.2" fill="#5BE2D8" />
          <rect x="54.5" y="92.5" width="8.5" height="2.5" rx="1.2" fill="#5BE2D8" />

          {/* Side Pink Arms */}
          <path
            d="M 22 48 L 17 75 M 78 48 L 83 75"
            stroke="#FCA5E0"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Main Gradient Orb Body */}
          <circle cx="50" cy="54" r="28" fill={`url(#${uid}-orb)`} />
          <circle cx="50" cy="54" r="28" fill={`url(#${uid}-shine)`} />

          {/* Green Leaves & Pink Flower on Top */}
          <ellipse cx="43" cy="27" rx="4" ry="7" transform="rotate(-28 43 27)" fill="#06D6A0" />
          <ellipse cx="50" cy="25" rx="4" ry="8" fill="#10B981" />
          <ellipse cx="57" cy="27" rx="4" ry="7" transform="rotate(28 57 27)" fill="#06D6A0" />
          <path
            d="M 50 25 Q 52 14 58 12"
            stroke="#06D6A0"
            strokeWidth="2.5"
            fill="none"
          />
          {/* Flower Petals */}
          <g transform="translate(60, 12)">
            <circle cx="-5" cy="-2" r="3.8" fill="#F779E6" />
            <circle cx="5" cy="-2" r="3.8" fill="#F779E6" />
            <circle cx="-3" cy="4" r="3.8" fill="#E85BD8" />
            <circle cx="3" cy="4" r="3.8" fill="#E85BD8" />
            <circle cx="0" cy="-5" r="3.8" fill="#F779E6" />
            <circle cx="0" cy="0" r="3.5" fill="#FACC15" />
          </g>

          {/* Glossy Dark Eyes & Thick Yellow Duck Lips */}
          <circle cx="42.5" cy="50" r="4.8" fill="#27242C" />
          <circle cx="57.5" cy="50" r="4.8" fill="#27242C" />
          <circle cx="41" cy="48.5" r="1.3" fill="#FFFFFF" opacity="0.8" />
          <circle cx="56" cy="48.5" r="1.3" fill="#FFFFFF" opacity="0.8" />
          <rect x="41" y="56.5" width="18" height="8.5" rx="4.2" fill="#FACC15" />
          <path d="M 44 60.8 Q 50 62.5 56 60.8" stroke="#CA8A04" strokeWidth="1.4" fill="none" />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 3: MOMO (Image 3 - Sprout Topknot, Arch Eyes, Pink Romper)
       * =================================================================== */}
      {char.id === 'topknot_kid' && (
        <g>
          {/* Teal Legs & Pink Boots */}
          <rect x="39" y="79" width="6" height="15" rx="3" fill="#1FC8B5" />
          <rect x="55" y="79" width="6" height="15" rx="3" fill="#1FC8B5" />
          <path d="M 34 92 H 46 V 100 H 34 Z" fill="#EE99E2" />
          <path d="M 54 92 H 66 V 100 H 54 Z" fill="#EE99E2" />
          <rect x="38" y="90" width="8" height="2.5" rx="1" fill="#FDE047" />
          <rect x="54" y="90" width="8" height="2.5" rx="1" fill="#FDE047" />

          {/* Curved Teal Arms */}
          <path
            d="M 35 61 Q 23 65 25 75 M 65 61 Q 77 65 75 75"
            stroke="#1FC8B5"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Rounded Pink Romper Body */}
          <circle cx="50" cy="69" r="15.5" fill={`url(#${uid}-momo-body)`} />

          {/* Topknot Sprout Plumes & Pink Double Hairband */}
          <ellipse cx="43" cy="14" rx="5.5" ry="3.2" transform="rotate(25 43 14)" fill="#EDE8B8" />
          <ellipse cx="57" cy="14" rx="5.5" ry="3.2" transform="rotate(-25 57 14)" fill="#EDE8B8" />
          <ellipse cx="50" cy="13" rx="3.5" ry="5.5" fill="#A7F3D0" />
          <rect x="42" y="17.5" width="16" height="3.5" rx="1.7" fill="#F497DA" />
          <rect x="42" y="21" width="16" height="3.5" rx="1.7" fill="#EC6BD0" />

          {/* Cream-to-Aqua Round Head */}
          <circle cx="50" cy="40" r="19" fill={`url(#${uid}-momo-head)`} />

          {/* Happy Arch Eyes, Round Coral Nose & Thick Coral Lips */}
          <path
            d="M 41 37 Q 44.5 32.5 48 37 M 52 37 Q 55.5 32.5 59 37"
            stroke="#27242C"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="50" cy="40.5" r="2.7" fill="#F97E6B" />
          <rect x="42" y="44" width="16" height="8" rx="4" fill="#F97E6B" />
          <path d="M 45 48 Q 50 49.5 55 48" stroke="#9A3412" strokeWidth="1.3" fill="none" />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 4: SUNNY (Image 4 - Cozy Yellow-to-Aqua Hoodie & Teal Bangs)
       * =================================================================== */}
      {char.id === 'hoodie_kid' && (
        <g>
          {/* Pink Legs & Aqua Boots */}
          <rect x="41" y="77" width="5.5" height="16" rx="2.5" fill="#F5B1B3" />
          <rect x="53.5" y="77" width="5.5" height="16" rx="2.5" fill="#F5B1B3" />
          <path d="M 37 91 H 47.5 V 100 H 37 Z" fill="#18C5C4" />
          <path d="M 52.5 91 H 63 V 100 H 52.5 Z" fill="#18C5C4" />

          {/* Hoodie Sleeves & Pink Hands */}
          <path
            d="M 33 55 L 25 71 M 67 55 L 75 71"
            stroke={`url(#${uid}-hoodie)`}
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="74" r="3.5" fill="#F5B1B3" />
          <circle cx="76" cy="74" r="3.5" fill="#F5B1B3" />

          {/* Bell-Shaped Yellow-to-Aqua Hoodie Torso */}
          <path
            d="M 33 52 C 28 60, 28 77, 33 78 H 67 C 72 77, 72 60, 67 52 Z"
            fill={`url(#${uid}-hoodie)`}
          />

          {/* Outer Yellow Hood */}
          <circle cx="50" cy="34" r="22" fill="#FCE192" />
          {/* Inner Pink Face */}
          <circle cx="50" cy="35" r="16.5" fill={`url(#${uid}-pink-skin)`} />
          {/* Parted Teal Bangs */}
          <path
            d="M 33.5 33 C 35 20, 48 18, 50 22 C 52 18, 65 20, 66.5 33 C 60 29, 53 26, 50 22 C 47 26, 40 29, 33.5 33 Z"
            fill="#19C6C4"
          />

          {/* Big White Eyes, Cheeks & Smile */}
          <circle cx="44" cy="36" r="4.5" fill="#FFFFFF" />
          <circle cx="56" cy="36" r="4.5" fill="#FFFFFF" />
          <circle cx="44" cy="36" r="2.8" fill="#1E293B" />
          <circle cx="56" cy="36" r="2.8" fill="#1E293B" />
          <circle cx="43" cy="35" r="0.9" fill="#FFFFFF" />
          <circle cx="55" cy="35" r="0.9" fill="#FFFFFF" />
          <ellipse cx="38" cy="40.5" rx="3.8" ry="2.2" fill="#F28CA3" />
          <ellipse cx="62" cy="40.5" rx="3.8" ry="2.2" fill="#F28CA3" />
          <path
            d="M 47.5 41 Q 50 44 52.5 41"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cyan Hoodie Drawstrings */}
          <path
            d="M 47 52 L 44 60 M 53 52 L 56 60"
            stroke="#12C4C3"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="44" cy="60.5" r="1.8" fill="#12C4C3" />
          <circle cx="56" cy="60.5" r="1.8" fill="#12C4C3" />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 5: COCO (Image 5 - X-Eyes, Peach Head, Teal Band & Romper)
       * =================================================================== */}
      {char.id === 'starlight_fox' && (
        <g>
          {/* Pastel Pink Legs & Coral Boots */}
          <rect x="40" y="79" width="5.8" height="15" rx="2.8" fill="#F5B1B3" />
          <rect x="54.2" y="79" width="5.8" height="15" rx="2.8" fill="#F5B1B3" />
          <rect x="36" y="92" width="11" height="8" rx="3.5" fill="#EF8A6B" />
          <rect x="53" y="92" width="11" height="8" rx="3.5" fill="#EF8A6B" />

          {/* Pastel Pink Arms */}
          <path
            d="M 35 63 L 24 76 M 65 63 L 76 76"
            stroke="#F5B1B3"
            strokeWidth="5.8"
            strokeLinecap="round"
          />
          <circle cx="23.5" cy="77" r="3.5" fill="#F5B1B3" />
          <circle cx="76.5" cy="77" r="3.5" fill="#F5B1B3" />

          {/* Teal Rounded Romper Body */}
          <circle cx="50" cy="69" r="14.5" fill="#0FB8B9" />

          {/* Topknot Yellow Plumes & Double Teal Hairband */}
          <ellipse cx="43" cy="14" rx="5.5" ry="3.2" transform="rotate(25 43 14)" fill="#F6D48F" />
          <ellipse cx="57" cy="14" rx="5.5" ry="3.2" transform="rotate(-25 57 14)" fill="#F6D48F" />
          <ellipse cx="50" cy="13" rx="3.5" ry="5.5" fill="#FDE68A" />
          <rect x="42" y="17.5" width="16" height="3.5" rx="1.7" fill="#10B8B9" />
          <rect x="42" y="21" width="16" height="3.5" rx="1.7" fill="#0D9488" />

          {/* Warm Peach Round Head */}
          <circle cx="50" cy="41" r="19" fill={`url(#${uid}-peach)`} />

          {/* Playful X X Eyes & Big Laughing Mouth */}
          <path
            d="M 41 34 L 46 39 M 46 34 L 41 39 M 54 34 L 59 39 M 59 34 L 54 39"
            stroke="#1E293B"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M 43 43 H 57 C 57 52, 43 52, 43 43 Z"
            fill="#F43F5E"
            stroke="#FB7185"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 1. HOME SCREEN (#screen-home | camera: portrait)
 * ========================================================================== */
export const HomeScreenOverlay: React.FC<{
  isLoadingRuns: boolean;
  onClickMyRuns: () => void;
}> = ({ isLoadingRuns, onClickMyRuns }) => {
  return (
    <section
      id="screen-home"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-center p-6 sm:p-12 select-none"
    >
      {/* Left-aligned Hero Typography + 'Run!' Button only */}
      <div className="my-auto max-w-2xl space-y-6 pointer-events-auto">
        <div className="space-y-3">
          <h1
            className="font-display font-extrabold tracking-tight text-white leading-[0.96] drop-shadow-[0_8px_30px_rgba(0,0,0,0.65)]"
            style={{
              fontSize: 'clamp(2.8rem, min(10vw, 18vh), 6.8rem)',
            }}
          >
            Run at
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d1bcd6] via-[#FF85B8] to-[#FDE68A]">
              Your Pace
            </span>
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-slate-200 tracking-tight drop-shadow">
            The route you ran becomes the course.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClickMyRuns}
            disabled={isLoadingRuns}
            className="px-10 py-4 rounded-full bg-[#d1bcd6] hover:bg-[#decce3] active:scale-95 text-[#070818] text-lg font-extrabold flex items-center gap-3 transition-all shadow-[0_0_35px_rgba(209,188,214,0.4)] cursor-pointer"
          >
            {isLoadingRuns ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-[#070818] border-t-transparent animate-spin" />
                <span>Run!</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Run!</span>
              </>
            )}
          </button>
        </div>
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
      className="fixed inset-0 z-30 bg-[#d1bcd6] overflow-y-auto p-6 sm:p-10 text-white select-none"
      style={{ backgroundColor: '#d1bcd6' }}
    >
      <div className="max-w-4xl mx-auto lg:mr-auto lg:ml-6 space-y-6 pb-16">
        {/* Header with ← Back button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-full bg-[#11132E]/90 hover:bg-[#1B1F46] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#1E1B4B]">
                My Stats
              </h1>
              <p className="text-xs text-[#4C3B63] font-medium">
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
            <span className="text-xs text-[#d1bcd6] font-semibold">
              Active Main: {FIVE_CHARACTERS.find((c) => c.id === mainCharacterId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {FIVE_CHARACTERS.map((char) => {
              const isMain = char.id === mainCharacterId;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => onSelectMainCharacter(char.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2.5 relative cursor-pointer ${
                    isMain
                      ? 'bg-white/15 border-[#d1bcd6] shadow-[0_0_20px_rgba(209,188,214,0.25)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isMain && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#d1bcd6] text-[#070818] text-[10px] font-extrabold">
                      Main
                    </span>
                  )}
                  <Character3DThumbnail char={char} size={60} />
                  <div className="text-xs font-extrabold text-white truncate">
                    {char.name}
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
            <div className="text-2xl font-extrabold font-mono-tabular text-[#d1bcd6] mt-1">
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
              className="h-full bg-[#d1bcd6]"
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#d1bcd6]" />
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
                        <div className="text-[11px] text-[#d1bcd6]">
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
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#d1bcd6] text-white hover:text-[#070818] text-xs font-bold transition-colors"
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

        <div className="px-4 py-2 rounded-full bg-[#11132E]/90 border border-white/15 text-xs font-semibold text-[#d1bcd6]">
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
              stroke="rgba(209,188,214,0.25)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pathPoints}
            />
            <polyline
              fill="none"
              stroke="#d1bcd6"
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
            <div className="text-lg font-extrabold font-mono-tabular text-[#d1bcd6] mt-0.5">
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#d1bcd6]" />
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
            <span>How to Play (1.3x Locked Speed · 3-Lane Coin Rush)</span>
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
          className="w-full py-4 rounded-2xl bg-[#d1bcd6] hover:bg-[#decce3] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
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
          Course: <span className="text-[#d1bcd6]">{course.shortTitle}</span>
        </div>
      </div>

      {/* Compact Right-aligned Panel on wide screens (and bottom-aligned on mobile) so the 3D character stands in full view on the left/top */}
      <div className="mt-auto sm:my-auto sm:ml-auto max-w-sm w-full bg-[#0E1028]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 pointer-events-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold font-display text-white">
            Who&apos;s running?
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-extrabold text-[#d1bcd6]">
            {FIVE_CHARACTERS.find((c) => c.id === raceCharacterId)?.name}
          </span>
        </div>

        {/* 5 Character Cards Grid with Rendered 3D Thumbnails & Short Nickname Only */}
        <div className="grid grid-cols-3 gap-2.5">
          {FIVE_CHARACTERS.map((char) => {
            const isSelected = char.id === raceCharacterId;
            const isMain = char.id === mainCharacterId;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectRaceCharacter(char.id)}
                className={`relative p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-[#d1bcd6] ring-2 ring-[#d1bcd6]/50 shadow-[0_0_25px_rgba(209,188,214,0.25)] -translate-y-0.5'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {isMain && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#FACC15] text-[#070818] text-[9px] font-extrabold uppercase leading-none">
                    Main
                  </span>
                )}

                <Character3DThumbnail char={char} size={58} />

                <span className="text-xs font-extrabold text-white truncate">
                  {char.name}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onStartRunning}
          className="w-full py-3.5 rounded-2xl bg-[#d1bcd6] hover:bg-[#decce3] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
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
  onHome?: () => void;
  onRunAgain: () => void;
}> = ({
  course,
  characterId,
  stats,
  record,
  isNewBest,
  onCourses,
  onHome,
  onRunAgain,
}) => {
  const charMeta =
    FIVE_CHARACTERS.find((c) => c.id === characterId) || FIVE_CHARACTERS[0];
  const vsDelta = stats.vsPastYouSeconds;
  const beatPastYou = vsDelta <= 0;

  return (
    <section
      id="screen-result"
      className="fixed inset-0 z-30 bg-[#d1bcd6]/88 backdrop-blur-md flex items-center justify-center p-6 select-none"
    >
      <div className="max-w-xl w-full bg-[#0E1028]/95 border-2 border-[#FACC15]/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(250,204,21,0.25)] space-y-6 text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#d1bcd6]">
                Run Complete · Score Saved!
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

        {/* Hero Earned Score & Coins Banner */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#1A1D42] to-[#15253A] border border-[#FACC15]/40">
          <div>
            <div className="text-xs text-slate-300">Earned Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#FACC15] flex items-center gap-2 mt-0.5">
              <Trophy className="w-6 h-6 text-[#FACC15] shrink-0" />
              <span>{stats.score.toLocaleString()} PTS</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-300">Coins Collected</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#d1bcd6] flex items-center justify-end gap-1.5 mt-0.5">
              <Coins className="w-5 h-5 text-[#FACC15] shrink-0" />
              <span>
                {stats.coins}
                {stats.totalCoins > 0 ? ` / ${stats.totalCoins}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Core Run Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono-tabular">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              Finish Time (1.3x)
            </div>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatDuration(Math.max(1, Math.round(stats.runElapsedSeconds)))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-sans">
              vs Past You
            </div>
            <div
              className={`text-lg font-extrabold mt-0.5 ${
                beatPastYou ? 'text-[#d1bcd6]' : 'text-[#FF85B8]'
              }`}
            >
              {vsDelta <= 0 ? `${vsDelta.toFixed(1)}s Faster!` : `+${vsDelta.toFixed(1)}s`}
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

          <div className="p-3.5 rounded-2xl bg-white/5 border border-[#FACC15]/30">
            <div className="text-[11px] text-slate-400 font-sans">
              All-Time Best Score
            </div>
            <div className="text-lg font-extrabold text-[#FACC15] mt-0.5">
              {(record?.bestScore ?? stats.score).toLocaleString()} PTS
            </div>
          </div>
        </div>

        {/* Action Buttons: Return to Home | My Routes | Run again */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={onHome || onCourses}
            className="py-3.5 px-4 rounded-2xl bg-[#FACC15] hover:bg-[#fde047] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            onClick={onCourses}
            className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#d1bcd6]" />
            <span>My Routes</span>
          </button>

          <button
            type="button"
            onClick={onRunAgain}
            className="py-3.5 px-4 rounded-2xl bg-[#d1bcd6] hover:bg-[#decce3] text-[#070818] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Run Again</span>
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
      className="fixed inset-0 z-30 bg-[#d1bcd6]/88 backdrop-blur-md flex items-center justify-center p-6 select-none"
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
