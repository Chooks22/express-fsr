# fs-express-router

Simple File System Routing for [ExpressJS](http://expressjs.com/), inspired by [NuxtJS](https://nuxtjs.org/docs/2.x/features/file-system-routing/)'s router.

## Getting Started

Install `fs-express-router` as a dependency:

```bash
$ npm i fs-express-router
```

Add the router to your existing `Express` app:

```ts
// src/index.ts
import { createRouter, RouterOpts } from 'fs-express-router';
import { join } from 'path';

const routerOpts: RouterOpts = {
  baseDir: join(__dirname, 'routes'), // point to your routes directory
};

const router = createRouter();
app.use('/', router);
```

## Directory Structure

`fs-express-router` reads all files inside your `routes` (or wherever you point it to) directory,
and builds the route based on the file's path and applies the exported verb (`export const get, post, put, // etc...`) as the handlers.

### Sample Routes

```md
├── routes/
│   ├── users/
│   │   └── :id(\d+)/
│   │       ├── index.ts
│   │       └── data.ts
│   └── index.ts
```

### Sample Handlers

```ts
// src/routes/index.ts
// GET /
export const get: RequestHandler = (req, res) => {
  res.json({ message: 'Hello world!' });
}
```

```ts
// src/routes/users/:id(\d+)/index.ts
interface Params {
  id: string;
}

// GET /users/:id(\d+)
export const get: RequestHandler<Params> = (req, res) => {
  res.json({ userId: req.params.id });
}
```

```ts
// src/routes/users/:id(\d+)/data.ts
interface Params {
  id: string;
}

// GET /users/:id(\d+)/data
export const get: RequestHandler<Params> = (req, res) => {
  res.json({ userId: req.params.id, name: 'foo' });
}

// POST /users/:id(\d+)/data
export const post: RequestHandler<Params> = (req, res) => {
  res.json({ userId: req.params.id, ok: 1 });
}
```
