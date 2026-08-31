import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { createContext } from "../server/_core/context";
import { appRouter } from "../server/routers";

const app = express();

// Keep this limit above the largest supported attachment (15 MB client payload,
// including base64 overhead) while still protecting the serverless function.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "lead-lead-api" });
});
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);


export default function handler(req: express.Request, res: express.Response) {
  return app(req, res);
}
