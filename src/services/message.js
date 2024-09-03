import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { auth, db, storage } from '../../firebase';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Image, Video, Audio } from 'react-native-compressor';
import RNFS from 'react-native-fs';
import { Alert, Platform } from 'react-native';
import moment from 'moment';



const IMAGE_UPLOAD_PATH = 'images';
const VIDEO_UPLOAD_PATH = 'videos';
const AUDIO_UPLOAD_PATH = 'records';

const uploadFile = async (compressedPath, path, fileName, contentType, dispatch, roomId, uri) => {
  let blob = await new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      res(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      rej(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', compressedPath, true);
    xhr.send(null);
  });
  const fileRef = ref(storage, `${path}/${fileName}`);

  const uploadTask = uploadBytesResumable(fileRef, blob, { contentType });
  const uploadPromise = new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        dispatch(Math.floor(progress), 'Uploading', roomId, uri)
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error(error);
        reject(error);
      },
      async () => {
        // Handle successful uploads on complete
        var url = await getDownloadURL(uploadTask.snapshot.ref);
        blob.close();
        resolve({ url, fileName });
      }
    );
  })
  return uploadPromise;
};

const getLastMessageFromItem = (payload) => {
  let lastmessage = payload.message;
  if (payload.contact) {
    lastmessage = 'Contact is attached.';
  }
  if (payload.uri && payload.type?.includes('image/')) {
    lastmessage = 'Image is attached.';
  }
  if (payload.uri && payload.type?.includes('video/')) {
    lastmessage = 'Video is attached.';
  }
  if (payload.uri && payload.type?.includes('audio/')) {
    lastmessage = 'Audio is attached.';
  }

  return lastmessage;
}

const sendMessageToAPI = async (payload, dispatch, uri) => {
  const messageId = uuid();

  const newMessage = {
    id: messageId,
    sender: auth.currentUser.email,
    emoji: null,
    isDeleted: false,
    read: false,
    time: moment().utc().format(),
    updatedAt: moment().utc().format(),
    ...payload,
  };

  try {
    await setDoc(doc(db, 'messages', messageId), newMessage);

    const roomDoc = await getDoc(doc(db, 'rooms', payload.roomId));
    const roomMessageIds = roomDoc.exists()
      ? roomDoc.data()?.messages ?? []
      : [];
    const roomFileUrls = roomDoc.exists() ? roomDoc.data()?.files ?? [] : [];

    await updateDoc(doc(db, 'rooms', payload.roomId), {
      lastmessage: getLastMessageFromItem(payload),
      messages: [...roomMessageIds, messageId],
      ...(payload.uri ? { files: [...roomFileUrls, payload.uri] } : {}),
      lastMsgTime: newMessage.time
    });
    if (dispatch) {
      dispatch(0, null, payload.roomId, uri, false)
    }
  } catch (e) {
    console.log('send message error:', e);
  }
};

const sendImage = async (image, roomId, dispatch, removeBackgroundUpload, onError) => {
  try {
    const isImageFile = image.type?.includes('image/');
    var compressedPath = '';
  
    if (isImageFile) {
      // const resizedImage = await ImageResizer.createResizedImage(image.uri, 800, 600, Platform.OS === 'ios' ? 'JPEG' : 'WEBP', 80);
      try {
        
        const result = await Image.compress(image.uri, {
          progressDivider: 10,
          downloadProgress: (progress) => {
            dispatch(Math.floor(progress * 100), 'Compressing', roomId, image.uri)
          },
        } );
        compressedPath = result;
      } catch (error) {
        Alert.alert('Failed to send image', error.message);
        onError();
      }
    }
    else {
      const fileData = await RNFS.readFile(image.uri, 'base64')
      const filePath = `${RNFS.DocumentDirectoryPath}/${image.name}`;
      await RNFS.writeFile(filePath, fileData, 'base64');
      const result = await Video.compress(
        `file://${filePath}`,
        { progressDivider: 10 },
        (progress) => {
          dispatch(Math.floor(progress * 100), 'Compressing', roomId, image.uri)
        }
      );
      compressedPath = result
    }
    const { url, fileName } = await uploadFile(
      compressedPath,
      isImageFile ? IMAGE_UPLOAD_PATH : VIDEO_UPLOAD_PATH,
      `${isImageFile ? 'image' : 'video'}-${uuid()}.${isImageFile ? Platform.OS === 'ios' ? 'jpg' : 'webp' : 'mp4'
      }`,
      image.type,
      dispatch,
      roomId,
      image.uri
    );
    if (removeBackgroundUpload) {
      removeBackgroundUpload(image.uri)
    }
    await sendMessageToAPI({
      uri: url,
      fileName,
      type: image.type,
      roomId,
    }, dispatch, image.uri);
  } catch (e) {
    Alert.alert('Failed to send image', e.message);
    onError();
  }
};

const sendAudio = async (audio, roomId, dispatch, removeBackgroundUpload) => {
  const type = `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`;
  const result = await Audio.compress(
    audio.uri,
    { quality: 'medium' }
  );
  const { url, fileName } = await uploadFile(
    result,
    AUDIO_UPLOAD_PATH,
    `audio-${uuid()}.${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`,
    `audio/${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`,
    dispatch,
    roomId,
    audio.uri
  );
  if (removeBackgroundUpload) {
    removeBackgroundUpload(audio.uri)
  }
  await sendMessageToAPI({
    uri: url,
    duration: audio.duration,
    fileName,
    type,
    roomId,
  }, dispatch, audio.uri);

};

const sendMessage = async (message, roomId) => {
  await sendMessageToAPI({
    roomId,
    message,
  });
};

const sendContact = async (contact, roomId) => {
  await sendMessageToAPI({
    roomId,
    contact,
  });
};

const removeMessage = async (messageIds, messages, roomId) => {
  Promise.all(
    messageIds.map(async messageId => {
      await updateDoc(doc(db, 'messages', messageId), {
        isDeleted: true,
        updatedAt: moment().utc().format(),
      });
    }),
  );

  const existMessages = messages.filter(({ id, isDeleted }) => !isDeleted && !messageIds?.includes(id));
  console.log(messages.length, existMessages.length, '==========')
  const lastmessage = existMessages?.length ? getLastMessageFromItem(existMessages[0]) : '';

  await updateDoc(doc(db, 'rooms', roomId), {
    lastmessage: lastmessage,
    lastMsgTime: existMessages?.length ? existMessages[0].time : ""
  });
};

const addEmoji = async (messageId, emoji) => {
  await updateDoc(doc(db, 'messages', messageId), {
    emoji,
    updatedAt: moment().utc().format(),
  });
};

const typingStatus = async (roomId, user, status) => {
  const roomDoc = await getDoc(doc(db, 'rooms', roomId))
  if (roomDoc.exists() && roomDoc.data()?.participants?.length) {
    let typingUsers = roomDoc.data()?.typingUsers ? roomDoc.data()?.typingUsers : []

    roomDoc.data().participants.map(participant => {
      if (participant === user) {
        if (status === true) {
          typingUsers.push(user)
          typingUsers = [...new Set(typingUsers)]
        } else {
          typingUsers = typingUsers.filter(s => s !== user)
        }
      }
    });
    try {
      await updateDoc(doc(db, "rooms", roomId), {
        typingUsers: typingUsers
      })
    } catch (e) {
      console.log('update typing users', e)
    }
  }
}

export {
  addEmoji,
  sendImage,
  sendAudio,
  sendMessage,
  sendContact,
  removeMessage,
  typingStatus,
};
