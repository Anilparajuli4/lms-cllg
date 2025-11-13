// 'use client'
// import { useEffect, useState } from 'react';
// import { CheckCircle, XCircle, Eye, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
// import ProtectedRoute from '../context/protectedRoute';
// import ProfileDropdown from '../component/ProfileDropDown';

// export default function AdminDashboard() {
//   const [courses, setCourses] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [feedback, setFeedback] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('courses');
//   const [expandedUsers, setExpandedUsers] = useState([]);
//   const [selectedVideo, setSelectedVideo] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const [coursesRes, usersRes] = await Promise.all([
//           fetch('http://localhost:5000/api/admin/allCourses'),
//           fetch('http://localhost:5000/api/admin/allUsers')
//         ]);
        
//         const coursesData = await coursesRes.json();
//         const usersData = await usersRes.json();
        
//         setCourses(coursesData);
//         setUsers(usersData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const updateCourseStatus = async (id, status) => {
//     setIsLoading(true);
//     try {
//       await fetch(`http://localhost:5000/api/admin/courses/${id}/status`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status, adminMessage: feedback }),
//       });

//       // Update local state instead of refetching
//       setCourses(courses.map(course => 
//         course.id === id ? { ...course, status, adminReview: { status, message: feedback } } : course
//       ));
//       setSelectedCourse(null);
//       setFeedback('');
//       setSelectedVideo(null);
//     } catch (error) {
//       console.error('Error updating course status:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchSingleCourse = async (id) => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`http://localhost:5000/api/admin/courses/${id}`);
//       const data = await res.json();
//       setSelectedCourse(data);
//       // Set the first video as selected by default
//       if (data.videos && data.videos.length > 0) {
//         setSelectedVideo(data.videos[0]);
//       }
//     } catch (error) {
//       console.error('Error fetching course:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const toggleUserExpand = (userId) => {
//     setExpandedUsers(prev => 
//       prev.includes(userId) 
//         ? prev.filter(id => id !== userId) 
//         : [...prev, userId]
//     );
//   };

//   if (isLoading && courses.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
//       </div>
//     );
//   }

//   return (
//       <ProtectedRoute allowedRoles={["ADMIN"]}>
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className='flex justify-between items-center'>
//     <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//           <ProfileDropdown/>
//           </div>
      
