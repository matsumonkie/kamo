import React, { useState } from 'react';

import * as CodeEditor from './CodeEditor';
import * as TextEditor from './TextEditor';
import * as DiffEditor from './DiffEditor';
import * as State from './State';

type Editor =
  | TextEditor.Model
  | CodeEditor.Model
  | DiffEditor.Model;

type Model = Editor & { state: State.Model }

const isTextEditor = (editor: Editor): editor is TextEditor.Model => editor.type === 'text';

interface Delete {
  del: (id: number) => void
}

interface Update {
  update: (editor: Editor) => void
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
  update, del, addCodeEditor, addDiffEditor, addTextEditor, editors, ...model
}: { editors: Editor[] } & Model & Delete & Update & AddDiffEditor & AddCodeEditor & AddTextEditor)
  : JSX.Element => {
  const [isHover, setHover] = useState(false);

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

  const mouseEntered = (): void => {
    setHover(true);
  }

  const mouseLeft = (): void => {
    setHover(false);
  }

  const toolBarView = (): JSX.Element => {
    if (model.state.type != "show" && isHover) {
      return (
        <div className="row editor-container-toolbar">
          <button onClick={onDeleteEditor}> delete block</button>
          <button onClick={() => addCodeEditor(model.id)}>Write block of code</button>
          {editCodeView()}
          <button onClick={() => addTextEditor(model.id)}>Write block of Markdown</button>
        </div>
      )
    } else {
      return <div className="editor-container-toolbar" />
    }

  }

  const view = (): JSX.Element => (
    <div onMouseEnter={mouseEntered} onMouseLeave={mouseLeft}>
      {editorView()}
      {toolBarView()}
    </div>
  );

  return view();
};

export {
  App, Editor, Model, Delete, Update, AddTextEditor, AddCodeEditor, AddDiffEditor, isTextEditor
};
