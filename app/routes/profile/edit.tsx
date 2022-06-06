// import type { LoaderFunction } from '@remix-run/cloudflare';
// import { redirect } from '@remix-run/cloudflare';
// import { useLoaderData } from '@remix-run/react';
// import { isAuthenticated, getUserByRequestToken } from '~/lib/auth.server';
// import type { User } from '~/../prisma/node_modules/.prisma/client';

// export let loader: LoaderFunction = async ({ request }) => {
// 	const url = new URL(request.url);

// 	if (!(await isAuthenticated(request)))
// 		return redirect(`/account?sendto=${url.pathname}`);
// 	const { user } = await getUserByRequestToken(request);
// 	if (!user) {
// 		return redirect(`/account?sendto=${url.pathname}`);
// 	}
// 	return { user };
// };

// export default function ProfileEdit() {
// 	const { user } = useLoaderData<{ user?: User }>();
// 	return <div>{user?.name}</div>;
// }
