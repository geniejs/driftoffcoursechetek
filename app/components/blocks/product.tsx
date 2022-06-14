import { DocumentRenderer } from '@keystone-6/document-renderer';
import type { PropsWithChildren, ReactElement } from 'react';
import { useMemo } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { IoAlertCircleOutline, IoManOutline } from 'react-icons/io5';
import { Link } from '@remix-run/react';
import type { ReservationsResponse } from '~/lib/reservations.db.server';
import type { ReservablesData } from '~/routes/reservables';
import { AvailabilityResponse, getMinDaysForRange } from '~/utils';
import {
	getDisplayDateRange,
	getReservableAvailabilityResponse,
	getReservableDates,
	getYMDStr,
} from '~/utils';
import Calendar from '../Calendar';
import Carousel from '../Carousel';
import NotAvailable from '../NotAvailable';
import classNames from 'classnames';

type ProductProps = {
	reservable: ReservablesData['reservables'][0];
	reservations?: ReservationsResponse[];
	bg?: string;
	simple?: boolean;
	header?: ReactElement;
	information?: ReactElement;
	className?: string;
	reverseMobile?: boolean;
};
export default function Product({
	reservable,
	reservations,
	bg = 'primary',
	simple = false,
	children,
	header,
	information,
	className,
	reverseMobile,
}: PropsWithChildren<ProductProps>): ReactElement {
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [availResponse, setAvailResponse] =
		useState<AvailabilityResponse | null>(null);
	const [minDays, setMinDays] = useState(1);

	const reservableDates = useMemo(
		() =>
			reservations
				? getReservableDates(reservable, reservations)
				: new Map<string, { cost: number; minDays: number }>(),
		[reservable, reservations]
	);
	const clearSearchEvent = new Event('clearSearch');

	useEffect(() => {
		if (startDate && endDate) {
			setMinDays(getMinDaysForRange(startDate, endDate, reservableDates));
		}
	}, [startDate, endDate]);

	useEffect(() => {
		if (startDate && endDate) {
			setAvailResponse(
				getReservableAvailabilityResponse(
					startDate,
					endDate,
					reservableDates,
					reservable
				)
			);
		}
	}, [endDate, reservable, reservableDates, startDate]);
	const bgContentName = bg.includes('base') ? 'base' : bg;
	return (
		<div>
			<section
				className={`${className} body-font card overflow-hidden border-2 border-${bgContentName}-focus bg-${bg} bg-opacity-100 text-${bgContentName}-content`}
			>
				{header}
				<div className="container mx-auto py-12 px-0 lg:py-12 lg:pl-12 lg:pr-6">
					<div
						className={classNames('mx-auto flex flex-wrap lg:flex-row', {
							'flex-col-reverse': !reverseMobile,
							'flex-col': reverseMobile,
						})}
					>
						<div className="w-full px-4 lg:w-1/2 lg:pl-0 lg:pr-10">
							<h2 className="title-font text-sm tracking-widest">
								{reservable.make ? reservable.make + ' ' : ''}
								{reservable.model || ''}
							</h2>
							<Link to={`/availability/${reservable.id}`}>
								<h1 className="title-font mb-4 text-3xl font-medium uppercase underline underline-offset-4 hover:no-underline">
									{reservable.name || ''}
								</h1>
							</Link>
							{reservable.tags?.length && !simple && (
								<div className="mb-4 flex flex-wrap gap-2">
									{reservable.tags?.map((tag, i) => {
										return (
											<div key={i} className="badge badge-outline">
												{tag.value}
											</div>
										);
									})}
								</div>
							)}
							<div className="badge badge-lg badge-secondary mb-4 flex gap-1 py-4 text-lg">
								<IoManOutline></IoManOutline>
								<span>Max {reservable.occupancyPersons} people</span>
								<span className="text-sm">
									({reservable.occupancyWeight}lbs)
								</span>
							</div>
							{/* <div className="mb-4 flex ">
								<button className=" flex-grow border-b-2 border-accent py-2 px-1 text-lg font-semibold">
									Description
								</button>
								<button className="flex-grow border-b-2 border-secondary-content py-2 px-1 text-lg">
									Reviews
								</button>
								<button className="flex-grow border-b-2 border-secondary-content py-2 px-1 text-lg">
									Details
								</button>
							</div> */}
							<div className="mb-4">
								<div className="border-b-2 border-accent py-1 pr-4 text-left text-lg font-semibold">
									Description
								</div>
							</div>
							<div className="mb-4 leading-relaxed">
								<DocumentRenderer document={reservable.description} />
							</div>
							{reservable.features?.length && !simple && (
								<div className="mb-4">
									<div className="border-b-2 border-accent py-1 pr-4 text-left text-lg font-semibold">
										Features
									</div>
									{reservable.features?.map((feature, i) => {
										return (
											<div
												key={i}
												className="flex border-b border-secondary-content py-2"
											>
												<span className="">{feature.key}</span>
												<span className="ml-auto ">{feature.value}</span>
											</div>
										);
									})}
								</div>
							)}
							{reservable.files?.length ? (
								<div className="mb-4">
									<div className="border-b-2 border-accent py-1 pr-4 text-left text-lg font-semibold">
										Important Information
									</div>
									<div className="flex flex-wrap gap-2">
										{reservable.files?.map((file, i) => {
											return (
												<a
													key={i}
													target="_blank"
													rel="noreferrer"
													href={`https://assets.geniecloud.xyz/rental/${file.file_filename}`}
													className={`btn btn-link p-0 underline underline-offset-2 text-${bgContentName}-content`}
												>
													{file.name}
												</a>
											);
										})}
									</div>
								</div>
							) : (
								''
							)}
							{information ? <div className="mb-4">{information}</div> : ''}
							{!reservations && !children && reservable.minCost && (
								<Link
									to={`/availability/${reservable.id}`}
									className="btn btn-accent btn-block mb-4 py-2 px-6 text-lg "
								>
									Book Now - from ${reservable.minCost}
								</Link>
							)}
						</div>
						{reservable.images && !simple && (
							<div className=" w-full  lg:w-1/2 ">
								<Carousel
									id={`${reservable.id}-carousel`}
									images={reservable.images}
								/>
							</div>
						)}
						{simple ? children : ''}
					</div>
					{!simple ? children : ''}

					{reservations && (
						<div className="mt-4">
							<Calendar
								datesWithCost={reservableDates}
								hasDeposit={(reservable?.deposit?.length || 0) > 0}
								onDatesSet={(startDate, endDate) => {
									setStartDate(startDate);
									setEndDate(endDate);
								}}
							></Calendar>
							{startDate && endDate && availResponse && (
								<div className="card fixed left-0 bottom-0 z-30 mx-auto my-0 w-full rounded-none bg-primary bg-opacity-70 text-primary-content shadow-xl">
									<div className="card-body">
										{minDays > 1 ? (
											<div className="alert alert-info shadow-lg">
												<div>
													<IoAlertCircleOutline />
													<span>
														Your current dates have a minimum booking time of{' '}
														{minDays} days
													</span>
												</div>
											</div>
										) : undefined}
										{availResponse.isAvail ? (
											<Link
												to={`/booking/${reservable.id}?startDate=${getYMDStr(
													startDate
												)}&endDate=${getYMDStr(endDate)}`}
												className="min-h12 btn btn-accent btn-block mt-4 h-auto py-2 px-6 text-base md:text-lg"
											>
												Book Now for
												{getDisplayDateRange(startDate, endDate)}
											</Link>
										) : (
											<div className="card bg-secondary text-secondary-content ">
												<div className="card-body">
													<NotAvailable
														minimal
														availabilityResponse={availResponse}
													></NotAvailable>
												</div>
												<div className="card-actions m-4 justify-end">
													<button
														onClick={() => {
															document.dispatchEvent(clearSearchEvent);
															setAvailResponse(null);
															setEndDate(undefined);
															setStartDate(undefined);
														}}
														className="btn btn-primary"
													>
														Clear Search
													</button>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</section>
			{startDate && endDate && <div className="pb-20"></div>}
		</div>
	);
}
