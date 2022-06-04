import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";
import { requestCache } from './app/lib/cache'
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
    if (process.env.NODE_ENV === 'development') {
      return response;
    }
    const url = new URL(request.url);
    let allowCache = url.search && url.search.length < 2;
    allowCache =
      allowCache &&
      (url.pathname.length <= 1 || url.pathname.endsWith('availability'));
    //console.log('request', url.toString());
    if (allowCache) {
      //console.log('allowCache true', allowCache)
      response.headers.set('cache-control', 'public, max-age=604800');
      cache.put(request, response.clone())
    } else {
      //console.log('allowCache false', allowCache )
    }
  }
  //console.log('-----------------------------------------------')
  return response;
}
