// src/modules/auth/helpers/device-info.ts

import { UAParser } from "ua-parser-js";
import { NextRequest } from "next/server";

export function getDeviceInfo(request: NextRequest) {
  const userAgent =
    request.headers.get("user-agent") || "";

  const parser = new UAParser(userAgent);

  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",

    os: result.os.name || "Unknown",

    device:
      result.device.type === "mobile"
        ? "Mobile"
        : result.device.type === "tablet"
        ? "Tablet"
        : "Desktop",
  };
}