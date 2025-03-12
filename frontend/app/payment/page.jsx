'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '@/components/payment/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Team Creation Payment</h1>
        <p className="text-gray-600 mb-6 text-center">Amount: ₹100</p>
        <Elements stripe={stripePromise}>
          <CheckoutForm amount={100} type="TEAM_CREATION" />
        </Elements>
      </div>
    </div>
  );
}