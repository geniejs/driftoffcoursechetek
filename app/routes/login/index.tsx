import FirebaseAuth from 'react-firebaseui/FirebaseAuth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from '@firebase/auth';
import { uiConfig } from '~/config.client';
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from 'react';
export default function Login() {
	const [fbUser, authLoading] = useAuthState(getAuth());
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	useEffect(() => {
		const sendTo = searchParams.get('sendto');
		if (fbUser && !fbUser.isAnonymous) {
			navigate(sendTo || '/');
		}
		if (sendTo) {
			uiConfig.signInSuccessUrl =
				uiConfig.signInSuccessUrl + `?sendto=${sendTo}`;
		}
	}, [fbUser, navigate, searchParams]);

	return (
		<div className=" card mx-auto w-fit bg-primary bg-opacity-70 shadow-xl">
			<div className="card-body">
				{!fbUser && !authLoading && (
					<FirebaseAuth
						uiConfig={uiConfig}
						firebaseAuth={getAuth()}
					></FirebaseAuth>
				)}
			</div>
		</div>
	);
}
