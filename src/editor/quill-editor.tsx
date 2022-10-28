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
  ThumbnailPressData,
  ReplaceBlotData,
  Range,
} from '../constants/editor-event';
import { Loading } from './loading';
import * as RNFS from 'react-native-fs';

export interface EditorState {
  webviewContent: string | null;
  height?: number;
}

export interface EditorProps {
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
  webview?: WebViewProps;
  webviewBaseUrl?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onUndo?: () => void;
  onThumbnailPress?: (data: ThumbnailPressData) => void;
  onReplaceBlot?: (data: ReplaceBlotData) => void;
  //updateInitialHtml?: (html: string) => void;
  customJS?: string;

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
      webviewContent: this.getInitalHtml(),
    };

    this._handlers = [];
    this._promises = [];
    const {
      onSelectionChange,
      onEditorChange,
      onTextChange,
      onHtmlChange,
      onDimensionsChange,
      onBlur,
      onFocus,
      onUndo,
      onThumbnailPress,
      onReplaceBlot
    } = this.props;

    console.log('quill-editor onThumbnailPress 1', onThumbnailPress, onTextChange);

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
    if (onThumbnailPress) {
      this.on('playVideo', onThumbnailPress);
    }
    if (onReplaceBlot) {
      this.on('replaceBlot', onReplaceBlot);
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

    console.log('quill-editor this.props.webviewBaseUrl', this.props.webviewBaseUrl);

  }

  private getInitalHtml = async (): string => {
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
    } = this.props;

    const createdHtml = await createHtml({
      initialHtml,
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
    });


    var path = await RNFS.DocumentDirectoryPath + '/createdHtml.txt';
    const exists = await RNFS.exists(path); // it will get replaced(if already existing) everytime a thumbnail is being generated

    if (exists) {
      await RNFS.unlink(path); // always delete existing videopath first before making a copy(see below) , unlink will throw an error if file does not exist
    }

    RNFS.writeFile(path, createdHtml, 'utf8')
      .then(() => {
        console.log('FILE WRITTEN!');
        return path;
      })
      .catch((err) => console.log(err.message));

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
    //console.log('quill-editor::post', JSON.stringify(obj));
    const jsonString = JSON.stringify(obj);
    this._webview.current?.postMessage(jsonString);
  };

  private toMessage = (data: string): EditorMessage => {
    const message: EditorMessage = JSON.parse(data);
    return message;
  };

  private onMessage = (event: WebViewMessageEvent) => {
    //console.log('quill-editor onMessage', event.nativeEvent.data);
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
      case 'replaceBlot':
      case 'selection-change':
      case 'html-change':
      case 'editor-change':
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
      case 'get-html':
      case 'get-format':
      case 'get-leaf':
      case 'remove-format':
      case 'format-text':
        if (response) {
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

    this.setState({
      webviewContent: this.getInitalHtml(),
    }, () => {
      setTimeout(() => {
        //console.log('rebuuildHtml deltaOps', JSON.stringify(deltaOps));
        this.setContents(deltaOps);
      }, 500);
    });





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


  formatRemoteSource = (id: string, type: string, imgPath: string, vidPath: string) => {



    console.log('formatImageBlot', id, type, imgPath, vidPath);
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
    var index = blot.offset(quill.scroll);

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
    var obj = { "command": "formatRemoteSource", "value": '${id}' };
    window.ReactNativeWebView.postMessage(JSON.stringify(obj));


    true;
  
    `;
    this._webview.current?.injectJavaScript(run);

  }





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
    this.post({ command: 'format', name, value });
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

  insertEmbed = (index: number, type: string, value: any) => {
    this.post({ command: 'insertEmbed', index, type, value });
  };

  insertText = (index: number, text: string, formats?: Record<string, any>) => {
    this.post({ command: 'insertText', index, text, formats });
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

  on = (event: EditorEventType, handler: EditorEventHandler) => {
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

  renderWebview = (
    content: string,
    style: StyleProp<ViewStyle>,
    props: WebViewProps = {}
  ) => (
    <WebView
      scrollEnabled={false}
      nestedScrollEnabled={true}
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
      dataDetectorTypes="none"
      {...props}
      javaScriptEnabled={true}
      // source={{ html: content, baseUrl: this.props.webviewBaseUrl }}
      source={{uri: content, baseUrl: this.props.webviewBaseUrl}}
      ref={this._webview}
      onMessage={this.onMessage}
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