import React, { MutableRefObject, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Editor, { DiffEditor } from '@monaco-editor/react';
import * as CodeEditor from './CodeEditor';
import * as MEditor from './Editor';
import * as State from './State';
import * as Util from './Util';

type Model = {
  type: 'diff';
  id: number;
  content: string;
  previousEditorId: number;
  splitMode: boolean;
}

type DiffableEditor =
  {
    codeEditor: CodeEditor.Model,
    latestDiffEditorId?: number
  }

const mkModel = (id: number, previousEditorId: number, content: string): Model => ({
  type: 'diff',
  id,
  content,
  previousEditorId,
  splitMode: true
});

interface Update {
  update: (model: Model) => void
}

const isCodeEditor = (editor: MEditor.Editor): editor is CodeEditor.Model => editor.type === 'code';

const isDiffEditor = (editor: MEditor.Editor): editor is Model => editor.type === 'diff';

const findOrigCodeEditor = (previousEditorId: number, editors: MEditor.Editor[]): CodeEditor.Model => {
  const previousEditor = editors.find((editor) => editor.id == previousEditorId) as CodeEditor.Model | Model;
  if (isDiffEditor(previousEditor)) {
    return findOrigCodeEditor(previousEditor.previousEditorId, editors);
  }
  return previousEditor as CodeEditor.Model;
};

const getDiffableEditors = (editors: MEditor.Editor[]): DiffableEditor[] => {

  const findLatestDiffEditor = (origCodeEditorId: number): Model => {
    const [lastId, mDiffEditor] = editors.reduce(([lastId, mDiffEditor], editor) => {
      if (isDiffEditor(editor) && editor.previousEditorId == lastId) {
        return [editor.id, editor];
      }
      return [lastId, mDiffEditor];
    }, [origCodeEditorId, undefined]);

    return mDiffEditor;
  }

  return editors.reduce((acc, editor) => {
    if (isCodeEditor(editor)) {

      const latestDiffEditor = findLatestDiffEditor(editor.id);
      let latestDiffEditorId: number = undefined
      if (latestDiffEditor && latestDiffEditor.previousEditorId != editor.id) {
        latestDiffEditorId = latestDiffEditor.id;
      }

      const diffableEditor = {
        codeEditor: editor,
        latestDiffEditorId: latestDiffEditorId,
      };

      return acc.concat([diffableEditor]);
    }
    return acc;
  }, []);
};

const App = ({ update, editors, state, ...model }: { state: State.Model } & { editors: MEditor.Editor[] } & Model & Update): JSX.Element => {
  const [currentHeight, setHeight] = useState(100);
  const origCodeEditor: CodeEditor.Model = findOrigCodeEditor(model.previousEditorId, editors);
  const previousEditor = editors.find((editor) => editor.id == model.previousEditorId) as CodeEditor.Model | Model;
  const diffableEditors: DiffableEditor[] = getDiffableEditors(editors);

  const editorRef: MutableRefObject<monaco.editor.IStandaloneCodeEditor> = useRef(null);
  const diffEditorRef: MutableRefObject<monaco.editor.IStandaloneDiffEditor> = useRef(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    const height = { minHeight: 100, maxHeight: 500 }
    editor.onDidContentSizeChange(() => Util.updateEditorHeight(height, editor));
    Util.updateEditorHeight(height, editor);
  }

  function handleDiffEditorDidMount(editor: monaco.editor.IStandaloneDiffEditor) {
    diffEditorRef.current = editor;
    const origHeight: number = diffEditorRef.current.getOriginalEditor().getContentHeight();
    const modHeight: number = diffEditorRef.current.getModifiedEditor().getContentHeight();
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
      previousEditorId: event.target.value,
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
    const options: JSX.Element[] = diffableEditors.map((diffableEditor) => (
      <option
        key={diffableEditor.latestDiffEditorId}
        value={diffableEditor.codeEditor.id}
      >
        {diffableEditor.codeEditor.filename}
      </option>
    ));

    return (
      <div className="row">
        <select onChange={onChangeFile} value={origCodeEditor.id}>{options}</select>
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
