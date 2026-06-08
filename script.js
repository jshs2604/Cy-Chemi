/**
 * Cy-Chemi — 원소 데이터
 * - elements: 1–118 (일촌·검색)
 * - 미니홈·조회: CY_MINIHOME_ZS (H, He, Li, Be, B, C, N, O, F, Ne → Z 1–10)
 */


const elements = [
  { z: 1, symbol: 'H', name: '수소', group: 1, EN: 2.2 },
  { z: 2, symbol: 'He', name: '헬륨', group: 18, EN: null },
  { z: 3, symbol: 'Li', name: '리튬', group: 1, EN: 0.98 },
  { z: 4, symbol: 'Be', name: '베릴륨', group: 2, EN: 1.57 },
  { z: 5, symbol: 'B', name: '붕소', group: 13, EN: 2.04 },
  { z: 6, symbol: 'C', name: '탄소', group: 14, EN: 2.55 },
  { z: 7, symbol: 'N', name: '질소', group: 15, EN: 3.04 },
  { z: 8, symbol: 'O', name: '산소', group: 16, EN: 3.44 },
  { z: 9, symbol: 'F', name: '플루오린', group: 17, EN: 3.98 },
  { z: 10, symbol: 'Ne', name: '네온', group: 18, EN: null },
  { z: 11, symbol: 'Na', name: '나트륨', group: 1, EN: 0.93 },
  { z: 12, symbol: 'Mg', name: '마그네슘', group: 2, EN: 1.31 },
  { z: 13, symbol: 'Al', name: '알루미늄', group: 13, EN: 1.61 },
  { z: 14, symbol: 'Si', name: '규소', group: 14, EN: 1.9 },
  { z: 15, symbol: 'P', name: '인', group: 15, EN: 2.19 },
  { z: 16, symbol: 'S', name: '황', group: 16, EN: 2.58 },
  { z: 17, symbol: 'Cl', name: '염소', group: 17, EN: 3.16 },
  { z: 18, symbol: 'Ar', name: '아르곤', group: 18, EN: null },
  { z: 19, symbol: 'K', name: '칼륨', group: 1, EN: 0.82 },
  { z: 20, symbol: 'Ca', name: '칼슘', group: 2, EN: 1.0 },
  { z: 21, symbol: 'Sc', name: '스칸듐', group: 3, EN: 1.36 },
  { z: 22, symbol: 'Ti', name: '티타늄', group: 4, EN: 1.54 },
  { z: 23, symbol: 'V', name: '바나듐', group: 5, EN: 1.63 },
  { z: 24, symbol: 'Cr', name: '크로뮴', group: 6, EN: 1.66 },
  { z: 25, symbol: 'Mn', name: '망간', group: 7, EN: 1.55 },
  { z: 26, symbol: 'Fe', name: '철', group: 8, EN: 1.83 },
  { z: 27, symbol: 'Co', name: '코발트', group: 9, EN: 1.88 },
  { z: 28, symbol: 'Ni', name: '니켈', group: 10, EN: 1.91 },
  { z: 29, symbol: 'Cu', name: '구리', group: 11, EN: 1.9 },
  { z: 30, symbol: 'Zn', name: '아연', group: 12, EN: 1.65 },
  { z: 31, symbol: 'Ga', name: '갈륨', group: 13, EN: 1.81 },
  { z: 32, symbol: 'Ge', name: '게르마늄', group: 14, EN: 2.01 },
  { z: 33, symbol: 'As', name: '비소', group: 15, EN: 2.18 },
  { z: 34, symbol: 'Se', name: '셀레늄', group: 16, EN: 2.55 },
  { z: 35, symbol: 'Br', name: '브로민', group: 17, EN: 2.96 },
  { z: 36, symbol: 'Kr', name: '크립톤', group: 18, EN: 3.0 },
  { z: 37, symbol: 'Rb', name: '루비듐', group: 1, EN: 0.82 },
  { z: 38, symbol: 'Sr', name: '스트론튬', group: 2, EN: 0.95 },
  { z: 39, symbol: 'Y', name: '이트륨', group: 3, EN: 1.22 },
  { z: 40, symbol: 'Zr', name: '지르코늄', group: 4, EN: 1.33 },
  { z: 41, symbol: 'Nb', name: '나이오븀', group: 5, EN: 1.6 },
  { z: 42, symbol: 'Mo', name: '몰리브덴', group: 6, EN: 2.16 },
  { z: 43, symbol: 'Tc', name: '테크네튬', group: 7, EN: 1.9 },
  { z: 44, symbol: 'Ru', name: '루테늄', group: 8, EN: 2.2 },
  { z: 45, symbol: 'Rh', name: '로듐', group: 9, EN: 2.28 },
  { z: 46, symbol: 'Pd', name: '팔라듐', group: 10, EN: 2.2 },
  { z: 47, symbol: 'Ag', name: '은', group: 11, EN: 1.93 },
  { z: 48, symbol: 'Cd', name: '카드뮴', group: 12, EN: 1.69 },
  { z: 49, symbol: 'In', name: '인듐', group: 13, EN: 1.78 },
  { z: 50, symbol: 'Sn', name: '주석', group: 14, EN: 1.96 },
  { z: 51, symbol: 'Sb', name: '안티모니', group: 15, EN: 2.05 },
  { z: 52, symbol: 'Te', name: '텔루륨', group: 16, EN: 2.1 },
  { z: 53, symbol: 'I', name: '아이오딘', group: 17, EN: 2.66 },
  { z: 54, symbol: 'Xe', name: '제논', group: 18, EN: 2.6 },
  { z: 55, symbol: 'Cs', name: '세슘', group: 1, EN: 0.79 },
  { z: 56, symbol: 'Ba', name: '바륨', group: 2, EN: 0.89 },
  { z: 57, symbol: 'La', name: '란타넘', group: 3, EN: 1.1 },
  { z: 58, symbol: 'Ce', name: '세륨', group: 3, EN: 1.12 },
  { z: 59, symbol: 'Pr', name: '프라세오디뮴', group: 3, EN: 1.13 },
  { z: 60, symbol: 'Nd', name: '네오디뮴', group: 3, EN: 1.14 },
  { z: 61, symbol: 'Pm', name: '프로메튬', group: 3, EN: 1.13 },
  { z: 62, symbol: 'Sm', name: '사마륨', group: 3, EN: 1.17 },
  { z: 63, symbol: 'Eu', name: '유로퓸', group: 3, EN: 1.2 },
  { z: 64, symbol: 'Gd', name: '가돌리늄', group: 3, EN: 1.2 },
  { z: 65, symbol: 'Tb', name: '터븀', group: 3, EN: 1.1 },
  { z: 66, symbol: 'Dy', name: '디스프로슘', group: 3, EN: 1.22 },
  { z: 67, symbol: 'Ho', name: '홀뮴', group: 3, EN: 1.23 },
  { z: 68, symbol: 'Er', name: '어븀', group: 3, EN: 1.24 },
  { z: 69, symbol: 'Tm', name: '툴륨', group: 3, EN: 1.25 },
  { z: 70, symbol: 'Yb', name: '이터븀', group: 3, EN: 1.1 },
  { z: 71, symbol: 'Lu', name: '루테튬', group: 3, EN: 1.27 },
  { z: 72, symbol: 'Hf', name: '하프늄', group: 4, EN: 1.3 },
  { z: 73, symbol: 'Ta', name: '탄탈럼', group: 5, EN: 1.5 },
  { z: 74, symbol: 'W', name: '텅스텐', group: 6, EN: 2.36 },
  { z: 75, symbol: 'Re', name: '레늄', group: 7, EN: 1.9 },
  { z: 76, symbol: 'Os', name: '오스뮴', group: 8, EN: 2.2 },
  { z: 77, symbol: 'Ir', name: '이리듐', group: 9, EN: 2.2 },
  { z: 78, symbol: 'Pt', name: '백금', group: 10, EN: 2.28 },
  { z: 79, symbol: 'Au', name: '금', group: 11, EN: 2.54 },
  { z: 80, symbol: 'Hg', name: '수은', group: 12, EN: 2.0 },
  { z: 81, symbol: 'Tl', name: '탈륨', group: 13, EN: 1.62 },
  { z: 82, symbol: 'Pb', name: '납', group: 14, EN: 1.87 },
  { z: 83, symbol: 'Bi', name: '비스무트', group: 15, EN: 2.02 },
  { z: 84, symbol: 'Po', name: '폴로늄', group: 16, EN: 2.0 },
  { z: 85, symbol: 'At', name: '아스타틴', group: 17, EN: 2.2 },
  { z: 86, symbol: 'Rn', name: '라돈', group: 18, EN: 2.2 },
  { z: 87, symbol: 'Fr', name: '프랑슘', group: 1, EN: 0.79 },
  { z: 88, symbol: 'Ra', name: '라듐', group: 2, EN: 0.9 },
  { z: 89, symbol: 'Ac', name: '악티늄', group: 3, EN: 1.1 },
  { z: 90, symbol: 'Th', name: '토륨', group: 3, EN: 1.3 },
  { z: 91, symbol: 'Pa', name: '프로트악티늄', group: 3, EN: 1.5 },
  { z: 92, symbol: 'U', name: '우라늄', group: 3, EN: 1.38 },
  { z: 93, symbol: 'Np', name: '넵툰늄', group: 3, EN: 1.36 },
  { z: 94, symbol: 'Pu', name: '플루토늄', group: 3, EN: 1.28 },
  { z: 95, symbol: 'Am', name: '아메리슘', group: 3, EN: 1.13 },
  { z: 96, symbol: 'Cm', name: '큐륨', group: 3, EN: 1.28 },
  { z: 97, symbol: 'Bk', name: '버클륨', group: 3, EN: 1.3 },
  { z: 98, symbol: 'Cf', name: '캘리포늄', group: 3, EN: 1.3 },
  { z: 99, symbol: 'Es', name: '아인슈타이늄', group: 3, EN: 1.3 },
  { z: 100, symbol: 'Fm', name: '페르뮴', group: 3, EN: 1.3 },
  { z: 101, symbol: 'Md', name: '멘델레븀', group: 3, EN: 1.3 },
  { z: 102, symbol: 'No', name: '노벨륨', group: 3, EN: 1.3 },
  { z: 103, symbol: 'Lr', name: '로렌슘', group: 3, EN: 1.3 },
  { z: 104, symbol: 'Rf', name: '러더포듐', group: 4, EN: null },
  { z: 105, symbol: 'Db', name: '더브늄', group: 5, EN: null },
  { z: 106, symbol: 'Sg', name: '시보귬', group: 6, EN: null },
  { z: 107, symbol: 'Bh', name: '보륨', group: 7, EN: null },
  { z: 108, symbol: 'Hs', name: '하슘', group: 8, EN: null },
  { z: 109, symbol: 'Mt', name: '마이트너륨', group: 9, EN: null },
  { z: 110, symbol: 'Ds', name: '다름스타트륨', group: 10, EN: null },
  { z: 111, symbol: 'Rg', name: '뢴트게늄', group: 11, EN: null },
  { z: 112, symbol: 'Cn', name: '코페르니슘', group: 12, EN: null },
  { z: 113, symbol: 'Nh', name: '니호늄', group: 13, EN: null },
  { z: 114, symbol: 'Fl', name: '플레로븀', group: 14, EN: null },
  { z: 115, symbol: 'Mc', name: '모스코븀', group: 15, EN: null },
  { z: 116, symbol: 'Lv', name: '리버모륨', group: 16, EN: null },
  { z: 117, symbol: 'Ts', name: '테네신', group: 17, EN: null },
  { z: 118, symbol: 'Og', name: '오가네손', group: 18, EN: null }
];

