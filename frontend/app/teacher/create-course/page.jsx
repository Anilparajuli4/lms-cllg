// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

//  function CreateCourseForm() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     category: "",
//     thumbnail: null,
//     videos: [],
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleThumbnailChange = (e) => {
//     setForm({ ...form, thumbnail: e.target.files[0] });
//   };

//   const handleVideoChange = (e) => {
//     setForm({ ...form, videos: Array.from(e.target.files) });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     data.append("title", form.title);
//     data.append("description", form.description);
//     data.append("category", form.category);
//     data.append("thumbnail", form.thumbnail);
//     form.videos.forEach((video) => data.append("videos", video));

//     try {
//       await axios.post("http://localhost:5000/api/courses/create", data, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       router.push("/teacher/dashboard");
//     } catch {
//       alert("Course creation failed.");
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-4">Create New Course</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium">Title</label>
//           <input
//             name="title"
//             value={form.title}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded"
//             required
//           />
//         </div>
//         <div>
//           <label className="block font-medium">Description</label>
//           <textarea
//             name="description"
//             value={form.description}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded"
//             required
//           />
//         </div>
//         <div>
//           <label className="block font-medium">Category</label>
//           <input
//             name="category"
//             value={form.category}
//             onChange={handleChange}
//             className="w-full border px-3 py-2 rounded"
//             required
//           />
//         </div>
//         <div>
//           <label className="block font-medium">Thumbnail</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleThumbnailChange}
//             className="w-full"
//             required
//           />
//         </div>
//         <div>
//           <label className="block font-medium">Videos (Minimum 3)</label>
//           <input
//             type="file"
//             accept="video/*"
//             multiple
//             onChange={handleVideoChange}
//             className="w-full"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Create Course
//         </button>
//       </form>
//     </div>
//   );
// }

// export default CreateCourseForm



"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "@/app/context/protectedRoute";

function CreateCourseForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: null,
    videos: [],
  });
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const thumbnailRef = useRef(null);
  const videosRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 3) {
      setError("Please upload at least 3 videos");
      return;
    }
    setError("");
    setForm({ ...form, videos: files });
    
    const previews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push({
          id: index,
          name: file.name,
          url: URL.createObjectURL(file),
          size: (file.size / (1024 * 1024)).toFixed(2) + "MB",
          duration: "0:00" // Placeholder, actual duration would require more complex processing
        });
        if (previews.length === files.length) {
          setVideoPreviews(previews);
          setActiveVideoIndex(0); // Set first video as active
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const removeVideo = (index) => {
    const newVideos = [...form.videos];
    newVideos.splice(index, 1);
    setForm({ ...form, videos: newVideos });
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(videoPreviews[index].url);
    
    const newPreviews = [...videoPreviews];
    newPreviews.splice(index, 1);
    setVideoPreviews(newPreviews);
    
    if (newPreviews.length > 0) {
      setActiveVideoIndex(Math.min(index, newPreviews.length - 1));
    } else {
      setActiveVideoIndex(0);
      if (videosRef.current) {
        videosRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.videos.length < 3) {
      setError("Please upload at least 3 videos");
      return;
    }

    setIsLoading(true);
    setError("");

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("category", form.category);
    data.append("price", form.price);
    data.append("thumbnail", form.thumbnail);
    form.videos.forEach((video) => data.append("videos", video));

    try {
      await axios.post("http://localhost:5000/api/courses/create", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Clean up object URLs
      videoPreviews.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
      
      router.push("/teacher ");
    } catch (err) {
      setError(err.response?.data?.message || "Course creation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <ProtectedRoute allowedRoles={["TEACHER"]}>
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Course</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Course title"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Price (Rs)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">Rs</span>
              </div>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed course description"
            required
          />
        </div>

        {/* Thumbnail */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              ref={thumbnailRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
          </div>
          
          {thumbnailPreview && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Thumbnail Preview</h3>
              <div className="w-64 h-36 border border-gray-200 rounded-md overflow-hidden">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setThumbnailPreview("");
                  setForm({ ...form, thumbnail: null });
                  if (thumbnailRef.current) thumbnailRef.current.value = "";
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove thumbnail
              </button>
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Videos (Minimum 3)
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoChange}
              ref={videosRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          
          {videoPreviews.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Video List */}
                <div className="bg-gray-50 p-4 border-r border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Videos ({videoPreviews.length})</h3>
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {videoPreviews.map((video, index) => (
                      <li 
                        key={video.id}
                        className={`p-2 rounded cursor-pointer ${activeVideoIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                        onClick={() => setActiveVideoIndex(index)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 bg-gray-200 rounded p-1">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{video.name}</p>
                            <p className="text-xs text-gray-500">{video.size} • {video.duration}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVideo(index);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Video Player */}
                <div className="lg:col-span-2 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Preview: {videoPreviews[activeVideoIndex]?.name}
                  </h3>
                  <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                    <video 
                      key={videoPreviews[activeVideoIndex]?.id}
                      controls
                      className="w-full h-full"
                      src={videoPreviews[activeVideoIndex]?.url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Video {activeVideoIndex + 1} of {videoPreviews.length}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        disabled={activeVideoIndex === 0}
                        onClick={() => setActiveVideoIndex(prev => Math.max(0, prev - 1))}
                        className={`px-3 py-1 text-sm rounded ${activeVideoIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={activeVideoIndex === videoPreviews.length - 1}
                        onClick={() => setActiveVideoIndex(prev => Math.min(videoPreviews.length - 1, prev + 1))}
                        className={`px-3 py-1 text-sm rounded ${activeVideoIndex === videoPreviews.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Course"
            )}
          </button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}

export default CreateCourseForm;



