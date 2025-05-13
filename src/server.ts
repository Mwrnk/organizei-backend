import express from "express";
import cors from "cors";
import connectDB from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import planRoutes from "./routes/planRoutes";
import listRoutes from "./routes/listRoutes";
import cardRoutes from "./routes/cardRoutes";
import commentRoutes from "./routes/commentRoutes";
import communityRoutes from "./routes/communityRoutes";
import chatRoutes from "./routes/chatRoutes";

import cron from "node-cron";
import { checkExpiredPlansJob } from "./jobs/checkExpiredPlans";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rotas
app.use("/", userRoutes);
app.use("/", planRoutes);
app.use("/", listRoutes);
app.use("/", cardRoutes);
app.use("/", commentRoutes);
app.use("/comunidade", communityRoutes);
app.use("/", chatRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Conectar ao MongoDB
connectDB();

// Configurar job para verificar planos expirados (executa diariamente à meia-noite)
cron.schedule("0 0 * * *", () => {
  console.log("Executando verificação de planos expirados...");
  checkExpiredPlansJob();
});

// Rota simples de status
app.get("/", (req, res) => {
  res.send("A API está online");
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
