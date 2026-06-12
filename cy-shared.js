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
      return String(custom).replace(/\/$/, "");
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

  function request(method, path, body) {
    var opts = {
      method: method,
      headers: { Accept: "application/json" },
    };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(apiUrl(path), opts).then(function (res) {
      return res.json().catch(function () {
        return { ok: false, error: "bad_json" };
      }).then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.message) || "request_failed");
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
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
