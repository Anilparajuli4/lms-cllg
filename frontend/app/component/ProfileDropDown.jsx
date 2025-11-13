"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, BookOpen, GraduationCap } from "lucide-react";
import Image from "next/image";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
  <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 focus:outline-none transition-all duration-200 hover:opacity-80"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <Image
          src={user?.profilePicture || "/avatar.png"}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full object-cover border-2 border-white shadow-sm"
        />
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => handleNavigation("/profile")}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <User className="w-4 h-4 mr-3 text-gray-400" />
              <span>View Profile</span>
            </button>
      {user.role === 'STUDENT' &&  <button
              onClick={() => handleNavigation("/enrolled")}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
              <span>Enrolled Courses</span>
            </button>}

             {user.role === 'STUDENT' &&  <button
              onClick={() => handleNavigation("/teacher-request")}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <GraduationCap className="w-4 h-4 mr-3 text-gray-400" />
              <span>Join As Teacher</span>
            </button>}
           
          </div>

          


          
          <div className="py-1 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfileDropdown;