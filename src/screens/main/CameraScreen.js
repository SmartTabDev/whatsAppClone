import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native-paper';
import Capture from '../../assets/images/capture.png';
import { sendImage } from '../../services/message';
import { fontRegular } from '../../styles/customFont';
import { routeStyles } from '../../styles/routeStyle';
import { useDispatch, useSelector } from 'react-redux';
import allActions from '../../store/actions';
import { chatStyle } from '../../styles/chatStyle';

const CameraScreen = () => {
  const dispatch = useDispatch();
  const uploadProgress = useSelector(state => state.messages.uploadProgress);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [photo, setPhoto] = useState();
  const [isSaving, setIsSaving] = useState(false)
  const [uri, setUri] = useState()
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  let device = devices.filter(({ position }) => position === 'back')?.[0];
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params ?? {};
  const isFocused = useIsFocused();

  const takePhoto = useCallback(async () => {
    try {
      const image = await cameraRef.current?.takePhoto({
        qualityPrioritization: 'quality',
        enableAutoStabilization: true,
        flash: 'on',
        skipMetadata: true,
      });
      setPhoto(image);
    } catch (err) {
      console.log('Take photo error:', err);
      Alert.alert(
        'Take photo error',
        `Please fix it and try again, Error message: ${err}`,
        [
          {
            text: 'Go to chat room',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Cancel',
          },
        ],
      );
    }
  }, []);

  const updateUploadProgress = (progress, status, roomId, uri) => {
    try {
      
      dispatch(allActions.messages.updateUploadProgress(progress, status, roomId, uri))
    } catch (err) {
      Alert.alert(
        'Updateuploadprogress Error',
        `Please fix it and try again, Error message: ${err}`,
        [
          {
            text: 'Go to chat room',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Cancel',
          },
        ],
      );
    }
  }

  const onSavePhoto = async () => {
    setIsSaving(true)
    const now = new Date();
    const fileName = `${now.getTime()}.webp`;
    const newPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;
    await RNFS.moveFile(photo.path, newPath);
    setUri(Platform.OS === 'ios' ? newPath : `file://${newPath}`);
    sendImage({ uri: Platform.OS === 'ios' ? newPath : `file://${newPath}`, type: 'image/webp', ...photo }, roomId, updateUploadProgress, 
    () => setIsSaving(false)).then(() => {
      setIsSaving(false)
      navigation.navigate('ChatScreen', { loading: true });
    }).catch(err => {
      Alert.alert(
        'Send Image error',
        `Please fix it and try again, Error message: ${err}`,
        [
          {
            text: 'Go to chat room',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Cancel',
          },
        ],
      );
      setIsSaving(false)
    })
  };

  const onCancelPhoto = () => {
    setPhoto(undefined);
  };

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      const microPhonePermission = await Camera.requestMicrophonePermission();
      if (cameraPermission === 'denied' || microPhonePermission === 'denied') {
        Alert.alert(
          'Allow Permissions',
          'Please allow camera and microphone permission to access camera features',
          [
            {
              text: 'Go to Settings',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Cancel',
            },
          ],
        );
        setHasPermissions(false);
      } else {
        setHasPermissions(true);
      }
    })();
  }, []);

  const cameraError = (e) => {
    console.log('onError', e)
    Alert.alert(
      'Your camera has error',
      `Please fix it and try again, Error message: ${e}`,
      [
        {
          text: 'Go to chat room',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Cancel',
        },
      ],
    );
  }

  const cameraSection = (
    <>
      {device !== undefined && hasPermissions && isFocused ? (
        <Camera
          photo={true}
          enableHighQualityPhotos
          onError={cameraError}
          style={styles.camera}
          isActive={true}
          ref={cameraRef}
          device={device}
        />
      ) : (
        <Text style={{ color: 'white', ...fontRegular }}>No Camera Found</Text>
      )}

      <TouchableOpacity style={styles.returnButton} onPress={navigation.goBack}>
        <AntDesign
          style={routeStyles.bottomButtonA}
          name='arrowleft'
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.recordButton} onPress={takePhoto}>
        <Image source={Capture} style={{ width: 70, height: 70 }} />
      </TouchableOpacity>
    </>
  );

  const photoSection = (
    <>
      {
        isSaving && <View style={routeStyles.loadContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ ...chatStyle.backButtonIcon, textAlign: 'center' }}>{uploadProgress[uri]?.text} {uploadProgress[uri]?.progress ? `${uploadProgress[uri]?.progress}%` : ''}  ....</Text>
        </View>
      }

      <Image source={{ uri: `file://${photo?.path}` }} style={styles.photo} />
      <View style={styles.photoControls} pointerEvents={isSaving ? 'none' : 'auto'}>
        <TouchableOpacity
          style={styles.photoControlBtn}
          onPress={onCancelPhoto}>
          <AntDesign name="close" color="red" size={44} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoControlBtn} onPress={onSavePhoto}>
          <AntDesign name="check" color="#14ab20" size={44} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>{photo ? photoSection : cameraSection}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  photo: {
    flex: 1,
  },
  photoControls: {
    position: 'absolute',
    width: '100%',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  recordButton: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  returnButton: {
    position: 'absolute',
    top: 20,
    marginLeft: 10,
    alignItems: 'left',
    backgroundColor: '#00a884',
    borderRadius: 30,
    padding: 15
  },
  recordButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  photoControlBtn: {
    width: 80,
    height: 80,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CameraScreen;
