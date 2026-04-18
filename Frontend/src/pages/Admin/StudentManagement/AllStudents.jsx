// pages/AllStudent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../../../services/adminendpoint';

const AllStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const GetAllStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.post(api.admin.getStudents);
      console.log(response, "All the student details fetched successfully");
      
      if (response.data && response.data.data) {
        setStudents(response.data.data);
      } else if (response.data && response.data.data && response.data.data.data) {
        setStudents(response.data.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.log(error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAllStudents();
  }, []);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const getClassColor = (className) => {
    const colors = {
      "12th": "bg-emerald-100 text-emerald-800",
      "11th": "bg-blue-100 text-blue-800",
      "10th": "bg-amber-100 text-amber-800",
      "9th": "bg-purple-100 text-purple-800",
    };
    return colors[className] || "bg-gray-100 text-gray-800";
  };

  const getAvatar = (student) => {
    if (student.profileImage) {
      return student.profileImage;
    }
    const name = student.fullName;
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7B05E'];
    const randomColor = colors[name?.length % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&size=128&bold=true&length=2`;
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.currentClass?.toLowerCase().includes(searchLower) ||
      student.phone?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Section - Responsive */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                All Students
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                Manage and view all student records
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white/50 backdrop-blur-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400"
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
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No students found</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Try adjusting your search or add a new student.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View - For screens below 768px */}
            <div className="block md:hidden space-y-3 sm:space-y-4">
              {currentStudents.map((student) => (
                <div key={student._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <img
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover flex-shrink-0"
                      src={getAvatar(student)}
                      alt={student.fullName}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                            {student.fullName}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            ID: {student._id?.slice(-6) || 'N/A'}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getClassColor(student.currentClass)}`}>
                          {student.currentClass}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{student.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 capitalize">
                          <span>{student.gender === 'male' ? '👨 Male' : student.gender === 'female' ? '👩 Female' : student.gender}</span>
                          <span className="text-slate-300">•</span>
                          <span>{student.interestedCourse ? student.interestedCourse : 'No course'}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="text-red-400 hover:text-red-600 transition-colors inline-flex items-center gap-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg hover:bg-red-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View - For screens 768px and above */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Interested Course
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {currentStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10">
                              <img
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover"
                                src={getAvatar(student)}
                                alt={student.fullName}
                              />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">
                                {student.fullName}
                              </div>
                              <div className="text-xs text-slate-500">
                                ID: {student._id?.slice(-6) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-900 max-w-xs truncate">{student.email}</div>
                          {student.phone && (
                            <div className="text-xs text-slate-500">{student.phone}</div>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClassColor(student.currentClass)}`}>
                            {student.currentClass}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 capitalize">
                          {student.gender === 'male' ? '👨 Male' : student.gender === 'female' ? '👩 Female' : student.gender}
                        </td>
                        
                        <td className="px-4 py-3">
                          {student.interestedCourse ? (
                            <span className="text-sm text-slate-700 capitalize">
                              {student.interestedCourse}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Not specified</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="text-red-400 hover:text-red-600 transition-colors inline-flex items-center gap-1"
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

              {/* Pagination - Responsive */}
              {filteredStudents.length > 0 && (
                <div className="bg-white px-4 py-3 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-slate-500">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Total: {filteredStudents.length} students
                      </span>
                      <span>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length}
                      </span>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                      <button 
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs sm:text-sm ${
                          currentPage === 1 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        ← Prev
                      </button>
                      {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }
                        return (
                          <button
                            key={index}
                            onClick={() => paginate(pageNum)}
                            className={`px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs sm:text-sm ${
                              currentPage === pageNum
                                ? 'bg-slate-800 text-white'
                                : 'hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button 
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs sm:text-sm ${
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

            {/* Mobile Pagination */}
            <div className="block md:hidden mt-4">
              <div className="flex justify-between items-center gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === 1 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ← Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === totalPages 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for Student Details - Responsive */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-400 to-red-400 rounded-t-2xl px-4 sm:px-6 py-6 sm:py-8">
              <button 
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col items-center">
                <img 
                  src={getAvatar(selectedStudent)} 
                  alt={selectedStudent.fullName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 sm:mt-4">{selectedStudent.fullName}</h2>
                <p className="text-sm sm:text-base text-white/80 capitalize">{selectedStudent.gender}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium min-w-[60px]">Email:</span>
                    <span className="break-all">{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium min-w-[60px]">Phone:</span>
                      <span>{selectedStudent.phone}</span>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium min-w-[60px]">Address:</span>
                      <span>{selectedStudent.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Academic Information
                </h3>
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4 space-y-3">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Current Class</span>
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getClassColor(selectedStudent.currentClass)}`}>
                      {selectedStudent.currentClass}
                    </span>
                  </div>
                  {selectedStudent.interestedCourse && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-2">Interested Courses</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 sm:px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-full text-xs sm:text-sm capitalize">
                          {selectedStudent.interestedCourse}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedStudent.dateofBirth && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Date of Birth</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-700">
                          {new Date(selectedStudent.dateofBirth).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Status</span>
                        <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-400 text-white rounded-xl hover:bg-red-500 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllStudent;