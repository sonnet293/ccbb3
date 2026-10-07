# 시시비비 사이트 설정 가이드

- **Firebase**: 이메일 로그인(관리자), Firestore(메인/배너 정보, 달력 일정, 플레이리스트, 방명록)
- **Supabase**: Storage만 사용(이미지·음악 파일)

Supabase는 Firebase 로그인 토큰을 그대로 인정하도록 연결합니다(Third-Party Auth).
그래서 Supabase에는 따로 계정을 만들 필요가 없고, Firebase 관리자로 로그인하면 업로드가 가능합니다.

---

## 1. Firebase

### 1-1. 이메일 로그인 켜기
1. [Firebase 콘솔](https://console.firebase.google.com) → `ccbb-6cde8` 프로젝트
2. **Authentication → Sign-in method → 이메일/비밀번호** 사용 설정
3. **Authentication → Users → 사용자 추가** 로 관리자 계정을 사람 수만큼 생성 (최대 5명 기준)
4. 각 사용자의 **사용자 UID** 를 복사해 둡니다 (firestore.rules 와 setup.sql 두 곳의 목록에 넣음)
5. (권장) **Authentication → Settings → 사용자 작업(User actions)** 에서 *생성(가입) 사용* 체크 해제
   → 사이트에 회원가입이 없어도 API로 가입하는 것을 막습니다.

### 1-2. Firestore
1. **Firestore Database → 데이터베이스 만들기** (위치는 `asia-northeast3 (서울)` 추천, 프로덕션 모드)
2. **규칙** 탭에 [firestore.rules](firestore.rules) 내용을 붙여넣고 관리자 UID 목록을 채운 뒤 **게시**

---

## 2. Supabase (Storage)

### 2-1. 프로젝트 만들기
1. [supabase.com](https://supabase.com) 가입 → **New project**
2. 이름 자유, Region은 `Northeast Asia (Seoul)` 추천, DB 비밀번호는 아무거나(이 사이트에선 안 씀)

### 2-2. 키를 코드에 넣기
1. **Project Settings → API Keys** (또는 **Data API**)
2. **Project URL** 과 **anon public** 키(또는 `sb_publishable_...` 키)를 복사
3. [js/supabase.js](js/supabase.js) 의 아래 두 줄에 붙여넣기
   ```js
   const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJ... 또는 sb_publishable_...";
   ```
   > 이 키들은 공개되어도 되는 키입니다. **service_role / secret 키는 절대 넣지 마세요.**

### 2-3. Firebase 로그인 연결 (Third-Party Auth)
1. **Authentication → Sign In / Providers → Third-Party Auth** (메뉴 위치가 바뀌었다면 "Third-Party Auth" 검색)
2. **Add provider → Firebase Auth**
3. Firebase Project ID 에 `ccbb-6cde8` 입력 후 저장

### 2-4. 버킷과 권한 만들기
1. **SQL Editor → New query**
2. [supabase/setup.sql](supabase/setup.sql) 내용을 붙여넣고 관리자 UID 목록을 채운 뒤 **Run**
3. **Storage** 메뉴에 `ccbb` 버킷(Public)이 생겼는지 확인

---

## 3. 실행

ES 모듈을 쓰기 때문에 `index.html` 을 더블클릭(file://)하면 동작하지 않습니다. 로컬 서버로 여세요.

- VS Code 확장 **Live Server** 설치 → `index.html` 우클릭 → *Open with Live Server*
- 또는 터미널에서 `npx serve .`

배포(Firebase Hosting, Netlify, GitHub Pages 등) 후에는
Firebase 콘솔 **Authentication → Settings → 승인된 도메인** 에 배포 도메인을 추가하세요.

---

## 4. 사용법

| 기능 | 방문자 | 관리자(로그인 후) |
|---|---|---|
| 메인 이미지 / 배너 | 보기, 배너 클릭 시 링크 이동 | 마우스를 올리면 `이미지 변경` / `링크` 버튼 |
| 달력 | 날짜 클릭 → 일정 보기 | 날짜 팝업에서 일정 추가/삭제 |
| 방명록 (말풍선 아이콘) | 이름+내용으로 글 남기기 | 답글 달기, 삭제 |
| 음악 플레이어 | 재생/이전/다음, 목록에서 선택 | 목록 버튼 → `+ 음악 추가` (업로드하면 바로 재생), 삭제 |

로그인 버튼은 네비게이션바 오른쪽 끝의 작은 `로그인` 입니다.

## 관리자 추가 / 제거

1. Firebase 콘솔 **Authentication → Users** 에서 계정 추가(또는 삭제)하고 UID 복사
2. [firestore.rules](firestore.rules) 목록 수정 → Firebase 콘솔 Firestore **규칙** 탭에 붙여넣고 **게시**
3. [supabase/setup.sql](supabase/setup.sql) 목록 수정 → Supabase **SQL Editor** 에서 다시 **Run**

두 곳 중 한 곳만 바꾸면 "글/일정은 되는데 사진 업로드만 안 됨" 같은 상태가 됩니다.
남는 `ADMIN_UID_n` 자리는 그대로 두거나 지워도 됩니다(어떤 실제 UID와도 일치하지 않음).

## 데이터 구조 (참고)

- `site/config` : `{ main: {url, path}, banner1: {url, path, link}, banner2: {...} }`
- `events/{id}` : `{ date: "YYYY-MM-DD", title, createdAt }`
- `tracks/{id}` : `{ title, url, path, createdAt }`
- `guestbook/{id}` : `{ name, message, createdAt, reply? }`
- Supabase `ccbb` 버킷: `main/`, `banners/`, `music/` 폴더
