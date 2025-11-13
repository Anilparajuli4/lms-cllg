"use client";

import { ProtectedRoute } from "../context/protectedRoute";



export const TeacherAdminRoute = ({ children }) => {
  return <ProtectedRoute roles={["teacher", "admin"]}>{children}</ProtectedRoute>;
};