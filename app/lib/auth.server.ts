
import type {
	Prisma,
	User,
	Reservation
} from '@prisma/client';
import { getDB } from '~/lib/db.server';

import * as cookie from 'cookie';
import { nanoid } from 'nanoid';
import { cookieName } from '~/config';
export const getDecodedToken = async (
	request: any
): Promise<any | null> => {
	const cookieHeader = request.headers.get('Cookie');
	const token = cookieHeader
		? cookie.parse(cookieHeader)[cookieName]
		: null;

	let decodedToken = null;
	try {
		decodedToken = token ? null : null;
	} catch (e) {
		console.error('error decoding token', e);
	}

	return decodedToken;
};

export const isAuthenticated = async (
	request: any,
	validateAndReturnUser: boolean = false
): Promise<{ user: any | null } | any> => {
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
	decodedToken: any | null,
	updateUser = false
): Promise<{
	user?: UserWithReservations | null;
	error?: any;
	created: boolean;
}> => {
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
			let userRecord: any | null = null;
			try {
				userRecord = null;
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
