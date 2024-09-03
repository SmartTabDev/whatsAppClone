/* eslint-disable react-native/no-inline-styles */
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  View,
} from 'react-native';
import {useEffect, useState} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '../../firebase';
import StackNavigator from '../navigator/stackNavigator';
import AuthNavigation from '../navigator/authNavigator';
import {routeStyles} from '../styles/routeStyle';
import {Loader} from '../components/Loader';

const {width} = Dimensions.get('window');

export default function RouterContainer() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, res => {
      setLoading(false);
      setUser(res);
    });

    return () => unsubscribe();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <NavigationContainer>
      <StatusBar style="auto" />
      <SafeAreaView style={{width: width, height: '100%'}}>
        {!user ? <AuthNavigation /> : <StackNavigator />}
      </SafeAreaView>
    </NavigationContainer>
  );
}
