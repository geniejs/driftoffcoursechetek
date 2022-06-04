import type { PayPalNamespace } from '@paypal/paypal-js';
import { loadScript } from '@paypal/paypal-js';
import { useEffect, useRef, useState } from 'react';
import { paypalClientId } from '~/config.client';
import { CreateOrderResponse } from '~/lib/checkout.server';
import { useMountEffect } from '~/lib/react/hooks';
import type {
	ApproveAction,
	CheckoutCreateResponse,
	CreateAction,
} from '~/routes/account/checkout';
import type { Prisma } from '@prisma/client';

interface PayPalInput {
	createUrl: string;
	approveUrl: string;
	createData: CreateAction;
	approveData?: ApproveAction;
	instructionsText: string;
}

export default function PayPal({
	createUrl,
	approveUrl,
	createData,
	approveData,
	instructionsText,
}: PayPalInput) {
	const [paypal, setPaypal] = useState<PayPalNamespace | null>();
	const paypalBtn = useRef<HTMLDivElement>(null);
	useMountEffect(() => {
		const loadPaypal = async () => {
			try {
				const paypal = await loadScript({
					'client-id': paypalClientId,
				});
				setPaypal(paypal);
			} catch (error) {
				console.error('failed to load the PayPal JS SDK script', error);
			}
		};
		loadPaypal();
	});
	useEffect(() => {
		if (
			paypal &&
			paypal.Buttons &&
			paypalBtn.current &&
			paypalBtn.current.childElementCount === 0
		) {
			let successData: ApproveAction['successData'] | undefined;
			paypal
				.Buttons({
					// Call your server to set up the transaction
					style: {
						color: 'blue',
					},
					createOrder: async function () {
						const result = await fetch(createUrl, {
							method: 'post',
							body: JSON.stringify(createData),
						});
						const data: CheckoutCreateResponse = await result.json();
						successData = data.successData;
						return data.id || '';
					},

					// Call your server to finalize the transaction
					onApprove: async function (data, actions) {
						if (!data.orderID || !successData) {
							return undefined;
						}
						const bodyData: ApproveAction = approveData || {
							...createData,
							action: 'approve',
							orderID: data.orderID,
							successData,
							instructionsText,
						};
						bodyData.orderID = data.orderID;

						return fetch(approveUrl, {
							method: 'post',
							body: JSON.stringify(bodyData),
						})
							.then(function (res) {
								return res.json();
							})
							.then(function (orderData) {
								// Three cases to handle:
								//   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
								//   (2) Other non-recoverable errors -> Show a failure message
								//   (3) Successful transaction -> Show confirmation or thank you

								// This example reads a v2/checkout/orders capture response, propagated from the server
								// You could use a different API or structure for your 'orderData'
								var errorDetail =
									Array.isArray(orderData.details) && orderData.details[0];

								if (
									errorDetail &&
									errorDetail.issue === 'INSTRUMENT_DECLINED'
								) {
									return actions.restart(); // Recoverable state, per:
									// https://developer.paypal.com/docs/checkout/integration-features/funding-failure/
								}

								if (errorDetail) {
									var msg = 'Sorry, your transaction could not be processed.';
									if (errorDetail.description)
										msg += '\n\n' + errorDetail.description;
									if (orderData.debug_id)
										msg += ' (' + orderData.debug_id + ')';
									return alert(msg); // Show a failure message (try to avoid alerts in production environments)
								}

								// Successful capture! For demo purposes:
								console.log(
									'Capture result',
									orderData,
									JSON.stringify(orderData, null, 2)
								);
								var transaction =
									orderData.purchase_units[0].payments.captures[0];
								alert(
									'Transaction ' +
										transaction.status +
										': ' +
										transaction.id +
										'\n\nSee console for all available details'
								);

								// Replace the above to show a success message within this page, e.g.
								// const element = document.getElementById('paypal-button-container');
								// element.innerHTML = '';
								// element.innerHTML = '<h3>Thank you for your payment!</h3>';
								// Or go to another URL:  actions.redirect('thank_you.html');
							});
					},
				})
				.render('#paypal-button-container');
		}
	}, [approveData, approveUrl, createData, createUrl, paypal, paypalBtn]);

	return (
		<section className="card flex w-full justify-center bg-slate-100 p-4">
			{/* Set up a container element for the button  */}
			<div
				ref={paypalBtn}
				id="paypal-button-container"
				className="flex w-full justify-center"
			></div>
		</section>
	);
}
