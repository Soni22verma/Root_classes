import React, { useState } from 'react';

const ExpertConsultationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNo: '',
    otp: '',
    stream: '',
    class: '',
    emailId: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = () => {
    if (formData.mobileNo.length === 10) {
      setLoading(true);
      // Simulate OTP sending
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        alert(`OTP sent to ${formData.mobileNo}`);
      }, 1000);
    } else {
      alert('Please enter a valid 10-digit mobile number');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      alert('Please verify OTP first');
      return;
    }
    console.log('Form submitted:', formData);
    alert('Form submitted successfully! Our expert will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-20 rounded-full"></div>
            <h1 className="relative text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              Talk to our Expert
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized guidance from our education experts. Fill in your details and we'll reach out to you shortly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Side - Info & Benefits */}
          <div className="flex-1 lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl overflow-hidden">
              <div className="p-8 md:p-10">
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span className="text-white text-sm font-medium">Live Consultation</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Request a <br />
                    Call Back
                  </h2>
                  <p className="text-blue-100 text-lg mb-6">
                    Get expert advice on your educational journey
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Free Career Counseling</p>
                      <p className="text-blue-100 text-sm">Get expert guidance on your future path</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Personalized Study Plan</p>
                      <p className="text-blue-100 text-sm">Tailored roadmap for your goals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 rounded-full p-1.5">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Course Recommendations</p>
                      <p className="text-blue-100 text-sm">Best programs based on your profile</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-2xl font-bold text-white">10,000+</div>
                    <div className="text-blue-100 text-xs">Students Counseled</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-blue-100 text-xs">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-8 md:p-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Expert Advice</h3>
                <p className="text-gray-500 text-sm mb-6">Fill in your details and our expert will contact you</p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Fields - Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  {/* Mobile Number with OTP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile No <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="tel"
                          name="mobileNo"
                          value={formData.mobileNo}
                          onChange={handleChange}
                          maxLength="10"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                          placeholder="Enter 10-digit mobile number"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading || formData.mobileNo.length !== 10}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          formData.mobileNo.length === 10 && !loading
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-sm transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {loading ? 'Sending...' : otpSent ? 'OTP Sent ✓' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {/* OTP Field - Shows only after OTP sent */}
                  {otpSent && (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                        placeholder="Enter 6-digit OTP"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Didn't receive OTP? <button type="button" onClick={handleSendOTP} className="text-blue-600 hover:underline">Resend</button>
                      </p>
                    </div>
                  )}

                  {/* Stream Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stream <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none bg-white"
                    >
                      <option value="">Select Stream</option>
                      <option value="science">Science (PCM/PCB)</option>
                      <option value="commerce">Commerce</option>
                      <option value="arts">Arts/Humanities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Class Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none bg-white"
                    >
                      <option value="">Select Class</option>
                      <option value="8th">Class 8th</option>
                      <option value="9th">Class 9th</option>
                      <option value="10th">Class 10th</option>
                      <option value="11th">Class 11th</option>
                      <option value="12th">Class 12th</option>
                      <option value="dropper">Dropper</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </div>

                  {/* Email ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                      placeholder="Enter your email address"
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      By submitting this form, I agree to receive WhatsApp communication and agree to Postclass's <a href="#" className="text-blue-600 hover:underline">T&C</a> & <a href="#" className="text-blue-600 hover:underline">P.P.</a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    Submit Now →
                  </button>

                  {/* Trust Badge */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-500">Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-500">24/7 Support</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConsultationForm;