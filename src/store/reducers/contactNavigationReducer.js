const initialState = {
  onSelect: null,
  createGroup: false,
  createContact: false,
  title: '',
  loading: false
};

const contactNavigationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PARAM':
      return { ...state, ...action.payload };
   
    default:
      return state;
  }
};

export default contactNavigationReducer;
