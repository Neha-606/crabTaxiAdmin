import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1/admin";

const getToken = () => localStorage.getItem("token");

// ✅ APPROVE
export const approveVehicle = (driverProfileId) => {
  return axios.patch(
    `${BASE_URL}/driver-vehicle-approved`,
    {
      userId: driverProfileId, // ✅ CORRECT
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const rejectVehicle = (driverProfileId, reason) => {
  return axios.patch(
    `${BASE_URL}/driver-vehicle-reject`,
    {
      userId: driverProfileId,
      rejection_reason: reason, // ✅ FIXED
    },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};