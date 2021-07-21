import { Handler, RouterOptions } from 'express';
export { Handler, RequestHandler } from 'express';

export type Method = 'get' | 'post' | 'put' | 'patch' | 'del' | 'all';

export interface RouterOpts {
  baseDir?: string;
  strictExports?: boolean;
  router?: RouterOptions;
  middlewares?: Middlewares;
  dirs?: (string | RegExp)[];
  excludeDirs?: (string | RegExp)[];
  includeRootFiles?: boolean | string[];
}

export type Middlewares = Handler | Handler[] | Partial<Record<Method, Handler | Handler[]>>;
