import React, { useEffect, useState } from 'react';
import { HeroBookData } from '../types/books';
import { CONFIG } from '../config';
import { RotateCw, CornerUpLeft, BookOpen, Sparkles } from 'lucide-react';

interface BookInfoPanelProps {
  book: HeroBookData | null;
  isVisible: boolean;
  onReturn: () => void;
  onSelectRandom: () => void;
}

export const BookInfoPanel: React.FC<BookInfoPanelProps> = ({
  book,
  isVisible,
  onReturn,
  onSelectRandom,
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && book) {
      // 300ms delay after book settles
      timer = setTimeout(() => {
        setShowContent(true);
      }, CONFIG.timings.infoPanelDelay);
    } else {
      setShowContent(false);
    }
    return () => clearTimeout(timer);
  }, [isVisible, book]);

  if (!book || !showContent) return null;

  return (
    <div
      className="fixed z-30 pointer-events-auto transition-all duration-500 ease-out 
                 right-6 top-1/2 -translate-y-1/2 w-[360px] max-w-[90vw] 
                 bg-[#171310]/90 backdrop-blur-md border border-[#3d2e24] 
                 rounded-xl p-6 shadow-2xl text-[#f7f3ee]"
      style={{
        animation: 'fadeInSlide 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Editorial Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#3d2e24]/80 pb-3 mb-4">
        <span className="text-xs uppercase tracking-wider text-[#d48834] font-medium flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Kệ Sách Kinh Điển
        </span>
        <span className="text-xs text-[#a89b8d]">Năm {book.year}</span>
      </div>

      {/* Book Title */}
      <h2 className="font-serif text-2xl font-bold tracking-tight text-[#fffaf0] mb-1 leading-snug">
        {book.title}
      </h2>

      {book.originalTitle && (
        <p className="font-serif italic text-sm text-[#b8ab9b] mb-2">
          {book.originalTitle}
        </p>
      )}

      {/* Author and Metadata (Zero-Pill discipline) */}
      <div className="flex items-center gap-2 text-xs text-[#d1c6b8] mb-4">
        <span className="font-semibold text-[#f7f3ee]">{book.author}</span>
        <span aria-hidden="true" className="text-[#6d5b4d]">·</span>
        <span>Nguyên tác công cộng</span>
        <span aria-hidden="true" className="text-[#6d5b4d]">·</span>
        <span className="capitalize">{book.style === 'cloth-embossed' ? 'Bìa vải dập nổi' : 'Da cổ điển'}</span>
      </div>

      {/* Synopsis / Excerpt */}
      <div className="space-y-3 mb-6">
        <p className="text-xs leading-relaxed text-[#c7bbb0]">
          {book.synopsis}
        </p>

        {book.excerpt && (
          <blockquote className="border-l-2 border-[#d48834] pl-3 py-1 font-serif italic text-xs text-[#dfd6cb] bg-[#221a14]/50 rounded-r">
            "{book.excerpt}"
          </blockquote>
        )}
      </div>

      {/* 360 Arcball drag hint */}
      <div className="flex items-center gap-2 text-[11px] text-[#9e9082] bg-[#221a14]/60 px-3 py-2 rounded-lg mb-5 border border-[#3d2e24]/40">
        <RotateCw className="w-3.5 h-3.5 text-[#d48834] shrink-0" />
        <span>Kéo chuột để xoay 360° · Lăn chuột để thu phóng</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReturn}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-[#d48834] hover:bg-[#b87126] text-[#120f0c] font-semibold text-xs 
                     rounded-lg transition-colors cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#f7f3ee]"
        >
          <CornerUpLeft className="w-4 h-4" />
          <span>Đặt lại lên kệ</span>
        </button>

        <button
          onClick={onSelectRandom}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 
                     bg-[#251e18] hover:bg-[#332a22] text-[#e0d6cb] text-xs font-medium 
                     border border-[#443428] rounded-lg transition-colors cursor-pointer"
          title="Rút một cuốn khác ngẫu nhiên"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#d48834]" />
          <span>Đổi cuốn</span>
        </button>
      </div>
    </div>
  );
};
