import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Edit3,
  Plus,
  Trash2,
  X
} from "lucide-react";
import api from "../api/axios";

const initialForm = {
  artistId: "",
  date: "",
  startTime: "",
  endTime: "",
  isAvailable: true
};

function formatDate(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Nairobi"
  });
}

function formatTime(timeValue) {
  if (!timeValue) return "";

  const [hours, minutes] = timeValue.split(":");

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function getDateInputValue(dateValue) {
  if (!dateValue) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export default function AdminAvailability() {
  const [availability, setAvailability] = useState([]);
  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const token = localStorage.getItem("adminToken");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [availabilityResponse, artistsResponse] =
        await Promise.all([
          api.get("/admin/availability", authConfig),
          api.get("/admin/artists", authConfig)
        ]);

      setAvailability(
        availabilityResponse.data.availability || []
      );

      setArtists(
        artistsResponse.data.artists || []
      );
    } catch (requestError) {
      console.error(
        "Load availability error:",
        requestError
      );

      if (
        requestError.response?.status === 401 ||
        requestError.response?.status === 403
      ) {
        setError(
          "Your admin session has expired. Please log in again."
        );
      } else {
        setError(
          requestError.response?.data?.message ||
            "Unable to load availability."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  }

  function openCreateForm() {
    setEditingId(null);

    setForm({
      ...initialForm,
      artistId:
        artists.length > 0
          ? String(artists[0].id)
          : ""
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);

    setForm({
      artistId: item.artistId
        ? String(item.artistId)
        : "",
      date: getDateInputValue(item.date),
      startTime: item.startTime?.slice(0, 5) || "",
      endTime: item.endTime?.slice(0, 5) || "",
      isAvailable: Boolean(item.isAvailable)
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.artistId) {
      setError("Please select an artist.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError(
        "Please provide both start and end times."
      );
      return;
    }

    if (form.startTime >= form.endTime) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        artistId: Number(form.artistId),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        isAvailable: form.isAvailable
      };

      if (editingId) {
        await api.patch(
          `/admin/availability/${editingId}`,
          payload,
          authConfig
        );

        setSuccess(
          "Availability updated successfully."
        );
      } else {
        await api.post(
          "/admin/availability",
          payload,
          authConfig
        );

        setSuccess(
          "Availability created successfully."
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);

      await loadData();
    } catch (requestError) {
      console.error(
        "Save availability error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to save availability."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this availability slot?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/availability/${id}`,
        authConfig
      );

      setSuccess(
        "Availability deleted successfully."
      );

      await loadData();
    } catch (requestError) {
      console.error(
        "Delete availability error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to delete availability."
      );
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            Schedule
          </p>

          <h1>Availability</h1>

          <p>
            Manage when artists are available for
            tattoo appointments.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add Availability
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success">
          {success}
        </div>
      )}

      {loading ? (
        <div className="admin-empty-state">
          Loading availability...
        </div>
      ) : availability.length === 0 ? (
        <div className="admin-empty-state">
          <CalendarDays size={32} />

          <h3>No availability scheduled</h3>

          <p>
            Add an availability slot to start
            scheduling artists.
          </p>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add Availability
          </button>
        </div>
      ) : (
        <div className="admin-availability-list">
          {availability.map((item) => (
            <article
              key={item.id}
              className="admin-availability-card"
            >
              <div className="admin-availability-main">
                <div className="admin-availability-date">
                  <CalendarDays size={20} />

                  <div>
                    <strong>
                      {formatDate(item.date)}
                    </strong>

                    <span>
                      {item.artistName}
                    </span>
                  </div>
                </div>

                <div className="admin-availability-time">
                  <Clock3 size={18} />

                  <span>
                    {formatTime(item.startTime)}
                    {" — "}
                    {formatTime(item.endTime)}
                  </span>
                </div>

                <span
                  className={
                    item.isAvailable
                      ? "admin-status admin-status-confirmed"
                      : "admin-status admin-status-cancelled"
                  }
                >
                  {item.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>

              <div className="admin-availability-actions">
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() =>
                    openEditForm(item)
                  }
                  title="Edit availability"
                >
                  <Edit3 size={17} />
                </button>

                <button
                  type="button"
                  className="admin-icon-button admin-icon-danger"
                  onClick={() =>
                    handleDelete(item.id)
                  }
                  title="Delete availability"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <p className="admin-eyebrow">
                  Schedule
                </p>

                <h2>
                  {editingId
                    ? "Edit Availability"
                    : "Add Availability"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-icon-button"
                onClick={closeForm}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-form"
              onSubmit={handleSubmit}
            >
              <label>
                Artist
                <select
                  name="artistId"
                  value={form.artistId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select artist
                  </option>

                  {artists
                    .filter(
                      (artist) => artist.active
                    )
                    .map((artist) => (
                      <option
                        key={artist.id}
                        value={artist.id}
                      >
                        {artist.name}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="admin-form-grid">
                <label>
                  Start time
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  End time
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />

                <span>
                  Artist is available during
                  this period
                </span>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Availability"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
