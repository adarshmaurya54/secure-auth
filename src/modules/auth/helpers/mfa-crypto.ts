import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.MFA_ENCRYPTION_KEY!, "hex"); // 32 bytes hex key

export function encryptSecret(secret: string) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        KEY,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(secret, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex")
    ].join(":");
}

export function decryptSecret(payload: string) {
    const [ivHex, authTagHex, encryptedHex] = payload.split(":");

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(
        Buffer.from(authTagHex, "hex")
    );

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, "hex")),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
}