import type { AuthError, UserCredential } from "@firebase/auth";
import {
  AuthErrorCodes,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  linkWithRedirect,
  PhoneAuthProvider,
  getRedirectResult,
} from "@firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
  useAuthState,
  useUpdateEmail,
  useUpdateProfile,
  useUpdatePassword,
} from "react-firebase-hooks/auth";
import EditInput from "~/components/EditInput";
import FirebaseAuth from "react-firebaseui/FirebaseAuth";
import {
  getRecaptchaVerifier,
  googleProviderSettings,
  phoneProvider,
  uiConfig,
} from "~/config.client";
import React from "react";
import { login } from "~/utils";
import {
	IoAlertCircleOutline,
	IoCloseCircleSharp,
	IoCloseSharp,
} from 'react-icons/io5';
import FacebookButton from '~/components/buttons/Facebook';
import GoogleButton from '~/components/buttons/Google';
import { useUpdatePhoneNumber } from '~/lib/react/hooks';
import { useFetcher } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import LoadingSpinner from '~/components/LoadingSpinner';

export let meta: MetaFunction = () => {
	return {
		title: 'Drift Off Course',
		description: 'Chetek, WI Boat Rental',
	};
};

const getErrorMessage = (
	message = 'Something went wrong. Please try again later.'
) => {
	message = message
		.replace(/firebase:?\s?/gi, '')
		.replace(/\(.*\)/gi, '')
		.replace('.', '');
	return message;
};
export default function ProfileEdit() {
	const auth = getAuth();

	const facebookProvider = new FacebookAuthProvider();
	const googleProvider = new GoogleAuthProvider();

	const [user, loading] = useAuthState(auth);
	const [displayName, setDisplayName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [email, setEmail] = useState('');
	const [emailUpdatingManual, setEmailUpdatingManual] = useState(false);
	const [emailUpdated, setEmailUpdated] = useState(false);
	const [updateEmailFB, emailUpdating, emailError] = useUpdateEmail(auth);
	const [updateProfile, profileUpdating, profileError] = useUpdateProfile(auth);
	const [updatePassword, passwordUpdating, passwordError] =
		useUpdatePassword(auth);
	const [
		updatePhoneNumber,
		verificationId,
		setVerificationCode,
		phoneNumberLoading,
		phoneNumberError,
	] = useUpdatePhoneNumber(auth);
	const [providers, setProviders] = useState<string[]>([]);
	const [showLogin, setShowLogin] = useState(false);
	const [changePassword, setChangePassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const fetcher = useFetcher();
	const modalToggle = React.createRef<HTMLInputElement>();
	const passwordInput = React.createRef<HTMLInputElement>();
	useEffect(() => {
		if (!loading && user?.email) {
			setEmail(user.email);
		}
	}, [user?.email, loading]);

	useEffect(() => {
		const checkRedirectResult = async () => {
			try {
				await getRedirectResult(auth);
			} catch (e: any) {
				let message = e.message;
				if (message.includes('credential-already-in-use')) {
					message = 'Another user is already registered with that account';
				}
				setErrorMessage(getErrorMessage(message));
			}
		};
		checkRedirectResult();
	}, [auth]);

	useEffect(() => {
		if (!loading && user?.displayName) {
			setDisplayName(user.displayName);
		}
		if (!loading && user?.phoneNumber) {
			setPhoneNumber(user?.phoneNumber);
		}
	}, [user?.displayName, user?.phoneNumber, loading]);
	useEffect(() => {
		if (!loading && user?.providerData) {
			setProviders(user?.providerData.flatMap((data) => data.providerId));
		}
	}, [user?.providerData, loading]);

	const updateEmail = useCallback(
		async (newEmail = '') => {
			if (user?.isAnonymous) {
				if (!changePassword) {
					setChangePassword(true);
				} else if (newEmail && !passwordUpdating && !emailUpdating) {
					const password = passwordInput.current?.value;
					if (!password) {
						throw new Error('Please set a password');
					} else {
						await updatePassword(password!);
						setEmail(newEmail);
						throw new Error('');
					}
				} else if (passwordError) {
					throw passwordError;
				} else if (emailError) {
					throw emailError;
				}
			} else if (newEmail) {
				await updateEmailFB(newEmail);
			}
		},
		[
			changePassword,
			emailError,
			emailUpdating,
			passwordError,
			passwordInput,
			passwordUpdating,
			updateEmailFB,
			updatePassword,
			user?.isAnonymous,
		]
	);

	//update email after updating password if necessary
	useEffect(() => {
		if (!passwordError && !passwordUpdating && email && email !== user?.email) {
			updateEmailFB(email);
			setEmailUpdatingManual(true);
		}
		if (
			emailUpdatingManual &&
			!emailUpdating &&
			!emailError &&
			email === user?.email
		) {
			setEmailUpdated(true);
			setErrorMessage('');
		}
	}, [
		email,
		emailError,
		emailUpdating,
		emailUpdatingManual,
		passwordError,
		passwordUpdating,
		updateEmailFB,
		user?.email,
	]);

	const updateDisplayName = useCallback(
		async (newDisplayName) => {
			await updateProfile({ displayName: newDisplayName });
		},
		[updateProfile]
	);
	const updatePhoneNumberCall = useCallback(
		async (newPhoneNumber) => {
			if (!verificationId) {
				updatePhoneNumber(newPhoneNumber, getRecaptchaVerifier('phoneSignIn'));
			}
		},
		[updatePhoneNumber, verificationId]
	);
	const onSuccess = useCallback(() => {
		if (user && !user.isAnonymous) {
			login(user, fetcher);
		}
		setShowLogin(false);
		modalToggle.current!.checked = false;
	}, [user, fetcher, modalToggle]);
	const onError = useCallback(
		(error: AuthError, label?: string) => {
			return new Promise<void>((resolve, reject) => {
				if (error) {
					if (
						modalToggle &&
						!modalToggle.current?.checked &&
						error?.code === AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN
					) {
						uiConfig.signInOptions = [];
						if (providers?.includes(EmailAuthProvider.PROVIDER_ID)) {
							uiConfig.signInOptions.push(EmailAuthProvider.PROVIDER_ID);
						}
						if (providers?.includes(GoogleAuthProvider.PROVIDER_ID)) {
							uiConfig.signInOptions.push(googleProviderSettings);
						}
						if (providers?.includes(FacebookAuthProvider.PROVIDER_ID)) {
							uiConfig.signInOptions.push(FacebookAuthProvider.PROVIDER_ID);
						}
						if (providers?.includes(TwitterAuthProvider.PROVIDER_ID)) {
							uiConfig.signInOptions.push(TwitterAuthProvider.PROVIDER_ID);
						}
						if (providers?.includes(PhoneAuthProvider.PROVIDER_ID)) {
							uiConfig.signInOptions.push(phoneProvider);
						}
						uiConfig.signInFlow = 'popup';
						uiConfig.callbacks!.signInSuccessWithAuthResult = (
							authResult: UserCredential
						) => {
							if (authResult.user) {
								resolve();
							} else {
								reject();
							}
							return false;
						};
						setShowLogin(true);
						modalToggle.current!.checked = true;
						//
					} else {
						setErrorMessage(getErrorMessage(error.message));
						reject();
					}
				} else {
					setErrorMessage(getErrorMessage());
					reject();
				}
			});
		},
		[modalToggle, providers]
	);
	return (
		<div className=" card mx-auto mb-4 w-full bg-primary bg-opacity-70 shadow-xl">
			{(loading || fetcher.state !== 'idle') && <LoadingSpinner />}

			<div className="card-body">
				<div className="profile-detail my-4 flex w-full flex-col place-items-center">
					{errorMessage && (
						<div className="alert alert-error mb-4 shadow-lg">
							<div>
								<IoCloseCircleSharp className="text-lg" />
								<span>{errorMessage}</span>
							</div>
							<div className="flex-none">
								<button
									className="btn btn-ghost btn-sm"
									onClick={() => setErrorMessage('')}
								>
									<IoCloseSharp className="text-2xl" />
								</button>
							</div>
						</div>
					)}
					<div className="flex w-full flex-col gap-4">
						{user && !user.isAnonymous && (
							<EditInput
								label="Name"
								value={displayName}
								editFunction={updateDisplayName}
								updating={profileUpdating}
								error={profileError}
								onSuccess={onSuccess}
								onError={onError}
							></EditInput>
						)}
						<EditInput
							label="Phone"
							value={phoneNumber}
							editFunction={updatePhoneNumberCall}
							updating={phoneNumberLoading}
							error={phoneNumberError}
							onSuccess={onSuccess}
							onError={onError}
							btnId="phoneSignIn"
							editModeNotice={
								<div className="alert alert-info mb-4 shadow-lg">
									<div>
										<IoAlertCircleOutline size={'2em'} />
										<span>
											We may already have a phone number on file for you (if not
											we will ask at booking) but setting your phone number here
											will enable you to login to your account using it!
										</span>
									</div>
								</div>
							}
						></EditInput>
						{verificationId && phoneNumberLoading && (
							<EditInput
								label="Phone Verification Code"
								editFunction={(verificationCode) => {
									setVerificationCode(verificationCode);
								}}
								updating={false}
								error={phoneNumberError}
								onSuccess={onSuccess}
								onError={onError}
								editMode={true}
							></EditInput>
						)}
						<EditInput
							label="Email"
							value={email}
							editFunction={updateEmail}
							onEnterEdit={updateEmail}
							updating={emailUpdating}
							error={emailError}
							onSuccess={onSuccess}
							setSuccess={emailUpdated}
							onError={onError}
						></EditInput>
						{!changePassword &&
							providers?.includes(EmailAuthProvider.PROVIDER_ID) && (
								<button
									className="btn w-full md:w-1/2"
									onClick={() => {
										setChangePassword(true);
									}}
								>
									Change Password
								</button>
							)}
						{changePassword && (
							<EditInput
								label="Password"
								editFunction={updatePassword}
								updating={passwordUpdating}
								error={passwordError}
								editMode={changePassword}
								onSuccess={onSuccess}
								onError={onError}
								hideSave={user?.isAnonymous}
								inputRef={passwordInput}
							></EditInput>
						)}
						<div className="divider"></div>
						<div className="flex w-full flex-wrap gap-4">
							{user && !providers?.includes(FacebookAuthProvider.PROVIDER_ID) && (
								<button
									onClick={async () => {
										await linkWithRedirect(user, facebookProvider);
									}}
								>
									<FacebookButton text="Connect Facebook Account"></FacebookButton>
								</button>
							)}
							{user && !providers?.includes(GoogleAuthProvider.PROVIDER_ID) && (
								<button
									onClick={async () => {
										await linkWithRedirect(user, googleProvider);
									}}
								>
									<GoogleButton text="Connect Google Account"></GoogleButton>
								</button>
							)}
							{user &&
								!user.isAnonymous &&
								!providers?.includes(EmailAuthProvider.PROVIDER_ID) && (
									<button
										className="btn"
										onClick={() => {
											setChangePassword(true);
										}}
									>
										Set a password
									</button>
								)}
						</div>
					</div>

					{/* For login popup */}
					<input
						ref={modalToggle}
						type="checkbox"
						id="my-modal-4"
						className="modal-toggle"
					/>
					{showLogin && (
						<label htmlFor="my-modal-4" className="modal cursor-pointer">
							<label className="modal-box relative" htmlFor="">
								<label
									htmlFor="my-modal-4"
									className="btn btn-circle btn-sm absolute right-2 top-2"
								>
									✕
								</label>
								<h3 className="text-lg font-bold">
									Re-login to change profile data
								</h3>
								<FirebaseAuth
									uiConfig={uiConfig}
									firebaseAuth={auth}
								></FirebaseAuth>
							</label>
						</label>
					)}
				</div>
			</div>
		</div>
	);
}
