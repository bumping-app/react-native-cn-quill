export const editor_js = `
<script>
(function (doc) {

  var getAttributes = function (node) {
    const attrArray = node?.attributes ? [...node.attributes] : [];
    return attrArray.reduce((_attr, node) => ({ ..._attr, [node.nodeName]: node.nodeValue}), {});
  }

  var sendMessage = function (message) {
    if (window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(message);
      else console.log(message)
  }

  // Get the dimensions of the quill content field
  var getDimensions = function (key) {
    const dimensionsJson = JSON.stringify({
      type: 'get-dimensions',
      key: key,
      data: {
        width: quill.root.scrollWidth,
        height: quill.root.scrollHeight
      }
    });
    sendMessage(dimensionsJson);
  }

  var getSelectedFormats = function () {
    var formats = quill.getFormat();
      var contentChanged = JSON.stringify({
                type: 'format-change',
                data: {formats} });
      sendMessage(contentChanged);
  }
  //Format text at user’s current selection
  var formatSelection = function (name, value) {
    var range = quill.getSelection();
    if (!range) quill.focus();
    quill.format(name, value);
    getSelectedFormats();
  }





  var hasFocus = function (key) {
    var hs = quill.hasFocus();

    var hsJson = JSON.stringify({
                type: 'has-focus',
                key: key,
                data: hs });
      sendMessage(hsJson);
  }

  var getContents = function (key, index, length) {
    var getContentsData = quill.getContents(index, length);
    var getContentsDataJson = JSON.stringify({
      type: 'get-contents',
      key: key,
      data: getContentsData });
      sendMessage(getContentsDataJson);
  }

  var getText = function (key, index, length) {
    try {
      var getTextData = quill.getText(index, length);
    } catch (e) {
      // do nothing
      alert('getText: ' + e);
    }
      var getTextDataJson = JSON.stringify({
      type: 'get-text',
      key: key,
      data: getTextData });
      sendMessage(getTextDataJson);
  }


  var getIndex = function (key, id) {
    var elem = document.getElementById(id);
    var returnObj = false;
    if (elem) {
      returnObj = true;
    } 
    const returnJson = JSON.stringify({
      type: 'get-index',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(returnJson);

  }

  var getLength = function (key) {
    var getLengthData = quill.getLength();
    var getLengthDataJson = JSON.stringify({
      type: 'get-length',
      key: key,
      data: getLengthData });
      sendMessage(getLengthDataJson);
  }

  var getHtml = function (key) {
    var html = quill.root.innerHTML;
    var getHtmlJson = JSON.stringify({
      type: 'get-html',
      key: key,
      data: html
    });
    sendMessage(getHtmlJson);
  }

  var insertEmbed = function (index, type, value, source = 'api') {
    var ind = index;
    if (ind === -1) {
      var range = quill.getSelection();
      if (range) { 
      ind = range.index;
      }
    }
    quill.insertEmbed(ind, type, value, source);

  }

  var insertEmbedAwait = function (key, index, type, value, source = 'api') {
    var ind = index;
    try {
    quill.insertEmbed(ind, type, value, source);
    } catch (e) {
      // do nothing
      // alert('insertEmbedAwait' + e)
    }    
    var insertEmbedAwaitJson = JSON.stringify({
      type: 'insert-embedawait',
      key: key
    });
    sendMessage(insertEmbedAwaitJson);

  }

  var insertText = function (index, text, formats={}) {
    
    var ind = index;
    try {
    if (ind === -1) {
      var range = quill.getSelection();
      if (range) { 
      ind = range.index;
      }
    }
    quill.insertText(ind, text, formats);
  } catch (e) {

  }

  }


  var insertTextAwait = function (key, index, text, formats={}) {
    
    var ind = index;

    try {
      if (ind === -1) {
        var range = quill.getSelection();
        if (range) { 
          ind = range.index;
        }
      }
      // alert('insertTextAwait1: ' + ind, text, formats);
      quill.insertText(ind, text, formats);
      
    } catch (e) {
      //do nothing
      // alert('err insertTextAwait: ' + e);
    }

    var insertEmbedAwaitJson = JSON.stringify({
      type: 'insert-textawait',
      key: key
    });
    sendMessage(insertEmbedAwaitJson);

  }


  var setContents = function (delta) {
    quill.setContents(delta);
  }

  var setText = function (text) {
    quill.setText(text);
  }

  var updateContents = function (delta) {
    quill.updateContents(delta);
  }

  var dangerouslyPasteHTML = function (index, html) {
    quill.clipboard.dangerouslyPasteHTML(index, html);
  }

  var setSelection = function (index, length = 0, source = 'api') {
    quill.setSelection(index, length, source);
  }

  var getBounds = function (key, index, length = 0) {
    var boundsData = quill.getBounds(index, length);
    var getBoundsJson = JSON.stringify({
      type: 'get-bounds',
      key: key,
      data: boundsData });
      sendMessage(getBoundsJson);
  }

  var getSelection = function (key, focus = false) {
    var getSelectionData = quill.getSelection(focus);
    var getSelectionJson = JSON.stringify({
      type: 'get-selection',
      key: key,
      data: getSelectionData 
    });
    sendMessage(getSelectionJson);
  }



  const getFormat = function (key, index, length) {
    const getFormatData = quill.getFormat(index, length);
    const getFormatJson = JSON.stringify({
      type: 'get-format',
      key: key,
      data: getFormatData
    });
    sendMessage(getFormatJson);
  }


  

  const getLeaf = function (key, index) {
    const [leaf, offset] = quill.getLeaf(index);
    const getLeafData = leaf ? {
      offset,
      text: leaf.text,
      length: leaf.text.length,
      index: quill.getIndex(leaf),
      attributes: getAttributes(leaf?.parent?.domNode)
    } : null
    const getLeafJson = JSON.stringify({
      type: 'get-leaf',
      key: key,
      data: getLeafData
    });
    sendMessage(getLeafJson);
  }

  const removeBlot = function (key, id) {

    var elem = document.getElementById(id);
    let blot = elem.__blot.blot;

    blot.remove();

    const removeJson = JSON.stringify({
      type: 'remove-blot',
      key: key
    });
    sendMessage(removeJson);
  }


  const removeFormat = function (key, index, length) {
    const removeFormatData = quill.removeFormat(index, length);
    const removeFormatJson = JSON.stringify({
      type: 'remove-format',
      key: key,
      data: removeFormatData
    });
    sendMessage(removeFormatJson);
  }

  const formatText = function (key, index, length, formats, source) {
    const formatTextData = quill.formatText(index, length, formats, source);
    const formatTextJson = JSON.stringify({
      type: 'format-text',
      key: key,
      data: formatTextData
    });
    sendMessage(formatTextJson);
  }


  const formatImageBlot = function (key, obj) {

    const { id, imgBlot } = obj;
    var elem = document.getElementById(id);
    var blot = elem.__blot.blot;

    for(let key in imgBlot){
      blot.format(key , imgBlot[key]);
    }
    
    // blot.format("vidRemotePath", vidRemotePath);
    // blot.format("imgRemotePath", imgRemotePath);
    // blot.format("vidLocalPath", null);
    // blot.format("imgLocalPath", null);
    // blot.format("src", imgRemotePath);
    // blot.format("imgBase64", null);

    const formatImageBlotJson = JSON.stringify({
      type: 'format-imageblot',
      key: key,
      id: id
    });
    sendMessage(formatImageBlotJson);

  }

  const formatCollageBlot = function (key, obj) {

    const {id, images} = obj;
    var elem = document.getElementById(id);
    var blot = elem.__blot.blot;
    
    blot.format("images", images);
    blot.format("isSaved", true);
    
    const formatCollageBlotJson = JSON.stringify({
      type: 'format-collageblot',
      key: key,
      id: id
    });
    sendMessage(formatCollageBlotJson);

  }


  const formatQuotationBlot = function (key, obj) {


    const {id, bumpTypeId, quotationId, quotationTypeId, quote, author, aboutAuthor, index, isBook, prompt, options, videoPoster, videoPosterShowOnEditor, videoUrl, command, mute, subTitle, autoplay} = obj;
    var elem = document.getElementById(id);

    if (elem) {
      // alert('editor_js:formatQuotationBlot: ' + obj.videoUrl);
      var blot = elem.__blot.blot;

      if (command === 'reset') {
      
        blot.format('reset', 
          {"id": id, 
          "bumpTypeId": bumpTypeId,
          "quotationId": quotationId,
          "quotationTypeId": quotationTypeId,
          "quote": quote, 
          "author": author, 
          "aboutAuthor": aboutAuthor, 
          "isBook": isBook, 
          "prompt": prompt,
          "options": options,
          "videoPoster": videoPoster,
          "videoPosterShowOnEditor": videoPosterShowOnEditor,
          "videoUrl": videoUrl,
          "mute": mute,
          "subTitle": subTitle,
          "autoplay": autoplay,
        });
        // blot.format("author", author);
      }
      else if (command === 'changeVideo') {
        
        blot.format('changeVideo', 
          {
            "id": id, 
            "videoUrl": obj.videoUrl
          });
      } else {
        blot.format(command, obj);
      }


    } else {

      // Insert new quotation blot
      var obj = {
        id: id ? id : "Bugs-1234",
        bumpTypeId: bumpTypeId,
        quotationId: quotationId,
        quotationTypeId: quotationTypeId,
        quote: quote,
        author: author,
        aboutAuthor: aboutAuthor,
        isBook: isBook,
        prompt: prompt,
        options: options,
        videoPoster: videoPoster,
        videoPosterShowOnEditor: videoPosterShowOnEditor,
        videoUrl: videoUrl,
        mute: mute,
        subTitle: subTitle,
        autoplay: autoplay
      }
      
      // quill.removeFormat(0, 0);

      // var elemHeaderSection = document.getElementById("HEADER_001");
      var insertIndex = index ? index : 0;
      // var insertIndex = {index: index ? index : 0}

      // alert('type of index: ' + typeof insertIndex);

      // if (elemHeaderSection) {
      //   insertIndex = 2;
      // }
      try {
      // quill.insertEmbed(0, 'image', 'https://www.baidu.com/img/flexible/logo/pc/result.png', 'api'); 
        quill.insertEmbed(insertIndex, "pbQuotation", obj, "user");


      // quill.insertEmbed(insertIndex, "caption", quote, "api");
      } catch (e) {
        // alert('error:' + e);
        // ignore error
      }

        
    }
    
    const quoteBlotJson = JSON.stringify({
      type: 'format-quotationblot',
      key: key,
      id: id,
      data: true
    });
    sendMessage(quoteBlotJson);

  }


  const formatOutlineBlot = function (key, obj) {


    const {id, title, index} = obj;
    var elem = document.getElementById(id);
    var data = false;
    if (elem) {

      var blot = elem.__blot.blot;
      blot.format('changeTitle', {"id": id, "title": title});
      data = true;

    } 
    
    const quoteBlotJson = JSON.stringify({
      type: 'format-outlineblot',
      key: key,
      id: id,
      data: data
    });
    sendMessage(quoteBlotJson);

  }

  const formatCheckboxBlot = function (key, obj) {


    const {id, command, value} = obj;
    if (command === 'create') {
      try {
        const options = value.options;
        for (let i = 0; i < options.length; i++) {
          const optionVal = options[i];
          quill.insertEmbed(value.index + i, 'pbCheckbox', {id: value.nodeId + i.toString(), text: optionVal, 'dataChecked': false}, 'api');
        }
      } catch (e) {
        // do nothing
        // alert('insertEmbedAwait' + e)
      }    
    }
    else {
      var elem = document.getElementById(id);
      var returnObj = null;
      if (elem) {

        var blot = elem.__blot.blot;
        returnObj = blot.format(command, {"value": value});
        
      } 
    }
    
    const checkboxJson = JSON.stringify({
      type: 'format-checkboxblot',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(checkboxJson);

  }


  const formatLinkBlot = function (key, obj) {


    const {id, command, value} = obj;
    if (command === 'update') {
      try {
        var elem = document.getElementById(id);
        var returnObj = null;
        if (elem) {

          var blot = elem.__blot.blot;
          returnObj = blot.format(command, value);
          
        } 
      } catch (e) {
        // do nothing
        // alert('insertEmbedAwait' + e)
      }    
    }
    
    
    const returnJson = JSON.stringify({
      type: 'format-linkblot',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(returnJson);

  }


  const formatTaskList = function (key, obj) {


    const {id, command, value} = obj;
    var elem = document.getElementById(id);
    var returnObj = null;
    if (elem) {

      var blot = elem.__blot.blot;
      returnObj = blot.format(command, {"value": value});
      

    } 

    // alert('editor_js:formatTaskList: ' + returnObj);
    
    const taskJson = JSON.stringify({
      type: 'format-tasklist',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(taskJson);

  }

  const formatErrandList = function (key, obj) {


    const {id, command, value} = obj;
    // alert('formatErrandList: ' + id + ', ' + command + ', ' + JSON.stringify(obj));
    var elem = document.getElementById(id);
    var returnObj = null;
    if (elem) {

      var blot = elem.__blot.blot;
      returnObj = blot.format(command, {"value": value});
      

    } 

    // alert('editor_js:formatTaskList: ' + returnObj);
    
    const taskJson = JSON.stringify({
      type: 'format-errandlist',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(taskJson);

  }
  
  const formatUserValueList = function (key, obj) {


    const {id, command, value} = obj;
    // alert('formatUserValueList obj: ' + id + ', ' + command + ', ' + JSON.stringify(obj));
    var elem = document.getElementById(id);
    var returnObj = null;
    // alert('formatUserValueList elemnt: ' + id + ', ' + command + ', ' + JSON.stringify(elem));

    if (elem) {
      // alert('called')

      var blot = elem.__blot.blot;
      returnObj = blot.format(command, {"value": value});
      

    } 

    // alert('editor_js:formatTaskList: ' + returnObj);
    
    const taskJson = JSON.stringify({
      type: 'format-userValuelist',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(taskJson);

  }

  const formatBaby = function (key, obj) {


    const {id, command, value} = obj;
    var elem = document.getElementById(id);
    var returnObj = null;
    if (elem) {

      var blot = elem.__blot.blot;
      returnObj = blot.format(command, {"value": value});
      

    } 
    
    const taskJson = JSON.stringify({
      type: 'format-baby',
      key: key,
      id: id,
      data: returnObj
    });
    sendMessage(taskJson);

  }


  var getRequest = function (event) {
    var msg = JSON.parse(event.data);
    // alert('getRequest ' + event.data );
    switch (msg.command) {
      case 'format':
        formatSelection(msg.name, msg.value);
        break;
      case 'focus':
        quill.focus();
        break;
      case 'blur':
        quill.blur();
        break;
      case 'enable':
        quill.enable(msg.value);
        break;
      case 'hasFocus':
        hasFocus(msg.key);
        break;
      case 'deleteText':
        quill.deleteText(msg.index, msg.length);
        break;
      case 'getDimensions':
        getDimensions(msg.key);
        break;
      case 'getIndex':
        getIndex(msg.key, msg.id);
        break;
      case 'getContents':
        getContents(msg.key, msg.index, msg.length);
        break;
      case 'getText':
        getText(msg.key, msg.index, msg.length);
        break;
      case 'getBounds':
        getBounds(msg.key, msg.index, msg.length);
        break;
      case 'getSelection':
        getSelection(msg.key, msg.focus);
        break;
      case 'getFormat': 
        getFormat(msg.key, msg?.index, msg?.length);
        break;
      case 'getLeaf':
        getLeaf(msg.key, msg.index);
        break;
      case 'setSelection':
        setSelection(msg.index, msg.length, msg.source);
        break;
      case 'getHtml':
        getHtml(msg.key);
        break;
      case 'getLength':
        getLength(msg.key);
        break;
      case 'insertEmbed':
        insertEmbed(msg.index, msg.type, msg.value, msg?.source);
        break;
      case 'insertEmbedAwait':
        insertEmbedAwait(msg.key, msg.index, msg.type, msg.value, msg?.source);
        break;
      case 'insertText':
        insertText(msg.index, msg.text, msg.formats);
        break;
      case 'insertTextAwait':
          insertTextAwait(msg.key, msg.index, msg.text, msg.value, msg?.source);
          break;
      case 'setContents':
        setContents(msg.delta);
        break;
      case 'setText':
        setText(msg.text);
        break;
      case 'updateContents':
        updateContents(msg.delta);
        break;
      case 'dangerouslyPasteHTML':
        dangerouslyPasteHTML(msg.index, msg.html);
        break;
      case 'removeBlot':
          removeBlot(msg.key, msg.id);
          break;
      case 'removeFormat':
        removeFormat(msg.key, msg.index, msg.length);
        break;
      case 'formatText':
        formatText(msg.key, msg.index, msg.length, msg.formats, msg.source);
        break;
      case 'formatImageBlot':
        formatImageBlot(msg.key, msg.obj);
        break;
      case 'formatCollageBlot':
          formatCollageBlot(msg.key, msg.obj);
          break;
      case 'formatQuotationBlot':
          // alert('getRequest ' + msg.command);
          formatQuotationBlot(msg.key, msg.obj);
          break;
      case 'formatOutlineBlot':
          formatOutlineBlot(msg.key, msg.obj);
          break;
      case 'formatCheckboxBlot':
          formatCheckboxBlot(msg.key, msg.obj);
            break;
      case 'formatLinkBlot':
          formatLinkBlot(msg.key, msg.obj);
            break;
      case 'formatTaskList':
            // alert('getRequest ' + msg.command);
            formatTaskList(msg.key, msg.obj);
            break;
      case 'formatErrandList':
        // alert('getRequest ' + msg.command);
        formatErrandList(msg.key, msg.obj);
        break;
      case 'formatUserValueList':
        // alert('getRequest ' + msg.command);
        formatUserValueList(msg.key, msg.obj);
        break;
      case 'formatBaby':
          // alert('getRequest ' + msg.command);
          formatBaby(msg.key, msg.obj);
          break;
      default:
        break;
    }
  };

  document.addEventListener("message", getRequest, false);
  window.addEventListener("message", getRequest, false);

  quill.on('editor-change', function(eventName, ...args) {
    if (eventName === 'text-change') {
      getSelectedFormats();
    } else if (eventName === 'selection-change') {
      var range = quill.getSelection();
      if (range) {
        getSelectedFormats();
      }
    }
    var getEditorChange = JSON.stringify({
      type: 'editor-change',
      data: { eventName, args }
    });
    sendMessage(getEditorChange);

    // Notify of dimensions update
    const getDimensionsJson = JSON.stringify({
      type: 'dimensions-change',
      data: {
        width: quill.root.scrollWidth,
        height: quill.root.scrollHeight
      }
    });
    sendMessage(getDimensionsJson);
  });

  quill.on('text-change', function(delta, oldDelta, source) {
    var getTextChange = JSON.stringify({
      type: 'text-change',
      data: { delta, oldDelta, source }
    });
    sendMessage(getTextChange);

    // Notify of HTML update
    var html = quill.root.innerHTML;
    var getHtmlJson = JSON.stringify({
      type: 'html-change',
      data: { html }
    });
    sendMessage(getHtmlJson);
  });

  quill.on('selection-change', function(range, oldRange, source) {
    var getSelectionChange = JSON.stringify({
      type: 'selection-change',
      data: { range, oldRange, source } });
      sendMessage(getSelectionChange)
  });

  quill.root.addEventListener('blur', function () {
    sendMessage(JSON.stringify({type: 'blur'}));
  });

  quill.root.addEventListener('focus', function () {
    sendMessage(JSON.stringify({type: 'focus'}));
  });



  // Report initial dimensions when the editor is instantiated
  setTimeout(() => {
    const getDimensionsJson = JSON.stringify({
      type: 'dimensions-change',
      data: {
        width: quill.root.scrollWidth,
        height: quill.root.scrollHeight
      }
    });
    sendMessage(getDimensionsJson);

    //Set the first line to be a header
    quill.focus();
    quill.setSelection(0);
    //quill.format('header', 1, 'api');
    sendMessage(JSON.stringify({type:'quillLoaded'}));


    
   
    
    

  }, 100)

})(document)




</script>
`;
