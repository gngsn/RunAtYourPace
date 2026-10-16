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
    id: 'hoodie_kid',
    name: 'Hoodie',
    role: 'Cozy Yellow Hoodie (Main)',
    perk: 'Yellow-to-aqua hoodie with teal bangs & drawstrings',
    primaryHex: '#FCE192',
    secondaryHex: '#1CC7C6',
    hatHex: '#FCE192',
    bgHex: '#FFFFFF',
  },
  {
    id: 'topknot_kid',
    name: 'Momo',
    role: 'Sprout Topknot Kid',
    perk: 'Happy arch-eyes with sprout topknot & pink romper',
    primaryHex: '#F5A3E0',
    secondaryHex: '#1FC8B5',
    hatHex: '#EDE8B8',
    bgHex: '#FFFFFF',
  },
  {
    id: 'starlight_fox',
    name: 'Coco',
    role: 'X-Eye Topknot Kid',
    perk: 'Playful X-eyes, peach head, teal band & romper',
    primaryHex: '#F7C58E',
    secondaryHex: '#0FB8B9',
    hatHex: '#F6D48F',
    bgHex: '#FFFFFF',
  },
  {
    id: 'flower_orb',
    name: 'Bloom',
    role: 'Flower Planter Orb',
    perk: 'Aqua-to-pink gradient orb with sprouting pink flower',
    primaryHex: '#5BE2D8',
    secondaryHex: '#F86CC8',
    hatHex: '#F779E6',
    bgHex: '#FFFFFF',
  },
  {
    id: 'mint_sprinter',
    name: 'Mint',
    role: 'Beanie Tunic Kid',
    perk: 'Turquoise character with rolled beanie & coral tunic',
    primaryHex: '#06BFC4',
    secondaryHex: '#F6B76B',
    hatHex: '#FDE29C',
    bgHex: '#FFFFFF',
  },
];

