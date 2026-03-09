/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 🥖 PALETA PANADERÍA ARTESANAL - Colores auténticos
        primary: '#5B3A29',      // Corteza de pan horneado
        secondary: '#D4A574',    // Dorado croissant
        accent: '#C2662D',       // Naranja horno de leña
        cream: '#FFF9F2',        // Crema batida suave
        vanilla: '#FFF5E6',      // Vainilla natural
        wheat: '#F5E6D3',        // Trigo integral
        peach: '#FFDAB9',        // Durazno en almíbar
        blush: '#E8B4A0',        // Rosa masa de pan dulce
        caramel: '#A0522D',      // Caramelo quemado auténtico
        mocha: '#6F4E37',        // Café molido
        latte: '#E8DDD4',        // Latte espumoso
        cinnamon: '#8B4513',     // Canela en rama
        honey: '#DAA520',        // Miel de abeja pura
        butter: '#FFFACD',       // Mantequilla fresca
        cocoa: '#3E2723',        // Chocolate 70% cacao
        flour: '#FEFEFE',        // Harina tamizada
        // Pan y corteza
        'crust': '#8B5A2B',      // Corteza dorada
        'sourdough': '#D2B48C',  // Masa madre
        'brioche': '#F4A460',    // Brioche francés
        // Grises cálidos para texto
        'warm-gray': '#4A3728',
        'warm-gray-light': '#8B7355',
        // Modo oscuro - Panadería de noche
        'dark-bg': '#1A1411',
        'dark-card': '#2D2319',
        'dark-surface': '#3D3127',
        'dark-accent': '#5B4A3A',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      backdropBlur: {
        xs: '2px',
        glass: '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(91, 58, 41, 0.1)',
        'glass-lg': '0 25px 50px -12px rgba(91, 58, 41, 0.15)',
        'vintage': '0 6px 24px rgba(212, 165, 116, 0.2)',
        'warm': '0 12px 48px rgba(218, 165, 32, 0.2)',
        'honey': '0 8px 32px rgba(218, 165, 32, 0.25)',
        'glow': '0 0 30px rgba(218, 165, 32, 0.15)',
        'bread': '0 8px 24px rgba(139, 90, 43, 0.2)',
      },
      backgroundImage: {
        'vintage-gradient': 'linear-gradient(145deg, #FFF9F2 0%, #FFF5E6 50%, #F5E6D3 100%)',
        'warm-gradient': 'linear-gradient(to bottom right, #FFF9F2, #FFDAB9, #E8B4A0)',
        'bread-gradient': 'linear-gradient(145deg, #8B5A2B 0%, #D4A574 50%, #DAA520 100%)',
        'honey-gradient': 'linear-gradient(135deg, #DAA520 0%, #D4A574 100%)',
        'bakery-morning': 'linear-gradient(135deg, #FFF9F2 0%, #FFFACD 25%, #FFF5E6 50%, #F5E6D3 100%)',
        'crust-gradient': 'linear-gradient(145deg, #5B3A29 0%, #8B5A2B 50%, #A0522D 100%)',
      },
    },
  },
  plugins: [],
}
