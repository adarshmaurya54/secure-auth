import * as argon from "argon2"
import { findUserByEmail, revokeAllSessionsExcept, updateUserPasswordByUserId } from "../../repository/auth.repository";
import { ApiError } from "next/dist/server/api-utils";
import { redis } from "@/lib/redis";

export async function changePasswordService(
    email: string,
    currentSessionId: string,
    currentPassword: string,
    newPassword: string
) {
    // 1. get user with password
    const user = await findUserByEmail(email);
    if(!user) throw new ApiError(404, "User not found")
    
    // 2. verify current password
    const isMatch = await argon.verify(user.password ?? "", currentPassword);
    if(!isMatch) throw new ApiError(400, "Current password is incorrect");

    // 3. hash new password
    const hashedPassword = await argon.hash(newPassword);

    //4. update password in db
    await updateUserPasswordByUserId(user.id, hashedPassword)

    // 5. revok all sessions except crrent one
    await revokeAllSessionsExcept(user.id, currentSessionId);

    // 6. invalidate Redis user cache
    await redis.del(`user:${user.id}`);

    // 7. invalidate Redis sessions cache
    await redis.del(`sessions:${user.id}`);
}