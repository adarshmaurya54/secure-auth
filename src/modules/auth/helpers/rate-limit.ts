import { redis } from "@/lib/redis";
import {RateLimiterRedis} from "rate-limiter-flexible";
import { AUTH_CONSTANTS } from "../constants/auth.constants";

export const loginRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rate:login',
    points: AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS, // 5 attempts
    duration: 60 * 10, // per 10 minutes
    blockDuration: 60 * 10, // block for 10 minutes if consumed more than points  
})

export const registerRateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rate:register',
    points: AUTH_CONSTANTS.MAX_REGISTER_ATTEMPTS, // 5 attempts
    duration: 60 * 1, // per 10 minutes
})

