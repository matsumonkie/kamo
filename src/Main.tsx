import React, { useState } from 'react';
import * as Editor from './Editor';
import * as CodeEditor from './CodeEditor';
import * as TextEditor from './TextEditor';
import * as DiffEditor from './DiffEditor';
import { response } from 'express';

interface Model {
  editors: Editor.Model[],
  state: State
}

type State =
  | Edited
  | New

interface Edited {
  type: "edited"
  id: number
  published: boolean
}
interface New {
  type: "new"
}

const isEdited = (state: State): state is Edited => state.type === 'edited';

const mkId = (): number => Math.floor(Math.random() * Math.floor(1000));

const defaultModel = (): Model => ({
  editors: [TextEditor.mkModel(mkId())],
  state: { type: "new" }
});

const getModelForPostId = (postId: number): Promise<Model> => {
  return fetch(`/post/${postId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => response.json())
    .then((json) => {
      const { published, ...rest } = json
      return {
        ...rest,
        state: {
          type: "edited",
          id: postId,
          published
        }
      }
    });
}

const removeEditorAndItsChildren = (editors: Editor.Model[], id: number): Editor.Model[] => editors.reduce((acc, editor) => {
  if (editor.id == id) {
    return acc;
  } if ('previousEditorId' in editor && editor.previousEditorId == id) {
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
    const editors: Editor.Model[] = removeEditorAndItsChildren(model.editors, id);
    const newEditors: Editor.Model[] = (editors.length === 0) ? defaultModel().editors : editors;

    setModel({
      ...model,
      editors: newEditors,
    });
  };

  const insertAfterEditorId = (previousEditorId: number, editors: Editor.Model[], newEditor: Editor.Model): Editor.Model[] => editors.reduce((acc, editor) => {
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

  const addDiffEditor = (previousEditorId: number, lastCodeEditor: CodeEditor.Model | DiffEditor.Model): void => {
    const newEditor: DiffEditor.Model = DiffEditor.mkModel(mkId(), lastCodeEditor.id, lastCodeEditor.content);
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

  const publish = (state: Edited): void => {
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

  const unpublish = (state: Edited): void => {
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
      .then(json => window.location.assign(`/post/edit/${json.id}`));
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
      console.log(`update from app ${JSON.stringify(newModel, null, 2)}`);
      setModel(newModel);
    },
  };

  const editorsView = (): JSX.Element[] => model.editors.map((editor) => (
    <Editor.App
      {...model}
      key={editor.id}
      {...editor}
      del={del}
      addCodeEditor={addCodeEditor}
      addDiffEditor={addDiffEditor}
      addTextEditor={addTextEditor}
      {...updateEditor}
    />
  ));

  const saveView = (): JSX.Element => {
    const state = model.state;
    if (isEdited(state)) {
      return <button onClick={() => save(state.id)}>Save</button>
    } else {
      return <button onClick={() => create()}>Save</button>
    }
  }

  const publishView = (): JSX.Element => {
    const state = model.state;
    if (isEdited(state)) {
      if (state.published) {
        return <button onClick={() => unpublish(state)}>Unpublish</button>
      } else {
        return <button onClick={() => publish(state)}>Publish</button>
      }
    } else {
      return undefined;
    }
  }

  return (
    <>
      <div className="row">
        {saveView()}
        {publishView()}
      </div>

      <div className="col">
        {editorsView()}
      </div>
    </>
  );
};

export { App, Model, defaultModel, getModelForPostId };
