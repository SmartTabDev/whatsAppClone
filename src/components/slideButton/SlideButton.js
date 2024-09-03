import React from 'react';
import {StyleSheet, View} from 'react-native';
import SlideButtonThumb from './SlideButtonThumb';
import SlideButtonText from './SlideButtonText';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const DEFAULT_HEIGHT = 56;
const DEFAULT_BORDER_RADIUS = DEFAULT_HEIGHT / 2;
const DEFAULT_CONTAINER_PADDING = 5;
const DEFAULT_COMPLETE_THRESHOLD = 70;
const DEFAULT_CONTAINER_COLOR = '#0095FF';
const DEFAULT_UNDERLAY_COLOR = '#42AAFF';
const DEFAULT_TITLE = 'Slide to confirm';
const DEFAULT_AUTO_RESET = false;
const DEFAULT_AUTO_RESET_DELAY = 1080;
const DEFAULT_ANIMATION = false;
const DEFAULT_ANIMATION_DURATION = 180;

const SlideButton = ({
  width,
  height,
  borderRadius,
  completeThreshold,
  disabled,
  padding,
  title,
  titleContainerStyle,
  titleStyle,
  icon,
  thumbStyle,
  containerStyle,
  underlayStyle,
  onReachedToStart,
  onReachedToEnd,
  onSlideEnd,
  onSlideStart,
  onPressOut,
  reverseSlideEnabled,
  autoReset,
  autoResetDelay,
  animation,
  animationDuration,
  dynamicResetEnabled,
  dynamicResetDelaying,
  isRTL,
}) => {
  const [dimensions, setDimensions] = React.useState({width: 55, height: 0});
  const [endReached, setEndReached] = React.useState(false);
  const timeoutRef = React.useRef();

  const gestureDisabled = useSharedValue(disabled);
  const dragX = useSharedValue(0);

  const rtlMultiplier = isRTL ? -1 : 1;
  const opacity = disabled ? 0.55 : 1;

  let borderWidth = 0;
  let thumbWidth = height - padding * 2;
  let childHeight = height - padding * 2;
  if (thumbStyle !== undefined) {
    let tWidth = StyleSheet.flatten(thumbStyle).width;
    if (tWidth !== undefined) {
      thumbWidth = Number(tWidth);
    }
  }

  if (containerStyle !== undefined) {
    let bWidth = StyleSheet.flatten(containerStyle).borderWidth;
    if (bWidth !== undefined) {
      borderWidth = Number(bWidth);
    }
  }

  const radius = borderRadius - padding;

  const scrollDistance =
    (dimensions.width - padding * 2 - thumbWidth - borderWidth * 2) *
    rtlMultiplier;
  const slideThreshold = scrollDistance * (completeThreshold / 100);

  const onLayoutContainer = async e => {
    const {width, height} = e.nativeEvent.layout;
    const {width: w, height: h} = dimensions;
    if (w !== width || h !== height) {
      setDimensions({width, height});
    }
  };

  React.useEffect(() => {
    gestureDisabled.value = disabled;
  }, [disabled]);

  React.useEffect(() => {
    if (dynamicResetEnabled && !dynamicResetDelaying) {
      reset();
    }
  }, [dynamicResetDelaying]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const underlayAnimStyle = useAnimatedStyle(() => {
    return {
      width: thumbWidth - borderWidth * 2 + dragX.value * rtlMultiplier,
    };
  });

  //let KEY = isRTL ? 'right' : 'left';
  const underlayDynamicStyle = {
    left: padding,
    height: childHeight - borderWidth * 2,
    borderRadius: radius,
  };

  const handleComplete = reached => {
    // console.log(`handleComplete: ${reached}`);
    if (reached) {
      setEndReached(true);
      onReachedToEnd && onReachedToEnd();
      if (!dynamicResetEnabled) {
        if (autoReset) {
          gestureDisabled.value = true;
          timeoutRef.current = setTimeout(() => {
            reset();
          }, autoResetDelay);
        }
      }
      if (!reverseSlideEnabled) {
        gestureDisabled.value = true;
      }
    } else {
      setEndReached(false);
      onReachedToStart && onReachedToStart();
    }
  };

  const clamp = (value, lowerBound, upperBound) => {
    'worklet';
    return Math.min(Math.max(lowerBound, value), upperBound);
  };

  const reset = () => {
    'worklet';
    dragX.value = withSpring(0, {damping: 20, stiffness: 100}, () => {
      runOnJS(handleComplete)(false);
    });
    gestureDisabled.value = false;
  };

  const moveTo = (value, complete) => {
    'worklet';
    dragX.value = withSpring(value, {damping: 20, stiffness: 100}, () => {
      runOnJS(handleComplete)(complete);
    });
  };

  const animatedGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = dragX.value;
      runOnJS(onSlideStart)();
    },
    onActive: (event, context) => {
      if (gestureDisabled.value) {
        return;
      }

      const translationX = context.startX + event.translationX;
      if (isRTL) {
        dragX.value = clamp(translationX, scrollDistance, 0);
      } else {
        dragX.value = clamp(translationX, 0, scrollDistance);
      }
    },
    onEnd: () => {
      if (gestureDisabled.value) {
        return;
      }

      runOnJS(onSlideEnd)();

      if (isRTL) {
        if (dragX.value > slideThreshold) {
          runOnJS(onPressOut)();
          if (dragX.value === 0) {
            runOnJS(handleComplete)(false);
            return;
          }
          moveTo(0, false);
        } else {
          if (dragX.value === scrollDistance) {
            runOnJS(handleComplete)(true);
            return;
          }
          moveTo(scrollDistance, true);
        }
      } else {
        if (dragX.value < slideThreshold) {
          if (dragX.value === 0) {
            runOnJS(handleComplete)(false);
            return;
          }
          moveTo(0, false);
        } else {
          if (dragX.value === scrollDistance) {
            runOnJS(handleComplete)(true);
            return;
          }
          moveTo(scrollDistance, true);
        }
      }
    },
    onFail: () => {
      runOnJS(onPressOut)();
    },
  });

  const animStarted = () => {
    if (reverseSlideEnabled) {
      gestureDisabled.value = true;
    }
  }

  const animEnded = () => {
    if (reverseSlideEnabled) {
      gestureDisabled.value = false;
    }
  }

  return (
    <View
      style={[
        styles.container,
        {opacity},
        containerStyle,
        {height, borderRadius, ...(width ? {width} : {})},
      ]}
      onLayout={onLayoutContainer}
      >
      <SlideButtonText
        title={title}
        titleStyle={titleStyle}
        titleContainerStyle={titleContainerStyle}
        height={childHeight}
        padding={padding}
        borderRadius={radius}
        translateX={dragX}
        scrollDistance={scrollDistance}
      />

      <Animated.View
        testID="Underlay"
        style={[
          styles.underlayContainer,
          underlayStyle,
          underlayAnimStyle,
          underlayDynamicStyle,
        ]}
      />

      <SlideButtonThumb
        gestureHandler={animatedGestureHandler}
        translateX={dragX}
        icon={icon}
        borderRadius={radius}
        height={childHeight}
        padding={padding}
        endReached={endReached}
        scrollDistance={scrollDistance}
        thumbStyle={thumbStyle}
        isRTL={isRTL}
        animation={animation}
        animationDuration={animationDuration}
        dynamicResetEnabled={dynamicResetEnabled}
        dynamicResetDelaying={dynamicResetDelaying}
        animStarted={animStarted}
        animEnded={animEnded}
      />
    </View>
  );
};

