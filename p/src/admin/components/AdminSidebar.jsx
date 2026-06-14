import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm rounded-md transition ${
      isActive
        ? "bg-black text-white"
        : "hover:bg-gray-200 text-black"
    }`;

  return (
    <aside className="sticky top-0 h-screen w-52 bg-white text-black border-r shadow-sm flex flex-col justify-between p-4">
      
      <div>
        <h1 className="text-lg font-bold mb-6">
          Kidzy Admin
        </h1>

        <nav className="flex flex-col gap-2">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            Products
          </NavLink>

          <NavLink to="/admin/users" className={linkClass}>
            Users
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            Orders
          </NavLink>
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-black text-white py-2 rounded-md text-sm hover:bg-gray-800 transition"
      >
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;