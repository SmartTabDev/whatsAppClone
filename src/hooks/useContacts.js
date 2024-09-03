import { useState, useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Contacts from 'react-native-contacts';
import { useDispatch, useSelector } from 'react-redux';
import { openSettings } from 'react-native-permissions';
import allActions from '../store/actions';

export const convertIOSContact = (contact) => Platform.OS === 'android' ? contact : ({
  ...contact, 
  rawContactId: contact.recordID,
  displayName: contact.givenName + ' ' + contact.familyName,
})

export const useContacts = () => {
  const [isFetching, setIsFetching] = useState(true);
  const [permissionEnabled, setPermissionEnabled] = useState(false);
  const [shownAlert, setShownAlert] = useState(false);
  const contacts = useSelector(state => state.contacts.contacts);
  const dispatch = useDispatch();

  const fetchContacts = () => {
    Contacts.getAll()
      .then(res => {
        const contactData = res.map(convertIOSContact);
        dispatch(allActions.contacts.setContacts((contactData ?? []).sort((a, b) => a.displayName.localeCompare(b.displayName))));
      })
      .catch(e => {
        console.log(e);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  const requestPermission = (onSuccess, openAlert) => {
    if (Platform.OS === "android") {
      PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
        ],
        {
          title: 'Contacts',
          message: 'This app would like to manage your contacts.',
          buttonPositive: 'Please accept bare mortal',
        },
      )
        .then(res => {
          if(res['android.permission.READ_CONTACTS'] !== 'granted') {
            if (openAlert) {
              setShownAlert(true);
            }
          } else {
            setPermissionEnabled(true);
            onSuccess();
          }
        })
        .catch(error => {
          setPermissionEnabled(false);
          console.error('Permission error: ', error);
        });
      } else {
        setPermissionEnabled(true);
        onSuccess();
      }
  }

  useEffect(() => {
    let requestPermissionInterval;

    if (!permissionEnabled) {
      requestPermissionInterval = setInterval(() => {requestPermission(fetchContacts, !shownAlert)}, 2000);
    } else {
      clearInterval(requestPermissionInterval);
    }
    return () => {
      clearInterval(requestPermissionInterval);
    };
  
  }, [permissionEnabled])

  useEffect(() => {
    if (shownAlert) {
      Alert.alert('Contacs access is denied! Please allow permission to access your contacts', '', [{text: 'Open Settings', onPress: () => {
        openSettings().then((res) => {
          setTimeout(() => setShownAlert(false), 1000);
        });
    }}]);
    }
  }, [shownAlert])

  return [isFetching, contacts, fetchContacts, permissionEnabled]; 
};