function arePropsEqual(prevProps, nextProps) {
  return prevProps.onPressOut === nextProps.onPressOut && prevProps.onReachedToEnd === nextProps.onReachedToEnd;
}

export default React.memo(SlideButton, arePropsEqual);

SlideButton.defaultProps = {
  height: DEFAULT_HEIGHT,
  borderRadius: DEFAULT_BORDER_RADIUS,
  padding: DEFAULT_CONTAINER_PADDING,
  title: DEFAULT_TITLE,
  completeThreshold: DEFAULT_COMPLETE_THRESHOLD,
  disabled: false,
  reverseSlideEnabled: true,
  autoReset: DEFAULT_AUTO_RESET,
  autoResetDelay: DEFAULT_AUTO_RESET_DELAY,
  animation: DEFAULT_ANIMATION,
  animationDuration: DEFAULT_ANIMATION_DURATION,
  dynamicResetEnabled: false,
  dynamicResetDelaying: false,
  onSlideStart: () => {},
  onSlideEnd: () => {},
  onReachedToStart: () => {},
  onReachedToEnd: () => {},
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DEFAULT_CONTAINER_COLOR,
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
    height: DEFAULT_HEIGHT,
    borderRadius: DEFAULT_BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    // position: 'absolute',
    // right: 10,
  },
  underlayContainer: {
    position: 'absolute',
    backgroundColor: DEFAULT_UNDERLAY_COLOR,
  },
});
