import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RiderProfile.css";

import { getCustomerRideHistory } from "../api/rideHistoryApi";
import { getAddressFromCoordinates } from "../services/geoapify";
import { getDrivers } from "../api/driverApi";

const RiderProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const rider = location.state?.rider;

  const [rides, setRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(false);
  const [rideError, setRideError] = useState("");

  const [rideAddresses, setRideAddresses] = useState({});
  const [driversMap, setDriversMap] = useState({});

  // =========================================================
  // FETCH ALL DRIVERS
  // =========================================================

  const fetchDrivers = async () => {
    try {
      const drivers = await getDrivers();

      console.log("ALL DRIVERS RESPONSE:", drivers);

      if (!Array.isArray(drivers)) {
        console.log("DRIVERS IS NOT ARRAY:", drivers);
        setDriversMap({});
        return;
      }

      const map = {};

      drivers.forEach((driver) => {
        const driverId =
          driver?._id ||
          driver?.userId?._id ||
          driver?.userId ||
          driver?.driverId?._id ||
          driver?.driverId;

        if (!driverId) return;

        map[String(driverId)] = driver;
      });

      console.log("DRIVERS MAP:", map);

      setDriversMap(map);
    } catch (error) {
      console.error("GET ALL DRIVERS ERROR:", error);
    }
  };

  // =========================================================
  // GET CACHED ADDRESS
  // =========================================================

  const getCachedAddress = async (lat, lng, coordinateCache) => {
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      return "Address not found";
    }

    const cacheKey = `${lat},${lng}`;

    if (coordinateCache[cacheKey]) {
      return coordinateCache[cacheKey];
    }

    try {
      const address = await getAddressFromCoordinates(lat, lng);

      const finalAddress = address || "Address not found";

      coordinateCache[cacheKey] = finalAddress;

      return finalAddress;
    } catch (error) {
      console.error("GEOCODING ERROR:", error);

      coordinateCache[cacheKey] = "Address not found";

      return "Address not found";
    }
  };

  // =========================================================
  // GET COORDINATES
  // =========================================================

  const getLocationCoordinates = (locationValue) => {
    if (!locationValue) {
      return null;
    }

    // Example:
    // { lat: 16.1, lng: 73.1 }

    if (
      typeof locationValue === "object" &&
      locationValue.lat !== undefined &&
      locationValue.lng !== undefined
    ) {
      return {
        lat: locationValue.lat,
        lng: locationValue.lng,
      };
    }

    if (
      typeof locationValue === "object" &&
      Array.isArray(locationValue.coordinates) &&
      locationValue.coordinates.length >= 2
    ) {
      return {
        lng: locationValue.coordinates[0],
        lat: locationValue.coordinates[1],
      };
    }

    return null;
  };

  // =========================================================
  // FETCH RIDE HISTORY
  // =========================================================

  const fetchRideHistory = async () => {
    if (!rider?._id) {
      return;
    }

    try {
      setLoadingRides(true);
      setRideError("");

      const response = await getCustomerRideHistory(rider._id);

      console.log("CUSTOMER RIDE HISTORY RESPONSE:", response);

    
      let rideData = [];

      if (Array.isArray(response)) {
        rideData = response;
      } else if (Array.isArray(response?.data)) {
        rideData = response.data;
      } else if (Array.isArray(response?.data?.rides)) {
        rideData = response.data.rides;
      } else if (Array.isArray(response?.data?.data)) {
        rideData = response.data.data;
      } else if (Array.isArray(response?.rides)) {
        rideData = response.rides;
      }

      console.log("RIDE DATA:", rideData);

      setRides(rideData);

      // =====================================================
      // ADDRESS CACHE
      // =====================================================

      const addressMap = {};
      const coordinateCache = {};

      // =====================================================
      // CONVERT PICKUP + DESTINATION TO ADDRESS
      // =====================================================

      await Promise.all(
        rideData.map(async (ride) => {
          const rideId = ride?._id;

          if (!rideId) {
            return;
          }

          let pickupAddress = "Address not found";
          let dropoffAddress = "Address not found";

          // -----------------------------
          // PICKUP
          // -----------------------------

          const pickup =
            ride?.pickup ||
            ride?.pickupLocation ||
            ride?.pickupCoordinates;

          const pickupCoordinates = getLocationCoordinates(pickup);

          if (pickupCoordinates) {
            console.log(
              "REVERSE GEOCODING PICKUP:",
              pickupCoordinates.lat,
              pickupCoordinates.lng
            );

            pickupAddress = await getCachedAddress(
              pickupCoordinates.lat,
              pickupCoordinates.lng,
              coordinateCache
            );
          }

          // -----------------------------
          // DESTINATION
          // -----------------------------

          const dropoff =
            ride?.dropoff ||
            ride?.destination ||
            ride?.dropoffLocation ||
            ride?.destinationCoordinates;

          const dropoffCoordinates = getLocationCoordinates(dropoff);

          if (dropoffCoordinates) {
            console.log(
              "REVERSE GEOCODING DROPOFF:",
              dropoffCoordinates.lat,
              dropoffCoordinates.lng
            );

            dropoffAddress = await getCachedAddress(
              dropoffCoordinates.lat,
              dropoffCoordinates.lng,
              coordinateCache
            );
          }

          addressMap[rideId] = {
            pickupAddress,
            dropoffAddress,
          };
        })
      );

      console.log("ADDRESS MAP:", addressMap);

      setRideAddresses(addressMap);
    } catch (error) {
      console.error("GET CUSTOMER RIDE HISTORY ERROR:", error);

      setRideError("Failed to load ride history.");
      setRides([]);
      setRideAddresses({});
    } finally {
      setLoadingRides(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (!rider?._id) {
      return;
    }

    fetchRideHistory();
    fetchDrivers();
  }, [rider?._id]);

  // =========================================================
  // FORMAT DRIVER
  // =========================================================

  const formatDriver = (driverValue) => {
    if (!driverValue) {
      return "N/A";
    }

    // -----------------------------------------
    // DRIVER OBJECT
    // -----------------------------------------

    if (typeof driverValue === "object") {
      const id =
        driverValue?._id ||
        driverValue?.id ||
        driverValue?.userId?._id ||
        driverValue?.driverId?._id ||
        driverValue?.driverId;

      const directName =
        driverValue?.fullname ||
        driverValue?.fullName ||
        driverValue?.name ||
        driverValue?.driverProfile?.fullname ||
        driverValue?.profile?.fullname ||
        driverValue?.user?.fullname ||
        driverValue?.user?.fullName;

      if (directName) {
        return directName;
      }

      if (id && driversMap[String(id)]) {
        const driver = driversMap[String(id)];

        return (
          driver?.fullname ||
          driver?.fullName ||
          driver?.name ||
          driver?.driverProfile?.fullname ||
          driver?.profile?.fullname ||
          driver?.user?.fullname ||
          driver?.user?.fullName ||
          driver?.phoneNumber ||
          "N/A"
        );
      }

      return driverValue?.phoneNumber || "N/A";
    }

    // -----------------------------------------
    // DRIVER ID
    // -----------------------------------------

    if (typeof driverValue === "string") {
      const driver = driversMap[String(driverValue)];

      if (driver) {
        return (
          driver?.fullname ||
          driver?.fullName ||
          driver?.name ||
          driver?.driverProfile?.fullname ||
          driver?.profile?.fullname ||
          driver?.user?.fullname ||
          driver?.user?.fullName ||
          driver?.phoneNumber ||
          "N/A"
        );
      }

      return driverValue;
    }

    return "N/A";
  };

  // =========================================================
  // GET DRIVER FROM RIDE
  // =========================================================

  const getRideDriver = (ride) => {
    return (
      ride?.driverId ||
      ride?.driver ||
      ride?.driverDetails ||
      ride?.driverProfile ||
      null
    );
  };

  // =========================================================
  // NO RIDER
  // =========================================================

  if (!rider) {
    return (
      <div className="profile-container">
        <h2>No Rider Data Found</h2>

        <button
          className="back-btn"
          onClick={() => navigate("/customers")}
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="profile-container">

      {/* HEADER */}

      <div className="profile-header">
        <h2>
          <span className="green">Customers</span> / Profile
        </h2>
      </div>

      {/* PROFILE CARD */}

      <div className="profile-card-user">

        <div className="cover-image"></div>

        <div className="profile-info-user">

          <div className="avatar-user">
            {rider?.riderProfile?.fullname
              ?.charAt(0)
              ?.toUpperCase() || "R"}
          </div>

          <h2>
            {rider?.riderProfile?.fullname || "Customer"}
          </h2>

          <div className="stats-user">

            <div>
              <h4>
                {rider?.createdAt
                  ? new Date(
                      rider.createdAt
                    ).toLocaleDateString()
                  : "N/A"}
              </h4>
              <p>Member Since</p>
            </div>

            <div>
              <h4>
                {rider?.accountStatus || "ACTIVE"}
              </h4>
              <p>Status</p>
            </div>

            <div>
              <h4>5/5</h4>
              <p>Rating</p>
            </div>

          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/customers")}
          >
            Back
          </button>

        </div>
      </div>

      {/* PERSONAL INFORMATION */}

      <div className="info-card-user">

        <h3>Personal Information</h3>

        <div className="info-row">
          <strong>Full Name:</strong>
          <span>
            {rider?.riderProfile?.fullname || "N/A"}
          </span>
        </div>

        <div className="info-row">
          <strong>Email:</strong>
          <span>
            {rider?.email || "N/A"}
          </span>
        </div>

        <div className="info-row">
          <strong>Phone:</strong>
          <span>
            {rider?.phoneNumber || "N/A"}
          </span>
        </div>

        <div className="info-row">
          <strong>Status:</strong>
          <span>
            {rider?.accountStatus || "ACTIVE"}
          </span>
        </div>

      </div>

      {/* RIDE HISTORY */}

      <div className="info-card-user ride-history-card">

        <div className="ride-history-header">

          <h3>Ride History</h3>

          <button
            className="refresh-ride-btn"
            onClick={fetchRideHistory}
            disabled={loadingRides}
          >
            {loadingRides ? "Loading..." : "Refresh"}
          </button>

        </div>

        {/* LOADING */}

        {loadingRides && (
          <div className="ride-loading">
            Loading ride history...
          </div>
        )}

        {/* ERROR */}

        {!loadingRides && rideError && (
          <div className="ride-error">
            {rideError}
          </div>
        )}

        {/* NO RIDES */}

        {!loadingRides &&
          !rideError &&
          rides.length === 0 && (
            <div className="no-rides">
              No ride history found.
            </div>
          )}

        {/* TABLE */}

        {!loadingRides &&
          !rideError &&
          rides.length > 0 && (

            <div className="ride-table-wrapper">

              <table className="ride-history-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pickup</th>
                    <th>Destination</th>
                    <th>Driver</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {rides.map((ride, index) => {

                    console.log(
                      "CURRENT RIDE FULL DATA:",
                      ride
                    );

                    const driver = getRideDriver(ride);

                    const driverName = formatDriver(driver);

                    const fareAmount =
                      ride?.fare?.amount !== undefined
                        ? ride.fare.amount
                        : ride?.totalFare;

                    const currency =
                      ride?.fare?.currency || "INR";

                    const pickupAddress =
                      rideAddresses[ride?._id]
                        ?.pickupAddress ||
                      "Loading...";

                    const dropoffAddress =
                      rideAddresses[ride?._id]
                        ?.dropoffAddress ||
                      "Loading...";

                    const status =
                      ride?.status || "N/A";

                    const rideDate =
                      ride?.createdAt ||
                      ride?.date;

                    return (
                      <tr
                        key={ride?._id || index}
                      >

                        {/* NUMBER */}

                        <td className="number-cell">
                          {index + 1}
                        </td>

                        {/* PICKUP */}

                        <td className="location-cell">
                          <div className="location-content">
                            <span className="location-dot">●</span>
                            <span className="location-text">
                              {pickupAddress}
                            </span>
                          </div>
                        </td>

                        {/* DESTINATION */}

                        <td className="location-cell">
                          <div className="location-content">
                            <span className="location-dot dropoff-dot">●</span>
                            <span className="location-text">
                              {dropoffAddress}
                            </span>
                          </div>
                        </td>

                        {/* DRIVER */}

                        <td className="driver-cell">
                          {driverName}
                        </td>

                        {/* FARE */}

                        <td className="fare-cell">

                          {fareAmount !== undefined &&
                          fareAmount !== null
                            ? `${currency} ${fareAmount}`
                            : "N/A"}

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`ride-status ${
                              status
                                ? String(status).toLowerCase()
                                : ""
                            }`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="date-cell">

                          {rideDate
                            ? new Date(
                                rideDate
                              ).toLocaleDateString()
                            : "N/A"}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

      </div>

    </div>
  );
};

export default RiderProfile;