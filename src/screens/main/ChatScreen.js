/* eslint-disable no-undef */
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { auth, db } from '../../../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, endBefore, getDocs, startAfter, Timestamp } from 'firebase/firestore';
import { chatStyle } from '../../styles/chatStyle';
import ChatHeader from '../../components/ChatHeader';
import ChatContainer from '../../components/ChatContainer';
import ChatMessageInput from '../../components/ChatMessageInput';
import { Loader } from '../../components/Loader';
import TypingPlaceholder from '../../components/TypingPlaceholder';
import { updateLastSeen } from '../../services/chatRoom';
import { parseChatRoom } from './Chats';
import { uuidv4 } from 'react-native-compressor';
import moment from 'moment';

const ChatScreen = ({ navigation }) => {
  const route = useRoute();
  const { markedId, selecting } = useSelector(state => state.messages);
  const chatRoom = useSelector(state => state.chatRooms.activeChatRoom, shallowEqual);
  const contacts = useSelector(state => state.contacts.contacts)
  const [room, setRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [offset, setOffset] = useState(1)

  const roomMessageQuery = query(
    collection(db, 'messages'),
    where('roomId', '==', chatRoom?.id),
    orderBy('updatedAt', 'desc'),
    endBefore(new Date().toISOString()),
  );

  const roomQuery = query(
    collection(db, 'rooms'),
    where('id', '==', chatRoom.id),
  )

  const addBackgroundUpload = (data) => {
    setMessages(prev => [
      {
        ...data,
        fileName: data.name,
        id: uuidv4(),
        sender: auth.currentUser.email,
        backgroundupload: true,
      },
      ...prev
    ]);
  }

  const removeBackgroundUpload = (uri) => {
    setMessages(prev => prev.filter(data => data.uri !== uri));
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(roomQuery, querySnapshot => {
      const roomDoc =
        querySnapshot
          .docChanges()
          .filter(({ type }) => {
            return type === 'modified' || type === 'added';
          })
          .map(({ doc }) => doc.data()) ?? [];
      if (!roomDoc.length) return;
      const typeUsers = (roomDoc[0]?.typingUsers || []).filter(user => user !== auth.currentUser.email)
      setRoom({ ...roomDoc[0], typingUsers: typeUsers, isTyping: typeUsers.length > 0 })
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(roomMessageQuery,  querySnapshot => {
      const newMessageDocs =
        querySnapshot
          .docChanges()
          .filter(({ type }) => {
            return type === 'added';
          })
          .map(({ doc }) => doc.data()) ?? [];
      const updatedMessageDocs =
        querySnapshot
          .docChanges()
          .filter(({ type }) => {
            return type === 'modified';
          })
          .map(({ doc }) => doc.data()) ?? [];
          if(newMessageDocs.length === 1 && newMessageDocs[0].time === newMessageDocs[0].updatedAt){
            setMessages(prev => [...newMessageDocs, ...prev])
          }else{
            setMessages(prev => {
              const updatedMessages = prev.map(message => {
                const index = (newMessageDocs.length >0 ? newMessageDocs : updatedMessageDocs).findIndex(doc => doc.id === message.id)
      
                if (index !== -1) {
                  return (newMessageDocs.length >0 ? newMessageDocs : updatedMessageDocs)[index];
                } else {
                  return message;
                }
              });
              const newMessages = [ ...updatedMessages];
      
              return newMessages;
            });

          }
    });

    return () => unsubscribe();
  }, [])

  useEffect(() => {
    const lastMessageTime = messages.length > 0 ? new Date(messages[messages.length - 1].time) : new Date(moment.utc().format());
    const roomMessageQuery = query(
      collection(db, 'messages'),
      where('roomId', '==', chatRoom?.id),
      orderBy('time', 'desc'),
      startAfter(lastMessageTime.toISOString()),
      limit(20)
    );
    getDocs(roomMessageQuery).then((snapshot) => {
      let msgs = []
      snapshot.forEach(doc => {
        msgs.push(doc.data())
      })
      const array = [...messages, ...msgs]
      const uniqueArray = array.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.id === item.id
        ))
      );
      setMessages(uniqueArray)
      setIsLoading(false);

    })
  }, [offset])

  useEffect(() => {
    // if(chatRoom.isDirectChat){
    updateLastSeen(chatRoom.id, auth.currentUser.email, new Date())
    // }
  }, [])



  return chatRoom.id ? (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'height' : null} style={{ flex: 1, justifyContent: 'center' }} >
      <View style={{ ...chatStyle.container, position: 'relative' }}>
        <ChatHeader
          navigation={navigation}
          markedId={markedId}
          item={room === null ? chatRoom : parseChatRoom(room, contacts)}
        />
        {isLoading && route.params?.loading ?
          <Loader /> :
          <>
            {/* {
              sendingMessage && <MsgSendLoader />
            } */}
            <ChatContainer
              selecting={selecting}
              chatRoomId={chatRoom.id}
              isDirectChat={room?.isDirectChat}
              sendingmessage={sendingMessage}
              setIsLoading={setIsLoading}
              messages={messages}
              addData={() => setOffset(offset + 1)}
              offset={offset}
            />
            <TypingPlaceholder typingUsers={room?.typingUsers ?? []} position="absolute" />
          </>
        }
        <ChatMessageInput
          roomId={chatRoom.id}
          onStartSending={() => setSendingMessage(true)}
          onEndSending={() => setSendingMessage(false)}
          sendingMessage={sendingMessage}
          addBackgroundUpload={addBackgroundUpload}
          removeBackgroundUpload={removeBackgroundUpload}
        />
      </View>
    </KeyboardAvoidingView>
  ) : null;
};

export default React.memo(ChatScreen);