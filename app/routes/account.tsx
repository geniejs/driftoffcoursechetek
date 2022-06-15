import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, signInAnonymously } from "firebase/auth";
import { useEffect } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
	Outlet,
	useFetcher,
	useLoaderData,
	useLocation,
	useNavigate,
	useSearchParams,
} from '@remix-run/react';
import {
	isAuthenticated,
	getUserByRequestToken,
	UserWithReservations,
} from '~/lib/auth.server';
import type { User } from '@prisma/client';
import { UserContext } from '~/lib/react/context';

import { login } from '~/utils';
import LoadingSpinner from '~/components/LoadingSpinner';

export let action: ActionFunction = async ({ request, context }) => {
	if (!(await isAuthenticated(request))) return redirect('/login');
	const { user, created, error } = await getUserByRequestToken(request, true);
	if (error) {
		return json({ message: error.message || error.name || error }, 500);
	}
	return json({ ...user, created });
};

export let loader: LoaderFunction = async ({ request, context }) => {
	const { user } = await getUserByRequestToken(request);
	return { user };
};

export default function Account() {
	let navigate = useNavigate();
	const { user } = useLoaderData<{ user?: UserWithReservations }>();
	const [fbUser, authLoading] = useAuthState(getAuth());
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	let location = useLocation();

	useEffect(() => {
		const allowAnonPathnames = ['/account/checkout'];
		const allowAnon =
			allowAnonPathnames.includes(location.pathname) ||
			location.pathname.includes('/booking');
		const setupAccount = async () => {
			if (!user && fbUser && fetcher.type === 'init') {
				login(fbUser, fetcher);
			} else if ((user || fetcher.data) && searchParams.get('sendto')) {
				navigate(searchParams.get('sendto') || '/', { replace: true });
			} else if (!fbUser && !authLoading && !allowAnon) {
				navigate(
					`/login?sendto=${
						searchParams.get('sendto') || location.pathname + location.search
					}`,
					{
						replace: true,
					}
				);
			} else if (!fbUser && !authLoading && allowAnon) {
				await signInAnonymously(getAuth());
			}
		};
		setupAccount();
	}, [fetcher, user, fbUser, navigate, searchParams, authLoading]);

	return (
		<UserContext.Provider value={{ user: user }}>
			<div className="accountAuthRefresh">
				{(authLoading || fetcher.state !== 'idle') && <LoadingSpinner />}
				<Outlet />
			</div>
		</UserContext.Provider>
	);
}
