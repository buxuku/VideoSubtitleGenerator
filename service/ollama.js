import axios from 'axios';
import { renderTemplate } from '../utils.js';
import { config } from 'dotenv';
config();

const apiUrl = process.env.OLLAMA_API_URL;
const modelName = process.env.OLLAMA_MODEL_NAME;
const prompt = process.env.OLLAMA_PROMPT;

export default async function translateWithOllama(
  text,
  sourceLanguage,
  targetLanguage
) {
  const renderedPrompt = renderTemplate(prompt, {
    sourceLanguage,
    targetLanguage,
    content: text
  });
  try {
    const response = await axios.post(`${apiUrl}/api/generate`, {
      model: modelName,
      prompt: renderedPrompt,
      stream: false
    });

    if (response.data && response.data.response) {
      return response.data.response.trim();
    } else {
      throw new Error(response?.data?.error || 'Unexpected response from Ollama');
    }
  } catch (error) {
    throw error;
  }
}