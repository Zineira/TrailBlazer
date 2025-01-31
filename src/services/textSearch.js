import axios from "axios";
// const dotenv = require("dotenv");
// dotenv.config();

/**
 * Search for places based on a text query using Google Places API v1
 * @param {string} textQuery Text query to search for
 * @param {number} latitude Latitude of the search center
 * @param {number} longitude Longitude of the search center
 * @param {number} [radius=1000] Search radius in meters
 * @param {string} [includedType="restaurant"] Type of place to search for
 * @param {number} [maxResultCount=5] Maximum number of results to return
 * @param {string} [rankPreference="RELEVANCE"] Preference for ranking results by relevance or distance
 * @param {string} [languageCode="pt-PT"] Language code for results
 * @param {number} [minRating=3.0] Minimum rating (1.0 to 5.0) for places to be included in the results
 * @param {boolean} [openNow=true] Whether to include only currently open places
 * @param {string[]} [priceLevels] Filter places by price level
 * @returns {Object} Places search results
 * @throws {Error} When the API request fails
 * @see https://developers.google.com/maps/documentation/places/web-service/search-text
 **/
export async function textSearch(
  textQuery,
  latitude,
  longitude,
  radius = 1000,
  includedType = "restaurant",
  maxResultCount = 5,
  rankPreference = "RELEVANCE",
  languageCode = "pt-PT",
  minRating = 3.0,
  openNow = true,
  priceLevels
) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Format parameters exactly as Google Places API v1 expects
  const parameters = {
    textQuery: textQuery,
    includedType: includedType,
    locationBias: {
      circle: {
        center: {
          latitude: 41.211,
          longitude: -8.548,
        },
        radius: radius,
      },
    },
    openNow: openNow,
    minRating: minRating,
    rankPreference: rankPreference,
    languageCode: languageCode,
    priceLevels: priceLevels,
    maxResultCount: maxResultCount,
  };

  if (!apiKey) {
    throw new Error("Google Maps API key not found in environment variables");
  }

  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
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
    throw new Error(`Text search failed: ${error.message}`);
  }
}

export const text_search_tool = {
  type: "function",
  function: {
    name: "textSearch",
    description: "Search for places based on a text query",
    parameters: {
      type: "object",
      required: ["textQuery", "latitude", "longitude"],
      properties: {
        textQuery: {
          type: "string",
          description: "Text query to search for",
        },
        includedType: {
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
            "restaurant",
            "seafood_restaurant",
            "steak_house",
            "vegetarian_restaurant",
            "police",
            "fire_station",
            "hospital",
            "hair_salon",
            "gift_shop",
          ],
          description: "Type of place to search for (e.g., restaurant)",
        },
        languageCode: {
          type: "string",
          description: "Language code for results (e.g., en-US, pt-PT)",
        },
        locationBias: {
          type: "object",
          description: "Optional restriction area for the search",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude of the restricted search center",
            },
            longitude: {
              type: "number",
              description: "Longitude of the restricted search center",
            },
            radius: {
              type: "number",
              description:
                "Optional: Search radius in meters. If not provided, no radius restriction will be applied.",
            },
          },
        },
        maxResultCount: {
          type: "integer",
          description: "Optional maximum number of results to return",
        },
        minRating: {
          type: "number",
          description:
            "Optional: Minimum rating (1.0 to 5.0) for places to be included in the results by default 3.0",
        },
        openNow: {
          type: "boolean",
          description:
            "Optional: Whether to include only currently open places",
        },
        pageToken: {
          type: "string",
          description:
            "Optional: Token for retrieving the next page of results, if applicable",
        },
        priceLevels: {
          type: "string",
          enum: [
            "PRICE_LEVEL_UNSPECIFIED",
            "PRICE_LEVEL_FREE",
            "PRICE_LEVEL_INEXPENSIVE",
            "PRICE_LEVEL_MODERATE",
            "PRICE_LEVEL_EXPENSIVE",
            "PRICE_LEVEL_VERY_EXPENSIVE",
          ],
          description:
            "Optional: Filter places by price level. Unspecified for no price filter.",
        },
        rankPreference: {
          type: "string",
          enum: ["RELEVANCE", "DISTANCE"],
          description:
            "Optional: Preference for ranking results by relevance or distance",
        },
      },
    },
  },
};

// const includedType = "restaurant";
// const maxResultCount = 5;
// const rankPreference = "RELEVANCE";
// const textQuery = "restaurantes japoneses em ermesinde";
// const latitude = 41.211476506029676;
// const longitude = -8.54857068868688;
// const radius = 2000;
// const minRating = 3.0;
// const openNow = true;
// const priceLevels = [];
// const languageCode = "pt-PT";

// textSearch(
//   textQuery,
//   latitude,
//   longitude,
//   radius,
//   includedType,
//   maxResultCount,
//   rankPreference,
//   languageCode,
//   minRating,
//   openNow,
//   priceLevels
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
