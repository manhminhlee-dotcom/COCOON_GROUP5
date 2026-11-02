import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { CLIP_SRC } from '../config/treasure';

export function ClipModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [clipAvailable, setClipAvailable] = useState<boolean | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setClipAvailable(null);
    fetch(CLIP_SRC, { method: 'HEAD', signal: controller.signal })
      // Vite's SPA fallback answers missing media paths with index.html and status 200.
      .then((response) => setClipAvailable(response.ok && response.headers.get('content-type')?.startsWith('video/') === true))
      .catch(() => { if (!controller.signal.aborted) setClipAvailable(false); });
    return () => controller.abort();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || clipAvailable !== true || !videoRef.current) return;
    const video = videoRef.current;
    video.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
  }, [isOpen, clipAvailable]);

  useEffect(() => {
    if (!isOpen) return;
    return () => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#100A06]/88 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
          role="presentation"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="treasure-clip-title"
            className="relative w-full max-w-5xl overflow-hidden rounded-[20px] border border-[#C18B39]/55 bg-[#1C120C] shadow-[0_28px_100px_rgba(0,0,0,.65)]"
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.2, 0.75, 0.25, 1] }}
          >
            <header className="flex items-center justify-between gap-4 border-b border-[#C18B39]/20 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D6A74C]">Bí mật trong rương</p>
                <h2 id="treasure-clip-title" className="mt-1 font-serif text-lg text-[#F8EAD5] sm:text-xl">Câu chuyện phía sau cuốn sách</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng video"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#C18B39]/35 text-[#F8EAD5] transition hover:border-[#E5B75E] hover:bg-[#C18B39]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B75E]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="aspect-video bg-black">
              {clipAvailable === true ? (
                <div className="relative h-full w-full">
                  <video ref={videoRef} className="h-full w-full" src={CLIP_SRC} controls autoPlay playsInline />
                  {autoplayBlocked && (
                    <button
                      type="button"
                      onClick={() => videoRef.current?.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true))}
                      className="absolute inset-0 grid place-items-center bg-black/25 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B75E]"
                    >
                      <span className="flex items-center gap-3 rounded-full border border-white/40 bg-black/65 px-6 py-4 text-base font-semibold shadow-xl">
                        <Play className="h-5 w-5 fill-current" /> Phát video
                      </span>
                    </button>
                  )}
                </div>
              ) : clipAvailable === null ? (
                <div className="flex h-full items-center justify-center text-sm text-[#D8C7AF]">Đang chuẩn bị video…</div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-[#D6A74C]/55 text-[#E5B75E] shadow-[0_0_28px_rgba(197,139,48,.16)]">
                    <Play className="ml-1 h-5 w-5" />
                  </span>
                  <p className="font-serif text-xl text-[#F8EAD5]">Clip sẽ xuất hiện tại đây</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#D8C7AF]/75">
                    Thêm tệp video vào <code className="rounded bg-white/5 px-1.5 py-0.5 text-[#E5B75E]">public/media/clip.mp4</code> để phát sau khi mở rương.
                  </p>
                </div>
              )}
            </div>
            <footer className="flex justify-end px-5 py-4 sm:px-7">
              <button onClick={onClose} className="rounded-full bg-[#C18B39] px-5 py-2.5 text-sm font-bold text-[#1A100A] shadow-[0_8px_24px_rgba(0,0,0,.24)] transition hover:bg-[#E5B75E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B75E]">
                Quay lại kệ sách
              </button>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
