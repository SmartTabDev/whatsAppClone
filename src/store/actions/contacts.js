const setContacts = (contactData) => {
  return {
    type: 'SET_CONTACTS',
    payload: contactData,
  }
}

const editContact = (contactData) => {
  return {
    type: 'EDIT_CONTACTS',
    payload: contactData,
  }
}

const addContact = (contactData) => {
  return {
    type: 'ADD_CONTACTS',
    payload: contactData,
  }
}

const removeContact = id => {
  return {
    type: 'REMOVE_CONTACTS',
    payload: id,
  }
}

const startSelecting = ids => {
  return {
    type: 'START_SELECTING_CONTACT',
  };
};

const endSelecting = ids => {
  return {
    type: 'END_SELECTING_CONTACT',
  };
};

export default {
  setContacts,
  startSelecting,
  endSelecting,
  editContact,
  removeContact,
  addContact
};
