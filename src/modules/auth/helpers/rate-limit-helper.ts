import { RateLimiterRedis } from "rate-limiter-flexible";

export async function rateLimit(limiter: RateLimiterRedis, key: string) {
    try{
        await limiter.consume(key);
    }catch (err) {
        throw new Error("Too many requests, please try again later.");
    }
}