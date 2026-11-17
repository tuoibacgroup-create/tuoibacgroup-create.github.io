#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 4173;
const HOST = "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".ico": "image/x-icon"
};

function openBrowser(url) {
  if (process.argv.includes("--no-open")) return;
  if (process.platform === "win32") {
    exec(`start "" "${url}"`);
  }
}

const server = http.createServer((req, res) => {
  const cleanPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const absPath = path.resolve(ROOT, "." + relPath);
  if (!absPath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  fs.readFile(absPath, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(absPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(buf);
  });
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    const url = `http://${HOST}:${PORT}`;
    console.log(`Tuoi Bac server already active at ${url}`);
    openBrowser(url);
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`Tuoi Bac PWA running at ${url}`);
  console.log(`Multi-device test tabs: ${url}/?may=1  and  ${url}/?may=2`);
  console.log("Press Ctrl+C to stop.");
  openBrowser(url);
});
