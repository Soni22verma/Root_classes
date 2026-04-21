import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../services/instructorendpoint';
import { toast } from 'react-toastify';
import useStudentStore from '../../../Store/studentstore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Edit2, Trash2, ChevronRight, Search, X } from 'lucide-react';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

const AllCourse = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { student } = useStudentStore();

  const [formData, setFormData] = useState({ title: '', description: '', category: '', level: 'beginner', price: '' });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.post(api.course.getCourse);
      const data = res.data.data || res.data || [];
      setCourses(data.map(c => ({ ...c, price: c.price ?? 0 })));
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.post(api.course.getCategory);
      setCategories(res.data.data || res.data || []);
    } catch {
      setCategories([]);
    }
  };

  const openCreate = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', category: '', level: 'beginner', price: '' });
    setIsModalOpen(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category?._id || course.category,
      level: course.level || 'beginner',
      price: course.price,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData, price: Number(formData.price) };
      if (editingCourse) {
        await axios.post(api.course.editCourse, { courseId: editingCourse._id, ...payload });
        toast.success('Course updated');
      } else {
        await axios.post(api.course.createCourse, payload);
        toast.success('Course created');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await axios.post(api.course.deleteCourse, { courseId: id });
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const levelColor = (level) => {
    if (level === 'beginner') return 'bg-green-50 text-green-700';
    if (level === 'intermediate') return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-sm text-gray-400 mt-1">Click "New Course" to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">#</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Title</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Level</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Price</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((course, idx) => (
                  <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">{course.description}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {categories.find(c => c._id === (course.category?._id || course.category))?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${levelColor(course.level)}`}>
                        {course.level || 'Beginner'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {course.price ? `₹${course.price}` : 'Free'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/instructor/courses/${course._id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Manage <ChevronRight size={12} />
                        </button>
                        <button
                          onClick={() => openEdit(course)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Physics for Class 11"
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief overview of what this course covers"
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Select</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Level *</label>
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={e => setFormData(p => ({ ...p, level: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-400"
                  >
                    {LEVELS.map(l => (
                      <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                  placeholder="0 for free"
                  min="0"
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-[2] py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {formLoading ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCourse;
