
import React, { useState } from "react";
import "./Login.css";
import { Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!email.trim() || !password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    setLoading(true);

    // Login API
    const response = await api.post("/login", {
      email: email.trim(),
      password,
    });

    const { success, token, user } = response.data;

    if (!success || !token || !user || !user.fullname) {
      setError("Invalid login response from server.");
      return;
    }

    // Clear previous login data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Remember me
    const storage = remember
      ? localStorage
      : sessionStorage;

    // Save user and token
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));

    // Update Navbar avatar
    window.dispatchEvent(new Event("authChanged"));

    // Login success: always go to Home
    navigate("/", { replace: true });

  } catch (err) {
    console.error(
      "Login error:",
      err.response?.status,
      err.response?.data || err.message
    );

    setError(
      err.response?.data?.message ||
        "Unable to login. Please check your connection and try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-page">
      <div className="login-container">

        {/* ================= LEFT SIDE ================= */}
        <div className="login-form-section">

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <Stethoscope size={20} />
            </div>

            <h3>NearbyDoctor</h3>
          </div>

          <p className="login-welcome">
            Welcome back
          </p>

          <h1>Login to NearbyDoctor</h1>

          {/* Login Form */}
          <form
            className="login-form"
            onSubmit={handleLogin}
          >
            {/* Email */}
            <div className="login-form-group">
              <label htmlFor="email">EMAIL</label>

              <input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="login-form-group">
              <label htmlFor="password">PASSWORD</label>

              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            {/* Remember / Forgot */}
            <div className="login-options">
              <div className="remember-me">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                  disabled={loading}
                />

                <label htmlFor="remember">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          {/* Signup */}
          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </p>

          {/* Bottom Links */}
          <div className="login-links">
            <span>FAQ</span>
            <b>|</b>
            <span>Features</span>
            <b>|</b>
            <span>Support</span>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="login-info-section">
          <div className="login-info-content">
            <h2>About NearbyDoctor</h2>

            <p>
              NearbyDoctor is a modern healthcare platform
              that helps patients find trusted doctors and
              healthcare professionals near them.
            </p>

            <h3>Features</h3>

            <ul>
              <li>
                Find doctors based on location and specialty.
              </li>

              <li>
                Browse experienced and trusted doctors.
              </li>

              <li>
                Simple and convenient doctor search.
              </li>
            </ul>
          </div>

          {/* Bottom Decoration */}
          <div className="login-mountains">
            <span className="login-mountain login-mountain-one" />
            <span className="login-mountain login-mountain-two" />
            <span className="login-mountain login-mountain-three" />
            <span className="login-mountain login-mountain-four" />
          </div>

          {/* Footer */}
          <div className="login-info-footer">
            <span>NearbyDoctor</span>
            <span>Features</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
