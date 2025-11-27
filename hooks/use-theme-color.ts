/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { activeColorScheme } = useTheme();

  const colorFromProps = props[activeColorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[activeColorScheme][colorName];
  }
}
