/* eslint-disable no-undef */
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { memo, useMemo, useCallback, useEffect, useState } from 'react';
import { routeStyles } from '../styles/routeStyle';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { shortDate } from '../helpers/getDate';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import allActions from '../store/actions';
import { DeletePopup } from './DeletePopup';
import { removeChatRooms } from '../services/chatRoom';
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { chatStyle } from '../styles/chatStyle';
import TypingPlaceholder from './TypingPlaceholder';
import moment from 'moment';
import { Badge } from 'react-native-paper';

const GetChatList = memo(({
  item,
  navigation,
  selecting,
  selected,
  onSelectChatRoom
}) => {
  const dispatch = useDispatch();
  const [room, setRoom] = useState(item);

  const roomQuery = query(
    collection(db, 'rooms'),
    where('id', '==', item.id),
  );

  const selectChatRoom = useCallback(() => {
    if (selecting) {
      onSelectChatRoom(item._id);
    } else {
      navigation.navigate('ChatScreen', { loading: true });
      dispatch(allActions.chatRooms.activeChatRoom(item));
    }
  }, [selecting, item]);

  const messagesQuery = query(
    collection(db, 'messages'),
    where('roomId', '==', item.id),
    where('isDeleted', '==', false),
    where('read', '==', false),
    orderBy('time', 'desc'),
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(roomQuery, querySnapshot => {
      const roomDoc =
        querySnapshot
          .docChanges()
          .filter(({ type }) => {
            return type === 'modified';
          })
          .map(({ doc }) => doc.data()) ?? [];
      if (!roomDoc.length) return;
      setRoom(prev => ({
        ...prev,
        typingUsers: roomDoc[0].typingUsers?.filter(user => user !== auth.currentUser.email ?? []),
        lastmessage: roomDoc[0].lastmessage,
        lastMsgTime: roomDoc[0].lastMsgTime,
        lastSeens: roomDoc[0].lastSeens,
        isDirectChat: roomDoc[0].isDirectChat,
        sender: roomDoc[0].sender
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getDocs(messagesQuery).then((snapshot) => {
      let unreadCount = 0;
      snapshot.forEach(doc => {
        if (doc.data().sender !== auth.currentUser.email) {
          unreadCount += 1;
        }
      })
      dispatch(allActions.messages.getUnreadMessages(room.id, unreadCount))
      setRoom(prev => ({ ...prev, unread: unreadCount }))
    })
  }, [room.lastmessage, room.lastSeens]);

  useEffect(() => { setRoom(item) }, [item.participants?.length])

  return (
    <TouchableOpacity
      style={routeStyles.chatBox}
      onPress={selectChatRoom}
      onLongPress={() => onSelectChatRoom(item._id)}>
      <View style={routeStyles.fotoButton}>
        {selected ? (
          <AntDesign name="check" style={routeStyles.checkIcon} />
        ) : !item.isDirectChat ? (
          <AvatarGroup
            sources={room.participants?.map(({ image }) => ({ uri: image }))}
            style={routeStyles.chatFoto}
          />
        ) : (
          <Avatar source={{ uri: item.image }} style={routeStyles.chatFoto} />
        )}
      </View>
      <View style={routeStyles.chatInfo}>
        <View style={routeStyles.chatTopInfo}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={routeStyles.chatName}>{room.name}</Text>
          <Text style={routeStyles.chatDate}>{!!room?.lastMsgTime ? shortDate(moment(room?.lastMsgTime).local()) : shortDate(moment(room?.registered).local())}</Text>
        </View>
        {
          room.unread > 0 &&
          <View style={{ position: 'absolute', right: 10, bottom: 15 }}>
            <Badge >{room.unread}</Badge>
          </View>
        }

        {(room?.typingUsers?.length > 0 || !!room.lastmessage) && (
          <View style={routeStyles.chatBottomInfo}>
            <View style={chatStyle.controls}>
              {
                room?.typingUsers?.length > 0 ?
                  <TypingPlaceholder typingUsers={room?.typingUsers} position="relative" />
                  :
                  <View>
                    {
                      room?.sender === auth.currentUser.email && room?.isDirectChat && (
                        // room.read ? <Ionicons
                        //   name="checkmark-done-sharp"
                        //   style={routeStyles.chechMarkDone}
                        // /> :
                        //   <Ionicons
                        //     name="checkmark-outline"
                        //     style={routeStyles.chechMark}
                        //   />
                        <Ionicons
                          name="checkmark-done-sharp"
                          style={routeStyles.chechMarkDone}
                        />
                      )
                    }
                    <Text style={routeStyles.message}>
                      {room?.lastmessage?.length > 30
                        ? room?.lastmessage?.replace(/(\r\n|\n|\r)/gm, ' ').slice(0, 30) + '...'
                        : room?.lastmessage?.replace(/(\r\n|\n|\r)/gm, ' ')}
                    </Text>
                  </View>
              }
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => (
  prevProps.item.id === nextProps.item.id &&
  prevProps.item.participants?.length === nextProps.item.participants?.length &&
  prevProps.selected === nextProps.selected &&
  prevProps.selecting === nextProps.selecting
));

function ChatListComponent({ rooms, navigation }) {
  const searchPhrase = useSelector(state => state.search.searchPhrase);
  const { selecting } = useSelector(state => state.chatRooms);
  const dispatch = useDispatch();
  const [selectedChatRoomIds, setSelectedChatRoomIds] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const handleSelectChatRoom = selectedId => {
    if (selectedChatRoomIds.includes(selectedId)) {
      setSelectedChatRoomIds(prev => prev.filter(id => id !== selectedId));
    } else {
      setSelectedChatRoomIds(prev => [...prev, selectedId]);
    }
  };

  const handleCancelSelecting = () => {
    setSelectedChatRoomIds([]);
  };

  const handleDeleteSelectedChatRooms = () => {
    removeChatRooms(selectedChatRoomIds);
    handleCancelSelecting();
  };

  useEffect(() => {
    const sortedChatRooms = rooms.sort((a, b) =>
      moment(b.lastMsgTime).diff(a.lastMsgTime),
    );

    if (searchPhrase) {
      setFilteredData(
        sortedChatRooms.filter(
          item =>
            String(item.name)
              .toLowerCase()
              .includes(searchPhrase.toLowerCase()) ||
            String(item.lastmessage)
              .toLowerCase()
              .includes(searchPhrase.toLowerCase()),
        ),
      );
    } else {
      setFilteredData(sortedChatRooms);
    }
  }, [searchPhrase, rooms]);

  useEffect(() => {
    if (selectedChatRoomIds.length && !selecting) {
      dispatch(allActions.chatRooms.startSelecting());
    }
    if (!selectedChatRoomIds.length && selecting) {
      dispatch(allActions.chatRooms.endSelecting());
    }
  }, [selectedChatRoomIds, selecting]);

  return (
    <View style={routeStyles.listContainer}>
      {!filteredData.length ? (
        <Text style={routeStyles.dataNotFound}>Data not found</Text>
      ) : (
        <FlatList
          data={filteredData}
          initialNumToRender={50}
          maxToRenderPerBatch={50}
          renderItem={({ item }) => (
            <GetChatList
              item={item}
              navigation={navigation}
              selecting={selecting}
              selected={selectedChatRoomIds.includes(item._id)}
              onSelectChatRoom={handleSelectChatRoom}
            />
          )}
          keyExtractor={item => item._id}
          virtualized={true}
        />
      )}
      {selecting && (
        <DeletePopup
          onCancel={handleCancelSelecting}
          onDelete={handleDeleteSelectedChatRooms}
        />
      )}
    </View>
  );
};

function arePropsEqual(prevProps, nextProps) {
  const prevParticipants = prevProps.rooms.map(({ participants }) => participants?.length).filter(val => val !== undefined).reduce((accumulator, currentValue) => accumulator + (currentValue ?? 0), 0);
  const nextParticipants = nextProps.rooms.map(({ participants }) => participants?.length).filter(val => val !== undefined).reduce((accumulator, currentValue) => accumulator + (currentValue ?? 0), 0);
  const prevLastMessageTimes = JSON.stringify(prevProps.rooms.map(({ lastMsgTime }) => lastMsgTime));
  const nextLastMessageTimes = JSON.stringify(nextProps.rooms.map(({ lastMsgTime }) => lastMsgTime));

  return (
    prevProps.rooms.length === nextProps.rooms.length &&
    prevParticipants === nextParticipants &&
    prevLastMessageTimes === nextLastMessageTimes
  );
}

export default React.memo(ChatListComponent, arePropsEqual)
