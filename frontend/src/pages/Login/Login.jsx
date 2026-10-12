import React from "react";
import "./Login.css";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
function Login() {
  

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

          <h1>
            Login to NearbyDoctor
          </h1>


          {/* Login Form */}
          <form className="login-form">

            {/* Email */}
            <div className="login-form-group">
              <label htmlFor="email">
                EMAIL
              </label>

              <input
                id="email"
                type="email"
                placeholder="Email address"
              />
            </div>


            {/* Password */}
            <div className="login-form-group">
              <label htmlFor="password">
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                placeholder="Password"
              />
            </div>


            {/* Remember / Forgot */}
            <div className="login-options">

              <div className="remember-me">
                <input
                  id="remember"
                  type="checkbox"
                />

                <label htmlFor="remember">
                  Remember me
                </label>
              </div>

              <span className="forgot-password">
                Forgot Password?
              </span>

            </div>


            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
            >
              LOGIN
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

            <h2>
              About NearbyDoctor
            </h2>

            <p>
              NearbyDoctor is a modern healthcare platform
              that helps patients find trusted doctors and
              healthcare professionals near them.
            </p>


            <h3>
              Features
            </h3>

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

            <span className="login-mountain login-mountain-one"></span>

            <span className="login-mountain login-mountain-two"></span>

            <span className="login-mountain login-mountain-three"></span>

            <span className="login-mountain login-mountain-four"></span>

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