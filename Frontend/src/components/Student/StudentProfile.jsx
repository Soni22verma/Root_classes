// StudentProfile.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import api from '../../services/endpoints';
import useStudentStore from '../../Store/studentstore';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Heart,
    Camera,
    Edit3,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    BookOpen,
    Award
} from 'lucide-react';

const StudentProfile = () => {
    const { student, setStudent } = useStudentStore();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateofBirth: '',
        gender: '',
        currentClass: '',
        interestedCourse: '',
        address: '',
    });

    const getStudentId = () => {
        if (student?._id) return student._id;
        if (student?.user?._id) return student.user._id;
        if (studentData?._id) return studentData._id;

        const storedStudent = localStorage.getItem('student');
        if (storedStudent) {
            try {
                const parsed = JSON.parse(storedStudent);
                return parsed._id || parsed.user?._id;
            } catch (err) {
                console.error("Error parsing localStorage:", err);
            }
        }
        return null;
    };

    const GetStudentData = async () => {
        const studentId = getStudentId();

        if (!studentId) {
            toast.error("Student ID not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(api.student.getStudent, {
                studentId: studentId,
            });

            if (res.data.success && res.data.user) {
                setStudentData(res.data.user);
                setFormData({
                    fullName: res.data.user.fullName || '',
                    email: res.data.user.email || '',
                    phone: res.data.user.phone || '',
                    dateofBirth: res.data.user.dateofBirth ? res.data.user.dateofBirth.split('T')[0] : '',
                    gender: res.data.user.gender || '',
                    currentClass: res.data.user.currentClass || '',
                    interestedCourse: res.data.user.interestedCourse || '',
                    address: res.data.user.address || '',
                });

                if (res.data.user.enrolledCourses && Array.isArray(res.data.user.enrolledCourses)) {
                    setEnrolledCourses(res.data.user.enrolledCourses);
                }
            } else {
                toast.error(res.data.message || "Failed to fetch student data");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch student data");
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            uploadProfile(file);
        }
    };

    const uploadProfile = async (file) => {
        const studentId = getStudentId();
        if (!studentId) {
            toast.error('Student ID not found');
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("studentId", studentId);

            const response = await axios.post(api.student.editProfile, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response.data.success) {
                setStudentData(prev => ({
                    ...prev,
                    profileImage: response.data.updateduser?.profileImage
                }));
                toast.success('Profile image updated successfully!');
                GetStudentData();
            } else {
                toast.error(response.data.message || 'Failed to upload image');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error uploading image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const editDetails = async (e) => {
        e.preventDefault();
        const studentId = getStudentId();

        if (!studentId) {
            toast.error('Student ID not found');
            return;
        }

        setSaving(true);
        try {
            const res = await axios.post(api.student.editprofiledetails, {
                studentId: studentId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dateofBirth: formData.dateofBirth,
                gender: formData.gender,
                currentClass: formData.currentClass,
                interestedCourse: formData.interestedCourse,
                address: formData.address,
            });

            if (res.data.success) {
                toast.success('Profile updated successfully!');
                setStudentData(res.data.user);
                setIsEditing(false);
                if (setStudent) {
                    setStudent({ user: res.data.user, token: localStorage.getItem('token') });
                }
            } else {
                toast.error(res.data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (student || getStudentId()) {
            GetStudentData();
        } else {
            toast.error("Please log in to view profile");
            setLoading(false);
        }
    }, [student]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-500 font-bold animate-pulse">Designing your profile...</p>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="max-w-md w-full bg-white p-8 border border-slate-200 text-center rounded-sm">
                    <div className="w-20 h-20 bg-red-50 flex items-center justify-center mx-auto mb-6 rounded-full">
                        <ShieldCheck className="text-red-500" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Session Expired</h2>
                    <p className="text-slate-500 font-medium mb-8">We couldn't retrieve your profile data. Please sign in again to access your dashboard.</p>
                    <button
                        onClick={() => navigate('/stdlogin')}
                        className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all rounded-sm"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    const profileImageUrl = studentData.profileImage || studentData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.fullName)}&background=0078FF&color=fff&size=200&bold=true`;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-poppins pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 transition-colors rounded-sm">
                                <ArrowLeft size={20} className="text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Roots Classes</h1>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Student Central</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/course')}
                            className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all rounded-sm"
                        >
                            Explore Courses
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {/* Hero Profile Section */}
                <section className="bg-white border border-slate-200 overflow-hidden mb-8 rounded-sm">
                    {/* Tech Circuit Banner Top */}
                    <div className="h-36 md:h-44 w-full relative overflow-hidden bg-slate-900">
                        <img
                            src="https://chicinfotech.com/assets/img/banner-3.jpeg"
                            alt="Tech Profile Banner"
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>

                        <div className="absolute top-4 right-4 z-10">
                            <div className="px-3 py-1 bg-black/50 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold tracking-wider rounded-md shadow-xs">
                                ID: {studentData._id?.slice(-8).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Below Banner */}
                    <div className="p-6 md:p-8 pt-0">
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-12 mb-2">

                            {/* Avatar + Info */}
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
                                <div className="relative group flex-shrink-0">
                                    <div className="w-24 h-24 md:w-28 md:h-28 border-4 border-white bg-white overflow-hidden relative rounded-full shadow-md">
                                        <img
                                            src={profileImageUrl}
                                            alt={studentData.fullName}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <label
                                            htmlFor="profileImageUpload"
                                            className={`absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${uploadingImage ? 'opacity-100' : ''}`}
                                        >
                                            {uploadingImage ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <Camera size={18} className="text-white mb-0.5" />
                                                    <span className="text-white text-[8px] font-black uppercase tracking-widest">Update</span>
                                                </div>
                                            )}
                                        </label>
                                        <input
                                            type="file"
                                            id="profileImageUpload"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full"></div>
                                </div>

                                <div className="pt-2">
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                                        {studentData.fullName}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-tight border border-blue-100 rounded-sm">
                                            <GraduationCap size={14} />
                                            {studentData.currentClass || 'Member'}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-tight border border-emerald-100 rounded-sm">
                                            <ShieldCheck size={14} />
                                            Verified
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex-shrink-0 rounded-sm"
                            >
                                <Edit3 size={14} />
                                Edit Profile
                            </button>

                        </div>
                    </div>
                </section>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatBox icon={<BookOpen className="text-blue-600" />} label="Courses" value={enrolledCourses.length} />
                    <StatBox icon={<Award className="text-purple-600" />} label="Class" value={studentData.currentClass || 'N/A'} />
                    <StatBox icon={<Calendar className="text-emerald-600" />} label="Joined" value={new Date(studentData.createdAt).getFullYear()} />
                    <StatBox icon={<Heart className="text-rose-600" />} label="Gender" value={studentData.gender || 'Not set'} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Contact & Personal */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-900">Personal Information</h3>
                                <div className="w-9 h-9 bg-blue-50 flex items-center justify-center rounded-sm">
                                    <User className="text-blue-600" size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <InfoItem icon={<Mail />} label="Email Address" value={studentData.email} />
                                <InfoItem icon={<Phone />} label="Phone Number" value={studentData.phone ? String(studentData.phone) : 'Not registered'} />
                                <InfoItem icon={<Calendar />} label="Date of Birth" value={studentData.dateofBirth ? new Date(studentData.dateofBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'} />
                                <InfoItem icon={<Heart />} label="Gender Identity" value={studentData.gender || 'Not specified'} />
                                <InfoItem icon={<MapPin />} label="Current Address" value={studentData.address || 'No address on file'} className="md:col-span-2" />
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-900">Academic Trajectory</h3>
                                <div className="w-9 h-9 bg-purple-50 flex items-center justify-center rounded-sm">
                                    <GraduationCap className="text-purple-600" size={18} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Academic Level</p>
                                    <p className="text-base font-black text-slate-800">{studentData.currentClass || 'Not Specified'}</p>
                                </div>
                                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-sm">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Primary Interest</p>
                                    <p className="text-base font-black text-blue-900">{studentData.interestedCourse || 'Exploring'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Enrolled Courses Mini List */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 md:p-8 border border-slate-200 h-full rounded-sm">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-900">My Learning</h3>
                                <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest rounded-sm">
                                    {enrolledCourses.length} Active
                                </span>
                            </div>

                            {enrolledCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {enrolledCourses.map((course, idx) => (
                                        <div key={idx} className="group p-4 bg-slate-50 hover:bg-slate-900 border border-slate-100 transition-all cursor-pointer rounded-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors rounded-sm">
                                                    <BookOpen className="text-blue-600 group-hover:text-white" size={18} />
                                                </div>

                                                <Link to="/purchescourse" className="flex-1">
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 group-hover:text-white line-clamp-1">
                                                            {course.title || 'Course ' + (idx + 1)}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-300">Enrolled</p>
                                                    </div>
                                                </Link>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-200 rounded-sm">
                                        <BookOpen className="text-slate-400" size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">No courses yet</p>
                                    <button onClick={() => navigate('/course')} className="mt-4 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">
                                        Start Learning
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 md:pt-28 pb-8 px-4 md:px-8 overflow-y-auto animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/60" onClick={() => setIsEditing(false)}></div>
                    <div className="bg-white w-full max-w-4xl border border-slate-300 relative z-10 overflow-hidden animate-slideUp rounded-sm my-auto">
                        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white transition-colors rounded-sm">
                                <ArrowLeft size={18} className="text-slate-600" />
                            </button>
                        </div>

                        <form onSubmit={editDetails} className="p-8 md:p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} icon={<User size={16} />} />
                                <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} icon={<Mail size={16} />} type="email" />
                                <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={16} />} type="tel" maxLength="10" />
                                <FormInput label="Current Class" name="currentClass" value={formData.currentClass} onChange={handleInputChange} icon={<GraduationCap size={16} />} />
                                <FormInput label="Interested Course" name="interestedCourse" value={formData.interestedCourse} onChange={handleInputChange} icon={<BookOpen size={16} />} />
                                <FormInput label="Date of Birth" name="dateofBirth" value={formData.dateofBirth} onChange={handleInputChange} icon={<Calendar size={16} />} type="date" />

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Identity</label>
                                    <div className="relative">
                                        <Heart size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20 outline-none appearance-none cursor-pointer rounded-sm"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="1"
                                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20 outline-none resize-none rounded-sm"
                                        placeholder="Enter your current residential address..."
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-5 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2.5 bg-white text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 rounded-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={editDetails}
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 rounded-sm shadow-sm"
                            >
                                {saving ? 'Updating...' : 'Apply Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

const StatBox = ({ icon, label, value }) => (
    <div className="bg-white p-4 border border-slate-200 flex flex-col items-center justify-center text-center rounded-sm">
        <div className="w-9 h-9 bg-slate-50 flex items-center justify-center mb-1.5 rounded-sm">
            {icon}
        </div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-900 mt-0.5">{value}</p>
    </div>
);

const InfoItem = ({ icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-4 ${className}`}>
        <div className="w-9 h-9 bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-400 rounded-sm">
            {React.cloneElement(icon, { size: 16 })}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-800 break-words">{value || 'Not provided'}</p>
        </div>
    </div>
);

const FormInput = ({ label, name, value, onChange, icon, type = "text", maxLength, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {icon}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20 outline-none placeholder:text-slate-300 rounded-sm"
            />
        </div>
    </div>
);

export default StudentProfile;
