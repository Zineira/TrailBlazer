const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const geocoding_tool = {
  type: "function",
  function: {
    name: "geocodeAddress",
    description:
      "Convert an address into coordinates using Google Maps Geocoding API",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description:
            "The address to geocode (e.g., 'Rua de Santa Catarina, Porto'),(e.g., restaurant name)",
        },
      },
      required: ["address"],
    },
  },
};

async function geocodeAddress(address) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Google Maps API key not found in environment variables");
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: address,
          key: apiKey,
        },
      }
    );

    if (response.data.status === "OK") {
      const result = response.data.results[0];
      return {
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
      };
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error("Geocoding Error:", error.message);
    throw error;
  }
}

async function reverseGeocode(latitude, longitude) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Google Maps API key not found in environment variables");
  }

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: apiKey,
        },
      }
    );

    if (response.data.status === "OK") {
      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        placeId: result.place_id,
        components: result.address_components,
      };
    } else {
      throw new Error(`Reverse geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error("Reverse Geocoding Error:", error.message);
    throw error;
  }
}

// const mockParameters = {
//   addresses: ["Ermesinde", "Sakurai Sushi Bar", "Taberna Restinga"],
//   coordinates: [
//     { latitude: 41.1579, longitude: -8.6291 }, // Porto
//     { latitude: 41.1496, longitude: -8.6109 }, // Santa Catarina
//     { latitude: 41.1456, longitude: -8.616 }, // Aliados
//   ],
// };

// async function testGeocoding() {
//   try {
//     // Test address to coordinates
//     console.log("🏁 Testing Geocoding...");
//     const locationResult = await geocodeAddress(mockParameters.addresses[2]);
//     console.log("📍 Location Result:", locationResult);

//     // Test coordinates to address
//     console.log("\n🏁 Testing Reverse Geocoding...");
//     const addressResult = await reverseGeocode(
//       mockParameters.coordinates[0].latitude,
//       mockParameters.coordinates[0].longitude
//     );
//     console.log("📍 Address Result:", addressResult);
//   } catch (error) {
//     console.error("❌ Test Error:", error);
//   }
// }

// testGeocoding();

module.exports = {
  geocoding_tool,
  geocodeAddress,
  reverseGeocode,
};
