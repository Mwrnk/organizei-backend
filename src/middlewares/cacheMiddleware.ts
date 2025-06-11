import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cacheService';

export const cacheMiddleware = (ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    console.log(`[Cache] Verificando cache para: ${key}`);

    try {
      const cachedResponse = await cacheService.get(key);
      
      if (cachedResponse) {
        console.log(`[Cache] Cache HIT para: ${key}`);
        res.json(cachedResponse);
        return;
      }

      console.log(`[Cache] Cache MISS para: ${key}`);
      const originalJson = res.json;
      res.json = function(body: any) {
        console.log(`[Cache] Salvando no cache: ${key}`);
        cacheService.set(key, body, ttl);
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('[Cache] Erro no middleware de cache:', error);
      next();
    }
  };
}; 