import React, { useEffect, useState } from "react";
import "./DriverProfile.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaStar } from "react-icons/fa";

import {
  rejectDriverDocument,
  approveDriverDocument,
} from "../api/documentApi";

import {
  getDriverEarnings,
  getDriverDailyEarnings,
  getDriverWeeklyEarnings,
} from "../api/earningsApi";

import { approveVehicle, rejectVehicle } from "../api/vehicleApi";
import { approveProfile, rejectProfile } from "../api/profileApi";
import { getDriverRideHistory } from "../api/rideHistoryApi";
import { getAddressFromCoordinates } from "../services/geoapify";

// ============================================================
// WEEK DATE RANGE
// ============================================================

const getWeekDateRange = (year, week) => {
  if (!year || !week) {
    return "N/A";
  }

  // ISO week starts on Monday
  const jan4 = new Date(year, 0, 4);

  const dayOfWeek = jan4.getDay() || 7;

  // Find Monday of ISO week 1
  const mondayOfWeek1 = new Date(jan4);

  mondayOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);

  // Find Monday of requested week
  const monday = new Date(mondayOfWeek1);

  monday.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);

  // Find Sunday
  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return `${formatDate(monday)} - ${formatDate(sunday)}`;
};

// ============================================================
// COMPONENT
// ============================================================

const DriverProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const driver = state?.driver;

  // ================= STATES =================

  const [rideHistory, setRideHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [driverEarnings, setDriverEarnings] = useState(null);

  const [dailyEarnings, setDailyEarnings] = useState([]);

  const [weeklyEarningsHistory, setWeeklyEarningsHistory] = useState([]);

  const [earningsLoading, setEarningsLoading] = useState(false);

  const [dailyEarningsLoading, setDailyEarningsLoading] = useState(false);

  const [weeklyEarningsLoading, setWeeklyEarningsLoading] = useState(false);

  const [earningsError, setEarningsError] = useState("");

  // ============================================================
  // DRIVER EARNINGS
  // ============================================================

  useEffect(() => {
    if (!driver?._id) return;

    const fetchEarnings = async () => {
      try {
        setEarningsLoading(true);
        setEarningsError("");

        const data = await getDriverEarnings(driver._id);

        setDriverEarnings(data);
      } catch (error) {
        console.error("Error fetching driver earnings:", error);

        setEarningsError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch driver earnings",
        );
      } finally {
        setEarningsLoading(false);
      }
    };

    fetchEarnings();
  }, [driver?._id]);

  // ============================================================
  // DAILY EARNINGS
  // ============================================================

  useEffect(() => {
    if (!driver?._id) return;

    const fetchDailyEarnings = async () => {
      try {
        setDailyEarningsLoading(true);

        const response = await getDriverDailyEarnings(driver._id);

        console.log("DAILY EARNINGS RESPONSE:", response);

        setDailyEarnings(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching daily earnings:", error);
      } finally {
        setDailyEarningsLoading(false);
      }
    };

    fetchDailyEarnings();
  }, [driver?._id]);

  // ============================================================
  // WEEKLY EARNINGS
  // ============================================================

  useEffect(() => {
    if (!driver?._id) return;

    const fetchWeeklyEarnings = async () => {
      try {
        setWeeklyEarningsLoading(true);

        const response = await getDriverWeeklyEarnings(driver._id);

        console.log("WEEKLY EARNINGS FULL RESPONSE:", response);

        console.log("WEEKLY EARNINGS DATA:", response?.data);

        console.log(
          "WEEKLY FIRST ID:",
          JSON.stringify(response?.data?.[0]?._id, null, 2),
        );

        setWeeklyEarningsHistory(
          Array.isArray(response?.data) ? response.data : [],
        );
      } catch (error) {
        console.error("Error fetching weekly earnings:", error);
      } finally {
        setWeeklyEarningsLoading(false);
      }
    };

    fetchWeeklyEarnings();
  }, [driver?._id]);

  // ============================================================
  // DRIVER RIDE HISTORY
  // ============================================================

  useEffect(() => {
    if (!driver?._id) return;

    const fetchRideHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await getDriverRideHistory(driver._id);

        const rides = response?.data?.rides || [];

        const ridesWithAddresses = await Promise.all(
          rides.map(async (ride) => {
            let pickupAddress = "Address not found";

            let dropoffAddress = "Address not found";

            if (ride.pickup?.lat != null && ride.pickup?.lng != null) {
              pickupAddress =
                (await getAddressFromCoordinates(
                  ride.pickup.lat,
                  ride.pickup.lng,
                )) || "Address not found";
            }

            if (ride.dropoff?.lat != null && ride.dropoff?.lng != null) {
              dropoffAddress =
                (await getAddressFromCoordinates(
                  ride.dropoff.lat,
                  ride.dropoff.lng,
                )) || "Address not found";
            }

            return {
              ...ride,
              pickupAddress,
              dropoffAddress,
            };
          }),
        );

        setRideHistory(ridesWithAddresses);
      } catch (error) {
        console.error("Error fetching ride history:", error);

        setHistoryError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch ride history",
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchRideHistory();
  }, [driver?._id]);

  // ============================================================
  // NO DRIVER
  // ============================================================

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

  // ============================================================
  // DATA
  // ============================================================

  const docs = driver.documents;

  const earningsData =
    driverEarnings?.data || driverEarnings?.result || driverEarnings || {};

  const todayEarnings = Number(earningsData?.todayEarnings ?? 0);

  const todayRides = Number(earningsData?.todayRides ?? 0);

  const weeklyEarnings = Number(earningsData?.weeklyEarnings ?? 0);

  const weeklyRides = Number(earningsData?.weeklyRides ?? 0);

  // ============================================================
  // PROFILE ACTIONS
  // ============================================================

  const handleApproveProfile = async () => {
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
      alert(err?.response?.data?.message || "Profile Approve Failed");
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
      alert(err?.response?.data?.message || "Profile Reject Failed");
    }
  };

  // ============================================================
  // DOCUMENT ACTIONS
  // ============================================================

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
      const message = err?.response?.data?.message || err?.message;

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
      alert(err?.response?.data?.message || "Reject Failed");
    }
  };

  // ============================================================
  // VEHICLE ACTIONS
  // ============================================================

  const handleApproveVehicle = async () => {
    try {
      await approveVehicle(driver.vehicle?.driverProfileId);

      alert("Vehicle Approved");

      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Vehicle Approve Failed");
    }
  };

  const handleRejectVehicle = async () => {
    const reason = prompt("Enter rejection reason:");

    if (!reason) return;

    try {
      await rejectVehicle(driver.vehicle?.driverProfileId, reason);

      alert("Vehicle Rejected ❌");

      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.message || "Vehicle Reject Failed");
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="driver-container">
      {/* PAGE TITLE */}

      <h2 className="page-title">
        <span>Drivers</span> / Profile
      </h2>

      {/* ========================================================
          PROFILE CARD
      ======================================================== */}

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
              <button className="approve-btn" onClick={handleApproveProfile}>
                Approve Profile
              </button>

              <button className="reject-btn" onClick={handleRejectProfile}>
                Reject Profile
              </button>
            </div>

            <div className="profile-meta">
              <div>
                <p>
                  {driver.createdAt
                    ? new Date(driver.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>

                <span>Member Since</span>
              </div>

              <div>
                <p>{driver.driverProfile?.accountStatus || "N/A"}</p>

                <span>Status</span>
              </div>

              <div>
                <p>
                  <FaStar /> {driver.driverProfile?.rating ?? "N/A"}
                </p>

                <span>Rating</span>
              </div>
            </div>

            <button className="back-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          PERSONAL INFORMATION + APPROVAL
      ======================================================== */}

      <div className="profile-stats-grid">
        <div className="info-card personal-card">
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>

          <div className="info-row">
            <span>Name</span>

            <p>{driver.driverProfile?.fullname || "N/A"}</p>
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

        <div className="stat-box">
          <h4>Approval Status</h4>

          <p>{driver.driverProfile?.profileApprovalStatus || "N/A"}</p>

          <FaCheckCircle className="icon green" />
        </div>
      </div>

      {/* ========================================================
          DOCUMENTS + VEHICLE
      ======================================================== */}

      <div className="documents-vehicle-grid">
        {/* DOCUMENTS */}

        <div className="info-card documents-card">
          <div className="card-header">
            <h3>Documents</h3>
          </div>

          {["driverLicense", "insurance", "vehicleRC"].map((docType) => {
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
                      <p className="green">✔ Uploaded</p>

                      {doc.urls?.[0] && (
                        <img
                          src={doc.urls[0]}
                          className="doc-img"
                          alt={docType}
                          onClick={() => window.open(doc.urls[0])}
                        />
                      )}

                      {doc.credentials && (
                        <div className="doc-credentials">
                          <p>
                            <b>No:</b> {doc.credentials.documentNumber || "N/A"}
                          </p>

                          <p>
                            <b>Issue:</b> {doc.credentials.issuedAt || "N/A"}
                          </p>

                          <p>
                            <b>Expiry:</b> {doc.credentials.expiryDate || "N/A"}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="red">✖ Not Uploaded</p>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className="doc-actions"
            style={{
              marginTop: "20px",
            }}
          >
            <button className="approve-btn" onClick={handleApproveDoc}>
              Approve All Documents
            </button>

            <button className="reject-btn" onClick={handleRejectDoc}>
              Reject All Documents
            </button>
          </div>
        </div>

        {/* VEHICLE */}

        <div className="info-card vehicle-card">
          <div className="card-header">
            <h3>Vehicle Details</h3>
          </div>

          {driver?.vehicle ? (
            <>
              <div className="info-row">
                <span>Type</span>
                <span>{driver.vehicle.vehicleType || "N/A"}</span>
              </div>

              <div className="info-row">
                <span>Brand</span>
                <span>{driver.vehicle.brand || "N/A"}</span>
              </div>

              <div className="info-row">
                <span>Model</span>
                <span>{driver.vehicle.model || "N/A"}</span>
              </div>

              <div className="info-row">
                <span>Color</span>
                <span>{driver.vehicle.color || "N/A"}</span>
              </div>

              <div className="info-row">
                <span>Number Plate</span>

                <span className="green">
                  {driver.vehicle.numberPlateNumber || "N/A"}
                </span>
              </div>

              {driver.vehicle.images?.[0]?.url && (
                <div className="vehicle-img-box">
                  <img
                    src={driver.vehicle.images[0].url}
                    className="vehicle-img"
                    alt="vehicle"
                    onClick={() => window.open(driver.vehicle.images[0].url)}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="red">No Vehicle Data</p>
          )}

          <div className="doc-actions">
            <button onClick={handleApproveVehicle}>Approve</button>

            <button onClick={handleRejectVehicle}>Reject</button>
          </div>
        </div>
      </div>

      {/* ========================================================
          EARNINGS SUMMARY
      ======================================================== */}

      <div className="info-card earnings-card">
        <div className="card-header">
          <h3>Driver Earnings</h3>
        </div>

        {earningsLoading ? (
          <p>Loading driver earnings...</p>
        ) : earningsError ? (
          <p className="red">{earningsError}</p>
        ) : (
          <div className="earnings-summary-grid">
            <div className="earning-summary-item">
              <span>Today's Earnings</span>

              <strong>₹{todayEarnings.toLocaleString("en-IN")}</strong>
            </div>

            <div className="earning-summary-item">
              <span>Today's Rides</span>

              <strong>{todayRides}</strong>
            </div>

            <div className="earning-summary-item">
              <span>Weekly Earnings</span>

              <strong>₹{weeklyEarnings.toLocaleString("en-IN")}</strong>
            </div>

            <div className="earning-summary-item">
              <span>Weekly Rides</span>

              <strong>{weeklyRides}</strong>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          DAILY + WEEKLY EARNINGS HISTORY
      ======================================================== */}

      <div className="earning-history-grid">
        {/* ======================================================
            DAILY
        ====================================================== */}

        <div className="info-card earning-history-card">
          <div className="card-header">
            <h3>Daily Earnings History</h3>
          </div>

          {dailyEarningsLoading ? (
            <p>Loading daily earnings...</p>
          ) : dailyEarnings.length === 0 ? (
            <p>No daily earnings history found.</p>
          ) : (
            <div className="ride-table-wrapper">
              <table className="earning-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {dailyEarnings.map((earning, index) => (
                    <tr key={earning?._id ? String(earning._id) : index}>
                      <td>{index + 1}</td>

                      <td>
                        {earning.date
                          ? new Date(earning.date).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td>
                        ₹
                        {Number(earning.amount ?? 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ======================================================
            WEEKLY
        ====================================================== */}

        <div className="info-card earning-history-card">
          <div className="card-header">
            <h3>Weekly Earnings History</h3>
          </div>

          {weeklyEarningsLoading ? (
            <p>Loading weekly earnings...</p>
          ) : weeklyEarningsHistory.length === 0 ? (
            <p>No weekly earnings history found.</p>
          ) : (
            <div className="ride-table-wrapper">
              <table className="earning-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Week</th>
                    <th>Rides</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {weeklyEarningsHistory.map((earning, index) => (
                    <tr
                      key={`${earning?._id?.year}-${earning?._id?.week}-${index}`}
                    >
                      <td>{index + 1}</td>

                      <td>
                        {earning?._id?.year && earning?._id?.week
                          ? getWeekDateRange(earning._id.year, earning._id.week)
                          : "N/A"}
                      </td>

                      <td>{Number(earning?.totalRides ?? 0)}</td>

                      <td>
                        ₹
                        {Number(earning?.totalEarnings ?? 0).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          RIDE HISTORY
      ======================================================== */}

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
                  <tr key={ride?._id || index}>
                    <td className="number-cell">{index + 1}</td>

                    <td className="address-cell">
                      <span className="pickup-dot"></span>

                      <span>{ride.pickupAddress || "Address not found"}</span>
                    </td>

                    <td className="address-cell">
                      <span className="destination-dot"></span>

                      <span>{ride.dropoffAddress || "Address not found"}</span>
                    </td>

                    <td className="fare-cell">
                      {ride?.fare?.amount != null
                        ? `₹${ride.fare.amount}`
                        : "N/A"}
                    </td>

                    <td className="status-cell">{ride?.status || "N/A"}</td>

                    <td className="date-cell">
                      {ride?.createdAt
                        ? new Date(ride.createdAt).toLocaleDateString("en-IN")
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
  );
};

export default DriverProfile;
