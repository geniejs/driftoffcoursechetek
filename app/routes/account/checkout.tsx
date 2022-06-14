import { ActionFunction, json, redirect } from '@remix-run/cloudflare';
import { getUserByRequestToken } from '~/lib/auth.server';
import { captureOrder, createOrder } from '~/lib/checkout.server';
import type { Prisma } from '@prisma/client';

export interface CreateAction {
	action: 'create';
	startDate: string;
	endDate: string;
	reservableId: string;
	userId: string;
}

export interface ApproveAction {
	action: 'approve';
	orderID: string;
	successData: Prisma.ReservationCreateArgs & {
		depositsById: Record<string, string>;
		heroImgSrc: string;
		heroImgHref: string;
		instructionsText: string;
	};
	startDate: string;
	endDate: string;
	reservableId: string;
	userId: string;
	instructionsText: string;
}
type CheckoutAction = ApproveAction | CreateAction;

export type CheckoutCreateResponse = {
	id?: string;
	error?: string;
	successData?: ApproveAction['successData'];
};

export let action: ActionFunction = async ({ request, context }) => {
	const { user } = await getUserByRequestToken(request);

	if (!user) return redirect('/login');
	const data: CheckoutAction = await request.json();
	if (data.action === 'create') {
		const order = await createOrder(
			data.startDate,
			data.endDate,
			data.reservableId,
			user
		);
		if (order.errorMessage) {
			return json({ error: order.errorMessage, detail: order.detail }, 500);
		} else if (order?.order?.id) {
			return json({ id: order.order.id, successData: order.successData });
		} else {
			return json({ error: 'error' }, 500);
		}
	} else if (data.action === 'approve' && data.orderID) {
		const order = await captureOrder(data, user);
		return json(order);
	}
	return json('unknown request');
};

export default function Profile() {
	// const [fbUser, loading] = useAuthState(getAuth());

	// let navigate = useNavigate();
	// useEffect(() => {
	// 	if (!fbUser && !loading) {
	// 		navigate('/login?sendto=/account/checkout');
	// 	}
	// }, [fbUser, loading, navigate]);
	return (
		<div className="relative flex max-w-5xl flex-col">
			{/* sb-rqevs14356140@personal.example.com h?pio?4M
			<PayPal
				createUrl="/account/checkout?_data=routes/account/checkout"
				createData={{
					action: 'create',
					reservableId: 'cl1zfpjwl1098w4enckjuybkk',
					startDate: '2022-06-21',
					endDate: '2022-06-22',
					userId: 'cl0k1blph0120zuen145hh0cw',
				}}
				approveUrl="/account/checkout?_data=routes/account/checkout"
			></PayPal> */}
		</div>
	);
}
