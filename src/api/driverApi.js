import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export const getDrivers = async () => {
  try {
    const res = await API.get("/admin/drivers");

    return res.data.data || []; 
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

export const getSingleDriver = (id) => {
  return API.post("/admin/single-driver", {
    userId: id, 
  });
};

export const getNotApprovedDrivers = async () => {
  try {
    const res = await API.get("/admin/not-approved-drivers");

    return res.data.data || []; 
  } catch (error) {
    console.error("Error fetching not approved drivers:", error);
    throw error;
  }
};

// availavle driver
export const getAvailableDrivers = async () => {
  const response = await API.get(
    "/admin/drivers/available"
  );

  return response.data;
};