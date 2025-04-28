import express from "express";
import cors from "cors";
import { env } from "./config/env";
import connectDB from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import planRoutes from "./routes/planRoutes";
import listRoutes from "./routes/ListRoutes";  
import cron from 'node-cron';
import { checkExpiredPlansJob } from './jobs/checkExpiredPlans';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/", userRoutes);
app.use("/", planRoutes);
app.use("/", listRoutes);  

// Middleware de tratamento de erros
app.use(errorHandler);

// Conectar ao MongoDB
connectDB();

// Configurar job para verificar planos expirados (executa diariamente à meia-noite)
cron.schedule('0 0 * * *', () => {
  console.log('Executando verificação de planos expirados...');
  checkExpiredPlansJob();
});

// Rota simples de status
app.get("/", (req, res) => {
  res.send("A API está online");
});

// Porta
const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
