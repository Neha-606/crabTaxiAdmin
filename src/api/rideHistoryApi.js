import API from "./api";

// Driver ride history for Admin
export const getDriverRideHistory = async (
  driverId,
  page = 1,
  limit = 10,
  status = ""
) => {
  try {
    const response = await API.get(
      `/api/v1/admin/driver/${driverId}/rides/history`,
      {
        params: {
          page,
          limit,
          ...(status && { status }),
        },
      }
    );

    console.log("DRIVER RIDE HISTORY RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "GET DRIVER RIDE HISTORY ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};