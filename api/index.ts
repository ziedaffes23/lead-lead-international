import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { ENV } from "../server/_core/env";
import { storageGetSignedUrl } from "../server/storage";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[]>;
};

type VercelResponse = ServerResponse & {
  status?: (code: number) => VercelResponse;
  json?: (body: unknown) => void;
};

function sendJson(res: VercelResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function handleStorage(req: VercelRequest, res: VercelResponse) {
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");
  const key = decodeURIComponent(
    requestUrl.pathname.replace(/^\/manus-storage\//, ""),
  );
  if (!key) {
    sendJson(res, 400, { error: "Missing storage key" });
    return;
  }
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    sendJson(res, 500, { error: "Storage proxy not configured" });
    return;
  }
  try {
    const signedUrl = await storageGetSignedUrl(key);
    res.statusCode = 307;
    res.setHeader("Location", signedUrl);
    res.end();
  } catch (error) {
    console.error("[StorageProxy] failed:", error);
    sendJson(res, 502, { error: "Storage proxy error" });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");

  if (requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "lead-lead-api" });
    return;
  }

  if (requestUrl.pathname.startsWith("/manus-storage/")) {
    await handleStorage(req, res);
    return;
  }

  const path = requestUrl.pathname.replace(/^\/api\/trpc\/?/, "");
  await nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext: options => createContext(options as never),
  });
}
