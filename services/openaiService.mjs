import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage } from 'langchain/schema';
import dotenv from 'dotenv';
dotenv.config();

const model = new ChatOpenAI({
  temperature: 0.7,
  maxTokens: 512, //  REDUCED
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: process.env.OPENROUTER_BASE_URL,
  },
  modelName: "mistralai/mistral-small-3.2-24b-instruct", // free model
});


export async function generateNotesForSyllabus(topic) {
  const prompt = `Write detailed and clear study notes for the topic: "${topic}" suitable for a student.`;

  //  Use LangChain schema's HumanMessage class
  const res = await model.call([
    new HumanMessage(prompt)
  ]);

  return res.content; //  This is the string to render in PDF
}
