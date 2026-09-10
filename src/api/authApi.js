import API from "./api";

//  LOGIN (YOUR GIVEN API)
export const loginUser = async (data) => {
  try {
    const res = await API.post("/api/v1/users/login", data);
    return res;
  } catch (err) {
    throw err.response?.data || err;
  }
};

//  REGISTER (ASSUMING YOUR BACKEND HAS THIS)
export const registerUser = async (data) => {
  try {
    const res = await API.post("/api/v1/users/register", data);
    return res;
  } catch (err) {
    throw err.response?.data || err;
  }
};


// ADMIN CREATE RIDE
export const createRideByAdmin = async (data) => {
  try {
    const res = await API.post("/api/v1/admin/create-ride", data);
    return res;
  } catch (err) {
    throw err.response?.data || err;
  }
};

// GET REQUESTED / PENDING RIDES
export const getRequestedRides = async () => {
  try {
    const res = await API.get("/api/v1/admin/requested-rides");

    return res;
  } catch (err) {
    throw err.response?.data || err;
  }
};


export const getAvailableDrivers = async () => {
  const response = await API.get("/api/v1/admin/drivers/available");
  return response.data;
};

export const assignDriverToRide = async ({
  rideId,
  driverId,
  vehicleCategory,
}) => {
  try {
    console.log("ASSIGN DRIVER REQUEST:", {
      rideId,
      driverId,
      vehicleCategory,
    });

    const response = await API.patch(
      `/api/v1/admin/rides/${rideId}/assign-driver`,
      {
        driverId,
        vehicleCategory,
      }
    );

    console.log("ASSIGN DRIVER RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "ASSIGN DRIVER API ERROR:",
      error.response?.data || error.message
    );

    console.error(
      "ASSIGN DRIVER STATUS:",
      error.response?.status
    );

    throw error;
  }
};