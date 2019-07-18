"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bluebird_1 = require("bluebird");
const lodash_1 = __importDefault(require("lodash"));
global.Promise = bluebird_1.Promise;
bluebird_1.Promise.promisifyAll(fs_1.default);
const fs = fs_1.default;
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
                        && lodash_1.default.isEqual(pool.rolls, currentPool.rolls)
                        && lodash_1.default.isEqual(pool.bonus_rolls, currentPool.bonus_rolls))[0];
                    if (samePool) {
                        samePool.entries = samePool.entries.concat(currentPool.entries);
                        loot.pools.splice(i, 1);
                    }
                }
            }
        }
    });
    // Write result
    const writeOperations = [];
    itemLoots.forEach((item) => {
        writeOperations.push(fs.writeFileAsync(item.filePath, JSON.stringify(item.loot, null, 4)));
    });
    await bluebird_1.Promise.all(writeOperations);
})();
async function readItemLootsAsync() {
    const files = await getAllLootFilesAsync('loot_tables');
    const readOperations = [];
    files.filter(fileName => fileName.endsWith('.json')).forEach(async (fileName) => {
        readOperations.push(new bluebird_1.Promise(async (resolve) => {
            const content = await fs.readFileAsync(fileName);
            resolve({ path: fileName, content });
        }));
    });
    const operationResults = await bluebird_1.Promise.all(readOperations);
    return operationResults.map(result => ({
        filePath: result.path, loot: JSON.parse(result.content),
    }));
}
async function getAllLootFilesAsync(currentDirectory) {
    const files = [];
    const directoryOperations = [];
    const currentfiles = await fs
        .readdirAsync(currentDirectory, { withFileTypes: true });
    currentfiles.forEach(async (file) => {
        const filePath = path_1.default.join(currentDirectory, file.name);
        if (file.isDirectory()) {
            directoryOperations.push(getAllLootFilesAsync(filePath));
        }
        else {
            files.push(filePath);
        }
    });
    const fileArrays = await bluebird_1.Promise.all(directoryOperations);
    return fileArrays
        .reduce((previousFiles, currentFiles) => previousFiles.concat(currentFiles), files);
}
//# sourceMappingURL=index.js.map