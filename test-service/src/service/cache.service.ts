import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as CacheManager from "cache-manager";


@Injectable()
export class CacheService{

    constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheManager.Cache){}

    async get<T>(key: string): Promise<T | null>{
        const value = await this.cacheManager.get<T>(key);
        return value ?? null;
    }

    async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
        await this.cacheManager.set(key, JSON.stringify(value)  , ttlSeconds)
    }

    async del(key: string): Promise<void>{
        await this.cacheManager.del(key);
    }

    async reset(): Promise<void>{
        await this.cacheManager.clear();
    }
}