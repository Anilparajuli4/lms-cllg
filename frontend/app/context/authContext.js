"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
   const [loadingUser, setLoadingUser] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [averageRating, setAvgRating] = useState(0)

  const fetchProfile = async () => {
    try {
      
      const res = await api.get("/profile");
      setUser(res.data.user);
      if(res.data){
            setLoadingUser(false)
      }
     
    } catch {
      setLoadingUser(false)
      setUser(null);
    }
  };




  useEffect(() => {
    fetchProfile();
   
        
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    await fetchProfile();
    return res;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    return res;
  };

  const logout = async () => {
    await api.get("/auth/logout");
    setUser(null);
    // setCourses([]); // clear courses on logout
  };

  // 🧑‍🏫 Teacher-specific logic
  const fetchTeacherCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get("/courses/getTeacherCourse");
      setCourses(res.data);
    } catch (error) {
      alert("Failed to fetch courses.");
    }
    setLoadingCourses(false);
  };

  const deleteCourse = async (courseId) => {
    try {
      await api.delete(`/courses/delete/${courseId}`);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      alert('course deleted')
    } catch (error) {
      alert("Failed to delete course.");
    }
  };


  const editCourse = async (courseId, updatedData, thumbnailFile, videoFiles) => {
  try {
    const formData = new FormData();
    
    // Append text fields
    if (updatedData.title) formData.append('title', updatedData.title);
    if (updatedData.description) formData.append('description', updatedData.description);
    if (updatedData.category) formData.append('category', updatedData.category);
    
    // Append files if they exist
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
    if (videoFiles) {
      Array.from(videoFiles).forEach((file, index) => {
        formData.append(`videos`, file);
      });
    }

    const response = await fetch(`http://localhost:5000/api/courses/edit/${courseId}`, {
      method: 'PUT',
      body: formData,
      credentials: "include",
      // headers will be set automatically for FormData
    });

    if (!response.ok) {
      throw new Error('Failed to update course');
    }

    const data = await response.json();
    fetchTeacherCourses(); // Refresh the course list
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

  // const fetchAllTeachers = async () => {
  //   try {
  //     const res = await api.get("/admin/teachers");
  //     setTeachers(res.data);
  //   } catch (error) {
  //     alert("Failed to fetch teachers.");
  //   }
  // };

  // const fetchAllStudents = async () => {
  //   try {
  //     const res = await api.get("/admin/students");
  //     setStudents(res.data);
  //   } catch (error) {
  //     alert("Failed to fetch students.");
  //   }
  // };

  const updateCourseStatus = async (courseId, status, adminMessage) => {
    try {
      const res = await api.patch(`/admin/courses/${courseId}/status`, {
        status,
        adminMessage,
      });
      return res.data;
    } catch (error) {
      alert("Failed to update course status.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        courses,
        loadingCourses,
        fetchTeacherCourses,
        deleteCourse,
        loadingUser,
        updateCourseStatus,
        editCourse
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
