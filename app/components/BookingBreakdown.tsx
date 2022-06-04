import type { AvailabilityResponse } from '~/utils';
import { getCancellationCost } from '~/utils';

import { FaRegQuestionCircle } from 'react-icons/fa';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import Modal from '~/components/Modal';
import type { PropsWithChildren, ReactElement } from 'react';

type BookingData = {
	availabilityResponse: AvailabilityResponse;
	allCheckedCallback?: (allChecked: boolean) => void;
};

export default function BookingBreakdown({
	availabilityResponse,
	children,
	allCheckedCallback,
}: PropsWithChildren<BookingData>): ReactElement {
	let depositCost = 0;
	availabilityResponse.deposit?.forEach((deposit) => {
		if (deposit && deposit.cost) {
			depositCost += deposit.cost;
		}
	});
	const checkedStatuses: HTMLInputElement[] = [];
	const setRef = (ref: HTMLInputElement) => {
		checkedStatuses.push(ref);
	};
	const checkChecked = () => {
		allCheckedCallback &&
			allCheckedCallback(checkedStatuses.every((r) => r && r.checked));
	};

	const reservationTotal = availabilityResponse.totalCost || 0;
	const taxTotal = reservationTotal * (availabilityResponse.tax || 0);
	const totalCost = reservationTotal + taxTotal;
	return (
		<div>
			{availabilityResponse.isAvail && (
				<div className="card relative ml-auto mt-4 w-full bg-accent shadow-xl lg:w-1/2">
					<div className="card-body">
						<div className="overflow-x-auto">
							<div className=" w-full border-0 border-t-2">
								<div
									tabIndex={0}
									className="collapse-arrow collapse justify-end text-accent-content"
								>
									<input type="checkbox" />
									<div className="collapse-title">
										<table className="table">
											<tbody>
												<tr>
													<td className="bg-accent py-0 pt-1 text-right text-sm font-semibold uppercase text-accent-content lg:text-base">
														Reservation Total
													</td>
													<th className="bg-accent py-0 pt-1 text-right  font-bold text-accent-content">
														${totalCost.toFixed(2)}
													</th>
												</tr>
											</tbody>
										</table>
									</div>
									<div className="collapse-content p-0">
										<table className="ml-auto table">
											<tbody>
												{availabilityResponse.availDates?.map((date, i) => (
													<tr key={i}>
														<td className="bg-accent text-right text-accent-content">
															{date || ''}
														</td>
														<th className="bg-accent text-right text-accent-content">
															${availabilityResponse?.costs?.[i] || ''}
														</th>
													</tr>
												))}
												{taxTotal > 0 ? (
													<tr>
														<td className="bg-accent text-right text-accent-content">
															Tax:
														</td>
														<th className="bg-accent text-right text-accent-content">
															${taxTotal.toFixed(2)}
														</th>
													</tr>
												) : (
													''
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
							{depositCost && (
								<div className=" w-full border-0 border-t-2">
									<div
										tabIndex={0}
										className="collapse-arrow collapse justify-end text-accent-content"
									>
										<input type="checkbox" />
										<div className="collapse-title">
											<table className="table">
												<tbody>
													<tr>
														<td className=" bg-accent py-0 pt-1 text-right text-sm font-semibold uppercase text-accent-content lg:text-base">
															Deposit Total
														</td>
														<th className="bg-accent py-0 pt-1 text-right font-bold text-accent-content">
															${depositCost}
														</th>
													</tr>
												</tbody>
											</table>
										</div>
										<div className="collapse-content p-0">
											<table className="ml-auto table">
												<tbody>
													{availabilityResponse.deposit?.map((deposit, i) => (
														<tr key={i}>
															<td className="bg-accent text-right text-accent-content">
																{deposit.name || ''}
															</td>
															<th className="bg-accent text-right text-accent-content">
																${deposit.cost || ''}
															</th>
															{deposit.description && (
																<th className="bg-accent text-accent-content">
																	<Modal id={`${deposit.name}${i}`}>
																		<span className="uppercase text-primary-content underline">
																			{deposit.name || ''}
																		</span>
																		<div className="mt-4 pl-8 text-primary-content">
																			<DocumentRenderer
																				document={deposit.description}
																			/>
																		</div>
																	</Modal>
																	<button>
																		<label
																			htmlFor={`${deposit.name}${i}`}
																			className="modal-button cursor-pointer  text-right text-2xl"
																		>
																			<FaRegQuestionCircle />
																		</label>
																	</button>
																</th>
															)}
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							)}
							<table className="table w-full border-0 border-t-2">
								<tbody className="collapse m-1 cursor-default justify-end text-accent-content">
									<tr className="collapse-title w-auto !cursor-default justify-self-end p-0 pr-10">
										<td className="bg-accent text-right font-semibold uppercase text-accent-content">
											Total Due
										</td>
										<th className="bg-accent text-right font-bold text-accent-content">
											${(totalCost + depositCost).toFixed(2)}
										</th>
									</tr>
								</tbody>
							</table>
							{allCheckedCallback ? (
								<div>
									{' '}
									{availabilityResponse.terms?.map((term, i) => (
										<div key={i} className="form-control text-accent-content">
											<label className="label cursor-pointer">
												<span className="label-text text-accent-content">
													I have read and accept the{' '}
													<label
														htmlFor={`${term.name}${i}`}
														className="cursor-pointer underline"
													>
														{term.name}
													</label>
												</span>
												<input
													ref={setRef}
													onChange={checkChecked}
													type="checkbox"
													className="checkbox checkbox-primary"
												/>
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
									{availabilityResponse.cancellationCost &&
									availabilityResponse.cancellationCost.cost ? (
										<div className="form-control text-accent-content">
											<label className="label cursor-pointer">
												<span className="label-text text-accent-content">
													I acknowledge that this booking has a cancellation
													cost of ${getCancellationCost(availabilityResponse)}
												</span>
												<input
													ref={setRef}
													onChange={checkChecked}
													type="checkbox"
													className="checkbox checkbox-primary"
												/>
											</label>
										</div>
									) : (
										''
									)}{' '}
								</div>
							) : (
								''
							)}
						</div>
					</div>
				</div>
			)}
			{children}
		</div>
	);
}
