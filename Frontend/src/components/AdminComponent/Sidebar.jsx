// components/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  BarChart,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  DollarSign,
  CreditCard,
  Shield,
  Menu,
  X,
  UserCircle,
  Video,
 
} from 'lucide-react';
import { LuSlidersHorizontal } from "react-icons/lu";
import { PiChalkboard, PiStudentBold } from "react-icons/pi";
import { toast } from 'react-toastify';
import useStudentStore from '../../Store/studentstore';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useStudentStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState(''); // 'admin' or 'instructor'
  const [userAvatar, setUserAvatar] = useState('');

  // Close mobile sidebar on window resize if screen becomes desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen, setIsMobileOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  useEffect(() => {
    // Get user data from localStorage (after login)
    const getUserData = () => {
      // First check for user data from login response
      const userData = localStorage.getItem('user');
      const adminData = localStorage.getItem('admin');
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      let user = null;
      
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else if (adminData) {
        try {
          user = JSON.parse(adminData);
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }
      
      if (user) {
        // Set user role
        const role = user.role || user.userRole || 'admin';
        setUserRole(role);
        
        // Set user name based on role and available fields
        let name = '';
        if (user.name) {
          name = user.name;
        } else if (user.fullName) {
          name = user.fullName;
        } else if (user.username) {
          name = user.username;
        } else if (user.firstName) {
          name = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
        } else if (user.adminName) {
          name = user.adminName;
        } else if (user.email) {
          name = user.email.split('@')[0];
        } else {
          name = role === 'admin' ? 'Admin' : 'Instructor';
        }
        
        setUserName(name);
        
        if (user.email) {
          setUserEmail(user.email);
        }
        
        if (user.avatar || user.profilePicture) {
          setUserAvatar(user.avatar || user.profilePicture);
        }
      } else {
        setUserRole('admin');
        setUserName('Admin');
      }
    };
    
    getUserData();
  }, []);

  const getMenuItems = () => {
    const commonItems = [
      {
        name: 'Dashboard',
        path: '/admin',
        icon: LayoutDashboard,
        exact: true
      },
      {
        name: 'My Courses',
        path: '/admin/allcourses',
        icon: BookOpen,
      },
      {
        name: 'Online Classes',
        icon: Calendar,
        submenu: [
          { name: 'Class Schedule', path: '/admin/classshadule', icon: Calendar },
          { name: 'Topics', path: '/admin/topics', icon: MessageSquare },
          { name: 'Recorded Lectures', path: '/admin/classes/recordings', icon: FileText }
        ]
      },
      {
        name: 'Messages',
        path: '/admin/messages',
        icon: MessageSquare,
        badge: '3'
      }
    ];

    const adminItems = [
      {
        name: 'Student Management',
        icon: Users,
        submenu: [
          { name: 'All Students', path: '/admin/allstudent', icon: Users },
          { name: 'Student Attendance', path: '/admin/students/attendance', icon: Calendar },
          { name: 'Student Fees', path: '/admin/students/fees', icon: DollarSign }
        ]
      },
      {
        name: 'Course Management',
        icon: BookOpen,
        submenu: [
          { name: 'All Courses', path: '/admin/allcourses', icon: BookOpen },
          { name: 'Course Categories', path: '/admin/coursecategory', icon: BarChart },
          { name: 'Enrollments', path: '/admin/enrollment', icon: CreditCard }
        ]
      },
      {
        name: 'Testimonial',
        path: '/admin/testimonial',
        icon: PiStudentBold
      },
      {
        name: 'Manage Slider',
        path: '/admin/slider',
        icon: LuSlidersHorizontal
      },
      {
        name: 'Blog Management',
        icon: FileText,
        submenu: [
          { name: 'All Blogs', path: '/admin/blog', icon: FileText },
        ]
      },
      {
        name: 'Settings',
        path: '/admin/settings',
        icon: Settings
      }
    ];

    // Instructor-specific menu items
    const instructorItems = [
      {
        name: 'Student Management',
        icon: Users,
        submenu: [
          { name: 'My Students', path: '/admin/mystudents', icon: Users },
          { name: 'Attendance', path: '/admin/attendance', icon: Calendar },
        ]
      },
      {
        name: 'Content Management',
        icon: FileText,
        submenu: [
          { name: 'Upload Lectures', path: '/admin/upload-lectures', icon: Video },
          { name: 'Manage Topics', path: '/admin/manage-topics', icon: BookOpen },
          { name: 'Upload Notes', path: '/admin/upload-notes', icon: FileText },
        ]
      },
      {
        name: 'Performance',
        path: '/admin/performance',
        icon: BarChart,
      },
      {
        name: 'Settings',
        path: '/admin/settings',
        icon: Settings
      }
    ];

    if (userRole === 'admin') {
      return [...commonItems, ...adminItems];
    } else if (userRole === 'instructor') {
      return [...commonItems, ...instructorItems];
    }
    
    return commonItems;
  };

  const menuItems = getMenuItems();

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    
    logout();
    
    navigate("/stdlogin");
    
    toast.success("Logged out Successfully");
    
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isSubmenuActive = (submenuItems) => {
    return submenuItems?.some(item => location.pathname.startsWith(item.path));
  };

  // Get role badge color and icon
  const getRoleBadge = () => {
    if (userRole === 'admin') {
      return {
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        icon: Shield,
        label: 'Administrator'
      };
    } else if (userRole === 'instructor') {
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        icon: PiChalkboard,
        label: 'Instructor'
      };
    }
    return {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      icon: UserCircle,
      label: 'User'
    };
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo Section */}
        <div className={`p-6 border-b border-gray-200 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            <Link to="/admin" className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <img src="/logo.svg" alt="Logo" className="h-10 w-auto" onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=RC'; }} />
              </div>
              {!isCollapsed && (
                <div className="transition-opacity duration-300">
                  <h1 className="text-xl font-bold text-gray-900">
                    Roots Classes
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {userRole === 'admin' ? 'Admin Dashboard' : 'Instructor Portal'}
                  </p>
                </div>
              )}
            </Link>
            
            <button
              onClick={toggleCollapse}
              className={`p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex-shrink-0 ${
                isCollapsed ? 'absolute right-2 top-6' : ''
              }`}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-300">
          {menuItems.map((item, index) => (
            <div key={index} className="mb-1">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => !isCollapsed && toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between rounded-lg transition-all duration-200 ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-gray-400">
                        {openSubmenus[item.name] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    )}
                  </button>
                  
                  {!isCollapsed && openSubmenus[item.name] && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-gray-200 pl-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                            location.pathname === subItem.path
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <subItem.icon size={16} className="flex-shrink-0" />
                          <span className="truncate">{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center justify-between rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className={`px-4 py-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="relative">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCircle size={24} className="text-blue-600" />
                </div>
              )}
              {/* Role indicator dot */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                userRole === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
              }`}></div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium mt-1 ${roleBadge.bgColor} ${roleBadge.textColor}`}>
                  <RoleIcon size={10} />
                  <span>{roleBadge.label}</span>
                </div>
                {userEmail && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 ${
              isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white z-10 p-5 border-b border-gray-200 flex justify-between items-center">
          <Link to="/admin" className="flex items-center space-x-3" onClick={() => setIsMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto" onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=RC'; }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Roots Classes
              </h1>
              <p className="text-xs text-gray-500">
                {userRole === 'admin' ? 'Admin Dashboard' : 'Instructor Portal'}
              </p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile User Profile */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <UserCircle size={28} className="text-blue-600" />
                </div>
              )}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                userRole === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
              }`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate">
                {userName}
              </p>
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium mt-1 ${roleBadge.bgColor} ${roleBadge.textColor}`}>
                <RoleIcon size={10} />
                <span>{roleBadge.label}</span>
              </div>
              {userEmail && (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {userEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 py-6 px-4 pb-24">
          {menuItems.map((item, index) => (
            <div key={index} className="mb-2">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <span className="text-gray-400 transition-transform duration-200">
                      {openSubmenus[item.name] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </span>
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openSubmenus[item.name] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-9 mt-1 space-y-1 border-l border-gray-200 pl-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <subItem.icon size={16} />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Logout Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-5 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;