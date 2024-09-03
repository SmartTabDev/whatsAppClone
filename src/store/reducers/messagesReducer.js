const initialState = {
  markedId: null,
  data: [],
  selecting: false,
  uploadProgress: {},
  unreadMsgs: {}
};

export const messagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'MARK_MESSAGE': {
      return {
        ...state,
        markedId: state.markedId === action.payload ? null : action.payload,
      };
    }
    case 'MARK_RESET': {
      return {
        ...state,
        markedId: null,
      };
    }
    case 'SET_MESSAGES': {
      return {
        ...state,
        data: [...action.payload],
      };
    }
    case 'ADD_MESSAGE': {
      if (state.data) {
        return {
          ...state,
          data: [...state.data, action.payload],
        };
      } else {
        return {
          ...state,
          data: [
            {
              id: action.payload.id,
              sender: action.payload.sender,
              message: action.payload.message,
              emoji: null,
              time: action.payload.time,
              updatedAt: action.payload.updatedAt,
            },
          ],
        };
      }
    }
    case 'REMOVE_MESSAGE': {
      return {
        ...state,
        data: state.data.filter(
          message => !action.payload?.includes(message.id),
        ),
      };
    }
    case 'UPDATE_MESSAGE': {
      return {
        ...state,
        data: state.data.map(item => {
          if (item.id === action.payload.id) {
            return {...item, emoji: action.payload.emoji};
          }
          return item;
        }),
      };
    }
    case 'RESET_MESSAGES':
      return {
        ...state,
        data: [],
      };
    case 'START_SELECTING_MESSAGE':
      return {
        ...state,
        selecting: true,
      };
    case 'END_SELECTING_MESSAGE':
      return {
        ...state,
        selecting: false,
      };
    case 'UPDATE_UPLOAD_PROGRESS':
      const data = action.payload
      const temp = state.uploadProgress
      return {
        ...state,
        uploadProgress: data.remove ? delete temp.uploadProgress[data.uri] : {...state.uploadProgress, [action.payload.uri]: {text: action.payload.status, progress: action.payload.progress}}
      };
    case 'GET_UNREAD_MSGS':
      return {
        ...state,
        unreadMsgs: {...state.unreadMsgs, [action.payload.roomId] : action.payload.count}
      };
    default:
      return state;
  }
};

export default messagesReducer;
