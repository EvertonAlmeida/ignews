import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { faunaDB } from "../../services/fauna";
import { stripe } from '../../services/stripe';

type User = {
	ref: {
		id: string;
	},
	data: {
		stripeCustomerId: string;
	}
}

const getUserByEmail = (email: string) => {
	return faunaDB.query<User>(
		q.Get(
			q.Match(
				q.Index('user_by_email'),
				q.Casefold(email)
			)
		)
	)
}

const updateStripeCustomerIdOnUser = (user: User, stripeCustomerId: string) => {
	return faunaDB.query(
		q.Update(
			q.Ref(q.Collection('users'), user.ref.id),
			{
				data: {
					stripeCustomerId: stripeCustomerId,
				}
			}
		),
	)
}

const createStripeCheckout = (customerId: string) => {
	return stripe.checkout.sessions.create({
		customer: customerId,
		payment_method_types: ['card'],
		billing_address_collection: 'required',
		line_items: [
			{ price: 'price_1KF3HtKOjXtmwxTLFHqytCOq', quantity: 1 },
		],
		mode: 'subscription',
		allow_promotion_codes: true,
		success_url: process.env.STRIPE_SUCCESS_URL,
		cancel_url: process.env.STRIPE_CANCEL_URL
	})
}

export default async function subscribe (req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const session = await getSession({ req });
		const user = await getUserByEmail(session.user.email)
		let customerId = user.data.stripeCustomerId

		if(!customerId) {
			const stripeCustomer =  await stripe.customers.create({
				email: session.user.email,
				// metadata
			})
			updateStripeCustomerIdOnUser(user, stripeCustomer.id);
			customerId = stripeCustomer.id;
		}

		const stripeCheckoutSettion = await createStripeCheckout(customerId);

		return res.status(200).json({ sessionId: stripeCheckoutSettion.id })
	}

	res.setHeader('Allow', 'POST');
	res.status(405).end('Method not allowed');
}
