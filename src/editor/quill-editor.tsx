import * as React from 'react';
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { createHtml } from '../utils/editor-utils';
import type {
  CustomFont,
  EditorMessage,
  EditorResponse,
  GetLeafResponse,
  QuillConfig,
} from '../types';
import type {
  EditorEventHandler,
  EditorEventType,
  SelectionChangeData,
  EditorChangeData,
  TextChangeData,
  HtmlChangeData,
  DimensionsChangeData,
  FormatRemoteSourceChangeData,
  ThumbnailPressData,
  AttachLocPressData,
  AttachQuotePressData,
  TaskHandlerPressData,
  BabyHandlerPressData,
  GenericHandlerPressData,
  ProcessBase64PressData,
  ReplaceBlotData,
  Range,
  FormatChangeData,
} from '../constants/editor-event';
import { Loading } from './loading';
import * as RNFS from 'react-native-fs';

export interface EditorState {
  webviewContent: string | null;
  height?: number;
  renderedOnce?: boolean;
  // imageJobs: any;
}

export interface EditorProps {
  startTime?: any;
  autoSize?: boolean;
  style?: StyleProp<ViewStyle>;
  quill?: QuillConfig;
  customFonts?: Array<CustomFont>;
  defaultFontFamily?: string;
  initialHtml?: string;
  customStyles?: string[];
  import3rdParties?: 'local' | 'cdn';
  containerId?: string;
  theme?: { background: string; color: string; placeholder: string };
  loading?: string | React.ReactNode;
  container?: boolean | React.ComponentType;
  onSelectionChange?: (data: SelectionChangeData) => void;
  onTextChange?: (data: TextChangeData) => void;
  onHtmlChange?: (data: HtmlChangeData) => void;
  onEditorChange?: (data: EditorChangeData) => void;
  onDimensionsChange?: (data: DimensionsChangeData) => void;
  // onFormatChange?: (data: FormatChangeData) => void;
  webview?: WebViewProps;
  webviewBaseUrl?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onUndo?: () => void;
  onThumbnailPress?: (data: ThumbnailPressData) => void;
  onReplaceBlot?: (data: ReplaceBlotData) => void;
  onQuillLoaded?: () => void;
  onFormatRemoteSource?: (data: FormatRemoteSourceChangeData) => void;
  onAttachLocPress?: (data: AttachLocPressData) => void;
  onAttachQuotePress?: (data: AttachQuotePressData) => void;
  onProcessBase64?: (data: ProcessBase64PressData) => void;
  onTaskHandlerPress?: (data: TaskHandlerPressData) => void;
  onErrandHandlerPress?: (data: TaskHandlerPressData) => void;
  onBabyHandlerPress?: (data: BabyHandlerPressData) => void;
  onGenericHandlerPress?: (data: GenericHandlerPressData) => void;
  //updateInitialHtml?: (html: string) => void;
  customJS?: string;
  customJSwithquill?: string;
  initialHtmlParams?: any;
}

export default class QuillEditor extends React.Component<
  EditorProps,
  EditorState
