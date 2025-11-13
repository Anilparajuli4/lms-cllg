// 'use client';
// import { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';

// export default function KhaltiPaymentButton({ courseId, amount, userId }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   const initiatePayment = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.post('/api/payment/initiate', {
//         amount,
//         courseId,
//         userId
//       }, { withCredentials: true });

//       if (response.data.success) {
//         // Redirect to Khalti payment page
//         window.location.href = response.data.paymentUrl;
//       } else {
//         throw new Error(response.data.error || 'Payment initiation failed');
//       }
//     } catch (err) {
//       console.error('Payment error:', err);
//       setError(err.response?.data?.error || 'Failed to initiate payment');
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="mt-4">
//       <button
//         onClick={initiatePayment}
//         disabled={isLoading}
//         className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md font-medium transition duration-200 flex items-center justify-center"
//       >
//         {isLoading ? (
//           <>
//             <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Processing...
//           </>
//         ) : (
//           `Pay with Khalti (Rs. ${amount})`
//         )}
//       </button>
//       {error && (
//         <p className="mt-2 text-sm text-red-600">{error}</p>
//       )}
//     </div>
//   );
// }


'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/authContext';

export default function KhaltiPaymentButton({ courseId, amount, userId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const {user} = useAuth()

  const initiatePayment = async () => {
    if(!user){
      setError(null)
      router.push('/login')
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/payment/initiate', 
        { amount, courseId },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data.error || 'Payment initiation failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={initiatePayment}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md font-medium transition duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          `Pay with Khalti (Rs. ${amount})`
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}