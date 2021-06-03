import { Router } from 'express';
import { resolve } from 'path';
import { getFiles } from './get-files';
import { createRouteLoader } from './route-loader';
import { traverse } from './traverse';
import { RouterOpts } from './types';

export * from './types';

export const createRouter = (config: RouterOpts = {}) => {
  const router = Router();

  const baseDir = resolve(config.baseDir ?? 'routes');
  const routeLoader = createRouteLoader(baseDir, router, config);

  const files = getFiles(config, baseDir);

  for (const file of files) {
    traverse.call({ load: routeLoader }, file, true);
  }

  return router;
};
