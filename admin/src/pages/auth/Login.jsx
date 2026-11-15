
import { useState } from "react";
import "./Login.css";
import { Stethoscope } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Backend endpoint: POST /api/login
      const response = await api.post("/login", {
        email,
        password,
      });

      const { success, token, user, message } = response.data;

      if (!success || !token || !user || !user.role) {
        setErrorMessage(message || "Invalid login response.");
        return;
      }

      const roleRoutes = {
        patient: "/user/dashboard",
        doctor: "/doctor/dashboard",
        hospital_admin: "/hospital/dashboard",
        admin: "/admin/dashboard",
        super_admin: "/admin/dashboard",
      };

      const destination = roleRoutes[user.role];

      if (!destination) {
        setErrorMessage(
          `Unsupported account role: ${user.role}`
        );
        return;
      }

      // Save credentials according to Remember Me.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      navigate(destination, { replace: true });
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT SIDE */}
        <div className="login-form-section">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Stethoscope size={20} />
            </div>
            <h3>NearbyDoctor</h3>
          </div>

          <p className="login-welcome">Welcome back</p>
          <h1>Login to NearbyDoctor</h1>

          {errorMessage && (
            <div className="login-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="login-options">
              <div className="remember-me">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </p>

          <div className="login-links">
            <span>FAQ</span>
            <b>|</b>
            <span>Features</span>
            <b>|</b>
            <span>Support</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
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

          <div className="login-mountains">
            <span className="login-mountain login-mountain-one" />
            <span className="login-mountain login-mountain-two" />
            <span className="login-mountain login-mountain-three" />
            <span className="login-mountain login-mountain-four" />
          </div>

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