//           <div className="mt-4 flex space-x-4 border-b border-gray-200">
//             <button
//               onClick={() => setActiveTab('courses')}
//               className={`pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
//             >
//               Courses
//             </button>
//             <button
//               onClick={() => setActiveTab('users')}
//               className={`pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
//             >
//               Users
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {activeTab === 'users' && (
//           <div className="bg-white shadow rounded-lg overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h2 className="text-lg font-medium text-gray-900">All Users ({users.length})</h2>
//             </div>
//             <ul className="divide-y divide-gray-200">
//               {users.map((user) => (
//                 <li key={user.id}>
//                   <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
//                     <div className="flex items-center space-x-4">
//                       <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
//                         <span className="text-gray-600 font-medium">
//                           {user.name.charAt(0).toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">{user.name}</p>
//                         <p className="text-sm text-gray-500">{user.email}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                       <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         user.role === 'ADMIN' 
//                           ? 'bg-purple-100 text-purple-800' 
//                           : user.role === 'TEACHER' 
//                             ? 'bg-blue-100 text-blue-800' 
//                             : 'bg-green-100 text-green-800'
//                       }`}>
//                         {user.role}
//                       </span>
//                       <button 
//                         onClick={() => toggleUserExpand(user.id)}
//                         className="text-gray-400 hover:text-gray-500"
//                       >
//                         {expandedUsers.includes(user.id) ? (
//                           <ChevronUp className="h-5 w-5" />
//                         ) : (
//                           <ChevronDown className="h-5 w-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                   {expandedUsers.includes(user.id) && (
//                     <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-500">Account Created</h4>
//                           <p className="mt-1 text-sm text-gray-900">
//                             {new Date(user.createdAt).toLocaleDateString()}
//                           </p>
//                         </div>
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-500">Last Active</h4>
//                           <p className="mt-1 text-sm text-gray-900">
//                             {new Date(user.lastLogin).toLocaleString()}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {activeTab === 'courses' && (
//           <div className="space-y-6">
//             <div className="bg-white shadow rounded-lg overflow-hidden">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Course Approvals</h2>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Review and approve or reject submitted courses
//                 </p>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Course
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Teacher
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {courses.map((course) => (
//                       <tr key={course.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-200">
//                               {course.thumbnailUrl && (
//                                 <img className="h-full w-full object-cover" src={course.thumbnailUrl} alt={course.title} />
//                               )}
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium text-gray-900">{course.title}</div>
//                               <div className="text-sm text-gray-500">{course.category}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{course.teacher.name}</div>
//                           <div className="text-sm text-gray-500">{course.teacher.email}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             course.status === 'APPROVED'
//                               ? 'bg-green-100 text-green-800'
//                               : course.status === 'REJECTED'
//                               ? 'bg-red-100 text-red-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {course.status}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                           <div className="flex space-x-2">
//                             <button
//                               onClick={() => fetchSingleCourse(course.id)}
//                               className="text-blue-600 hover:text-blue-900 flex items-center"
//                             >
//                               <Eye className="h-4 w-4 mr-1" /> View
//                             </button>
//                             {course.status !== 'APPROVED' && (
//                               <button
//                                 onClick={() => updateCourseStatus(course.id, 'APPROVED')}
//                                 className="text-green-600 hover:text-green-900 flex items-center"
//                               >
//                                 <CheckCircle className="h-4 w-4 mr-1" /> Approve
//                               </button>
//                             )}
//                             {course.status !== 'REJECTED' && (
//                               <button
//                                 onClick={() => updateCourseStatus(course.id, 'REJECTED')}
//                                 className="text-red-600 hover:text-red-900 flex items-center"
//                               >
//                                 <XCircle className="h-4 w-4 mr-1" /> Reject
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Course Detail Modal */}
//       {selectedCourse && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">Course Review</h3>
//             </div>
//             <div className="px-6 py-4">
//               <div className="flex flex-col md:flex-row gap-6">
//                 <div className="flex-shrink-0">
//                   <img 
//                     src={selectedCourse.thumbnailUrl || '/placeholder-course.jpg'} 
//                     alt={selectedCourse.title}
//                     className="h-40 w-full md:w-64 rounded-md object-cover"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h4>
//                   <p className="text-sm text-gray-500 mt-1">by {selectedCourse.teacher.name}</p>
//                   <p className="mt-2 text-gray-700">{selectedCourse.description}</p>
                  
//                   <div className="mt-4">
//                     <h5 className="text-sm font-medium text-gray-900">Course Content</h5>
//                     <ul className="mt-2 space-y-2">
//                       {selectedCourse.videos.map((video) => (
//                         <li 
//                           key={video.id} 
//                           className={`flex items-center p-2 rounded cursor-pointer ${selectedVideo?.id === video.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
//                           onClick={() => setSelectedVideo(video)}
//                         >
//                           <span className="text-sm text-gray-700">{video.title}</span>
//                           {video.isIntro && (
//                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
//                               Preview
//                             </span>
//                           )}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               </div>

//               {/* Video Preview Section */}
//               {selectedVideo && (
//                 <div className="mt-6">
//                   <h5 className="text-sm font-medium text-gray-900 mb-2">Video Preview: {selectedVideo.title}</h5>
//                   <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
//                     <video 
//                       controls 
//                       className="w-full h-full"
//                       src={selectedVideo.url}
//                       poster={selectedVideo.thumbnailUrl}
//                     >
//                       Your browser does not support the video tag.
//                     </video>
//                   </div>
//                 </div>
//               )}

//               {selectedCourse.adminReview && (
//                 <div className={`mt-6 p-4 rounded-md ${
//                   selectedCourse.adminReview.status === 'APPROVED' 
//                     ? 'bg-green-50 border border-green-200' 
//                     : 'bg-red-50 border border-red-200'
//                 }`}>
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       {selectedCourse.adminReview.status === 'APPROVED' ? (
//                         <CheckCircle className="h-5 w-5 text-green-400" />
//                       ) : (
//                         <XCircle className="h-5 w-5 text-red-400" />
//                       )}
//                     </div>
//                     <div className="ml-3">
//                       <h3 className={`text-sm font-medium ${
//                         selectedCourse.adminReview.status === 'APPROVED' 
//                           ? 'text-green-800' 
//                           : 'text-red-800'
//                       }`}>
//                         {selectedCourse.adminReview.status} - Previous Feedback
//                       </h3>
//                       <div className={`mt-2 text-sm ${
//                         selectedCourse.adminReview.status === 'APPROVED' 
//                           ? 'text-green-700' 
//                           : 'text-red-700'
//                       }`}>
//                         <p>{selectedCourse.adminReview.message || 'No feedback provided'}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="mt-6">
//                 <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
//                   Feedback Message (Optional)
//                 </label>
//                 <textarea
//                   id="feedback"
//                   rows={4}
//                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                   placeholder="Provide feedback for the teacher..."
//                   value={feedback}
//                   onChange={(e) => setFeedback(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSelectedCourse(null);
//                   setSelectedVideo(null);
//                 }}
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Cancel
//               </button>
//               {selectedCourse.status !== 'APPROVED' && (
//                 <button
//                   type="button"
//                   onClick={() => updateCourseStatus(selectedCourse.id, 'APPROVED')}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
//                 >
//                   Approve Course
//                 </button>
//               )}
//               {selectedCourse.status !== 'REJECTED' && (
//                 <button
//                   type="button"
//                   onClick={() => updateCourseStatus(selectedCourse.id, 'REJECTED')}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//                 >
//                   Reject Course
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//     </ProtectedRoute>
//   );
// }


'use client'
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Loader2, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import ProtectedRoute from '../context/protectedRoute';
import ProfileDropdown from '../component/ProfileDropDown';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [expandedUsers, setExpandedUsers] = useState([]);
  const [expandedRequests, setExpandedRequests] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesRes, usersRes, requestsRes] = await Promise.all([
          fetch('http://localhost:5000/api/admin/allCourses'),
          fetch('http://localhost:5000/api/admin/allUsers'),
          fetch('http://localhost:5000/api/get-teacher-request')
        ]);
        
        const coursesData = await coursesRes.json();
        const usersData = await usersRes.json();
        const requestsData = await requestsRes.json();
        
        setCourses(coursesData);
        setUsers(usersData);
        setTeacherRequests(requestsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateCourseStatus = async (id, status) => {
    setIsLoading(true);
    try {
      await fetch(`http://localhost:5000/api/admin/courses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminMessage: feedback }),
      });

      setCourses(courses.map(course => 
        course.id === id ? { ...course, status, adminReview: { status, message: feedback } } : course
      ));
      setSelectedCourse(null);
      setFeedback('');
      setSelectedVideo(null);
    } catch (error) {
      console.error('Error updating course status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSingleCourse = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/courses/${id}`);
      const data = await res.json();
      setSelectedCourse(data);
      if (data.videos && data.videos.length > 0) {
        setSelectedVideo(data.videos[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleTeacherRequest = async (id, status) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/teacher-request/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setTeacherRequests(teacherRequests.map(request => 
          request.id === id ? { ...request, status, reviewedAt: new Date() } : request
        ));
        
        if (status === 'APPROVED') {
          const updatedRequest = teacherRequests.find(r => r.id === id);
          if (updatedRequest) {
            setUsers(users.map(user => 
              user.id === updatedRequest.user.id ? { ...user, role: 'TEACHER' } : user
            ));
          }
        }
      }
    } catch (error) {
      console.error('Error updating teacher request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRequestExpand = (requestId) => {
    setExpandedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId) 
        : [...prev, requestId]
    );
  };

  if (isLoading && courses.length === 0 && teacherRequests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className='flex justify-between items-center'>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <ProfileDropdown/>
            </div>
      
            <div className="mt-4 flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('courses')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Teacher Requests ({teacherRequests.filter(r => !r.status || r.status === 'PENDING').length})
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">All Users ({users.length})</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'TEACHER' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                        <button 
                          onClick={() => toggleUserExpand(user.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {expandedUsers.includes(user.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedUsers.includes(user.id) && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Account Created</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Last Active</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(user.lastLogin).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Course Approvals</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and approve or reject submitted courses
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teacher
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-200">
                                {course.thumbnailUrl && (
                                  <img className="h-full w-full object-cover" src={course.thumbnailUrl} alt={course.title} />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                <div className="text-sm text-gray-500">{course.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.teacher.name}</div>
                            <div className="text-sm text-gray-500">{course.teacher.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              course.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : course.status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {course.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => fetchSingleCourse(course.id)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </button>
                              {course.status !== 'APPROVED' && (
                                <button
                                  onClick={() => updateCourseStatus(course.id, 'APPROVED')}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </button>
                              )}
                              {course.status !== 'REJECTED' && (
                                <button
                                  onClick={() => updateCourseStatus(course.id, 'REJECTED')}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Teacher Requests ({teacherRequests.length})</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review and approve or reject teacher role requests
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {teacherRequests.map((request) => (
                  <li key={request.id}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {request.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.user.name}</p>
                          <p className="text-sm text-gray-500">{request.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'DECLINED' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status || 'PENDING'}
                        </span>
                        <button 
                          onClick={() => toggleRequestExpand(request.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          {expandedRequests.includes(request.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedRequests.includes(request.id) && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Request Date</h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {request.reviewedAt && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Reviewed At</h4>
                              <p className="mt-1 text-sm text-gray-900">
                                {new Date(request.reviewedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          {request.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleTeacherRequest(request.id, 'APPROVED')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <UserPlus className="h-3 w-3 mr-1" /> Approve
                            </button>
                          )}
                          {request.status !== 'DECLINED' && (
                            <button
                              onClick={() => handleTeacherRequest(request.id, 'DECLINED')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Decline
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Course Review</h3>
              </div>
              <div className="px-6 py-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={selectedCourse.thumbnailUrl || '/placeholder-course.jpg'} 
                      alt={selectedCourse.title}
                      className="h-40 w-full md:w-64 rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">by {selectedCourse.teacher.name}</p>
                    <p className="mt-2 text-gray-700">{selectedCourse.description}</p>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900">Course Content</h5>
                      <ul className="mt-2 space-y-2">
                        {selectedCourse.videos.map((video) => (
                          <li 
                            key={video.id} 
                            className={`flex items-center p-2 rounded cursor-pointer ${selectedVideo?.id === video.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedVideo(video)}
                          >
                            <span className="text-sm text-gray-700">{video.title}</span>
                            {video.isIntro && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Preview
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {selectedVideo && (
                  <div className="mt-6">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Video Preview: {selectedVideo.title}</h5>
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
                      <video 
                        controls 
                        className="w-full h-full"
                        src={selectedVideo.url}
                        poster={selectedVideo.thumbnailUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}

                {selectedCourse.adminReview && (
                  <div className={`mt-6 p-4 rounded-md ${
                    selectedCourse.adminReview.status === 'APPROVED' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {selectedCourse.adminReview.status === 'APPROVED' ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          selectedCourse.adminReview.status === 'APPROVED' 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {selectedCourse.adminReview.status} - Previous Feedback
                        </h3>
                        <div className={`mt-2 text-sm ${
                          selectedCourse.adminReview.status === 'APPROVED' 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          <p>{selectedCourse.adminReview.message || 'No feedback provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                    Feedback Message (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Provide feedback for the teacher..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    setSelectedVideo(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                {selectedCourse.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => updateCourseStatus(selectedCourse.id, 'APPROVED')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve Course
                  </button>
                )}
                {selectedCourse.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => updateCourseStatus(selectedCourse.id, 'REJECTED')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject Course
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}