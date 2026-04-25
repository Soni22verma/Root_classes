import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';

const ScholarshipResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  // Scholarship modal state
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scholarshipForm, setScholarshipForm] = useState({
    discount: 50,
    validFrom: '',
    validUntil: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      const scholarshipResponse = await axios.get(api.schollership.schollershipResult);

      const pendingApplications = scholarshipResponse.data?.data || [];

      const approvedRejectedResponse = await axios.get(api.schollership.getApprovedReject, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const approvedRejectedApplications = approvedRejectedResponse.data?.data || [];

      console.log("Pending:", pendingApplications);
      console.log("Approved/Rejected:", approvedRejectedApplications);

      const scholarshipMap = new Map();
      approvedRejectedApplications.forEach(item => {
        const scholarshipId = item._id;
        if (scholarshipId) {
          scholarshipMap.set(scholarshipId, {
            status: item.status,
            discount: item.discount,
            validFrom: item.validFrom,
            validUntil: item.validUntil,
            adminRemark: item.adminRemark
          });
        }
      });

      const mergedResults = pendingApplications.map(application => {
        const scholarshipId = application.scholarshipId || application._id;
        const existingScholarship = scholarshipMap.get(scholarshipId);

        if (existingScholarship) {
          return {
            ...application,
            status: existingScholarship.status,
            isProcessed: true,
            discount: existingScholarship.discount,
            validFrom: existingScholarship.validFrom,
            validUntil: existingScholarship.validUntil,
            scholarshipId: scholarshipId
          };
        } else {
          return {
            ...application,
            status: application.status || 'pending',
            isProcessed: false,
            scholarshipId: application.scholarshipId || application._id
          };
        }
      });

      approvedRejectedApplications.forEach(item => {
        const exists = mergedResults.some(r => r.scholarshipId === item._id);

        if (!exists) {
          mergedResults.push({
            _id: item._id,
            scholarshipId: item._id,
            status: item.status,
            studentId: item.studentId,
            testId: { title: 'N/A' },
            obtainedMarks: 0,
            totalMarks: 0,
            percentage: 0,
            isEligible: item.status === 'approved',
            isProcessed: true,
            attemptDate: new Date().toISOString(),
            discount: item.discount,
            validFrom: item.validFrom,
            validUntil: item.validUntil
          });
        }
      });

      setResults(mergedResults);
      setError(null);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err?.response?.data?.message || 'Failed to load scholarship results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openScholarshipModal = (student) => {
    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(today.getFullYear() + 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setSelectedStudent(student);
    setScholarshipForm({
      discount: 50,
      validFrom: formatDate(today),
      validUntil: formatDate(oneYearLater)
    });
    setFormErrors({});
    setShowScholarshipModal(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!scholarshipForm.validFrom) {
      errors.validFrom = 'Start date is required';
    }

    if (!scholarshipForm.validUntil) {
      errors.validUntil = 'End date is required';
    }

    if (scholarshipForm.validFrom && scholarshipForm.validUntil) {
      const fromDate = new Date(scholarshipForm.validFrom);
      const untilDate = new Date(scholarshipForm.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (fromDate < today) {
        errors.validFrom = 'Start date cannot be in the past';
      }

      if (untilDate <= fromDate) {
        errors.validUntil = 'End date must be after start date';
      }
    }

    if (scholarshipForm.discount < 0 || scholarshipForm.discount > 100) {
      errors.discount = 'Discount must be between 0 and 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const grantScholarship = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setActionLoading(selectedStudent?._id);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const scholarshipId = selectedStudent.scholarshipId || selectedStudent._id;
      const requestData = {
        scholarshipId: scholarshipId,
        discount: scholarshipForm.discount,
        validFrom: scholarshipForm.validFrom,  
        validUntil: scholarshipForm.validUntil
      };

      console.log("Sending to backend:", JSON.stringify(requestData, null, 2));

      const response = await axios.post(
        api.schollership.grantScholarship,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Grant response:", response);

      if (response.data && response.data.success !== false) {
        // Update local state
        setResults(prevResults =>
          prevResults.map(r =>
            (r.scholarshipId === scholarshipId || r._id === selectedStudent._id)
              ? {
                ...r,
                status: "approved",
                isProcessed: true,
                discount: scholarshipForm.discount,
                validFrom: scholarshipForm.validFrom,
                validUntil: scholarshipForm.validUntil
              }
              : r
          )
        );

        alert(`✅ Scholarship successfully granted to ${selectedStudent.studentId?.fullName}!`);
        setShowScholarshipModal(false);

        // Refresh data to ensure consistency
        await fetchAllData();
      } else {
        throw new Error(response.data?.message || "Failed to grant scholarship");
      }

    } catch (error) {
      console.error("Grant Error Details:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to grant scholarship";
      if (error.response?.data?.message === "Not found") {
        errorMessage = "Scholarship record not found. The student may need to retake the test.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectScholarship = async (student) => {
    if (!window.confirm(`❌ Reject scholarship for ${student.studentId?.fullName}?\n\nThis action will be saved permanently.`)) {
      return;
    }

    try {
      setActionLoading(student._id);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const scholarshipId = student.scholarshipId || student._id;

      const requestData = {
        scholarshipId: scholarshipId,
        remark: "Does not meet eligibility criteria"
      };

      console.log("Rejecting scholarship with data:", requestData);

      const response = await axios.post(
        api.schollership.rejectScholarship,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Reject response:", response);

      if (response.data && response.data.success !== false) {
        setResults(prevResults =>
          prevResults.map(r =>
            (r.scholarshipId === scholarshipId || r._id === student._id)
              ? { ...r, status: "rejected", isProcessed: true }
              : r
          )
        );

        alert(`❌ Scholarship application rejected for ${student.studentId?.fullName}!`);
        await fetchAllData();
      } else {
        throw new Error(response.data?.message || "Failed to reject scholarship");
      }

    } catch (error) {
      console.error("Reject Error Details:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to reject scholarship";
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Get status badge
  const getStatusBadge = (result) => {
    if (result.status === 'approved') {
      return (
        <div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            ✅ Approved
          </span>
          {result.validUntil && (
            <p className="text-xs text-gray-500 mt-1">
              Valid until: {new Date(result.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
      );
    } else if (result.status === 'rejected') {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          ❌ Rejected
        </span>
      );
    } else if (result.status === 'pending' && result.isEligible) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          ⏳ Pending Approval
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Not Eligible
        </span>
      );
    }
  };

  // Get action buttons
  const getActionButtons = (result) => {
    // Only show action buttons for pending and eligible applications
    if (result.status === 'pending' && result.isEligible && !result.isProcessed) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => openScholarshipModal(result)}
            disabled={actionLoading === result._id}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === result._id ? 'Processing...' : '✅ Grant'}
          </button>
          <button
            onClick={() => rejectScholarship(result)}
            disabled={actionLoading === result._id}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Reject
          </button>
        </div>
      );
    } else if (result.status === 'approved') {
      return (
        <div className="text-left">
          <span className="text-xs text-green-600 font-medium">
            ✓ {result.discount || 50}% Discount
          </span>
          {result.validUntil && (
            <p className="text-xs text-gray-400 mt-1">
              Valid: {new Date(result.validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
      );
    } else if (result.status === 'rejected') {
      return (
        <span className="text-xs text-red-600 font-medium">
          ✗ Application Rejected
        </span>
      );
    } else {
      return (
        <span className="text-xs text-gray-400">
          Not Eligible
        </span>
      );
    }
  };

  // Filter results
  const filteredResults = results.filter(result => {
    const matchesSearch =
      result.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ? true : result.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: results.length,
    approved: results.filter(r => r.status === 'approved').length,
    rejected: results.filter(r => r.status === 'rejected').length,
    pending: results.filter(r => r.status === 'pending' && r.isEligible).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scholarship data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scholarship Management</h1>
          <p className="text-gray-600">Review, approve, or reject scholarship applications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by student name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Scholarship Modal with Date Pickers */}
        {showScholarshipModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Grant Scholarship</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Student: {selectedStudent.studentId?.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  Test Score: {selectedStudent.obtainedMarks || 0} / {selectedStudent.totalMarks || 0} ({selectedStudent.percentage || 0}%)
                </p>
              </div>

              <div className="px-6 py-4 space-y-4">
                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scholarshipForm.discount}
                    onChange={(e) => setScholarshipForm({
                      ...scholarshipForm,
                      discount: parseInt(e.target.value) || 0
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.discount ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.discount && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.discount}</p>
                  )}
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid From (Start Date)
                  </label>
                  <input
                    type="date"
                    value={scholarshipForm.validFrom}
                    onChange={(e) => setScholarshipForm({
                      ...scholarshipForm,
                      validFrom: e.target.value
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.validFrom ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.validFrom && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.validFrom}</p>
                  )}
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until (End Date)
                  </label>
                  <input
                    type="date"
                    value={scholarshipForm.validUntil}
                    onChange={(e) => setScholarshipForm({
                      ...scholarshipForm,
                      validUntil: e.target.value
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.validUntil ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.validUntil && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.validUntil}</p>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    ℹ️ Scholarship will be valid from <strong>{scholarshipForm.validFrom || 'start date'}</strong> to <strong>{scholarshipForm.validUntil || 'end date'}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Student will get {scholarshipForm.discount}% off on their first course purchase
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowScholarshipModal(false)}
                  disabled={actionLoading === selectedStudent._id}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={grantScholarship}
                  disabled={actionLoading === selectedStudent._id}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedStudent._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Grant Scholarship'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <tr key={result._id || result.scholarshipId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.studentId?.fullName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {result.studentId?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.obtainedMarks || 0} / {result.totalMarks || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {result.percentage || 0}%
                        </div>
                        <div className="w-20 mt-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${(result.percentage || 0) >= 70 ? 'bg-green-600' :
                              (result.percentage || 0) >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                            style={{ width: `${result.percentage || 0}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(result)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionButtons(result)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="text-gray-500">No applications found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredResults.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredResults.length} of {results.length} applications
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipResult;