import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Change Password' },
];

const InstructorSettings = () => {
  const { student, setStudent } = useStudentStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (student) {
      setProfile({
        fullName: student.fullName || student.name || '',
        email: student.email || '',
        phone: student.phone || '',
      });
    }
  }, [student]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/student/edit-profile-details`, {
        studentId: student._id,
        ...profile,
      });
      if (res.data.success) {
        setStudent({ user: res.data.user, token: localStorage.getItem('token') });
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/student/reset-password`, {
        email: student.email,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully');
        setPasswords({ newPassword: '', confirmPassword: '' });
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your profile and account security</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Personal Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">Update your name, email, and contact details</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSave}>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Change Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose a strong password (at least 6 characters)</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      required
                      className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                      className="w-full border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  <Save size={15} /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorSettings;
