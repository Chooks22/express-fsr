import { Handler, Method, Middlewares } from 'types';

type Handlers = [string, Handler|Handler[]][];

const getMiddlewareFromList = (handlers: Handlers): Middlewares => {
  for (let i = 0, n = handlers.length; i < n; i++) {
    const [method, middleware] = handlers[i];
    if (method !== 'middlewares') continue;

    handlers.splice(i, 1); // pop middleware off from entries
    return middleware;
  }
};

export const parseMiddleware = (handlers: Handlers, routerMiddlewares: Middlewares) => {
  const middlewares = getMiddlewareFromList(handlers);

  // always return an array of handlers for spread syntax.
  // if middleware is an record with http methods:
  // grab the matching method and return as an array
  const normalizeMiddlewares = (middleware: Middlewares, method: Method) => {
    if (!middleware) return [];

    if (Array.isArray(middleware)) return middleware;
    if (typeof middleware === 'function') return [middleware];

    const methodMiddleware = middleware[method];
    if (methodMiddleware) {
      return Array.isArray(methodMiddleware) ? methodMiddleware : [methodMiddleware];
    }

    return [];
  };

  const getMiddleware = (method: Method): Handler[] => {
    const routerMiddleware = normalizeMiddlewares(routerMiddlewares, method);
    const fileMiddleware = normalizeMiddlewares(middlewares, method);
    return [...routerMiddleware, ...fileMiddleware];
  };

  return { getMiddleware };
};
