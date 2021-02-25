import * as Marked from 'marked';
import hljs from 'highlight.js';

type Model = {
  content: string;
}

const App = ({ ...model }: Model): JSX.Element => {
  Marked.setOptions({
    renderer: new Marked.Renderer(),
    highlight: (code, language) => {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
      return hljs.highlight(validLanguage, code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
  });
  const markdown: string = Marked.parse(model.content);

  const view = () => (
    <>
      <div dangerouslySetInnerHTML={{ __html: markdown }} />
    </>
  );

  return view();
};

export { App, Model };
