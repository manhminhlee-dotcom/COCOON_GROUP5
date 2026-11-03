import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, Sparkles, Send, BookOpen, Database, Copy, Check, Trash2 } from 'lucide-react';
import { COLD_CALLING_QUESTIONS } from '../data/mockData';
import { answerCocoonQuestion, COCOON_KNOWLEDGE_SOURCES } from '../data/cocoonKnowledge';
import { CURATED_COCOON_QA } from '../data/curatedCocoonQa';

type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  sources?: string[];
  hasCaveat?: boolean;
};

type SupplementalKnowledge = {
  id: string;
  text: string;
  createdAt: number;
};

const SUPPLEMENTAL_KNOWLEDGE_KEY = 'cocoon-supplemental-knowledge-v1';
const CHAT_HISTORY_KEY = 'cocoon-chat-history-v1';

function welcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'ai',
    text: `Kho tra cứu gồm ${GROUP_DOCUMENT_QUESTIONS.length} câu hỏi nhóm, ${DEFENSE_DOCUMENT_QUESTIONS.length} câu Q&A và ${LEGACY_QUESTIONS.length} chủ đề kiểm chứng. Bạn có thể hỏi tự do; câu hỏi thường không được lưu thành nguồn. Lịch sử chat và nguồn bổ sung chỉ lưu trên thiết bị này.`,
  };
}

function readChatHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!saved) return [welcomeMessage()];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [welcomeMessage()];
    const messages = parsed.filter((item): item is ChatMessage =>
      Boolean(item) && typeof item === 'object' &&
      typeof item.id === 'string' && (item.role === 'ai' || item.role === 'user') && typeof item.text === 'string',
    ).filter((item) => !(item.role === 'user' && /^\s*\d{4}\s*$/.test(item.text)));
    return messages.length ? messages.slice(-40) : [welcomeMessage()];
  } catch {
    return [welcomeMessage()];
  }
}

function readSupplementalKnowledge(): SupplementalKnowledge[] {
  try {
    const saved = localStorage.getItem(SUPPLEMENTAL_KNOWLEDGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SupplementalKnowledge =>
      Boolean(item) && typeof item === 'object' &&
      typeof item.id === 'string' && typeof item.text === 'string' && typeof item.createdAt === 'number',
    );
  } catch {
    return [];
  }
}

function findSupplementalKnowledge(question: string, entries: SupplementalKnowledge[]) {
  const normalizeText = (value: string) => value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
  const stopWords = new Set(['bao', 'nhieu', 'nao', 'gi', 'la', 'the', 'cua', 'cho', 'voi', 'trong', 'theo', 'tai', 'sao', 'nhom', 'khach', 'cocoon', 'co', 'duoc', 'khong', 'va', 'tu', 'den', 'tren', 'duoi']);
  const tokens = (value: string) => normalizeText(value).match(/[a-z0-9]+/g)?.filter((token) => token.length > 1 && !stopWords.has(token)) ?? [];
  const terms = [...new Set(tokens(question))];
  if (!terms.length) return undefined;

  const ranked = entries.map((entry) => {
    const haystack = new Set(tokens(entry.text));
    const overlap = terms.filter((term) => haystack.has(term)).length;
    return { entry, overlap, ratio: overlap / terms.length };
  }).sort((a, b) => b.overlap - a.overlap || b.ratio - a.ratio || b.entry.createdAt - a.entry.createdAt);
  const best = ranked[0];
  if (!best || best.overlap < Math.min(2, terms.length) || best.ratio < 0.34) return undefined;
  return best.entry;
}

const QUICK_PROMPTS = [
  { label: 'Khách mới theo quý', question: 'Quý nào có lượng khách mới cao nhất và thấp nhất, với bao nhiêu khách?' },
  { label: 'Churn theo kênh', question: 'Tỷ lệ churn của các kênh là bao nhiêu?' },
  { label: 'CLV theo hạng', question: 'CLV trung vị của từng hạng thành viên là bao nhiêu?' },
  { label: 'Nhóm sản phẩm', question: 'Nhóm sản phẩm nào được khách yêu thích nhất?' },
];

