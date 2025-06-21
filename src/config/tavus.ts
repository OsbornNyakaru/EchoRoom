// Tavus configuration
// Make sure to set VITE_TAVUS_API_KEY in your .env file at the project root:
// VITE_TAVUS_API_KEY=your_tavus_api_key_here

const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY;

if (!TAVUS_API_KEY) {
  throw new Error("Tavus API key is missing. Please set VITE_TAVUS_API_KEY in your .env file.");
}

const tavusConfig = {
  API_KEY: TAVUS_API_KEY,
};

export default tavusConfig;
