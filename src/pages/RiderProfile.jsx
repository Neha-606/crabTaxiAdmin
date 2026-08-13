import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./RiderProfile.css";

const RiderProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const rider = location.state?.rider;

  if (!rider) {
    return (
      <div className="profile-container">
        <h2>No Rider Data Found</h2>
        <button onClick={() => navigate("/customers")}>
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>
          <span className="green">Customers</span> / Profile
        </h2>
      </div>

      <div className="profile-card-user">
        <div className="cover-image"></div>

        <div className="profile-info-user">
          <div className="avatar-user">
            {rider?.riderProfile?.fullname?.charAt(0) || "R"}
          </div>

          <h2>
            {rider?.riderProfile?.fullname || "Customer"}
          </h2>

          <div className="stats-user">
            <div>
              <h4>
                {new Date(
                  rider.createdAt
                ).toLocaleDateString()}
              </h4>
              <p>Member Since</p>
            </div>

            <div>
              <h4>
                {rider.accountStatus || "ACTIVE"}
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
          <span>{rider?.email || "N/A"}</span>
        </div>

        <div className="info-row">
          <strong>Phone:</strong>
          <span>{rider?.phoneNumber || "N/A"}</span>
        </div>

        <div className="info-row">
          <strong>Status:</strong>
          <span>
            {rider?.accountStatus || "ACTIVE"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;