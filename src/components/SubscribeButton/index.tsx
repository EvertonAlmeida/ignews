import { signIn, useSession } from 'next-auth/react';
import { geStripeJs } from '../../services/stripe-js'
import { api } from '../../services/api';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
	priceId: string;
}

export const SubscribeButton = ({ priceId }: SubscribeButtonProps) => {
	const session = useSession();

	const handleSubscribe = async () => {
		if (!session.data) {
			signIn('github')
			return;
		}

		try {
			const response = await api.post('/subscribe');
			const { sessionId } = response.data;
			const stripe = await geStripeJs();
			await stripe.redirectToCheckout({ sessionId });
		} catch (error) {
			alert('Error: '+error.message);
		}
	}
	return (
		<button
			type="button"
			className={styles.subscribeButton}
			onClick={handleSubscribe}
		>
			Subscribe now
		</ button>
	);
}