/** 미니홈·원소 조회: 1주기·2주기 앞부분 H ~ Ne (플루오린 포함, Z 1–10) */
const CY_MINIHOME_ZS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const CY_ELEMENT_COUNT = CY_MINIHOME_ZS.size;
const CY_MAX_MINIHOME_Z = 10;

function isMinihomeElement(el) {
  return el && CY_MINIHOME_ZS.has(el.z);
}

function getElementByZ(atomicNumber) {
  const found = elements.find((el) => el.z === atomicNumber);
  return found ?? null;
}

function getElementBySymbol(symbol) {
  if (typeof symbol !== 'string') {
    return null;
  }
  const upper = symbol.trim().toUpperCase();
  const found = elements.find((el) => el.symbol.toUpperCase() === upper);
  return found ?? null;
}

function judgeBondBetweenElements(el1, el2) {
  if (!el1 || !el2) {
    return {
      ok: false,
      reason: 'not_found',
      message: '원소를 찾을 수 없습니다. 기호를 다시 확인해 주세요.',
    };
  }

  if (el1.group === 18 || el2.group === 18) {
    const noble = el1.group === 18 ? el1 : el2;
    return {
      ok: false,
      reason: 'noble_gas',
      message:
        '18족 비활성 기체는 이미 옥텟 규칙을 만족해 매우 안정적입니다. 일촌 신청이 거절되었습니다.',
      nobleElement: noble,
    };
  }

  const en1 = el1.EN;
  const en2 = el2.EN;
  if (typeof en1 !== 'number' || typeof en2 !== 'number') {
    return {
      ok: false,
      reason: 'missing_en',
      message:
        '한쪽 또는 양쪽 원소의 전기음성도가 없어 ΔEN을 계산할 수 없습니다. (초중원소 등)',
    };
  }

  const deltaEN = Math.abs(en1 - en2);

  let bondKind;
  let labelKo;

  if (deltaEN >= 1.7) {
    bondKind = 'ionic';
    labelKo = '이온 결합';
  } else if (deltaEN > 0) {
    bondKind = 'polar_covalent';
    labelKo = '극성 공유 결합';
  } else {
    bondKind = 'nonpolar_covalent';
    labelKo = '무극성 공유 결합';
  }

  return {
    ok: true,
    el1,
    el2,
    deltaEN,
    bondKind,
    labelKo,
  };
}

