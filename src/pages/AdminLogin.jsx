import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

import api from "../api/axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const existingToken =
    localStorage.getItem("silvatattoos_admin_token");

  if (existingToken) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Please enter your username and password."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(
        "/admin/auth/login",
        {
          username: username.trim(),
          password
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to sign in."
        );
      }

      localStorage.setItem(
        "silvatattoos_admin_token",
        response.data.token
      );

      localStorage.setItem(
        "silvatattoos_admin",
        JSON.stringify(
          response.data.admin
        )
      );

      navigate("/admin", {
        replace: true
      });
    } catch (requestError) {
      console.error(
        "Admin login failed:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-shell">
        <div className="admin-login-brand">
          <span className="admin-login-eyebrow">
            SilvaTattoos
          </span>

          <h1>
            Studio
            <br />
            <span>Admin.</span>
          </h1>

          <p>
            Manage bookings, artists,
            availability and studio operations.
          </p>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-card-header">
            <div className="admin-login-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <span>Secure access</span>
              <h2>Sign in</h2>
            </div>
          </div>

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <label htmlFor="admin-username">
                Username
              </label>

              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                autoComplete="username"
                autoFocus
                placeholder="Enter username"
              />
            </div>

            <div className="form-section">
              <label htmlFor="admin-password">
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="field-error admin-login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-button admin-login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign in"}

              {!isSubmitting && (
                <ArrowUpRight size={17} />
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <span>
              Authorized access only
            </span>

            <span>
              © 2026 SilvaTattoos
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;