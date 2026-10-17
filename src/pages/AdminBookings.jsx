import { useEffect, useState } from "react";
import {
  CalendarDays,
  Search,
  Clock3,
  User,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const statusOptions = [
  "all",
  "pending",
  "confirmed",
  "rescheduled",
  "completed",
  "cancelled",
];

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

function formatTime(timeValue) {
  if (!timeValue) return "—";

  const [hours, minutes] = timeValue
    .slice(0, 5)
    .split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusClass(status) {
  switch (status) {
    case "confirmed":
      return "admin-status admin-status-confirmed";

    case "cancelled":
      return "admin-status admin-status-cancelled";

    case "completed":
      return "admin-status admin-status-completed";

    case "rescheduled":
      return "admin-status admin-status-rescheduled";

    default:
      return "admin-status admin-status-pending";
  }
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  const [status, setStatus] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const token = localStorage.getItem(
    "silvatattoos_admin_token"
  );

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (status !== "all") {
        params.status = status;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get(
        "/admin/dashboard/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }
      );

      setBookings(
        response.data.bookings || []
      );
    } catch (requestError) {
      console.error(
        "Load bookings error:",
        requestError
      );

      if (
        requestError.response?.status ===
          401 ||
        requestError.response?.status ===
          403
      ) {
        setError(
          "Your admin session has expired. Please log in again."
        );
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to load bookings."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [status, search]);

  function handleSearch(event) {
    event.preventDefault();

    setSearch(searchInput);
  }

  return (
    <div className="admin-page">

      <div className="admin-page-header">

        <div>
          <p className="admin-eyebrow">
            Studio
          </p>

          <h1>
            Bookings
          </h1>

          <p>
            Manage tattoo appointment
            requests and client bookings.
          </p>
        </div>

      </div>


      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}


      <div className="admin-booking-toolbar">

        <div className="admin-status-filters">

          {statusOptions.map(
            (option) => (
              <button
                key={option}
                type="button"
                className={
                  status === option
                    ? "admin-filter-button admin-filter-active"
                    : "admin-filter-button"
                }
                onClick={() =>
                  setStatus(option)
                }
              >
                {option === "all"
                  ? "All"
                  : option.charAt(0).toUpperCase() +
                    option.slice(1)}
              </button>
            )
          )}

        </div>


        <form
          className="admin-search-form"
          onSubmit={handleSearch}
        >

          <Search size={17} />

          <input
            type="search"
            placeholder="Search bookings..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
          />

          <button type="submit">
            Search
          </button>

        </form>

      </div>


      {loading ? (
        <div className="admin-empty-state">
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="admin-empty-state">

          <CalendarDays size={32} />

          <h3>
            No bookings found
          </h3>

          <p>
            There are no bookings matching
            the current filters.
          </p>

        </div>
      ) : (
        <div className="admin-bookings-list">

          {bookings.map(
            (booking) => (

              <article
                key={booking.id}
                className="admin-booking-card"
              >

                <div className="admin-booking-card-top">

                  <div>

                    <span className="admin-booking-reference">
                      {booking.booking_reference}
                    </span>

                    <h3>
                      {booking.customer_name ||
                        "Unknown customer"}
                    </h3>

                  </div>


                  <span
                    className={statusClass(
                      booking.status
                    )}
                  >
                    {booking.status}
                  </span>

                </div>


                <div className="admin-booking-card-info">

                  <div>
                    <User size={16} />

                    <span>
                      {booking.artist_name ||
                        booking.artist_preference ||
                        "Any artist"}
                    </span>
                  </div>


                  <div>
                    <CalendarDays size={16} />

                    <span>
                      {formatDate(
                        booking.preferred_date
                      )}
                    </span>
                  </div>


                  <div>
                    <Clock3 size={16} />

                    <span>
                      {formatTime(
                        booking.preferred_time
                      )}
                    </span>
                  </div>

                </div>


                <div className="admin-booking-card-bottom">

                  <div>

                    <span>
                      {booking.tattoo_style}
                    </span>

                    <span>
                      {booking.placement}
                    </span>

                    <span>
                      {booking.tattoo_size}
                    </span>

                  </div>


                  <Link
                    to={`/admin/bookings/${booking.id}`}
                    className="admin-booking-view"
                  >
                    View booking

                    <ArrowUpRight
                      size={16}
                    />
                  </Link>

                </div>

              </article>

            )
          )}

        </div>
      )}

    </div>
  );
}