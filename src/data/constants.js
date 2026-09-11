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
  { id:"pass",           name:"여행 패스",   icon:"🎫", desc:"이번 지역 포기",             when:"envelope" },
  { id:"ignore_dist",    name:"거리 무시",   icon:"📍", desc:"거리 제한 무시",             when:"preroll"  },
  { id:"mission_exempt", name:"미션 면제",   icon:"🧳", desc:"미션 하나 면제",             when:"mission"  },
  { id:"protect",        name:"점령 보호",   icon:"🛡️", desc:"내 영토 보호",              when:"map"      },
  { id:"bonus",          name:"점령 보너스", icon:"⭐", desc:"다음 점령 점수 증가",         when:"anytime"  },
  { id:"adjacent",       name:"인접 지역",   icon:"🧭", desc:"내 영토 주변 지역 도전",       when:"preroll"  },
];

export const PERSONAL_CARD_WHEN_LABEL = {
  preroll:"주사위 굴리기 전 · 메인", envelope:"봉투 단계 · 뽑기 화면", mission:"미션 인증 중 · 마이 탭에서 사용", map:"내 영토 선택 · 마이 탭에서 사용", anytime:"언제든 사용",
};

/**
 * 방 카드 — 방(멀티플레이) 전체에 영향을 주는 카드. 마이 탭에서 즉시 사용합니다.
 */
export const ROOM_CARDS = [
  { id:"extra_roll", name:"모두 한 번 더",   icon:"🎁", desc:"모든 플레이어 추가 기회" },
  { id:"chaos",       name:"대혼란",         icon:"🎲", desc:"아직 출발하지 않은 사람들의 지역 재배정" },
  { id:"national",    name:"전국 랜덤",       icon:"🗺️", desc:"방 전체 거리 제한 해제" },
  { id:"reveal",       name:"공개 여행지",     icon:"📢", desc:"서로의 후보 지역 공개" },
  { id:"throne",       name:"왕좌의 지역",     icon:"👑", desc:"특정 지역 최초 점령자 보너스" },
  { id:"rush",         name:"여행 러시",       icon:"🔥", desc:"일정 시간 방 전체 보너스" },
];

export const SIDO_ORDER = ["서울","인천","경기","강원","충남","세종","대전","충북","전북","전남","광주","경북","대구","경남","부산","울산","제주"];

export const SIDO_TINT = {서울:"#F1C3BA",부산:"#DACEEC",대구:"#F1CDD7",인천:"#CBE7D7",광주:"#DEE9C2",대전:"#D1E1F2",울산:"#F4E0BD",세종:"#DCDCDC",경기:"#F6DBC6",강원:"#E4EFC6",충북:"#DAD4ED",충남:"#D2E2F1",전북:"#EEE8C6",전남:"#DEE8BB",경북:"#E7DAED",경남:"#E2D2ED",제주:"#E7DFD3"};

export const ME = { id:"me", name:"나", color:"#2EB872" };

export const TOLL = 30;

export const methodFor = (t)=> t==="맛집" ? "receipt" : "gps";

