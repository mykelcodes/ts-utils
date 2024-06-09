import fs from 'fs';
import path from 'path';

function renameFile(directory: string, oldName: string, newName: string) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        for (const file of files) {
            // check if file is a folder and call the function recursively
            if (fs.lstatSync(path.join(directory, file)).isDirectory()) {
                renameFile(path.join(directory, file), oldName, newName);
                continue;
            }

            const fullPath = path.join(directory, file);

            const newFilePath = fullPath.replace(oldName, newName).replace(/ /g, '-').toLowerCase();

            fs.rename(fullPath, newFilePath, (err) => {
                if (err) {
                    console.error('Error renaming file:', err);
                    return;
                }

                console.log(`Renamed file: ${file} to ${newFilePath}`);
            });
        }
    });
}

renameFile('/Users/michaelolawale/Downloads/Currency', 'Property 1=', '');
