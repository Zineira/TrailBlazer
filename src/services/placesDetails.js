import axios from "axios";
// const dotenv = require("dotenv");
// dotenv.config();

const apikey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Get details about a place using Google Places API v1
 * @param {string} placeId Place ID
 * @returns {Object} Place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    if (!placeId) {
      throw new Error("Place ID is required");
    }

    const response = await axios({
      method: "get",
      url: `https://places.googleapis.com/v1/places/${placeId}`,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apikey,
        "X-Goog-FieldMask":
          "displayName,formattedAddress,currentOpeningHours,nationalPhoneNumber,priceRange,rating,regularOpeningHours,userRatingCount,websiteUri",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching place details:", error.message);
    throw error;
  }
};

export const place_details_tool = {
  type: "function",
  function: {
    name: "getPlaceDetails",
    description: "Get details about a place using Google Places API v1",
    parameters: {
      type: "object",
      properties: {
        placeId: {
          type: "string",
          description: "The place ID of the location to get details about",
        },
      },
      required: ["placeId"],
    },
  },
};
