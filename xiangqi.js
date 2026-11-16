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
    R: 920,
    C: 470,
    H: 420,
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

  // 6 mathematically verified 9x10 Cờ Thế puzzles (Đỏ đi tiên chiếu bí trong 2 nước)
  const PUZZLES = [
    {
      id: "phao-tot-sat-cuc",
      shortTitle: "Thế 1 · Pháo Tốt",
      difficulty: "Khởi động",
      name: "Thế 1: Xe Ép Cung — Pháo Tốt Sát Cục",
      subtitle: "Đỏ đi tiên chiếu hết trong 2 nước · Thế nhập môn dễ hiểu",
      story: "Dùng Xe Đỏ ép Tướng Đen rời hàng đáy, sau đó mượn Tốt làm ngòi cho Pháo khóa chặt Cửu cung.",
      hint1: "Nước 1: Chạm quân Xe Đỏ (cột 3) đi thẳng lên hàng trên cùng (ô có vòng vàng) chiếu Tướng.",
      hint2: "Nước 2: Đưa Pháo Đỏ cột 1 tiến lên hàng 9 mượn Tốt làm ngòi (hoặc bình Tốt sang phải) chiếu bí!",
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
      shortTitle: "Thế 2 · Song Xe",
      difficulty: "Căn bản",
      name: "Thế 2: Song Xe Vây Cửu Cung",
      subtitle: "Đỏ phối hợp hai Xe thay nhau đoạt cung trong 2 nước",
      story: "Đòn sát căn bản bậc nhất trong cờ tàn: hai Xe nối đuôi nhau trên cùng một lộ khiến Tướng đối phương không kịp thở.",
      hint1: "Nước 1: Đưa Xe Đỏ phía trên (cột 3) lao thẳng lên hàng cuối chiếu Tướng.",
      hint2: "Nước 2: Đưa Xe Đỏ thứ hai tiến lên hàng 9 khóa kín Cửu cung chiếu bí!",
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
      shortTitle: "Thế 3 · Ngọa Tào",
      difficulty: "Vừa sức",
      name: "Thế 3: Mã Ngọa Tào Phối Xe",
      subtitle: "Đỏ nhảy Mã Ngọa Tào buộc Tướng lệch cung rồi phóng Xe đâm đáy",
      story: "'Nhất Mã Ngọa Tào, Vạn Quân Kinh Hãi' — quân Mã đứng góc cung vừa chiếu Tướng vừa khóa đường về.",
      hint1: "Nước 1: Nhảy Mã Đỏ vào vị trí Ngọa Tào (hàng 9, cột 3) chiếu Tướng.",
      hint2: "Nước 2: Phóng Xe Đỏ cột 1 thẳng lên hàng cuối cùng chiếu sát cục!",
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
    },
    {
      id: "thiet-mon-thuyen",
      shortTitle: "Thế 4 · Thiết Môn",
      difficulty: "Cổ phổ",
      name: "Thế 4: Thiết Môn Thuyên (Chốt Cài Cửa Sắt)",
      subtitle: "Trích cổ phổ Quất Trung Bí — Pháo trung lộ ghim cứng Sĩ tâm",
      story: "Pháo Đỏ đứng trung lộ mượn Tốt ghim chặt Sĩ Đen không thể nhúc nhích, tạo thời cơ cho Xe Đỏ phá tượng đoạt thành.",
      hint1: "Nước 1: Đưa Xe Đỏ cột 2 đâm thẳng xuống đáy (hàng 10, cột 2) chiếu Tướng, buộc Tượng Đen thoái về cản.",
      hint2: "Nước 2: Dùng Xe Đỏ chém thẳng Tượng Đen chiếu bí (Sĩ Đen ở tâm bị Pháo Đỏ ghim cứng không thể ăn về)!",
      hintMove1: { fr: 4, fc: 1, tr: 0, tc: 1 },
      hintMove2: { fr: 0, fc: 1, tr: 0, tc: 2 },
      pieces: [
        { r: 0, c: 4, side: "black", type: "G" },
        { r: 0, c: 5, side: "black", type: "A" },
        { r: 1, c: 4, side: "black", type: "A" },
        { r: 2, c: 0, side: "black", type: "E" },
        { r: 3, c: 4, side: "red", type: "P" },
        { r: 6, c: 4, side: "red", type: "C" },
        { r: 4, c: 1, side: "red", type: "R" },
        { r: 9, c: 3, side: "red", type: "G" }
      ]
    },
    {
      id: "ma-hau-phao-day",
      shortTitle: "Thế 5 · Pháo Đáy",
      difficulty: "Khá hay",
      name: "Thế 5: Ngọa Tào Mã — Pháo Đáy Tốt Ngòi",
      subtitle: "Phối hợp Mã, Pháo và Tốt lụt công thành trong 2 nước",
      story: "Không cần Xe mạnh, chỉ với Mã khéo nhảy Ngọa Tào phối hợp Pháo — Tốt vẫn dệt nên sát chiêu tuyệt đẹp.",
      hint1: "Nước 1: Nhảy Mã Đỏ lên ô Ngọa Tào (hàng 9, cột 3) chiếu ép Tướng Đen bình sang cột 4.",
      hint2: "Nước 2: Bình Tốt Đỏ sát cung (hoặc tiến Pháo Đỏ xuống đáy mượn Tốt làm ngòi) chiếu bí!",
      hintMove1: { fr: 3, fc: 1, tr: 1, tc: 2 },
      hintMove2: { fr: 4, fc: 0, tr: 0, tc: 0 },
      pieces: [
        { r: 0, c: 4, side: "black", type: "G" },
        { r: 0, c: 5, side: "black", type: "A" },
        { r: 1, c: 4, side: "black", type: "A" },
        { r: 2, c: 8, side: "black", type: "E" },
        { r: 0, c: 1, side: "red", type: "P" },
        { r: 2, c: 3, side: "red", type: "P" },
        { r: 3, c: 1, side: "red", type: "H" },
        { r: 4, c: 0, side: "red", type: "C" },
        { r: 9, c: 5, side: "red", type: "G" }
      ]
    },
    {
      id: "trung-phao-long-ma",
      shortTitle: "Thế 6 · Trùng Pháo",
      difficulty: "Cao thủ",
      name: "Thế 6: Song Pháo Lồng Mã Sát Cục",
      subtitle: "Tuyệt kỹ Trùng Pháo giang hồ — hai Pháo chồng nhau khóa chết Tướng",
      story: "Mã Đỏ đứng khống chế đường ngang của Tướng, hai khẩu Pháo Đỏ lần lượt bình sang lộ 6 tạo thế Trùng Pháo không thể hóa giải.",
      hint1: "Nước 1: Bình một khẩu Pháo Đỏ sang cột 6 (lộ 4 của Đỏ) mượn Sĩ Đen làm ngòi chiếu Tướng.",
      hint2: "Nước 2: Bình tiếp khẩu Pháo Đỏ còn lại sang cột 6 lập thế Trùng Pháo chiếu bí!",
      hintMove1: { fr: 3, fc: 1, tr: 3, tc: 5 },
      hintMove2: { fr: 4, fc: 7, tr: 4, tc: 5 },
      pieces: [
        { r: 0, c: 5, side: "black", type: "G" },
        { r: 0, c: 4, side: "black", type: "A" },
        { r: 1, c: 5, side: "black", type: "A" },
        { r: 2, c: 8, side: "black", type: "E" },
        { r: 2, c: 3, side: "red", type: "H" },
        { r: 3, c: 1, side: "red", type: "C" },
        { r: 4, c: 7, side: "red", type: "C" },
        { r: 9, c: 3, side: "red", type: "G" }
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
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inPalace(side, nr, nc)) addIfOk(nr, nc);
      });
    } else if (p.type === "A") {
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inPalace(side, nr, nc)) addIfOk(nr, nc);
      });
    } else if (p.type === "E") {
      [[-2, -2], [-2, 2], [2, -2], [2, 2]].forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(nr, nc)) return;
        if (side === "black" && nr > 4) return;
        if (side === "red" && nr < 5) return;
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
        if (!inBounds(lr, lc) || board[lr][lc]) return;
        addIfOk(r + st.to[0], c + st.to[1]);
      });
    } else if (p.type === "R") {
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
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
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
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

  function pieceSquareBonus(p, r, c) {
    // Normalize row from own back rank (0 = back rank, 9 = enemy back rank)
    const adv = p.side === "red" ? 9 - r : r;
    const centerDist = Math.abs(4 - c);
    if (p.type === "P") {
      if (adv >= 5) return 85 + (4 - centerDist) * 12 + (adv >= 7 ? 20 : 0);
      return adv * 6;
    }
    if (p.type === "H") {
      if (adv === 0) return -18;
      return adv * 7 + (4 - centerDist) * 8;
    }
    if (p.type === "C") {
      // Pháo đầu (central file c === 4) bonus
      return (c === 4 ? 28 : 0) + (adv >= 4 ? 12 : 0);
    }
    if (p.type === "R") {
      // Open rib files (c=3,5 or c=1,7) and river control (adv 4..8)
      return (adv >= 3 ? 22 : 0) + (c === 3 || c === 5 ? 14 : 0);
    }
    if (p.type === "A" || p.type === "E") {
      return adv === 2 && c === 4 ? 16 : 4;
    }
    return 0;
  }

  function evaluateBoard(board, perspectiveSide) {
    let score = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (!p) continue;
        const val = (PIECE_VALUES[p.type] || 100) + pieceSquareBonus(p, r, c);
        score += p.side === perspectiveSide ? val : -val;
      }
    }
    return score;
  }

  function orderMoves(board, moves) {
    return moves.slice().sort((a, b) => {
      const capA = board[a.tr][a.tc] ? PIECE_VALUES[board[a.tr][a.tc].type] : 0;
      const capB = board[b.tr][b.tc] ? PIECE_VALUES[board[b.tr][b.tc].type] : 0;
      return capB - capA;
    });
  }

  function getAllPseudoMoves(board, side) {
    const all = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (p && p.side === side) {
          all.push(...getPseudoMoves(board, r, c));
        }
      }
    }
    return all;
  }

  function alphaBetaFast(board, depth, alpha, beta, maximizing, rootSide) {
    const rg = findGeneral(board, "red");
    const bg = findGeneral(board, "black");
    if (!rg) return rootSide === "red" ? -95000 - depth * 100 : 95000 + depth * 100;
    if (!bg) return rootSide === "black" ? -95000 - depth * 100 : 95000 + depth * 100;
    if (depth <= 0) {
      return evaluateBoard(board, rootSide);
    }
    const currSide = maximizing ? rootSide : rootSide === "red" ? "black" : "red";
    const moves = orderMoves(board, getAllPseudoMoves(board, currSide));
    if (moves.length === 0) {
      return maximizing ? -90000 : 90000;
    }
    if (maximizing) {
      let best = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        const mv = moves[i];
        const target = board[mv.tr][mv.tc];
        if (target && target.type === "G") return 95000 + depth * 100;
        const next = applyMoveClone(board, mv);
        if (generalsFacing(next)) continue;
        const val = alphaBetaFast(next, depth - 1, alpha, beta, false, rootSide);
        if (val > best) best = val;
        if (best > alpha) alpha = best;
        if (beta <= alpha) break;
      }
      return best === -Infinity ? -90000 : best;
    } else {
      let best = Infinity;
      for (let i = 0; i < moves.length; i++) {
        const mv = moves[i];
        const target = board[mv.tr][mv.tc];
        if (target && target.type === "G") return -95000 - depth * 100;
        const next = applyMoveClone(board, mv);
        if (generalsFacing(next)) continue;
        const val = alphaBetaFast(next, depth - 1, alpha, beta, true, rootSide);
        if (val < best) best = val;
        if (best < beta) beta = best;
        if (beta <= alpha) break;
      }
      return best === Infinity ? 90000 : best;
    }
  }

  function pickAiMove(board, aiSide, levelOrPuzzle) {
    const legal = getAllLegalMoves(board, aiSide);
    if (legal.length === 0) return null;
    if (legal.length === 1) return legal[0];

    const isPuzzle = levelOrPuzzle === true || levelOrPuzzle === "puzzle";
    const isClub = levelOrPuzzle === "club";
    const depth = isPuzzle ? 2 : isClub ? 2 : 1; // Root legal + 2 fast plies (even ply = sees full recapture!)
    const ordered = orderMoves(board, legal);

    let bestScore = -Infinity;
    let bestMove = ordered[0];
    for (let i = 0; i < ordered.length; i++) {
      const mv = ordered[i];
      const after = applyMoveClone(board, mv);
      const enemy = aiSide === "red" ? "black" : "red";
      if (getAllLegalMoves(after, enemy).length === 0) {
        return mv; // Immediate checkmate/stalemate win!
      }
      const val = alphaBetaFast(after, isClub ? 3 : depth, -Infinity, Infinity, false, aiSide);
      const jitter = isPuzzle ? 0 : isClub ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 28;
      if (val + jitter > bestScore) {
        bestScore = val + jitter;
        bestMove = mv;
      }
    }
    return bestMove;
  }

  function suggestBestMove(board, side) {
    return pickAiMove(board, side, "club");
  }

  function getCapturedPieces(board) {
    const startCounts = { R: 2, H: 2, E: 2, A: 2, G: 1, C: 2, P: 5 };
    const remRed = { R: 0, H: 0, E: 0, A: 0, G: 0, C: 0, P: 0 };
    const remBlack = { R: 0, H: 0, E: 0, A: 0, G: 0, C: 0, P: 0 };
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c];
        if (!p) continue;
        if (p.side === "red") remRed[p.type] = (remRed[p.type] || 0) + 1;
        else remBlack[p.type] = (remBlack[p.type] || 0) + 1;
      }
    }
    const capturedByRed = [];
    const capturedByBlack = [];
    ["R", "C", "H", "E", "A", "P"].forEach((t) => {
      const lostBlack = Math.max(0, startCounts[t] - (remBlack[t] || 0));
      for (let k = 0; k < lostBlack; k++) capturedByRed.push(PIECE_LABELS[t]);
      const lostRed = Math.max(0, startCounts[t] - (remRed[t] || 0));
      for (let k = 0; k < lostRed; k++) capturedByBlack.push(PIECE_LABELS[t]);
    });
    return { capturedByRed, capturedByBlack };
  }

  function formatMoveLabel(board, mv) {
    const p = board[mv.fr][mv.fc];
    if (!p) return "";
    const name = PIECE_LABELS[p.type] || p.type;
    const captured = board[mv.tr][mv.tc];
    const capTxt = captured ? ` ăn ${PIECE_LABELS[captured.type]}` : "";
    // Traditional Red column numbering (9..1 from left to right)
    const fromCol = p.side === "red" ? 9 - mv.fc : mv.fc + 1;
    const toCol = p.side === "red" ? 9 - mv.tc : mv.tc + 1;
    let verb = "bình";
    if (mv.tr !== mv.fr) {
      const movingForward = p.side === "red" ? mv.tr < mv.fr : mv.tr > mv.fr;
      verb = movingForward ? "tiến" : "thoái";
    }
    const targetArg = mv.fc === mv.tc ? Math.abs(mv.tr - mv.fr) : toCol;
    return `${p.side === "red" ? "Đỏ" : "Đen"}: ${name} ${fromCol} ${verb} ${targetArg}${capTxt}`;
  }

  function renderBoardSvg(opts) {
    const board = opts.board;
    const selected = opts.selected;
    const legalTargets = opts.legalTargets || [];
    const lastMove = opts.lastMove;
    const hintMove = opts.hintMove || null;

    const padX = 26;
    const padY = 28;
    const step = 38;
    const W = padX * 2 + step * 8; // 356
    const H = padY * 2 + step * 9; // 398
    const xOf = (c) => padX + c * step;
    const yOf = (r) => padY + r * step;

    let lines = "";
    // Column numbers top (1..9 Black) & bottom (9..1 Red)
    for (let c = 0; c < 9; c++) {
      lines += `<text x="${xOf(c)}" y="12" text-anchor="middle" font-size="9.5" font-weight="700" fill="#7A5638">${c + 1}</text>`;
      lines += `<text x="${xOf(c)}" y="${H - 5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#9E2E1F">${9 - c}</text>`;
    }

    for (let r = 0; r < 10; r++) {
      lines += `<line x1="${xOf(0)}" y1="${yOf(r)}" x2="${xOf(8)}" y2="${yOf(r)}" stroke="#6E4A2C" stroke-width="${r === 0 || r === 9 || r === 4 || r === 5 ? 2 : 1.35}" />`;
    }
    for (let c = 0; c < 9; c++) {
      if (c === 0 || c === 8) {
        lines += `<line x1="${xOf(c)}" y1="${yOf(0)}" x2="${xOf(c)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="2" />`;
      } else {
        lines += `<line x1="${xOf(c)}" y1="${yOf(0)}" x2="${xOf(c)}" y2="${yOf(4)}" stroke="#6E4A2C" stroke-width="1.35" />`;
        lines += `<line x1="${xOf(c)}" y1="${yOf(5)}" x2="${xOf(c)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="1.35" />`;
      }
    }
    // Cửu cung diagonals
    lines += `<line x1="${xOf(3)}" y1="${yOf(0)}" x2="${xOf(5)}" y2="${yOf(2)}" stroke="#6E4A2C" stroke-width="1.4" />`;
    lines += `<line x1="${xOf(5)}" y1="${yOf(0)}" x2="${xOf(3)}" y2="${yOf(2)}" stroke="#6E4A2C" stroke-width="1.4" />`;
    lines += `<line x1="${xOf(3)}" y1="${yOf(7)}" x2="${xOf(5)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="1.4" />`;
    lines += `<line x1="${xOf(5)}" y1="${yOf(7)}" x2="${xOf(3)}" y2="${yOf(9)}" stroke="#6E4A2C" stroke-width="1.4" />`;

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

    const riverY = (yOf(4) + yOf(5)) / 2 + 5;
    const riverText = `
      <text x="${xOf(2)}" y="${riverY}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#6E4A2C" font-family="serif">SỞ HÀ</text>
      <text x="${xOf(6)}" y="${riverY}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#6E4A2C" font-family="serif">HÁN GIỚI</text>
    `;

    let highlights = "";
    if (lastMove) {
      highlights += `<circle cx="${xOf(lastMove.fc)}" cy="${yOf(lastMove.fr)}" r="6" fill="none" stroke="#B83B2A" stroke-dasharray="3 2" stroke-width="2" />`;
      highlights += `<circle cx="${xOf(lastMove.tc)}" cy="${yOf(lastMove.tr)}" r="18.8" fill="none" stroke="#D98A2B" stroke-width="2.8" />`;
    }
    if (hintMove) {
      highlights += `<line x1="${xOf(hintMove.fc)}" y1="${yOf(hintMove.fr)}" x2="${xOf(hintMove.tc)}" y2="${yOf(hintMove.tr)}" stroke="#D98A2B" stroke-width="3.2" stroke-dasharray="5 3" />`;
      highlights += `<circle cx="${xOf(hintMove.tc)}" cy="${yOf(hintMove.tr)}" r="14" fill="rgba(217, 138, 43, 0.25)" stroke="#B83B2A" stroke-width="2.5" />`;
    }
    if (selected) {
      highlights += `<circle cx="${xOf(selected.c)}" cy="${yOf(selected.r)}" r="19.5" fill="rgba(46, 94, 78, 0.2)" stroke="#2E5E4E" stroke-width="3" />`;
    }

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
              <circle cx="${cx}" cy="${cy}" r="8.5" fill="#2E5E4E" fill-opacity="0.88" stroke="#FFFDF7" stroke-width="2" />
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
    suggestBestMove,
    getCapturedPieces,
    formatMoveLabel,
    renderBoardSvg
  };
})();
