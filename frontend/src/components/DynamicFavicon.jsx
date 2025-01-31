// src/components/DynamicFavicon.jsx
import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

const THEME_COLORS = {
  light: '#570DF8',
  dark: '#793EF9',
  cupcake: '#65C3C8',
  bumblebee: '#E0A82E',
  emerald: '#2DD4BF',
  corporate: '#4B6BFB',
  synthwave: '#E779C1',
  retro: '#EF9995',
  cyberpunk: '#FF7598',
  valentine: '#E96D7B',
  halloween: '#FF7900',
  garden: '#5C7F67',
  forest: '#1EB854',
  aqua: '#09ECF3',
  lofi: '#808080',
  pastel: '#D1C1D7',
  fantasy: '#6D0093',
  wireframe: '#B8B8B8',
  black: '#000000',
  luxury: '#C69749',
  dracula: '#FF79C6',
  cmyk: '#45AEEE',
  autumn: '#8C0327',
  business: '#1C4E80',
  acid: '#FF00F4',
  lemonade: '#519903',
  night: '#3ABFF8',
  coffee: '#AB5C2A',
  winter: '#394E6A',
  dim: '#59ACF7',
  nord: '#88C0D0',
  sunset: '#FF8C00'
};

const DynamicFavicon = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const mainColor = THEME_COLORS[theme] || THEME_COLORS.dark;
    const notificationColor = THEME_COLORS[theme] || '#FF3B30'; // Dynamic red dot

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105 105">
        <defs>
          <!-- Gradient -->
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${mainColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${mainColor};stop-opacity:0.8" />
          </linearGradient>

          <!-- Outer Glow Effect -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <!-- Soft Drop Shadow -->
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feFlood flood-color="${mainColor}" flood-opacity="0.3"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Glowing Outer Ring -->
        <circle cx="52.5" cy="52.5" r="45" fill="none" stroke="${mainColor}" stroke-width="6" opacity="0.5" filter="url(#glow)"/>

        <!-- Chat Bubble -->
        <g filter="url(#shadow)">
          <path 
            fill="url(#grad1)" 
            d="M52.5 15C28 15 15 28 15 49c0 11 6 19 14 26-2 6-5 11-10 15 6 0 14-3 20-7 7 4 15 5 22 5 24 0 43-13 43-32S77 15 52.5 15z"
          />
          
          <!-- Inner Transparency -->
          <path 
            fill="rgba(255,255,255,0.3)" 
            d="M52.5 18C30 18 18 30 18 49c0 9 4 15 12 20-2 5-4 9-7 12 4 0 10-2 15-6 6 3 13 4 19 4 21 0 38-11 38-29S75 18 52.5 18z"
            opacity="0.5"
          />
          
          <!-- Chat Dots (Message Indicator) -->
          <circle cx="30" cy="52" r="6" fill="white" opacity="0.9"/>
          <circle cx="52.5" cy="52" r="6" fill="white" opacity="0.9"/>
          <circle cx="75" cy="52" r="6" fill="white" opacity="0.9"/>
        </g>

        <!-- Themed New Message Indicator -->
        <circle cx="85" cy="22" r="14" fill="white" opacity="0.9"/>
        <circle cx="85" cy="22" r="12" fill="${notificationColor}" opacity="1"/>

      </svg>
    `;

    // Convert SVG to base64
    const encodedSvg = btoa(unescape(encodeURIComponent(svg)));

    // Create or update favicon
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = `data:image/svg+xml;base64,${encodedSvg}`;

    // Add to document if it doesn't exist
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(link);
    }
  }, [theme]);

  return null;
};

export default DynamicFavicon;
