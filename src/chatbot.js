const OpenAI = require("openai");
require("dotenv").config();
const readline = require("readline");
const { nearbySearch, nearby_search_tool } = require("./googlemaps"); // import das tools

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPEN_AI_API_KEY,
});

const messages = [
  {
    role: "system",
    content: "You are a helpful assistant that can search for places nearby.",
  },
];

tools = [nearby_search_tool];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const callFunction = async (name, args) => {
  if (name === "nearbySearch") {
    return await nearbySearch(
      args.latitude,
      args.longitude,
      args.radius,
      args.placeType,
      args.maxResults,
      args.rankBy,
      args.language
    );
  }
};

const handleResponse = async (response) => {
  // Log complete OpenAI response for debugging
  console.log("\nOpenAI Response:", {
    toolCalls: response.tool_calls,
    content: response.content,
    role: response.role,
  });

  if (response.tool_calls) {
    console.log(
      "\nTool calls detected:",
      response.tool_calls.map((t) => t.function.name)
    );

    for (const toolCall of response.tool_calls) {
      const functionName = toolCall.function.name;
      let result;

      // Only execute nearby search when specifically requested
      if (functionName === "nearbySearch") {
        console.log(
          "\nArguments",
          JSON.parse(toolCall.function.arguments),
          "\n"
        );
        try {
          const args = JSON.parse(toolCall.function.arguments);
          result = await nearbySearch(
            args.latitude,
            args.longitude,
            args.radius,
            args.placeType,
            args.maxResults,
            args.rankBy,
            args.language
          );
        } catch (err) {
          console.error("Nearby search error:", err);
          result = { error: err.message, places: {} };
        }
      }

      // Handle places data formatting
      let placesInfo = null;
      if (result?.places && Object.keys(result.places).length > 0) {
        try {
          placesInfo = result.places.map((place) => ({
            name: place.displayName?.text,
            address: place.formattedAddress,
            rating: place.rating,
            types: place.types,
          }));
        } catch (err) {
          console.error("Error formatting places:", err);
          placesInfo = [];
        }
      }

      console.log("\nFormatted places info:", placesInfo);

      // Add function result to messages
      messages.push({
        role: "function",
        name: functionName,
        tool_call_id: toolCall.id,
        content: JSON.stringify(placesInfo || result),
      });
    }
  } else {
    console.log("\nBot response (no tools called):", response.content);
    messages.push({ role: "assistant", content: response.content });
  }
};

async function handleUserInput(userInput) {
  try {
    messages.push({ role: "user", content: userInput });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
    });

    const response = completion.choices[0].message;
    await handleResponse(response);

    return true;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

async function chat() {
  console.log("Chatbot initialized. Type 'exit' to end the conversation.\n");

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("You:\n", resolve);
    });

    if (userInput.toLowerCase() === "exit") {
      rl.close();
      break;
    }

    await handleUserInput(userInput);
  }
}

chat().catch(console.error);
