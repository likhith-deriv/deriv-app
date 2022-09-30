import { EOL } from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { sync } from 'glob';
import { getFileNameFromPath, getKebabCase, getPascalCase } from './helper';
import entries_object from './icons';

function validateIcons(svgs_map) {
    Object.keys(entries_object).forEach(icon_path => {
        const short_path = entries_object[icon_path].replace('.svg', '').replace('./src/components/icon/', '');
        const dir_name = path.dirname(short_path);

        const file_name = getFileNameFromPath(short_path);
        const icon_name = getPascalCase(file_name);

        let category = 'common';
        const category_match = new RegExp(`^Ic(${Object.keys(svgs_map).join('|')})`, 'gi').exec(icon_name);
        if (category_match && category_match[1]) {
            category = getKebabCase(category_match[1]);
        }

        if (category !== dir_name) {
            throw new Error(`'${file_name}' icon is in incorrect folder. Please move it to the ${category} folder.`);
        }
    });
}

export function buildIconsManifest() {
    const sprite_bundles = sync('./lib/icon/sprites/**/*.svg');

    const svgs_map = sprite_bundles.reduce((acc, fname) => {
        const name = getFileNameFromPath(fname);
        const svg_category = name.match(/^(.*?)\./)[1];
        acc[svg_category] = name;
        return acc;
    }, {});

    validateIcons(svgs_map);

    const buffer = ['// auto-generated file. DO NOT MODIFY.', ''];
    buffer.push(`module.exports = ${JSON.stringify(svgs_map)}`);

    fs.writeFileSync(path.join(__dirname, '../src/components/icon/icons-manifest.js'), buffer.join(EOL) + EOL);
}
