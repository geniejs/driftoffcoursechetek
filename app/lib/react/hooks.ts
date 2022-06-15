import type { EffectCallback} from 'react';
import { useCallback, useRef } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Auth, AuthError, RecaptchaVerifier } from '@firebase/auth';
import {
	PhoneAuthProvider,
	updatePhoneNumber as fbUpdatePhoneNumber,
} from '@firebase/auth';
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fun: EffectCallback) => useEffect(fun, []);
export declare type UpdatePhoneHook<M> = [
	M,
	string,
	React.Dispatch<React.SetStateAction<string | undefined>>,
	boolean,
	AuthError | Error | undefined
];

export type UpdatePhoneNumberHook = UpdatePhoneHook<
	(phone: string, applicationVerifier: RecaptchaVerifier) => Promise<void>
>;

export const useUpdatePhoneNumber = (auth: Auth): UpdatePhoneNumberHook => {
	const [error, setError] = useState<AuthError>();
	const [loading, setLoading] = useState<boolean>(false);
	const [verificationCode, setVerificationCode] = useState<string>();
	const [verificationId, setVerificationId] = useState('');
	const updatePhoneNumber = async (
		phone: string,
		applicationVerifier: RecaptchaVerifier
	) => {
		setLoading(true);
		setError(undefined);
		try {
			if (auth.currentUser) {
				const provider = new PhoneAuthProvider(auth);
				const verificationId = await provider.verifyPhoneNumber(
					phone,
					applicationVerifier
				);
				setVerificationId(verificationId);
			} else {
				setError(new Error('No user is logged in') as AuthError);
			}
		} catch (err) {
			setError(err as AuthError);
		}
	};

	useEffect(() => {
		// Obtain the verificationCode from the user.

		if (verificationCode) {
			setLoading(true);
			setError(undefined);
			const update = async () => {
				try {
					if (auth.currentUser) {
						const phoneCredential = PhoneAuthProvider.credential(
							verificationId,
							verificationCode
						);

						await fbUpdatePhoneNumber(auth.currentUser, phoneCredential);
					} else {
						setError(new Error('No user is logged in') as AuthError);
					}
				} catch (err) {
					setError(err as AuthError);
				} finally {
					setLoading(false);
				}
			};
			update();
		}
	}, [auth.currentUser, verificationCode, verificationId]);

	return useMemo<UpdatePhoneNumberHook>(() => [
		updatePhoneNumber,
		verificationId,
		setVerificationCode,
		loading,
		error,
	], [
		updatePhoneNumber,
		verificationId,
		setVerificationCode,
		loading,
		error,
	]);
};

