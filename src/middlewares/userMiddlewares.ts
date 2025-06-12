import { NextFunction, Response } from "express";
import { User, IUser } from "../models/user";
import { AppError } from "./errorHandler";
import { AuthRequest } from "../types/express";

export const validateUserData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, dateOfBirth, email, password } = req.body;

    // Se nenhum campo for enviado, retorna erro
    if (!name && !dateOfBirth && !email && !password) {
      throw new AppError(
        "Pelo menos um campo deve ser enviado para atualização",
        400
      );
    }

    // Validação do nome se fornecido
    if (name) {
      if (name.length < 3 || name.length > 50) {
        throw new AppError("O nome deve ter entre 3 e 50 caracteres", 400);
      }
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
        throw new AppError("O nome deve conter apenas letras e espaços", 400);
      }
    }

    // Validação do email se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Email inválido", 400);
      }
      // Verificar se o email já está em uso
      const existingUser = await User.findOne({ email }) as IUser | null;
      if (existingUser && String((existingUser._id as any)) !== req.params.id) {
        throw new AppError("Este email já está em uso", 400);
      }
    }

    // Validação da senha se fornecida
    if (password) {
      if (password.length < 8) {
        throw new AppError("A senha deve ter pelo menos 8 caracteres", 400);
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new AppError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número", 400);
      }
    }

    // Validação da data de nascimento se fornecida
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (isNaN(birthDate.getTime())) {
        throw new AppError("Data de nascimento inválida", 400);
      }
      
      if (age < 13) {
        throw new AppError("Você deve ter pelo menos 13 anos para se cadastrar", 400);
      }
      
      if (age > 120) {
        throw new AppError("Data de nascimento inválida", 400);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateSignupData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { coduser, name, dateOfBirth, email, password } = req.body;

    if (!coduser || !name || !dateOfBirth || !email || !password) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    // Validação do coduser
    if (!/^[a-zA-Z0-9]{4,20}$/.test(coduser)) {
      throw new AppError("O código do usuário deve ter entre 4 e 20 caracteres alfanuméricos", 400);
    }

    // Validação do nome
    if (name.length < 3 || name.length > 50) {
      throw new AppError("O nome deve ter entre 3 e 50 caracteres", 400);
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      throw new AppError("O nome deve conter apenas letras e espaços", 400);
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Email inválido", 400);
    }

    // Validação da senha
    if (password.length < 8) {
      throw new AppError("A senha deve ter pelo menos 8 caracteres", 400);
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new AppError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número", 400);
    }

    // Validação da data de nascimento
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      throw new AppError("Data de nascimento inválida", 400);
    }
    
    if (age < 13) {
      throw new AppError("Você deve ter pelo menos 13 anos para se cadastrar", 400);
    }
    
    if (age > 120) {
      throw new AppError("Data de nascimento inválida", 400);
    }

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { coduser }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError("Este email já está em uso", 400);
      }
      if (existingUser.coduser === coduser) {
        throw new AppError("Este código de usuário já está em uso", 400);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLoginData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Email inválido", 400);
    }

    // Validação básica da senha
    if (password.length < 8) {
      throw new AppError("Senha inválida", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const checkUserExists = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Não verifica usuário em rotas de signup
    if (req.path === "/signup") {
      return next();
    }

    const { id } = req.params;
    
    // Verifica se o ID foi fornecido
    if (!id) {
      throw new AppError("ID do usuário é obrigatório", 400);
    }

    const user = await User.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Erro ao verificar usuário", 500);
  }
};
