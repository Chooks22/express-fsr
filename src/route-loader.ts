import { Handler, Router } from 'express';
import { dirname, join, posix, sep, win32 } from 'path';
import { parseMiddleware } from './middleware';
import { Method } from './types';

const METHODS = Object.freeze<Method>(['get', 'post', 'put', 'patch', 'del', 'all']);

const normalizePath: (path: string) => string = sep === win32.sep
  ? path => path.replace(/\\/g, posix.sep)
  : path => path;

export const createRouteLoader = (rootdir: string, router: Router, strict: boolean) => {
  return (filename: string, filepath: string) => {
    const basedir = dirname(filepath.slice(rootdir.length)); // remove root directory from file path
    const file = filename.startsWith('index') ? '' : filename.replace(/\..*$/, '');

    const route = normalizePath(join(basedir, file));
    const handlers = Object.entries<Handler>(require(filepath));

    // find any middlewares first before looping through each handler
    const middlewares = parseMiddleware(handlers);

    for (const [method, handler] of handlers) {
      if (strict && !METHODS.includes(method as Method)) {
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
