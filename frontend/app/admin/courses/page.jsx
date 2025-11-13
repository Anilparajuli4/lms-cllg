// pages/admin/courses.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/app/context/protectedRoute';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/courses')
      .then(res => res.json())
      .then(setCourses);
  }, []);

  return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin: Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-4 shadow rounded border">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
            <p className="text-sm mt-2">
              Teacher: <strong>{course.teacher?.name}</strong>
            </p>
            <Link
              href={`/admin/course/${course.id}`}
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Review Course
            </Link>
          </div>
        ))}
      </div>
    </div>
    </ProtectedRoute>
  );
}
