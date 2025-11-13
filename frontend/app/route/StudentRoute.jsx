"use client";

import { ProtectedRoute } from "../context/protectedRoute";


export const StudentRoute = ({ children }) => {
  return <ProtectedRoute roles={["student"]}>{children}</ProtectedRoute>;
};