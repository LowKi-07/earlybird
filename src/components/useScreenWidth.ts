import { Platform, useWindowDimensions } from 'react-native';

export const WEB_FRAME = { width: 390, height: 844 };

// On a wide web browser the app renders inside a phone frame; report that width instead of the window.
export function useScreenWidth() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width > 500 ? WEB_FRAME.width : width;
}
