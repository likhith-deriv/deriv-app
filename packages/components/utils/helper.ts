export const getKebabCase = (str: string) => {
    if (!str) return str;
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
        .replace(/[\s]+/g, '-') // replace all spaces and low dash
        .toLowerCase();
};

export const getPascalCase = (str: string) => {
    if (!str) return '';
    return (
        String(str)
            .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '$')
            .replace(/[^_A-Za-z0-9]+/g, '$')
            .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}$${b}`)
            // .toLowerCase()
            .replace(/(\$)(\w?)/g, (m, a, b) => b.toUpperCase())
    );
};

export const getFileNameFromPath = path => path.match(/([^/]*)\/*$/)[1].replace('.svg', '');
