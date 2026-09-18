/**
 * 게임 규칙 상수 — 테마 / 거리 / 기간 / 예산 / 이벤트 카드 / 시도 목록 / 플레이어
 */
export const APP_VERSION = "v15";

export const THEME_LABELS = { sea:"바다", nature:"산·자연", city:"도시", food:"맛집", history:"역사·문화" };

export const THEME_LIST = ["sea","nature","city","food","history"];

export const DIST_STEPS = [{label:"근교",sub:"~80km",cap:80},{label:"가까이",sub:"~170km",cap:170},{label:"멀리",sub:"~280km",cap:280},{label:"전국",sub:"제한 없음",cap:9999}];

export const DURATIONS = ["당일치기","1박 2일","2박 3일"];

export const BUDGETS = [{label:"~10만원",v:"low"},{label:"10~30만원",v:"mid"},{label:"30만원+",v:"high"}];

/**
 * 개인 카드 — 나 혼자 쓰는 카드. `when` 은 사용 가능한 시점을 나타냅니다.
 *  preroll  = 주사위 굴리기 전 (메인 탭)
 *  envelope = 봉투가 열리기 전/후, 출발하기 전 (뽑기 오버레이)
 *  mission  = 도착 후 미션 인증 중
 *  map      = 지도 탭에서 내 영토를 선택해 사용
 *  anytime  = 마이 탭에서 언제든 즉시 사용
 */
export const PERSONAL_CARDS = [
  { id:"reroll",         name:"지역 변경권", icon:"🔄", desc:"배정 지역 다시 뽑기",         when:"envelope" },
  { id:"preview",        name:"미리 보기",   icon:"🔍", desc:"후보 3개 확인 후 선택",       when:"preroll"  },
  { id:"select",         name:"지역 선택권", icon:"🗺️", desc:"조건에 맞는 지역 직접 선택",   when:"preroll"  },
  { id:"pass",           name:"여행 패스",   icon:"🎫", desc:"이번 목적지 취소 · 주사위 기회 1회 환불", when:"trip" },
  { id:"mission_exempt", name:"미션 면제",   icon:"🧳", desc:"미션 하나 면제",             when:"mission"  },
  { id:"protect",        name:"점령 보호",   icon:"🛡️", desc:"내 영토를 영구히 보호",        when:"map"      },
  { id:"bonus",          name:"점령 보너스", icon:"⭐", desc:"가지고 있으면 다음 점령 때 자동으로 점수 1.5배", when:"auto" },
  { id:"extra_roll",     name:"주사위 하나 더", icon:"🎲", desc:"주사위 굴리기 기회 +1회",        when:"anytime"  },
  { id:"adjacent",       name:"인접 지역",   icon:"🧭", desc:"내 영토 주변 지역 도전",       when:"preroll"  },
];

export const PERSONAL_CARD_WHEN_LABEL = {
  preroll:"봉투 열기 전 · 메인", envelope:"봉투를 연 뒤 · 뽑기 화면", trip:"목적지가 정해졌을 때", mission:"미션 인증 중", map:"지도 탭에서 내 영토 선택", auto:"자동 사용", anytime:"언제든 사용",
};

/**
 * 방 카드 — 방(멀티플레이) 전체에 영향을 주는 카드. 마이 탭에서 즉시 사용합니다.
 */
export const ROOM_CARDS = [
  { id:"extra_roll", name:"모두 한 번 더",   icon:"🎁", desc:"모든 플레이어 추가 기회" },
  { id:"chaos",       name:"대혼란",         icon:"🎲", desc:"아직 인증을 시작하지 않은 목적지를 다시 뽑음" },
  { id:"national",    name:"전국 랜덤",       icon:"🗺️", desc:"다음 여행은 거리 제한 없이 전국에서" },
  { id:"reveal",       name:"공개 여행지",     icon:"📢", desc:"방 사람들이 노리는 지역을 지도에 공개" },
  { id:"throne",       name:"왕좌의 지역",     icon:"👑", desc:"지정된 지역 최초 점령 시 코인 +150" },
  { id:"rush",         name:"여행 러시",       icon:"🔥", desc:"다음 점령 코인 1.5배" },
];

/* 카드 상점 가격 — 코인으로 구매합니다. 효과가 강할수록 비쌉니다. */
export const CARD_PRICE = {
  reroll: 80, preview: 120, select: 200, pass: 100,
  mission_exempt: 150, protect: 250, bonus: 180, adjacent: 120,
  extra_roll: 140,
};

/* 카드 획득 확률 — 화면에도 그대로 표시합니다 */
export const CARD_DROP_RATE = { personal: 0.35, room: 0.18 };

/* 개발자 도구 암호 — 로고를 5번 연속 누른 뒤 입력해야 열립니다 */
export const DEV_PASSCODE = "jolee";

/* 하루에 주어지는 주사위 횟수 — 매일 자정에 이 값으로 채워집니다 */
export const DAILY_ROLLS = 5;

export const SIDO_ORDER = ["서울","인천","경기","강원","충남","세종","대전","충북","전북","전남","광주","경북","대구","경남","부산","울산","제주"];

export const SIDO_TINT = {서울:"#F1C3BA",부산:"#DACEEC",대구:"#F1CDD7",인천:"#CBE7D7",광주:"#DEE9C2",대전:"#D1E1F2",울산:"#F4E0BD",세종:"#DCDCDC",경기:"#F6DBC6",강원:"#E4EFC6",충북:"#DAD4ED",충남:"#D2E2F1",전북:"#EEE8C6",전남:"#DEE8BB",경북:"#E7DAED",경남:"#E2D2ED",제주:"#E7DFD3"};

export const ME = { id:"me", name:"나", color:"#2EB872" };

export const TOLL = 30;

export const methodFor = (t)=> t==="맛집" ? "receipt" : "gps";

