import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {Button} from 'react-native-paper';
import {FormBuilder} from 'react-native-paper-form-builder';
import {useForm} from 'react-hook-form';
import {signIn} from '../../../firebase';
import {fontRegular} from '../../styles/customFont';

const LoginScreen = ({navigation}) => {
  const {control, setFocus, handleSubmit, reset} = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const loginFormArray = [
    {
      name: 'email',
      type: 'email',
      textInputProps: {
        label: 'Email',
      },
      rules: {
        required: {
          value: true,
          message: 'Email is required',
        },
        pattern: {
          value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
          message: 'Email is invalid',
        },
      },
    },
    {
      name: 'password',
      type: 'password',
      textInputProps: {
        label: 'Password',
      },
      rules: {
        required: {
          value: true,
          message: 'Password is required',
        },
        minLength: {
          value: 8,
          message: 'Password should be atleast 8 characters',
        },
        maxLength: {
          value: 30,
          message: 'Password should be between 8 and 30 characters',
        },
      },
    },
  ];

  const handleLogin = async ({email, password}) => {
    setLoading(true);
    setError(undefined);
    try {
      await signIn(email, password);
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
        <Text style={styles.text}>Welcome!</Text>
        <Image
          style={styles.img}
          source={require('../../assets/images/wa.png')}
        />
      </View>
      <View style={styles.box2}>
        <FormBuilder
          control={control}
          setFocus={setFocus}
          formConfigArray={loginFormArray}
        />
        {error && <Text style={styles.redColor}>{error}</Text>}
        <Button
          mode="contained"
          loading={loading}
          onPress={handleSubmit(handleLogin)}>
          Login
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
          <Text style={{textAlign: 'center', ...fontRegular}}>Don't have an account?</Text>
        </TouchableOpacity>
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
  img: {
    width: 200,
    height: 150,
    objectFit: 'contain',
  },
  box1: {
    alignItems: 'center',
  },
  box2: {
    paddingHorizontal: 40,
    justifyContent: 'space-evenly',
    height: '50%',
    marginTop: 30
  },
  redColor: {
    color: 'red'
  }
});

export default LoginScreen;
