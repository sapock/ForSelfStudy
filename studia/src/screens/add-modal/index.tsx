import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { AIGenForm } from './AIGenForm';
import { ManualForm } from './ManualForm';
import type { Subject } from '../../types';

interface CreatePayload {
  target: 'new' | 'existing';
  targetSub?: string;
  subjectName: string;
  chapterName: string;
  emoji?: string;
  items: { term: string; def: string }[];
}

interface AddMaterialModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreatePayload) => void;
  subjects: Subject[];
}

export function AddMaterialModal({ open, onClose, onCreate, subjects }: AddMaterialModalProps) {
  const [mode, setMode] = useState<'ai'|'manual'|'import'>('ai');

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} width={680}
           title="자료 추가"
           sub="새 과목을 만들거나 기존 과목에 항목을 추가할 수 있어요.">
      <div className="tabs-pill">
        <button className={mode === 'ai' ? 'on' : ''} onClick={() => setMode('ai')}>✨ AI로 자동 생성</button>
        <button className={mode === 'manual' ? 'on' : ''} onClick={() => setMode('manual')}>직접 입력</button>
        <button className={mode === 'import' ? 'on' : ''} onClick={() => setMode('import')}>가져오기</button>
      </div>
      {mode === 'ai' && <AIGenForm onCreate={onCreate} onClose={onClose} subjects={subjects} />}
      {mode === 'manual' && <ManualForm onCreate={onCreate} onClose={onClose} subjects={subjects} />}
      {mode === 'import' && <ImportForm onClose={onClose} />}
    </Modal>
  );
}

function ImportForm({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <div style={{ border: '2px dashed var(--gray-300)', borderRadius: 12, padding: 36, textAlign: 'center', marginBottom: 12 }}>
        <Icon name="upload-cloud" size={32} style={{ color: 'var(--gray-400)', marginBottom: 8 }} />
        <div style={{ font: '600 14px/22px var(--font-sans)', color: 'var(--gray-800)', marginBottom: 4 }}>
          CSV · 엑셀 · Anki(.apkg) · Markdown 파일을 끌어다 놓으세요
        </div>
        <div className="muted" style={{ font: '400 12px/18px var(--font-sans)' }}>또는 클릭해서 파일을 선택할 수 있어요</div>
        <Button variant="outline" size="md" leadingIcon="folder" style={{ marginTop: 12 }}>파일 선택</Button>
      </div>
      <div className="muted" style={{ font: '400 12px/18px var(--font-sans)' }}>
        가져온 자료는 즉시 챕터로 정리되며, 항목별로 별표·진도 상태가 보존돼요.
      </div>
      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose}>닫기</Button>
      </div>
    </div>
  );
}
