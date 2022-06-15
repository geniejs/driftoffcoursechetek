import { useState } from 'react';
import { IoAlertCircleOutline, IoSearch } from 'react-icons/io5';
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react';
import Product from '~/components/blocks/product';
import type { AvailabilityResponse } from '~/utils';
import { getDisplayDateRange } from '~/utils';
import {
	getReservablesAvailabilityByDate,
	getYMDStr,
	normalizeDate,
} from '~/utils';
import NotAvailable from '~/components/NotAvailable';
import {
	getReservable,
	getReservables,
	ReservableResponse,
} from '~/lib/reservables.db.server';
import {
	getReservations,
	ReservationsResponse,
} from '~/lib/reservations.db.server';

export let meta: MetaFunction = () => {
	return {
		title: 'Drift Off Course',
		description: 'Chetek, WI Boat Rental',
	};
};

export const getReservablesAndReservations = async (
	reservableId?: string
): Promise<
	[
		ReservationsResponse[] | undefined,
		ReservableResponse[] | undefined,
		ReservableResponse | undefined
	]
> => {
	//context.reservableById = context.reservableById || {};
	let reservations: ReservationsResponse[] | undefined = undefined; //context.reservations;
	let reservables: ReservableResponse[] | undefined = undefined; // context.reservables;
	let reservable: ReservableResponse | undefined = undefined;
	// if (reservableId) {
	// 	reservable = reservables
	// 		? reservables.find((r) => r.id === reservableId)
	// 		: context.reservableById[reservableId];
	// }
	const promises: [
		Promise<ReservationsResponse[] | undefined>,
		Promise<ReservableResponse[] | undefined>,
		Promise<ReservableResponse | undefined>
	] = [
		new Promise((resolve) => {
			if (reservations) {
				resolve(reservations);
			} else {
				getReservations().then(resolve);
			}
		}),
		new Promise((resolve) => {
			if (reservables) {
				resolve(reservables);
			} else {
				getReservables().then(resolve);
			}
		}),
		new Promise((resolve) => {
			if (reservables) {
				resolve(reservable);
			} else if (reservableId) {
				getReservable(reservableId).then(resolve);
			} else {
				resolve(undefined);
			}
		}),
	];

	[reservations, reservables, reservable] = await Promise.all(promises);

	// context.reservables = reservables;
	// context.reservations = reservations;
	// if (reservableId) {
	// 	context.reservableById[reservableId] = reservable;
	// }

	return [reservations, reservables, reservable];
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const url = new URL(request.url);
	let startDate = url.searchParams.get('startDate') as string;
	let endDate = url.searchParams.get('endDate') as string;
	let [reservations, reservables] = await getReservablesAndReservations();
	reservables = await getReservablesAvailabilityByDate(
		startDate,
		endDate,
		reservables,
		reservations
	);

	return json(reservables);
};

// https://remix.run/guides/routing#index-routes
export default function Availability() {
	const [searchParams] = useSearchParams();
	searchParams.delete('index');
	const reservables = useLoaderData<AvailabilityResponse[]>() || [];
	const [startDate, setStartDate] = useState<Date | null>(
		normalizeDate(searchParams.get('startDate'))
	);
	const [endDate, setEndDate] = useState<Date | null>(
		normalizeDate(searchParams.get('endDate'))
	);
	return (
		<div className="flex flex-col gap-4">
			<div className=" card mx-auto w-full border-2 border-primary-focus bg-primary bg-opacity-70 shadow-xl">
				<div className="card-body">
					<Form
						target="?index"
						method="get"
						className="mb-4 flex flex-col gap-4 px-4 lg:px-0"
					>
						<div className="flex flex-col gap-4 overflow-hidden md:flex-row ">
							<div className="form-control w-full shadow-sm">
								<label className="label">
									<span className=" label-text font-bold uppercase text-primary-content">
										Start Date
									</span>
								</label>
								<input
									value={getYMDStr(startDate)}
									name="startDate"
									type="date"
									placeholder="Start Date"
									className="input input-bordered input-lg m-1 bg-base-200 text-base-content"
									onChange={(val) => {
										val?.target?.valueAsDate &&
											setStartDate(val.target.valueAsDate);
										val?.target?.valueAsDate &&
											(!endDate || endDate < val.target.valueAsDate) &&
											setEndDate(val.target.valueAsDate);
									}}
								/>
							</div>
							<div className="form-control w-full shadow-sm">
								<label className="label">
									<span className="label-text font-bold uppercase text-primary-content">
										End Date
									</span>
								</label>
								<input
									value={getYMDStr(endDate)}
									name="endDate"
									type="date"
									placeholder="End Date"
									className="input input-bordered input-lg m-1 bg-base-200 text-base-content"
									onChange={(val) => {
										val?.target?.valueAsDate &&
											(!startDate || startDate <= val.target.valueAsDate) &&
											setEndDate(val.target.valueAsDate);
									}}
								/>
							</div>
						</div>

						<button
							type="submit"
							className=" btn btn-accent min-h-12 flex h-auto w-full flex-nowrap gap-2 self-end text-lg font-semibold uppercase md:w-1/3"
						>
							<IoSearch />
							<span>Check Availability</span>
						</button>
					</Form>
				</div>
			</div>
			{reservables.map((reservable, i) => {
				return (
					<Product key={i} reservable={reservable}>
						{reservable.isAvail && startDate ? (
							<div className="mt-4 flex flex-col place-items-center">
								<span className="uppercase">{`${
									reservable.name
								} is available ${getDisplayDateRange(
									reservable.startDate!,
									reservable.endDate
								)}
								`}</span>
								{(reservable.minDays || 1) > 1 ? (
									<div className="alert alert-info shadow-lg">
										<div>
											<IoAlertCircleOutline />
											<span>
												Your current dates have a minimum booking time of{' '}
												{reservable.minDays} days
											</span>
										</div>
									</div>
								) : undefined}
								<Link
									to={`/booking/${reservable.id}?startDate=${getYMDStr(
										reservable.startDate
									)}&endDate=${getYMDStr(reservable.endDate)}`}
									className="min-h12 btn btn-accent btn-block mt-4 h-auto py-2 px-6 text-lg"
								>
									Book Now for ${reservable.totalCost}*
								</Link>
								<Link className="mb-4" to={`/availability/${reservable.id}`}>
									<h1 className="title-font font-medium underline underline-offset-4 hover:no-underline">
										or see additional availability
									</h1>
								</Link>
								<span className="text-sm">
									*Price does not include refundable deposit
								</span>
							</div>
						) : (
							<NotAvailable availabilityResponse={reservable} />
						)}
					</Product>
				);
			})}
		</div>
	);
}