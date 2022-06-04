import type {
	Reservable,
	ReservableDeposit,
	ReservableTerm,
	AddressStateType,
} from '@prisma/client';
import type { CarouselImage } from '~/components/Carousel';
import type { DocumentRendererProps } from '@keystone-6/document-renderer';
import { getDB } from '~/lib/db.server';

export type ReservableResponse = Reservable & {
	images: CarouselImage[];
	description: DocumentRendererProps['document'];
	reservationNote: DocumentRendererProps['document'];
	features: { key: string; value: string }[];
	tags: { value: string }[];
	availabilityInclude?: {
		startDate: string;
		endDate: string;
		cost: number | null;
		priceAdjustment: {
			sun: boolean;
			mon: boolean;
			tue: boolean;
			wed: boolean;
			thu: boolean;
			fri: boolean;
			sat: boolean;
			adjustment: number | null;
		}[];
	}[];
	availabilityExclude?: { startDate: string; endDate: string }[];
	deposit?: (ReservableDeposit & {
		description: DocumentRendererProps['document'];
	})[];
	terms?: (ReservableTerm & {
		description: DocumentRendererProps['document'];
	})[];
	priceAdjustment: {
		sun: boolean;
		mon: boolean;
		tue: boolean;
		wed: boolean;
		thu: boolean;
		fri: boolean;
		sat: boolean;
		adjustment: number | null;
	}[];
	files?: {
		id: string;
		name: string;
		file_filename: string | null;
	}[];
	cancellationCost?: {
		cost: number | null;
		isPercent: boolean;
	};
	pickup: {
		name: string;
		address: {
			address: string;
			city: string;
			state: AddressStateType | null;
			zipCode: string;
			latitude: string;
			longitude: string;
		} | null;
	} | null;
};

const reservableInclude = {
	images: {
		select: {
			name: true,
			alt: true,
			image_sizesMeta: true,
		},
	},
	features: {
		select: {
			key: true,
			value: true,
		},
	},
	tags: {
		select: {
			value: true,
		},
	},
	availabilityInclude: {
		select: {
			startDate: true,
			endDate: true,
			cost: true,
			priceAdjustment: {
				select: {
					sun: true,
					mon: true,
					tue: true,
					wed: true,
					thu: true,
					fri: true,
					sat: true,
					adjustment: true,
				},
			},
		},
	},
	availabilityExclude: {
		select: {
			startDate: true,
			endDate: true,
		},
	},
	deposit: {
		select: {
			id: true,
			name: true,
			description: true,
			cost: true,
		},
	},
	terms: {
		select: {
			name: true,
			description: true,
		},
	},
	priceAdjustment: {
		select: {
			sun: true,
			mon: true,
			tue: true,
			wed: true,
			thu: true,
			fri: true,
			sat: true,
			adjustment: true,
		},
	},
	files: { select: { id: true, name: true, file_filename: true } },
	cancellationCost: { select: { cost: true, isPercent: true } },
	pickup: {
		select: {
			name: true,
			address: {
				select: {
					address: true,
					city: true,
					state: true,
					zipCode: true,
					latitude: true,
					longitude: true,
				},
			},
		},
	},
};

export const getReservables = async (): Promise<ReservableResponse[]> => {
	const response = (await getDB().reservable.findMany({
		include: {
			...reservableInclude,
		},
	})) as unknown as ReservableResponse[];
	return response;
};
export const getReservable = async (
	id?: string
): Promise<ReservableResponse> => {
	const response = (await getDB().reservable.findFirst({
		where: {
			id: id,
		},
		include: reservableInclude,
	})) as unknown as ReservableResponse;

	return response;
};
