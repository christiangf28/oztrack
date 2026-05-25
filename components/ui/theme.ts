export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8, lineHeight: 40 },
  h2: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 34 },
  h3: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 28 },
  h4: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMed: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.3 },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
};

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 48,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 999,
};
