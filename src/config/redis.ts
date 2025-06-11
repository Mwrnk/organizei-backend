import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Máximo de tentativas de reconexão ao Redis atingido');
        return new Error('Máximo de tentativas de reconexão atingido');
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 10000,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
  // Em produção, não queremos que a aplicação caia se o Redis falhar
  if (process.env.NODE_ENV === 'production') {
    console.log('Continuando sem cache devido a erro no Redis');
  } else {
    process.exit(1);
  }
});

redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('reconnecting', () => console.log('Redis Client Reconnecting'));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Erro ao conectar ao Redis:', error);
    // Em produção, continuamos mesmo sem Redis
    if (process.env.NODE_ENV === 'production') {
      console.log('Continuando sem cache devido a erro na conexão com Redis');
    } else {
      process.exit(1);
    }
  }
};

export default redisClient; 