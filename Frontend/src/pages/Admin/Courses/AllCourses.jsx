import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCourseStore } from '../../../Store/courseStore';
import api from '../../../services/adminendpoint';

const CourseList = () => {
    const { setCourseId, courseId } = useCourseStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [editingCourse, setEditingCourse] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // New state for create modal
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [formData, setFormData] = useState({
        title: '',
        discreption: '',
        instructor: '',
        duration: '',
        level: 'Beginner',
        price: '',
        tags: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const GetCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.post(api.course.getcourses);
            console.log(res, "this is All courses");

            // Check if the response has the data structure you showed
            if (res.data && res.data.success && res.data.course) {
                setCourses(res.data.course); // Store the courses array in state
                setError(null);
            } else if (res.data && Array.isArray(res.data)) {
                // Alternative if the response is directly an array
                setCourses(res.data);
                setError(null);
            } else {
                setError('Invalid data format received from server');
                setCourses([]);
            }
        } catch (error) {
            console.log(error);
            setError('Failed to fetch courses. Please try again.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        GetCourses();
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size should be less than 10MB', 'error');
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                showToast('Only JPEG, JPG, PNG, and GIF files are allowed', 'error');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form for create course
    const resetForm = () => {
        setFormData({
            title: '',
            discreption: '',
            instructor: '',
            duration: '',
            level: 'Beginner',
            price: '',
            tags: '',
        });
        setImagePreview('');
        setImageFile(null);
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        
        // Prepare the data to send
        const courseData = new FormData();
        courseData.append('title', formData.title);
        courseData.append('discreption', formData.discreption);
        courseData.append('instructor', formData.instructor);
        courseData.append('duration', formData.duration);
        courseData.append('level', formData.level);
        courseData.append('price', formData.price);
        courseData.append('tags', formData.tags);
        
        // If there's an image file, append it
        if (imageFile) {
            courseData.append('image', imageFile);
        }
        
        try {
            const res = await axios.post(api.course.createcourse, courseData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log(res.data);
            
            if (res.data.success) {
                showToast('Course created successfully!', 'success');
                setIsCreateModalOpen(false);
                resetForm();
                GetCourses(); // Refresh the course list
            } else {
                showToast(res.data.message || 'Failed to create course', 'error');
            }
            
        } catch (error) {
            console.log(error);
            showToast(error.response?.data?.message || 'Error creating course', 'error');
        }
    };

    const handleEdit = (course) => {
        console.log(course._id, "ID mil rahi hai ya nahi");
        setCourseId(course._id);
        setEditingCourse(course);
        setFormData({
            title: course.title || '',
            discreption: course.discreption || '',
            instructor: course.instructor || '',
            duration: course.duration || '',
            level: course.level || 'Beginner',
            price: course.price || '',
            tags: Array.isArray(course.tags) ? course.tags.join(', ') : course.tags || '',
        });
        setImagePreview(course.thumbnail || '');
        setImageFile(null);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Prepare the data to send
        const updatedData = new FormData();
        updatedData.append('courseId', courseId);
        updatedData.append('title', formData.title);
        updatedData.append('discreption', formData.discreption);
        updatedData.append('instructor', formData.instructor);
        updatedData.append('duration', formData.duration);
        updatedData.append('level', formData.level);
        updatedData.append('price', formData.price);
        updatedData.append('tags', formData.tags);
        
        // If there's a new image file, append it
        if (imageFile) {
            updatedData.append('image', imageFile);
        }
        
        try {
            const res = await axios.post(api.course.editcourse, updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log(res.data);
            
            if (res.data.success) {
                showToast('Course updated successfully!', 'success');
                setIsEditModalOpen(false);
                GetCourses(); // Refresh the course list
                // Reset form
                resetForm();
                setEditingCourse(null);
                setCourseId('');
            } else {
                showToast(res.data.message || 'Failed to update course', 'error');
            }
            
        } catch (error) {
            console.log(error);
            showToast(error.response?.data?.message || 'Error updating course', 'error');
        }
    };

    const handleDelete = async (courseIdToDelete) => {
        try {
            const response = await axios.post(api.course.deletecourse, {
                courseId: courseIdToDelete
            });

            console.log(response, "course deleted Successfully");
            
            if (response.data.success) {
                showToast('Course deleted successfully!', 'success');
                setDeleteConfirmId(null);
                GetCourses(); // Refresh the course list
            } else {
                showToast(response.data.message || 'Failed to delete course', 'error');
            }
        } catch (error) {
            console.log(error);
            showToast(error.response?.data?.message || 'Error deleting course', 'error');
        }
    };

    // Show toast message
    const showToast = (message, type) => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } animate-fade-in-down`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // Filter and sort courses - SAFE CHECK to ensure courses is array
    const getFilteredAndSortedCourses = () => {
        // Ensure courses is an array
        if (!Array.isArray(courses)) {
            console.warn('Courses is not an array:', courses);
            return [];
        }

        let filtered = courses.filter(course => {
            // Skip if course is invalid
            if (!course) return false;

            const matchesSearch =
                (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (course.tags && Array.isArray(course.tags) && course.tags.some(tag =>
                    tag && tag.toLowerCase().includes(searchTerm.toLowerCase())
                ));

            const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

            return matchesSearch && matchesLevel;
        });

        // Sort courses
        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sortBy === 'price-low') {
                return parseFloat(a.price || 0) - parseFloat(b.price || 0);
            } else if (sortBy === 'price-high') {
                return parseFloat(b.price || 0) - parseFloat(a.price || 0);
            } else if (sortBy === 'title') {
                return (a.title || '').localeCompare(b.title || '');
            }
            return 0;
        });

        return filtered;
    };

    const filteredAndSortedCourses = getFilteredAndSortedCourses();
    
    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCourses = filteredAndSortedCourses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Get unique levels for filter
    const getUniqueLevels = () => {
        if (!Array.isArray(courses)) return ['All'];
        const levels = ['All', ...new Set(courses.map(course => course.level).filter(level => level))];
        return levels;
    };

    const levels = getUniqueLevels();

    // Loading skeleton for table
    const LoadingSkeleton = () => (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Instructor</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="animate-pulse">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-300 rounded"></div>
                                        <div className="ml-4">
                                            <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-48"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                                <td className="px-6 py-4"><div className="h-8 bg-gray-300 rounded w-32"></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Create Course Button */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 mb-6">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    Course Management
                                </h1>
                                <p className="text-slate-500 mt-1">
                                    Manage and organize all your courses
                                </p>
                            </div>
                            
                        </div>
                    </div>
                </div>

                {/* Filters and Search Section */}
                {Array.isArray(courses) && courses.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search Bar */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search Courses
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by title, instructor, or tags..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <svg
                                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Level Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Level
                                </label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {levels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="title">Title A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button
                            onClick={GetCourses}
                            className="ml-4 text-red-700 font-semibold hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Courses Table */}
                {loading ? (
                    <LoadingSkeleton />
                ) : !Array.isArray(courses) ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Invalid data format</h3>
                        <p className="mt-1 text-sm text-gray-500">Unable to load courses. Please check the API response format.</p>
                    </div>
                ) : filteredAndSortedCourses.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Tags
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {currentCourses.map((course) => (
                                        <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                                            {/* Course Info with Thumbnail */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                            src={course.thumbnail || 'https://via.placeholder.com/48x48?text=No+Image'}
                                                            alt={course.title || 'Course'}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 line-clamp-2">
                                                            {course.title || 'Untitled Course'}
                                                        </div>
                                                        {course.discreption && (
                                                            <div className="text-sm text-slate-500 line-clamp-1">
                                                                {course.discreption.substring(0, 60)}...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Instructor */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{course.instructor || 'N/A'}</div>
                                            </td>

                                            {/* Duration */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600">{course.duration || 'N/A'}</div>
                                            </td>

                                            {/* Level with Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                    course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                    course.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {course.level || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-indigo-600">
                                                    ₹{course.price || '0'}
                                                </div>
                                            </td>

                                            {/* Tags */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {course.tags && Array.isArray(course.tags) && course.tags.slice(0, 2).map((tag, index) => (
                                                        <span key={index} className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {course.tags && course.tags.length > 2 && (
                                                        <span className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                            +{course.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(course)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    {deleteConfirmId === course._id ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleDelete(course._id)}
                                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirmId(course._id)}
                                                            className="text-red-400 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredAndSortedCourses.length > 0 && (
                            <div className="bg-white px-6 py-4 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                                    <div className="flex gap-6">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Total: {filteredAndSortedCourses.length} courses
                                        </span>
                                        <span>
                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-lg transition-colors ${
                                                currentPage === 1 
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                    : 'hover:bg-slate-100'
                                            }`}
                                        >
                                            ← Previous
                                        </button>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => paginate(index + 1)}
                                                className={`px-3 py-1 rounded-lg transition-colors ${
                                                    currentPage === index + 1
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'hover:bg-slate-100'
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button 
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded-lg transition-colors ${
                                                currentPage === totalPages 
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                    : 'hover:bg-slate-100'
                                            }`}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

        
            {isEditModalOpen && editingCourse && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">Edit Course</h2>
                            <p className="text-indigo-100 text-sm">Update course information</p>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="discreption"
                                    value={formData.discreption}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instructor <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="instructor"
                                    value={formData.instructor}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Level
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="React, JavaScript, etc."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Thumbnail
                                </label>
                                {imagePreview && (
                                    <div className="mb-3">
                                        <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover rounded-lg" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Update Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseList;