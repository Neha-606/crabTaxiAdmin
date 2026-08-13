import React from "react";
import "./driverProfile.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaDollarSign, FaStar } from "react-icons/fa";

import {
  rejectDriverDocument,
  approveDriverDocument,
} from "../api/documentApi";

import {
  approveVehicle,
  rejectVehicle,
} from "../api/vehicleApi";

import {
  approveProfile,
  rejectProfile,
} from "../api/profileApi";

const DriverProfile = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const driver = state?.driver;

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

  // ================= PROFILE =================
 const handleApproveProfile = async () => {
   console.log("Doc Status:", driver?.documents?.documentsApprovalStatus);
  console.log("Vehicle Status:", driver?.vehicle?.vehicleApproved);
  if (
    driver?.documents?.documentsApprovalStatus !== "APPROVED" ||
    driver?.vehicle?.vehicleApproved !== "APPROVED"
  ) {
    alert("⚠ Approve Documents & Vehicle first!");
    return;
  }

  try {
    await approveProfile(driver._id);; // ✅ FIXED
    alert("Profile Approved ✅");
    window.location.reload();
  } catch (err) {
    alert(err.response?.data?.message || "Profile Approve Failed");
  }
};

  const handleRejectProfile = async () => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await rejectProfile(driver._id, reason);
      alert("Profile Rejected ❌");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Profile Reject Failed");
    }
  };

  

  // ================= DOCUMENT =================
 const handleApproveDoc = async () => {
  try {
    const res = await approveDriverDocument({
      driverProfileId: driver.documents.driverProfileId,
    });

    // ✅ Correct check
    if (res?.message === "documents already approved by admin!") {
      alert("⚠ Documents are already approved by admin!");
      return;
    }

    alert("Documents Approved ✅");
    window.location.reload();

  } catch (err) {
    const message = err?.message || err?.response?.data?.message;

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
    alert("Documents Rejected ❌");
    window.location.reload();
  } catch (err) {
    alert(err.response?.data?.message || "Reject Failed");
  }
};
  // ================= VEHICLE =================
  const handleApproveVehicle = async () => {
  try {
   await approveVehicle(driver.vehicle?.driverProfileId);

    alert("Vehicle Approved ✅");

    // ✅ Best: refetch fresh data (recommended)
    window.location.reload();

  } catch (err) {
    alert(err.response?.data?.message || "Vehicle Approve Failed");
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
      alert(err.response?.data?.message || "Vehicle Reject Failed");
    }
  };

  return (
    <div className="driver-container">
      <h2 className="page-title">
        <span>Drivers</span> / Profile
      </h2>

      {/* 🔥 TOP SECTION */}
      <div className="top-section">
        <div className="profile-card">
          <img
            src="https://picsum.photos/400/150"
            alt="cover"
            className="cover-img"
          />

          <div className="profile-info">
            <img src={driver.driverProfile?.avatar} alt="avatar" className="avatar" />
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
                <p>{new Date(driver.createdAt).toLocaleDateString()}</p>
                <span>Member Since</span>
              </div>

              <div>
                <p>{driver.driverProfile?.accountStatus}</p>
                <span>Status</span>
              </div>

              <div>
                <p>
                  <FaStar /> {driver.driverProfile?.rating}
                </p>
                <span>Rating</span>
              </div>
            </div>

            <button className="back-btn" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat-box">
            <h4>Total Trips</h4>
            <p>{driver.totalTrips}</p>
            <FaCheckCircle className="icon green" />
          </div>

          <div className="stat-box">
            <h4>Approval Status</h4>
            <p>{driver.driverProfile?.profileApprovalStatus}</p>
            <FaDollarSign className="icon green" />
          </div>
        </div>
      </div>

      {/* 🔥 BOTTOM SECTION */}
      <div className="bottom-section">

        {/* PERSONAL INFO */}
        <div className="info-card">
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>

          <div className="info-row">
            <span>Name</span>
            <p>{driver.driverProfile?.fullname}</p>
          </div>

          <div className="info-row">
            <span>Email</span>
            <p>{driver.email}</p>
          </div>

          <div className="info-row">
            <span>Phone</span>
            <p>{driver.phoneNumber}</p>
          </div>

          <div className="info-row">
            <span>Location</span>
            <p>
              {driver.driverProfile?.address?.[0]
                ? `${driver.driverProfile?.address[0].area}, ${driver.driverProfile?.address[0].city}`
                : "N/A"}
            </p>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="info-card">
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

                      {/* IMAGE */}
                      {doc.urls?.[0] && (
                        <img
                          src={doc.urls[0]}
                          className="doc-img"
                          onClick={() => window.open(doc.urls[0])}
                        />
                      )}

                      {/* CREDENTIALS */}
                      {doc.credentials && (
                        <div className="doc-credentials">
                          <p>
                            <b>No:</b> {doc.credentials.documentNumber}
                          </p>
                          <p>
                            <b>Issue:</b> {doc.credentials.issuedAt}
                          </p>
                          <p>
                            <b>Expiry:</b> {doc.credentials.expiryDate}
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
          {/* COMMON DOCUMENT ACTIONS */}
<div className="doc-actions" style={{ marginTop: "20px" }}>
  <button className="approve-btn" onClick={handleApproveDoc}>
    Approve All Documents
  </button>

  <button className="reject-btn" onClick={handleRejectDoc}>
    Reject All Documents
  </button>
</div>
        </div>

        {/* VEHICLE */}
        <div className="info-card">
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

              {/* VEHICLE IMAGE (FIXED) */}
              {driver.vehicle.images?.[0]?.url && (
                <div className="vehicle-img-box">
                  <img
                    src={driver.vehicle.images[0].url}
                    className="vehicle-img"
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
    </div>
  );
};

export default DriverProfile;