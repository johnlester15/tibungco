import { Platform } from 'react-native';

const brandPrimary = '#002D62'; // Deep Davao Blue
const brandSecondary = '#0056b3';
const accentGold = '#D4AF37'; // For "Official" accents

export const Colors = {
  light: {
    text: '#1A202C',
    background: '#F8FAFC',
    tint: brandPrimary,
    icon: '#4A5568',
    tabIconDefault: '#4A5568',
    tabIconSelected: brandPrimary,
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F7FAFC',
    background: '#0A192F',
    tint: '#60A5FA',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#60A5FA',
    card: '#172A45',
    border: '#233554',
  },
};

export const Typography = {
  // Use Montserrat for the majority of the UI
  body: 'Montserrat_400Regular',
  bodySemiBold: 'Montserrat_600SemiBold',
  bodyBold: 'Montserrat_700Bold',
  
  // Use Playfair Display for unique, high-end headings
  heading: 'PlayfairDisplay_700Bold',
  headingItalic: 'PlayfairDisplay_700Bold_Italic', // If you installed it
};