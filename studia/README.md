# Studia — 개발자 가이드

이 폴더는 Studia 앱의 전체 소스 코드입니다. 자세한 설치 및 실행 방법은 [루트 README](../README.md)를 참고하세요.

## 빠른 시작

```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY 입력
npm run dev            # http://localhost:5173
```

## 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (React + API 서버 동시) |
| `npm run build` | 프로덕션 빌드 |
| `npm run electron:build:win` | Windows 데스크톱 앱 빌드 |
| `npm run electron:build:linux` | Linux 데스크톱 앱 빌드 |
