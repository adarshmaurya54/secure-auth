import { redis } from "@/lib/redis";

export async function blacklistToken(jti: string,ttlSeconds: number) {
  await redis.set(`blacklist:${jti}`,"true","EX",ttlSeconds);
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const result =
    await redis.get(`blacklist:${jti}`);
  return result === "true";
}