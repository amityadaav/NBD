
import React, { useState } from "react";
import "./Signup.css";
import {
  Stethoscope,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleInput(e) {
    const { name, value } = e.target;

    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate full name
    if (input.fullname.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password
    if (input.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Confirm password
    if (input.password !== input.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullname: input.fullname.trim(),
            email: input.email.trim(),
            password: input.password,
            confirmPassword: input.confirmPassword,
          }),
        }
      );

      // Read response safely
      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          "Invalid server response. Please check your backend API."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Signup failed.");
      }

      // Show success modal
      setShowSuccess(true);

      setInput({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* LEFT SIDE */}
        <div className="signup-form-section">
          <div className="signup-brand">
            <div className="brand-icon">
              <Stethoscope size={20} />
            </div>
            <h3>NearbyDoctor</h3>
          </div>

          <p className="welcome-text">Create your account</p>

          <h1>Join NearbyDoctor</h1>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">FULL NAME</label>
              <input
                id="name"
                type="text"
                placeholder="Full name"
                name="fullname"
                value={input.fullname}
                onChange={handleInput}
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                name="email"
                value={input.email}
                onChange={handleInput}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={input.password}
                onChange={handleInput}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPassword"
                value={input.confirmPassword}
                onChange={handleInput}
                autoComplete="new-password"
                required
              />


<button
  type="button"
  className="signup-password-toggle"
  onClick={() => setShowConfirmPassword((prev) => !prev)}
  aria-label={
    showConfirmPassword ? "Hide password" : "Show password"
  }
>
  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
            </div>

            {/* Display errors */}
            {error && (
              <p className="signup-error" role="alert">
                {error}
              </p>
            )}

            {/* Terms */}
            <div className="terms-row">
              <input
                id="terms"
                type="checkbox"
                required
              />
              <label htmlFor="terms">
                I agree to the Terms &amp; Conditions
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Login */}
          <p className="login-text">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>

          {/* Bottom Links */}
          <div className="signup-links">
            <span>FAQ</span>
            <b>|</b>
            <span>Features</span>
            <b>|</b>
            <span>Support</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="signup-info-section">
          <div className="info-content">
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

          {/* Decorative Mountains */}
          <div className="mountains">
            <span className="mountain mountain-one" />
            <span className="mountain mountain-two" />
            <span className="mountain mountain-three" />
            <span className="mountain mountain-four" />
          </div>

          {/* Footer */}
          <div className="info-footer">
            <span>NearbyDoctor</span>
            <span>Features</span>
            <span>Support</span>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="signup-success-overlay">
          <div
            className="signup-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-success-title"
          >
            <div className="signup-success-icon">
              <CheckCircle2 size={52} />
            </div>

            <h2 id="signup-success-title">
              Signup Successful!
            </h2>

            <p>
              Welcome to NearbyDoctor! Your account has been
              created successfully.
            </p>

            <button
              type="button"
              className="signup-success-button"
              onClick={() => navigate("/login")}
            >
              Continue to Login
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
