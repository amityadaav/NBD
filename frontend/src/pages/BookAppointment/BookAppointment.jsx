
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Stethoscope,
  UserRound,
  CheckCircle2,
  Video,
  Building2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

import "./BookAppointment.css";

const API_URL = "http://localhost:5000/api";

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:30 AM",
  "12:30 PM",
  "02:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Doctor and hospital data received from FindDoctors.jsx
  const selectedDoctor = location.state?.doctor;

  const doctorId =
    location.state?.doctorId || selectedDoctor?._id;

  const hospitalId =
    location.state?.hospitalId ||
    (typeof selectedDoctor?.hospitalId === "object"
      ? selectedDoctor?.hospitalId?._id
      : selectedDoctor?.hospitalId);

  const hospitalData =
    typeof selectedDoctor?.hospitalId === "object"
      ? selectedDoctor.hospitalId
      : {};

  const doctor = {
    name: selectedDoctor?.name || "",
    specialty: selectedDoctor?.specialty || "",
    qualification: selectedDoctor?.qualification || "",
    hospital: hospitalData?.hospitalName || "",
    address:
      typeof hospitalData?.address === "string"
        ? hospitalData.address
        : [
            hospitalData?.address?.street,
            hospitalData?.address?.city,
          ]
            .filter(Boolean)
            .join(", "),
    fee: Number(selectedDoctor?.consultationFee ?? 0),
    image: selectedDoctor?.profileImage || "",
  };

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] =
    useState("In-Clinic");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + currentWeek * 7);

    const start = new Date(today);
    const day = start.getDay();

    // Start the calendar on Monday.
    start.setDate(start.getDate() + (day === 0 ? 1 : 1 - day));

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        value: [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-"),
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        number: date.getDate(),
        month: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        disabled: date < new Date(new Date().setHours(0, 0, 0, 0)),
      };
    });
  }, [currentWeek]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "";

    return new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }, [selectedDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBookingError("");

    if (!doctorId || !hospitalId) {
      setBookingError(
        "Doctor or hospital information is missing. Please select a doctor from the Find Doctors page."
      );
      return;
    }

    if (!selectedDate || !selectedTime) {
      setBookingError("Please select an appointment date and time.");
      return;
    }

    if (
      !patientName.trim() ||
      !patientEmail.trim() ||
      !patientPhone.trim()
    ) {
      setBookingError(
        "Please fill in your name, email, and phone number."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())
    ) {
      setBookingError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(patientPhone)) {
      setBookingError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!Number.isFinite(doctor.fee) || doctor.fee < 0) {
      setBookingError("The doctor's consultation fee is invalid.");
      return;
    }

    const appointmentData = {
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone,
      doctorId,
      hospitalId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      appointmentType,
      reason: reason.trim(),
      consultationFee: doctor.fee,
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/appointments/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const missing = result.missingFields?.length
          ? ` Missing fields: ${result.missingFields.join(", ")}`
          : "";

        throw new Error(
          (result.message || "Failed to book appointment.") + missing
        );
      }

      setBookingId(
        result.appointment?._id ||
          result.booking?._id ||
          result._id ||
          ""
      );
      setBookingSuccess(true);
      setShowConfirmation(true);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (direction) => {
    const nextWeek = currentWeek + direction;

    if (nextWeek < 0 || nextWeek > 8) return;

    setCurrentWeek(nextWeek);
    setSelectedDate("");
    setSelectedTime("");
  };

  // If the user opens this page without selecting a doctor,
  // ask them to choose a doctor first.
  if (!selectedDoctor || !doctorId || !hospitalId) {
    return (
      <main className="book-appointment">
        <section className="booking-card">
          <div className="section-title">
            <div className="section-icon">
              <Stethoscope size={20} />
            </div>

            <div>
              <h3>Select a doctor first</h3>
              <p>
                Choose a doctor from the Find Doctors page before
                booking an appointment.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="confirm-appointment"
            onClick={() => navigate("/find-doctors")}
          >
            Find Doctors
            <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="book-appointment">
      <section className="booking-header">
        <div className="booking-header-content">
          <h1>
            Your health, <span>our priority.</span>
          </h1>

          <p>
            Schedule your consultation with a trusted healthcare
            professional in just a few simple steps.
          </p>
        </div>

        <div className="booking-trust">
          <ShieldCheck size={18} />
          <span>Secure appointment booking</span>
        </div>
      </section>

      <div className="booking-layout">
        <section className="booking-main">
          {/* Doctor information */}
          <article className="doctor-booking-card">
            <div className="doctor-booking-image">
              {doctor.image ? (
                <img src={doctor.image} alt={doctor.name} />
              ) : (
                <UserRound size={42} />
              )}
            </div>

            <div className="doctor-booking-info">
              <span className="doctor-specialty">
                {doctor.specialty}
              </span>

              <h2>{doctor.name}</h2>

              <p>{doctor.qualification}</p>

              <div className="doctor-location">
                <MapPin size={15} />
                <span>
                  {doctor.hospital}
                  {doctor.address ? `, ${doctor.address}` : ""}
                </span>
              </div>

              <div className="doctor-verified">
                <BadgeCheck size={15} />
                Verified doctor
              </div>
            </div>

            <div className="doctor-fee">
              <span>Consultation fee</span>
              <strong>₹{doctor.fee}</strong>
              <small>Per consultation</small>
            </div>
          </article>

          <form className="booking-card" onSubmit={handleSubmit}>
            {/* Date selection */}
            <section className="booking-section">
              <div className="section-title">
                <div className="section-icon">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h3>Select appointment date</h3>
                  <p>Choose a convenient day for your visit.</p>
                </div>
              </div>

              <div className="week-navigation">
                <span>
                  {dates[0].month} {dates[0].number} –{" "}
                  {dates[6].month} {dates[6].number}
                </span>

                <div className="week-buttons">
                  <button
                    type="button"
                    aria-label="Previous week"
                    onClick={() => changeWeek(-1)}
                    disabled={currentWeek === 0}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Next week"
                    onClick={() => changeWeek(1)}
                    disabled={currentWeek === 8}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="date-grid">
                {dates.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={item.disabled}
                    className={`date-option ${
                      selectedDate === item.value ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(item.value);
                      setSelectedTime("");
                    }}
                  >
                    <span>{item.day}</span>
                    <strong>{item.number}</strong>
                    <small>{item.month}</small>
                  </button>
                ))}
              </div>
            </section>

            {/* Time selection */}
            <section className="booking-section">
              <div className="section-title">
                <div className="section-icon">
                  <Clock3 size={20} />
                </div>

                <div>
                  <h3>Select time slot</h3>
                  <p>Choose your preferred consultation time.</p>
                </div>
              </div>

              <div className="time-grid">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`time-option ${
                      selectedTime === time ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock3 size={14} />
                    {time}
                  </button>
                ))}
              </div>
            </section>

            {/* Consultation type */}
            <section className="booking-section">
              <div className="section-title">
                <div className="section-icon">
                  <Stethoscope size={20} />
                </div>

                <div>
                  <h3>Consultation type</h3>
                  <p>Choose how you want to meet your doctor.</p>
                </div>
              </div>

              <div className="appointment-type">
                <button
                  type="button"
                  className={`type-option ${
                    appointmentType === "In-Clinic" ? "selected" : ""
                  }`}
                  onClick={() => setAppointmentType("In-Clinic")}
                >
                  <Building2 size={22} />

                  <div>
                    <strong>In-Clinic</strong>
                    <span>Visit the hospital in person.</span>
                  </div>

                  <span className="type-radio" />
                </button>

                <button
                  type="button"
                  className={`type-option ${
                    appointmentType === "Online" ? "selected" : ""
                  }`}
                  onClick={() => setAppointmentType("Online")}
                >
                  <Video size={22} />

                  <div>
                    <strong>Online consultation</strong>
                    <span>Consult through a video call.</span>
                  </div>

                  <span className="type-radio" />
                </button>
              </div>
            </section>

            {/* Patient details */}
            <section className="booking-section patient-section">
              <div className="section-title">
                <div className="section-icon">
                  <UserRound size={20} />
                </div>

                <div>
                  <h3>Your details</h3>
                  <p>
                    Enter your contact information for the booking.
                  </p>
                </div>
              </div>

              <div className="patient-form-grid">
                <label>
                  Full name *
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  Email address *
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={patientPhone}
                    onChange={(e) =>
                      setPatientPhone(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    required
                  />
                </label>

                <label>
                  Reason for visit
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Regular checkup"
                  />
                </label>
              </div>
            </section>

            {bookingError && (
              <p role="alert" className="booking-error">
                {bookingError}
              </p>
            )}

            <button
              type="submit"
              className="confirm-appointment"
              disabled={loading}
            >
              <CheckCircle2 size={19} />
              {loading ? "Booking appointment..." : "Confirm appointment"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="booking-privacy">
              <ShieldCheck size={15} />
              Your personal information should be handled securely.
            </p>
          </form>
        </section>

        {/* Booking summary */}
        <aside className="booking-summary">
          <div className="summary-heading">
            <h3>Booking summary</h3>
            <p>Review your appointment details.</p>
          </div>

          <div className="summary-doctor">
            <div className="summary-doctor-icon">
              <UserRound size={25} />
            </div>

            <div>
              <strong>{doctor.name}</strong>
              <span>{doctor.specialty}</span>
            </div>
          </div>

          <div className="summary-row">
            <CalendarDays size={17} />
            <div>
              <span>Appointment date</span>
              <strong>{selectedDateLabel || "Not selected"}</strong>
            </div>
          </div>

          <div className="summary-row">
            <Clock3 size={17} />
            <div>
              <span>Appointment time</span>
              <strong>{selectedTime || "Not selected"}</strong>
            </div>
          </div>

          <div className="summary-row">
            {appointmentType === "Online" ? (
              <Video size={17} />
            ) : (
              <Building2 size={17} />
            )}

            <div>
              <span>Consultation type</span>
              <strong>{appointmentType}</strong>
            </div>
          </div>

          <div className="summary-row">
            <MapPin size={17} />
            <div>
              <span>Hospital</span>
              <strong>{doctor.hospital || "Hospital details unavailable"}</strong>
              {doctor.address && <small>{doctor.address}</small>}
            </div>
          </div>

          <div className="summary-total">
            <span>Consultation fee</span>
            <strong>₹{doctor.fee}</strong>
          </div>

          <div className="summary-note">
            <ShieldCheck size={17} />
            <p>
              Your appointment details will be confirmed after
              successful booking.
            </p>
          </div>
        </aside>
      </div>

      {/* Confirmation modal: shown only after successful API response */}
      {showConfirmation && bookingSuccess && (
        <div
          className="booking-modal-overlay"
          role="presentation"
          onClick={() => setShowConfirmation(false)}
        >
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirmation-icon">
              <CheckCircle2 size={34} />
            </div>

            <h2 id="booking-confirm-title">
              Appointment booked successfully!
            </h2>

            <p>
              Your appointment request has been saved successfully.
            </p>

            <div className="confirmation-details">
              {bookingId && (
                <p>
                  <strong>Booking ID:</strong> {bookingId}
                </p>
              )}

              <p>
                <strong>Patient:</strong> {patientName}
              </p>

              <p>
                <strong>Doctor:</strong> {doctor.name}
              </p>

              <p>
                <strong>Hospital:</strong> {doctor.hospital}
              </p>

              <p>
                <strong>Date:</strong> {selectedDateLabel}
              </p>

              <p>
                <strong>Time:</strong> {selectedTime}
              </p>

              <p>
                <strong>Type:</strong> {appointmentType}
              </p>

              <p>
                <strong>Fee:</strong> ₹{doctor.fee}
              </p>

              {reason && (
                <p>
                  <strong>Reason:</strong> {reason}
                </p>
              )}
            </div>

            <button
              type="button"
              className="confirm-appointment"
              onClick={() => navigate("/")}
            >
              Back to Home
              <ArrowRight size={18} />
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default BookAppointment;
