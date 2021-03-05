import React, { useState } from 'react';

import * as CodeEditor from './CodeEditor';
import * as TextEditor from './TextEditor';
import * as DiffEditor from './DiffEditor';
import * as State from './State';
import Editor from '@monaco-editor/react';

type Editor =
  | TextEditor.Model
  | CodeEditor.Model
  | DiffEditor.Model;

type Model = Editor & { state: State.Model }

const isCodeEditor = (editor: Editor): editor is CodeEditor.Model => editor.type === 'code';
const isTextEditor = (editor: Editor): editor is TextEditor.Model => editor.type === 'text';
const isDiffEditor = (editor: Editor): editor is DiffEditor.Model => editor.type === 'diff';

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
  addDiffEditor: (id: number) => void
}

interface AddTextEditor {
  addTextEditor: (id: number) => void
}

const App = ({
  update, del, addCodeEditor, addDiffEditor, addTextEditor, editors, ...model
}: { editors: Editor[] } & Model & Delete & Update & AddDiffEditor & AddCodeEditor & AddTextEditor)
  : JSX.Element => {
  const [isHover, setHover] = useState(false);

  const getPreviousCodeEditors = (): CodeEditor.Model[] => {
    const [_, res] = editors.reduce(([isBeforeEditor, res], editor) => {
      if (isBeforeEditor && editor.id != model.id) {
        if (isCodeEditor(editor)) {
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
        return <DiffEditor.App {...model} editors={editors} {...updateDiffEditor} previousCodeEditors={getPreviousCodeEditors()} />;
    }
  };

  const editCodeView = (): JSX.Element => {
    return (<button onClick={() => addDiffEditor(model.id)}>Edit code</button>);
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
  App, Editor, Model, Delete, Update, AddTextEditor, AddCodeEditor, AddDiffEditor, isTextEditor, isDiffEditor, isCodeEditor
};
