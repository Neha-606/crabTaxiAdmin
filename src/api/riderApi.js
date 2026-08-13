import API from "./api";

export const getRiders = async () => {

  try {

    const response = await API.get(
      "/api/v1/admin/riders"
    );

    console.log(
      "RIDERS API:",
      response.data
    );

    return response.data;

  } catch (error) {

    console.log(
      "GET RIDERS ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};