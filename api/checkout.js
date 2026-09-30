import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, itemName } = req.body;
      
      // Determine the origin for redirect URLs
      const origin = req.headers.origin || 'http://localhost:5173';
      
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: itemName || 'Tribute',
              },
              unit_amount: amount ? parseInt(amount, 10) * 100 : 10000, // Default to $100.00
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/?success=true`,
        cancel_url: `${origin}/?canceled=true`,
      });
      
      res.status(200).json({ id: session.id, url: session.url });
    } catch (err) {
      console.error('Stripe error:', err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