const LEGACY_QUESTIONS = [
  { id: 'provenance', label: 'Nguồn dữ liệu là dữ liệu thực tế hay mô phỏng?', query: 'Dữ liệu khách hàng có phải dữ liệu thực tế không?' },
  { id: 'subscription', label: '15 khách subscription có thuộc Marketplace × Dưỡng thể không?', query: '15 hội viên subscription có thuộc Marketplace × Dưỡng thể không?' },
  { id: 'threshold', label: 'Quy tắc chính xác để xác định churn là gì?', query: 'Churn được định nghĩa như thế nào, mốc 180 ngày?' },
  { id: 'gold-loss', label: 'Ước tính CLV của khách Gold đã rời bỏ?', query: 'Ước tính thiệt hại CLV của khách Gold rời bỏ là bao nhiêu?' },
  { id: 'product-revenue', label: 'Có thể xác nhận tỷ trọng doanh số theo sản phẩm không?', query: 'Có thể xác nhận tỷ trọng doanh số Dưỡng thể và Sữa rửa mặt không?' },
  { id: 'recency', label: 'Recency và CLV có quan hệ nhân quả không?', query: 'Recency và CLV có tương quan hay nhân quả?' },
  { id: 'channels', label: 'Tỷ lệ churn của các kênh là bao nhiêu?', query: 'Tỷ lệ churn của từng kênh là bao nhiêu?' },
];

const GROUP_DOCUMENT_QUESTIONS = CURATED_COCOON_QA.filter(
  (item) => item.sourceCollection !== 'Q&A bảo vệ đồ án',
);
const DEFENSE_DOCUMENT_QUESTIONS = CURATED_COCOON_QA.filter(
  (item) => item.sourceCollection === 'Q&A bảo vệ đồ án',
);

