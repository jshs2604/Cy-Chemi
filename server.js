const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const port = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json({ limit: "64kb" }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

function emptyStore() {
  return {
    nicknames: {},
    boards: {},
    guestbooks: {},
    ilchons: {},
    ilchonRequests: [],
    gifts: [],
  };
}

function readStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const data = JSON.parse(raw);
      return {
        nicknames: data.nicknames || {},
        boards: data.boards || {},
        guestbooks: data.guestbooks || {},
        ilchons: data.ilchons || {},
        ilchonRequests: Array.isArray(data.ilchonRequests) ? data.ilchonRequests : [],
        gifts: Array.isArray(data.gifts) ? data.gifts : [],
      };
    }
  } catch (e) {}
  return emptyStore();
}

function writeStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function newToken() {
  return crypto.randomBytes(16).toString("hex");
}

function normalizeNick(name) {
  return String(name || "").trim().slice(0, 12);
}

function validSymbol(sym) {
  return /^[A-Za-z]{1,3}$/.test(sym);
}

function validScope(scope) {
  return scope === "plaza" || validSymbol(scope);
}

function nowKo() {
  return new Date().toLocaleString("ko-KR");
}

function verifyNickToken(store, name, token) {
  const entry = store.nicknames[name];
  return !!(entry && token && entry.token === token);
}

function getIlchonListFor(store, name) {
  return store.ilchons[name] || [];
}

function hasIlchonLink(store, a, b) {
  return getIlchonListFor(store, a).some((item) => item.peer === b);
}

function addIlchonLink(store, a, b) {
  const t = nowKo();
  if (!store.ilchons[a]) store.ilchons[a] = [];
  if (!store.ilchons[b]) store.ilchons[b] = [];
  if (!hasIlchonLink(store, a, b)) {
    store.ilchons[a].unshift({ peer: b, t });
    store.ilchons[b].unshift({ peer: a, t });
    store.ilchons[a] = store.ilchons[a].slice(0, 48);
    store.ilchons[b] = store.ilchons[b].slice(0, 48);
  }
}

function newRequestId() {
  return "ir_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");
}

function newGiftId() {
  return "gf_" + Date.now() + "_" + crypto.randomBytes(4).toString("hex");
}

function findPendingRequest(store, from, to) {
  return (store.ilchonRequests || []).find(
    (r) => r.status === "pending" && r.from === from && r.to === to
  );
}

function clearPendingBetween(store, a, b) {
  (store.ilchonRequests || []).forEach((r) => {
    if (
      r.status === "pending" &&
      ((r.from === a && r.to === b) || (r.from === b && r.to === a))
    ) {
      r.status = "cancelled";
    }
  });
}

function authNick(store, name, token, res) {
  if (!name || !token) {
    res.status(401).json({
      ok: false,
      error: "auth",
      message: "닉네임부터 정해 주세요 ♡",
    });
    return false;
  }
  if (!verifyNickToken(store, name, token)) {
    res.status(401).json({
      ok: false,
      error: "auth",
      message: "닉네임 인증이 필요해요. 다시 입장해 주세요.",
    });
    return false;
  }
  return true;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/nickname/check", (req, res) => {
  const name = normalizeNick(req.query.name);
  if (!name) {
    return res.status(400).json({ ok: false, error: "empty" });
  }
  const store = readStore();
  const taken = !!store.nicknames[name];
  res.json({ ok: true, available: !taken, name });
});

app.post("/api/nickname/claim", (req, res) => {
  const name = normalizeNick(req.body && req.body.name);
  const token = String((req.body && req.body.token) || "").trim();
  if (!name) {
    return res.status(400).json({ ok: false, error: "empty", message: "닉네임을 적어 주세요." });
  }
  const store = readStore();
  const existing = store.nicknames[name];
  if (existing) {
    if (token && existing.token === token) {
      return res.json({ ok: true, name, token: existing.token, restored: true });
    }
    return res.status(409).json({
      ok: false,
      error: "taken",
      message: "이미 사용 중인 닉네임이에요. 다른 이름을 골라 주세요 ♡",
    });
  }
  const newTok = token || newToken();
  store.nicknames[name] = { token: newTok, createdAt: new Date().toISOString() };
  writeStore(store);
  res.status(201).json({ ok: true, name, token: newTok, restored: false });
});

