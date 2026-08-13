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