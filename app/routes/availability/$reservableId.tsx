import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Product from "~/components/blocks/product";

import type { ReservableResponse } from "~/lib/reservables.db.server";
import { getReservable } from "~/lib/reservables.db.server";
import type { ReservationsResponse } from "~/lib/reservations.db.server";
import { getReservations } from "~/lib/reservations.db.server";

type IndexData = {
  reservable: ReservableResponse;
  reservations: ReservationsResponse[];
};

export let loader: LoaderFunction = async ({ params }) => {
  let data: IndexData = {
    reservable: await getReservable(params.reservableId),
    reservations: await getReservations(),
  };
  return json(data);
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  let data = useLoaderData<IndexData>();
  return (
    <div className="flex min-h-screen flex-col">
      <Product reservable={data.reservable} reservations={data.reservations} />
    </div>
  );
}
