import type { CustomFont } from 'src/types';
import {
  create_quill,
  editor_css,
  editor_js,
  quill_bubble_css,
  quill_snow_css,
  quill_js,
} from '../constants/editor';

import {long_press_event_js} from './long-press-event';

export const getFontName = (font: string) => {
  return font.toLowerCase().replace(/\s/g, '-');
};

interface CreateHtmlArgs {
  initialHtml?: string;
  placeholder: string;
  toolbar: string;
  clipboard?: string;
  keyboard?: string;
  libraries: 'local' | 'cdn';
  theme: 'snow' | 'bubble';
  editorId: string;
  autoSize?: boolean;
  containerId: string;
  color: string;
  backgroundColor: string;
  placeholderColor: string;
  customStyles: string[];
  fonts: Array<CustomFont>;
  defaultFontFamily?: string;
  customJS?: string;
  customJSwithquill?: string;
  // imageDropAndPaste?: string;
}

const Inital_Args = {
  initialHtml: '',
  placeholder: 'write here',
  toolbar: 'false',
  clipboard: '',
  keyboard: '',
  // imageDropAndPaste: '',
  libraries: 'local',
  theme: 'snow',
  editorId: 'editor-container',
  autoSize: false,
  containerId: 'standalone-container',
  color: 'black',
  backgroundColor: 'rgba(255,255,255,0)',
  placeholderColor: 'rgba(0,0,0,0.6)',
  customStyles: [],
  fonts: [],
  customJS: '',
  customJSwithquill: '',
} as CreateHtmlArgs;

export const createHtml = (args: CreateHtmlArgs = Inital_Args) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, user-scalable=1.0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
  ${
    args.theme === 'bubble'
      ? quill_bubble_css(args.libraries === 'cdn')
      : quill_snow_css(args.libraries === 'cdn')
  }
  ${editor_css(
    args.editorId,
    args.containerId,
    !!args.autoSize,
    args.color,
    args.backgroundColor,
    args.placeholderColor,
    args.fonts,
    args.defaultFontFamily
  )}
  ${
    args.customStyles &&
    args.customStyles
      .map((style) => {
        //const styleTag = style.includes(".ql-container {color:") ? '<style>' : '<style id="fontcolor">';
        return style.toLocaleLowerCase().trim().startsWith('<style>')
          ? style
          : `<style>${style}</style>`;
      })
      .join('\n')
  }

  </head>
  <body>
  <div id="${args.containerId}">
    <div id="${args.editorId}">
      
    </div>
  </div>
  ${quill_js(args.libraries === 'cdn')}
  ${long_press_event_js()}
  ${create_quill({
    id: args.editorId,
    toolbar: args.toolbar,
    clipboard: args.clipboard ? args.clipboard : '',
    keyboard: args.keyboard ? args.keyboard : '',
    placeholder: args.placeholder,
    // imageDropAndPaste: args.imageDropAndPaste ? args.imageDropAndPaste : '',
    theme: args.theme,
    customFonts: args.fonts.map((f) => getFontName(f.name)),
    customJS: args.customJS ? args.customJS : '',
    customJSwithquill: args.customJSwithquill ? args.customJSwithquill : '',
  })}
  ${editor_js}
  </body>
  </html>
  `;
};
