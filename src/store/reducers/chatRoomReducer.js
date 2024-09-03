const initialState = {
  chatRooms: [],
  selecting: false,
  activeChatRoom: undefined,
};

const chatRoomReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_CHAT_ROOM':
      return {
        ...state,
        chatRooms: [...state.chatRooms, action.payload],
      };
    case 'REMOVE_CHAT_ROOM':
      return {
        ...state,
        chatRooms: state.chatRooms.filter(
          ({_id}) => !action.payload.ids?.includes(_id),
        ),
      };
    case 'START_SELECTING_CHAT_ROOM':
      return {
        ...state,
        selecting: true,
      };
    case 'END_SELECTING_CHAT_ROOM':
      return {
        ...state,
        selecting: false,
      };
    case 'ACTIVE_CHAT_ROOM':
      return {
        ...state,
        activeChatRoom: action.payload,
      };
    case 'CLOSE_CHAT_ROOM':
      return {
        ...state,
        activeChatRoom: undefined,
      };
    default:
      return state;
  }
};

export default chatRoomReducer;