app.get("/api/board/:symbol", (req, res) => {
  const sym = String(req.params.symbol || "").trim();
  if (!validSymbol(sym)) {
    return res.status(400).json({ ok: false, error: "invalid_symbol" });
  }
  const store = readStore();
  const list = store.boards[sym] || [];
  res.json({ ok: true, symbol: sym, items: list });
});

app.post("/api/board/:symbol", (req, res) => {
  const sym = String(req.params.symbol || "").trim();
  if (!validSymbol(sym)) {
    return res.status(400).json({ ok: false, error: "invalid_symbol" });
  }
  const text = String((req.body && req.body.text) || "").trim().slice(0, 500);
  if (!text) {
    return res.status(400).json({ ok: false, error: "empty" });
  }
  const color = String((req.body && req.body.color) || "yellow").slice(0, 20);
  const author = normalizeNick(req.body && req.body.author) || "익명";
  const store = readStore();
  if (!store.boards[sym]) {
    store.boards[sym] = [];
  }
  const item = { text, color, author, t: nowKo() };
  store.boards[sym].unshift(item);
  store.boards[sym] = store.boards[sym].slice(0, 30);
  writeStore(store);
  res.status(201).json({ ok: true, item, items: store.boards[sym] });
});

app.get("/api/guestbook/:scope", (req, res) => {
  const scope = String(req.params.scope || "").trim();
  if (!validScope(scope)) {
    return res.status(400).json({ ok: false, error: "invalid_scope" });
  }
  const store = readStore();
  const list = store.guestbooks[scope] || [];
  res.json({ ok: true, scope, items: list });
});

app.post("/api/guestbook/:scope", (req, res) => {
  const scope = String(req.params.scope || "").trim();
  if (!validScope(scope)) {
    return res.status(400).json({ ok: false, error: "invalid_scope" });
  }
  const name = normalizeNick(req.body && req.body.name) || "익명";
  const msg = String((req.body && req.body.msg) || "").trim().slice(0, 500);
  if (!msg) {
    return res.status(400).json({ ok: false, error: "empty" });
  }
  const secret = !!(req.body && req.body.secret);
  const store = readStore();
  if (!store.guestbooks[scope]) {
    store.guestbooks[scope] = [];
  }
  const item = {
    id: "g_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    name,
    msg,
    secret,
    replies: [],
    t: nowKo(),
  };
  store.guestbooks[scope].unshift(item);
  const max = scope === "plaza" ? 80 : 50;
  store.guestbooks[scope] = store.guestbooks[scope].slice(0, max);
  writeStore(store);
  res.status(201).json({ ok: true, item, items: store.guestbooks[scope] });
});

app.post("/api/guestbook/:scope/:id/reply", (req, res) => {
  const scope = String(req.params.scope || "").trim();
  const id = String(req.params.id || "").trim();
  if (!validScope(scope) || !id) {
    return res.status(400).json({ ok: false, error: "invalid" });
  }
  const msg = String((req.body && req.body.msg) || "").trim().slice(0, 200);
  if (!msg) {
    return res.status(400).json({ ok: false, error: "empty" });
  }
  const name = normalizeNick(req.body && req.body.name) || "주인";
  const store = readStore();
  const list = store.guestbooks[scope] || [];
  const idx = list.findIndex((o) => o.id === id);
  if (idx < 0) {
    return res.status(404).json({ ok: false, error: "not_found" });
  }
  if (!Array.isArray(list[idx].replies)) {
    list[idx].replies = [];
  }
  list[idx].replies.push({ name, msg, t: nowKo() });
  store.guestbooks[scope] = list;
  writeStore(store);
  res.json({ ok: true, items: list });
});

