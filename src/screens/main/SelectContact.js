import { View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { routeStyles } from '../../styles/routeStyle';
import ContactsComponent from '../../components/ContactsComponent';
import SelectContactHeader from '../../components/SelectContactHeader';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native-paper';
import allActions from '../../store/actions';

export default function SelectContact() {
  const navigationParams = useSelector((state) => state.contactNavigation);
  const dispatch = useDispatch();

  const [selectedContact, setSelectedContact] = useState();
  const { onSelect, createGroup, title, createContact, disableContacts, loading } = navigationParams ?? {};

  useEffect(() => {
    if (selectedContact && onSelect) {
      onSelect(selectedContact);
    }
    // dispatch(allActions.search.resetSearchPhrase());

  }, [selectedContact, onSelect]);

  return (
    <View style={routeStyles.container}>
      <SelectContactHeader title={title} />
      <View style={routeStyles.selectScreenContent}>
        {loading && 
          <View style={{ position: 'absolute', zIndex: 100, top: 60, width: '100%', height: '100%', backgroundColor: '#000000a8', alignItems: 'center', justifyContent: 'center', }}>
            <ActivityIndicator size="large" />
          </View>
        }
        <ContactsComponent
          onPressContact={setSelectedContact}
          createGroup={createGroup}
          createContact={createContact}
          disableContacts={disableContacts}
        />
      </View>
    </View>
  );
}
