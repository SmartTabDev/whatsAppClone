import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import { Platform, TouchableOpacity, View, Text } from 'react-native';
import React, { Component } from 'react';
import SlideButton from './slideButton/SlideButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Tooltip from 'react-native-walkthrough-tooltip';
import RNFS from 'react-native-fs';
import { chatStyle } from '../styles/chatStyle';

class AudioRecorder extends Component {

  path = Platform.select({
    ios: `file://${RNFS.DocumentDirectoryPath}`,
    android: RNFS.DocumentDirectoryPath,
  });

  audioRecorderPlayer;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      recordDuration: 0,
      recordSecs: 0,
      recordTime: '00:00',
      showTooltip: false,
      convertedResult: '',
      error: '',
      paused: false,
      savingRecord: false,
      fileName: '',
      filePath: '',
      noVoice: false,
      meteringArr: [],
      startRocord: false
    };

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1);
  }

  render() {
    return (
      <View
        style={{
          ...chatStyle.audioRecorderContainer,
          width: this.state.recordSecs ? '100%' : 55,
          position: this.state.recordSecs ? 'absolute' : 'relative',
          marginRight: this.state.recordSecs ? 9 : 0,
        }}>
        <View style={{ width: this.state.recordSecs ? '80%' : 55, marginLeft: 'auto', flexDirection: 'row',  justifyContent: 'center'}}>
          <SlideButton
            icon={
              <Tooltip
                isVisible={this.state.showTooltip}
                content={<Text>Hold to record, release to send.</Text>}
                placement="top"
                onClose={() => this.setState({ showTooltip: false })}
                backgroundColor="transparent"
              >
                <TouchableOpacity
                  onPressIn={this.onShowPressTooltip}
                  onLongPress={this.onStartRecord}
                  delayLongPress={500}
                  style={chatStyle.voiceMessageButton}>
                  <MaterialIcons name="mic" style={chatStyle.voiceMessageIcon} />
                </TouchableOpacity>
              </Tooltip>
            }
            onPressOut={!this.state.showTooltip ? this.onFinishRecord: this.onHidePressTooltip}
            onReachedToEnd={this.onStopRecord}
            title="Slide to cancel <<"
            thumbStyle={chatStyle.circleButton}
            titleStyle={chatStyle.slideBtnTitle}
            titleContainerStyle={chatStyle.slideBtnTitleContainer}
            containerStyle={chatStyle.slideBtnContainer}
            underlayStyle={chatStyle.slideBtnUnderlay}
            padding={0}
            height={50}
            isRTL={true}
            autoReset={true}
            autoResetDelay={0}
          />
        </View>
        {!!this.state.recordSecs && (
          <View style={chatStyle.recordTimeContainer}>
            <MaterialIcons name="mic" style={chatStyle.recordIcon} />
            <Text style={chatStyle.recordTime}>{this.state.recordTime}</Text>
          </View>
        )}
      </View>
    );
  }

  onStartRecord = async () => {
    this.setState({
      filePath: '',
      fileName: '',
      showTooltip: false,
      startRocord: true
    });

    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    const currentDateTime = new Date().getTime();
    const fileName = `record-${currentDateTime}.${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`;

    const uri = await this.audioRecorderPlayer.startRecorder(
      `${this.path}/${fileName}`,
      audioSet,
      true,
    );

    this.audioRecorderPlayer.addRecordBackListener(e => {
      // console.log('record-back', e);
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.audioRecorderPlayer.mmss(
          Math.floor(e.currentPosition / 1000),
        ),
      });
    });
    // console.log(`uri: ${uri}`);
  };

  onShowPressTooltip = () => {
    this.setState({
      showTooltip: true,
    });
  };

  onHidePressTooltip = () => {
    setTimeout(() => {
      this.setState({
        showTooltip: false,
      })
    }, 1000)
  };

  onStopRecord = async () => {
    if(this.state.startRocord){
      const uri = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();
      this.setState({
        recordSecs: 0,
        showTooltip: false,
      });
      return uri;
    }
    else{
      return null
    }
  };

  onFinishRecord = async () => {
    this.setState({
      showTooltip: false
    });
    if(this.state.startRocord){
      setTimeout(async() => {
        this.setState({
          recordDuration: this.state.recordSecs,
        });
        const uri = await this.onStopRecord();
        this.setState({
          filePath: uri,
          isLoading: true,
        });
        this.props.onFinish({ uri, duration: this.state.recordDuration });
        this.setState({
          startRocord: false
        });
      }, 100)

    }
  };
}

export default AudioRecorder;
