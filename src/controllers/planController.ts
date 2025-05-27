import { Response } from "express";
import { AppError } from "../middlewares/errorHandler";
import { Plan } from "../models/plan";
import { User } from "../models/user";
import { PlanHistory } from "../models/PlanHistory";
import { AuthRequest } from "../types/express";
import mongoose from "mongoose";

export class PlanController {
  async listPlans(req: AuthRequest, res: Response): Promise<void> {
    try {
      const plans = await Plan.find({ isActive: true });

      res.status(200).json({
        status: "success",
        data: plans,
      });
    } catch (error) {
      console.error("Erro ao listar planos:", error);
      throw new AppError("Erro ao listar planos", 500);
    }
  }

  async getUserCurrentPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("ID de usuário inválido", 400);
      }

      const user = await User.findById(userId).populate("plan");
      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Se não tiver plano, tenta buscar o plano gratuito
      if (!user.plan) {
        const freePlan = await Plan.findById("68168764017ef3afb4b2ef30");
        if (!freePlan) {
          throw new AppError("Plano gratuito não encontrado", 500);
        }

        // Atualiza o usuário com o plano gratuito
        user.plan = freePlan._id as mongoose.Types.ObjectId;
        await user.save();

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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Erro ao buscar plano do usuário:", error);
      throw new AppError("Erro ao buscar plano do usuário", 500);
    }
  }

  async getUserPlanHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const history = await PlanHistory.find({ userId })
        .populate("planId")
        .sort({ startDate: -1 });

      res.status(200).json({
        status: "success",
        data: history,
      });
    } catch (error) {
      console.error("Erro ao buscar histórico de planos:", error);
      throw new AppError("Erro ao buscar histórico de planos", 500);
    }
  }

  async checkExpiredPlans(): Promise<void> {
    try {
      const activePlans = await PlanHistory.find({ status: "active" });

      for (const planHistory of activePlans) {
        const plan = await Plan.findById(planHistory.planId);
        if (!plan) continue;

        const endDate = new Date(planHistory.startDate);
        endDate.setDate(endDate.getDate() + plan.duration);

        if (endDate < new Date()) {
          // Encontrar plano padrão
          const defaultPlan = await Plan.findOne({ isDefault: true });
          if (!defaultPlan) continue;

          // Atualizar histórico do plano atual
          await PlanHistory.findByIdAndUpdate(planHistory._id, {
            endDate: new Date(),
            status: "expired",
            reason: "Plano expirado",
          });

          // Criar novo registro com plano padrão
          await PlanHistory.create({
            userId: planHistory.userId,
            planId: defaultPlan._id,
            reason: "Retorno ao plano padrão após expiração",
          });

          // Atualizar plano do usuário
          await User.findByIdAndUpdate(planHistory.userId, {
            plan: defaultPlan._id,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao verificar planos expirados:", error);
    }
  }

  async createPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, price, features, duration, isDefault } = req.body;

      if (!name || price === undefined || !features || duration === undefined) {
        throw new AppError("Todos os campos são obrigatórios", 400);
      }

      const existingPlan = await Plan.findOne({ name });
      if (existingPlan) {
        throw new AppError("Plano já existe", 400);
      }

      const plan = await Plan.create({
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
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      throw new AppError("Erro ao criar plano", 500);
    }
  }

  async updateUserPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { planId } = req.body;

      if (!planId) {
        throw new AppError("O ID do plano é obrigatório", 400);
      }

      const plan = await Plan.findById(planId);
      if (!plan) {
        throw new AppError("Plano não encontrado", 404);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Encerrar plano atual se existir
      if (user.plan) {
        await PlanHistory.findOneAndUpdate(
          { userId: user._id, status: "active" },
          {
            endDate: new Date(),
            status: "cancelled",
            reason: "Mudança de plano",
          }
        );
      }
      // Criar novo registro de histórico
      await PlanHistory.create({
        userId: user._id,
        planId: plan._id,
        reason: "Atualização de plano",
      });

      // Atualizar plano do usuário
      user.plan = plan._id as mongoose.Types.ObjectId;
      await user.save();

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      console.error("Erro ao atualizar plano do usuário:", error);
      throw new AppError("Erro ao atualizar plano do usuário", 500);
    }
  }
}
