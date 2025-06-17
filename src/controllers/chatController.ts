import OpenAI from "openai";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const chatWithAI = async (req: Request, res: Response) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: message }],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("Erro ao se comunicar com a OpenAI:", error.message);
    res.status(500).json({ error: error.message || "Erro desconhecido" });
  }
};
