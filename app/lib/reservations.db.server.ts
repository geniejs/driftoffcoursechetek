import type {
	Reservation,
	ReservableDeposit,
	PurchaseUnit,
	Receipt,
} from '@prisma/client';
export type ReservationsResponse = {
	startDate: string;
	endDate: string | null;
	reservableId: string | null;
};
import { getDB } from '~/lib/db.server';

export const getReservations = async (): Promise<ReservationsResponse[]> => {
	const response = (await getDB().reservation.findMany({
		select: {
			startDate: true,
			endDate: true,
			reservableId: true,
		},
	})) as unknown as ReservationsResponse[];
	return response;
};

export type ReservationResponse =
	| (Reservation & {
			receipt:
				| (Receipt & {
						purchaseUnits: (PurchaseUnit & {
							deposit: ReservableDeposit | null;
						})[];
				  })
				| null;
	  })
	| null;

export const getReservation = async (
	id: string
): Promise<ReservationResponse> => {
	const response = await getDB().reservation.findUnique({
		where: {
			id,
		},
		include: {
			receipt: {
				include: {
					purchaseUnits: {
						include: {
							deposit: true,
						},
					},
				},
			},
		},
	});
	return response;
};