import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';

import MainScreen from './src/login';
import MenuScreen from './src/menu';
import ChatScreen from './src/chat';

let MainNavigator;
let AppContainer;

class App extends Component {
  constructor(props) {
    super(props);
    MainNavigator = createStackNavigator(
      {
        MainScreen: {screen: MainScreen},
        MenuScreen: {screen: MenuScreen},
        ChatScreen: {screen: ChatScreen},
      },
      {
        headerMode: 'none',
        initialRouteName: 'MainScreen',
        navigationOptions: ({navigation}) => ({
          headerTitleStyle: {fontWeight: '500'},
        }),
      },
    );
    AppContainer = createAppContainer(MainNavigator);
    console.disableYellowBox = true;
  }

  render() {
    return <AppContainer />;
  }
}

export default App;
