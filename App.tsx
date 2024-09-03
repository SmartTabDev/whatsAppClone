/* eslint-disable react/react-in-jsx-scope */
import RouterContainer from './src/router/routerContainer';
import configStore from './src/store/configStore';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { MenuProvider } from 'react-native-popup-menu';
import { DefaultTheme, Provider as PaperProvider, configureFonts } from 'react-native-paper';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontRegular } from './src/styles/customFont';
import { routeStyles } from './src/styles/routeStyle';


const store = configStore();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: 'green',
    accent: '#f1c40f',
  },
  fonts: configureFonts({config: fontRegular}),
};

export default function App() {

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={routeStyles.flexContainer}>
        <Provider store={store}>
          <StatusBar barStyle="dark-content" backgroundColor="green" />
          <PaperProvider theme={theme}>
            <MenuProvider>
              <RouterContainer />
            </MenuProvider>
          </PaperProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
