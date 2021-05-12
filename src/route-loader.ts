import { Handler, Router } from 'express';
import { dirname, join } from 'path';
import { parseMiddleware } from './middleware';
import { Method } from './types';

const METHODS = Object.freeze<Method>(['get', 'post', 'put', 'patch', 'del', 'all']);

export const createRouteLoader = (basedir: string, router: Router, strict: boolean) => {
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

      const verb = method === 'del' ? 'delete' : method;

      if (router[verb]) {
        const middleware = middlewares.getMiddleware(method as Method);
        router[verb](route, ...middleware, handler);
      }
    }
  };
};
