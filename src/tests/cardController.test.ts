import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { Card } from '../models/card';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

describe('CardController', () => {
  let token: string;
  let userId: string;
  let testCard: any;

  beforeAll(async () => {
    // Conectar ao banco de dados de teste
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/organizei-test');

    // Criar usuário de teste
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;

    // Gerar token JWT
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');

    // Criar card de teste
    testCard = await Card.create({
      title: 'Test Card',
      userId: userId,
      listId: new mongoose.Types.ObjectId()
    });
  });

  afterAll(async () => {
    // Limpar banco de dados de teste
    await Card.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /cards', () => {
    it('deve retornar todos os cards do usuário', async () => {
      const response = await request(app)
        .get('/cards')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar erro 401 se não autenticado', async () => {
      const response = await request(app)
        .get('/cards');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /cards', () => {
    it('deve criar um novo card', async () => {
      const newCard = {
        title: 'New Test Card',
        listId: new mongoose.Types.ObjectId().toString()
      };

      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send(newCard);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(newCard.title);
    });

    it('deve retornar erro 400 se dados inválidos', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /cards/:id', () => {
    it('deve atualizar um card existente', async () => {
      const updateData = {
        title: 'Updated Card Title',
        priority: 'high'
      };

      const response = await request(app)
        .put(`/cards/${testCard._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('deve retornar erro 404 se card não encontrado', async () => {
      const response = await request(app)
        .put(`/cards/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /cards/:id', () => {
    it('deve deletar um card existente', async () => {
      const response = await request(app)
        .delete(`/cards/${testCard._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it('deve retornar erro 404 se card não encontrado', async () => {
      const response = await request(app)
        .delete(`/cards/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
}); 