"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
const plan_1 = require("../models/plan");
const user_1 = require("../models/user");
const PlanHistory_1 = require("../models/PlanHistory");
const mongoose_1 = __importDefault(require("mongoose"));
class PlanController {
    listPlans(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const plans = yield plan_1.Plan.find({ isActive: true });
                res.status(200).json({
                    status: "success",
                    data: plans,
                });
            }
            catch (error) {
                console.error("Erro ao listar planos:", error);
                throw new errorHandler_1.AppError("Erro ao listar planos", 500);
            }
        });
    }
    getUserCurrentPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    throw new errorHandler_1.AppError("ID de usuário inválido", 400);
                }
                const user = yield user_1.User.findById(userId).populate("plan");
                if (!user) {
                    throw new errorHandler_1.AppError("Usuário não encontrado", 404);
                }
                // Se não tiver plano, tenta buscar o plano gratuito
                if (!user.plan) {
                    const freePlan = yield plan_1.Plan.findById("68379d6589ed7583b0596d8a");
                    if (!freePlan) {
                        throw new errorHandler_1.AppError("Plano gratuito não encontrado", 500);
                    }
                    // Atualiza o usuário com o plano gratuito
                    user.plan = freePlan._id;
                    yield user.save();
                    res.status(200).json({
                        status: "success",
                        data: freePlan
                    });
                    return;
                }
                res.status(200).json({
                    status: "success",
                    data: user.plan
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    throw error;
                }
                console.error("Erro ao buscar plano do usuário:", error);
                throw new errorHandler_1.AppError("Erro ao buscar plano do usuário", 500);
            }
        });
    }
    getUserPlanHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const history = yield PlanHistory_1.PlanHistory.find({ userId })
                    .populate("planId")
                    .sort({ startDate: -1 });
                res.status(200).json({
                    status: "success",
                    data: history,
                });
            }
            catch (error) {
                console.error("Erro ao buscar histórico de planos:", error);
                throw new errorHandler_1.AppError("Erro ao buscar histórico de planos", 500);
            }
        });
    }
    checkExpiredPlans() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activePlans = yield PlanHistory_1.PlanHistory.find({ status: "active" });
                for (const planHistory of activePlans) {
                    const plan = yield plan_1.Plan.findById(planHistory.planId);
                    if (!plan)
                        continue;
                    const endDate = new Date(planHistory.startDate);
                    endDate.setDate(endDate.getDate() + plan.duration);
                    if (endDate < new Date()) {
                        // Encontrar plano padrão
                        const defaultPlan = yield plan_1.Plan.findOne({ isDefault: true });
                        if (!defaultPlan)
                            continue;
                        // Atualizar histórico do plano atual
                        yield PlanHistory_1.PlanHistory.findByIdAndUpdate(planHistory._id, {
                            endDate: new Date(),
                            status: "expired",
                            reason: "Plano expirado",
                        });
                        // Criar novo registro com plano padrão
                        yield PlanHistory_1.PlanHistory.create({
                            userId: planHistory.userId,
                            planId: defaultPlan._id,
                            reason: "Retorno ao plano padrão após expiração",
                        });
                        // Atualizar plano do usuário
                        yield user_1.User.findByIdAndUpdate(planHistory.userId, {
                            plan: defaultPlan._id,
                        });
                    }
                }
            }
            catch (error) {
                console.error("Erro ao verificar planos expirados:", error);
            }
        });
    }
    createPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, price, features, duration, isDefault } = req.body;
                if (!name || price === undefined || !features || duration === undefined) {
                    throw new errorHandler_1.AppError("Todos os campos são obrigatórios", 400);
                }
                const existingPlan = yield plan_1.Plan.findOne({ name });
                if (existingPlan) {
                    throw new errorHandler_1.AppError("Plano já existe", 400);
                }
                const plan = yield plan_1.Plan.create({
                    name,
                    price,
                    features,
                    duration,
                    isDefault,
                });
                res.status(201).json({
                    status: "success",
                    data: plan,
                });
            }
            catch (error) {
                console.error("Erro ao criar plano:", error);
                throw new errorHandler_1.AppError("Erro ao criar plano", 500);
            }
        });
    }
    updateUserPlan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { planId } = req.body;
                if (!planId) {
                    throw new errorHandler_1.AppError("O ID do plano é obrigatório", 400);
                }
                const plan = yield plan_1.Plan.findById(planId);
                if (!plan) {
                    throw new errorHandler_1.AppError("Plano não encontrado", 404);
                }
                const user = yield user_1.User.findById(userId);
                if (!user) {
                    throw new errorHandler_1.AppError("Usuário não encontrado", 404);
                }
                // Encerrar plano atual se existir
                if (user.plan) {
                    yield PlanHistory_1.PlanHistory.findOneAndUpdate({ userId: user._id, status: "active" }, {
                        endDate: new Date(),
                        status: "cancelled",
                        reason: "Mudança de plano",
                    });
                }
                // Criar novo registro de histórico
                yield PlanHistory_1.PlanHistory.create({
                    userId: user._id,
                    planId: plan._id,
                    reason: "Atualização de plano",
                });
                // Atualizar plano do usuário
                user.plan = plan._id;
                yield user.save();
                res.status(200).json({
                    status: "success",
                    data: user,
                });
            }
            catch (error) {
                console.error("Erro ao atualizar plano do usuário:", error);
                throw new errorHandler_1.AppError("Erro ao atualizar plano do usuário", 500);
            }
        });
    }
}
exports.PlanController = PlanController;
