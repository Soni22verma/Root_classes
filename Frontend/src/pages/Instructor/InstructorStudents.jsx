import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/adminendpoint';
import { Users, Search, Mail, Phone, BookOpen } from 'lucide-react';

const InstructorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.post(api.admin.getStudents);
        setStudents(res.data.data || []);
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.fullName || s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const initials = (s) => {
    const n = s.fullName || s.name || '?';
    return n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500 mt-0.5">{students.length} registered student{students.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search */}
      <div className="relative mb-5 w-full sm:max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Users size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No students found</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {filtered.map((student, idx) => (
              <div key={student._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative flex flex-col gap-3">
                <span className="absolute top-4 right-4 text-xs font-semibold text-gray-400">#{idx + 1}</span>
                
                <div className="flex items-center gap-3 pr-8">
                  {student.profileImage ? (
                    <img src={student.profileImage} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {initials(student)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{student.fullName || student.name}</p>
                    {student.class && <p className="text-xs text-gray-400 mt-0.5">Class {student.class}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  {student.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg col-span-2 sm:col-span-1">
                      <Mail size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg col-span-2 sm:col-span-1">
                      <Phone size={12} className="text-gray-400 flex-shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    <BookOpen size={12} className="text-gray-400" />
                    {student.enrolledCourses?.length || 0} Courses
                  </span>
                  
                  <button
                    onClick={() => setSelected(student)}
                    className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">#</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Student</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Phone</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Courses</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student, idx) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {student.profileImage ? (
                          <img src={student.profileImage} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(student)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.fullName || student.name}</p>
                          {student.class && <p className="text-xs text-gray-400">Class {student.class}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{student.email || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{student.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen size={12} />
                        {student.enrolledCourses?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelected(student)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="bg-blue-50 p-6 text-center flex-shrink-0">
              {selected.profileImage ? (
                <img src={selected.profileImage} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {initials(selected)}
                </div>
              )}
              <h3 className="text-base font-bold text-gray-900">{selected.fullName || selected.name}</h3>
              {selected.class && <p className="text-sm text-gray-500 mt-0.5">Class {selected.class}</p>}
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              {selected.email && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail size={15} className="text-gray-400" />
                  {selected.email}
                </div>
              )}
              {selected.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone size={15} className="text-gray-400" />
                  {selected.phone}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <BookOpen size={15} className="text-gray-400" />
                {selected.enrolledCourses?.length || 0} enrolled course{selected.enrolledCourses?.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setSelected(null)}
                className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;
