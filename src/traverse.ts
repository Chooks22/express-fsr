import { lstatSync, readdirSync } from 'fs';
import { basename, join } from 'path';
import { Loader } from './route-loader';

export const traverse = function(this: { load: Loader }, path: string, checkDir = false): void {
  if (checkDir && !lstatSync(path).isDirectory()) {
    this.load(basename(path), path);
    return;
  }

  for (const filename of readdirSync(path)) {
    const filepath = join(path, filename);

    if (lstatSync(filepath).isDirectory()) {
      traverse.call(this, filepath);
      return;
    }

    this.load(filename, filepath);
  }
};
