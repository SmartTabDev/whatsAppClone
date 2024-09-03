import React, {useState} from 'react';
import {View, Text, StyleSheet, KeyboardAvoidingView} from 'react-native';
import {Button} from 'react-native-paper';
import {FormBuilder} from 'react-native-paper-form-builder';
import {useForm} from 'react-hook-form';
import {updateProfile} from 'firebase/auth';
import {setDoc, doc} from 'firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {auth, db} from '../../../firebase';
import {fontRegular} from '../../styles/customFont';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {control, setFocus, handleSubmit, reset} = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const profileFormArray = [
    {
      name: 'displayName',
      type: 'text',
      textInputProps: {
        label: 'Username',
      },
      rules: {
        required: {
          value: true,
          message: 'Username is required',
        },
      },
    },
  ];

  const handleNext = async ({displayName}) => {
    const user = auth.currentUser;
    const userData = {
      displayName,
      email: user.email,
    };

    setLoading(true);
    setError(undefined);
    try {
      await Promise.all([
        updateProfile(user, userData),
        setDoc(doc(db, 'users', user.uid), {...userData, uid: user.uid}),
      ]);
      navigation.navigate('TabNavigator');
    } catch (e) {
      setError(e.code);
    } finally {
      setLoading(false);
      reset();
    }
  };

  return (
    <KeyboardAvoidingView behavior="position">
      <View style={styles.box1}>
        <Text style={styles.text}>Profile Info</Text>
      </View>
      <View style={styles.box2}>
        <FormBuilder
          control={control}
          setFocus={setFocus}
          formConfigArray={profileFormArray}
        />
        {error && <Text style={styles.redColor}>{error}</Text>}
        <Button
          mode="contained"
          loading={loading}
          onPress={handleSubmit(handleNext)}>
          Next
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    color: 'green',
    margin: 10,
    ...fontRegular,
  },
  box1: {
    alignItems: 'center',
  },
  box2: {
    paddingHorizontal: 40,
    justifyContent: 'space-evenly',
    height: '50%',
  },
  redColor: {
    color: 'red'
  }
});

export default ProfileScreen;
