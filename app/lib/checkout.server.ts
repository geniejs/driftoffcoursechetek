import paypal from '@paypal/checkout-server-sdk';
import type {
	Order,
	PurchaseUnitRequest,
} from '@paypal/checkout-server-sdk/lib/orders/lib';
import type { AvailabilityResponse } from '~/utils';
import { getDisplayDateRange, getImageUrl } from '~/utils';
import { normalizeDate } from '~/utils';
import { getReservableAvailabilityByDate, isDev } from '~/utils';
import { getReservable } from './reservables.db.server';
import type { Prisma, User } from '@prisma/client';
import { getDB } from '~/lib/db.server';
import type { ApproveAction } from '~/routes/account/checkout';
import { sendConfirmationEmail } from '~/emailHelper.server';

let environment: paypal.core.SandboxEnvironment | paypal.core.LiveEnvironment;
let client: paypal.core.PayPalHttpClient;
export const getClient = () => {
	// This sample uses SandboxEnvironment. In production, use LiveEnvironment
	if (!client) {
		const clientId = process.env.PAYPAL_CLIENT_ID || '';
		const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
		environment = isDev
			? new paypal.core.SandboxEnvironment(clientId, clientSecret)
			: new paypal.core.LiveEnvironment(clientId, clientSecret);

		client = new paypal.core.PayPalHttpClient(environment);

	}
	return client;
};
export type CreateOrderResponse = {
	order?: Order;
	errorMessage?: string;
	successData?: ApproveAction['successData'];
};
export const createOrder = async (
	startDate: string,
	endDate: string,
	reservableId: string,
	user: User
): Promise<CreateOrderResponse> => {
	const reservable = await getReservable(reservableId);
	const availabilityByDate = (await getReservableAvailabilityByDate(
		startDate,
		endDate,
		reservable,
	)) as AvailabilityResponse;
	if (!availabilityByDate.isAvail) {
		return { errorMessage: 'unavailable' };
	}
	let itemTotal = availabilityByDate.totalCost || 0;
	let taxTotal = itemTotal * (availabilityByDate.tax || 0);
	const client = getClient();
	const request = new paypal.orders.OrdersCreateRequest();
	const purchase_units: PurchaseUnitRequest[] = [
		{
			reference_id: 'reservation',
			description: reservable.name + ' Reservation',
			amount: {
				currency_code: 'USD',
				value: (itemTotal + taxTotal).toFixed(2),
				breakdown: {
					item_total: {
						currency_code: 'USD',
						value: itemTotal.toFixed(2),
					},
					tax_total: {
						currency_code: 'USD',
						value: taxTotal.toFixed(2),
					},
				},
			},
			items: [
				{
					name: reservable.name + ' Reservation',
					quantity: '1',
					category: 'DIGITAL_GOODS',
					unit_amount: {
						currency_code: 'USD',
						value: itemTotal.toFixed(2),
					},
					tax: {
						currency_code: 'USD',
						value: taxTotal.toFixed(2),
					},
				},
			],
		},
	];
	let depositTotal = 0;
	const depositsById: Record<string, string> = {};
	availabilityByDate.deposit?.forEach((deposit, i) => {
		if (deposit && deposit.cost) {
			const reference_id = `deposit-${deposit.name.split(/\s+/g).join('-')}`;
			depositsById[reference_id] = deposit.id;
			depositTotal += deposit.cost;
			purchase_units.push({
				reference_id,
				description: deposit.name + ' refundable deposit',
				amount: {
					currency_code: 'USD',
					value: deposit.cost.toFixed(2),
					breakdown: {
						item_total: {
							currency_code: 'USD',
							value: deposit.cost.toFixed(2),
						},
					},
				},
				items: [
					{
						name: deposit.name + ' refundable deposit',
						quantity: '1',
						category: 'DIGITAL_GOODS',
						unit_amount: {
							currency_code: 'USD',
							value: deposit.cost.toFixed(2),
						},
					},
				],
			});
		}
	});

	request.requestBody({
		intent: 'CAPTURE',
		purchase_units,
		application_context: {
			shipping_preference: 'NO_SHIPPING',
		},
	});
	try {
		const response = await client.execute(request);
		const startDateDate = normalizeDate(startDate);
		const endDateDate = normalizeDate(endDate);
	
		if (response.result) {
			const successData: Prisma.ReservationCreateArgs = {
				data: {
					userId: user.id,
					reservableId,
					startDate: startDateDate?.toISOString() || '',
					endDate: endDateDate?.toISOString() || '',
					totalCost: parseFloat((itemTotal + taxTotal + depositTotal).toFixed(2)),
					receipt: {
						create: {
							depositCost: parseFloat(depositTotal.toFixed(2)),
							taxCost: parseFloat(taxTotal.toFixed(2)),
							reservationCost: parseFloat(itemTotal.toFixed(2)),
							totalCost: parseFloat(
								(itemTotal + taxTotal + depositTotal).toFixed(2)
							),
						},
					},
				},
			};
			return {
				order: response.result,
				successData: {
					...successData,
					depositsById,
					heroImgSrc: getImageUrl(
						'',
						reservable.images[0].image_sizesMeta.lg,
						Math.max()
					),
					heroImgHref: `https://driftoffcoursechetek.com/availability/${reservable.id}`,
					instructionsText: `${getDisplayDateRange(
						startDateDate!,
						endDateDate
					)}<br/><br/>
					<b style="color:#FFFFFF; text-decoration: underline;">Pickup Location</b></a><br/>
					<span style="color:#FFFFFF;">
					${reservable.pickup?.name}<br/>
					${reservable.pickup?.address?.address}<br/>
					${reservable.pickup?.address?.city}, ${reservable.pickup?.address?.state}  ${
						reservable.pickup?.address?.zipCode
					}<br/>
					${
						reservable.pickup?.address?.longitude &&
						reservable.pickup?.address?.latitude &&
						`${reservable.pickup?.address?.latitude} x ${reservable.pickup?.address?.longitude} <br/>`
					}
					<br/><br/>
					${
						reservable.occupancyPersons &&
						`Max Occupancy (persons): ${reservable.occupancyPersons}<br/>`
					}
					${
						reservable.occupancyWeight &&
						`Max Occupancy (weight): ${reservable.occupancyWeight}lbs<br/>`
					}
					</span>
					`,
				},
			};
		}

	} catch (e) {
		console.error('paypal error ', e)
	}

	return { errorMessage: 'error' };
};

