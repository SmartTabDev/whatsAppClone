import {View, Text, TouchableOpacity, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {routeStyles} from '../styles/routeStyle';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import SearchBar from './SearchBar';
import {useSelector} from 'react-redux';
import {logout} from '../../firebase';
import { fontRegular } from '../styles/customFont';

export default function TopBarLinks() {
  const searchPhraseRedux =
    useSelector(state => state.search.searchPhrase) || '';
  const [searchPhrase, setSearchPhrase] = useState(searchPhraseRedux);

  const [clicked, setClicked] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      Alert.alert('firebase logout error', e.code);
    }
  };
  useEffect(() => {
    if(searchPhraseRedux === ''){
      setClicked(false)
    }

  }, [searchPhraseRedux])

  return (
    <View>
      {clicked ? (
        <SearchBar
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
        />
      ) : (
        <View style={routeStyles.topLinksContent}>
          <Text style={routeStyles.logo}>WhatsApp</Text>
          <View style={routeStyles.topButtons}>
            <TouchableOpacity
              onPress={() => {
                setClicked(true);
              }}>
              <Ionicons name="search" style={routeStyles.topButton} />
            </TouchableOpacity>
            {/* <Ionicons name='ellipsis-vertical' style={routeStyles.topButton}/> */}
            <Menu>
              <MenuTrigger>
                <Ionicons
                  name="ellipsis-vertical"
                  style={routeStyles.topButton}
                />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    borderRadius: 15,
                    padding: 15,
                  },
                  optionText: {
                    fontSize: 14,
                    ...fontRegular
                  }
                }}>
                <MenuOption onSelect={handleLogout} text="Logout" />
              </MenuOptions>
            </Menu>
          </View>
        </View>
      )}
    </View>
  );
}
