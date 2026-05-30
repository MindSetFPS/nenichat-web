import { Ollama } from 'ollama';
import fetch from "node-fetch"; // this breaks streaming requests

// https://github.com/ollama/ollama-js/issues/72#issuecomment-2198327974
export const ollama = new Ollama({
    host: process.env.OLLAMA_HOST,
    fetch: fetch as any, // Explicitly cast to 'any' to bypass type incompatibility 
});
