/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/rules-of-hooks */
import React, {useState, createRef, useEffect, useCallback} from 'react';
import {StyleSheet, TextInput, View, Keyboard, InteractionManager} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../store/actions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fontRegular } from '../styles/customFont';

const searchBar = ({searchPhrase, setSearchPhrase, setClicked}) => {
  const dispatch = useDispatch();
  const [text, setText] = useState(searchPhrase);
  inputRef = createRef();
  const phase = useSelector(state => state.search.searchPhrase)

  const focusInputWithKeyboard = () => {
    InteractionManager.runAfterInteractions(() => {
      inputRef.current.focus()
    });
  }

  useEffect(() => {
    focusInputWithKeyboard()
  }, [])

  useEffect(() => {
    if(phase === ''){
      setText('')
    }
  }, [phase])

  const goBack = useCallback(() => {
    setSearchPhrase('');
    dispatch(allActions.search.resetSearchPhrase());
    Keyboard.dismiss();
    setClicked(false);
  }, [setSearchPhrase, dispatch, Keyboard, setClicked])

  const closeSearch = useCallback(() => {
    setText('');
    setSearchPhrase('');
    dispatch(allActions.search.resetSearchPhrase());
  }, [setText, setSearchPhrase, dispatch])

  const onSubmitEditing = (event) => {
    setText(event)
    setSearchPhrase(event);
    dispatch(allActions.search.setSearchPhrase(event));
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        {/* search Icon */}
        <Icon
          name="arrow-back"
          size={20}
          color="#075e54"
          style={{marginRight: 10}}
          onPress={goBack}
        />

        {/* Input field */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search..."
          value={text}
          onChangeText={onSubmitEditing}
          // onSubmitEditing={onSubmitEditing}
        />
        {/* depending on whether the search bar is clicked or not */}
        <Icon
          name="close"
          size={20}
          color="#075e54"
          style={{padding: 1}}
          onPress={closeSearch}
        />
      </View>
    </View>
  );
};
export default searchBar;

// styles
const styles = StyleSheet.create({
  container: {
    height: 65,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 13,
  },
  searchBar: {
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    backgroundColor: '#d9dbda',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  input: {
    fontSize: 16,
    marginLeft: 10,
    width: '90%',
    ...fontRegular
  },
});
