export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/oauth-success",
  "/api/auth/oauth/google",          
  "/api/auth/oauth/google/callback", 
  "/mfa/verify",
  "/oauth-mfa"
];

export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/oauth-success", 
  "/mfa/verify",
  "/oauth/mfa"
];

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/security"
];