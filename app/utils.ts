import { cookieName } from '~/config';
import type { ImageSizeMeta } from './components/Carousel';
import type { ReservableResponse } from './lib/reservables.db.server';
import { getReservables } from './lib/reservables.db.server';
import type {
	ReservationsResponse} from './lib/reservations.db.server';
import {
	getReservations
} from './lib/reservations.db.server';

import type { FetcherWithComponents } from './lib/types';

export const isServer = typeof document === 'undefined';
export const isClient = typeof document !== 'undefined';
export const isDev =
	process.env.NODE_ENV === 'development' ||
	process.env.NODE_ENV !== 'production';
export const login = async (
	user: any,
	fetcher: FetcherWithComponents<any>
) => {
	try {
		const idToken = await user.getIdToken(true);
		console.log('idToken', idToken)
		setCookie(cookieName, idToken, 14);
		fetcher.submit({}, { method: 'post', action: '/account' });
	} catch {
		setCookie(cookieName, '', 0);
	}
};

export const logout = async (fetcher: FetcherWithComponents<any>) => {
	try {
		setCookie(cookieName, '', 0);
		fetcher.submit({}, { method: 'post', action: '/logout' });
	} catch {
		setCookie(cookieName, '', 0);
	}
};

export const setCookie = (cname: string, cvalue: string, exdays: number) => {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	let expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
	if (exdays === 0) {
		document.cookie = `${cname}=''; Max-Age=0; path=/;`;
		document.cookie = `${cname}=''; Max-Age=0; path=/; domain=${location.host}`;
		document.cookie = `${cname}=''; Max-Age=0; path=/; domain=${location.hostname}`;
	}
};

export const normalizeDate = (
	isoString: string | Date | null | undefined
): Date | null => {
	if (isoString) {
		isoString = (isoString as Date).toISOString
			? (isoString as Date).toISOString()
			: isoString.toString();
		return new Date(isoString.split('T')[0] + 'T12:00:00Z');
	} else {
		return null;
	}
};

export const getReservablesAvailability = (
	reservables: ReservableResponse[],
	reservations: ReservationsResponse[]
) => {
	const reservablesAvailability = new Map<
		ReservableResponse,
		Map<string, number>
	>();
	reservables.forEach((reservable) => {
		reservablesAvailability.set(
			reservable,
			getReservableDates(reservable, reservations)
		);
	});
	return reservablesAvailability;
};

export const getPriceAdjustments = (
	priceAdjustments: ReservableResponse['priceAdjustment']
) => {
	const adjustments = [0, 0, 0, 0, 0, 0, 0];
	if (priceAdjustments && priceAdjustments.length) {
		priceAdjustments.forEach((priceAdjustment) => {
			if (priceAdjustment.adjustment) {
				if (priceAdjustment.sun) {
					adjustments[0] = adjustments[0] + priceAdjustment.adjustment;
				}
				if (priceAdjustment.mon) {
					adjustments[1] = adjustments[1] + priceAdjustment.adjustment;
				}
				if (priceAdjustment.tue) {
					adjustments[2] = adjustments[2] + priceAdjustment.adjustment;
				}
				if (priceAdjustment.wed) {
					adjustments[3] = adjustments[3] + priceAdjustment.adjustment;
				}
				if (priceAdjustment.thu) {
					adjustments[4] = adjustments[4] + priceAdjustment.adjustment;
				}
				if (priceAdjustment.fri) {
					adjustments[5] = adjustments[5] + priceAdjustment.adjustment;
				}
				if (priceAdjustment.sat) {
					adjustments[6] = adjustments[6] + priceAdjustment.adjustment;
				}
			}
		});
	}
	return adjustments;
};

export const getReservableDates = (
	reservable: ReservableResponse,
	reservations: ReservationsResponse[]
) => {
	const today = normalizeDate(new Date()) as Date;

	const reservableDates = new Map<string, number>();
	const reservableAdjusmtments = getPriceAdjustments(
		reservable.priceAdjustment
	);
	reservable.availabilityInclude?.forEach((include) => {
		let currDate = normalizeDate(include.startDate) as Date;
		const endDate = normalizeDate(include.endDate) as Date;
		const cost = include.cost;
		if (currDate < today && cost) {
			currDate = today;
		}
		const includeAdjusmtments = getPriceAdjustments(include.priceAdjustment);

		while (currDate <= endDate && cost) {
			let adjustment =
				reservableAdjusmtments[currDate.getUTCDay()] +
				includeAdjusmtments[currDate.getUTCDay()];

			if (
				reservableDates.get(currDate.toUTCString()) ||
				-1 < cost + adjustment
			) {
				reservableDates.set(currDate.toUTCString(), cost + adjustment);
			}
			currDate.setUTCDate(currDate.getUTCDate() + 1);
		}
	});
	reservable.availabilityExclude?.forEach((exclude) => {
		const currDate = normalizeDate(exclude.startDate) as Date;

		const endDate = normalizeDate(exclude.endDate) as Date;
		if (currDate < today) {
			currDate.setUTCDate(today.getUTCDate());
		}
		while (currDate <= endDate) {
			reservableDates.delete(currDate.toUTCString());
			currDate.setUTCDate(currDate.getUTCDate() + 1);
		}
	});
	reservations?.forEach((reservation) => {
		if (reservation.reservableId === reservable.id) {
			const currDate = normalizeDate(reservation.startDate) as Date;
			const endDate = reservation.endDate
				? (normalizeDate(reservation.endDate) as Date)
				: currDate;
			while (currDate <= endDate) {
				reservableDates.delete(currDate.toUTCString());
				currDate.setUTCDate(currDate.getUTCDate() + 1);
			}
		}
	});
	return new Map(
		[...reservableDates].sort((a: [string, number], b: [string, number]) =>
			new Date(a[0]) < new Date(b[0]) ? -1 : 1
		)
	);
};

