export type EditorEventType =
  | 'format-change'
  | 'selection-change'
  | 'text-change'
  | 'editor-change'
  | 'html-change'
  | 'dimensions-change'
  | 'blur'
  | 'playVideo'
  | 'attachLoc'
  | 'attachQuote'
  | 'replaceBlot'
  | 'formatRemoteSource'
  | 'quillLoaded'
  | 'processBase64'
  | 'focus';

export interface SelectionChangeData {
  range: { index: number; length: number } | null;
  oldRange: { index: number; length: number } | null;
  source: string;
}

export interface TextChangeData {
  delta: any;
  oldDelta: any;
  source: string;
  html: string;
}

export interface ThumbnailPressData {
  eventName: string;
  args: Array<any>;
}

export interface AttachLocPressData {
  eventName: string;
  args: Array<any>;
}

export interface AttachQuotePressData {
  eventName: string;
  args: Array<any>;
}

export interface ProcessBase64PressData {
  eventName: string;
  args: Array<any>;
}

export interface ReplaceBlotData {
  eventName: string;
  args: Array<any>;
}

export interface HtmlChangeData {
  html: string;
}

export interface EditorChangeData {
  eventName: string;
  args: Array<any>;
}

export interface FormatChangeData {
  formats: any;
}

export interface DimensionsChangeData {
  width: number;
  height: number;
}

export interface FormatRemoteSourceChangeData {
  id: string;
}

export type EditorChangeHandler = (data: EditorChangeData) => void;
export type TextChangeHandler = (data: TextChangeData) => void;
export type SelectionChangeHandler = (data: SelectionChangeData) => void;
export type FormatChangeHandler = (data: FormatChangeData) => void;
export type HtmlChangeHandler = (data: HtmlChangeData) => void;
export type DimensionsChangeHandler = (data: DimensionsChangeData) => void;
export type FormatRemoteSourceChangeHandler = (data: FormatRemoteSourceChangeData) => void;

export type EditorEventHandler =
  | EditorChangeHandler
  | TextChangeHandler
  | SelectionChangeHandler
  | FormatChangeHandler
  | HtmlChangeHandler
  | DimensionsChangeHandler
  | FormatRemoteSourceChangeHandler;

export type Range = { index: number; length: number };
