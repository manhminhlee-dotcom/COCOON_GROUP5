import { answerCocoonQuestion } from '../src/data/cocoonKnowledge.ts';
import { timingSafeEqual } from 'node:crypto';

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (value: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const requestWindows = new Map<string, { start: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const unlockAttempts = new Map<string, { start: number; count: number }>();

function getClientKey(request: ApiRequest) {
  const forwarded = request.headers['x-forwarded-for'];
  const address = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim();
  return address || 'unknown-client';
}

function isRateLimited(request: ApiRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.start >= WINDOW_MS) {
    requestWindows.set(key, { start: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function numericFacts(text: string) {
  return (text.match(/\d+(?:[.,]\d+)*/g) || []).map((value) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''));
}

function hasUnsupportedNumbers(answer: string, evidence: string) {
  const evidenceNumbers = new Set(numericFacts(evidence));
  return numericFacts(answer).some((value) => !evidenceNumbers.has(value));
}

function outputText(response: unknown): string {
  if (!response || typeof response !== 'object' || !('output_text' in response)) return '';
  const value = (response as { output_text?: unknown }).output_text;
  return typeof value === 'string' ? value.trim() : '';
}

function isUnlockLimited(request: ApiRequest) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = unlockAttempts.get(key);
  if (!current || now - current.start >= 10 * WINDOW_MS) {
    unlockAttempts.set(key, { start: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

function safeCodeMatch(provided: string, configured: string) {
  const providedBytes = Buffer.from(provided);
  const configuredBytes = Buffer.from(configured);
  return providedBytes.length === configuredBytes.length && timingSafeEqual(providedBytes, configuredBytes);
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.COCOON_CHAT_MODEL || 'gpt-6-astra';

  if (request.method === 'GET') {
    response.status(200).json({ configured: Boolean(apiKey), model: apiKey ? model : undefined });
    return;
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = request.body && typeof request.body === 'object' ? request.body as Record<string, unknown> : {};
  if (body.action === 'knowledge-control') {
    const configuredCode = process.env.COCOON_ADMIN_CODE;
    const configuredLockCode = process.env.COCOON_LOCK_CODE;
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    if (!/^\d{4}$/.test(code) || !configuredCode || !configuredLockCode) {
      response.status(200).json({ isCommand: false });
      return;
    }
    if (isUnlockLimited(request)) {
      response.status(429).json({ isCommand: true, error: 'Đã vượt số lần thử. Hãy đợi 10 phút rồi thử lại.' });
      return;
    }
    if (safeCodeMatch(code, configuredCode)) {
      unlockAttempts.delete(getClientKey(request));
      response.status(200).json({ isCommand: true, unlocked: true });
      return;
    }
    if (safeCodeMatch(code, configuredLockCode)) {
      unlockAttempts.delete(getClientKey(request));
      response.status(200).json({ isCommand: true, locked: true });
      return;
    }
    response.status(200).json({ isCommand: false });
    return;
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (question.length < 2 || question.length > 240) {
    response.status(400).json({ error: 'Câu hỏi cần có từ 2 đến 240 ký tự.' });
    return;
  }

  const grounded = answerCocoonQuestion(question);
  if (!grounded.sources.length) {
    response.status(200).json({ configured: Boolean(apiKey), grounded: false });
    return;
  }
  if (!apiKey) {
    response.status(200).json({ configured: false });
    return;
  }
  if (isRateLimited(request)) {
    response.status(429).json({ error: 'Bạn gửi câu hỏi hơi nhanh. Hãy thử lại sau một phút.' });
    return;
  }

  const evidence = grounded.text;
  const sourceLabels = grounded.sources.map((source) => source.label);
  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions: [
          'Bạn là trợ lý tra cứu báo cáo Cocoon bằng tiếng Việt.',
          'Chỉ diễn đạt lại và giải thích câu trả lời cùng nguồn chứng cứ được cung cấp; không dùng kiến thức bên ngoài, không bổ sung dữ kiện, không khẳng định quan hệ nhân quả.',
          'Giữ nguyên mọi con số, đơn vị, phạm vi mẫu và điểm chưa chắc chắn. Không tạo số mới; chỉ viết số bằng chữ số Ả Rập nếu số đó đã có nguyên dạng trong chứng cứ.',
          'Nếu chứng cứ nêu hạn chế hoặc mâu thuẫn, phải giữ nguyên lưu ý đó. Trả lời ngắn gọn, dễ đọc, tối đa 3 câu.',
        ].join(' '),
        input: JSON.stringify({ question, evidence, sources: sourceLabels }),
        max_output_tokens: 320,
        store: false,
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!apiResponse.ok) {
      response.status(200).json({ configured: true, model, answer: evidence, sources: sourceLabels, hasCaveat: true, mode: 'source-fallback' });
      return;
    }

    const generated = outputText(await apiResponse.json());
    if (!generated || generated.length > 1_400 || hasUnsupportedNumbers(generated, evidence)) {
      response.status(200).json({ configured: true, model, answer: evidence, sources: sourceLabels, hasCaveat: true, mode: 'source-fallback' });
      return;
    }

    response.status(200).json({
      configured: true,
      model,
      answer: generated,
      sources: sourceLabels,
      hasCaveat: grounded.hasCaveat,
      mode: 'ai-grounded',
    });
  } catch {
    response.status(200).json({ configured: true, model, answer: evidence, sources: sourceLabels, hasCaveat: true, mode: 'source-fallback' });
  }
}
