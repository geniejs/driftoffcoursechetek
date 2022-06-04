import type { UserRecord, DecodedIdToken } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from './firebase/firebase.server';
import type {
	Prisma,
	User,
	Reservation
} from '@prisma/client';
import { getDB } from '~/lib/db.server';

import * as cookie from 'cookie';
import { nanoid } from 'nanoid';
import { firebaseIdCookieName } from '~/config';
export const getDecodedToken = async (
	request: any
): Promise<DecodedIdToken | null> => {
	getFirebaseAdmin();
	const cookieHeader = request.headers.get('Cookie');
	const token = cookieHeader
		? cookie.parse(cookieHeader)[firebaseIdCookieName]
		: null;

	let decodedToken = null;
	try {
		decodedToken = token ? await getAuth().verifyIdToken(token) : null;
	} catch (e) {
		console.error('error decoding token', e);
	}

	return decodedToken;
};

export const isAuthenticated = async (
	request: any,
	validateAndReturnUser: boolean = false
): Promise<{ user: UserRecord | null } | any> => {
	let authenticated = false;
	const decodedToken = await getDecodedToken(request);
	authenticated = decodedToken ? true : false;
	if (validateAndReturnUser) {
		const { user, error } = await getUserByToken(decodedToken);
		if (error) {
			authenticated = false;
		}
		return { user };
	}
	return authenticated;
};

export type UserWithReservations =
	| (User & {
			reservations: Reservation[];
	  })
	| null;
export const getUserByToken = async (
	decodedToken: DecodedIdToken | null,
	updateUser = false
): Promise<{
	user?: UserWithReservations | null;
	error?: any;
	created: boolean;
}> => {
	getFirebaseAdmin();
	let created = false;
	let user: UserWithReservations | null = null;
	let error = null;
	let operation = '';

	if (!error && decodedToken) {
		const firebaseId = decodedToken.uid;
		try {
			user = await getDB().user.findUnique({
				where: { firebaseId },
				include: {
					reservations: true,
				},
			});
			if (user && updateUser) {
				operation = 'update';
			} else if (!user && updateUser) {
				operation = 'create';
			}
		} catch (e) {
			console.error(e);
			error = e;
		}

		if (operation) {
			let userRecord: UserRecord | null = null;
			try {
				userRecord = await getAuth().getUser(firebaseId);
			} catch (e) {
				error = e;
			}
			if (userRecord) {
				const phoneNumbers = userRecord.phoneNumber
					? {
							connectOrCreate: {
								where: {
									value: userRecord.phoneNumber,
								},
								create: {
									type: 'mobile',
									value: userRecord.phoneNumber,
								},
							},
					  }
					: undefined;
				if (operation === 'create') {
					const data: Prisma.UserCreateInput = {
						id: nanoid(),
						name: userRecord.displayName || '',
						email: userRecord.email || `${firebaseId}@anonuser`,
						firebaseId,
						phoneNumbers,
					};

					try {
						user = await getDB().user.create({
							data,
							include: {
								reservations: true,
							},
						});
						created = true;
					} catch (e) {
						console.error(e);
						error = e;
					}
				} else if (operation === 'update') {
					const data: Prisma.UserUpdateInput = {
						name: userRecord.displayName || '',
						email: userRecord.email || '',
						phoneNumbers,
					};
					try {
						user = await getDB().user.update({
							data,
							where: { firebaseId },
							include: {
								reservations: true,
							},
						});
					} catch (e) {
						console.error(e);
						error = e;
					}
				}
			}
		}
	}

	return { user, error, created };
};

// @ts-ignore
export const getUserByRequestToken = async (request: any, updateUser = false) =>
	await getUserByToken(await getDecodedToken(request), updateUser);
