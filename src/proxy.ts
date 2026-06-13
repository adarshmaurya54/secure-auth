// proxy.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_ROUTES,
  PROTECTED_ROUTES,
} from "./constants";

export function proxy(
  request: NextRequest
) {
  const { pathname } =
    request.nextUrl;

  const hasRefreshToken =
    request.cookies.has(
      "refresh_token"
    );

  const isAuthRoute =
    AUTH_ROUTES.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );

  const isProtectedRoute =
    PROTECTED_ROUTES.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );

  // logged in users cannot visit auth pages
  if (
    isAuthRoute &&
    hasRefreshToken
  ) {
    return NextResponse.redirect(
      new URL(
        "/dashboard",
        request.url
      )
    );
  }

  // protect private routes
  if (
    isProtectedRoute &&
    !hasRefreshToken
  ) {
    const loginUrl =
      new URL(
        "/login",
        request.url
      );

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};