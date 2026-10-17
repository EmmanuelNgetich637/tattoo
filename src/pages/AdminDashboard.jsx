import {
  useEffect,
  useState
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  RefreshCw,
  Users,
  XCircle
} from "lucide-react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const token =
    localStorage.getItem(
      "silvatattoos_admin_token"
    );

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", {
        replace: true
      });

      return;
    }

    const storedAdmin =
      localStorage.getItem(
        "silvatattoos_admin"
      );

    if (storedAdmin) {
      try {
        setAdmin(
          JSON.parse(storedAdmin)
        );
      } catch {
        localStorage.removeItem(
          "silvatattoos_admin"
        );
      }
    }

    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [
        statsResponse,
        bookingsResponse
      ] = await Promise.all([
        api.get(
          "/admin/dashboard/stats",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        ),

        api.get(
          "/admin/dashboard/recent-bookings",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        )
      ]);

      if (
        !statsResponse.data?.success ||
        !bookingsResponse.data?.success
      ) {
        throw new Error(
          "Unable to load dashboard data."
        );
      }

      setStats(
        statsResponse.data.stats
      );

      setBookings(
        bookingsResponse.data.bookings || []
      );
    } catch (requestError) {
      console.error(
        "Dashboard loading failed:",
        requestError
      );

      if (
        requestError.response?.status === 401 ||
        requestError.response?.status === 403
      ) {
        localStorage.removeItem(
          "silvatattoos_admin_token"
        );

        localStorage.removeItem(
          "silvatattoos_admin"
        );

        navigate("/admin/login", {
          replace: true
        });

        return;
      }

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "silvatattoos_admin_token"
    );

    localStorage.removeItem(
      "silvatattoos_admin"
    );

    navigate("/admin/login", {
      replace: true
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };

  return (
    <main className="admin-dashboard">

      <section className="admin-dashboard-header">

        <div>
          <span className="admin-eyebrow">
            SilvaTattoos / Admin
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            {admin?.fullName || "Admin"}.
          </p>
        </div>

        <div className="admin-dashboard-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadDashboard}
            disabled={isLoading}
          >
            <RefreshCw
              size={16}
              className={
                isLoading
                  ? "admin-refresh-spinning"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            Sign out
          </button>

        </div>

      </section>

      {error && (
        <div className="admin-dashboard-error">

          <XCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}

      <section className="admin-dashboard-grid">

        <article className="admin-stat-card">

          <span>
            Total bookings
          </span>

          <strong>
            {isLoading
              ? "—"
              : stats?.totalBookings ?? 0}
          </strong>

          <small>
            All booking requests
          </small>

        </article>

        <article className="admin-stat-card">

          <span>
            Pending
          </span>

          <strong>
            {isLoading
              ? "—"
              : stats?.pendingBookings ?? 0}
          </strong>

          <small>
            Awaiting review
          </small>

        </article>

        <article className="admin-stat-card">

          <span>
            Confirmed
          </span>

          <strong>
            {isLoading
              ? "—"
              : stats?.confirmedBookings ?? 0}
          </strong>

          <small>
            Confirmed appointments
          </small>

        </article>

        <article className="admin-stat-card">

          <span>
            Artists
          </span>

          <strong>
            {isLoading
              ? "—"
              : stats?.totalArtists ?? 0}
          </strong>

          <small>
            Active artists
          </small>

        </article>

      </section>

      <section className="admin-bookings-section">

        <div className="admin-section-heading">

          <div>

            <span className="admin-eyebrow">
              Recent activity
            </span>

            <h2>
              Bookings
            </h2>

          </div>

          <span className="admin-booking-count">
            {bookings.length} shown
          </span>

        </div>

        {isLoading ? (

          <div className="admin-empty-state">

            <RefreshCw
              size={20}
              className="admin-refresh-spinning"
            />

            <p>
              Loading bookings...
            </p>

          </div>

        ) : bookings.length === 0 ? (

          <div className="admin-empty-state">

            <CalendarDays size={22} />

            <p>
              No bookings have been submitted yet.
            </p>

          </div>

        ) : (

          <div className="admin-bookings-list">

            {bookings.map((booking) => (

              <Link
                key={booking.id}
                to={`/admin/bookings/${booking.id}`}
                className="admin-booking-card"
              >

                <div className="admin-booking-main">

                  <div className="admin-booking-reference">

                    <span>
                      Reference
                    </span>

                    <strong>
                      {booking.reference}
                    </strong>

                  </div>

                  <div className="admin-booking-customer">

                    <strong>
                      {booking.customer?.fullName}
                    </strong>

                    <span>
                      {booking.customer?.email}
                    </span>

                    <span>
                      {booking.customer?.phone}
                    </span>

                  </div>

                  <div className="admin-booking-details">

                    <span>

                      <Users size={14} />

                      {booking.artist ||
                        booking.artistPreference}

                    </span>

                    <span>
                      {booking.style}
                    </span>

                    <span>
                      {booking.placement}
                    </span>

                    <span>
                      {booking.size}
                    </span>

                  </div>

                  <div className="admin-booking-date">

                    <span>

                      <CalendarDays size={14} />

                      {formatDate(
                        booking.preferredDate
                      )}

                    </span>

                    <span>

                      <Clock3 size={14} />

                      {formatTime(
                        booking.preferredTime
                      )}

                    </span>

                  </div>

                </div>

                <div className="admin-booking-status">

                  <span
                    className={
                      `admin-status-badge status-${booking.status}`
                    }
                  >
                    {booking.status}
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

      <section className="admin-dashboard-summary">

        <div className="admin-summary-item">

          <CheckCircle2 size={18} />

          <div>

            <span>
              Completed
            </span>

            <strong>
              {stats?.completedBookings ?? 0}
            </strong>

          </div>

        </div>

        <div className="admin-summary-item">

          <Clock3 size={18} />

          <div>

            <span>
              Rescheduled
            </span>

            <strong>
              {stats?.rescheduledBookings ?? 0}
            </strong>

          </div>

        </div>

        <div className="admin-summary-item">

          <XCircle size={18} />

          <div>

            <span>
              Cancelled
            </span>

            <strong>
              {stats?.cancelledBookings ?? 0}
            </strong>

          </div>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;