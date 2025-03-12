'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";

export default function CheckoutForm({ amount, paymentType }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Create payment intent
      const response = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          paymentType,
          playerId: localStorage.getItem('userId')
        }),
      });

      const { clientSecret, paymentId } = await response.json();

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?paymentId=${paymentId}&type=${paymentTypde}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (error) {
      setErrorMessage('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full mt-4"
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </Button>
      {errorMessage && (
        <div className="text-red-500 mt-4 text-center">
          {errorMessage}
        </div>
      )}
    </form>
  );
}