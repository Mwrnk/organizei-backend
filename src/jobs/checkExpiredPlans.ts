import { PlanController } from "../controllers/planController";

const planController = new PlanController();

export const checkExpiredPlansJob = async () => {
  try {
    await planController.checkExpiredPlans();
  } catch (error) {
    console.error(
      "Erro ao executar job de verificação de planos expirados:",
      error
    );
  }
};
