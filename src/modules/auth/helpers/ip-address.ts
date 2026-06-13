import { NextRequest } from "next/server";

export function getIpAddress(
  request: NextRequest
) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const realIp =
    request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  if (realIp) {
    return realIp;
  }

  return "Unknown";
}