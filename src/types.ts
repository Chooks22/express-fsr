import { Handler } from 'express';

export type Method = 'get'|'post'|'put'|'patch'|'del'|'all';

export interface RouterOpts {
  baseDir?: string;
  strictExports?: boolean;
}

export type Middlewares = Handler|Handler[]|Partial<Record<Method, Handler|Handler[]>>;
