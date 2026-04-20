// StudentProfile.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {


    const { student, setStudent } = useStudentStore();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateofBirth: '',
        gender: '',
        currentClass: '',
        interestedCourse: '',
        address: '',
    });

    const getStudentId = () => {
        if (student?._id) return student._id;
        if (student?.user?._id) return student.user._id;
        if (studentData?._id) return studentData._id;

        const storedStudent = localStorage.getItem('student');
        if (storedStudent) {
            try {
                const parsed = JSON.parse(storedStudent);
                return parsed._id || parsed.user?._id;
            } catch (err) {
                console.error("Error parsing localStorage:", err);
            }
        }
        return null;
    };

    const GetStudentData = async () => {
        const studentId = getStudentId();

        if (!studentId) {
            toast.error("Student ID not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(api.student.getStudent, {
                studentId: studentId,
            });

            if (res.data.success && res.data.user) {
                setStudentData(res.data.user);
                setFormData({
                    fullName: res.data.user.fullName || '',
                    email: res.data.user.email || '',
                    phone: res.data.user.phone || '',
                    dateofBirth: res.data.user.dateofBirth ? res.data.user.dateofBirth.split('T')[0] : '',
                    gender: res.data.user.gender || '',
                    currentClass: res.data.user.currentClass || '',
                    interestedCourse: res.data.user.interestedCourse || '',
                    address: res.data.user.address || '',
                });

                // Set enrolled courses directly from user data
                if (res.data.user.enrolledCourses && Array.isArray(res.data.user.enrolledCourses)) {
                    setEnrolledCourses(res.data.user.enrolledCourses);
                }
            } else {
                toast.error(res.data.message || "Failed to fetch student data");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch student data");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            uploadProfile(file);
        }
    };

    const uploadProfile = async (file) => {
        const studentId = getStudentId();

        if (!studentId) {
            toast.error('Student ID not found');
            return;
        }

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("studentId", studentId);

            const response = await axios.post(api.student.editProfile, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setStudentData(prev => ({
                    ...prev,
                    profileImage: response.data.updateduser?.profileImage
                }));
                toast.success('Profile image updated successfully!');
                GetStudentData();
            } else {
                toast.error(response.data.message || 'Failed to upload image');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const editDetails = async (e) => {
        e.preventDefault();
        setSaving(true);

        const studentId = getStudentId();

        if (!studentId) {
            toast.error("Student ID not found. Please log in again.");
            setSaving(false);
            return;
        }

        try {
            const dataToSend = {
                studentId: studentId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone ? Number(formData.phone) : null,
                currentClass: formData.currentClass,
                interestedCourse: formData.interestedCourse,
                address: formData.address,
                dateofBirth: formData.dateofBirth,
                gender: formData.gender,
            };

            const res = await axios.post(api.student.editprofiledetails, dataToSend, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                const updatedStudent = res.data.student || res.data.user;
                setStudentData(prev => ({
                    ...prev,
                    ...updatedStudent
                }));
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                GetStudentData();
            } else {
                toast.error(res.data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };



    useEffect(() => {
        if (student || getStudentId()) {
            GetStudentData();
        } else {
            toast.error("Please log in to view profile");
            setLoading(false);
        }
    }, [student]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center bg-white rounded-lg shadow-md p-8">
                    <p className="text-gray-600 mb-4">No student data found</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }





    const profileImageUrl = studentData.profileImage || studentData.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Roots Classes</h1>
                            <p className="text-gray-500 text-sm">Student Dashboard</p>
                        </div>
                        <button
                            onClick={() => navigate('/course')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                        >
                            Browse Courses
                        </button>
                    </div>
                </div>
            </div>


            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div className="bg-blue-600 h-20"></div>
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-4">
                            <div className="relative group">
                                <img
                                    src={profileImageUrl}
                                    alt={studentData.fullName}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format';
                                    }}
                                />
                                <label
                                    htmlFor="profileImageUpload"
                                    className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer ${uploadingImage ? 'opacity-100' : ''}`}
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
                            <div className="text-center sm:text-left flex-1">
                                <h2 className="text-2xl font-bold text-gray-800">{studentData.fullName}</h2>
                                <p className="text-gray-500 text-sm">ID: {studentData._id?.slice(-8).toUpperCase()}</p>
                                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                        {studentData.currentClass || 'Not Specified'}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                                    {studentData.gender && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {studentData.gender}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-md p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Contact Information
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
                                <span className="text-gray-700">{studentData.phone ? String(studentData.phone) : 'Not provided'}</span>
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
                    <div className="bg-white rounded-lg shadow-md p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Academic Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Current Class</span>
                                <span className="font-semibold text-gray-800">{studentData.currentClass || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                <span className="text-gray-600">Interested Course</span>
                                <span className="font-semibold text-blue-600">{studentData.interestedCourse || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                <span className="text-gray-600">Member Since</span>
                                <span className="text-gray-700">
                                    {studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
                        </div>
                        <form onSubmit={editDetails} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Class</label>
                                <input
                                    type="text"
                                    name="currentClass"
                                    value={formData.currentClass}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interested Course</label>
                                <input
                                    type="text"
                                    name="interestedCourse"
                                    value={formData.interestedCourse}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateofBirth"
                                    value={formData.dateofBirth}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition"
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