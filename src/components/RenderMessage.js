import React, { useState, useEffect, memo, useRef } from 'react';
import { View, TouchableOpacity, Text, Image, Linking, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import RecordPlayer from './RecordPlayer';
import { chatStyle } from '../styles/chatStyle';
import { auth } from '../../firebase';
import { Loader } from './Loader';
import { routeStyles } from '../styles/routeStyle';
import { formatDate } from '../helpers/getDate';
import { db } from '../../firebase';
import { ProgressBar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import moment from 'moment';


const loader = (
  <Loader
    style={routeStyles.loaderStyle}
  />
);

const ImageView = props => {
  const [dimension, setDimension] = useState();

  useEffect(() => {
    if (props.source.uri) {
      if (props.width && props.height) {
        setDimension({
          width: props.width,
          height: props.height,
        });
      } else {
        Image.getSize(
          props.source.uri,
          (width, height) => {
            setDimension({ width, height });
          },
          () => {
            setDimension({ width: 200, height: 200 });
          },
        );
      }
    }
  }, [props]);

  return dimension ? (
    props.isPhoto ? (
      <Image
        style={{
          ...styles.imageView,
          height: dimension ? ((dimension.height * 200) / (dimension.width ?? 200)) : 100,
        }}
        {...props}
      />
    ) : (
      <FastImage
        style={{
          ...styles.imageView,
          height: dimension ? ((dimension.height * 200) / (dimension.width ?? 200)) : 0,
        }}
        {...props}
      />
    )
  ) : (
    loader
  );
};

const VideoView = props => {
  const [dimension, setDimension] = useState();
  const videoRef = useRef(null);
  useEffect(() => {
    Image.getSize(
      props.source.uri,
      (width, height) => {
        if (width == 0) {
          setDimension({ width: 200, height: 200 });
        } else {
          setDimension({ width, height });
        }
      },
      () => {
        setDimension({ width: 200, height: 200 });
      },
    );
    if (videoRef.current) {
      videoRef.current.seek(0); // Seek to the beginning of the video when the component mounts
    }
  }, [props.source.uri]);


  return dimension ? (
    <Video
      ref={videoRef}
      style={{
        ...styles.imageView,
        height: dimension ? ((dimension.height * 200) / dimension.width) : 100,
        height: 200
      }}
      repeat={true}
      {...props}
    />
  ) : (
    loader
  );
};

export const Message = memo(({
  item,
  handleAddEmoji,
  handleSelectMessage,
  handleSaveContact,
  handleStartPlay,
  handleFinishPlay,
  handleRemove,
  viewContact,
  playingId,
  playing,
  selected,
  selecting,
  isDirectChat,
}) => {
  const sentByMe = item.sender === auth.currentUser.email;
  const [userName, setUserName] = useState();
  const uploadProgress = useSelector(state => state.messages.uploadProgress);

  useEffect(() => {
    if (item.sender) {
      const q = query(
        collection(db, 'users'),
        where('email', '==', item.sender),
      );

      const unsubscribe = onSnapshot(q, snapshot => {
        if (snapshot.docs.length) {
          const userDoc = snapshot.docs[0].data();
          setUserName(userDoc?.displayName ?? item.sender)
        }
      });

      return () => unsubscribe();
    }
  }, [item.sender]);

  const messageContent = (message) => {
    const matchesUrl = message.match(/https?:\/\/\S+/g);
    const goToLink = (url) => {
      Linking.openURL(url)
    }
    const parts = message.split(/(https?:\/\/\S+)/);

    return (
      <View style={chatStyle.messageContainer}>
        {parts.filter(part => !!part).map((part, index) => {
          if (matchesUrl && matchesUrl.includes(part)) {
            return (
              <TouchableOpacity key={`${part}-${index}`} onPress={() => goToLink(part)}>
                <Text
                  key={index}
                  style={styles.linkColor}
                >
                  {part}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return (<Text
              key={index}
              style={chatStyle.chatText}
            >
              {part}
            </Text>)
          }
          return part;
        })}
      </View>
    );
  }

  return (
    <View>
      <View style={[sentByMe ? chatStyle.chatBoxRight : chatStyle.chatBoxLeft]}>
        {
          item.backgroundupload && <>
            <Text>{uploadProgress[item.uri]?.text} {uploadProgress[item.uri]?.progress ? `${uploadProgress[item.uri]?.progress}%` : ''}  ....</Text>
            <ProgressBar progress={uploadProgress[item.uri]?.progress ? uploadProgress[item.uri]?.progress * 0.01 : 0} color={'#028f02'} />
          </>
        }
        <TouchableOpacity
          onLongPress={() => {
            !item.isDeleted && sentByMe && handleSelectMessage(item.id);
          }}
          onPress={() => {
            !item.isDeleted && selecting ? handleSelectMessage(item.id) : null
          }}>
          {!sentByMe && !isDirectChat && !!userName && <Text style={chatStyle.groupChatUserName}>{userName}</Text>}
          {item.isDeleted ? (
            <Text style={routeStyles.deletedmessage}>
              {sentByMe
                ? 'You deleted this message'
                : 'This message is deleted'}
            </Text>
          ) : (
            <>
              {item.sending && loader}
              {item.message && (
                messageContent(item.message)
              )}

              {item.contact && (
                <TouchableOpacity onPress={() => !selecting && viewContact(item.contact)}>
                  <View style={styles.flexCenter} >
                    <MaterialCommunityIcons
                      name="contacts"
                      style={styles.contactIcon}
                    />
                    <Text style={chatStyle.chatContactText}>
                      {item.contact?.displayName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {item.uri &&
                (item.type?.includes('image/') ? (
                  <ImageView
                    source={{
                      uri: item.uri,
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    width={item.width}
                    height={item.height}
                    isPhoto={item.photo}
                  />
                ) : item.type?.includes('video/') ? (
                  <VideoView
                    source={{ uri: item.uri }}
                    controls={true}
                    width={item.width}
                    height={item.height}
                  />
                ) : (
                  <RecordPlayer
                    playing={playingId === item.id && playing}
                    onStartPlay={() => handleStartPlay(item.id)}
                    onEndPlay={handleFinishPlay}
                    uri={item.uri}
                    duration={item.duration}
                  />
                ))}
            </>
          )}
          <View style={chatStyle.chatBottomText}>
            {!item.isDeleted && (
              <View
                style={[
                  item.emoji ? chatStyle.emojiLayout : chatStyle.blankEmoji,
                  sentByMe ? chatStyle.emojiRight : chatStyle.emojiLeft,
                ]}>
                {item.emoji ? (
                  <Text style={chatStyle.iconEmoji}>{item.emoji}</Text>
                ) : (
                  <></>
                )}
              </View>
            )}
            <Text style={chatStyle.chatTime}>
              {formatDate(moment(item.time).local())}
            </Text>
            {
              sentByMe && isDirectChat && (
                item.read ? <Ionicons
                  name="checkmark-done-sharp"
                  style={routeStyles.chechMarkDone}
                /> :
                  <Ionicons
                    name="checkmark-outline"
                    style={routeStyles.chechMark}
                  />
              )
            }

          </View>

          {selected && sentByMe && (
            <View style={chatStyle.checkMessageIcon}>
              <MaterialCommunityIcons name="check" color="white" size={24} />
            </View>
          )}
          {!item.isDeleted && (
            <Menu>
              <MenuTrigger style={chatStyle.messageTrigger} text="..." />
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    width: 'auto',
                    borderRadius: 15,
                    padding: 5,
                    fontSize: 14,
                    flexDirection: 'row',
                  },
                  optionsWrapper: {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                }}>
                {!sentByMe && (
                  <MenuOption
                    text="😊"
                    onSelect={() => {
                      handleAddEmoji(item.id);
                    }}
                  />
                )}
                {sentByMe && (
                  <MenuOption
                    onSelect={() => {
                      handleRemove([item.id]);
                    }}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      color="red"
                      size={22}
                    />
                  </MenuOption>
                )}
                {!!item.contact && !sentByMe && (
                  <MenuOption
                    onSelect={() => {
                      handleSaveContact(item.contact);
                    }}>
                    <MaterialCommunityIcons name="account-plus" size={22} />
                  </MenuOption>
                )}
              </MenuOptions>
            </Menu>
          )}
        </TouchableOpacity>

        <View style={[sentByMe ? chatStyle.rightArrow : chatStyle.leftArrow]} />
        <View
          style={[
            sentByMe ? chatStyle.rightArrowOverlap : chatStyle.leftArrowOverlap,
          ]}
        />
      </View>
      <View style={{ height: 40 }} />
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.selecting === nextProps.selecting &&
    prevProps.playingId === nextProps.playingId &&
    JSON.stringify(prevProps.item) === JSON.stringify(nextProps.item)
  )
});

const styles = StyleSheet.create({
  imageView: {
    width: 200,
    marginTop: 8,
  },
  linkColor: {
    color: '#005efe'
  },
  flexCenter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactIcon: {
    fontSize: 22,
    color: '#366edb',
    marginRight: 8,
    marginTop: 4,
  }
});
