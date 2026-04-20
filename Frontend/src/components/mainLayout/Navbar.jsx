import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, UserCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useStudentStore from '../../Store/studentstore';
import { SiCoursera } from 'react-icons/si';
import NotificationDropdown from '../Notification/NotificationDropdown';

const navItems = [
  { name: 'Courses',            path: '/course' },
  { name: '100% Scholarship',   path: '/schollarship' },
  { name: 'Test Series',        path: '/test' },
  { name: 'Blog',               path: '/blog' },
  { name: 'Contact',            path: '/contact' },
];

const Navbar = () => {
  const { student, logout, setStudent } = useStudentStore();
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [scrolled,       setScrolled]       = useState(false);
  const navigate    = useNavigate();
  const location    = useLocation();
  const dropdownRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* auth check */
  useEffect(() => {
    const check = () => {
      if (student && (student._id || student.id)) { setIsLoggedIn(true); return; }
      try {
        const s = localStorage.getItem('student');
        if (s) { const p = JSON.parse(s); if (p?._id || p?.id) { setIsLoggedIn(true); if (!student && setStudent) setStudent(p); return; } }
        const u = localStorage.getItem('user');
        if (u) { const p = JSON.parse(u); if (p?._id || p?.id) { setIsLoggedIn(true); return; } }
      } catch {}
      setIsLoggedIn(false);
    };
    check();
  }, [student, setStudent]);

  /* click outside */
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const getName = () => {
    if (student?.fullName)  return student.fullName;
    if (student?.name)      return student.name;
    try {
      const s = JSON.parse(localStorage.getItem('student') || '{}');
      return s.fullName || s.name || s.username || s.email?.split('@')[0] || 'Student';
    } catch { return 'Student'; }
  };

  const getEmail = () => {
    if (student?.email) return student.email;
    try { return JSON.parse(localStorage.getItem('student') || '{}').email || ''; } catch { return ''; }
  };

  const isAdminOrInstructor = () => ['admin', 'instructor'].includes(student?.role);
  const isStudent = () => student?.role === 'student' || (!student?.role && isLoggedIn);

  const handleLogout = () => {
    ['user','student','token','authToken','studentToken'].forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
    logout?.();
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/stdlogin');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#0a0a0a] text-center py-2 px-4 text-xs text-gray-400">
        🎯 Admissions open for 2025-26 batch —{' '}
        <Link to="/schollarship" className="text-[#00BFFE] hover:underline font-medium">Apply for 100% Scholarship →</Link>
      </div>

      {/* Main Navbar */}
      <nav className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-[0_1px_20px_rgba(0,0,0,0.08)]' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img src="/logo.svg" alt="Roots Classes" className="h-9 w-auto" />
              <div className="leading-tight">
                <span className="text-lg font-black text-[#FB0500] tracking-tight">Roots</span>
                <span className="text-lg font-black text-[#0a0a0a] tracking-tight"> Classes</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-[#FB0500] bg-red-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <NotificationDropdown />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-colors text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#FB0500] flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-white" />
                      </div>
                      <span className="text-gray-700 font-medium max-w-[120px] truncate">{getName()}</span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#FB0500] rounded-full flex items-center justify-center">
                              <User size={16} className="text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{getName()}</p>
                              {getEmail() && <p className="text-xs text-gray-400 truncate">{getEmail()}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          {isAdminOrInstructor() && (
                            <button onClick={() => { navigate('/admin/'); setIsDropdownOpen(false); }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <LayoutDashboard size={16} className="text-gray-400" />Dashboard
                            </button>
                          )}
                          {isStudent() && (
                            <>
                              <button onClick={() => { navigate('/stdprofile'); setIsDropdownOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <UserCircle size={16} className="text-gray-400" />My Profile
                              </button>
                              <button onClick={() => { navigate('/purchescourse'); setIsDropdownOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                <SiCoursera size={16} className="text-gray-400" />My Courses
                              </button>
                            </>
                          )}
                        </div>
                        <div className="border-t border-gray-100 pt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={16} />Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/stdlogin">
                    <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-[#0078FF] hover:bg-[#0066DD] rounded-xl transition-colors shadow-sm shadow-blue-200">
                      Sign Up Free
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.path) ? 'text-[#FB0500] bg-red-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-2 pt-3 border-t border-gray-100">
                {isLoggedIn ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 bg-[#FB0500] rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getName()}</p>
                        {getEmail() && <p className="text-xs text-gray-400">{getEmail()}</p>}
                      </div>
                    </div>
                    {isAdminOrInstructor() && (
                      <Link to="/admin/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard size={16} className="text-gray-400" />Dashboard
                      </Link>
                    )}
                    {isStudent() && (
                      <>
                        <Link to="/stdprofile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                          <UserCircle size={16} className="text-gray-400" />My Profile
                        </Link>
                        <Link to="/purchescourse" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">
                          <SiCoursera size={16} className="text-gray-400" />My Courses
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={16} />Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 px-1">
                    <Link to="/stdlogin" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl">Login</button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full py-2.5 text-sm font-semibold text-white bg-[#0078FF] rounded-xl">Sign Up Free</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
