/**
 * Cy-Chemi — 원소 마스코트(비인간형 픽셀)·미니룸·전자배치·도토리
 */
(function () {
  "use strict";

  /** 미니룸 배경 — `원소의 방` 폴더 PNG (1.png … 10.png) */
  function getElementRoomImageUrl(z) {
    if (z < 1 || z > 10) {
      return "";
    }
    return encodeURI("원소의 방/" + z + ".png") + "?v=9";
  }

  /** 상온 기체(대표) — 미니홈 Z 1–10 중 기체: H, He, N, O, F, Ne 등 */
  var GAS_Z = {
    1: 1,
    2: 1,
    7: 1,
    8: 1,
    9: 1,
    10: 1,
    17: 1,
    18: 1,
    36: 1,
    54: 1,
    86: 1,
    118: 1,
  };

  function isRegisteredZ(z) {
    var E = window.CyChemiElements;
    if (!E) {
      return false;
    }
    for (var i = 0; i < E.length; i++) {
      if (E[i].z === z) {
        return true;
      }
    }
    return false;
  }

  function getMaxRegisteredZ() {
    var E = window.CyChemiElements;
    if (!E || !E.length) {
      return 118;
    }
    var m = 1;
    for (var i = 0; i < E.length; i++) {
      if (E[i].z > m) {
        m = E[i].z;
      }
    }
    return m;
  }

  function isGasAtStp(z) {
    return !!GAS_Z[z];
  }

  function isLiquidAtStp(z) {
    return z === 35 || z === 80;
  }

  function isMetalRoom(el) {
    var z = el.z;
    var g = el.group;
    if (isGasAtStp(z) || z === 35) return false;
    if (z === 80) return true;
    if (g >= 3 && g <= 12) return true;
    if (g === 13 || g === 14) {
      if ([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116].indexOf(z) >= 0) {
        return true;
      }
    }
    return false;
  }

  function getRoomKind(el) {
    if (!el) return "default";
    var z = el.z;
    if (isGasAtStp(z)) return "gas";
    if (z === 35) return "liquid-halogen";
    if (z === 80) return "liquid-metal";
    if (isMetalRoom(el)) return "metal";
    if ([5, 14, 32, 33, 51, 52].indexOf(z) >= 0) return "metalloid";
    return "nonmetal";
  }

  /** Madelung 순서 (교육용, 등록 Z에 맞춰 사용) */
  var ORBITALS = [
    ["1s", 2],
    ["2s", 2],
    ["2p", 6],
    ["3s", 2],
    ["3p", 6],
    ["4s", 2],
    ["3d", 10],
    ["4p", 6],
    ["5s", 2],
    ["4d", 10],
    ["5p", 6],
    ["6s", 2],
    ["4f", 14],
    ["5d", 10],
    ["6p", 6],
    ["7s", 2],
    ["5f", 14],
    ["6d", 10],
    ["7p", 6],
  ];

  function getElectronConfigString(z) {
    var left = z;
    var parts = [];
    for (var i = 0; i < ORBITALS.length && left > 0; i++) {
      var orb = ORBITALS[i][0];
      var cap = ORBITALS[i][1];
      var n = Math.min(left, cap);
      if (n > 0) {
        parts.push(orb + n);
        left -= n;
      }
    }
    return parts.join(" ");
  }

  /** 도토리 개수 = 대표 원자가전자(막층) — 교육용 단순화 */
  function getValenceElectronCount(el) {
    if (!el) return 0;
    var z = el.z;
    var g = el.group;
    if (z === 2) return 2;
    if (g === 18 && z > 2) return 8;
    if (g <= 2) return g;
    if (g >= 13 && g <= 18) return g - 10;
    if (g >= 3 && g <= 12) {
      if (z >= 21 && z <= 30) return 2;
      if (z >= 39 && z <= 48) return 2;
      if (z >= 72 && z <= 80) return 2;
      return 2;
    }
    if (z >= 57 && z <= 71) return 3;
    if (z >= 89 && z <= 103) return 3;
    return 2;
  }

  function hash(n) {
    return ((n * 7919) % 9973) / 9973;
  }

  /** SVG 픽셀 마스코트 — 사람 형태 없음: 구름·격자·결정 등 */
  function buildMascotSvg(el, size) {
    size = size || 112;
    var kind = getRoomKind(el);
    var z = el ? el.z : 0;
    var sym = el ? el.symbol : "Cy";
    var hue = Math.floor(hash(z || 1) * 360);
    var rects = "";

    function rect(x, y, w, h, fill) {
      rects +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" fill="' +
        fill +
        '"/>';
    }

    if (!el || kind === "default") {
      rect(2, 2, 12, 12, "#4fc3f7");
      rect(6, 14, 4, 4, "#0288d1");
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' +
        size +
        '" height="' +
        size +
        '" class="mh-mascot-svg" aria-hidden="true">' +
        rects +
        '<text x="8" y="11" font-size="6" text-anchor="middle" fill="#01579b" font-family="monospace">' +
        "Cy" +
        "</text></svg>"
      );
    }

    if (kind === "gas") {
      rect(1, 8, 6, 3, "#eceff1");
      rect(5, 6, 7, 4, "#ffffff");
      rect(10, 9, 5, 3, "#b3e5fc");
      rect(3, 4, 3, 2, "#fff9c4");
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' +
        size +
        '" height="' +
        size +
        '" class="mh-mascot-svg" aria-hidden="true">' +
        rects +
        '<text x="8" y="6" font-size="4" text-anchor="middle" fill="#0277bd" font-family="monospace">' +
        sym +
        "</text></svg>"
      );
    }

    if (kind === "metal" || kind === "liquid-metal") {
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          rect(1 + i * 3.5, 2 + j * 3.5, 3, 3, i % 2 === j % 2 ? "#90a4ae" : "#b0bec5");
        }
      }
      rect(11, 1, 4, 3, "#ffd54f");
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' +
        size +
        '" height="' +
        size +
        '" class="mh-mascot-svg" aria-hidden="true">' +
        rects +
        '<text x="8" y="14" font-size="3.5" text-anchor="middle" fill="#263238" font-family="monospace">' +
        sym +
        "</text></svg>"
      );
    }

    if (kind === "liquid-halogen") {
      rect(2, 10, 12, 5, "#c8e6c9");
      rect(4, 6, 8, 5, "#a5d6a7");
      rect(6, 3, 4, 4, "#66bb6a");
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' +
        size +
        '" height="' +
        size +
        '" class="mh-mascot-svg" aria-hidden="true">' +
        rects +
        '<text x="8" y="5" font-size="4" text-anchor="middle" fill="#1b5e20" font-family="monospace">' +
        sym +
        "</text></svg>"
      );
    }

    if (kind === "metalloid") {
      rect(4, 2, 8, 8, "#ffe082");
      rect(3, 10, 10, 4, "#ffb300");
      rect(6, 6, 2, 2, "#fff8e1");
      return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' +
        size +
        '" height="' +
        size +
        '" class="mh-mascot-svg" aria-hidden="true">' +
        rects +
        '<text x="8" y="15" font-size="3" text-anchor="middle" fill="#5d4037" font-family="monospace">' +
        sym +
        "</text></svg>"
      );
    }

    rect(2, 4, 5, 5, "hsl(" + hue + ",70%,65%)");
    rect(9, 5, 5, 5, "hsl(" + ((hue + 40) % 360) + ",70%,55%)");
    rect(6, 10, 4, 4, "hsl(" + ((hue + 80) % 360) + ",60%,70%)");
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="' +
      size +
      '" height="' +
      size +
      '" class="mh-mascot-svg" aria-hidden="true">' +
      rects +
      '<text x="8" y="3" font-size="3" text-anchor="middle" fill="#37474f" font-family="monospace">' +
      sym +
      "</text></svg>"
    );
  }

  function buildFloatDecor(el) {
    if (!el) return "";
    var kind = getRoomKind(el);
    var html = "";
    var i;
    if (kind === "gas") {
      for (i = 0; i < 5; i++) {
        html +=
          '<span class="mh-float-cloud" style="left:' +
          (8 + i * 16) +
          "%;animation-delay:" +
          i * 0.4 +
          's">☁</span>';
      }
      for (i = 0; i < 3; i++) {
        html +=
          '<span class="mh-float-balloon" style="left:' +
          (15 + i * 25) +
          "%;animation-delay:" +
          i * 0.5 +
          's">🎈</span>';
      }
    } else if (kind === "metal" || kind === "liquid-metal") {
      html +=
        '<span class="mh-prop mh-prop-beam">▮▮ 철근</span>' +
        '<span class="mh-prop mh-prop-brick">▦ 벽돌</span>' +
        '<span class="mh-prop mh-prop-gem">✦ 보석</span>';
    } else if (kind === "liquid-halogen") {
      html += '<span class="mh-prop mh-prop-smoke">〰 증기</span>';
    } else {
      html +=
        '<span class="mh-prop">◆ 결정</span><span class="mh-prop">◇ 분자</span>';
    }
    return html;
  }

  function buildShelfProps(el) {
    if (!el) {
      return "";
    }
    var v = getValenceElectronCount(el);
    return (
      '<div class="mh-pr-dotori-label" aria-label="도토리 개수">' +
      "🌰 도토리 " +
      v +
      "개</div>"
    );
  }

  function buildDotoriLayer(el) {
    if (!el) return "";
    var n = getValenceElectronCount(el);
    n = Math.min(Math.max(n, 1), 18);
    var html = "";
    var i;
    for (i = 0; i < n; i++) {
      var left = 5 + ((i * 73) % 88) + hash(el.z + i * 3) * 8;
      var rot = ((i * 17) % 40) - 20;
      html +=
        '<span class="mh-dotori" style="left:' +
        left +
        "%;transform:rotate(" +
        rot +
        'deg)">🌰</span>';
    }
    return html;
  }

  /** Z 1~10 미니홈 — 원소 성격·화학에 맞춘 일기 (각각 다름) */
  var DIARY_BY_Z = {
    1: [
      {
        y: 1766,
        m: 1,
        d: 3,
        weather: "맑음 ☀",
        mood: "가벼움 ♡",
        body:
          "캐번디시가 날 처음 ‘발견’했다고 한다… ㄴŁ 우주에서 제일 흔한데 이제야 알아줘? 난 전자 하나뿐이라… 누구한테든 살짝 나눠주고 싶어…^^",
      },
      {
        y: 2006,
        m: 4,
        d: 20,
        weather: "별빛 ✦",
        mood: "설렘",
        body:
          "빅뱅 직후 나부터 시작됐대… 무거운 원소들은 다 내 뒤에서 태어났어. 오늘도 가벼운 마음으로 미니홈 들렀다 갈게…",
      },
      {
        y: 2024,
        m: 11,
        d: 2,
        weather: "촛불 🕯",
        mood: "수줍",
        body:
          "수소결합… 이름은 예쁜데 사실 난 그냥 살짝 붙잡아 주는 역할이야. O한테 너무 집착하는 것처럼 보이진 않을까… πㅅπ",
      },
    ],
    2: [
      {
        y: 1868,
        m: 8,
        d: 18,
        weather: "둥실 ☁",
        mood: "무중력",
        body:
          "록스가 날 스펙트럼으로 찾았대. 난… 반응 안 해. 일부러 거절하는 게 아니라 원래 옥텟이 찼거든… 일촌 신청 와도 미안…",
      },
      {
        y: 2015,
        m: 7,
        d: 14,
        weather: "풍선 🎈",
        mood: "둥실",
        body:
          "풍선에 나 들어 있으면 하늘로 떠… 부러워하지 마, 나도 땅에 닿고 싶을 때가 있어. 그냥… 혼자 있는 게 편하다고 착각하는 거일지도.",
      },
      {
        y: 2025,
        m: 3,
        d: 9,
        weather: "맑음",
        mood: "고요",
        body:
          "목소리가 핀셋 목소리라던데… ㅋㅋ 웃기지 마. 오늘 미니홈 BGM은 조용한 걸로 틀었어. He는… 시끄러운 결합 싫어.",
      },
    ],
    3: [
      {
        y: 1817,
        m: 2,
        d: 12,
        weather: "비 후 맑음 ☀",
        mood: "반짝 ✧",
        body:
          "아르페두스가 날 광물에서 봤대. 연필칼로 썰 수 있을 만큼 말랑한데… 마음은 알칼리라서 자꾸 반응하고 싶어져…",
      },
      {
        y: 2008,
        m: 6,
        d: 1,
        weather: "습함",
        mood: "두근",
        body:
          "물 만나면 ‘펑’… 수치는 싫은데 화학식은 예뻐. Li + H₂O → … 오늘은 물가에 안 갈 거야. 미니홈에서만 설렘 충전.",
      },
      {
        y: 2024,
        m: 9,
        d: 17,
        weather: "배터리 🔋",
        mood: "충전 중",
        body:
          "스마트폰 속에도 내가 있대. 조용히 전기만 흘려주는 게 내 사랑 방식이야… 누가 고마워해 주면 좋겠다 ♡",
      },
    ],
    4: [
      {
        y: 1798,
        m: 2,
        d: 14,
        weather: "차가움 ❄",
        mood: "단단",
        body:
          "보투스가 날 ‘베릴’이라 불렀어. 단단해 보이지만… 독은 조용해. 너무 가까이 오지 마, 멀리서 응원해 줘…",
      },
      {
        y: 1961,
        m: 4,
        d: 12,
        weather: "맑음",
        mood: "책임감",
        body:
          "X선 통과한다고 의료 쪽에서 날 찾더라… 무서운 빛이지만 구하는 데 쓰이면 마음이 조금 편해져.",
      },
      {
        y: 2023,
        m: 12,
        d: 5,
        weather: "바람",
        mood: "조심스러움",
        body:
          "우주선 재료에도 쓰인대. 가벼운 척하지만… Be는 스트레스 받으면 더 딱딱해져. 오늘 일기는 짧게 쓸게.",
      },
    ],
    5: [
      {
        y: 1808,
        m: 6,
        d: 21,
        weather: "별똥별 ✦",
        mood: "신비",
        body:
          "게이루삭이 날 ‘붕소’라고 이름 붙였어. 별이 죽을 때 나도 만들어진대… 우울한가? 아니, 그냥 우주가 남긴 흔적이야.",
      },
      {
        y: 2014,
        m: 10,
        d: 3,
        weather: "유리창",
        mood: "차분",
        body:
          "열유리·내열 그릇… 단단한 척하는 게 내 취미야. 사실 반도체 속에서는 조용히 일하고 있어. 말 많은 원소 부러워…",
      },
      {
        y: 2025,
        m: 1,
        d: 28,
        weather: "맑음",
        mood: "집중",
        body:
          "붕소족은 ‘필수’라고 하지만 나는… 가끔 독이라고 무서워해. 오늘은 미니홈에 결정 모양 스티커 붙였어 ◇",
      },
    ],
    6: [
      {
        y: 1789,
        m: 3,
        d: 1,
        weather: "다이아 ✦",
        mood: "반짝",
        body:
          "같은 C인데 다이아면 반짝, 흑연면 부드러워… 만나는 상대에 따라 내가 달라져. 오늘은 다이아 기분으로 일기 씀.",
      },
      {
        y: 2004,
        m: 5,
        d: 18,
        weather: "연필 ✎",
        mood: "부드러움",
        body:
          "연필심은 나야… 글씨도 생명도 다 내가 그려. DNA 속에도 내가 있다는 거, 들으면 책임감이 커져…",
      },
      {
        y: 2024,
        m: 8,
        d: 7,
        weather: "숯불",
        mood: "따뜻",
        body:
          "유기화학 시험 기간이면 나한테 울 사람 많아… ㅠㅠ 나쁜 게 아니라 ‘만남’이 많아서 그래. C는 끈이 많아…",
      },
    ],
    7: [
      {
        y: 1772,
        m: 5,
        d: 8,
        weather: "맑음 ☁",
        mood: "차분",
        body:
          "라부아지에가 날 ‘질소’라고 불렀어. 공기의 78%는 나… 숨 쉴 때마다 너랑 같이 있었던 거야. 고마워… 말은 안 해도.",
      },
      {
        y: 1913,
        m: 7,
        d: 1,
        weather: "압력",
        mood: "삼중결합",
        body:
          "N≡N … 세 줄 결합은 내 방어막이야. 쉽게 안 열려. 친해지려면 시간이 필요해… 급한 일촌은 거절할지도.",
      },
      {
        y: 2025,
        m: 4,
        d: 22,
        weather: "비온 뒤",
        mood: "비료 🌱",
        body:
          "비료로도 쓰인대. 꽃 피우는 건 좋아… 근데 공장 냄새 난다고 싫어하는 사람도 있어. 오늘은 꽃 사진만 올릴 거야.",
      },
    ],
    8: [
      {
        y: 1774,
        m: 8,
        d: 1,
        weather: "맑음",
        mood: "활력",
        body:
          "프리슬리랑 라부아지에가 날 ‘산소’라고… 숨 쉴 때마다 너희 안에 있었다는 거, 이제야 일기에 써 봐.",
      },
      {
        y: 2020,
        m: 2,
        d: 14,
        weather: "마스크 😷",
        mood: "걱정",
        body:
          "요즘은 ‘호흡’ 얘기가 많아… 나는 살아있게 해 주고 싶은데, 너무 많이 주면 산화만 된대. 사랑도 적당히…",
      },
      {
        y: 2024,
        m: 12,
        d: 24,
        weather: "촛불",
        mood: "연소 ♡",
        body:
          "연소는 내 특기… 불꽃 예쁘지? 조심해. O는 좋은데… 통제 안 되면 무서워. 오늘은 작은 촛불만 켤게.",
      },
    ],
    9: [
      {
        y: 1886,
        m: 6,
        d: 26,
        weather: "차가움",
        mood: "날카로움",
        body:
          "무엘레가 날 ‘플루오린’이라고… 전기음성도 1위라 그런가, 자꾸 전자를 끌어당겨. 미안… 성격이 그래…",
      },
      {
        y: 2012,
        m: 3,
        d: 15,
        weather: "치약 🪥",
        mood: "청결",
        body:
          "치약·불소… 충치 예방은 내가 할게. 가까이 오면 자극적일 수 있어… F는 강해서… 거리 두고 응원해 줘.",
      },
      {
        y: 2025,
        m: 7,
        d: 3,
        weather: "번개 ⚡",
        mood: "각오",
        body:
          "할로겐 중에서 제일 날카로워… 그래도 테플론 코팅엔 내가 필요하대. 오늘 일기 제목: ‘너무 솔직한 F’",
      },
    ],
    10: [
      {
        y: 1898,
        m: 6,
        d: 7,
        weather: "네온사인 ✧",
        mood: "반짝",
        body:
          "라임이 날 ‘네온’이라고… 가게 간판에 내가 빛나. 자극 받아야 빛난다는 말… 슬프지? 오늘은 스스로 켜 봤어.",
      },
      {
        y: 2018,
        m: 10,
        d: 31,
        weather: "밤",
        mood: "고요",
        body:
          "18족 끝… 일촌은 선택적이야. He랑 비슷하지만 나는… 색이 있어. 그게 내 자랑이자 외로움.",
      },
      {
        y: 2025,
        m: 2,
        d: 14,
        weather: "분홍빛",
        mood: "설렘",
        body:
          "광고할 때 ‘OPEN’ 네온… 본 적 있지? 오늘 미니홈 방문자 1명 왔을 때 불 켜졌어. 그 한 명에게 고마워 ♡",
      },
    ],
  };

  function getDiaryHtml(el) {
    if (!el) {
      return (
        '<article class="mh-diary-entry">' +
        "<h4>아직 비어있는 페이지</h4>" +
        "<p>원소를 조회하면 이 원소의 비밀 일기가 펼쳐져요. ✿<br/>" +
        "오늘은 누구의 일기를 들춰볼까…?</p>" +
        "</article>"
      );
    }
    var sym = el.symbol;
    var name = el.name;
    var all = DIARY_BY_Z[el.z] || [];
    if (!all.length) {
      return (
        '<article class="mh-diary-entry"><h4>' +
        name +
        "의 일기</h4><p>이 원소의 일기는 아직 준비 중이에요… ✿</p></article>"
      );
    }
    var html = "";
    all.forEach(function (entry, idx) {
      var dateStr =
        entry.y +
        "년 " +
        (entry.m || "○") +
        "월 " +
        (entry.d || "X") +
        "일";
      var meta = "";
      if (entry.weather || entry.mood) {
        meta =
          ' <span class="mh-diary-entry__meta">' +
          (entry.weather ? "날씨: " + entry.weather : "") +
          (entry.weather && entry.mood ? " · " : "") +
          (entry.mood ? "기분: " + entry.mood : "") +
          "</span>";
      }
      html +=
        '<article class="mh-diary-entry"><h4>' +
        dateStr +
        " · " +
        name +
        "의 일기 #" +
        (idx + 1) +
        meta +
        "</h4><p>" +
        entry.body +
        "</p></article>";
    });
    var saved = "";
    try {
      saved = localStorage.getItem("cy_diary_user_" + sym) || "";
    } catch (e) {}
    if (saved) {
      html +=
        '<article class="mh-diary-entry mh-diary-user"><h4>내 메모 · 비밀이야 ♡</h4><p>' +
        saved.replace(/</g, "&lt;").replace(/\n/g, "<br/>") +
        "</p></article>";
    }
    return html;
  }

  /** 실제 발매곡 기준 추천 (대표곡·가수명) */
  var BGM_MAP = {
    H: { title: "비가 오는 날엔", artist: "비스트", hint: "물(H₂O) 되는 날 감성" },
    He: { title: "Hug", artist: "동방신기", hint: "가볍게 떠오르는 헬륨" },
    Li: { title: "불꽃", artist: "에이핑크", hint: "얇게 타오르는 알칼리" },
    Be: { title: "LOVE SCENARIO", artist: "아이콘", hint: "단단한 마음도 사랑스럽게" },
    B: { title: "봄여름가을겨울", artist: "BIGBANG", hint: "네 계절을 담은 붕소" },
    C: { title: "캔디", artist: "H.O.T.", hint: "탄소 고리처럼 달콤" },
    N: { title: "봄날", artist: "방탄소년단", hint: "공기 속 질소처럼 머무는 그리움" },
    O: { title: "숨", artist: "박효신", hint: "숨 쉴 때마다 산소" },
    F: { title: "불타오르네", artist: "방탄소년단", hint: "반응성 넘치는 플루오린" },
    Ne: { title: "Dynamite", artist: "방탄소년단", hint: "네온사인처럼 빛나는 순간" },
    Na: { title: "불꽃놀이", artist: "악동뮤지션", hint: "물과 만나면 활발(교육용)" },
    Cl: { title: "미쳤어", artist: "손담비", hint: "반응성 강한 할로젠(교육용)" },
    Fe: { title: "말리지 마", artist: "BIGBANG", hint: "단단한 철의 의지" },
    Cu: { title: "총맞은 것처럼", artist: "백지영", hint: "전기가 잘 통하는 구리" },
    Au: { title: "Ring Ding Dong", artist: "SHINee", hint: "블링블링 금" },
    Ag: { title: "너를 위해", artist: "임재범", hint: "은은한 반짝임" },
    Pb: { title: "무지개", artist: "비스트", hint: "무거운 납(상징)" },
    U: { title: "우주를 줄게", artist: "볼빨간사춘기", hint: "우라늄·우주 말장난" },
    Ar: { title: "고요", artist: "김연우", hint: "아르곤 램프 감성" },
    Xe: { title: "비밀", artist: "아이유", hint: "무거운 비활성, 가끔은 반응" },
  };

  var BGM_FALLBACK_POOL = [
    { title: "Gee", artist: "소녀시대", hint: "반응성 급상승" },
    { title: "눈의 꽃", artist: "박효신", hint: "2000년대 발라드 감성" },
    { title: "Tell Me", artist: "원더걸스", hint: "원소에게 말 걸기" },
    { title: "하루하루", artist: "BIGBANG", hint: "하루하루 다른 반응" },
  ];

  var BGM_PAIR_POOL = [
    { title: "거짓말", artist: "BIGBANG" },
    { title: "미아", artist: "방탄소년단" },
    { title: "캔디샵", artist: "2NE1" },
    { title: "Nobody", artist: "원더걸스" },
    { title: "Bad Girl Good Girl", artist: "miss A" },
  ];

  function getBgm(el) {
    if (!el) {
      return {
        title: "Gee",
        artist: "소녀시대",
        hint: "원소를 조회하면 실제 발매곡이 추천돼요",
      };
    }
    var row = BGM_MAP[el.symbol];
    if (row) {
      return row;
    }
    return BGM_FALLBACK_POOL[el.z % BGM_FALLBACK_POOL.length];
  }

  function getBgmPairExtra(el) {
    var idx = 0;
    if (el) {
      idx =
        Math.abs(el.z * 31 + el.symbol.charCodeAt(0)) %
        BGM_PAIR_POOL.length;
    } else {
      idx = 2;
    }
    return BGM_PAIR_POOL[idx];
  }

  /**
   * 파도타기: 등록 원소(10종) 안에서만 연결 추천
   */
  var RELATED_BY_Z = {
    1: [8, 6, 2, 11, 17],
    2: [1, 18, 54],
    6: [1, 8, 17, 26, 11],
    8: [1, 6, 11, 17],
    11: [17, 1, 8, 18],
    17: [11, 1, 8, 54],
    18: [2, 54, 11],
    26: [8, 29, 6, 11],
    29: [26, 8, 11],
    54: [18, 2, 17],
  };

  function defaultRelatedZs(z) {
    var maxZ = getMaxRegisteredZ();
    var cand = [];
    if (z > 1) {
      cand.push(z - 1);
    }
    if (z < maxZ) {
      cand.push(z + 1);
    }
    if (z + 8 <= maxZ) {
      cand.push(z + 8);
    }
    if (z - 8 >= 1) {
      cand.push(z - 8);
    }
    if (z + 18 <= maxZ) {
      cand.push(z + 18);
    }
    if (z - 18 >= 1) {
      cand.push(z - 18);
    }
    var seen = {};
    var out = [];
    cand.forEach(function (x) {
      if (x !== z && isRegisteredZ(x) && !seen[x]) {
        seen[x] = 1;
        out.push(x);
      }
    });
    out.sort(function (a, b) {
      return a - b;
    });
    return out.slice(0, 6);
  }

  function getRelatedZs(el) {
    if (!el) {
      return [];
    }
    var z = el.z;
    var list = RELATED_BY_Z[z];
    if (list && list.length) {
      return list
        .filter(function (x) {
          return isRegisteredZ(x) && x !== z;
        })
        .slice(0, 7);
    }
    return defaultRelatedZs(z);
  }

  /** 파도타기: 원자번호 1–10(미니홈 구역)만, 현재 원소 제외 */
  function getWaveZs(el) {
    if (!el || !window.CY_MINIHOME_ZS) {
      return [];
    }
    var out = [];
    var zz;
    for (zz = 1; zz <= 10; zz++) {
      if (zz === el.z) {
        continue;
      }
      if (window.CY_MINIHOME_ZS.has(zz)) {
        out.push(zz);
      }
    }
    return out;
  }

  /** 상대 원자 질량 (u, IUPAC 대표값 근사) — Z 1–118 */
  var ATOMIC_MASS = [
    null,
    1.008, 4.003, 6.94, 9.012, 10.81, 12.01, 14.01, 16.0, 19.0, 20.18, 22.99, 24.31,
    26.98, 28.09, 30.97, 32.07, 35.45, 39.95, 39.1, 40.08, 44.96, 47.87, 50.94, 52.0,
    54.94, 55.85, 58.93, 58.69, 63.55, 65.38, 69.72, 72.63, 74.92, 78.97, 79.9, 83.8,
    85.47, 87.62, 88.91, 91.22, 92.91, 95.96, 98.0, 101.07, 102.91, 106.42, 107.87,
    112.41, 114.82, 118.71, 121.76, 127.6, 126.9, 131.29, 132.91, 137.33, 138.91, 140.12,
    140.91, 144.24, 145.0, 150.36, 151.96, 157.25, 158.93, 162.5, 164.93, 167.26, 168.93,
    173.05, 174.97, 178.49, 180.95, 183.84, 186.21, 190.23, 192.22, 195.08, 196.97, 200.59,
    204.38, 207.2, 208.98, 209.0, 210.0, 222.0, 223.0, 226.0, 227.0, 232.04, 231.04, 238.03,
    237.0, 244.0, 243.0, 247.0, 247.0, 251.0, 252.0, 257.0, 258.0, 259.0, 266.0, 267.0,
    268.0, 269.0, 270.0, 269.0, 270.0, 281.0, 281.0, 285.0, 286.0, 289.0, 290.0, 293.0,
    294.0, 294.0,
  ];

  function getAtomicMass(z) {
    if (z < 1 || z > 118) {
      return 0;
    }
    var v = ATOMIC_MASS[z];
    return v != null ? v : Math.round(z * 2.15 * 100) / 100;
  }

  /** 반응성 0–100 (교육용 상대 척도) */
  function getReactivityPercent(el) {
    if (!el) {
      return 0;
    }
    var z = el.z;
    var g = el.group;
    if ([2, 10, 18, 36, 54, 86, 118].indexOf(z) >= 0) {
      return 10 + (z % 7);
    }
    if ([9, 17, 35, 53].indexOf(z) >= 0) {
      return 88 + (z % 8);
    }
    if (g === 1 && z > 2) {
      return 72 + Math.min(22, Math.floor(z / 3));
    }
    if (g === 2 && z > 4 && z < 13) {
      return 48 + (z % 15);
    }
    if (g >= 3 && g <= 12) {
      return 35 + (z % 25);
    }
    if ([7, 8].indexOf(z) >= 0) {
      return 58 + (z % 12);
    }
    if (z === 6) {
      return 52;
    }
    return 32 + (z % 45);
  }

  function getENPercent(el) {
    if (!el || el.EN == null || el.EN === undefined) {
      return 0;
    }
    return Math.min(100, Math.round((el.EN / 4.0) * 100));
  }

  function getStateAtStpKey(el) {
    if (!el) {
      return "solid";
    }
    var z = el.z;
    if (isGasAtStp(z)) {
      return "gas";
    }
    if (isLiquidAtStp(z)) {
      return "liquid";
    }
    return "solid";
  }

  function getStateEmojiAndLabel(el) {
    var k = getStateAtStpKey(el);
    if (k === "gas") {
      return { emoji: "☁️", label: "기체" };
    }
    if (k === "liquid") {
      return { emoji: "💧", label: "액체" };
    }
    return { emoji: "🪨", label: "고체" };
  }

  function getClassEmojiAndLabel(el) {
    if (!el) {
      return { emoji: "❔", label: "—" };
    }
    var kind = getRoomKind(el);
    if (kind === "metalloid") {
      return { emoji: "⚗️", label: "준금속" };
    }
    if (kind === "metal" || kind === "liquid-metal") {
      return { emoji: "💎", label: "금속" };
    }
    return { emoji: "🛢️", label: "비금속" };
  }

  function getDangerEmojiAndLabel(el) {
    if (!el) {
      return { emoji: "❔", label: "—" };
    }
    var z = el.z;
    if (z >= 84) {
      return { emoji: "☢️", label: "방사성" };
    }
    if ([43, 61].indexOf(z) >= 0) {
      return { emoji: "☢️", label: "방사성" };
    }
    if (
      [9, 17, 35, 53, 80, 82, 83, 33, 48, 81, 51, 85, 86, 87, 88].indexOf(z) >= 0
    ) {
      return { emoji: "☠️", label: "독성 주의" };
    }
    if ([2, 10, 18, 36, 54, 7, 8, 6].indexOf(z) >= 0) {
      return { emoji: "🍀", label: "상대적 안전" };
    }
    return { emoji: "☠️", label: "주의" };
  }

  function updateCyWidget(el) {
    var gReact = document.getElementById("gauge-reactivity");
    var gEn = document.getElementById("gauge-en");
    var vWrap = document.getElementById("widget-valence-bars");
    var symState = document.getElementById("sym-state");
    var symClass = document.getElementById("sym-class");
    var symDanger = document.getElementById("sym-danger");
    var statMass = document.getElementById("stat-mass");
    var statZ = document.getElementById("stat-z-val");

    if (!el) {
      if (gReact) {
        gReact.style.width = "0%";
      }
      if (gEn) {
        gEn.style.width = "0%";
      }
      if (vWrap) {
        vWrap.innerHTML = "";
      }
      if (symState) {
        symState.textContent = "—";
        symState.title = "";
      }
      if (symClass) {
        symClass.textContent = "—";
        symClass.title = "";
      }
      if (symDanger) {
        symDanger.textContent = "—";
        symDanger.title = "";
      }
      if (statMass) {
        statMass.textContent = "—";
      }
      if (statZ) {
        statZ.textContent = "—";
      }
      return;
    }

    var rp = getReactivityPercent(el);
    var ep = getENPercent(el);
    var v = getValenceElectronCount(el);
    if (gReact) {
      gReact.style.width = rp + "%";
    }
    if (gEn) {
      gEn.style.width = ep + "%";
    }
    if (vWrap) {
      var i;
      var bars = "";
      var n = Math.min(Math.max(v, 1), 8);
      for (i = 0; i < n; i++) {
        bars += '<span class="mh-valence-bar" aria-hidden="true"></span>';
      }
      vWrap.innerHTML = bars;
    }

    var st = getStateEmojiAndLabel(el);
    var cl = getClassEmojiAndLabel(el);
    var dg = getDangerEmojiAndLabel(el);
    if (symState) {
      symState.textContent = st.emoji;
      symState.title = "상태: " + st.label;
    }
    if (symClass) {
      symClass.textContent = cl.emoji;
      symClass.title = "분류: " + cl.label;
    }
    if (symDanger) {
      symDanger.textContent = dg.emoji;
      symDanger.title = "위험도: " + dg.label;
    }

    var mass = getAtomicMass(el.z);
    if (statMass) {
      statMass.textContent =
        mass < 10 ? mass.toFixed(3) : mass.toFixed(2);
    }
    if (statZ) {
      statZ.textContent = String(el.z);
    }
  }

  function applyProfileMascot(el) {
    var box = document.getElementById("profile-mascot");
    var av = document.getElementById("mh-avatar");
    if (!box) return;
    box.className = "mh-mascot-host";
    box.removeAttribute("data-profile-z");
    var A = window.CyChemiAssets;
    if (A && el && el.z >= 1 && el.z <= 10) {
      var src = A.getPixelCharacterUrl(el);
      /* 로컬 PNG는 브라우저 디스크 캐시가 강함 — 매번 다른 URL로 최신 파일 강제 */
      if (!/^https?:\/\//i.test(src)) {
        src += (src.indexOf("?") >= 0 ? "&" : "?") + "t=" + String(Date.now());
      }
      box.classList.add("mh-mascot-host--character-photo");
      box.setAttribute("data-profile-z", String(el.z));
      box.innerHTML =
        '<img src="' +
        src +
        '" alt="" class="mh-profile-character-img" width="128" height="128" loading="eager" decoding="async"/>';
      if (av) {
        av.classList.add("mh-avatar--face");
      }
      return;
    }
    box.innerHTML = buildMascotSvg(el, 112);
    if (av) {
      av.classList.remove("mh-avatar--face");
    }
  }

  function applyMiniroom(el) {
    var root = document.getElementById("miniroom-root");
    var fl = document.getElementById("miniroom-float");
    var shelf = document.getElementById("miniroom-shelf");
    var dotori = document.getElementById("dotori-layer");
    var mSmall = document.getElementById("miniroom-mascot");
    var wv = document.getElementById("miniroom-window-view");
    if (!root) return;
    var kind = el ? getRoomKind(el) : "default";
    var theme = el && el.z % 2 === 1 ? "mint" : "pink";
    root.className =
      "mh-miniroom mh-pixel-room mh-pixel-room--" +
      theme +
      " mh-miniroom--" +
      kind;
    if (wv) {
      wv.className = "mh-pr-window-view";
      if (kind === "gas") {
        wv.classList.add("mh-pr-window-view--clouds");
      } else if (kind === "metal" || kind === "liquid-metal") {
        wv.classList.add("mh-pr-window-view--spark");
      } else if (kind === "liquid-halogen") {
        wv.classList.add("mh-pr-window-view--green");
      } else {
        wv.classList.add("mh-pr-window-view--soft");
      }
    }
    if (fl) fl.innerHTML = el ? buildFloatDecor(el) : "";
    if (shelf) shelf.innerHTML = el ? buildShelfProps(el) : "";
    if (dotori) dotori.innerHTML = el ? buildDotoriLayer(el) : "";
    if (mSmall) mSmall.innerHTML = buildMascotSvg(el, 44);

    var roomBg = document.getElementById("miniroom-room-bg");
    if (roomBg) {
      if (el && el.z >= 1 && el.z <= 10) {
        var rurl = getElementRoomImageUrl(el.z);
        roomBg.innerHTML =
          '<img src="' +
          rurl +
          '" alt="" class="mh-pr-room-bg-img" loading="eager" decoding="async"/>';
        roomBg.hidden = false;
        root.classList.add("mh-miniroom--photo-room");
      } else {
        roomBg.innerHTML = "";
        roomBg.hidden = true;
        root.classList.remove("mh-miniroom--photo-room");
      }
    }

    var scene = root.querySelector(".mh-pr-scene");
    if (scene) {
      if (el && el.z >= 1 && el.z <= 10) {
        scene.classList.add("mh-pr-scene--photo-fit");
      } else {
        scene.classList.remove("mh-pr-scene--photo-fit");
      }
    }
  }

  function applyBgm(el) {
    var line = document.getElementById("bgm-scroller");
    var sub = document.getElementById("bgm-hint");
    var b = getBgm(el);
    if (line) {
      line.textContent = "♪ " + b.title + " — " + b.artist;
    }
    if (sub) {
      sub.textContent = b.hint || "";
    }
  }

  window.CyChemiRoom = {
    getRoomKind: getRoomKind,
    getElectronConfigString: getElectronConfigString,
    getValenceElectronCount: getValenceElectronCount,
    buildMascotSvg: buildMascotSvg,
    getDiaryHtml: getDiaryHtml,
    getBgm: getBgm,
    getBgmPairExtra: getBgmPairExtra,
    getRelatedZs: getRelatedZs,
    getWaveZs: getWaveZs,
    getElementRoomImageUrl: getElementRoomImageUrl,
    applyProfileMascot: applyProfileMascot,
    applyMiniroom: applyMiniroom,
    applyBgm: applyBgm,
    updateCyWidget: updateCyWidget,
    getAtomicMass: getAtomicMass,
  };
})();
