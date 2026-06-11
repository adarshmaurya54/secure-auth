// proxy.ts

import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "./constants";


export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // check refresh token instead of access token
  const hasRefreshToken =
    request.cookies.has("refresh_token");

  // logged-in users shouldn't see auth pages
  if (
    AUTH_ROUTES.some((route) =>
      pathname.startsWith(route)
    ) &&
    hasRefreshToken
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  // check if route is public
  const isPublic = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // protect dashboard/private routes
  if (!isPublic && !hasRefreshToken) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};