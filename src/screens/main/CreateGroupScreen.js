import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import Contacts from 'react-native-contacts';
import moment from 'moment';
import NewGroupHeader from '../../components/NewGroupHeader';
import { routeStyles } from '../../styles/routeStyle';
import ContactsComponent from '../../components/ContactsComponent';
import { Avatar } from '../../components/Avatar';
import { chatStyle } from '../../styles/chatStyle';
import { addChatRoom } from '../../services/chatRoom';
import { auth } from '../../../firebase';
import { fontRegular } from '../../styles/customFont';
import { FlatList } from 'react-native-gesture-handler';

const ParticipantsList = memo(({ participants, direction, onRemoveParticipant }) => {

  const flatlistRef = useRef(null)
  useEffect(() => {
    if (flatlistRef.current !== null && participants.length && direction === 'horizontal') {
      setTimeout(() => flatlistRef.current?.scrollToEnd({animated: true}), 200);
    }
  }, [flatlistRef.current, participants, direction])

  return (
    <FlatList
      ref={flatlistRef}
      horizontal={direction === 'horizontal'}
      data={participants}
      onScrollToIndexFailed={memeber => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          flatlistRef.current?.scrollToIndex({ index: memeber.length - 2, animated: true });
        });
      }}
      
      renderItem={({ item: participant }) => (
        <View
          key={participant?.rawContactId}
          style={{ alignItems: 'center', margin: 8 }}>
          <Avatar
            source={{ uri: participant.thumbnailPath }}
            badge={
              onRemoveParticipant ? (
                <TouchableOpacity
                  onPress={() =>
                    onRemoveParticipant(participant?.rawContactId)
                  }
                  style={[chatStyle.badge, { backgroundColor: 'gray' }]}>
                  <MaterialIcons name="close" color="white" size={14} />
                </TouchableOpacity>
              ) : null
            }
            style={routeStyles.chatFoto}
          />
          <Text style={{ color: 'white', ...fontRegular }}>{participant.displayName}</Text>
        </View>
      )}
      style={{ ...chatStyle.participants, ...(direction === 'horizontal' ? { maxHeight: 105 } : {flex: 1, flexDirection: 'row', flexWrap: 'wrap'}) }}
      numColumns={direction === 'horizontal' ? undefined : 3}
      columnWrapperStyle={direction === 'horizontal' ? undefined : {flexWrap: 'wrap', justifyContent: 'space-around'}}
      contentContainerStyle={{
        ...(direction === 'horizontal' ? { maxHeight: 105, flexWrap: 'nowrap', justifyContent: 'flex-start' } : { flex: 1, justifyContent: 'flex-start' })
      }} />
  );
});

const CreateGroupScreen = () => {

  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [step, setStep] = useState(0);
  const [totalContactCount, setTotalContactCount] = useState(0);
  const [groupName, setGroupName] = useState('');
  const navigation = useNavigation();

  const subtitle = useMemo(
    () =>
      step === 0
        ? selectedParticipants.length
          ? `${selectedParticipants.length} of ${totalContactCount} selected`
          : 'Touch contact to select'
        : 'Add subject',
    [step, selectedParticipants, totalContactCount],
  );

  const handleAddParticipant = contact => {
    if (
      !selectedParticipants.find(
        ({ rawContactId }) => rawContactId === contact?.rawContactId,
      )
    ) {
      setSelectedParticipants(prev => [...prev, contact]);
    } else {
      setSelectedParticipants(prev =>
        prev.filter(({ rawContactId }) => contact?.rawContactId !== rawContactId),
      );
    }
  };

  const handleRemoveParticipant = contactId => {
    setSelectedParticipants(prev =>
      prev.filter(({ rawContactId }) => contactId !== rawContactId),
    );
  };

  const handleNextOrPreviousStep = () => {
    if (step === 0) {
      setStep(prev => prev + 1);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleCreateGroup = () => {
    if (groupName) {
      const newChatGroup = {
        name: groupName,
        participants: [
          ...selectedParticipants.map(
            participant =>
              participant.emailAddresses?.[0]?.email
          ),
          auth.currentUser.email

        ],
        lastmessage: '',
        isActive: true,
        lastMsgTime: moment().utc().format(),
        registered: moment().utc().format(),
        image: null,
      };
      addChatRoom(newChatGroup);
      navigation.navigate('TabNavigator');
    }
  };

  useEffect(() => {
    Contacts.getCount()
      .then(res => {
        setTotalContactCount(res);
      })
      .catch(e => setTotalContactCount(0));
  }, []);

  const selectParticipantStep = (
    <>
      {!!selectedParticipants.length && (
        <ParticipantsList
          participants={selectedParticipants}
          direction="horizontal"
          onRemoveParticipant={handleRemoveParticipant}
        />
      )}
      <View style={routeStyles.flexContainer}>
        <ContactsComponent
          selectedParticipants={selectedParticipants}
          disableContacts={selectedParticipants}
          onPressContact={handleAddParticipant}
        />
      </View>
    </>
  );

  const createGroupStep = (
    <>
      <View style={chatStyle.createGroupInputContainer}>
        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          style={chatStyle.createGroupInput}
          placeholder="Type group subject here..."
          autoFocus={true}
        />
        <TouchableOpacity
          style={chatStyle.createGroupBtn}
          onPress={handleCreateGroup}>
          <AntDesign name={'check'} color="white" size={26} />
        </TouchableOpacity>
      </View>
      <ParticipantsList participants={selectedParticipants} />
    </>
  );

  return (
    <View style={routeStyles.container}>
      <NewGroupHeader subtitle={subtitle} />
      <View style={routeStyles.selectScreenContent}>
        {step === 0 && selectParticipantStep}
        {step === 1 && createGroupStep}
      </View>
      {!!selectedParticipants.length && (
        <TouchableOpacity
          onPress={handleNextOrPreviousStep}
          style={routeStyles.bottomButtons}>
          <AntDesign
            style={routeStyles.bottomButtonA}
            name={step === 0 ? 'arrowright' : 'arrowleft'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(CreateGroupScreen);
