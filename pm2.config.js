require('dotenv').config();

module.exports = {
	apps: [
		{
			name: 'Prisma',
			script: 'prisma generate --data-proxy',
			watch: ['./prisma'],
			autorestart: false,
			env: {
				...process.env,
				PRISMA_CLIENT_ENGINE_TYPE: 'dataproxy',
				NODE_ENV: process.env.NODE_ENV ?? 'development',
			},
		},
		{
			name: 'Tailwind',
			script:
				'tailwindcss -i ./app/tailwindInput.css -o ./app/tailwind.css --watch',
			ignore_watch: ['.'],
			env: {
				...process.env,
				NODE_ENV: process.env.NODE_ENV ?? 'development',
			},
		},
		{
			name: 'Remix',
			script: 'remix watch',
			ignore_watch: ['.'],
			env: {
				...process.env,
				NODE_ENV: process.env.NODE_ENV ?? 'development',
				DATABASE_URL: process.env.DATABASE_URL,
				CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
			},
		},
		{
			name: 'Wrangler',
			script: 'npx wrangler pages dev ./public',
			ignore_watch: ['.'],
			env: {
				...process.env,
				NODE_ENV: process.env.NODE_ENV ?? 'development',
				BROWSER: 'none',
				DATABASE_URL: process.env.DATABASE_URL,
				CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
			},
		},
	],
};
