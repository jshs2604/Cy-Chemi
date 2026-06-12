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

  var CyShared = {
    NICK_KEY: NICK_KEY,
    NICK_TOKEN_KEY: NICK_TOKEN_KEY,

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
