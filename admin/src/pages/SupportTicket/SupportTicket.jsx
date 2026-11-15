import { useState } from "react";
import {
  Stethoscope,
  LifeBuoy,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./SupportTicket.css";

const CATEGORIES = [
  { value: "login", label: "Login / Access" },
  { value: "account", label: "Account" },
  { value: "payment", label: "Payment / Billing" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  category: "login",
  message: "",
  website: "", // honeypot
};

function SupportTicket() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !subject || !message) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (name.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      return;
    }
    if (subject.length < 3) {
      setErrorMessage("Subject must be at least 3 characters.");
      return;
    }
    if (message.length < 10) {
      setErrorMessage("Please describe your issue (at least 10 characters).");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/support-tickets", {
        name,
        email,
        subject,
        category: formData.category,
        message,
        website: formData.website,
      });

      setSuccessData(response.data.ticket);
      setSubmittedEmail(email);
      setFormData(INITIAL_FORM);
    } catch (error) {
      console.error(
        "Support ticket error:",
        error.response?.data || error.message
      );
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to submit ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnother = () => {
    setSuccessData(null);
    setSubmittedEmail("");
    setFormData(INITIAL_FORM);
    setErrorMessage("");
  };

  return (
    <div className="support-page">
      <div className="support-container">
        {/* ================= LEFT — FORM ================= */}
        <div className="support-form-section">
          <div className="support-brand">
            <div className="support-brand-icon">
              <Stethoscope size={20} />
            </div>
            <h3>NearbyDoctor</h3>
          </div>

          <Link to="/login" className="support-back">
            <ArrowLeft size={16} /> Back to login
          </Link>

          <p className="support-welcome">Need help?</p>
          <h1>Raise a Support Ticket</h1>
          <p className="support-subtitle">
            Can&apos;t log in or facing an issue? Describe it below and our
            team will get back to you by email.
          </p>

          {errorMessage && (
            <div className="support-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successData ? (
            <div className="support-success" role="status">
              <CheckCircle2 size={42} className="support-success-icon" />
              <h2>Ticket Submitted</h2>
              <p>
                Your ticket number is{" "}
                <strong>{successData.ticketNumber}</strong>. Keep it handy —
                we&apos;ll reply to{" "}
                <strong>{submittedEmail || "your email"}</strong> soon.
              </p>
              <button
                type="button"
                className="support-button"
                onClick={handleSubmitAnother}
              >
                SUBMIT ANOTHER TICKET
              </button>
            </div>
          ) : (
            <form className="support-form" onSubmit={handleSubmit} noValidate>
              <div className="support-row">
                <div className="support-form-group">
                  <label htmlFor="name">FULL NAME</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={80}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="support-form-group">
                  <label htmlFor="email">EMAIL</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={120}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="support-row">
                <div className="support-form-group">
                  <label htmlFor="subject">SUBJECT</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Brief summary of the issue"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="support-form-group">
                  <label htmlFor="category">CATEGORY</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="support-form-group">
                <label htmlFor="message">MESSAGE</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={3000}
                  required
                />
                <small className="support-char-count">
                  {formData.message.length}/3000
                </small>
              </div>

              {/* Honeypot — hidden from real users, bots fill it */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={handleChange}
                className="support-honeypot"
                aria-hidden="true"
              />

              <button
                type="submit"
                className="support-button"
                disabled={loading}
              >
                {loading ? "SUBMITTING..." : "SUBMIT TICKET"}
              </button>
            </form>
          )}

          <div className="support-help-section">
            <p className="help-text">Already have a ticket?</p>
            <span className="support-note">
              <LifeBuoy size={16} /> Our team responds within 24 hours.
            </span>
          </div>
        </div>

        {/* ================= RIGHT — INFO ================= */}
        <div className="support-info-section">
          <div className="support-info-content">
            <h2>We&apos;re here to help</h2>
            <p>
              If you&apos;re unable to log in or something isn&apos;t working,
              submit a support ticket. No account required.
            </p>

            <h3>What happens next?</h3>
            <ul>
              <li>You&apos;ll receive a ticket number instantly.</li>
              <li>Our support team reviews your request.</li>
              <li>We reply to your email with a resolution.</li>
            </ul>
          </div>

          <div className="support-mountains">
            <span className="support-mountain support-mountain-one" />
            <span className="support-mountain support-mountain-two" />
            <span className="support-mountain support-mountain-three" />
            <span className="support-mountain support-mountain-four" />
          </div>

          <div className="support-info-footer">
            <span>NearbyDoctor</span>
            <span>Support</span>
            <span>Help Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportTicket;