import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function generateAccessToken(userId: string, role: string) {
    return jwt.sign(
        {
            sub: userId,
            role,
            jti: uuidv4(),
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: "15m",
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
            expiresIn: "7d",
        }
    )

    return { token, jti };
}


export function verifyAccessToken(token: string){
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
        sub: string,
        role: string,
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