import { faunaDB } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";
import Stripe from "stripe";

type User = {
	ref: {
		id: string;
	},
	data: {
		stripeCustomerId: string;
	}
}

type SubscriptionData = {
	id: string;
	userId: string;
	status: string;
	price: string;
}

const getUserRefByStripeCustomerId = (customerId: string) => {
	return faunaDB.query<string>(
		q.Select(
			"ref",
			q.Get(
				q.Match(
					q.Index('user_by_stripe_customer_id'),
					customerId
				)
			)
		)
	)
}

const createSubscriptionData = (subscription: Stripe.Response<Stripe.Subscription>, userRef: string): SubscriptionData => {
	return {
		id: subscription.id,
		userId: userRef,
		status: subscription.status,
		price: subscription.items.data[0].price.id,
	};
}

const createSubscription = (subscriptionData: SubscriptionData) => {
	return faunaDB.query(
		q.Create(
			q.Collection('subscriptions'),
			{ data: subscriptionData }
		)
	);
}

const replaceSubscription = (subscriptionData: SubscriptionData, subscriptionId: string) => {
	return faunaDB.query(
		q.Replace(
			q.Select(
				"ref",
				q.Get(
					q.Match(
						q.Index('subscription_by_id'),
						subscriptionId,
					)
				)
			),
			{ data: subscriptionData}
		)
	)
}

export const saveSubscription = async (
	subscriptionId: string,
	customerId: string,
	createAction = false
) => {
	const userRef = await getUserRefByStripeCustomerId(customerId);
	const subscription = await stripe.subscriptions.retrieve(subscriptionId)
	const subscriptionData = createSubscriptionData(subscription, userRef);
	if(createAction) await createSubscription(subscriptionData);
	await replaceSubscription(subscriptionData, subscriptionId);
}
