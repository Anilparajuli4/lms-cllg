"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";


const RedirectFromPublic = ({ children }) => {
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && user) {
      if (user.role === "TEACHER") {
        router.push("/teacher");
      } else if (user.role === "ADMIN") {
        router.push("/admin");
      }
    }
  }, [user, loadingUser, router]);

  if (loadingUser) return <div>Loading...</div>;

  return children;
};

export default RedirectFromPublic;
