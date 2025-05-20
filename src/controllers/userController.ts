import { Response } from "express";
import { User } from "../models/user";
import { hash, compare } from "../utils/hashManager";
import { generateToken } from "../utils/tokenManager";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../types/express";

export class UserController {
  async uploadProfileImage(req:AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { image } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { profileImage: image },
        { new: true }
      );

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      throw new AppError("Erro ao salvar imagem de perfil", 500);
    }
  }

  async editUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, dateOfBirth, image } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, dateOfBirth, profileImage: image },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new AppError("Usuário não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          dateOfBirth: updatedUser.dateOfBirth,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao editar usuário", 500);
    }
  }

  async signup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { coduser, name, dateOfBirth, email, password } = req.body;

      const hashedPassword = await hash(password);
      const user = await User.create({
        coduser,
        name,
        dateOfBirth,
        email,
        password: hashedPassword,
        role: "user",
      });

      const token = generateToken(user._id as string, user.email);

      res.status(201).json({
        status: "success",
        data: {
          token,
          user: {
            id: user._id,
            coduser: user.coduser,
            name: user.name,
            dateOfBirth: user.dateOfBirth,
            email: user.email,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao criar usuário", 500);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      const isPasswordValid = await compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError("Senha incorreta", 401);
      }

      const token = generateToken(user._id as string, user.email);

      res.status(200).json({
        status: "success",
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao fazer login", 500);
    }
  }

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select("-password");

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Erro ao buscar usuário", 500);
    }
  }

  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await User.find().select("-password");

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      throw new AppError("Erro ao buscar usuários", 500);
    }
  }
}
