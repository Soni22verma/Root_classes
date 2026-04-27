import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import api from '../../services/adminendpoint';
import Loader from '../../components/AdminComponent/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    approvedCourses: 0,
    pendingCourses: 0,
    monthlyRegistration: [],
    courseEnrollment: [],
    courseStatusData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
          axios.post(api.admin.getStudents),
          axios.get(api.fullcourse.getfullcourse),
          axios.get(api.enroll.getpurchesCourse)
        ]);

        const students = studentsRes.data?.data || [];
        const courses = coursesRes.data?.data || coursesRes.data || [];
        const enrollments = enrollmentsRes.data?.data || [];

        // 1. Process Monthly Registration Graph
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const registrationMap = {};
        
        // Initialize last 6 months with 0
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          registrationMap[monthNames[d.getMonth()]] = 0;
        }

        students.forEach(student => {
          if (student.createdAt) {
            const date = new Date(student.createdAt);
            const month = monthNames[date.getMonth()];
            if (registrationMap[month] !== undefined) {
              registrationMap[month]++;
            }
          }
        });

        const monthlyRegistration = Object.keys(registrationMap).map(name => ({
          name,
          students: registrationMap[name]
        }));

        // 2. Process Course-wise Enrollment Graph
        const enrollmentMap = {};
        enrollments.forEach(enroll => {
          const title = enroll.course?.title || 'Unknown';
          enrollmentMap[title] = (enrollmentMap[title] || 0) + 1;
        });

        const courseEnrollment = Object.keys(enrollmentMap)
          .map(name => ({ name, count: enrollmentMap[name] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8); // Top 8 courses

        // 3. Process Course Approval Status Graph
        const statusMap = { approved: 0, pending: 0, rejected: 0 };
        courses.forEach(course => {
          const status = (course.status || 'pending').toLowerCase();
          if (statusMap[status] !== undefined) {
            statusMap[status]++;
          }
        });

        const courseStatusData = [
          { name: 'Approved', value: statusMap.approved, color: '#10B981' },
          { name: 'Pending', value: statusMap.pending, color: '#F59E0B' },
          { name: 'Rejected', value: statusMap.rejected, color: '#EF4444' }
        ];

        setStats({
          totalStudents: students.length,
          totalCourses: courses.length,
          approvedCourses: statusMap.approved,
          pendingCourses: statusMap.pending,
          monthlyRegistration,
          courseEnrollment,
          courseStatusData
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader message="Analyzing Data..." />;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-poppins">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500 font-medium">Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={<Users className="text-blue-600" />} 
          bgColor="bg-blue-50"
          trend="+12% from last month"
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon={<BookOpen className="text-purple-600" />} 
          bgColor="bg-purple-50"
          trend="Total uploaded"
        />
        <StatCard 
          title="Approved Courses" 
          value={stats.approvedCourses} 
          icon={<CheckCircle className="text-emerald-600" />} 
          bgColor="bg-emerald-50"
          trend="Active on platform"
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pendingCourses} 
          icon={<Clock className="text-amber-600" />} 
          bgColor="bg-amber-50"
          trend="Requires review"
        />
      </div>

      {/* Main Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Registration Graph */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm shadow-blue-900/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">Student Registrations</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRegistration}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course-wise Enrollment Graph */}
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm shadow-blue-900/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-xl">
                <BarChart3 size={20} className="text-purple-600" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">Popular Courses</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.courseEnrollment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} 
                  width={120}
                />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Approval Status */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm shadow-blue-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <PieChartIcon size={20} className="text-emerald-600" />
            </div>
            <h3 className="font-black text-gray-900 text-lg">Course Status</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.courseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.courseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary / Platform Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm shadow-blue-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Layers size={20} className="text-slate-600" />
            </div>
            <h3 className="font-black text-gray-900 text-lg">Platform Highlights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-gray-50 bg-gray-50/30">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Registration Velocity</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{stats.monthlyRegistration.slice(-1)[0]?.students || 0}</span>
                <span className="text-xs font-bold text-blue-600">New this month</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{width: '65%'}}></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-50 bg-gray-50/30">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Approval Rate</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">
                  {stats.totalCourses ? Math.round((stats.approvedCourses / stats.totalCourses) * 100) : 0}%
                </span>
                <span className="text-xs font-bold text-emerald-600">Quality score</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{width: `${stats.totalCourses ? (stats.approvedCourses / stats.totalCourses) * 100 : 0}%`}}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-5 rounded-2xl bg-indigo-600 text-white flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-lg font-black mb-1">Scale Your Platform</h4>
              <p className="text-indigo-100 text-sm opacity-80">You have {stats.pendingCourses} courses waiting for review. Processing them will increase your course library by {Math.round((stats.pendingCourses / stats.totalCourses) * 100 || 0)}%.</p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
               <TrendingUp size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, trend }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm shadow-blue-900/5 transition-all hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${bgColor}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
    </div>
    <div>
      <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-3xl font-black text-gray-900 mb-2">{value}</div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{trend}</p>
    </div>
  </div>
);

export default Dashboard;
