import React from 'react';
import ReactDOM from 'react-dom';
import * as Main from './Main';

const appDom = document.getElementById('app');
const postId: number = Number.parseInt(appDom.dataset.postId);
const isShowMode: boolean = appDom.dataset.mode == "show";
const pModel: Promise<Main.Model> = postId ? Main.getModelForPostId(postId, isShowMode) : Promise.resolve(Main.defaultModel());
pModel.then((model) =>
  ReactDOM.render(
    <React.StrictMode>
      <Main.App {...model} />
    </React.StrictMode>,
    appDom
  )
);