import type { MetaFunction } from '@remix-run/react/routeModules';
import type { LoaderFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import {
	Link,
	useLoaderData,
	useLocation,
	useSearchParams,
} from '@remix-run/react';
import Product from '~/components/blocks/product';

import type { AvailabilityResponse } from '~/utils';
import { getDisplayDateRange, normalizeDate } from '~/utils';
import { getReservableAvailabilityByDate } from '~/utils';
import BookingBreakdown from '~/components/BookingBreakdown';
import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import PayPal from '~/components/PayPal';
import { UserContext } from '~/lib/react/context';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import { IoArrowUpSharp, IoLogInSharp } from 'react-icons/io5';
import { getReservablesAndReservations } from '../availability';
import { getAuth } from '@firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import EditInput from '~/components/EditInput';
import classNames from 'classnames';

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
	const [reservations, _reservables, reservable] =
		await getReservablesAndReservations(params.reservableId);
	let startDate = url.searchParams.get('startDate') as string;
	let endDate = url.searchParams.get('endDate') as string;

	const availabilityResponse = await getReservableAvailabilityByDate(
		startDate,
		endDate,
		reservable!,
		reservations
	);
	return json({
		availabilityResponse,
	});
};

export default function Booking() {
	const [fbUser, loading, fbError] = useAuthState(getAuth());
	const [instructionsText, setInstructionsText] = useState('');
	const [error, setError] = useState<any>();
	const [updating, setUpdating] = useState(false);
	const [success, setSuccess] = useState(false);
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const location = useLocation();
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
	const inputClasses = classNames('input input-bordered grow', {
		'input-info': updating,
		'input-error': error,
		'input-success': !error && !updating && success,
	});
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
								<div className="mb-4 flex w-full flex-col place-content-start gap-4 px-4 lg:mb-0 lg:w-1/2 lg:px-0">
									{!loading && fbUser?.isAnonymous && (
										<div className="flex w-full flex-col  gap-4">
											<Link
												className="group btn min-h-12 h-auto rounded-lg bg-gradient-to-br from-primary to-primary-focus px-5 py-2.5 text-center text-sm font-medium text-primary-content outline outline-1 outline-primary-content hover:bg-gradient-to-r focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
												to={`/login?sendto=${location.pathname}${location.search}`}
											>
												<IoLogInSharp /> &nbsp; Login, Create an account or
												continue as guest
											</Link>
											<div className="form-control flex w-full flex-col gap-4">
												<label className="input-group ">
													{<span>Name</span>}
													<input
														type="text"
														value={name || ''}
														placeholder="Name"
														className={inputClasses}
														onChange={(e) => setName(e.target.value)}
													/>
												</label>
												<label className="input-group ">
													{<span>Email</span>}
													<input
														type="text"
														value={email || ''}
														placeholder="Email"
														className={inputClasses}
														onChange={(e) => setEmail(e.target.value)}
													/>
												</label>
												<label className="input-group ">
													{<span>Phone</span>}
													<input
														type="text"
														value={phone || ''}
														placeholder="Phone"
														className={inputClasses}
														onChange={(e) => setPhone(e.target.value)}
													/>
												</label>
											</div>
										</div>
									)}
									{!loading && !fbUser?.isAnonymous && !user.name && (
										<div className="flex w-full flex-col  gap-4">
											<label className="input-group ">
												{<span>Name</span>}
												<input
													type="text"
													value={name || ''}
													placeholder="Name"
													className={inputClasses}
													onChange={(e) => setName(e.target.value)}
												/>
											</label>
										</div>
									)}
									{!loading && !fbUser?.isAnonymous && !user.email && (
										<div className="flex w-full flex-col  gap-4">
											<div className="form-control flex w-full flex-col gap-4">
												<label className="input-group ">
													{<span>Email</span>}
													<input
														type="text"
														value={email || ''}
														placeholder="Email"
														className={inputClasses}
														onChange={(e) => setEmail(e.target.value)}
													/>
												</label>
											</div>
										</div>
									)}

									{!loading &&
										!fbUser?.isAnonymous &&
										!user.phoneNumbers?.length && (
											<div className="flex w-full flex-col  gap-4">
												<div className="form-control flex w-full flex-col gap-4">
													<label className="input-group ">
														{<span>Phone</span>}
														<input
															type="text"
															value={phone || ''}
															placeholder="Phone"
															className={inputClasses}
															onChange={(e) => setPhone(e.target.value)}
														/>
													</label>
												</div>
											</div>
										)}

									<BookingBreakdown
										availabilityResponse={data.availabilityResponse}
										allCheckedCallback={areAllChecked}
									/>
								</div>
							)}
						</Product>

						{data.availabilityResponse.isAvail && instructionsText ? (
							<div className=" relative ml-auto mt-4 inline-grid h-full w-full place-items-center items-end pb-4 lg:w-1/2">
								{!termsChecked ||
								(fbUser?.isAnonymous && (!name || !email || !phone)) ? (
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
												{fbUser?.isAnonymous &&
													(!name || !email || !phone) &&
													`Fill out guest info or login to complete booking`}
												{!loading &&
													!fbUser?.isAnonymous &&
													!user.name &&
													!name &&
													`Fill out name to complete booking`}
												{!loading &&
													!fbUser?.isAnonymous &&
													!user.email &&
													!email &&
													`Fill out email to complete booking`}
												{!loading &&
													!fbUser?.isAnonymous &&
													!user.phoneNumbers?.length &&
													!phone &&
													`Fill out phone number to complete booking`}
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
										name={name}
										email={email}
										phone={phone}
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
