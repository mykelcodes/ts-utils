import fs from 'fs';
import path from 'path';

function changeFileExtension(directory: string, oldExtension: string, newExtension: string) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        if (oldExtension.charAt(0) !== '.' || newExtension.charAt(0) !== '.') {
            console.error('Extensions must start with a dot (.)');
            return;
        }

        for (const file of files) {
            // check if file is a folder and call the function recursively
            if (fs.lstatSync(path.join(directory, file)).isDirectory()) {
                changeFileExtension(path.join(directory, file), oldExtension, newExtension);
                continue;
            }

            const fullPath = path.join(directory, file);
            const fileExtension = path.extname(file);

            if (fileExtension !== oldExtension) {
                console.log(`Skipping file: ${file}`);
                continue;
            }

            // remove .svg extension to .tsx
            // and replace spaces with hyphen
            const newFilePath = path.join(
                directory,
                file.replace(/ /g, '-').replace(oldExtension, newExtension).toLowerCase()
            );

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

changeFileExtension('/Users/michaelolawale/Downloads/Kiakia Finance Icons', '.svg', '.tsx');
