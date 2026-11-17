#!/usr/bin/env node
/**
 * TUOI BAC GAME STUDIO — AUTOMATED QUALITY & DEEP CODE <-> DOCS SYNC DOCTOR
 * Chạy kiểm định 9 cổng kỹ thuật & đồng bộ tài liệu bắt buộc trong < 1 giây (0 phụ thuộc ngoài):
 *   node scripts/studio-doctor.mjs
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const EXPECTED_SCRIPT_ORDER = [
  "data.js",
  "progression.js",
  "telemetry.js",
  "tearoom3d.js",
  "temple3d.js",
  "xiangqi.js",
  "realtime.js",
  "app.js"
];

const REQUIRED_DOCS = [
  "AGENTS.md",
  "CLAUDE.md",
  "ARCHITECTURE.md",
  "README.md",
  "docs/01_NGUYEN_TAC_KY_THUAT_STUDIO.md",
  "docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md",
  "docs/03_TIEN_DO_VA_NHAT_KY.md",
  "docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md",
  "docs/05_QUYET_DINH_KIEN_TRUC_ADR.md"
];

const gates = [];

function recordGate(name, ok, detail) {
  gates.push({ name, ok, detail });
}

function extractTopLevelKeysFromDefaultState(appCode) {
  const fnIdx = appCode.indexOf("function createDefaultState()");
  if (fnIdx < 0) return [];
  const retIdx = appCode.indexOf("return {", fnIdx);
  if (retIdx < 0) return [];

  const openBraceIdx = appCode.indexOf("{", retIdx);
  let depth = 0;
  let keys = [];
  let i = openBraceIdx;

  while (i < appCode.length) {
    const ch = appCode[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i += 1;
      while (i < appCode.length && appCode[i] !== quote) {
        if (appCode[i] === "\\") i += 1;
        i += 1;
      }
      i += 1;
      continue;
    }
    if (ch === "/" && appCode[i + 1] === "/") {
      while (i < appCode.length && appCode[i] !== "\n") i += 1;
      continue;
    }
    if (ch === "{" || ch === "[") {
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}" || ch === "]") {
      depth -= 1;
      if (depth === 0) break;
      i += 1;
      continue;
    }
    if (depth === 1) {
      const slice = appCode.slice(i, i + 60);
      const m = slice.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
      if (m) {
        if (!keys.includes(m[1])) keys.push(m[1]);
        i += m[0].length;
        continue;
      }
    }
    i += 1;
  }
  return keys;
}

function extractRoutesFromRenderSwitch(appCode) {
  const fnIdx = appCode.indexOf("function render()");
  if (fnIdx < 0) return [];
  const endIdx = appCode.indexOf("\n  function ", fnIdx + 20);
  const block = appCode.slice(fnIdx, endIdx > 0 ? endIdx : fnIdx + 1800);
  const routes = new Set(["home"]);
  for (const m of block.matchAll(/case\s+"([a-zA-Z0-9_-]+)"\s*:/g)) {
    routes.add(m[1]);
  }
  return [...routes];
}

// ============================================================================
// GATE 1: Kiểm tra cú pháp JavaScript (AST Parse qua node:vm) cho mọi tệp .js
// ============================================================================
{
  const rootJsFiles = fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith(".js") && fs.statSync(path.join(ROOT, f)).isFile());
  const syntaxErrors = [];

  for (const file of rootJsFiles) {
    const full = path.join(ROOT, file);
    const code = fs.readFileSync(full, "utf8");
    try {
      new vm.Script(code, { filename: file });
    } catch (err) {
      syntaxErrors.push(`${file}: ${err.message.split("\n")[0]}`);
    }
  }

  recordGate(
    "1. Cú pháp JavaScript (Syntax Check)",
    syntaxErrors.length === 0 && rootJsFiles.length >= 9,
    syntaxErrors.length === 0
      ? `Hợp lệ toàn bộ ${rootJsFiles.length} tệp JS gốc (${rootJsFiles.join(", ")})`
      : syntaxErrors.join(" | ")
  );
}

// ============================================================================
// GATE 2: Thứ tự nạp Script bất biến & Đồng bộ mã ?v= chống kẹt Cache
// ============================================================================
{
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const localAssetMatches = [
    ...html.matchAll(/(?:href|src)="([a-zA-Z0-9_./-]+\.(?:css|js))(?:\?v=([^"]+))?"/g)
  ].filter((m) => !m[1].startsWith("http"));

  const versions = new Set();
  const jsOrderInHtml = [];
  const missingFiles = [];

  for (const m of localAssetMatches) {
    const relPath = m[1];
    const ver = m[2] || "MISSING_VERSION";
    versions.add(ver);
    if (!fs.existsSync(path.join(ROOT, relPath))) {
      missingFiles.push(relPath);
    }
    if (relPath.endsWith(".js")) {
      jsOrderInHtml.push(relPath);
    }
  }

  const orderMatches =
    JSON.stringify(jsOrderInHtml) === JSON.stringify(EXPECTED_SCRIPT_ORDER);
  const singleVersion = versions.size === 1 && !versions.has("MISSING_VERSION");

  const issues = [];
  if (missingFiles.length > 0) issues.push(`Thiếu tệp: ${missingFiles.join(", ")}`);
  if (!orderMatches) {
    issues.push(
      `Sai thứ tự nạp script trong index.html: hiện tại [${jsOrderInHtml.join(" -> ")}], yêu cầu [${EXPECTED_SCRIPT_ORDER.join(" -> ")}]`
    );
  }
  if (!singleVersion) {
    issues.push(`Lệch tham số ?v= giữa các tệp trong index.html: [${[...versions].join(", ")}]`);
  }

  recordGate(
    "2. Thứ tự nạp Script & Cache-Buster (?v=)",
    issues.length === 0,
    issues.length === 0
      ? `Đúng thứ tự ${jsOrderInHtml.length} module, đồng bộ ?v=${[...versions][0]}`
      : issues.join(" | ")
  );
}

// ============================================================================
// GATE 3: Đồng bộ danh mục tài nguyên ngoại tuyến PWA trong sw.js
// ============================================================================
{
  const swCode = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  const missingInSw = EXPECTED_SCRIPT_ORDER.filter(
    (jsFile) => !swCode.includes(`./${jsFile}`)
  );
  const cacheMatch = swCode.match(/CACHE_VERSION\s*=\s*"([^"]+)"/);

  recordGate(
    "3. Đồng bộ Service Worker PWA (sw.js)",
    missingInSw.length === 0 && Boolean(cacheMatch),
    missingInSw.length === 0 && cacheMatch
      ? `CACHE_VERSION="${cacheMatch[1]}", đủ toàn bộ ${EXPECTED_SCRIPT_ORDER.length} module trong CORE_ASSETS`
      : `Thiếu trong sw.js CORE_ASSETS: ${missingInSw.join(", ")}`
  );
}

// ============================================================================
// GATE 4: Kỷ luật giải phóng bộ nhớ 3D WebGL (TeaRoomScene & TempleScene3D)
// ============================================================================
{
  const appCode = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const teaCode = fs.readFileSync(path.join(ROOT, "tearoom3d.js"), "utf8");
  const templeCode = fs.readFileSync(path.join(ROOT, "temple3d.js"), "utf8");

  const hasTeaDispose =
    teaCode.includes("renderer.dispose()") && appCode.includes("TeaRoomScene.dispose()");
  const hasTempleDispose =
    templeCode.includes("renderer.dispose()") && appCode.includes("TempleScene3D.dispose()");
  const hasStateMerge =
    appCode.includes("function createDefaultState()") &&
    appCode.includes("function loadState()") &&
    appCode.includes("_vault_bak");

  const issues = [];
  if (!hasTeaDispose) issues.push("Thiếu cơ chế dispose() cho TeaRoomScene");
  if (!hasTempleDispose) issues.push("Thiếu cơ chế dispose() cho TempleScene3D");
  if (!hasStateMerge) issues.push("Thiếu cơ chế gộp trạng thái mặc định hoặc sao lưu _vault_bak");

  recordGate(
    "4. Kỷ luật Bộ nhớ WebGL 3D & Sao lưu kép State",
    issues.length === 0,
    issues.length === 0
      ? "TeaRoomScene.dispose(), TempleScene3D.dispose() và _vault_bak đầy đủ"
      : issues.join(" | ")
  );
}

// ============================================================================
// GATE 5: Kiểm chứng bất biến Toán học Lồi của 96 Danh hiệu (progression.js)
// ============================================================================
{
  const progCode = fs.readFileSync(path.join(ROOT, "progression.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(progCode, sandbox);
  const P = sandbox.window.TuoiBacProgression;

  let ok = Boolean(P && Array.isArray(P.MAIN_TIERS) && Array.isArray(P.SKILL_TREES));
  const errs = [];

  if (!ok) {
    errs.push("Không khởi tạo được window.TuoiBacProgression");
  } else {
    if (P.MAIN_TIERS.length !== 33) {
      errs.push(`MAIN_TIERS phải có 33 mốc (0..32), hiện có ${P.MAIN_TIERS.length}`);
    }
    const skillTotal = P.SKILL_TREES.reduce((s, t) => s + t.tiers.length, 0);
    if (skillTotal !== 64) {
      errs.push(`8 cây chuyên môn phải có 64 bậc, hiện có ${skillTotal}`);
    }
    for (let L = 2; L <= 31; L++) {
      const d1 = P.MAIN_TIERS[L].minXp - P.MAIN_TIERS[L - 1].minXp;
      const d2 = P.MAIN_TIERS[L + 1].minXp - P.MAIN_TIERS[L].minXp;
      if (!(d2 > d1)) {
        errs.push(`Vi phạm tính lồi tại Tầng ${L + 1}: delta=${d2} <= ${d1}`);
        break;
      }
    }
    for (const tree of P.SKILL_TREES) {
      for (let i = 1; i < tree.tiers.length - 1; i++) {
        const d1 = tree.tiers[i].reqPoints - tree.tiers[i - 1].reqPoints;
        const d2 = tree.tiers[i + 1].reqPoints - tree.tiers[i].reqPoints;
        if (!(d2 > d1)) {
          errs.push(`Vi phạm tính lồi tại cây ${tree.id} bậc ${i + 2}`);
          break;
        }
      }
    }
  }

  recordGate(
    "5. Bất biến Toán học Lồi 96 Danh hiệu",
    errs.length === 0,
    errs.length === 0
      ? "32 tầng chính + 64 bậc chuyên môn tăng độ khó lồi nghiêm ngặt"
      : errs.join(" | ")
  );
}

// ============================================================================
// GATE 6: Tiêu chuẩn Công thái học CSS cho Người cao tuổi (styles.css)
// ============================================================================
{
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  const has20pxRoot =
    /--base-size:\s*20px/.test(css) && /html\s*\{[^}]*font-size:\s*var\(--base-size\)/s.test(css);
  const has24pxXl =
    /html\.xl-font[\s\S]*?--base-size:\s*24px/.test(css) ||
    /html:has\(body\.xl-font\)[\s\S]*?--base-size:\s*24px/.test(css);
  const hasTabularNums = css.includes("tabular-nums");
  const thickSideBorders = [...css.matchAll(/border-(?:left|right)\s*:\s*([2-9]|\d{2,})px/g)];

  const issues = [];
  if (!has20pxRoot) issues.push("Cỡ chữ gốc html trong styles.css dưới 20px");
  if (!has24pxXl) issues.push("Thiếu cấu hình cỡ chữ lớn 24px trên html.xl-font");
  if (!hasTabularNums) issues.push("Thiếu font-variant-numeric: tabular-nums");
  if (thickSideBorders.length > 0) {
    issues.push(`Phát hiện ${thickSideBorders.length} chỗ dùng border-left/right > 1px`);
  }

  recordGate(
    "6. Chuẩn CSS Người cao tuổi & Craft Floor",
    issues.length === 0,
    issues.length === 0
      ? "Gốc chữ 20px/24px, có tabular-nums, 0 viền sườn dày > 1px"
      : issues.join(" | ")
  );
}

// ============================================================================
// GATE 7: Đồng bộ Cấu trúc Kỹ thuật 1:1 giữa Code thực tế & Tài liệu .md
// ============================================================================
{
  const issues = [];
  const missingDocs = REQUIRED_DOCS.filter((rel) => {
    const p = path.join(ROOT, rel);
    return !fs.existsSync(p) || fs.statSync(p).size < 200;
  });
  if (missingDocs.length > 0) {
    issues.push(`Thiếu tài liệu bắt buộc: ${missingDocs.join(", ")}`);
  } else {
    const archDoc = fs.readFileSync(path.join(ROOT, "ARCHITECTURE.md"), "utf8");
    const apiDoc = fs.readFileSync(path.join(ROOT, "docs/02_SO_DO_DU_LIEU_VA_API_NOI_BO.md"), "utf8");
    const bugDoc = fs.readFileSync(path.join(ROOT, "docs/04_CAM_NANG_FIX_BUG_VA_KIEM_THU.md"), "utf8");
    const appCode = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
    const swCode = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
    const sqlCode = fs.readFileSync(path.join(ROOT, "supabase_schema.sql"), "utf8");

    // 7A. Tệp .js và Namespace window.*
    const rootJsFiles = fs
      .readdirSync(ROOT)
      .filter((f) => f.endsWith(".js") && fs.statSync(path.join(ROOT, f)).isFile());
    const undocJs = rootJsFiles.filter((f) => !archDoc.includes(f));
    if (undocJs.length > 0) issues.push(`Tệp JS chưa ghi vào ARCHITECTURE.md: ${undocJs.join(", ")}`);

    const globalNamespaces = [];
    for (const f of rootJsFiles) {
      const txt = fs.readFileSync(path.join(ROOT, f), "utf8");
      for (const m of txt.matchAll(/^window\.([A-Za-z0-9_]+)\s*=/gm)) {
        if (!globalNamespaces.includes(m[1])) globalNamespaces.push(m[1]);
      }
    }
    const undocNsArch = globalNamespaces.filter((ns) => !archDoc.includes(`window.${ns}`));
    const undocNsApi = globalNamespaces.filter((ns) => !apiDoc.includes(`window.${ns}`));
    if (undocNsArch.length > 0) issues.push(`Namespace thiếu trong ARCHITECTURE.md: ${undocNsArch.join(", ")}`);
    if (undocNsApi.length > 0) issues.push(`Namespace thiếu trong docs/02: ${undocNsApi.join(", ")}`);

    // 7B. Phiên bản CACHE_VERSION trong sw.js khớp ARCHITECTURE.md
    const swVerMatch = swCode.match(/CACHE_VERSION\s*=\s*"([^"]+)"/);
    if (swVerMatch && !archDoc.includes(swVerMatch[1])) {
      issues.push(`CACHE_VERSION "${swVerMatch[1]}" trong sw.js chưa được đồng bộ vào ARCHITECTURE.md`);
    }

    // 7C. Toàn bộ Route màn hình trong render() khớp ARCHITECTURE.md
    const liveRoutes = extractRoutesFromRenderSwitch(appCode);
    const undocRoutes = liveRoutes.filter((r) => !archDoc.includes(`"${r}"`));
    if (undocRoutes.length > 0) {
      issues.push(`Route mới trong app.js chưa khai báo vào ARCHITECTURE.md: ${undocRoutes.join(", ")}`);
    }

    // 7D. Toàn bộ khóa gốc của createDefaultState() khớp docs/02
    const liveStateKeys = extractTopLevelKeysFromDefaultState(appCode);
    const undocStateKeys = liveStateKeys.filter((k) => !new RegExp(`\\b${k}\\s*:`).test(apiDoc));
    if (undocStateKeys.length > 0) {
      issues.push(`Khóa state mới trong createDefaultState() chưa đồng bộ vào docs/02: ${undocStateKeys.join(", ")}`);
    }

    // 7E. Toàn bộ bảng SQL trong supabase_schema.sql khớp docs/02
    const sqlTables = [...sqlCode.matchAll(/create\s+table\s+if\s+not\s+exists\s+public\.([a-z0-9_]+)/gi)].map(
      (m) => m[1]
    );
    const undocTables = sqlTables.filter((t) => !apiDoc.includes(t));
    if (undocTables.length > 0) {
      issues.push(`Bảng SQL mới trong supabase_schema.sql chưa đồng bộ vào docs/02: ${undocTables.join(", ")}`);
    }

    // 7F. Toàn bộ tham số URL Deep Link params.get("...") khớp docs/04
    const urlParams = new Set();
    for (const m of appCode.matchAll(/params\.get\("([a-zA-Z0-9_-]+)"\)/g)) {
      urlParams.add(m[1]);
    }
    const undocParams = [...urlParams].filter(
      (p) => !bugDoc.includes(`?${p}=`) && !bugDoc.includes(`&${p}=`)
    );
    if (undocParams.length > 0) {
      issues.push(`Tham số URL mới trong app.js chưa đồng bộ vào docs/04: ${undocParams.join(", ")}`);
    }

    recordGate(
      "7. Đồng bộ 1:1 Code <-> Tài liệu .md (Deep Contract Sync)",
      issues.length === 0,
      issues.length === 0
        ? `Khớp 100%: ${rootJsFiles.length} JS, ${globalNamespaces.length} namespace, ${liveRoutes.length} route, ${liveStateKeys.length} khóa state, ${sqlTables.length} bảng SQL, ${urlParams.size} tham số URL`
        : issues.join(" | ")
    );
  }
  if (missingDocs.length > 0) {
    recordGate("7. Đồng bộ 1:1 Code <-> Tài liệu .md (Deep Contract Sync)", false, issues.join(" | "));
  }
}

// ============================================================================
// GATE 8: Rà soát Rò rỉ Khóa Bí mật Cứng (Secret / Service-Role Key Scan)
// ============================================================================
{
  const secretPatterns = [
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}/,
    /sk-[A-Za-z0-9]{32,}/,
    /ghp_[A-Za-z0-9]{30,}/
  ];
  const rootFiles = fs
    .readdirSync(ROOT)
    .filter((f) => /\.(js|html|sql|md)$/i.test(f) && fs.statSync(path.join(ROOT, f)).isFile());

  const leaks = [];
  for (const f of rootFiles) {
    const txt = fs.readFileSync(path.join(ROOT, f), "utf8");
    for (const rx of secretPatterns) {
      if (rx.test(txt)) {
        leaks.push(f);
        break;
      }
    }
  }

  recordGate(
    "8. Quét An toàn Bảo mật (Zero Hardcoded Secrets)",
    leaks.length === 0,
    leaks.length === 0
      ? "Không phát hiện khóa bí mật cứng (JWT / API Key / PAT) trong mã nguồn"
      : `Cảnh báo khóa cứng trong: ${leaks.join(", ")}`
  );
}

// ============================================================================
// GATE 9: Đồng bộ Tiến độ & Nhật ký Phiên bản với Thay đổi Code trên Git
// ============================================================================
{
  const issues = [];
  let statusSummary = "";
  try {
    const porcelain = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const changedPaths = porcelain.map((line) => line.slice(2).trim().replace(/^"|"$/g, ""));
    const dirtyRuntimeCode = changedPaths.filter(
      (p) =>
        !p.startsWith("scripts/") &&
        (/\.(js|css|html|sql|webmanifest)$/i.test(p))
    );
    const progressDocTouched = changedPaths.some((p) =>
      p.replace(/\\/g, "/").endsWith("docs/03_TIEN_DO_VA_NHAT_KY.md")
    );

    if (dirtyRuntimeCode.length > 0 && !progressDocTouched) {
      issues.push(
        `Đã sửa code thực tế [${dirtyRuntimeCode.join(", ")}] nhưng CHƯA cập nhật đồng bộ tiến độ vào docs/03_TIEN_DO_VA_NHAT_KY.md`
      );
    } else if (dirtyRuntimeCode.length > 0 && progressDocTouched) {
      statusSummary = `Đang có thay đổi code [${dirtyRuntimeCode.join(", ")}] và đã cập nhật song hành docs/03_TIEN_DO_VA_NHAT_KY.md`;
    } else {
      // Cây làm việc sạch -> đối chiếu thứ tự commit giữa Code và Sổ Tiến Độ
      const codeHead = execSync(
        'git log -1 --format=%H -- "*.js" "*.css" "*.html" "*.sql"',
        { cwd: ROOT, encoding: "utf8" }
      ).trim();
      const progressHead = execSync(
        'git log -1 --format=%H -- "docs/03_TIEN_DO_VA_NHAT_KY.md"',
        { cwd: ROOT, encoding: "utf8" }
      ).trim();

      if (codeHead && progressHead && codeHead !== progressHead) {
        let progressOlderThanCode = false;
        try {
          execSync(`git merge-base --is-ancestor ${progressHead} ${codeHead}`, {
            cwd: ROOT,
            stdio: "ignore"
          });
          progressOlderThanCode = true;
        } catch (e) {
          progressOlderThanCode = false;
        }
        if (progressOlderThanCode) {
          issues.push(
            `Commit code mới nhất (${codeHead.slice(0, 7)}) mới hơn lần cập nhật cuối của docs/03_TIEN_DO_VA_NHAT_KY.md (${progressHead.slice(0, 7)})`
          );
        }
      }
      if (issues.length === 0) {
        statusSummary = `Lịch sử Git đồng bộ: docs/03_TIEN_DO_VA_NHAT_KY.md (${progressHead.slice(0, 7)}) luôn cập nhật kịp hoặc mới hơn code (${codeHead.slice(0, 7)})`;
      }
    }
  } catch (gitErr) {
    statusSummary = "Không đọc được trạng thái Git (bỏ qua kiểm tra lịch sử commit)";
  }

  recordGate(
    "9. Đồng bộ Tiến độ & Nhật ký Git (Progress Sync Gate)",
    issues.length === 0,
    issues.length === 0 ? statusSummary : issues.join(" | ")
  );
}

// ============================================================================
// TỔNG KẾT KẾT QUẢ
// ============================================================================
console.log("======================================================================");
console.log(" TUOI BAC STUDIO DOCTOR — BAO CAO KIEM DINH & DONG BO CODE <-> DOCS");
console.log("======================================================================");
let failedCount = 0;
for (const g of gates) {
  const badge = g.ok ? "[PASS]" : "[FAIL]";
  if (!g.ok) failedCount += 1;
  console.log(`${badge} ${g.name}`);
  console.log(`       -> ${g.detail}`);
}
console.log("======================================================================");

if (failedCount > 0) {
  console.error(`KET QUA: KHONG DAT (${failedCount}/${gates.length} cong kiem dinh bi loi).`);
  process.exit(1);
} else {
  console.log(`KET QUA: DAT CHUAN DONG BO STUDIO 100% (${gates.length}/${gates.length} cong PASS).`);
  process.exit(0);
}
