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
async function nearbySearch(params) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Google Maps API key not found in environment variables");
  }

  if (!params.locationRestriction) {
    throw new Error("Missing required parameters: location, radius");
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
    throw new Error(`Nearby search failed: ${error.message}`);
  }
}

const parameters = {
  includedTypes: ["japanese_restaurant"],
  maxResultCount: 5,
  rankPreference: "POPULARITY",

  locationRestriction: {
    circle: {
      center: {
        latitude: 41.211476506029676,
        longitude: -8.54857068868688,
      },
      radius: 10000.0,
    },
  },
  languageCode: "pt-PT",
};

nearbySearch(parameters)
  .then((response) => {
    let i = 1;
    const places = response.places || [];
    places.forEach((place) => {
      console.log(`\n${i}: `);
      console.log(`Place ID: ${place.name}`);
      console.log(`Name: ${place.displayName.text}`);
      console.log(`Types: ${place.types}`);
      console.log(`Address: ${place.formattedAddress}\n`);
      i++;
    });
  })
  .catch(console.error);

module.exports = {
  nearbySearch,
};

const placesSearchFunction = {
  name: "searchNearbyPlaces",
  description:
    "Search for places near a specific location using Google Places API",
  parameters: {
    type: "object",
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
        description: "Search radius in meters",
        default: null,
      },
      placeType: {
        type: "string",
        enum: [
          "restaurant",
          "cafe",
          "bar",
          "japanese_restaurant",
          "shopping_mall",
          "tourist_attraction",
          "hotel",
          "store",
          "supermarket",
        ],
        description: "Type of place to search for",
      },
      maxResults: {
        type: "integer",
        description: "Maximum number of results to return",
        default: 10,
        minimum: 1,
        maximum: 20,
      },

      rankBy: {
        type: "string",
        enum: ["RATING", "DISTANCE", "POPULARITY"],
        default: "RATING",
        description: "How to rank the search results",
      },

      language: {
        type: "string",
        description: "Language code for results (e.g., en-US, pt-PT)",
        default: "en",
      },
    },
    required: ["latitude", "longitude"],
  },
};
