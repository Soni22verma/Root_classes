import axios from 'axios';
import React, { useState } from 'react';
import api from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { User, BookOpen, Check, ChevronRight, ChevronLeft, Globe, Apple } from 'lucide-react';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '',
    dateofBirth: '', gender: '', currentClass: '',
    interestedCourse: '', address: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast.error("Please fill in Name, Email and Password");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.dateofBirth || !formData.gender || !formData.currentClass) {
        toast.error("Please select Date of Birth, Gender, and Class");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.phone.trim() || !formData.interestedCourse || !formData.address.trim()) {
        toast.error("Please fill in Phone, Course, and Address");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (step < 3) {
      handleNextStep();
      return;
    }
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }
    setLoading(true);
    try {
      await axios.post(api.student.register, formData);
      toast.success("Welcome aboard!");
      navigate("/stdlogin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] bg-line-grid flex items-center justify-center p-4 md:p-8 font-poppins">

      {/* Main Container - Sharp & Pro */}
      <div className="w-full max-w-[1050px] bg-white rounded-2xl border border-gray-100 flex overflow-hidden shadow-2xl shadow-blue-900/5">

        {/* Left Side: Multi-Step Form */}
        <div className="w-full md:w-[48%] p-8 md:p-12 flex flex-col justify-between relative z-10 border-r border-gray-50">
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link to="/" title="Go to Home">
                  <img src="/logo.svg" alt="Roots Classes" className="h-8 w-auto hover:opacity-90 transition-all cursor-pointer" />
                </Link>
                <div className="h-4 w-[1px] bg-gray-200" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {step}/3</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-6 bg-[#0078FF]' : 'w-1 bg-gray-100'}`} />)}
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Create account</h1>
              <p className="text-sm text-gray-400">Join the Roots Classes community.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Step 1: Identity */}
              {step === 1 && (
                <div className="animate-slideIn space-y-5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Full Name</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold" placeholder="name@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Password</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] transition-all text-xs font-bold" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {/* Step 2: Academic */}
              {step === 2 && (
                <div className="animate-slideIn space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">DOB</label>
                      <input type="date" name="dateofBirth" required value={formData.dateofBirth} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Gender</label>
                      <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold appearance-none">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Current Class</label>
                    <select name="currentClass" required value={formData.currentClass} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold appearance-none">
                      <option value="">Select Class</option>
                      {['8th', '9th', '10th', '11th', '12th', 'Dropper'].map(c => <option key={c} value={c}>{c} Class</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Finalize */}
              {step === 3 && (
                <div className="animate-slideIn space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Phone</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold" placeholder="10-digit mobile" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Course</label>
                      <select name="interestedCourse" required value={formData.interestedCourse} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold appearance-none">
                        <option value="">Select Course</option>
                        <option value="foundation">Foundation</option>
                        <option value="medical">NEET</option>
                        <option value="engineering">IIT-JEE</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Address</label>
                    <textarea name="address" required value={formData.address} onChange={handleChange} rows="1" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-5 focus:outline-none focus:border-[#0078FF] text-xs font-bold resize-none" placeholder="Enter full address" />
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 border border-gray-100 text-gray-400 py-3 rounded-xl font-bold hover:text-gray-900 transition-all flex items-center justify-center gap-2 text-xs">
                    <ChevronLeft size={16} /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button type="button" onClick={handleNextStep} className="flex-[2] bg-[#0a1628] text-white py-3 rounded-xl font-bold hover:bg-[#0078FF] transition-all flex items-center justify-center gap-2 text-xs">
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="flex-[2] bg-[#FB0500] text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-xs">
                    {loading ? 'Processing...' : 'Register Account'} <Check size={16} />
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Apple size={18} /></button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"><Globe size={18} /></button>
            </div>
          </div>

          <div className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">
            Already registered? <Link to="/stdlogin" className="text-[#0078FF] border-b border-[#0078FF]">Sign In</Link>
          </div>
        </div>

        {/* Right Side: Visual Section - Sharp & Pro */}
        <div className="hidden md:flex flex-1 m-4 rounded-[32px] relative overflow-hidden group">
          <img
            src="/assets/student_study.png"
            alt="Students"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[#0a1628]/10" />

          <div className="absolute top-10 right-10 bg-[#ffcf5c] p-4 rounded-2xl border border-yellow-400/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-900 mb-1">Scholarship Open</p>
            <p className="text-sm font-bold text-gray-900">Get up to 100% off</p>
          </div>

          <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[24px] text-white">
            <p className="text-xs font-bold mb-4 opacity-80 uppercase tracking-widest">Global Ranking</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">#1 Institute</p>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/10" />)}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default StudentRegistration;