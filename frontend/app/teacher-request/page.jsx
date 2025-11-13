'use client'
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import Link from 'next/link';
import ProfileDropdown from '../component/ProfileDropDown';

export default function TeacherRequestPage() {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const {user} = useAuth()

  if(!user){
    return <p>loading</p>
  }
  const userId = user.id

  const handleSubmit = async () => {
    try {
    //   const userId = 'USER_ID_HERE'; // You'd get this from auth context/session
      await axios.post('http://localhost:5000/api/teacher-request', { userId, message });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting request');
    }
  };

  return (
    <>
     <header className="sticky top-0 z-50 bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
     
        <Link href="/" className="text-2xl font-bold text-[#8DBCC7]">
        LMS
      </Link>
     
      
      <div className="flex space-x-4">
    {user ?
    <ProfileDropdown/> :  <><Link href="/login" className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition">
          Login
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-[#648DB3] text-white rounded-lg hover:bg-indigo-700 transition">
          Sign Up
        </Link> </> }
   
  </div>
    </div>
  </header>
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4">Request to Become a Teacher</h1>
      {submitted ? (
        <p className="text-green-600">Request submitted successfully.</p>
      ) : (
        <>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows="4"
            placeholder="Why do you want to be a teacher?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Request
          </button>
        </>
      )}
    </div>
    </>
  );
}
