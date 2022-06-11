import { Link, Outlet, useNavigate, useSearchParams } from '@remix-run/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from '@firebase/auth';
import SiteLayout from '~/components/SiteLayout';
import { useEffect } from 'react';
import { IoLogOutSharp } from 'react-icons/io5';

export default function Profile() {
	const [user, loading, error] = useAuthState(getAuth());
	let navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		if (!user && !loading) {
			navigate('/login?sendto=/profile');
		}
	}, [user, loading, navigate]);
	useEffect(() => {
		const sendTo = searchParams.get('sendto');
		if (sendTo && (!user || user?.isAnonymous)) {
			navigate(sendTo);
		}
	}, [navigate, searchParams]);
	return (
		<div className="relative flex max-w-5xl flex-col">
			<div className="flex flex-col place-items-center py-8">
				{/* <div>
						{user?.photoURL && (
							<div className="mt-2 text-center">
								<div className="flex flex-col items-center gap-3 space-x-6">
									<div className="shrink-0">
										<img
											className="h-36 w-36 rounded-full object-cover shadow-lg"
											src={`${user?.photoURL}`}
											alt={user?.displayName || ''}
										/>
									</div>
								</div>
							</div>
						)}
					</div> */}
				<h2 className="mb-1 text-4xl">
					{user?.displayName || user?.email}
					{user?.isAnonymous && (
						<div className="align-content-center flex">
							<span>
								You are current a guest, create a permanent account below or{' '}
								<Link className="link" to="/logout?sendto=/login">
									click here if you already have one
								</Link>
							</span>
						</div>
					)}
				</h2>
			</div>
			<Outlet />

			{user && !user.isAnonymous && (
				<Link
					className="btn btn-secondary w-1/2 self-end md:w-1/4"
					to="/logout"
				>
					<IoLogOutSharp />
					&nbsp;Sign Out
				</Link>
			)}
		</div>
	);
}
