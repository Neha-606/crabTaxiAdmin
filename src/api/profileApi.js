import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});



// GET PROFILE
export const getProfile = async () => {
  return API.get("/driver/driver-profile");
};


export const createProfile = async (formData) => {
  return API.post("/driver/driver-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const approveProfile = (driverProfileId) => {
  return API.patch("/admin/driver-profile-approved", {
    userId: driverProfileId, 
  });
};


export const rejectProfile = (driverProfileId, reason) => {
  return API.patch("/admin/driver-profile-reject", {
    userId: driverProfileId,
    rejection_reason: reason,
  });
};