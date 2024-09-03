/* eslint-disable no-undef */
import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { chatStyle } from '../styles/chatStyle';
import SearchBar from './SearchBar';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { routeStyles } from '../styles/routeStyle';



export default SelectContactHeader = ({ title }) => {
  const searchPhraseRedux =
    useSelector(state => state.search.searchPhrase) || '';
  const [searchPhrase, setSearchPhrase] = useState(searchPhraseRedux);
  const [clicked, setClicked] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if(searchPhraseRedux === ''){
      setClicked(false)
    }

  }, [searchPhraseRedux])

  return (
    <View style={{...chatStyle.header, paddingLeft: 10, paddingRight: 15}}>
      {
        clicked ?
          <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            setClicked={setClicked}
          /> :
          <>
            <View style={chatStyle.controls}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{...chatStyle.backButton, marginRight: 20}}
                onPress={navigation.goBack}>
                <View style={chatStyle.backButtonContent}>
                  <MaterialIcons name="arrow-back" style={chatStyle.backButtonIcon} />
                </View>
              </TouchableOpacity>

              <Text style={chatStyle.pageTitle}>{title ?? 'Select contact'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setClicked(true);
              }}>
              <Ionicons name="search" style={routeStyles.searchButton} />
            </TouchableOpacity>
          </>
      }


    </View>
  );
};
