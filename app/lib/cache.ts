


export const requestCache = caches.default;

export let dbCache: Cache;

caches.open('custom:dbcache').then(cache => dbCache = cache);