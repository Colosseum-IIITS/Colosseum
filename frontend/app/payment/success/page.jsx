'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/player/team');
    }, 3000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8">
        {/* Success Animation Container */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 bg-green-50 rounded-full animate-pulse"></div>
          <svg
            className="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        {/* Simple Message */}
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Payment Complete
        </h1>
        <p className="text-gray-500 text-center text-sm">Redirecting...</p>
      </div>

      <style jsx>{`
        .checkmark {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: block;
          stroke-width: 4;
          stroke: #22c55e;
          stroke-miterlimit: 10;
          position: relative;
          z-index: 10;
          animation: scale .5s ease-in-out .3s forwards;
        }

        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: stroke .5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke-width: 4;
          animation: stroke .4s cubic-bezier(0.65, 0, 0.45, 1) .5s forwards;
        }

        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }

        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
      `}</style>
    </div>
  );
}