import {Image, View, Text, StyleSheet} from 'react-native';
import defaultAvatar from '../assets/images/Avatar.jpg';
import {chatStyle} from '../styles/chatStyle';


export const AvatarGroup = props => {
  const {sources, style, ...rest} = props;

  const slicedSources = sources.slice(0, 4);
  const moreCount = sources.length > 4 ? sources.length - 4 : 0;

  return (
    <View {...rest} style={[chatStyle.avatarGroupStyle, style]}>
      {slicedSources.length === 3 ? (
        <>
          <View style={styles.halfWidth}>
            <Image
              source={
                slicedSources[0].uri ? slicedSources[0] : defaultAvatar
              }
              style={[
                chatStyle.groupAvatarFoto,
                {width: '100%', height: '50%'},
              ]}
            />
            <Image
              source={
                slicedSources[1].uri ? slicedSources[1] : defaultAvatar
              }
              style={[
                chatStyle.groupAvatarFoto,
                {width: '100%', height: '50%'},
              ]}
            />
          </View>
          <Image
            source={slicedSources[2].uri ? slicedSources[2] : defaultAvatar}
            style={[chatStyle.groupAvatarFoto, {height: '100%'}]}
          />
        </>
      ) : (
        slicedSources.map((source, index) => (
          <Image
            key={`group-avatar-${index}`}
            source={source.uri ? source : defaultAvatar}
            style={[
              chatStyle.groupAvatarFoto,
              {
                width: sources.length === 1 ? '100%' : '50%',
                height: sources.length < 3 ? '100%' : '50%',
              },
            ]}
          />
        ))
      )}
      {!!moreCount && (
        <View style={chatStyle.moreAvatarCount}>
          <Text style={styles.whiteColor}>
            {moreCount > 99 ? '99+' : moreCount}
          </Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  halfWidth: {
    width: '50%'
  },
  whiteColor: {
    color: 'white',
    fontSize: 10,
  },
});
