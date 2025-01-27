const OpenAI = require("openai");
require("dotenv").config();
const readline = require("readline");
const { nearbySearch, nearby_search_tool } = require("./nearbySearch"); // import das tools

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPEN_AI_API_KEY,
});

const messages = [
  {
    role: "system",
    content: "You are a helpful guide that can search for places nearby.",
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

async function handleUserInput(userInput) {
  try {
    messages.push({ role: "user", content: userInput });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
      store: true,
    });

    // Check if there's a tool call
    if (completion.choices[0].message.tool_calls) {
      const toolCall = completion.choices[0].message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

      console.log("tool: ", toolCall.function.name);
      console.log("args: ", args);

      const result = await callFunction(toolCall.function.name, args);
      console.log(result);

      messages.push(completion.choices[0].message);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });

      const completion2 = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: tools,
        store: true,
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
