import React from 'react';
import Editor from '@monaco-editor/react';
import * as MarkdownPreview from './MarkdownPreview';

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

const App = ({ update, ...model }: Model & Update): JSX.Element => {
  const handleEditorChange = (value) => {
    const newModel: Model = {
      ...model,
      content: value,
    };
    update(newModel);
  };

  const view = () => (
    <>
      <div className="text-editor-container">
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
        <MarkdownPreview.App {...model} />
      </div>
    </>
  );

  return view();
};

export {
  App, Model, Update, mkModel,
};
