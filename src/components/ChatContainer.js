/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
import { useEffect } from 'react'
import { View, SafeAreaView, Alert, Keyboard, FlatList } from 'react-native';
import React, { useState, useRef } from 'react';
import EmojiPicker, { tr } from 'rn-emoji-keyboard';
import Contacts from 'react-native-contacts';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { doc, updateDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { Modal, Text, Portal } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { chatStyle } from '../styles/chatStyle';
import { Message } from './RenderMessage';
import { auth, db } from '../../firebase';
import { addEmoji, removeMessage } from '../services/message';
import { Avatar } from './Avatar';
import { routeStyles } from '../styles/routeStyle';
import allActions from '../store/actions';
import { DeletePopup } from './DeletePopup';

function ChatContainer({
  sendingmessage,
  selecting,
  chatRoomId,
  isDirectChat,
  messages,
  addData,
  offset
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [playingId, setPlayingId] = useState();
  const [playing, setPlaying] = useState(false);
  const dispatch = useDispatch();
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState();
  const [contactModalVisible, setContactModalVisible] = useState(false)
  const [contactItem, setContactItem] = useState({})
  let flatListRef = useRef(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const windowSize = messages?.length > 50 ? messages?.length / 4 : 21;

  // const messages = mockData

  const viewContact = (contact) => {
    setContactModalVisible(true)
    setContactItem(contact)
  }
  const showModal = () => setContactModalVisible(true)
  const hideModal = () => setContactModalVisible(false)

  const handleAddEmoji = id => {
    setSelectedMessageId(id);
    if (!showEmoji) {
      setShowEmoji(true);
    }
  };

  const handleSelectEmoji = async emojiObject => {
    await addEmoji(selectedMessageId, emojiObject.emoji);
    setSelectedMessageId(undefined);
  };

  const handleSaveContact = contact => {
    Alert.alert(
      'Add Contact',
      `Would you save "${contact.displayName}" as new contact?`,
      [
        {
          text: 'No',
        },
        {
          text: 'Yes',
          onPress: () => Contacts.openContactForm(contact).then((res) => {
            dispatch(allActions.contacts.addContact(res));
          }),
        },
      ],
    );
    hideModal()
  };

  const handleStartPlay = idx => {
    setPlayingId(idx);
    setPlaying(true);
  };

  const handleFinishPlay = () => {
    setPlayingId(undefined);
    setPlaying(false);
  };

  const handleRemoveMessage = id => {
    removeMessage(id, messages, chatRoomId);
  };

  const handleSelectMessage = selectedId => {
    if (selectedMessageIds?.includes(selectedId)) {
      setSelectedMessageIds(prev => prev.filter(id => id !== selectedId));
    } else {
      setSelectedMessageIds(prev => [...prev, selectedId]);
    }
  };

  const handleDeleteSelectedMessages = () => {
    removeMessage(selectedMessageIds, messages, chatRoomId);
    handleCancelSelecting();
  };

  const handleCancelSelecting = () => {
    setSelectedMessageIds([]);
  };

  const addContact = () => {
    console.log(contactItem)
    Contacts.openContactForm(contactItem).then((res) => {
      dispatch(allActions.contacts.addContact(res));
      hideModal()
    })
  }

  useEffect(() => {
    if (selectedMessageIds.length && !selecting) {
      dispatch(allActions.messages.startSelecting());
    }
    if (!selectedMessageIds.length && selecting) {
      dispatch(allActions.messages.endSelecting());
    }
  }, [selectedMessageIds, selecting]);

  useEffect(() => {
    const unreadMsgs = messages.filter(msg => (msg?.read === undefined || msg?.read === false) && msg?.sender !== auth.currentUser.email)
    const updateReadStatus = async (msg) => {
      await updateDoc(doc(db, "messages", msg.id), {
        read: true
      })
    }
    dispatch(allActions.messages.getUnreadMessages(chatRoomId, 0))
    unreadMsgs.map(msg => {
      updateReadStatus(msg)
    })
  }, [messages.length])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0 && isKeyboardVisible) {
      setTimeout(() => flatListRef.current?.scrollToIndex({ animated: true, index: 0 }), 500);
    }
  }, [flatListRef, isKeyboardVisible, sendingmessage])

  return (
    <>
      <View style={chatStyle.chatContainer} >
        <Portal>
          <Modal visible={contactModalVisible} onDismiss={hideModal} contentContainerStyle={chatStyle.contactViewModal}>
            <View style={{display: 'flex', justifyContent: 'space-between'}}>
              <TouchableOpacity onPress={addContact}>
                <Text style={routeStyles.contactInfo}>Close</Text>
              </TouchableOpacity>

            </View>
              <TouchableOpacity onPress={() => handleSaveContact(contactItem)} style={{position: 'absolute', right: 0, top: -30}}>
                  <MaterialCommunityIcons name="account-plus" size={30}  />
              </TouchableOpacity>
            <View style={routeStyles.contactCenter}>
              <Avatar
                source={{
                  uri: contactItem.thumbnailPath,
                }}
                style={routeStyles.contactFoto}
              />
              <Text style={routeStyles.contactName}>{contactItem.displayName}</Text>
              {/* phone number */}
              {
                contactItem.phoneNumbers && contactItem.phoneNumbers.length > 0 &&
                <View style={routeStyles.itemSection}>
                  {
                    contactItem.phoneNumbers.map((pItem, index) => (
                      (
                        <React.Fragment key={index}>
                          <Text style={routeStyles.contactLabel}>{pItem.label}</Text>
                          <Text style={routeStyles.contactInfo}>{pItem.number}</Text>
                        </React.Fragment>
                      )
                    ))
                  }
                </View>
              }
              {/* email address */}
              {
                contactItem.emailAddresses && contactItem.emailAddresses.length > 0 &&
                <View style={routeStyles.itemSection}>
                  {
                    contactItem.emailAddresses.map((eItem, index) => (
                      (
                        <React.Fragment key={index}>
                          <Text style={routeStyles.contactLabel}>{eItem.label}</Text>
                          <Text style={routeStyles.contactInfo}>{eItem.email}</Text>
                        </React.Fragment>
                      )
                    ))
                  }
                </View>
              }
              {/* postal address */}
              {
                contactItem.postalAddresses && contactItem.postalAddresses.length > 0 &&
                <View style={routeStyles.itemSection}>
                  {
                    contactItem.postalAddresses.map((aItem, index) => (
                      (
                        <React.Fragment key={index}>
                          <Text style={routeStyles.contactLabel}>{aItem.label}</Text>
                          <Text style={routeStyles.contactInfo}>{aItem.street} </Text>
                          <Text style={routeStyles.contactInfo}>{aItem.city} {aItem.region} {aItem.postCode} {aItem.country}</Text>
                        </React.Fragment>
                      )
                    ))
                  }
                </View>
              }
              {/* birthday */}
              {
                contactItem.birthday &&
                <View style={routeStyles.itemSection}>
                  <Text style={routeStyles.contactLabel}>birthday</Text>
                  <Text style={routeStyles.contactInfo}>{contactItem.birthday.month} {contactItem.birthday.day}, {contactItem.birthday.year} </Text>
                </View>
              }
            </View>
          </Modal>
        </Portal>
        <SafeAreaView style={routeStyles.flexContainer}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            windowSize={windowSize}
            onEndReachedThreshold={offset < 10 ? (offset * (offset == 1 ? 2 : 2)) : 20}
            onEndReached={addData}
            renderItem={({ item }) => (
              <Message
                item={item}
                selected={selectedMessageIds.includes(item.id)}
                selecting={selecting}
                playingId={playingId}
                playing={playing}
                handleSelectMessage={handleSelectMessage}
                handleAddEmoji={handleAddEmoji}
                handleSaveContact={handleSaveContact}
                handleStartPlay={handleStartPlay}
                handleFinishPlay={handleFinishPlay}
                handleRemove={handleRemoveMessage}
                viewContact={viewContact}
                isDirectChat={isDirectChat}
              />
            )}
            keyExtractor={item => item?.id}
            virtualized={true}
            removeClippedSubviews={true}
          />
        </SafeAreaView>
        <EmojiPicker
          onEmojiSelected={handleSelectEmoji}
          open={showEmoji}
          onClose={() => {
            setShowEmoji(false);
          }}
          categoryPosition="top"
          expandable={true}
          disabledCategories={[
            // 'smileys_emotion',
            // 'people_body',
            'activities',
            'flags',
            'objects',
            'symbols',
            'animals_nature',
            'food_drink',
            'travel_places',
            'objects',
          ]}
        />
      </View>
      {selecting && (
        <DeletePopup
          onCancel={handleCancelSelecting}
          onDelete={handleDeleteSelectedMessages}
        />
      )}
    </>
  );
};


function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.chatRoomId === nextProps.chatRoomId &&
    prevProps.selecting === nextProps.selecting &&
    JSON.stringify(prevProps.messages) === JSON.stringify(nextProps.messages)
  ); //It could be something else not has to be id.
}

export default React.memo(ChatContainer, arePropsEqual)
