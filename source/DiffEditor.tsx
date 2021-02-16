import React from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import * as CodeEditor from './CodeEditor';
import * as MEditor from './Editor';
import * as State from './State';

type Model = {
  type: 'diff';
  id: number;
  content: string;
  previousEditorId: number;
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
  const findLatestDiffEditorId = (origCodeEditorId: number): number => editors.reduce((acc, editor) => {
    if (isDiffEditor(editor) && editor.previousEditorId == acc && editor.previousEditorId != origCodeEditorId) {
      return editor.id;
    }
    return acc;
  }, origCodeEditorId);

  return editors.reduce((acc, editor) => {
    if (isCodeEditor(editor)) {
      const diffableEditor = {
        codeEditor: editor,
        latestDiffEditorId: findLatestDiffEditorId(editor.id),
      };

      return acc.concat([diffableEditor]);
    }
    return acc;
  }, []);
};

const App = ({ update, editors, state, ...model }: { state: State.Model } & { editors: MEditor.Editor[] } & Model & Update): JSX.Element => {
  const origCodeEditor: CodeEditor.Model = findOrigCodeEditor(model.previousEditorId, editors);
  const previousEditor = editors.find((editor) => editor.id == model.previousEditorId) as CodeEditor.Model | Model;
  const diffableEditors: DiffableEditor[] = getDiffableEditors(editors);

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

  const selectFileView = (): JSX.Element => {
    const options: JSX.Element[] = diffableEditors.map((diffableEditor) => (
      <option
        key={diffableEditor.latestDiffEditorId}
        value={diffableEditor.codeEditor.id}
      >
        {`${diffableEditor.codeEditor.filename} ${diffableEditor.codeEditor.id}`}
      </option>
    ));

    if (diffableEditors.length === 0) {
      console.error('Wuuut?! You tried to open a diff editor without any code to diff against... This should never happen...');
      return null;
    }
    return (
      <>
        <select onChange={onChangeFile} value={model.previousEditorId}>{options}</select>
      </>
    );
  };

  const showModeView = (): JSX.Element => {
    return (
      <>
        <DiffEditor
          height="10vh"
          original={previousEditor.content}
          modified={model.content}
          language={origCodeEditor.language}
          options={
            {
              readOnly: true,
              minimap: { enabled: false },
            }
          }
        />
      </>
    );
  }

  const editModeView = (): JSX.Element => {
    return (
      <>
        {selectFileView()}
        <h1>{model.id}</h1>
        <div className="row">
          <Editor
            height="10vh"
            defaultLanguage="javascript"
            language={origCodeEditor.language}
            defaultValue={previousEditor.content}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false } }}
          />

          <DiffEditor
            height="10vh"
            original={previousEditor.content}
            modified={model.content}
            language={origCodeEditor.language}
            options={
              {
                readOnly: true,
                minimap: { enabled: true },
              }
            }
          />
        </div>
      </>
    );
  }

  const view = () => {
    if (state.type == "show") {
      return showModeView();
    } else {
      return editModeView();
    }
  }

  return view();
};

export {
  App, Model, Update, mkModel,
};
