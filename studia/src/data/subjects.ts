import type { Subject, StreakDay, ActivityEntry } from '../types';

const NOW = Date.now();
const DAY = 86400000;

function mk(term: string, def: string, opts: {
  id?: string; starred?: boolean; mastered?: 0|1|2;
  correct?: number; wrong?: number;
  lastReviewedAt?: number | null; nextReviewAt?: number | null; note?: string;
} = {}) {
  return {
    id: opts.id || Math.random().toString(36).slice(2, 10),
    term, def,
    starred: !!opts.starred,
    mastered: (opts.mastered ?? 0) as 0|1|2,
    correct: opts.correct || 0,
    wrong:   opts.wrong   || 0,
    lastReviewedAt: opts.lastReviewedAt ?? null,
    nextReviewAt:   opts.nextReviewAt   ?? (NOW + Math.floor(Math.random() * 5 - 1) * DAY),
    note: opts.note || '',
  };
}

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: "sub-info",
    name: "정보처리기사 · 필기",
    emoji: "💻",
    accent: "purple",
    category: "IT 자격증",
    description: "5과목 통합 핵심 키워드 및 기출 개념 정리",
    color: "var(--purple-600)",
    chapters: [
      {
        id: "ch-sw-design",
        name: "1과목 · 소프트웨어 설계",
        items: [
          mk("요구사항 분석", "이해관계자의 요구를 식별·문서화·검증하는 단계. 기능/비기능 요구로 구분된다.", { mastered: 2, correct: 4, wrong: 0, starred: true, lastReviewedAt: NOW - DAY }),
          mk("UML 다이어그램 종류", "구조 다이어그램(클래스·객체·컴포넌트·배치 등) 6종 + 행위 다이어그램(유스케이스·시퀀스·상태·활동·통신·상호작용 개요·타이밍) 7종.", { mastered: 1, correct: 2, wrong: 1 }),
          mk("디자인 패턴 GoF 3분류", "생성(Creational), 구조(Structural), 행위(Behavioral) 패턴.", { mastered: 2, correct: 3, wrong: 0, starred: true }),
          mk("애자일 방법론 4가지 가치", "개인과 상호작용 > 프로세스, 작동하는 SW > 문서, 고객과의 협력 > 계약, 변화 대응 > 계획.", { mastered: 1, correct: 1, wrong: 1 }),
          mk("소프트웨어 아키텍처 4+1 뷰", "논리·프로세스·구현·배치 + 유스케이스 뷰.", { mastered: 0 }),
          mk("MVC 패턴", "Model(데이터) · View(표현) · Controller(입력 처리). 관심사 분리로 유지보수성 향상.", { mastered: 2, correct: 5, wrong: 1, starred: true }),
        ],
      },
      {
        id: "ch-data-io",
        name: "2과목 · 데이터 입출력 구현",
        items: [
          mk("정규화 1NF~3NF", "1NF 원자값 / 2NF 부분종속 제거 / 3NF 이행종속 제거.", { mastered: 2, correct: 4, wrong: 0 }),
          mk("트랜잭션 ACID", "Atomicity · Consistency · Isolation · Durability.", { mastered: 1, correct: 2, wrong: 0, starred: true }),
          mk("인덱스 종류", "B-Tree, Bitmap, Hash, Clustered/Non-clustered, Composite.", { mastered: 0 }),
          mk("DCL 명령어", "GRANT, REVOKE, COMMIT, ROLLBACK — 데이터 제어어.", { mastered: 1, correct: 1, wrong: 1 }),
          mk("이상현상(Anomaly)", "삽입·갱신·삭제 이상. 정규화로 해소.", { mastered: 0 }),
        ],
      },
      {
        id: "ch-server",
        name: "4과목 · 서버 프로그램 구현",
        items: [
          mk("배치 스케줄러 종류", "Spring Batch, Quartz, Control-M — 작업 정의·실행·모니터링 도구.", { mastered: 0 }),
          mk("DI(의존성 주입)", "객체 간 결합도를 낮추기 위해 외부에서 의존 객체를 주입하는 방식.", { mastered: 1, correct: 2, wrong: 0 }),
          mk("WAS의 역할", "동적 컨텐츠 처리, 트랜잭션 관리, 세션 관리, 보안.", { mastered: 1, correct: 1, wrong: 0 }),
          mk("REST 6원칙", "Client-Server · Stateless · Cacheable · Uniform Interface · Layered · Code on Demand.", { mastered: 0, starred: true }),
        ],
      },
      {
        id: "ch-interface",
        name: "5과목 · 인터페이스 구현",
        items: [
          mk("JSON vs XML", "JSON: 경량·키밸류·자바스크립트 친화. XML: 문서지향·스키마·확장성.", { mastered: 2, correct: 3, wrong: 0 }),
          mk("EAI 유형 4가지", "Point-to-Point · Hub & Spoke · Message Bus · Hybrid.", { mastered: 0 }),
          mk("OAuth 2.0 흐름", "Authorization Code · Implicit · Password · Client Credentials 그랜트.", { mastered: 0 }),
        ],
      },
    ],
  },
  {
    id: "sub-os",
    name: "운영체제",
    emoji: "⚙️",
    accent: "blue",
    category: "전공 · CS",
    description: "프로세스, 메모리, 파일 시스템 핵심 개념",
    color: "var(--blue-600)",
    chapters: [
      {
        id: "ch-process",
        name: "프로세스 & 스레드",
        items: [
          mk("PCB 구성요소", "PID · 프로세스 상태 · PC · 레지스터 · 메모리 정보 · 스케줄링 정보.", { mastered: 2, correct: 5, wrong: 0, starred: true }),
          mk("문맥 교환(Context Switch)", "CPU가 한 프로세스에서 다른 프로세스로 전환할 때 상태를 저장·복원하는 과정. 오버헤드 발생.", { mastered: 1, correct: 2, wrong: 1 }),
          mk("스레드 vs 프로세스", "스레드는 자원을 공유, 프로세스는 독립. 스레드 생성·전환 비용이 낮음.", { mastered: 2, correct: 3, wrong: 0 }),
          mk("스케줄링 알고리즘", "FCFS · SJF · Priority · RR · MLFQ.", { mastered: 1, correct: 1, wrong: 1, starred: true }),
          mk("교착상태 4조건", "상호배제 · 점유와대기 · 비선점 · 순환대기.", { mastered: 0, starred: true }),
          mk("세마포어 vs 뮤텍스", "세마포어: 카운터 기반 동기화. 뮤텍스: 1개의 임계영역 잠금(소유권 있음).", { mastered: 0 }),
        ],
      },
      {
        id: "ch-memory",
        name: "메모리 관리",
        items: [
          mk("가상 메모리", "물리 메모리보다 큰 주소 공간을 제공. 페이지/세그먼트 단위로 관리.", { mastered: 1, correct: 2, wrong: 0 }),
          mk("페이지 교체 알고리즘", "FIFO · LRU · LFU · Optimal · Clock.", { mastered: 1, correct: 1, wrong: 2 }),
          mk("스래싱(Thrashing)", "페이지 부재율이 급증해 CPU가 페이지 교체에만 시간을 쓰는 상태.", { mastered: 0, starred: true }),
          mk("워킹셋", "프로세스가 일정 시간 동안 자주 참조하는 페이지 집합.", { mastered: 0 }),
        ],
      },
      {
        id: "ch-file",
        name: "파일 시스템",
        items: [
          mk("아이노드(inode)", "Unix 파일 메타데이터 구조체. 파일명 제외한 모든 정보.", { mastered: 0 }),
          mk("디스크 스케줄링", "FCFS · SSTF · SCAN · C-SCAN · LOOK · C-LOOK.", { mastered: 1, correct: 1, wrong: 0 }),
          mk("RAID 0/1/5/10", "0 스트라이핑·1 미러링·5 패리티 분산·10 미러링+스트라이핑.", { mastered: 0, starred: true }),
        ],
      },
    ],
  },
  {
    id: "sub-toeic",
    name: "TOEIC · Part 5 빈출",
    emoji: "🅰️",
    accent: "yellow",
    category: "어학",
    description: "출제 빈도 상위 단어/숙어 + 예문",
    color: "var(--yellow-600)",
    chapters: [
      {
        id: "ch-verbs",
        name: "빈출 동사 (V)",
        items: [
          mk("implement", "v. 시행하다, 구현하다 — implement a new policy 새 정책을 시행하다.", { mastered: 2, correct: 6, wrong: 0, starred: true }),
          mk("acquire", "v. 얻다, 인수하다 — acquire a competitor 경쟁사를 인수하다.", { mastered: 2, correct: 4, wrong: 0 }),
          mk("postpone", "v. 연기하다 (= delay) — postpone the meeting 회의를 연기하다.", { mastered: 1, correct: 2, wrong: 1, starred: true }),
          mk("retain", "v. 유지하다, 보유하다 — retain top talent 핵심 인재를 유지하다.", { mastered: 1, correct: 1, wrong: 1 }),
          mk("oversee", "v. 감독하다, 총괄하다 — oversee operations.", { mastered: 0 }),
          mk("expedite", "v. 신속히 처리하다 — expedite shipping 배송을 서두르다.", { mastered: 0 }),
          mk("comply with", "phr. ~을 준수하다 — comply with regulations.", { mastered: 0, starred: true }),
          mk("attribute A to B", "phr. A를 B의 탓/덕분으로 돌리다.", { mastered: 0 }),
        ],
      },
      {
        id: "ch-adj",
        name: "빈출 형용사 · 부사",
        items: [
          mk("substantial", "adj. 상당한 — a substantial increase 상당한 증가.", { mastered: 1, correct: 2, wrong: 0 }),
          mk("preliminary", "adj. 예비의, 사전의 — preliminary results.", { mastered: 0 }),
          mk("consecutive", "adj. 연속된 — three consecutive quarters.", { mastered: 0 }),
          mk("readily", "adv. 손쉽게, 기꺼이.", { mastered: 0 }),
        ],
      },
    ],
  },
  {
    id: "sub-history",
    name: "한국사 능력검정 · 심화",
    emoji: "📜",
    accent: "green",
    category: "자격증 · 인문",
    description: "기출 빈도 높은 인물·사건·제도",
    color: "var(--green-600)",
    chapters: [
      {
        id: "ch-three",
        name: "삼국시대",
        items: [
          mk("광개토대왕릉비", "414년 장수왕이 부친의 업적을 기리기 위해 세움. 만주 집안.", { mastered: 1, correct: 2, wrong: 0, starred: true }),
          mk("진흥왕 순수비", "신라 영토 확장 기념. 북한산·창녕·황초령·마운령.", { mastered: 0 }),
          mk("나당전쟁", "676년 매소성·기벌포 전투에서 신라가 당을 격퇴, 삼국통일 완성.", { mastered: 0 }),
        ],
      },
      {
        id: "ch-goryeo",
        name: "고려",
        items: [
          mk("훈요10조", "태조 왕건이 후대 왕에게 남긴 정치 지침.", { mastered: 0 }),
          mk("묘청의 서경천도운동", "1135년 김부식의 관군에 진압. 신채호 '조선역사상 일천년래 제일대사건'.", { mastered: 0, starred: true }),
          mk("팔만대장경", "고종 때 몽골 침입 격퇴 염원. 합천 해인사 보관, 유네스코 등재.", { mastered: 0 }),
        ],
      },
    ],
  },
  {
    id: "sub-jp",
    name: "일본어 · JLPT N3",
    emoji: "🇯🇵",
    accent: "purple",
    category: "어학",
    description: "N3 한자 · 문법 · 청해 핵심",
    color: "var(--purple-500)",
    chapters: [
      {
        id: "ch-kanji",
        name: "N3 한자",
        items: [
          mk("経済 (けいざい)", "경제. 経済学 경제학, 経済成長 경제성장.", { mastered: 0 }),
          mk("政治 (せいじ)", "정치. 政治家 정치인.", { mastered: 0, starred: true }),
          mk("環境 (かんきょう)", "환경. 環境問題 환경문제.", { mastered: 0 }),
        ],
      },
      {
        id: "ch-grammar",
        name: "N3 문법",
        items: [
          mk("〜ようにする", "~하도록 하다 (의식적 노력). 毎日運動するようにしている.", { mastered: 0 }),
          mk("〜ことにする", "~하기로 하다 (자신의 결정). 来年留学することにした.", { mastered: 0 }),
          mk("〜わけだ", "~인 셈이다, 당연하다.", { mastered: 0 }),
        ],
      },
    ],
  },
];

export const DEFAULT_STREAK_DAYS: StreakDay[] = [
  { d: "월", count: 12, ok: true },
  { d: "화", count: 18, ok: true },
  { d: "수", count: 6,  ok: true },
  { d: "목", count: 0,  ok: false },
  { d: "금", count: 22, ok: true },
  { d: "토", count: 14, ok: true },
  { d: "일", count: 9,  ok: true },
];

export const DEFAULT_ACTIVITY: ActivityEntry[] = [
  { when: "방금 전", text: "운영체제 · 프로세스 챕터에서 5개 항목 학습 완료." },
  { when: "12분 전", text: "TOEIC · implement 정답. 연속 정답 6회." },
  { when: "1시간 전", text: "정보처리기사 챕터 1 퀴즈 결과: 8/10 (80%)." },
  { when: "오늘 09:14", text: "AI로 '운영체제 · 동기화' 항목 12개 자동 생성." },
  { when: "어제", text: "한국사 · 삼국시대 챕터에 항목 3개 추가." },
];
