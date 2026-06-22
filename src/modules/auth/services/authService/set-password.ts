import * as argon from "argon2"
import { findUserByEmail, revokeAllSessionsExcept, updateUserPasswordByUserId } from "../../repository/auth.repository";
import { ApiError } from "next/dist/server/api-utils";
import { redis } from "@/lib/redis";

export async function setPasswordService(
    email: string,
    currentSessionId: string,
    password: string
) {
    // 1. get user with password
    const user = await findUserByEmail(email);
    if(!user) throw new ApiError(404, "User not found")
    
    // 2. hash password
    const hashedPassword = await argon.hash(password);

    //3. update password in db
    await updateUserPasswordByUserId(user.id, hashedPassword)

    // 4. revok all sessions except current one
    await revokeAllSessionsExcept(user.id, currentSessionId);

    // 5. invalidate Redis user cache
    await redis.del(`user:${user.id}`);

    // 6. invalidate Redis sessions cache
    await redis.del(`sessions:${user.id}`);
    await redis.del(`user:${user.id}`);
    
}