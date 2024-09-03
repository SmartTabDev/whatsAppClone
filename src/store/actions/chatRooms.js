const addChatRoom = ({
  _id,
  email,
  name,
  isActive,
  lastmessage,
  participants,
  image,
  registered,
  lastMsgTime
}) => {
  return {
    type: 'ADD_CHAT_ROOM',
    payload: {
      _id,
      lastmessage,
      email,
      name,
      isActive,
      image,
      registered,
      participants,
      lastMsgTime
    },
  };
};

const removeChatRoom = ids => {
  return {
    type: 'REMOVE_CHAT_ROOM',
    payload: {ids},
  };
};

const startSelecting = ids => {
  return {
    type: 'START_SELECTING_CHAT_ROOM',
  };
};

const endSelecting = ids => {
  return {
    type: 'END_SELECTING_CHAT_ROOM',
  };
};

const activeChatRoom = chatRoom => {
  return {
    type: 'ACTIVE_CHAT_ROOM',
    payload: chatRoom,
  };
};

const closeChatRoom = () => {
  return {
    type: 'CLOSE_CHAT_ROOM',
  };
};

export default {
  addChatRoom,
  removeChatRoom,
  startSelecting,
  endSelecting,
  activeChatRoom,
  closeChatRoom
};
