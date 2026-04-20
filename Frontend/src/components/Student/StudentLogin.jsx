import axios from 'axios';
import React, { useState } from 'react';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import useStudentStore from '../../Store/studentstore';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Globe, Apple } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setStudent } = useStudentStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(api.student.login, formData);
      const user = res.data.user || res.data.student || res.data?.data?.student;
      const token = res.data.token || res.data?.data?.token;
      if (!user) throw new Error("Invalid response");

      setStudent({ user, token });
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      toast.success("Welcome back!");
      navigate(user.role === "admin" || user.role === "instructor" ? "/admin" : "/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#f8faff] bg-line-grid flex items-center justify-center p-4 md:p-8 overflow-hidden font-poppins">

      {/* Main Container - No Shadow, Sharp Borders */}
      <div className="w-full max-w-[1100px] h-full max-h-[720px] bg-white rounded-[40px] border border-gray-100 flex overflow-hidden relative">

        {/* Left Side: Form Section */}
        <div className="w-full md:w-[45%] p-10 md:p-16 flex flex-col justify-between relative z-10 border-r border-gray-50">
          <div>
            <div className="mb-10">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Roots Classes" className="h-10 w-auto" />
                <div className="h-6 w-[1px] bg-gray-200" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Portal</span>
              </div>
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Login to account</h1>
              <p className="text-sm text-gray-400">Please enter your verified credentials.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <input
                  type="email" required
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all text-sm outline-none"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required
                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-6 pr-14 focus:ring-2 focus:ring-[#0078FF]/20 focus:border-[#0078FF] transition-all text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#0a1628] text-white py-4 rounded-full font-bold hover:bg-[#FB0500] transition-all duration-300 mt-4 shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In Now'}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
                <Apple size={16} /> Apple
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
                <Globe size={16} /> Google
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-10">
            <Link to="/register" className="hover:text-gray-900 transition-colors">No account? <span className="text-[#0078FF] border-b border-[#0078FF]">Register</span></Link>
            <Link to="/" className="hover:text-gray-900 transition-colors">Roots Classes © 2026</Link>
          </div>
        </div>

        {/* Right Side: Visual Section - Clean, No Shadows */}
        <div className="hidden md:flex flex-1 m-4 rounded-[32px] relative overflow-hidden group">
          <img
            src="/assets/student_study.png"
            alt="Students"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#0a1628]/10" />

          {/* Widget 1: Task Review - Flat Design */}
          <div className="absolute top-10 left-10 bg-[#ffcf5c] p-4 rounded-2xl border border-yellow-400/50 max-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-900 mb-1">Live Mentorship</p>
            <p className="text-sm font-bold text-gray-900">Starts in 15 mins</p>
          </div>

          {/* Widget 2: Stats - Flat Design */}
          <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[24px] text-white">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Admission Progress</p>
              <span className="text-xs font-bold">Step 2/3</span>
            </div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#ffcf5c] w-3/4 rounded-full" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;