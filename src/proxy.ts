
// proxy.ts

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_ROUTES,
  PUBLIC_ROUTES,
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

  // exact auth route match
  const isAuthRoute =
    AUTH_ROUTES.includes(
      pathname
    );

  // exact public route match
  const isPublicRoute =
    PUBLIC_ROUTES.includes(
      pathname
    );

  // protected route + nested routes
  const isProtectedRoute =
    PROTECTED_ROUTES.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(
          `${route}/`
        )
    );

  // logged-in users shouldn't see auth pages
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

  // block protected pages
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

