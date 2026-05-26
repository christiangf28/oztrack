const shadow = {
  sm: {
    shadowColor: '#D4748F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#D4748F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D1B29',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const lightColors = {
  primary: '#D4748F',
  primaryLight: '#EAA8B8',
  primaryDark: '#B85C75',
  primaryPale: '#FDF0F3',

  sage: '#8BAF9E',
  sagePale: '#EDF4F1',

  lavender: '#B8A9D4',
  lavenderPale: '#F2EFF9',

  background: '#FBF7F5',
  backgroundWarm: '#FDF4F0',
  surface: '#FFFFFF',
  surfaceRose: '#FFF5F7',

  border: '#F0E6E8',
  borderLight: '#F8F0F2',

  text: {
    primary: '#2D1B29',
    secondary: '#7A5E6E',
    muted: '#B8A3AE',
    inverse: '#FFFFFF',
    rose: '#D4748F',
  },

  gradients: {
    hero: ['#F2C4CE', '#E8A0B4', '#D4748F'] as [string, string, ...string[]],
    heroSoft: ['#FDF0F3', '#FAE4EB', '#F5CFD9'] as [string, string, ...string[]],
    card: ['#FFFFFF', '#FFF5F7'] as [string, string, ...string[]],
    sage: ['#EDF4F1', '#D5EAE3'] as [string, string, ...string[]],
    premium: ['#C9B4D4', '#A889C0', '#8B6BAA'] as [string, string, ...string[]],
    warm: ['#FDF8F5', '#FAF0EC'] as [string, string, ...string[]],
    button: ['#E08AA0', '#D4748F', '#C25E7A'] as [string, string, ...string[]],
  },

  symptom: {
    nausea: '#E8926A',
    fatigue: '#A889C0',
    appetite: '#6DB89A',
    mood: '#E8C56A',
    energy: '#6AAEE8',
  },

  success: '#6DB89A',
  successPale: '#EDF7F3',
  warning: '#E8C56A',
  warningPale: '#FDF8E8',
  error: '#E07070',
  errorPale: '#FDEEED',

  shadow,
};

export const darkColors = {
  primary: '#E8919F',
  primaryLight: '#F2B5C0',
  primaryDark: '#D4748F',
  primaryPale: '#2D1520',

  sage: '#9EC4B5',
  sagePale: '#162620',

  lavender: '#C4B9E0',
  lavenderPale: '#1E1830',

  background: '#1A1015',
  backgroundWarm: '#1F1318',
  surface: '#251620',
  surfaceRose: '#2A1822',

  border: '#3D2535',
  borderLight: '#2D1A25',

  text: {
    primary: '#F5E8EE',
    secondary: '#C4A0B0',
    muted: '#7A5565',
    inverse: '#1A1015',
    rose: '#E8919F',
  },

  gradients: {
    hero: ['#6B2540', '#8B3555', '#D4748F'] as [string, string, ...string[]],
    heroSoft: ['#2D1520', '#3A1D28', '#4A2535'] as [string, string, ...string[]],
    card: ['#251620', '#2D1A24'] as [string, string, ...string[]],
    sage: ['#162620', '#1E342C'] as [string, string, ...string[]],
    premium: ['#3D2855', '#553570', '#7B4B96'] as [string, string, ...string[]],
    warm: ['#1F1318', '#251820'] as [string, string, ...string[]],
    button: ['#E08AA0', '#D4748F', '#C25E7A'] as [string, string, ...string[]],
  },

  symptom: {
    nausea: '#E8926A',
    fatigue: '#A889C0',
    appetite: '#6DB89A',
    mood: '#E8C56A',
    energy: '#6AAEE8',
  },

  success: '#6DB89A',
  successPale: '#162620',
  warning: '#E8C56A',
  warningPale: '#2A2410',
  error: '#E07070',
  errorPale: '#2D1515',

  shadow,
};

// Backward-compat alias (screens not yet migrated to useTheme)
export const colors = lightColors;
