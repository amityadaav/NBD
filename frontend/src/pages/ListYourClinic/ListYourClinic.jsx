import React, { useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Stethoscope,
  Users,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Clock,
  Plus,
  Trash2,
  Upload,
  Hospital,
  UserRound,
  Globe,
  BedDouble,
  HeartPulse,
  CalendarDays,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ListYourClinic.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const steps = [
  { label: "Hospital Details", icon: Building2 },
  { label: "Location", icon: MapPin },
  { label: "Services", icon: Stethoscope },
  { label: "Doctors", icon: Users },
  { label: "Documents", icon: FileCheck },
  { label: "Review", icon: CheckCircle2 },
];

const specialties = [
  "General Medicine", "Cardiology", "Dermatology", "Dentistry",
  "Neurology", "Orthopedics", "Pediatrics", "Gynecology",
  "Ophthalmology", "Oncology", "Psychiatry", "Urology",
  "ENT", "Radiology", "Other",
];

const facilityOptions = [
  "24/7 Emergency", "ICU", "NICU", "Operation Theatre", "Laboratory",
  "Pharmacy", "X-Ray", "CT Scan", "MRI", "Ambulance", "Blood Bank",
  "Inpatient Care", "Teleconsultation",
];

const emptyDoctor = () => ({
  name: "",
  qualification: "",
  specialty: "",
  experience: "",
  registrationNumber: "",
});

const createInitialData = () => ({
  hospitalName: "",
  facilityType: "",
  ownershipType: "",
  establishedYear: "",
  registrationNumber: "",
  website: "",
  ownerName: "",
  designation: "",
  email: "",
  phone: "",
  alternatePhone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  specialties: [],
  facilities: [],
  emergency: "No",
  openingTime: "09:00",
  closingTime: "18:00",
  consultationFee: "",
  totalBeds: "",
  description: "",
  doctors: [emptyDoctor()],
  documents: {},
  declaration: false,
});

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu and Kashmir", "Ladakh",
];

const documentOptions = [
  ["registrationCertificate", "Hospital Registration Certificate", "PDF, JPG or PNG"],
  ["ownerId", "Authorized Person's ID", "PDF, JPG or PNG"],
  ["fireSafety", "Fire Safety Certificate (if applicable)", "PDF, JPG or PNG"],
  ["biomedicalWaste", "Biomedical Waste Authorization (if applicable)", "PDF, JPG or PNG"],
  ["accreditation", "NABH / Other Accreditation (optional)", "PDF, JPG or PNG"],
];

