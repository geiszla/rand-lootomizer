import nativeFs from 'fs';
import path from 'path';

import { Promise } from 'bluebird';
import _ from 'lodash';

import { IPromisifiedFs } from './types/promisified-fs';

global.Promise = Promise;
Promise.promisifyAll(nativeFs);
const fs = (nativeFs as IPromisifiedFs);

(async () => {
  const itemLoots = await readItemLootsAsync();

  // Fisher–Yates shuffle algorithm
  // From https://stackoverflow.com/a/6274381/2058437
  for (let oldIndex = itemLoots.length - 1; oldIndex > 0; oldIndex--) {
    const oldItem = itemLoots[oldIndex];
    const newItem = itemLoots[Math.floor(Math.random() * (oldIndex + 1))];
    [oldItem.filePath, newItem.filePath] = [newItem.filePath, oldItem.filePath];
  }

  // Remove loot conditions
  itemLoots.forEach(({ loot }) => {
    if (loot.pools) {
      for (let i = 0; i < loot.pools.length; i++) {
        const currentPool = loot.pools[i];

        if (currentPool.conditions) {
          const filteredConditions = currentPool.conditions
            .filter(condition => condition.condition !== 'minecraft:killed_by_player');

          currentPool.conditions = filteredConditions;
          if (filteredConditions.length === 0) {
            delete currentPool.conditions;
          }
        }

        if (!currentPool.conditions) {
          const samePool = loot.pools.slice(0, i).filter(pool => !pool.conditions
            && _.isEqual(pool.rolls, currentPool.rolls)
            && _.isEqual(pool.bonus_rolls, currentPool.bonus_rolls))[0];

          if (samePool) {
            samePool.entries = samePool.entries.concat(currentPool.entries);
            loot.pools.splice(i, 1);
          }
        }
      }
    }
  });

  // Write result
  const writeOperations: Promise<void>[] = [];
  itemLoots.forEach((item) => {
    writeOperations.push(fs.writeFileAsync(item.filePath, JSON.stringify(item.loot, null, 4)));
  });

  await Promise.all(writeOperations);
})();

async function readItemLootsAsync(): Promise<{ filePath: string, loot: ILootItem }[]> {
  const files = await getAllLootFilesAsync('loot_tables');

  const readOperations: Promise<{ path: string, content: string }>[] = [];
  files.filter(fileName => fileName.endsWith('.json')).forEach(async (fileName) => {
    readOperations.push(new Promise(async (resolve) => {
      const content = await fs.readFileAsync(fileName);
      resolve({ path: fileName, content });
    }));
  });
  const operationResults = await Promise.all(readOperations);

  return operationResults.map(result => ({
    filePath: result.path, loot: JSON.parse(result.content),
  }));
}

async function getAllLootFilesAsync(currentDirectory: string) {
  const files: string[] = [];

  const directoryOperations: Promise<string[]>[] = [];
  const currentfiles: nativeFs.Dirent[] = await fs
    .readdirAsync(currentDirectory, { withFileTypes: true });

  currentfiles.forEach(async (file) => {
    const filePath = path.join(currentDirectory, file.name);

    if (file.isDirectory()) {
      directoryOperations.push(getAllLootFilesAsync(filePath));
    } else {
      files.push(filePath);
    }
  });
  const fileArrays = await Promise.all(directoryOperations);

  return fileArrays
    .reduce((previousFiles, currentFiles) => previousFiles.concat(currentFiles), files);
}
