/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Chats, { parseChatRoom } from '../screens/main/Chats';
import Contacts from '../screens/main/Contacts';
import {
  Text,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { query, where, onSnapshot, collection, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { routeStyles } from '../styles/routeStyle';
import TopBarLinks from '../components/TopBarLinks';
import { addChatRoom } from '../services/chatRoom';
import { auth } from '../../firebase';
import allActions from '../store/actions';
import { useContacts } from '../hooks/useContacts';
import { Loader } from '../components/Loader';
import { fontBold } from '../styles/customFont';
import { Badge } from 'react-native-paper';

const Tab = createMaterialTopTabNavigator();

function TabNavigator({ navigation }) {
  const dispatch = useDispatch();
  const [isFetching, contacts] = useContacts();
  const [currentPage, setCurrentPage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { selecting: selectingContacts } = useSelector(state => state.contacts);
  const { selecting: selectingChats } = useSelector(state => state.chatRooms);
  const unreadMsgs = useSelector(state => state.messages.unreadMsgs);
  const [rooms, setRooms] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: -80,
      easing: Easing.linear,
      duration: 100,
      useNativeDriver: true, // enables native driver
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      easing: Easing.linear,
      duration: 100,
      useNativeDriver: true, // enables native driver
    }).start();
  };

  const renderTabBarLabel = ({ children, focused }) => {
    return children !== 'Contacts' ? (
      <View
        style={styles.flexCenter}>
        <Text
          style={[
            { ...fontBold, fontSize: 16 },
            focused ? { color: '#1ba385' } : { color: '#8e9ba4' },
          ]}>
          {children}
        </Text>
        {
          totalUnread > 0 &&
          <View style={{ position: 'absolute', right: -15, bottom: 10 }}>
            <Badge >{totalUnread}</Badge>
          </View>
        }
      </View>
    ) : (
      <View
        style={styles.flexCenter}>
        <MaterialCommunityIcons
          name="contacts"
          style={[
            { fontSize: 22 },
            focused ? { color: '#1ba385' } : { color: '#8e9ba4' },
          ]}
        />
      </View>
    );
  };

  const setCurrentPageName = route => {
    setCurrentPage(route.route.name);
  };

  const onCreateNewChatRoom = useCallback(async (contact) => {
    const newChatRoom = {
      lastmessage: '',
      lastMsgTime: moment().utc().format(),
      name: contact.displayName,
      image: contact.thumbnailPath,
      isActive: true,
      registered: moment().utc().format(),
      participants: [
        auth.currentUser.email, contact.emailAddresses?.[0]?.email
      ],
    };
    const existingRoom = rooms.find(
      ({ email }) => email === contact.emailAddresses?.[0]?.email,
    );

    if (existingRoom) {
      dispatch(allActions.chatRooms.activeChatRoom(existingRoom));
      navigation.navigate('ChatScreen', { loading: true });
    } else {
      dispatch(allActions.contactNavigation.setParam(
        {
          loading: true
        }
      ));
      const newRoomDoc = await addChatRoom(newChatRoom);
      if (newRoomDoc) {
        dispatch(allActions.chatRooms.activeChatRoom(parseChatRoom(newRoomDoc, contacts)));
        dispatch(allActions.contactNavigation.setParam(
          {
            loading: false
          }
        ));
        navigation.navigate('ChatScreen', { loading: false });
      }
    }
  }, [rooms, contacts]);

  const chatRoomsQuery = query(
    collection(db, 'rooms'),
    where('participants', 'array-contains', auth.currentUser.email),
    orderBy('lastMsgTime', 'desc')
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(chatRoomsQuery, querySnapshot => {
      setSnapshot(querySnapshot);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (snapshot !== null && !isFetching) {
      const parsedChatRooms = snapshot.docs
        .map(doc =>
          parseChatRoom(doc.data(), contacts),
        );
      setRooms(parsedChatRooms);
      setIsLoading(false);
    }
  }, [snapshot, contacts, isFetching])

  useEffect(() => {
    if (currentPage === 'Contacts') {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [currentPage]);

  useEffect(() => {
    setTotalUnread(Object.values(unreadMsgs).reduce((acc, val) => acc + val, 0));
  }, [unreadMsgs])

  const gotoSelectContact = useCallback(() => {
    dispatch(allActions.contactNavigation.setParam(
      {
        onSelect: onCreateNewChatRoom,
        createGroup: true,
        createContact: true,
        title: 'Create chat',
        disableContacts: []
      }
    ));
    dispatch(allActions.search.resetSearchPhrase());
    navigation.navigate('SelectContact');
  }, [navigation, rooms])

  const getCurrentPagesButton = () =>
    currentPage === 'Chats' ? (
      <TouchableOpacity
        onPress={gotoSelectContact}
        style={routeStyles.bottomButtons}>
        <MaterialCommunityIcons
          style={routeStyles.bottomButtonA}
          name="comment-text-outline"
        />
      </TouchableOpacity>
    ) : null;

  return (
    <>
      <TopBarLinks />
      <Tab.Navigator
        initialRouteName="Chats"
        screenOptions={{
          // tabBarStyle: { backgroundColor: '#1f2c34' },
          tabBarStyle: { backgroundColor: '#0B1437' },
          tabBarItemStyle: { padding: 0 },
          tabBarLabel: renderTabBarLabel,
          tabBarIndicatorStyle: { backgroundColor: '#06a380', height: 3 },
          swipeEnabled: !selectingContacts && !selectingChats,
        }}
        screenListeners={setCurrentPageName}>
        <Tab.Screen name="Contacts">
          {props => (isFetching ? <Loader /> : <Contacts {...props} />)}
        </Tab.Screen>
        <Tab.Screen name="Chats">
          {props =>
            isLoading ? (
              <Loader />
            ) : (
              <Chats {...props} sNavigator={navigation} rooms={rooms} />
            )
          }
        </Tab.Screen>
      </Tab.Navigator>
      {!selectingChats && getCurrentPagesButton()}
    </>
  );
}

const styles = StyleSheet.create({
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.navigation === nextProps.navigation
  );
}

export default React.memo(TabNavigator, arePropsEqual)
