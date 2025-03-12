'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import CheckoutForm from '@/components/payment/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');
  const type = searchParams.get('type');

  const options = {
    mode: 'payment',
    amount: amount * 100,
    currency: 'inr',
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Payment</h1>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm 
          amount={amount} 
          paymentType={type}
        />
      </Elements>
    </div>
  );
}