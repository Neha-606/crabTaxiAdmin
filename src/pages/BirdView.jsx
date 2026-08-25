import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getAvailableDrivers } from "../api/driverApi";
import "./BirdView.css";

// --------------------------------------------------
// Fix Leaflet default marker icons
// --------------------------------------------------

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --------------------------------------------------
// Bird View
// --------------------------------------------------

const BirdView = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // --------------------------------------------------
  // Fetch available drivers
  // --------------------------------------------------

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAvailableDrivers();

        console.log("Available drivers API response:", response);

        setDrivers(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch drivers:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to fetch available drivers.",
        );

        setDrivers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // --------------------------------------------------
  // Initialize Leaflet map
  // --------------------------------------------------

  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(mapRef.current, {
      center: [21.1458, 79.0882],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Fix map size when container becomes visible
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [loading]);

  // --------------------------------------------------
  // Add / update driver markers
  // --------------------------------------------------

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || !drivers) {
      return;
    }

    // Remove old markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    const validDrivers = drivers.filter(
      (driver) =>
        driver?.location &&
        Array.isArray(driver.location.coordinates) &&
        driver.location.coordinates.length >= 2,
    );

    if (validDrivers.length === 0) {
      return;
    }

    const positions = [];

    validDrivers.forEach((driver) => {
      const [longitude, latitude] = driver.location.coordinates;

      positions.push([latitude, longitude]);

      const marker = L.marker([latitude, longitude]).addTo(map);

      const popupContent = `
        <div class="driver-popup">

          <div class="driver-popup-header">

            <img
              src="${driver.avatar || "https://via.placeholder.com/60"}"
              alt="${driver.fullname || "Unknown Driver"}"
              class="driver-avatar"
            />

            <div>
              <h3>
                ${driver.fullname || "Unknown Driver"}
              </h3>

              <span class="popup-online">
                <span></span>
                ${driver.driverStatus || "ONLINE"}
              </span>
            </div>

          </div>

          <div class="driver-popup-details">

            <div class="popup-detail">
              <span>Rating</span>
              <strong>
                ⭐ ${driver.rating ?? "N/A"}
              </strong>
            </div>

            <div class="popup-detail">
              <span>Total Trips</span>
              <strong>
                ${driver.totalTrips ?? 0}
              </strong>
            </div>

            <div class="popup-detail">
              <span>Approval</span>
              <strong>
                ${driver.profileApprovalStatus || "N/A"}
              </strong>
            </div>

            <div class="popup-detail">
              <span>Suspended</span>
              <strong>
                ${driver.isSuspended ? "Yes" : "No"}
              </strong>
            </div>

          </div>

          <div class="driver-popup-location">

            <span>Latitude</span>
            <strong>${latitude.toFixed(6)}</strong>

            <span>Longitude</span>
            <strong>${longitude.toFixed(6)}</strong>

          </div>

        </div>
      `;

      marker.bindPopup(popupContent);

      markersRef.current.push(marker);
    });

    // --------------------------------------------------
    // Automatically fit map to all drivers
    // --------------------------------------------------

    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);

      map.fitBounds(bounds, {
        padding: [50, 50],
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [drivers]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="bird-view-page">
        <div className="bird-view-loading">
          <div className="loader"></div>
          <p>Loading available drivers...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="bird-view-page">
        <div className="bird-view-header">
          <div>
            <h2>Bird View</h2>
            <p>Monitor available drivers on the map</p>
          </div>
        </div>

        <div className="bird-view-error">
          <h3>Unable to load drivers</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="bird-view-page">
      {/* Header */}
      <div className="bird-view-header">
        <div>
          <h2>Bird View</h2>
          <p>Monitor available drivers in real time</p>
        </div>

        <div className="driver-count">
          <span className="online-dot"></span>

          <strong>{drivers.length}</strong>

          <span>Online Drivers</span>
        </div>
      </div>

      {/* Map */}
      <div className="bird-view-map-container">
        {drivers.length === 0 ? (
          <div className="no-drivers">
            <div className="no-drivers-icon">🚗</div>

            <h3>No Online Drivers</h3>

            <p>
              There are currently no available drivers to display on the map.
            </p>
          </div>
        ) : (
          <div ref={mapRef} className="bird-view-map"></div>
        )}
      </div>
    </div>
  );
};

export default BirdView;
