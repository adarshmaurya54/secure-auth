import { Role } from "@/generated/prisma/enums";

export type LoginUser = {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    role: Role;
}

export type LoginRequestInfo = {
    ipAddress: string;
    device: string;
    browser: string;
    os: string;
}

export type LoginResponse =
    | {
        mfaRequired: boolean;
        tempToken: string;
        user: null;
        accessToken: null;
        refreshToken: null;
    }
    | {
        mfaRequired: boolean;
        tempToken: null;
        user: {
            id: string;
            email: string;
            name: string;
            isVerified: boolean;
            role: Role;
        };
        accessToken: string;
        refreshToken: string;
    };