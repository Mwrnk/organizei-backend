"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = require("./middlewares/errorHandler");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const listRoutes_1 = __importDefault(require("./routes/listRoutes"));
const cardRoutes_1 = __importDefault(require("./routes/cardRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const communityRoutes_1 = __importDefault(require("./routes/communityRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const flashCardRoutes_1 = __importDefault(require("./routes/flashCardRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const checkExpiredPlans_1 = require("./jobs/checkExpiredPlans");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Rotas
app.use("/", userRoutes_1.default);
app.use("/", planRoutes_1.default);
app.use("/", listRoutes_1.default);
app.use("/", cardRoutes_1.default);
app.use("/", commentRoutes_1.default);
app.use("/comunidade", communityRoutes_1.default);
app.use("/", chatRoutes_1.default);
app.use("/", flashCardRoutes_1.default);
app.use("/", tagRoutes_1.default);
app.use("/", quizRoutes_1.default);
// Middleware de tratamento de erros
app.use(errorHandler_1.errorHandler);
// Conectar ao MongoDB
(0, database_1.default)();
// Configurar job para verificar planos expirados (executa diariamente à meia-noite)
node_cron_1.default.schedule("0 0 * * *", () => {
    console.log("Executando verificação de planos expirados...");
    (0, checkExpiredPlans_1.checkExpiredPlansJob)();
});
// Rota simples de status
app.get("/", (req, res) => {
    res.send("A API está online");
});
// Só roda o servidor localmente se não estiver em ambiente serverless
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_DEV) {
    const PORT = process.env.PORT || 3000;
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}
exports.default = app;
