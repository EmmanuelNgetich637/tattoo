import { useEffect, useState } from "react";
import {
  Edit3,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import api from "../api/axios";

const styleOptions = [
  "Blackwork",
  "Fine Line",
  "Realism",
  "Japanese",
];

const initialForm = {
  name: "",
  bio: "",
  styles: [],
  active: true,
};

export default function AdminArtists() {
  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] =
    useState(initialForm);

  const token = localStorage.getItem(
    "silvatattoos_admin_token"
  );

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  async function loadArtists() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/artists",
        authConfig
      );

      setArtists(
        response.data.artists || []
      );
    } catch (requestError) {
      console.error(
        "Load artists error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load artists."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArtists();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm({
      ...initialForm,
      styles: [],
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(artist) {
    setEditingId(artist.id);

    setForm({
      name: artist.name || "",
      bio: artist.bio || "",
      styles: artist.styles || [],
      active: Boolean(artist.active),
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

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function toggleStyle(style) {
    setForm((current) => ({
      ...current,
      styles: current.styles.includes(style)
        ? current.styles.filter(
            (item) => item !== style
          )
        : [
            ...current.styles,
            style,
          ],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Artist name is required.");
      return;
    }

    if (form.styles.length === 0) {
      setError(
        "Select at least one tattoo style."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        styles: form.styles,
        active: form.active,
      };

      if (editingId) {
        await api.patch(
          `/admin/artists/${editingId}`,
          payload,
          authConfig
        );

        setSuccess(
          "Artist updated successfully."
        );
      } else {
        await api.post(
          "/admin/artists",
          payload,
          authConfig
        );

        setSuccess(
          "Artist created successfully."
        );
      }

      closeForm();
      await loadArtists();
    } catch (requestError) {
      console.error(
        "Save artist error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to save artist."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(artist) {
    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/artists/${artist.id}`,
        {
          name: artist.name,
          bio: artist.bio || "",
          styles: artist.styles || [],
          active: !artist.active,
        },
        authConfig
      );

      setSuccess(
        `${artist.name} is now ${
          artist.active
            ? "inactive"
            : "active"
        }.`
      );

      await loadArtists();
    } catch (requestError) {
      console.error(
        "Toggle artist error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to update artist."
      );
    }
  }

  async function handleDelete(artist) {
    const confirmed =
      window.confirm(
        `Delete ${artist.name}? This will remove the artist from the admin system.`
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/artists/${artist.id}`,
        authConfig
      );

      setSuccess(
        "Artist deleted successfully."
      );

      await loadArtists();
    } catch (requestError) {
      console.error(
        "Delete artist error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to delete artist."
      );
    }
  }

  return (
    <div className="admin-page">

      <div className="admin-page-header">

        <div>
          <p className="admin-eyebrow">
            Studio
          </p>

          <h1>Artists</h1>

          <p>
            Manage the tattoo artists working
            with SilvaTattoos.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add Artist
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
          Loading artists...
        </div>
      ) : artists.length === 0 ? (
        <div className="admin-empty-state">

          <UserRound size={32} />

          <h3>
            No artists yet
          </h3>

          <p>
            Add your first tattoo artist.
          </p>

          <button
            type="button"
            className="admin-primary-button"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Add Artist
          </button>

        </div>
      ) : (
        <div className="admin-artists-grid">

          {artists.map((artist) => (

            <article
              key={artist.id}
              className="admin-artist-card"
            >

              <div className="admin-artist-card-header">

                <div className="admin-artist-avatar">
                  {artist.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h3>
                    {artist.name}
                  </h3>

                  <span
                    className={
                      artist.active
                        ? "admin-artist-active"
                        : "admin-artist-inactive"
                    }
                  >
                    {artist.active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

              </div>


              <p className="admin-artist-bio">
                {artist.bio ||
                  "No artist biography added yet."}
              </p>


              <div className="admin-artist-styles">

                {(artist.styles || []).map(
                  (style) => (
                    <span key={style}>
                      {style}
                    </span>
                  )
                )}

              </div>


              <div className="admin-artist-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    openEditForm(artist)
                  }
                >
                  <Edit3 size={15} />
                  Edit
                </button>

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    handleToggleActive(artist)
                  }
                >
                  {artist.active
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <button
                  type="button"
                  className="admin-icon-button admin-icon-danger"
                  onClick={() =>
                    handleDelete(artist)
                  }
                  title="Delete artist"
                >
                  <Trash2 size={16} />
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
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <p className="admin-eyebrow">
                  Studio
                </p>

                <h2>
                  {editingId
                    ? "Edit Artist"
                    : "Add Artist"}
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
                Artist name

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Marcus Silva"
                  required
                />
              </label>


              <label>
                Biography

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell clients about this artist..."
                  rows="5"
                />
              </label>


              <div className="admin-style-selector">

                <span className="admin-form-label">
                  Tattoo styles
                </span>

                <div className="admin-style-options">

                  {styleOptions.map(
                    (style) => {

                      const selected =
                        form.styles.includes(
                          style
                        );

                      return (
                        <button
                          key={style}
                          type="button"
                          className={
                            selected
                              ? "admin-style-option admin-style-selected"
                              : "admin-style-option"
                          }
                          onClick={() =>
                            toggleStyle(style)
                          }
                        >
                          {style}
                        </button>
                      );
                    }
                  )}

                </div>

              </div>


              <label className="admin-checkbox-row">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />

                <span>
                  Artist is active
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
                      : "Create Artist"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}