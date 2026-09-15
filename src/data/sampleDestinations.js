/**
 * TourAPI 응답 형태의 내장 샘플 목적지 — API 실패 시 폴백
 */
/*
  굴러라 대한민국 — 지도 탭: [지도(시군구 실제 경계)] / [타일(시도 보드)]
  인증 완료 시 해당 시·군·구가 내 색으로 칠해집니다.
*/
/* ───────── 샘플 데이터 (TourAPI item 형태 + 시군구 코드 sgg) ───────── */
export const SAMPLE_POOL = [
  { contentid:"c01", title:"안목해변 커피거리", sido:"강원", sigungu:"강릉", sgg:"32030", region:"gangwon", themes:["sea","food"], distanceKm:165, depop:false, grad:["#3AA8C1","#1E6F8E"],
    overview:"파도 소리와 함께 즐기는 바다 카페거리. 백사장을 따라 늘어선 로스터리에서 강릉 커피를 맛볼 수 있습니다.",
    missions:[{n:"안목해변 백사장 인증샷",t:"명소"},{n:"바다뷰 로스터리 커피",t:"맛집"},{n:"강문 솟대다리 건너기",t:"체험"}] },
  { contentid:"c02", title:"청령포", sido:"강원", sigungu:"영월", sgg:"32330", region:"gangwon", themes:["history","nature"], distanceKm:188, depop:true, grad:["#2F8F6B","#1C5E47"],
    overview:"삼면이 강으로 둘러싸인 단종의 유배지. 배를 타고 들어가야 닿는, 고요하고 깊은 솔숲의 섬입니다.",
    missions:[{n:"관음송 앞에서 인증",t:"명소"},{n:"영월 메밀 막국수",t:"맛집"},{n:"나룻배 타고 입도",t:"체험"}] },
  { contentid:"c03", title:"도담삼봉", sido:"충북", sigungu:"단양", sgg:"33380", region:"chungbuk", themes:["nature"], distanceKm:142, depop:true, grad:["#4C8FCF","#2A5C92"],
    overview:"남한강 한가운데 솟은 세 개의 봉우리. 정도전이 호를 '삼봉'이라 지은 곳으로, 물 위 정자가 한 폭의 그림입니다.",
    missions:[{n:"도담삼봉 전망 포토존",t:"명소"},{n:"단양 마늘떡갈비",t:"맛집"},{n:"이끼터널 산책",t:"체험"}] },
  { contentid:"c04", title:"동피랑 벽화마을", sido:"경남", sigungu:"통영", sgg:"38050", region:"gyeongnam", themes:["sea","city","history"], distanceKm:330, depop:false, grad:["#E08A3C","#B85C1E"],
    overview:"강구안 언덕을 따라 그려진 벽화 골목. 골목 끝마다 통영 바다가 불쑥 나타납니다.",
    missions:[{n:"동피랑 정상 벽화 인증",t:"명소"},{n:"통영 충무김밥",t:"맛집"},{n:"중앙시장 꿀빵 맛보기",t:"체험"}] },
  { contentid:"c05", title:"녹차밭 대한다원", sido:"전남", sigungu:"보성", sgg:"36360", region:"jeonnam", themes:["nature"], distanceKm:330, depop:true, grad:["#5BA84F","#2F7A36"],
    overview:"끝없이 펼쳐진 초록 차밭의 능선. 삼나무길을 지나면 한 면 가득 녹차 계단이 펼쳐집니다.",
    missions:[{n:"녹차밭 삼나무길 인증",t:"명소"},{n:"녹차 아이스크림",t:"맛집"},{n:"차밭 능선 트레킹",t:"체험"}] },
  { contentid:"c06", title:"황리단길", sido:"경북", sigungu:"경주", sgg:"37020", region:"gyeongbuk", themes:["history","city","food"], distanceKm:300, depop:false, grad:["#C8703E","#8F4A22"],
    overview:"천년 고도 경주의 한옥 골목 상권. 대릉원 돌담을 끼고 카페와 공방이 이어집니다.",
    missions:[{n:"대릉원 돌담길 인증",t:"명소"},{n:"황남빵 맛보기",t:"맛집"},{n:"첨성대 야경 보기",t:"체험"}] },
  { contentid:"c07", title:"흰여울문화마을", sido:"부산", sigungu:"영도구", sgg:"21040", region:"busan", themes:["sea","city"], distanceKm:325, depop:false, grad:["#3F8FD0","#235F95"],
    overview:"절벽 위에 매달린 흰 골목과 그 아래로 펼쳐진 남항. 영화의 배경이 된 바다 산책로입니다.",
    missions:[{n:"절영해안산책로 인증",t:"명소"},{n:"영도 단팥빵",t:"맛집"},{n:"흰여울 해안터널 통과",t:"체험"}] },
  { contentid:"c08", title:"독일마을", sido:"경남", sigungu:"남해", sgg:"38350", region:"gyeongnam", themes:["sea","city"], distanceKm:350, depop:true, grad:["#D98E55","#A85E2C"],
    overview:"파독 광부·간호사들이 정착한 이국적 언덕마을. 빨간 지붕 너머로 물건리 바다가 보입니다.",
    missions:[{n:"독일마을 전망 인증",t:"명소"},{n:"독일식 소시지 플래터",t:"맛집"},{n:"방조어부림 산책",t:"체험"}] },
  { contentid:"c09", title:"전주 한옥마을", sido:"전북", sigungu:"전주", sgg:"35011", region:"jeonbuk", themes:["history","city","food"], distanceKm:210, depop:false, grad:["#C25A4A","#8C3527"],
    overview:"기와 물결이 끝없이 이어지는 한옥 군락. 골목마다 한복, 공방, 그리고 전주의 맛이 있습니다.",
    missions:[{n:"경기전 돌담 인증",t:"명소"},{n:"전주비빔밥 한 상",t:"맛집"},{n:"한복 입고 골목 산책",t:"체험"}] },
  { contentid:"c10", title:"아우라지", sido:"강원", sigungu:"정선", sgg:"32350", region:"gangwon", themes:["nature","history"], distanceKm:215, depop:true, grad:["#3C9B8E","#1F6A60"],
    overview:"두 물줄기가 어우러지는 강가. 정선아리랑의 발원지로, 레일바이크와 함께 즐기는 산골 풍경입니다.",
    missions:[{n:"아우라지 처녀상 인증",t:"명소"},{n:"정선 곤드레밥",t:"맛집"},{n:"레일바이크 타기",t:"체험"}] },
  { contentid:"c11", title:"산수유마을", sido:"경북", sigungu:"의성", sgg:"37320", region:"gyeongbuk", themes:["nature"], distanceKm:260, depop:true, grad:["#D7A93A","#A87B1C"],
    overview:"노란 산수유가 마을을 통째로 물들이는 봄의 명소. 돌담길을 따라 꽃터널이 이어집니다.",
    missions:[{n:"산수유 꽃터널 인증",t:"명소"},{n:"의성 마늘 한우",t:"맛집"},{n:"돌담길 한 바퀴",t:"체험"}] },
  { contentid:"c12", title:"김광석다시그리기길", sido:"대구", sigungu:"중구", sgg:"22010", region:"daegu", themes:["city","history"], distanceKm:240, depop:false, grad:["#9B6BC8","#623E8C"],
    overview:"가수 김광석을 기리는 벽화 골목. 노래가 흐르는 골목을 따라 그의 그림과 가사가 이어집니다.",
    missions:[{n:"김광석 벽화 앞 인증",t:"명소"},{n:"방천시장 야시장 먹거리",t:"맛집"},{n:"라이브 버스킹 듣기",t:"체험"}] },
  { contentid:"c13", title:"송지호 해변", sido:"강원", sigungu:"고성", sgg:"32400", region:"gangwon", themes:["sea","nature"], distanceKm:205, depop:true, grad:["#2E9BC4","#176F92"],
    overview:"동해 최북단의 잔잔한 석호와 백사장. 철새가 머무는 호수와 탁 트인 바다를 한 번에 만납니다.",
    missions:[{n:"송지호 백사장 인증",t:"명소"},{n:"고성 명태 요리",t:"맛집"},{n:"왕곡마을 한옥 산책",t:"체험"}] },
  { contentid:"c14", title:"오동도", sido:"전남", sigungu:"여수", sgg:"36020", region:"jeonnam", themes:["sea","nature"], distanceKm:370, depop:false, grad:["#2C8FB0","#155E7A"],
    overview:"동백숲이 우거진 바다 위의 섬. 방파제 길을 따라 걸어 들어가면 등대와 탁 트인 남해가 맞이합니다.",
    missions:[{n:"오동도 등대 인증",t:"명소"},{n:"여수 게장백반",t:"맛집"},{n:"동백열차 타기",t:"체험"}] },
];
