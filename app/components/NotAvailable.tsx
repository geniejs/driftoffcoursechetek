import { Link } from '@remix-run/react';
import type { ReactElement } from 'react';
import { AvailabilityResponse } from '~/utils';

type Props = {
	availabilityResponse: AvailabilityResponse;
};

export default function NotAvailable({
	availabilityResponse,
}: Props): ReactElement {
	return (
		<div className="mt-4 flex flex-col place-items-center">
			{availabilityResponse.unavailDates ? (
				<div className="mt-4 flex flex-col place-items-center">
					<span className="mb-4 text-center">{`${availabilityResponse.name} is unfortunately unavailable for your selected dates.`}</span>

					{availabilityResponse.availDates &&
					availabilityResponse.availDates.length ? (
						<span className="mb-4 text-center">{`It is available ${availabilityResponse.availDates.join(
							', '
						)}`}</span>
					) : (
						''
					)}
					<span className="mb-4 text-center">
						{availabilityResponse.unavailDates &&
							`It is not available ${availabilityResponse.unavailDates.join(
								', '
							)}`}
					</span>
				</div>
			) : (
				''
			)}
			<Link to={`/availability/${availabilityResponse.id}`}>
				<h1 className="title-font font-medium uppercase underline underline-offset-4 hover:no-underline">
					See all availability
				</h1>
			</Link>
		</div>
	);
}
