
export const colors = {
  primary: '#FD7509', // brand orange (logo, active states, buttons)
  primaryLight: '#FEA965', // lighter orange used for gradients/highlights
  primarySoft: '#FFEEE0', // soft orange background for selected chips

  background: '#FFFFFF',
  surface: '#FFFFFF',

  textPrimary: '#202020',
  textSecondary: '#606060',
  textMuted: '#8D8C8C',
  placeholder: '#A0A0A0',

  border: '#DFDFDF',
  borderStrong: '#C6C6C6',
  divider: '#ECECEC',

  avatarPlaceholder: '#000000',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  heading: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  name: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  caption: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
};

// Caps content width on wide viewports (web/tablet) while staying
// full-bleed on phones, so the phone-shaped reference layout doesn't
// stretch awkwardly on larger screens.
export const layout = {
  maxContentWidth: 480,
};