app.get("/api/friends-say/:symbol", (req, res) => {
  const sym = String(req.params.symbol || "").trim();
  if (!validSymbol(sym)) {
    return res.status(400).json({ ok: false, error: "invalid_symbol" });
  }
  const name = normalizeNick(req.query.nickname);
  const store = readStore();
  if (!name) {
    return res.json({ ok: true, symbol: sym, items: [] });
  }
  const peerSet = {};
  getIlchonListFor(store, name).forEach((item) => {
    peerSet[normalizeNick(item.peer)] = true;
  });
  const guestbook = store.guestbooks[sym] || [];
  const items = guestbook
    .filter((item) => peerSet[normalizeNick(item.name)])
    .slice(0, 12)
    .map((item) => ({
      name: normalizeNick(item.name),
      msg: item.secret ? "🔒 비밀 편지" : String(item.msg || "").slice(0, 200),
      t: item.t || "",
    }));
  res.json({ ok: true, symbol: sym, items });
});

app.get("/api/ilchon/:nickname", (req, res) => {
  const name = normalizeNick(req.params.nickname);
  if (!name) {
    return res.status(400).json({ ok: false, error: "empty" });
  }
  const store = readStore();
  const items = getIlchonListFor(store, name);
  res.json({ ok: true, nickname: name, items });
});

function handleIlchonRequest(req, res) {
  const name = normalizeNick(req.body && req.body.name);
  const token = String((req.body && req.body.token) || "").trim();
  const peer = normalizeNick(req.body && req.body.peer);
  const store = readStore();
  if (!authNick(store, name, token, res)) {
    return;
  }
  if (!peer) {
    return res.status(400).json({
      ok: false,
      error: "empty",
      message: "일촌할 친구 닉네임을 적어 주세요.",
    });
  }
  if (peer === name) {
    return res.status(400).json({
      ok: false,
      error: "self",
      message: "나 자신과는 일촌 못 해요 ㅎㅎ",
    });
  }
  if (!store.nicknames[peer]) {
    return res.status(404).json({
      ok: false,
      error: "not_found",
      message: "그 닉네임은 아직 없어요. 친구가 먼저 입장해야 해요!",
    });
  }
  if (hasIlchonLink(store, name, peer)) {
    return res.status(409).json({
      ok: false,
      error: "duplicate",
      message: "이미 일촌이에요 ♡",
    });
  }
  const reverse = findPendingRequest(store, peer, name);
  if (reverse) {
    return res.status(409).json({
      ok: false,
      error: "incoming",
      message: peer + "님이 먼저 신청했어요! 받은 신청에서 수락해 주세요 ♡",
      requestId: reverse.id,
    });
  }
  if (findPendingRequest(store, name, peer)) {
    return res.status(409).json({
      ok: false,
      error: "pending",
      message: "이미 일촌 신청을 보냈어요. 상대가 수락할 때까지 기다려 주세요 ♡",
    });
  }
  const item = {
    id: newRequestId(),
    from: name,
    to: peer,
    status: "pending",
    t: nowKo(),
  };
  if (!store.ilchonRequests) store.ilchonRequests = [];
  store.ilchonRequests.unshift(item);
  store.ilchonRequests = store.ilchonRequests.slice(0, 200);
  writeStore(store);
  res.status(201).json({
    ok: true,
    pending: true,
    nickname: name,
    peer,
    request: item,
    message: peer + "님에게 일촌 신청을 보냈어요! 수락하면 맺어져요 ♡",
  });
}

app.post("/api/ilchon/request", handleIlchonRequest);
app.post("/api/ilchon/link", handleIlchonRequest);

app.get("/api/ilchon/inbox", (req, res) => {
  const name = normalizeNick(req.query.nickname);
  const token = String(req.query.token || "").trim();
  const store = readStore();
  if (!authNick(store, name, token, res)) {
    return;
  }
  const items = (store.ilchonRequests || []).filter(
    (r) => r.status === "pending" && r.to === name
  );
  res.json({ ok: true, nickname: name, items });
});

