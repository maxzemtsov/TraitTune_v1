const OpenAI = require("openai");

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error("OpenAI API Key is missing. Make sure to set OPENAI_API_KEY environment variable.");
  // Depending on the application's error handling strategy, you might throw an error or exit.
  // For now, we'll just log the error and export a null client.
  // module.exports = null;
  // However, it's better to throw an error to catch this early in development.
  throw new Error("OpenAI API Key is missing.");
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

module.exports = openai;
