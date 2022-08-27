import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  SafeAreaView,
  Platform,
  Dimensions
} from "react-native";
import { StyleSheet } from "react-native";
import { rgbaToHex } from "@lottiefiles/lottie-js";
import { Color } from 'constants/styleConstant';
//import styles from "./style";

const SUPPORTED_ORIENTATIONS = [
  "portrait",
  "portrait-upside-down",
  "landscape",
  "landscape-left",
  "landscape-right"
];

class RBSheetModalless extends Component {

   WIDTH = Dimensions.get('window').width;
   HEIGHT = Dimensions.get('window').height;

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      animatedHeight: new Animated.Value(0),
      pan: new Animated.ValueXY()
    };

    this.createPanResponder(props);
  }

  setModalVisible(visible, props) {
    const { height, minClosingHeight, openDuration, closeDuration, onClose, onOpen } = this.props;
    const { animatedHeight, pan } = this.state;
    if (visible) {
      this.setState({ modalVisible: visible });
      if (typeof onOpen === "function") onOpen(props);
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: height,
        duration: openDuration
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        useNativeDriver: false,
        toValue: minClosingHeight,
        duration: closeDuration
      }).start(() => {
        pan.setValue({ x: 0, y: 0 });
        this.setState({
          modalVisible: visible,
          animatedHeight: new Animated.Value(0)
        });

        if (typeof onClose === "function") onClose(props);
      });
    }
  }

  createPanResponder(props) {
    const { closeOnDragDown, height } = props;
    const { pan } = this.state;
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => closeOnDragDown,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(e, gestureState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (height / 4 - gestureState.dy < 0) {
          this.setModalVisible(false);
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    });
  }

  open(props) {
    this.setModalVisible(true, props);
  }

  close(props) {
    this.setModalVisible(false, props);
  }

  render() {
    const {
      animationType,
      closeOnDragDown,
      dragFromTopOnly,
      closeOnPressMask,
      closeOnPressBack,
      children,
      customStyles,
      keyboardAvoidingViewEnabled
    } = this.props;
    const { animatedHeight, pan, modalVisible } = this.state;
    const panStyle = {
      transform: pan.getTranslateTransform()
    };

    return (
    //   <Modal
    //     transparent
    //     animationType={animationType}
    //     visible={modalVisible}
    //     supportedOrientations={SUPPORTED_ORIENTATIONS}
    //     onRequestClose={() => {
    //       if (closeOnPressBack) this.setModalVisible(false);
    //     }}
    //   >
    <SafeAreaView
        style={{
          flexGrow: 0,
          
          // width: customStyles.wrapper?.width ? customStyles.wrapper?.width :'100%',
          backgroundColor: customStyles.wrapper?.backgroundColor ? customStyles.wrapper?.backgroundColor :'#FFFFFF', // Color.primaryBG,
        }}
      //onTouchStart={() => { console.log('onTouchStart called'); _ref.current?.blur();}} // NOTE: FOR SOME REASON, THIS IS REQUIRED OTHERWISE INSERT USERTAG IN RICH TEXT IS MISLOCATED - MOVED THIS TO RichTextEditor.tsx in onPressAutoComplete
      >
        <KeyboardAvoidingView
          enabled={keyboardAvoidingViewEnabled}
          behavior="padding"
          style={[styles.wrapper, customStyles.wrapper]}
        >
          <TouchableOpacity
            style={styles.mask}
            activeOpacity={1}
            onPress={() => (closeOnPressMask ? this.close() : null)}
          >
          <Animated.View
            {...(!dragFromTopOnly && this.panResponder.panHandlers)}
            style={[panStyle, styles.container, { height: animatedHeight }, customStyles.container]}
          >
            {closeOnDragDown && (
              <View
                {...(dragFromTopOnly && this.panResponder.panHandlers)}
                style={styles.draggableContainer}
              >
                <View style={[styles.draggableIcon, customStyles.draggableIcon]} />
              </View>
            )}
            {children}
          </Animated.View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        </SafeAreaView>
    //   </Modal>
    );
  }
}

RBSheetModalless.propTypes = {
  animationType: PropTypes.oneOf(["none", "slide", "fade"]),
  height: PropTypes.number,
  minClosingHeight: PropTypes.number,
  openDuration: PropTypes.number,
  closeDuration: PropTypes.number,
  closeOnDragDown: PropTypes.bool,
  closeOnPressMask: PropTypes.bool,
  dragFromTopOnly: PropTypes.bool,
  closeOnPressBack: PropTypes.bool,
  keyboardAvoidingViewEnabled: PropTypes.bool,
  customStyles: PropTypes.objectOf(PropTypes.object),
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  children: PropTypes.node
};

RBSheetModalless.defaultProps = {
  animationType: "none",
  height: 260,
  minClosingHeight: 0,
  openDuration: 300,
  closeDuration: 200,
  closeOnDragDown: false,
  dragFromTopOnly: false,
  closeOnPressMask: true,
  closeOnPressBack: true,
  keyboardAvoidingViewEnabled: Platform.OS === "ios",
  customStyles: {},
  onClose: null,
  onOpen: null,
  children: <View />
};


const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0)' //"#00000077"
    },
    mask: {
      flex: 1,
      backgroundColor: "transparent",
      borderWidth:0,
      borderColor:'blue',
      width: '100%',
      alignItems:'flex-end',
    },
    container: {
      backgroundColor: "#fff",
      width: "100%",
      height: 0,
      overflow: "hidden"
    },
    draggableContainer: {
      width: "100%",
      alignItems: "center",
      backgroundColor: "transparent"
    },
    draggableIcon: {
      width: 35,
      height: 5,
      borderRadius: 5,
      margin: 10,
      backgroundColor: "#ccc"
    }
  });



export default RBSheetModalless;
