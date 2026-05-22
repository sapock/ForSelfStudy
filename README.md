# Studia 학습관

플래시카드 기반 개인 학습 앱입니다. 과목과 챕터를 만들어 학습 항목을 관리하고, 퀴즈로 실력을 점검하며, AI로 학습 자료를 자동 생성할 수 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대시보드 | 학습 현황 한눈에 보기, 오늘 복습할 항목, 연속 학습 기록 |
| 자료 관리 | 과목 → 챕터 → 항목 구조로 학습 자료 관리 |
| 퀴즈 | 객관식 4지선다 / 플래시카드 뒤집기 두 가지 모드 |
| 간격 반복 | 정답률에 따라 다음 복습 날짜 자동 조정 |
| AI 자동 생성 | 주제를 입력하면 Claude AI가 플래시카드 자동 생성 |
| 통계 | 학습 히트맵, 과목별 진도, 자주 틀린 항목 분석 |

---

## 실행 방법

### 방법 1 — 데스크톱 앱 (다운로드해서 바로 실행)

1. [Releases 페이지](https://github.com/sapock/ForSelfStudy/releases)에서 운영체제에 맞는 파일 다운로드
   - **Windows**: `Studia-Windows-x64.zip`
   - **Mac**: `Studia-Mac.dmg`
   - **Linux**: `Studia-Linux-x64.AppImage`

2. Windows 기준 실행 방법:
   - zip 파일 압축 해제
   - `win-unpacked/Studia.exe` 더블클릭

3. **AI 자동 생성 기능**을 사용하려면 `Studia.exe`와 같은 폴더에 `.env` 파일 생성:
   ```
   ANTHROPIC_API_KEY=sk-ant-여기에_API_키_입력
   ```
   > API 키는 [console.anthropic.com](https://console.anthropic.com)에서 발급받을 수 있습니다.

---

### 방법 2 — 소스 코드로 직접 실행 (개발자용)

#### 사전 준비

- [Node.js 20 이상](https://nodejs.org) 설치 필요

#### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/sapock/ForSelfStudy.git
cd ForSelfStudy/studia

# 의존성 설치
npm install

# 환경변수 설정 (AI 기능 사용 시)
cp .env.example .env
# .env 파일을 열어 ANTHROPIC_API_KEY 값 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하면 앱이 실행됩니다.

> `npm run dev`는 React 프론트엔드(포트 5173)와 API 서버(포트 3001)를 동시에 실행합니다.

---

### 방법 3 — 데스크톱 앱 직접 빌드

소스 코드를 수정하고 직접 exe/dmg/AppImage를 만들고 싶을 때 사용합니다.

```bash
cd ForSelfStudy/studia

npm install

# Windows exe 빌드
npm run electron:build:win

# Linux AppImage 빌드
npm run electron:build:linux
```

빌드 결과물은 `studia/release/` 폴더에 생성됩니다.

#### GitHub Actions로 자동 빌드

[Actions 탭](https://github.com/sapock/ForSelfStudy/actions)에서 **Build Desktop App** → **Run workflow** 클릭 후 원하는 플랫폼(Windows / Mac / Linux)을 선택해 빌드할 수 있습니다.

---

## 프로젝트 구조

```
ForSelfStudy/
└── studia/                  # 앱 소스
    ├── src/
    │   ├── components/      # UI 컴포넌트 (버튼, 모달, 아이콘 등)
    │   ├── screens/         # 화면 단위 컴포넌트 (대시보드, 퀴즈, 통계)
    │   ├── hooks/           # 커스텀 훅 (localStorage, 과목 데이터)
    │   ├── styles/          # CSS 디자인 토큰 및 공통 스타일
    │   └── types/           # TypeScript 타입 정의
    ├── server/              # Express API 서버 (Anthropic AI 연동)
    ├── electron/            # Electron 데스크톱 앱 진입점
    └── public/              # 폰트, 아이콘 등 정적 파일
```

---

## 기술 스택

- **프론트엔드**: React 19, TypeScript, Vite
- **스타일**: 순수 CSS (OPUS-X 디자인 시스템)
- **데이터 저장**: localStorage (별도 DB 불필요)
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`)
- **데스크톱**: Electron 42
- **백엔드**: Express.js (AI API 프록시)
