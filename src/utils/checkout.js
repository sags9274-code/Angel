import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside of a component’s render to avoid recreating the Stripe object on every render.
// This requires VITE_STRIPE_PUBLISHABLE_KEY in .env.local
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
  }
  return stripePromise;
};

export const handleCheckout = async (itemName, amount) => {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemName, amount }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to initiate checkout. Please ensure API keys are configured.');
  }
};
