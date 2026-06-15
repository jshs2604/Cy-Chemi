/**
 * Cy-Chemi MP3 플레이어 — 제목·가수로 유튜브 영상을 찾아 재생
 */
(function (global) {
  "use strict";

  var YT_ID_MAP = {
    "Gee@소녀시대": "U7mPqycq0tQ",
    "눈의 꽃@박효신": "1bZ_FqoW5iQ",
    "Tell Me@원더걸스": "rUp70m7Fi8s",
    "하루하루@BIGBANG": "d0Sgo80inlU",
    "비가 오는 날엔@비스트": "6JY7Qww6oUU",
    "Hug@동방신기": "5ZqMTtQk7bw",
    "LOVE SCENARIO@아이콘": "JWKqm67tnys",
    "봄여름가을겨울@BIGBANG": "0m7c3TS9KC4",
    "캔디@H.O.T.": "8gKuE7_QrYo",
    "봄날@방탄소년단": "xEeFrLS1mAc",
    "숨@박효신": "kTX2UW7m0yE",
    "불타오르네@방탄소년단": "mrAzDjxVdVI",
    "Dynamite@방탄소년단": "gdZLi9oWNZg",
    "불꽃놀이@악동뮤지션": "Dgs7lE2M5_k",
    "미쳤어@손담비": "5CeUMP8NdEQ",
    "말리지 마@BIGBANG": "_mSmOcqgOlU",
    "총맞은 것처럼@백지영": "3n0R9j2u3c4",
    "Ring Ding Dong@SHINee": "oue7I76LBmQ",
    "너를 위해@임재범": "XzN9N1x5r50",
    "무지개@비스트": "qnF0zdjMK2s",
    "우주를 줄게@볼빨간사춘기": "6J9VObwTG00",
    "거짓말@BIGBANG": "2CvVh4ukY8Q",
    "미아@방탄소년단": "3ZQtLaaLQbQ",
    "캔디샵@2NE1": "ogeHgT3nH9k",
    "Nobody@원더걸스": "PFfzdl-sfTs",
    "Bad Girl Good Girl@miss A": "wE9NZ0p55dY",
    "불꽃@에이핑크": "rvQLJn0Lige",
    "고요@김연우": "gU0vXc6pUc4",
    "비밀@아이유": "JleoApvFDvA",
  };

  var INVIDIOUS_INSTANCES = [
    "https://inv.nadeko.net",
    "https://yewtu.be",
    "https://invidious.fdn.fr",
  ];

  var YT_CACHE_KEY = "cy_yt_cache_v1";
  var player = null;
  var apiReady = false;
  var apiQueue = [];
  var state = {
    playing: false,
    loading: false,
    videoId: "",
    songKey: "",
    song: null,
    playlistIdx: 0,
  };
  var opts = {};

  function songKey(title, artist) {
    return String(title || "").trim() + "@" + String(artist || "").trim();
  }

  function readYtCache() {
    try {
      var raw = localStorage.getItem(YT_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writeYtCache(key, videoId) {
    try {
      var cache = readYtCache();
      cache[key] = videoId;
      localStorage.setItem(YT_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  function setHint(text) {
    var hint = document.getElementById("bgm-hint");
    if (hint) {
      hint.textContent = text || "";
    }
  }

  function setScroller(title, artist) {
    if (opts.setScrollerText) {
      opts.setScrollerText(title, artist);
      return;
    }
    var line = document.getElementById("bgm-scroller");
    if (line) {
      line.textContent = "♪ " + title + " — " + artist;
    }
  }

  function setPlayingUi(on) {
    var root = document.querySelector(".mh-mp3");
    var btn = document.getElementById("bgm-play");
    if (root) {
      root.classList.toggle("is-playing", !!on);
    }
    if (btn) {
      btn.classList.toggle("is-playing", !!on);
      btn.setAttribute("aria-label", on ? "일시정지" : "재생");
      btn.title = on ? "일시정지" : "재생";
    }
  }

  function toast(msg, kind) {
    if (opts.showToast) {
      opts.showToast(msg, kind);
    }
  }

  function searchInvidiousClient(q, key) {
    var i = 0;
    function next() {
      if (i >= INVIDIOUS_INSTANCES.length) {
        return Promise.reject(new Error("yt_search_failed"));
      }
      var base = INVIDIOUS_INSTANCES[i];
      i += 1;
      return fetch(
        base +
          "/api/v1/search?q=" +
          encodeURIComponent(q) +
          "&type=video",
        { method: "GET" }
      )
        .then(function (res) {
          if (!res.ok) {
            throw new Error("invidious_http");
          }
          return res.json();
        })
        .then(function (data) {
          var hit = null;
          if (Array.isArray(data)) {
            for (var j = 0; j < data.length; j++) {
              if (data[j] && data[j].type === "video" && data[j].videoId) {
                hit = data[j];
                break;
              }
            }
          }
          if (!hit) {
            throw new Error("invidious_empty");
          }
          writeYtCache(key, hit.videoId);
          return hit.videoId;
        })
        .catch(function () {
          return next();
        });
    }
    return next();
  }

  function resolveVideoId(title, artist) {
    var key = songKey(title, artist);
    if (YT_ID_MAP[key]) {
      return Promise.resolve(YT_ID_MAP[key]);
    }
    var cache = readYtCache();
    if (cache[key]) {
      return Promise.resolve(cache[key]);
    }
    var q = title + " " + artist;
    if (global.CyShared && typeof CyShared.searchYoutube === "function") {
      return CyShared.searchYoutube(q)
        .then(function (data) {
          if (data && data.videoId) {
            writeYtCache(key, data.videoId);
            return data.videoId;
          }
          throw new Error("server_empty");
        })
        .catch(function () {
          return searchInvidiousClient(q, key);
        });
    }
    return searchInvidiousClient(q, key);
  }

  function ensureYouTubeApi() {
    if (apiReady) {
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      apiQueue.push(resolve);
      if (global.__cyYtApiLoading) {
        return;
      }
      global.__cyYtApiLoading = true;
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      var first = document.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(tag, first);
      global.onYouTubeIframeAPIReady = function () {
        apiReady = true;
        apiQueue.splice(0).forEach(function (fn) {
          fn();
        });
      };
    });
  }

  function createPlayer() {
    if (player) {
      return Promise.resolve(player);
    }
    return ensureYouTubeApi().then(function () {
      return new Promise(function (resolve) {
        player = new global.YT.Player("cy-yt-player", {
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: function (ev) {
              resolve(ev.target);
            },
            onStateChange: function (ev) {
              if (ev.data === global.YT.PlayerState.PLAYING) {
                state.playing = true;
                setPlayingUi(true);
                setHint("유튜브에서 재생 중 ♪");
              } else if (
                ev.data === global.YT.PlayerState.PAUSED ||
                ev.data === global.YT.PlayerState.ENDED
              ) {
                state.playing = false;
                setPlayingUi(false);
                if (ev.data === global.YT.PlayerState.ENDED && opts.getPlaylist) {
                  stepPlaylist(1, true);
                }
              }
            },
            onError: function () {
              state.playing = false;
              state.loading = false;
              setPlayingUi(false);
              toast("재생할 수 없는 곡이에요 ㅠㅠ", "bad");
              setHint("다른 곡을 골라볼까요?");
            },
          },
        });
      });
    });
  }

  function saveSongToPlaylist(song) {
    if (!song || !song.title || song.title === "…" || !opts.getPlaylist || !opts.savePlaylist) {
      return false;
    }
    var arr = opts.getPlaylist();
    var key = songKey(song.title, song.artist);
    var exists = arr.some(function (x) {
      return x.key === key;
    });
    if (exists) {
      return false;
    }
    arr.unshift({
      key: key,
      title: song.title,
      artist: song.artist,
      hint: song.hint || "",
    });
    opts.savePlaylist(arr);
    if (opts.playlistIdxKey) {
      try {
        localStorage.setItem(opts.playlistIdxKey, "0");
      } catch (e) {}
    }
    if (opts.onPlaylistSaved) {
      opts.onPlaylistSaved();
    }
    return true;
  }

  function playSong(song, options) {
    options = options || {};
    if (!song || !song.title || song.title === "…") {
      toast("원소를 먼저 조회해 주세요 ♡", "warn");
      return Promise.resolve();
    }
    var key = songKey(song.title, song.artist);
    if (
      !options.force &&
      state.playing &&
      state.songKey === key &&
      player &&
      player.pauseVideo
    ) {
      player.pauseVideo();
      state.playing = false;
      setPlayingUi(false);
      setHint("일시정지");
      return Promise.resolve();
    }
    if (
      !options.force &&
      !state.playing &&
      state.songKey === key &&
      player &&
      player.playVideo
    ) {
      player.playVideo();
      return Promise.resolve();
    }

    state.loading = true;
    state.song = song;
    state.songKey = key;
    setScroller(song.title, song.artist);
    setHint("유튜브에서 곡 찾는 중…");
    setPlayingUi(false);

    if (!options.skipSave) {
      saveSongToPlaylist(song);
    }

    return resolveVideoId(song.title, song.artist)
      .then(function (videoId) {
        return createPlayer().then(function (p) {
          state.videoId = videoId;
          state.loading = false;
          if (p.loadVideoById) {
            p.loadVideoById(videoId);
          }
          if (options.autoplay !== false && p.playVideo) {
            p.playVideo();
          }
          return videoId;
        });
      })
      .catch(function () {
        state.loading = false;
        state.playing = false;
        setPlayingUi(false);
        setHint("곡을 찾지 못했어요 ㅠㅠ");
        toast("유튜브에서 곡을 찾지 못했어요", "bad");
      });
  }

  function stepPlaylist(step, autoPlay) {
    if (!opts.getPlaylist || !opts.playlistIdxKey) {
      toast("플레이리스트가 비어 있어요", "warn");
      return;
    }
    var arr = opts.getPlaylist();
    if (!arr.length) {
      if (opts.getCurrentSong) {
        playSong(opts.getCurrentSong(), { force: true, skipSave: true });
      } else {
        toast("먼저 ▶로 곡을 재생해 주세요 ♡", "warn");
      }
      return;
    }
    var idx = 0;
    try {
      idx = parseInt(localStorage.getItem(opts.playlistIdxKey) || "0", 10);
    } catch (e) {}
    if (Number.isNaN(idx)) {
      idx = 0;
    }
    idx = (idx + step + arr.length) % arr.length;
    try {
      localStorage.setItem(opts.playlistIdxKey, String(idx));
    } catch (e) {}
    state.playlistIdx = idx;
    var song = arr[idx];
    playSong(song, { force: true, skipSave: true, autoplay: autoPlay !== false });
    if (song.hint) {
      setHint(song.hint);
    }
  }

  function setDisplaySong(song) {
    if (!song || !song.title) {
      return;
    }
    if (state.playing || state.loading) {
      return;
    }
    setScroller(song.title, song.artist);
    setHint(song.hint || "▶ 누르면 유튜브에서 재생");
  }

  function mount(options) {
    opts = options || {};
    var playBtn = document.getElementById("bgm-play");
    var prevBtn = document.getElementById("bgm-prev");
    var nextBtn = document.getElementById("bgm-next");

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        var song = opts.getCurrentSong ? opts.getCurrentSong() : null;
        playSong(song);
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        stepPlaylist(-1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        stepPlaylist(1, true);
      });
    }
  }

  global.CyBgmPlayer = {
    mount: mount,
    playSong: playSong,
    setDisplaySong: setDisplaySong,
    stepPlaylist: stepPlaylist,
    isPlaying: function () {
      return state.playing;
    },
  };
})(typeof window !== "undefined" ? window : global);
