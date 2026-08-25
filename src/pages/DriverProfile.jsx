import React, { useEffect, useState } from "react";
import "./DriverProfile.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaDollarSign, FaStar } from "react-icons/fa";

import {
  rejectDriverDocument,
  approveDriverDocument,
} from "../api/documentApi";

import { getDriverEarnings , getDriverDailyEarnings , getDriverWeeklyEarnings } from "../api/earningsApi";

import { approveVehicle, rejectVehicle } from "../api/vehicleApi";

import { approveProfile, rejectProfile } from "../api/profileApi";

import { getDriverRideHistory } from "../api/rideHistoryApi";
import { getAddressFromCoordinates } from "../services/geoapify";

const DriverProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const driver = state?.driver;

  // ================= STATES =================

  const [rideHistory, setRideHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [driverEarnings, setDriverEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsError, setEarningsError] = useState("");

  // ================= DRIVER EARNINGS =================

  useEffect(() => {
    if (!driver?._id) return;

    const fetchEarnings = async () => {
      try {
        setEarningsLoading(true);
        setEarningsError("");

        const data = await getDriverEarnings(driver._id);

        console.log("DRIVER EARNINGS:", data);

        setDriverEarnings(data);
      } catch (error) {
        console.error("Error fetching driver earnings:", error);

        setEarningsError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch driver earnings"
        );
      } finally {
        setEarningsLoading(false);
      }
    };

    fetchEarnings();
  }, [driver?._id]);


  useEffect(() => {
  if (!driver?._id) return;

  const fetchDailyEarnings = async () => {
    try {
      const data = await getDriverDailyEarnings(driver._id);

      console.log("DAILY DRIVER EARNINGS:", data);
    } catch (error) {
      console.error("Error fetching daily earnings:", error);
    }
  };

  fetchDailyEarnings();
}, [driver?._id]);



