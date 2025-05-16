import express from "express";
import { chatWithAI } from "../controllers/chatController";

const router = express.Router();

router.post("/chat", chatWithAI);

export default router;
