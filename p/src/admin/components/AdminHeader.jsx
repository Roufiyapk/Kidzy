import { FaUserCircle } from "react-icons/fa";

function AdminHeader() {
  const admin = JSON.parse(
    localStorage.getItem("admin")
  );

  return (
    <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-end items-center">

      <div className="flex items-center gap-3">

        <FaUserCircle
          size={42}
          className="text-gray-600"
        />

        <div className="text-right">
          <h3 className="font-semibold text-gray-800">
            {admin?.name || "Admin"}
          </h3>

          <p className="text-sm text-gray-500">
            {admin?.email}
          </p>

          
        </div>

      </div>

    </header>
  );
}

export default AdminHeader;