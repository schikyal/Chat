import React, {Component} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import Toast from 'react-native-simple-toast';

import images from './images';
import {sendBird} from './sb';
import ApplicationStyles from '../themes/appStyles';

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.file = null;
    this.state = {
      avatarSource: '',
      profileUrl: '',
      username: '',
      isLoading: false,
    };
  }

  componentDidMount() {
    this.readDataLocal();
  }

  pickPhoto = () => {
    let options = {
      title: 'Choose ',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {uri: response.uri};
        this.setState({
          avatarSource: source,
        });

        this.file = {
          uri: response.uri,
          name: response.fileName,
          type: response.type,
        };
      }
    });
  };

  onBtnUpdatePress = () => {
    if (this.state.username.trim()) {
      this.setState({isLoading: true});
      sendBird.updateCurrentUserInfoWithProfileImage(
        this.state.username,
        this.file,
        (response, error) => {
          if (!error) {
            this.writeDataLocal();
          } else {
            this.setState({isLoading: false});
            Toast.show(error.message);
          }
        },
      );
    }
  };

  writeDataLocal = async () => {
    try {
      await AsyncStorage.setItem('username', this.state.username);
      Toast.show('Update info success');
    } catch (error) {
      Toast.show(error.message);
    }
    this.setState({isLoading: false});
  };

  readDataLocal = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      const value2 = await AsyncStorage.getItem('profileUrl');
      if (value) {
        this.setState({
          username: value,
          profileUrl: value2,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  onBtnLogOutPress = () => {
    //this.props.onLogOut();
    sendBird.disconnect(() => {
      /*const resetAction = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName: 'MainScreen'})],
      });*/
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName: 'MainScreen'})],
      });
      this.props.navigation.dispatch(resetAction);
    });
  };

  render() {
    return (
      <View style={styles.viewContainer}>
        <View style={styles.viewBody}>
          {/* Change avatar */}
          <View style={styles.viewWrapAvatar}>
            <Image
              style={styles.imageChangeAvatar}
              source={
                this.state.avatarSource
                  ? this.state.avatarSource
                  : {uri: this.state.profileUrl}
              }
            />
            <TouchableOpacity
              onPress={() => this.pickPhoto()}
              style={styles.btnChangeAvatar}>
              <Image
                style={{width: 40, height: 40}}
                source={images.ic_camera}
              />
            </TouchableOpacity>
          </View>

          {/* Input field */}
          <View style={styles.viewItemInput}>
            <Text style={styles.textTitleInput}>Username</Text>
            <TextInput
              style={styles.textInput}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="Have not setup yet"
              placeholderTextColor="#aeaeae"
              returnKeyType="done"
              onChangeText={(value) => this.setState({username: value})}
              value={this.state.username}
              autoCapitalize={'none'}
            />
            <View style={styles.viewBreakLine} />
          </View>

          <View style={{height: 30}} />

          {/* Btn update */}
          <TouchableOpacity
            style={styles.btnDone}
            onPress={this.onBtnUpdatePress}>
            <Text style={styles.textBtnDone}>UPDATE</Text>
          </TouchableOpacity>

          <View style={{height: 40}} />

          {/* Btn log out */}
          <TouchableOpacity
            style={styles.btnDone}
            onPress={this.onBtnLogOutPress}>
            <Text style={styles.textBtnDone}>LOG OUT</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {this.state.isLoading ? (
          <View style={styles.viewLoading}>
            <ActivityIndicator size="large" />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = {
  ...ApplicationStyles.screen,
  viewContainer: {
    flex: 1,
  },
  viewBody: {
    margin: 20,
    flex: 1,
  },

  // Avatar
  viewWrapAvatar: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  imageAvatar: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    borderRadius: 40,
    marginTop: 20,
    marginBottom: 20,
  },
  imageChangeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  btnChangeAvatar: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },

  // Input
  textTitleInput: {
    color: '#203152',
    fontWeight: 'bold',
  },
  textInput: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: Platform.OS === 'android' ? 0 : 10,
    marginBottom: Platform.OS === 'android' ? 0 : 10,
    color: '#203152',
  },
  viewItemInput: {
    marginTop: 10,
    marginBottom: 10,
  },
  viewBreakLine: {
    width: '90%',
    height: 0.3,
    backgroundColor: 'grey',
    marginLeft: 10,
  },

  // Btn update
  btnDone: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 120,
    backgroundColor: '#203152',
    borderRadius: 5,
    alignSelf: 'center',
  },
  textBtnDone: {
    color: 'white',
    fontWeight: 'bold',
  },
};
