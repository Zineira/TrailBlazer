const OpenAI = require('openai');
require('dotenv').config();
const readline = require('readline');
const axios = require('axios');

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPEN_AI_API_KEY,
});

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Keep track of conversation history
let conversationHistory = [];

// Define available functions
const availableFunctions = {
    getCurrentWeather: async ({location}) => {
        return `Weather in ${location}: 22°C, Sunny`; // Mock implementation
    },
    getTime: async () => {
        return `Current time: ${new Date().toLocaleTimeString()}`;
    },
    calculate: async ({operation, numbers}) => {
        const ops = {
            add: (nums) => nums.reduce((a, b) => a + b, 0),
            multiply: (nums) => nums.reduce((a, b) => a * b, 1),
            subtract: (nums) => nums.reduce((a, b) => a - b),
            divide: (nums) => nums.reduce((a, b) => a / b)
        };
        return `Result: ${ops[operation](numbers)}`;
    },
    findPlace: async ({query}) => {
        try {
            const response = await axios.post(
                'https://places.googleapis.com/v1/places:searchText',
                {
                    textQuery: query,
                    languageCode: "en",
                    maxResultCount: 5
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                        'X-Goog-FieldMask': [
                            'places.id',
                            'places.displayName',
                            'places.formattedAddress',
                            'places.rating',
                            'places.userRatingCount',
                            'places.currentOpeningHours',
                            'places.priceLevel',
                            'places.editorialSummary',
                            'places.photos',
                            'places.primaryTypeDisplayName',
                            'places.websiteUri'
                        ].join(',')
                    }
                }
            );

            if (!response.data.places?.length) return "No places found";

            return response.data.places.map(place => {
                const openNow = place.currentOpeningHours?.openNow ? '🟢 Open' : '🔴 Closed';
                const rating = place.rating ? `⭐ ${place.rating}/5 (${place.userRatingCount} reviews)` : 'No ratings';
                const price = '💰'.repeat(place.priceLevel?.length || 0) || 'Price N/A';
                
                return [
                    `📍 ${place.displayName?.text || 'Unnamed Place'}`,
                    `📮 ${place.formattedAddress || 'No address'}`,
                    `${openNow} | ${rating} | ${price}`,
                    `🏷️ ${place.primaryTypeDisplayName?.text || 'No category'}`,
                    place.websiteUri ? `🌐 ${place.websiteUri}` : '',
                    place.editorialSummary?.text ? `ℹ️ ${place.editorialSummary.text}` : ''
                ].filter(Boolean).join('\n');
            }).join('\n\n');

        } catch (error) {
            console.error('Places API error:', error.response?.data || error.message);
            return "Error searching for places. Please try again.";
        }
    }
};

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
                }
            },
            required: ["location"],
        }
    },
    {
        name: "getTime",
        description: "Get the current time",
        parameters: {
            type: "object",
            properties: {}
        }
    },
    {
        name: "calculate",
        description: "Perform basic mathematical operations",
        parameters: {
            type: "object",
            properties: {
                operation: {
                    type: "string",
                    enum: ["add", "subtract", "multiply", "divide"],
                    description: "The mathematical operation to perform"
                },
                numbers: {
                    type: "array",
                    items: {
                        type: "number"
                    },
                    description: "Array of numbers to perform operation on"
                }
            },
            required: ["operation", "numbers"]
        }
    },
    {
        name: "findPlace",
        description: "Search for places using Google Places API",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search query for finding places (e.g., 'restaurants in New York')"
                }
            },
            required: ["query"]
        }
    }
];

// Function to get responses from OpenAI's API
async function getResponseFromOpenAI(prompt) {
    try {
        const messages = [
            ...conversationHistory,
            { role: "user", content: prompt }
        ];

        console.log('\n🔄 Sending to OpenAI:', JSON.stringify(messages, null, 2));

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            functions: functionDefinitions,
            function_call: "auto",
        });

        const responseMessage = response.choices[0].message;
        console.log('\n📥 Received response:', JSON.stringify(responseMessage, null, 2));

        // Check if the model wants to call a function
        if (responseMessage.function_call) {
            console.log('\n🔧 Function call detected!');
            const functionName = responseMessage.function_call.name;
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);
            
            console.log(`\n📝 Function name: ${functionName}`);
            console.log('📝 Function arguments:', JSON.stringify(functionArgs, null, 2));
            
            // Execute the function
            const functionResponse = await availableFunctions[functionName](functionArgs);
            console.log('\n✅ Function response:', functionResponse);
            
            // Add function response to conversation
            conversationHistory.push({ role: "user", content: prompt });
            conversationHistory.push({ role: "assistant", content: functionResponse });
            
            return functionResponse;
        }

        // Regular response without function call
        const botResponse = responseMessage.content.trim();
        conversationHistory.push({ role: "user", content: prompt });
        conversationHistory.push({ role: "assistant", content: botResponse });
        
        return botResponse;
    } catch (error) {
        console.error('Error:', error.message);
        return 'Sorry, there was an error processing your request.';
    }
}

async function chat() {
    console.log("Chatbot initialized. Type 'exit' to end the conversation.");
    
    const askQuestion = () => {
        rl.question('You: ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            const response = await getResponseFromOpenAI(input);
            console.log('Bot:', response);
            askQuestion();
        });
    };

    askQuestion();
}

// Start the chat
chat().catch(console.error);


