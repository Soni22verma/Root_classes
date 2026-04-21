import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/instructorendpoint';
import useStudentStore from '../../Store/studentstore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Plus, GraduationCap, TrendingUp, Clock } from 'lucide-react';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { student } = useStudentStore();
  const navigate = useNavigate();

  const name = student?.fullName || student?.name || 'Instructor';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.post(api.course.getCourse);
        const data = res.data.data || res.data || [];
        setCourses(data);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const totalModules = courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
  const freeCount = courses.filter(c => !c.price || c.price === 0).length;
  const paidCount = courses.length - freeCount;

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Modules', value: totalModules, icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
    { label: 'Paid Courses', value: paidCount, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Free Courses', value: freeCount, icon: Clock, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Here's a quick overview of your teaching activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">Recent Courses</h2>
          <button
            onClick={() => navigate('/instructor/courses')}
            className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
          >
            View all <ChevronRight size={13} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-500 mb-4">No courses yet</p>
            <button
              onClick={() => navigate('/instructor/courses')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} /> Create your first course
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {courses.slice(0, 5).map((course) => (
              <div key={course._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={15} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {course.modules?.length || 0} module{course.modules?.length !== 1 ? 's' : ''} ·{' '}
                      {course.price ? `₹${course.price}` : 'Free'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/instructor/courses/${course._id}`)}
                  className="ml-4 flex-shrink-0 text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700"
                >
                  Edit <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Manage Courses</p>
            <p className="text-xs text-gray-400 mt-0.5">Create, edit, and add content</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-300" />
        </button>

        <button
          onClick={() => navigate('/instructor/students')}
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all text-left"
        >
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">View Students</p>
            <p className="text-xs text-gray-400 mt-0.5">See enrolled students</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default InstructorDashboard;
