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
  Easing
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

const WIDTH = Dimensions.get('window').width;



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



interface QuillToolbarProps {
  options: Array<Array<string | object> | string | object> | 'full' | 'basic';
  optionsAttach: Array<Array<string | object> | string | object>;
  styles?: CustomStyles;
  editor: React.RefObject<QuillEditor>;
  theme: ToolbarTheme | 'dark' | 'light';
  custom?: ToolbarCustom;
  container?: false | 'avoiding-view' | React.ComponentType;
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
}

export class QuillToolbar extends Component<QuillToolbarProps, ToolbarState> {
  public static defaultProps = {
    theme: 'dark',
  };

  animatedValue: Animated.Value;
  constructor(props: QuillToolbarProps) {
    super(props);

    this.state = {
      toolSets: [],
      toolSetsAttach: [],
      menuType: 'format',
      formats: {},
      theme: lightTheme,
      defaultFontFamily: undefined,
      showMenu: false,
      isAnimating: false
    };
    this.animatedValue = new Animated.Value(0);
  }

  editor?: QuillEditor;

  componentDidMount() {
    this.listenToEditor();
    this.prepareIconset();
    this.changeTheme();
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

  private onFormatChange = (data: FormatChangeData) => {
    this.setState({ formats: data.formats });
  };

  private format = (name: string, value: any) => {
    this.editor?.format(name, value);
  };

  show = (menu:string) => {
    if (this.state.isAnimating) return;

    this.setState({menuType: menu});
    const { theme } = this.props;
    if (theme) {
      this.setState({ isAnimating: true }, () => {
        Animated.timing(this.animatedValue, {
          toValue: 400, // 2 * theme.size + 14,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(() => this.setState({ showMenu: true, isAnimating: false }));
      });
    }
  };

  hide = () => {
    if (this.state.isAnimating) return;
    const { theme } = this.props;
    if (theme) {
      this.setState({ isAnimating: true }, () => {
        Animated.timing(this.animatedValue, {
          toValue: 0, //theme.size + 10,
          duration: 200,
          easing: Easing.linear,
          useNativeDriver: false,
        }).start(() => {
          this.setState({
            showMenu: false,
            isAnimating: false,
          });
        });
      });
    }
  };



  renderToolbar = () => {
    const { styles, custom } = this.props;
    const { toolSets, toolSetsAttach, menuType, theme, formats } = this.state;
    // const defaultStyles = makeStyles(theme);

    // const toolbarStyle = styles?.toolbar?.root
    //   ? styles?.toolbar?.root(defaultStyles.toolbar)
    //   : defaultStyles.toolbar;

    const toolSetsSelected = menuType === 'format' ? toolSets : toolSetsAttach;

    //const {  options, hide, selectionName } = useToolbar();
    console.log('Toolbar:renderToolbar', JSON.stringify(toolSets), '*******', JSON.stringify(formats), '%%%%%%%%', JSON.stringify(this.format));

    return (
      <>

        <ToolbarProvider
          theme={theme}
          format={this.format}
          selectedFormats={formats}
          custom={custom}
          styles={styles}
        >
          {/* <SelectionBar /> */}

          {/* <ToolbarConsumer>
            {({ options, selectionName }) => (
              <Button
                onPress={() => { console.log('Options', JSON.stringify(options)); }}
                title={selectionName}
              >

              </Button>

            )}
          </ToolbarConsumer> */}


          {/* <View style={toolbarStyle}> */}
          <View style={{ flexDirection:'column', alignItems:'flex-end' ,justifyContent:'flex-end' }}>
            {/* This scrollView is for the main toolbar */}

            {this.state.isAnimating || this.state.showMenu ?
              <Animated.ScrollView
                horizontal={false}
                bounces={false}
                showsHorizontalScrollIndicator={false}
                style={{ width: 300, padding:10,  borderWidth: 0.25, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)', maxHeight: this.animatedValue }}
              >
                
                {toolSetsSelected.map((object, index) => {

                  console.log('looping', JSON.stringify(object));
                  return (
                  object.length > 0 && object.map((grp) => {
                    
                    if (grp.type === formatType.toggle) {

                      return (

                        <ToggleIconButton
                          key={index}
                          name={grp.name}
                          source={grp.source}
                          valueOff={grp.valueOff}
                          valueOn={grp.valueOn}
                        />
                      )
                    } else {
                      return (
                        object.length > 0 &&
                        grp.values?.map((item:any, index:number) => {
                          console.log('looping 2', grp.name, JSON.stringify(item));
                          if (
                            item.type === formatType.color &&
                            item.valueOn !== true &&
                            typeof item.valueOn !== 'number'
                          ) {
                            return (
                              <ToggleColorButton
                                key={index}
                                name={grp.name}
                                valueOff={false}
                                valueOn={item.valueOn}
                              />
                            );
                          } else if (item.type === formatType.icon) {
                            return (
                              <ToggleIconButton
                                key={index}
                                source={item.source}
                                name={grp.name}
                                valueOff={false}
                                valueOn={item.valueOn}
                              />
                            );
                          } else
                            return (
                              <ToggleTextButton
                                key={index}
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

          

              </Animated.ScrollView> : null}
              

              
            <View style={{ flexDirection:'row', justifyContent:'flex-end', height: 40, width: 100, borderWidth: 0.25, backgroundColor: 'rgba(255,255,255,1)' }}>
              <TouchableOpacity onPress={() => { this.state.showMenu ? this.hide() : this.show('format') }}>
                <Text>Format</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { this.state.showMenu ? this.hide() : this.show('attach') }}>
                <Text>Attach</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ToolbarProvider>
      </>
    );
  };

  //ToolbarProvider


  render() {
    const { container = 'avoiding-view' } = this.props;
    if (container === 'avoiding-view')
      return (
        <KeyboardAvoidingView
          onTouchStart={(e) => e.stopPropagation()}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {this.renderToolbar()}
        </KeyboardAvoidingView>
      );
    else if (container === false) return this.renderToolbar();
    else {
      const ContainerComponent = container;
      return <ContainerComponent>{this.renderToolbar()}</ContainerComponent>;
    }
  }
}

const makeStyles = (theme: ToolbarTheme) =>
  StyleSheet.create({
    toolbar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: WIDTH,
      padding: 2,
      backgroundColor: theme.background,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      height: theme.size + 8,
    },
  });
