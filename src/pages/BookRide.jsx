import { useState } from "react";
import "./BookRide.css";

import {
  registerUser,
  createRideByAdmin,
} from "../api/authApi";

import { getCoordinates } from "../services/geoapify";

export default function BookRide() {
  const [step, setStep] = useState(1);

  // =========================
  // CUSTOMER
  // =========================
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [customerId, setCustomerId] = useState("");

  // =========================
  // RIDE
  // =========================
  const [ride, setRide] = useState({
    pickup: "",
    destination: "",
    vehicleType: "Mini",
  });

  // =========================
  // RIDE RESPONSE
  // =========================
  const [rideInfo, setRideInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // CUSTOMER INPUT
  // =========================
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================
  // RIDE INPUT
  // =========================
  const handleRideChange = (e) => {
    const { name, value } = e.target;

    setRide((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =========================
  // REGISTER CUSTOMER
  // =========================
  const registerCustomer = async () => {
    try {
      setError("");

      // Validation
      if (!customer.fullName.trim()) {
        setError("Full name is required.");
        return;
      }

      if (!customer.email.trim()) {
        setError("Email is required.");
        return;
      }

      if (!customer.phoneNumber.trim()) {
        setError("Phone number is required.");
        return;
      }

      if (!customer.gender) {
        setError("Please select gender.");
        return;
      }

      if (!customer.password) {
        setError("Password is required.");
        return;
      }

      if (customer.password !== customer.confirmPassword) {
        setError("Password and Confirm Password do not match.");
        return;
      }

      if (customer.phoneNumber.length < 10) {
        setError("Please enter a valid phone number.");
        return;
      }

      setLoading(true);

      const registerData = {
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        gender: customer.gender,
        password: customer.password,
        role: "USER",
      };

      console.log("REGISTER CUSTOMER DATA:", registerData);

      const response = await registerUser(registerData);

      console.log("REGISTER CUSTOMER RESPONSE:", response);

      // Try different possible response structures
      const newCustomerId =
        response?.data?.data?._id ||
        response?.data?.data?.user?._id ||
        response?.data?._id ||
        response?.data?.user?._id;

      console.log("CUSTOMER ID:", newCustomerId);

      if (!newCustomerId) {
        throw new Error(
          "Customer registered but Customer ID was not returned."
        );
      }

      setCustomerId(newCustomerId);

      setCustomer((prev) => ({
        ...prev,
        customerId: newCustomerId,
      }));

      // IMPORTANT:
      // Ride Details is STEP 2
      setStep(2);

    } catch (err) {
      console.error("CUSTOMER REGISTER ERROR:", err);

      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Customer registration failed.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE RIDE
  // =========================
  const bookRide = async () => {
    try {
      setError("");

      if (!customerId) {
        setError("Customer ID is missing.");
        return;
      }

      if (!ride.pickup.trim()) {
        setError("Pickup location is required.");
        return;
      }

      if (!ride.destination.trim()) {
        setError("Destination is required.");
        return;
      }

      setLoading(true);

      console.log("PASSENGER ID:", customerId);
      console.log("PICKUP:", ride.pickup);
      console.log("DESTINATION:", ride.destination);

      // =========================
      // CONVERT PICKUP TO COORDINATES
      // =========================

      const pickupCoordinates = await getCoordinates(
        ride.pickup
      );

      console.log(
        "PICKUP COORDINATES:",
        pickupCoordinates
      );

      if (!pickupCoordinates) {
        throw new Error(
          `Pickup location could not be found: ${ride.pickup}`
        );
      }

      // =========================
      // CONVERT DESTINATION
      // =========================

      const destinationCoordinates =
        await getCoordinates(ride.destination);

      console.log(
        "DESTINATION COORDINATES:",
        destinationCoordinates
      );

      if (!destinationCoordinates) {
        throw new Error(
          `Destination could not be found: ${ride.destination}`
        );
      }

      // =========================
      // CREATE RIDE DATA
      // =========================

      const data = {
        passengerId: customerId,

        pickup: {
          lat: Number(pickupCoordinates.lat),
          lng: Number(pickupCoordinates.lng),
        },

        dropoff: {
          lat: Number(destinationCoordinates.lat),
          lng: Number(destinationCoordinates.lng),
        },
      };

      console.log("CREATE RIDE DATA:", data);

      // Prevent NaN values
      if (
        !Number.isFinite(data.pickup.lat) ||
        !Number.isFinite(data.pickup.lng) ||
        !Number.isFinite(data.dropoff.lat) ||
        !Number.isFinite(data.dropoff.lng)
      ) {
        throw new Error(
          "Invalid coordinates received from Geoapify."
        );
      }

      // =========================
      // CREATE RIDE API
      // =========================

      const response = await createRideByAdmin(data);

      console.log(
        "CREATE RIDE RESPONSE:",
        response
      );

      // Save ride response
      setRideInfo(response?.data?.data || response?.data);

      // Show success page
      setStep(3);

    } catch (err) {
      console.error("CREATE RIDE ERROR:", err);

      const message =
        err?.message ||
        err?.response?.data?.message ||
        "Failed to create ride.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET
  // =========================

  const resetBookRide = () => {
    setCustomer({
      fullName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      password: "",
      confirmPassword: "",
    });

    setCustomerId("");

    setRide({
      pickup: "",
      destination: "",
      vehicleType: "Mini",
    });

    setRideInfo(null);
    setError("");
    setStep(1);
  };

  return (
    <div className="bookride-container">

      <div className="bookride-header">
        <h2>Book Ride For Client</h2>
        <p>Create a customer and book a ride from the admin panel.</p>
      </div>

      {/* =========================
          STEPS
      ========================= */}

      <div className="steps">

        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <span>1</span>
          <p>Customer</p>
        </div>

        <div className="step-line"></div>

        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <span>2</span>
          <p>Ride Details</p>
        </div>

        <div className="step-line"></div>

        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <span>3</span>
          <p>Completed</p>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* =========================
          STEP 1
      ========================= */}

      {step === 1 && (
        <div className="card">

          <div className="card-header">
            <h3>Create New Customer</h3>
            <p>Enter customer information.</p>
          </div>

          <div className="form-grid">

            {/* FULL NAME */}

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter full name"
                value={customer.fullName}
                onChange={handleCustomerChange}
              />
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={customer.email}
                onChange={handleCustomerChange}
              />
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={customer.phoneNumber}
                onChange={handleCustomerChange}
              />
            </div>

            {/* GENDER */}

            <div className="form-group">
              <label>Gender</label>

              <select
                name="gender"
                value={customer.gender}
                onChange={handleCustomerChange}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* PASSWORD */}

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={customer.password}
                onChange={handleCustomerChange}
              />
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={customer.confirmPassword}
                onChange={handleCustomerChange}
              />
            </div>

          </div>

          <div className="button-area">

            <button
              onClick={registerCustomer}
              disabled={loading}
            >
              {loading
                ? "Creating Customer..."
                : "Continue"}
            </button>

          </div>

        </div>
      )}

      {/* =========================
          STEP 2
      ========================= */}

      {step === 2 && (
        <div className="card">

          <div className="card-header">
            <h3>Ride Details</h3>
            <p>Enter pickup and destination.</p>
          </div>

          {/* CUSTOMER SUMMARY */}

          <div className="customer-summary">

            <h4>Customer Information</h4>

            <div className="summary-grid">

              <div>
                <span>Name</span>
                <strong>{customer.fullName}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{customer.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{customer.phoneNumber}</strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>{customer.gender}</strong>
              </div>

            </div>

          </div>

          {/* RIDE FORM */}

          <div className="ride-form">

            {/* PICKUP */}

            <div className="form-group">

              <label>
                Pickup Location
              </label>

              <input
                type="text"
                name="pickup"
                placeholder="e.g. Chiplun"
                value={ride.pickup}
                onChange={handleRideChange}
              />

              <small>
                Location will automatically be converted
                into coordinates.
              </small>

            </div>

            {/* DESTINATION */}

            <div className="form-group">

              <label>
                Destination
              </label>

              <input
                type="text"
                name="destination"
                placeholder="e.g. Ratnagiri"
                value={ride.destination}
                onChange={handleRideChange}
              />

              <small>
                Location will automatically be converted
                into coordinates.
              </small>

            </div>

            {/* VEHICLE */}

            <div className="form-group">

              <label>
                Vehicle Type
              </label>

              <select
                name="vehicleType"
                value={ride.vehicleType}
                onChange={handleRideChange}
              >
                <option value="Mini">
                  Mini
                </option>

                <option value="Sedan">
                  Sedan
                </option>

                <option value="SUV">
                  SUV
                </option>
              </select>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="button-area">

            <button
              className="secondary-button"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>

            <button
              onClick={bookRide}
              disabled={loading}
            >
              {loading
                ? "Booking Ride..."
                : "Book Ride"}
            </button>

          </div>

        </div>
      )}

      {/* =========================
          STEP 3
      ========================= */}

      {step === 3 && (
        <div className="card success-card">

          <div className="success-icon">
            ✓
          </div>

          <h3>
            Ride Booked Successfully
          </h3>

          <p>
            The ride has been created successfully.
          </p>

          {/* CUSTOMER */}

          <div className="success-section">

            <h4>Customer Information</h4>

            <div className="success-grid">

              <div>
                <span>Name</span>
                <strong>
                  {customer.fullName}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {customer.phoneNumber}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {customer.email}
                </strong>
              </div>

            </div>

          </div>

          {/* RIDE INFORMATION */}

          <div className="success-section">

            <h4>Ride Information</h4>

            <div className="success-grid">

              <div className="location-box">
                <span>Pickup</span>

                <strong>
                  {ride.pickup}
                </strong>
              </div>

              <div className="location-box">
                <span>Destination</span>

                <strong>
                  {ride.destination}
                </strong>
              </div>

              <div>
                <span>Vehicle</span>

                <strong>
                  {ride.vehicleType}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong className="status">
                  Searching for Driver
                </strong>
              </div>

            </div>

          </div>

          {/* COORDINATES */}

          {rideInfo && (
            <div className="success-section">

              <h4>Ride Details</h4>

              <div className="ride-response">

                <p>
                  <strong>Ride ID:</strong>{" "}
                  {rideInfo?._id ||
                    rideInfo?.rideId ||
                    "Created"}
                </p>

                <p>
                  <strong>Pickup:</strong>{" "}
                  {ride.pickup}
                </p>

                <p>
                  <strong>Destination:</strong>{" "}
                  {ride.destination}
                </p>

                <p>
                  <strong>Vehicle:</strong>{" "}
                  {ride.vehicleType}
                </p>

              </div>

            </div>
          )}

          <button
            className="new-ride-button"
            onClick={resetBookRide}
          >
            Book Another Ride
          </button>

        </div>
      )}

    </div>
  );
}