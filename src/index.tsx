import QuillEditor from './editor/quill-editor';
import { QuillToolbar } from './toolbar/quill-toolbar';
import type {
  EditorEventHandler,
  SelectionChangeData,
  EditorChangeData,
  TextChangeData,
  FormatChangeData,
  HtmlChangeData,
  DimensionsChangeData,
} from './constants/editor-event';
export default QuillEditor;
export { QuillToolbar };
export type {
  EditorEventHandler,
  SelectionChangeData,
  EditorChangeData,
  TextChangeData,
  FormatChangeData,
  HtmlChangeData,
  DimensionsChangeData,
};
