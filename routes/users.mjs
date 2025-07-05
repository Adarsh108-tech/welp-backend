import express from "express";
import User from "../models/User.mjs";
import Message from "../models/Message.mjs";

const router = express.Router();

// Get all users except passwords
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get messages between logged-in user and selected user
router.get("/messages/:id", async (req, res) => {
  const { id } = req.params; // selectedUserId
  const userId = req.headers["userid"]; // logged-in user ID

  if (!userId) return res.status(400).json({ error: "Missing userId in headers" });

  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: id },
        { senderId: id, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
