

let db: any;

declare global {
  var __db: any | undefined;
}

// const client = new PrismaClient({
// 	log: [
// 		{ level: 'query', emit: 'event' },
// 		{ level: 'error', emit: 'event' },
// 		{ level: 'info', emit: 'stdout' },
// 		{ level: 'warn', emit: 'stdout' },
// 	]
// 	// datasources: {
// 	// 	db: {
// 	// 		url: primaryDB,
// 	// 	},
// 	// },
// });
// client.$on('query', (e) => {
// 	if (e.duration < logThreshold) return;

// 	console.log(`prisma:query - ${e.duration}ms - ${e.query}`);
// });
// client.$on('error', (e) => {
// 	console.error(`prisma:error - ${JSON.stringify(e)}`);
// });

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.


export const getDB = () => {
  if (!db ) {
    if (process.env.NODE_ENV === "development") {
      if (!global.__db) {
        const PrismaClient = require('@prisma/client');
        global.__db = new PrismaClient.PrismaClient();
      }
      db = global.__db;
    } else {
      const PrismaClient = require('@prisma/client');

      db = new PrismaClient.PrismaClient();
 
    }
  }
  return db;
}