// pages/Enrollment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import useStudentStore from '../../../../Frontend/src/Store/studentstore';

const Enrollment = () => {
      const { student } = useStudentStore();  
  const studentId = student?._id;  
  
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const itemsPerPage = 10;



   const fatchEnrollment = async()=>{
    try {
        const res = await axios.post(api.enroll.getenrollment,{
        studentId:studentId
        })
        console.log(res,"this is enroll students")
        
    } catch (error) {
        console.log(error)
    }
   }

   useEffect(()=>{
    fatchEnrollment()
   },[])
   
    // Get status badge color
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Completed': 'bg-blue-100 text-blue-800',
            'Cancelled': 'bg-red-100 text-red-800',
            'Dropped': 'bg-gray-100 text-gray-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    // Get payment status badge
    const getPaymentBadge = (status) => {
        const paymentConfig = {
            'Paid': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Failed': 'bg-red-100 text-red-800',
            'Refunded': 'bg-purple-100 text-purple-800'
        };
        return paymentConfig[status] || 'bg-gray-100 text-gray-800';
    };

    // Filter and sort enrollments
    const getFilteredAndSortedEnrollments = () => {
        if (!Array.isArray(enrollments)) return [];

        let filtered = enrollments.filter(enrollment => {
            if (!enrollment) return false;

            const matchesSearch =
                (enrollment.studentName && enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.courseTitle && enrollment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.email && enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (enrollment.enrollmentId && enrollment.enrollmentId.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = selectedStatus === 'All' || enrollment.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort enrollments
        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.enrollmentDate) - new Date(a.enrollmentDate);
            } else if (sortBy === 'oldest') {
                return new Date(a.enrollmentDate) - new Date(b.enrollmentDate);
            } else if (sortBy === 'amount-high') {
                return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
            } else if (sortBy === 'amount-low') {
                return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
            } else if (sortBy === 'student') {
                return (a.studentName || '').localeCompare(b.studentName || '');
            }
            return 0;
        });

        return filtered;
    };

    const filteredEnrollments = getFilteredAndSortedEnrollments();
    
    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEnrollments = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Get unique statuses for filter
    const getUniqueStatuses = () => {
        if (!Array.isArray(enrollments)) return ['All'];
        const statuses = ['All', ...new Set(enrollments.map(e => e.status).filter(s => s))];
        return statuses;
    };

    const statuses = getUniqueStatuses();

    // View enrollment details
    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEnrollment(null);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enrollment ID</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr key={item} className="animate-pulse">
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-32"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-40"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                                <td className="px-6 py-4"><div className="h-6 bg-gray-300 rounded w-20"></div></td>
                                <td className="px-6 py-4"><div className="h-6 bg-gray-300 rounded w-16"></div></td>
                                <td className="px-6 py-4"><div className="h-8 bg-gray-300 rounded w-20 ml-auto"></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Enrollment Management
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Track and manage all course enrollments
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Enrollments
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by student, course, or enrollment ID..."
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

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enrollment Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
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
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                                <option value="student">Student Name A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button
                            onClick={fetchEnrollments}
                            className="ml-4 text-red-700 font-semibold hover:text-red-800 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Enrollments Table */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredEnrollments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Enrollment ID
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Student Details
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Enrollment Date
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {currentEnrollments.map((enrollment) => (
                                        <tr key={enrollment._id} className="hover:bg-slate-50 transition-colors">
                                            {/* Enrollment ID */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-mono text-slate-600">
                                                    {enrollment.enrollmentId || enrollment._id?.slice(-8) || 'N/A'}
                                                </div>
                                            </td>

                                            {/* Student Details */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={enrollment.studentAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.studentName || 'S')}&background=4F46E5&color=fff`}
                                                            alt={enrollment.studentName}
                                                        />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {enrollment.studentName || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {enrollment.email || 'No email'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Course */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {enrollment.courseTitle || 'N/A'}
                                                </div>
                                                {enrollment.instructor && (
                                                    <div className="text-xs text-slate-500">
                                                        By: {enrollment.instructor}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Enrollment Date */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600">
                                                    {formatDate(enrollment.enrollmentDate)}
                                                </div>
                                                {enrollment.expiryDate && (
                                                    <div className="text-xs text-slate-400">
                                                        Expires: {formatDate(enrollment.expiryDate)}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-indigo-600">
                                                    ₹{enrollment.amount?.toLocaleString() || '0'}
                                                </div>
                                            </td>

                                            {/* Enrollment Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(enrollment.status)}`}>
                                                    {enrollment.status || 'Pending'}
                                                </span>
                                            </td>

                                            {/* Payment Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(enrollment.paymentStatus)}`}>
                                                    {enrollment.paymentStatus || 'Pending'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDetails(enrollment)}
                                                    className="text-indigo-600 hover:text-indigo-900 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredEnrollments.length > 0 && (
                            <div className="bg-white px-6 py-4 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                                    <div className="flex gap-6">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Total: {filteredEnrollments.length} enrollments
                                        </span>
                                        <span>
                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEnrollments.length)} of {filteredEnrollments.length}
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

            {/* Enrollment Details Modal */}
            {showModal && selectedEnrollment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-6">
                            <button 
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Enrollment Details</h2>
                                    <p className="text-indigo-100 text-sm">ID: {selectedEnrollment.enrollmentId || selectedEnrollment._id?.slice(-8)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 py-6">
                            {/* Student Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Student Information
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Full Name</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.studentName || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Email Address</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Phone Number</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.phone || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Student ID</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.studentId || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Course Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    Course Information
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Course Title</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.courseTitle || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Instructor</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.instructor || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Course Duration</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.duration || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Course Level</span>
                                        <span className="text-sm font-medium text-slate-700">{selectedEnrollment.level || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Details */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Enrollment Details
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 block">Enrollment Date</span>
                                        <span className="text-sm font-medium text-slate-700">{formatDate(selectedEnrollment.enrollmentDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Expiry Date</span>
                                        <span className="text-sm font-medium text-slate-700">{formatDate(selectedEnrollment.expiryDate) || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Amount Paid</span>
                                        <span className="text-sm font-semibold text-indigo-600">₹{selectedEnrollment.amount?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Payment Method</span>
                                        <span className="text-sm font-medium text-slate-700 capitalize">{selectedEnrollment.paymentMethod || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Enrollment Status</span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedEnrollment.status)}`}>
                                            {selectedEnrollment.status || 'Pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 block">Payment Status</span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(selectedEnrollment.paymentStatus)}`}>
                                            {selectedEnrollment.paymentStatus || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            {selectedEnrollment.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Additional Notes
                                    </h3>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-600">{selectedEnrollment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Download Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enrollment;