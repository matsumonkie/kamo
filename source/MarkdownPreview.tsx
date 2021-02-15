import * as Marked from 'marked';
import React from 'react';

type Model = {
  content: string;
}

console.log(Marked);

const App = ({ ...model }: Model): JSX.Element => {
  const markdown: string = Marked.parse(model.content);

  const view = () => (
    <>
      <div dangerouslySetInnerHTML={{ __html: markdown }} />
    </>
  );

  return view();
};

export { App, Model };
