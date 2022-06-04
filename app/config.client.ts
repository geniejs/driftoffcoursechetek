import * as firebaseui from 'firebaseui';

import {
	EmailAuthProvider,
	FacebookAuthProvider,
	getAuth,
	GoogleAuthProvider,
	PhoneAuthProvider,
	RecaptchaVerifier,
	TwitterAuthProvider,
	UserCredential,
} from '@firebase/auth';

export const googleProviderSettings = {
	// Google provider must be enabled in Firebase Console to support one-tap
	// sign-up.
	provider: GoogleAuthProvider.PROVIDER_ID,
	// Required to enable ID token credentials for this provider.
	// This can be obtained from the Credentials page of the Google APIs
	// console. Use the same OAuth client ID used for the Google provider
	// configured with GCIP or Firebase Auth.
	clientId:
		'967532590688-p1rk6fi8f78v2ol6v6m1nhlk60c280a3.apps.googleusercontent.com',
};
export const phoneProvider = {
	provider: PhoneAuthProvider.PROVIDER_ID,
	recaptchaParameters: {
		type: 'image', // 'audio'
		size: 'invisible', // 'normal' or 'invisible' or 'compact'
		//badge: 'bottomleft', //' bottomright' or 'inline' applies to invisible.
	},
	defaultCountry: 'US', // Set default country to the United Kingdom (+44).
	// For prefilling the national number, set defaultNationNumber.
	// This will only be observed if only phone Auth provider is used since
	// for multiple providers, the NASCAR screen will always render first
	// with a 'sign in with phone number' button.
	defaultNationalNumber: '1234567890',
	// You can also pass the full phone number string instead of the
	// 'defaultCountry' and 'defaultNationalNumber'. However, in this case,
	// the first country ID that matches the country code will be used to
	// populate the country selector. So for countries that share the same
	// country code, the selected country may not be the expected one.
	// In that case, pass the 'defaultCountry' instead to ensure the exact
	// country is selected. The 'defaultCountry' and 'defaultNationaNumber'
	// will always have higher priority than 'loginHint' which will be ignored
	// in their favor. In this case, the default country will be 'GB' even
	// though 'loginHint' specified the country code as '+1'.
	//loginHint: '+11234567890',
	// You can provide a 'whitelistedCountries' or 'blacklistedCountries' for
	// countries to select. It takes an array of either ISO (alpha-2) or
	// E164 (prefix with '+') formatted country codes. If 'defaultCountry' is
	// not whitelisted or is blacklisted, the default country will be set to
	// the first country available (alphabetical order). Notice that
	// 'whitelistedCountries' and 'blacklistedCountries' cannot be specified
	// at the same time.
	//whitelistedCountries: ['US', '+44']
};
export const uiConfig: firebaseui.auth.Config = {
	// Popup ?
	signInFlow: 'redirect',
	// Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
	signInSuccessUrl: '/profile',
	callbacks: {
		signInSuccessWithAuthResult: (authResult: UserCredential, redirectUrl) => {
			return true;
		},
	},
	// We will display Google and Facebook as auth providers.
	signInOptions: [
		EmailAuthProvider.PROVIDER_ID,
		googleProviderSettings,
		FacebookAuthProvider.PROVIDER_ID,
		// TwitterAuthProvider.PROVIDER_ID,
		PhoneAuthProvider.PROVIDER_ID,
	],
	// Required to enable one-tap sign-up credential helper.
	credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
};
let recaptchaVerifiers: Record<string, RecaptchaVerifier> = {};

export const getRecaptchaVerifier = (id: string) => {
	recaptchaVerifiers[id] =
		recaptchaVerifiers[id] ||
		new RecaptchaVerifier(
			id,
			{
				size: 'invisible',
			},
			getAuth()
		);
	return recaptchaVerifiers[id];
};

export const paypalClientId =
	'AVHATW2solmhxQQ-kR0nrwRxW6vU-M43B8ke_MIlhbNNbGCCMadbRQHOkV-WvOlZ9cH_rbdKnYF9MDg2';
