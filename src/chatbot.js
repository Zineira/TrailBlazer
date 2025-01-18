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
  placesNearby: async (
    app_context,
    location,
    type,
    radius,
    keyword,
    language,
    min_price,
    max_price,
    name,
    open_now,
    rank_by,
    page_token
  ) => {
    return `Places nearby: 5 restaurants, 3 cafes, 2 parks`; // Mock implementation
  },
};

TOOL_GET_CURRENT_WEATHER = {
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
};
TOOL_GET_TIME = {
  name: "getTime",
  description: "Get the current time",
  parameters: {
    type: "object",
    properties: {},
  },
};

TOOL_PLACES_NEARBY = {
  name: "searchPlaces",
  description:
    "Search for places using Google Places API with various filtering options",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        description: "Type of place to search for",
        enum: PLACE_TYPES,
      },
      location: {
        type: "object",
        properties: {
          latitude: { type: "number", minimum: -90, maximum: 90 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
        },
        required: ["latitude", "longitude"],
        description: "Geographic coordinates of the search center point",
      },
      radius: {
        type: "integer",
        description: "Search radius in meters",
        minimum: 1,
        maximum: 50000,
      },
      keyword: {
        type: "string",
        description: "Term to match against all content",
      },
      language: {
        type: "string",
        description: "The language code for the results (e.g., 'en', 'pt')",
      },
      minPrice: {
        type: "integer",
        minimum: 0,
        maximum: 4,
        description:
          "Minimum price level (0=most affordable, 4=most expensive)",
      },
      maxPrice: {
        type: "integer",
        minimum: 0,
        maximum: 4,
        description:
          "Maximum price level (0=most affordable, 4=most expensive)",
      },
      name: {
        type: "string",
        description: "Terms to match against place names",
      },
      openNow: {
        type: "boolean",
        description: "Return only places that are currently open",
      },
      rankBy: {
        type: "string",
        enum: ["prominence", "distance"],
        description: "Order in which to rank results",
      },
      pageToken: {
        type: "string",
        description: "Token for retrieving the next page of results",
      },
    },
    required: ["location"],
  },
};
/**
 * Function definitions for OpenAI API tools
 * These tools allow the chatbot to:
 * - Get weather information
 * - Get current time
 * - Search for nearby places
 */
const functionDefinitions = [
  TOOL_GET_CURRENT_WEATHER,
  TOOL_GET_TIME,
  TOOL_PLACES_NEARBY,
];

/**
 * Handles function calls from OpenAI API responses
 * @param {string} prompt - User input message
 * @returns {Promise<string>} Bot's response or error message
 */
const handleFunctionCall = async (prompt) => {
  try {
    // Initialize conversation array with system prompt and user message
    let messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that can search for places and provide information.",
      },
      ...conversationHistory, // Add previous conversation context
      { role: "user", content: prompt }, // Add current user message
    ];

    // Main processing loop
    // Continues until getting final response or hitting error
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
        let functionArgs;
        try {
          functionArgs = JSON.parse(responseMessage.function_call.arguments);
        } catch (err) {
          throw new Error("Error parsing function arguments: " + err.message);
        }

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
      console.log("Bot: ", response);
      askQuestion();
    });
  };

  askQuestion();
}

// Start the chat
chat().catch(console.error);
