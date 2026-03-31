// components/AdminNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  Search,
  Moon,
  Sun,



  BookOpen,
  Calendar
} from 'lucide-react';

const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [admin, setAdmin] = useState(null); 
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const loadAdminData = () => {
      try {
        const adminData = localStorage.getItem('admin');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          setAdmin(parsedAdmin);
          console.log('Admin data loaded:', parsedAdmin); 
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };
    
    loadAdminData();
    
    window.addEventListener('storage', loadAdminData);
    return () => window.removeEventListener('storage', loadAdminData);
  }, []);

  const getAdminName = () => {
    if (!admin) return 'Admin';
    
    if (admin.name) return admin.name;
    if (admin.fullName) return admin.fullName;
    if (admin.username) return admin.username;
    if (admin.firstName) {
      return admin.lastName ? `${admin.firstName} ${admin.lastName}` : admin.firstName;
    }
    if (admin.email) return admin.email.split('@')[0];
    
    return 'Admin';
  };

  const getAdminEmail = () => {
    if (!admin) return 'admin@rootsclasses.com';
    return admin.email || admin.emailId || 'admin@rootsclasses.com';
  };

  const getAdminRole = () => {
    if (!admin) return 'Administrator';
    return admin.role || admin.roleName || 'Administrator';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
   
    localStorage.removeItem('token'); 
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('rememberAdmin');
    
   
    setAdmin(null);
    navigate('/');
    console.log('Admin logged out successfully');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching:', searchQuery);
    // Implement search functionality here
  };

  const notifications = [
    { id: 1, title: 'New Student Registration', message: '5 students registered today', time: '5 min ago', read: false },
    { id: 2, title: 'Course Update', message: 'NEET materials updated', time: '1 hour ago', read: false },
    { id: 3, title: 'Payment Received', message: '₹25,000 received', time: '3 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Quick stats for navbar
  const quickStats = [
    { label: 'Total Students', value: '1,234', icon: Users, color: 'text-blue-400' },
    { label: 'Active Courses', value: '24', icon: BookOpen, color: 'text-green-400' },
    { label: 'Today\'s Classes', value: '8', icon: Calendar, color: 'text-purple-400' }
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Menu size={22} />
            </button>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search students, courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 lg:w-96 px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>
            </div>

            {/* Quick Stats - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 ml-4">
              {quickStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Icon size={16} className={stat.color} />
                    <div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{stat.value}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button className="text-xs text-purple-600 hover:text-purple-700">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link to="/admin/notifications" className="text-sm text-purple-600 hover:text-purple-700">View all</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                  {admin?.avatar ? (
                    <img src={admin.avatar} alt={getAdminName()} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {getAdminName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getAdminRole()}
                  </p>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{getAdminName()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{getAdminEmail()}</p>
                        <span className="inline-block text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full mt-1">
                          {getAdminRole()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link to="/admin/profile" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsProfileDropdownOpen(false)}>
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/admin/settings" className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setIsProfileDropdownOpen(false)}>
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 pb-2">
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }} 
                      className="flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search students, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Mobile Quick Stats */}
        <div className="lg:hidden py-3 border-t border-gray-200 dark:border-gray-700 flex justify-around">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex items-center space-x-2">
                <Icon size={16} className={stat.color} />
                <div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{stat.value}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;