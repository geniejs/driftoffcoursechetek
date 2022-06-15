import { FaRegQuestionCircle } from 'react-icons/fa';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import Modal from '~/components/Modal';
import type { PropsWithChildren, ReactElement } from 'react';
import type { ReservationResponse } from '~/lib/reservations.db.server';

type ReservationData = {
	reservation: ReservationResponse;
};

export default function ReservationBreakdown({
	reservation,
	children,
}: PropsWithChildren<ReservationData>): ReactElement {
	return (
		<div>
			<div className="card relative ml-auto mt-4 w-full bg-primary shadow-xl">
				<div className="card-body">
					<h2 className="card-title text-primary-content">Order Details</h2>
					<div className="overflow-x-auto">
						<div className=" w-full border-0 border-t-2">
							<div
								tabIndex={0}
								className="collapse-arrow collapse justify-end text-primary-content"
							>
								<input type="checkbox" />
								<div className="collapse-title">
									<table className="table">
										<tbody>
											<tr>
												<td className="bg-primary py-0 pt-1 text-right text-sm font-semibold uppercase text-primary-content lg:text-base">
													Total Paid
												</td>
												<th className="bg-primary py-0 pt-1 text-right  font-bold text-primary-content">
													${reservation?.receipt?.amountPaid?.toFixed(2)}
												</th>
											</tr>
										</tbody>
									</table>
								</div>
								<div className="collapse-content p-0">
									<table className="ml-auto table">
										<tbody>
											<tr>
												<td className="bg-primary text-right text-primary-content">
													Reservation Cost
												</td>
												<th className="bg-primary text-right text-primary-content">
													${reservation?.receipt?.reservationCost?.toFixed(2)}
												</th>
											</tr>
											{(reservation?.receipt?.taxCost || 0) > 0 ? (
												<tr>
													<td className="bg-primary text-right text-primary-content">
														Tax:
													</td>
													<th className="bg-primary text-right text-primary-content">
														${reservation?.receipt?.taxCost?.toFixed(2)}
													</th>
												</tr>
											) : (
												<tr></tr>
											)}
											{(reservation?.receipt?.depositCost || 0) > 0 ? (
												<tr>
													<td className="bg-primary text-right text-primary-content">
														Deposits:
													</td>
													<th className="bg-primary text-right text-primary-content">
														${reservation?.receipt?.depositCost?.toFixed(2)}
													</th>
												</tr>
											) : (
												<tr></tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						{reservation?.receipt?.depositCost && (
							<div className=" w-full border-0 border-t-2">
								<div
									tabIndex={0}
									className="collapse-arrow collapse justify-end text-primary-content"
								>
									<input type="checkbox" />
									<div className="collapse-title">
										<table className="table">
											<tbody>
												<tr>
													<td className=" bg-primary py-0 pt-1 text-right text-sm font-semibold uppercase text-primary-content lg:text-base">
														View Deposit Details
													</td>
													<th className="bg-primary py-0 pt-1 text-right font-bold text-primary-content">
														${reservation?.receipt?.depositCost}
													</th>
												</tr>
											</tbody>
										</table>
									</div>
									<div className="collapse-content p-0">
										<table className="ml-auto table">
											<tbody>
												{reservation?.receipt.purchaseUnits?.map(
													(purchaseUnit, i) =>
														purchaseUnit.deposit ? (
															<tr key={i}>
																<td className="bg-primary text-right text-primary-content">
																	{purchaseUnit.deposit.name || ''}
																</td>
																<th className="bg-primary text-right text-primary-content">
																	${purchaseUnit.deposit.cost || ''}
																</th>
																{purchaseUnit.deposit.description && (
																	<th className="bg-primary text-primary-content">
																		<Modal
																			id={`${purchaseUnit.deposit.name}${i}`}
																		>
																			<span className="uppercase text-primary-content underline">
																				{purchaseUnit.deposit.name || ''}
																			</span>
																			<div className="mt-4 pl-8 text-primary-content">
																				<DocumentRenderer
																					document={
																						purchaseUnit.deposit
																							.description as any
																					}
																				/>
																			</div>
																		</Modal>
																		<button>
																			<label
																				htmlFor={`${purchaseUnit.deposit.name}${i}`}
																				className="modal-button cursor-pointer  text-right text-2xl"
																			>
																				<FaRegQuestionCircle />
																			</label>
																		</button>
																	</th>
																)}
															</tr>
														) : (
															<tr key={i}></tr>
														)
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			{children}
		</div>
	);
}
