require('dotenv').config();
const { replace } = require('esbuild-plugin-replace');
const { withEsbuildOverride } = require('remix-esbuild-override');
const alias = require('esbuild-plugin-alias');
/**
 * Define callbacks for the arguments of withEsbuildOverride.
 * @param option - Default configuration values defined by the remix compiler
 * @param isServer - True for server compilation, false for browser compilation
 * @param isDev - True during development.
 * @return {EsbuildOption} - You must return the updated option
 */
withEsbuildOverride((option, { isServer, isDev }) => {
	// console.log('isServer', isServer);
	// if (isServer) option.mainFields = ['browser', 'module', 'main'];
	if (isServer) {
		option.mainFields = ['browser', 'module', 'main'];
		option.define = {
			...option.define,
			process: JSON.stringify({
				env: {
					...process.env,
				},
				//for paypal
				versions: {
					...process.versions
				},
				platform: process.platform,
				arch: process.arch,
				version: process.version
			}),
			//for http polyfill
			global: JSON.stringify({
				location: {
					protocol: 'server:'
				}
			})
		};
		option.plugins = [
			...option.plugins,
			replace({
				include: /.*\.js$/,
				values: {
						//fix paypal
						'xhr.overrideMimeType': 'xhr && xhr.overrideMimeType',
					// 'const paypalhttp': `const Buffer = require('buffer').Buffer; const paypalhttp`,
					// 'import * as capability': `import { Buffer } from 'buffer'; import * as capability`,
				//	'import {overrideMimeType}': `import { Buffer } from 'buffer'; import {overrideMimeType}`

						'function checkTypeSupport': 'function checkTypeSupport(type){return false;} function a',
					'querystring.escape': 'encodeURIComponent',
					'global.ReadableStream': 'ReadableStream',
					'global.fetch': 'fetch',
					'process.nextTick': 'nextTick',
					'request.host':'request.protocol = parsedUrl && parsedUrl.protocol ? parsedUrl.protocol : "https:"; request.host',
						// 't:void 0':'t:""'
					//sendgrid
					'options.baseURL = options.baseUrl': 'options.adapter = fetchAdapter; options.baseURL = options.baseUrl'
					},
				}),
			alias({
				'@prisma/client': require.resolve('@prisma/client'),
			}),
		];
		option.inject = option.inject || [];
		option.inject.push('./esbuild.shim.js');
	}
	return option;
});
/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "cloudflare-pages",
  server: "./server.js",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "functions/[[path]].js",
  // publicPath: "/build/",
};
