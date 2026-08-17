import { useWindowDimensions } from 'react-native';
import { Breakpoints, ScreenPadding } from '../design-system/tokens';

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  
  const breakpoint = width >= Breakpoints.expanded ? 'expanded' : 
                     width >= Breakpoints.medium ? 'medium' : 'compact';

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
