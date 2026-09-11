/**
 * 게임 규칙 상수 — 테마 / 거리 / 기간 / 예산 / 이벤트 카드 / 시도 목록 / 플레이어
 */
export const APP_VERSION = "v15";

export const THEME_LABELS = { sea:"바다", nature:"산·자연", city:"도시", food:"맛집", history:"역사·문화" };

export const THEME_LIST = ["sea","nature","city","food","history"];

export const DIST_STEPS = [{label:"근교",sub:"~80km",cap:80},{label:"가까이",sub:"~170km",cap:170},{label:"멀리",sub:"~280km",cap:280},{label:"전국",sub:"제한 없음",cap:9999}];

export const DURATIONS = ["당일치기","1박 2일","2박 3일"];

export const BUDGETS = [{label:"~10만원",v:"low"},{label:"10~30만원",v:"mid"},{label:"30만원+",v:"high"}];

export const EVENT_CARDS = [
  { id:"toll", name:"통행료 면제권", icon:"🎫", desc:"친구 타일에 떨어져도 통행료 면제" },
  { id:"swap", name:"목적지 교환", icon:"🔄", desc:"다음 목적지를 친구와 맞바꾸기" },
  { id:"lock", name:"타일 잠금", icon:"🔒", desc:"내 타일을 3일간 보호" },
  { id:"teleport", name:"텔레포트", icon:"✨", desc:"확정된 목적지를 즉시 재설정" },
];

export const SIDO_ORDER = ["서울","인천","경기","강원","충남","세종","대전","충북","전북","전남","광주","경북","대구","경남","부산","울산","제주"];

export const SIDO_TINT = {서울:"#F1C3BA",부산:"#DACEEC",대구:"#F1CDD7",인천:"#CBE7D7",광주:"#DEE9C2",대전:"#D1E1F2",울산:"#F4E0BD",세종:"#DCDCDC",경기:"#F6DBC6",강원:"#E4EFC6",충북:"#DAD4ED",충남:"#D2E2F1",전북:"#EEE8C6",전남:"#DEE8BB",경북:"#E7DAED",경남:"#E2D2ED",제주:"#E7DFD3"};

export const ME = { id:"me", name:"나", color:"#2EB872" };

export const TOLL = 30;

export const methodFor = (t)=> t==="맛집" ? "receipt" : "gps";

