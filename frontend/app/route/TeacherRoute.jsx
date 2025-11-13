// TeacherRoute.jsx
"use client";

import { ProtectedRoute } from "../context/protectedRoute";



export const TeacherRoute = ({ children }) => {
  return <ProtectedRoute roles={["teacher"]}>{children}</ProtectedRoute>;
};