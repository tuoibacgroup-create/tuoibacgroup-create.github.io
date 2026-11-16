window.TuoiBacXiangqi = (function () {
  const PIECE_LABELS = {
    G: "Tướng",
    A: "Sĩ",
    E: "Tượng",
    R: "Xe",
    C: "Pháo",
    H: "Mã",
    P: "Tốt"
  };

  const PIECE_VALUES = {
    G: 10000,
    R: 900,
    C: 460,
    H: 410,
    E: 210,
    A: 210,
    P: 120
  };

  function createEmptyBoard() {
    const b = [];
    for (let r = 0; r < 10; r++) {
      b.push(new Array(9).fill(null));
    }
    return b;
  }

  function cloneBoard(board) {
    return board.map((row) => row.map((cell) => (cell ? { side: cell.side, type: cell.type } : null)));
  }

  function createInitialBoard() {
    const b = createEmptyBoard();
    const backRow = ["R", "H", "E", "A", "G", "A", "E", "H", "R"];
    for (let c = 0; c < 9; c++) {
      b[0][c] = { side: "black", type: backRow[c] };
      b[9][c] = { side: "red", type: backRow[c] };
    }
    b[2][1] = { side: "black", type: "C" };
    b[2][7] = { side: "black", type: "C" };
    b[7][1] = { side: "red", type: "C" };
    b[7][7] = { side: "red", type: "C" };
    for (let c = 0; c < 9; c += 2) {
      b[3][c] = { side: "black", type: "P" };
      b[6][c] = { side: "red", type: "P" };
    }
    return b;
  }

  function buildBoardFromList(pieces) {
    const b = createEmptyBoard();
    pieces.forEach((p) => {
      b[p.r][p.c] = { side: p.side, type: p.type };
    });
    return b;
  }

  // 3 mathematically verified 9x10 endgame puzzles (Đỏ đi tiên chiếu bí trong 2 nước)
  const PUZZLES = [
    {
      id: "phao-tot-sat-cuc",
      name: "Thế 1: Xe Ép Cung — Pháo Tốt Sát Cục",
      subtitle: "Đỏ đi tiên chiếu hết trong 2 nước · 18 kỳ hữu đang ngồi xem",
      hint1: "Nước 1: Đưa Xe Đỏ cột 3 tiến thẳng lên hàng trên cùng (hàng 10, cột 3) chiếu Tướng.",
      hint2: "Nước 2: Đưa Pháo Đỏ lên hàng 9 (cột 1) mượn Tốt làm ngòi, hoặc bình Tốt Đỏ vào cột 3 chiếu bí!",
      hintMove1: { fr: 3, fc: 2, tr: 0, tc: 2 },
      hintMove2: { fr: 4, fc: 0, tr: 1, tc: 0 },
      pieces: [
        { r: 0, c: 3, side: "black", type: "G" },
        { r: 0, c: 4, side: "black", type: "A" },
        { r: 1, c: 4, side: "black", type: "A" },
        { r: 1, c: 1, side: "red", type: "P" },
        { r: 3, c: 3, side: "red", type: "P" },
        { r: 3, c: 2, side: "red", type: "R" },
        { r: 4, c: 0, side: "red", type: "C" },
        { r: 9, c: 5, side: "red", type: "G" }
      ]
    },
    {
      id: "song-xe-cuu-cung",
      name: "Thế 2: Song Xe Vây Cửu Cung",
      subtitle: "Đỏ đi tiên phối hợp hai Xe chiếu hết trong 2 nước · 24 kỳ hữu đang xem",
      hint1: "Nước 1: Đưa Xe Đỏ phía trên (cột 3) tiến thẳng lên hàng cuối chiếu Tướng.",
      hint2: "Nước 2: Đưa Xe Đỏ thứ hai tiến lên hàng 9 khóa chặt Cửu cung chiếu bí!",
      hintMove1: { fr: 3, fc: 2, tr: 0, tc: 2 },
      hintMove2: { fr: 4, fc: 2, tr: 1, tc: 2 },
      pieces: [
        { r: 0, c: 3, side: "black", type: "G" },
        { r: 0, c: 4, side: "black", type: "A" },
        { r: 1, c: 4, side: "black", type: "A" },
        { r: 3, c: 3, side: "red", type: "P" },
        { r: 3, c: 2, side: "red", type: "R" },
        { r: 4, c: 2, side: "red", type: "R" },
        { r: 9, c: 5, side: "red", type: "G" }
      ]
    },
    {
      id: "ma-ngoa-tao-xe",
      name: "Thế 3: Mã Ngọa Tào Phối Xe",
      subtitle: "Đỏ nhảy Mã Ngọa Tào rồi phóng Xe đâm đáy · 15 kỳ hữu đang xem",
      hint1: "Nước 1: Nhảy Mã Đỏ vào vị trí Ngọa Tào (hàng 9, cột 3) chiếu Tướng, ép Tướng Đen bình sang cột 4.",
      hint2: "Nước 2: Phóng Xe Đỏ cột 1 lên thẳng hàng cuối cùng chiếu sát cục!",
      hintMove1: { fr: 3, fc: 1, tr: 1, tc: 2 },
      hintMove2: { fr: 3, fc: 0, tr: 0, tc: 0 },
      pieces: [
        { r: 0, c: 4, side: "black", type: "G" },
        { r: 0, c: 5, side: "black", type: "A" },
        { r: 1, c: 4, side: "black", type: "A" },
        { r: 2, c: 8, side: "black", type: "E" },
        { r: 3, c: 1, side: "red", type: "H" },
        { r: 2, c: 3, side: "red", type: "P" },
        { r: 3, c: 0, side: "red", type: "R" },
        { r: 9, c: 5, side: "red", type: "G" }
      ]
    }
  ];

  function inBounds(r, c) {
    return r >= 0 && r < 10 && c >= 0 && c < 9;
  }

  function inPalace(side, r, c) {
    if (c < 3 || c > 5) return false;
    return side === "black" ? r >= 0 && r <= 2 : r >= 7 && r <= 9;
  }

  function getPseudoMoves(board, r, c) {
    const p = board[r][c];
    if (!p) return [];
    const moves = [];
    const side = p.side;
    const addIfOk = (nr, nc) => {
      if (!inBounds(nr, nc)) return;
      const dest = board[nr][nc];
      if (!dest || dest.side !== side) {
        moves.push({ fr: r, fc: c, tr: nr, tc: nc });
      }
    };

    if (p.type === "G") {
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inPalace(side, nr, nc)) addIfOk(nr, nc);
      });
    } else if (p.type === "A") {
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1]
      ].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inPalace(side, nr, nc)) addIfOk(nr, nc);
      });
    } else if (p.type === "E") {
      [
        [-2, -2],
        [-2, 2],
        [2, -2],
        [2, 2]
      ].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(nr, nc)) return;
        if (side === "black" && nr > 4) return;
        if (side === "red" && nr < 5) return;
        // Cản mắt Tượng
        if (board[r + dr / 2][c + dc / 2]) return;
        addIfOk(nr, nc);
      });
    } else if (p.type === "H") {
      const steps = [
        { leg: [-1, 0], to: [-2, -1] },
        { leg: [-1, 0], to: [-2, 1] },
        { leg: [1, 0], to: [2, -1] },
        { leg: [1, 0], to: [2, 1] },
        { leg: [0, -1], to: [-1, -2] },
        { leg: [0, -1], to: [1, -2] },
        { leg: [0, 1], to: [-1, 2] },
        { leg: [0, 1], to: [1, 2] }
      ];
      steps.forEach((st) => {
        const lr = r + st.leg[0];
        const lc = c + st.leg[1];
        if (!inBounds(lr, lc) || board[lr][lc]) return; // Cản chân Mã
        addIfOk(r + st.to[0], c + st.to[1]);
      });
    } else if (p.type === "R") {
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ].forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc)) {
          const dest = board[nr][nc];
          if (!dest) {
            moves.push({ fr: r, fc: c, tr: nr, tc: nc });
          } else {
            if (dest.side !== side) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
            break;
          }
          nr += dr;
          nc += dc;
        }
      });
    } else if (p.type === "C") {
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ].forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        let jumped = false;
        while (inBounds(nr, nc)) {
          const dest = board[nr][nc];
          if (!jumped) {
            if (!dest) {
              moves.push({ fr: r, fc: c, tr: nr, tc: nc });
            } else {
              jumped = true;
            }
          } else if (dest) {
            if (dest.side !== side) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
            break;
          }
          nr += dr;
          nc += dc;
        }
      });
    } else if (p.type === "P") {
      const fwd = side === "red" ? -1 : 1;
      addIfOk(r + fwd, c);
      const crossed = side === "red" ? r <= 4 : r >= 5;
      if (crossed) {
        addIfOk(r, c - 1);
        addIfOk(r, c + 1);
      }
    }

    return moves;
  }

  function findGeneral(board, side) {
    for (let r = 0; r < 10; r++) {
      for (let c = 3; c <= 5; c++) {
        const p = board[r][c];
        if (p && p.side === side && p.type === "G") return { r, c };
      }
    }
    return null;
  }

  function generalsFacing(board) {
    const rg = findGeneral(board, "red");
    const bg = findGeneral(board, "black");
    if (!rg || !bg || rg.c !== bg.c) return false;
    for (let r = bg.r + 1; r < rg.r; r++) {
      if (board[r][rg.c]) return false;
    }
    return true;
  }

  function isInCheck(board, side) {
    const gen = findGeneral(board, side);
    if (!gen) return true;
    if (generalsFacing(board)) return true;
    const enemy = side === "red" ? "black" : "red";
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (p && p.side === enemy) {
          const pm = getPseudoMoves(board, r, c);
          if (pm.some((m) => m.tr === gen.r && m.tc === gen.c)) return true;
        }
      }
    }
    return false;
  }

  function applyMoveClone(board, move) {
    const next = cloneBoard(board);
    next[move.tr][move.tc] = next[move.fr][move.fc];
    next[move.fr][move.fc] = null;
    return next;
  }

  function getLegalMovesForSquare(board, r, c) {
    const p = board[r][c];
    if (!p) return [];
    return getPseudoMoves(board, r, c).filter((mv) => {
      const next = applyMoveClone(board, mv);
      return !isInCheck(next, p.side);
    });
  }

  function getAllLegalMoves(board, side) {
    const all = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (p && p.side === side) {
          all.push(...getLegalMovesForSquare(board, r, c));
        }
      }
    }
    return all;
  }

  function evaluateBoard(board, perspectiveSide) {
    let score = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (!p) continue;
        let val = PIECE_VALUES[p.type] || 100;
        if (p.type === "P") {
          const crossed = p.side === "red" ? r <= 4 : r >= 5;
          if (crossed) val += 75;
          if (c >= 2 && c <= 6) val += 15;
        }
        if ((p.type === "H" || p.type === "C" || p.type === "R") && c >= 2 && c <= 6) {
          val += 14;
        }
        score += p.side === perspectiveSide ? val : -val;
      }
    }
    return score;
  }

  function pickAiMove(board, aiSide, isPuzzleDefense) {
    const legal = getAllLegalMoves(board, aiSide);
    if (legal.length === 0) return null;
    if (legal.length === 1) return legal[0];

    const enemy = aiSide === "red" ? "black" : "red";
    let bestScore = -Infinity;
    let bestMove = legal[0];

    legal.forEach((mv) => {
      const afterAi = applyMoveClone(board, mv);
      const enemyReplies = getAllLegalMoves(afterAi, enemy);
      if (enemyReplies.length === 0) {
        bestScore = 999999;
        bestMove = mv;
        return;
      }
      // Look 1 ply ahead for worst-case reply (especially sharp in puzzles!)
      let worstReplyEval = Infinity;
      enemyReplies.forEach((rep) => {
        const afterRep = applyMoveClone(afterAi, rep);
        if (isPuzzleDefense && getAllLegalMoves(afterRep, aiSide).length === 0) {
          worstReplyEval = -500000;
          return;
        }
        const ev = evaluateBoard(afterRep, aiSide);
        if (ev < worstReplyEval) worstReplyEval = ev;
      });
      const jitter = isPuzzleDefense ? 0 : (Math.random() - 0.5) * 18;
      if (worstReplyEval + jitter > bestScore) {
        bestScore = worstReplyEval + jitter;
        bestMove = mv;
      }
    });

    return bestMove;
  }

  function formatMoveLabel(board, mv) {
    const p = board[mv.fr][mv.fc];
    if (!p) return "";
    const name = PIECE_LABELS[p.type] || p.type;
    const captured = board[mv.tr][mv.tc];
    const capTxt = captured ? ` ăn ${PIECE_LABELS[captured.type]}` : "";
    return `${p.side === "red" ? "Đỏ" : "Đen"}: ${name} (${mv.fc + 1},${10 - mv.fr}) → (${mv.tc + 1},${10 - mv.tr})${capTxt}`;
  }

  function renderBoardSvg(opts) {
    const board = opts.board;
    const selected = opts.selected; // {r, c} or null
    const legalTargets = opts.legalTargets || [];
    const lastMove = opts.lastMove; // {fr, fc, tr, tc} or null

    const padX = 26;
    const padY = 26;
    const step = 38;
    const W = padX * 2 + step * 8; // 356
    const H = padY * 2 + step * 9; // 394
    const xOf = (c) => padX + c * step;
    const yOf = (r) => padY + r * step;

    let lines = "";
    // 10 horizontal rank lines
    for (let r = 0; r < 10; r++) {
      lines += `<line x1="${xOf(0)}" y1="${yOf(r)}" x2="${xOf(8)}" y2="${yOf(r)}" stroke="#6E4A2C" stroke-width="${r === 0 || r === 9 || r === 4 || r === 5 ? 2 : 1.35}" />`;
    }
    // 9 vertical file lines (outer files continuous across river; inner files split at river)
    for (let c = 0; c < 9; c++) {
      if (c === 0 || c === 8) {
        lines += `<line x1="${xOf(c)}" y1="${yOf(0)}" x2="${xOf(c)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="2" />`;
      } else {
        lines += `<line x1="${xOf(c)}" y1="${yOf(0)}" x2="${xOf(c)}" y2="${yOf(4)}" stroke="#6E4A2C" stroke-width="1.35" />`;
        lines += `<line x1="${xOf(c)}" y1="${yOf(5)}" x2="${xOf(c)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="1.35" />`;
      }
    }
    // Palace diagonals (top & bottom Cửu cung)
    lines += `<line x1="${xOf(3)}" y1="${yOf(0)}" x2="${xOf(5)}" y2="${yOf(2)}" stroke="#6E4A2C" stroke-width="1.4" />`;
    lines += `<line x1="${xOf(5)}" y1="${yOf(0)}" x2="${xOf(3)}" y2="${yOf(2)}" stroke="#6E4A2C" stroke-width="1.4" />`;
    lines += `<line x1="${xOf(3)}" y1="${yOf(7)}" x2="${xOf(5)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="1.4" />`;
    lines += `<line x1="${xOf(5)}" y1="${yOf(7)}" x2="${xOf(3)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="1.4" />`;

    // Fiducial marks on Pháo and Tốt points
    const markPoints = [
      [2, 1], [2, 7], [7, 1], [7, 7],
      [3, 0], [3, 2], [3, 4], [3, 6], [3, 8],
      [6, 0], [6, 2], [6, 4], [6, 6], [6, 8]
    ];
    markPoints.forEach(([mr, mc]) => {
      const mx = xOf(mc);
      const my = yOf(mr);
      if (mc > 0) {
        lines += `<path d="M${mx - 8},${my - 3} L${mx - 3},${my - 3} L${mx - 3},${my - 8} M${mx - 8},${my + 3} L${mx - 3},${my + 3} L${mx - 3},${my + 8}" fill="none" stroke="#855C3A" stroke-width="1.2" />`;
      }
      if (mc < 8) {
        lines += `<path d="M${mx + 8},${my - 3} L${mx + 3},${my - 3} L${mx + 3},${my - 8} M${mx + 8},${my + 3} L${mx + 3},${my + 3} L${mx + 3},${my + 8}" fill="none" stroke="#855C3A" stroke-width="1.2" />`;
      }
    });

    // River inscription
    const riverY = (yOf(4) + yOf(5)) / 2 + 5;
    const riverText = `
      <text x="${xOf(2)}" y="${riverY}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#6E4A2C" font-family="serif">SỞ HÀ</text>
      <text x="${xOf(6)}" y="${riverY}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#6E4A2C" font-family="serif">HÁN GIỚI</text>
    `;

    // Last move highlight
    let highlights = "";
    if (lastMove) {
      highlights += `<circle cx="${xOf(lastMove.fc)}" cy="${yOf(lastMove.fr)}" r="6" fill="none" stroke="#B83B2A" stroke-dasharray="3 2" stroke-width="2" />`;
      highlights += `<circle cx="${xOf(lastMove.tc)}" cy="${yOf(lastMove.tr)}" r="19" fill="none" stroke="#D98A2B" stroke-width="2.6" />`;
    }
    if (selected) {
      highlights += `<circle cx="${xOf(selected.c)}" cy="${yOf(selected.r)}" r="19.5" fill="rgba(46, 94, 78, 0.18)" stroke="#2E5E4E" stroke-width="3" />`;
    }

    // Pieces & Interactive Tap Squares
    let nodes = "";
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const cx = xOf(c);
        const cy = yOf(r);
        const p = board[r][c];
        const isTarget = legalTargets.some((t) => t.tr === r && t.tc === c);

        if (p) {
          const isRed = p.side === "red";
          const strokeCol = isTarget ? "#2E5E4E" : isRed ? "#B83B2A" : "#231A14";
          const fillCol = isRed ? "#FFF9ED" : "#F7F1E3";
          const txtCol = isRed ? "#B02E1E" : "#1E1712";
          const lbl = PIECE_LABELS[p.type] || p.type;
          const fontSize = lbl.length >= 5 ? "9.6" : lbl.length === 4 ? "10.6" : "12";
          nodes += `
            <g class="xq-square" data-r="${r}" data-c="${c}" style="cursor:pointer;">
              <circle cx="${cx}" cy="${cy + 1.8}" r="16.2" fill="rgba(25, 18, 12, 0.22)" />
              <circle cx="${cx}" cy="${cy}" r="16.2" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isTarget ? 3.2 : 2.4}" />
              <circle cx="${cx}" cy="${cy}" r="13.4" fill="none" stroke="${strokeCol}" stroke-width="0.8" stroke-opacity="0.55" />
              <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="${txtCol}">${lbl}</text>
              ${isTarget ? `<circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="#2E5E4E" stroke-width="2.5" stroke-dasharray="4 2" />` : ""}
              <rect x="${cx - 19}" y="${cy - 19}" width="38" height="38" fill="transparent" />
            </g>
          `;
        } else if (isTarget) {
          nodes += `
            <g class="xq-square xq-target" data-r="${r}" data-c="${c}" style="cursor:pointer;">
              <circle cx="${cx}" cy="${cy}" r="8" fill="#2E5E4E" fill-opacity="0.85" stroke="#FFFDF7" stroke-width="2" />
              <rect x="${cx - 19}" y="${cy - 19}" width="38" height="38" fill="transparent" />
            </g>
          `;
        } else {
          nodes += `
            <g class="xq-square" data-r="${r}" data-c="${c}" style="cursor:pointer;">
              <rect x="${cx - 19}" y="${cy - 19}" width="38" height="38" fill="transparent" />
            </g>
          `;
        }
      }
    }

    return `
      <svg class="xq-board-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bàn Cờ tướng chuẩn 9 cột 10 hàng">
        <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="#EFD9B4" stroke="#6E4A2C" stroke-width="3" />
        ${lines}
        ${riverText}
        ${highlights}
        ${nodes}
      </svg>
    `;
  }

  return {
    PIECE_LABELS,
    PUZZLES,
    createInitialBoard,
    buildBoardFromList,
    cloneBoard,
    applyMoveClone,
    isInCheck,
    getLegalMovesForSquare,
    getAllLegalMoves,
    pickAiMove,
    formatMoveLabel,
    renderBoardSvg
  };
})();
