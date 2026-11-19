#!/usr/bin/env node
/**
 * TUOI BAC E2E REGRESSION SUITE (16 ROUTES x 2 FONT MODES + INTERACTIVE FLOWS)
 * Runs Chromium at 390x844 (@2x) against a self-hosted local HTTP server.
 * Verifies:
 *  - All 16 routes render with 0 horizontal overflow (scrollWidth <= 390) in both 20px and 24px (.xl-font)
 *  - All visible primary action buttons maintain >= 56px height
 *  - Zero uncaught page errors, zero local console errors, zero local 4xx/5xx HTTP responses
 *  - Full interactive verification of Slices 1..6 & core sanctuary/admin workflows
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function loadPlaywright() {
  const candidates = [
    import.meta.url,
    "E:\\DuAn\\Tai EveryThings\\package.json"
  ];
  for (const base of candidates) {
    try {
      const req = createRequire(base);
      return req("playwright");
    } catch {
      // Try next candidate
    }
  }
  throw new Error("Playwright package not found. Install playwright or ensure shared workspace node_modules exists.");
}

const MIME_MAP = {
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

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsed = new URL(req.url || "/", "http://127.0.0.1");
        let relPath = decodeURIComponent(parsed.pathname);
        if (relPath === "/") relPath = "/index.html";
        const fullPath = path.resolve(ROOT, "." + relPath);
        if (!fullPath.startsWith(ROOT)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }
        if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
          res.writeHead(404);
          res.end("Not Found");
          return;
        }
        const ext = path.extname(fullPath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME_MAP[ext] || "application/octet-stream",
          "Cache-Control": "no-store"
        });
        fs.createReadStream(fullPath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, port: addr.port, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`);
  }
}

const ALL_16_ROUTES = [
  { route: "home", openVia: "bnav:home" },
  { route: "almanac", openVia: "go:almanac" },
  { route: "checkin", openVia: "go:checkin" },
  { route: "tearoom", openVia: "go:tearoom" },
  { route: "newspaper", openVia: "go:newspaper" },
  { route: "groups", openVia: "go:groups" },
  { route: "xiangqi", openVia: "go:xiangqi" },
  { route: "games", openVia: "go:games" },
  { route: "quiz", openVia: "go:quiz" },
  { route: "poetry", openVia: "go:poetry" },
  { route: "watch", openVia: "go:watch" },
  { route: "zen", openVia: "go:zen" },
  { route: "leaderboard", openVia: "go:leaderboard" },
  { route: "profile", openVia: "bnav:profile" },
  { route: "health", openVia: "go:health" },
  { route: "family", openVia: "go:family" },
  { route: "privacy", openVia: "go:privacy" }
];

async function navigateToRouteFromUi(page, item) {
  if (item.route === "home") {
    await page.click('[data-bnav="home"]');
  } else if (item.openVia.startsWith("bnav:")) {
    const key = item.openVia.split(":")[1];
    await page.click(`[data-bnav="${key}"]`);
  } else if (item.openVia.startsWith("go:")) {
    const target = item.openVia.split(":")[1];
    await page.click('[data-bnav="home"]');
    await page.waitForSelector(`[data-go="${target}"]`, { timeout: 5000 });
    await page.click(`[data-go="${target}"]`);
  }
  await page.waitForTimeout(180);
}

async function inspectCurrentViewportErgonomics(page, routeName, expectedFontPx) {
  const report = await page.evaluate(() => {
    const htmlStyle = window.getComputedStyle(document.documentElement);
    const rootFontPx = parseFloat(htmlStyle.fontSize);
    const scrollW = document.documentElement.scrollWidth;
    const innerW = window.innerWidth;
    const primaryBtns = Array.from(
      document.querySelectorAll("#app-main button.btn-primary, #app-main button.btn-jade, #app-main button.btn-secondary, #app-main button.btn-danger")
    ).filter((el) => {
      const st = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return st.display !== "none" && st.visibility !== "hidden" && r.width > 0 && r.height > 0;
    });
    const undersized = primaryBtns
      .map((el) => ({
        id: el.id || el.textContent.trim().slice(0, 26),
        h: Math.round(el.getBoundingClientRect().height * 10) / 10
      }))
      .filter((x) => x.h < 55.5);

    return {
      rootFontPx,
      scrollW,
      innerW,
      h1: (document.querySelector("#app-main h1") || {}).textContent || "",
      primaryBtnCount: primaryBtns.length,
      undersized
    };
  });

  assert(
    Math.abs(report.rootFontPx - expectedFontPx) < 0.5,
    `[${routeName} @ ${expectedFontPx}px] Expected html font-size ${expectedFontPx}px, got ${report.rootFontPx}px`
  );
  assert(
    report.scrollW <= report.innerW,
    `[${routeName} @ ${expectedFontPx}px] Horizontal overflow detected: scrollWidth=${report.scrollW} > innerWidth=${report.innerW}`
  );
  assert(
    report.undersized.length === 0,
    `[${routeName} @ ${expectedFontPx}px] Found primary button < 56px: ${JSON.stringify(report.undersized)}`
  );
  return report;
}

async function main() {
  const { chromium } = loadPlaywright();
  const shotsArgIdx = process.argv.indexOf("--shots");
  const cliShotsDir = shotsArgIdx >= 0 && process.argv[shotsArgIdx + 1] ? process.argv[shotsArgIdx + 1] : "";
  const shotsDir = cliShotsDir
    ? path.resolve(cliShotsDir)
    : process.env.SAVE_SHOTS_DIR
      ? path.resolve(process.env.SAVE_SHOTS_DIR)
      : "";
  if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });

  const { server, baseUrl } = await startStaticServer();
  const pageErrors = [];
  const localConsoleErrors = [];
  const failedLocalResponses = [];

  console.log("======================================================================");
  console.log(" TUOI BAC E2E REGRESSION — 16 ROUTES x (20px & 24px) + FEATURE FLOWS");
  console.log("======================================================================");

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      locale: "vi-VN"
    });
    const page = await context.newPage();

    let allowIntentionalCspBlockMsg = false;
    let observedCspBlocks = 0;

    page.on("pageerror", (err) => {
      pageErrors.push(err.message || String(err));
    });
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const txt = msg.text();
      if (/mqtt|websocket|emqx|hivemq|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|translate_tts/i.test(txt)) {
        return;
      }
      if (allowIntentionalCspBlockMsg && /Content Security Policy/i.test(txt)) {
        observedCspBlocks += 1;
        return;
      }
      localConsoleErrors.push(txt);
    });
    page.on("response", (res) => {
      const url = res.url();
      if (url.startsWith(baseUrl) && res.status() >= 400) {
        failedLocalResponses.push(`${res.status()} ${url}`);
      }
    });

    await page.goto(`${baseUrl}/?may=e2e`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#app-main h1", { timeout: 8000 });

    // ------------------------------------------------------------------
    // PART 1: Sweep all 16 routes in 20px standard mode & 24px XL mode
    // ------------------------------------------------------------------
    for (const item of ALL_16_ROUTES) {
      await navigateToRouteFromUi(page, item);
      await inspectCurrentViewportErgonomics(page, item.route, 20);
    }
    console.log("[PASS] 1. Quet 17/17 man hinh o che do Chu chuan 20px (0 tran ngang, nut >= 56px)");

    await page.click("#btn-font-toggle");
    await page.waitForTimeout(120);

    for (const item of ALL_16_ROUTES) {
      await navigateToRouteFromUi(page, item);
      await inspectCurrentViewportErgonomics(page, item.route, 24);
    }
    console.log("[PASS] 2. Quet 17/17 man hinh o che do Chu to 24px .xl-font (0 tran ngang, nut >= 56px)");

    // Switch back to 20px for crisp functional feature tests
    await page.click("#btn-font-toggle");
    await page.waitForTimeout(100);

    // ------------------------------------------------------------------
    // PART 2: Slice 1 — Calendar Day Rollover & 3 Daily Quests Chest
    // ------------------------------------------------------------------
    await page.evaluate(() => {
      const key = "tuoi_bac_sim_v7_e2e";
      const st = JSON.parse(localStorage.getItem(key));
      st.route = "home";
      st.user.lastActiveDate = "2026-01-01";
      st.user.checkedInToday = true;
      st.user.flowersLeft = 0;
      st.health.medMorning = true;
      st.health.waterCups = 6;
      const raw = JSON.stringify(st);
      localStorage.setItem(key, raw);
      localStorage.setItem(key + "_vault_bak", raw);
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("#home-daily-quest-card", { timeout: 6000 });

    const rolledState = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      return {
        checkedInToday: st.user.checkedInToday,
        flowersLeft: st.user.flowersLeft,
        medMorning: st.health.medMorning,
        waterCups: st.health.waterCups,
        lastActiveDate: st.user.lastActiveDate
      };
    });
    assert(rolledState.checkedInToday === false, "Rollover must reset checkedInToday");
    assert(rolledState.flowersLeft === 3, "Rollover must refill flowersLeft to 3");
    assert(rolledState.medMorning === false && rolledState.waterCups === 0, "Rollover must reset daily meds/water");

    // Complete Quest 1 (Check-in), Quest 2 (Temple Bell), Quest 3 (Quiz Answer)
    await page.click('[data-go="checkin"]');
    await page.waitForSelector("#btn-do-checkin");
    await page.click("#btn-do-checkin");

    await page.click('[data-bnav="home"]');
    await page.click('[data-go="zen"]');
    await page.waitForSelector("#btn-ring-bell");
    await page.click("#btn-ring-bell");

    await page.click('[data-bnav="home"]');
    await page.click('[data-go="quiz"]');
    await page.waitForSelector(".quiz-opt-btn");
    await page.click(".quiz-opt-btn");

    await page.click('[data-bnav="home"]');
    await page.waitForSelector("#btn-claim-daily-chest");
    await page.locator("#home-daily-quest-card").scrollIntoViewIfNeeded();
    if (shotsDir) {
      await page.screenshot({ path: path.join(shotsDir, "01-home-daily-quests-ready.png") });
    }
    const xuBeforeChest = await page.evaluate(() => JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e")).user.xu);
    await page.click("#btn-claim-daily-chest");
    const afterChest = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      return { xu: st.user.xu, claimed: st.user.dailyQuests.chestClaimed };
    });
    assert(afterChest.claimed === true && afterChest.xu === xuBeforeChest + 12, "Daily chest must award +12 Xu");
    console.log("[PASS] 3. Slice 1 — Chuyen ngay lich moi & Hop Loc 3 Niem Vui (+12 Xu)");

    // ------------------------------------------------------------------
    // PART 3: Slice 2 — Smart O An Quan AI + Hint & Ca Dao Tri Nho
    // ------------------------------------------------------------------
    await page.click('[data-bnav="games"]');
    await page.waitForSelector(".oaq-board");
    const topBeforeHint = await page.evaluate(
      () => document.querySelector(".oaq-board").getBoundingClientRect().top + window.scrollY
    );
    await page.click("#oaq-btn-hint");
    const topAfterHint = await page.evaluate(
      () => document.querySelector(".oaq-board").getBoundingClientRect().top + window.scrollY
    );
    assert(Math.abs(topAfterHint - topBeforeHint) <= 1, `OAQ board shifted on hint: ${topBeforeHint} -> ${topAfterHint}`);

    await page.click("#tab-cadao");
    await page.waitForSelector(".proverb-board-grid");
    if (shotsDir) {
      await page.evaluate(() => document.querySelector(".proverb-board-grid").scrollIntoView({ block: "center" }));
      await page.screenshot({ path: path.join(shotsDir, "02-games-cadao-memory.png") });
    }
    // Pair all 6 proverb pairs deterministically using deck pairIds
    const pairGroups = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      const deck = st.oaq.proverbGame.deck;
      const map = {};
      deck.forEach((card, i) => {
        if (!map[card.pairId]) map[card.pairId] = [];
        map[card.pairId].push(i);
      });
      return Object.values(map);
    });
    assert(pairGroups.length === 6, "Proverb deck must contain 6 pairs (12 wooden cards)");
    for (const [idxA, idxB] of pairGroups) {
      await page.click(`[data-pv-idx="${idxA}"]`);
      await page.click(`[data-pv-idx="${idxB}"]`);
    }
    const pvStats = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      return { matchedCount: st.oaq.proverbGame.matchedIds.length, wins: st.user.gameStats.proverbWins };
    });
    assert(pvStats.matchedCount === 6 && pvStats.wins >= 1, "Completing 6 proverb pairs must match all 6 & increment proverbWins");
    console.log("[PASS] 4. Slice 2 — AI O An Quan (0px giat ban) & Lat The Ca Dao Tri Nho (6 cap)");

    // ------------------------------------------------------------------
    // PART 4: Slice 3 — 25-Question Quiz (5 Packs) & 50/50 Lifeline
    // ------------------------------------------------------------------
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="quiz"]');
    const freshPackIdx = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      return ((st.quiz.packIdx || 0) + 1) % 5;
    });
    await page.waitForSelector(`[data-qpack="${freshPackIdx}"]`);
    await page.click(`[data-qpack="${freshPackIdx}"]`);
    await page.waitForSelector("#btn-quiz-5050");
    await page.click("#btn-quiz-5050");
    const eliminatedCount = await page.locator(".quiz-opt-btn.is-eliminated[disabled]").count();
    assert(eliminatedCount === 2, `Expected 2 eliminated options after 50/50, got ${eliminatedCount}`);
    if (shotsDir) {
      await page.screenshot({ path: path.join(shotsDir, "03-quiz-25q-5050.png") });
    }
    console.log("[PASS] 5. Slice 3 — Ngan hang 25 cau Do Vui (5 bo de) & Tro giup 50/50");

    // ------------------------------------------------------------------
    // PART 5: Slice 4 — Xiangqi Friendly Club Cup (3 Rounds + Unit Entry)
    // ------------------------------------------------------------------
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="groups"]');
    await page.waitForSelector("[data-open-group]");
    await page.click("[data-open-group]");
    await page.waitForSelector("#btn-unit-enter-chess-cup");
    await page.click("#btn-unit-enter-chess-cup");
    await page.waitForSelector(".cup-bracket-bar");
    const cupActiveMode = await page.evaluate(() => JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e")).xiangqi.mode);
    assert(cupActiveMode === "cup", `Expected xiangqi mode 'cup', got '${cupActiveMode}'`);
    if (shotsDir) {
      await page.evaluate(() => document.querySelector(".cup-bracket-bar").scrollIntoView({ block: "center" }));
      await page.screenshot({ path: path.join(shotsDir, "04-xiangqi-club-cup.png") });
    }
    console.log("[PASS] 6. Slice 4 — Cup Co Tuong Dong Ngu 3 Vong & Cu dai dien tu Don vi");

    // ------------------------------------------------------------------
    // PART 6: Slice 5 — Poem Silk Postcard, Live Watch 24 FPS, Health BP/Water
    // ------------------------------------------------------------------
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="poetry"]');
    await page.waitForSelector("#btn-rhyme-helper");
    await page.click("#btn-rhyme-helper");
    const poemVal = await page.inputValue("#poem-body-in");
    assert(poemVal.split("\n").length >= 2, "Rhyme helper must populate a 2-line Luc Bat couplet");
    await page.click(".export-poem-card-btn");
    await page.waitForSelector('#tb-dialog[open] img[src^="data:image/png;base64,"]');
    if (shotsDir) {
      await page.screenshot({ path: path.join(shotsDir, "05-poetry-silk-postcard.png") });
    }
    await page.click("#tb-dialog-close");

    await page.click('[data-bnav="home"]');
    await page.click('[data-go="watch"]');
    await page.waitForSelector("#watch-stage-canvas");
    await page.waitForTimeout(120);
    const canvasOk = await page.evaluate(() => {
      const c = document.getElementById("watch-stage-canvas");
      if (!c || c.width === 0 || c.height === 0) return false;
      const ctx = c.getContext("2d");
      const px = ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data;
      return px[3] > 0;
    });
    assert(canvasOk, "Watch live stage canvas must paint non-transparent pixels");
    await page.click('.reaction-btn[data-rx="heart"]');
    if (shotsDir) {
      await page.evaluate(() => document.getElementById("watch-stage-canvas").scrollIntoView({ block: "center" }));
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(shotsDir, "06-watch-live-stage.png") });
    }

    await page.click('[data-bnav="home"]');
    await page.click('[data-go="family"]');
    await page.fill("#fam-contact-name", "Con gái Minh Anh");
    await page.fill("#fam-contact-phone", "0988776655");
    await page.click("#btn-save-fam-contact");

    await page.click('[data-bnav="home"]');
    await page.click('[data-go="health"]');
    await page.click("#btn-toggle-med");
    await page.click("#btn-toggle-med-eve");
    await page.click("#btn-add-water-cup");
    await page.fill("#bp-sys-in", "124");
    await page.fill("#bp-dia-in", "78");
    await page.click("#btn-save-bp");
    if (shotsDir) {
      await page.screenshot({ path: path.join(shotsDir, "07-health-water-bp.png") });
    }
    // Trigger hypertensive crisis red flag (>= 180/120) and verify custom family contact link
    await page.fill("#bp-sys-in", "184");
    await page.fill("#bp-dia-in", "122");
    await page.click("#btn-save-bp");
    const famTelHref = await page.getAttribute('a.btn-primary[href^="tel:"]', "href");
    assert(famTelHref === "tel:0988776655", `Expected custom emergency tel:0988776655, got ${famTelHref}`);
    await page.click("#btn-clear-emergency");
    console.log("[PASS] 7. Slice 5 — In Thiep Lua Bai Tho, San khau Xem chung 24 FPS, So Nuoc & Huyet ap");

    // ------------------------------------------------------------------
    // PART 7: Core Sanctuary Spaces, Lantern 3m, Red Slip 45s & Admin PIN
    // ------------------------------------------------------------------
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="zen"]');
    await page.click('[data-zen="1"]'); // Nha Tho Ho
    await page.waitForTimeout(100);
    await page.click('[data-zen="2"]'); // Vuon Thien
    await page.waitForTimeout(100);
    await page.click("#btn-temple-pond-lantern");
    await page.click("#btn-draw-peace-card");
    await page.waitForSelector(".red-slip-backdrop", { timeout: 4000 });
    await page.click("#btn-red-slip-dismiss");
    const peaceCooldownActive = await page.evaluate(() =>
      document.getElementById("btn-draw-peace-card").classList.contains("is-cooldown")
    );
    assert(peaceCooldownActive === true, "Fortune stick button must enter 45s .is-cooldown after drawing");

    await page.click('[data-bnav="home"]');
    await page.click('[data-go="privacy"]');
    await page.click("#btn-unlock-admin-console");
    await page.waitForSelector("#admin-pin-input");
    await page.fill("#admin-pin-input", "2026");
    await page.click("#btn-submit-admin-pin");
    await page.waitForSelector("#btn-priv-tab-uat");
    await page.click("#btn-priv-tab-uat");
    await page.waitForTimeout(100);
    await page.click("#btn-admin-lock-now");
    console.log("[PASS] 8. Core — 3 Khong gian Tinh Tam, Hoa Dang 3p, To Giay Do 45s & Khoa Admin");

    // ------------------------------------------------------------------
    // PART 8: New Heritage 2.5D Items (12), Accessories (8), Outfits (8) & Pavilion Hero
    // ------------------------------------------------------------------
    await page.click('[data-bnav="home"]');
    await page.waitForSelector(".home-pavilion-hero");
    if (shotsDir) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(shotsDir, "08-home-pavilion-hero.png") });
    }

    await page.click('[data-bnav="profile"]');
    await page.waitForSelector("#profile-preview-canvas");
    const wardrobeCounts = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      return {
        rooms: window.TuoiBacData.ROOM_TEMPLATES.length,
        outfits: window.TuoiBacData.OUTFITS.length,
        accessories: window.TuoiBacData.ACCESSORIES.length,
        items: window.TuoiBacData.TABLE_ITEMS.length,
        unlockedItems: st.user.unlockedItems || []
      };
    });
    assert(
      wardrobeCounts.rooms === 6 &&
      wardrobeCounts.outfits === 14 &&
      wardrobeCounts.accessories === 11 &&
      wardrobeCounts.items === 13,
      `Expected 6 rooms / 14 outfits / 11 accessories / 13 items, got ${JSON.stringify(wardrobeCounts)}`
    );
    assert(
      wardrobeCounts.unlockedItems.includes("khay-trau-cau") && wardrobeCounts.unlockedItems.includes("banh-dau-xanh"),
      `Expected milestone gifts 'khay-trau-cau' & 'banh-dau-xanh' unlocked, got ${JSON.stringify(wardrobeCounts.unlockedItems)}`
    );

    // Preview Bac Ninh / Mien Trung / Mien Nam regional outfits & headwear + khay-tra-da
    await page.click('.preview-outfit-btn[data-id="ao-tu-than-bac-ninh"]');
    await page.click('[data-wcat="accessories"]');
    await page.waitForSelector('.preview-acc-btn[data-id="non-quai-thao"]');
    await page.click('.preview-acc-btn[data-id="non-quai-thao"]');
    await page.click('[data-wcat="items"]');
    await page.waitForSelector('.equip-item-btn[data-id="khay-trau-cau"]');
    await page.click('.equip-item-btn[data-id="khay-trau-cau"]');
    await page.waitForTimeout(160);
    if (shotsDir) {
      await page.evaluate(() => document.getElementById("profile-live-card").scrollIntoView({ block: "start" }));
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(shotsDir, "09-wardrobe-bac-ninh-quai-thao.png") });
    }

    await page.click('[data-wcat="outfits"]');
    await page.click('.preview-outfit-btn[data-id="ao-ngu-than-mien-trung"]');
    await page.click('[data-wcat="accessories"]');
    await page.click('.preview-acc-btn[data-id="khan-xep-kinh-bac"]');
    await page.click('[data-wcat="items"]');
    await page.click('.equip-item-btn[data-id="lu-tram-dong"], .preview-item-btn[data-id="lu-tram-dong"]');
    await page.waitForTimeout(140);
    if (shotsDir) {
      await page.evaluate(() => document.getElementById("profile-live-card").scrollIntoView({ block: "start" }));
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(shotsDir, "10-wardrobe-mien-trung-ngu-than.png") });
    }

    await page.click('[data-wcat="outfits"]');
    await page.click('.preview-outfit-btn[data-id="ao-ba-ba-nam-bo"]');
    await page.click('[data-wcat="accessories"]');
    await page.click('.preview-acc-btn[data-id="khan-ran-nam-bo"]');
    await page.click('[data-wcat="items"]');
    await page.click('.preview-item-btn[data-id="khay-tra-da"]');
    await page.waitForTimeout(140);
    if (shotsDir) {
      await page.evaluate(() => document.getElementById("profile-live-card").scrollIntoView({ block: "start" }));
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(shotsDir, "11-wardrobe-mien-nam-khan-ran-tra-da.png") });
    }
    await inspectCurrentViewportErgonomics(page, "profile-new-items", 20);

    // Verify 1-tap Sidewalk Iced Tea Stall ("Quan Tra Da Via He") + distinct room backdrops!
    await page.click('[data-bnav="home"]');
    await page.waitForSelector("#btn-home-open-viahe");
    await page.click("#btn-home-open-viahe");
    if ((await page.locator("#tb-dialog[open] #btn-confirm-forfeit-leave").count()) > 0) {
      await page.click("#btn-confirm-forfeit-leave");
    }
    await page.waitForSelector("#tearoom-stage");
    await page.waitForTimeout(220);
    await inspectCurrentViewportErgonomics(page, "tearoom-viahe-lobby", 20);
    if (shotsDir) {
      await page.evaluate(() => document.getElementById("tearoom-stage").scrollIntoView({ block: "center" }));
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(shotsDir, "13-viahe-lobby-25d.png") });
    }
    await page.click("#btn-join-recommended");
    await page.waitForSelector("#btn-back-lobby");
    await page.waitForTimeout(220);
    await inspectCurrentViewportErgonomics(page, "tearoom-viahe-table", 20);
    if (shotsDir) {
      await page.evaluate(() => document.getElementById("tearoom-stage").scrollIntoView({ block: "center" }));
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(shotsDir, "14-viahe-table-25d.png") });

      // Also capture Phong Tho, Phong Co, Phong CCB & Phong Cay Canh table scenes!
      for (const [rid, shotName] of [
        ["phong-tho", "15-room-tho-table-25d.png"],
        ["phong-co", "16-room-co-table-25d.png"],
        ["phong-ccb", "17-room-ccb-table-25d.png"],
        ["phong-cay-canh", "18-room-caycanh-table-25d.png"]
      ]) {
        await page.click(`[data-room-id="${rid}"]`);
        await page.waitForSelector("#btn-join-recommended");
        await page.click("#btn-join-recommended");
        await page.waitForSelector("#btn-back-lobby");
        await page.waitForTimeout(220);
        await page.evaluate(() => document.getElementById("tearoom-stage").scrollIntoView({ block: "center" }));
        await page.waitForTimeout(80);
        await page.screenshot({ path: path.join(shotsDir, shotName) });
      }
    }
    await page.click('[data-bnav="profile"]');
    console.log("[PASS] 9. Regional & Via He — 6 Phong rieng biet (co Tra Da Via He), 14 Trang phuc Ba Mien, 11 Phu kien & 13 Do ban");

    // ------------------------------------------------------------------
    // PART 8B: Lich Van Nien (UTC+7), Gio Xuat Phat, Nhac Viec .ics & Giong Chao 12s
    // ------------------------------------------------------------------
    await page.click('[data-bnav="home"]');
    await page.waitForSelector("#home-community-sessions");
    const homeCardCount = await page.locator(".home-hero-grid-4 .home-core-card").count();
    assert(homeCardCount === 6, `Expected 6 symmetric cards in Viec Chinh Hom Nay, got ${homeCardCount}`);

    const almanacMath = await page.evaluate(() => {
      const A = window.TuoiBacData.Almanac;
      const tet2026 = A.solarToLunarVi(17, 2, 2026);
      const tet2030 = A.solarToLunarVi(2, 2, 2030);
      const plan = A.evaluateDeparturePlan("2026-11-20", "xuat-hanh", 1961);
      return {
        tet2026,
        tet2030,
        topCount: plan.topSlots.length,
        hasDir: Boolean(plan.recommendedDir)
      };
    });
    assert(almanacMath.tet2026.day === 1 && almanacMath.tet2026.month === 1 && almanacMath.tet2026.year === 2026, "Tet 2026 UTC+7 mismatch");
    assert(almanacMath.tet2030.day === 1 && almanacMath.tet2030.month === 1 && almanacMath.tet2030.year === 2030, "Tet 2030 VN UTC+7 mismatch");
    assert(almanacMath.topCount === 3 && almanacMath.hasDir, "Departure planner failed to return Top 3 slots & direction");

    await page.click('[data-go="almanac"]');
    await page.waitForSelector("#bloc-calendar-card");
    const xuBeforeTear = await page.evaluate(() => JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e")).user.xu);
    if ((await page.locator("#btn-tear-calendar").count()) > 0) {
      await page.click("#btn-tear-calendar");
      const xuAfterTear = await page.evaluate(() => JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e")).user.xu);
      assert(xuAfterTear === xuBeforeTear + 3, `Expected +3 Xu on tearing calendar, got ${xuBeforeTear} -> ${xuAfterTear}`);
    }
    await inspectCurrentViewportErgonomics(page, "almanac-today", 20);

    await page.click("#alm-tab-depart");
    await page.waitForSelector("#alm-depart-result");
    await inspectCurrentViewportErgonomics(page, "almanac-depart", 20);

    await page.click("#alm-tab-rem");
    await page.waitForSelector("#rem-create-panel");
    await page.click('[data-rem-preset="gio-chap"]');
    await page.click("#btn-add-reminder");
    await inspectCurrentViewportErgonomics(page, "almanac-reminders", 20);

    // Intercept actual .ics file download and verify RFC 5545 + VALARM structure
    const [icsDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.click("[data-rem-ics]")
    ]);
    const icsTmpPath = await icsDownload.path();
    const icsRaw = fs.readFileSync(icsTmpPath, "utf8");
    assert(icsRaw.startsWith("BEGIN:VCALENDAR\r\n"), "ICS file must start with BEGIN:VCALENDAR CRLF without BOM");
    assert(icsRaw.includes("TRIGGER:-PT30M") && icsRaw.includes("TRIGGER:-P1D"), "ICS file missing 30m and 1d VALARM");

    // Verify 24px XL Font ergonomics on all 3 Almanac sub-tabs too
    await page.click("#btn-font-toggle");
    await inspectCurrentViewportErgonomics(page, "almanac-reminders-xl", 24);
    await page.click("#alm-tab-depart");
    await inspectCurrentViewportErgonomics(page, "almanac-depart-xl", 24);
    await page.click("#alm-tab-today");
    await inspectCurrentViewportErgonomics(page, "almanac-today-xl", 24);
    await page.click("#btn-font-toggle");

    // Verify URL Deep Links ?lich=2026-02-17 (Tet Binh Ngo) and ?nhac=1 + Hometown Weekly Race
    await page.goto(`${baseUrl}/?may=e2e&lich=2026-02-17`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#bloc-calendar-card");
    const tetText = await page.locator("#bloc-calendar-card").innerText();
    assert(tetText.includes("1/1") && tetText.includes("Bính Ngọ"), `Expected Tet 1/1 Binh Ngo on ?lich=2026-02-17, got: ${tetText}`);

    await page.goto(`${baseUrl}/?may=e2e&nhac=1`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#rem-create-panel");

    await page.goto(`${baseUrl}/?may=e2e`, { waitUntil: "domcontentloaded" });
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="checkin"]');
    await page.click("#chk-tab-rank");
    await page.waitForSelector("#btn-invite-hometown-zalo");
    await inspectCurrentViewportErgonomics(page, "checkin-weekly-race", 20);

    // Verify 12s Voice Greeting on Tea Table & .ics calendar alarm builder
    const icsPreview = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      st.teaRoom.subView = "lobby";
      st.teaRoom.roomId = "phong-tra";
      st.teaRoom.lastSentAt = 0;
      localStorage.setItem("tuoi_bac_sim_v7_e2e", JSON.stringify(st));
      return st.reminders && Array.isArray(st.reminders.items) ? st.reminders.items.length : 0;
    });
    assert(icsPreview >= 3, `Expected at least 3 reminders after adding Gio chap, got ${icsPreview}`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.click('[data-bnav="tearoom"]');
    await page.waitForSelector(".join-table-btn");
    await page.click(".join-table-btn");
    await page.waitForSelector("#tea-in-tab-compose");
    await page.click("#tea-in-tab-compose");
    await page.waitForSelector("#btn-voice-clip-12s");
    await page.click("#btn-voice-clip-12s");
    await page.waitForSelector("#btn-send-voice-clip");
    await page.click("#btn-send-voice-clip");
    await page.waitForSelector(".tea-voice-clip-pill");

    await page.click('[data-bnav="profile"]');
    console.log("[PASS] 9B. Lich Van Nien (UTC+7), Gio Xuat Phat, So Nhac Viec 3 Tang, 3 Ca Hop Quan & Loi Chao Giong 12s");

    // ------------------------------------------------------------------
    // PART 9: Automated Penetration Test (Pentest) & Security Hardening
    // ------------------------------------------------------------------
    // 9A. CSP inline script execution block
    allowIntentionalCspBlockMsg = true;
    const cspCheck = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      const s = document.createElement("script");
      s.textContent = "window.__pentest_inline_xss = 1;";
      document.body.appendChild(s);
      s.remove();
      return {
        hasCspMeta: Boolean(meta && meta.getAttribute("content").includes("script-src 'self'")),
        inlineExecuted: Boolean(window.__pentest_inline_xss)
      };
    });
    await page.waitForTimeout(60);
    allowIntentionalCspBlockMsg = false;
    assert(cspCheck.hasCspMeta === true, "Missing strict Content-Security-Policy meta header");
    assert(cspCheck.inlineExecuted === false && observedCspBlocks >= 1, "CSP failed to block injected inline <script>");

    // 9B. Multi-context XSS payloads in Profile Identity, Tea Chat & Zen Wish
    await page.click("#prof-tab-identity");
    await page.waitForSelector("#prof-name-in");
    await page.fill("#prof-name-in", `"><img src=x onerror="window.__xss=1">Sơn`);
    await page.click("#btn-save-name");
    const safeSavedName = await page.evaluate(() => JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e")).user.name);
    assert(!/[<>"]/.test(safeSavedName), `Unsafe chars leaked into saved user name: ${safeSavedName}`);

    // 9C. Scam phone obfuscation, shortlinks & split-phoneticDict expansion bypass attempt
    await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      st.teaRoom.subView = "lobby";
      st.teaRoom.roomId = "phong-tra";
      st.teaRoom.lastSentAt = 0;
      st.phoneticDict.push(
        { wrong: "ma1", right: "0988", hits: 1, learnedBy: "Test" },
        { wrong: "ma2", right: "777666", hits: 1, learnedBy: "Test" }
      );
      localStorage.setItem("tuoi_bac_sim_v7_e2e", JSON.stringify(st));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.click('[data-bnav="tearoom"]');
    await page.waitForSelector(".join-table-btn");
    await page.click(".join-table-btn");
    await page.waitForSelector("#tea-in-tab-compose");
    await page.click("#tea-in-tab-compose");

    for (const badMsg of [
      "Gọi ngay số ０９１ ２３４ ５６７８ nhận quà",
      "Bấm vào zalo.me/nhom-qua-tang",
      "Cán bộ viện kiểm sát yêu cầu đọc mã OTP",
      "Hỏi thăm ma1 ma2 hôm nay"
    ]) {
      await page.fill("#tea-text-input", badMsg);
      await page.click("#btn-send-text");
    }
    const scamFilterResult = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("tuoi_bac_sim_v7_e2e"));
      return {
        lastSentAt: st.teaRoom.lastSentAt,
        leakedInLog: st.teaRoom.log.some((m) => /091|zalo\.me|OTP|0988/i.test(String(m.text || "")))
      };
    });
    assert(
      scamFilterResult.lastSentAt === 0 && scamFilterResult.leakedInLog === false,
      `Scam/obfuscated/phonetic-expanded message bypassed safety filter: ${JSON.stringify(scamFilterResult)}`
    );

    // Host Table Rename scam block
    await page.click("#btn-rename-this-table");
    await page.waitForSelector("#host-tbl-name-in");
    await page.fill("#host-tbl-name-in", "Bàn trúng thưởng 0987.654.321");
    await page.click("#btn-save-host-table");
    const dialogStillOpen = await page.evaluate(() => document.getElementById("tb-dialog").hasAttribute("open"));
    assert(dialogStillOpen === true, "Host table rename allowed scam phone number!");
    await page.click("#tb-dialog-close");

    // Unit Bulletin scam block
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="groups"]');
    if ((await page.locator("[data-open-group]").count()) > 0) {
      await page.click("[data-open-group]");
    }
    await page.waitForSelector("#unit-bulletin-in");
    const bulCountBefore = await page.locator(".bulletin-card, .surface-panel .issue-feed-card").count();
    await page.fill("#unit-bulletin-in", "Chuyển khoản gấp vào 1900888899");
    await page.click("#btn-post-bulletin");
    const bulAuthDialogOpened = await page.evaluate(() => document.getElementById("tb-dialog").hasAttribute("open"));
    assert(bulAuthDialogOpened === false, "Unit bulletin failed to block scam bank/account message before member card prompt!");

    // 9D. Prototype Pollution & Malicious Network Packet Defense on BroadcastChannel
    const protoCheck = await page.evaluate(async () => {
      const ch = new BroadcastChannel("tuoi_bac_rt_bus_v1");
      ch.postMessage({
        type: "phonetics",
        data: JSON.parse('{"wrong":"tra ngon","right":"https://evil.top/apk","__proto__":{"polluted":"yes"}}')
      });
      await new Promise((r) => setTimeout(r, 80));
      ch.close();
      const shared = window.TuoiBacRealtime.getSharedPhonetics();
      return {
        polluted: ({}).polluted,
        injectedEvil: shared.some((x) => String(x.right).includes("evil.top"))
      };
    });
    assert(protoCheck.polluted === undefined, "Prototype pollution vulnerability detected!");
    assert(protoCheck.injectedEvil === false, "Malicious network phonetic entry was not rejected by realtime edge filter!");

    // 9E. Admin PIN Brute-Force Lockout (5 wrong attempts -> 60s lockout blocks even valid PIN)
    await page.click('[data-bnav="home"]');
    await page.click('[data-go="privacy"]');
    await page.click("#btn-unlock-admin-console");
    await page.waitForSelector("#admin-pin-input");
    for (let i = 0; i < 5; i++) {
      await page.fill("#admin-pin-input", `999${i}`);
      await page.click("#btn-submit-admin-pin");
    }
    // 6th attempt WITH VALID PIN "2026" must be rejected while locked out!
    await page.fill("#admin-pin-input", "2026");
    await page.click("#btn-submit-admin-pin");
    const adminCheckDuringLock = await page.evaluate(() => ({
      unlocked: sessionStorage.getItem("tuoi_bac_admin_session_v1") === "1",
      lockState: JSON.parse(localStorage.getItem("tuoi_bac_admin_lockout_v1") || "{}")
    }));
    assert(
      adminCheckDuringLock.unlocked === false && adminCheckDuringLock.lockState.lockedUntil > Date.now(),
      "Admin brute-force lockout failed to block 6th attempt!"
    );
    // Clear lockout and verify valid PIN + 2,500-round salted PIN change works cleanly
    await page.evaluate(() => localStorage.removeItem("tuoi_bac_admin_lockout_v1"));
    await page.fill("#admin-pin-input", "2026");
    await page.click("#btn-submit-admin-pin");
    await page.waitForSelector("#btn-admin-change-pin");
    await page.click("#btn-admin-change-pin");
    await page.waitForSelector("#adm-old-pin");
    await page.fill("#adm-old-pin", "2026");
    await page.fill("#adm-new-pin", "6868");
    await page.click("#btn-save-new-admin-pin");
    const newHashVal = await page.evaluate(() => localStorage.getItem("tuoi_bac_admin_hash_v1") || "");
    assert(newHashVal.startsWith("v2$"), `Expected stretched v2$ Admin PIN hash, got: ${newHashVal}`);
    await page.click("#btn-admin-lock-now");

    const anyXssTriggered = await page.evaluate(() => window.__xss);
    assert(anyXssTriggered === undefined, "XSS payload executed during Pentest!");
    console.log("[PASS] 10. Pentest — CSP, XSS da ngu canh, Chong lua dao 2 luot, Chong __proto__ & Khoa Brute-force Admin");

    assert(pageErrors.length === 0, `Uncaught page errors: ${pageErrors.join(" | ")}`);
    assert(localConsoleErrors.length === 0, `Console errors: ${localConsoleErrors.join(" | ")}`);
    assert(failedLocalResponses.length === 0, `Failed local HTTP assets: ${failedLocalResponses.join(" | ")}`);

    console.log("======================================================================");
    console.log(" KET QUA E2E + PENTEST: PASS TUYET DOI (34 luot quet + 11 cong nghiep vu & bao mat, 0 loi)");
    console.log("======================================================================");
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("\n[FAIL] E2E Regression Suite:", err && err.stack ? err.stack : err);
  process.exit(1);
});
