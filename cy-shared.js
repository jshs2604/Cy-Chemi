/**
 * Cy-Chemi 공유 데이터 API
 * - 닉네임(전역 유니크), 게시판, 방명록 → 서버
 * - 도토리, 원소 해제 등 → localStorage (index.html 인라인 스크립트)
 */
(function (global) {
  "use strict";

  var NICK_KEY = "cy_nickname_v1";
  var NICK_TOKEN_KEY = "cy_nickname_token_v1";

  var DEFAULT_API_BASE = "https://cy-chemi-6nme.onrender.com";

  function getApiBase() {
    try {
      if (typeof location !== "undefined" && location.hostname) {
        var host = location.hostname;
        // Render·로컬은 화면과 API가 같은 주소 → CORS 문제 없음
        if (
          host.indexOf("onrender.com") !== -1 ||
          host === "localhost" ||
          host === "127.0.0.1"
        ) {
          return String(location.origin).replace(/\/$/, "");
        }
      }
    } catch (e) {}
    try {
      var custom = localStorage.getItem("cy_api_base");
      if (custom) {
        custom = String(custom).replace(/\/$/, "");
        if (
          custom &&
          custom.indexOf("localhost") === -1 &&
          custom.indexOf("127.0.0.1") === -1
        ) {
          return custom;
        }
      }
    } catch (e2) {}
    if (DEFAULT_API_BASE) {
      return String(DEFAULT_API_BASE).replace(/\/$/, "");
    }
    return "";
  }

  function apiUrl(path) {
    return getApiBase() + path;
  }

  var serverReady = false;

  var BOOT_SPLASH_LINES = [
    "미니홈 문을 열고 있어요…",
    "원소 친구들을 깨우는 중… 🧪",
    "도토리 상자를 정리하는 중… 🌰",
    "거의 다 왔어요, 조금만! ♡",
  ];

  function setBootSplashMessage(msg) {
    var el = document.getElementById("cy-boot-splash-msg");
    if (el) {
      el.textContent = msg;
    }
  }

  function hideBootSplash() {
    var el = document.getElementById("cy-boot-splash");
    if (!el) {
      return;
    }
    el.classList.add("cy-boot-splash--out");
    if (document.body) {
      document.body.classList.remove("cy-booting");
    }
    window.setTimeout(function () {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 520);
  }

  function waitForServer(opts) {
    opts = opts || {};
    var maxMs = opts.maxMs || 40000;
    var intervalMs = opts.intervalMs || 2000;
    var start = Date.now();
    var lineIdx = 0;
    var base = getApiBase();

    if (!base) {
      return Promise.resolve(false);
    }

    function tickStatus() {
      if (opts.onStatus) {
        opts.onStatus(BOOT_SPLASH_LINES[lineIdx % BOOT_SPLASH_LINES.length]);
      }
      lineIdx += 1;
    }

    function tryOnce() {
      tickStatus();
      return request("GET", "/api/health")
        .then(function (d) {
          return !!(d && d.ok);
        })
        .catch(function () {
          if (Date.now() - start >= maxMs) {
            return false;
          }
          return sleep(intervalMs).then(tryOnce);
        });
    }

    return tryOnce();
  }

  function runBootSplash(opts) {
    opts = opts || {};
    var minMs = opts.minMs || 700;
    if (document.body) {
      document.body.classList.add("cy-booting");
    }
    return Promise.all([
      sleep(minMs),
      waitForServer({
        maxMs: opts.maxMs || 40000,
        onStatus: setBootSplashMessage,
      }),
    ]).then(function () {
      hideBootSplash();
    });
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function maxAttempts() {
    return serverReady ? 1 : 3;
  }

  var authRetryDepth = 0;

  function patchAuthBody(body) {
    if (!body || typeof body !== "object") {
      return body;
    }
    var next = Object.assign({}, body);
    if ("name" in next || "token" in next) {
      next.name = getNickname();
      next.token = getNickToken();
    }
    return next;
  }

  function request(method, path, body, attempt) {
    attempt = attempt || 0;
    var base = getApiBase();
    if (!base) {
      return Promise.reject(new Error("no_api_base"));
    }
    var opts = {
      method: method,
      headers: { Accept: "application/json" },
    };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(apiUrl(path), opts)
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return { ok: false, error: "bad_json" };
          })
          .then(function (data) {
            if (!res.ok) {
              if (
                res.status === 401 &&
                data &&
                data.error === "auth" &&
                authRetryDepth < 1 &&
                getNickname()
              ) {
                authRetryDepth += 1;
                return CyShared.ensureNicknameAuth().then(function (ok) {
                  authRetryDepth -= 1;
                  if (ok) {
                    return request(method, path, patchAuthBody(body), attempt);
                  }
                  var err = new Error(
                    (data && data.message) ||
                      "닉네임 인증이 필요해요. 입장 버튼에서 다시 입장해 주세요."
                  );
                  err.status = res.status;
                  err.data = data;
                  throw err;
                });
              }
              if (
                attempt < maxAttempts() &&
                (res.status === 502 || res.status === 503 || res.status === 504)
              ) {
                return sleep(1500 * (attempt + 1)).then(function () {
                  return request(method, path, body, attempt + 1);
                });
              }
              var err = new Error((data && data.message) || "request_failed");
              err.status = res.status;
              err.data = data;
              throw err;
            }
            serverReady = true;
            return data;
          });
      })
      .catch(function (err) {
        if (attempt < maxAttempts() && err && err.message !== "no_api_base") {
          return sleep(1500 * (attempt + 1)).then(function () {
            return request(method, path, body, attempt + 1);
          });
        }
        throw err;
      });
  }

  if (typeof window !== "undefined" && DEFAULT_API_BASE) {
    request("GET", "/api/health").catch(function () {});
  }

  function getNickname() {
    try {
      return (localStorage.getItem(NICK_KEY) || "").trim();
    } catch (e) {
      return "";
    }
  }

  function getNickToken() {
    try {
      return (localStorage.getItem(NICK_TOKEN_KEY) || "").trim();
    } catch (e) {
      return "";
    }
  }

  function saveNicknameLocal(name, token) {
    var v = (name || "").trim().slice(0, 12);
    try {
      if (v) {
        localStorage.setItem(NICK_KEY, v);
        if (token) {
          localStorage.setItem(NICK_TOKEN_KEY, token);
        }
      } else {
        localStorage.removeItem(NICK_KEY);
        localStorage.removeItem(NICK_TOKEN_KEY);
      }
    } catch (e) {}
  }

  function isUserBusy() {
    try {
      var el = document.activeElement;
      if (el) {
        var tag = String(el.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") {
          return true;
        }
        if (el.isContentEditable) {
          return true;
        }
      }
      if (document.querySelector(".mh-gb-reply-form:not([hidden])")) {
        return true;
      }
      if (document.querySelector(".mh-ilchon-modal:not([hidden])")) {
        return true;
      }
      if (document.querySelector("#nick-modal:not([hidden])")) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function jsonFingerprint(value) {
    try {
      return JSON.stringify(value);
    } catch (e2) {
      return "";
    }
  }

  function isPanelVisible(panelId) {
    try {
      var panel = document.getElementById(panelId);
      return !!(panel && !panel.hasAttribute("hidden"));
    } catch (e) {
      return false;
    }
  }

  function captureComposeDrafts() {
    var drafts = {
      gbMsg: "",
      boardText: "",
      gbSecret: false,
      gbTo: "",
      activeId: "",
      selectionStart: 0,
      selectionEnd: 0,
    };
    try {
      var gb = document.getElementById("gb-msg");
      if (gb) {
        drafts.gbMsg = gb.value || "";
        if (document.activeElement === gb) {
          drafts.activeId = "gb-msg";
          drafts.selectionStart = gb.selectionStart || 0;
          drafts.selectionEnd = gb.selectionEnd || 0;
        }
      }
      var board = document.getElementById("board-text");
      if (board) {
        drafts.boardText = board.value || "";
        if (document.activeElement === board) {
          drafts.activeId = "board-text";
          drafts.selectionStart = board.selectionStart || 0;
          drafts.selectionEnd = board.selectionEnd || 0;
        }
      }
      var secret = document.getElementById("gb-secret");
      if (secret) {
        drafts.gbSecret = !!secret.checked;
      }
      var to = document.getElementById("gb-to");
      if (to) {
        drafts.gbTo = to.value || "";
      }
    } catch (e) {}
    return drafts;
  }

  function restoreComposeDrafts(drafts) {
    if (!drafts) {
      return;
    }
    try {
      var gb = document.getElementById("gb-msg");
      if (gb && drafts.gbMsg !== undefined && gb.value !== drafts.gbMsg) {
        gb.value = drafts.gbMsg;
      }
      var board = document.getElementById("board-text");
      if (board && drafts.boardText !== undefined && board.value !== drafts.boardText) {
        board.value = drafts.boardText;
      }
      var secret = document.getElementById("gb-secret");
      if (secret && drafts.gbSecret !== undefined) {
        secret.checked = !!drafts.gbSecret;
      }
      var to = document.getElementById("gb-to");
      if (to && drafts.gbTo !== undefined && drafts.gbTo) {
        to.value = drafts.gbTo;
      }
      if (drafts.activeId) {
        var active = document.getElementById(drafts.activeId);
        if (active && typeof active.focus === "function") {
          active.focus();
          if (typeof active.setSelectionRange === "function") {
            var len = (active.value || "").length;
            var start = Math.min(drafts.selectionStart || 0, len);
            var end = Math.min(drafts.selectionEnd || 0, len);
            active.setSelectionRange(start, end);
          }
        }
      }
    } catch (e2) {}
  }

  function hasComposeDraft() {
    try {
      var gb = document.getElementById("gb-msg");
      if (gb && String(gb.value || "").trim()) {
        return true;
      }
      var board = document.getElementById("board-text");
      if (board && String(board.value || "").trim()) {
        return true;
      }
      var openReply = document.querySelector(
        ".mh-gb-reply-form:not([hidden]) .mh-gb-reply-form__msg"
      );
      if (openReply && String(openReply.value || "").trim()) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function captureListUiState(listEl) {
    var state = { scrollTop: 0, openReplies: [] };
    if (!listEl) {
      return state;
    }
    try {
      state.scrollTop = listEl.scrollTop || 0;
      listEl.querySelectorAll(".mh-gb-reply-form").forEach(function (form) {
        var ta = form.querySelector(".mh-gb-reply-form__msg");
        var id = form.getAttribute("data-letter-id") || "";
        if (!id) {
          return;
        }
        state.openReplies.push({
          id: id,
          msg: ta ? ta.value || "" : "",
          open: !form.hidden,
        });
      });
    } catch (e) {}
    return state;
  }

  function restoreListUiState(listEl, state) {
    if (!listEl || !state) {
      return;
    }
    try {
      listEl.scrollTop = state.scrollTop || 0;
      (state.openReplies || []).forEach(function (item) {
        var form = listEl.querySelector(
          '.mh-gb-reply-form[data-letter-id="' + item.id + '"]'
        );
        if (!form) {
          return;
        }
        if (item.open) {
          form.hidden = false;
        }
        var ta = form.querySelector(".mh-gb-reply-form__msg");
        if (ta && item.msg !== undefined) {
          ta.value = item.msg;
        }
      });
    } catch (e) {}
  }

  function bindDraftKeepalive() {
    ["gb-msg", "board-text"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.cyDraftBound === "1") {
        return;
      }
      el.dataset.cyDraftBound = "1";
      var key = "cy_draft_" + id + "_v1";
      try {
        var saved = localStorage.getItem(key);
        if (saved && !el.value) {
          el.value = saved;
        }
      } catch (e) {}
      el.addEventListener("input", function () {
        try {
          if (el.value) {
            localStorage.setItem(key, el.value);
          } else {
            localStorage.removeItem(key);
          }
        } catch (e2) {}
      });
    });
  }

  function clearDraftField(id) {
    try {
      localStorage.removeItem("cy_draft_" + id + "_v1");
    } catch (e) {}
  }

  var CyShared = {
    NICK_KEY: NICK_KEY,
    NICK_TOKEN_KEY: NICK_TOKEN_KEY,

    isUserBusy: isUserBusy,
    jsonFingerprint: jsonFingerprint,
    isPanelVisible: isPanelVisible,
    captureComposeDrafts: captureComposeDrafts,
    restoreComposeDrafts: restoreComposeDrafts,
    hasComposeDraft: hasComposeDraft,
    captureListUiState: captureListUiState,
    restoreListUiState: restoreListUiState,
    bindDraftKeepalive: bindDraftKeepalive,
    clearDraftField: clearDraftField,

    getApiBase: getApiBase,
    setApiBase: function (url) {
      try {
        if (url) {
          localStorage.setItem("cy_api_base", String(url).replace(/\/$/, ""));
        } else {
          localStorage.removeItem("cy_api_base");
        }
      } catch (e) {}
    },

    ping: function () {
      return request("GET", "/api/health");
    },

    searchYoutube: function (q) {
      return request(
        "GET",
        "/api/youtube/search?q=" + encodeURIComponent(String(q || "").trim())
      );
    },

    setBootSplashMessage: setBootSplashMessage,
    hideBootSplash: hideBootSplash,
    waitForServer: waitForServer,
    runBootSplash: runBootSplash,

    isOnline: function () {
      return request("GET", "/api/health").then(function (d) {
        return !!(d && d.ok);
      });
    },

    clearNickname: function () {
      saveNicknameLocal("", "");
    },

    verifyNickname: function () {
      var name = getNickname();
      var token = getNickToken();
      if (!name || !token) {
        return Promise.resolve({ ok: true, valid: false, name: name || "" });
      }
      return request(
        "GET",
        "/api/nickname/verify?name=" +
          encodeURIComponent(name) +
          "&token=" +
          encodeURIComponent(token)
      );
    },

    ensureNicknameAuth: function () {
      var name = getNickname();
      if (!name) {
        return Promise.resolve(false);
      }
      return CyShared.verifyNickname()
        .then(function (status) {
          if (status && status.valid) {
            return true;
          }
          // 꼬인 토큰은 지우고 같은 닉네임으로 다시 입장 시도
          saveNicknameLocal(name, "");
          return CyShared.claimNickname(name).then(function (data) {
            return !!(data && data.ok);
          });
        })
        .catch(function () {
          return false;
        });
    },

    checkNickname: function (name) {
      return request("GET", "/api/nickname/check?name=" + encodeURIComponent(name));
    },

    claimNickname: function (name) {
      var trimmed = String(name || "").trim().slice(0, 12);
      var current = getNickname();
      var token = getNickToken();
      if (!current || current !== trimmed) {
        token = "";
      }
      return request("POST", "/api/nickname/claim", {
        name: trimmed,
        token: token || undefined,
      }).then(function (data) {
        if (data && data.ok && data.name) {
          saveNicknameLocal(data.name, data.token);
        }
        return data;
      });
    },

    getNickname: getNickname,
    getNickToken: getNickToken,
    saveNicknameLocal: saveNicknameLocal,

    getBoard: function (symbol) {
      return request(
        "GET",
        "/api/board/" + encodeURIComponent(symbol) + "?_=" + Date.now()
      ).then(function (d) {
        return d.items || [];
      });
    },

    postBoard: function (symbol, payload) {
      return request("POST", "/api/board/" + encodeURIComponent(symbol), payload).then(function (d) {
        return d.items || [];
      });
    },

    getGuestbook: function (scope) {
      return request(
        "GET",
        "/api/guestbook/" + encodeURIComponent(scope) + "?_=" + Date.now()
      ).then(function (d) {
        return d.items || [];
      });
    },

    postGuestbook: function (scope, payload) {
      return request("POST", "/api/guestbook/" + encodeURIComponent(scope), payload).then(function (d) {
        return d.items || [];
      });
    },

    replyGuestbook: function (scope, id, payload) {
      return request(
        "POST",
        "/api/guestbook/" + encodeURIComponent(scope) + "/" + encodeURIComponent(id) + "/reply",
        payload
      ).then(function (d) {
        return d.items || [];
      });
    },

    getIlchonMailInbox: function () {
      var name = getNickname();
      if (!name) {
        return Promise.resolve([]);
      }
      return request(
        "GET",
        "/api/ilchon-mail/inbox?nickname=" +
          encodeURIComponent(name) +
          "&_=" +
          Date.now()
      ).then(function (d) {
        return (d && d.items) || [];
      });
    },

    getIlchonMailSent: function () {
      var name = getNickname();
      if (!name) {
        return Promise.resolve([]);
      }
      return request(
        "GET",
        "/api/ilchon-mail/sent?nickname=" +
          encodeURIComponent(name) +
          "&_=" +
          Date.now()
      ).then(function (d) {
        return (d && d.items) || [];
      });
    },

    sendIlchonMail: function (payload) {
      return request("POST", "/api/ilchon-mail/send", {
        name: getNickname(),
        token: getNickToken(),
        to: payload && payload.to,
        msg: payload && payload.msg,
        secret: !!(payload && payload.secret),
      });
    },

    replyIlchonMail: function (mailId, msg) {
      return request("POST", "/api/ilchon-mail/" + encodeURIComponent(mailId) + "/reply", {
        name: getNickname(),
        token: getNickToken(),
        msg: msg,
      });
    },

    getIlchon: function (nickname) {
      var name = nickname || getNickname();
      if (!name) {
        return Promise.resolve([]);
      }
      return request("GET", "/api/ilchon/" + encodeURIComponent(name)).then(function (d) {
        return d.items || [];
      });
    },

    requestIlchon: function (peerNickname) {
      return request("POST", "/api/ilchon/request", {
        name: getNickname(),
        token: getNickToken(),
        peer: peerNickname,
      });
    },

    linkIlchon: function (peerNickname) {
      return request("POST", "/api/ilchon/request", {
        name: getNickname(),
        token: getNickToken(),
        peer: peerNickname,
      });
    },

    getIlchonInbox: function () {
      var name = getNickname();
      if (!name) {
        return Promise.resolve({ items: [], authRequired: false });
      }
      var token = getNickToken();
      var path =
        "/api/ilchon/inbox?nickname=" +
        encodeURIComponent(name) +
        "&_=" +
        Date.now();
      if (token) {
        path += "&token=" + encodeURIComponent(token);
      }
      return request("GET", path).then(function (d) {
        return {
          items: (d && d.items) || [],
          authRequired: !!(d && d.authRequired),
        };
      });
    },

    getIlchonOutbox: function () {
      var name = getNickname();
      var token = getNickToken();
      if (!name || !token) {
        return Promise.resolve([]);
      }
      return request(
        "GET",
        "/api/ilchon/outbox?nickname=" +
          encodeURIComponent(name) +
          "&token=" +
          encodeURIComponent(token) +
          "&_=" +
          Date.now()
      ).then(function (d) {
        return d.items || [];
      });
    },

    respondIlchon: function (requestId, action) {
      return request("POST", "/api/ilchon/respond", {
        name: getNickname(),
        token: getNickToken(),
        requestId: requestId,
        action: action,
      });
    },

    sendGift: function (toNickname, payload) {
      return request("POST", "/api/gift/send", {
        name: getNickname(),
        token: getNickToken(),
        to: toNickname,
        giftId: payload && payload.giftId,
        giftName: payload && payload.giftName,
        giftEmoji: payload && payload.giftEmoji,
      });
    },

    getGiftInbox: function () {
      var name = getNickname();
      var token = getNickToken();
      if (!name || !token) {
        return Promise.resolve([]);
      }
      return request(
        "GET",
        "/api/gift/inbox?nickname=" +
          encodeURIComponent(name) +
          "&token=" +
          encodeURIComponent(token) +
          "&_=" +
          Date.now()
      ).then(function (d) {
        return d.items || [];
      });
    },

    getFriendsSay: function (symbol, nickname) {
      var name = nickname || getNickname();
      if (!name || !symbol) {
        return Promise.resolve([]);
      }
      return request(
        "GET",
        "/api/friends-say/" +
          encodeURIComponent(symbol) +
          "?nickname=" +
          encodeURIComponent(name)
      ).then(function (d) {
        return d.items || [];
      });
    },
  };

  global.CyShared = CyShared;
})(typeof window !== "undefined" ? window : global);
