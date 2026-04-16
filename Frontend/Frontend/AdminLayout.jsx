// components/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from '../Frontend/src/components/AdminComponent/Sidebar'

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="lg:ml-72">
        <main className="p-6">
          <Outlet /> {/* Yahan par nested routes render honge */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;