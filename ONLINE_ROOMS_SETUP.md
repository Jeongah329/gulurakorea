# 실시간 온라인 방 기능 켜기

이번 변경으로 "친구와 같은 게임판"은 더 이상 가짜 데이터(은하·정아)를 채워 넣지 않고,
실제로 코드/링크로 들어온 사람이 Firestore를 통해 실시간으로 방에 표시됩니다.
동작하려면 Firebase 프로젝트를 하나 만들어 연결해야 합니다. (무료 Spark 요금제로 충분합니다.)

## 1. Firebase 프로젝트 만들기

1. https://console.firebase.google.com 접속 → "프로젝트 추가"
2. 프로젝트 이름 입력 (Google Analytics는 꺼도 무방)
3. 왼쪽 메뉴 **빌드 > Firestore Database** → "데이터베이스 만들기" → **테스트 모드로 시작** (일단 테스트 모드로 시작하고, 아래 3번에서 보안 규칙을 교체하세요)
4. 왼쪽 상단 톱니바퀴 → **프로젝트 설정 > 일반** → 아래로 스크롤 "내 앱" → 웹 아이콘(`</>`)으로 앱 추가 → 이름 아무거나 입력 → "Firebase Hosting 설정"은 체크 해제해도 됨
5. 표시되는 `firebaseConfig` 값을 그대로 복사

## 2. `.env` 채우기

`.env.example`을 `.env`로 복사한 뒤, 방금 복사한 값을 채웁니다.

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**배포(Netlify 등)에도 같은 값을 환경변수로 등록해야** 실제 배포 주소에서 동작합니다.
(Netlify: Site settings → Environment variables)

## 3. Firestore 보안 규칙 교체 (중요)

테스트 모드 규칙은 30일 후 만료되고, 누구나 전체 DB를 읽고 쓸 수 있어 위험합니다.
Firestore Database → 규칙 탭에서 아래로 교체하세요. `rooms` 컬렉션만 열어주고,
문서 하나(=방 하나)에 한 번에 쓸 수 있는 범위를 제한합니다.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomCode} {
      allow read: if true;                 // 코드만 알면 누구나 방 상태를 볼 수 있음 (필요한 동작)
      allow create: if request.resource.data.keys().hasAll(['code','members','ownership']);
      allow update: if true;               // 캐주얼 게임이라 별도 인증 없이 누구나 참여/갱신 가능
      allow delete: if false;
    }
  }
}
```

> 참고: 이 앱은 별도 로그인 시스템이 없고, 기기별 익명 ID(로컬 저장소)만 사용합니다.
> 즉 "코드를 아는 사람은 누구나 그 방에 참여/쓰기 가능"이 의도된 동작입니다.
> 더 엄격하게 하려면 Firebase Anonymous Auth를 추가하고 규칙에서
> `request.auth != null` 조건을 넣는 방식으로 확장할 수 있습니다.

## 4. 확인

```bash
npm install
npm run dev
```

1. 브라우저에서 "방 만들기" → 코드가 발급되면 Firebase 콘솔의 Firestore Database에
   `rooms/KR-XXXX` 문서가 실제로 생기는지 확인하세요.
2. 다른 브라우저(시크릿 창)나 다른 기기에서 "친구 초대" → 링크 열기 → 코드가 자동 입력된 상태로
   뜨는지 확인 → "참여" 클릭 → 두 화면 모두에 서로가 실시간으로 나타나는지 확인하세요.

## 카카오톡 공유가 안 될 때

"카카오톡으로 초대" 버튼이 실패하면 대부분 아래 둘 중 하나입니다.

- Kakao Developers 콘솔 → 내 애플리케이션 → **앱 설정 > 플랫폼 > Web** 에
  실제 배포 주소(예: `https://gulura-korea.netlify.app`)가 등록돼 있지 않음
- **제품 설정 > 카카오톡 공유**가 활성화(ON)돼 있지 않음

두 설정 모두 Kakao Developers 콘솔(https://developers.kakao.com)에서 확인/수정할 수 있습니다.
실패 시 앱이 자동으로 이유를 안내 메시지로 보여주고, 링크 복사로 대신 초대할 수 있게 폴백합니다.
