import {View} from 'react-native';
import React from 'react';
import {routeStyles} from '../../styles/routeStyle';
import ChatListComponent from '../../components/ChatListComponent';
import {auth} from '../../../firebase';

export const parseChatRoom = (doc, contacts) => {
  if (!doc) {
    return undefined;
  }

  const participants = doc.participants
    .filter(p =>
      doc.participants?.length === 2 ? p !== auth.currentUser.email : true,
    )
    .map(email => {
      const contact = contacts.find(
        ({emailAddresses}) => !!emailAddresses.find(e => e.email === email),
      );

      return {
        email,
        image: contact?.thumbnailPath,
        name: contact?.displayName,
      };
    });

  const isDirectChatRoom = participants?.length === 1;

  return {
    ...doc,
    _id: doc.id,
    ...(isDirectChatRoom
      ? {
          name: participants?.[0]?.name ?? participants?.[0]?.email,
          email: participants?.[0]?.email,
          image: participants?.[0]?.image,
          participants: undefined,
        }
      : {participants}),
  };
};

function Chats({rooms, sNavigator}) {
  return (
    <View style={routeStyles.container}>
      <ChatListComponent rooms={rooms} navigation={sNavigator} />
    </View>
  );
}

function arePropsEqual(prevProps, nextProps) {
  const prevParticipants = prevProps.rooms.map(({participants}) => participants?.length).filter(val => val !== undefined).reduce((accumulator, currentValue) => accumulator + (currentValue ?? 0), 0);
  const nextParticipants = nextProps.rooms.map(({participants}) => participants?.length).filter(val => val !== undefined).reduce((accumulator, currentValue) => accumulator + (currentValue ?? 0), 0);
  const prevLastMessageTimes = JSON.stringify(prevProps.rooms.map(({lastMsgTime}) => lastMsgTime));
  const nextLastMessageTimes = JSON.stringify(nextProps.rooms.map(({lastMsgTime}) => lastMsgTime));

  return (
    prevProps.rooms.length === nextProps.rooms.length &&
    prevParticipants === nextParticipants && 
    prevLastMessageTimes === nextLastMessageTimes
  ); 
}

export default React.memo(Chats, arePropsEqual)