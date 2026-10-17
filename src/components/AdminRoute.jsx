import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem(
    "silvatattoos_admin_token"
  );

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;