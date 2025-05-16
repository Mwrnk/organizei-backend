import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  BCRYPT_COST: number;
}

const validateEnv = (): EnvConfig => {
  const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"] as const;

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variável de ambiente ${envVar} não está definida`);
    }
  }

  const port = Number(process.env.PORT);
  if (isNaN(port)) {
    throw new Error("PORT deve ser um número válido");
  }

  const bcryptCost = Number(process.env.BCRYPT_COST);
  if (isNaN(bcryptCost) || bcryptCost < 10 || bcryptCost > 12) {
    throw new Error("BCRYPT_COST deve ser um número entre 10 e 12");
  }

  return {
    NODE_ENV:
      (process.env.NODE_ENV as "development" | "production" | "test") ||
      "development",
    PORT: port || 3000,
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_SECRET: process.env.JWT_SECRET!,
    BCRYPT_COST: bcryptCost || 12,
  };
};

export const env = validateEnv();
