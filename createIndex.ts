import fs from 'fs';
import path from 'path';

function createIndex(directory: string) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        const indexFilePath = path.join(directory, 'index.ts');
        console.log(indexFilePath);

        for (const file of files) {
            if (fs.lstatSync(path.join(directory, file)).isDirectory()) {
                createIndex(path.join(directory, file));
                continue;
            }

            const fileName = file.split('.')[0];
            // get last name from path
            const lastPathName = directory.split('/').pop();

            if (lastPathName) {
                fs.appendFileSync(
                    indexFilePath,
                    `export { default as ${formatCompName(fileName)}Icon } from './${fileName}';\n`
                );
            }
        }
    });
}

const formatCompName = (str: string) => {
    // remove spaces and special characters
    return str
        .split('-')
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');
};

const MAIN_DIRECTORY = '/Users/michaelolawale/Projects/Client/KKFX/kfv3/packages/icons';

createIndex(MAIN_DIRECTORY);
