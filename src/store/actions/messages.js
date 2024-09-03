const markMessage = id => {
  return {
    type: 'MARK_MESSAGE',
    payload: id,
  };
};

const markReset = () => {
  return {
    type: 'MARK_RESET',
  };
};

const setMessages = messages => {
  return {
    type: 'SET_MESSAGES',
    payload: messages,
  };
};

const addMessage = message => {
  return {
    type: 'ADD_MESSAGE',
    payload: message,
  };
};

const removeMessage = ids => {
  return {
    type: 'REMOVE_MESSAGE',
    payload: ids,
  };
};

const updateMessage = (id, emoji) => {
  return {
    type: 'UPDATE_MESSAGE',
    payload: {id, emoji},
  };
};

const resetMessages = () => {
  return {
    type: 'RESET_MESSAGES',
  };
};

const startSelecting = ids => {
  return {
    type: 'START_SELECTING_MESSAGE',
  };
};

const endSelecting = ids => {
  return {
    type: 'END_SELECTING_MESSAGE',
  };
};

const updateUploadProgress = (progress, status, roomId, uri, remove) => {
  return {
    type: 'UPDATE_UPLOAD_PROGRESS',
    payload: {progress, status, roomId, uri, remove}
  };
};

const getUnreadMessages = (roomId, count) => {
  return {
    type: 'GET_UNREAD_MSGS',
    payload: {roomId, count}
  };
};

export default {
  markMessage,
  markReset,
  setMessages,
  addMessage,
  removeMessage,
  updateMessage,
  resetMessages,
  startSelecting,
  endSelecting,
  updateUploadProgress,
  getUnreadMessages
};
