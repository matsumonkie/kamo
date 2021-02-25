import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

type heightSize = { minHeight: number, maxHeight: number }

const updateEditorHeight = ({ minHeight, maxHeight }: heightSize, editor: monaco.editor.IStandaloneCodeEditor) => {
  const contentHeight = Math.max(minHeight, Math.min(maxHeight, editor.getContentHeight()));
  editor.layout({
    width: editor.getLayoutInfo().width,
    height: contentHeight
  });
};

const updateDiffEditorHeight = (width: number, { minHeight, maxHeight }: heightSize, editor: monaco.editor.IStandaloneDiffEditor) => {
  const origHeight = editor.getOriginalEditor().getContentHeight()
  const modHeight = editor.getModifiedEditor().getContentHeight()
  const contentHeight = Math.max(minHeight, Math.min(maxHeight, Math.max(origHeight, modHeight)));
  editor.layout({
    width: width,
    height: contentHeight
  });
};

export { updateEditorHeight, updateDiffEditorHeight }
