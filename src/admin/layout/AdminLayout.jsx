import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F1EAE1]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
