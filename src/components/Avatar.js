import { useState } from 'react';
import { Image, View, Platform } from 'react-native';
import defaultAvatar from '../assets/images/Avatar.jpg';
import FastImage from 'react-native-fast-image';
import { useEffect } from 'react';

export const Avatar = props => {
  const { source, style, badge, ...rest } = props;
  const [existUri, setExistUrl] = useState(false)

  useEffect(() => {
    if(source && source.uri){
      fetch (source.uri).then(res => setExistUrl(true)).catch(err => setExistUrl(false))
    }
  }, [])
 
  return (
    <View {...rest} style={style}>
      {Platform.OS === 'ios' ? (
        <Image
          source={source && source.uri && existUri ? source : defaultAvatar}
          style={style}
        />
      ) : (
        <FastImage
          source={source && source.uri ? source : defaultAvatar}
          style={style}
        />
      )}
    
      {!!badge && <View>{badge}</View>}
    </View>
  );
};
