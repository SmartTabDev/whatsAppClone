import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import React, { Component } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { chatStyle } from '../styles/chatStyle';

const screenWidth = Dimensions.get('screen').width;

class RecordPlayer extends Component {
  audioRecorderPlayer;

  constructor(props) {
    super(props);
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5

    this.state = {
      currentPositionSec: 0,
      currentDurationSec: this.props.duration ?? 0,
      playTime: '00:00:00',
      duration:
        this.audioRecorderPlayer.mmssss(Math.floor(this.props.duration)) ??
        '00:00:00',
      paused: true,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.playing !== this.props.playing) {
      if (this.props.playing) {
        if (this.props?.uri) {
          this.onStartPlay();
        }
      } else {
        this.onStopPlay();
      }
    }
  }

  render() {
    let playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) * 200;

    if (!playWidth) {
      playWidth = 0;
    }

    return (
      <View style={chatStyle.viewPlayer}>
        <View style={chatStyle.viewBarContainer}>
          <View style={chatStyle.controls}>
            {this.state.paused ? (
              <TouchableOpacity
                style={chatStyle.controlBtn}
                onPress={
                  this.props.playing
                    ? this.onResumePlay
                    : this.props.onStartPlay
                }>
                <MaterialIcons
                  name="play-arrow"
                  style={chatStyle.recordPlayerControlBtnIcon}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={chatStyle.controlBtn}
                onPress={this.onPausePlay}>
                <MaterialIcons
                  name="pause"
                  style={chatStyle.recordPlayerControlBtnIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={chatStyle.viewBarWrapper}
            onPress={this.onStatusPress}>
            <View style={chatStyle.viewBar}>
              <View style={[chatStyle.viewBarPlay, { width: playWidth }]} />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={chatStyle.txtCounter}>
          {this.state.playTime.slice(0, -3)} /{' '}
          {this.state.duration.slice(0, -3)}
        </Text>
      </View>
    );
  }

  onStatusPress = e => {
    const touchX = e.nativeEvent.locationX;
    // console.log(`touchX: ${touchX}`);

    const playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 72);
    // console.log(`currentPlayWidth: ${playWidth}`);

    const currentPosition = Math.round(this.state.currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      this.audioRecorderPlayer.seekToPlayer(addSecs);
      // console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      this.audioRecorderPlayer.seekToPlayer(subSecs);
      // console.log(`subSecs: ${subSecs}`);
    }
  };

  onStartPlay = () => {
    this.setState(
      {
        paused: false,
      },
      async () => {
        try {
          console.log(this.props?.uri)
          const msg = await this.audioRecorderPlayer.startPlayer(
            this.props?.uri,
          );

          //? Default path
          // const msg = await this.audioRecorderPlayer.startPlayer();
          const volume = await this.audioRecorderPlayer.setVolume(1.0);
          // console.log(`path: ${msg}`, `volume: ${volume}`);

          this.audioRecorderPlayer.addPlayBackListener(e => {
            // console.log('playBackListener', e);
            this.setState({
              currentPositionSec: e.currentPosition,
              currentDurationSec: e.duration,
              playTime: this.audioRecorderPlayer.mmssss(
                Math.floor(e.currentPosition),
              ),
              duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration ?? 0)),
            });

            if (
              Math.floor(e.currentPosition / 2) === Math.floor(e.duration / 2)
            ) {
              this.onStopPlay(true);
            }
          });
        } catch (err) {
          console.log('startPlayer error', err);
        }
      },
    );
  };

  onPausePlay = () => {
    this.setState(
      {
        paused: true,
      },
      async () => {
        await this.audioRecorderPlayer.pausePlayer();
      },
    );
  };

  onResumePlay = () => {
    this.setState(
      {
        paused: false,
      },
      async () => {
        await this.audioRecorderPlayer.resumePlayer();
      },
    );
  };

  onStopPlay = async finished => {
    await this.audioRecorderPlayer.stopPlayer();
    this.setState(
      {
        paused: true,
        currentPositionSec: 0,
        playTime: '00:00:00',
      },
      async () => {
        try {
          await this.audioRecorderPlayer.removePlayBackListener();
          if (finished) {
            this.props.onEndPlay();
          }
        } catch (err) {
          console.log('stop player error', err);
        }
      },
    );
  };
}

export default RecordPlayer;
