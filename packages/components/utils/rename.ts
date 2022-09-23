/**
 * Rename all files in a directory (https://gist.github.com/scriptex/20536d8cda36221f91d69a6bd4a528b3)
 * Usage: node rename.js path/to/directory 'string-to-search' 'string-to-replace'
 */
import { join } from 'path';
import { readdirSync, renameSync } from 'fs';

const [dir, search, replace] = process.argv.slice(2);
const match = RegExp(search, 'g');
const files = readdirSync(dir);

files
    .filter((file: string) => file.match(match))
    .forEach((file: string) => {
        const filePath = join(dir, file);
        const newFilePath = join(dir, file.replace(match, replace));

        renameSync(filePath, newFilePath);
    });
