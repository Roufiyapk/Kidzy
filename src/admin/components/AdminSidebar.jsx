import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-[#5A4030] text-[#FFF9F3] font-semibold shadow-sm"
        : "text-[#5A4030] hover:bg-[#F1EAE1] hover:text-[#30251F]"
    }`;

  return (
    <aside className="sticky top-0 flex h-screen w-52 shrink-0 flex-col justify-between border-r border-[#E7DDD2] bg-[#FFF9F3] p-4 text-[#5A4030] shadow-sm">
      <div>
        <h1 className="mb-8 border-b border-[#E7DDD2] pb-5 text-xl font-bold tracking-wide text-[#5A4030]">
          Kidzy <span className="text-sm font-medium text-[#8B735F]">Admin</span>
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

          <NavLink to="/admin/reviews" className={linkClass}>
            Reviews
          </NavLink>
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-lg border border-[#5A4030] bg-[#5A4030] py-2.5 text-sm font-semibold text-[#FFF9F3] transition-colors duration-200 hover:bg-[#30251F] hover:border-[#30251F] focus:outline-none focus:ring-2 focus:ring-[#8B735F] focus:ring-offset-2"
      >
        Logout
      </button>
    </aside>
  );
}

export default AdminSidebar;