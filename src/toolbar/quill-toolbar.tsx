import React, { Component } from 'react';
import {
  View,
  KeyboardAvoidingView,
  //ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Keyboard,
  DeviceEventEmitter
} from 'react-native';
import { fullOptions, basicOptions } from '../constants/toolbar-options';
import type {
  ToolbarTheme,
  TextListData,
  ToggleData,
  ColorListData,
  ToolbarCustom,
  CustomStyles,
} from '../types';
import { lightTheme, darkTheme } from '../constants/themes';
import { getToolbarData } from '../utils/toolbar-utils';
import type QuillEditor from '../editor/quill-editor';
import { ToolbarProvider } from './components/toolbar-context';
//import { SelectionBar } from './components/selection-bar';
//import { ToolSet } from './components/tool-set';
//import { ToolbarSeperator } from './components/toolbar-separator';
import type { FormatChangeData } from '../constants/editor-event';
//import { ToolbarConsumer } from './components/toolbar-context';
import { ToggleTextButton } from './components/toggle-text-button';
import { ToggleColorButton } from './components/toggle-color-button';
import { ToggleIconButton } from './components/toggle-icon-button';
import { formatType } from '../constants/formats';
import RBSheetCustom from '../utils/RBSheetCustom';


import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


//const deviceHeight = Dimensions.get('window').height;



// export const ToolbarMenu: React.FC<Props> = ({ title, children }) => {
//   return (

//     <View style={{ flexDirection: 'column', borderWidth: 0, marginBottom: 0 }}>
//       <ScrollView>
//         {children}
//       </ScrollView>
//       <View style={{ borderWidth: 0 }}>
//         <Text>{title}</Text>
//       </View>
//     </View>
//   );
// };

export interface Counts {
  wordCount: number;
  characterCount: number;
}

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;


interface QuillToolbarProps {
  options: Array<Array<string | object> | string | object> | 'full' | 'basic';
  optionsAttach: Array<Array<string | object> | string | object>;
  styles?: CustomStyles;
  editor: React.RefObject<QuillEditor>;
  theme: ToolbarTheme | 'dark' | 'light';
  custom?: ToolbarCustom;
  container?: false | 'avoiding-view' | React.ComponentType;
  counts?: Counts;
  InfoField?: React.FC;
  infoFieldPressed?: () => {};
  // popUp?: Any;
}

interface ToolbarState {
  toolSets: Array<Array<ToggleData | TextListData | ColorListData>>;
  toolSetsAttach: Array<Array<ToggleData | TextListData | ColorListData>>;
  menuType: string;
  formats: object;
  theme: ToolbarTheme;
  defaultFontFamily?: string;
  showMenu: boolean;
  isAnimating: boolean;
  keyboardHeight: number;
  shortHeight: number;
  normalHeight: number;
  heightAux: number;
  borderWidth: number;
  wrapperHeight: number;
  deviceWidth: number;
  deviceHeight: number;
}

export class QuillToolbar extends Component<QuillToolbarProps, ToolbarState> {
  public static defaultProps = {
    theme: 'dark',
  };

   



  animatedValue: Animated.Value;
  animatedValueOut: Animated.Value;
  keyboardShowListener;
  keyboardHideListener;
  keyboardDidShowListener;
  dimensionsListener;
  RBSheetHolder;
  RBSheetHolderBound;
  scrollRef;


  

  constructor(props: QuillToolbarProps) {
    super(props);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardWillShow = this._keyboardWillShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this._dimensionsListener = this._dimensionsListener.bind(this);

    this.state = {
      toolSets: [],
      toolSetsAttach: [],
      menuType: 'format',
      formats: {},
      theme: lightTheme,
      defaultFontFamily: undefined,
      showMenu: false,
      isAnimating: false,
      keyboardHeight: 0,
      shortHeight: 0,
      normalHeight: 0,
      heightAux: 0,
      borderWidth: 0,
      wrapperHeight: 0,
      deviceWidth: Dimensions.get('window').width,
      deviceHeight: Dimensions.get('window').height
    };
    this.animatedValue = new Animated.Value(0);
    this.animatedValueOut = new Animated.Value(43);
    this.RBSheetHolder = React.createRef();
    //console.log('quill-toolbar constructor');
  }

  editor?: QuillEditor;

