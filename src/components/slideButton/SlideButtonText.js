import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const DEFAULT_TEXT_COLOR = '#FAFAFA';

const SlideButtonText = ({
  title,
  titleStyle,
  titleContainerStyle,
  height,
  borderRadius,
  padding,
  translateX,
  scrollDistance,
}) => {
  const textAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, scrollDistance],
        [0.99, 0],
        Extrapolate.CLAMP,
      ),
    };
  });
  return (
    <View
      testID="TitleContainer"
      style={[
        styles.titleContainer,
        {height, margin: padding, borderRadius},
        titleContainerStyle,
      ]}>
      <Animated.Text
        testID="Title"
        numberOfLines={2}
        allowFontScaling={false}
        style={[styles.title, titleStyle, textAnimStyle]}>
        {title}
      </Animated.Text>
    </View>
  );
};

export default React.memo(SlideButtonText);

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    maxWidth: '50%',
    textAlign: 'center',
    color: DEFAULT_TEXT_COLOR,
  },
});