app.get("/api/ilchon/outbox", (req, res) => {
  const name = normalizeNick(req.query.nickname);
  const token = String(req.query.token || "").trim();
  const store = readStore();
  if (!authNick(store, name, token, res)) {
    return;
  }
  const items = (store.ilchonRequests || []).filter(
    (r) => r.status === "pending" && r.from === name
  );
  res.json({ ok: true, nickname: name, items });
});

app.post("/api/ilchon/respond", (req, res) => {
  const name = normalizeNick(req.body && req.body.name);
  const token = String((req.body && req.body.token) || "").trim();
  const requestId = String((req.body && req.body.requestId) || "").trim();
  const action = String((req.body && req.body.action) || "").trim();
  const store = readStore();
  if (!authNick(store, name, token, res)) {
    return;
  }
  if (!requestId || (action !== "accept" && action !== "reject")) {
    return res.status(400).json({
      ok: false,
      error: "invalid",
      message: "잘못된 요청이에요.",
    });
  }
  const pending = (store.ilchonRequests || []).find(
    (r) => r.id === requestId && r.status === "pending" && r.to === name
  );
  if (!pending) {
    return res.status(404).json({
      ok: false,
      error: "not_found",
      message: "이미 처리됐거나 없는 신청이에요.",
    });
  }
  if (action === "accept") {
    addIlchonLink(store, pending.from, pending.to);
    pending.status = "accepted";
    clearPendingBetween(store, pending.from, pending.to);
    writeStore(store);
    return res.json({
      ok: true,
      accepted: true,
      peer: pending.from,
      message: pending.from + "님과 일촌이 됐어요 ♡",
      items: getIlchonListFor(store, name),
    });
  }
  pending.status = "rejected";
  writeStore(store);
  res.json({
    ok: true,
    accepted: false,
    peer: pending.from,
    message: pending.from + "님 일촌 신청을 거절했어요.",
  });
});

app.post("/api/gift/send", (req, res) => {
  const from = normalizeNick(req.body && req.body.name);
  const token = String((req.body && req.body.token) || "").trim();
  const to = normalizeNick(req.body && req.body.to);
  const giftId = String((req.body && req.body.giftId) || "").trim().slice(0, 32);
  const giftName = String((req.body && req.body.giftName) || "선물").trim().slice(0, 40);
  const giftEmoji = String((req.body && req.body.giftEmoji) || "🎁").trim().slice(0, 8);
  const store = readStore();
  if (!authNick(store, from, token, res)) {
    return;
  }
  if (!to || !giftId) {
    return res.status(400).json({
      ok: false,
      error: "empty",
      message: "선물 정보가 부족해요.",
    });
  }
  if (!store.nicknames[to]) {
    return res.status(404).json({
      ok: false,
      error: "not_found",
      message: "그 닉네임은 아직 없어요.",
    });
  }
  if (!hasIlchonLink(store, from, to)) {
    return res.status(403).json({
      ok: false,
      error: "not_ilchon",
      message: "일촌에게만 선물할 수 있어요 ♡",
    });
  }
  const item = {
    id: newGiftId(),
    from,
    to,
    giftId,
    name: giftName,
    emoji: giftEmoji,
    t: nowKo(),
  };
  if (!store.gifts) store.gifts = [];
  store.gifts.unshift(item);
  store.gifts = store.gifts.slice(0, 500);
  writeStore(store);
  res.status(201).json({ ok: true, gift: item });
});

app.get("/api/gift/inbox", (req, res) => {
  const name = normalizeNick(req.query.nickname);
  const token = String(req.query.token || "").trim();
  const store = readStore();
  if (!authNick(store, name, token, res)) {
    return;
  }
  const items = (store.gifts || [])
    .filter((g) => g.to === name)
    .slice(0, 60)
    .map((g) => ({
      id: g.id,
      giftId: g.giftId,
      emoji: g.emoji || "🎁",
      name: g.name || "선물",
      from: g.from,
      t: g.t || "",
    }));
  res.json({ ok: true, nickname: name, items });
});

app.use(express.static(ROOT));

app.listen(port, () => {
  console.log("Cy-Chemi server → http://localhost:" + port);
});
