import React from 'react';
import Editor from '@monaco-editor/react';
import * as MarkdownPreview from './MarkdownPreview';
import * as State from './State';

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
        <Editor
          height="10vh"
          defaultLanguage="markdown"
          defaultValue={model.content}
          onChange={handleEditorChange}
          options={
            {
              minimap: { enabled: false },
            }
          }
        />
      )
    }
  }
  const view = () => (
    <>
      <div className="text-editor-container">
        {editView()}
        <MarkdownPreview.App {...model} />
      </div>
    </>
  );

  return view();
};

export {
  App, Model, Update, mkModel,
};
