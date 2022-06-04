import { initializeApp, ServiceAccount, App, getApp, cert} from 'firebase-admin/app';
import {Buffer} from 'buffer';
export function getFirebaseAdmin() {
	const serviceAccount = {
		"type": "service_account",
		"project_id": process.env.F_PROJECT_ID,
		"private_key_id": process.env.F_PRIVATE_KEY_ID,
		"private_key": Buffer.from(process.env.F_PRIVATE_KEY || '', 'base64').toString(),
		"client_email": process.env.F_CLIENT_EMAIL,
		"client_id": process.env.F_CLIENT_ID,
		"auth_uri": process.env.F_AUTH_URI,
		"token_uri": process.env.F_TOKEN_URI,
		"auth_provider_x509_cert_url": process.env.F_AUTH_PROVIDER_X509_CERT_URL,
		"client_x509_cert_url": process.env.F_CLIENT_X509_CERT_URL
	  }
	let app: App | null = null;
	try {
		app = getApp();
	} catch (e) {

	}
	if (!app) {
		app = initializeApp({
			credential: cert(serviceAccount as ServiceAccount)
		});
	}
	return app;
}
