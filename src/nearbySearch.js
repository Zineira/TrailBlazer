const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Search for places nearby using Google Places API v1
 * @param {Object} params Search parameters
 * @param {Object} params.location {latitude: number, longitude: number}
 * @param {number} params.radius Radius in meters
 * @param {string} apiKey Google Maps API key
 */
async function nearbySearch(
  latitude,
  longitude,
  radius = 5000,
  placeType = "restaurant",
  maxResults = 5,
  rankBy = "POPULARITY",
  language = "pt-PT"
) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Format parameters exactly as Google Places API v1 expects
  const parameters = {
    includedTypes: Array.isArray(placeType) ? placeType : [placeType],
    locationRestriction: {
      circle: {
        center: {
          latitude: 41.211476506029676,
          longitude: -8.54857068868688,
        },
        radius: radius,
      },
    },
    maxResultCount: maxResults,
    rankPreference: rankBy,
    languageCode: language,
  };

  if (!apiKey) {
    throw new Error("Google Maps API key not found in environment variables");
  }

  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchNearby",
      parameters,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "*",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("API Error Details:", error.response?.data);
    throw new Error(`Nearby search failed: ${error.message}`);
  }
}

const nearby_search_tool = {
  type: "function",
  function: {
    name: "nearbySearch",
    description:
      "Search for places near a specific location using Google Places API",
    parameters: {
      type: "object",
      required: ["latitude", "longitude"],
      properties: {
        latitude: {
          type: "number",
          description: "The latitude of the location to search near",
        },
        longitude: {
          type: "number",
          description: "The longitude of the location to search near",
        },
        radius: {
          type: "number",
          description:
            "Optional: Search radius in meters. If not provided, no radius restriction will be applied",
        },
        placeType: {
          type: "string",
          enum: [
            "barbecue_area",
            "Childrens_camp",
            "bycling_park",
            "biking_area",
            "bicnic_ground",
            "bisitor_center",
            "public_bath",
            "public_bathroom",
            "stable",
            "barbecue_restaurant",
            "cafe",
            "coffee_shop",
            "ice_cream_shop",
            "bar",
            "pub",
            "buffet_restaurant",
            "bakery",
            "drugstore",
            "pharmacy",
            "campground",
            "camping_cabin",
            "rv_park",
            "cottage",
            "beach",
            "laundry",
            "athletic_field",
            "gym",
            "playground",
            "swimming_pool",
            "airport",
            "bus_station",
            "bus_stop",
            "park_and_ride",
            "taxi_stand",
            "adventure_sports_center",
            "state_park",
            "tourist_attraction",
            "water_park",
            "bank",
            "atm",
            "breakfast_restaurant",
            "chinese_restaurant",
            "dessert_restaurant",
            "fast_food_restaurant",
            "hamburger_restaurant",
            "italian_restaurant",
            "japanese_restaurant",
            "meal_delivery",
            "meal_takeaway",
            "mediterranean_restaurant",
            "pizza_restaurant",
            "seafood_restaurant",
            "steak_house",
            "vegetarian_restaurant",
            "police",
            "fire_station",
            "hospital",
            "hair_salon",
            "gift_shop",
          ],
          description: "Type of place to search for",
        },
        maxResults: {
          type: "integer",
          description: "Optional maximum number of results to return",
        },
        rankBy: {
          type: "string",
          enum: ["DISTANCE", "POPULARITY"],
          description: "Optional how to rank the search results",
        },
        language: {
          type: "string",
          description: "Language code for results (e.g., en-US, pt-PT)",
        },
      },
    },
  },
};

// const includedTypes = "restaurant";
// const maxResultCount = 5;
// const rankPreference = "POPULARITY";

// const latitude = 41.211476506029676;
// const longitude = -8.54857068868688;
// const radius = 5000;

// const languageCode = "pt-PT";

// nearbySearch(
//   latitude,
//   longitude,
//   radius,
//   includedTypes,
//   maxResultCount,
//   rankPreference,
//   languageCode
// )
//   .then((response) => {
//     let i = 1;
//     const places = response.places || [];
//     places.forEach((place) => {
//       console.log(place);
//       console.log(`\n${i}: `);
//       console.log(`Name: ${place.displayName.text}`);
//       console.log(`Types: ${place.types}`);
//       console.log(`Address: ${place.formattedAddress}\n`);
//       i++;
//     });
//   })
//   .catch(console.error);

module.exports = {
  nearbySearch,
  nearby_search_tool,
};
