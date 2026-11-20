#!/usr/bin/env node
/**
 * TUOI BAC — PRE-GENERATED VIETNAMESE VOICE LIBRARY BUILDER
 * Reads TTS_BASE_URL, TTS_API_TOKEN, TTS_VOICE from .env.local (never hardcoded).
 * Extracts 100% of static/sample read-aloud texts from data.js, xiangqi.js & screen guides,
 * calls the remote TTS API (default voice: maichi), compresses cleanly via ffmpeg (24kHz mono 40kbps),
 * updates the 15 core clips in assets/audio/*.mp3, writes extended clips to assets/audio/library/*.mp3,
 * and outputs assets/audio/tts-manifest.json for instant O(1) lookup in app.js.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "assets", "audio");
const LIB_DIR = path.join(AUDIO_DIR, "library");
const MANIFEST_PATH = path.join(AUDIO_DIR, "tts-manifest.json");

function loadDotEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  const out = Object.assign({}, process.env);
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, "").trim();
    }
  }
  return out;
}

export function normalizeTtsLookupKey(raw) {
  return String(raw || "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\u201C\u201D\u201E\u201F\u2018\u2019"'`´]/g, "")
    .replace(/[·—–\-:;,.!?()\[\]\/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeTtsHash(raw) {
  const str = normalizeTtsLookupKey(raw);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= code + (i & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

function humanizeForVietnameseTts(raw) {
  return String(raw || "")
    .replace(/\[Sticker:\s*([^\]]+)\]/gi, "$1")
    .replace(/9\s*[×x]\s*10/gi, "9 nhân 10")
    .replace(/50\/50/g, "năm mươi năm mươi")
    .replace(/2\.5D/gi, "hai phẩy năm đê")
    .replace(/3D/gi, "ba đê")
    .replace(/0-Token/gi, "không tốn phí")
    .replace(/\bTP\.\s*HCM\b/gi, "Thành phố Hồ Chí Minh")
    .replace(/\bTP\.\s*Huế\b/gi, "Thành phố Huế")
    .replace(/\bTP\.\s*Đà Nẵng\b/gi, "Thành phố Đà Nẵng")
    .replace(/\bBHYT\b/g, "bảo hiểm y tế")
    .replace(/\bCLB\b/g, "câu lạc bộ")
    .replace(/\bCCB\b/g, "cựu chiến binh")
    .replace(/\bQR\b/g, "quy rờ")
    .replace(/\bXP\b/g, "điểm kinh nghiệm")
    .replace(/\bÂL\b/g, "Âm lịch")
    .replace(/(\d{2})\s*t\b/g, "$1 tuổi")
    .replace(/(\d+)\s*\/\s*(\d+)/g, "$1 trên $2")
    .replace(/[""„‟]/g, " ")
    .replace(/[·—–]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveFfmpegBin() {
  const candidates = [
    "ffmpeg",
    "C:\\Users\\phapc\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe"
  ];
  for (const bin of candidates) {
    const chk = spawnSync(bin, ["-version"], { stdio: "ignore" });
    if (chk.status === 0) return bin;
  }
  return null;
}

function loadAppDataModules() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8"), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "xiangqi.js"), "utf8"), ctx);
  return {
    D: ctx.window.TuoiBacData,
    XQ: ctx.window.TuoiBacXiangqi
  };
}

function buildCompleteStaticCorpus() {
  const { D, XQ } = loadAppDataModules();
  const items = [];
  const seenIds = new Set();

  const addClip = (id, spokenText, matchAliases = [], isCoreAsset = false) => {
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, "-");
    if (!spokenText || seenIds.has(cleanId)) return;
    if (/\bundefined\b|\bnull\b/.test(spokenText)) {
      throw new Error("Invalid undefined/null in clip " + cleanId + ": " + spokenText);
    }
    seenIds.add(cleanId);
    const relPath = isCoreAsset ? `./assets/audio/${cleanId}.mp3` : `./assets/audio/library/${cleanId}.mp3`;
    const diskPath = isCoreAsset ? path.join(AUDIO_DIR, `${cleanId}.mp3`) : path.join(LIB_DIR, `${cleanId}.mp3`);
    const allMatchStrings = [spokenText, ...matchAliases].filter(Boolean);
    items.push({
      id: cleanId,
      isCoreAsset,
      relPath,
      diskPath,
      ttsText: humanizeForVietnameseTts(spokenText),
      rawText: spokenText,
      hashes: Array.from(new Set(allMatchStrings.map(computeTtsHash)))
    });
  };

  // 1. 15 Core Clips in assets/audio/*.mp3 (matching D.VOICE_CLIPS & sw.js CORE_ASSETS)
  addClip(
    "chao-buoi-sang",
    "Chào mừng các bác đến với Quán Trà Tuổi Bạc. Mời bác điểm danh bình an buổi sáng, xé tờ lịch Vạn Niên xem giờ tốt, đọc báo chữ to và vào bàn trà trò chuyện cùng bạn đồng niên.",
    ["Chào buổi sáng bác tại Quán Trà Tuổi Bạc!", "Chào buổi sáng bác!"],
    true
  );
  addClip(
    "diem-danh-xong",
    "Bác đã điểm danh bình an sáng nay và thắp sáng ngọn đèn quê hương trên bản đồ ba mươi tư tỉnh thành Việt Nam. Chúc bác một ngày mới dồi dào sức khỏe và nhiều niềm vui.",
    [],
    true
  );
  addClip(
    "chao-ban-tra",
    "Chào mừng bác bước vào Sảnh Quán Trà Tuổi Bạc. Bác có thể chọn một trong sáu không gian sinh hoạt và bấm vào bàn hợp sở thích để cùng nhấp trà đàm đạo.",
    [],
    true
  );
  addClip(
    "dan-chanh-dien",
    "Sân Chùa Quê thanh tịnh. Mời bác chọn chiếu Bồ Đoàn, thành tâm dâng nén hương trầm, gõ mõ thỉnh chuông, thả đèn hoa đăng trên hồ sen hoặc rút quẻ An Lạc đầu ngày.",
    [],
    true
  );
  addClip(
    "dan-nha-tho-ho",
    "Gian Bái Đường Nhà Thờ Họ trang nghiêm, uống nước nhớ nguồn, đức lưu quang. Mời bác dâng hương tưởng nhớ công đức Tổ tiên và rút quẻ Gia Huấn đầu ngày.",
    [],
    true
  );
  addClip(
    "dan-vuon-thien",
    "Thiền Đường Vườn Thiền Tĩnh Lặng bên hồ sen mát lành. Mời bác hít thở sâu nhẹ nhàng, thỉnh chuông thiền và đón nhận thẻ Thiền Ngữ bình an.",
    [],
    true
  );
  addClip(
    "dan-co-tuong",
    "Bàn Cờ Tướng chuẩn chín nhân mười đủ ba mươi hai quân. Bác cầm quân Đỏ đi tiên, chạm vào quân Đỏ rồi chạm vào chấm xanh trên bàn cờ để đi nước mới, hoặc thử sức giải sáu thế cờ cổ phổ.",
    [],
    true
  );
  addClip(
    "dan-o-an-quan",
    "Bàn Ô Ăn Quan dân gian bàn gỗ sỏi cuội suối tự nhiên. Mời bác chọn một trong năm ô hàng dưới của mình rồi bấm rải sang trái hoặc sang phải để ăn quân.",
    [],
    true
  );
  addClip(
    "nhac-nghi-mat",
    "Bác đã sinh hoạt được hai mươi phút rồi. Mời bác tạm rời mắt khỏi màn hình, nhìn ra xa hai mươi giây, vươn vai nhẹ nhàng và uống một ngụm nước ấm nhé.",
    ["nghỉ mắt một chút"],
    true
  );

  // Peace cards 01..06 (core space 0 + library space 1 & 2)
  (D.TEMPLE_PEACE_CARDS || []).forEach((card, idx) => {
    const coreId = card.clipId || `que-0${idx + 1}`;
    const sp0Title = (card.spaceCodes && card.spaceCodes[0]) || card.code;
    const sp0Raw = `${sp0Title}. ${card.verse}. Lời nhắn gửi: ${card.advice}`;
    addClip(coreId, sp0Raw, [card.code], true);

    for (let spIdx = 1; spIdx <= 2; spIdx++) {
      const spTitle = (card.spaceCodes && card.spaceCodes[spIdx]) || card.code;
      const spRaw = `${spTitle}. ${card.verse}. Lời nhắn gửi: ${card.advice}`;
      addClip(`peace-${idx + 1}-sp-${spIdx}`, spRaw, []);
    }
  });

  // 2. Remaining Screen Guides for all 17 routes & sub-tabs
  addClip(
    "scr-checkin-uncheck",
    "Màn hình Điểm Danh Bình An buổi sáng và Bản đồ địa lý ba mươi tư tỉnh thành Việt Nam. Mời bác chọn trạng thái sức khỏe rồi bấm nút Điểm danh bình an hôm nay để báo tin vui cho con cháu."
  );
  addClip(
    "scr-checkin-rank",
    "Bảng thi đua tuần Quê Hương Sáng Đèn. Điểm tuần của mỗi tỉnh được cộng từ lượt điểm danh buổi sáng, xé tờ lịch mới, thắng cờ và mở bàn trà hiếu khách."
  );
  addClip(
    "scr-almanac-intro",
    "Tờ Lịch Vạn Niên Tuổi Bạc tính theo chuẩn múi giờ Việt Nam. Mời bác xé tờ lịch đón ngày mới, xem sáu khung Giờ Hoàng Đạo, hướng xuất hành Hỷ Thần Tài Thần và lời nhắc dưỡng sinh theo tiết khí."
  );
  addClip(
    "scr-almanac-depart",
    "Mục Xem Giờ Xuất Phát Cát Lành. Bác chọn ngày dự định đi, công việc dự định làm và năm sinh, hệ thống sẽ gợi ý ba khung giờ ban ngày đẹp nhất cùng hướng bước ra cửa."
  );
  addClip(
    "scr-almanac-reminders",
    "Sổ Nhắc Việc Âm Dương Lịch Ba Tầng. Bác có thể đặt lịch nhắc tái khám bảo hiểm y tế, giỗ chạp Âm lịch, ngày Rằm Mùng Một và bấm nút Chuông điện thoại để lưu báo thức chính xác vào máy."
  );
  addClip(
    "scr-games-cadao",
    "Bàn Lật Thẻ Ca Dao Trí Nhớ mười hai thẻ gỗ. Mời bác chạm mở lần lượt hai thẻ để ghép đúng vế đầu với vế kết của câu ca dao tục ngữ Việt Nam."
  );
  addClip(
    "scr-groups",
    "Hội Đồng Ngũ, Câu Lạc Bộ và Kết Bạn Tâm Giao. Nơi hội ngộ đồng đội cùng đơn vị năm xưa, lập ban liên lạc, đấu Cúp Cờ Tướng và xem bạn bè đang ngồi ở bàn trà nào để sang ngồi cùng."
  );
  addClip(
    "scr-leaderboard",
    "Bảng Vàng Chín Mươi Sáu Danh Hiệu Tuổi Bạc, gồm ba mươi hai tầng thâm niên chính thức và tám cây kỹ năng chuyên sâu tôn vinh các thành viên gắn bó cùng cộng đồng."
  );
  addClip(
    "scr-profile",
    "Hồ Sơ Cá Nhân và Tủ Trang Phục Ba Miền. Bác có thể thử mười bốn trang phục truyền thống Bắc Trung Nam, mười một phụ kiện và mười ba vật phẩm bày trên bàn trà."
  );
  addClip(
    "scr-health",
    "Trợ Lý Sức Khỏe Tuổi Bạc. Giúp bác đánh dấu lịch uống thuốc sáng tối, theo dõi tám cốc nước ấm trong ngày, ghi sổ đo huyết áp tại nhà và nghe tư vấn sức khỏe tham khảo."
  );
  addClip(
    "scr-family",
    "Góc Con Cái Đồng Hành. Giúp con cháu ở xa yên tâm biết bố mẹ vẫn thức dậy điểm danh bình an mỗi sáng và cài sẵn số điện thoại người thân khẩn cấp trên máy."
  );
  addClip(
    "scr-privacy",
    "Cài Đặt Quyền Riêng Tư và Bảng Điều Khiển Hoạt Động. Mọi dữ liệu cá nhân được bảo vệ an toàn, không lưu số điện thoại thô và tự động chặn tin nhắn lừa đảo."
  );
  addClip(
    "scr-newspaper-intro",
    "Tờ Báo Sáng Quán Trà chữ lớn dễ đọc. Mời bác chạm nghe đọc từng bản tin thời sự, kinh tế, sức khỏe hoặc bấm đem bài báo ra bàn trà để cùng đàm đạo với bạn hữu."
  );
  addClip(
    "scr-poetry-intro",
    "Chiếu Thơ Lục Bát Tuổi Bạc. Mời bác bấm nghe ngâm thơ bên tiếng đàn tranh, tặng hoa cho tác giả, tự sáng tác thơ mới có gợi ý vần sáu tám và in thiệp lụa gửi Zalo."
  );

  // 6 Room Lobbies
  (D.ROOM_TEMPLATES || []).forEach((room) => {
    addClip(
      `room-lobby-${room.id}`,
      `${room.name}. ${room.description}. Người trực sảnh là ${room.hostName}. Mời bác chọn bàn hợp sở thích nhất để vào ngồi trò chuyện.`
    );
  });

  // 3. Newspaper Articles (MORNING_ARTICLES + RSS_DRAFTS: both short card & full modal versions)
  const allArticles = [...(D.MORNING_ARTICLES || []), ...(D.RSS_DRAFTS || [])];
  allArticles.forEach((art) => {
    const shortStr = `${art.title}. ${art.body}`;
    const topScreenStr = `Tờ Báo Sáng Tuổi Bạc. Bài nổi bật hôm nay: ${art.title}. ${art.body}`;
    addClip(`news-short-${art.id}`, shortStr, [topScreenStr]);

    if (Array.isArray(art.detailPoints) && art.detailPoints.length > 0) {
      const fullStr = `${art.title}. ${art.body} ${art.detailPoints.join(" ")}`;
      addClip(`news-full-${art.id}`, fullStr, []);
    }
  });

  // 4. Quiz Questions (all 25 questions + 25 explanations)
  (D.QUIZ_QUESTIONS || []).forEach((q, idx) => {
    const localNum = (idx % 5) + 1;
    const btnReadStr = `${q.question}. A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}`;
    const topScreenStr = `Câu hỏi số ${localNum}: ${q.question}. Đáp án A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}. D: ${q.options[3]}.`;
    addClip(`quiz-q-${q.id || idx + 1}`, btnReadStr, [topScreenStr]);
    addClip(`quiz-exp-${q.id || idx + 1}`, q.explain, [`Giải thích đáp án: ${q.explain}`]);
  });

  // 5. Proverb Memory Pairs (all 18 pairs)
  (D.PROVERB_PAIRS || []).forEach((pv) => {
    const fullStr = `${pv.head}, ${pv.tail}. Ý nghĩa: ${pv.meaning}`;
    addClip(`proverb-${pv.id}`, fullStr, [`${pv.head}, ${pv.tail}`]);
  });

  // 6. Poems (all sample POEMS)
  (D.POEMS || []).forEach((p) => {
    const btnStr = `${p.title}. Tác giả ${p.reciter}. ${p.lines.join(". ")}`;
    const screenStr = `Chiếu Thơ Tuổi Bạc. Bài thơ ${p.title} của ${p.author}. ${p.lines.join(". ")}.`;
    addClip(`poem-${p.id}`, btnStr, [screenStr]);
  });

  // 7. Watch Together Channels (all 3 channels)
  (D.WATCH_CHANNELS || []).forEach((ch, idx) => {
    const watchStr = `${ch.title}. ${ch.subtitle}`;
    addClip(`watch-ch-${idx + 1}`, watchStr, [`Phòng xem chung. ${watchStr}`]);
  });

  // 8. Health Q&A (all HEALTH_QA answers + default check note)
  (D.HEALTH_QA || []).forEach((qa, idx) => {
    addClip(`health-qa-${idx + 1}`, `${qa.topic}. ${qa.answer}`, [qa.answer]);
  });
  addClip(
    "health-qa-default",
    "Bác nhớ ghi lại các biểu hiện vào sổ và mang theo khi tái khám định kỳ. Nếu thấy khó chịu nhiều, hãy gọi bác sĩ hoặc một một năm."
  );

  // 9. Xiangqi Classical Puzzles (all 6 puzzles)
  if (XQ && Array.isArray(XQ.PUZZLES)) {
    XQ.PUZZLES.forEach((pz, idx) => {
      addClip(
        `xq-puzzle-${idx + 1}`,
        `${pz.name}. ${pz.subtitle}. ${pz.story}`,
        [pz.name, pz.shortTitle]
      );
    });
  }

  // 10. Tea Room Initial Table Logs, Article Discussion Logs, Idle Icebreakers, Stickers & Rituals
  let tblLineCounter = 0;
  (D.ROOM_TEMPLATES || []).forEach((room) => {
    (room.tables || []).forEach((tbl) => {
      (tbl.initialLog || []).forEach((ln) => {
        tblLineCounter += 1;
        const boardListenStr = `${ln.speaker} nói: ${ln.text}`;
        addClip(`tea-init-${tblLineCounter}`, boardListenStr, [ln.text]);
      });
    });
  });

  let artDiscCounter = 0;
  (D.MORNING_ARTICLES || []).forEach((art) => {
    (art.discussionLog || []).forEach((ln) => {
      artDiscCounter += 1;
      const boardListenStr = `${ln.speaker} nói: ${ln.text}`;
      addClip(`tea-artdisc-${artDiscCounter}`, boardListenStr, [ln.text]);
    });
  });

  (D.IDLE_ICEBREAKERS || []).forEach((ice, idx) => {
    const aliases = [ice];
    (D.ROOM_TEMPLATES || []).forEach((r) => {
      aliases.push(`${r.hostName} nói: ${ice}`);
    });
    addClip(`tea-ice-${idx + 1}`, ice, aliases);
  });

  (D.TEA_STICKERS || []).forEach((stk) => {
    addClip(`tea-${stk.id}`, stk.fullText, [stk.shortLabel]);
  });

  addClip("tea-ritual-pour", "Mời cả bàn dùng thêm chén trà sen nóng cho ấm bụng nhé!");
  addClip("tea-ritual-snack", "Tôi mời các bác đĩa hạt dưa và miếng bánh đậu xanh Hải Dương.");
  addClip("tea-ritual-poem", "Góp vui với bàn câu ca dao: Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây.");

  // Quick Replies on Tea Tables & Article Tables
  const seenQr = new Set();
  let qrCounter = 0;
  const pushQr = (qText) => {
    const clean = String(qText || "").trim();
    if (!clean || seenQr.has(clean)) return;
    seenQr.add(clean);
    qrCounter += 1;
    addClip(`tea-qr-${qrCounter}`, clean, []);
  };
  (D.ROOM_TEMPLATES || []).forEach((r) => (r.tables || []).forEach((t) => (t.quickReplies || []).forEach(pushQr)));
  (D.MORNING_ARTICLES || []).forEach((a) => (a.quickReplies || []).forEach(pushQr));

  // 11. Zen Seed Prayers & Presets
  const seedPrayers = [
    { id: "seed1", userName: "Chị Lan · 68t", province: "Hà Nội", text: "Cầu chúc đại gia đình bình an, các con đi làm xa mạnh khỏe thuận hòa." },
    { id: "seed2", userName: "Anh Minh · 71t", province: "Hải Phòng", text: "Tưởng nhớ đồng đội năm xưa, chúc anh em Sư đoàn 25 luôn dẻo dai." }
  ];
  const spacePrefixes = [
    "Nam mô A Di Đà Phật. Hồi hướng lời cầu an của",
    "Thành tâm kính lễ Tiên Tổ. Lời khấn nguyện của",
    "Giữ tâm thanh tịnh. Lời nguyện an lành của"
  ];
  seedPrayers.forEach((sp) => {
    spacePrefixes.forEach((pref, spIdx) => {
      const fullStr = `${pref} ${sp.userName}, quê ${sp.province}: ${sp.text}`;
      addClip(`zen-${sp.id}-sp-${spIdx}`, fullStr, spIdx === 0 ? [sp.text] : []);
    });
  });

  const allZenPresets = [
    ...(D.TEMPLE_PRAYER_PRESETS || []),
    "Con cháu thành tâm dâng nén hương trầm tưởng nhớ công đức Tổ tiên.",
    "Cầu mong đại gia đình thuận hòa, con cháu thảo hiền, học hành tấn tới.",
    "Kính chúc các bậc cao niên trong họ trường thọ, bách niên giai lão.",
    "Giữ gìn gia phong nề nếp, uống nước nhớ nguồn, phúc ấm muôn đời.",
    "Hít vào tâm tĩnh lặng, thở ra miệng mỉm cười, an trú ngay phút giây này.",
    "Chúc bạn đồng niên thân khỏe tâm an, mỗi sớm mai thức dậy đều nhẹ nhõm.",
    "Buông bớt lo toan thường nhật, giữ lòng trong sáng như mặt hồ sen.",
    "Cầu chúc mọi nhà bình yên, xóm giềng ấm áp nghĩa tình sớm tối."
  ];
  allZenPresets.forEach((prText, pIdx) => {
    addClip(`zen-preset-${pIdx + 1}`, prText, []);
  });

  // 12. Almanac: 24 Solar Terms (Tiết khí) + 8 Daily Proverbs
  // Sample 24 evenly spaced dates across a year to extract all 24 SOLAR_TERMS & 8 DAILY_PROVERBS directly from D.Almanac!
  if (D.Almanac) {
    const seenTerms = new Map();
    const seenProverbs = new Map();
    const dt = new Date(2026, 0, 1);
    for (let d = 0; d < 370; d++) {
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const info = D.Almanac.getDayAlmanacDetail(iso, 1961);
      if (info.solarTerm && !seenTerms.has(info.solarTerm.name)) {
        seenTerms.set(info.solarTerm.name, info.solarTerm.tip);
      }
      if (info.dailyProverb && !seenProverbs.has(info.dailyProverb)) {
        seenProverbs.set(info.dailyProverb, info.dailyProverb);
      }
      dt.setDate(dt.getDate() + 1);
    }
    let termIdx = 0;
    for (const [tName, tTip] of seenTerms.entries()) {
      termIdx += 1;
      const slug = String(termIdx).padStart(2, "0");
      addClip(`alm-term-${slug}`, `Tiết ${tName}. ${tTip}`, [tTip, `Tiết ${tName}: ${tTip}`]);
    }
    let provIdx = 0;
    for (const pvText of seenProverbs.values()) {
      provIdx += 1;
      addClip(`alm-proverb-${provIdx}`, pvText, []);
    }
  }

  return items;
}

function splitLongTtsSegments(text, maxChars = 250) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const clauses = clean.split(/(?<=[.!?;,])\s+/);
  const rawParts = [];
  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxChars) {
      rawParts.push(trimmed);
      continue;
    }
    const words = trimmed.split(/\s+/);
    let cur = "";
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (next.length > maxChars && cur) {
        rawParts.push(cur);
        cur = w;
      } else {
        cur = next;
      }
    }
    if (cur) rawParts.push(cur);
  }

  const segments = [];
  let buf = "";
  for (const part of rawParts) {
    const candidate = buf ? `${buf} ${part}` : part;
    if (candidate.length <= maxChars) {
      buf = candidate;
    } else {
      if (buf) segments.push(buf);
      buf = part;
    }
  }
  if (buf) segments.push(buf);
  return segments.length > 0 ? segments : [clean];
}

async function fetchTtsWithRetry(baseUrl, token, voice, text, maxRetries = 4) {
  let lastErr = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 95000);
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/tts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          voice,
          speed: 0.95
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 800) {
        throw new Error(`Audio payload too small (${buf.length} bytes)`);
      }
      return buf;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 900 * attempt));
    }
  }
  throw lastErr;
}

function compressAudioBufferMp3(ffmpegBin, rawBuf, outPath) {
  if (!ffmpegBin) {
    fs.writeFileSync(outPath, rawBuf);
    return;
  }
  const tmpIn = `${outPath}.raw.tmp`;
  const tmpOut = `${outPath}.enc.mp3`;
  fs.writeFileSync(tmpIn, rawBuf);
  const res = spawnSync(
    ffmpegBin,
    ["-y", "-hide_banner", "-loglevel", "error", "-i", tmpIn, "-vn", "-ar", "24000", "-ac", "1", "-b:a", "40k", "-map_metadata", "-1", tmpOut],
    { encoding: "utf8" }
  );
  try {
    fs.unlinkSync(tmpIn);
  } catch {}
  if (res.status === 0 && fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 500) {
    fs.renameSync(tmpOut, outPath);
  } else {
    try {
      if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    } catch {}
    fs.writeFileSync(outPath, rawBuf);
  }
}

async function synthesizeAndCompressItem(baseUrl, apiToken, voice, ffmpegBin, ttsText, outPath) {
  const segments = splitLongTtsSegments(ttsText, 250);
  if (segments.length <= 1 || !ffmpegBin) {
    const textToSend = segments.length === 1 ? segments[0] : ttsText;
    const rawBuf = await fetchTtsWithRetry(baseUrl, apiToken, voice, textToSend, 4);
    compressAudioBufferMp3(ffmpegBin, rawBuf, outPath);
    return segments.length || 1;
  }

  const segPaths = [];
  const listPath = `${outPath}.concat.txt`;
  const tmpOut = `${outPath}.enc.mp3`;
  try {
    for (let k = 0; k < segments.length; k++) {
      const rawBuf = await fetchTtsWithRetry(baseUrl, apiToken, voice, segments[k], 4);
      const segPath = `${outPath}.seg${k}.mp3`;
      fs.writeFileSync(segPath, rawBuf);
      segPaths.push(segPath);
    }
    const listContent = segPaths
      .map((segPath) => `file '${segPath.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
      .join("\n");
    fs.writeFileSync(listPath, listContent, "utf8");

    const res = spawnSync(
      ffmpegBin,
      ["-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listPath, "-vn", "-ar", "24000", "-ac", "1", "-b:a", "40k", "-map_metadata", "-1", tmpOut],
      { encoding: "utf8" }
    );
    if (res.status === 0 && fs.existsSync(tmpOut) && fs.statSync(tmpOut).size > 500) {
      fs.renameSync(tmpOut, outPath);
    } else {
      const stderrMsg = res && res.stderr ? res.stderr.trim() : `exit=${res && res.status}`;
      throw new Error(`ffmpeg concat failed for ${path.basename(outPath)}: ${stderrMsg}`);
    }
    return segments.length;
  } finally {
    for (const segPath of segPaths) {
      try {
        if (fs.existsSync(segPath)) fs.unlinkSync(segPath);
      } catch {}
    }
    try {
      if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
    } catch {}
    try {
      if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    } catch {}
  }
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const corpus = buildCompleteStaticCorpus();

  console.log(`Corpus extracted: ${corpus.length} unique static voice clips (${corpus.filter((x) => x.isCoreAsset).length} core + ${corpus.filter((x) => !x.isCoreAsset).length} library).`);

  if (isDryRun) {
    return;
  }

  const env = loadDotEnvLocal();
  const baseUrl = env.TTS_BASE_URL || "";
  const apiToken = env.TTS_API_TOKEN || "";
  const voice = env.TTS_VOICE || "maichi";

  if (!baseUrl || !apiToken) {
    console.error("Missing TTS_BASE_URL or TTS_API_TOKEN in .env.local");
    process.exit(1);
  }

  fs.mkdirSync(LIB_DIR, { recursive: true });
  const ffmpegBin = resolveFfmpegBin();

  let prevManifest = { voice: "", generatedIds: {} };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      prevManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    } catch {}
  }
  const sameVoiceDone = prevManifest.voice === voice ? prevManifest.generatedIds || {} : {};

  const writeManifestSnapshot = (doneMap) => {
    const byId = {};
    const byHash = {};
    for (const item of corpus) {
      if (fs.existsSync(item.diskPath) && fs.statSync(item.diskPath).size > 500) {
        byId[item.id] = item.relPath;
        for (const h of item.hashes) {
          if (!byHash[h]) byHash[h] = item.relPath;
        }
      }
    }
    const manifestObj = {
      version: "20261120b",
      voice,
      totalClips: Object.keys(byId).length,
      generatedIds: doneMap,
      byId,
      byHash
    };
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestObj, null, 2), "utf8");
  };

  const doneMap = Object.assign({}, sameVoiceDone);
  const todo = corpus.filter((item) => !(doneMap[item.id] && fs.existsSync(item.diskPath) && fs.statSync(item.diskPath).size > 500));
  const concurrency = 1;
  console.log(`Using voice="${voice}", ffmpeg="${ffmpegBin || "raw"}", concurrency=${concurrency}`);
  console.log(`Need to generate: ${todo.length} clips (already cached for voice "${voice}": ${corpus.length - todo.length}).`);

  let cursor = 0;
  let completed = 0;
  let failed = 0;
  const startTs = Date.now();

  async function worker() {
    while (cursor < todo.length) {
      const idx = cursor++;
      const item = todo[idx];
      try {
        const segCount = await synthesizeAndCompressItem(baseUrl, apiToken, voice, ffmpegBin, item.ttsText, item.diskPath);
        doneMap[item.id] = 1;
        completed += 1;
        if (completed % 5 === 0 || completed === todo.length) {
          writeManifestSnapshot(doneMap);
        }
        if (completed % 5 === 0 || completed === todo.length || todo.length <= 45) {
          const elapsedSec = Math.round((Date.now() - startTs) / 1000);
          console.log(`[${completed}/${todo.length}] (${elapsedSec}s) OK -> ${item.id} (${segCount} seg, ${Math.round(fs.statSync(item.diskPath).size / 1024)} KB)`);
        }
      } catch (err) {
        failed += 1;
        console.error(`[FAIL] ${item.id}: ${err && err.message ? err.message : err}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));

  writeManifestSnapshot(doneMap);
  let totalBytes = 0;
  for (const item of corpus) {
    if (fs.existsSync(item.diskPath)) totalBytes += fs.statSync(item.diskPath).size;
  }
  console.log("======================================================================");
  console.log(`COMPLETED: ${completed}/${todo.length} new clips | Failed: ${failed} | Total library size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log("======================================================================");
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
