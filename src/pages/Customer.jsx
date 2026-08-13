import React, { useEffect, useState } from "react";

import "./customer.css";

import { FaEye, FaTrash } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { getRiders } from "../api/riderApi";

const Customers = () => {

  const [riders, setRiders] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    fetchRiders();

  }, []);

  const fetchRiders = async () => {

    try {

      const response = await getRiders();

      console.log("FULL API RESPONSE:", response);

      // IMPORTANT FIX
      const users = response?.data || [];

      setRiders(users);

    } catch (error) {

      console.log(
        "FETCH RIDERS ERROR:",
        error
      );

    }
  };

  const handleView = (rider) => {

    navigate("/rider-profile", {
      state: { rider },
    });

  };

  const handleDelete = (id) => {

    console.log("DELETE:", id);

  };

  return (

    <div className="customers-container">

      <div className="customers-header">

        <h2>Customers</h2>

      </div>

      <table className="customers-table">

        <thead>

          <tr>

            <th>User</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {riders.length > 0 ? (

            riders.map((rider) => (

              <tr key={rider._id}>

                <td>

                  <div className="user-info">

                    
                    <span>
                      {rider?.riderProfile?.fullname ||
                        "Customer"}
                    </span>

                  </div>

                </td>

                <td>
                  {rider?.email || "N/A"}
                </td>

                <td>
                  {rider?.phoneNumber || "N/A"}
                </td>

                <td>

                  <span className="active-status">

                    {rider?.accountStatus || "ACTIVE"}

                  </span>

                </td>

                <td>

                  {new Date(
                    rider.createdAt
                  ).toLocaleDateString()}

                </td>

                <td>

                  <div className="actions">

                    <button
                      className="view-btn"
                      onClick={() =>
                        handleView(rider)
                      }
                    >
                      <FaEye />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(rider._id)
                      }
                    >
                      <FaTrash />
                    </button>

                  </div>

                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td colSpan="6">

                No Customers Found

              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  );
};

export default Customers;