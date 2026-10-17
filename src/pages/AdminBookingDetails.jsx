import {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Mail,
  Phone,
  Save,
  User
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import api from "../api/axios";

function AdminBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token =
    localStorage.getItem(
      "silvatattoos_admin_token"
    );

  const [booking, setBooking] =
    useState(null);

  const [status, setStatus] =
    useState("");

  const [adminNotes, setAdminNotes] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", {
        replace: true
      });

      return;
    }

    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/admin/dashboard/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data?.success) {
        throw new Error(
          "Unable to load booking."
        );
      }

      const data =
        response.data.booking;

      setBooking(data);
      setStatus(data.status);
      setAdminNotes(
        data.adminNotes || ""
      );
    } catch (requestError) {
      console.error(
        "Booking loading failed:",
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
          "Unable to load booking."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveBooking = async () => {
    if (isSaving || !status) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch(
        `/admin/dashboard/bookings/${id}/status`,
        {
          status,
          adminNotes
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      if (!response.data?.success) {
        throw new Error(
          "Unable to update booking."
        );
      }

      setBooking((current) => ({
        ...current,

        status:
          response.data.booking.status,

        adminNotes:
          response.data.booking.adminNotes,

        updatedAt:
          response.data.booking.updatedAt
      }));

      setSuccess(
        "Booking updated successfully."
      );
    } catch (requestError) {
      console.error(
        "Booking update failed:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to update booking."
      );
    } finally {
      setIsSaving(false);
    }
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
        month: "long",
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

  if (isLoading) {
    return (
      <main className="admin-dashboard">
        <div className="admin-empty-state">
          <Clock3 size={22} />
          <p>
            Loading booking...
          </p>
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="admin-dashboard">
        <Link
          to="/admin"
          className="admin-back-link"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="admin-dashboard-error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">

      <Link
        to="/admin"
        className="admin-back-link"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <section className="admin-detail-header">

        <div>
          <span className="admin-eyebrow">
            Booking / {booking.reference}
          </span>

          <h1>
            {booking.customer.fullName}
          </h1>

          <p>
            Submitted{" "}
            {formatDate(
              booking.preferredDate
            )}
          </p>
        </div>

        <span
          className={`admin-status-badge status-${booking.status}`}
        >
          {booking.status}
        </span>

      </section>

      {error && (
        <div className="admin-dashboard-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-dashboard-success">
          <Check size={17} />
          {success}
        </div>
      )}

      <section className="admin-detail-grid">

        <article className="admin-detail-card">

          <span className="admin-detail-label">
            Customer
          </span>

          <h2>
            {booking.customer.fullName}
          </h2>

          <div className="admin-contact-list">

            <a
              href={`mailto:${booking.customer.email}`}
            >
              <Mail size={15} />
              {booking.customer.email}
            </a>

            <a
              href={`tel:${booking.customer.phone}`}
            >
              <Phone size={15} />
              {booking.customer.phone}
            </a>

          </div>

        </article>

        <article className="admin-detail-card">

          <span className="admin-detail-label">
            Appointment
          </span>

          <div className="admin-appointment-info">

            <div>
              <CalendarDays size={17} />

              <span>
                {formatDate(
                  booking.preferredDate
                )}
              </span>
            </div>

            <div>
              <Clock3 size={17} />

              <span>
                {formatTime(
                  booking.preferredTime
                )}
              </span>
            </div>

          </div>

        </article>

      </section>

      <section className="admin-detail-content">

        <article className="admin-detail-card">

          <span className="admin-detail-label">
            Tattoo request
          </span>

          <div className="admin-detail-fields">

            <div>
              <span>Artist</span>
              <strong>
                {booking.artist?.name ||
                  booking.artistPreference}
              </strong>
            </div>

            <div>
              <span>Style</span>
              <strong>
                {booking.style}
              </strong>
            </div>

            <div>
              <span>Placement</span>
              <strong>
                {booking.placement}
              </strong>
            </div>

            <div>
              <span>Size</span>
              <strong>
                {booking.size}
              </strong>
            </div>

          </div>

          <div className="admin-description">

            <span>Description</span>

            <p>
              {booking.description}
            </p>

          </div>

          {booking.notes && (
            <div className="admin-description">

              <span>Customer notes</span>

              <p>
                {booking.notes}
              </p>

            </div>
          )}

        </article>

        <article className="admin-detail-card">

          <span className="admin-detail-label">
            Manage booking
          </span>

          <div className="admin-manage-form">

            <div className="form-section">

              <label htmlFor="booking-status">
                Status
              </label>

              <select
                id="booking-status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >
                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="rescheduled">
                  Rescheduled
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

            </div>

            <div className="form-section">

              <label htmlFor="admin-notes">
                Admin notes
              </label>

              <textarea
                id="admin-notes"
                rows="5"
                value={adminNotes}
                onChange={(event) =>
                  setAdminNotes(
                    event.target.value
                  )
                }
                placeholder="Add internal notes..."
              />

            </div>

            <button
              type="button"
              className="submit-button"
              onClick={saveBooking}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : "Save changes"}

              {!isSaving && (
                <Save size={17} />
              )}
            </button>

          </div>

        </article>

      </section>

      {booking.images?.length > 0 && (
        <section className="admin-reference-section">

          <div className="admin-section-heading">

            <div>
              <span className="admin-eyebrow">
                Customer references
              </span>

              <h2>
                Reference images
              </h2>
            </div>

          </div>

          <div className="admin-reference-grid">

            {booking.images.map(
              (image) => (
                <a
                  key={image.id}
                  href={image.path}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-reference-image"
                >
                  <img
                    src={image.path}
                    alt={
                      image.originalName
                    }
                  />
                </a>
              )
            )}

          </div>

        </section>
      )}

    </main>
  );
}

export default AdminBookingDetails;