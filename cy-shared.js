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
      var custom = localStorage.getItem("cy_api_base");
      if (custom) {
        custom = String(custom).replace(/\/$/, "");
        // 예전 테스트(localhost 등)로 저장된 주소는 무시
        if (
          custom &&
          custom.indexOf("localhost") === -1 &&
          custom.indexOf("127.0.0.1") === -1
        ) {
          return custom;
        }
      }
    } catch (e) {}
    if (DEFAULT_API_BASE) {
      return String(DEFAULT_API_BASE).replace(/\/$/, "");
    }
    return "";
  }

  function apiUrl(path) {
    return getApiBase() + path;
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
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
                attempt < 4 &&
                (res.status === 502 || res.status === 503 || res.status === 504)
              ) {
                return sleep(2500 * (attempt + 1)).then(function () {
                  return request(method, path, body, attempt + 1);
                });
              }
              var err = new Error((data && data.message) || "request_failed");
              err.status = res.status;
              err.data = data;
              throw err;
            }
            return data;
          });
      })
      .catch(function (err) {
        if (attempt < 4 && err && err.message !== "no_api_base") {
          return sleep(2500 * (attempt + 1)).then(function () {
            return request(method, path, body, attempt + 1);
          });
        }
        throw err;
      });
  }

  // Render 무료 서버 깨우기 (페이지 로드 시 미리 연결)
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

    checkNickname: function (name) {
      return request("GET", "/api/nickname/check?name=" + encodeURIComponent(name));
    },

    claimNickname: function (name) {
      return request("POST", "/api/nickname/claim", {
        name: name,
        token: getNickToken() || undefined,
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
      return request("GET", "/api/board/" + encodeURIComponent(symbol)).then(function (d) {
        return d.items || [];
      });
    },

    postBoard: function (symbol, payload) {
      return request("POST", "/api/board/" + encodeURIComponent(symbol), payload).then(function (d) {
        return d.items || [];
      });
    },

    getGuestbook: function (scope) {
      return request("GET", "/api/guestbook/" + encodeURIComponent(scope)).then(function (d) {
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

    linkIlchon: function (peerNickname) {
      return request("POST", "/api/ilchon/link", {
        name: getNickname(),
        token: getNickToken(),
        peer: peerNickname,
      }).then(function (d) {
        return d.items || [];
      });
    },
  };

  global.CyShared = CyShared;
})(typeof window !== "undefined" ? window : global);
