import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import { requestCache } from './app/lib/cache';
const handleRequest = createPagesFunctionHandler({
	build,
	mode: process.env.NODE_ENV,
	getLoadContext: (context) => context.env,
});

export async function onRequest(context) {
	const cache = requestCache;
	const request = context.request;
	let response = await cache.match(request);
	if (!response) {
		response = await handleRequest(context);
		if (process.env.GENIE_ENV === 'development') {
			return response;
		}
		const url = new URL(request.url);
		let allowCache = false;

		allowCache = allowCache || url.pathname.includes('/images/');
		allowCache = allowCache || url.pathname.includes('favicon');
		allowCache = allowCache || url.pathname.includes('/build');
		if (!allowCache && process.env.GENIE_ENV !== 'stage') {
			let hasSearch = url.search ? url.search.length > 1 : false;
			if (!hasSearch) {
				allowCache = allowCache || url.pathname.length <= 1;
				allowCache = allowCache || url.pathname.endsWith('/availability');
			}
		}
		allowCache = allowCache && request.method === 'GET';
		if (allowCache) {
			response.headers.set('cache-control', 'public, max-age=604800');
			context.waitUntil(cache.put(request, response.clone()));
		}
	}
	// console.log('-----------------------------------------------');
	return response;
}
