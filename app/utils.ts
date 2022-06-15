import type { User } from "@firebase/auth";
import { cookieName } from "~/config";
import type { ImageSizeMeta } from "./components/Carousel";
import type { ReservableResponse } from "./lib/reservables.db.server";
import { getReservables } from "./lib/reservables.db.server";
import type { ReservationsResponse } from "./lib/reservations.db.server";
import { getReservations } from "./lib/reservations.db.server";

import type { FetcherWithComponents } from "./lib/types";

export const isServer = typeof document === "undefined";
export const isClient = typeof document !== "undefined";
export const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV !== "production";
export const login = async (
  user: User,
  fetcher: FetcherWithComponents<any>
) => {
  try {
    const idToken = await user.getIdToken(true);
    setCookie(cookieName, idToken, 14);
    fetcher.submit({}, { method: "post", action: "/account" });
  } catch {
    setCookie(cookieName, "", 0);
  }
};

export const logout = async (fetcher: FetcherWithComponents<any>) => {
  try {
    setCookie(cookieName, "", 0);
    fetcher.submit({}, { method: "post", action: "/logout" });
  } catch {
    setCookie(cookieName, "", 0);
  }
};

export const setCookie = (cname: string, cvalue: string, exdays: number) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
    return new Date(isoString.split("T")[0] + "T12:00:00Z");
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
		Map<
			string,
			{
				cost: number;
				minDays: number;
			}
		>
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

export const getMinDays = (
	priceAdjustments: ReservableResponse['priceAdjustment']
) => {
	const minDays = [1, 1, 1, 1, 1, 1, 1];
	if (priceAdjustments && priceAdjustments.length) {
		priceAdjustments.forEach((priceAdjustment) => {
			if (priceAdjustment.minDays) {
				if (priceAdjustment.sun) {
					minDays[0] = Math.max(minDays[0], priceAdjustment.minDays);
				}
				if (priceAdjustment.mon) {
					minDays[1] = Math.max(minDays[1], priceAdjustment.minDays);
				}
				if (priceAdjustment.tue) {
					minDays[2] = Math.max(minDays[2], priceAdjustment.minDays);
				}
				if (priceAdjustment.wed) {
					minDays[3] = Math.max(minDays[3], priceAdjustment.minDays);
				}
				if (priceAdjustment.thu) {
					minDays[4] = Math.max(minDays[4], priceAdjustment.minDays);
				}
				if (priceAdjustment.fri) {
					minDays[5] = Math.max(minDays[5], priceAdjustment.minDays);
				}
				if (priceAdjustment.sat) {
					minDays[6] = Math.max(minDays[6], priceAdjustment.minDays);
				}
			}
		});
	}
	return minDays;
};

