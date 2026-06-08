import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) { res.status(400).json({ error: 'prompt required' }); return; }
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/quiz', async (req, res) => {
  const { chapters, count } = req.body as {
    chapters: { subjectId: string; chapterId: string; subjectName: string; chapterName: string; description: string }[];
    count: number;
  };
  if (!chapters?.length) { res.status(400).json({ error: 'chapters required' }); return; }

  const contextParts = chapters.map(c =>
    `[subjectId: ${c.subjectId}, chapterId: ${c.chapterId}]\n## ${c.subjectName} — ${c.chapterName}\n\n${c.description}`
  ).join('\n\n---\n\n');

  const prompt = `당신은 전문 시험 문제 출제자입니다. 아래 학습 자료를 바탕으로 객관식 4지선다 문제 ${count}개를 만들어주세요.
단순 암기보다는 이해도를 측정하는 문제를 출제하세요.

학습 자료:
${contextParts}

JSON만 출력하세요 (마크다운 펜스 없이):
{
  "questions": [
    {
      "id": "q1",
      "question": "문제 내용 (한국어)",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "answerIndex": 0,
      "explanation": "이 답이 정답인 이유 (한국어)",
      "chapterId": "위 학습 자료의 chapterId",
      "subjectId": "위 학습 자료의 subjectId"
    }
  ]
}

규칙:
- 모든 텍스트는 한국어
- 보기는 정확히 4개
- answerIndex는 0~3
- 여러 챕터가 있을 경우 고루 출제
- 명확하고 모호하지 않은 문제 출제`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    let data: { questions?: unknown[] };
    try { data = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      data = m ? JSON.parse(m[0]) : { questions: [] };
    }
    res.json({ questions: data.questions ?? [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on :${PORT}`));
