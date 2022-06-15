import type { MetaFunction } from '@remix-run/react/routeModules';
import type { LoaderFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from "@remix-run/react";
import Product from '~/components/blocks/product';

import type { ReservableResponse } from '~/lib/reservables.db.server';
import type { ReservationsResponse } from '~/lib/reservations.db.server';
import { getReservablesAndReservations } from '.';
export let meta: MetaFunction = () => {
	return {
		title: 'Drift Off Course',
		description: 'Chetek, WI Boat Rental',
	};
};
type IndexData = {
	reservable?: ReservableResponse;
	reservations?: ReservationsResponse[];
};

export let loader: LoaderFunction = async ({ params }) => {
	const [reservations, _reservables, reservable] =
		await getReservablesAndReservations(params.reservableId);

	let data: IndexData = {
		reservable,
		reservations,
	};
	return json(data);
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
	let data = useLoaderData<IndexData>();
	return (
		<div className="flex min-h-screen flex-col">
			{data.reservable && (
				<Product
					reservable={data.reservable}
					reservations={data.reservations}
				/>
			)}
		</div>
	);
}