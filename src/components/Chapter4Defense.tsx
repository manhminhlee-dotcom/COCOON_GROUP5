import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { COLD_CALLING_QUESTIONS } from '../data/mockData';
import { answerCocoonQuestion } from '../data/cocoonKnowledge';

type ChatMessage = {
  role: 'ai' | 'user';
  text: string;
  sources?: string[];
  hasCaveat?: boolean;
};

const QUICK_QUESTIONS = [
  'CLV trung vị và trung bình là bao nhiêu?',
  'Kênh nào có tỷ lệ rời bỏ cao nhất?',
  '15 hội viên subscription có thuộc Marketplace × Dưỡng thể không?',
];

const MAX_CHAT_LENGTH = 300;

export function Chapter4Defense() {
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Mình tra cứu trong báo cáo Cocoon, Q&A và bảng khách hàng đã làm sạch. Nếu tài liệu không đủ hoặc có số liệu mâu thuẫn, mình sẽ nêu rõ thay vì tự suy đoán.',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentQ = COLD_CALLING_QUESTIONS.find((q) => q.id === activeQuestion) || COLD_CALLING_QUESTIONS[0];
  const isRevealed = !!revealedAnswers[activeQuestion];

  const handleSendChat = (question = inputMsg) => {
    const userText = question.trim();
    if (!userText || userText.length > MAX_CHAT_LENGTH) return;

    const answer = answerCocoonQuestion(userText);
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      {
        role: 'ai',
        text: answer.text,
        sources: answer.sources.map((source) => source.label),
        hasCaveat: answer.hasCaveat,
      },
    ]);
    setInputMsg('');
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
                Ghi chú / Nháp câu trả lời của bạn:
              </label>
              <textarea
                value={userNotes[currentQ.id] || ''}
                onChange={(e) =>
                  setUserNotes({ ...userNotes, [currentQ.id]: e.target.value })
                }
                placeholder="Nhập ý tưởng trả lời của bạn trước khi mở đáp án chuẩn..."
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
        <div className="lg:col-span-5 bg-[#3D2314] text-[#FAF6F0] p-6 rounded-3xl border border-[#4A2E1B] shadow-xl flex flex-col justify-between h-[540px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#4A2E1B] mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#E69F00] text-[#3D2314]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#FAF6F0] leading-tight">Tra cứu theo tài liệu</h3>
                  <span className="text-xs text-[#E69F00]">Câu trả lời có nguồn đối chiếu</span>
                </div>
              </div>
              <span className="text-[11px] text-[#E5D9C5]">Tra cứu tại chỗ</span>
            </div>

            <div aria-live="polite" aria-relevant="additions" className="space-y-3 overflow-y-auto h-[350px] pr-2 text-sm">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.role === 'ai'
                      ? `${msg.hasCaveat ? 'bg-[#38251A] border-[#9A6A25]' : 'bg-[#2C1810] border-[#4A2E1B]'} text-[#FAF6F0] border mr-auto`
                      : 'bg-[#E69F00] text-[#3D2314] font-semibold ml-auto'
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  {!!msg.sources?.length && (
                    <div className="mt-2 pt-2 border-t border-[#FAF6F0]/15 text-xs text-[#E8CFA8]">
                      <span className="font-semibold">Nguồn: </span>
                      {msg.sources.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
              {chatMessages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => handleSendChat(question)}
                      className="max-w-full min-h-11 whitespace-normal break-words rounded-full border border-[#765238] px-3 py-2 text-left text-xs text-[#FAF6F0] transition-colors hover:border-[#E69F00] hover:text-[#F2C24B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E69F00]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSendChat();
            }}
            className="pt-3 border-t border-[#4A2E1B]"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(event) => setInputMsg(event.target.value)}
                maxLength={MAX_CHAT_LENGTH}
                aria-label="Nhập câu hỏi về tài liệu Cocoon"
                aria-describedby="cocoon-chat-scope"
                placeholder="Hỏi về CLV, churn, kênh hoặc sản phẩm..."
                className="min-w-0 flex-1 bg-[#2C1810] border border-[#765238] rounded-xl px-3 py-2 text-base sm:text-sm text-[#FAF6F0] placeholder:text-[#D8C9B8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E69F00]"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="p-2.5 rounded-xl bg-[#E69F00] text-[#3D2314] hover:bg-[#D48800] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2C24B]"
                aria-label="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div id="cocoon-chat-scope" className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#E5D9C5]">
              <span>Chỉ trả lời trong phạm vi tài liệu. Tối đa {MAX_CHAT_LENGTH} ký tự.</span>
              <span aria-live="off" className="shrink-0 tabular-nums">{inputMsg.length}/{MAX_CHAT_LENGTH}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
