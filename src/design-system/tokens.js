/**
 * QuietZone Design Tokens
 * 
 * All values from GEMINI.md Section 6.1–6.5.
 * Every component must import from here — never use ad-hoc colors or sizes.
 */

// ─── 6.1 Light Theme ───────────────────────────────────────────────────────────
export const LightColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  brandPrimary: '#2F6FED',
  brandPrimaryPressed: '#1E54C4',
};

// ─── 6.2 Dark "Map Mode" Theme ─────────────────────────────────────────────────
export const DarkColors = {
  mapBackground: '#0D1117',
  surfaceElevated: '#161B22',
  textPrimary: '#F5F6F8',
  textSecondary: '#9CA3AF',
  border: '#262B33',
  liveAccent: '#00D26A',
};

// ─── 6.3 Disruption Score Gradient ──────────────────────────────────────────────
export const DisruptionColors = {
  quiet: '#22C55E',      // Score 1–3
  moderate: '#F59E0B',   // Score 4–6
  loud: '#EF4444',       // Score 7–10
  verified: '#D4AF37',   // Gold — Verified Workspace pin
};

/**
 * Returns the disruption color and label for a given score (1–10).
 */
export function getDisruptionLevel(score) {
  if (score >= 1 && score <= 3) {
    return { color: DisruptionColors.quiet, label: 'Quiet' };
  }
  if (score >= 4 && score <= 6) {
    return { color: DisruptionColors.moderate, label: 'Moderate' };
  }
  if (score >= 7 && score <= 10) {
    return { color: DisruptionColors.loud, label: 'Loud' };
  }
  return { color: DisruptionColors.moderate, label: 'Unknown' };
}

// ─── 6.4 Typography ────────────────────────────────────────────────────────────
// Typeface: Inter via expo-font, system-font fallback
export const FontFamily = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  fallback: 'System',
};

export const Typography = {
  display: {
    fontFamily: FontFamily.semiBold,
    fontSize: 28,
    lineHeight: 34,
  },
  h1: {
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  h2: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  buttonLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
};

// ─── 6.5 Spacing ────────────────────────────────────────────────────────────────
// 4dp base unit scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── 6.5 Responsive Breakpoints ─────────────────────────────────────────────────
export const Breakpoints = {
  compact: 0,    // < 600dp — phone
  medium: 600,   // 600–1024dp — tablet
  expanded: 1024, // > 1024dp — desktop web
};

// Screen horizontal padding per breakpoint
export const ScreenPadding = {
  compact: 16,
  medium: 24,
  expanded: 32,
};

// Max content width on expanded (desktop)
export const MaxContentWidth = 1200;

// ─── Component Constants ────────────────────────────────────────────────────────
export const MinTapTarget = 44; // Minimum 44×44dp tap target for accessibility
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

// ─── Shadow presets ─────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
};
