import { lstatSync } from 'fs';
import { join } from 'path';
import { RouterOpts } from './types';

type Filter = (filename: string) => boolean;

const filterRootFiles = (filter: Filter, validFilenames?: string[]) => {
  return function(this: { baseDir: string }, filename: string) {
    const file = join(this.baseDir, filename);
    const isRootFile = !lstatSync(file).isDirectory();

    if (isRootFile && validFilenames) {
      return validFilenames.some(validName => filename.includes(validName));
    }

    return isRootFile || filter(filename);
  };
};

export const createFilter = (config: RouterOpts): Filter => {
  const { dirs, excludeDirs, includeRootFiles = true } = config;

  if (!(dirs || excludeDirs)) {
    return null;
  }

  if (dirs && excludeDirs) {
    throw new Error('Cannot use both dirs and excludeDirs. Only use one.');
  }

  const filter = (filename: string) => (check: string|RegExp) => {
    return typeof check === 'string'
      ? check.includes(filename)
      : check.test(filename);
  };

  const dirFilter: Filter = dirs
    ? filename => dirs.some(filter(filename))
    : filename => !excludeDirs.some(filter(filename));

  if (Array.isArray(includeRootFiles)) {
    const validFilenames = includeRootFiles;
    return filterRootFiles(dirFilter, validFilenames);
  }

  return includeRootFiles
    ? filterRootFiles(dirFilter)
    : dirFilter;
};