const Field = ({
  label,
  name,
  icon: Icon,
  type = "text",
  placeholder = "",
  required = false,
  value,
  onChange,
  error,
  children,
  className = "",
  ...props
}) => (
  <label className={`lh-field ${className}`}>
    <span className="lh-label">
      {label} {required && <span className="lh-required">*</span>}
    </span>
    <div className={`lh-input-wrap ${error ? "has-error" : ""}`}>
      {Icon && <Icon size={18} className="lh-field-icon" />}
      {children || (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
    </div>
    {error && <span className="lh-error">{error}</span>}
  </label>
);

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="lh-section-heading">
    <span className="lh-section-eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    <p>{description}</p>
  </div>
);

const ReviewItem = ({ label, value }) => (
  <div className="lh-review-item">
    <span>{label}</span>
    <strong>{value || "Not provided"}</strong>
  </div>
);

const ListYourClinic = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(createInitialData);
  const [hospitalLogo, setHospitalLogo] = useState(null);
  const [hospitalImages, setHospitalImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  const toggleOption = (field, option) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter((item) => item !== option)
        : [...prev[field], option],
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateDoctor = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      doctors: prev.doctors.map((doctor, i) =>
        i === index ? { ...doctor, [field]: value } : doctor
      ),
    }));
    setErrors((prev) => ({ ...prev, doctors: "" }));
  };

  const addDoctor = () => {
    setFormData((prev) => ({ ...prev, doctors: [...prev.doctors, emptyDoctor()] }));
  };

  const removeDoctor = (index) => {
    setFormData((prev) => ({
      ...prev,
      doctors: prev.doctors.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, doctors: "" }));
  };

  const validateStep = () => {
    const nextErrors = {};
    const requiredFields = {
      0: [
        ["hospitalName", "Hospital name is required."],
        ["facilityType", "Select your facility type."],
        ["ownershipType", "Select ownership type."],
        ["ownerName", "Authorized person's name is required."],
        ["email", "Email address is required."],
        ["phone", "Phone number is required."],
      ],
      1: [
        ["address", "Enter the complete address."],
        ["city", "City is required."],
        ["state", "State is required."],
        ["pincode", "PIN code is required."],
      ],
      2: [["specialties", "Select at least one specialty."]],
      4: [["declaration", "Please accept the declaration."]],
    };

    (requiredFields[step] || []).forEach(([field, message]) => {
      const value = formData[field];
      if (field === "declaration") {
        if (!value) nextErrors[field] = message;
      } else if (
        Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim()
      ) {
        nextErrors[field] = message;
      }
    });

    if (step === 0 && formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (
      step === 0 &&
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (
      step === 0 &&
      formData.alternatePhone &&
      !/^[6-9]\d{9}$/.test(formData.alternatePhone)
    ) {
      nextErrors.alternatePhone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (step === 0 && formData.website) {
      try {
        new URL(formData.website);
      } catch {
        nextErrors.website = "Enter a valid website URL, including https://.";
      }
    }

    if (step === 0 && formData.establishedYear) {
      const year = Number(formData.establishedYear);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
        nextErrors.establishedYear = `Enter a year between 1800 and ${currentYear}.`;
      }
    }

    if (step === 1 && formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      nextErrors.pincode = "PIN code must contain exactly 6 digits.";
    }

    if (step === 3) {
      if (!formData.doctors.length || !formData.doctors[0].name.trim()) {
        nextErrors.doctors = "Enter at least the first doctor's name.";
      }
      formData.doctors.forEach((doctor, index) => {
        if (index > 0 && !doctor.name.trim()) {
          nextErrors[`doctor-${index}`] = `Enter a name for Doctor ${index + 1}, or remove this doctor.`;
        }
        if (doctor.experience && Number(doctor.experience) < 0) {
          nextErrors[`doctor-experience-${index}`] = "Experience cannot be negative.";
        }
      });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    scrollToTop();
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 0));
    setErrors({});
    scrollToTop();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Pressing Enter on an earlier step should advance, not submit.
    if (step < steps.length - 1) {
      nextStep();
      return;
    }

    if (!validateStep()) return;

    setLoading(true);
    setApiError("");
    setApiSuccess("");

    // Map the form's field names to the Hospital Mongoose schema.
    const hospitalTypeMap = {
      "Multi-specialty Hospital": "Multi-Specialty Hospital",
      "General Hospital": "Hospital",
      "Specialty Hospital": "Hospital",
      "Clinic": "Clinic",
      "Nursing Home": "Nursing Home",
      "Diagnostic Centre": "Diagnostic Center",
    };

    const hospitalData = {
      hospitalName: formData.hospitalName.trim(),
      hospitalType: hospitalTypeMap[formData.facilityType] || formData.facilityType,
      ownershipType: formData.ownershipType,
      establishmentYear: formData.establishedYear
        ? Number(formData.establishedYear)
        : undefined,
      registrationNumber: formData.registrationNumber.trim(),
      description: formData.description.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      website: formData.website.trim(),
      owner: {
        name: formData.ownerName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        designation: formData.designation || "Hospital Administrator",
      },
      address: {
        street: formData.address.trim(),
        area: formData.landmark.trim() || formData.city.trim(),
        city: formData.city.trim(),
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country || "India",
      },
      specialties: formData.specialties,
      facilities: formData.facilities,
      totalBeds: Number(formData.totalBeds) || 0,
      emergencyAvailable: formData.emergency === "Yes",
      ambulanceAvailable: formData.facilities.includes("Ambulance"),
      workingHours: [
        ...["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => ({
          day,
          isOpen: true,
          openTime: formData.openingTime,
          closeTime: formData.closingTime,
        })),
        { day: "Sunday", isOpen: false, openTime: formData.openingTime, closeTime: formData.closingTime },
      ],
      consultationFee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
      doctors: formData.doctors
        .filter((doctor) => doctor.name.trim())
        .map((doctor) => ({
          name: doctor.name.trim(),
          qualification: doctor.qualification.trim(),
          specialty: doctor.specialty,
          experience: doctor.experience ? Number(doctor.experience) : undefined,
          registrationNumber: doctor.registrationNumber.trim(),
        })),
    };

    // Send hospital fields and files together as multipart/form-data.
    const uploadData = new FormData();
    uploadData.append("hospitalData", JSON.stringify(hospitalData));
    if (hospitalLogo) uploadData.append("logo", hospitalLogo);
    hospitalImages.forEach((file) => uploadData.append("images", file));
    Object.entries(formData.documents).forEach(([key, file]) => {
      if (file) uploadData.append(key, file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/hospitals/register`,
        uploadData
      );

      setApiSuccess(response.data?.message || "Hospital registered successfully.");
      setSubmitted(true);
      scrollToTop();
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Cannot connect to the backend. Check that your server is running on port 5000."
          : "Hospital registration failed. Please check your details and try again.")
      );
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentChange = (event, key) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [key]: "Upload a PDF, JPG or PNG file." }));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [key]: "File size must be 5 MB or less." }));
      event.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: file },
    }));
  };

  const resetForm = () => {
    setFormData(createInitialData());
    setHospitalLogo(null);
    setHospitalImages([]);
    setStep(0);
    setErrors({});
    setSubmitted(false);
    setApiError("");
    setApiSuccess("");
  };

  if (submitted) {
    return (
      <main className="lh-page">
        <section className="lh-success-page">
          <div className="lh-success-icon"><CheckCircle2 size={48} /></div>
          <span className="lh-section-eyebrow">REGISTRATION COMPLETE</span>
          <h1>Thank you for registering!</h1>
          <p>
            {apiSuccess || "Your hospital registration has been received."} Your registration may remain pending until an administrator verifies it.
          </p>
          <div className="lh-success-summary">
            <Building2 size={24} />
            <div>
              <strong>{formData.hospitalName}</strong>
              <span>{formData.city}, {formData.state}</span>
            </div>
            <ShieldCheck size={22} />
          </div>
          <button type="button" className="lh-primary-btn" onClick={resetForm}>
            Register Another Hospital <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="lh-page">
      <section className="lh-hero">
        <div className="lh-hero-inner">
          <motion.div
            className="lh-hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="lh-hero-badge">
              <ShieldCheck size={16} /> JOIN OUR HEALTHCARE NETWORK
            </span>
            <h1>Bring Your Hospital<br /><span>Closer to Patients</span></h1>
            <p>
              Make your healthcare services easier to discover. Build your
              hospital profile and help patients find the right care at the right time.
            </p>
            <div className="lh-hero-benefits">
              <span><CheckCircle2 size={18} /> Reach local patients</span>
              <span><CheckCircle2 size={18} /> Showcase your facilities</span>
              <span><CheckCircle2 size={18} /> Manage your hospital profile</span>
            </div>
            <button
              type="button"
              className="lh-primary-btn"
              onClick={() => document.getElementById("lh-register")?.scrollIntoView({ behavior: "smooth" })}
            >
              Register Your Hospital <ArrowRight size={18} />
            </button>
            <div className="lh-trust-note">
              <ShieldCheck size={17} />
              <span>Your information is used for registration and verification.</span>
            </div>
          </motion.div>

          <motion.div
            className="lh-hero-visual"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="lh-hospital-art">
              <div className="lh-art-top">
                <span className="lh-art-symbol"><Hospital size={30} /></span>
                <span className="lh-art-status"><span /> Healthcare network</span>
              </div>
              <div className="lh-art-building">
                <div className="lh-building-roof">
                  <span className="lh-medical-cross">+</span>
                  <span>HEALTHCARE</span>
                </div>
                <div className="lh-building-windows">
                  {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
                </div>
                <div className="lh-building-door" />
              </div>
              <div className="lh-floating-card lh-verified-card">
                <span className="lh-floating-icon"><ShieldCheck size={22} /></span>
                <span><strong>Trusted care</strong><small>Verified profiles</small></span>
              </div>
              <div className="lh-floating-card lh-appointment-card">
                <span className="lh-floating-icon"><CalendarDays size={22} /></span>
                <span><strong>Patient access</strong><small>Appointments made easier</small></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="lh-registration" id="lh-register">
        <SectionHeading
          eyebrow="PROVIDER REGISTRATION"
          title="List Your Hospital"
          description="Complete the following steps to create your hospital profile."
        />

        <div className="lh-wizard">
          <div className="lh-progress-top">
            <span>Registration progress</span>
            <strong>{Math.round(((step + 1) / steps.length) * 100)}%</strong>
          </div>
          <div className="lh-progress-track">
            <div className="lh-progress-fill" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>

          <div className="lh-stepper">
            {steps.map((item, index) => {
              const StepIcon = item.icon;
              const active = index === step;
              const complete = index < step;
              return (
                <button
                  type="button"
                  key={item.label}
                  className={`lh-step ${active ? "active" : ""} ${complete ? "complete" : ""}`}
                  onClick={() => {
                    if (index < step) {
                      setStep(index);
                      setErrors({});
                    }
                  }}
                  disabled={index > step}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="lh-step-icon">
                    {complete ? <CheckCircle2 size={19} /> : <StepIcon size={19} />}
                  </span>
                  <span className="lh-step-label">{item.label}</span>
                </button>
              );
            })}
          </div>

          <form className="lh-form-card" onSubmit={handleSubmit} noValidate>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && (
                  <>
                    <div className="lh-form-title">
                      <span className="lh-title-icon"><Building2 size={23} /></span>
                      <div><h3>Hospital Information</h3><p>Tell us about your healthcare facility and its ownership.</p></div>
                    </div>
                    <div className="lh-form-grid">
                      <Field label="Hospital / Clinic Name" name="hospitalName" icon={Building2} placeholder="e.g. City Care Hospital" required value={formData.hospitalName} onChange={handleChange} error={errors.hospitalName} />
                      <Field label="Facility Type" name="facilityType" icon={Hospital} required error={errors.facilityType}>
                        <select name="facilityType" value={formData.facilityType} onChange={handleChange} required>
                          <option value="">Select facility type</option>
                          {["Multi-specialty Hospital", "General Hospital", "Specialty Hospital", "Clinic", "Nursing Home", "Diagnostic Centre"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </Field>
                      <Field label="Ownership Type" name="ownershipType" icon={ShieldCheck} required error={errors.ownershipType}>
                        <select name="ownershipType" value={formData.ownershipType} onChange={handleChange} required>
                          <option value="">Select ownership</option>
                          {["Individual", "Partnership", "Private Limited", "Public Limited", "Trust / NGO", "Government"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </Field>
                      <Field label="Year Established" name="establishedYear" icon={CalendarDays} type="number" placeholder="e.g. 2018" min="1800" max={new Date().getFullYear()} value={formData.establishedYear} onChange={handleChange} error={errors.establishedYear} />
                      <Field label="Hospital Registration Number" name="registrationNumber" icon={FileCheck} placeholder="Enter registration number" value={formData.registrationNumber} onChange={handleChange} error={errors.registrationNumber} />
                      <Field label="Hospital Website" name="website" icon={Globe} placeholder="https://yourhospital.com" type="url" value={formData.website} onChange={handleChange} error={errors.website} />
                      <Field label="Authorized Person's Name" name="ownerName" icon={Users} placeholder="Full name" required value={formData.ownerName} onChange={handleChange} error={errors.ownerName} />
                      <Field label="Designation" name="designation" icon={UserRound}>
                        <select name="designation" value={formData.designation} onChange={handleChange}>
                          <option value="">Select designation</option>
                          {["Hospital Owner", "Medical Director", "Administrator", "Authorized Representative"].map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </Field>
                      <Field label="Official Email" name="email" icon={Mail} type="email" placeholder="admin@hospital.com" required value={formData.email} onChange={handleChange} error={errors.email} />
                      <Field label="Primary Mobile Number" name="phone" icon={Phone} type="tel" placeholder="10-digit mobile number" maxLength={10} required value={formData.phone} onChange={handleChange} error={errors.phone} />
                      <Field label="Alternate Contact Number" name="alternatePhone" icon={Phone} type="tel" placeholder="Optional" maxLength={10} value={formData.alternatePhone} onChange={handleChange} error={errors.alternatePhone} />
                    </div>
                    <div className="lh-form-grid lh-spaced-heading">
                      <label className="lh-upload-box">
                        <span className="lh-upload-icon"><Upload size={21} /></span>
                        <strong>Hospital Logo</strong>
                        <small>JPG, PNG or WEBP · max 5 MB</small>
                        <span className="lh-upload-action">{hospitalLogo?.name || "Choose logo"}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!file.type.startsWith("image/")) { setApiError("Please select an image file for the hospital logo."); e.target.value = ""; return; }
                          if (file.size > 5 * 1024 * 1024) { setApiError("Hospital logo must be 5 MB or less."); e.target.value = ""; return; }
                          setApiError(""); setHospitalLogo(file);
                        }} />
                      </label>
                      <label className="lh-upload-box">
                        <span className="lh-upload-icon"><Upload size={21} /></span>
                        <strong>Hospital Photos</strong>
                        <small>JPG, PNG or WEBP · up to 5 photos, 5 MB each</small>
                        <span className="lh-upload-action">{hospitalImages.length ? `${hospitalImages.length} photo(s) selected` : "Choose photos"}</span>
                        <input type="file" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 5) { setApiError("You can upload a maximum of 5 hospital photos."); e.target.value = ""; return; }
                          if (files.some((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) { setApiError("Each hospital photo must be a JPG, PNG or WEBP image of 5 MB or less."); e.target.value = ""; return; }
                          setApiError(""); setHospitalImages(files);
                        }} />
                      </label>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="lh-form-title">
                      <span className="lh-title-icon"><MapPin size={23} /></span>
                      <div><h3>Hospital Location</h3><p>Help patients find your facility with accurate address details.</p></div>
                    </div>
                    <div className="lh-form-grid">
                      <Field label="Street Address" name="address" icon={MapPin} placeholder="Building, street and area" required className="lh-full" value={formData.address} onChange={handleChange} error={errors.address} />
                      <Field label="Landmark" name="landmark" icon={MapPin} placeholder="Nearby landmark" value={formData.landmark} onChange={handleChange} error={errors.landmark} />
                      <Field label="City" name="city" icon={Building2} placeholder="Enter city" required value={formData.city} onChange={handleChange} error={errors.city} />
                      <Field label="State" name="state" icon={MapPin} required error={errors.state}>
                        <select name="state" value={formData.state} onChange={handleChange} required>
                          <option value="">Select state</option>
                          {states.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </Field>
                      <Field label="PIN Code" name="pincode" icon={MapPin} placeholder="6-digit PIN code" maxLength={6} required value={formData.pincode} onChange={handleChange} error={errors.pincode} />
                      <Field label="Country" name="country" icon={Globe} value={formData.country} onChange={handleChange} />
                    </div>
                    <div className="lh-info-box"><MapPin size={20} /><p><strong>Map location:</strong> A map pin can be added after registration to improve location accuracy.</p></div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="lh-form-title">
                      <span className="lh-title-icon"><Stethoscope size={23} /></span>
                      <div><h3>Services & Facilities</h3><p>Select your specialties and the facilities available at your hospital.</p></div>
                    </div>
                    <div className="lh-subheading"><h4>Medical Specialties <span>*</span></h4><p>Select all specialties that apply.</p></div>
                    <div className="lh-option-grid">
                      {specialties.map((item) => (
                        <label key={item} className={`lh-option ${formData.specialties.includes(item) ? "selected" : ""}`}>
                          <input type="checkbox" checked={formData.specialties.includes(item)} onChange={() => toggleOption("specialties", item)} />
                          <span className="lh-custom-check">{formData.specialties.includes(item) && <CheckCircle2 size={16} />}</span>
                          {item}
                        </label>
                      ))}
                    </div>
                    {errors.specialties && <p className="lh-error">{errors.specialties}</p>}
                    <div className="lh-subheading lh-spaced-heading"><h4>Hospital Facilities</h4><p>Choose the services currently available.</p></div>
                    <div className="lh-option-grid">
                      {facilityOptions.map((item) => (
                        <label key={item} className={`lh-option ${formData.facilities.includes(item) ? "selected" : ""}`}>
                          <input type="checkbox" checked={formData.facilities.includes(item)} onChange={() => toggleOption("facilities", item)} />
                          <span className="lh-custom-check">{formData.facilities.includes(item) && <CheckCircle2 size={16} />}</span>
                          {item}
                        </label>
                      ))}
                    </div>
                    <div className="lh-form-grid lh-spaced-heading">
                      <Field label="24/7 Emergency Service" name="emergency" icon={HeartPulse}>
                        <select name="emergency" value={formData.emergency} onChange={handleChange}><option>No</option><option>Yes</option></select>
                      </Field>
                      <Field label="Total Bed Capacity" name="totalBeds" icon={BedDouble} type="number" min="0" placeholder="e.g. 100" value={formData.totalBeds} onChange={handleChange} />
                      <Field label="OPD Opening Time" name="openingTime" icon={Clock} type="time" value={formData.openingTime} onChange={handleChange} />
                      <Field label="OPD Closing Time" name="closingTime" icon={Clock} type="time" value={formData.closingTime} onChange={handleChange} />
                      <Field label="Consultation Fee (₹)" name="consultationFee" icon={Stethoscope} type="number" min="0" placeholder="e.g. 500" value={formData.consultationFee} onChange={handleChange} />
                    </div>
                    <label className="lh-field lh-description-field">
                      <span className="lh-label">About Your Hospital</span>
                      <textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your hospital, care philosophy and key services..." rows={4} maxLength={1000} />
                      <span className="lh-character-count">{formData.description.length}/1000</span>
                    </label>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="lh-form-title">
                      <span className="lh-title-icon"><Users size={23} /></span>
                      <div><h3>Doctors & Medical Team</h3><p>Add the doctors associated with your facility. You can add more than one.</p></div>
                    </div>
                    {errors.doctors && <p className="lh-error">{errors.doctors}</p>}
                    {formData.doctors.map((doctor, index) => (
                      <div className="lh-doctor-card" key={index}>
                        <div className="lh-doctor-card-heading">
                          <span className="lh-doctor-number">Doctor {index + 1}</span>
                          {formData.doctors.length > 1 && <button type="button" className="lh-remove-btn" onClick={() => removeDoctor(index)}><Trash2 size={16} /> Remove</button>}
                        </div>
                        <div className="lh-form-grid">
                          <Field label="Doctor's Full Name" name={`doctor-name-${index}`} icon={Users} placeholder="Doctor's name" required={index === 0} value={doctor.name} onChange={(e) => updateDoctor(index, "name", e.target.value)} error={errors[`doctor-${index}`]} />
                          <Field label="Qualification" name={`doctor-qualification-${index}`} icon={FileCheck} placeholder="e.g. MBBS, MD" value={doctor.qualification} onChange={(e) => updateDoctor(index, "qualification", e.target.value)} />
                          <Field label="Specialty" name={`doctor-specialty-${index}`} icon={Stethoscope}>
                            <select value={doctor.specialty} onChange={(e) => updateDoctor(index, "specialty", e.target.value)}>
                              <option value="">Select specialty</option>
                              {specialties.map((item) => <option key={item}>{item}</option>)}
                            </select>
                          </Field>
                          <Field label="Experience (years)" name={`doctor-experience-${index}`} icon={Clock} type="number" min="0" placeholder="e.g. 8" value={doctor.experience} onChange={(e) => updateDoctor(index, "experience", e.target.value)} error={errors[`doctor-experience-${index}`]} />
                          <Field label="Medical Council Registration Number" name={`doctor-registration-${index}`} icon={ShieldCheck} placeholder="Enter registration number" className="lh-full" value={doctor.registrationNumber} onChange={(e) => updateDoctor(index, "registrationNumber", e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="lh-add-doctor" onClick={addDoctor}><Plus size={18} /> Add Another Doctor</button>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="lh-form-title">
                      <span className="lh-title-icon"><FileCheck size={23} /></span>
                      <div><h3>Documents & Verification</h3><p>Provide relevant documents required for your facility and jurisdiction.</p></div>
                    </div>
                    <div className="lh-info-box"><ShieldCheck size={22} /><p><strong>Secure document handling</strong> Files are uploaded with your registration. Only upload documents you are authorized to share.</p></div>
                    <div className="lh-upload-grid">
                      {documentOptions.map(([key, label, hint]) => (
                        <label className="lh-upload-box" key={key}>
                          <span className="lh-upload-icon"><Upload size={21} /></span>
                          <strong>{label}</strong>
                          <small>{hint}</small>
                          <span className="lh-upload-action">{formData.documents[key]?.name || "Choose document"}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentChange(e, key)} />
                          {errors[key] && <span className="lh-error">{errors[key]}</span>}
                        </label>
                      ))}
                    </div>
                    <label className="lh-declaration">
                      <input type="checkbox" checked={formData.declaration} onChange={(e) => updateField("declaration", e.target.checked)} />
                      <span>I confirm that the information provided is accurate, and I am authorized to submit this hospital registration. I understand that documents may be reviewed before the hospital is published.</span>
                    </label>
                    {errors.declaration && <p className="lh-error">{errors.declaration}</p>}
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="lh-form-title">
                      <span className="lh-title-icon"><CheckCircle2 size={23} /></span>
                      <div><h3>Review Your Registration</h3><p>Review the details below before submitting.</p></div>
                    </div>
                    <div className="lh-review-section">
                      <div className="lh-review-heading"><h4><Building2 size={18} /> Hospital Information</h4><button type="button" onClick={() => { setStep(0); setErrors({}); }}>Edit</button></div>
                      <div className="lh-review-grid">
                        <ReviewItem label="Hospital Name" value={formData.hospitalName} />
                        <ReviewItem label="Facility Type" value={formData.facilityType} />
                        <ReviewItem label="Ownership" value={formData.ownershipType} />
                        <ReviewItem label="Established" value={formData.establishedYear} />
                        <ReviewItem label="Authorized Person" value={formData.ownerName} />
                        <ReviewItem label="Designation" value={formData.designation} />
                        <ReviewItem label="Email" value={formData.email} />
                        <ReviewItem label="Phone" value={formData.phone} />
                        <ReviewItem label="Registration Number" value={formData.registrationNumber} />
                        <ReviewItem label="Website" value={formData.website} />
                      </div>
                    </div>
                    <div className="lh-review-section">
                      <div className="lh-review-heading"><h4><MapPin size={18} /> Location</h4><button type="button" onClick={() => { setStep(1); setErrors({}); }}>Edit</button></div>
                      <p className="lh-review-address">{[formData.address, formData.landmark, formData.city, formData.state, formData.pincode, formData.country].filter(Boolean).join(", ") || "No address provided."}</p>
                    </div>
                    <div className="lh-review-section">
                      <div className="lh-review-heading"><h4><Stethoscope size={18} /> Services & Facilities</h4><button type="button" onClick={() => { setStep(2); setErrors({}); }}>Edit</button></div>
                      <ReviewItem label="Specialties" value={formData.specialties.join(", ")} />
                      <ReviewItem label="Facilities" value={formData.facilities.join(", ")} />
                      <ReviewItem label="Emergency Service" value={formData.emergency} />
                      <ReviewItem label="Bed Capacity" value={formData.totalBeds} />
                      <ReviewItem label="OPD Hours" value={`${formData.openingTime} - ${formData.closingTime}`} />
                      <ReviewItem label="Consultation Fee" value={formData.consultationFee ? `₹${formData.consultationFee}` : ""} />
                      <ReviewItem label="Description" value={formData.description} />
                    </div>
                    <div className="lh-review-section">
                      <div className="lh-review-heading"><h4><Users size={18} /> Doctors</h4><button type="button" onClick={() => { setStep(3); setErrors({}); }}>Edit</button></div>
                      {formData.doctors.map((doctor, index) => (
                        <div className="lh-review-doctor" key={index}>
                          <strong>{doctor.name || "Unnamed doctor"}</strong>
                          <span>{[doctor.qualification, doctor.specialty, doctor.experience && `${doctor.experience} years experience`, doctor.registrationNumber].filter(Boolean).join(" · ") || "No additional details"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="lh-review-section">
                      <div className="lh-review-heading"><h4><FileCheck size={18} /> Documents</h4><button type="button" onClick={() => { setStep(4); setErrors({}); }}>Edit</button></div>
                      {Object.entries(formData.documents).filter(([, file]) => file).length ? (
                        Object.entries(formData.documents).filter(([, file]) => file).map(([key, file]) => <ReviewItem key={key} label={documentOptions.find(([docKey]) => docKey === key)?.[1] || key} value={file.name} />)
                      ) : <p className="lh-review-address">No documents selected.</p>}
                    </div>
                    <div className="lh-info-box"><ShieldCheck size={22} /><p>Your hospital details and selected files will be submitted together for verification.</p></div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {apiError && <div className="lh-info-box" role="alert"><ShieldCheck size={20} /><p>{apiError}</p></div>}
            <div className="lh-form-footer">
              <div className="lh-footer-note"><ShieldCheck size={17} /><span>Step {step + 1} of {steps.length}</span></div>
              <div className="lh-footer-actions">
                {step > 0 && <button type="button" className="lh-secondary-btn" onClick={previousStep}><ArrowLeft size={17} /> Back</button>}
                {step < steps.length - 1 ? (
                  <button type="button" className="lh-primary-btn" onClick={nextStep}>Continue <ArrowRight size={17} /></button>
                ) : (
                  <button type="submit" className="lh-primary-btn" disabled={loading}>{loading ? "Submitting..." : "Submit Registration"} <CheckCircle2 size={18} /></button>
                )}
              </div>
            </div>
          </form>

          <p className="lh-bottom-note"><ShieldCheck size={15} /> Registration details are subject to verification before publication.</p>
        </div>
      </section>
    </main>
  );
};

export default ListYourClinic;