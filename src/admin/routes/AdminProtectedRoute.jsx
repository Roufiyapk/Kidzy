import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  const admin = JSON.parse(
    localStorage.getItem("admin")
  );

  // Not logged in as admin
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (
    admin.role?.toLowerCase() !== "admin"
  ) {
    return <Navigate to="/" replace />;
  }

  // Admin
  return <Outlet />;
}

export default AdminProtectedRoute;