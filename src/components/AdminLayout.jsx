import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Clock3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Bookings",
    path: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    label: "Artists",
    path: "/admin/artists",
    icon: Users,
  },
  {
    label: "Availability",
    path: "/admin/availability",
    icon: Clock3,
  },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const admin = JSON.parse(
    localStorage.getItem("silvatattoos_admin") || "null"
  );

  function handleLogout() {
    localStorage.removeItem("silvatattoos_admin_token");
    localStorage.removeItem("silvatattoos_admin");
    navigate("/admin/login");
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="admin-shell">
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`admin-sidebar ${
          mobileOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div>
            <div className="admin-logo">SilvaTattoos</div>
            <span>Studio Admin</span>
          </div>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={closeMobileMenu}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-navigation">
          <p className="admin-nav-label">Manage</p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive ? "admin-nav-link-active" : ""
                  }`
                }
                onClick={closeMobileMenu}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {(admin?.fullName || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-info">
              <strong>
                {admin?.fullName || "Administrator"}
              </strong>

              <span>
                {admin?.role || "admin"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-mobile-header">
          <div className="admin-logo">
            SilvaTattoos
          </div>

          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}