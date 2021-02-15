import React from 'react';

import * as CodeEditor from './CodeEditor';
import * as TextEditor from './TextEditor';
import * as DiffEditor from './DiffEditor';

type Model =
  | TextEditor.Model
  | CodeEditor.Model
  | DiffEditor.Model;

const isTextEditor = (editor: Model): editor is TextEditor.Model => editor.type === 'text';

interface Delete {
  del: (id: number) => void
}

interface Update {
  update: (model: Model) => void
}

interface Delete {
  del: (id: number) => void
}

interface AddCodeEditor {
  addCodeEditor: (id: number) => void
}

interface AddDiffEditor {
  addDiffEditor: (id: number, lastCodeEditor: CodeEditor.Model | DiffEditor.Model) => void
}

interface AddTextEditor {
  addTextEditor: (id: number) => void
}

const App = ({
  update, del, addCodeEditor, addDiffEditor, addTextEditor, editors, state, ...model
}:
  { editors: Model[], state: any } & Model & Delete & Update & AddDiffEditor & AddCodeEditor & AddTextEditor)
  : JSX.Element => {
  const updateCodeEditor: CodeEditor.Update = {
    update: (newEditor: CodeEditor.Model): void => {
      update(newEditor);
    },
  };

  const updateDiffEditor: DiffEditor.Update = {
    update: (newEditor: DiffEditor.Model): void => {
      update(newEditor);
    },
  };

  const updateTextEditor: TextEditor.Update = {
    update: (newEditor: TextEditor.Model): void => {
      update(newEditor);
    },
  };

  const onDeleteEditor = (): void => {
    del(model.id);
  };

  const editorView = (): JSX.Element => {
    switch (model.type) {
      case 'code':
        return <CodeEditor.App {...model} {...updateCodeEditor} />;

      case 'text':
        return <TextEditor.App {...model} {...updateTextEditor} />;

      case 'diff':
        return <DiffEditor.App {...model} editors={editors} {...updateDiffEditor} />;
    }
  };

  const editCodeView = (): JSX.Element => {
    const codeEditors = editors.filter((editor) => editor.type === 'code' || editor.type === 'diff') as CodeEditor.Model[];

    if (codeEditors.length > 0) {
      const lastCodeEditor = codeEditors[codeEditors.length - 1];
      return (<button onClick={() => addDiffEditor(model.id, lastCodeEditor)}>Edit code</button>);
    }
    return undefined;
  };

  const view = (): JSX.Element => (
    <>
      {editorView()}
      <div className="row">
        <button onClick={onDeleteEditor}> XX</button>
        <button onClick={() => addCodeEditor(model.id)}>Write code</button>
        {editCodeView()}
        <button onClick={() => addTextEditor(model.id)}>Write Markdown</button>
      </div>
    </>
  );

  return view();
};

export {
  App, Model, Delete, Update, AddTextEditor, AddCodeEditor, AddDiffEditor, isTextEditor
};
