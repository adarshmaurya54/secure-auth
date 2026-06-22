import { NextRequest, NextResponse } from "next/server";
import { handleGoogleLogin } from "@/modules/auth/services/authService/oauth.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");
    const error  = searchParams.get("error");
    const state = searchParams.get("state");
    const callbackUrl = state ? decodeURIComponent(state) : "/dashboard";

    // User cancelled on Google's screen → go back to login
    if (error) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/login?error=oauth_cancelled`
      );
    }

    // Step A: Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Step B: Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    // Step C: Run your existing service (no changes needed!)
    const response = NextResponse.redirect(
      `${process.env.APP_URL}/oauth-success?callbackUrl=${encodeURIComponent(callbackUrl)}`
    );

    return await handleGoogleLogin({
      email: googleUser.email,
      name: googleUser.name,
      providerAccountId: googleUser.id,
      request,
      response, // pass redirect response so cookies get set on it
    });

  } catch (error) {
    return NextResponse.redirect(
      `${process.env.APP_URL}/login?error=oauth_failed`
    );
  }
}

async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.APP_URL}/api/auth/oauth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) throw new Error("Failed to exchange code for tokens");
  return res.json();
}

async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch Google user info");
  return res.json(); // { id, email, name, picture }
}