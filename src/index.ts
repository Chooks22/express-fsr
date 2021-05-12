import { Router } from 'express';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { createRouteLoader } from './route-loader';
import { RouterOpts } from './types';

export * from './types';

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
      if (lstatSync(filepath).isDirectory()) traverse(filepath);
      else loadRoute(filename, filepath);
    }
  }(basedir));

  return router;
};
