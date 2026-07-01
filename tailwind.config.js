/** @type {import('tailwindcss').Config} */

const childThemeNames = ['dino', 'unicorn', 'ocean', 'sunset', 'berry', 'sunshine']
const childThemeShades = ['50', '100', '200', '300', '400']

function buildChildThemeSafelist() {
  const classes = new Set([
    'btn-dino',
    'btn-unicorn',
    'btn-ocean',
    'btn-sunset',
    'btn-berry',
    'btn-sunshine',
    'from-unicorn-50',
    'to-unicorn-pink-100',
    'border-unicorn-200',
    'bg-unicorn-pink-100',
    'ring-unicorn-pink-100',
    'hover:ring-unicorn-pink-200',
  ])

  for (const theme of childThemeNames) {
    for (const shade of childThemeShades) {
      classes.add(`bg-${theme}-${shade}`)
      classes.add(`from-${theme}-${shade}`)
      classes.add(`to-${theme}-${shade}`)
      classes.add(`border-${theme}-${shade}`)
      classes.add(`ring-${theme}-${shade}`)
      classes.add(`hover:ring-${theme}-${shade}`)
      classes.add(`hover:bg-${theme}-${shade}`)
    }
  }

  return [...classes]
}

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: buildChildThemeSafelist(),
  theme: {
    extend: {
      colors: {
        // Basis achtergrond
        cream: {
          50: '#FDFAF5',
          100: '#FAF7F0',
          200: '#F5EFE0',
        },
        // Dino thema (Lea)
        dino: {
          50:  '#F0F7F1',
          100: '#D4EDDA',
          200: '#A8DBBA',
          300: '#7BAE7F',  // hoofd
          400: '#5A9060',
          500: '#3D6B42',
          600: '#2D5031',
        },
        // Unicorn thema (Aline)
        unicorn: {
          50:  '#F9F5FF',
          100: '#EDE0FF',
          200: '#D9C0FF',
          300: '#C9B8E8',  // hoofd
          400: '#A990D4',
          500: '#8B6BBF',
          600: '#6B4FA0',
          pink: {
            100: '#FFE4EE',
            200: '#FFB8D0',
            300: '#F4A7B9',  // accent
            400: '#E87898',
          }
        },
        // Extra kind-thema's
        ocean: {
          50:  '#F0F7FB',
          100: '#D4EAF5',
          200: '#A8D5EB',
          300: '#7BAFD4',
          400: '#5A94BE',
        },
        sunset: {
          50:  '#FFF5EE',
          100: '#FFE4D4',
          200: '#FFC9A8',
          300: '#F4A574',
          400: '#E8924A',
        },
        berry: {
          50:  '#FFF0F5',
          100: '#FFD4E4',
          200: '#F4A7C4',
          300: '#E88BA5',
          400: '#D46A8A',
        },
        sunshine: {
          50:  '#FFFBF0',
          100: '#FFF3D4',
          200: '#FFE8A8',
          300: '#F5C842',
          400: '#E8B020',
        },
        // Gedeeld
        earth: {
          400: '#C4956A',
          500: '#A67C52',
          600: '#8B6340',
        },
        accent: {
          orange: '#E8924A',
          yellow: '#F5C842',
          red:    '#E05C5C',
          green:  '#5CBF7A',
        },
        dark: '#2D3A2E',
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Baloo 2', 'Nunito', 'ui-rounded', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.10)',
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'star-pop': {
          '0%': { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
          '60%': { transform: 'scale(1.3) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        }
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'star-pop': 'star-pop 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'shake': 'shake 0.4s ease-in-out',
      }
    },
  },
  plugins: [],
}