> {
  private _webview: React.RefObject<WebView>;
  private _handlers: Array<{
    event: EditorEventType;
    handler: EditorEventHandler;
  }>;
  private _promises: Array<EditorResponse>;

  constructor(props: EditorProps) {
    super(props);
    this._webview = React.createRef();
    this.state = {
      webviewContent: '',
      renderedOnce: false,
      // imageJobs: {},

    };


    this._handlers = [];
    this._promises = [];
    const {
      startTime,
      onSelectionChange,
      onEditorChange,
      onTextChange,
      onHtmlChange,
      // onFormatChange,
      onDimensionsChange,
      onBlur,
      onFocus,
      onUndo,
      onThumbnailPress,
      onReplaceBlot,
      onQuillLoaded,
      onFormatRemoteSource,
      onAttachLocPress,
      onAttachQuotePress,
      onProcessBase64,
      onTaskHandlerPress,
      onErrandHandlerPress,
      onBabyHandlerPress,
      onGenericHandlerPress,
    } = this.props;

    console.log('quill-editor:constructor performance 1:', performance.now() - this.props.startTime);

    // console.log('quill-editor onThumbnailPress 1', onThumbnailPress, onTextChange);

    if (onSelectionChange) {
      this.on('selection-change', onSelectionChange);
    }
    if (onEditorChange) {
      this.on('editor-change', onEditorChange);
    }
    if (onTextChange) {
      console.log('quill-editor onTextChange');
      this.on('text-change', onTextChange);
    }
    // if (onFormatChange) {
    //   console.log('quill-editor onFormatChange');
    //   this.on('format-change', onFormatChange);
    // }
    if (onThumbnailPress) {
      this.on('playVideo', onThumbnailPress);
    }
    if (onAttachLocPress) {
      this.on('attachLoc', onAttachLocPress);
    }
    if (onAttachQuotePress) {
      this.on('attachQuote', onAttachQuotePress);
    }


    if (onTaskHandlerPress) {
      this.on('TaskHandler', onTaskHandlerPress);
    }
    if (onErrandHandlerPress) {
      this.on('ErrandHandler', onErrandHandlerPress);
    }
    if (onBabyHandlerPress) {
      // console.log('Quill-editor:onBabyHandlerPress');
      this.on('BabyHandler', onBabyHandlerPress);
    }
    if (onGenericHandlerPress) {
      this.on('GenericHandler', onGenericHandlerPress);
    }
    if (onReplaceBlot) {
      this.on('replaceBlot', onReplaceBlot);
    }
    if (onProcessBase64) {
      this.on('processBase64', onProcessBase64);
    }
    if (onFormatRemoteSource) {
      this.on('formatRemoteSource', onFormatRemoteSource);
    }
    if (onHtmlChange) {
      this.on('html-change', onHtmlChange);
    }
    if (onDimensionsChange) {
      this.on('dimensions-change', onDimensionsChange);
    }
    if (onBlur) {
      this.on('blur', onBlur);
    }
    if (onFocus) {
      this.on('focus', onFocus);
    }
    if (onQuillLoaded) {
      this.on('quillLoaded', onQuillLoaded);
    }

    // console.log('quill-editor this.props.webviewBaseUrl', this.props.webviewBaseUrl);

  }

  componentDidMount(): void {
    const loadInitialHtml = true;
    // const startTime = performance.now();

    this.getInitalHtml(loadInitialHtml, (path) => {
      console.log('quill-editor:componentDidMount performance 2:', performance.now() - this.props.startTime);
      this.setState({
        webviewContent: path
      });
    });

    // this.setState({ renderedOnce: true });
  }

  private getInitalHtml = async (loadInitialHtml?,  callback?) => {
    const {
      initialHtml = '',
      import3rdParties = 'local',
      containerId = 'standalone-container',
      theme = {
        background: 'rgba(255,255,255,0)',
        color: 'rgb(32, 35, 42)',
        placeholder: 'rgba(0,0,0,0.6)',
      },
      quill = {
        id: 'editor-container',
        placeholder: 'write here!',
        modules: {
          toolbar: false,
        },
        theme: 'snow',
      },
      customFonts = [],
      customStyles = [],
      defaultFontFamily = undefined,
      customJS = '',
      customJSwithquill = '',
      initialHtmlParams = null
    } = this.props;


    //var htmlFileName = this.getKey() + '.html';

    // customStyles could dynamically change:
    // user can change: 
    //      $selectedFontSize => This can be variable so we have to rebuild everytime this changes
    //      PostBumpTemplate.getBackgroundOpacity() => Greater or less than 0 => fontColor, backgroundOpacity
    //      We create 2 files every time selectedFontSize changes: one for backgroundOpacity < 0 another for backgroundOpacity > 0
    const { fontSize, backgroundOpacity, fontFamily } = initialHtmlParams;
    // if (isLightBg !== null) {
    //   backgroundOpacity = isLightBg ? 'gt0' : 'lt0';
    // }
    var htmlFileName = 'basePodberry_' + backgroundOpacity + '_' + fontFamily + '_' + fontSize.toString() + '.html';
    var htmlDirectory = await RNFS.DocumentDirectoryPath + '/htmlDirectory';
    var path = htmlDirectory + '/' + htmlFileName;

    const exists = await RNFS.exists(path); // it will get replaced(if already existing) everytime a thumbnail is being generated
    console.log('File exists or not: ', exists, path);


    if (!exists) {
      // await RNFS.unlink(path); // always delete existing videopath first before making a copy(see below) , unlink will throw an error if file does not exist
      const existsHtmlDirectory = await RNFS.exists(htmlDirectory);
      if (!existsHtmlDirectory) {
        //   await RNFS.unlink(htmlDirectory); // always delete existing videopath first before making a copy(see below) , unlink will throw an error if file does not exist
        RNFS.mkdir(htmlDirectory);
      }




      const createdHtml = await createHtml({
        //initialHtml: loadInitialHtml ? initialHtml : '',
        autoSize: this.props.autoSize,
        placeholder: quill.placeholder,
        theme: quill.theme ? quill.theme : 'snow',
        toolbar: JSON.stringify(quill.modules?.toolbar),
        clipboard: quill.modules?.clipboard,
        keyboard: quill.modules?.keyboard,
        libraries: import3rdParties,
        editorId: quill.id ? quill.id : 'editor-container',
        defaultFontFamily,
        containerId,
        color: theme.color,
        fonts: customFonts,
        backgroundColor: 'rgba(255,255,255,0)',
        placeholderColor: theme.placeholder,
        customStyles,
        customJS,
        customJSwithquill,
        // imageDropAndPaste: quill.modules?.imageDropAndPaste,
      });


      // console.log('getInitalHtml createdHtml', createdHtml);
      await RNFS.writeFile(path, createdHtml, 'utf8')
        .then(() => {
          console.log('FILE WRITTEN!');
          if (callback) {
            callback(path);
          }
          // return Promise.resolve(path);
          // return path;
        })
        .catch((err) => {
          console.log(err.message);
          // return Promise.reject(JSON.stringify(err));
        });

      //return Promise.reject('');
    } else {
      if (callback) {
        callback(path);
      }
    }


  };




  private getKey(): string {
    var timestamp = new Date().getUTCMilliseconds();
    return `${timestamp}${Math.random()}`;
  }

  private postAwait<T>(data: any): Promise<T> {
    const key = this.getKey();
    let resolveFn: (value: T | PromiseLike<T>) => void;
    resolveFn = () => { };
    const promise = new Promise<T>((resolve) => {
      resolveFn = resolve;
    });

    const resp: EditorResponse = {
      key,
      resolve: resolveFn,
    };

    this._promises.push(resp);
    this.post({ ...data, key });

    return promise;
  }

  private post = (obj: object) => {
    console.log('quill-editor::post', JSON.stringify(obj));
    const jsonString = JSON.stringify(obj);
    this._webview.current?.postMessage(jsonString);
  };

  private toMessage = (data: string): EditorMessage => {
    const message: EditorMessage = JSON.parse(data);
    return message;
  };

  private onMessage = (event: WebViewMessageEvent) => {
    console.log('quill-editor onMessage:', JSON.stringify(event.nativeEvent));
    const message = this.toMessage(event.nativeEvent.data);
    const { autoSize } = this.props;
    const response = message.key
      ? this._promises.find((x) => x.key === message.key)
      : undefined;
    switch (message.type) {
      case 'dimensions-change':
        if (autoSize === true) this.setState({ height: message.data.height });
        this._handlers
          .filter((x) => x.event === message.type)
          .forEach((item) => item.handler(message.data));
        break;
      case 'format-change':
      case 'text-change':
      case 'playVideo':
      case 'attachLoc':
      case 'attachQuote':
      case 'TaskHandler':
      case 'ErrandHandler':
      case 'BabyHandler':
      case 'GenericHandler':
      case 'replaceBlot':
      case 'formatRemoteSource':
      case 'processBase64':
      case 'selection-change':
      case 'html-change':
      case 'editor-change':
      case 'quillLoaded':
      case 'blur':
      case 'focus':
        this._handlers
          .filter((x) => x.event === message.type)
          .forEach((item) => item.handler(message.data));
        break;
      case 'has-focus':
      case 'get-contents':
      case 'get-text':
      case 'get-length':
      case 'get-bounds':
      case 'get-selection':
      case 'get-dimensions':
      case 'get-index':
      case 'get-html':
      case 'get-format':
      case 'get-leaf':
      case 'remove-format':
      case 'format-text':
      case 'format-imageblot':
      case 'format-collageblot':
      case 'format-quotationblot':
      case 'format-outlineblot':
      case 'format-tasklist':
      case 'format-errandlist':
      case 'format-baby':
      case 'insert-embedawait':
      case 'insert-textawait':
        if (response) {
          console.log('quill-editor:onMessage', message.type, message.data);
          response.resolve(message.data);
          this._promises = this._promises.filter((x) => x.key !== message.key);
        }
        break;
      default:
        // Allow catching messages using the passed webview props
        if (this.props.webview?.onMessage) {
          this.props.webview?.onMessage(event);
        }
    }
  };


  rebuildHtml = async () => {

    // if (html && this.props.updateInitialHtml) {
    //   await this.props.updateInitialHtml(html);
    // }
    var deltaOps = await this.getContents();
    console.log('rebuildHtml', JSON.stringify(deltaOps));
    const loadInitialHtml = false;
    this.getInitalHtml(loadInitialHtml, (path) => {
      this.setState({
        webviewContent: path,
      }, () => {
        setTimeout(async () => {
          console.log('rebuuildHtml deltaOps', JSON.stringify(deltaOps));
          await this.setContents(deltaOps);
          this.setSelection(0, 0);

        }, 500);
      });
    })





  };

  blur = () => {
    this.post({ command: 'blur' });
  };

  focus = () => {
    this.post({ command: 'focus' });

    if (Platform.OS === 'android') {
      this._webview.current?.requestFocus();
    }
  };

  undo = () => {

    const run = `
      quill.history.undo();
      true;
    `;


    this._webview.current?.injectJavaScript(run);
    // if (this.props.onUndo) {
    // this.props.onUndo();
    // }
  }


  changeHeadStyle = (fontColor: string) => {
    const run = `
      // alert('changeheadStyle' + '${fontColor}');
      var head = document.head || document.getElementsById('head')[0];
      // alert('changeheadstyle 1' + JSON.stringify(head.innerHTML));

      //var element = document.getElementById("fontcolor");
      document.getElementById("fontcolor").remove();
      var css = '.ql-container {color: ${fontColor};}';
      var style = document.createElement('style');
      style.setAttribute("id", "fontcolor");
      style.type = 'text/css';

      head.appendChild(style);
      
      if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      alert('changeheadstyle 2' + JSON.stringify(head.innerHTML));

      // element.classList.remove("ql-container");
      // document.getElementById("fontcolor").textContent += ".ql-container {color: #F00;}";
      // // alert('changeheadStyle element', element);

      true;
    `;
    this._webview.current?.injectJavaScript(run);
  }


  getScrollIndexForElementId = (id: string) => {
    const run = `

      var elem = document.getElementById("${id}");
      var parent = elem.parentNode;
      let blot = parent.__blot.blot;
      let index = blot.offset(quill.scroll);
      alert('getScrollIndexForElementId' + index);
      
      // window.ReactNativeWebView.postMessage(JSON.stringify({getBlot: index}));

      true;

    `;
    this._webview.current?.injectJavaScript(run);
  }

  // quill.insertEmbed(index, '${type}', JSON.parse(${blotstr}));
  replaceBlot = (id: string, type: string, blotstr: string) => {
    console.log('replaceBlot', id, type, blotstr);
    const run = `
    var elem = document.getElementById("${id}");
    //var parent = elem.parentNode;
    var blot = elem.__blot.blot;
    var index = blot.offset(quill.scroll);

    elem.remove();
    //parent.remove();

    // const blotstr = {
    //   imgBase64:null,
    //   imgLocalPath:null,
    //   imgRemotePath:"https://bumping-files.s3.ap-east-1.amazonaws.com/uploads%2F3a4ifa2skx836z3l9xn28-Bump-bump-imageimage.jpg",
    //   imgName:"IMG_0003.JPG",
    //   imgMime:"image/jpeg",
    //   vidLocalPath:null,
    //   vidRemotePath:"EMPTY-beb4dd14-8344-4646-8148-b39191b06089",
    //   vidMime:"EMPTY-cbaa13d7-1dc9-4d9e-bf51-6c93a925b079",
    //   height:"auto",
    //   width:"100%",
    //   assetHeight:"2002",
    //   assetWidth:"3000",
    //   key:null
    // };

    // const obj = { "command": "insertEmbed", "index":index, "type":"pbThumbnail", "value":blotstr };
    // const jsonString = JSON.stringify(obj);
    // window.ReactNativeWebView.postMessage(jsonString);
    quill.insertEmbed(index, "${type}", ${blotstr});

    // Attempt to notify caller that procedure is done.
    var obj = { "command": "replaceBlot", "value": ${blotstr} };
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));


    true;
  
    `;
    this._webview.current?.injectJavaScript(run);

  }


  formatRemoteSource = async (id: string, type: string, imgPath: string, vidPath: string) => {


    return new Promise(async (resolve, reject) => {

      console.log('formatRemoteSource', id, type, imgPath, vidPath);
      // const imageJobs = {};
      // imageJobs[id] = true;
      // this.setState(imageJobs);


      const run = `

    function stringify (x) {
      return (Object.prototype.toString.call(x));
    }

    
    

    var elem = document.getElementById("${id}");

    // var elemAttribs = elem.attributes;
    // var arr = Array.from(elemAttribs);

    // var attribStr = '';
    // var arrAttribs = arr.map(elem => {
    //   if (elem.name !== "src") {
    //   attribStr  = attribStr + ', ' + elem.name + ':' + elem.value
    //   }
    // });

    // alert('formatRemoteSource elem: ' + elem.constructor.name);

    //var parent = elem.parentNode;
    var blot = elem.__blot.blot;
    //var index = blot.offset(quill.scroll);

    // alert('formatRemoteSource blot: ' + blot.constructor.name);

    // var arrBlot = Array.from(blot);
    // var attribStr = '';
    // var arrAttribs = arrBlot.map(elem => {
    //     attribStr  = attribStr + ', ' + elem.name + ':' + elem.value
    //   });

    // for(var property in blot) {
    //   alert(property + "=" + blot[property]);
    // }

    // alert('formatRemoteSource: ' + index + ', ' +  blot.statics.getMouse());

    // if (${type} === 'image') {
    //   blot.format("vidRemotePath", "EMPTY");
    //   blot.format("imgRemotePath", "${imgPath}");
    //   blot.format("src", "${imgPath}");
    //   blot.format("imgBase64", null);
    // } else {
      blot.format("vidRemotePath", "${vidPath}");
      blot.format("imgRemotePath", "${imgPath}");
      blot.format("vidLocalPath", null);
      blot.format("imgLocalPath", null);
      blot.format("src", "${imgPath}");
      blot.format("imgBase64", null);
    // }

    // elemAttribs = elem.attributes;
    // arr = Array.from(elemAttribs);
    // attribStr = '';
    // arrAttribs = arr.map(elem => {
    //   if (elem.name !== "src") {
    //   attribStr  = attribStr + ', ' + elem.name + ':' + elem.value
    //   }
    // });

    // alert('formatRemoteSource: ' + attribStr);

    // elem.remove();
   

    // const blotstr = {
    //   imgBase64:null,
    //   imgLocalPath:null,
    //   imgRemotePath:"https://bumping-files.s3.ap-east-1.amazonaws.com/uploads%2F3a4ifa2skx836z3l9xn28-Bump-bump-imageimage.jpg",
    //   imgName:"IMG_0003.JPG",
    //   imgMime:"image/jpeg",
    //   vidLocalPath:null,
    //   vidRemotePath:"EMPTY-beb4dd14-8344-4646-8148-b39191b06089",
    //   vidMime:"EMPTY-cbaa13d7-1dc9-4d9e-bf51-6c93a925b079",
    //   height:"auto",
    //   width:"100%",
    //   assetHeight:"2002",
    //   assetWidth:"3000",
    //   key:null
    // };

    

    // Attempt to notify caller that procedure is done.
    var obj = { type:'formatRemoteSource', command: 'formatRemoteSource', data: {id: '${id}'} };
    //sendMessage(JSON.stringify({type:'formatRemoteSource'}));
    //window.ReactNativeWebView.postMessage(JSON.stringify({type:'formatRemoteSource'}));
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));


    true;
  
    `;

      this._webview.current?.injectJavaScript(run);




    });

  }



  formatPlaceId = (googlePlaceId: string, placeId: number) => {



    console.log('formatPlaceId', googlePlaceId, placeId);

    const run = `

    var elems = document.querySelectorAll("[googleplaceid='${googlePlaceId}']");
    var elem = elems[0];
    var blot = elem.__blot.blot;

    blot.format("placeId", ${placeId});

    // Attempt to notify caller that procedure is done.
    var obj = { "command": "formatPlaceId", "value": '${googlePlaceId}' };
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'formatPlaceId'}));

    true;
  
    `;
    this._webview.current?.injectJavaScript(run);

  }


  // embedLocation = (object: any, currIndex: number) => {



  //   console.log('embedLocation', object, currIndex);
  //   const run = `

  //   function stringify (x) {
  //     return (Object.prototype.toString.call(x));
  //   }




  //   var elem = document.getElementById("${id}");
  //   //var parent = elem.parentNode;
  //   var blot = elem.__blot.blot;

  //   // var elemAttribs = elem.attributes;
  //   // var arr = Array.from(elemAttribs);

  //   // var attribStr = '';
  //   // var arrAttribs = arr.map(elem => {
  //   //   if (elem.name !== "src") {
  //   //   attribStr  = attribStr + ', ' + elem.name + ':' + elem.value
  //   //   }
  //   // });



  //   //var index = blot.offset(quill.scroll);

  //   // var arrBlot = Array.from(blot);
  //   // var attribStr = '';
  //   // var arrAttribs = arrBlot.map(elem => {
  //   //     attribStr  = attribStr + ', ' + elem.name + ':' + elem.value
  //   //   });


  //     blot.format("vidRemotePath", "${vidPath}");
  //     blot.format("imgRemotePath", "${imgPath}");
  //     blot.format("vidLocalPath", null);
  //     blot.format("imgLocalPath", null);
  //     blot.format("src", "${imgPath}");
  //     blot.format("imgBase64", null);



  //   // Attempt to notify caller that procedure is done.
  //   var obj = { "command": "formatRemoteSource", "value": '${id}' };

  //   window.ReactNativeWebView.postMessage(JSON.stringify({type:'formatRemoteSource'}));



  //   true;

  //   `;
  //   this._webview.current?.injectJavaScript(run);

  // }



  addCustomAttributes = (id: string, value: string) => {
    console.log('addCustomAttributes', id, value);
    const run = `
    var elem = document.getElementById("${id}");
    var parent = elem.parentNode;
    let blot = parent.__blot.blot;
    let index = blot.offset(quill.scroll);

    // import Parchment from 'parchment';
    let Parchment = Quill.import('parchment');

    let VidRemotePath = new Parchment.Attributor.Attribute('vidRemotePath', 'vidRemotePath', {
      scope: Parchment.Scope.BLOCK
    });
    Quill.register(VidRemotePath);
    VidRemotePath.add(elem, 'Doreimon');

    let BugsBunny = new Parchment.Attributor.Attribute('bugsBunny', 'bugsBunny');
    Quill.register(BugsBunny);
    BugsBunny.add(elem, 'RogerRabbit');

    true;
  
    `;
    this._webview.current?.injectJavaScript(run);

  }


  insertLine = (id: string) => {
    console.log('insertLine', id);
    const run = `
      var elem = document.getElementById("${id}");
      var blot = elem.__blot.blot;
      var index = blot.offset(quill.scroll);
      quill.insertText(index + 1, "\\n");
      true;
    `;
    this._webview.current?.injectJavaScript(run);
  }


  deleteBlot = (id: string) => {
    const run = `
      // import Quill from 'quill';
      

      var elem = document.getElementById("${id}");
      //var parent = elem.parentNode;

      // let blot = parent.__blot.blot;
      // let index = blot.offset(quill.scroll);
      // alert('deleteBlot' + index);

      elem.remove();
      //parent.remove();
      
    `;
    this._webview.current?.injectJavaScript(run);
  }

  deleteBlotByClass = (className: string) => {
    const run = `

      var elems = document.getElementsByClassName("${className}");

      elems.forEach(elem => {
        elem.remove();
      });

      
    `;
    this._webview.current?.injectJavaScript(run);
  }


  hasFocus = (): Promise<boolean> => {
    return this.postAwait<any>({ command: 'hasFocus' });
  };

  enable = (enable = true) => {
    this.post({ command: 'enable', value: enable });
  };

  disable = () => {
    this.post({ command: 'enable', value: false });
  };

  update = () => {
    this.post({ command: 'update' });
  };

  format = (name: string, value: any) => {
    console.log('quill-editor:format', name, value);

    let val = value;
    if (name === 'list' && value === 'check') {
      // if (formats['list'] === 'checked' || formats['list'] === 'unchecked') {
      //   this.quill.format('list', false, _quill2.default.sources.USER);
      // } else {
      //   this.quill.format('list', 'unchecked', _quill2.default.sources.USER);
      // }
      val = 'unchecked';
    }

    this.post({ command: 'format', name, value: val });
  };

  deleteText = (index: number, length: number) => {
    this.post({ command: 'deleteText', index, length });
  };

  removeFormat = (index: number, length: number) => {
    return this.postAwait({ command: 'removeFormat', index, length });
  };

  getDimensions = (): Promise<any> => {
    return this.postAwait<any>({ command: 'getDimensions' });
  };

  getContents = (index?: number, length?: number): Promise<any> => {
    return this.postAwait<any>({ command: 'getContents', index, length });
  };

  getIndexOfId = (id?: string): Promise<any> => {
    return this.postAwait<any>({ command: 'getIndex', id });
  };

  getHtml = (): Promise<string> => {
    return this.postAwait<any>({ command: 'getHtml' });
  };

  getLength = (): Promise<number> => {
    return this.postAwait<any>({ command: 'getLength' });
  };

  getText = (index?: number, length?: number): Promise<string> => {
    return this.postAwait<any>({ command: 'getText', index, length });
  };

  getBounds = (
    index: number,
    length?: number
  ): Promise<{ left: number; top: number; height: number; width: number }> => {
    return this.postAwait<any>({ command: 'getBounds', index, length });
  };

  getSelection = (focus: boolean = false): Promise<Range> => {
    return this.postAwait<any>({ command: 'getSelection', focus });
  };

  setSelection = (index: number, length?: number, source?: String) => {
    this.post({ command: 'setSelection', index, length, source });
  };

  insertEmbed = (index: number, type: string, value: any, source: string = 'api') => {
    this.post({ command: 'insertEmbed', index, type, value, source });
  };

  insertEmbedAwait = (index: number, type: string, value: any, source: string = 'api'): Promise<any> => {
    return this.postAwait({ command: 'insertEmbedAwait', index, type, value, source });
  };

  insertText = (index: number, text: string, formats?: Record<string, any>) => {
    this.post({ command: 'insertText', index, text, formats });
  };

  insertTextAwait = (index: number, text: string, formats?: Record<string, any>): Promise<any> => {
    console.log('quill-editor:insertTextAwait', index, text);
    return this.postAwait({ command: 'insertTextAwait', index, text, formats });
  };

  setContents = (delta: any) => {
    this.post({ command: 'setContents', delta });
  };

  setText = (text: string) => {
    this.post({ command: 'setText', text });
  };

  updateContents = (delta: any) => {
    this.post({ command: 'updateContents', delta });
  };

  getFormat = (
    index: { index: number; length: number } | number,
    length?: number
  ): Promise<Record<string, unknown>> => {
    return this.postAwait({ command: 'getFormat', index, length });
  };

  getLeaf = (index: number): Promise<GetLeafResponse | null> => {
    return this.postAwait({ command: 'getLeaf', index });
  };

  formatText = (
    index: number,
    length: number,
    formats: Record<string, unknown>,
    source: string = 'api'
  ): Promise<any> => {
    return this.postAwait({
      command: 'formatText',
      index,
      length,
      formats,
      source,
    });
  };

  formatImageBlot = (obj: any): Promise<any> => {
    console.log('formatImageBlot', JSON.stringify(obj));
    return this.postAwait({
      command: 'formatImageBlot',
      obj: obj
    });
  }

  formatCollageBlot = (obj: any): Promise<any> => {
    console.log('formatCollageBlot', JSON.stringify(obj));
    return this.postAwait({
      command: 'formatCollageBlot',
      obj: obj
    });
  }

  formatQuotationBlot = (obj: any): Promise<any> => {
    console.log('formatQuotationBlot', JSON.stringify(obj));
    return this.postAwait({
      command: 'formatQuotationBlot',
      obj: obj
    });
  }

  formatOutlineBlot = (obj: any): Promise<any> => {
    console.log('formatOutlineBlot', JSON.stringify(obj));
    return this.postAwait({
      command: 'formatOutlineBlot',
      obj: obj
    });
  }


  formatTaskList = (obj: any): Promise<any> => {
    console.log('formatTaskList', JSON.stringify(obj));
    return this.postAwait({
      command: 'formatTaskList',
      obj: obj
    });
  }

  // updateOriginalTasks = (obj:any):Promise<any> => {
  //   console.log('updateOriginalTasks', JSON.stringify(obj));
  //   return this.postAwait({
  //     command: 'updateOriginalTasks',
  //     obj: obj
  //   });
  // }

  formatErrandList = (obj: any): Promise<any> => {
    // console.log('formatErrandList', JSON.stringify(obj));
    return this.postAwait({
      command: 'formatErrandList',
      obj: obj
    });
  }


  formatBaby = (obj: any): Promise<any> => {
    return this.postAwait({
      command: 'formatBaby',
      obj: obj
    });
  }

  // updateOriginalErrands = (obj:any):Promise<any> => {
  //   console.log('updateOriginalErrands', JSON.stringify(obj));
  //   return this.postAwait({
  //     command: 'updateOriginalErrands',
  //     obj: obj
  //   });
  // }


  on = (event: EditorEventType, handler: EditorEventHandler) => {
    console.log('quill-editor:on', event);
    this._handlers.push({ event, handler });
  };

  off = (event: EditorEventType, handler: Function) => {
    const index = this._handlers.findIndex(
      (x) => x.event === event && x.handler === handler
    );
    if (index > -1) {
      this._handlers.splice(index, 1);
    }
  };

  dangerouslyPasteHTML = (index: number, html: string) => {
    this.post({ command: 'dangerouslyPasteHTML', index, html });
  };

  updateSrc = () => {
    this.setState({ renderedOnce: true });
  }

  renderWebview = (
    content: string,
    style: StyleProp<ViewStyle>,
    props: WebViewProps = {}
  ) => (
    <WebView
      
      scrollEnabled={false}
      nestedScrollEnabled={true}
      allowsFullscreenVideo={false}
      allowsInlineMediaPlayback={true}
      hideKeyboardAccessoryView={true}
      keyboardDisplayRequiresUserAction={false}
      originWhitelist={['*']}
      style={style}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
      }}
      allowFileAccess={true}
      domStorageEnabled={false}
      automaticallyAdjustContentInsets={true}
      bounces={false}
      cacheEnabled={true}
      dataDetectorTypes="none"
      {...props}
      javaScriptEnabled={true}
      // source={{ html: content, baseUrl: this.props.webviewBaseUrl }}
      source={this.state.renderedOnce ? { uri: 'file://' + content, baseUrl: this.props.webviewBaseUrl } : undefined}
      // source={{ uri: 'file://' + content, baseUrl: this.props.webviewBaseUrl }}
      ref={this._webview}
      onMessage={this.onMessage}
      allowingReadAccessToURL={this.props.webviewBaseUrl}
      onLoad={this.updateSrc}
      onLoadStart={() => {
        console.log('quill-editor:onLoadStart performance', performance.now() - this.props.startTime);
      }}
      onLoadEnd={() => {
        console.log('quill-editor:onLoadEnd performance', performance.now() - this.props.startTime);
      }}
    />
  );

  render() {
    const { webviewContent, height } = this.state;
    const {
      style,
      webview,
      container = false,
      loading = 'Please Wait ...',
      autoSize = false,
    } = this.props;
    if (container === false) {
      if (!webviewContent) return <Text>Please wait...</Text>;
      return this.renderWebview(webviewContent, style, webview);
    } else {
      const ContainerComponent = container === true ? View : container;
      return (
        <ContainerComponent
          style={[style, autoSize && height ? { height } : {}]}
        >
          {webviewContent ? (
            this.renderWebview(webviewContent, styles.webView, webview)
          ) : typeof loading === 'string' ? (
            <Loading text={loading} />
          ) : (
            loading
          )}
        </ContainerComponent>
      );
    }
  }
}

let styles = StyleSheet.create({
  webView: {
    flexGrow: 1,
    borderWidth: 0,
  },
});
