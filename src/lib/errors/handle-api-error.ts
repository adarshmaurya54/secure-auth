import { NextResponse } from "next/server";
import { ApiError } from "./api-error";

export function handleApiError(
  error: unknown
) {
  console.error(error);

  if (
    error instanceof ApiError ||
    (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      "message" in error
    )
  ) {
    const apiError =
      error as ApiError;

    return NextResponse.json(
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