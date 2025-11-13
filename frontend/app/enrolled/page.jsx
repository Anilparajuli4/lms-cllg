'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import EnrolledCourseCard from '../component/EnrolledCoursesCard';
import Link from 'next/link';
import ProfileDropdown from '../component/ProfileDropDown';


export default function EnrolledCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/users/enrolled-courses`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        if (!res.ok) {
          throw new Error(res.statusText || 'Failed to fetch enrolled courses');
        }

        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold">Authentication Required</h3>
          </div>
          <p className="mt-2">Please sign in to view your enrolled courses.</p>
        </div>
      </div>
    );
  }

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Learning Dashboard</h1>
        <p className="text-gray-600">
          {courses.length > 0 
            ? `You're enrolled in ${courses.length} course${courses.length > 1 ? 's' : ''}`
            : 'Your learning journey starts here'}
        </p>
      </div>

      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold">Error</h3>
          </div>
          <p className="mt-2">{error}</p>
        </div>
      ) : loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full mt-4 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              <h3 className="font-bold">No courses enrolled yet!</h3>
            </div>
            <p className="mt-2">Discover our catalog to start your learning journey.</p>
          </div>
          <a href="/courses" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Browse Courses
          </a>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold">
              Your Courses ({courses.length})
            </h2>
            <div className="flex gap-2">
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-3 rounded-md text-sm transition-colors">
                Sort by: Recent
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-1 px-3 rounded-md text-sm transition-colors">
                Filter
              </button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((enrollment) => (
              <EnrolledCourseCard 
                key={enrollment.id} 
                course={enrollment.course} 
                progress={enrollment.progress || 0}
                lastAccessed={enrollment.lastAccessed}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
}