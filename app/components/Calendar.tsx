import type { PropsWithoutRef, ReactElement } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import groupBy from 'array.prototype.groupby';
import classNames from 'classnames';
import {
	getMinDaysForRange,
	getValidEndDate,
	getYMDStr,
	normalizeDate,
} from '~/utils';
import { useMountEffect } from '~/lib/react/hooks';
type CalendarProps = {
	datesWithCost: Map<string, { cost: number; minDays: number }>;
	hasDeposit?: boolean;
	onDatesSet?: (startDate?: Date, endDate?: Date) => void;
};

export default function Calendar({
	datesWithCost,
	hasDeposit = false,
	onDatesSet,
}: PropsWithoutRef<CalendarProps>): ReactElement {
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();

	useEffect(() => {
		if (startDate && endDate) {
			const minDays = getMinDaysForRange(startDate, endDate, datesWithCost);
			const validEndDate = getValidEndDate(minDays, startDate, endDate);
			if (validEndDate?.getTime() !== endDate.getTime()) {
				setEndDate(validEndDate);
			}
		}
	}, [startDate, endDate]);

	useMountEffect(() => {
		document.addEventListener('clearSearch', () => {
			setStartDate(undefined);
			setEndDate(undefined);
			setOnStartDate(true);
		});
	});

	const [onStartDate, setOnStartDate] = useState(true);
	// setup all the dates for calendar display
	const datesByYear = groupBy(
		Array.from(datesWithCost.keys()),
		(dateString: string) => new Date(dateString).getUTCFullYear()
	) as Record<string, string[]>;
	const datesByMonthByYear: Record<string, Record<string, string[]>> = {};
	Object.keys(datesByYear).forEach((year) => {
		const dates = datesByYear[year];
		const datesByMonth = groupBy(dates, (dateString: string) =>
			new Date(dateString).getUTCMonth()
		) as Record<string, string[]>;
		const filledDatesByMonth: Record<string, string[]> = {};
		Object.keys(datesByMonth).forEach((month) => {
			const dates = datesByMonth[month];
			let currDateOfMonth = 1;
			const newDates: string[] = [];
			dates.forEach((dateStr) => {
				const date = new Date(dateStr);
				while (date.getUTCDate() !== currDateOfMonth && currDateOfMonth < 33) {
					const tmpDate = new Date(dateStr);
					tmpDate.setUTCDate(currDateOfMonth);
					currDateOfMonth++;
					newDates.push(tmpDate.toUTCString());
				}
				currDateOfMonth++;
				newDates.push(dateStr);
			});
			const last = newDates[newDates.length - 1];
			let lastDate = new Date(last);
			lastDate.setUTCDate(lastDate.getUTCDate() + 1);
			while (lastDate.getUTCDate() > 1) {
				newDates.push(lastDate.toUTCString());
				lastDate.setUTCDate(lastDate.getUTCDate() + 1);
			}
			filledDatesByMonth[month] = newDates;
		});
		datesByMonthByYear[year] = filledDatesByMonth;
	});
	useEffect(() => {
		if (startDate && endDate && onDatesSet) {
			onDatesSet(startDate, endDate);
		} else if (onDatesSet) {
			onDatesSet();
		}
	}, [startDate, endDate, onDatesSet]);

	return (
		<div className="flex flex-col gap-4 px-4 lg:px-0">
			<span className="text-sm">*Prices do not include refundable deposit</span>
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
								setStartDate(
									normalizeDate(val.target.valueAsDate) || undefined
								);
							val?.target?.valueAsDate &&
								(!endDate || endDate < val.target.valueAsDate) &&
								setEndDate(normalizeDate(val.target.valueAsDate) || undefined);
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
								setEndDate(normalizeDate(val.target.valueAsDate) || undefined);
						}}
					/>
				</div>
			</div>

			<div className="flex flex-row flex-wrap gap-y-4 overflow-hidden">
				{Object.keys(datesByMonthByYear).map((year, yi) => {
					const datesByMonth = datesByMonthByYear[year] as Record<
						string,
						string[]
					>;
					return Object.keys(datesByMonth).map((month, mi) => {
						const dates = datesByMonth[month];
						return (
							<div key={`${yi}${mi}`} className="w-full lg:w-1/2">
								<div
									className={classNames(
										'border border-base-100 bg-base-300 text-base-content shadow-sm',
										{
											'lg:mr-2': mi % 2 === 0,
											'lg:ml-2': mi % 2 !== 0,
										}
									)}
								>
									<div className=" border-b border-solid border-base-content px-2 py-2 text-center text-lg font-bold">
										{new Date(dates[0]).toLocaleString('en-us', {
											timeZone: 'UTC',
											month: 'long',
											year: 'numeric',
										})}
									</div>
									<div className="">
										<table className="w-full">
											<thead>
												<tr className="">
													<th className="py-3 px-1 md:px-4" aria-label="Sunday">
														Su
													</th>
													<th className="py-3 px-1 md:px-4" aria-label="Monday">
														Mo
													</th>
													<th
														className="py-3 px-1 md:px-4"
														aria-label="Tuesday"
													>
														Tu
													</th>
													<th
														className="py-3 px-1 md:px-4"
														aria-label="Wednesday"
													>
														We
													</th>
													<th
														className="py-3 px-1 md:px-4"
														aria-label="Thursday"
													>
														Th
													</th>
													<th className="py-3 px-1 md:px-4" aria-label="Friday">
														Fr
													</th>
													<th
														className="py-3 px-1 md:px-4"
														aria-label="Saturday"
													>
														Sa
													</th>
												</tr>
											</thead>
											<tbody>
												{dates.map((day, di) => {
													let date = new Date(day);
													let startingIndex = di;
													if (
														date.getUTCDate() === 1 ||
														date.getUTCDay() === 0
													) {
														let days: ReactElement[] = [];
														let emptyDays = date.getUTCDay();
														const weekDates: Date[] = [];
														while (
															startingIndex < dates.length - 1 &&
															(startingIndex === di || date.getUTCDay() !== 0)
														) {
															weekDates.push(date);
															startingIndex++;
															date = new Date(dates[startingIndex]);
														}
														weekDates.forEach((currDate, i) => {
															const disabled = !datesWithCost.get(
																currDate.toUTCString()
															);
															days.push(
																<td
																	key={`${yi}${mi}${di}${i}`}
																	className="mx-2 my-3 md:mx-4"
																>
																	<button
																		className={classNames(
																			'stat w-full place-items-center rounded border border-base-100 p-1 lg:border-4',
																			{
																				'disabled-box cursor-default': disabled,
																				'bg-base-100':
																					startDate &&
																					endDate &&
																					currDate >= startDate &&
																					currDate <= endDate,
																				'hover:bg-base-200': !(
																					startDate &&
																					endDate &&
																					currDate >= startDate &&
																					currDate <= endDate
																				),
																				// 'text-info':
																				// 	(datesWithCost.get(
																				// 		currDate.toUTCString()
																				// 	)?.minDays || 1) > 1,
																			}
																		)}
																		onClick={() => {
																			if (!disabled) {
																				if (
																					onStartDate ||
																					(!onStartDate &&
																						endDate &&
																						currDate >= endDate)
																				) {
																					onStartDate && setStartDate(currDate);
																					setEndDate(currDate);
																				} else {
																					setStartDate(currDate);
																				}
																				setOnStartDate(!onStartDate);
																			}
																		}}
																	>
																		<span className="stat-value text-2xl">
																			{currDate.getUTCDate()}
																		</span>
																		{!disabled ? (
																			<span className="stat-desc flex flex-col">
																				<span>
																					$
																					{
																						datesWithCost.get(
																							currDate.toUTCString()
																						)?.cost
																					}
																				</span>
																				{/* {(datesWithCost.get(
																					currDate.toUTCString()
																				)?.minDays || 1) > 1 && (
																					<span>
																						Min{' '}
																						{
																							datesWithCost.get(
																								currDate.toUTCString()
																							)?.minDays
																						}{' '}
																						days
																					</span>
																				)} */}
																			</span>
																		) : (
																			<span className="stat-desc invisible">
																				-
																			</span>
																		)}
																	</button>
																</td>
															);
														});

														return (
															<tr key={`${yi}${mi}${di}`}>
																{Array.from({ length: emptyDays }).map(
																	(_, i) => (
																		<td key={`${yi}${mi}${di}${i}`} />
																	)
																)}
																{days}
															</tr>
														);
													} else {
														return [];
													}
												})}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						);
					});
				})}
			</div>
		</div>
	);
}
