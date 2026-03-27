// StudentProfile.jsx
import React, { useState } from 'react';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Student Data - Only important details
  const [profileData, setProfileData] = useState({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@rootclasses.com',
    studentId: 'RC2025001',
    phone: '+91 98765 43210',
    grade: 'Class 12',
    stream: 'PCM (Physics, Chemistry, Mathematics)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format'
  });

  // Course Progress - Quick overview
  const enrolledCourses = [
    { id: 1, name: 'JEE Mathematics', progress: 75, nextClass: 'Tomorrow, 4:00 PM' },
    { id: 2, name: 'Physics for JEE', progress: 45, nextClass: 'Today, 6:30 PM' },
    { id: 3, name: 'Organic Chemistry', progress: 30, nextClass: 'Wednesday, 5:00 PM' }
  ];

  // Quick Stats
  const stats = [
    { label: 'Total Hours', value: '127', icon: '⏱️' },
    { label: 'Courses', value: '3', icon: '📚' },
    { label: 'Attendance', value: '94%', icon: '✅' }
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold">Root Classes</h1>
          <p className="text-indigo-100 text-sm">Empowering Minds, Building Futures</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-4">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                <p className="text-gray-500">Student ID: {profileData.studentId}</p>
                <div className="flex flex-wrap gap-2 mt-1 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">{profileData.grade}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="sm:ml-auto px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📞 Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-700">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-gray-700">{profileData.stream}</span>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📖 My Courses
            </h3>
            <div className="space-y-4">
              {enrolledCourses.map(course => (
                <div key={course.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{course.name}</span>
                    <span className="text-indigo-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500">📅 {course.nextClass}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">📅 Upcoming Classes</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {enrolledCourses.map(course => (
              <div key={course.id} className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">{course.name}</h4>
                  <p className="text-sm text-gray-500">{course.nextClass}</p>
                </div>
                <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

   
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-5 border-b">
              <h3 className="text-xl font-bold">Edit Profile</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;