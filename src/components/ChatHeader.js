/* eslint-disable no-undef */
import {View, Text, TouchableOpacity} from 'react-native';
import React, { useCallback } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {chatStyle} from '../styles/chatStyle';
import allActions from '../store/actions';
import {useDispatch, useSelector} from 'react-redux';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {Avatar} from './Avatar';
import {AvatarGroup} from './AvatarGroup';
import { fontRegular } from '../styles/customFont';
import { auth, db } from '../../firebase';
import moment from 'moment';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';

function ChatHeader({navigation, item}) {
  const dispatch = useDispatch();
  const lastSeens = item?.lastSeens ?? [];

  const handleViewProfile = () => {
    navigation.navigate('Profile', {item: item});
  };

  const lastSeenTime = () => {
    const index = lastSeens?.findIndex(s => s.email !== auth.currentUser.email)
    if(!lastSeens){
      return "Not seen yet"
    }
    if( index === -1 ||!lastSeens?.length){
      return "Not seen yet"
    }else{
      
      const timestamp = lastSeens[index]?.time
      const lastSeenDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
     
      const now = new Date()
      const timeDifference = now.getTime() - lastSeenDate.getTime();
      const minutesDifference = Math.round(timeDifference / (1000 * 60));
  
      if(minutesDifference < 1) {
        return "Online"
      } else if(minutesDifference < 60){
        return `Last seen ${minutesDifference} minutes ago`
      } else if (minutesDifference < 1440) {
        const hoursDifference = Math.round(minutesDifference / 60);
        return `Last seen ${hoursDifference} hours ago`
      } else if (minutesDifference < 2880) {
        const daysDifference = Math.round(minutesDifference / 1440);
        return `Last seen ${daysDifference} day ago`
      } else if(minutesDifference < 43200) {
        const daysDifference = Math.round(minutesDifference / 1440);
        return `Last seen ${daysDifference} days ago`
      } else {
        return `Last seen ${moment(timestamp).format('YYYY/MM/DD dddd')}`
      }
    }
  }

  const addUseronRoom = useCallback(async (contact) => {
    await updateDoc(doc(db, "rooms", item.id), {
      participants: arrayUnion(contact.emailAddresses[0].email)
    })
    navigation.navigate('ChatScreen', {loading: true});
  }, [navigation, item])

  const goBack = useCallback(() => {
    dispatch(allActions.messages.markReset());
    navigation.navigate('TabNavigator');
  }, [dispatch, navigation ])

  const gotoSelectContact = useCallback(() => {
    dispatch(allActions.contactNavigation.setParam(
      {
        onSelect: addUseronRoom,
        createGroup: false,
        createContact: true,
        disableContacts: item.participants,
        title: 'Add user',
      }
    ));
    navigation.navigate('SelectContact');
  }, [navigation, item.participants])

  return (
    <View style={chatStyle.header}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={chatStyle.backButton}
        onPress={goBack}>
        <View style={chatStyle.backButtonContent}>
          <MaterialIcons name="arrow-back" style={chatStyle.backButtonIcon} />
        </View>
      </TouchableOpacity>
      {item.participants?.length ? (
        <AvatarGroup
          sources={item.participants.map(({image}) => ({uri: image}))}
          style={chatStyle.backButtonImage}
        />
      ) : (
        <Avatar source={{uri: item.image}} style={chatStyle.backButtonImage} />
      )}
      <TouchableOpacity
        style={chatStyle.nameButton}
        onPress={handleViewProfile}>
        <View style={chatStyle.nameContent}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={chatStyle.nameText}>{item.name}</Text>
          {item.isDirectChat && !!lastSeenTime() && <Text style={chatStyle.lastSeen}> { lastSeenTime()}</Text>
          }
          {!item.isDirectChat && 
          <Text style={chatStyle.lastSeen}>{item?.participants?.length} members</Text>
          }
        </View>
      </TouchableOpacity>
      <View style={chatStyle.headerIcons}>
        <Menu>
          <MenuTrigger>
            <MaterialCommunityIcons
              name="dots-vertical"
              style={[chatStyle.headerIcon]}
            />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                borderRadius: 15,
                padding: 15,
              },
              optionText: {
                fontSize: 14,
                ...fontRegular
              }
            }}>
            <MenuOption
              text="View Profile"
              onSelect={handleViewProfile}
            />
            {
              !item.isDirectChat &&  <MenuOption
              text="Add user"
              onSelect={gotoSelectContact}
            />
            }
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
};

export default React.memo(ChatHeader)
