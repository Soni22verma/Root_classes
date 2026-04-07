import React, { useState } from 'react';

const ScholarshipForm = () => {
  const [formData, setFormData] = useState({
    program: '',
    lookingFor: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    alert('Application submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Get upto 100% Scholarship
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Program Selection Tabs */}
        <div className="flex gap-3 mb-8">
          {['Foundation', 'Medical', 'Engineering'].map((program) => (
            <button
              key={program}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, program }))}
              className={`flex-1 py-2.5 px-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                formData.program === program
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {program}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Your Class Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Class
            </label>
            <select
              name="lookingFor"
              value={formData.lookingFor}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              required
            >
              <option value="" disabled>Select an option</option>
              <option value="class-10">Class 10</option>
              <option value="class-11">Class 11</option>
              <option value="class-12">Class 12</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>

          {/* Looking For Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Looking for
            </label>
            <select
              name="lookingForCategory"
              value={formData.lookingFor}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              required
            >
              <option value="" disabled>Select an option</option>
              <option value="scholarship">Scholarship Programs</option>
              <option value="admission">Admission Guidance</option>
              <option value="counseling">Career Counseling</option>
              <option value="exam-prep">Exam Preparation</option>
            </select>
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email ID
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              required
            />
          </div>

          {/* Apply Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply Now
          </button>
        </form>

      </div>
    </div>
  );
};

export default ScholarshipForm;