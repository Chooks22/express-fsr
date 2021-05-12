import { Handler, Router } from 'express';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { parseMiddleware } from './middleware';
import { Method, RouterOpts } from './types';

const METHODS = Object.freeze<Method>(['get', 'post', 'put', 'patch', 'delete', 'all']);
const isDirectory = (path: string) => lstatSync(path).isDirectory();

const createRouteLoader = (basedir: string, router: Router, strict: boolean) => {
  return (filename: string, filepath: string) => {
    const routepath = dirname(filepath.slice(basedir.length)); // trim extra directories from route
    const routename = filename.startsWith('index') ? '' : filename.replace(/\..*$/, ''); // parse proper filename

    const route = join(routepath, routename);
    const handlers = Object.entries<Handler>(require(filepath));

    // find any middlewares first before looping through each handler
    const middlewares = parseMiddleware(handlers);

    for (const [method, handler] of handlers) {
      if (strict && !METHODS.includes(method as Method)) {
        throw new Error(`Extraneous exports detected at ${filepath}`);
      }

      if (router[method]) {
        const middleware = middlewares.getMiddleware(method as Method);
        router[method](route, ...middleware, handler);
      }
    }
  };
};

export const createRouter = (config: RouterOpts = {}) => {
  const basedir = resolve(config.baseDir ?? 'routes');

  if (!existsSync(basedir)) {
    throw new Error('Cannot find routes directory!');
  }

  if (!lstatSync(basedir).isDirectory) {
    throw new Error('Routes is not a directory!');
  }

  const router = Router();
  const loadRoute = createRouteLoader(basedir, router, config.strictExports);

  (function traverse(directory: string) {
    for (const filename of readdirSync(directory)) {
      const filepath = join(directory, filename);
      if (isDirectory(filepath)) traverse(filepath);
      else loadRoute(filename, filepath);
    }
  }(basedir));

  return router;
};
