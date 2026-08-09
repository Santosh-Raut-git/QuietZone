/**
 * Responsive utilities — useBreakpoint hook
 * 
 * Uses useWindowDimensions + the breakpoints from Section 6.5.
 * Returns the current breakpoint ('compact' | 'medium' | 'expanded')
 * and the corresponding screen padding.
 */
import { useWindowDimensions } from 'react-native';
import { Breakpoints, ScreenPadding } from '../design-system/tokens';

/**
 * Returns current breakpoint based on window width.
 * @returns {{ breakpoint: 'compact' | 'medium' | 'expanded', screenPadding: number, width: number, height: number }}
 */
export function useBreakpoint() {
  const { width, height } = useWindowDimensions();

  let breakpoint = 'compact';
  if (width >= Breakpoints.expanded) {
    breakpoint = 'expanded';
  } else if (width >= Breakpoints.medium) {
    breakpoint = 'medium';
  }

  return {
    breakpoint,
    screenPadding: ScreenPadding[breakpoint],
    width,
    height,
    isCompact: breakpoint === 'compact',
    isMedium: breakpoint === 'medium',
    isExpanded: breakpoint === 'expanded',
  };
}
