
import React, { useEffect, useState } from "react";

import {
  getRequestedRides,
  getAvailableDrivers,
  assignDriverToRide,
} from "../api/authApi";

import { getAddressFromCoordinates } from "../services/geoapify";

import "./RequestedRides.css";

export default function RequestedRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState({});

  // ==========================================
  // ASSIGN DRIVER STATES
  // ==========================================

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [driversLoading, setDriversLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  // ==========================================
  // LOAD ADDRESSES
  // ==========================================

  const loadAddresses = async (ridesData) => {
    try {
      const addressMap = {};
      const requestCache = new Map();

      const getCachedAddress = (lat, lng) => {
        const key = `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;

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

      const requests = ridesData.map(async (item) => {
        const ride = item?.ride;

        if (!ride?._id) {
          return;
        }

        // Pickup
        if (
          ride?.pickup?.lat !== undefined &&
          ride?.pickup?.lng !== undefined
        ) {
          const pickupAddress = await getCachedAddress(
            ride.pickup.lat,
            ride.pickup.lng
          );

          addressMap[`pickup-${ride._id}`] = pickupAddress;
        }

        // Dropoff
        if (
          ride?.dropoff?.lat !== undefined &&
          ride?.dropoff?.lng !== undefined
        ) {
          const dropoffAddress = await getCachedAddress(
            ride.dropoff.lat,
            ride.dropoff.lng
          );

          addressMap[`dropoff-${ride._id}`] = dropoffAddress;
        }
      });

      await Promise.all(requests);

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
      setAddresses({});

      const response = await getRequestedRides();

      console.log("REQUESTED RIDES RESPONSE:", response);

      const requestedRides = response?.data?.data || [];

      console.log("REQUESTED RIDES:", requestedRides);

      setRides(requestedRides);

      loadAddresses(requestedRides);
    } catch (err) {
      console.error("REQUESTED RIDES ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load requested rides"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH AVAILABLE DRIVERS
  // ==========================================

  const fetchAvailableDrivers = async () => {
    try {
      setDriversLoading(true);
      setAssignError("");

      const response = await getAvailableDrivers();

      console.log("AVAILABLE DRIVERS RESPONSE:", response);

      const drivers = response?.data?.data || response?.data || [];

      console.log("AVAILABLE DRIVERS:", drivers);

      setAvailableDrivers(Array.isArray(drivers) ? drivers : []);
    } catch (err) {
      console.error("AVAILABLE DRIVERS ERROR:", err);

      setAssignError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load available drivers"
      );

      setAvailableDrivers([]);
    } finally {
      setDriversLoading(false);
    }
  };

  // ==========================================
  // OPEN ASSIGN DRIVER MODAL
  // ==========================================

  const handleAssignDriver = async (ride) => {
    console.log("=================================");
    console.log("ASSIGN DRIVER CLICKED");
    console.log("SELECTED RIDE:", ride);
    console.log("RIDE VEHICLE CATEGORY:", ride?.vehicleCategory);
    console.log("FARE VEHICLE CATEGORY:", ride?.fare?.vehicleCategory);
    console.log("=================================");

    setSelectedRide(ride);
    setSelectedDriverId("");
    setAssignError("");
    setAvailableDrivers([]);
    setShowAssignModal(true);

    await fetchAvailableDrivers();
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeAssignModal = () => {
    if (assigning) {
      return;
    }

    setShowAssignModal(false);
    setSelectedRide(null);
    setSelectedDriverId("");
    setAvailableDrivers([]);
    setAssignError("");
  };

  // ==========================================
  // GET SELECTED DRIVER
  // ==========================================

  const getSelectedDriver = () => {
    if (!selectedDriverId) {
      return null;
    }

    return (
      availableDrivers.find(
        (driver) => getDriverId(driver) === selectedDriverId
      ) || null
    );
  };

  // ==========================================
  // GET VEHICLE CATEGORY
  // ==========================================

  const getVehicleCategory = (ride, driver) => {
    /*
      Priority:
      1. Ride vehicleCategory
      2. Fare vehicleCategory
      3. Driver vehicleCategory
      4. Driver vehicle.vehicleCategory
      5. Driver driverVehicle.vehicleCategory
    */

    return (
      ride?.vehicleCategory ||
      ride?.fare?.vehicleCategory ||
      driver?.vehicleCategory ||
      driver?.vehicle?.vehicleCategory ||
      driver?.driverVehicle?.vehicleCategory ||
      driver?.vehicle?.category ||
      driver?.driverVehicle?.category ||
      ""
    );
  };

  // ==========================================
  // ASSIGN SELECTED DRIVER
  // ==========================================

  const handleConfirmAssign = async () => {
    try {
      if (!selectedRide?._id) {
        setAssignError("Ride ID is missing.");
        return;
      }

      if (!selectedDriverId) {
        setAssignError("Please select a driver.");
        return;
      }

      const selectedDriver = getSelectedDriver();

      console.log("=================================");
      console.log("CONFIRM DRIVER ASSIGNMENT");
      console.log("SELECTED RIDE:", selectedRide);
      console.log("SELECTED DRIVER ID:", selectedDriverId);
      console.log(
        "SELECTED DRIVER FULL:",
        JSON.stringify(selectedDriver, null, 2)
      );

      const vehicleCategory = getVehicleCategory(
        selectedRide,
        selectedDriver
      );

      console.log("VEHICLE CATEGORY:", vehicleCategory);
      console.log("=================================");

      if (!vehicleCategory) {
        setAssignError(
          "Vehicle category is missing. The requested ride or selected driver does not contain a vehicle category."
        );

        return;
      }

      setAssigning(true);
      setAssignError("");

      const payload = {
        rideId: selectedRide._id,
        driverId: selectedDriverId,
        vehicleCategory: vehicleCategory,
      };

      console.log("ASSIGN DRIVER PAYLOAD:", payload);

     const response = await assignDriverToRide(payload);

console.log("DRIVER ASSIGNED SUCCESSFULLY:", response);

// Remove assigned ride from requested rides
setRides((prevRides) =>
  prevRides.filter(
    (item) => item?.ride?._id !== selectedRide._id
  )
);

// Close assign modal
setShowAssignModal(false);
setSelectedRide(null);
setSelectedDriverId("");
setAvailableDrivers([]);

// Refresh addresses/list from backend if required
await fetchRequestedRides();
    } catch (error) {
      console.error(
        "ASSIGN DRIVER ERROR:",
        error?.response?.data || error
      );

      setAssignError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to assign driver."
      );
    } finally {
      setAssigning(false);
    }
  };

  // ==========================================
  // GET DRIVER NAME
  // ==========================================

  const getDriverName = (driver) => {
    return (
      driver?.name ||
      driver?.fullname ||
      driver?.fullName ||
      driver?.authUser?.fullname ||
      driver?.authUser?.name ||
      driver?.user?.fullname ||
      driver?.user?.name ||
      driver?.profile?.fullname ||
      "Driver"
    );
  };

  // ==========================================
  // GET DRIVER PHONE
  // ==========================================

  const getDriverPhone = (driver) => {
    return (
      driver?.phoneNumber ||
      driver?.phone ||
      driver?.authUser?.phoneNumber ||
      driver?.user?.phoneNumber ||
      driver?.profile?.phoneNumber ||
      "Phone not available"
    );
  };

  // ==========================================
  // GET DRIVER ID
  // ==========================================

  const getDriverId = (driver) => {
    return (
      driver?.authUserId?._id ||
      driver?.authUserId ||
      driver?.authUser?._id ||
      driver?.userId ||
      driver?.driverId ||
      driver?._id ||
      ""
    );
  };

  // ==========================================
  // GET DRIVER VEHICLE
  // ==========================================

  const getDriverVehicle = (driver) => {
    const vehicle = driver?.vehicle || driver?.driverVehicle;

    if (!vehicle) {
      return "Vehicle details unavailable";
    }

    if (typeof vehicle === "string") {
      return vehicle;
    }

    const vehicleName =
      vehicle?.vehicleName ||
      vehicle?.vehicleType ||
      vehicle?.model ||
      "";

    const vehicleNumber =
      vehicle?.vehicleNumber ||
      vehicle?.registrationNumber ||
      vehicle?.number ||
      "";

    if (vehicleName && vehicleNumber) {
      return `${vehicleName} • ${vehicleNumber}`;
    }

    return vehicleName || vehicleNumber || "Vehicle details unavailable";
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
        <div className="loading-box">
          Loading requested rides...
        </div>
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

        <button
          className="retry-btn"
          onClick={fetchRequestedRides}
        >
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

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h2>Requested Rides</h2>

          <p>
            View all rides waiting for driver acceptance.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchRequestedRides}
        >
          ↻ Refresh
        </button>
      </div>

      {/* COUNT */}

      <div className="ride-count">
        <span>Pending Requests</span>

        <strong>{rides.length}</strong>
      </div>

      {/* NO RIDES */}

      {rides.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">🚕</div>

          <h3>No Requested Rides</h3>

          <p>
            There are currently no pending ride requests.
          </p>
        </div>
      ) : (
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

                const customerName =
                  profile?.fullname ||
                  authUser?.fullname ||
                  "N/A";

                const pickupAddress =
                  addresses[`pickup-${ride?._id}`];

                const dropoffAddress =
                  addresses[`dropoff-${ride?._id}`];

                return (
                  <tr key={ride?._id || index}>

                    {/* NUMBER */}

                    <td>{index + 1}</td>

                    {/* CUSTOMER */}

                    <td>
                      <div className="customer-cell">

                        <div className="customer-avatar">
                          {customerName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {customerName}
                          </strong>

                          <small>
                            {authUser?.email ||
                              "No email"}
                          </small>
                        </div>

                      </div>
                    </td>

                    {/* PHONE */}

                    <td>
                      {authUser?.phoneNumber ||
                        profile?.phoneNumber ||
                        "N/A"}
                    </td>

                    {/* PICKUP */}

                    <td>
                      <div className="location-cell">
                        <span className="pickup-dot"></span>

                        <span
                          title={
                            pickupAddress ||
                            "Loading address..."
                          }
                        >
                          {pickupAddress ||
                            "Loading address..."}
                        </span>
                      </div>
                    </td>

                    {/* DESTINATION */}

                    <td>
                      <div className="location-cell">
                        <span className="destination-dot"></span>

                        <span
                          title={
                            dropoffAddress ||
                            "Loading address..."
                          }
                        >
                          {dropoffAddress ||
                            "Loading address..."}
                        </span>
                      </div>
                    </td>

                    {/* DISTANCE */}

                    <td>
                      {ride?.fare?.distance
                        ? `${ride.fare.distance} km`
                        : "N/A"}
                    </td>

                    {/* FARE */}

                    <td>
                      <strong className="fare">
                        ₹{ride?.fare?.amount ?? "0"}
                      </strong>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span className="status-badge">
                        {ride?.status || "requested"}
                      </span>
                    </td>

                    {/* CREATED */}

                    <td>
                      {formatDate(ride?.createdAt)}
                    </td>

                    {/* ACTION */}

                    <td>
                      <button
                        className="assign-driver-btn"
                        onClick={() =>
                          handleAssignDriver(ride)
                        }
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

      {/* ==========================================
          ASSIGN DRIVER MODAL
      ========================================== */}

      {showAssignModal && (
        <div
          className="assign-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeAssignModal();
            }
          }}
        >
          <div className="assign-modal">

            {/* MODAL HEADER */}

            <div className="assign-modal-header">
              <div>
                <h2>Assign Driver</h2>

                <p>
                  Select an available online driver
                  for this ride.
                </p>
              </div>

              <button
                className="modal-close-btn"
                onClick={closeAssignModal}
                disabled={assigning}
              >
                ×
              </button>
            </div>

            {/* RIDE INFORMATION */}

            <div className="selected-ride-info">

              <div className="ride-info-title">
                Ride Details
              </div>

              <div className="ride-info-grid">

                <div>
                  <span>Customer</span>

                  <strong>
                    {selectedRide?.passenger?.profile
                      ?.fullname ||
                      selectedRide?.passenger?.authUser
                        ?.fullname ||
                      "Customer"}
                  </strong>
                </div>

                <div>
                  <span>Fare</span>

                  <strong>
                    ₹
                    {selectedRide?.fare?.amount ??
                      "0"}
                  </strong>
                </div>

                <div>
                  <span>Distance</span>

                  <strong>
                    {selectedRide?.fare?.distance
                      ? `${selectedRide.fare.distance} km`
                      : "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong className="modal-status">
                    {selectedRide?.status ||
                      "requested"}
                  </strong>
                </div>

                {/* VEHICLE CATEGORY */}

                <div>
                  <span>Vehicle Category</span>

                  <strong>
                    {getVehicleCategory(
                      selectedRide,
                      getSelectedDriver()
                    ) || "Not available"}
                  </strong>
                </div>

              </div>
            </div>

            {/* DRIVER SECTION */}

            <div className="available-driver-section">

              <div className="driver-section-header">

                <h3>Available Drivers</h3>

                {!driversLoading && (
                  <span>
                    {availableDrivers.length} available
                  </span>
                )}

              </div>

              {driversLoading ? (
                <div className="drivers-loading">

                  <div className="driver-spinner"></div>

                  <p>
                    Finding available drivers...
                  </p>

                </div>
              ) : availableDrivers.length === 0 ? (
                <div className="no-drivers">

                  <div className="no-drivers-icon">
                    🚗
                  </div>

                  <h4>
                    No Available Drivers
                  </h4>

                  <p>
                    There are currently no online
                    drivers available for assignment.
                  </p>

                  <button
                    className="refresh-drivers-btn"
                    onClick={fetchAvailableDrivers}
                  >
                    ↻ Refresh Drivers
                  </button>

                </div>
              ) : (
                <div className="drivers-list">

                  {availableDrivers.map(
                    (driver, index) => {

                      const driverId =
                        getDriverId(driver);

                      const driverName =
                        getDriverName(driver);

                      const driverPhone =
                        getDriverPhone(driver);

                      const driverVehicle =
                        getDriverVehicle(driver);

                      const driverCategory =
                        getVehicleCategory(
                          null,
                          driver
                        );

                      return (
                        <label
                          key={
                            driverId ||
                            driver?._id ||
                            index
                          }
                          className={`driver-option ${
                            selectedDriverId ===
                            driverId
                              ? "selected"
                              : ""
                          }`}
                        >

                          <input
                            type="radio"
                            name="availableDriver"
                            value={driverId}
                            checked={
                              selectedDriverId ===
                              driverId
                            }
                            onChange={() => {
                              setSelectedDriverId(
                                driverId
                              );

                              console.log(
                                "SELECTED DRIVER:",
                                driver
                              );

                              console.log(
                                "DRIVER VEHICLE CATEGORY:",
                                driverCategory
                              );
                            }}
                            disabled={!driverId}
                          />

                          <div className="driver-avatar">
                            {driverName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="driver-info">

                            <strong>
                              {driverName}
                            </strong>

                            <span>
                              {driverPhone}
                            </span>

                            <small>
                              {driverVehicle}
                            </small>

                            {driverCategory && (
                              <small>
                                Category:{" "}
                                {driverCategory}
                              </small>
                            )}

                          </div>

                          <div className="driver-online">
                            <span></span>
                            ONLINE
                          </div>

                        </label>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* ERROR */}

            {assignError && (
              <div className="assign-error">
                {assignError}
              </div>
            )}

            {/* MODAL FOOTER */}

            <div className="assign-modal-actions">

              <button
                className="modal-cancel-btn"
                onClick={closeAssignModal}
                disabled={assigning}
              >
                Cancel
              </button>

              <button
                className="confirm-assign-btn"
                onClick={handleConfirmAssign}
                disabled={
                  !selectedDriverId ||
                  assigning ||
                  driversLoading
                }
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Driver"}
              </button>

            </div>

          </div>
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
    return `${Number(location.lat).toFixed(
      5
    )}, ${Number(location.lng).toFixed(5)}`;
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

