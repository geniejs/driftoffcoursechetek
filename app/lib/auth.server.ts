import type { UserRecord, DecodedIdToken } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdmin } from './firebase/firebase.server';
import type {
	Prisma,
	User,
	Reservation,
	PrismaClient,
	PhoneNumber,
} from '@prisma/client';
import { getDB } from '~/lib/db.server';

import * as cookie from 'cookie';
import { nanoid } from 'nanoid/non-secure';
import { cookieName } from '~/config';
export const getDecodedToken = async (
	request: any
): Promise<DecodedIdToken | null> => {
	getFirebaseAdmin();
	const cookieHeader = request?.headers?.get('Cookie');
	const token = cookieHeader ? cookie.parse(cookieHeader)[cookieName] : null;
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
			phoneNumbers: PhoneNumber[];
	  })
	| null;
export const getUserByToken = async (
	decodedToken: DecodedIdToken | null,
	updateUser = false,
	request?: Request
): Promise<{
	user?: UserWithReservations | null;
	error?: any;
	created: boolean;
}> => {
	getFirebaseAdmin();
	const db = getDB() as PrismaClient;

	let created = false;
	let user: UserWithReservations | null = null;
	let error = null;
	let operation = '';
	let rName: string | undefined = '';
	let rEmail: string | undefined = '';
	let rPhone: string | undefined = '';

	if (request) {
		try {
			const data: Record<string, string> | undefined = await request.json();
			rName = data?.name;
			rEmail = data?.email;
			rPhone = data?.phone;
			if (rName || rEmail || rPhone) {
				updateUser = true;
			}
		} catch {}
	}

	if (!error && decodedToken) {
		const firebaseId = decodedToken.uid;
		try {
			user = await db.user.findUnique({
				where: { firebaseId },
				include: {
					reservations: true,
					phoneNumbers: true,
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
			if (userRecord || firebaseId) {
				const phoneNumbers =
					userRecord?.phoneNumber || rPhone
						? {
								connectOrCreate: {
									where: {
										value: userRecord?.phoneNumber || rPhone,
									},
									create: {
										type: 'mobile',
										value: userRecord?.phoneNumber || rPhone,
									},
								},
						  }
						: undefined;
				if (operation === 'create') {
					const data: Prisma.UserCreateInput = {
						id: nanoid(),
						name: userRecord?.displayName || rName || '',
						email: userRecord?.email || rEmail || `${firebaseId}@anonuser`,
						firebaseId,
						phoneNumbers,
					};

					try {
						user = await db.user.create({
							data,
							include: {
								reservations: true,
								phoneNumbers: true,
							},
						});
						created = true;
					} catch (e) {
						console.error(e);
						error = e;
					}
				} else if (operation === 'update') {
					const data: Prisma.UserUpdateInput = {
						name: userRecord?.displayName || '',
						email: userRecord?.email || '',
						phoneNumbers,
					};
					try {
						user = await db.user.update({
							data,
							where: { firebaseId },
							include: {
								reservations: true,
								phoneNumbers: true,
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
export const getUserByRequestToken = async (
	request: Request,
	updateUser = false
) => await getUserByToken(await getDecodedToken(request), updateUser, request);
