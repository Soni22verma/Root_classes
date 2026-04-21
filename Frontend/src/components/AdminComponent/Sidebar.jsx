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
  Shield,
  Menu,
  X,
  UserCircle,
  Video,
  Sparkles,
} from 'lucide-react';
import { LuSlidersHorizontal } from "react-icons/lu";
import { PiChalkboard, PiStudentBold } from "react-icons/pi";
import { SiTestcafe } from "react-icons/si";
import { toast } from 'react-toastify';
import useStudentStore from '../../Store/studentstore';
import NotificationDropdown from '../Notification/NotificationDropdown';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, student } = useStudentStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', role: '', avatar: '' });

  useEffect(() => {
    const user = student || JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('student'));
    if (user) {
      setUserData({
        name: user.name || user.fullName || user.username || 'User',
        email: user.email || '',
        role: user.role || user.userRole || 'student',
        avatar: user.avatar || user.profilePicture || ''
      });
    }
  }, [student]);

  const toggleSubmenu = (menuName) => setOpenSubmenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const isActive = (path) => (path === '/admin' || path === '/instructor/dashboard') ? location.pathname === path : location.pathname.startsWith(path);

  const menuItems = userData.role === 'admin' ? [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Course Manager', icon: BookOpen, submenu: [
        { name: 'All Courses', path: '/admin/allcourses', icon: BookOpen },
        { name: 'Categories', path: '/admin/coursecategory', icon: BarChart },
        { name: 'Enrollments', path: '/admin/enrollment', icon: Sparkles }
    ]},
    { name: 'Testimonials', path: '/admin/testimonial', icon: PiStudentBold },
    { name: 'UI Controls', path: '/admin/slider', icon: LuSlidersHorizontal },
    { name: 'Blogs', path: '/admin/blog', icon: FileText },
    { name: 'Admissions', path: '/admin/createtest', icon: SiTestcafe },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ] : [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { name: 'Students', path: '/instructor/students', icon: Users },
    { name: 'Settings', path: '/instructor/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    logout();
    navigate("/stdlogin");
    toast.success("Logged out Successfully");
  };

  return (
    <>
      {/* Mobile Trigger */}
      <button onClick={() => setIsMobileOpen(true)} className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-white border border-gray-100 lg:hidden shadow-sm">
        <Menu size={20} />
      </button>

      {/* Sidebar Shell */}
      <aside className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} hidden lg:flex`}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-50">
          <Link to="/" className="flex items-center gap-3">
             <img src="/logo.svg" alt="Roots" className="h-8 w-auto flex-shrink-0" />
             {!isCollapsed && (
               <div className="animate-fadeIn">
                  <h1 className="text-sm font-black text-gray-900 leading-none">Roots Classes</h1>
                  <p className="text-[9px] font-bold text-[#FB0500] uppercase tracking-widest mt-1">{userData.role}</p>
               </div>
             )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              {item.submenu ? (
                <div>
                   <button onClick={() => !isCollapsed && toggleSubmenu(item.name)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isActive(item.path) ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <item.icon size={18} className={isActive(item.path) ? 'text-[#0078FF]' : ''} />
                        {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">{item.name}</span>}
                      </div>
                      {!isCollapsed && <ChevronRight size={14} className={`transition-transform ${openSubmenus[item.name] ? 'rotate-90' : ''}`} />}
                   </button>
                   {!isCollapsed && openSubmenus[item.name] && (
                     <div className="mt-1 ml-4 border-l border-gray-100 pl-4 space-y-1 animate-fadeIn">
                        {item.submenu.map((sub, sIdx) => (
                          <Link key={sIdx} to={sub.path} className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-bold transition-all ${location.pathname === sub.path ? 'text-[#0078FF] bg-blue-50/50' : 'text-gray-400 hover:text-gray-900'}`}>
                             <sub.icon size={14} />
                             {sub.name}
                          </Link>
                        ))}
                     </div>
                   )}
                </div>
              ) : (
                <Link to={item.path} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive(item.path) ? 'bg-[#0078FF]/5 text-[#0078FF]' : 'text-gray-500 hover:bg-gray-50'}`}>
                   <item.icon size={18} />
                   {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-50">
           <div className={`flex items-center gap-3 p-2 rounded-2xl bg-gray-50/50 border border-gray-100 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                 {userData.avatar ? <img src={userData.avatar} alt="" className="w-full h-full object-cover" /> : <UserCircle size={20} className="text-gray-300" />}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 animate-fadeIn">
                   <p className="text-xs font-black text-gray-900 truncate uppercase">{userData.name}</p>
                   <p className="text-[9px] font-bold text-gray-400 truncate">{userData.email}</p>
                </div>
              )}
           </div>
           <button onClick={handleLogout} className={`w-full flex items-center gap-3 p-3 mt-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
              <LogOut size={18} />
              {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Logout</span>}
           </button>
        </div>
      </aside>

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default AdminSidebar;