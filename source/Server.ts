import express, { text } from 'express';
import path from 'path';
import * as Config from 'config';
import * as Pg from 'pg';
import * as Editor from './Editor';
import * as TextEditor from './TextEditor';

const port = process.env.PORT;
const app = express();

app.engine('pug', require('pug').__express)
app.use(express.static('dist'));
app.use(express.json());
app.set('view engine', 'pug');
app.set('views', path.join('./source/views'));

app.get('/', (_request, response) => {
  response.redirect("/index.html");
})

interface Post {
  id: number
  body: Body
  createdAt: string
  updatedAt: string
}

interface Body {
  editors: Editor.Model[]
}

app.get('/index.html', async (_request, response) => {
  const client = new Pg.Client(Config);
  await client.connect()
  const sql = 'SELECT * FROM post WHERE published = TRUE;';
  const posts = (await client.query(sql)).rows.map((post: Post) => {
    const textEditor = post.body.editors.find((editor) => editor.type == "text") as TextEditor.Model;

    if (textEditor && textEditor.content && textEditor.content.length > 0) {
      const title = textEditor.content.split('\n')[0]
      return {
        id: post.id,
        title: title.replace(/^(#)/, "")
      }
    } else {
      return {
        id: post.id,
        title: "no title"
      }
    }
  })

  response.render('index', {
    title: 'index',
    posts
  });
});

app.get('/post', async (_request, response) => {
  const client = new Pg.Client(Config);
  await client.connect()
  const sql = 'SELECT * FROM post;';
  const posts = (await client.query(sql)).rows.map((post: Post) => {
    const textEditor = post.body.editors.find((editor) => editor.type == "text") as TextEditor.Model;

    if (textEditor && textEditor.content && textEditor.content.length > 0) {
      const title = textEditor.content.split('\n')[0]
      return {
        id: post.id,
        title: title.replace(/^(#)/, "")
      }
    } else {
      return {
        id: post.id,
        title: "no title"
      }
    }
  })

  response.render('index', {
    title: 'index',
    posts
  });
});

app.get('/post/new', (_request, response) => {
  response.render('new', {
    title: 'new'
  });
});

app.get('/post/edit/:id', (request, response) => {
  const postId = request.params.id;
  response.render('edit', {
    title: `edit post ${postId}`,
    postId: postId
  });
});

app.post('/post', async (request, response) => {
  const client = new Pg.Client(Config);
  await client.connect()
  const sql = 'INSERT INTO post (body) VALUES ($1) RETURNING id;';
  console.log(request.body)

  const values = [request.body];
  const id = (await client.query(sql, values)).rows[0];

  response.json(id);
})

app.put('/post/:id', async (request, response) => {
  const client = new Pg.Client(Config);
  await client.connect()
  const sql = 'UPDATE post SET body=$1 WHERE id=$2;';

  const values = [request.body, request.params.id];
  console.log(JSON.stringify({ sql, body: request.body, id: request.params.id }, null, 2))

  const nbRows = (await client.query(sql, values)).rows[0];

  response.json(nbRows);
})

app.put('/post/:id/publish', async (request, response) => {
  const client = new Pg.Client(Config);
  await client.connect()
  const sql = 'UPDATE post SET published=true WHERE id=$1;';
  const values = [request.params.id];
  const nbRows = (await client.query(sql, values)).rows[0];

  response.json(nbRows);
})

app.put('/post/:id/unpublish', async (request, response) => {
  const client = new Pg.Client(Config);
  await client.connect()
  const sql = 'UPDATE post SET published=false WHERE id=$1;';
  const values = [request.params.id];
  const nbRows = (await client.query(sql, values)).rows[0];

  response.json(nbRows);
})

app.get('/post/:id', async (request, response) => {
  const postId = request.params.id;
  if(request.accepts('html')) {
    response.render('show', {
      title: 'index',
    });
  } else {
    const client = new Pg.Client(Config);
    await client.connect()
    const sql = 'SELECT body, published FROM post WHERE id = $1;';
    const values = [postId];

    const { body, published } = (await client.query(sql, values)).rows[0];
    response.json({
      editors: body.editors,
      published
    });
  }
});

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});
