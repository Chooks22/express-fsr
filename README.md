# fs-express-router

Simple File System Routing for [ExpressJS](http://expressjs.com/), inspired by [NuxtJS](https://nuxtjs.org/docs/2.x/features/file-system-routing/)'s router.

[![version](https://img.shields.io/npm/v/fs-express-router)](https://www.npmjs.com/package/fs-express-router)
[![npm](https://img.shields.io/npm/dm/fs-express-router)](https://www.npmjs.com/package/fs-express-router)
[![issues](https://img.shields.io/github/issues/Choooks22/fs-express-router)](https://github.com/Choooks22/fs-express-router/issues)
[![stars](https://img.shields.io/github/stars/Choooks22/fs-express-router?style=social)](https://github.com/Choooks22/fs-express-router)

## Getting Started

Install `fs-express-router` as a dependency:

```bash
$ npm i fs-express-router
```

Add the router to your existing `Express` app:

```js
// src/index.js
const { createRouter } = require('fs-express-router');
const path = require('path');

const routerOpts = {
  // point to your routes directory
  baseDir: path.join(__dirname, 'routes'),
};

const router = createRouter(routerOpts);
app.use('/', router);
```

## Directory Structure

`fs-express-router` reads all files inside your `routes` (or wherever you point it to) directory,
and builds the route based on the file's path and applies the exported verb (`const get, post, put, // etc...`) as the handlers.

## Router Config

| Field              | Type              | Description                                                  | Default     |
| ------------------ | ----------------- | ------------------------------------------------------------ | ----------- |
| `baseDir`          | `string`          | Change the base directory to include. Path must be absolute. | `/routes`   |
| `strictExports`    | `boolean`         | Throw an error if a file exports an unknown variable.        | `false`     |
| `router`           | `object`          | Options to pass to Express router.                           | `undefined` |
| `middlewares`      | `function\|array` | Middlewares to add to all router's routes.                   | `undefined` |
| `dirs`             | `array`           | A string or regex array to test for allowed directories.     | `undefined` |
| `excludeDirs`      | `array`           | A string or regex array to test for excluded directories.    | `undefined` |
| `includeRootFiles` | `boolean`         | Include files inside the root directory.                     | `true`      |

### Sample Routes

```md
├── routes/
│   ├── users/
│   │   └── _id/
│   │       ├── index.js
│   │       └── data.js
│   └── index.js
```

### Sample Handlers

**Important**: `delete` method is aliased as `del`, since `delete` is a reserved keyword.

```js
// src/routes/index.js
// GET /
const get = (req, res) => {
  res.json({ message: 'Hello world!' });
}

module.exports = { get };
```

```js
// src/routes/users/_id/index.js
// GET /users/:id
const get = (req, res) => {
  res.json({ userId: req.params.id });
}

// DELETE /users/:id
const del = (req, res) => {
  res.json({ userId: req.params.id, deleted: 1 });
}

module.exports = { get, del };
```

```js
// src/routes/users/_id/data.js
// GET /users/:id/data
const get = (req, res) => {
  res.json({ userId: req.params.id, name: 'foo' });
}

// POST /users/:id/data
const post = (req, res) => {
  res.json({ userId: req.params.id, ok: 1 });
}

module.exports = { get, post };
```

## Middlewares

`fs-express-router` grabs middlewares from an exported variable `middlewares`.

### Usage

```js
// Per-router middleware
const { createRouter } = require('fs-express-router');

const middlewares;
const router = createRouter({ middlewares });

// Per-file middleware
const middlewares;
module.exports = { middlewares };
```

### Per-file middlewares

```js
// single middleware
const middlewares = async (req, res, next) => {
  console.log('this route was called!');
  next();
};

// multiple middlewares
const middlewares = [
  myMiddleware1,
  myMiddleware2,
];
```

### Per-handler middlewares

```js
// single/multiple middlewares
const middlewares = {
  async get(req, res, next) {
    console.log('get handler was called!');
    next();
  },
  post: [myAuthMiddleware, async (req, res, next) => {
    console.log('post handler authenticated!')
    next();
  }],
}
```

## Advanced Usage

### Router composition

You can include/exclude directories with each router, allowing you to easily compose multiple routes with custom middlewares.

```js
const { Router } = require('express');
const { createRouter } = require('fs-express-router');

// Base router where we attach our actual routes
const baseRouter = Router();

// Router where we add auth middlewares
const authRouter = createRouter({
  // Only add routes inside /routes/auth/*
  includeDirs: ['auth'],
  // Attach our auth middlewares
  middlewares: async (req, res, next) => {
    // do authentication
    console.log('request authenticated!');
    next();
  },
});

// Router where any requests can go through
const publicRouter = createRouter({
  // Exclude our authenticated routes
  excludeDirs: ['auth'],
  // Optional: only enable if you have files like /routes/index.js
  includeRootFiles: true,
});

// Attach our routers to our base router
baseRouter.use(authRouter);
baseRouter.use(publicRouter);

// Use our router
app.use('/api', baseRouter);
```

### Typescript

This package is written using Typescript, so types are supported out of the box!

```ts
// Interfaces
import { Middlewares, RouterOpts } from 'fs-express-router';

const middlewares: Middlewares = [];
const routerOpts: RouterOpts = {};

// Handlers
import { RequestHandler } from 'express';
import { Middlewares } from 'fs-express-router';

export const middleware: Middlewares = {
  async get(req, res, next) {
  }
}

export const get: RequestHandler = async (req, res, next) => {
};
```
