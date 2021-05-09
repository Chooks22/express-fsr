import { Handler, Router } from 'express';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';

export type Method = 'get'|'post'|'put'|'patch'|'delete'|'all';
const METHODS = Object.freeze<Method>(['get', 'post', 'put', 'patch', 'delete', 'all']);

export interface RouterOpts {
  baseDir?: string;
  strictExports?: boolean;
}

const isDirectory = (path: string) => lstatSync(path).isDirectory();

const createRouteLoader = (basedir: string, router: Router, strict: boolean) => {
  return (filename: string, filepath: string) => {
    const routepath = dirname(filepath.slice(basedir.length)); // trim extra directories from route
    const routename = filename.startsWith('index') ? '' : filename.replace(/\..*$/, ''); // parse proper filename

    const route = join(routepath, routename);
    const handlers = Object.entries<Handler>(require(filepath));

    for (const [method, handler] of handlers) {
      if (strict && !METHODS.includes(method as Method)) {
        throw new Error(`Extraneous exports detected at ${filepath}`);
      }
      router[method]?.(route, handler);
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
