import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";
import { requestCache } from './app/lib/cache'
const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context) => context.env,
});

export async function onRequest(context) {
  console.log('context', context)
  const cache = requestCache;
  const request = context.request;
    let response = await cache.match(request);
  if (!response) {
    response = await handleRequest(context);
    if (process.env.NODE_ENV === 'development') {
      return response;
    }
    const url = new URL(request.url);
    let allowCache = url.search && url.search.length < 2;
    allowCache =
      allowCache &&
      (url.pathname.length <= 1 || url.pathname.endsWith('availability'));
    let headers = {};
    if (allowCache) {
      headers = { 'cache-control': 'public, max-age=604800' };
    }
    response = new Response(response.body, { ...response, headers });
    if (allowCache) {
      cache.put(request, response.clone())
    }
  }
  
  return response;
}
