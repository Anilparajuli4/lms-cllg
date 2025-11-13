'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get('pidx');
      const transactionId = searchParams.get('transaction_id');
      const amount = searchParams.get('amount');
      const courseId = searchParams.get('purchaseOrderId');

      if (!pidx || !transactionId) {
        setStatus('invalid');
        setError('Missing payment verification parameters');
        return;
      }

      try {
        setStatus('verifying');
        
        // Verify payment with backend
     const response = await axios.get('http://localhost:5000/api/payment/verify', {
  params: {
    pidx,
  },
  withCredentials: true,
});
//changes

        if (response.data.success) {
          setStatus('success');
          setEnrollment(response.data.enrollment);
          
          // Redirect to course after 5 seconds
          setTimeout(() => {
            router.push(`/courses/${courseId}?enrolled=true`);
          }, 5000);
        } else {
          throw new Error(response.data.error || 'Verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('failed');
        setError(err.response?.data?.message || err.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === 'processing' && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>
        )}

        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h1>
            <p className="text-gray-600">We're verifying your payment details...</p>
          </div>
        )}

        {status === 'success' && enrollment && (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <p className="font-medium">Course: {enrollment.course?.title}</p>
              <p>Amount: Rs. {enrollment.payment?.amount}</p>
              <p className="text-sm text-green-600 mt-2">Transaction ID: {enrollment.payment?.pidx}</p>
            </div>
            <p className="text-gray-500">You will be redirected to the course shortly...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Payment</h1>
            <p className="text-gray-600 mb-4">{error || 'Missing required payment information'}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        )}
        <div></div>
      </div>
    </div>
  );
}