export function Chapter4Defense() {
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [modelConfigured, setModelConfigured] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [receivingKnowledge, setReceivingKnowledge] = useState(false);
  const [supplementalKnowledge, setSupplementalKnowledge] = useState<SupplementalKnowledge[]>(readSupplementalKnowledge);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(readChatHistory);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [draftQuestion, setDraftQuestion] = useState('');
  const [chatLogRef, setChatLogRef] = useState<HTMLDivElement | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages.slice(-40)));
    } catch {
      // The current conversation stays usable when local storage is unavailable.
    }
  }, [chatMessages]);

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/cocoon-chat')
      .then((result) => result.ok ? result.json() : null)
      .then((result) => {
        if (!cancelled && typeof result?.configured === 'boolean') setModelConfigured(result.configured);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const currentQ = COLD_CALLING_QUESTIONS.find((q) => q.id === activeQuestion) || COLD_CALLING_QUESTIONS[0];
  const isRevealed = !!revealedAnswers[activeQuestion];

  const sendQuestion = async (rawQuestion: string, selectedId = '') => {
    const trimmedQuestion = rawQuestion.trim();
    if (!trimmedQuestion) return;

    const messageId = `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userMessage: ChatMessage = { id: `user-${messageId}`, role: 'user', text: trimmedQuestion };
    const replyMessage: ChatMessage = { id: messageId, role: 'ai', text: '' };
    const addPair = (reply: ChatMessage, includeUser = true) => setChatMessages((prev) => includeUser ? [...prev, userMessage, reply] : [...prev, reply]);
    const command = trimmedQuestion.replace(/\s+/g, '');

    setDraftQuestion('');
    setSelectedQuestion('');

    if (/^\d{4}$/.test(command)) {
      setIsSending(true);
      try {
        const result = await fetch('/api/cocoon-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'knowledge-control', code: command }),
        });
        const response = await result.json();
        if (response?.isCommand === true && response?.unlocked === true) {
          setReceivingKnowledge(true);
          addPair({
            ...replyMessage,
            text: 'Đã mở chế độ nhận nguồn bổ sung. Hãy gửi từng đoạn dữ liệu hoặc ghi chú có căn cứ; các mục cũ vẫn được giữ nguyên. Nội dung được lưu trong bộ nhớ của trình duyệt này và chưa đồng bộ sang thiết bị/người xem khác.',
            hasCaveat: true,
          }, false);
          return;
        }
        if (response?.isCommand === true && response?.locked === true) {
          setReceivingKnowledge(false);
          addPair({ ...replyMessage, text: `Đã khóa chế độ nhận nguồn bổ sung. ${supplementalKnowledge.length} mục đã lưu trên thiết bị này vẫn được giữ lại; câu hỏi tiếp tục chỉ tra cứu nguồn.` }, false);
          return;
        }
        if (result.status === 429) throw new Error(typeof response?.error === 'string' ? response.error : 'Đã vượt số lần thử. Hãy đợi 10 phút rồi thử lại.');
      } catch (error) {
        if (error instanceof Error && error.message) {
          setIsSending(false);
          addPair({ ...replyMessage, text: error.message, hasCaveat: true }, false);
          return;
        }
      } finally {
        setIsSending(false);
      }
    }

    if (/^\d{4}$/.test(command)) {
      addPair({
        ...replyMessage,
        text: 'Không xác nhận được lệnh quản trị. Hãy tiếp tục hỏi về nội dung báo cáo Cocoon.',
        hasCaveat: true,
      }, false);
      return;
    }

    if (receivingKnowledge) {
      const entry: SupplementalKnowledge = { id: messageId, text: trimmedQuestion, createdAt: Date.now() };
      try {
        const nextKnowledge = [...supplementalKnowledge, entry];
        localStorage.setItem(SUPPLEMENTAL_KNOWLEDGE_KEY, JSON.stringify(nextKnowledge));
        setSupplementalKnowledge(nextKnowledge);
        addPair({ ...replyMessage, text: `Đã lưu mục bổ sung ${nextKnowledge.length}. Bộ nhớ nguồn cũ vẫn còn nguyên. Nội dung này dùng cho tra cứu trên trình duyệt hiện tại; chưa được chia sẻ cho khách xem trên thiết bị khác.` });
      } catch {
        addPair({ ...replyMessage, text: 'Chưa lưu được nguồn bổ sung. Hãy kiểm tra dung lượng bộ nhớ của trình duyệt rồi thử lại.', hasCaveat: true });
      }
      return;
    }

    const curatedId = Number(selectedId.replace('qa-', ''));
    const curated = selectedId.startsWith('qa-')
      ? CURATED_COCOON_QA.find((item) => item.id === curatedId)
      : undefined;
    const legacy = selectedId.startsWith('legacy-')
      ? LEGACY_QUESTIONS.find((item) => `legacy-${item.id}` === selectedId)
      : undefined;
    const questionForLookup = curated?.question ?? (legacy?.query || trimmedQuestion);
    const answer = selectedId && curated
      ? { text: curated.answer, sources: curated.sources.map((label) => ({ label })), hasCaveat: curated.hasCaveat }
      : selectedId && legacy
      ? answerCocoonQuestion(legacy.query)
      : answerCocoonQuestion(questionForLookup);
    const supplemental = answer.sources.length ? undefined : findSupplementalKnowledge(questionForLookup, supplementalKnowledge);
    const selectedAnswer = supplemental
      ? {
          text: supplemental.text,
          sources: [`Nguồn bổ sung · thiết bị này · ${new Date(supplemental.createdAt).toLocaleDateString('vi-VN')}`],
          hasCaveat: true,
        }
      : answer;
    addPair({
      ...replyMessage,
      text: selectedAnswer.text,
      sources: selectedAnswer.sources.map((source) => typeof source === 'string' ? source : source.label),
      hasCaveat: selectedAnswer.hasCaveat,
    });
    if (supplemental || !answer.sources.length) return;
    if (!modelConfigured) return;

    setIsSending(true);
    try {
      const result = await fetch('/api/cocoon-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionForLookup }),
      });
      if (!result.ok) return;
      const response = await result.json();
      if (typeof response?.answer !== 'string' || !response.answer.trim()) return;
      setChatMessages((previous) => previous.map((message) => message.id === messageId
        ? {
            ...message,
            text: response.answer,
            sources: Array.isArray(response.sources) ? response.sources : message.sources,
            hasCaveat: typeof response.hasCaveat === 'boolean' ? response.hasCaveat : message.hasCaveat,
          }
        : message));
    } catch {
      // Keep the deterministic source-backed response already shown above.
    } finally {
      setIsSending(false);
    }
  };

  const handleSendChat = () => {
    void sendQuestion(draftQuestion, selectedQuestion);
  };

  React.useEffect(() => {
    if (chatLogRef) chatLogRef.scrollTo({ top: chatLogRef.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, chatLogRef]);

  const copyAnswer = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId((current) => current === message.id ? null : current), 1800);
    } catch {
      setCopiedMessageId(null);
    }
  };

  const clearChat = () => {
    setChatMessages([welcomeMessage()]);
    setCopiedMessageId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-[#E69F00] mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Trang 4 · Phản Biện Hội Đồng & Tra Cứu Tài Liệu</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#3D2314]">
          Mô Phỏng Phản Biện Cold Calling & Tra Cứu Tài Liệu
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4C38] mt-1">
          Luyện tập với câu hỏi phản biện và tra cứu dữ liệu Cocoon có dẫn nguồn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Khung Cold Calling Defense (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#E69F00]/25 text-[#3D2314]">
                Câu hỏi {currentQ.id} / {COLD_CALLING_QUESTIONS.length}
              </span>
              <div className="flex gap-1.5">
                {COLD_CALLING_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestion(q.id)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeQuestion === q.id
                        ? 'bg-[#3D2314] text-[#FAF6F0]'
                        : revealedAnswers[q.id]
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#FAF6F0] text-[#3D2314] hover:bg-[#E69F00]/30'
                    }`}
                  >
                    {q.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#3D2314] text-[#FAF6F0] mb-4">
              <span className="text-[10px] font-extrabold text-[#E69F00] uppercase tracking-wider block mb-1">
                Câu hỏi chất vấn của Hội Đồng:
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-snug">{currentQ.question}</h3>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-[#6B4C38] mb-1">
                Ghi chú luyện tập cá nhân (không gửi tới chatbot):
              </label>
              <textarea
                value={userNotes[currentQ.id] || ''}
                onChange={(e) =>
                  setUserNotes({ ...userNotes, [currentQ.id]: e.target.value })
                }
                placeholder="Ghi ý tưởng tại đây; nội dung chỉ lưu trong phần luyện tập này..."
                rows={3}
                className="w-full p-3 rounded-xl border border-[#EFE6D5] bg-[#FAF6F0] text-xs text-[#3D2314] focus:outline-none focus:border-[#E69F00] resize-none"
              />
            </div>

            <AnimatePresence>
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-[#FEF3D6] border border-[#E69F00]/40 text-xs text-[#3D2314] space-y-2 mb-4"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#D48800]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đáp Án Chuẩn Mẫu (Model Answer):</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.modelAnswer}</p>
                  <div className="pt-2 border-t border-[#E69F00]/25">
                    <span className="font-bold text-[11px] text-[#3D2314] block mb-1">Các ý cốt lõi bắt buộc:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentQ.keyPoints.map((kp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white text-[10px] text-[#3D2314] font-medium border border-[#E69F00]/30"
                        >
                          ✓ {kp}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#EFE6D5]">
            <button
              onClick={() =>
                setRevealedAnswers({
                  ...revealedAnswers,
                  [activeQuestion]: !isRevealed,
                })
              }
              className="px-4 py-2 rounded-xl bg-[#E69F00] text-[#3D2314] font-bold text-xs hover:bg-[#D48800] transition-colors cursor-pointer shadow-sm"
            >
              {isRevealed ? 'Ẩn Đáp Án Mẫu' : 'Xem Đáp Án Chuẩn Của Nhóm'}
            </button>

            <button
              onClick={() => {
                if (activeQuestion < COLD_CALLING_QUESTIONS.length) {
                  setActiveQuestion(activeQuestion + 1);
                }
              }}
              disabled={activeQuestion === COLD_CALLING_QUESTIONS.length}
              className="px-3.5 py-2 rounded-xl bg-[#3D2314] text-[#FAF6F0] font-bold text-xs hover:bg-[#4A2E1B] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Câu kế tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khung tra cứu theo tài liệu (5 Cols) */}
        <div className="lg:col-span-5 min-w-0 bg-[#3D2314] text-[#FAF6F0] p-4 sm:p-6 rounded-3xl border border-[#4A2E1B] shadow-xl flex min-h-[500px] flex-col lg:min-h-[540px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-[#4A2E1B] pb-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E69F00] text-[#3D2314]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#FAF6F0] leading-tight">Tra cứu theo tài liệu</h3>
                  <span className="text-xs text-[#E69F00]">{modelConfigured ? 'AI diễn đạt · dữ liệu có nguồn' : 'Tra cứu nguồn tại chỗ'}</span>
                </div>
              </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] text-[#E5D9C5]">{modelConfigured ? 'AI có kiểm chứng' : 'Kho tri thức'}</span>
                    <button type="button" onClick={clearChat} title="Xóa lịch sử trên thiết bị này" aria-label="Xóa lịch sử trò chuyện" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#765238]/70 text-[#D6BFA0] transition hover:border-[#D9A441] hover:text-[#F2C24B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
            </div>

            <div className="mb-3 shrink-0 space-y-2.5">
              <div className="flex flex-wrap gap-2" aria-label="Gợi ý câu hỏi">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => { void sendQuestion(prompt.question); }}
                    disabled={isSending || receivingKnowledge}
                    className="rounded-full border border-[#765238] bg-gradient-to-b from-[#51331F] to-[#2C1810] px-3 py-1.5 text-[11px] font-semibold text-[#F4E8D5] shadow-[0_3px_10px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-[#D9A441] hover:text-[#F2C24B] disabled:opacity-50"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>

              <details className="group rounded-xl border border-[#765238]/70 bg-[#2C1810]/70 text-xs">
                <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 py-2 font-semibold text-[#F1DFC5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00]">
                  <Database className="h-3.5 w-3.5 text-[#E69F00]" />
                  <span>Kho nguồn đã đối chiếu</span>
                  <span className="ml-auto text-[10px] text-[#D6BFA0]">35 câu hỏi · mở để xem</span>
                </summary>
                <div className="space-y-2 border-t border-[#765238]/50 px-3 py-3 text-[#E8D9C4]">
                  <p>Câu hỏi người xem không được lưu thành dữ liệu mới. Nguồn bổ sung quản trị đã nhập: {supplementalKnowledge.length} mục trên thiết bị này; phần này không tự đồng bộ tới người xem khác. Trả lời ưu tiên tài liệu nhóm, rồi mới tra cứu nguồn bổ sung nếu phù hợp.</p>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {COCOON_KNOWLEDGE_SOURCES.map((source) => (
                      <li key={source.title} className="flex min-w-0 items-start gap-2 rounded-lg bg-[#3D281C] px-2.5 py-2">
                        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E69F00]" />
                        <span className="min-w-0"><strong className="block text-[#FFF8EC]">{source.title}</strong><span className="text-[10px] text-[#D6BFA0]">{source.detail}</span></span>
                      </li>
                    ))}
                  </ul>
                  <details className="rounded-lg border border-[#765238]/50 px-2.5 py-2">
                    <summary className="cursor-pointer font-semibold text-[#F2C24B]">Chọn câu hỏi mẫu hoặc chủ đề bổ sung</summary>
                    <select
                      value={selectedQuestion}
                      disabled={receivingKnowledge}
                      onChange={(event) => {
                        const selected = event.target.value;
                        setSelectedQuestion(selected);
                        const curatedItem = selected.startsWith('qa-')
                          ? CURATED_COCOON_QA.find((item) => item.id === Number(selected.replace('qa-', '')))
                          : undefined;
                        const legacyItem = selected.startsWith('legacy-')
                          ? LEGACY_QUESTIONS.find((item) => `legacy-${item.id}` === selected)
                          : undefined;
                        setDraftQuestion(curatedItem?.question ?? legacyItem?.label ?? '');
                      }}
                      aria-label="Chọn câu hỏi mẫu về tài liệu Cocoon"
                      className="mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-[#765238] bg-[#21130D] px-3 py-2 text-xs text-[#FAF6F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E69F00]"
                    >
                      <option value="">Chọn một câu hỏi…</option>
                      <optgroup label={`${GROUP_DOCUMENT_QUESTIONS.length} câu hỏi từ tài liệu nhóm`}>
                        {GROUP_DOCUMENT_QUESTIONS.map((item) => <option key={item.id} value={`qa-${item.id}`}>{item.id}. {item.question}</option>)}
                      </optgroup>
                      <optgroup label={`${DEFENSE_DOCUMENT_QUESTIONS.length} câu hỏi trong Q&A bảo vệ đồ án`}>
                        {DEFENSE_DOCUMENT_QUESTIONS.map((item) => <option key={item.id} value={`qa-${item.id}`}>{item.id}. {item.question}</option>)}
                      </optgroup>
                      <optgroup label={`${LEGACY_QUESTIONS.length} câu hỏi kiểm chứng bổ sung`}>
                        {LEGACY_QUESTIONS.map((item) => <option key={item.id} value={`legacy-${item.id}`}>{item.label}</option>)}
                      </optgroup>
                    </select>
                  </details>
                </div>
              </details>
            </div>

            <div ref={setChatLogRef} role="log" aria-label="Lịch sử trò chuyện Cocoon" aria-live="polite" aria-relevant="additions" className="min-h-[200px] flex-1 space-y-3 overflow-y-auto overscroll-contain pr-2 text-sm">
              {chatMessages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.role === 'ai'
                      ? `${msg.hasCaveat ? 'bg-[#38251A] border-[#9A6A25]' : 'bg-[#2C1810] border-[#4A2E1B]'} text-[#FAF6F0] border mr-auto`
                      : 'bg-[#E69F00] text-[#3D2314] font-semibold ml-auto'
                  }`}
                >
                  {msg.role === 'ai' && msg.hasCaveat && (
                    <span className="mb-1.5 inline-flex rounded-full border border-[#D9A441]/50 bg-[#4A321D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#F2C24B]">
                      Cần đọc lưu ý nguồn
                    </span>
                  )}
                  <p className="break-words">{msg.text}</p>
                  {!!msg.sources?.length && (
                    <div className="mt-2 pt-2 border-t border-[#FAF6F0]/15 text-xs text-[#E8CFA8]">
                      <span className="font-semibold">Nguồn: </span>
                      {msg.sources.join(' · ')}
                    </div>
                  )}
                  {msg.role === 'ai' && msg.id !== 'welcome' && msg.text && (
                    <button type="button" onClick={() => { void copyAnswer(msg); }} aria-label="Sao chép câu trả lời" className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[#765238]/70 bg-[#21130D]/60 px-2.5 text-[10px] font-semibold text-[#E8D9C4] transition hover:border-[#D9A441] hover:text-[#F2C24B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00]">
                      {copiedMessageId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedMessageId === msg.id ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) => { event.preventDefault(); handleSendChat(); }}
            className="mt-3 w-full min-w-0 shrink-0 border-t border-[#4A2E1B] pt-3"
          >
            {receivingKnowledge && (
              <div role="status" className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D9A441]/55 bg-gradient-to-r from-[#4C3219] to-[#38251A] px-3 py-2 text-[11px] font-semibold text-[#F5D89C] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_12px_rgba(0,0,0,0.16)]">
                <span>Đang nhận nguồn bổ sung · chỉ lưu trên thiết bị này</span>
                <span>{supplementalKnowledge.length} mục đã lưu</span>
              </div>
            )}
            <div className="w-full min-w-0">
              <div className={`flex w-full min-w-0 gap-2 rounded-2xl border border-[#765238] bg-gradient-to-b from-[#2C1810] to-[#24140E] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_5px_16px_rgba(0,0,0,0.22)] transition focus-within:border-[#D9A441] focus-within:shadow-[0_0_0_3px_rgba(230,159,0,0.13),0_7px_18px_rgba(0,0,0,0.2)] ${receivingKnowledge ? 'items-end' : 'items-center'}`}>
                <textarea
                  value={draftQuestion}
                  onChange={(event) => {
                    setDraftQuestion(event.target.value);
                    setSelectedQuestion('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendChat();
                    }
                  }}
                  rows={receivingKnowledge ? 4 : 1}
                  maxLength={receivingKnowledge ? 4000 : 240}
                  placeholder={receivingKnowledge ? 'Dán một đoạn dữ liệu hoặc ghi chú có căn cứ…' : 'Nhập câu hỏi về báo cáo Cocoon…'}
                  autoComplete="off"
                  enterKeyHint="send"
                  aria-label="Nhập câu hỏi về tài liệu Cocoon"
                  aria-describedby="cocoon-chat-scope"
                  disabled={isSending}
                  className={`min-h-11 max-h-40 min-w-0 flex-1 resize-y border-0 bg-transparent px-3 py-2 text-sm leading-5 text-[#FAF6F0] outline-none placeholder:text-[#C7B49C] focus:ring-0 disabled:cursor-wait disabled:opacity-70 ${receivingKnowledge ? 'min-h-24' : ''}`}
                />
                <button
                  type="submit"
                  disabled={!draftQuestion.trim() || isSending}
                  aria-busy={isSending}
                  className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2C24B] ${!draftQuestion.trim() || isSending
                    ? 'cursor-not-allowed bg-[#57412F] text-[#C9B79D] shadow-inner'
                    : 'cursor-pointer bg-gradient-to-b from-[#FFD05A] to-[#D88A00] text-[#352012] shadow-[0_3px_8px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 hover:from-[#FFE08A] hover:to-[#E69F00]'}`}
                  aria-label={isSending ? 'Đang tra cứu câu hỏi' : 'Gửi câu hỏi'}
                  title={isSending ? 'Đang tra cứu câu hỏi' : 'Gửi câu hỏi'}
                >
                  {isSending ? <span className="text-xs font-bold">…</span> : <Send className="h-4 w-4" />}
                  <span className="hidden text-xs font-bold sm:inline">{isSending ? 'Đang tra cứu' : 'Gửi'}</span>
                </button>
              </div>
            </div>
            <div id="cocoon-chat-scope" className="mt-2 break-words text-[11px] leading-relaxed text-[#E5D9C5]">
              {receivingKnowledge
                ? 'Gửi từng mục tối đa 4.000 ký tự. Enter để lưu mục, Shift + Enter để xuống dòng. Nội dung không đồng bộ giữa các thiết bị.'
              : 'Hỏi tự do hoặc chọn gợi ý. Số liệu bám nguồn; câu hỏi ngoài phạm vi sẽ được báo thiếu căn cứ. Lịch sử chat lưu tối đa 40 tin nhắn trên thiết bị này; có thể xóa bằng nút thùng rác.'}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
