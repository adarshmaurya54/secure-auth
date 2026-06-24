import crypto from "crypto";
import * as argon from "argon2";

export async function generateBackupCodes() {
    const plainCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString("hex") // e.g. "a3f1c2d4"
    );
    const hashedCodes = await Promise.all(plainCodes.map(code => argon.hash(code)));
    return { plainCodes, hashedCodes };
}