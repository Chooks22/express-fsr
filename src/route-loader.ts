import { Router } from 'express';
import { dirname, join, posix, sep, win32 } from 'path';
import { parseMiddleware } from './middleware';
import { Handler, Method, RouterOpts } from './types';

export type Loader = (filename: string, filepath: string) => void;

const METHODS = Object.freeze<Method>(['get', 'post', 'put', 'patch', 'del', 'all']);

const normalizePath: (path: string) => string = sep === win32.sep
  ? path => path.replace(/\\/g, posix.sep)
  : path => path;

const normalizeRoute = (route: string) => route.replace(/_/g, ':');

const parseRoute = (basedir: string, file: string) => {
  const route = normalizePath(join(basedir, file));
  return normalizeRoute(route);
};

export const createRouteLoader = (rootdir: string, router: Router, config: RouterOpts): Loader => {
  return (filename, filepath) => {
    const basedir = dirname(filepath.slice(rootdir.length)); // remove root directory from file path
    const file = filename.startsWith('index') ? '' : filename.replace(/\..*$/, '');

    const route = parseRoute(basedir, file);
    const handlers = Object.entries<Handler>(require(filepath));

    // find any middlewares first before looping through each handler
    const middlewares = parseMiddleware(handlers, config.middlewares);

    for (const [method, handler] of handlers) {
      if (config.strictExports && !METHODS.includes(method as Method)) {
        throw new Error(`Extraneous exports detected at ${filepath}`);
      }

      const verb = method === 'del' ? 'delete' : method;

      if (router[verb]) {
        const middleware = middlewares.getMiddleware(method as Method);
        router[verb](route, ...middleware, handler);
      }
    }
  };
};
