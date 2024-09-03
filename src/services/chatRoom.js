import {v4 as uuid} from 'uuid';
import {setDoc, doc, deleteDoc, getDoc, updateDoc} from 'firebase/firestore';
import {ref, deleteObject} from 'firebase/storage';
import {db, storage} from '../../firebase';

const addChatRoom = async ({
  lastmessage,
  participants,
  image,
  name,
  isActive,
  registered,
  lastMsgTime
}) => {
  const chatRoomId = uuid();
  const isDirectChat = participants.length === 2;
  const newChatRoom = {
    lastmessage,
    participants,
    image,
    name,
    isDirectChat,
    isActive,
    registered,
    id: chatRoomId,
    lastMsgTime
  };

  try {
    await setDoc(doc(db, 'rooms', chatRoomId), newChatRoom);

    return newChatRoom;
  } catch (e) {
    console.log('create chat room error:', e);
  }
};

const removeChatRooms = async chatRoomIds => {
  try {
    Promise.all(
      chatRoomIds.map(async chatRoomId => {
        const roomDocRef = doc(db, 'rooms', chatRoomId);
        const roomDoc = await getDoc(roomDocRef);
        if (roomDoc.exists() && roomDoc.data()?.messages?.length) {
          Promise.all(
            roomDoc.data().messages.map(messageId => {
              deleteDoc(doc(db, 'messages', messageId));
            }),
          );
        }
        if (roomDoc.exists() && roomDoc.data()?.files?.length) {
          Promise.all(
            roomDoc.data().files.map(fileUrl => {
              const fileRef = ref(storage, fileUrl);
              deleteObject(fileRef);
            }),
          );
        }
        await deleteDoc(roomDocRef);
      }),
    );
  } catch (e) {
    console.log('remove chat room error:', e);
  }
};

const updateLastSeen = async (roomId, user, time) => {
  const roomDoc = await getDoc(doc(db, 'rooms', roomId))
  if (roomDoc.exists() && roomDoc.data()?.participants?.length ) {
    let lastSeens = roomDoc.data()?.lastSeens ? roomDoc.data()?.lastSeens : []
    let userExist = false
    lastSeens.map((each, index) => {
      if (each.email === user) {
        userExist = true
        lastSeens[index].time = time
      }
    });
    if(!userExist){
      lastSeens.push({email: user, time})
    }
    await updateDoc(doc(db, "rooms", roomId), {
      lastSeens
    })
  }
}

export {addChatRoom, removeChatRooms, updateLastSeen};
