export const CHILD_THEME_IDS = [
  'dino',
  'unicorn',
  'ocean',
  'sunset',
  'berry',
  'sunshine',
] as const

export type ChildTheme = (typeof CHILD_THEME_IDS)[number]

export interface ChildThemeConfig {
  id: ChildTheme
  label: string
  emoji: string
  color: string
  swatch: string
  avatar: string
  header: string
  border: string
  cardBorder: string
  button: string
  ring: string
  hoverRing: string
}

export const CHILD_THEMES: Record<ChildTheme, ChildThemeConfig> = {
  dino: {
    id: 'dino',
    label: 'Dino groen',
    emoji: '🦕',
    color: '#7BAE7F',
    swatch: 'bg-dino-300',
    avatar: 'bg-dino-100 ring-dino-300',
    header: 'from-dino-50 to-dino-100 border-dino-200',
    border: 'border-dino-100',
    cardBorder: 'border-dino-200',
    button: 'btn-dino',
    ring: 'ring-dino-200',
    hoverRing: 'hover:ring-dino-200',
  },
  unicorn: {
    id: 'unicorn',
    label: 'Unicorn paars',
    emoji: '🦄',
    color: '#C9B8E8',
    swatch: 'bg-unicorn-300',
    avatar: 'bg-unicorn-100 ring-unicorn-300',
    header: 'from-unicorn-50 to-unicorn-pink-100 border-unicorn-200',
    border: 'border-unicorn-100',
    cardBorder: 'border-unicorn-200',
    button: 'btn-unicorn',
    ring: 'ring-unicorn-200',
    hoverRing: 'hover:ring-unicorn-200',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean blauw',
    emoji: '🐬',
    color: '#7BAFD4',
    swatch: 'bg-ocean-300',
    avatar: 'bg-ocean-100 ring-ocean-300',
    header: 'from-ocean-50 to-ocean-100 border-ocean-200',
    border: 'border-ocean-100',
    cardBorder: 'border-ocean-200',
    button: 'btn-ocean',
    ring: 'ring-ocean-200',
    hoverRing: 'hover:ring-ocean-200',
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset oranje',
    emoji: '🌅',
    color: '#F4A574',
    swatch: 'bg-sunset-300',
    avatar: 'bg-sunset-100 ring-sunset-300',
    header: 'from-sunset-50 to-sunset-100 border-sunset-200',
    border: 'border-sunset-100',
    cardBorder: 'border-sunset-200',
    button: 'btn-sunset',
    ring: 'ring-sunset-200',
    hoverRing: 'hover:ring-sunset-200',
  },
  berry: {
    id: 'berry',
    label: 'Berry roze',
    emoji: '🍓',
    color: '#E88BA5',
    swatch: 'bg-berry-300',
    avatar: 'bg-berry-100 ring-berry-300',
    header: 'from-berry-50 to-berry-100 border-berry-200',
    border: 'border-berry-100',
    cardBorder: 'border-berry-200',
    button: 'btn-berry',
    ring: 'ring-berry-200',
    hoverRing: 'hover:ring-berry-200',
  },
  sunshine: {
    id: 'sunshine',
    label: 'Sunshine geel',
    emoji: '☀️',
    color: '#F5C842',
    swatch: 'bg-sunshine-300',
    avatar: 'bg-sunshine-100 ring-sunshine-300',
    header: 'from-sunshine-50 to-sunshine-100 border-sunshine-200',
    border: 'border-sunshine-100',
    cardBorder: 'border-sunshine-200',
    button: 'btn-sunshine',
    ring: 'ring-sunshine-200',
    hoverRing: 'hover:ring-sunshine-200',
  },
}

export const CHILD_THEME_LIST = CHILD_THEME_IDS.map((id) => CHILD_THEMES[id])

export function isChildTheme(value: string): value is ChildTheme {
  return CHILD_THEME_IDS.includes(value as ChildTheme)
}

export function resolveChildTheme(value: string): ChildTheme {
  return isChildTheme(value) ? value : 'dino'
}

export function getChildTheme(value: string): ChildThemeConfig {
  return CHILD_THEMES[resolveChildTheme(value)]
}

export function defaultEmojiForTheme(theme: string): string {
  return getChildTheme(theme).emoji
}
