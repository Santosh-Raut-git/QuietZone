export const LightColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  brandPrimary: '#2F6FED',
  brandPrimaryPressed: '#1E54C4',
};

export const DarkColors = {
  mapBackground: '#0D1117',
  surfaceElevated: '#161B22',
  textPrimary: '#F5F6F8',
  textSecondary: '#9CA3AF',
  border: '#262B33',
  liveAccent: '#00D26A',
};

export const DisruptionColors = {
  quiet: '#22C55E',
  moderate: '#F59E0B',
  loud: '#EF4444',
  verified: '#D4AF37',
};

export function getDisruptionLevel(score) {
  if (score >= 1 && score <= 3) return { color: DisruptionColors.quiet, label: 'Quiet' };
  if (score >= 4 && score <= 6) return { color: DisruptionColors.moderate, label: 'Moderate' };
  if (score >= 7 && score <= 10) return { color: DisruptionColors.loud, label: 'Loud' };
  return { color: DisruptionColors.moderate, label: 'Unknown' };
}

export const FontFamily = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  fallback: 'System',
};

export const Typography = {
  display: { fontFamily: FontFamily.semiBold, fontSize: 28, lineHeight: 34 },
  h1: { fontFamily: FontFamily.semiBold, fontSize: 22, lineHeight: 28 },
  h2: { fontFamily: FontFamily.semiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: FontFamily.regular, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 16 },
  buttonLabel: { fontFamily: FontFamily.semiBold, fontSize: 15, lineHeight: 20 },
};

export const Spacing = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48 };

export const Breakpoints = { compact: 0, medium: 600, expanded: 1024 };

export const ScreenPadding = { compact: 16, medium: 24, expanded: 32 };

export const MaxContentWidth = 1200;
export const MinTapTarget = 44;
export const BorderRadius = { sm: 8, md: 12, lg: 16, full: 9999 };

export const Shadows = {
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
  fab: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
};