/** 일촌·비교 카드용 — ΔEN 판정 근거 한 줄 */
function getBondWhyLine(verdict) {
  if (!verdict || !verdict.ok) {
    return '';
  }
  const d = verdict.deltaEN;
  const en1 = verdict.el1.EN;
  const en2 = verdict.el2.EN;
  const hi = en1 >= en2 ? verdict.el1 : verdict.el2;
  const lo = en1 >= en2 ? verdict.el2 : verdict.el1;
  const den = typeof d === 'number' ? d.toFixed(2) : '—';

  if (verdict.bondKind === 'ionic') {
    return (
      'ΔEN ' +
      den +
      ' (≥1.7) — ' +
      hi.symbol +
      '(EN ' +
      hi.EN +
      ')이 전자를 더 끌어당겨 ' +
      lo.symbol +
      '(EN ' +
      lo.EN +
      ') 쪽에 전하 차이가 커져 이온 결합 성향이에요.'
    );
  }
  if (verdict.bondKind === 'polar_covalent') {
    return (
      'ΔEN ' +
      den +
      ' (0~1.7) — 전자쌍을 공유하지만 ' +
      hi.symbol +
      ' 쪽으로 치우쳐 극성 공유 결합이에요.'
    );
  }
  return (
    'ΔEN ' +
    den +
    ' — 전기음성도 차이가 작아 전자쌍이 가운데에 가까운 무극성 공유 결합이에요.'
  );
}

function judgeBondBySymbols(symbolA, symbolB) {
  const a = getElementBySymbol(symbolA);
  const b = getElementBySymbol(symbolB);
  return judgeBondBetweenElements(a, b);
}

window.CyChemiElements = elements;
window.CY_MINIHOME_ZS = CY_MINIHOME_ZS;
window.CY_ELEMENT_COUNT = CY_ELEMENT_COUNT;
window.CY_MAX_MINIHOME_Z = CY_MAX_MINIHOME_Z;
window.isMinihomeElement = isMinihomeElement;
window.getElementByZ = getElementByZ;
window.getElementBySymbol = getElementBySymbol;
window.judgeBondBetweenElements = judgeBondBetweenElements;
window.judgeBondBySymbols = judgeBondBySymbols;
window.getBondWhyLine = getBondWhyLine;

