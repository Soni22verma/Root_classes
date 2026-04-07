import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useStudentStore from '../../Store/studentstore';

const Navbar = () => {
  const { student, logout } = useStudentStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Function to get display name from student data
  const getDisplayName = () => {
    if (!student) return 'User';
    
    // Check different possible name fields
    if (student.name) return student.name;
    if (student.fullName) return student.fullName;
    if (student.username) return student.username;
    if (student.firstName) {
      return student.lastName ? `${student.firstName} ${student.lastName}` : student.firstName;
    }
    
    // Extract from email if available
    if (student.email) {
      return student.email.split('@')[0];
    }
    
    return 'Student';
  };

  // Function to get display email
  const getDisplayEmail = () => {
    if (!student) return '';
    return student.email || student.emailId || '';
  };

  // Debug: Log student data to see its structure
  useEffect(() => {
    if (student) {
      console.log('Student data in Navbar:', student);
      console.log('Student name available:', student.name || student.fullName || student.username || student.firstName);
      console.log('Student email available:', student.email);
    }
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("student"); 
    
    logout();
    
    navigate("/stdlogin");
    
  
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Classroom Courses', path: '/course' },
    { name: 'Online Courses', path: '/onlinecourse' },
    { name: 'Up to 100% Scholarship', path: '/schollarship' },
    { name: 'Career', path: '/career' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold">
                <span className="text-red-500">Roots</span>
                <span className="text-blue-400"> Classes</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative group text-gray-700 font-medium hover:text-blue-500"
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            {student ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition group"
                >
                  <User size={18} className="text-indigo-600" />
                  <span className="text-gray-700 font-medium max-w-[150px] truncate">
                    {getDisplayName()}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fadeIn">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {getDisplayName()}
                          </p>
                          {getDisplayEmail() && (
                            <p className="text-sm text-gray-500 truncate">
                              {getDisplayEmail()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition group"
                      >
                        <LayoutDashboard size={18} className="text-gray-500 group-hover:text-indigo-600" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/stdprofile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition group"
                      >
                        <UserCircle size={18} className="text-gray-500 group-hover:text-indigo-600" />
                        <span>My Profile</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/stdlogin">
                  <button className="ml-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
                    Login
                  </button>
                </Link>

                <Link to="/stdregister">
                  <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-indigo-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-700 hover:text-indigo-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {student ? (
                <>
                  <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <User size={18} className="text-indigo-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium truncate">
                        {getDisplayName()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile Dropdown Items */}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    to="/stdprofile"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 bg-red-500 text-white px-5 py-2 rounded-lg w-full hover:bg-red-600 transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/stdlogin" onClick={() => setIsMenuOpen(false)}>
                    <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg w-full">
                      Login
                    </button>
                  </Link>

                  <Link to="/stdregister" onClick={() => setIsMenuOpen(false)}>
                    <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg w-full">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;