import type { IncomingMessage, ServerResponse } from "node:http";

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

async function handleStorage(
  req: VercelRequest,
  res: VercelResponse,
  ENV: { forgeApiUrl: string; forgeApiKey: string },
  storageGetSignedUrl: (key: string) => Promise<string>,
) {
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

  try {
    const { ENV } = await import("../server/_core/env");
    if (requestUrl.pathname.startsWith("/manus-storage/")) {
      const { storageGetSignedUrl } = await import("../server/storage");
      await handleStorage(req, res, ENV, storageGetSignedUrl);
      return;
    }

    const [{ nodeHTTPRequestHandler }, { appRouter }, { createContext }] =
      await Promise.all([
        import("@trpc/server/adapters/node-http"),
        import("../server/routers"),
        import("../server/_core/context"),
      ]);
    const path = requestUrl.pathname.replace(/^\/api\/trpc\/?/, "");
    await nodeHTTPRequestHandler({
      req,
      res,
      path,
      router: appRouter,
      createContext: options => createContext(options as never),
    });
  } catch (error) {
    console.error("[API] invocation failed:", error);
    if (!res.headersSent) {
      sendJson(res, 500, {
        error: "API initialization failed",
        detail: error instanceof Error ? error.message : String(error),
      });
    } else {
      res.end();
    }
  }
}
