import { FaUserCircle } from "react-icons/fa";

function AdminHeader() {
  const admin = JSON.parse(localStorage.getItem("admin") || "null");

  return (
    <header className="flex items-center justify-end border-b border-[#E7DDD2] bg-[#FFF9F3] px-4 py-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-3">
        <FaUserCircle size={42} className="shrink-0 text-[#5A4030]" />
        <div className="text-right">
          <h3 className="font-semibold text-[#30251F]">
            {admin?.name || "Admin"}
          </h3>
          {admin?.email && (
            <p className="break-all text-sm text-[#806B5B]">{admin.email}</p>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
