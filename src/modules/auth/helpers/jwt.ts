import { AUTH_CONSTANTS } from "@/constants";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function generateAccessToken(userId: string,sessionId: string, role: string) {
    return jwt.sign(
        {
            sub: userId,
            sessionId,
            role,
            jti: uuidv4(),
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRY,
        }
    )
}

export function generateRefreshToken(userId: string) {
    const jti = uuidv4();

    const token = jwt.sign(
        {
            sub: userId,
            jti,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRY,
        }
    )

    return { token, jti };
}


export function verifyAccessToken(token: string){
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
        sub: string,
        role: string,
        sessionId: string,
        jti: string,
        exp: number
    }
}

export function verifyRefreshToken(token: string){
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
        sub: string,
        jti: string,
        exp: number
    }
}