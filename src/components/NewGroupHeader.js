/* eslint-disable no-undef */
import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { chatStyle } from '../styles/chatStyle';
import SearchBar from './SearchBar';
import { routeStyles } from '../styles/routeStyle';


export default NewGroupHeader = ({ subtitle }) => {
  const navigation = useNavigation();
  const searchPhraseRedux =
    useSelector(state => state.search.searchPhrase) || '';
  const [searchPhrase, setSearchPhrase] = useState(searchPhraseRedux);
  const [clicked, setClicked] = useState(false);

  return (
    <View style={chatStyle.header}>
      {
        clicked ? <SearchBar
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
        />
          :
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              style={chatStyle.backButton}
              onPress={() => navigation.goBack()}>
              <View style={chatStyle.backButtonContent}>
                <MaterialIcons name="arrow-back" style={chatStyle.backButtonIcon} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ ...chatStyle.nameButton, width: '90%' }}>
              <View style={chatStyle.nameContent}>
                <Text style={chatStyle.nameText}>New group</Text>
                <Text style={chatStyle.lastSeen}>{subtitle}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setClicked(true);
              }}>
                <Ionicons name="search" style={{...routeStyles.searchButton, position: 'absolute', right: 30, top: -10}} />
            </TouchableOpacity>
          </>
      }
    </View>
  );
};
