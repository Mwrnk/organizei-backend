import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Carrega as variáveis de ambiente
dotenv.config();

// Configuração global para os testes
beforeAll(async () => {
  // Conecta ao banco de dados de teste
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/organizei-test');
});

afterAll(async () => {
  // Limpa o banco de dados e fecha a conexão
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Limpa as coleções entre os testes
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}); 