import { AUTH_CONSTANTS } from "@/constants";
import { redis } from "@/lib/redis";

export async function checkEmailCooldown(key: string) {
    const exists = await redis.get(key);
    if(exists) {
        throw new Error(`Please wait ${AUTH_CONSTANTS.EMAIL_COOLDOWN_SECONDS} seconds before requesting again`)
    }   
}

export async function setEmailCooldown(key: string) {
    await redis.setex(key, AUTH_CONSTANTS.EMAIL_COOLDOWN_SECONDS, "1");
}