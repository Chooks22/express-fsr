import { Handler } from 'express';

export type Method = 'get'|'post'|'put'|'patch'|'delete'|'all';

export interface RouterOpts {
  baseDir?: string;
  strictExports?: boolean;
}

export type Middlewares = Handler|Handler[]|Partial<Record<Method, Handler|Handler[]>>;
