import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronLeft, Globe2, Play, Sparkles, X } from 'lucide-react';

type LanguageId = 'vi' | 'en' | 'zh' | 'sign';

const languageOptions: { id: LanguageId; label: string; file: string }[] = [
  { id: 'vi', label: 'Tiếng Việt', file: 'cocoon-original.mp4' },
  { id: 'en', label: 'English', file: 'cocoon-english.mp4' },
  { id: 'zh', label: '汉语', file: 'cocoon-chinese.mp4' },
  { id: 'sign', label: 'THỦ NGỮ', file: 'cocoon-sign-language.mp4' },
];

const clipUrl = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

export function ClipModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('vi');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [clipStatus, setClipStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const selectedClip = languageOptions.find((option) => option.id === selectedLanguage) ?? languageOptions[0];

  const playSelectedClip = (video: HTMLVideoElement) => {
    video.play()
      .then(() => setPlaybackBlocked(false))
      .catch(() => setPlaybackBlocked(true));
  };

  const chooseLanguage = (language: LanguageId) => {
    const nextClip = languageOptions.find((option) => option.id === language);
    if (!nextClip) return;

    setLanguageMenuOpen(false);
    languageButtonRef.current?.focus();
    if (language === selectedLanguage) return;

    setSelectedLanguage(language);
    setClipStatus('loading');
    setPlaybackBlocked(false);

    // The single video element stays mounted while the menu is open. Its source changes
    // only after a language is chosen, so opening the picker never interrupts playback.
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = clipUrl(nextClip.file);
      video.load();
      playSelectedClip(video);
    }
  };

  const closeModal = () => {
    setLanguageMenuOpen(false);
    setSelectedLanguage('vi');
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    setSelectedLanguage('vi');
    setLanguageMenuOpen(false);
    setClipStatus('loading');
    setPlaybackBlocked(false);

    const video = videoRef.current;
    if (!video) return;
    video.src = clipUrl(languageOptions[0].file);
    video.load();
    playSelectedClip(video);
  }, [isOpen]);

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
    if (!languageMenuOpen) return;
    const checkedOption = languageMenuRef.current?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]');
    checkedOption?.focus();

    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node;
      if (languageMenuRef.current?.contains(target) || languageButtonRef.current?.contains(target)) return;
      setLanguageMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, [languageMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (languageMenuOpen) {
        event.stopPropagation();
        setLanguageMenuOpen(false);
        languageButtonRef.current?.focus();
        return;
      }
      closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, languageMenuOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#100A06]/90 p-3 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}
          role="presentation"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="treasure-clip-title"
            className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-visible rounded-[20px] border border-[#C18B39]/55 bg-[#1C120C] shadow-[0_30px_110px_rgba(0,0,0,.72),0_3px_18px_rgba(198,144,61,.12)] sm:max-h-[calc(100dvh-4rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.2, 0.75, 0.25, 1] }}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 rounded-t-[20px] border-b border-[#C18B39]/25 bg-[linear-gradient(110deg,#21150e_0%,#19100b_72%,#21160e_100%)] px-4 py-3.5 sm:px-7 sm:py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D6A74C]">Bí mật trong rương</p>
                <h2 id="treasure-clip-title" className="mt-1 font-serif text-lg text-[#F8EAD5] sm:text-xl">Câu chuyện phía sau cuốn sách</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Đóng video"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#C18B39]/35 text-[#F8EAD5] transition hover:border-[#E5B75E] hover:bg-[#C18B39]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B75E]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative min-h-0 flex-1 bg-[#070605]">
              <div className="relative aspect-video w-full overflow-hidden bg-[#070605]">
                <video
                  ref={videoRef}
                  key="cocoon-language-player"
                  className="absolute inset-0 h-full w-full bg-[#070605] object-contain"
                  src={clipUrl(selectedClip.file)}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  aria-label={`Video Cocoon — ${selectedClip.label}`}
                  onLoadStart={() => setClipStatus('loading')}
                  onCanPlay={() => setClipStatus('ready')}
                  onError={() => { setClipStatus('error'); setPlaybackBlocked(false); }}
                />

                {clipStatus === 'loading' && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/12 text-sm font-medium text-[#F6E6CA]/80">
                    <span className="rounded-full border border-[#C18B39]/35 bg-[#160f0a]/85 px-4 py-2 shadow-[0_10px_35px_rgba(0,0,0,.46)]">Đang tải clip…</span>
                  </div>
                )}

                {clipStatus === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090705] px-5 text-center">
                    <span className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-[#D6A74C]/55 text-[#E5B75E] shadow-[0_10px_32px_rgba(0,0,0,.55)]">
                      <Play className="ml-1 h-5 w-5" />
                    </span>
                    <p className="font-serif text-xl text-[#F8EAD5]">Không tải được video</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#D8C7AF]">Hãy thử phát lại hoặc chọn một ngôn ngữ khác.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const video = videoRef.current;
                        if (!video) return;
                        setClipStatus('loading');
                        video.load();
                        playSelectedClip(video);
                      }}
                      className="mt-5 rounded-xl border border-[#C18B39]/60 bg-[#3A2818] px-4 py-2 text-sm font-semibold text-[#F8EAD5] shadow-[0_8px_24px_rgba(0,0,0,.36)] transition hover:bg-[#52391f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B75E]"
                    >
                      Thử phát lại
                    </button>
                  </div>
                )}

                {playbackBlocked && clipStatus !== 'error' && (
                  <button
                    type="button"
                    onClick={() => videoRef.current && playSelectedClip(videoRef.current)}
                    className="absolute inset-0 grid place-items-center bg-black/25 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5B75E]"
                  >
                    <span className="flex items-center gap-3 rounded-full border border-[#E5B75E]/55 bg-[#170f09]/90 px-6 py-4 text-base font-semibold text-[#FFF6E8] shadow-[0_14px_40px_rgba(0,0,0,.56)]">
                      <Play className="h-5 w-5 fill-current text-[#E5B75E]" /> Phát video
                    </span>
                  </button>
                )}
              </div>
            </div>

            <footer className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-b-[20px] border-t border-[#C18B39]/25 bg-[linear-gradient(110deg,#1c120c_0%,#21160e_50%,#1a100b_100%)] px-4 py-3.5 sm:px-7 sm:py-4">
              <div className="flex min-w-0 items-center gap-2.5 text-sm text-[#D8C7AF]">
                <Globe2 className="h-4 w-4 shrink-0 text-[#D6A74C]" />
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A98B64]">Đang phát</span>
                <span className="truncate font-semibold text-[#F4E6D2]">{selectedClip.label}</span>
              </div>

              <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto sm:gap-3">
                <div className="relative" ref={languageMenuRef}>
                  <button
                    ref={languageButtonRef}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={languageMenuOpen}
                    aria-controls="clip-language-menu"
                    onClick={() => setLanguageMenuOpen((open) => !open)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D6A74C]/65 bg-[linear-gradient(145deg,#3a2919_0%,#24170f_100%)] px-3.5 text-sm font-bold text-[#FFE9BF] shadow-[0_8px_24px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,237,194,.1)] transition hover:border-[#F0C66B] hover:bg-[#48331e] hover:shadow-[0_10px_28px_rgba(0,0,0,.5),0_0_18px_rgba(198,144,61,.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E5B75E]"
                  >
                    <Globe2 className="h-4 w-4 text-[#E5B75E]" />
                    <span>Chọn ngôn ngữ</span>
                    <ChevronDown className={`h-4 w-4 text-[#D6A74C] transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {languageMenuOpen && (
                      <motion.div
                        id="clip-language-menu"
                        role="menu"
                        aria-label="Chọn ngôn ngữ video"
                        onKeyDown={(event) => {
                          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                          const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
                          if (options.length === 0) return;
                          event.preventDefault();
                          const currentIndex = options.findIndex((option) => option === document.activeElement);
                          const nextIndex = event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? options.length - 1
                              : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
                          options[nextIndex].focus();
                        }}
                        initial={{ opacity: 0, y: 9, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 7, scale: 0.99 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute bottom-[calc(100%+0.75rem)] right-0 z-30 w-[min(19rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-[16px] border border-[#C18B39]/65 bg-[linear-gradient(155deg,rgba(42,30,20,.99)_0%,rgba(23,17,13,.99)_48%,rgba(17,13,10,.99)_100%)] shadow-[0_24px_65px_rgba(0,0,0,.7),0_4px_18px_rgba(198,144,61,.13)] ring-1 ring-black/55 backdrop-blur-xl"
                      >
                        <div className="flex items-center gap-2.5 border-b border-[#C18B39]/25 bg-white/[0.025] px-4 py-3.5">
                          <ChevronLeft className="h-4 w-4 text-[#D6A74C]" />
                          <span className="text-sm font-bold tracking-wide text-[#FFF0D5]">Ngôn ngữ</span>
                        </div>
                        <div className="p-1.5">
                          {languageOptions.map((option) => {
                            const isSelected = selectedLanguage === option.id;
                            const isSignLanguage = option.id === 'sign';
                            return (
                              <button
                                key={option.id}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isSelected}
                                onClick={() => chooseLanguage(option.id)}
                                className={`group flex min-h-[50px] w-full items-center justify-between gap-3 rounded-[10px] px-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#E5B75E] ${
                                  isSelected
                                    ? 'bg-[linear-gradient(100deg,rgba(172,116,39,.34),rgba(99,65,30,.25))] text-[#FFF0D5] shadow-[inset_0_1px_0_rgba(255,226,176,.09)]'
                                    : 'text-[#E5D7C3] hover:bg-white/[0.055] hover:text-[#FFF6E8]'
                                } ${isSignLanguage ? 'mt-1 border-t border-[#C18B39]/25 pt-2' : ''}`}
                              >
                                <span className={`text-sm ${isSignLanguage ? 'font-black tracking-[0.08em] text-[#F3C86F]' : 'font-medium'}`}>
                                  {option.label}
                                </span>
                                {isSelected && <Check className="h-[18px] w-[18px] shrink-0 text-[#E5B75E]" strokeWidth={2.5} />}
                                {!isSelected && isSignLanguage && <Sparkles className="h-4 w-4 shrink-0 text-[#C18B39]/80" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-11 shrink-0 rounded-xl border border-[#D9A74F]/70 bg-[linear-gradient(145deg,#d3a04a_0%,#bd8431_100%)] px-4 text-sm font-bold text-[#1A100A] shadow-[0_8px_24px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,244,215,.38)] transition hover:brightness-110 hover:shadow-[0_10px_30px_rgba(0,0,0,.46)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0C66B] sm:px-5"
                >
                  Quay lại kệ sách
                </button>
              </div>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
