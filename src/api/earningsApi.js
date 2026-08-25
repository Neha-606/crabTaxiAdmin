import API from "./api";

export const getDriverEarnings = async (driverId) => {
  const response = await API.get(
    `/api/v1/admin/drivers/${driverId}/earnings`
  );

  return response.data;
};


export const getDriverDailyEarnings = async (driverId) => {
  const response = await API.get(
    `/api/v1/admin/drivers/${driverId}/earnings/history`
  );

  return response.data;
};


export const getDriverWeeklyEarnings = async (driverId) => {
  const response = await API.get(
    `/api/v1/admin/drivers/${driverId}/earnings/weekly-history`
  );

  return response.data;
};