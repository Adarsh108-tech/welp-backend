import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, AIMessage } from 'langchain/schema';
import authRoutes from './routes/auth.mjs';
import userRoutes from './routes/users.mjs';
import http from 'http';
import mongoose from 'mongoose';
import { initSocket } from './socket.mjs';
import generateNotesRoutes from './routes/generateNotes.mjs';

const app = express();
const PORT = 5000;
const server = http.createServer(app); //  for socket.io

app.use(cors({
  origin: ["http://localhost:3000", "https://welp-frontend-43as.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", generateNotesRoutes);

// ✅ Set up the chat model
const model = new ChatOpenAI({
  temperature: 0.7,
  maxTokens: 300,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: process.env.OPENROUTER_BASE_URL,
  },
  modelName: "mistralai/mistral-small-3.2-24b-instruct", //  free model
});


let chatHistory = [
  new AIMessage("Hello! I'm your AI assistant. Ask me anything."),
];

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Empty question is not allowed.' });
    }

    console.log(" User:", question);
    chatHistory.push(new HumanMessage(question));

    const recentHistory = chatHistory.slice(-10);
    const response = await model.call(recentHistory);

    chatHistory.push(new AIMessage(response.content));
    console.log(" AI:", response.content);

    res.json({ response: response.content });
  } catch (error) {
    console.error(' Error:', error.message || error);
    res.status(500).json({ error: 'Failed to get AI response', details: error.message || 'Unknown error' });
  }
});

// ✅ Initialize socket AFTER app + server are defined
initSocket(server);

// ✅ Connect DB and start server only ONCE
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err);
  });
