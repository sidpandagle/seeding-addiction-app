/**
 * Sage & Moss palette, the single list of theme colors.
 *
 * global.css holds the same values as space-separated RGB CSS variables, which
 * the Tailwind classes (bg-surface, text-muted, ...) read. This file is for
 * places that need a plain color string: icons, the tab bar, charts, gradients
 * and inline styles (via useThemeColors). palette.test.ts keeps the two in sync.
 */

export const TOKEN_NAMES = [
  // Neutrals
  'bg', // screen background
  'surface', // cards
  'subtle', // neutral chips, pressed rows, tracks
  'border',
  'borderStrong', // inputs, unchecked boxes
  'fg', // primary text
  'body', // secondary text, long reading text
  'muted', // captions, subtitles
  'faint', // placeholders, chevrons, disabled
  // Brand
  'primary',
  'primaryInk', // primary-colored text on light surfaces
  'primarySoft',
  'onPrimary', // text and icons on a solid primary fill
  // Meaning
  'relapse', // amber, History and relapse flows only
  'relapseInk',
  'relapseSoft',
  'gold', // achievements and milestones
  'goldInk',
  'goldSoft',
  'info', // wins, insights, History tab
  'infoSoft',
  'plum', // avg streak, Settings tab
  'plumSoft',
  'urge', // SOS and destructive actions
  'urgeSoft',
  'tab', // tab bar background
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];
export type ThemeColors = Record<TokenName, string>;

const light: ThemeColors = {
  bg: '#F4F6F1',
  surface: '#FFFFFF',
  subtle: '#EBEFE6',
  border: '#E1E7DA',
  borderStrong: '#C8CFC2',
  fg: '#1B2418',
  body: '#3B4638',
  muted: '#637060',
  faint: '#9DA69A',
  primary: '#3A7D4C',
  primaryInk: '#2F6A3F',
  primarySoft: '#E2EDDC',
  onPrimary: '#FFFFFF',
  relapse: '#B7791F',
  relapseInk: '#895B17',
  relapseSoft: '#F6EEE2',
  gold: '#C9962B',
  goldInk: '#8D691E',
  goldSoft: '#F8F1E3',
  info: '#3F6FA8',
  infoSoft: '#E6ECF4',
  plum: '#7B5EA7',
  plumSoft: '#EEEAF4',
  urge: '#C2410C',
  urgeSoft: '#FBE6DA',
  tab: '#FBFCFA',
};

const dark: ThemeColors = {
  bg: '#0D120D',
  surface: '#161D16',
  subtle: '#1E271E',
  border: '#253025',
  borderStrong: '#3B473B',
  fg: '#E7EDE3',
  body: '#C2CCBE',
  muted: '#95A391',
  faint: '#657063',
  primary: '#7FC48F',
  primaryInk: '#8FD09E',
  primarySoft: '#1C2E20',
  onPrimary: '#0D1A10',
  relapse: '#E0A548',
  relapseInk: '#E0A548',
  relapseSoft: '#423B21',
  gold: '#E6BE5E',
  goldInk: '#E6BE5E',
  goldSoft: '#444026',
  info: '#86A9D6',
  infoSoft: '#2F3C40',
  plum: '#B29BD6',
  plumSoft: '#383940',
  urge: '#F28A5B',
  urgeSoft: '#33201A',
  tab: '#111711',
};

export const palette = { light, dark } as const;

/** Stage colors for the timer card tint, by growth stage index (0-13) */
export const STAGE_TINT_FAMILIES = [
  { name: 'soil', upToStage: 1, color: '#A47148' },
  { name: 'leaf', upToStage: 7, color: '#4C9A5A' },
  { name: 'bloom', upToStage: 10, color: '#D9668A' },
  { name: 'evergreen', upToStage: 13, color: '#2F6B4A' },
] as const;

export function stageTintColor(stageIndex: number): string {
  const family = STAGE_TINT_FAMILIES.find((f) => stageIndex <= f.upToStage);
  return (family ?? STAGE_TINT_FAMILIES[STAGE_TINT_FAMILIES.length - 1]).color;
}

function toRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `color` mixed `percent`% into `base`, like CSS color-mix(in srgb, ...) */
export function mixHex(color: string, percent: number, base: string): string {
  const a = toRgb(color);
  const b = toRgb(base);
  const p = percent / 100;
  return (
    '#' +
    a
      .map((v, i) => Math.round(v * p + b[i] * (1 - p)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** `#RRGGBB` plus alpha (0-1) as an rgba() string */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** "#3A7D4C" -> "58 125 76", the format global.css uses */
export function toRgbChannels(hex: string): string {
  return toRgb(hex).join(' ');
}

/**
 * "Garden" categorical chart colors: moss, slate, rose, honey, heather, in fixed order.
 * One soft lightness so no slice shouts. The order keeps neighbors (including last to
 * first around a ring) apart for color-blind readers; dark is the same hues stepped for
 * the dark card. Anything past these five is grouped and drawn in borderStrong.
 */
export const CHART_SERIES = {
  light: ['#68AB6B', '#5E9DDC', '#D3798F', '#BB912B', '#AE84CD'],
  dark: ['#619D64', '#5890CA', '#B46478', '#B28C32', '#A07ABC'],
} as const;

/** Ordinary bars in a one-color chart: a soft tint of the accent. The peak bar gets the full accent. */
export function barTint(accent: string, surface: string, scheme: keyof typeof palette): string {
  return mixHex(accent, scheme === 'dark' ? 45 : 42, surface);
}
