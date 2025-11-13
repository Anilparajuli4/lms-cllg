'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/authContext';
import ProfileDropdown from '../component/ProfileDropDown';
import RedirectFromPublic from '../component/RedirectForPublic';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
      const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:5000/api/courses/getAllCourse?search=${search}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [search]);

  return (
    <>
      <RedirectFromPublic>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Explore Our Courses
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Learn from industry experts and advance your career
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search ? 'Try a different search term' : 'Check back later for new courses'}
          </p>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <div key={course.id} className="flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition duration-300">
            <Link href={`/student/courses/${course.id}`}>
              <div className="flex-shrink-0 relative h-48 w-full">
                <img 
                  src={course.thumbnailUrl || '/placeholder-course.jpg'} 
                  className="h-full w-full object-cover"
                  alt={course.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {course.category}
                </span>
              </div>
            </Link>
            
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <Link href={`/student/courses/${course.id}`} className="block">
                  <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition duration-150">
                    {course.title}
                  </h3>
                </Link>
                <p className="mt-3 text-base text-gray-500 line-clamp-2">
                  {course.description}
                </p>
              </div>
              
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <img 
                    className="h-10 w-10 rounded-full" 
                    src={course.teacher.profilePicture || '/placeholder-avatar.jpg'} 
                    alt={course.teacher.name}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {course.teacher.name}
                  </p>
                  <div className="flex space-x-1 mt-1">
                    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-500">4.8 (24 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </RedirectFromPublic>
    </>
  );
}