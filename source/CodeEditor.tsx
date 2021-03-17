import React, { useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Editor from '@monaco-editor/react';
import * as State from './State';

type Model = {
  type: 'code';
  id: number;
  filename: string;
  language: string;
  content: string;
  visible: boolean;
}

const mkModel = (id: number): Model => ({
  type: 'code',
  id,
  filename: 'index.js',
  language: 'javascript',
  content: '// some code',
  visible: true,
});

interface Update {
  update: (model: Model) => void
}

const App = ({ update, state, ...model }: { state: State.Model } & Model & Update): JSX.Element => {
  const [currentHeight, setHeight] = useState(100);

  const editorRef = useRef(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    const minHeight = 100;
    const maxHeight = 500;
    const newHeight = Math.max(minHeight, Math.min(maxHeight, editor.getContentHeight()));
    setHeight(newHeight);
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

  const toggleVisibility = (): void => {
    const newModel: Model = {
      ...model,
      visible: !model.visible,
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
          <label>{' '}File name:<input type="text" value={model.filename} onChange={updateFilename} /></label>
          <label>{' '}Language: <input type="text" value={model.language} onChange={updateLanguage} /></label>
          <label>{' '}Visible:<input type="checkbox" defaultChecked={model.visible} onChange={toggleVisibility} /></label>
        </div>
      );
    }
  }

  const codeEditorView = (): JSX.Element => {
    const height = Math.min(currentHeight, 700);

    if (state.type == "show") {
      if (model.visible) {
        return (
          <>
            <section>{model.filename}</section>
            <Editor
              height={height}
              className="code-editor"
              language={model.language}
              defaultValue={model.content}
              onMount={handleEditorDidMount}
              options={
                {
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }
              }
            />
          </>
        );
      }
      else {
        return undefined;
      }
    } else {
      return (
        <>
          <Editor
            height={height}
            className="code-editor"
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
        </>
      );
    }
  }

  const view = () => (
    <>
      <div className="code-editor-container">
        {codeEditorNavBar()}
        {codeEditorView()}
      </div>
    </>
  );

  return view();
};

export {
  App, Model, Update, mkModel,
};

