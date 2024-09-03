import { convertIOSContact } from "../../hooks/useContacts";

const initialState = {
  contacts: [],
  selecting: false,
};

const contactsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CONTACTS':
      return {
        ...state,
        contacts: action.payload,
      }
    case 'EDIT_CONTACTS':
      const updatedContact = convertIOSContact(action.payload);
      const updatedContacts = state.contacts.map(contact => {
        if (contact?.rawContactId === updatedContact?.rawContactId) {
          return updatedContact;
        }
        return contact;
      });
      return {
        ...state,
        contacts: updatedContacts,
      }
    case 'ADD_CONTACTS':
      return {
        ...state,
        contacts: [...state.contacts, convertIOSContact(action.payload)].sort((a, b) => a.displayName.localeCompare(b.displayName)),
      }
    case 'REMOVE_CONTACTS':
      return {
        ...state,
        contacts: state.contacts.filter(
          ({ rawContactId }) => rawContactId !== action.payload,
        ),
      }
    case 'START_SELECTING_CONTACT':
      return {
        ...state,
        selecting: true,
      };
    case 'END_SELECTING_CONTACT':
      return {
        ...state,
        selecting: false,
      };
    default:
      return state;
  }
};

export default contactsReducer;
