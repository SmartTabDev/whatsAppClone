import {combineReducers} from 'redux';
import searchReducer from './searchReducer';
import messagesReducer from './messagesReducer';
import contactsReducer from './contactsReducer';
import chatRoomReducer from './chatRoomReducer';
import contactNavigationReducer from './contactNavigationReducer';

const rootReducer = combineReducers({
  search: searchReducer,
  messages: messagesReducer,
  contacts: contactsReducer,
  chatRooms: chatRoomReducer,
  contactNavigation: contactNavigationReducer
});

export default rootReducer;
