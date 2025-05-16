import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://organizei:nfameCN5lac0il4w@organizei-api.px4oxxo.mongodb.net/?retryWrites=true&w=majority&appName=organizei-api";

    await mongoose.connect(mongoURI);
    console.log("MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar com MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
