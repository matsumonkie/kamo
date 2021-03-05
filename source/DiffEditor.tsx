import React, { MutableRefObject, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Editor, { DiffEditor } from '@monaco-editor/react';
import * as CodeEditor from './CodeEditor';
import * as MDiffEditor from './DiffEditor';
import * as MEditor from './Editor';
import * as State from './State';
import * as Util from './Util';

type Model = {
  type: 'diff';
  id: number;
  content: string;
  codeEditorId: number;
  splitMode: boolean;
}

const mkModel = (id: number, codeEditorId: number, content: string): Model => ({
  type: 'diff',
  id,
  content,
  codeEditorId,
  splitMode: true
});

interface Update {
  update: (model: Model) => void
}

const getPreviousDiffEditors = (editors: MEditor.Editor[], origCodeEditorId: number, beforeId: number): Model[] => {
  const [_, res] = editors.reduce(([isBeforeEditor, res], editor) => {
    if (isBeforeEditor && editor.id != beforeId) {
      if (MEditor.isDiffEditor(editor) && editor.codeEditorId == origCodeEditorId) {
        return [true, res.concat(editor)]
      } else {
        return [true, res];
      }
    } else {
      return [false, res];
    }
  }, [true, []])

  return res;
}

const findLatestDiffEditor = (editors: MEditor.Editor[], origCodeEditorId: number, beforeId: number): Model => {
  const previousDiffEditors = getPreviousDiffEditors(editors, origCodeEditorId, beforeId)
  return previousDiffEditors[previousDiffEditors.length - 1];
}

type PreviousEditor =
  | CodeEditor.Model
  | MDiffEditor.Model

const App = ({ update, editors, state, previousCodeEditors, ...model }:
  Update & { editors: MEditor.Editor[] } & { state: State.Model } & { previousCodeEditors: CodeEditor.Model[] } & Model): JSX.Element => {
  const [currentHeight, setHeight] = useState(100);

  const origCodeEditor: CodeEditor.Model = editors.find(editor => editor.id == model.codeEditorId) as CodeEditor.Model;
  const previousDiffEditor: MDiffEditor.Model = findLatestDiffEditor(editors, model.codeEditorId, model.id);
  const previousEditor: PreviousEditor = previousDiffEditor ? previousDiffEditor : origCodeEditor;

  const monacoEditorRef: MutableRefObject<monaco.editor.IStandaloneCodeEditor> = useRef(null);
  const monacoDiffEditorRef: MutableRefObject<monaco.editor.IStandaloneDiffEditor> = useRef(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    monacoEditorRef.current = editor;
    const height = { minHeight: 100, maxHeight: 500 }
    editor.onDidContentSizeChange(() => Util.updateEditorHeight(height, editor));
    Util.updateEditorHeight(height, editor);
  }

  function handleDiffEditorDidMount(editor: monaco.editor.IStandaloneDiffEditor) {
    monacoDiffEditorRef.current = editor;
    const origHeight: number = monacoDiffEditorRef.current.getOriginalEditor().getContentHeight();
    const modHeight: number = monacoDiffEditorRef.current.getModifiedEditor().getContentHeight();
    const newHeight: number = Math.max(origHeight, modHeight);
    setHeight(newHeight);
  }

  const handleEditorChange = (value) => {
    const newModel: Model = {
      ...model,
      content: value,
    };
    update(newModel);
  };

  const onChangeFile = (event) => {
    const newModel: Model = {
      ...model,
      codeEditorId: event.target.value
    };
    update(newModel);
  };

  const toggleSplitMode = (): void => {
    const newModel: Model = {
      ...model,
      splitMode: !model.splitMode,
    };
    update(newModel);
  };

  const selectFileView = (): JSX.Element => {
    const options: JSX.Element[] = previousCodeEditors.map((codeEditor) => (
      <option key={codeEditor.id} value={codeEditor.id}>
        {codeEditor.filename}
      </option>
    ));

    return (
      <div className="row">
        <select onChange={onChangeFile} value={model.codeEditorId}>{options}</select>
        <label>{' '}Split view:<input type="checkbox" defaultChecked={model.splitMode} onChange={toggleSplitMode} /></label>
      </div>
    );
  };

  const editModeView = (): JSX.Element => {
    return (
      <>
        <h1>{model.id}</h1>
        <div className="col">
          {selectFileView()}
          <div className="row">
            <Editor
              defaultLanguage="javascript"
              language={origCodeEditor.language}
              defaultValue={model.content}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={
                {
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  scrollBeyondLastColumn: 1
                }
              }
            />

            {showModeView()}
          </div>
        </div>
      </>
    );
  }

  const showModeView = (): JSX.Element => {
    const height = Math.min(currentHeight, 700);

    return (
      <div className="col">
        <section>{origCodeEditor.filename}</section>
        <DiffEditor
          className="diff-editor"
          height={height}
          original={previousEditor.content}
          modified={model.content}
          language={origCodeEditor.language}
          onMount={handleDiffEditorDidMount}
          options={
            {
              renderSideBySide: model.splitMode,
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              scrollBeyondLastColumn: 1
            }
          }
        />
      </div>
    );
  }

  const view = () => {
    let editorView: JSX.Element;
    if (state.type == "show") {
      editorView = showModeView();
    } else {
      editorView = editModeView();
    }

    return (
      <div className="diff-editor-container">
        {editorView}
      </div>
    )
  }

  return view();
};

export {
  App, Model, Update, mkModel,
};
