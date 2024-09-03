import {initializeApp} from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {getStorage} from 'firebase/storage';
import {initializeFirestore} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAxsXLtHVrRXewKTEfUMPAPNgWX8Z7ckZM",
  authDomain: "sirahu-dev-test.firebaseapp.com",
  projectId: "sirahu-dev-test",
  storageBucket: "sirahu-dev-test.appspot.com",
  messagingSenderId: "368646662956",
  appId: "1:368646662956:web:67f1b6cc5be5c4458e1a89",
  measurementId: "G-9FXWF98LPS"
  // apiKey: 'AIzaSyDOtjn1RLSArGVaL73wUEahnw7cexiwUzw',
  // authDomain: 'whatsapp-20231206653.firebaseapp.com',
  // projectId: 'whatsapp-20231206653',
  // storageBucket: 'whatsapp-20231206653.appspot.com',
  // messagingSenderId: '1012796173992',
  // appId: '1:1012796173992:web:da4a41013b44c0e910dc9d',
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const storage = getStorage(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};
