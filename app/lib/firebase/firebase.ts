import { FirebaseApp, getApp, initializeApp } from "@firebase/app";

export async function getFirebaseClient() {
	let app: FirebaseApp;
	try {
		app = getApp();
	} catch (e) {
		const firebaseConfig = {
			apiKey: "AIzaSyAnwSdp_-OR0teziMObkbwERjzdZ1bRqmo",
			authDomain: "rental-88157.firebaseapp.com",
			projectId: "rental-88157",
			storageBucket: "rental-88157.appspot.com",
			messagingSenderId: "967532590688",
			appId: "1:967532590688:web:ff2dcc887cbb3e8ee43505",
			measurementId: "G-FBPWJRZVY8",
			// databaseURL: 'https://sveltefirets.firebaseio.com',
		};
		app = initializeApp(firebaseConfig);
	}
	return app;
}
