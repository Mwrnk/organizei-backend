import redisClient from '../config/redis';

export class CacheService {
  private static instance: CacheService;
  private readonly defaultTTL: number = 3600; // 1 hora em segundos

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await redisClient.set(key, stringValue, { EX: ttl });
    } catch (error) {
      console.error('Erro ao definir cache:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erro ao obter cache:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Erro ao deletar cache:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }
}

export default CacheService.getInstance(); 