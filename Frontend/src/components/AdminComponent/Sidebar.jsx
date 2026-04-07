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
  UserCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import useStudentStore from '../../Store/studentstore';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useStudentStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    // Get admin data from localStorage
    const adminData = localStorage.getItem('admin');
    console.log('Admin Data from localStorage:', adminData); // Debug log
    
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        console.log('Parsed Admin Data:', admin); // Debug log
        
        // Try different possible name fields
        let name = '';
        if (admin.name) {
          name = admin.name;
        } else if (admin.fullName) {
          name = admin.fullName;
        } else if (admin.username) {
          name = admin.username;
        } else if (admin.firstName) {
          name = admin.lastName ? `${admin.firstName} ${admin.lastName}` : admin.firstName;
        } else if (admin.adminName) {
          name = admin.adminName;
        } else if (admin.email) {
          // Use email prefix as fallback
          name = admin.email.split('@')[0];
        } else {
          name = 'Admin';
        }
        
        setAdminName(name);
        
        // Set email if available
        if (admin.email) {
          setAdminEmail(admin.email);
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        setAdminName('Admin');
      }
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'admin' || user.isAdmin) {
            let name = user.name || user.fullName || user.username || 'Admin';
            setAdminName(name);
            if (user.email) setAdminEmail(user.email);
          } else {
            setAdminName('Admin');
          }
        } catch (error) {
          setAdminName('Admin');
        }
      } else {
        setAdminName('Admin');
      }
    }
  }, []);

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

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
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
        { name: 'Create Course', path: '/admin/createcourse', icon: GraduationCap },
        { name: 'Course Categories', path: '/admin/courses/categories', icon: BarChart },
        { name: 'Enrollments', path: '/admin/enrollment', icon: CreditCard }
      ]
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
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChart
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: MessageSquare,
      badge: '3'
    },
    {
      name: 'Blog Management',
      icon: FileText,
      submenu: [
        { name: 'All Blogs', path: '/admin/blog', icon: FileText },
        // { name: 'Add New Post', path: '/admin/blog/add', icon: GraduationCap },
        // { name: 'Categories', path: '/admin/blog/categories', icon: BarChart },
        // { name: 'Comments', path: '/admin/blog/comments', icon: MessageSquare }
      ]
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const isSubmenuActive = (submenuItems) => {
    return submenuItems?.some(item => location.pathname.startsWith(item.path));
  };

  return (
    <>
      <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        
        <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-4' : ''}`}>
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-xl font-bold text-gray-900">
                  Roots Classes
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
              </div>
            )}
          </Link>
          
          <button
            onClick={toggleCollapse}
            className={`absolute top-6 right-4 p-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition ${
              isCollapsed ? 'right-2' : 'right-4'
            }`}
          >
            <Menu size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          {menuItems.map((item, index) => (
            <div key={index} className="mb-2">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => !isCollapsed && toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      openSubmenus[item.name] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )
                    )}
                  </button>
                  
                  {!isCollapsed && openSubmenus[item.name] && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                            location.pathname === subItem.path
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <subItem.icon size={16} />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
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

        {/* Admin Profile Section */}
        <div className={`px-4 py-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle size={24} className="text-gray-600" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {adminName}
                </p>
                {adminEmail && (
                  <p className="text-xs text-gray-500 truncate">
                    {adminEmail}
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <Link to="/admin" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                  <Shield size={22} className="text-gray-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Roots Classes
                  </h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Admin Profile */}
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircle size={24} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {adminName}
                  </p>
                  {adminEmail && (
                    <p className="text-xs text-gray-500 truncate">
                      {adminEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 py-6 px-4">
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
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {openSubmenus[item.name] ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                      
                      {openSubmenus[item.name] && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.submenu.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              onClick={() => setIsMobileOpen(false)}
                            >
                              <subItem.icon size={16} />
                              <span>{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
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

            {/* Mobile Logout */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default AdminSidebar;