# 개인 학습 프로그램 설계

_Started 2026-05-15 06:55 UTC_

---

## User

내가 개인적으로 공부를 위해 사용할 프로그램을 만들고 싶어. 어떤 언어와 UX 를 사용해야할지는 잘 모르겠어.  
- 윈도우 OS 에서 실행해서 사용
- 공부할 자료는 별도로 입력하거나, 자동 생성할 수 있도록 (AI 가 검색해서 추가) 기능 추가
- 진도 체크 기능 필요
- 별표 표시 기능 필요
- 전체 목록 조회 및 챕터별 정리 기능
- 랜덤 퀴즈

등등 너가 필요하다고 생각하는 기능 넣어서 디자인 만들어줘

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: copy_files]_

_[tool: read_file]_

좋습니다. Windows 데스크톱에서 사용하는 개인 학습 앱을 OPUS-X 디자인 시스템으로 만들어드리겠습니다. 한국어 UI에 모든 기능 + 추가 기능(연속 학습일, 복습 일정, 통계)을 포함한 인터랙티브 프로토타입으로 디자인하겠습니다.

_[tool: copy_starter_component]_

_[tool: write_file]_

이제 앱을 만들겠습니다. 데이터 → 컴포넌트 → 화면별 → 메인 셸 순으로 분리해서 구성하겠습니다.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now let me write the index.html shell:

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: fork_verifier_agent]_

완성했습니다. **Studia · 학습관** — Windows 데스크톱에서 사용할 개인 학습 앱 프로토타입입니다.

## 포함된 화면 & 기능
- **창 프레임** — Windows 11 스타일 타이틀바 (최소화/최대화/닫기)
- **대시보드** — 인사말 hero, 연속 학습 스트릭, KPI 4개, 이어서 학습하기, 오늘 복습 항목, 주간 활동 차트, 마스터리 링, 최근 활동, AI 자료 생성 CTA
- **학습 자료** — 카드/리스트 토글, 필터(진행 중·완료·별표), 정렬, 검색
- **과목 상세** — 챕터 아코디언, 항목별 별표·진도 사이클(미학습→학습중→완료)·정/오답 카운트, 탭(챕터별·모든 항목·별표만·메모)
- **퀴즈** — 출제 범위(전체/별표/틀린 적/미학습), 객관식 4지선다 + 플래시카드 모드, 결과 화면(정답률 링, 틀린 항목 다시 풀기)
- **자료 추가 모달** — 3가지 모드:
  - ✨ **AI 자동 생성** — `window.claude.complete` 호출로 **실제 동작**합니다 (주제 입력 → 챕터·항목 자동 생성 → 미리보기 → 저장)
  - 직접 입력 — 과목/챕터/항목 수동 추가
  - 가져오기 — CSV·Anki·Markdown 자리표시자
- **통계** — 100일 히트맵, 과목별 진도/정답률 표, 시간대별 학습 패턴, 잘 외워지지 않는 항목 Top 5

## Tweaks 패널 (우측 하단 토글)
- 밀도: 보통 / 조밀
- 자료 보기: 카드 / 리스트
- Windows 창 프레임 on/off

## 권장 다음 단계
- 어떤 언어/플랫폼으로 만들지: 이 UX 그대로라면 **Electron + React** 또는 **Tauri + React**가 가장 빠른 길이에요. .NET MAUI나 WinUI 3로도 가능합니다
- 추가하고 싶은 기능: 음성 듣기(TTS), Pomodoro 타이머, OCR로 책 사진→자동 카드 생성, 시험 D-day 등

원하시는 화면이나 흐름이 있으면 거기부터 더 깊게 파고들 수 있습니다.

