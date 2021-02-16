import React, { useRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Editor from '@monaco-editor/react';
import * as State from './State';
import * as Util from './Util';

type Model = {
  type: 'code';
  id: number;
  filename: string;
  language: string;
  content: string;
}

const mkModel = (id: number): Model => ({
  type: 'code',
  id,
  filename: 'index.js',
  language: 'javascript',
  content: '// some code',
});

interface Update {
  update: (model: Model) => void
}

const App = ({ update, state, ...model }: { state: State.Model } & Model & Update): JSX.Element => {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    const height = { minHeight: 100, maxHeight: 500 }
    editor.onDidContentSizeChange(() => Util.updateEditorHeight(height, editor));
    Util.updateEditorHeight(height, editor);
  }

  const updateFilename = (event): void => {
    const newModel: Model = {
      ...model,
      filename: event.target.value,
    };
    update(newModel);
  };

  const updateLanguage = (event): void => {
    const newModel: Model = {
      ...model,
      language: event.target.value,
    };
    update(newModel);
  };

  const handleEditorChange = (value) => {
    const newModel: Model = {
      ...model,
      content: value,
    };
    update(newModel);
  };

  const codeEditorNavBar = (): JSX.Element => {
    if (state.type == "show") {
      return undefined;
    } else {
      return (
        <div className="row">
          <label>
            {' '}
      File name:
      <input type="text" value={model.filename} onChange={updateFilename} />
          </label>
          <label>
            {' '}
      Language:
      <input type="text" value={model.language} onChange={updateLanguage} />
          </label>
        </div>
      );
    }
  }

  const view = () => (
    <>
      <div className="code-editor-container">
        {codeEditorNavBar()}
        <Editor
          className="code-editor"
          defaultLanguage="javascript"
          language={model.language}
          defaultValue={model.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={
            {
              minimap: { enabled: false },
              scrollBeyondLastLine: false
            }
          }
        />
      </div>
    </>
  );

  return view();
};

export {
  App, Model, Update, mkModel,
};

