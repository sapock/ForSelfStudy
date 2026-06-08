import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MarkdownViewer } from '../ui/MarkdownViewer';
import type { Chapter } from '../../types';

interface ChapterBlockProps {
  chapter: Chapter;
  subjectName: string;
  onQuiz: () => void;
  onUpdateDescription: (description: string) => void;
}

export function ChapterBlock({ chapter, subjectName, onQuiz, onUpdateDescription }: ChapterBlockProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chapter.description);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  function openEdit() {
    setDraft(chapter.description);
    setEditing(true);
    if (!open) setOpen(true);
  }

  function saveEdit() {
    onUpdateDescription(draft);
    setEditing(false);
  }

  function cancelEdit() {
    setDraft(chapter.description);
    setEditing(false);
  }

  async function aiGenerate() {
    setGenerating(true);
    setGenError(null);
    if (!open) setOpen(true);
    try {
      const prompt = `당신은 학습 자료 전문 작성자입니다. 다음 챕터에 대한 상세한 학습 노트를 한국어 Markdown 형식으로 작성해주세요.

과목: ${subjectName}
챕터: ${chapter.name}

다음 내용을 포함하세요:
- 핵심 개념 설명
- 주요 용어 정의
- 적절한 경우 표(table) 사용
- 관련된 경우 코드 예시 포함
- 요약 정리

한국어로 작성하고 시험에 도움이 될 만큼 상세하게 작성하세요. Markdown 내용만 출력하고 서문은 쓰지 마세요.`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const { text } = await res.json();
      onUpdateDescription(text.trim());
    } catch (e) {
      setGenError((e as Error).message || 'AI 생성 중 오류가 발생했어요.');
    } finally {
      setGenerating(false);
    }
  }

  const score = chapter.lastQuizScore;
  const scoreColor = score != null
    ? score >= 80 ? 'var(--green-700)' : score >= 60 ? 'var(--yellow-700)' : 'var(--red-700)'
    : null;
  const scoreBg = score != null
    ? score >= 80 ? 'var(--green-50)' : score >= 60 ? 'var(--yellow-50)' : 'var(--red-50)'
    : null;

  return (
    <div className="ch-block">
      <div className="ch-head" onClick={() => setOpen(o => !o)}>
        <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
          <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} />
          <div className="ch-name">{chapter.name}</div>
          {scoreColor && (
            <span style={{ font: '600 11px/16px var(--font-mono)', color: scoreColor, background: scoreBg!, padding: '1px 8px', borderRadius: 1000 }}>
              최근 {score}점
            </span>
          )}
          {!chapter.description && <Badge tone="neutral">미작성</Badge>}
        </div>
        <div className="row" style={{ gap: 6 }} onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" leadingIcon="pencil" onClick={openEdit}>편집</Button>
          <Button variant="ghost" size="sm" leadingIcon="sparkles" onClick={aiGenerate} disabled={generating}>
            {generating ? 'AI 생성 중...' : 'AI 생성'}
          </Button>
          <Button variant="outline" size="sm" leadingIcon="zap" onClick={e => { e.stopPropagation(); onQuiz(); }}>
            챕터 퀴즈
          </Button>
        </div>
      </div>

      {open && (
        <div className="ch-desc-body">
          {editing ? (
            <div style={{ padding: 20 }}>
              <textarea
                className="textarea"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Markdown 형식으로 학습 내용을 작성하세요...&#10;&#10;예시:&#10;## 핵심 개념&#10;- 개념 1: 설명&#10;- 개념 2: 설명&#10;&#10;## 주요 용어&#10;| 용어 | 설명 |&#10;|---|---|&#10;| 용어1 | 설명1 |"
                style={{ minHeight: 360, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '20px' }}
              />
              <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <Button variant="outline" size="md" onClick={cancelEdit}>취소</Button>
                <Button variant="solid-primary" size="md" leadingIcon="check" onClick={saveEdit}>저장</Button>
              </div>
            </div>
          ) : chapter.description ? (
            <div style={{ padding: 24 }}>
              <MarkdownViewer content={chapter.description} />
            </div>
          ) : (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-500)' }}>
              <Icon name="file-text" size={28} style={{ color: 'var(--gray-300)', marginBottom: 10 }} />
              <div style={{ font: '600 14px/20px var(--font-sans)', color: 'var(--gray-700)', marginBottom: 4 }}>
                학습 내용이 없어요
              </div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>직접 작성하거나 AI로 자동 생성하세요.</div>
              <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
                <Button variant="outline" size="md" leadingIcon="pencil" onClick={openEdit}>직접 작성</Button>
                <Button variant="solid-primary" size="md" leadingIcon="sparkles" onClick={aiGenerate} disabled={generating}>
                  AI로 생성
                </Button>
              </div>
            </div>
          )}

          {generating && (
            <div className="ai-thinking" style={{ margin: '0 20px 20px' }}>
              <div className="ai-spinner" />
              AI가 학습 내용을 작성하고 있어요… 잠시만 기다려주세요.
            </div>
          )}
          {genError && (
            <div style={{ margin: '0 20px 20px', padding: 10, background: 'var(--red-50)', color: 'var(--red-700)', borderRadius: 8, fontSize: 13 }}>
              <Icon name="alert-triangle" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              {genError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
