"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push("/login");
      } else if (!allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
      }
    }
  }, [user, allowedRoles, router, loadingUser]);

  if (loadingUser) return <div>Loading...</div>;

  if (!user || !allowedRoles.includes(user.role)) return null;

  return children;
};

export default ProtectedRoute;
