import { useState } from "react";
import "./Forgot.css";
import { Stethoscope, ArrowLeft, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api"; // Adjust if your api path is different

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      
      // Make sure this endpoint exists in your backend
      const response = await api.post("/forgot-password", {
        email: trimmedEmail,
      });

      setSuccessMessage(
        response.data?.message || 
        "If an account with that email exists, a password reset link has been sent."
      );
      setEmail("");
    } catch (error) {
      console.error("Forgot password error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to process request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        
        {/* LEFT SIDE - FORM */}
        <div className="forgot-form-section">
          <div className="forgot-brand">
            <div className="forgot-brand-icon">
              <Stethoscope size={20} />
            </div>
            <h3>NearbyDoctor</h3>
          </div>

          <Link to="/login" className="forgot-back-link">
            <ArrowLeft size={16} /> Back to login
          </Link>

          <p className="forgot-welcome">Reset your password</p>
          <h1>Forgot Password?</h1>
          <p className="forgot-subtitle">
            Enter your registered email address and we'll send you a link to
            reset your password.
          </p>

          {errorMessage && (
            <div className="forgot-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="forgot-success" role="status">
              <MailCheck size={20} className="forgot-success-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="forgot-form-group">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              className="forgot-button"
              disabled={loading}
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}
            </button>
          </form>

          <div className="forgot-links">
            <span>FAQ</span>
            <b>|</b>
            <span>Features</span>
            <b>|</b>
            <span>Support</span>
          </div>
        </div>

        {/* RIGHT SIDE - INFO */}
        <div className="forgot-info-section">
          <div className="forgot-info-content">
            <h2>Secure Account Recovery</h2>
            <p>
              Your security is our priority. We use industry-standard encryption
              to ensure your account details are kept safe.
            </p>

            <h3>Need more help?</h3>
            <ul>
              <li>Make sure to check your Spam / Junk folder.</li>
              <li>The reset link will expire in 15 minutes.</li>
              <li>If you still can't log in, raise a support ticket.</li>
            </ul>
          </div>

          <div className="forgot-mountains">
            <span className="forgot-mountain forgot-mountain-one" />
            <span className="forgot-mountain forgot-mountain-two" />
            <span className="forgot-mountain forgot-mountain-three" />
            <span className="forgot-mountain forgot-mountain-four" />
          </div>

          <div className="forgot-info-footer">
            <span>NearbyDoctor</span>
            <span>Features</span>
            <span>Support</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Forgot;