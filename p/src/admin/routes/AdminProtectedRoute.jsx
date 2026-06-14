import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {

  const admin = JSON.parse(
    localStorage.getItem("admin")
  );

  return admin?.role === "admin"
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

export default AdminProtectedRoute;