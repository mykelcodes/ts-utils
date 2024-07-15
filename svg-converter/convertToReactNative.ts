import { transform } from '@babel/core';
// @ts-ignore
import preset from '@babel/preset-env';
import { transform as svgr } from '@svgr/core';
import { parse, stringify } from 'svgson';
import { minify } from 'terser';

interface TransformResult {
	componentName: string;
	component: string;
	types: string;
}

export async function svgToReactNativeComponent(
	svgContent: string,
	componentName: string,
): Promise<TransformResult> {
	// Parse the SVG to manipulate its structure
	const parsedSvg = await parse(svgContent);

	// Function to recursively remove fill attributes
	const removeFill = (node: any) => {
		if (node.attributes && node.attributes.fill) {
			delete node.attributes.fill;
		}
		if (node.children) {
			node.children.forEach(removeFill);
		}
	};

	// Remove fill attributes from the SVG
	removeFill(parsedSvg);

	// Convert back to SVG string
	const modifiedSvgContent = stringify(parsedSvg);

	const component = await svgr(
		modifiedSvgContent,
		{
			plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
			typescript: false,
			jsx: {
				babelConfig: {
					plugins: [
						['@babel/plugin-transform-react-jsx', { useBuiltIns: true }],
					],
				},
			},
			icon: true,
			native: true,
			ref: true,
			memo: true,
			svgProps: {
				width: '{props.size || 24}',
				height: '{props.size || 24}',
			},
		},
		{ componentName },
	);

	// Modify the generated component to include size prop
	const modifiedComponent = component
		.replace(/(Svg,\s*SvgProps,)/, 'Svg, SvgProps, Path, G, Circle, Rect, ')
		.replace(/(<Svg)/, '<Svg width={props.size} height={props.size}')
		.replace(/width=\{(\d+|props\.width)\}/g, '')
		.replace(/height=\{(\d+|props\.height)\}/g, '');

	const types = `import * as React from 'react';
import { SvgProps } from 'react-native-svg';
interface ${componentName}Props extends SvgProps {
	size?: number;
}
declare const ${componentName}: React.FC<${componentName}Props>;
export default ${componentName};
`;

	const result = transform(modifiedComponent, {
		presets: [preset],
		comments: false,
	});

	if (!result || !result.code) {
		throw new Error('Failed to transpile component');
	}

	const { code: minifiedComponent } = await minify(result.code, {
		mangle: { toplevel: true },
		compress: {
			dead_code: true,
			drop_debugger: true,
			conditionals: true,
			evaluate: true,
			booleans: true,
			loops: true,
			unused: true,
			hoist_funs: true,
			keep_fargs: false,
			hoist_vars: true,
			if_return: true,
			join_vars: true,
			side_effects: true,
		},
	});

	if (!minifiedComponent) {
		throw new Error('Failed to minify component');
	}

	return { componentName, component: minifiedComponent + '\n', types };
}
