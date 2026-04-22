import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';

const ScholarshipResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEligible, setFilterEligible] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchScholarshipResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get(api.schollership.schollershipResult);
      console.log(res)
      const resultsData = res.data?.data || [];
      setResults(resultsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching scholarship results:', err);
      setError('Failed to load scholarship results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarshipResults();
  }, []);

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEligibility = 
      filterEligible === 'all' ? true :
      filterEligible === 'eligible' ? result.isEligible :
      !result.isEligible;
    
    return matchesSearch && matchesEligibility;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEligibilityBadge = (isEligible) => {
    if (isEligible) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Eligible
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Not Eligible
      </span>
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading scholarship results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center bg-red-50 p-6 sm:p-8 rounded-lg shadow-md max-w-sm sm:max-w-md">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
          <button
            onClick={fetchScholarshipResults}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Scholarship Results</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and view all scholarship test results</p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Total Attempts</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{results.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Eligible Students</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {results.filter(r => r.isEligible).length}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-2 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Average Score</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {results.length > 0 
                    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
                    : 0}%
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-2 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">Total Tests</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {new Set(results.map(r => r.testId?._id)).size}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-2 sm:p-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Responsive */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search by student name, email, or test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setFilterEligible('all')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  filterEligible === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterEligible('eligible')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  filterEligible === 'eligible'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Eligible
              </button>
              <button
                onClick={() => setFilterEligible('notEligible')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
                  filterEligible === 'notEligible'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Not Eligible
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Card View (visible on small screens) */}
        <div className="block lg:hidden space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <div key={result._id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {result.studentId?.fullName || 'N/A'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{result.studentId?.email || 'N/A'}</p>
                  </div>
                  {getEligibilityBadge(result.isEligible)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test:</span>
                    <span className="font-medium text-gray-900">{result.testId?.title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium text-gray-900">{result.obtainedMarks} / {result.totalMarks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Percentage:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            result.percentage >= 80 ? 'bg-green-600' :
                            result.percentage >= 60 ? 'bg-blue-600' :
                            result.percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${result.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempt Date:</span>
                    <span className="text-gray-700 text-xs">{formatDate(result.attemptDate)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewDetails(result)}
                  className="mt-3 w-full py-2 text-sm text-blue-600 border-t border-gray-100 pt-3 hover:text-blue-700 font-medium"
                >
                  View Details →
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500 text-sm sm:text-base">No results found</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Desktop Table View (visible on large screens) */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <tr key={result._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleViewDetails(result)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.studentId?.fullName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.studentId?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{result.testId?.title || 'N/A'}</div>
                        <div className="text-xs text-gray-500">ID: {result.testId?._id?.slice(-6) || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.obtainedMarks} / {result.totalMarks}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.answers?.length || 0} questions
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${getScoreColor(result.percentage)}`}>
                          {result.percentage}%
                        </div>
                        <div className="w-24 mt-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              result.percentage >= 80 ? 'bg-green-600' :
                              result.percentage >= 60 ? 'bg-blue-600' :
                              result.percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEligibilityBadge(result.isEligible)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.attemptDate)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="text-gray-500">No results found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with count */}
          {filteredResults.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredResults.length} of {results.length} results
              </p>
            </div>
          )}
        </div>

        {/* Footer with count for mobile */}
        {filteredResults.length > 0 && (
          <div className="mt-4 lg:hidden px-4 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 text-center">
              Showing {filteredResults.length} of {results.length} results
            </p>
          </div>
        )}
      </div>

      {/* Modal for Details View */}
      {isModalOpen && selectedResult && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Test Details</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Student Name</label>
                  <p className="text-gray-900 font-medium">{selectedResult.studentId?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                  <p className="text-gray-900">{selectedResult.studentId?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Test Name</label>
                  <p className="text-gray-900">{selectedResult.testId?.title || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
                  <div className="mt-1">{getEligibilityBadge(selectedResult.isEligible)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Score</label>
                  <p className="text-gray-900">{selectedResult.obtainedMarks} / {selectedResult.totalMarks}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Percentage</label>
                  <p className={`font-semibold ${getScoreColor(selectedResult.percentage)}`}>
                    {selectedResult.percentage}%
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Attempt Date</label>
                  <p className="text-gray-900">{formatDate(selectedResult.attemptDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold">Questions Attempted</label>
                  <p className="text-gray-900">{selectedResult.answers?.length || 0}</p>
                </div>
              </div>
              
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipResult;