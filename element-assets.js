/**
 * Cy-Chemi — 원소별 시각 자산 & 미니홈 문구
 * - 캐릭터: DiceBear pixel-art (MIT, api.dicebear.com)
 * - 구조·실물 사진: Wikimedia Commons (썸네일 직링크, 교육용 표기)
 */

(function () {
  "use strict";

  /**
   * 원소별 대표 이미지(금속 시료, 방전관, 결정 등) — 없으면 풀에서 순환
   * 출처: Wikimedia Commons (파일명 기준)
   */
  var STRUCTURE_BY_Z = {
    1: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Emission_spectrum-H.svg/280px-Emission_spectrum-H.svg.png",
      cap: "수소(H) 방출 스펙트럼(개념도) · Commons",
    },
    2: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Helium_discharge_tube.jpg/200px-Helium_discharge_tube.jpg",
      cap: "헬륨(He) 방전관 발광 · Commons",
    },
    3: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Lithium_paraffin.jpg/200px-Lithium_paraffin.jpg",
      cap: "리튬(Li) 금속 시료(파라핀 중) · Commons",
    },
    4: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Beryllium_nuggets.jpg/200px-Beryllium_nuggets.jpg",
      cap: "베릴륨(Be) 조각 시료 · Commons",
    },
    5: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Boron_m.jpg/200px-Boron_m.jpg",
      cap: "붕소(B) 고체 시료 · Commons",
    },
    6: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Diamond.jpg/200px-Diamond.jpg",
      cap: "탄소(C) — 다이아몬드(육방 정계) · Commons",
    },
    7: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Liquid_nitrogen.jpg/200px-Liquid_nitrogen.jpg",
      cap: "질소(N) — 액체 질소 · Commons",
    },
    8: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Liquid_oxygen_in_a_beaker_2.jpg/200px-Liquid_oxygen_in_a_beaker_2.jpg",
      cap: "산소(O) — 액체 산소 · Commons",
    },
    9: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Fluorine_discharge_tube.jpg/200px-Fluorine_discharge_tube.jpg",
      cap: "플루오린(F) 방전관 · Commons",
    },
    10: {
      url: encodeURI("원소 캐릭터/10.png") + "?v=17",
      cap: "네온(Ne) 캐릭터 일러스트 (원소 캐릭터/10.png)",
    },
    11: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sodium_metal.jpg/200px-Sodium_metal.jpg",
      cap: "나트륨(Na) 금속 · Commons",
    },
    12: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Magnesium_crystal.jpg/200px-Magnesium_crystal.jpg",
      cap: "마그네슘(Mg) 결정 · Commons",
    },
    13: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Aluminium.jpg/200px-Aluminium.jpg",
      cap: "알루미늄(Al) 금속 시료 · Commons",
    },
    14: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Silicon.jpg/200px-Silicon.jpg",
      cap: "규소(Si) 시료 · Commons",
    },
    15: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/White_phosphorus_with_reddish_impurities.jpg/200px-White_phosphorus_with_reddish_impurities.jpg",
      cap: "인(P) — 백린 시료 · Commons",
    },
    16: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Sulfur_sample.jpg/200px-Sulfur_sample.jpg",
      cap: "황(S) 시료 · Commons",
    },
    17: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Chlorine_ampoule.jpg/200px-Chlorine_ampoule.jpg",
      cap: "염소(Cl) — 앰플 속 기체 · Commons",
    },
    18: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Argon_discharge_tube.jpg/200px-Argon_discharge_tube.jpg",
      cap: "아르곤(Ar) 방전관 · Commons",
    },
    54: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Xenon_discharge_tube.jpg/200px-Xenon_discharge_tube.jpg",
      cap: "제논(Xe) 방전관 발광 · Commons",
    },
    19: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Potassium_metal.jpg/200px-Potassium_metal.jpg",
      cap: "칼륨(K) 금속 시료 · Commons",
    },
    20: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Calcium_unter_Argon_Schutzgasatmosphaere.jpg/200px-Calcium_unter_Argon_Schutzgasatmosphaere.jpg",
      cap: "칼슘(Ca) 금속 시료 · Commons",
    },
    30: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Zinc_fragment.jpg/200px-Zinc_fragment.jpg",
      cap: "아연(Zn) 금속 조각 · Commons",
    },
    35: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bromine_sample.jpg/200px-Bromine_sample.jpg",
      cap: "브로민(Br) — 액체 할로젠 시료 · Commons",
    },
    53: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Iodine_sample.jpg/200px-Iodine_sample.jpg",
      cap: "아이오딘(I) 고체 시료 · Commons",
    },
    80: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Pouring_liquid_mercury_bionerd.jpg/200px-Pouring_liquid_mercury_bionerd.jpg",
      cap: "수은(Hg) — 액체 금속 · Commons",
    },
    26: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Iron_electrolytic_and_1cm3_cube.jpg/200px-Iron_electrolytic_and_1cm3_cube.jpg",
      cap: "철(Fe) — 전해 철·입방체(체심입방 금속) · Commons",
    },
    29: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/NatCopper.jpg/200px-NatCopper.jpg",
      cap: "구리(Cu) — 동광·금속 구리 · Commons",
    },
    47: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Silver_crystal.jpg/200px-Silver_crystal.jpg",
      cap: "은(Ag) 결정 · Commons",
    },
    79: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Gold_crystals.jpg/240px-Gold_crystals.jpg",
      cap: "금(Au) — 금 결정(금속은 주로 FCC 구조) · Commons",
    },
    82: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Pb-1.5kg.jpg/200px-Pb-1.5kg.jpg",
      cap: "납(Pb) 금속 시료 · Commons",
    },
    92: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Uranium_ore.jpg/200px-Uranium_ore.jpg",
      cap: "우라늄(U) 광석 시료 · Commons",
    },
  };

  var STRUCTURE_FALLBACK = [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Gold_crystals.jpg/200px-Gold_crystals.jpg",
      cap: "금속 결정 구조(대표 이미지) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Iron_electrolytic_and_1cm3_cube.jpg/200px-Iron_electrolytic_and_1cm3_cube.jpg",
      cap: "전이금속 시료(대표) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sodium_metal.jpg/200px-Sodium_metal.jpg",
      cap: "알칼리 금속 시료(대표) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Helium_discharge_tube.jpg/200px-Helium_discharge_tube.jpg",
      cap: "기체 원소 방전관(대표) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Diamond.jpg/200px-Diamond.jpg",
      cap: "공유결합 결정(대표) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Aluminium.jpg/200px-Aluminium.jpg",
      cap: "전이후금속 시료(대표) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Sulfur_sample.jpg/200px-Sulfur_sample.jpg",
      cap: "비금속 고체 시료(대표) · Commons",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Silicon.jpg/200px-Silicon.jpg",
      cap: "준금속 시료(대표) · Commons",
    },
  ];

  function hashSeed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  /**
   * 픽셀풍 캐릭터 — 원소 기호+이름으로 시드 고정(항상 같은 원소는 같은 얼굴)
   */
  function getPixelCharacterUrl(el) {
    if (!el) {
      return (
        "https://api.dicebear.com/9.x/pixel-art/svg?seed=CyChemi&backgroundColor=b6e3f4&size=128"
      );
    }
    /** Z 1–10: `원소 캐릭터/1.png`…`10.png` (1380×752, 직접 교체). 프로필 프레임은 style.css contain. */
    if (el.z >= 1 && el.z <= 10) {
      /* 쿼리: 브라우저 캐시에 남은 예전 PNG를 피하기 위함(파일 바꾼 뒤에도 번호만 올리면 됨) */
      return encodeURI("원소 캐릭터/" + el.z + ".png") + "?v=17";
    }
    var seed = encodeURIComponent(el.symbol + "-" + el.name + "-" + el.z);
    var bg = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "e0e0e0"];
    var bi = hashSeed(el.symbol) % bg.length;
    return (
      "https://api.dicebear.com/9.x/pixel-art/svg?seed=" +
      seed +
      "&backgroundColor=" +
      bg[bi] +
      "&size=128&radius=8"
    );
  }

  /** Z 1–10: 로컬 `원소의 방/` 폴더의 png를 1순위 구조 사진으로 사용 (네트워크 끊겨도 보임) */
  function getLocalStructureUrl(z) {
    return encodeURI("원소의 방/" + z + ".png") + "?v=9";
  }

  function getStructureAsset(el) {
    if (!el) {
      /* 원소 미선택 상태에서도 무언가 보이도록: 1번 원소 방 PNG → 주기율표 폴백 */
      return {
        url: getLocalStructureUrl(1),
        fallback:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Periodic_table_large.svg/320px-Periodic_table_large.svg.png",
        cap: "원소를 조회하면 해당 원소의 구조 사진이 표시돼요 ♡",
      };
    }
    /* Z 1–10: 로컬 png가 있으니 그걸 1순위로, Wikimedia는 폴백 */
    if (el.z >= 1 && el.z <= 10) {
      var w = STRUCTURE_BY_Z[el.z];
      return {
        url: getLocalStructureUrl(el.z),
        fallback: w ? w.url : null,
        cap:
          el.name +
          " (" +
          el.symbol +
          ") 원소 구조 일러스트 · 원소의 방/" +
          el.z +
          ".png",
      };
    }
    if (STRUCTURE_BY_Z[el.z]) {
      var s = STRUCTURE_BY_Z[el.z];
      return { url: s.url, fallback: null, cap: s.cap };
    }
    var idx = el.z % STRUCTURE_FALLBACK.length;
    var fb = STRUCTURE_FALLBACK[idx];
    return {
      url: fb.url,
      fallback: null,
      cap:
        el.name +
        " (" +
        el.symbol +
        ") — " +
        fb.cap +
        " (원소별 대표 자료가 없을 때 순환 이미지)",
    };
  }

  var MOOD_LINES = [
    "오늘은... 실험복... 설레...☆",
    "전자 궤도에... ㄴŀ 맘이... 섞여...^^",
    "반응식은... 거짓말... 안 해...♥",
    "내 주기는... 내가... 정한다...(아님)",
    "친구랑... 오비탈... 공유...할래?",
    "오늘 기분... 활성화에너지... 낮음...πㅅπ",
    "결합 길이는... 마음 거리...?",
    "양성자... 자존감... 챙기기★",
  ];

  var WAVE_INTROS = [
    "ㄴŁ... 여긴 ",
    "환영...♥ ",
    "파도타기로... 온 거야...? ",
    "드디어... 찾아왔네... ",
    "반가워... 나는 ",
    "미니홈... 구경 왔구나... ",
  ];

  function getWaveIntro(el) {
    if (!el) {
      return "Cy-Chemi... ㅇㅏㄹ... 오늘도... 원소 생각...^^";
    }
    var h = hashSeed(String(el.z) + el.symbol);
    var w = WAVE_INTROS[h % WAVE_INTROS.length];
    var mood = MOOD_LINES[(h >> 3) % MOOD_LINES.length];
    return (
      w +
      "<strong>" +
      el.name +
      "</strong>(" +
      el.symbol +
      ")... " +
      mood +
      " 족 " +
      el.group +
      " ...^^"
    );
  }

  /** 미니룸 말풍선 — Z 1–10 원소별 (첫 줄 고정, 나머지는 시드로 순환) */
  var MINIROOM_BUBBLE_BY_Z = {
    1: [
      "전자 한 개뿐인데... <b>공유</b>해 달라니... 나는 그 순간 <b>H⁺</b> 되는 거 알아...? ^^",
      "1s 궤도 <b>단칸</b>인데... 왜 자꾸 <b>다른 원소</b> 초대권을 끊어...πㅅπ",
      "나 <b>수소</b>야... 가벼운 척은 <b>밀도</b> 때문이야... 마음까지 가볍진 않거든...♥",
      "여기 <b>원소의 방</b>... 로그인하면 <b>환원</b> 아니고 <b>환영</b>이야... 오타 금지...",
    ],
    2: [
      "나 <b>He</b>... 옥텟 이미 찼어... 일촌 신청은 <b>거절</b>이 기본값...🫧",
      "풍선처럼 둥실... 마음도 <b>비활성</b>... 오늘은 충돌 안 해...^^",
      "18족이라고 무시하지 마... 나는 <b>제일 안정</b>한 편이야...♥",
    ],
    3: [
      "<b>Li</b> 배터리처럼... 오늘도 <b>에너지</b> 방출 각...⚡",
      "알칼리 금속은 <b>반응</b>이 빨라... 마음도 조금... 서두르는 편...πㅅπ",
      "물 만나면 <b>히익</b>... 그래도 네 미니홈은 <b>건조</b>해서 다행...^^",
    ],
    4: [
      "<b>Be</b>... 가볍고 단단해... 너무 가까이 오면 <b>독</b> 될 수도... 조심...",
      "2족은 <b>은밀</b>해... 파도타기는 조용히... 살짝만...♥",
      "금속 광택처럼... 오늘 기분은 <b>반짝</b>... 부담은 싫어...^^",
    ],
    5: [
      "<b>B</b>는 반도체 기질... 말은 <b>차분</b>하게... 마음은 전기 안 통하게...",
      "붕사로 유리 만든다던데... 나는 <b>깨지면</b> 슬퍼... 조심해...πㅅπ",
      "13족 주민... <b>정리</b>된 방 좋아... 어지러운 건 싫어...^^",
    ],
    6: [
      "<b>C</b>는 <b>다이아</b>도 흑연도... 오늘은 <b>육방</b> 마음...☆",
      "탄소족이라 끈기 있어... <b>결합</b> 오래 가는 타입...♥",
      "다른 원소랑 <b>사슬</b> 만들면... 나는 뼈대가 돼...^^",
    ],
    7: [
      "<b>N₂</b> 삼중결합... 문 잠그면 <b>안쪽</b>은 안전... 밖은 시끄러워...",
      "질소는 <b>78%</b> 하늘... 네 미니홈 공기도... 내가 책임져...? ^^",
      "액체 <b>질소</b>처럼 차갑게... 장난은 싫어... 진심은 환영...♥",
    ],
    8: [
      "<b>O₂</b> 없으면... 숨 못 쉬지... 네 미니홈도 <b>환기</b> 필수...",
      "산화는 <b>내 일</b>... 너무 가까우면 불 붙을지도...🔥",
      "16족이라 <b>전자</b> 욕심... 근데 예의는 지켜...^^",
    ],
    9: [
      "<b>F</b>는 <b>최강</b> 전기음성도... 친해지려면 각오해...⚡",
      "할로겐이라 <b>날카로워</b>... 상처 나면 오래 가... 조심...πㅅπ",
      "플루오린 치약 냄새... 그건 나랑 <b>다른</b> 이야기...^^",
    ],
    10: [
      "<b>Ne</b> 사인불... 밤에만 <b>빛나</b>... 낮엔 비활성...🫧",
      "네온처럼 <b>화려</b>해 보여도... 속은 고요...♥",
      "18족 끝자락... 일촌은 <b>선택적</b>으로...^^",
    ],
  };

  function getMiniroomBubble(el) {
    if (!el) {
      return (
        "ㄴŁ... <b>원소 조회</b> 탭에서... 만나자...^^<br />오늘도... 반응식은... 거짓말 안 해...♥"
      );
    }
    var lines = MINIROOM_BUBBLE_BY_Z[el.z];
    if (!lines || !lines.length) {
      return (
        "<b>" +
        el.name +
        "</b> 미니룸 입장... 오늘의 <b>반응 속도</b>는 네 마음 속도에 비례해...☆"
      );
    }
    var h = hashSeed(el.symbol + "bubble");
    return lines[h % lines.length];
  }

  function getFriendsSayHtml(el, allElements) {
    if (!el || !allElements || !allElements.length) {
      return (
        "<p><b>H</b>: ㄴŁ... 전자... 나눠줄게...^^</p>" +
        "<p><b>O</b>: ㉤ㅓ... 같이... 산화...할래...?</p>" +
        "<p><b>He</b>: ...난 그냥... 비활성...거절...πㅅπ</p>"
      );
    }
    var others = allElements.filter(function (e) {
      return e.z !== el.z;
    });
    var out = [];
    var h = hashSeed(el.symbol + "friends");
    for (var i = 0; i < 3; i++) {
      var peer = others[(h + i * 17) % others.length];
      var msgs = [
        "야호 " + el.symbol + "... 나랑... 반응...할래...^^",
        el.symbol + " 네 미니홈... 음악... 틀어줘...♥",
        "오늘 기분... 어때...? 나는 " + peer.name + "...πㅅπ",
      ];
      out.push(
        "<p><b>" +
          peer.symbol +
          "</b>: " +
          msgs[(h + i) % msgs.length] +
          "</p>"
      );
    }
    return out.join("");
  }

  function getVisitCounts(el) {
    try {
      var t = parseInt(localStorage.getItem("cy_v_today") || "128", 10);
      var tot = parseInt(localStorage.getItem("cy_v_total") || "40206", 10);
      return { today: t, total: tot };
    } catch (err) {
      return { today: 128, total: 40206 };
    }
  }

  /** TODAY IS... — 원소마다 다른 기분 한 줄 */
  var TODAY_IS_BY_Z = {
    1: "♪ 맑음 · 수소처럼 가벼운 설렘",
    2: "♪ 둥실 · 헬륨 같은 무중력 모드",
    3: "♪ 반짝 · 리튬 알칼리 설렘",
    4: "♪ 단단 · 베릴륨 마음가짐",
    5: "♪ 차분 · 붕소에 집중 중",
    6: "♪ 육방 · 탄소 끈기 만땅",
    7: "♪ 긴장 · 질소 삼중결합 느낌",
    8: "♪ 활력 · 산소 충전 중",
    9: "♪ 최강 · 플루오린 각오",
    10: "♪ 네온사인 · 방금 켜진 기분 ✧",
    11: "♪ 톡톡 · 나트륨처럼 반응적",
    12: "♪ 반짝 · 마그네슘 불꽃 기분",
    13: "♪ 가볍게 · 알루미늄 바람",
    14: "♪ 단단 · 규소 결정 마음",
    15: "♪ 타오름 · 인의 백린 설렘",
    16: "♪ 황금빛 · 황의 따뜻함",
    17: "♪ 시원 · 염소 소독 모드",
    18: "♪ 고요 · 아르곤 숨 고르기",
    19: "♪ 통통 · 칼륨 알칼리 텐션",
    20: "♪ 든든 · 칼슘 뼈대 충전",
    26: "♪ 자석 · 철의 의지",
    29: "♪ 전도 · 구리 반짝",
    30: "♪ 아연 · 차분한 보호막",
    35: "♪ 자극 · 브로민 각성",
    47: "♪ 은빛 · 은의 고요",
    79: "♪ 황금 · 금의 여유",
    80: "♪ 수은 · 말랑말랑 기분",
  };

  var TODAY_IS_BY_GROUP = {
    1: "♪ 알칼리 · 반응 준비 완료",
    2: "♪ 알칼리토금 · 차분한 열",
    13: "♪ 붕소족 · 실험 노트 쓰는 중",
    14: "♪ 탄소족 · 끈기 충전",
    15: "♪ 질소족 · 삼중결합 모드",
    16: "♪ 산소족 · 산화도 체크",
    17: "♪ 할로겐 · 날카로운 하루",
    18: "♪ 비활성 · 오늘은 혼자 충전",
  };

  function getTodayIsMood(el) {
    if (!el) {
      return "♪ 오늘은... 그냥... 미니홈 구경...";
    }
    if (TODAY_IS_BY_Z[el.z]) {
      return TODAY_IS_BY_Z[el.z];
    }
    if (el.group && TODAY_IS_BY_GROUP[el.group]) {
      return TODAY_IS_BY_GROUP[el.group];
    }
    var h = hashSeed(el.symbol + "mood");
    return "♪ " + MOOD_LINES[h % MOOD_LINES.length];
  }

  window.CyChemiAssets = {
    getPixelCharacterUrl: getPixelCharacterUrl,
    getStructureAsset: getStructureAsset,
    getWaveIntro: getWaveIntro,
    getMiniroomBubble: getMiniroomBubble,
    getFriendsSayHtml: getFriendsSayHtml,
    getVisitCounts: getVisitCounts,
    getTodayIsMood: getTodayIsMood,
  };
})();
