import React, {Component} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import SettingsScreen from './settings';
import ListScreen from './list';
import images from './images';
import {NavigationActions, StackActions} from 'react-navigation';
//import StackActions from '@react-navigation/native';
import {sendBird} from './sb';
import ApplicationStyles from '../themes/appStyles';

export default class MenuScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //true - List, false - Settings
      isTabOneActive: true,
    };
  }

  componentDidMount() {
    SplashScreen.hide();
  }

  onLogOut() {
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
  }

  render() {
    return (
      <View style={styles.viewContainer}>
        {/* Header */}
        <View style={styles.toolbar}>
          <Text style={styles.titleToolbar}>MENU</Text>
        </View>

        {/* Body */}
        <View style={styles.viewContainer}>
          {this.state.isTabOneActive ? (
            <ListScreen {...this.props} />
          ) : (
            //<SettingsScreen onLogOut={this.onLogOut} />
            <SettingsScreen {...this.props} />
          )}
        </View>

        {/* Bottom */}
        <View style={styles.viewBottom}>
          <TouchableOpacity
            style={
              this.state.isTabOneActive ? styles.btnActive : styles.btnPassive
            }
            onPress={() => {
              this.setState({
                isTabOneActive: true,
              });
            }}>
            <Image style={styles.icBottom} source={images.ic_list_passive} />
            <Text
              style={
                this.state.isTabOneActive
                  ? styles.textActive
                  : styles.textPassive
              }>
              LIST
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              this.state.isTabOneActive ? styles.btnPassive : styles.btnActive
            }
            onPress={() => {
              this.setState({
                isTabOneActive: false,
              });
            }}>
            <Image style={styles.icBottom} source={images.ic_setting_passive} />
            <Text
              style={
                this.state.isTabOneActive
                  ? styles.textPassive
                  : styles.textActive
              }>
              SETTINGS
            </Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  // Bottom
  viewBottom: {
    flexDirection: 'row',
  },
  btnActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    backgroundColor: '#203152',
    flexDirection: 'row',
  },
  btnPassive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    backgroundColor: '#aeaeae',
    flexDirection: 'row',
  },
  textActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  textPassive: {
    color: 'white',
    fontWeight: 'bold',
  },
  icBottom: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
};
