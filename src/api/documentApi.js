import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1/admin";

// 🔑 Token helper
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Reject ALL Documents
export const rejectDriverDocument = async ({ driverProfileId, reason }) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/driver-documents-rejected`,
      {
        userId: driverProfileId,
        rejection_reason: reason, // REQUIRED
      },
      getAuthHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Reject API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Approve ALL Documents
export const approveDriverDocument = async ({ driverProfileId }) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/driver-documents-approved`,
      {
        userId: driverProfileId,
      },
      getAuthHeader()
    );

    return response.data;
  } catch (error) {
    console.error("Approve API Error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};