/**
 * Generate components/icon/icons.js & stories/icon/icons.js entries file automatically
 */

import { EOL } from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { getFileNameFromPath, getPascalCase } from './helper';
import entries_object from './icons';

export function buildIcons() {
    /* eslint-disable no-console */
    console.info('Build icons starting.');

    let modules = 0;

    const buffer = ['// auto-generated file. DO NOT MODIFY.', ''];

    const categories = {};
    const emitModule = file => {
        const pathname = entries_object[file].replace('.svg', '').replace('./src/components/icon/', '');
        const dirname = path.dirname(pathname);

        modules += 1;

        if (!categories[dirname]) {
            categories[dirname] = [];
        }
        const icon_name = getPascalCase(getFileNameFromPath(pathname));
        categories[dirname].push(icon_name);

        buffer.push(`import './${pathname}.svg';`);
    };

    const files = Object.keys(entries_object);
    files.forEach(f => {
        const stats = fs.statSync(entries_object[f]);
        if (stats.isFile()) {
            emitModule(f);
        }
    });

    fs.writeFileSync(
        path.join(__dirname, '../stories/icon/icons.js'),
        JSON.stringify(categories, null, 4)
            .replace(/"/g, "'")
            .replace(/^/, '// auto-generated file. DO NOT MODIFY.\n\nexport const icons =\n')
    );
    fs.writeFileSync(path.join(__dirname, '../src/components/icon/icons.js'), buffer.join(EOL) + EOL);
    /* eslint-disable no-console */
    console.info(`Build icons done. 'components/icon/icons.js' emitted with ${modules} modules.`);
}
