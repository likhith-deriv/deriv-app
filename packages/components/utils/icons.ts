import { sync } from 'glob';

const icons = sync('./src/components/icon/**/*.svg');

const entries_object = icons.reduce((acc: { [key: string]: string }, fname: string) => {
    const check = fname.match(/([^/]*)\/*$/);
    if (check?.length) {
        const name = check[1].replace('.svg', '');
        acc[`icon/js/${name}`] = fname;
    }

    return acc;
}, {});

module.exports = entries_object;
