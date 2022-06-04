import { useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react';
import Product from '~/components/blocks/product';
import { AvailabilityResponse, getDisplayDateRange } from '~/utils';
import {
	getMDYStr,
	getReservablesAvailabilityByDate,
	getYMDStr,
	normalizeDate,
} from '~/utils';
import NotAvailable from '~/components/NotAvailable';
import { getReservables } from '~/lib/reservables.db.server';

export let meta: MetaFunction = () => {
	return {
		title: 'Drift Off Course',
		description: 'Chetek, WI Boat Rental',
	};
};

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	let startDate = url.searchParams.get('startDate') as string;
	let endDate = url.searchParams.get('endDate') as string;
	let reservables = await getReservablesAvailabilityByDate(startDate, endDate);
	reservables =
		reservables && reservables.length ? reservables : await getReservables();
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
		<div className="flex flex-col">
			<div className=" card mx-auto mb-4 w-full bg-primary bg-opacity-70 shadow-xl">
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
							className="m btn btn-accent flex w-full flex-nowrap place-items-center gap-2 self-end text-lg font-semibold uppercase md:w-1/3"
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
								} is available ${getDisplayDateRange(startDate, endDate)}
								`}</span>
								<Link
									to={`/booking/${reservable.id}?${searchParams.toString()}`}
									className="btn btn-accent btn-block mt-4 py-2 px-6 text-lg "
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
