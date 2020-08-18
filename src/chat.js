import React, {Component} from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import images from './images';
import {sendBird} from './sb';
import {currentEmail} from './login';
import ApplicationStyles from '../themes/appStyles';

const UNIQUE_HANDLER_ID = 123;

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.backPress = this.handleBackPress.bind(this);
    if (!this.props.navigation.state.params.channelUrl) {
      Toast.show('Can not get channel url');
      this.handleBackPress();
    } else {
      this.channelUrl = this.props.navigation.state.params.channelUrl;
      this.channel = undefined;
      this.state = {
        isLoading: false,
        arrMessage: [],
        currentMessage: '',
      };
    }
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPress);
    sendBird.removeChannelHandler(UNIQUE_HANDLER_ID);
  }

  componentDidMount() {
    this.setupChat();
    this.setupListener();
  }

  setupChat = () => {
    this.setState({isLoading: true});
    sendBird.GroupChannel.getChannel(this.channelUrl, (channel, error) => {
      if (error) {
        console.log(error);
        Toast.show('Can not get channel, try again');
        this.setState({isLoading: false});
      } else {
        this.channel = channel;
        this.loadHistory();
      }
    });
  };

  setupListener = () => {
    let channelHandler = new sendBird.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      if (channel.url === this.channelUrl) {
        let temp = this.processMessage(message);
        this.setState({
          arrMessage: [temp, ...this.state.arrMessage],
        });
      }
    };
    sendBird.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);
  };

  loadHistory = () => {
    let messageListQuery = this.channel.createPreviousMessageListQuery();

    messageListQuery.load(30, true, (messageList, error) => {
      if (error) {
        console.error(error);
        Toast.show('Can not get history messages');
      } else {
        this.setState({
          arrMessage: messageList.map((item) => this.processMessage(item)),
        });
        this.setState({isLoading: false});
      }
    });
  };

  handleBackPress = () => {
    this.props.navigation.goBack();
    return true;
  };

  renderItem = ({item, index}) => {
    // Message right (mine)
    if (item.sender === currentEmail) {
      return (
        <View style={styles.viewWrapItemRight}>
          <Text style={styles.textItemRight}>{item.content}</Text>
        </View>
      );
    } else {
      // Message left
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {(this.state.arrMessage[index - 1] &&
            this.state.arrMessage[index - 1].sender === currentEmail) ||
          index === 0 ? (
            <Image style={styles.avatarItemLeft} source={{uri: item.avatar}} />
          ) : (
            <View style={{width: 30, height: 30, marginLeft: 10}} />
          )}
          <View style={styles.viewWrapItemLeft}>
            <Text style={styles.textItemLeft}>{item.content}</Text>
          </View>
        </View>
      );
    }
  };

  processMessage = (item) => {
    let message = {};

    message.content = item.message;
    message.avatar = item._sender.profileUrl;
    message.sender = item._sender.userId;

    return message;
  };

  sendMessage = () => {
    if (this.state.currentMessage.trim()) {
      this.channel.sendUserMessage(
        this.state.currentMessage,
        (message, err) => {
          if (err) {
            console.log(err);
            Toast.show('Can not send');
          } else {
            let temp = {
              content: this.state.currentMessage,
              avatar: '',
              sender: currentEmail,
            };
            this.setState({
              currentMessage: '',
              arrMessage: [temp, ...this.state.arrMessage],
            });
          }
        },
      );
    } else {
      Toast.show('Nothing to send');
    }
  };

  render() {
    return (
      <View style={styles.viewContainer}>
        {/* Header */}
        <View style={styles.toolbar}>
          <TouchableOpacity onPress={() => this.handleBackPress()}>
            <Image style={styles.icBack} source={images.ic_back} />
          </TouchableOpacity>
          <Text style={styles.titleToolbar}>CHAT</Text>
        </View>

        {Platform.OS === 'android' ? (
          this.renderBody()
        ) : (
          <KeyboardAvoidingView style={styles.viewContainer} behavior="padding">
            {this.renderBody()}
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }

  renderBody = () => {
    return (
      <View style={styles.viewContainer}>
        {/*List message*/}
        <FlatList
          inverted={true}
          style={styles.viewContainer}
          data={this.state.arrMessage}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{paddingTop: 10, paddingBottom: 10}}
        />

        {/*Input*/}
        <View style={styles.viewWrapInput}>
          {/* Input field */}
          <TextInput
            underlineColorAndroid="rgba(0,0,0,0)"
            style={styles.viewTextInput}
            placeholder="Type your message..."
            onChangeText={(value) => {
              this.setState({currentMessage: value});
            }}
            value={this.state.currentMessage}
          />

          {/* Button send message */}
          <TouchableOpacity onPress={this.sendMessage}>
            <Image source={images.ic_send} style={styles.icSend} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}

const styles = {
  ...ApplicationStyles.screen,
  viewContainer: {
    flex: 1,
  },

  // Input
  viewWrapInput: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 10,
  },
  viewTextInput: {
    flex: 1,
  },
  icSend: {
    width: 35,
    height: 35,
    marginLeft: 10,
  },

  // Message right
  viewWrapItemRight: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 6,
    marginTop: 6,
  },
  textItemRight: {
    borderRadius: 10,
    width: 170,
    backgroundColor: 'white',
    color: 'black',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    overflow: 'hidden',
  },

  // Message left
  viewWrapItemLeft: {
    marginLeft: 10,
    marginBottom: 6,
    marginTop: 6,
  },
  textItemLeft: {
    borderRadius: 10,
    width: 170,
    backgroundColor: '#203152',
    color: 'white',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    overflow: 'hidden',
  },
  avatarItemLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
};
