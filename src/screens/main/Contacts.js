import {View} from 'react-native';
import React from 'react';
import {routeStyles} from '../../styles/routeStyle';
import ContactsComponent from '../../components/ContactsComponent';

export default function Contacts() {
  return (
    <View style={routeStyles.container}>
      <ContactsComponent createContact={true} />
    </View>
  );
}
