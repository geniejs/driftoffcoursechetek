import { DocumentRenderer } from '@keystone-6/document-renderer';
import type { PropsWithChildren, ReactElement } from 'react';
import { useState } from 'react';
import { IoManOutline } from 'react-icons/io5';
import { Link } from '@remix-run/react';
import type { ReservationsResponse } from '~/lib/reservations.db.server';
import type { ReservablesData } from '~/routes/reservables';
import { getDisplayDateRange, getReservableDates, getYMDStr } from '~/utils';
import Calendar from '../Calendar';
import Carousel from '../Carousel';

type ProductProps = {
	reservable: ReservablesData['reservables'][0];
	reservations?: ReservationsResponse[];
	bg?: string;
	simple?: boolean;
	header?: ReactElement;
	information?: ReactElement;
};
export default function Product({
	reservable,
	reservations,
	bg = 'primary',
	simple = false,
	children,
	header,
	information,
}: PropsWithChildren<ProductProps>): ReactElement {
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	return (
    <div>
      <section
        className={`body-font card overflow-hidden border-2 border-${bg}-focus bg-${bg} bg-opacity-100 text-${bg}-content`}
      >
        {header}
        <div className="container mx-auto py-12 px-0 lg:py-12 lg:pl-12 lg:pr-6">
          <div className="mx-auto flex flex-col-reverse flex-wrap lg:flex-row">
            <div className="w-full px-4 lg:w-1/2 lg:pl-0 lg:pr-10">
              <h2 className="title-font text-sm tracking-widest">
                {reservable.make ? reservable.make + " " : ""}
                {reservable.model || ""}
              </h2>
              <Link to={`/availability/${reservable.id}`}>
                <h1 className="title-font mb-4 text-3xl font-medium uppercase underline underline-offset-4 hover:no-underline">
                  {reservable.name || ""}
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
              <div className="badge badge-lg mb-4 flex gap-1 py-4 text-lg">
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
                          className="btn btn-link p-0 text-primary-content"
                        >
                          {file.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ) : (
                ""
              )}
              {information ? <div className="mb-4">{information}</div> : ""}
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
            {simple ? children : ""}
          </div>
          {!simple ? children : ""}

          {reservations && (
            <div className="mt-4">
              <Calendar
                datesWithCost={getReservableDates(reservable, reservations)}
                hasDeposit={(reservable?.deposit?.length || 0) > 0}
                onDatesSet={(startDate, endDate) => {
                  setStartDate(startDate);
                  setEndDate(endDate);
                }}
              ></Calendar>
              {startDate && endDate && (
                <div className="card fixed left-0 bottom-0 z-30 mx-auto my-0 w-full rounded-none bg-primary bg-opacity-70 shadow-xl">
                  <div className="card-body">
                    <Link
                      to={`/booking/${reservable.id}?startDate=${getYMDStr(
                        startDate
                      )}&endDate=${getYMDStr(endDate)}`}
                      className="btn btn-accent btn-block mt-4 py-2 px-6 text-base md:text-lg "
                    >
                      Book Now for
                      {getDisplayDateRange(startDate, endDate)}
                    </Link>
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
