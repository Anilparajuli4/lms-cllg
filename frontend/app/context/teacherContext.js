'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const TeacherContext = createContext();

export const TeacherProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teacher/courses', {
        withCredentials: true,
      });
      setCourses(res.data);
    } catch (err) {
      alert('Failed to fetch courses.');
    }
    setLoading(false);
  };

  const deleteCourse = async (courseId) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
        withCredentials: true,
      });
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (err) {
      alert('Failed to delete course.');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <TeacherContext.Provider value={{ courses, loading, fetchCourses, deleteCourse }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => useContext(TeacherContext);
