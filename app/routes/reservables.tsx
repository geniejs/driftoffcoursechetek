import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Product from "~/components/blocks/product";

import type { ReservableResponse } from "~/lib/reservables.db.server";
import { getReservables } from "~/lib/reservables.db.server";

export type ReservablesData = {
  reservables: ({ minCost?: number } & ReservableResponse)[];
  minCost?: number;
};

// Loaders provide data to components and are only ever called on the server, so
// you can connect to a database or run any server side code you want right next
// to the component that renders it.
// https://remix.run/api/conventions#loader
export let loader: LoaderFunction = async () => {
  let reservables = (await getReservables()) as ReservablesData["reservables"];
  reservables = reservables.map((r) => {
    r.minCost = Math.min(
      ...(r.availabilityInclude?.map((a) => a.cost || Number.MAX_VALUE) || [
        Number.MAX_VALUE,
      ])
    );
    return r;
  });

  const minCost = Math.min(...reservables.map((r) => r.minCost || -1));
  reservables = reservables.map((r) => {
    delete r.availabilityInclude;
    return r;
  });
  // https://remix.run/api/remix#json
  return json({
    reservables,
    minCost,
  });
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  let data = useLoaderData<ReservablesData>();
  return (
    <div className="flex min-h-screen flex-col">
      {data.reservables?.map((res, i) => {
        return <Product key={i} reservable={res} />;
      })}
    </div>
  );
}
