import { NextResponse } from "next/server";
import { ApiError } from "./api-error";
import { clearAuthCookies } from "@/utils/cookies";

export function handleApiError(
  error: unknown
) {
  console.error(error);

  if (
    error instanceof ApiError ||
    (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error
    )
  ) {
    const apiError =
      error as ApiError;

    const response =
      NextResponse.json(
        {
          success: false,
          message:
            apiError.message,
        },
        {
          status:
            apiError.statusCode,
        }
      );
      // clear cookies only for dead sessions
      if (
        [
          "SESSION_NOT_FOUND",
          "SESSION_REVOKED",
          "SESSION_INVALID",
          "INVALID_REFRESH_TOKEN",
        ].includes(
          apiError.code ?? ""
        )
      ) {
        clearAuthCookies(
        response
      );
    }

    return response;
  }

  return NextResponse.json(
    {
      success: false,
      message:
        "Internal server error",
    },
    {
      status: 500,
    }
  );
}