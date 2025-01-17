const OpenAI = require("openai");
require("dotenv").config();
const readline = require("readline");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPEN_AI_API_KEY,
});

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Keep track of conversation history
let conversationHistory = [];

// Define available functions
const availableFunctions = {
  getCurrentWeather: async ({ location }) => {
    return `Weather in ${location}: 22°C, Sunny`; // Mock implementation
  },
  getTime: async () => {
    return `Current time: ${new Date().toLocaleTimeString()}`;
  },
  findPlace: async ({
    query,
    location,
    radius,
    language,
    minPrice,
    maxPrice,
    openNow,
    placeType,
    pageToken,
  }) => {
    try {
      const requestBody = {
        textQuery: query,
        languageCode: language || "en",
        maxResultCount: 5,
      };

      if (location) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            radius: radius || 5000.0,
          },
        };
      }

      if (pageToken) {
        requestBody.pageToken = pageToken;
      }

      const response = await axios.post(
        "https://places.googleapis.com/v1/places:searchText",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": [
              "places.id",
              "places.displayName",
              "places.formattedAddress",
              "places.priceLevel",
              "places.rating",
              "places.userRatingCount",
              "places.currentOpeningHours",
              "places.primaryTypeDisplayName",
              "nextPageToken",
            ].join(","),
          },
        }
      );

      if (!response.data.places?.length) return "No places found";

      let result = response.data.places
        .filter((place) => {
          // Ensure Place ID exists
          if (!place.id) return false;

          // Filter based on additional criteria
          if (minPrice !== undefined && place.priceLevel?.length < minPrice)
            return false;
          if (maxPrice !== undefined && place.priceLevel?.length > maxPrice)
            return false;
          if (openNow && !place.currentOpeningHours?.openNow) return false;
          if (placeType && place.primaryTypeDisplayName?.text !== placeType)
            return false;
          return true;
        })
        .map((place) => {
          const rating = place.rating
            ? `⭐ ${place.rating}/5 (${place.userRatingCount} reviews)`
            : "No ratings";
          const openNowStatus = place.currentOpeningHours?.openNow
            ? "🟢 Open"
            : "🔴 Closed";

          return {
            id: place.id,
            details: [
              `📍 ${place.displayName?.text || "Unnamed Place"}`,
              `📮 ${place.formattedAddress || "No address"}`,
              `${openNowStatus} | ${rating}`,
            ]
              .filter(Boolean)
              .join("\n"),
          };
        });

      if (response.data.nextPageToken) {
        result.push({
          id: null,
          details: `More results available. Use pageToken: ${response.data.nextPageToken}`,
        });
      }

      return result;
    } catch (error) {
      console.error("Places API error:", error.response?.data || error.message);
      return "Error searching for places";
    }
  },
  placeDetails: async ({ placeId }) => {
    if (!placeId) return "Invalid Place ID";

    try {
      const response = await axios.get(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": [
              "places.id",
              "places.displayName",
              "places.formattedAddress",
              "places.rating",
              "places.userRatingCount",
              "places.currentOpeningHours",
              "places.priceLevel",
              "places.editorialSummary",
              "places.photos",
              "places.primaryTypeDisplayName",
              "places.websiteUri",
              "places.internationalPhoneNumber",
            ].join(","),
          },
        }
      );

      const place = response.data;
      const openNow = place.currentOpeningHours?.openNow
        ? "🟢 Open"
        : "🔴 Closed";
      const rating = place.rating
        ? `⭐ ${place.rating}/5 (${place.userRatingCount} reviews)`
        : "No ratings";
      const price = "💰".repeat(place.priceLevel?.length || 0) || "Price N/A";

      return [
        `📍 ${place.displayName?.text || "Unnamed Place"}`,
        `📮 ${place.formattedAddress || "No address"}`,
        `📞 ${place.internationalPhoneNumber || "No phone"}`,
        `${openNow} | ${rating} | ${price}`,
        `🏷️ ${place.primaryTypeDisplayName?.text || "No category"}`,
        place.websiteUri ? `🌐 ${place.websiteUri}` : "",
        place.editorialSummary?.text
          ? `info: ${place.editorialSummary.text}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
    } catch (error) {
      console.error("Place Details API error:", error.response?.data || error);
      if (error.response?.status === 404) {
        return "Place ID not found or expired. Please try searching for the place again.";
      }
      return "Error fetching place details";
    }
  },
};

const PLACE_TYPES = [
  "accounting",
  "airport",
  "amusement_park",
  "aquarium",
  "art_gallery",
  "atm",
  "bakery",
  "bank",
  "bar",
  "beauty_salon",
  "bicycle_store",
  "book_store",
  "bowling_alley",
  "bus_station",
  "cafe",
  "campground",
  "car_dealer",
  "car_rental",
  "car_repair",
  "car_wash",
  "casino",
  "cemetery",
  "church",
  "city_hall",
  "clothing_store",
  "convenience_store",
  "courthouse",
  "dentist",
  "department_store",
  "doctor",
  "drugstore",
  "electrician",
  "electronics_store",
  "embassy",
  "fire_station",
  "florist",
  "funeral_home",
  "furniture_store",
  "gas_station",
  "gym",
  "hair_care",
  "hardware_store",
  "hindu_temple",
  "home_goods_store",
  "hospital",
  "insurance_agency",
  "jewelry_store",
  "laundry",
  "lawyer",
  "library",
  "light_rail_station",
  "liquor_store",
  "local_government_office",
  "locksmith",
  "lodging",
  "meal_delivery",
  "meal_takeaway",
  "mosque",
  "movie_rental",
  "movie_theater",
  "moving_company",
  "museum",
  "night_club",
  "painter",
  "park",
  "parking",
  "pet_store",
  "pharmacy",
  "physiotherapist",
  "plumber",
  "police",
  "post_office",
  "primary_school",
  "real_estate_agency",
  "restaurant",
  "roofing_contractor",
  "rv_park",
  "school",
  "secondary_school",
  "shoe_store",
  "shopping_mall",
  "spa",
  "stadium",
  "storage",
  "store",
  "subway_station",
  "supermarket",
  "synagogue",
  "taxi_stand",
  "tourist_attraction",
  "train_station",
  "transit_station",
  "travel_agency",
  "university",
  "veterinary_care",
  "zoo",
];

// Define function specifications for OpenAI
const functionDefinitions = [
  {
    name: "getCurrentWeather",
    description: "Get the current weather in a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "getTime",
    description: "Get the current time",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "findPlace",
    description:
      "Search for places using Google Places API with various filtering options",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Search query for finding places (e.g., 'restaurants in Porto')",
        },
        location: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              minimum: -90,
              maximum: 90,
              description: "Latitude coordinate",
            },
            longitude: {
              type: "number",
              minimum: -180,
              maximum: 180,
              description: "Longitude coordinate",
            },
          },
          description: "Geographic coordinates for location bias",
        },
        radius: {
          type: "integer",
          minimum: 1,
          maximum: 50000,
          description: "Search radius in meters (max 50000)",
        },
        language: {
          type: "string",
          description: "Language code for results (e.g., 'en', 'pt')",
        },
        minPrice: {
          type: "integer",
          minimum: 0,
          maximum: 4,
          description: "Minimum price level (0=Free to 4=Luxury)",
        },
        maxPrice: {
          type: "integer",
          minimum: 0,
          maximum: 4,
          description: "Maximum price level (0=Free to 4=Luxury)",
        },
        openNow: {
          type: "boolean",
          description: "Filter for currently open places",
        },
        placeType: {
          type: "string",
          enum: PLACE_TYPES,
          description: "Specific type of place to search for",
        },
        pageToken: {
          type: "string",
          description: "Token for fetching next page of results",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "placeDetails",
    description:
      "Get detailed information about a specific place using its Place ID",
    parameters: {
      type: "object",
      properties: {
        placeId: {
          type: "string",
          description: "The Google Places ID of the location",
        },
      },
      required: ["placeId"],
    },
  },
];

const handleFunctionCall = async (prompt) => {
  try {
    let messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that can search for places and provide information.",
      },
      ...conversationHistory,
      { role: "user", content: prompt },
    ];

    while (true) {
      console.log("\n🔄 Sending request to OpenAI...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        functions: functionDefinitions,
        function_call: "auto",
      });

      const responseMessage = response.choices[0].message;
      console.log(
        "\n📥 Received response:",
        JSON.stringify(responseMessage, null, 2)
      );

      if (responseMessage.function_call) {
        console.log("\n🔧 Function call detected");
        const functionName = responseMessage.function_call.name;
        const functionArgs = JSON.parse(
          responseMessage.function_call.arguments
        );

        console.log(`\n📝 Executing: ${functionName}`);
        console.log("Arguments:", JSON.stringify(functionArgs, null, 2));

        if (!availableFunctions[functionName]) {
          throw new Error(`Function ${functionName} not found`);
        }

        const functionResponse = await availableFunctions[functionName](
          functionArgs
        );
        console.log("\n✅ Function response:", functionResponse);

        // Update messages and continue loop if necessary
        messages.push(
          {
            role: "assistant",
            content: null,
            function_call: responseMessage.function_call,
          },
          { role: "function", name: functionName, content: functionResponse }
        );

        continue; // Re-query OpenAI in case of further function calls
      }

      // Handle regular response
      const botResponse = responseMessage.content.trim();
      conversationHistory.push(
        { role: "user", content: prompt },
        { role: "assistant", content: botResponse }
      );

      return botResponse;
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    return `Error processing request: ${error.message}`;
  }
};

async function chat() {
  console.log("Chatbot initialized. Type 'exit' to end the conversation.");

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      const response = await handleFunctionCall(input);
      console.log("Bot:", response);
      askQuestion();
    });
  };

  askQuestion();
}

// Start the chat
chat().catch(console.error);
