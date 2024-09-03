import {View, ActivityIndicator} from 'react-native';
import {routeStyles} from '../styles/routeStyle';

export const Loader = props => (
  <View
    style={{
      ...routeStyles.container,
      backgroundColor: '#121b22',
      ...(props.style ?? {}),
    }}>
    <ActivityIndicator size="large" />
  </View>
);
