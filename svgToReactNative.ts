import fs from 'fs';
import path from 'path';

function svgToReactNative(directory: string) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        for (const file of files) {
            // check if file is a folder and call the function recursively
            if (fs.lstatSync(path.join(directory, file)).isDirectory()) {
                svgToReactNative(path.join(directory, file));
                continue;
            }

            const fullPath = path.join(directory, file);

            fs.readFile(fullPath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                const { convertedContent, usedTags } = convertSvgToReactNative(data);
                const importStatements = generateImportStatements(usedTags);
                const componentName = file.split('.')[0];

                console.log(componentName);

                fs.writeFile(
                    fullPath,
                    wrapInComponent(convertedContent, componentName, importStatements),
                    (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                            return;
                        }

                        console.log(
                            `Successfully converted file: ${file} to React Native SVG component`
                        );
                    }
                );
            });
        }
    });
}

const convertAttributesToCamelCase = (svgContent: string): string => {
    return svgContent.replace(/([a-z])-([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
};

const replaceStrokeWithPropsColor = (svgContent: string): string => {
    return svgContent.replace(/stroke="[^"]*"/g, 'stroke={color}');
};

const replaceFillWithPropsColor = (svgContent: string): string => {
    return svgContent.replace(/fill="(?!none)[^"]*"/g, 'fill={color}');
};

const convertSvgToReactNative = (svgContent: string) => {
    const tagMapping = {
        svg: 'Svg',
        g: 'G',
        rect: 'Rect',
        circle: 'Circle',
        ellipse: 'Ellipse',
        line: 'Line',
        polyline: 'Polyline',
        polygon: 'Polygon',
        path: 'Path',
        text: 'Text',
        clipPath: 'ClipPath',
        defs: 'Defs',
        stop: 'Stop',
        linearGradient: 'LinearGradient',
        radialGradient: 'RadialGradient',
        mask: 'Mask',
        pattern: 'Pattern',
        image: 'Image',
    };

    const usedTags = new Set<string>();
    let convertedContent = convertAttributesToCamelCase(svgContent.replace(/xmlns=".*?"/g, ''));

    for (const [svgTag, rnTag] of Object.entries(tagMapping)) {
        console.log();
        // edit height and width attributes
        if (svgTag === 'svg') {
            const heightRegex = /height=".*?"/g;
            const widthRegex = /width=".*?"/g;
            const heightMatch = svgContent.match(heightRegex);
            const widthMatch = svgContent.match(heightRegex);

            if (heightMatch && widthMatch) {
                convertedContent = convertedContent.replace(heightRegex, `height={size}`);
                convertedContent = convertedContent.replace(widthRegex, `width={size}`);
            }
        }

        const tagRegex = new RegExp(`<${svgTag}`, 'g');
        if (svgContent.match(tagRegex)) {
            if (svgTag !== 'svg') usedTags.add(rnTag);
            convertedContent = convertedContent.replace(tagRegex, `<${rnTag}`);
        }
        const closingTagRegex = new RegExp(`</${svgTag}>`, 'g');
        if (svgContent.match(closingTagRegex)) {
            convertedContent = convertedContent.replace(closingTagRegex, `</${rnTag}>`);
        }
    }

    convertedContent = replaceFillWithPropsColor(replaceStrokeWithPropsColor(convertedContent));

    return { convertedContent, usedTags };
};

const generateImportStatements = (usedTags: Set<string>): string => {
    if (usedTags.size === 0) return '';
    return `import Svg, { ${[...usedTags].join(', ')} } from 'react-native-svg';`;
};

const formatCompName = (str: string) => {
    // remove spaces and special characters
    return str
        .split('-')
        .map((item) => {
            const firstChar = isNaN(Number(item.charAt(0)))
                ? item.charAt(0).toUpperCase()
                : item.charAt(0);
            return firstChar + item.slice(1).toLowerCase();
        })
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');
};

const wrapInComponent = (
    svgContent: string,
    componentName: string,
    importStatements: string
): string => {
    return `
        ${importStatements}

        type Props = {
            size?: number;
            color?: string;
        }

        function ${formatCompName(componentName)}({ size = 24, color = '#000000' }: Props) {
            return (
            ${svgContent}
            );
        }

        export default ${formatCompName(componentName)};
    `;
};

svgToReactNative('/Users/michaelolawale/Downloads/Iconscopy');
