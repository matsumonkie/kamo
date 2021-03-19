import React, { useState } from 'react';
import * as Editor from './Editor';
import * as CodeEditor from './CodeEditor';
import * as TextEditor from './TextEditor';
import * as DiffEditor from './DiffEditor';
import * as State from './State';
import classNames from "classnames";

interface Model {
  editors: Editor.Editor[],
  state: State.Model
}

const mkId = (): number => Math.floor(Math.random() * Math.floor(100000));

const defaultModel = (): Model => {
  return {
    editors: [TextEditor.mkModel(mkId())],
    state: { type: "new" }
  }
};

const getModelForPostId = (postId: number, isShowMode: boolean): Promise<Model> => {

  return fetch(`/post/${postId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => response.json())
    .then((json) => {
      const { published, ...modelWithoutState } = json

      if (isShowMode) {
        return {
          ...modelWithoutState,
          state: {
            type: "show",
            id: postId
          }
        }
      } else {
        return {
          ...modelWithoutState,
          state: {
            type: "edit",
            id: postId,
            published
          }
        }
      }
    });
}

const removeEditorAndItsChildren = (editors: Editor.Editor[], id: number): Editor.Model[] => editors.reduce((acc, editor) => {
  if (editor.id == id) {
    return acc;
  } if (Editor.isDiffEditor(editor) && editor.codeEditorId == id) {
    return {
      editors: acc.editors,
      idToDelete: editor.id,
    };
  }
  return {
    editors: acc.editors.concat([editor]),
    idToDelete: editor.id,
  };
}, {
  editors: [],
  idToDelete: id,
}).editors;

const App = (m: Model): JSX.Element => {
  const [model, setModel] = useState(m);

  const del = (id) => {
    const editors: Editor.Editor[] = removeEditorAndItsChildren(model.editors, id);
    const newEditors: Editor.Editor[] = (editors.length === 0) ? defaultModel().editors : editors;

    setModel({
      ...model,
      editors: newEditors,
    });
  };

  const insertAfterEditorId = (previousEditorId: number, editors: Editor.Editor[], newEditor: Editor.Editor): Editor.Model[] => editors.reduce((acc, editor) => {
    if (editor.id == previousEditorId) {
      acc.push(editor, newEditor);
      return acc;
    }
    acc.push(editor);
    return acc;
  }, []);

  const addCodeEditor = (previousEditorId: number): void => {
    const newEditor: CodeEditor.Model = CodeEditor.mkModel(mkId());
    setModel({
      ...model,
      editors: insertAfterEditorId(previousEditorId, model.editors, newEditor),
    });
  };

  const addTextEditor = (previousEditorId: number): void => {
    const newEditor: TextEditor.Model = TextEditor.mkModel(mkId());
    setModel({
      ...model,
      editors: insertAfterEditorId(previousEditorId, model.editors, newEditor),
    });
  };

  const addDiffEditor = (previousEditorId: number): void => {
    const editors = (model.editors.filter((editor) => editor.type === 'code'));
    const editor = editors[editors.length - 1]

    const newEditor: DiffEditor.Model = DiffEditor.mkModel(mkId(), editor.id, editor.content);
    setModel({
      ...model,
      editors: insertAfterEditorId(previousEditorId, model.editors, newEditor),
    });
  };

  const save = (postId: number): Promise<any> => {
    const { state, ...payload } = model;

    return fetch(`/post/${postId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  }

  const publish = (state: State.Edit): void => {
    save(state.id).then(() => {
      fetch(`/post/${state.id}/publish`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          const newState = {
            ...state
            , published: state.published = true
          }
          if (response.ok) {
            setModel({
              ...model,
              ...newState
            })
          }
        })
    })
  }

  const unpublish = (state: State.Edit): void => {
    fetch(`/post/${state.id}/unpublish`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        const newState = {
          ...state
          , published: state.published = false
        }
        if (response.ok) {
          setModel({
            ...model,
            ...newState
          })
        }
      })
  }

  const create = () => {
    const { state, ...payload } = model;
    fetch('/post', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((response) => response.json())
      .then(json => window.location.assign(`/post/${json.id}/edit`));
  }

  const updateEditor: Editor.Update = {
    update: (newEditor: Editor.Model): void => {
      const newEditors = model.editors.map((editor) => {
        if (editor.id === newEditor.id) {
          return newEditor;
        }
        return editor;
      });
      const newModel = { ...model, editors: newEditors };
      //console.log(`update from app ${JSON.stringify(newModel, null, 2)}`);
      setModel(newModel);
    },
  };

  const editorsView = (): JSX.Element[] => model.editors.map((editor) => (
    <div className={classNames({
      'full-editor-container': true,
      'edit-mode': model.state.type == "edit" || model.state.type == "new",
      'show-mode': model.state.type == "show"
    })}>
      <Editor.App
        {...model}
        {...editor}
        key={editor.id}
        editors={model.editors}
        {...updateEditor}
        del={del}
        addCodeEditor={addCodeEditor}
        addDiffEditor={addDiffEditor}
        addTextEditor={addTextEditor}
      />
    </div>
  ));

  const navBarView = (): JSX.Element => {
    const state = model.state;
    var saveView: JSX.Element;
    var publishView: JSX.Element;

    if (State.isEditState(state)) {
      saveView = <button onClick={() => save(state.id)}>Save</button>
      if (state.published) {
        publishView = <button onClick={() => unpublish(state)}>Unpublish</button>
      } else {
        publishView = <button onClick={() => publish(state)}>Publish</button>
      }
    } else {
      saveView = <button onClick={() => create()}>Save</button>
    }

    if (model.state.type != "show") {
      return (
        <div className="row">
          {saveView}
          {publishView}
        </div>
      )
    } else {
      return undefined;
    }
  }

  return (
    <>
      {navBarView()}
      <div className="col">
        {editorsView()}
      </div>
    </>
  );
};

export { App, Model, defaultModel, getModelForPostId };
