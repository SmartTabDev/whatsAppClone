import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {auth} from '../../firebase';
import ProfileInfoScreen from '../screens/auth/ProfileInfoScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import TabNavigator from './tabNavigator';
import SelectContact from '../screens/main/SelectContact';
import CameraScreen from '../screens/main/CameraScreen';
import CreateGroupScreen from '../screens/main/CreateGroupScreen';
const RootStack = createNativeStackNavigator();
export default function StackNavigator() {
  const user = auth.currentUser;

  return (
    <>
      <RootStack.Navigator>
        {!user.displayName && (
          <RootStack.Screen
            name="ProfileInfo"
            component={ProfileInfoScreen}
            options={{headerShown: false}}
          />
        )}
        <RootStack.Screen
          name="TabNavigator"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="SelectContact"
          component={SelectContact}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="CreateNewGroup"
          component={CreateGroupScreen}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: true}}
        />
        <RootStack.Screen
          name="Camera"
          component={CameraScreen}
          options={{headerShown: false}}
        />
      </RootStack.Navigator>
    </>
  );
}
