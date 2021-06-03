import { lstatSync, readdirSync } from 'fs';
import { basename, join } from 'path';
import { Loader } from 'route-loader';

export const traverse = function(this: { load: Loader }, path: string, checkDir = false) {
  if (checkDir && !lstatSync(path).isDirectory()) {
    return this.load(basename(path), path);
  }

  for (const filename of readdirSync(path)) {
    const filepath = join(path, filename);

    if (lstatSync(filepath).isDirectory()) {
      return traverse.call(this, filepath);
    }

    this.load(filename, filepath);
  }
};
