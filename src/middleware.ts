import { Handler } from 'express';
import { Method, Middlewares } from 'types';

type Handlers = [string, Handler|Handler[]][];

const getMiddlewareFromList = (handlers: Handlers): Middlewares => {
  for (let i = 0, n = handlers.length; i < n; i++) {
    const [method, middleware] = handlers[i];
    if (method !== 'middlewares') continue;

    handlers.splice(i, 1); // pop middleware off from entries
    return middleware;
  }
};

export const parseMiddleware = (handlers: Handlers) => {
  const middlewares = getMiddlewareFromList(handlers);

  // always return an array of handlers for spread syntax.
  // if middleware is an record with http methods:
  // grab the matching method and return as an array
  const getMiddleware = (method: Method): Handler[] => {
    if (!middlewares) return [];

    if (Array.isArray(middlewares)) return middlewares;
    if (typeof middlewares === 'function') return [middlewares];

    const methodMiddleware = middlewares[method];
    if (methodMiddleware) {
      return Array.isArray(methodMiddleware) ? methodMiddleware : [methodMiddleware];
    }

    return [];
  };

  return { getMiddleware };
};
