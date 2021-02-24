import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import * as MarkdownPreview from './MarkdownPreview';
import * as State from './State';
import * as Util from './Util';
import classNames from "classnames";

type Model = {
  type: 'text';
  id: number;
  content: string;
}

const mkModel = (id: number): Model => ({
  type: 'text',
  id,
  content: '# title',
});

interface Update {
  update: (model: Model) => void
}

const App = ({ update, state, ...model }: { state: State.Model } & Model & Update): JSX.Element => {
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    const height = { minHeight: 100, maxHeight: 1000 }
    editor.onDidContentSizeChange(() => Util.updateEditorHeight(height, editor));
    Util.updateEditorHeight(height, editor);
  }

  const handleEditorChange = (value) => {
    const newModel: Model = {
      ...model,
      content: value,
    };
    update(newModel);
  };

  const editView = (): JSX.Element => {
    if (state.type == "show") {
      return undefined;
    } else {
      return (
        <div className="text-editor">
          <Editor
            defaultLanguage="markdown"
            defaultValue={model.content}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={
              {
                minimap: { enabled: false },
                scrollBeyondLastLine: false

              }
            }
          />
        </div>
      )
    }
  }

  const preview = (): JSX.Element => {
    if (state.type == "show") {
      return (
        <div className={classNames({
          'text-preview': true,
          'show-mode': true
        })}>
          <MarkdownPreview.App {...model} />
        </div>
      );
    } else {
      return undefined;
    }
  }

  const view = () => (
    <>
      <div className="text-editor-container">
        {editView()}
        {preview()}
      </div>
    </>
  );

  return view();
};

export {
  App, Model, Update, mkModel,
};
