import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

function AdminLayout() {

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}

      <AdminSidebar />

      {/* RIGHT SIDE */}

      
  <div className="flex-1">
        <AdminHeader />
        

        {/* PAGE CONTENT */}

        <main className="p-6 flex-1">

          <Outlet />

        </main>

      </div>

    </div>
  );
}

export default AdminLayout;