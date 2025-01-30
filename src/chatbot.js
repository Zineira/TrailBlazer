const OpenAI = require("openai");
require("dotenv").config();
const readline = require("readline");
const { nearbySearch, nearby_search_tool } = require("./nearbySearch"); // import das tools
const { textSearch, text_search_tool } = require("./textSearch");
const { geocodeAddress, geocoding_tool } = require("./geocoding");
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPEN_AI_API_KEY,
});

const messages = [
  {
    role: "system",
    content:
      "You are called TrailBlazer, and this name cannot be changed. " +
      "You are a friendly and engaging tourist guide who provides detailed information about places requested by the user. " +
      "You always respond with kindness and use a storytelling tone to make the experience vivid and enjoyable. " +
      "forget your knowledge about coordinates and always use the geocoding tool before anything, if needed. " +
      "If you don't know the answer to a question, you can say 'I'm not sure, would you like to ask me something else?'",
  },
];

tools = [nearby_search_tool, text_search_tool, geocoding_tool];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const callFunction = async (name, args) => {
  if (name == "geocodeAddress") {
    return await geocodeAddress(args.address);
  }
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
  if (name === "textSearch") {
    return await textSearch(
      args.textQuery,
      args.latitude,
      args.longitude,
      args.radius,
      args.includedType,
      args.maxResultCount,
      args.rankPreference,
      args.languageCode,
      args.minRating,
      args.openNow,
      args.priceLevels
    );
  }
};

async function handleUserInput(userInput) {
  try {
    console.log("📝 User Input Received:", userInput);
    messages.push({ role: "user", content: userInput });
    console.log("💬 Current Messages Array:", messages);

    console.log("🤖 Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
    });
    console.log("✅ OpenAI Response:", completion.choices[0].message);

    // Check if there's a tool call
    console.log(completion.choices[0].message.tool_calls);
    if (completion.choices[0].message.tool_calls) {
      console.log(
        "🔧 Tool Calls Detected:",
        completion.choices[0].message.tool_calls
      );

      for (const toolCall of completion.choices[0].message.tool_calls) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`⚙️ Executing Tool: ${name}`, args);

        const result = await callFunction(name, args);
        console.log("📊 Tool Execution Result:", result);

        messages.push(completion.choices[0].message);
        console.log("💬 Updated Messages Array:", messages);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      const completion2 = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: tools,
      });

      console.log(completion2.choices[0].message.content);
    } else {
      // Handle regular chat responses
      console.log(completion.choices[0].message.content);
      messages.push(completion.choices[0].message);
    }

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