export const getYMDStr = (date: Date | undefined | null) => {
	return date ? date.toISOString().split('T')[0] : '';
};

export const getMDYStr = (date: Date | undefined | null) => {
	const ymd = getYMDStr(date).split('-');
	return `${ymd[1]}/${ymd[2]}/${ymd[0]}`;
};

export const getDisplayDateRange = (
	startDate: Date,
	endDate?: Date | null,
	bang = '!'
) => {
	startDate = normalizeDate(startDate)!;
	endDate = normalizeDate(endDate);
	return ` ${getMDYStr(startDate)}${
		endDate && startDate?.toUTCString() !== endDate?.toUTCString()
			? ` - ${getMDYStr(endDate)}${bang}`
			: bang
	}`;
};

export type AvailabilityResponse = ReservableResponse & {
	isAvail?: boolean;
	availDates?: string[];
	unavailDates?: string[];
	costs?: number[];
	totalCost?: number;
};

const getReservableAvailabilityResponse = (
	startDateDate: Date,
	endDateDate: Date,
	availability: Map<string, number>,
	reservable: ReservableResponse
): AvailabilityResponse => {
	const availDates: string[] = [];
	const unavailDates: string[] = [];
	const costs: number[] = [];
	let startDate = startDateDate.toUTCString();

	let totalCost: number = 0;
	while (startDateDate <= endDateDate) {
		if (availability.has(startDate)) {
			availDates.push(getMDYStr(startDateDate));
			costs.push(availability.get(startDate) || 0);
			totalCost += availability.get(startDate) || 0;
		} else {
			unavailDates.push(getMDYStr(startDateDate));
		}
		startDateDate.setUTCDate(startDateDate.getUTCDate() + 1);
		startDate = startDateDate.toUTCString();
	}
	const isAvail = unavailDates.length === 0;

	return {
		...reservable,
		isAvail,
		availDates: availDates,
		unavailDates: !isAvail ? unavailDates : undefined,
		costs: isAvail ? costs : undefined,
		totalCost,
	};
};

export const getReservablesAvailabilityByDate = async (
	startDate: string,
	endDate: string,
	reservables?: ReservableResponse[],
	reservations?: ReservationsResponse[]
) => {
	const availabilityResponse: AvailabilityResponse[] = [];

	if (startDate && endDate) {
		const startDateDate = normalizeDate(startDate);
		const endDateDate = normalizeDate(endDate);
		if (startDateDate && endDateDate) {
			startDate = startDateDate.toUTCString();
			endDate = endDateDate.toUTCString();
			reservables = reservables || (await getReservables());
			reservations = reservations || (await getReservations());
			const reservablesAvailability = getReservablesAvailability(
				reservables,
				reservations
			);
			for (const [reservable, availability] of reservablesAvailability) {
				availabilityResponse.push(
					getReservableAvailabilityResponse(
						startDateDate,
						endDateDate,
						availability,
						reservable
					)
				);
			}
		}
	}
	return availabilityResponse;
};

export const getReservableAvailabilityByDate = async (
	startDate: string,
	endDate: string,
	reservable: ReservableResponse,
	reservations?: ReservationsResponse[],
): Promise<AvailabilityResponse | void> => {
	endDate = endDate || startDate;
	if (startDate && endDate) {
		const startDateDate = normalizeDate(startDate);
		const endDateDate = normalizeDate(endDate);
		if (startDateDate && endDateDate) {
			startDate = startDateDate.toUTCString();
			endDate = endDateDate.toUTCString();
			reservations = reservations ?? (await getReservations());
			const availability = getReservableDates(reservable, reservations);
			return getReservableAvailabilityResponse(
				startDateDate,
				endDateDate,
				availability,
				reservable
			);
		}
	}
};

export const getCancellationCost = (
	reservable: AvailabilityResponse,
	reservationCost?: number
) => {
	if (
		reservable.cancellationCost &&
		reservable.cancellationCost.cost &&
		(reservationCost || reservable.totalCost)
	) {
		const cancellationCost = reservable.cancellationCost.isPercent
			? Math.round(
					(reservationCost || reservable.totalCost || 0) *
						(reservable.cancellationCost.cost * 0.1)
			  )
			: reservable.cancellationCost.cost;

		return cancellationCost;
	}

	return undefined;
};

export const getImageUrl = (
	base: string,
	img: ImageSizeMeta,
	maxWidth: number
) => {
	base = base || 'https://assets.geniecloud.xyz/rental/';
	const size = maxWidth < img.width ? 'full' : img.size;
	return `${base}${img.id}_${size}.${img.extension}`;
};