useEffect(() => {
  if (!driver?._id) return;

  const fetchWeeklyEarnings = async () => {
    try {
      const data = await getDriverWeeklyEarnings(driver._id);

      console.log("WEEKLY DRIVER EARNINGS:", data);
    } catch (error) {
      console.error(
        "Error fetching weekly earnings:",
        error
      );
    }
  };

  fetchWeeklyEarnings();
}, [driver?._id]);

  // ================= DRIVER RIDE HISTORY =================

  useEffect(() => {
    if (!driver?._id) return;

    const fetchRideHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await getDriverRideHistory(driver._id);

        console.log("DRIVER RIDE HISTORY:", response);

        const rides = response?.data?.rides || [];

        // Convert pickup/dropoff coordinates into addresses
        const ridesWithAddresses = await Promise.all(
          rides.map(async (ride) => {
            let pickupAddress = "Address not found";
            let dropoffAddress = "Address not found";

            // Pickup coordinates -> address
            if (ride.pickup?.lat != null && ride.pickup?.lng != null) {
              pickupAddress =
                (await getAddressFromCoordinates(
                  ride.pickup.lat,
                  ride.pickup.lng
                )) || "Address not found";
            }

            // Dropoff coordinates -> address
            if (ride.dropoff?.lat != null && ride.dropoff?.lng != null) {
              dropoffAddress =
                (await getAddressFromCoordinates(
                  ride.dropoff.lat,
                  ride.dropoff.lng
                )) || "Address not found";
            }

            return {
              ...ride,
              pickupAddress,
              dropoffAddress,
            };
          })
        );

        console.log("RIDES WITH ADDRESSES:", ridesWithAddresses);

        setRideHistory(ridesWithAddresses);
      } catch (error) {
        console.error("DRIVER RIDE HISTORY ERROR:", error);

        setHistoryError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch ride history"
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchRideHistory();
  }, [driver?._id]);

  // ================= NO DRIVER =================

  if (!driver) {
    return (
      <div className="driver-container">
        <h2>No Driver Data</h2>

        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  const docs = driver.documents;

  // ================= EARNINGS VALUE =================
  // Handles common backend response structures.
  // Check console "DRIVER EARNINGS" to confirm the exact field.

  const earningsData =
    driverEarnings?.data || driverEarnings?.result || driverEarnings;

  const totalEarnings =
    earningsData?.totalEarnings ??
    earningsData?.total ??
    earningsData?.totalAmount ??
    earningsData?.earnings ??
    earningsData?.amount ??
    0;

  // ================= PROFILE =================

  const handleApproveProfile = async () => {
    console.log(
      "Doc Status:",
      driver?.documents?.documentsApprovalStatus
    );

    console.log("Vehicle Status:", driver?.vehicle?.vehicleApproved);

    if (
      driver?.documents?.documentsApprovalStatus !== "APPROVED" ||
      driver?.vehicle?.vehicleApproved !== "APPROVED"
    ) {
      alert("Approve Documents & Vehicle first!");
      return;
    }

    try {
      await approveProfile(driver._id);

      alert("Profile Approved");

      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Profile Approve Failed"
      );
    }
  };

  const handleRejectProfile = async () => {
    const reason = prompt("Enter rejection reason:");

    if (!reason) return;

    try {
      await rejectProfile(driver._id, reason);

      alert("Profile Rejected");

      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Profile Reject Failed"
      );
    }
  };

  // ================= DOCUMENT =================

  const handleApproveDoc = async () => {
    try {
      const res = await approveDriverDocument({
        driverProfileId: driver.documents.driverProfileId,
      });

      if (res?.message === "documents already approved by admin!") {
        alert("⚠ Documents are already approved by admin!");
        return;
      }

      alert("Documents Approved");

      window.location.reload();
    } catch (err) {
      const message =
        err?.message || err?.response?.data?.message;

      if (message === "documents already approved by admin!") {
        alert("⚠ Documents are already approved by admin!");
      } else {
        alert(message || "Approve Failed");
      }
    }
  };

  const handleRejectDoc = async () => {
    const reason = prompt("Enter rejection reason:");

    if (!reason) return;

    try {
      await rejectDriverDocument({
        driverProfileId: driver.documents.driverProfileId,
        reason,
      });

      alert("Documents Rejected");

      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Reject Failed"
      );
    }
  };

  // ================= VEHICLE =================

  const handleApproveVehicle = async () => {
    try {
      await approveVehicle(driver.vehicle?.driverProfileId);

      alert("Vehicle Approved");

      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Vehicle Approve Failed"
      );
    }
  };

  const handleRejectVehicle = async () => {
    const reason = prompt("Enter rejection reason:");

    if (!reason) return;

    try {
      await rejectVehicle(
        driver.vehicle?.driverProfileId,
        reason
      );

      alert("Vehicle Rejected ❌");

      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Vehicle Reject Failed"
      );
    }
  };

  // ================= UI =================

  return (
    <div className="driver-container">
      <h2 className="page-title">
        <span>Drivers</span> / Profile
      </h2>

      {/* ================= TOP SECTION ================= */}

      <div className="top-section">
        <div className="profile-card">
          <img
            src="https://picsum.photos/400/150"
            alt="cover"
            className="cover-img"
          />

          <div className="profile-info">
            <img
              src={driver.driverProfile?.avatar}
              alt="avatar"
              className="avatar"
            />

            <h3>{driver.driverProfile?.fullname}</h3>

            <div className="doc-actions">
              <button
                className="approve-btn"
                onClick={handleApproveProfile}
              >
                Approve Profile
              </button>

              <button
                className="reject-btn"
                onClick={handleRejectProfile}
              >
                Reject Profile
              </button>
            </div>

            <div className="profile-meta">
              <div>
                <p>
                  {driver.createdAt
                    ? new Date(
                        driver.createdAt
                      ).toLocaleDateString()
                    : "N/A"}
                </p>

                <span>Member Since</span>
              </div>

              <div>
                <p>
                  {driver.driverProfile?.accountStatus ||
                    "N/A"}
                </p>

                <span>Status</span>
              </div>

              <div>
                <p>
                  <FaStar />{" "}
                  {driver.driverProfile?.rating ?? "N/A"}
                </p>

                <span>Rating</span>
              </div>
            </div>

            <button
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div className="stats">
          {/* TOTAL TRIPS */}

          <div className="stat-box">
            <h4>Total Trips</h4>

            <p>{driver.totalTrips ?? 0}</p>

            <FaCheckCircle className="icon green" />
          </div>

          {/* APPROVAL STATUS */}

          <div className="stat-box">
            <h4>Approval Status</h4>

            <p>
              {driver.driverProfile
                ?.profileApprovalStatus || "N/A"}
            </p>

            <FaCheckCircle className="icon green" />
          </div>

          {/* DRIVER EARNINGS */}

          <div className="stat-box earnings-stat-box">
            <h4>Driver Earnings</h4>

            {earningsLoading ? (
              <p>Loading...</p>
            ) : earningsError ? (
              <p className="red">Error</p>
            ) : (
              <p>
                ₹
                {Number(totalEarnings).toLocaleString(
                  "en-IN"
                )}
              </p>
            )}

            <FaDollarSign className="icon green" />
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION ================= */}

      <div className="bottom-section">
        {/* ================= PERSONAL INFO ================= */}

        <div className="info-card">
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>

          <div className="info-row">
            <span>Name</span>
            <p>
              {driver.driverProfile?.fullname || "N/A"}
            </p>
          </div>

          <div className="info-row">
            <span>Email</span>
            <p>{driver.email || "N/A"}</p>
          </div>

          <div className="info-row">
            <span>Phone</span>
            <p>{driver.phoneNumber || "N/A"}</p>
          </div>

          <div className="info-row">
            <span>Location</span>

            <p>
              {driver.driverProfile?.address?.[0]
                ? `${driver.driverProfile.address[0].area}, ${driver.driverProfile.address[0].city}`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* ================= DOCUMENTS ================= */}

        <div className="info-card">
          <div className="card-header">
            <h3>Documents</h3>
          </div>

          {[
            "driverLicense",
            "insurance",
            "vehicleRC",
          ].map((docType) => {
            const doc = docs?.[docType];

            return (
              <div className="info-row" key={docType}>
                <span>
                  {docType === "driverLicense"
                    ? "License"
                    : docType === "vehicleRC"
                    ? "RC"
                    : "Insurance"}
                </span>

                <div>
                  {doc ? (
                    <>
                      <p className="green">
                        ✔ Uploaded
                      </p>

                      {/* IMAGE */}

                      {doc.urls?.[0] && (
                        <img
                          src={doc.urls[0]}
                          className="doc-img"
                          alt={docType}
                          onClick={() =>
                            window.open(doc.urls[0])
                          }
                        />
                      )}

                      {/* CREDENTIALS */}

                      {doc.credentials && (
                        <div className="doc-credentials">
                          <p>
                            <b>No:</b>{" "}
                            {doc.credentials
                              .documentNumber || "N/A"}
                          </p>

                          <p>
                            <b>Issue:</b>{" "}
                            {doc.credentials.issuedAt ||
                              "N/A"}
                          </p>

                          <p>
                            <b>Expiry:</b>{" "}
                            {doc.credentials.expiryDate ||
                              "N/A"}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="red">
                      ✖ Not Uploaded
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* DOCUMENT ACTIONS */}

          <div
            className="doc-actions"
            style={{ marginTop: "20px" }}
          >
            <button
              className="approve-btn"
              onClick={handleApproveDoc}
            >
              Approve All Documents
            </button>

            <button
              className="reject-btn"
              onClick={handleRejectDoc}
            >
              Reject All Documents
            </button>
          </div>
        </div>

        {/* ================= VEHICLE ================= */}

        <div className="info-card">
          <div className="card-header">
            <h3>Vehicle Details</h3>
          </div>

          {driver?.vehicle ? (
            <>
              <div className="info-row">
                <span>Type</span>

                <span>
                  {driver.vehicle.vehicleType || "N/A"}
                </span>
              </div>

              <div className="info-row">
                <span>Brand</span>

                <span>
                  {driver.vehicle.brand || "N/A"}
                </span>
              </div>

              <div className="info-row">
                <span>Model</span>

                <span>
                  {driver.vehicle.model || "N/A"}
                </span>
              </div>

              <div className="info-row">
                <span>Color</span>

                <span>
                  {driver.vehicle.color || "N/A"}
                </span>
              </div>

              <div className="info-row">
                <span>Number Plate</span>

                <span className="green">
                  {driver.vehicle.numberPlateNumber ||
                    "N/A"}
                </span>
              </div>

              {/* VEHICLE IMAGE */}

              {driver.vehicle.images?.[0]?.url && (
                <div className="vehicle-img-box">
                  <img
                    src={driver.vehicle.images[0].url}
                    className="vehicle-img"
                    alt="vehicle"
                    onClick={() =>
                      window.open(
                        driver.vehicle.images[0].url
                      )
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <p className="red">
              No Vehicle Data
            </p>
          )}

          <div className="doc-actions">
            <button onClick={handleApproveVehicle}>
              Approve
            </button>

            <button onClick={handleRejectVehicle}>
              Reject
            </button>
          </div>
        </div>

        {/* ================= DRIVER EARNINGS DETAILS ================= */}

        <div className="info-card earnings-card">
          <div className="card-header">
            <h3>Driver Earnings</h3>
          </div>

          {earningsLoading ? (
            <p>Loading driver earnings...</p>
          ) : earningsError ? (
            <p className="red">{earningsError}</p>
          ) : driverEarnings ? (
            <>
              <div className="info-row">
                <span>Total Earnings</span>

                <p className="green">
                  ₹
                  {Number(totalEarnings).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              {/* Helpful debugging information until the exact
                  backend response fields are confirmed */}

              {earningsData?.totalTrips != null && (
                <div className="info-row">
                  <span>Total Earning Trips</span>

                  <p>{earningsData.totalTrips}</p>
                </div>
              )}

              {earningsData?.completedRides != null && (
                <div className="info-row">
                  <span>Completed Rides</span>

                  <p>
                    {earningsData.completedRides}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p>No earnings data found.</p>
          )}
        </div>

        {/* ================= RIDE HISTORY ================= */}

        <div className="info-card ride-history-card">
          <div className="card-header">
            <h3>Ride History</h3>
          </div>

          {historyLoading ? (
            <p>Loading ride history...</p>
          ) : historyError ? (
            <p className="red">{historyError}</p>
          ) : rideHistory.length === 0 ? (
            <p>No ride history found.</p>
          ) : (
            <div className="ride-table-wrapper">
              <table className="ride-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pickup</th>
                    <th>Destination</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {rideHistory.map((ride, index) => (
                    <tr
                      key={ride._id || index}
                    >
                      {/* NUMBER */}

                      <td className="number-cell">
                        {index + 1}
                      </td>

                      {/* PICKUP */}

                      <td className="address-cell">
                        <span className="pickup-dot"></span>

                        <span>
                          {ride.pickupAddress ||
                            "Address not found"}
                        </span>
                      </td>

                      {/* DESTINATION */}

                      <td className="address-cell">
                        <span className="destination-dot"></span>

                        <span>
                          {ride.dropoffAddress ||
                            "Address not found"}
                        </span>
                      </td>

                      {/* FARE */}

                      <td className="fare-cell">
                        {ride?.fare?.amount != null
                          ? `₹${ride.fare.amount}`
                          : "N/A"}
                      </td>

                      {/* STATUS */}

                      <td className="status-cell">
                        {ride.status || "N/A"}
                      </td>

                      {/* DATE */}

                      <td className="date-cell">
                        {ride.createdAt
                          ? new Date(
                              ride.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;