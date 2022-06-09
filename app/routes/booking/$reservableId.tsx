import type { MetaFunction } from '@remix-run/react/routeModules';
import type { LoaderFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import Product from '~/components/blocks/product';

import { getReservable } from '~/lib/reservables.db.server';
import type { AvailabilityResponse } from '~/utils';
import { getDisplayDateRange, normalizeDate } from '~/utils';
import { getReservableAvailabilityByDate } from '~/utils';
import NotAvailable from '~/components/NotAvailable';
import BookingBreakdown from '~/components/BookingBreakdown';
import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import PayPal from '~/components/PayPal';
import { UserContext } from '~/lib/react/context';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import { IoArrowUpSharp } from 'react-icons/io5';

export let meta: MetaFunction = () => {
	return {
		title: 'Drift Off Course',
		description: 'Chetek, WI Boat Rental',
	};
};
type BookingData = {
	availabilityResponse: AvailabilityResponse;
};
export let loader: LoaderFunction = async ({ params, request }) => {
	const url = new URL(request.url);
	let startDate = url.searchParams.get('startDate') as string;
	let endDate = url.searchParams.get('endDate') as string;
	const reservable = await getReservable(params.reservableId);

	const availabilityResponse = await getReservableAvailabilityByDate(
		startDate,
		endDate,
		reservable
	);
	return json({
		availabilityResponse,
	});
};

export default function Booking() {
	const [instructionsText, setInstructionsText] = useState('');
	let data = useLoaderData<BookingData>();
	const [reservationNote, setReservationNote] = useState<HTMLDivElement | null>(
		null
	);
	const setRef = (ref: HTMLDivElement) => {
		if (ref) {
			setReservationNote(ref);
		}
	};
	const [termsChecked, setTermsChecked] = useState(
		(data?.availabilityResponse?.terms?.length || 0) === 0
	);
	const [searchParams] = useSearchParams();
	const startDateStr = searchParams.get('startDate') || '';
	const endDateStr = searchParams.get('endDate') || startDateStr;
	const startDate = normalizeDate(startDateStr);
	const endDate = normalizeDate(endDateStr);
	const areAllChecked = useCallback((allChecked: boolean) => {
		setTermsChecked(allChecked);
	}, []);
	useEffect(() => {
		if (reservationNote) {
			setInstructionsText(reservationNote.innerHTML || '<p></p>');
		}
	}, [reservationNote]);

	return (
		<UserContext.Consumer>
			{({ user }) =>
				user ? (
					<div className="flex min-h-screen flex-col">
						<div className="hidden" ref={setRef}>
							<DocumentRenderer
								document={data.availabilityResponse.reservationNote}
							/>
						</div>
						{startDate && (
							<div className="card mb-4 place-content-center bg-secondary p-4 text-center text-lg font-semibold uppercase text-secondary-content">
								Booking for{' '}
								<span className="font-bold">
									{getDisplayDateRange(startDate, endDate, '')}
								</span>
							</div>
						)}
						<Product
							bg="base-300"
							simple
							reservable={data.availabilityResponse}
							reverseMobile
						>
							{startDate && (
								<div className=" mb-4 w-full place-content-start px-4 lg:mb-0 lg:w-1/2 lg:px-0">
									<BookingBreakdown
										availabilityResponse={data.availabilityResponse}
										allCheckedCallback={areAllChecked}
									/>
								</div>
							)}
						</Product>

						{data.availabilityResponse.isAvail && instructionsText ? (
							<div className=" relative ml-auto mt-4 inline-grid h-full w-full place-items-center items-end pb-4 lg:w-1/2">
								{!termsChecked ? (
									<div className="card top-[2.5%] z-20 col-start-1 row-start-1  h-[105%] w-[105%] bg-primary text-primary-content opacity-95">
										<div className="card-body  ">
											<h2 className="card-title flex w-full flex-col text-center uppercase">
												<div className="flex w-9/12 justify-between gap-4">
													{[0, 1, 2, 3, 5].map((i) => (
														<IoArrowUpSharp key={i}></IoArrowUpSharp>
													))}
												</div>
												<span>
													Accept Above Disclaimers to complete booking
												</span>
											</h2>
										</div>
									</div>
								) : (
									''
								)}
								<div className="z-10 col-start-1 row-start-1 w-full">
									<PayPal
										createUrl="/account/checkout?_data=routes/account/checkout"
										createData={{
											action: 'create',
											reservableId: data.availabilityResponse.id,
											startDate: startDateStr,
											endDate: endDateStr,
											userId: user.id,
										}}
										approveUrl="/account/checkout?_data=routes/account/checkout"
										instructionsText={instructionsText}
									></PayPal>
								</div>
							</div>
						) : (
							''
						)}
					</div>
				) : (
					''
				)
			}
		</UserContext.Consumer>
	);
}