  componentDidMount() {
    this.listenToEditor();
    this.prepareIconset();
    this.changeTheme();

    this.keyboardShowListener = Keyboard.addListener('keyboardWillShow', (e) => this._keyboardWillShow(e));
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => this._keyboardDidShow(e));
    this.keyboardHideListener = Keyboard.addListener('keyboardDidHide', (e) => this._keyboardDidHide(e));
    this.dimensionsListener =  Dimensions.addEventListener('change', ({window:{width,height}})=> this._dimensionsListener(width, height));
    // this.format('color', '#000000');
    // this.setState({ formats: { "color": "#000000" } });


  }


  componentWillUnmount(): void {
    //Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    // Keyboard.removeAllListeners('keyboardDidShow');
    // Keyboard.removeAllListeners('keyboardDidHide');
    this.keyboardShowListener.remove();
    this.keyboardHideListener.remove();
    this.keyboardDidShowListener.remove();
    this.dimensionsListener.remove();
  }

  componentDidUpdate(prevProps: QuillToolbarProps, prevState: ToolbarState) {
    if (
      prevProps.options !== this.props.options ||
      prevState.defaultFontFamily !== this.state.defaultFontFamily
    ) {
      this.prepareIconset();
    }
    if (prevProps.theme !== this.props.theme) {
      this.changeTheme();
    }
  }

  _dimensionsListener = (width, height) => {
    
    this.setState({deviceWidth: width, deviceHeight: height},
      () => {}
    );
  }


  _keyboardWillShow = (e) => {
    this.setState({
      keyboardHeight: e.endCoordinates.height,
      normalHeight: Dimensions.get('screen').height,
      shortHeight: 0,
    });

  }

  _keyboardDidShow = (e) => {
    this.setState({
      keyboardHeight: e.endCoordinates.height,
      normalHeight: Dimensions.get('screen').height,
      shortHeight: Dimensions.get('screen').height - e.endCoordinates.height - 100,
    });

  }

  _keyboardDidHide = (e) => {
    this.setState({
      keyboardHeight: e.endCoordinates.height,
      normalHeight: Dimensions.get('screen').height,
      shortHeight: 0,
    }, () => { this.setState({ shortHeight: Dimensions.get('screen').height - e.endCoordinates.height }) });

  }

  changeTheme() {
    let theme: ToolbarTheme = lightTheme;

    if (this.props.theme === 'dark') {
      theme = darkTheme;
    } else if (this.props.theme !== 'light') {
      theme = this.props.theme;
    }
    this.setState({ theme });
  }

  private prepareIconset = () => {
    const { options, optionsAttach, custom } = this.props;
    let toolbarOptions: Array<Array<string | object> | string | object> = [];

    if (options === 'full' || options === []) {
      toolbarOptions = fullOptions;
    } else if (options === 'basic') {
      toolbarOptions = basicOptions;
    } else {
      toolbarOptions = options;
    }
    const toolSets = getToolbarData(
      toolbarOptions,
      custom?.icons,
      this.state.defaultFontFamily
    );

    const toolSetsAttach = getToolbarData(
      optionsAttach,
      custom?.icons,
      this.state.defaultFontFamily
    );

    this.setState({ toolSets, toolSetsAttach });
  };

  private listenToEditor = () => {
    setTimeout(() => {
      const {
        editor: { current },
      } = this.props;
      if (current) {
        this.editor = current;
        current.on('format-change', this.onFormatChange);
        if (this.editor?.props.defaultFontFamily) {
          this.setState({
            defaultFontFamily: this.editor?.props.defaultFontFamily,
          });
        }
      }
    }, 200);
  };

  // private onFormatChange = (data: FormatChangeData) => {
  //   console.log('onFormatChange', JSON.stringify(data));
  //   if (!(data && data.formats // 👈 null and undefined check
  //     && Object.keys(data.formats).length === 0
  //     && Object.getPrototypeOf(data.formats) === Object.prototype)) {

  //     this.setState({ formats: data.formats });
      
  //   }
  // };

  private onFormatChange = (data: FormatChangeData) => {
    this.setState({ formats: data.formats });
  };

  private format = (name: string, value: any) => {
    console.log('quill-toolbar name value', name, value);
    //this.RBSheetHolder?.close();
    this.editor?.format(name, value);
    // this.setState({formats: {} });
  };

  // show = (menu: string) => {
  //   if (this.state.isAnimating) return;

  //   this.setState({ menuType: menu });
  //   const { theme } = this.props;
  //   if (theme) {
  //     this.setState({ isAnimating: true }, () => {

  //       Animated.timing(this.animatedValue, {
  //         toValue: 0.4 * HEIGHT, // 2 * theme.size + 14,
  //         duration: 200,
  //         easing: Easing.linear,
  //         useNativeDriver: false,
  //       }).start(() => this.setState({ showMenu: true, isAnimating: false }));
  //     });

  //   }
  // };

  // hide = () => {
  //   if (this.state.isAnimating) return;
  //   const { theme } = this.props;
  //   if (theme) {
  //     this.setState({ isAnimating: true }, () => {
  //       Animated.timing(this.animatedValue, {
  //         toValue: 0, //theme.size + 10,
  //         duration: 200,
  //         easing: Easing.linear,
  //         useNativeDriver: false,
  //       }).start(() => {

  //         this.setState({
  //           showMenu: false,
  //           isAnimating: false,
  //         });
  //       });
  //     });
  //   }
  // };


  // onLayoutMenu = (event)=> {
  //   const {x, y, height, width} = event.nativeEvent.layout;
  //   this.setState({heightAux: HEIGHT-y});

  // }

  // const rbStyle = {
  //   container: {
  //     overflow: 'hidden',
  //     justifyContent: 'flex-start',
  //     alignItems: 'flex-start',
  //     paddingLeft: 0,
  //     paddingRight: 0,
  //     borderTopLeftRadius: 20,
  //     borderTopRightRadius: 20,
  //     backgroundColor: '#FFFFFF',
  //     borderWidth: 0.5,
  //     borderColor: '#AAAAAA',
  //     flex:1
  //   },
  //   wrapper: {
  //     flexGrow:1
  //   },
  //   draggableIcon: {
  //     backgroundColor: 'grey',
  //   },
  // };


  renderToolbar = () => {
    const { styles, custom, InfoField } = this.props;
    const { toolSets, toolSetsAttach, menuType, theme, formats, borderWidth } = this.state;
    // const defaultStyles = makeStyles(theme);

    // const toolbarStyle = styles?.toolbar?.root
    //   ? styles?.toolbar?.root(defaultStyles.toolbar)
    //   : defaultStyles.toolbar;

    const toolSetsSelected = menuType === 'format' ? toolSets : toolSetsAttach;
    const modalHeight = menuType === 'format' ? this.state.deviceHeight-150 : 200;
   

    //const {  options, hide, selectionName } = useToolbar();
    //console.log('Toolbar:renderToolbar', JSON.stringify(formats), '%%%%%%%%', JSON.stringify(this.format));

    return (
      <>

        <ToolbarProvider
          theme={theme}
          format={this.format}
          selectedFormats={formats}
          custom={custom}
          styles={styles}
          modalRef={this.RBSheetHolder}
        >

          <RBSheetCustom
            ref={ref => {
              this.RBSheetHolder.current = ref;
            }}
            keyboardAvoidingViewEnabled={true} // Need to set to false otherwise blank space appears when keyboard disappears
            closeOnDragDown={true}
            dragFromTopOnly={true}
            closeOnPressMask={true}
            // width={WIDTH-30}
            openDuration={250}
            height={modalHeight}
            customStyles={{
              container: {
                overflow: 'hidden',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                paddingLeft: 0,
                paddingRight: 0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor: '#FFFFFF',
                borderLeftWidth: borderWidth,
                borderRightWidth: borderWidth,
                borderTopWidth: borderWidth,
                borderBottomWidth: 0,
                borderColor: '#AAAAAA',
                width: this.state.deviceWidth-150,
                maxWidth: 300,
                minHeight: 500,
                maxHeight: this.state.deviceHeight-50, // Platform.isPad ? 850 : this.state.deviceHeight-50,
                
              },
              wrapper: {
                flex:1,
                width: '100%',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                borderWidth: 0,
                borderColor: 'orange',
                backgroundColor: 'rgba(0,0,0,0)',
                
                
              },
              draggableIcon: {
                backgroundColor: 'grey',
              },
            }}
            onClose={() => {this.setState({ showMenu: false, borderWidth: 0})}}
            onOpen={() => {this.setState({ showMenu: true, borderWidth: 0.5})}}
          >

            <KeyboardAwareScrollView
              ref={this.scrollRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{ borderWidth: 0, padding: 15, margin: 0, }} //do not put flex:1 here as it would prevent the scroll from working
              style={{
                borderWidth: 0,
                borderColor: 'blue',
                zIndex: 10,
                backgroundColor: '#ffffff',
                width: this.state.deviceWidth-152,
                maxWidth: 300,
                
                // height: 300
                // flexGrow: 1,
              }}
              viewIsInsideTabBar={false}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              extraHeight={0} // change it according to TextInput Height
            >

              {toolSetsSelected.map((object, index) => {

                //console.log('looping', JSON.stringify(object));
                return (
                  object.length > 0 && object.map((grp, grpIndex) => {

                    if (grp.name === 'separator') {
                      return (
                        <View key={`ToolVal_${index}_${grpIndex}`} style={{ height: 2, backgroundColor: 'rgba(0,0,0,0.1)' }} />
                      )
                    }

                    else if (grp.type === formatType.toggle) {

                      return (
                        <ToggleIconButton
                          key={`ToolVal_${index}_${grpIndex}`}
                          name={grp.name}
                          source={grp.source}
                          valueOff={grp.valueOff}
                          valueOn={grp.valueOn}
                        />
                      )

                    } else {
                      return (
                        object.length > 0 &&
                        grp.values?.map((item: any, index: number) => {
                          //console.log('looping 2', grp.name, JSON.stringify(item));
                          if (
                            item.type === formatType.color &&
                            item.valueOn !== true &&
                            typeof item.valueOn !== 'number'
                          ) {
                            return (
                              <ToggleColorButton
                                key={`GrpVal_${index}`}
                                name={grp.name}
                                valueOff={false}
                                valueOn={item.valueOn}
                              />
                            );
                          } else if (item.type === formatType.icon) {
                            return (
                              <ToggleIconButton
                                key={`GrpVal_${index}`}
                                source={item.source}
                                name={grp.name}
                                valueOff={false}
                                valueOn={item.valueOn}
                              />
                            );
                          } else
                            return (
                              <ToggleTextButton
                                key={`GrpVal_${index}`}
                                name={grp.name}
                                valueOff={false}
                                valueOn={item.valueOn}
                                valueName={item.name}
                              />
                            );
                        })
                      )
                    }

                  }))

              })}
            </KeyboardAwareScrollView>

          </RBSheetCustom>











          <View style={{ width: this.state.deviceWidth, flexDirection: 'row', alignItems: 'center', borderColor: '#dddddd', borderTopWidth: 0.5, justifyContent: 'flex-end', height: 40, borderWidth: 1, backgroundColor: 'rgba(255,255,255,1)' }}>

            {/* <TouchableOpacity style={{ flex: 1, borderWidth: 0 }} onPress={() => { this.props.infoFieldPressed(); }} > */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: '100%', marginRight: 10, borderWidth: 0, backgroundColor: 'rgba(255,255,255,1)' }}>
                {/* <Image source={require('./components/Toolbar_Menu.png')} style={{ marginLeft: 10, marginRight: 20, width: 18, resizeMode: 'contain' }} /> */}
                {/* <Text style={{color:'#EE7887', fontSize:24, fontFamily:'nunito', marginLeft: 14, marginRight: 20, width: 18 }}>ai</Text> */}
                <InfoField />
                {/* <Text style={{ fontSize: 12 }}>Words: {this.props.counts.wordCount} </Text>
                  <Text style={{ fontSize: 12 }}>Chars: {this.props.counts.characterCount}</Text> */}
              </View>
            {/* </TouchableOpacity> */}

            {/* <TouchableOpacity onPress={() => { this.state.showMenu ? this.hide() : this.show('attach') }}> */}

            <TouchableOpacity onPress={() => this.editor?.undo()}>
                <Image
                  source={require('./components/Toolbar_Undo.png')}
                  style={
                    {
                      width: 24,
                      height: 24,
                      marginRight: 15
                    }
                  }
                />
              </TouchableOpacity>


            <TouchableOpacity onPress={() => { this.state.showMenu ? this.RBSheetHolder.current.close() : this.setState({menuType:'attach'}, () => this.RBSheetHolder.current.open())  }}>


              <Image style={{ borderWidth: 0, paddingLeft: 0, marginLeft: 0, height: 24, width: 24 }} source={require('./components/Toolbar_Attach.png')} />

            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => { this.state.showMenu ? this.hide() : this.show('format') }}> */}
            <TouchableOpacity onPress={() => { this.state.showMenu ? this.RBSheetHolder.current.close() : this.setState({menuType:'format'}, () => this.RBSheetHolder.current.open())   }}>

              <Image style={{ borderWidth: 0, padding: 0, marginLeft: 15, marginRight: 15, height: 24, width: 24 }} source={require('./components/Toolbar_Format.png')} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {  this.editor?.blur(); DeviceEventEmitter.emit('event.blur',{});   }}>

              <Image style={{ borderWidth: 0, padding: 0, marginLeft: 0, marginRight: 15, height: 24, width: 24 }} source={require('./components/Toolbar_Down.png')} />
            </TouchableOpacity>

          </View>

          {/* </Animated.View>
          </TouchableOpacity> */}
        </ToolbarProvider>
      </>
    );
  };

  //ToolbarProvider


  render() {
    const { container = 'avoiding-view' } = this.props;
    if (container === 'avoiding-view')
      return (
        // <KeyboardAvoidingView
        //   onTouchStart={(e) => e.stopPropagation()}
        //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // >
        <>
          {this.renderToolbar()}
          </>
        // </KeyboardAvoidingView>
      );
    else if (container === false) return this.renderToolbar();
    else {
      const ContainerComponent = container;
      return <ContainerComponent>{this.renderToolbar()}</ContainerComponent>;
    }
  }
}

const makeStyles = (theme: ToolbarTheme, width) =>
  StyleSheet.create({
    toolbar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: width,
      padding: 2,
      backgroundColor: theme.background,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      height: theme.size + 8,
    },
  });
