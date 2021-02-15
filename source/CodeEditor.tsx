import React from 'react';
import Editor from '@monaco-editor/react';
import * as State from './State';

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
      <h1>{model.id}</h1>
      {codeEditorNavBar()}

      <Editor
        height="10vh"
        defaultLanguage="javascript"
        language={model.language}
        defaultValue={model.content}
        onChange={handleEditorChange}
        options={{ minimap: { enabled: false } }}
      />
    </>
  );

  return view();
};

export {
  App, Model, Update, mkModel,
};

