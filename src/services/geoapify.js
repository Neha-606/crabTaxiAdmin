import axios from "axios";

const API_KEY = "dbd4aff3101b49539fc873cc3211d285";

// ==========================================
// ADDRESS → COORDINATES
// ==========================================

export const getCoordinates = async (place) => {
  try {
    const res = await axios.get(
      "https://api.geoapify.com/v1/geocode/search",
      {
        params: {
          text: place,
          apiKey: API_KEY,
        },
      }
    );

    if (!res.data.features?.length) {
      throw new Error(`Location not found: ${place}`);
    }

    const coordinates =
      res.data.features[0].geometry.coordinates;

    return {
      lng: coordinates[0],
      lat: coordinates[1],
    };
  } catch (err) {
    console.error(
      "Geocoding error:",
      err?.response?.data || err.message
    );

    return null;
  }
};

// ==========================================
// COORDINATES → ADDRESS
// ==========================================

export const getAddressFromCoordinates = async (lat, lng) => {
  try {
    console.log("Reverse geocoding:", lat, lng);

    const res = await axios.get(
      "https://api.geoapify.com/v1/geocode/reverse",
      {
        params: {
          lat: lat,
          lon: lng,
          apiKey: API_KEY,
          format: "json",
        },
      }
    );

    console.log(
      "REVERSE GEOCODING RESPONSE:",
      res.data
    );

    // Geoapify JSON response
    if (!res.data?.results?.length) {
      console.log(
        "No address found for:",
        lat,
        lng
      );

      return null;
    }

    const address =
      res.data.results[0]?.formatted;

    console.log(
      "ADDRESS FOUND:",
      address
    );

    return address || null;

  } catch (err) {
    console.error(
      "Reverse geocoding error:",
      err?.response?.data || err.message
    );

    return null;
  }
};