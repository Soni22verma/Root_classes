// StudentProfile.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';

const StudentProfile = () => {
    const { student } = useStudentStore();
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    
    // Form data for editing
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        currentClass: '',
        interestedCourse: '',
        address: '',
        dateofBirth: '',
        gender: ''
    });

    // Course Progress - You can fetch this from another API or keep as static for now
    const enrolledCourses = [
        { id: 1, name: 'JEE Mathematics', progress: 75, nextClass: 'Tomorrow, 4:00 PM' },
        { id: 2, name: 'Physics for JEE', progress: 45, nextClass: 'Today, 6:30 PM' },
        { id: 3, name: 'Organic Chemistry', progress: 30, nextClass: 'Wednesday, 5:00 PM' }
    ];

    // Quick Stats - Calculate from real data
    const getStats = () => {
        if (!studentData) return [];
        return [
            { label: 'Total Hours', value: '127', icon: '⏱️' },
            { label: 'Courses', value: enrolledCourses.length.toString(), icon: '📚' },
            { label: 'Attendance', value: '94%', icon: '✅' }
        ];
    };

    const GetStudent = async () => {
        try {
            setLoading(true);
            const res = await axios.post(api.student.getStudent, {
                studentId: student?._id,
            });
            
            if (res.data.success && res.data.student) {
                const studentInfo = res.data.student;
                setStudentData(studentInfo);
                
                // Set form data for editing
                setFormData({
                    fullName: studentInfo.fullName || '',
                    email: studentInfo.email || '',
                    phone: studentInfo.phone || '',
                    currentClass: studentInfo.currentClass || '',
                    interestedCourse: studentInfo.interestedCourse || '',
                    address: studentInfo.address || '',
                    dateofBirth: studentInfo.dateofBirth ? new Date(studentInfo.dateofBirth).toISOString().split('T')[0] : '',
                    gender: studentInfo.gender || ''
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            uploadProfile(file);
        }
    };

    const uploadProfile = async (file) => {
        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append("image", file);
            formData.append("studentId", student?._id);

            const res = await axios.post(api.student.editProfile, // Make sure this endpoint exists
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data.success) {
                // Update the student data with the new profile image URL
                setStudentData(prev => ({
                    ...prev,
                    profileImage: res.data.profileImageUrl || res.data.imageUrl
                }));
                alert('Profile image updated successfully!');
            } else {
                alert('Failed to upload image. Please try again.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        } finally {
            setUploadingImage(false);
            setImage(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(api.student.updateStudent, {
                studentId: student?._id,
                ...formData
            });

            if (res.data.success) {
                // Update local state with new data
                setStudentData(prev => ({
                    ...prev,
                    ...formData
                }));
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    useEffect(() => {
        if (student?._id) {
            GetStudent();
        }
    }, [student]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <p className="text-gray-600">No student data found</p>
                </div>
            </div>
        );
    }

    const stats = getStats();

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
                            <div className="relative group">
                                <img
                                    src={studentData.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format'}
                                    alt={studentData.fullName}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                <label 
                                    htmlFor="profileImageUpload" 
                                    className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${uploadingImage ? 'opacity-100' : ''}`}
                                >
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </label>
                                <input
                                    type="file"
                                    id="profileImageUpload"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={uploadingImage}
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-bold text-gray-800">{studentData.fullName}</h2>
                                <p className="text-gray-500">Student ID: {studentData._id?.slice(-8).toUpperCase()}</p>
                                <div className="flex flex-wrap gap-2 mt-1 justify-center sm:justify-start">
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                        {studentData.currentClass || 'Not Specified'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                                    {studentData.gender && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                            {studentData.gender}
                                        </span>
                                    )}
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                <span className="text-gray-700">{studentData.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-700">{studentData.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 0111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700">{studentData.address || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">
                                    {studentData.dateofBirth ? new Date(studentData.dateofBirth).toLocaleDateString() : 'Not provided'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white rounded-xl shadow-md p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            🎓 Academic Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Current Class:</span>
                                <span className="font-semibold text-gray-800">{studentData.currentClass || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Interested Course:</span>
                                <span className="font-semibold text-indigo-600">{studentData.interestedCourse || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Member Since:</span>
                                <span className="text-gray-700">
                                    {studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Progress Section */}
                <div className="mt-6 bg-white rounded-xl shadow-md p-5">
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

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b sticky top-0 bg-white">
                            <h3 className="text-xl font-bold">Edit Profile</h3>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Class</label>
                                <input
                                    type="text"
                                    name="currentClass"
                                    value={formData.currentClass}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interested Course</label>
                                <input
                                    type="text"
                                    name="interestedCourse"
                                    value={formData.interestedCourse}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateofBirth"
                                    value={formData.dateofBirth}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)} 
                                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
                                >
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