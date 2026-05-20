/**
 * HTTP server that serves the visual pipeline UI and exposes a state API.
 */

import { createServer as createHttpServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { PipelineState, StageId } from "./state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = join(__dirname, "..", "site");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function serveFile(res: ServerResponse, filePath: string): void {
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = readFileSync(filePath);

  res.writeHead(200, { "Content-Type": contentType });
  res.end(content);
}

export function createServer(state: PipelineState, port: number) {
  const server = createHttpServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || "/";
    const method = req.method || "GET";

    // CORS headers for local development
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // API routes
    if (url === "/api/state" && method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(state.read()));
      return;
    }

    if (url?.startsWith("/api/stage/") && url.endsWith("/start") && method === "POST") {
      const stageId = url.replace("/api/stage/", "").replace("/start", "") as StageId;
      try {
        const currentStatus = state.getStageStatus(stageId);
        if (currentStatus !== "ready") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Stage '${stageId}' is '${currentStatus}', not 'ready'` }));
          return;
        }
        state.setStageStatus(stageId, "running");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, state: state.read() }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
      return;
    }

    if (url?.startsWith("/api/stage/") && url.endsWith("/complete") && method === "POST") {
      const stageId = url.replace("/api/stage/", "").replace("/complete", "") as StageId;
      try {
        state.setStageStatus(stageId, "done");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, state: state.read() }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
      return;
    }

    if (url?.startsWith("/api/stage/") && url.endsWith("/retry") && method === "POST") {
      const stageId = url.replace("/api/stage/", "").replace("/retry", "") as StageId;
      try {
        const currentStatus = state.getStageStatus(stageId);
        if (currentStatus !== "failed") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Stage '${stageId}' is '${currentStatus}', not 'failed'` }));
          return;
        }
        state.setStageStatus(stageId, "ready");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, state: state.read() }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: (err as Error).message }));
      }
      return;
    }

    // Static file serving
    let filePath = join(SITE_DIR, url === "/" ? "index.html" : url);
    serveFile(res, filePath);
  });

  server.listen(port, "127.0.0.1", () => {});
  return server;
}
