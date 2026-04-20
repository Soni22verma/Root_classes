import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../services/instructorendpoint';
import { toast } from 'react-toastify';
import useStudentStore from '../../../Store/studentstore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, MoreVertical, Edit2, Trash2, GraduationCap, Layers, Tag, ExternalLink } from 'lucide-react';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { student } = useStudentStore();

  const [formData, setFormData] = useState({ title: '', description: '', category: '', level: 'beginner', price: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.post(api.course.getCourse);
      let data = response.data.data || response.data || [];
      setCourses(data.map(c => ({ ...c, price: c.price || 0 })));
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.post(api.course.getCategory);
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData, price: Number(formData.price) };
      if (editingCourse) {
        await axios.post(api.course.editCourse, { courseId: editingCourse._id, ...payload });
        toast.success('Updated Successfully');
      } else {
        await axios.post(api.course.createCourse, payload);
        toast.success('Created Successfully');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this course?')) {
      await axios.post(api.course.deleteCourse, { courseId: id });
      toast.success('Deleted');
      fetchCourses();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] bg-line-grid font-poppins">
      <div className="p-6">
        
        {/* Header Section - Compact Pro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#FB0500]" />
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Portal / Instructor</p>
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">Course Manager</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Active Curriculum Sectors</p>
          </div>

          <button
            onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', category: '', level: 'beginner', price: '' }); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-[#0078FF] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0061cc] transition-all shadow-lg shadow-blue-500/10"
          >
            <Plus size={16} /> New Course
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-2xl shadow-blue-900/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">S.No</th>
                    <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Course Identity</th>
                    <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Curriculum</th>
                    <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                    <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course, idx) => (
                    <tr key={course._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-3 text-[10px] font-bold text-gray-300">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <p className="text-[13px] font-black text-gray-900 leading-tight group-hover:text-[#0078FF] transition-colors">{course.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 line-clamp-1 max-w-xs uppercase tracking-tight opacity-60">{course.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[9px] font-black text-gray-400 uppercase">
                              <Layers size={10} /> {categories.find(c => c._id === course.category)?.name || 'General'}
                           </span>
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[9px] font-black text-[#0078FF] uppercase">
                              <GraduationCap size={10} /> {course.level || 'Beginner'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                         <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Active</span>
                         </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[11px] font-black text-gray-900 uppercase">₹{course.price || 'Free'}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                           <button onClick={() => navigate(`/instructor/allcourses/${course._id}`)} className="p-1.5 text-gray-300 hover:text-[#0078FF] hover:bg-blue-50 rounded-lg transition-all" title="Manage Content"><ExternalLink size={14} /></button>
                           <button onClick={() => { setEditingCourse(course); setFormData({ title: course.title, description: course.description, category: course.category?._id || course.category, level: course.level, price: course.price }); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                           <button onClick={() => handleDelete(course._id)} className="p-1.5 text-gray-400 hover:text-[#FB0500] hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modern Side Modal for Forms */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-gray-900/10">
          <div className="w-full max-w-md bg-white rounded-[32px] border border-gray-100 shadow-2xl animate-slideUp overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
               <h3 className="text-lg font-black text-gray-900 tracking-tight">{editingCourse ? 'Edit Curriculum' : 'Initialize Course'}</h3>
               <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Instructor Portal</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Course Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:outline-none focus:border-[#0078FF] transition-all" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
                  <textarea name="description" rows="3" required value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:outline-none focus:border-[#0078FF] transition-all resize-none" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Category</label>
                     <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:outline-none focus:border-[#0078FF] transition-all outline-none">
                        <option value="">Select</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Level</label>
                     <select name="level" required value={formData.level} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:outline-none focus:border-[#0078FF] transition-all outline-none">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                     </select>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Price (INR)</label>
                  <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:outline-none focus:border-[#0078FF] transition-all" placeholder="0 for Free" />
               </div>
               
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">Cancel</button>
                  <button type="submit" disabled={formLoading} className="flex-[2] bg-[#0a1628] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FB0500] transition-all shadow-lg shadow-gray-200">
                     {formLoading ? 'Saving...' : 'Confirm Action'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default InstructorDashboard;