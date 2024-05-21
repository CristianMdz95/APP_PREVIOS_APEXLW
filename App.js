//eas build -p android --profile preview

import Navigation from "./Navigation";
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import FlashMessage from "react-native-flash-message";
import { enGB, registerTranslation } from 'react-native-paper-dates'
import colorPrimary from './data/ColorPrimary'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

registerTranslation('es', enGB)

const color = colorPrimary.color

const theme = {
  ...DefaultTheme,
  "colors": {
    "primary": color,
    "onPrimary": "rgb(255, 255, 255)",
    "primaryContainer": color,
    "onPrimaryContainer": "rgb(55, 14, 0)",
    "secondary": "rgb(119, 87, 75)",
    "onSecondary": "rgb(255, 255, 255)",
    "secondaryContainer": color,
    "onSecondaryContainer": "white",
    "tertiary": "rgb(104, 94, 48)",
    "onTertiary": "rgb(255, 255, 255)",
    "tertiaryContainer": "rgb(241, 227, 168)",
    "onTertiaryContainer": "rgb(33, 27, 0)",
    "error": "rgb(186, 26, 26)",
    "onError": "rgb(255, 255, 255)",
    "errorContainer": "rgb(255, 218, 214)",
    "onErrorContainer": "rgb(65, 0, 2)",
    "background": "rgb(255, 251, 255)",
    "onBackground": "rgb(32, 26, 24)",
    "surface": "rgb(255, 251, 255)",
    "onSurface": "rgb(32, 26, 24)",
    "surfaceVariant": "rgb(255, 255, 255)",
    "onSurfaceVariant": "rgb(83, 67, 62)",
    "outline": "rgb(133, 115, 109)",
    "outlineVariant": "rgb(216, 194, 187)",
    "shadow": "rgb(0, 0, 0)",
    "scrim": "rgb(0, 0, 0)",
    "inverseSurface": "rgb(54, 47, 44)",
    "inverseOnSurface": "rgb(251, 238, 234)",
    "inversePrimary": "rgb(255, 181, 153)",
    "elevation": {
      "level0": "transparent",
      "level1": "rgb(255, 255, 255)",
      "level2": "rgb(248, 236, 235)",
      "level3": "rgb(255, 255, 255)",
      "level4": "rgb(244, 228, 224)",
      "level5": "rgb(243, 224, 219)"
    },
    "surfaceDisabled": "rgba(32, 26, 24, 0.12)",
    "onSurfaceDisabled": "rgba(32, 26, 24, 0.38)",
    "backdrop": "rgba(59, 45, 40, 0.4)"

  } // Copy it from the color codes scheme and then use it here
};

export default function App() {

  return (
    <PaperProvider theme={theme} >
      <StatusBar style="light" backgroundColor={color} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation color={color}></Navigation>
      </GestureHandlerRootView>
      <FlashMessage position="bottom" />
    </PaperProvider>
  );
}

