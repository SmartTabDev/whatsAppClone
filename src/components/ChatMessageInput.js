/* eslint-disable no-undef */
import {
  View,
  TouchableOpacity,
  TextInput,
  PermissionsAndroid,
  Keyboard,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useNavigation } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { useDispatch } from 'react-redux';
import { ActivityIndicator } from 'react-native-paper';
import { chatStyle } from '../styles/chatStyle';
import AudioRecorder from './AudioRecorder';
import {
  sendImage,
  sendAudio,
  sendContact,
  sendMessage,
  typingStatus
} from '../services/message';
import { auth } from '../../firebase';
import { fontRegular } from '../styles/customFont';
import allActions from '../store/actions';
import { uuidv4 } from 'react-native-compressor';

function ChatMessageInput({ roomId, onStartSending, onEndSending, sendingMessage, addBackgroundUpload, removeBackgroundUpload }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [inputPosition, setInputPosition] = useState(7);
  const [forceKey, setForceKey] = useState(0);
  const typingTimeout = useRef(null);
  const typeStatus = useRef(false);

  const updateUploadProgress = (progress, status, roomId, uri) => {
    dispatch(allActions.messages.updateUploadProgress(progress, status, roomId, uri))
  }

  const handleOpenLibrary = async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
      });
      if (response && response?.length) {
        onStartSending();
        addBackgroundUpload(response[0])
        onEndSending();
        await sendImage(response[0], roomId, updateUploadProgress, removeBackgroundUpload);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleShareContact = () => {
    dispatch(allActions.contactNavigation.setParam(
      {
        onSelect: contact => {
          sendContact(contact, roomId);
          navigation.navigate('ChatScreen', { loading: true });
        },
        createGroup: false,
        createContact: true,
        title: 'Share Contact',
        disableContacts: [],
      }
    ));
    navigation.navigate('SelectContact');
  };

  const handleTakePhoto = () => {
    navigation.navigate('Camera', { roomId });
  };

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
        } else {
          console.log('All required permissions not granted');

          return;
        }
      } catch (err) {
        console.warn(err);

        return;
      }
    }
  };

  const handleSendMessage = async () => {
    setMessage('');
    await sendMessage(message, roomId);
  };

  const onType = useCallback((e) => {
    setMessage(e)

    if (!typeStatus.current) {
      typeStatus.current = true;
    } else {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      typeStatus.current = false;
      setForceKey(prev => prev + 1)
    }, 1000);
  }, [typeStatus, typingTimeout.current]);

  const onFinish = async (audio) => {
    onStartSending();
    addBackgroundUpload({ uri: audio.uri, duration: audio.duration, name: `audio-${uuidv4()}.${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`, type: `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp3'}` })
    onEndSending();
    await sendAudio(audio, roomId, updateUploadProgress, removeBackgroundUpload);
  };

  useEffect(() => {
    requestAudioPermission().then();
  }, [])

  useEffect(() => {
    typingStatus(roomId, auth.currentUser.email, typeStatus.current)
  }, [typeStatus.current])

  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        setInputPosition(60)
      })
      const keyboardDidHideListner = Keyboard.addListener('keyboardDidHide', (e) => {
        setInputPosition(7)
      })
      return () => {
        keyboardDidHideListner.remove();
        keyboardDidShowListener.remove()
      }
    }
  }, [])

  return (
    <View style={{ ...chatStyle.messageContent, bottom: inputPosition }}>
      <View style={chatStyle.messageBox} pointerEvents={sendingMessage ? 'none' : 'auto'}>
        <Menu style={{ paddingBottom: Platform.OS === 'ios' ? '4%' : 16 }}>
          <MenuTrigger style={chatStyle.messageButton}>
            <MaterialCommunityIcons name="plus" style={chatStyle.messageIcon} />
          </MenuTrigger>
          <MenuOptions
            optionsContainerStyle={{ marginTop: Platform.OS === 'ios' ? -40 : -20 }}
            customStyles={{
              optionsContainer: {
                borderRadius: 15,
                padding: 15,
                fontSize: 14,
                width: 200
              },
            }}>
            <MenuOption
              customStyles={{ optionText: fontRegular }}
              text="Photo & Video Library"
              onSelect={handleOpenLibrary}
            />
            <MenuOption
              customStyles={{ optionText: fontRegular }}
              text="Contact"
              onSelect={handleShareContact}
            />
          </MenuOptions>
        </Menu>
        <View style={chatStyle.messageInputContainer}>
          <TextInput
            placeholder="Message"
            style={chatStyle.messageInput}
            value={message}
            onChangeText={onType}
            placeholderTextColor="#aaa"
            multiline={true}
          />
        </View>
        <TouchableOpacity
          style={{ ...chatStyle.messageButton, marginBottom: Platform.OS === 'ios' ? '4%' : 15 }}
          onPress={handleTakePhoto}>
          <MaterialIcons name="photo-camera" style={chatStyle.messageIcon} />
        </TouchableOpacity>
      </View>
      {message ? (
        <TouchableOpacity
          style={chatStyle.voiceMessageButton}
          onPress={handleSendMessage}
        >
          <MaterialIcons name="send" style={chatStyle.voiceMessageIcon} />
        </TouchableOpacity>
      ) : (
        <AudioRecorder onFinish={onFinish} />
      )}
    </View>
  );
};

function arePropsEqual(prevProps, nextProps) {
  return prevProps.sendingMessage === nextProps.sendingMessage && prevProps.roomId === nextProps.roomId;
}

export default React.memo(ChatMessageInput, arePropsEqual)
