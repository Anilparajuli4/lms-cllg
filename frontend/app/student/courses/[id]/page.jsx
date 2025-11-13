// 'use client';

// import { use, useEffect, useState } from 'react';
// import axios from 'axios';
// import { Star } from 'lucide-react';

// export default function CourseDetailPage({ params }) {
//   const { id } = use(params);
//   const [course, setCourse] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [review, setReview] = useState({ rating: 0, comment: '' });
//   const [allReviews, setAllReviews] = useState([]);

//   useEffect(() => {
//     if (!id) return;
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/courses/getCourse/${id}`);
//         setCourse(res.data);
//         setIsEnrolled(res.data.isEnrolled);
//         setAllReviews(res.data.reviews);
//       } catch (err) {
//         console.error('Error loading course detail:', err);
//       }
//     };
//     fetchData();
//   }, [id]);

//   const handleReviewSubmit = async () => {
//     try {
//       await axios.post(`/api/student/courses/${id}/review`, review);
//       alert('Review submitted!');
//       setReview({ rating: 0, comment: '' });
//     } catch (err) {
//       alert('Error submitting review');
//     }
//   };

//   if (!course) return <p className="p-8">Loading...</p>;

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header Section */}
//       <div className="bg-white shadow p-8 border-b">
//         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
//             <p className="text-gray-600 mb-2">{course.description}</p>
//             <div className="flex items-center gap-2 text-yellow-500">
//               {[...Array(Math.floor(course.avgRating || 0))].map((_, i) => (
//                 <Star key={i} className="h-4 w-4 fill-yellow-500" />
//               ))}
//               <span className="text-gray-600 text-sm">({allReviews?.length} reviews)</span>
//             </div>
//           </div>
//           <div className="mt-6 md:mt-0">
//             {isEnrolled ? (
//               <button className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700">
//                 Continue Course
//               </button>
//             ) : (
//               <button className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">
//                 Enroll Now
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 px-6">
//         {/* Curriculum Sidebar */}
//         <div className="lg:col-span-1 bg-white p-6 rounded shadow">
//           <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
//           <ul className="space-y-4">
//             {course.videos.map((video) => (
//               <li key={video.id} className="border-b pb-2">
//                 <p className="text-gray-800 font-medium">{video.title}</p>
//                 {(video.isIntro || isEnrolled) ? (
//                   <video className="w-full mt-2 rounded" controls src={video.url} />
//                 ) : (
//                   <p className="text-sm text-red-500 mt-1">Enroll to watch this video</p>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Course Description & Reviews */}
//         <div className="lg:col-span-2 space-y-12">
//           {/* Course Overview */}
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
//             <p className="text-gray-700">{course.longDescription || course.description}</p>
//           </div>

//           {/* Reviews Section */}
//           <div className="bg-white p-6 rounded shadow">
//             <h2 className="text-xl font-semibold mb-4">Student Reviews</h2>
//             {allReviews?.length === 0 ? (
//               <p className="text-gray-500">No reviews yet.</p>
//             ) : (
//               <div className="space-y-6">
//                 {allReviews?.map((rev) => (
//                   <div key={rev.id} className="border-b pb-4">
//                     <div className="flex items-center mb-2">
//                       {[...Array(rev.rating)].map((_, i) => (
//                         <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
//                       ))}
//                     </div>
//                     <p className="text-gray-800">{rev.comment}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Review Form */}
//           {isEnrolled && (
//             <div className="bg-white p-6 rounded shadow">
//               <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
//               <div className="mb-4">
//                 <label className="block mb-1 font-medium">Rating</label>
//                 <select
//                   value={review.rating}
//                   onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
//                   className="w-full border rounded p-2"
//                 >
//                   <option value={0}>Select rating</option>
//                   {[1, 2, 3, 4, 5].map((r) => (
//                     <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block mb-1 font-medium">Comment</label>
//                 <textarea
//                   value={review.comment}
//                   onChange={(e) => setReview({ ...review, comment: e.target.value })}
//                   className="w-full border rounded p-2"
//                   rows={4}
//                 />
//               </div>
//               <button
//                 onClick={handleReviewSubmit}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//               >
//                 Submit Review
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import { use, useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Play, Lock } from 'lucide-react';
import { useAuth } from '@/app/context/authContext';
import ProfileDropdown from '@/app/component/ProfileDropDown';
import Link from 'next/link';
import RedirectFromPublic from '@/app/component/RedirectForPublic';
import Router from 'next/router';
import { useRouter } from 'next/navigation';
import KhaltiPaymentButton from '@/app/component/KhaltiPaymentButton';

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [avgRating, setAvgRating] = useState(0)
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [allReviews, setAllReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();



   const router = useRouter()
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:5000/api/courses/getCourse/${id}`);
        setCourse(res.data);
        // setIsEnrolled(res.data.isEnrolled);
        setIsEnrolled(false)
        const resp =  await axios.get(`http://localhost:5000/api/review/course/${id}`)
        
        setAllReviews(resp.data);

          const respo =  await axios.get(`http://localhost:5000/api/review/average/${id}`)
       setAvgRating(respo.data.averageRating)
          
      } catch (err) {
        console.error('Error loading course detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);


  const handlePurchase = async(price, courseId) =>{
    if(!user){
      router.push('/login')
    }
    await fetch('http://localhost:5000/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    price,
    studentId: user?.id,
    courseId,
    token: '23sdar234adfwal'
  }),
});
  }

  const handleReviewSubmit = async (courseId) => {
    const fullReview = {...review, courseId}
    try {
      await axios.post(`http://localhost:5000/api/review/create`, fullReview,
       {  withCredentials: true,
});
      alert('Review submitted!'); 
      setReview({ rating: 0, comment: '' });
      // Refresh reviews
      const res = await axios.get(`http://localhost:5000/api/review/course/${id}`);
      console.log(res);
      
      setAllReviews(res.data.reviews);
    } catch (err) {
     console.log(err);
     
    }
  };


  useEffect(() => {

    
    const studentId = user?.id
    const courseId = id
    if (!studentId || !courseId) return;

    const fetchEnrollment = async () => {
      console.log('inside fetch');
      
      try {
        const res = await axios.get(`http://localhost:5000/api/enrollment`, {
          params: { studentId, courseId }
        });
        console.log(res);
        
        if(res.data){
          setIsEnrolled(true)
        }
      } catch (err) {
        setIsEnrolled(false)
       console.log(err);
       
      } finally {

      }
    };

    fetchEnrollment();
  }, [user?.id, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) return <p className="p-8">Course not found</p>;

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
   
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-blue-100 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < Math.floor(avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-blue-100">({allReviews?.length} reviews)</span>
                </div>
                <span className="text-blue-100">•</span>
                <span className="text-blue-100">{course.videos.length} lectures</span>
                <span className="text-blue-100">•</span>
                <span className="text-blue-100">{course.category}</span>
              </div>

              <div className="flex items-center space-x-4">
                <img 
                  src={course.teacher.profilePicture || '/avatar.png'} 
                  alt={course.teacher.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-blue-100">Created by</p>
                  <p className="font-medium">{course.teacher.name}</p>
                </div>
              </div>
            </div>

            <div className="md:w-80">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="relative pb-9/16">
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4">
                    {/* <button onClick={()=> handlePurchase(course.price, course.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition duration-200">
                      {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                    </button> */}
                    {isEnrolled ? (
  <button 
    onClick={() => router.push(`/learn/${course.id}`)}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition duration-200"
  >
    Continue Learning
  </button>
) : (
  <KhaltiPaymentButton
    courseId={course.id} 
    amount={course.price} 
    userId={user?.id} 
  />
)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Price</span>
                    <span className="text-xl font-bold text-gray-900">Rs {course.price || 'Free'}</span>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Play className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{course.videos.length} video lessons</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-4 py-2 font-medium ${activeTab === 'curriculum' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Curriculum
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'curriculum' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Course Content</h2>
              <p className="text-gray-600 mt-1">{course.videos.length} sections • {course.videos.length} lectures</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {course.videos.map((video, index) => (
                <li key={video.id} className="p-4 hover:bg-gray-50 transition duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-8">{index + 1}</span>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-800">{video.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {video.isIntro ? 'Preview available' : 'Enroll to access'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-4">2:30</span>
                      {video.isIntro || isEnrolled ? (
                        <button className="text-blue-600 hover:text-blue-800">
                          <Play className="h-5 w-5" />
                        </button>
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {(video.isIntro || isEnrolled) && (
                    <div className="mt-4 ml-11">
                      <video controls className="w-full rounded-lg">
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About This Course</h2>
            <div className="prose max-w-none text-gray-700">
              <p>{course.longDescription || course.description}</p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">What You'll Learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array(4).fill(0).map((_, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Learning outcome {i+1} related to this course</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Student Feedback</h2>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {avgRating || '0.0'}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Course Rating</p>
                </div>
                
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = allReviews?.filter(r => r.rating === rating).length || 0;
                    const percentage = allReviews?.length ? (count / allReviews.length) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center mb-2">
                        <div className="w-10 text-sm font-medium text-gray-900">
                          {rating} star
                        </div>
                        <div className="flex-1 mx-4 h-2.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-2.5 bg-yellow-400 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-10 text-sm text-right text-gray-500">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {isEnrolled && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Leave a Review</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReview({ ...review, rating: star })}
                          className="text-gray-400 hover:text-yellow-500 focus:outline-none"
                        >
                          <Star className={`h-8 w-8 ${review.rating >= star ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Review
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={()=>handleReviewSubmit(course.id)}
                    disabled={review.rating === 0 || !review.comment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Student Reviews</h2>
              
              {allReviews?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-6">
                  {allReviews?.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center mb-3">
                        <img 
                          src={rev.user.profilePicture || '/placeholder-avatar.jpg'} 
                          alt={rev.user.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{rev.user.name}</h4>
                          <div className="flex items-center">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </RedirectFromPublic>
     </>
  );
}