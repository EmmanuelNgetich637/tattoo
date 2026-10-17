
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import CustomCalendar from "../components/CustomCalendar";

const artists = [
  {
    id: 1,
    name: "Artist One",
    styles: "Blackwork · Fine Line · Realism · Japanese",
  },
  {
    id: 2,
    name: "Artist Two",
    styles: "Fine Line · Realism · Blackwork · Japanese",
  },
];

const styles = [
  "Fine Line",
  "Blackwork",
  "Realism",
  "Traditional",
  "Neo Traditional",
  "Minimalist",
  "Japanese",
  "Custom",
];

const placements = [
  "Arm",
  "Upper Arm",
  "Forearm",
  "Wrist",
  "Hand",
  "Shoulder",
  "Chest",
  "Back",
  "Ribs",
  "Leg",
  "Thigh",
  "Calf",
  "Ankle",
  "Neck",
  "Other",
];

const sizes = ["Small", "Medium", "Large", "Extra Large"];

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Booking() {
  const today = getTodayString();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    artist: "",
    style: "",
    description: "",
    placement: "",
    size: "",
    date: "",
    time: "",
    notes: "",
    name: "",
    email: "",
    phone: "",
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  const selectedArtist = useMemo(
    () => artists.find((artist) => artist.name === formData.artist),
    [formData.artist]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      if (!current[name]) return current;

      const updated = { ...current };
      delete updated[name];

      return updated;
    });
  };

  const selectArtist = (artistName) => {
    setFormData((current) => ({
      ...current,
      artist: artistName,
    }));

    setErrors((current) => {
      const updated = { ...current };
      delete updated.artist;

      return updated;
    });
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.artist) {
        newErrors.artist = "Please choose an artist.";
      }

      if (!formData.style) {
        newErrors.style = "Please select a tattoo style.";
      }
    }

    if (currentStep === 2) {
      if (!formData.description.trim()) {
        newErrors.description = "Please describe your tattoo idea.";
      }

      if (!formData.placement) {
        newErrors.placement = "Please select the placement.";
      }

      if (!formData.size) {
        newErrors.size = "Please select an approximate size.";
      }

      if (images.length > 5) {
        newErrors.images = "You can upload a maximum of 5 images.";
      }
    }

    if (currentStep === 3) {
      if (!formData.date) {
        newErrors.date = "Please choose a preferred date.";
      } else if (formData.date < today) {
        newErrors.date = "Please choose a future date.";
      }

      if (!formData.time) {
        newErrors.time = "Please choose a preferred time.";
      }
    }

    if (currentStep === 4) {
      if (!formData.name.trim()) {
        newErrors.name = "Please enter your full name.";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Please enter your email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
      }

      const phoneDigits = formData.phone.replace(/\D/g, "");

      if (!phoneDigits) {
        newErrors.phone = "Please enter your phone number.";
      } else if (phoneDigits.length !== 10) {
        newErrors.phone = "Please enter a 10-digit phone number.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;

    setStep((current) => Math.min(current + 1, 4));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    setImages((current) => {
      const combined = [...current, ...selectedFiles];
      const unique = [];

      combined.forEach((file) => {
        const exists = unique.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );

        if (!exists) unique.push(file);
      });

      const updated = unique.slice(0, 5);

      setErrors((currentErrors) => {
        const next = { ...currentErrors };

        if (updated.length <= 5) delete next.images;

        return next;
      });

      return updated;
    });

    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = new FormData();

      payload.append("artist", formData.artist.trim());
      payload.append("style", formData.style.trim());
      payload.append("description", formData.description.trim());
      payload.append("placement", formData.placement.trim());
      payload.append("size", formData.size.trim());
      payload.append("preferredDate", formData.date);
      payload.append("preferredTime", formData.time);
      payload.append("fullName", formData.name.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone", `+1 ${formData.phone.trim()}`);
      payload.append("notes", formData.notes.trim());

      images.forEach((image) => {
        payload.append("referenceImages", image);
      });

      const response = await api.post("/bookings", payload);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to submit booking request."
        );
      }

      setBookingReference(response.data.booking?.reference || "");
      setStep(5);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Booking submission failed:", error);

      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong while submitting your booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;

    return <p className="field-error">{errors[field]}</p>;
  };

  if (step === 5) {
    return (
      <main className="booking-page">
        <section className="booking-success">
          <div className="success-icon">
            <Check size={32} />
          </div>

          <p className="section-label">Request received</p>

          <h1>
            WE'LL BE IN
            <br />
            <span>TOUCH.</span>
          </h1>

          <p>
            Your tattoo request has been submitted. We'll review
            your idea and contact you with the next steps.
          </p>

          {bookingReference && (
            <div className="booking-reference">
              <span>Booking reference</span>
              <strong>{bookingReference}</strong>
            </div>
          )}

          <Link to="/" className="primary-button">
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <section className="booking-header">
        <p className="section-label">Book a tattoo</p>

        <h1>
          LET'S CREATE
          <br />
          <span>SOMETHING.</span>
        </h1>

        <p>
          Tell us about your idea and preferred appointment.
          We'll review your request and get back to you.
        </p>
      </section>

      <div className="booking-progress">
        {[
          ["01", "Artist"],
          ["02", "Design"],
          ["03", "Schedule"],
          ["04", "Details"],
        ].map(([number, label], index) => (
          <div
            key={number}
            className={
              step >= index + 1
                ? "booking-progress-step active"
                : "booking-progress-step"
            }
          >
            <span>{number}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        {step === 1 && (
          <section className="form-section">
            <div className="form-section-heading">
              <p className="section-label">Step 01</p>

              <h2>
                CHOOSE YOUR
                <br />
                <span>ARTIST.</span>
              </h2>

              <p>
                Choose the artist you'd like to work with, or let
                the studio find the best fit for your tattoo.
              </p>
            </div>

            <div className="artist-selection">
              {artists.map((artist, index) => {
                const selected = formData.artist === artist.name;

                return (
                  <button
                    type="button"
                    key={artist.id}
                    aria-pressed={selected}
                    className={[
                      "artist-option",
                      `artist-color-${index + 1}`,
                      selected ? "selected" : "",
                    ].join(" ")}
                    onClick={() => selectArtist(artist.name)}
                  >
                    <span className="artist-option-number">
                      0{artist.id}
                    </span>

                    <span className="artist-option-content">
                      <strong>{artist.name}</strong>
                      <small>{artist.styles}</small>
                    </span>

                    <span className="artist-check">
                      {selected ? <Check size={19} /> : null}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                aria-pressed={formData.artist === "Any artist"}
                className={[
                  "artist-option",
                  "artist-color-any",
                  formData.artist === "Any artist" ? "selected" : "",
                ].join(" ")}
                onClick={() => selectArtist("Any artist")}
              >
                <span className="artist-option-number">03</span>

                <span className="artist-option-content">
                  <strong>Any artist</strong>
                  <small>
                    Let the studio choose the best fit for your piece.
                  </small>
                </span>

                <span className="artist-check">
                  {formData.artist === "Any artist" ? (
                    <Check size={19} />
                  ) : null}
                </span>
              </button>
            </div>

            {renderError("artist")}

            <div className="form-group">
              <label htmlFor="style">Tattoo style</label>

              <select
                id="style"
                name="style"
                value={formData.style}
                onChange={handleChange}
              >
                <option value="">Select a style</option>

                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>

              {renderError("style")}
            </div>

            {formData.artist && (
              <p className="selection-note">
                Selected artist: <strong>{formData.artist}</strong>
              </p>
            )}

            <div className="booking-actions">
              <button
                type="button"
                className="primary-button"
                onClick={nextStep}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="form-section">
            <div className="form-section-heading">
              <p className="section-label">Step 02</p>

              <h2>
                TELL US ABOUT
                <br />
                <span>YOUR TATTOO.</span>
              </h2>

              <p>
                The more detail you give us, the better we can
                understand your idea.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="description">Describe your tattoo</label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your idea, references, meaning, elements, style, or anything else you'd like us to know."
                rows={7}
              />

              {renderError("description")}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="placement">Placement</label>

                <select
                  id="placement"
                  name="placement"
                  value={formData.placement}
                  onChange={handleChange}
                >
                  <option value="">Select placement</option>

                  {placements.map((placement) => (
                    <option key={placement} value={placement}>
                      {placement}
                    </option>
                  ))}
                </select>

                {renderError("placement")}
              </div>

              <div className="form-group">
                <label htmlFor="size">Approximate size</label>

                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                >
                  <option value="">Select size</option>

                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                {renderError("size")}
              </div>
            </div>

            <div className="form-group">
              <label>Reference images</label>

              <div className="upload-box">
                <label htmlFor="referenceImages" className="upload-label">
                  <Upload size={24} />
                  <span>Upload reference images</span>
                  <small>
                    JPG, PNG or WEBP · Maximum 5MB each · Up to 5 images
                  </small>
                </label>

                <input
                  id="referenceImages"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleImages}
                />
              </div>

              {errors.images && (
                <p className="field-error">{errors.images}</p>
              )}

              {images.length > 0 && (
                <div className="selected-images">
                  {images.map((image, index) => (
                    <div
                      className="selected-image"
                      key={`${image.name}-${index}`}
                    >
                      <span>{image.name}</span>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove ${image.name}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={previousStep}
              >
                <ArrowLeft size={20} /> Back
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={nextStep}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="form-section">
            <div className="form-section-heading">
              <p className="section-label">Step 03</p>

              <h2>
                FIND A TIME
                <br />
                <span>THAT WORKS.</span>
              </h2>

              <p>
                Choose your preferred date and appointment time.
                This is a request, not a confirmed appointment.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="date">Preferred date</label>

                <CustomCalendar
                  value={formData.date}
                  minDate={today}
                  onChange={(date) => {
                    setFormData((current) => ({
                      ...current,
                      date,
                    }));

                    setErrors((current) => {
                      if (!current.date) return current;

                      const updated = { ...current };
                      delete updated.date;

                      return updated;
                    });
                  }}
                />

                {formData.date && (
                  <p className="selection-note">
                    Selected: <strong>{formatDate(formData.date)}</strong>
                  </p>
                )}

                {renderError("date")}
              </div>

              <div className="form-group">
                <label htmlFor="time">Preferred time</label>

                <input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                />

                {renderError("time")}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional notes</label>

              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Anything else we should know about your appointment?"
                rows={6}
              />
            </div>

            <div className="booking-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={previousStep}
              >
                <ArrowLeft size={20} /> Back
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={nextStep}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="form-section">
            <div className="form-section-heading">
              <p className="section-label">Step 04</p>

              <h2>
                YOUR
                <br />
                <span>DETAILS.</span>
              </h2>

              <p>
                We'll use these details to contact you about your
                booking request.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                />

                {renderError("name")}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                {renderError("email")}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>

              <div className="phone-input-wrapper">
                <span className="phone-prefix">+1</span>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="5551234567"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                />
              </div>

              {renderError("phone")}
            </div>

            <div className="booking-review">
              <div className="booking-review-heading">
                <p className="section-label">Review</p>
                <h3>YOUR REQUEST</h3>
              </div>

              <div className="booking-review-grid">
                <div>
                  <span>Artist</span>
                  <strong>{formData.artist || "—"}</strong>
                </div>

                <div>
                  <span>Style</span>
                  <strong>{formData.style || "—"}</strong>
                </div>

                <div>
                  <span>Placement</span>
                  <strong>{formData.placement || "—"}</strong>
                </div>

                <div>
                  <span>Size</span>
                  <strong>{formData.size || "—"}</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {formData.date ? formatDate(formData.date) : "—"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>{formData.time || "—"}</strong>
                </div>
              </div>

              <div className="booking-review-description">
                <span>Description</span>
                <p>{formData.description || "—"}</p>
              </div>

              {images.length > 0 && (
                <div className="booking-review-description">
                  <span>Reference images</span>
                  <p>
                    {images.length} image{images.length === 1 ? "" : "s"} selected
                  </p>
                </div>
              )}
            </div>

            {submitError && (
              <p className="field-error booking-submit-error">
                {submitError}
              </p>
            )}

            <div className="booking-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={previousStep}
                disabled={isSubmitting}
              >
                <ArrowLeft size={20} /> Back
              </button>

              <button
                type="submit"
                className="primary-button submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit booking request"}

                {!isSubmitting && <ArrowRight size={20} />}
              </button>
            </div>
          </section>
        )}
      </form>
    </main>
  );
}

export default Booking;
