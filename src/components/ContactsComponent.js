import { View, Text, TouchableOpacity, Platform, Alert, FlatList } from 'react-native';
import React, { useEffect, useState, useMemo, useRef, memo } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Contacts from 'react-native-contacts';
import { Avatar } from './Avatar';
import allActions from '../store/actions';
import { DeletePopup } from './DeletePopup';
import { routeStyles } from '../styles/routeStyle';
import { chatStyle } from '../styles/chatStyle';
import { useContacts } from '../hooks/useContacts';

const GetContacts = memo(({
  item,
  onSelectContact,
  onPressContact,
  selected,
  showCheckedBadge,
  selecting,
  openContactPicker,
  disabled,
}) => {
  const onPress = onPressContact
    ? () => onPressContact(item)
    : () => {
      selecting ? onSelectContact(item) : openContactPicker(item);
    };

  const onLongPress = onPressContact
    ? () => onPressContact(item)
    : () => onSelectContact(item);

  return (
    <TouchableOpacity
      style={{ ...routeStyles.contactsBox, opacity: disabled ? 0.3 : 1 }}
      onPress={disabled ? null : onPress}
      onLongPress={onLongPress}>
      <View style={routeStyles.contactsFoto}>
        <View
          style={[
            routeStyles.contactsCircle,
            { borderColor: item.isActive ? 'green' : 'gray' },
          ]}>
          <Avatar
            source={{
              uri: item.thumbnailPath,
            }}
            style={routeStyles.chatFoto}
            badge={
              showCheckedBadge ? (
                <View style={[chatStyle.badge, { backgroundColor: 'green' }]}>
                  <MaterialIcons name="check" color="white" size={12} />
                </View>
              ) : null
            }
          />
        </View>
      </View>
      <View style={routeStyles.contactsDetails}>
        <Text style={routeStyles.contactsName}>{item.displayName}</Text>
        {item.emailAddresses.length > 0 && (
          <Text style={routeStyles.contactsDate}>
            {item.emailAddresses[0]?.email}
          </Text>
        )}
      </View>
      {selected && <AntDesign name="check" style={routeStyles.checkIcon} />}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => (
  prevProps.item.rawContactId === nextProps.item.rawContactId && 
  prevProps.selected === nextProps.selected &&
  prevProps.selecting === nextProps.selecting && 
  prevProps.disabled === nextProps.disabled && 
  prevProps.showCheckedBadge === nextProps.showCheckedBadge
));

function ContactsComponent({
  onPressContact,
  createGroup,
  createContact,
  selectedParticipants,
  disableContacts
}) {

  const searchPhrase = useSelector(state => state.search.searchPhrase);
  const { selecting } = useSelector(state => state.contacts);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [_, contacts] = useContacts();
  const flatListRef = useRef(null);

  const handleSelectContact = selectedContact => {
    const alsoSelected = selectedContacts.find(
      ({ rawContactId }) => rawContactId === selectedContact?.rawContactId,
    )
    if (alsoSelected) {
      setSelectedContacts(prev => prev.filter(
        ({ rawContactId }) => rawContactId !== selectedContact?.rawContactId,
      ),
      );
    } else {
      setSelectedContacts(prev => [...prev, selectedContact]);
    }
  };

  const handleCancelSelecting = () => {
    setSelectedContacts([]);
  };

  const handleDeleteSelectedContacts = async () => {
    Promise.all(
      selectedContacts.map(async contact => {
        await Contacts.deleteContact(contact);
        dispatch(allActions.contacts.removeContact(contact?.rawContactId));
      }),
    ).finally(() => {
      handleCancelSelecting();
    });
  };

  const openContactPicker = contact => {
    contact
      ?
      Contacts.openExistingContact({ ...contact, ...(Platform.OS === 'ios' ? { recordID: contact?.rawContactId } : {}) }).then((res) => {
        dispatch(allActions.contacts.editContact(res));
      })
      : Contacts.openContactForm({}).then((res) => {
        if (res.emailAddresses.length > 0) {
          dispatch(allActions.contacts.addContact(res));
        }
        else {
          Alert.alert('Contact form invalid!')
        }
      }).catch(() => {});
  };

  const filteredData = useMemo(
    () =>
      contacts.filter(
        ({ displayName, emailAddresses }) =>
          displayName?.toLowerCase()?.includes(searchPhrase?.toLowerCase()) ||
          emailAddresses?.find(({ email }) =>
            email?.toLowerCase()?.includes(searchPhrase?.toLowerCase()),
          ),
      ),
    [contacts, searchPhrase],
  );

  const handleCreateNewGroup = () => {
    dispatch(allActions.search.resetSearchPhrase());
    navigation.navigate('CreateNewGroup');
  };

  useEffect(() => {
    if (selectedContacts.length && !selecting) {
      dispatch(allActions.contacts.startSelecting());
    }
    if (!selectedContacts.length && selecting) {
      dispatch(allActions.contacts.endSelecting());
    }
  }, [selectedContacts, selecting]);

  return (
    <View style={routeStyles.contactsContent}>
      {createGroup && (
        <TouchableOpacity
          style={routeStyles.contactsBox}
          onPress={handleCreateNewGroup}>
          <View style={routeStyles.contactsFoto}>
            <View style={routeStyles.contactsCircleOp}>
              <View style={routeStyles.addIconBox}>
                <AntDesign name="addusergroup" style={routeStyles.addIcon} />
              </View>
            </View>
          </View>
          <View style={routeStyles.contactsDetails}>
            <Text style={routeStyles.contactsName}>New Group</Text>
            <Text style={routeStyles.contactsDate}>Touch to add new Group</Text>
          </View>
        </TouchableOpacity>
      )}
      {createContact && (
        <TouchableOpacity
          style={routeStyles.contactsBox}
          onPress={() => openContactPicker()}>
          <View style={routeStyles.contactsFoto}>
            <View style={routeStyles.contactsCircleOp}>
              <View style={routeStyles.addIconBox}>
                <AntDesign name="adduser" style={routeStyles.addIcon} />
              </View>
            </View>
          </View>
          <View style={routeStyles.contactsDetails}>
            <Text style={routeStyles.contactsName}>New Contact</Text>
            <Text style={routeStyles.contactsDate}>
              Touch to add new Contact
            </Text>
          </View>
        </TouchableOpacity>
      )}  
      <FlatList
        ref={flatListRef}
        data={filteredData}
        contentContainerStyle={{ paddingBottom: selecting ? 60 : 0 }}
        initialNumToRender={50}
        maxToRenderPerBatch={50}
        renderItem={({ item }) => (
          <GetContacts
            item={item}
            disabled={disableContacts?.find((c) => c.email === item.emailAddresses[0]?.email)}
            key={item?.rawContactId}
            selecting={selecting}
            openContactPicker={openContactPicker}
            selected={selectedContacts.find(
              ({ rawContactId }) => rawContactId === item?.rawContactId,
            )}
            showCheckedBadge={selectedParticipants?.find(
              ({ rawContactId }) => rawContactId === item?.rawContactId,
            )}
            onPressContact={onPressContact}
            onSelectContact={handleSelectContact}
          />
        )}
        keyExtractor={item => item.rawContactId}
        virtualized={true}
      />
  
      {selecting && (
        <DeletePopup
          onCancel={handleCancelSelecting}
          onDelete={handleDeleteSelectedContacts}
        />
      )}
    </View>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.createContact === nextProps.createContact &&
    prevProps?.disableContacts?.length === nextProps?.disableContacts?.length &&
    prevProps?.selectedParticipants === nextProps?.selectedParticipants 
  ); 
}

export default React.memo(ContactsComponent, arePropsEqual)
