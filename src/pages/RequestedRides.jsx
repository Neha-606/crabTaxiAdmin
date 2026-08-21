import React, { useEffect, useState } from "react";
import { getRequestedRides } from "../api/authApi";
import { getAddressFromCoordinates } from "../services/geoapify";
import "./RequestedRides.css";

export default function RequestedRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState({});

  const handleAssignDriver = (ride) => {
    console.log("Assign driver for ride:", ride);
  };

  // ==========================================
  // LOAD ADDRESSES IN BACKGROUND
  // ==========================================

  const loadAddresses = async (ridesData) => {
    try {
      const addressMap = {};

      const requestCache = new Map();

      const getCachedAddress = (lat, lng) => {
        const key = `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

        // Already requested
        if (requestCache.has(key)) {
          return requestCache.get(key);
        }

        const request = getAddressFromCoordinates(lat, lng)
          .then((address) => {
            return address || "Address not found";
          })
          .catch((err) => {
            console.error("Address request failed:", err);

            return "Address not found";
          });

        requestCache.set(key, request);

        return request;
      };

      // ==========================================
      // PROCESS RIDES
      // ==========================================

      const requests = ridesData.map(async (item) => {
        const ride = item?.ride;

        if (!ride?._id) {
          return;
        }

        // ========================================
        // PICKUP
        // ========================================

        if (
          ride?.pickup?.lat !== undefined &&
          ride?.pickup?.lng !== undefined
        ) {
          const pickupAddress = await getCachedAddress(
            ride.pickup.lat,
            ride.pickup.lng,
          );

          addressMap[`pickup-${ride._id}`] = pickupAddress;
        }

        // ========================================
        // DROPOFF
        // ========================================

        if (
          ride?.dropoff?.lat !== undefined &&
          ride?.dropoff?.lng !== undefined
        ) {
          const dropoffAddress = await getCachedAddress(
            ride.dropoff.lat,
            ride.dropoff.lng,
          );

          addressMap[`dropoff-${ride._id}`] = dropoffAddress;
        }
      });

      await Promise.all(requests);

      console.log("FINAL ADDRESS MAP:", addressMap);

      // Update addresses after requests complete
      setAddresses(addressMap);
    } catch (err) {
      console.error("LOAD ADDRESSES ERROR:", err);
    }
  };

  // ==========================================
  // FETCH REQUESTED RIDES
  // ==========================================

  const fetchRequestedRides = async () => {
    try {
      setLoading(true);
      setError("");

      // Clear old addresses
      setAddresses({});

      // ========================================
      // GET RIDES
      // ========================================

      const response = await getRequestedRides();

      console.log("REQUESTED RIDES RESPONSE:", response);

      const requestedRides = response?.data?.data || [];

      console.log("REQUESTED RIDES:", requestedRides);

      // ========================================
      // SHOW RIDES IMMEDIATELY
      // ========================================

      setRides(requestedRides);

      loadAddresses(requestedRides);

      setLoading(false);
    } catch (err) {
      console.error("REQUESTED RIDES ERROR:", err);

      setError(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to load requested rides",
      );

      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchRequestedRides();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="requested-rides-container">
        <div className="loading-box">Loading requested rides...</div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="requested-rides-container">
        <div className="error-box">{error}</div>

        <button className="retry-btn" onClick={fetchRequestedRides}>
          Retry
        </button>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="requested-rides-container">
      {/* ======================================
          HEADER
      ======================================= */}

      <div className="page-header">
        <div>
          <h2>Requested Rides</h2>

          <p>View all rides waiting for driver acceptance.</p>
        </div>

        <button className="refresh-btn" onClick={fetchRequestedRides}>
          ↻ Refresh
        </button>
      </div>

      {/* ======================================
          COUNT
      ======================================= */}

      <div className="ride-count">
        <span>Pending Requests</span>

        <strong>{rides.length}</strong>
      </div>

      {/* ======================================
          NO RIDES
      ======================================= */}

      {rides.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">🚕</div>

          <h3>No Requested Rides</h3>

          <p>There are currently no pending ride requests.</p>
        </div>
      ) : (
        /* ====================================
           TABLE
        ===================================== */

        <div className="table-wrapper">
          <table className="rides-table">
            <thead>
              <tr>
                <th>#</th>

                <th>Customer</th>

                <th>Phone</th>

                <th>Pickup</th>

                <th>Destination</th>

                <th>Distance</th>

                <th>Fare</th>

                <th>Status</th>

                <th>Requested At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rides.map((item, index) => {
                const ride = item?.ride;

                const passenger = item?.passenger;

                const authUser = passenger?.authUser;

                const profile = passenger?.profile;

                // ==================================
                // CUSTOMER
                // ==================================

                const customerName =
                  profile?.fullname || authUser?.fullname || "N/A";

                // ==================================
                // ADDRESS
                // ==================================

                const pickupAddress = addresses[`pickup-${ride?._id}`];

                const dropoffAddress = addresses[`dropoff-${ride?._id}`];

                return (
                  <tr key={ride?._id || index}>
                    {/* ==============================
                          NUMBER
                      =============================== */}

                    <td>{index + 1}</td>

                    {/* ==============================
                          CUSTOMER
                      =============================== */}

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {customerName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{customerName}</strong>

                          <small>{authUser?.email || "No email"}</small>
                        </div>
                      </div>
                    </td>

                    {/* ==============================
                          PHONE
                      =============================== */}

                    <td>
                      {authUser?.phoneNumber || profile?.phoneNumber || "N/A"}
                    </td>

                    {/* ==============================
                          PICKUP
                      =============================== */}

                    <td>
                      <div className="location-cell">
                        <span className="pickup-dot"></span>

                        <span title={pickupAddress || "Loading address..."}>
                          {pickupAddress || "Loading address..."}
                        </span>
                      </div>
                    </td>

                    {/* ==============================
                          DESTINATION
                      =============================== */}

                    <td>
                      <div className="location-cell">
                        <span className="destination-dot"></span>

                        <span title={dropoffAddress || "Loading address..."}>
                          {dropoffAddress || "Loading address..."}
                        </span>
                      </div>
                    </td>

                    {/* ==============================
                          DISTANCE
                      =============================== */}

                    <td>
                      {ride?.fare?.distance
                        ? `${ride.fare.distance} km`
                        : "N/A"}
                    </td>

                    {/* ==============================
                          FARE
                      =============================== */}

                    <td>
                      <strong className="fare">
                        ₹{ride?.fare?.amount ?? "0"}
                      </strong>
                    </td>

                    {/* ==============================
                          STATUS
                      =============================== */}

                    <td>
                      <span className="status-badge">
                        {ride?.status || "requested"}
                      </span>
                    </td>

                    {/* ==============================
                          CREATED
                      =============================== */}

                    <td>{formatDate(ride?.createdAt)}</td>

                    <td>
                      <button
                        className="assign-driver-btn"
                        onClick={() => handleAssignDriver(ride)}
                      >
                        Assign Driver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// FORMAT LOCATION
// ==========================================

const formatLocation = (location) => {
  if (!location) {
    return "N/A";
  }

  if (
    typeof location === "object" &&
    location.lat !== undefined &&
    location.lng !== undefined
  ) {
    return `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(
      5,
    )}`;
  }

  return location;
};

// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {
  if (!date) {
    return "N/A";
  }

  try {
    return new Date(date).toLocaleString();
  } catch {
    return "N/A";
  }
};
