'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from './context/authContext';
import ProtectedRoute from './context/protectedRoute';
import ProfileDropdown from './component/ProfileDropDown';
import Image from 'next/image';
import RedirectFromPublic from './component/RedirectForPublic';


export default function Home() {
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
 const [courseRatings, setCourseRatings] = useState({});

  const router = useRouter();
    const { user } = useAuth();



  const fetchAverageRatings = async (courseIds) => {
    try {
      const ratings = {};
      // Fetch ratings for all courses in parallel
      const ratingPromises = courseIds.map(async (id) => {
        const response = await axios.get(`http://localhost:5000/api/review/average/${id}`);
        return { id, rating: response.data.averageRating };
      });
      
      const results = await Promise.all(ratingPromises);
      results.forEach(({ id, rating }) => {
        ratings[id] = rating;
      });
      
      setCourseRatings(ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch courses
        const coursesRes = await fetch('http://localhost:5000/api/courses/getAllCourse');
        const coursesData = await coursesRes.json();
        console.log(coursesData);
        
        setCourses(coursesData);
        
        // Get 4 random featured courses with thumbnails
        const shuffled = [...coursesData].sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 4).filter(course => course.thumbnailUrl);
        setFeaturedCourses(featured);
        
        // Fetch ratings for featured courses
        await fetchAverageRatings(featured.map(course => course.id));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(coursesData.map(course => course.category))];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/student`);
  };

  return (
    <RedirectFromPublic>
      
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>LearnHub - Online Learning Platform</title>
        <meta name="description" content="Learn from the best courses online" />
      </Head>

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

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-400 to-purple-300 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Expand Your Knowledge <br className="hidden md:block" /> with Online Learning
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 ">
            Access thousands of courses taught by industry experts. Learn at your own pace, anytime, anywhere.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex shadow-lg">
            <input
              type="text"
              placeholder="Search for courses..."
              className="flex-grow px-5 py-4 rounded-l-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-4 rounded-r-lg transition duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Featured Courses */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <span className="text-indigo-600 font-semibold">POPULAR COURSES</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Featured Courses</h2>
            </div>
            <Link href="/student" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
              View All Courses
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.map((course) => (
                <FeaturedCourseCard  key={course.id} 
                  course={course} 
                  averageRating={courseRatings[course.id] || null}  />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold">CATEGORIES</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Explore our wide range of categories to find the perfect course for your learning journey.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link href={`/student`} key={category}>
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center group hover:border-indigo-500 border-2 border-transparent">
                  <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition">{category}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold">WHY CHOOSE US</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Learn Without Limits</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Content</h3>
              <p className="text-gray-600">Courses created and reviewed by industry experts and professionals.</p>
            </div>
            
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn at Your Pace</h3>
              <p className="text-gray-600">Lifetime access to courses so you can learn whenever you want.</p>
            </div>
            
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition duration-300">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Cloud Access</h3>
              <p className="text-gray-600">Access your courses from any device, anywhere in the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold">TESTIMONIALS</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What Our Students Say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
          
              <div  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-gray-200 w-14 h-14 rounded-full">
              <Image src={'/man1.jpg'} height={50} width={50} alt='img'/>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Alex Johnson</h4>
                    <p className="text-gray-500 text-sm">Web Developer</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"The courses here helped me transition into a new career. The instructors are knowledgeable and the platform is easy to use."</p>
              </div>


                <div  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-6">
                 
              <Image src={'/women.jpg'} height={60} width={50} alt='img'/>
               
                  <div className="ml-4">
                    <h4 className="font-semibold">Sharah</h4>
                    <p className="text-gray-500 text-sm">Web Developer</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"This platform gave me the confidence to switch careers. The course content is well-structured, and the instructors explain concepts clearly. I’m now working in a field I’m passionate about."</p>
              </div>


                <div  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                <div className="flex items-center mb-6">
                
              <Image src={'/men2.jpg'} height={70} width={60} alt='img'/>
                
                  <div className="ml-4">
                    <h4 className="font-semibold">John</h4>
                    <p className="text-gray-500 text-sm">App Developer</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"I was impressed by how practical and hands-on the learning experience was. The platform’s interface is intuitive, and the support from instructors made a big difference.."</p>
              </div>
           
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-400 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students already advancing their careers with our courses.
          </p>
          <div className="flex justify-center space-x-4">
            {/* <Link href="/signup" className="bg-white text-indigo-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg">
              Sign Up Now
            </Link> */}
            <Link href="/student" className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-200 hover:text-black hover:bg-opacity-10 transition duration-300">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  </RedirectFromPublic>
  );
}

// Featured Course Card Component
function FeaturedCourseCard({ course, averageRating }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 group">
      <Link href={`student/courses/${course.id}`}>
        <div className="relative">
          <div className="aspect-w-16 aspect-h-9">
            <img 
              className="w-full h-48 object-cover transition duration-300 group-hover:scale-105" 
              src={course.thumbnailUrl || '/placeholder-course.jpg'} 
              alt={course.title}
            />
          </div>
          <div className="absolute top-4 right-4 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">{course.category}</span>
            <div className="flex items-center">
              {averageRating !== null && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-600 text-sm ml-1">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-400 mx-2">•</span>
                </>
              )}
              <span className="text-gray-600 text-sm">{course.videos?.length || 0} lessons</span>
            </div>
          </div>
          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-indigo-600 transition">{course.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* <div className="bg-gray-200 w-8 h-8 rounded-full"></div> */}
                 <Image
                        src={course.teacher?.profilePicture || "/avatar.png"}
                        alt="Profile"
                        width={30}
                        height={30}
                        className="rounded-full object-cover border-2 border-white shadow-sm"
                      />
              <span className="text-gray-700 text-sm ml-2">{course.teacher?.name || 'Instructor'}</span>
            </div>
            <span className="text-gray-900 font-bold">Rs {course.price || '29.99'}</span>
          </div>
        </div>
      </Link>
    </div>
 
  );
}