import React, { useEffect, useState } from "react";

import "./drivers.css";
import { FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getDrivers, getNotApprovedDrivers } from "../api/driverApi";

const Drivers = () => {
  const [filter, setFilter] = useState("ALL"); // ALL | NOT_APPROVED
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        let data = [];

        if (filter === "NOT_APPROVED") {
          data = await getNotApprovedDrivers();
        } else {
          data = await getDrivers();
        }

        console.log("FILTER:", filter);
        console.log("API DATA:", data);

        setDrivers(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDrivers();
  }, [filter]);

  const handleView = (driver) => {
    navigate("/driver-profile", { state: { driver } });
  };

  const handleDelete = (driverId) => {
    console.log("DELETE DRIVER 👉", driverId);
    console.log("driverID");
  };

  return (
    <div className="drivers-container">
      <h2>Drivers</h2>

      <div className="filter-buttons">
        <button
          className={filter === "ALL" ? "active" : ""}
          onClick={() => setFilter("ALL")}
        >
          All Drivers
        </button>

        <button
          className={filter === "NOT_APPROVED" ? "active" : ""}
          onClick={() => setFilter("NOT_APPROVED")}
        >
          Not Approved
        </button>
      </div>

      <table className="drivers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Status</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {drivers.length > 0 ? (
            drivers.map((d) => (
              <tr key={d._id}>
                <td>{d.driverProfile?.fullname || "Driver"}</td>
                <td>{d.email || "N/A"}</td>
                <td>{d.phoneNumber || "N/A"}</td>

                <td>
                  <span
  className={`status ${
    d.driverProfile?.profileApprovalStatus === "APPROVED"
      ? "approved"
      : d.driverProfile?.profileApprovalStatus === "REJECTED"
      ? "rejected"
      : "pending"
  }`}
>
  {d.driverProfile?.profileApprovalStatus || "PENDING"}
</span>
                </td>

                <td>
                  {d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td>
                  <div className="actions">
                    <button
                      className="view-btn"
                      onClick={() => handleView(d)}
                    >
                      <FaEye size={16} />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(d._id)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No Drivers Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Drivers;