import axios from 'axios';
import React, { useState, useEffect } from 'react';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useStudentStore from '../../Store/studentstore';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    setLoading(true);

    try {
      const response = await axios.post(api.student.sendOtp, { email });
      
      if (response.data.success) {
        toast.success('OTP sent successfully to your email!');
        setStep(2);
        
        let timer = 60;
        setCountdown(timer);
        const interval = setInterval(() => {
          timer--;
          setCountdown(timer);
          if (timer === 0) {
            clearInterval(interval);
          }
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setOtpError('Please enter OTP');
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }
    
    setOtpError('');
    setLoading(true);

    try {
      const response = await axios.post(api.student.verifyOTP, { email, otp });
      
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

 
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setPasswordError('Please enter new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    setLoading(true);

    try {
      const response = await axios.post(api.student.resetPassword, {
        email,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        setTimeout(() => {
          onClose();
          setStep(1);
          setEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setCountdown(0);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

 

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
    } else if (step === 3) {
      setStep(2);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!isOpen) return null;

  return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Backdrop */}
  <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

  {/* Modal Panel */}
  <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
    {/* Close Button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    {/* Content */}
    <div className="p-6">
      {/* Step 1: Email */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
            <p className="text-sm text-gray-500 mt-1">Enter your email to receive OTP</p>
          </div>

          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="Email address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
              autoFocus
            />
            {emailError && <p className="text-red-500 text-sm mb-3 -mt-2">{emailError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Enter OTP</h3>
            <p className="text-sm text-gray-500 mt-1">Sent to {email}</p>
          </div>

          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setOtpError('');
              }}
              placeholder="6-digit code"
              className="w-full px-4 py-2 text-center text-xl tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
              maxLength="6"
              autoFocus
            />
            {otpError && <p className="text-red-500 text-sm mb-3 -mt-2">{otpError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mb-3"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => handleSendOTP()}
              disabled={countdown > 0}
              className="w-full text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <div>
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">New Password</h3>
            <p className="text-sm text-gray-500 mt-1">Create a strong password</p>
          </div>

          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="New password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-3"
              autoFocus
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Confirm password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
            />
            {passwordError && <p className="text-red-500 text-sm mb-3 -mt-2">{passwordError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      )}

      {/* Back Button */}
      {(step === 2 || step === 3) && (
        <button
          onClick={handleBack}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4 pt-3 border-t"
        >
          ← Back
        </button>
      )}
    </div>
  </div>
</div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setStudent } = useStudentStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(api.student.login, formData);

      const user = res.data.user || res.data.student || res.data?.data?.student;
      const token = res.data.token || res.data?.data?.token;

      if (!user) {
        throw new Error("User data not found");
      }

      setStudent({ user, token });
      
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Login successful");

      if (user.role === "admin" || user.role === "instructor") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              <span className="text-red-500">Roots</span>
              <span className="text-blue-400"> Classes</span>
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Login to continue your learning journey</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V6a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Login →'
              )}
            </button>

            {/* Demo Credentials */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-800 font-semibold mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>📧 Email: student@rootsclasses.com</p>
                <p>🔑 Password: demo123</p>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition">
                Sign up now
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2">📞 Need help? Call us at +91 98775-15330</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginPage;