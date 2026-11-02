import React, { useState } from 'react';
import { HeroBookData, BookInteractionState } from '../types/books';
import { HERO_BOOKS } from '../data/heroBooks';
import { Sparkles, Eye, EyeOff, Keyboard, Info } from 'lucide-react';

interface BookshelfUIProps {
  interactionState: BookInteractionState;
  hoveredBook: HeroBookData | null;
  activeBook: HeroBookData | null;
  onSelectBook: (bookId: string) => void;
  onSelectRandom: () => void;
  onReturn: () => void;
  isReady: boolean;
}

export const BookshelfUI: React.FC<BookshelfUIProps> = ({
  interactionState,
  hoveredBook,
  activeBook,
  onSelectBook,
  onSelectRandom,
  onReturn,
  isReady,
}) => {
  const [zenMode, setZenMode] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const isHeldOrPulling = interactionState === 'pulling' || interactionState === 'held';

  return (
    <>
      {/* Accessible Hidden Navigation for Screen Readers & Keyboard Tab */}
      <nav aria-label="Danh sách tác phẩm trên kệ sách" className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:bg-[#1a1410] focus-within:p-4 focus-within:rounded-lg focus-within:border focus-within:border-[#4a3626]">
        <p className="text-xs text-[#d48834] mb-2 font-medium">Danh mục sách tương tác (Dùng phím Tab để chọn, Enter để rút):</p>
        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
          {HERO_BOOKS.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBook(b.id)}
              className="text-left text-xs text-[#f7f3ee] hover:text-[#d48834] py-1 px-2 rounded focus:bg-[#2e2118] focus:outline-none focus:ring-1 focus:ring-[#d48834]"
              aria-label={`Rút cuốn ${b.title} của tác giả ${b.author}`}
            >
              Rút cuốn {b.title} — {b.author} ({b.year})
            </button>
          ))}
        </div>
      </nav>

      {/* Top Header Shell (Taste Skill & Anti-Slop: Clean typography, zero pill, placed over top wall) */}
      {!zenMode && (
        <header
          className={`fixed top-0 left-0 right-0 z-20 pointer-events-none transition-all duration-700 
                     px-6 pt-6 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                     ${isHeldOrPulling ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}
        >
          {/* Brand & Editorial Title */}
          <div className="pointer-events-auto max-w-xl bg-gradient-to-b from-[#120f0c]/85 via-[#120f0c]/60 to-transparent p-4 rounded-xl backdrop-blur-[2px]">
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#ffffff] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              Chọn một cuốn sách
            </h1>
            <p className="text-xs md:text-sm text-[#e6ded5] mt-1 font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              Nhấn vào gáy sách để rút nó ra khỏi kệ và thưởng thức nét đẹp nghệ thuật bìa.
            </p>
          </div>

          {/* Action & Utility Controls */}
          <div className="pointer-events-auto flex items-center gap-3">
            {/* Primary Action Button (Taste Skill accent role) */}
            <button
              onClick={onSelectRandom}
              disabled={isHeldOrPulling}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#d48834] hover:bg-[#ba7327] 
                         text-[#120f0c] font-semibold text-xs rounded-lg transition-all 
                         cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none
                         focus:outline-none focus:ring-2 focus:ring-[#f7f3ee]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rút một cuốn bất kỳ</span>
            </button>

            {/* Zen / Cinema Mode Toggle */}
            <button
              onClick={() => setZenMode(true)}
              className="p-2.5 bg-[#1e1712]/80 hover:bg-[#2e241c] text-[#d4c8ba] hover:text-[#fffaf2] 
                         border border-[#3d2f25]/60 rounded-lg transition-colors cursor-pointer 
                         focus:outline-none focus:ring-2 focus:ring-[#d48834]"
              title="Ẩn giao diện để ngắm trọn vẹn không gian"
              aria-label="Ẩn giao diện"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Keyboard Shortcuts Dialog Toggle */}
            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="p-2.5 bg-[#1e1712]/80 hover:bg-[#2e241c] text-[#d4c8ba] hover:text-[#fffaf2] 
                         border border-[#3d2f25]/60 rounded-lg transition-colors cursor-pointer 
                         focus:outline-none focus:ring-2 focus:ring-[#d48834]"
              title="Phím tắt điều khiển"
              aria-label="Xem hướng dẫn phím tắt"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Floating Zen Mode Restore Button */}
      {zenMode && (
        <button
          onClick={() => setZenMode(false)}
          className="fixed top-6 right-6 z-30 p-2.5 bg-[#1e1712]/90 hover:bg-[#2e241c] 
                     text-[#d4c8ba] hover:text-[#fffaf2] border border-[#3d2f25] 
                     rounded-lg transition-colors cursor-pointer shadow-xl
                     focus:outline-none focus:ring-2 focus:ring-[#d48834]"
          title="Hiện lại giao diện"
          aria-label="Hiện lại giao diện"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      )}

      {/* Hover Information Tooltip */}
      {hoveredBook && !isHeldOrPulling && !zenMode && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none 
                     bg-[#18130f]/90 border border-[#443326] px-4 py-2 rounded-lg 
                     shadow-xl text-center transition-all duration-200"
        >
          <p className="font-serif text-sm font-semibold text-[#f7f3ee]">
            {hoveredBook.title}
          </p>
          <p className="text-[11px] text-[#baa998]">
            {hoveredBook.author} · Nhấn để rút sách
          </p>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowKeyboardHelp(false)}
        >
          <div
            className="bg-[#1a1410] border border-[#4a3626] rounded-xl p-6 max-w-sm w-full text-[#f7f3ee] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3d2d20] mb-4">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#d48834]" />
                Phím tắt điều khiển
              </h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-xs text-[#a89b8d] hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#2d2218]">
                <span className="text-[#c7bbb0]">Chọn sách qua bàn phím</span>
                <kbd className="px-2 py-0.5 bg-[#251e18] border border-[#443528] rounded font-mono text-[11px]">Tab</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#2d2218]">
                <span className="text-[#c7bbb0]">Rút cuốn đang chọn</span>
                <kbd className="px-2 py-0.5 bg-[#251e18] border border-[#443528] rounded font-mono text-[11px]">Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#2d2218]">
                <span className="text-[#c7bbb0]">Đặt lại sách lên kệ</span>
                <kbd className="px-2 py-0.5 bg-[#251e18] border border-[#443528] rounded font-mono text-[11px]">Esc</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#2d2218]">
                <span className="text-[#c7bbb0]">Rút sách ngẫu nhiên</span>
                <kbd className="px-2 py-0.5 bg-[#251e18] border border-[#443528] rounded font-mono text-[11px]">Phím R</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
