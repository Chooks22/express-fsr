import { existsSync, lstatSync, readdirSync } from 'fs';
import { join } from 'path';
import { createFilter } from './filter';
import { RouterOpts } from './types';

export const getFiles = (config: RouterOpts, baseDir: string) => {
  if (!existsSync(baseDir)) {
    throw new Error('Cannot find routes directory!');
  }

  if (!lstatSync(baseDir).isDirectory) {
    throw new Error('Routes is not a directory!');
  }

  const baseFiles = readdirSync(baseDir);
  const filter = createFilter(config);

  const files = filter
    ? baseFiles.filter(filter, { baseDir })
    : baseFiles;

  return files.map(file => join(baseDir, file));
};
