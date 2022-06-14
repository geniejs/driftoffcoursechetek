import type { LoaderFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from "@remix-run/react";
import Product from "~/components/blocks/product";
import {
  getCancellationCost,
  getDisplayDateRange,
  normalizeDate,
} from "~/utils";
import { DocumentRenderer } from "@keystone-6/document-renderer";
import { getUserByRequestToken } from "~/lib/auth.server";
import ReservationBreakdown from "~/components/ReservationBreakdown";
import Modal from "~/components/Modal";
import { useMountEffect } from "~/lib/react/hooks";
import type { ReservationResponse } from "~/lib/reservations.db.server";
import { getReservationsWithDetails } from "~/lib/reservations.db.server";
import type { ReservableResponse } from "~/lib/reservables.db.server";
import { getReservables } from "~/lib/reservables.db.server";

type BookingsData = {
  reservations: ReservationResponse[];
  reservables: Record<string, ReservableResponse>;
};

export let loader: LoaderFunction = async ({ request }) => {
  const { user } = await getUserByRequestToken(request);

  if (user) {
    const reservablIds = Array.from(
      new Set(
        user.reservations.map((res) => res.reservableId).filter((id) => !!id)
      )
    ) as string[];
    const reservablesP = getReservables(reservablIds);
    const reservationsP = getReservationsWithDetails(
      user.reservations.map((res) => res.id)
    );
    let reservables: ReservableResponse[] | undefined = undefined;
    let reservations: ReservationResponse[] | undefined = undefined;
    try {
      [reservables, reservations] = await Promise.all([
        reservablesP,
        reservationsP,
      ]);
    } catch (e) {
      console.error(e);
    }

    if (!reservations || !reservables) {
      throw new Error();
    }
    const reservablesMap = Object.fromEntries(
      new Map(
        reservables.map((r) => {
          return [r.id, r];
        })
      )
    );
    return json({
      reservations: reservations!,
      reservables: reservablesMap,
    } as BookingsData);
  } else {
    return redirect("/account?sendto=/account/bookings");
  }
};

export default function Bookings() {
	let data = useLoaderData<BookingsData>();
	useMountEffect(() => {
		if (location.hash) {
			const div = document.querySelector(location.hash.toLowerCase());
			if (div) {
				div.scrollIntoView({ block: 'center', inline: 'nearest' });
			}
		}
	});

	data.reservations = data.reservations.sort((a, b) => {
		return (
			(normalizeDate(a?.startDate)?.getTime() || 0) -
			(normalizeDate(b.startDate)?.getTime() || 0)
		);
	});

	return (
		<div className="flex min-h-screen flex-col gap-4">
			{data.reservations.map((reservation, i) => {
				const reservable = data.reservables[reservation?.reservableId!]!;
				return (
					<div id={reservation?.id?.toLowerCase()} key={i}>
						<Product
							reverseMobile
							header={
								<div className="card mb-4 place-content-center bg-primary p-4 text-center text-lg font-semibold uppercase text-primary-content">
									<p className="font-bold">Reservation #{reservation?.id}</p>
									<p className="font-bold">
										{getDisplayDateRange(
											reservation!.startDate,
											reservation?.endDate,
											''
										)}
									</p>
								</div>
							}
							information={
								<div className="">
									{reservable.terms?.map((term, i) => (
										<div key={i} className="form-control text-base-content">
											<label className="label cursor-pointer">
												<span className="label-text text-base-content">
													<label
														htmlFor={`${term.name}${i}`}
														className="cursor-pointer underline"
													>
														{term.name}
													</label>
												</span>
											</label>
											{term.description && (
												<Modal id={`${term.name}${i}`}>
													<span className="uppercase text-primary-content underline">
														{term.name || ''}
													</span>
													<div className="mt-4 pl-8 text-primary-content">
														<DocumentRenderer document={term.description} />
													</div>
												</Modal>
											)}
										</div>
									))}
									<div className="form-control text-base-content">
										<span className="label-text text-base-content">
											Contact us if you wish to cancel (715-379-5268 or
											support@driftoffcoursechetek.com) this reservation{' '}
											{reservable.cancellationCost &&
											reservable.cancellationCost.cost ? (
												<span>
													$
													{getCancellationCost(
														reservable,
														reservation?.receipt?.reservationCost!
													)}
												</span>
											) : undefined}
										</span>
									</div>
								</div>
							}
							bg="base-300"
							simple
							reservable={reservable}
						>
							<div className="flex flex-col gap-4 px-4">
								<DocumentRenderer document={reservable.reservationNote} />
								<p className="font-semibold underline">Pickup Location</p>
								<p>{reservable.pickup?.name}</p>
								<p>{reservable.pickup?.address?.address}</p>
								<p>
									{reservable.pickup?.address?.city},{' '}
									{reservable.pickup?.address?.state}{' '}
									{reservable.pickup?.address?.zipCode}
								</p>
								{reservable.pickup?.address?.longitude &&
									reservable.pickup?.address?.latitude && (
										<p>
											{reservable.pickup?.address?.latitude} x{' '}
											{reservable.pickup?.address?.longitude}{' '}
										</p>
									)}
								<ReservationBreakdown reservation={reservation} />
							</div>
						</Product>
					</div>
				);
			})}
		</div>
	);
}