export const getReservableDates = (
	reservable: ReservableResponse,
	reservations: ReservationsResponse[]
) => {
	const today = normalizeDate(new Date()) as Date;

	const reservableDates = new Map<string, { cost: number; minDays: number }>();
	const reservableAdjusmtments = getPriceAdjustments(
		reservable.priceAdjustment
	);
	const reservablMinDays = getMinDays(reservable.priceAdjustment);
	reservable.availabilityInclude?.forEach((include) => {
		let currDate = normalizeDate(include.startDate) as Date;
		const endDate = normalizeDate(include.endDate) as Date;
		const cost = include.cost;
		if (currDate < today && cost) {
			currDate = today;
		}
		const includeAdjusmtments = getPriceAdjustments(include.priceAdjustment);
		const includeMinDays = getMinDays(include.priceAdjustment);
		while (currDate <= endDate && cost) {
			let adjustment =
				reservableAdjusmtments[currDate.getUTCDay()] +
				includeAdjusmtments[currDate.getUTCDay()];

			if (
				reservableDates.get(currDate.toUTCString()) ||
				-1 < cost + adjustment
			) {
				reservableDates.set(currDate.toUTCString(), {
					cost: cost + adjustment,
					minDays: Math.max(
						reservablMinDays[currDate.getUTCDay()],
						includeMinDays[currDate.getUTCDay()]
					),
				});
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
		[...reservableDates].sort(
			(
				a: [
					string,
					{
						cost: number;
						minDays: number;
					}
				],
				b: [
					string,
					{
						cost: number;
						minDays: number;
					}
				]
			) => (new Date(a[0]) < new Date(b[0]) ? -1 : 1)
		)
	);
};

export const getYMDStr = (date: Date | undefined | null) => {
	date = typeof date !== 'object' ? normalizeDate(date) : date;
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

export const getMinDaysForRange = (
	startDate: Date,
	endDate: Date | null,
	datesWithCost: Map<string, { cost: number; minDays: number }>
) => {
	startDate = normalizeDate(startDate)!;
	endDate = normalizeDate(endDate || startDate);
	let minDays = 1;
	let currDate = normalizeDate(startDate) as Date;
	while (currDate <= endDate!) {
		const currMinDays = datesWithCost.get(currDate.toUTCString())?.minDays || 1;
		minDays = Math.max(minDays, currMinDays);
		currDate.setUTCDate(currDate.getUTCDate() + 1);
	}
	return minDays;
};
const ONE_DAY = 1000 * 60 * 60 * 24;

export const getTotalDaysInRange = (startDate: Date, endDate: Date | null) => {
	startDate = normalizeDate(startDate)!;
	endDate = normalizeDate(endDate || startDate);
	const differenceMs = Math.abs(endDate!.getTime() - startDate.getTime());
	return Math.round(differenceMs / ONE_DAY) + 1;
};

export const getValidEndDate = (
	minDays: number,
	startDate: Date,
	endDate: Date | null
) => {
	startDate = normalizeDate(startDate)!;
	endDate = normalizeDate(endDate || startDate);
	if (minDays > 1) {
		const totalDays = getTotalDaysInRange(startDate, endDate);
		if (totalDays < minDays) {
			const currStart = normalizeDate(startDate) as Date;
			currStart.setUTCDate(currStart.getUTCDate() + (minDays - 1));
			return currStart;
		}
	}
	return endDate!;
};

export type AvailabilityResponse = ReservableResponse & {
	isAvail?: boolean;
	availDates?: string[];
	unavailDates?: string[];
	costs?: number[];
	totalCost?: number;
	minDays?: number;
	startDate?: Date;
	endDate?: Date;
};

export const getReservableAvailabilityResponse = (
	initialStartDate: Date | string,
	endDateDate: Date | string,
	availability: Map<
		string,
		{
			cost: number;
			minDays: number;
		}
	>,
	reservable: ReservableResponse,
	checkMinDays = true
): AvailabilityResponse => {
	const availDates: string[] = [];
	const unavailDates: string[] = [];
	const costs: number[] = [];
	initialStartDate = normalizeDate(initialStartDate) as Date;
	const startDateDate = normalizeDate(initialStartDate) as Date;
	endDateDate = new Date(endDateDate);
	let minDays = 1;
	if (checkMinDays) {
		minDays = getMinDaysForRange(startDateDate, endDateDate, availability);
		const validEndDate = getValidEndDate(minDays, startDateDate, endDateDate);
		if (validEndDate?.getTime() !== endDateDate.getTime()) {
			endDateDate = validEndDate;
		}
	}

	let startDate = startDateDate.toUTCString();

	let totalCost: number = 0;
	while (startDateDate <= endDateDate) {
		if (availability.has(startDate)) {
			availDates.push(getMDYStr(startDateDate));
			costs.push(availability.get(startDate)?.cost || 0);
			totalCost += availability.get(startDate)?.cost || 0;
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
		minDays,
		startDate: initialStartDate,
		endDate: endDateDate,
		totalCost,
	};
};

export const getReservablesAvailabilityByDate = async (
	startDate: string,
	endDate: string,
	reservables?: ReservableResponse[],
	reservations?: ReservationsResponse[]
) => {
	let availabilityResponse: AvailabilityResponse[] = reservables || [];

	if (startDate && endDate) {
		availabilityResponse = [];
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
	checkMinDays = true
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
				reservable,
				checkMinDays
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
  base = base || "https://assets.geniecloud.xyz/rental/";
  const size = maxWidth < img.width ? "full" : img.size;
  return `${base}${img.id}_${size}.${img.extension}`;
};
