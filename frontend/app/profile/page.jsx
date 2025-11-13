'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import ProfileDropdown from '../component/ProfileDropDown';
import Link from 'next/link';
import { useAuth } from '../context/authContext';

export default function Profile() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasExistingProfilePicture, setHasExistingProfilePicture] = useState(false);
    const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile', {
          credentials: 'include'
        });
        if (!res.ok) return router.push('/login');

        const data = await res.json();
        setCurrentUser(data.user);
        setFormData({ name: data.user.name || '', email: data.user.email || '', password: '' });

        if (data.user.profilePicture) {
          const cloudinaryUrl = data.user.profilePicture.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/');
          setPreview(cloudinaryUrl);
          setHasExistingProfilePicture(true);
        }
      } catch (err) {
        setMessage({ text: 'Failed to fetch user data', type: 'error' });
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      return setMessage({ text: 'Please select an image (JPG, PNG)', type: 'error' });
    }
    if (file.size > 2 * 1024 * 1024) {
      return setMessage({ text: 'Image size should be < 2MB', type: 'error' });
    }

    setProfilePicture(file);
    setPreview(URL.createObjectURL(file));
    setHasExistingProfilePicture(false);
    setMessage({ text: '', type: '' });
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    setPreview(null);
    setHasExistingProfilePicture(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    if (!formData.name.trim()) {
      setMessage({ text: 'Name is required', type: 'error' });
      setIsLoading(false);
      return;
    }

    const form = new FormData();
    form.append('name', formData.name.trim());

    if (formData.email !== currentUser?.email) form.append('email', formData.email);
    if (formData.password) {
      if (formData.password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
        setIsLoading(false);
        return;
      }
      form.append('password', formData.password);
    }
    if (profilePicture) {
      form.append('profilePicture', profilePicture);
    } else if (!hasExistingProfilePicture && currentUser?.profilePicture) {
      form.append('removeProfilePicture', 'true');
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/updateProfile', {
        method: 'PATCH',
        body: form,
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Update failed', type: 'error' });
      } else {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setCurrentUser(prev => ({
          ...prev,
          name: formData.name,
          email: formData.email,
          profilePicture: data.profilePicture || null
        }));
        setFormData(prev => ({ ...prev, password: '' }));

        if (data.profilePicture) {
          const optimizedUrl = data.profilePicture.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/');
          setPreview(optimizedUrl);
          setHasExistingProfilePicture(true);
        } else {
          setPreview(null);
          setHasExistingProfilePicture(false);
        }

        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setMessage({ text: 'Server error. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    
     <header className="sticky top-0 z-50 bg-white shadow-sm">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
     
        <Link href="/" className="text-2xl font-bold text-[#8DBCC7]">
        LMS
      </Link>
     
      
      <div className="flex space-x-4">
    {user ?
    <ProfileDropdown/> :  <><Link href="/login" className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition">
          Login
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-[#648DB3] text-white rounded-lg hover:bg-indigo-700 transition">
          Sign Up
        </Link> </> }
   
  </div>
    </div>
  </header>

    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Update Your Profile</h1>
          <p className="text-gray-600">Keep your information up to date</p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <div className="rounded-full overflow-hidden border border-gray-200">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              {preview && (
                <button type="button" onClick={handleRemovePicture} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-500 mt-2" />
          <p className="text-xs text-gray-500">JPG, PNG up to 2MB</p>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-md"
            />
            {formData.password && <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 ${isLoading && 'opacity-70 cursor-not-allowed'}`}
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