export const captureOrder = async (
	{ orderID, successData, instructionsText }: ApproveAction,
	user: User
): Promise<{ order?: Order; errorMessage?: string }> => {
	const client = getClient();
	const request = new paypal.orders.OrdersCaptureRequest(orderID);
	request.requestBody({});
	// Call API with your client and get a response for your call
	const response = await client.execute(request);
	const order = response?.result as Order;
	const purchaseUnitsCreate: Prisma.PurchaseUnitCreateInput[] =
		order.purchase_units.map((p) => {
			return {
				referenceId: p.reference_id,
				paypalId: p.payments.captures[0].id,
				status: p.payments.captures[0].status,
				amount: p.payments.captures[0].amount.value,
				depositId: successData.depositsById[p.reference_id],
			};
		});
	const createRervationData = successData.data;
	createRervationData.receipt = createRervationData.receipt || {};
	createRervationData.receipt.create = createRervationData.receipt.create || {};
	createRervationData.receipt.create = {
		...createRervationData.receipt.create,
		paypalId: order.id,
		status: order.status,
		paypalResponse: JSON.stringify(response),
		amountPaid: createRervationData.receipt.create?.totalCost,
		purchaseUnits: {
			create: purchaseUnitsCreate,
		},
	};

	await getDB().reservation.create({
		data: createRervationData,
	});

	console.log('order', order)

	if (order.status.toLowerCase().includes('completed')) {
		await sendConfirmationEmail(user.email!, {
			name: user.name,
			btnText: 'View your Reservations',
			btnHref: `https://driftoffcourse.com/account/bookings#${createRervationData.id}`,
			heroImgSrc: successData.heroImgSrc,
			heroImgHref: successData.heroImgHref,
			instructionsText: `${successData.instructionsText}<br/>${instructionsText}`,
			reservationText: `Reservation #${createRervationData.id}
			<br/>Your payment method was charged a total of $${createRervationData.receipt.create.amountPaid}
			<br/>Reservation Cost: $${createRervationData.receipt.create.reservationCost}
			<br/>Tax: $${createRervationData.receipt.create.taxCost}
			<br/>Refundable Deposit: $${createRervationData.receipt.create.reservationCost}<br/><br/>
			See your <a href="https://driftoffcourse.com/account/bookings#${createRervationData.id}" target="_blank" style="text-decoration: underline; color: #000000; font-family: sans-serif;">current bookings</a> for more details.<br/>`,
		});
	}
	return response.result;
};

/**
{
	"statusCode":201,
	"headers":{
	   "content-type":"application/json",
	   "content-length":"2226",
	   "connection":"close",
	   "date":"Thu, 26 May 2022 18:30:42 GMT",
	   "application_id":"APP-80W284485P519543T",
	   "cache-control":"max-age=0, no-cache, no-store, must-revalidate",
	   "caller_acct_num":"GH3HPYYR3683G",
	   "paypal-debug-id":"622e8de19d173",
	   "strict-transport-security":"max-age=31536000; includeSubDomains"
	},
	"result":{
	   "id":"1RA33550LR9303245",
	   "status":"COMPLETED",
	   "purchase_units":[
		  {
			 "reference_id":"deposit-Damage",
			 "shipping":{
				"name":{
				   "full_name":"John Doe"
				}
			 },
			 "payments":{
				"captures":[
				   {
					  "id":"0LP63627VR7573714",
					  "status":"COMPLETED",
					  "amount":{
						 "currency_code":"USD",
						 "value":"125.00"
					  },
					  "final_capture":true,
					  "seller_protection":{
						 "status":"ELIGIBLE",
						 "dispute_categories":[
							"ITEM_NOT_RECEIVED",
							"UNAUTHORIZED_TRANSACTION"
						 ]
					  },
					  "seller_receivable_breakdown":{
						 "gross_amount":{
							"currency_code":"USD",
							"value":"125.00"
						 },
						 "paypal_fee":{
							"currency_code":"USD",
							"value":"4.85"
						 },
						 "net_amount":{
							"currency_code":"USD",
							"value":"120.15"
						 }
					  },
					  "links":[
						 {
							"href":"https://api.sandbox.paypal.com/v2/payments/captures/0LP63627VR7573714",
							"rel":"self",
							"method":"GET"
						 },
						 {
							"href":"https://api.sandbox.paypal.com/v2/payments/captures/0LP63627VR7573714/refund",
							"rel":"refund",
							"method":"POST"
						 },
						 {
							"href":"https://api.sandbox.paypal.com/v2/checkout/orders/1RA33550LR9303245",
							"rel":"up",
							"method":"GET"
						 }
					  ],
					  "create_time":"2022-05-26T18:30:41Z",
					  "update_time":"2022-05-26T18:30:41Z"
				   }
				]
			 }
		  },
		  {
			 "reference_id":"reservation",
			 "shipping":{
				"name":{
				   "full_name":"John Doe"
				}
			 },
			 "payments":{
				"captures":[
				   {
					  "id":"41E94179133655513",
					  "status":"COMPLETED",
					  "amount":{
						 "currency_code":"USD",
						 "value":"327.05"
					  },
					  "final_capture":true,
					  "seller_protection":{
						 "status":"ELIGIBLE",
						 "dispute_categories":[
							"ITEM_NOT_RECEIVED",
							"UNAUTHORIZED_TRANSACTION"
						 ]
					  },
					  "seller_receivable_breakdown":{
						 "gross_amount":{
							"currency_code":"USD",
							"value":"327.05"
						 },
						 "paypal_fee":{
							"currency_code":"USD",
							"value":"11.90"
						 },
						 "net_amount":{
							"currency_code":"USD",
							"value":"315.15"
						 }
					  },
					  "links":[
						 {
							"href":"https://api.sandbox.paypal.com/v2/payments/captures/41E94179133655513",
							"rel":"self",
							"method":"GET"
						 },
						 {
							"href":"https://api.sandbox.paypal.com/v2/payments/captures/41E94179133655513/refund",
							"rel":"refund",
							"method":"POST"
						 },
						 {
							"href":"https://api.sandbox.paypal.com/v2/checkout/orders/1RA33550LR9303245",
							"rel":"up",
							"method":"GET"
						 }
					  ],
					  "create_time":"2022-05-26T18:30:40Z",
					  "update_time":"2022-05-26T18:30:40Z"
				   }
				]
			 }
		  }
	   ],
	   "payer":{
		  "name":{
			 "given_name":"John",
			 "surname":"Doe"
		  },
		  "email_address":"sb-rqevs14356140@personal.example.com",
		  "payer_id":"T7YW2D4E5EU9L",
		  "address":{
			 
		  }
	   },
	   "links":[
		  {
			 "href":"https://api.sandbox.paypal.com/v2/checkout/orders/1RA33550LR9303245",
			 "rel":"self",
			 "method":"GET"
		  }
	   ]
	}
}
  */