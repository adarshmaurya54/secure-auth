import { NextResponse } from "next/server";

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

export function successResponse<T>(
  message: string,
  data?: T,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponse<T>,
    { status }
  );
}

export function errorResponse(
  message: string,
  error?: unknown,
  status = 500
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
    } as ApiResponse,
    { status }
  );
}