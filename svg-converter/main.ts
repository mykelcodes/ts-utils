import fs from 'fs/promises';
import path from 'path';

import { svgToReactNativeComponent } from './convertToReact';

async function processFile(
	filePath: string,
	outputDir: string,
	relativePath: string,
): Promise<void> {
	const svgContent = await fs.readFile(filePath, 'utf-8');

	const componentName =
		path
			.basename(filePath, '.svg')
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('')
			.replace(/\s/g, '') + 'Icon';

	const { component, types } = await svgToReactNativeComponent(
		svgContent,
		componentName,
	);

	const outputSubDir = path.join(outputDir, path.dirname(relativePath));
	await fs.mkdir(outputSubDir, { recursive: true });

	const componentPath = path.join(outputSubDir, `${componentName}.js`);
	await fs.writeFile(componentPath, component);

	const typesPath = path.join(outputSubDir, `${componentName}.d.ts`);
	await fs.writeFile(typesPath, types);

	console.log(`Processed: ${relativePath}`);
}

async function processSvgFiles(
	inputDir: string,
	outputDir: string,
): Promise<void> {
	async function processDirectory(
		currentDir: string,
		currentOutputDir: string,
		relativeDir: string = '',
	) {
		const entries = await fs.readdir(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name);
			const relativePath = path.join(relativeDir, entry.name);

			if (entry.isDirectory()) {
				await processDirectory(fullPath, currentOutputDir, relativePath);
			} else if (
				entry.isFile() &&
				path.extname(entry.name).toLowerCase() === '.svg'
			) {
				await processFile(fullPath, currentOutputDir, relativePath);
			}
		}
	}

	await fs.mkdir(outputDir, { recursive: true });
	await processDirectory(inputDir, outputDir);

	console.log('All SVG files processed successfully.');
}

async function main() {
	const inputDir = './svgs';
	const outputDir = './';

	console.log(`Input directory: ${inputDir}`);
	console.log(`Output directory: ${outputDir}`);

	try {
		await processSvgFiles(inputDir, outputDir);
	} catch (error) {
		console.error('An error occurred:', error);
		process.exit(1);
	}
}

main();
