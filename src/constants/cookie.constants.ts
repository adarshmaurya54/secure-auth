export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV ===
    "production",
  sameSite: "strict" as const,
  path: "/",
};