/**
 * 3D-shaded full-character illustration matching each of the 5 attached cutout character images
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
      viewBox="0 0 100 116"
      className="shrink-0 rounded-2xl overflow-hidden shadow-md"
    >
      <defs>
        {/* Soft 3D Specular Highlight Overlay */}
        <radialGradient id={`${uid}-shine`} cx="32%" cy="26%" r="68%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.48" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
        </radialGradient>

        {/* 1. Hoodie (Yellow-to-aqua hoodie + pink face) gradients */}
        <linearGradient id={`${uid}-hoodie`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF0A8" />
          <stop offset="52%" stopColor="#F2E8A6" />
          <stop offset="85%" stopColor="#26D8CB" />
          <stop offset="100%" stopColor="#05C2C4" />
        </linearGradient>
        <radialGradient id={`${uid}-pink-skin`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFD8D6" />
          <stop offset="65%" stopColor="#FBBAB6" />
          <stop offset="100%" stopColor="#E69A98" />
        </radialGradient>

        {/* 2. Momo (Cream-to-aqua head + pink romper) gradients */}
        <linearGradient id={`${uid}-momo-head`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF2BA" />
          <stop offset="55%" stopColor="#C5ECC8" />
          <stop offset="100%" stopColor="#09BFC0" />
        </linearGradient>
        <linearGradient id={`${uid}-momo-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCDAD8" />
          <stop offset="50%" stopColor="#FAA8E4" />
          <stop offset="100%" stopColor="#F25CE0" />
        </linearGradient>

        {/* 3. Coco (Peach head + teal romper) gradients */}
        <radialGradient id={`${uid}-peach`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FDE4AF" />
          <stop offset="60%" stopColor="#FAB88A" />
          <stop offset="100%" stopColor="#F4956E" />
        </radialGradient>

        {/* 4. Bloom (Aqua-lavender-pink orb + flower) gradients */}
        <linearGradient id={`${uid}-orb`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#42F2D6" />
          <stop offset="48%" stopColor="#C4B2F8" />
          <stop offset="100%" stopColor="#FF42BF" />
        </linearGradient>
        <linearGradient id={`${uid}-bloom-boot`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7CD4F8" />
          <stop offset="50%" stopColor="#C4A8F8" />
          <stop offset="100%" stopColor="#FF5AD0" />
        </linearGradient>

        {/* 5. Mint (Teal head + rolled beanie + peach-coral tunic) gradients */}
        <radialGradient id={`${uid}-teal`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4CE8EC" />
          <stop offset="55%" stopColor="#06BFC4" />
          <stop offset="100%" stopColor="#048E94" />
        </radialGradient>
        <linearGradient id={`${uid}-tunic`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FECA6A" />
          <stop offset="58%" stopColor="#FCA46C" />
          <stop offset="100%" stopColor="#FA7A72" />
        </linearGradient>
        <linearGradient id={`${uid}-hat`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF0B8" />
          <stop offset="100%" stopColor="#F8D27C" />
        </linearGradient>
      </defs>

      {/* Clean White Studio Cutout Backdrop matching the 5 attached PNGs */}
      <rect width="100" height="116" rx="16" fill={char.bgHex} />
      <ellipse cx="50" cy="108" rx="26" ry="3.8" fill="rgba(0,0,0,0.08)" />

      {/* =====================================================================
       * CHARACTER 1 (MAIN): HOODIE (03_hoodie.png)
       * =================================================================== */}
      {char.id === 'hoodie_kid' && (
        <g>
          {/* Pink Legs, Yellow Ankle Cuffs & Chunky Aqua Boots */}
          <rect x="39.5" y="79" width="6.5" height="16" rx="3" fill="#FBBAB6" />
          <rect x="54" y="79" width="6.5" height="16" rx="3" fill="#FBBAB6" />
          <rect x="37.5" y="91" width="10.5" height="3.5" rx="1.7" fill="#FDE69E" />
          <rect x="52" y="91" width="10.5" height="3.5" rx="1.7" fill="#FDE69E" />
          <path d="M 31 94 H 48 V 105 C 48 107, 29 107, 30 99 Z" fill="#1EE0D2" />
          <path d="M 52 94 H 69 C 71 99, 70 107, 52 105 Z" fill="#1EE0D2" />

          {/* Gradient Hoodie Sleeves & Pink Hands */}
          <path
            d="M 32 58 L 22 76 M 68 58 L 78 76"
            stroke={`url(#${uid}-hoodie)`}
            strokeWidth="9.5"
            strokeLinecap="round"
          />
          <circle cx="21" cy="80" r="4.2" fill="#FBBAB6" />
          <circle cx="79" cy="80" r="4.2" fill="#FBBAB6" />

          {/* Bell-Shaped Yellow-to-Aqua Hoodie Torso */}
          <path
            d="M 32 54 C 26 62, 26 80, 31 82 H 69 C 74 80, 74 62, 68 54 Z"
            fill={`url(#${uid}-hoodie)`}
          />

          {/* Outer Oversized Cream-Yellow Hood */}
          <circle cx="50" cy="36" r="23.5" fill="#FDE69E" />
          {/* Inner Soft Pink Face */}
          <circle cx="50" cy="37" r="18" fill={`url(#${uid}-pink-skin)`} />
          {/* Parted Glossy Aqua-Teal Bangs */}
          <path
            d="M 32 35 C 34 20, 48 18, 50 22 C 52 18, 66 20, 68 35 C 61 31, 54 27, 50 22 C 46 27, 39 31, 32 35 Z"
            fill="#10D4C6"
          />

          {/* Big White Eyes, Black Pupils, Pink Cheeks & Smile */}
          <circle cx="43.5" cy="38" r="5" fill="#FFFFFF" />
          <circle cx="56.5" cy="38" r="5" fill="#FFFFFF" />
          <circle cx="43.5" cy="38" r="3.4" fill="#18181B" />
          <circle cx="56.5" cy="38" r="3.4" fill="#18181B" />
          <circle cx="42.3" cy="36.8" r="1.1" fill="#FFFFFF" />
          <circle cx="55.3" cy="36.8" r="1.1" fill="#FFFFFF" />
          <ellipse cx="37.5" cy="43" rx="4.2" ry="2.4" fill="#F68BA2" />
          <ellipse cx="62.5" cy="43" rx="4.2" ry="2.4" fill="#F68BA2" />
          <path
            d="M 46.8 43.2 Q 50 46.8 53.2 43.2"
            stroke="#18181B"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Aqua Hoodie Drawstrings with Round Beads */}
          <path
            d="M 47 56 L 44 65 M 53 56 L 56 65"
            stroke="#0FD0C6"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="44" cy="65.5" r="2.3" fill="#0FD0C6" />
          <circle cx="56" cy="65.5" r="2.3" fill="#0FD0C6" />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 2: MOMO (01_sprout_smile.png)
       * =================================================================== */}
      {char.id === 'topknot_kid' && (
        <g>
          {/* Teal Legs, Yellow Ankle Cuffs & Chunky Pink Boots */}
          <rect x="39" y="80" width="6.2" height="16" rx="3" fill="#08C6B8" />
          <rect x="54.8" y="80" width="6.2" height="16" rx="3" fill="#08C6B8" />
          <rect x="37.2" y="91.5" width="9.8" height="3.2" rx="1.6" fill="#FBE196" />
          <rect x="53" y="91.5" width="9.8" height="3.2" rx="1.6" fill="#FBE196" />
          <path d="M 31 94.5 H 47 V 105 C 47 107, 29 107, 30 99 Z" fill="#F68CE4" />
          <path d="M 53 94.5 H 69 C 71 99, 70 107, 53 105 Z" fill="#F68CE4" />

          {/* Curved Teal Arms & Round Ball Hands */}
          <path
            d="M 34 62 Q 21 66 23 77 M 66 62 Q 79 66 77 77"
            stroke="#08C6B8"
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="23" cy="79" r="5" fill="#08C6B8" />
          <circle cx="77" cy="79" r="5" fill="#08C6B8" />

          {/* Rounded Pink Romper Body + Shoulder & Leg Trim Rings */}
          <circle cx="50" cy="69" r="15.5" fill={`url(#${uid}-momo-body)`} />
          <rect x="32.5" y="57" width="4" height="11" rx="2" fill="#F9A8E8" />
          <rect x="63.5" y="57" width="4" height="11" rx="2" fill="#F9A8E8" />
          <rect x="37" y="79" width="9" height="3.2" rx="1.6" fill="#F9A8E8" />
          <rect x="54" y="79" width="9" height="3.2" rx="1.6" fill="#F9A8E8" />

          {/* Topknot Sprout Plumes & Pink Double Hairband */}
          <ellipse cx="41" cy="13.5" rx="7" ry="3.6" transform="rotate(24 41 13.5)" fill="#FEEEA4" />
          <ellipse cx="59" cy="13.5" rx="7" ry="3.6" transform="rotate(-24 59 13.5)" fill="#FEEEA4" />
          <ellipse cx="50" cy="12.5" rx="4" ry="6.2" fill="#D4EBB8" />
          <rect x="41" y="17.5" width="18" height="3.6" rx="1.8" fill="#FBB8F0" />
          <rect x="41" y="21" width="18" height="3.6" rx="1.8" fill="#F46CE0" />

          {/* Cream-to-Aqua Round Head */}
          <circle cx="50" cy="41" r="20" fill={`url(#${uid}-momo-head)`} />

          {/* Happy Arch Eyes, Round Coral Nose & Thick Puffy Coral Lips */}
          <path
            d="M 40.5 37.5 Q 44.5 32.5 48.5 37.5 M 51.5 37.5 Q 55.5 32.5 59.5 37.5"
            stroke="#18181B"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="50" cy="41" r="2.9" fill="#FC8E62" />
          <rect x="41.5" y="44.5" width="17" height="8.5" rx="4.2" fill="#FC8E62" />
          <path d="M 44.5 48.8 Q 50 50.5 55.5 48.8" stroke="#9A3412" strokeWidth="1.4" fill="none" />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 3: COCO (02_peach_xeyes.png)
       * =================================================================== */}
      {char.id === 'starlight_fox' && (
        <g>
          {/* Pastel Peach Legs, Yellow Ankle Cuffs & Chunky Coral Boots */}
          <rect x="39" y="80" width="6.2" height="16" rx="3" fill="#F9B7AC" />
          <rect x="54.8" y="80" width="6.2" height="16" rx="3" fill="#F9B7AC" />
          <rect x="37.2" y="91.5" width="9.8" height="3.2" rx="1.6" fill="#FCE192" />
          <rect x="53" y="91.5" width="9.8" height="3.2" rx="1.6" fill="#FCE192" />
          <path d="M 31 94.5 H 47 V 105 C 47 107, 29 107, 30 99 Z" fill="#F5906C" />
          <path d="M 53 94.5 H 69 C 71 99, 70 107, 53 105 Z" fill="#F5906C" />

          {/* Pastel Peach Arms & Round Ball Hands */}
          <path
            d="M 34 62 L 22 76 M 66 62 L 78 76"
            stroke="#F9B7AC"
            strokeWidth="6.2"
            strokeLinecap="round"
          />
          <circle cx="21.5" cy="78" r="4.8" fill="#F9B7AC" />
          <circle cx="78.5" cy="78" r="4.8" fill="#F9B7AC" />

          {/* Teal Rounded Romper Body + Trim Rings */}
          <circle cx="50" cy="69" r="15.5" fill="#09B8BE" />
          <rect x="32.5" y="57" width="4" height="11" rx="2" fill="#069CA2" />
          <rect x="63.5" y="57" width="4" height="11" rx="2" fill="#069CA2" />
          <rect x="37" y="79" width="9" height="3.2" rx="1.6" fill="#069CA2" />
          <rect x="54" y="79" width="9" height="3.2" rx="1.6" fill="#069CA2" />

          {/* Topknot Yellow Plumes & Double Teal Hairband */}
          <ellipse cx="41" cy="13.5" rx="7" ry="3.6" transform="rotate(24 41 13.5)" fill="#FCE39C" />
          <ellipse cx="59" cy="13.5" rx="7" ry="3.6" transform="rotate(-24 59 13.5)" fill="#FCE39C" />
          <ellipse cx="50" cy="12.5" rx="4" ry="6.2" fill="#FDE68A" />
          <rect x="41" y="17.5" width="18" height="3.6" rx="1.8" fill="#12D8D8" />
          <rect x="41" y="21" width="18" height="3.6" rx="1.8" fill="#05B2B2" />

          {/* Warm Peach Round Head */}
          <circle cx="50" cy="41" r="20" fill={`url(#${uid}-peach)`} />

          {/* Playful X X Eyes & Big Laughing Mouth */}
          <path
            d="M 40.5 34.5 L 46.5 40.5 M 46.5 34.5 L 40.5 40.5 M 53.5 34.5 L 59.5 40.5 M 59.5 34.5 L 53.5 40.5"
            stroke="#18181B"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M 42.5 43.5 H 57.5 C 57.5 53.5, 42.5 53.5, 42.5 43.5 Z"
            fill="#F94C66"
            stroke="#F43F5E"
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 4: BLOOM (04_flower.png)
       * =================================================================== */}
      {char.id === 'flower_orb' && (
        <g>
          {/* Pink Legs, Teal Ankle Cuffs & Gradient Boots */}
          <rect x="38.5" y="76" width="6.5" height="19" rx="3" fill="#FCA2E6" />
          <rect x="55" y="76" width="6.5" height="19" rx="3" fill="#FCA2E6" />
          <rect x="36.8" y="91.5" width="9.8" height="3.2" rx="1.6" fill="#14D4C0" />
          <rect x="53.4" y="91.5" width="9.8" height="3.2" rx="1.6" fill="#14D4C0" />
          <path
            d="M 30 94.5 H 46.5 V 105 C 46.5 107, 29 107, 30 94.5 Z"
            fill={`url(#${uid}-bloom-boot)`}
          />
          <path
            d="M 53.5 94.5 H 70 C 71 107, 53.5 107, 53.5 105 Z"
            fill={`url(#${uid}-bloom-boot)`}
          />

          {/* Side Pink Arms */}
          <path
            d="M 22 49 L 17 78 M 78 49 L 83 78"
            stroke="#FCA2E6"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Main Gradient Orb Body */}
          <circle cx="50" cy="55" r="28.5" fill={`url(#${uid}-orb)`} />
          <circle cx="50" cy="55" r="28.5" fill={`url(#${uid}-shine)`} />

          {/* Green Leaves & 7-Petal Pink Flower on Top */}
          <ellipse cx="42" cy="27" rx="4.2" ry="7.5" transform="rotate(-28 42 27)" fill="#06C896" />
          <ellipse cx="50" cy="25" rx="4.2" ry="8.5" fill="#10B981" />
          <ellipse cx="58" cy="27" rx="4.2" ry="7.5" transform="rotate(28 58 27)" fill="#06C896" />
          <path
            d="M 50 25 Q 52 13 58 11"
            stroke="#06C896"
            strokeWidth="2.8"
            fill="none"
          />
          <g transform="translate(60, 11)">
            <circle cx="-5.5" cy="-2" r="4" fill="#F875E8" />
            <circle cx="5.5" cy="-2" r="4" fill="#F875E8" />
            <circle cx="-3.5" cy="4.2" r="4" fill="#E85BD8" />
            <circle cx="3.5" cy="4.2" r="4" fill="#E85BD8" />
            <circle cx="0" cy="-5.5" r="4" fill="#F875E8" />
            <circle cx="0" cy="0" r="3.8" fill="#FFE619" />
          </g>

          {/* Glossy Dark Eyes & Thick Yellow Duck Lips */}
          <circle cx="42.5" cy="50.5" r="5" fill="#18181B" />
          <circle cx="57.5" cy="50.5" r="5" fill="#18181B" />
          <circle cx="41" cy="49" r="1.4" fill="#FFFFFF" opacity="0.85" />
          <circle cx="56" cy="49" r="1.4" fill="#FFFFFF" opacity="0.85" />
          <rect x="40.5" y="57" width="19" height="9" rx="4.5" fill="#FFE619" />
          <path d="M 44 61.5 Q 50 63.2 56 61.5" stroke="#CA8A04" strokeWidth="1.5" fill="none" />
        </g>
      )}

      {/* =====================================================================
       * CHARACTER 5: MINT (05_beanie.png)
       * =================================================================== */}
      {char.id === 'mint_sprinter' && (
        <g>
          {/* Teal Legs, Yellow Ankle Cuffs & Chunky Coral Boots */}
          <rect x="39" y="79" width="6.5" height="16" rx="3" fill="#06BFC4" />
          <rect x="54.5" y="79" width="6.5" height="16" rx="3" fill="#06BFC4" />
          <rect x="37" y="91" width="10.5" height="3.4" rx="1.7" fill="#FDE08D" />
          <rect x="52.5" y="91" width="10.5" height="3.4" rx="1.7" fill="#FDE08D" />
          <path d="M 31 94 H 47.5 V 105 C 47.5 107, 29 107, 30 99 Z" fill="#FA8B68" />
          <path d="M 52.5 94 H 69 C 71 99, 70 107, 52.5 105 Z" fill="#FA8B68" />

          {/* Short Peach Sleeves & Teal Arms/Hands */}
          <path
            d="M 33 58 L 22 76 M 67 58 L 78 76"
            stroke="#06BFC4"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M 34 57 L 28 65 M 66 57 L 72 65"
            stroke="#FCA568"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          <circle cx="21" cy="78" r="4.2" fill="#06BFC4" />
          <circle cx="79" cy="78" r="4.2" fill="#06BFC4" />

          {/* Flared A-line Peach-to-Coral Tunic */}
          <path
            d="M 34 55 C 28 63, 26 81, 30 83 H 70 C 74 81, 72 63, 66 55 Z"
            fill={`url(#${uid}-tunic)`}
          />

          {/* Big Round Teal Head */}
          <circle cx="50" cy="38" r="21" fill={`url(#${uid}-teal)`} />

          {/* Eyes, Cheeks & Smile */}
          <circle cx="43.5" cy="39" r="5" fill="#FFFFFF" />
          <circle cx="56.5" cy="39" r="5" fill="#FFFFFF" />
          <circle cx="43.5" cy="39" r="3.4" fill="#18181B" />
          <circle cx="56.5" cy="39" r="3.4" fill="#18181B" />
          <circle cx="42.3" cy="37.8" r="1.1" fill="#FFFFFF" />
          <circle cx="55.3" cy="37.8" r="1.1" fill="#FFFFFF" />
          <ellipse cx="36.5" cy="44" rx="4.4" ry="2.5" fill="#F794AC" />
          <ellipse cx="63.5" cy="44" rx="4.4" ry="2.5" fill="#F794AC" />
          <path
            d="M 46.8 44 Q 50 47.8 53.2 44"
            stroke="#18181B"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cream-Yellow Rolled-Brim Beanie Hat */}
          <path
            d="M 30 23 C 31 9, 69 9, 70 23 Z"
            fill={`url(#${uid}-hat)`}
          />
          <rect x="26" y="19.5" width="48" height="7" rx="3.5" fill="#FDD57E" />
        </g>
      )}
    </svg>
  );
};

/* ============================================================================
 * 1. HOME SCREEN (#screen-home | camera: portrait)
 * ========================================================================== */
const GlossyPastelHeroLogo: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-[460px] h-auto',
}) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 920 620"
      className={className}
      role="img"
      aria-label="Run At Your Pace"
    >
      <defs>
        {/* 3D Inflated Balloon / Glossy Vinyl Filter */}
        <filter
          id={`${uid}-balloon`}
          x="-12%"
          y="-12%"
          width="124%"
          height="128%"
          colorInterpolationFilters="sRGB"
        >
          {/* Soft drop shadow for 3D depth */}
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="7"
            floodColor="#070818"
            floodOpacity="0.38"
            result="dropShadow"
          />
          {/* Smooth pillow heightmap from alpha */}
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation="8.5"
            result="blurAlpha"
          />
          {/* Studio top-left 3D specular highlight */}
          <feSpecularLighting
            in="blurAlpha"
            surfaceScale="9"
            specularConstant="0.85"
            specularExponent="26"
            lightingColor="#FFFFFF"
            result="specRaw"
          >
            <fePointLight x="260" y="60" z="360" />
          </feSpecularLighting>
          <feComposite
            in="specRaw"
            in2="SourceAlpha"
            operator="in"
            result="specClipped"
          />
          {/* Subtle rim shade */}
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation="4"
            result="rimBlur"
          />
          <feSpecularLighting
            in="rimBlur"
            surfaceScale="4"
            specularConstant="0.32"
            specularExponent="14"
            lightingColor="#FFFDF8"
            result="rimRaw"
          >
            <fePointLight x="740" y="540" z="240" />
          </feSpecularLighting>
          <feComposite
            in="rimRaw"
            in2="SourceAlpha"
            operator="in"
            result="rimClipped"
          />
          <feMerge>
            <feMergeNode in="dropShadow" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="rimClipped" />
            <feMergeNode in="specClipped" />
          </feMerge>
        </filter>

        {/* Soft blur for specular white shine streaks */}
        <filter id={`${uid}-shine`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>

        {/* --- Row 1 Gradients: R, u, n --- */}
        <linearGradient id={`${uid}-R`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#FFF9B6" />
          <stop offset="32%" stopColor="#E6F8B2" />
          <stop offset="68%" stopColor="#84E9D0" />
          <stop offset="100%" stopColor="#48C9E2" />
        </linearGradient>
        <linearGradient id={`${uid}-u1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD2E4" />
          <stop offset="50%" stopColor="#FF9EC4" />
          <stop offset="100%" stopColor="#F576AA" />
        </linearGradient>
        <linearGradient id={`${uid}-n`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9D4FF" />
          <stop offset="45%" stopColor="#C59BFF" />
          <stop offset="82%" stopColor="#7ADCF0" />
          <stop offset="100%" stopColor="#4CC9E8" />
        </linearGradient>

        {/* --- Row 2 Gradients: At Your --- */}
        <linearGradient id={`${uid}-knot`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D9F99D" />
          <stop offset="48%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={`${uid}-A1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDFB3" />
          <stop offset="55%" stopColor="#FCA590" />
          <stop offset="100%" stopColor="#F47C7C" />
        </linearGradient>
        <linearGradient id={`${uid}-t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="48%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#F99BBC" />
        </linearGradient>
        <linearGradient id={`${uid}-Y`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="55%" stopColor="#6EE7C8" />
          <stop offset="100%" stopColor="#4ADEA8" />
        </linearGradient>
        <linearGradient id={`${uid}-o`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF7AE" />
          <stop offset="55%" stopColor="#FDE068" />
          <stop offset="100%" stopColor="#F6C445" />
        </linearGradient>
        <linearGradient id={`${uid}-u2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBD9FF" />
          <stop offset="55%" stopColor="#C49BFF" />
          <stop offset="100%" stopColor="#9B6EF3" />
        </linearGradient>
        <linearGradient id={`${uid}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD4E8" />
          <stop offset="55%" stopColor="#FF97C1" />
          <stop offset="100%" stopColor="#EC669F" />
        </linearGradient>

        {/* --- Row 3 Gradients: PACe --- */}
        <linearGradient id={`${uid}-P`} x1="0.8" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#A5F8D8" />
          <stop offset="45%" stopColor="#6BE7DE" />
          <stop offset="100%" stopColor="#4BB8F5" />
        </linearGradient>
        <linearGradient id={`${uid}-A2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF7BE" />
          <stop offset="55%" stopColor="#FDE088" />
          <stop offset="100%" stopColor="#F5BD58" />
        </linearGradient>
        <linearGradient id={`${uid}-C`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD8EC" />
          <stop offset="55%" stopColor="#FFA2CE" />
          <stop offset="100%" stopColor="#F473B2" />
        </linearGradient>
        <linearGradient id={`${uid}-e`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE0FF" />
          <stop offset="55%" stopColor="#C69DFF" />
          <stop offset="100%" stopColor="#9B6CFA" />
        </linearGradient>

        {/* --- Hoodie Character & Accents Gradients --- */}
        <linearGradient id={`${uid}-hood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF4BD" />
          <stop offset="65%" stopColor="#FCE08B" />
          <stop offset="100%" stopColor="#F4C762" />
        </linearGradient>
        <linearGradient id={`${uid}-torso`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF2A8" />
          <stop offset="48%" stopColor="#D7F4B8" />
          <stop offset="85%" stopColor="#58DFCE" />
          <stop offset="100%" stopColor="#26C3B8" />
        </linearGradient>
        <linearGradient id={`${uid}-armL`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF1A8" />
          <stop offset="55%" stopColor="#8CF0CA" />
          <stop offset="100%" stopColor="#33CECA" />
        </linearGradient>
        <linearGradient id={`${uid}-armR`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#35D0CA" />
          <stop offset="60%" stopColor="#B8F4BE" />
          <stop offset="100%" stopColor="#FFF0A6" />
        </linearGradient>
        <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE4C8" />
          <stop offset="100%" stopColor="#F7BA93" />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67F2DF" />
          <stop offset="100%" stopColor="#19C5BA" />
        </linearGradient>
        <linearGradient id={`${uid}-shoe`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#72F2E2" />
          <stop offset="60%" stopColor="#2DD4CA" />
          <stop offset="100%" stopColor="#14B2AD" />
        </linearGradient>
        <linearGradient id={`${uid}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9B8" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>
        <linearGradient id={`${uid}-dash`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D0FE" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>

      {/* ====================================================================
          DECORATIVE 3D ACCENTS (Rays, Motion Dashes, Pretzel Knot, Star, Swirl)
          ==================================================================== */}
      <g filter={`url(#${uid}-balloon)`}>
        {/* 3 Yellow Sun Rays top-left of R */}
        <line
          x1="126"
          y1="62"
          x2="148"
          y2="104"
          stroke={`url(#${uid}-ray)`}
          strokeWidth="22"
          strokeLinecap="round"
        />
        <line
          x1="88"
          y1="115"
          x2="130"
          y2="136"
          stroke={`url(#${uid}-ray)`}
          strokeWidth="22"
          strokeLinecap="round"
        />
        <line
          x1="96"
          y1="184"
          x2="132"
          y2="168"
          stroke={`url(#${uid}-ray)`}
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* 2 Pink Motion Lines above 'n' */}
        <path
          d="M 548 96 Q 580 108 606 124"
          stroke={`url(#${uid}-dash)`}
          strokeWidth="21"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 510 138 Q 550 144 584 156"
          stroke={`url(#${uid}-u1)`}
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />

        {/* Green-to-Aqua Intertwined Pretzel Loop left of 'At' */}
        <path
          d="M 164 368 C 148 392, 102 385, 98 345 C 94 305, 134 298, 136 332 C 138 368, 92 405, 70 388 C 52 372, 68 338, 108 352"
          stroke={`url(#${uid}-knot)`}
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 4-Point Yellow Star on right */}
        <path
          d="M 852 346 Q 856 368 876 372 Q 856 376 852 398 Q 848 376 828 372 Q 848 368 852 346 Z"
          fill={`url(#${uid}-ray)`}
          stroke={`url(#${uid}-ray)`}
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Pink Curly Loop below Hoodie's foot */}
        <path
          d="M 712 522 C 718 492, 762 492, 766 525 C 770 554, 738 556, 740 530 C 742 502, 788 504, 798 548"
          stroke={`url(#${uid}-u1)`}
          strokeWidth="20"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ====================================================================
          RUNNING HOODIE CHARACTER (Right side, integrated with letters)
          ==================================================================== */}
      <g filter={`url(#${uid}-balloon)`}>
        {/* Back leg & back turquoise sneaker (behind 'r') */}
        <path
          d="M 656 382 L 634 432"
          stroke={`url(#${uid}-skin)`}
          strokeWidth="34"
          strokeLinecap="round"
        />
        <ellipse
          cx="624"
          cy="438"
          rx="24"
          ry="34"
          transform="rotate(24 624 438)"
          fill={`url(#${uid}-shoe)`}
        />

        {/* Left Arm extending behind 'n'/'u' */}
        <ellipse
          cx="592"
          cy="322"
          rx="24"
          ry="19"
          transform="rotate(-25 592 322)"
          fill={`url(#${uid}-skin)`}
        />
        <path
          d="M 664 286 Q 624 278 602 310"
          stroke={`url(#${uid}-armL)`}
          strokeWidth="44"
          strokeLinecap="round"
          fill="none"
        />

        {/* Plump Rounded Hoodie Torso (Yellow top -> Aqua bottom) */}
        <path
          d="M 642 268 C 618 298, 616 364, 650 382 C 684 398, 742 396, 766 374 C 788 352, 782 294, 754 268 Z"
          fill={`url(#${uid}-torso)`}
        />

        {/* Front Striding Right Leg + Yellow Cuff + Chunky Aqua Sneaker */}
        <path
          d="M 702 374 L 748 436"
          stroke={`url(#${uid}-skin)`}
          strokeWidth="38"
          strokeLinecap="round"
        />
        {/* Cream-Yellow Ankle Sock Roll */}
        <rect
          x="724"
          y="414"
          width="52"
          height="22"
          rx="11"
          transform="rotate(-32 750 425)"
          fill={`url(#${uid}-hood)`}
        />
        {/* Chunky Aqua Sneaker */}
        <g transform="translate(772, 444) rotate(-26)">
          <rect
            x="-36"
            y="-18"
            width="84"
            height="44"
            rx="22"
            fill={`url(#${uid}-shoe)`}
          />
          <rect
            x="-36"
            y="12"
            width="84"
            height="16"
            rx="8"
            fill="#67F2DF"
          />
        </g>

        {/* Right Arm bent upward with Peach Fist */}
        <path
          d="M 746 286 Q 786 308 806 276"
          stroke={`url(#${uid}-armR)`}
          strokeWidth="42"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="814" cy="260" r="23" fill={`url(#${uid}-skin)`} />

        {/* Big Round Yellow Hood */}
        <circle cx="704" cy="196" r="102" fill={`url(#${uid}-hood)`} />
        {/* Inner Hood Rim Shadow */}
        <ellipse cx="708" cy="202" rx="76" ry="70" fill="#E8B258" />
        {/* Warm Peach Face */}
        <ellipse cx="708" cy="204" rx="72" ry="66" fill={`url(#${uid}-skin)`} />

        {/* Center-Parted Aqua-Turquoise Bangs */}
        <path
          d="M 636 206 C 634 154, 672 134, 708 136 C 692 166, 666 194, 636 206 Z"
          fill={`url(#${uid}-hair)`}
        />
        <path
          d="M 780 186 C 776 148, 742 134, 708 136 C 724 162, 752 178, 780 186 Z"
          fill={`url(#${uid}-hair)`}
        />

        {/* Hoodie Drawstrings & Beads */}
        <path
          d="M 696 272 Q 684 292 682 308"
          stroke="#19C5BA"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 714 272 Q 726 292 728 308"
          stroke="#19C5BA"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="681" cy="312" r="8" fill="#19C5BA" />
        <circle cx="729" cy="312" r="8" fill="#19C5BA" />
      </g>

      {/* Crisp Face Features on Hoodie (Eyes, Cheeks, Smile) */}
      <g>
        {/* White Sclera Ovals */}
        <ellipse cx="686" cy="210" rx="18" ry="20" fill="#FFFFFF" />
        <ellipse cx="734" cy="208" rx="18" ry="20" fill="#FFFFFF" />
        {/* Big Dark Pupils */}
        <circle cx="688" cy="212" r="12.5" fill="#23252E" />
        <circle cx="732" cy="210" r="12.5" fill="#23252E" />
        {/* Eye Catchlights */}
        <circle cx="683" cy="206" r="3.5" fill="#FFFFFF" />
        <circle cx="727" cy="204" r="3.5" fill="#FFFFFF" />
        {/* Rosy Pink Cheeks */}
        <ellipse cx="664" cy="232" rx="13" ry="7.5" fill="#F896AC" opacity="0.85" />
        <ellipse cx="754" cy="228" rx="13" ry="7.5" fill="#F896AC" opacity="0.85" />
        {/* Happy U-Smile */}
        <path
          d="M 698 234 C 702 248, 718 248, 722 232"
          stroke="#23252E"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ====================================================================
          ROW 1: "Run" (Plump 3D Bubble Typography)
          ==================================================================== */}
      <g filter={`url(#${uid}-balloon)`}>
        {/* Letter 'R' */}
        <path
          d="M 184 282 L 184 146 C 184 128, 258 124, 266 168 C 272 204, 224 216, 196 214 M 228 214 L 278 278"
          stroke={`url(#${uid}-R)`}
          strokeWidth="68"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner dimple of 'R' */}
        <ellipse cx="222" cy="172" rx="13" ry="16" fill="#2B9E8F" opacity="0.85" />

        {/* Letter 'u' */}
        <path
          d="M 334 192 L 336 254 C 338 286, 404 286, 408 252 L 412 190"
          stroke={`url(#${uid}-u1)`}
          strokeWidth="62"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Letter 'n' */}
        <path
          d="M 464 294 L 476 202 M 474 226 C 488 194, 554 198, 550 238 L 544 304"
          stroke={`url(#${uid}-n)`}
          strokeWidth="60"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* ====================================================================
          ROW 3: "PACe" (Drawn slightly behind Row 2 bottoms for natural overlap)
          ==================================================================== */}
      <g filter={`url(#${uid}-balloon)`}>
        {/* Giant Letter 'P' */}
        <path
          d="M 176 550 L 172 444 C 170 416, 264 412, 266 462 C 268 504, 198 506, 178 498"
          stroke={`url(#${uid}-P)`}
          strokeWidth="74"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="216" cy="462" rx="15" ry="13" fill="#0F8B8D" opacity="0.85" />

        {/* Giant Letter 'A' */}
        <path
          d="M 298 552 L 356 440 L 404 552 M 322 518 L 382 518"
          stroke={`url(#${uid}-A2)`}
          strokeWidth="66"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polygon points="354,474 342,502 366,502" fill="#D97706" opacity="0.85" />

        {/* Giant Letter 'C' */}
        <path
          d="M 526 468 C 492 444, 452 464, 454 512 C 456 558, 498 568, 528 544"
          stroke={`url(#${uid}-C)`}
          strokeWidth="64"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Giant Letter 'e' */}
        <path
          d="M 578 514 L 660 498 C 658 456, 574 456, 574 514 C 574 566, 636 572, 662 548"
          stroke={`url(#${uid}-e)`}
          strokeWidth="60"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 596 496 C 602 478, 630 476, 636 490 Z"
          fill="#5B21B6"
          opacity="0.8"
        />
      </g>

      {/* ====================================================================
          ROW 2: "At Your" (Middle Row Overlapping Smoothly)
          ==================================================================== */}
      <g filter={`url(#${uid}-balloon)`}>
        {/* Letter 'A' */}
        <path
          d="M 192 386 L 234 316 L 268 388 M 208 364 L 252 364"
          stroke={`url(#${uid}-A1)`}
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polygon points="233,338 225,354 241,354" fill="#B91C1C" opacity="0.65" />

        {/* Letter 't' */}
        <path
          d="M 316 322 L 314 394 C 314 406, 332 406, 336 398 M 296 352 L 336 352"
          stroke={`url(#${uid}-t)`}
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Letter 'Y' */}
        <path
          d="M 380 326 L 414 366 L 448 326 M 414 366 L 414 408"
          stroke={`url(#${uid}-Y)`}
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Letter 'o' */}
        <circle
          cx="492"
          cy="386"
          r="27"
          stroke={`url(#${uid}-o)`}
          strokeWidth="40"
          fill="none"
        />
        <circle cx="492" cy="386" r="9" fill="#B45309" opacity="0.75" />

        {/* Letter 'u' */}
        <path
          d="M 552 364 L 552 402 C 552 420, 594 420, 594 400 L 594 364"
          stroke={`url(#${uid}-u2)`}
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Letter 'r' */}
        <path
          d="M 638 416 L 638 374 C 638 366, 664 364, 674 374"
          stroke={`url(#${uid}-r)`}
          strokeWidth="42"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* ====================================================================
          CRISP SPECULAR GLOSSY HIGHLIGHTS (White Pill Reflections on Top)
          ==================================================================== */}
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        opacity="0.72"
        filter={`url(#${uid}-shine)`}
      >
        {/* R, u, n gloss */}
        <path d="M 176 132 C 204 114, 248 118, 264 142" strokeWidth="9" />
        <path d="M 164 166 L 164 235" strokeWidth="8" />
        <path d="M 322 180 L 322 224" strokeWidth="8" />
        <path d="M 402 178 L 402 220" strokeWidth="8" />
        <path d="M 456 190 L 452 240" strokeWidth="8" />
        <path d="M 516 196 C 534 198, 548 210, 550 232" strokeWidth="8" />

        {/* At Your gloss */}
        <path d="M 218 314 L 194 356" strokeWidth="6" />
        <path d="M 310 316 L 310 342" strokeWidth="6" />
        <path d="M 374 320 L 394 344" strokeWidth="6" />
        <path d="M 476 356 C 488 348, 504 350, 512 360" strokeWidth="6" />
        <path d="M 546 358 L 546 386" strokeWidth="5.5" />
        <path d="M 632 368 L 632 396" strokeWidth="5.5" />

        {/* PACe gloss */}
        <path d="M 164 424 C 194 406, 246 412, 262 438" strokeWidth="10" />
        <path d="M 154 456 L 156 520" strokeWidth="8" />
        <path d="M 342 428 L 312 492" strokeWidth="9" />
        <path d="M 464 456 C 484 440, 512 442, 528 454" strokeWidth="9" />
        <path d="M 578 468 C 602 450, 636 454, 652 474" strokeWidth="9" />

        {/* Hoodie gloss */}
        <path d="M 642 132 C 674 104, 730 102, 764 128" strokeWidth="10" />
        <path d="M 790 416 C 804 410, 818 414, 824 424" strokeWidth="6" />
      </g>
    </svg>
  );
};

export const HomeScreenOverlay: React.FC<{
  isLoadingRuns: boolean;
  onClickMyRuns: () => void;
}> = ({ isLoadingRuns, onClickMyRuns }) => {
  return (
    <section
      id="screen-home"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-center p-6 sm:p-12 select-none"
    >
      {/* Left-aligned Hero Logo + Subtitle + 'Run!' Button over 3D Portrait World */}
      <div className="my-auto max-w-2xl space-y-6 pointer-events-auto">
        <div className="space-y-3">
          <GlossyPastelHeroLogo className="w-full max-w-[420px] sm:max-w-[500px] h-auto -ml-4" />
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
