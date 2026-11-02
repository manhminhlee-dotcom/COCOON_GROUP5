/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { playPageTurnSound } from './types';
import { CozyRoomScene } from './components/RoomScene';
import { ImageLightbox, ExcelPreviewModal } from './components/Modals';
import { Chapter1 } from './components/Chapter1';
import { Chapter2 } from './components/Chapter2';
import { Chapter3Dashboard } from './components/Chapter3Dashboard';
import { Chapter4Defense } from './components/Chapter4Defense';
import { ClipModal } from './components/ClipModal';

type BookPageTurnProps = {
  direction: 'next' | 'prev';
  duration: number;
  reducedMotion: boolean;
  frontScrollTop: number;
  frontPage: ReactNode;
  backPage: ReactNode;
};

function BookPageTurn({
  direction,
  duration,
  reducedMotion,
  frontScrollTop,
  frontPage,
  backPage,
}: BookPageTurnProps) {
  const sign = direction === 'next' ? -1 : 1;
  const turnTimes = [0, 0.12, 0.52, 0.9, 1];
  const turnEase: [number, number, number, number] = [0.42, 0, 0.18, 1];
  const turningPageSide = direction === 'next' ? 'right' : 'left';
  const stationaryPageSide = direction === 'next' ? 'left' : 'right';
  const reversePageSide = direction === 'next' ? 'left' : 'right';

  const spreadPage = (content: ReactNode, side: 'left' | 'right', scrollTop: number) => (
    <div
      className="absolute inset-y-0 left-0 w-[200%] px-6 sm:px-10 md:px-14 py-8"
      style={{
        transform:
          'translateX(' + (side === 'left' ? '0%' : '-50%') + ') translateY(-' + scrollTop + 'px)',
      }}
    >
      {content}
    </div>
  );

  return (
    <div aria-hidden="true" inert className="absolute inset-0 z-30 pointer-events-none">
      {/* The page that stays on the table until the turning leaf covers it. */}
      <div
        className={`absolute inset-y-0 ${direction === 'next' ? 'left-0' : 'right-0'} z-20 w-1/2 overflow-hidden bg-[#FAF6F0]`}
        style={{
          boxShadow:
            direction === 'next'
              ? 'inset -18px 0 24px rgba(61, 35, 20, 0.1)'
              : 'inset 18px 0 24px rgba(61, 35, 20, 0.1)',
        }}
      >
        {spreadPage(frontPage, stationaryPageSide, frontScrollTop)}
      </div>

      {/* A single leaf is hinged at the center gutter and swings to the other side. */}
      <motion.div
        initial={{ rotateY: 0, rotateX: 0, z: 0, scaleX: 1, opacity: 1 }}
        animate={
          reducedMotion
            ? { rotateY: 0, rotateX: 0, z: 0, scaleX: 1, opacity: 0 }
            : {
                rotateY: [0, sign * 8, sign * 78, sign * 153, sign * 180],
                rotateX: [0, -1.2, 1.4, -0.7, 0],
                z: [0, 12, 34, 16, 0],
                scaleX: [1, 1.01, 0.965, 0.99, 1],
                boxShadow: [
                  '0 2px 6px rgba(38, 23, 14, 0.06)',
                  '8px 16px 28px rgba(38, 23, 14, 0.18)',
                  '0 26px 42px rgba(38, 23, 14, 0.30)',
                  '-8px 16px 28px rgba(38, 23, 14, 0.18)',
                  '0 2px 6px rgba(38, 23, 14, 0.06)',
                ],
              }
        }
        transition={
          reducedMotion
            ? { duration, ease: 'easeOut' }
            : { duration, times: turnTimes, ease: turnEase }
        }
        className={`absolute inset-y-0 ${direction === 'next' ? 'left-1/2' : 'left-0'} z-30 w-1/2 pointer-events-none`}
        style={{
          transformOrigin: direction === 'next' ? 'left center' : 'right center',
          transformStyle: 'preserve-3d',
          willChange: 'transform, box-shadow',
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden bg-[#FAF6F0]"
          style={{
            backfaceVisibility: 'hidden',
            borderInline: '1px solid rgba(112, 78, 50, 0.16)',
            boxShadow:
              direction === 'next'
                ? 'inset 22px 0 34px rgba(61, 35, 20, 0.12), inset -5px 0 12px rgba(61, 35, 20, 0.04)'
                : 'inset -22px 0 34px rgba(61, 35, 20, 0.12), inset 5px 0 12px rgba(61, 35, 20, 0.04)',
          }}
        >
          {spreadPage(frontPage, turningPageSide, frontScrollTop)}
        </div>

        <div
          className="absolute inset-0 overflow-hidden bg-[#F7F0E5]"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            borderInline: '1px solid rgba(112, 78, 50, 0.16)',
            boxShadow:
              direction === 'next'
                ? 'inset -22px 0 34px rgba(61, 35, 20, 0.13), inset 5px 0 12px rgba(61, 35, 20, 0.04)'
                : 'inset 22px 0 34px rgba(61, 35, 20, 0.13), inset -5px 0 12px rgba(61, 35, 20, 0.04)',
          }}
        >
          {spreadPage(backPage, reversePageSide, 0)}
        </div>

        {/* Paper sheen travels from the outer edge back toward the binding. */}
        <motion.div
          aria-hidden="true"
          className={`absolute inset-y-0 ${direction === 'next' ? 'left-full' : 'left-0'} z-10 w-1/6`}
          initial={{ x: 0, opacity: 0.02, scaleX: 0.35 }}
          animate={{
            x: direction === 'next' ? '-600%' : '600%',
            opacity: [0.02, 0.56, 0.42, 0.02],
            scaleX: [0.35, 1.12, 0.82, 0.3],
          }}
          transition={{ duration, times: turnTimes, ease: turnEase }}
          style={{
            transformOrigin: direction === 'next' ? 'left center' : 'right center',
            background:
              direction === 'next'
                ? 'linear-gradient(90deg, rgba(255,255,255,.78), rgba(255,255,255,.24) 34%, rgba(61,35,20,.2) 72%, transparent)'
                : 'linear-gradient(270deg, rgba(255,255,255,.78), rgba(255,255,255,.24) 34%, rgba(61,35,20,.2) 72%, transparent)',
            filter: 'blur(3px)',
            backfaceVisibility: 'hidden',
          }}
        />
      </motion.div>
    </div>
  );
}

/* =========================================================================
   REALISTIC 3D BOOK READER OVERLAY (UNIFIED WHOLE-PAGE PER CHAPTER)
========================================================================= */
function RealisticBookReader({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [turnTarget, setTurnTarget] = useState<number | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageScrollPosition = useRef(0);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);
  const [showExcel, setShowExcel] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const totalChapters = 4;
  const pageTurnDuration = prefersReducedMotion ? 0.2 : 0.96;
  const pageTurnDurationMs = pageTurnDuration * 1000;
  const chapterTitles = [
    'Chương I: Tổng Quan Báo Cáo & Đội Ngũ',
    'Chương II: Dữ Liệu Các Quý (Q4/23 – Q3/26)',
    'Chương III: Báo Cáo BI Dashboard Toàn Diện',
    'Chương IV: Phản Biện Cold Calling & AI Chat',
  ];

  const turnToChapter = (target: number) => {
    if (isFlipping || target === currentChapter || target < 1 || target > totalChapters) return;

    if (isSoundEnabled) playPageTurnSound();
    setFlipDirection(target > currentChapter ? 'next' : 'prev');
    pageScrollPosition.current = scrollContainerRef.current?.scrollTop ?? 0;
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    setTurnTarget(target);
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentChapter(target);
      setTurnTarget(null);
      setIsFlipping(false);
    }, pageTurnDurationMs);
  };

  const renderChapterContent = (chapter: number) => (
    <>
      {chapter === 1 && <Chapter1 />}
      {chapter === 2 && <Chapter2 />}
      {chapter === 3 && (
        <Chapter3Dashboard
          onOpenLightbox={(img, title) => {
            setLightboxImage(img);
            setLightboxTitle(title);
          }}
          onOpenExcel={() => setShowExcel(true)}
        />
      )}
      {chapter === 4 && <Chapter4Defense />}
    </>
  );

  const handleNext = () => turnToChapter(currentChapter + 1);
  const handlePrev = () => turnToChapter(currentChapter - 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentChapter, isFlipping, isSoundEnabled]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#0c0907]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none">
        {/* Khung Bao Cuốn Sách Sang Trọng */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative w-full max-w-6xl h-[94vh] bg-[#FAF6F0] text-[#3D2314] rounded-3xl border-4 border-[#3D2314] flex flex-col overflow-hidden shadow-2xl"
          style={{
            boxShadow:
              '0 36px 96px -18px rgba(0, 0, 0, 0.88), 0 12px 34px rgba(34, 19, 11, 0.48), 0 0 42px rgba(230, 159, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.72), inset 0 0 28px rgba(61, 35, 20, 0.12)',
          }}
        >
          {/* Lớp xấp giấy dày hàng trăm trang ở 2 cạnh ngoài (Stacked Paper Edges) */}
          <div
            className="absolute top-0 bottom-0 left-0 w-3 z-30 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to right, #e8decd, #e8decd 1px, #d8cebc 1px, #d8cebc 2px)',
              boxShadow: 'inset -2px 0 3px rgba(61, 35, 20, 0.2)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-3 z-30 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(to left, #e8decd, #e8decd 1px, #d8cebc 1px, #d8cebc 2px)',
              boxShadow: 'inset 2px 0 3px rgba(61, 35, 20, 0.2)',
            }}
          />

          {/* Dải ruy băng đánh dấu trang mạ vàng */}
          <div className="absolute top-0 right-28 w-4 h-16 bg-[#E69F00] rounded-b-md shadow-md z-40 pointer-events-none" />

          {/* THANH ĐẦU TRANG (HEADER BAR) */}
          <div className="px-3 sm:px-6 py-3.5 border-b border-[#3D2314]/15 bg-[#FAF6F0] flex items-center justify-between z-20">
            <div className="min-w-0 flex-1 mr-2 flex items-center gap-2 sm:gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E69F00] animate-pulse" />
              <span aria-label={chapterTitles[currentChapter - 1]} title={chapterTitles[currentChapter - 1]} className="min-w-0 truncate text-[10px] sm:text-sm font-bold uppercase tracking-wider text-[#3D2314]">
                {chapterTitles[currentChapter - 1]}
              </span>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-1.5 rounded-lg text-[#3D2314] hover:bg-[#3D2314]/10 transition-colors cursor-pointer"
                title={isSoundEnabled ? 'Tắt âm thanh lật trang' : 'Bật âm thanh lật trang'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4 text-[#E69F00]" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-[#3D2314] hover:bg-[#D87093] text-[#FAF6F0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Đóng sách và quay lại thư viện 3D"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Đóng Sách</span>
              </button>
            </div>
          </div>

          {/* KHÔNG GIAN TOÀN TRANG CHƯƠNG VỚI HIỆU ỨNG LẬT 3D CHÂN THỰC */}
          <div
            className="flex-1 relative overflow-hidden z-10"
            style={{ perspective: '1500px', perspectiveOrigin: '50% 50%' }}
          >
            <div ref={scrollContainerRef} className="relative z-10 w-full h-full overflow-y-auto px-6 sm:px-10 md:px-14 py-8">
              <div key={turnTarget ?? currentChapter} className="min-h-full">
                {renderChapterContent(turnTarget ?? currentChapter)}
              </div>
            </div>

            {/* The crease stays visible at rest and deepens while a leaf turns. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-1/2 z-20 w-2 -translate-x-1/2 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(61,35,20,.06), rgba(61,35,20,.18) 44%, rgba(255,255,255,.48) 50%, rgba(61,35,20,.12) 62%, rgba(61,35,20,.04))',
                opacity: isFlipping ? 0.3 : 0.78,
                filter: 'drop-shadow(0 0 5px rgba(61,35,20,.14))',
              }}
            />

            {isFlipping && turnTarget !== null && (
              <BookPageTurn
                direction={flipDirection}
                duration={pageTurnDuration}
                reducedMotion={prefersReducedMotion}
                frontScrollTop={pageScrollPosition.current}
                frontPage={renderChapterContent(currentChapter)}
                backPage={renderChapterContent(turnTarget)}
              />
            )}

            {/* GÓC CUỘN TRANG THÔNG MINH (DOG-EAR PEEL ON HOVER) */}
            {currentChapter < totalChapters && !isFlipping && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={handleNext}
                aria-label="Lật tới trang tiếp theo"
                className="absolute bottom-2 right-2 w-14 h-14 group flex items-end justify-end cursor-pointer z-30 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00] focus-visible:outline-offset-2"
                title="Nhấp để sang trang tiếp theo"
              >
                <div className="relative w-9 h-9 group-hover:w-12 group-hover:h-12 transition-all duration-300">
                  <div
                    className="absolute bottom-0 right-0 w-full h-full"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      background: 'linear-gradient(135deg, #E6DAC4 0%, #D4C4A8 100%)',
                      boxShadow: '-3px -3px 6px rgba(61,35,20,0.3)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-full h-full pointer-events-none"
                    style={{
                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                      borderTop: '1.5px solid #E69F00',
                      borderLeft: '1.5px solid #E69F00',
                    }}
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold text-[#3D2314] opacity-0 group-hover:opacity-100 transition-opacity">
                    ▶
                  </span>
                </div>
              </motion.button>
            )}

            {currentChapter > 1 && !isFlipping && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={handlePrev}
                aria-label="Lật về trang trước"
                className="absolute bottom-2 left-2 w-14 h-14 group flex items-end justify-start cursor-pointer z-30 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00] focus-visible:outline-offset-2"
                title="Nhấp để về trang trước"
              >
                <div className="relative w-9 h-9 group-hover:w-12 group-hover:h-12 transition-all duration-300">
                  <div
                    className="absolute bottom-0 left-0 w-full h-full"
                    style={{
                      clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                      background: 'linear-gradient(225deg, #E6DAC4 0%, #D4C4A8 100%)',
                      boxShadow: '3px -3px 6px rgba(61,35,20,0.3)',
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                      borderTop: '1.5px solid #E69F00',
                      borderRight: '1.5px solid #E69F00',
                    }}
                  />
                  <span className="absolute bottom-1 left-1 text-[9px] font-bold text-[#3D2314] opacity-0 group-hover:opacity-100 transition-opacity">
                    ◀
                  </span>
                </div>
              </motion.button>
            )}
          </div>

          {/* THANH ĐIỀU HƯỚNG CUỐI SÁCH (FOOTER BAR) */}
          <div className="px-2 sm:px-6 py-2.5 sm:py-3.5 border-t border-[#3D2314]/15 bg-[#FAF6F0] flex items-center justify-between z-20">
            <button
              onClick={handlePrev}
              disabled={currentChapter === 1 || isFlipping}
              className="px-2 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold border border-[#3D2314]/30 text-[#3D2314] hover:bg-[#3D2314]/10 disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-[0_3px_12px_rgba(61,35,20,0.12)] hover:shadow-[0_7px_20px_rgba(61,35,20,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trang trước</span>
            </button>

            {/* Các nốt chấm chuyển chương */}
            <div className="flex items-center gap-0.5 sm:gap-2">
              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  onClick={() => turnToChapter(c)}
                  disabled={isFlipping}
                  className="group p-0.5 sm:p-1 cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00]"
                  title={chapterTitles[c - 1]}
                  aria-label={`Đi tới trang ${c}: ${chapterTitles[c - 1]}`}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      currentChapter === c
                        ? 'w-7 h-2.5 bg-[#E69F00]'
                        : 'w-2.5 h-2.5 bg-[#3D2314]/25 hover:bg-[#3D2314]/60'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-[#6B4C38] ml-2 hidden sm:inline">
                Trang {currentChapter} / {totalChapters}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentChapter === totalChapters || isFlipping}
              className="px-2 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold bg-[#3D2314] text-[#FAF6F0] hover:bg-[#E69F00] hover:text-[#3D2314] disabled:opacity-25 disabled:pointer-events-none flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-[0_5px_16px_rgba(61,35,20,0.24)] hover:shadow-[0_8px_22px_rgba(61,35,20,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E69F00]"
            >
              <span>Trang sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      <ImageLightbox
        image={lightboxImage}
        title={lightboxTitle}
        onClose={() => setLightboxImage(null)}
      />

      <ExcelPreviewModal isOpen={showExcel} onClose={() => setShowExcel(false)} />
    </>
  );
}

/* =========================================================================
   APP CHÍNH (THE BOOKSHELF EXPERIENCE)
========================================================================= */
export default function App() {
  const [compactLayout, setCompactLayout] = useState(() => window.innerWidth < 640);
  const [isReading, setIsReading] = useState(false);
  const [isClipOpen, setIsClipOpen] = useState(false);
  const [isTreasureFading, setIsTreasureFading] = useState(false);
  const [interactionBusy, setInteractionBusy] = useState(false);
  const interactionBusyRef = useRef(false);
  const keyLabelRef = useRef<HTMLDivElement>(null);
  const chestLabelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const syncLayout = () => setCompactLayout(window.innerWidth < 640);
    window.addEventListener('resize', syncLayout);
    return () => window.removeEventListener('resize', syncLayout);
  }, []);
  const handleInteractionBusyChange = useCallback((busy: boolean) => {
    interactionBusyRef.current = busy;
    setInteractionBusy(busy);
  }, []);
  const interactionsLocked = interactionBusy || isTreasureFading || isClipOpen;
  const cameraPosition: [number, number, number] = compactLayout ? [0, 0.1, 3.2] : [0, 0.1, 2.2];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#120E0B] select-none">
      {/* 1. KHÔNG GIAN CĂN PHÒNG & KỆ SÁCH 3D CHÂN THỰC */}
      <div
        className={`w-full h-full transition-all duration-700 ${
          isReading ? 'filter blur-md brightness-50 scale-105' : 'scale-100'
        }`}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          style={{ touchAction: 'none' }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          camera={{ position: cameraPosition, fov: compactLayout ? 52 : 45 }}
        >
          <CozyRoomScene
            onOpenBook={() => {
              if (interactionBusyRef.current || isTreasureFading || isClipOpen) return;
              playPageTurnSound();
              setIsReading(true);
            }}
            isReading={isReading}
            interactionsLocked={interactionsLocked}
            clipOpen={isClipOpen}
            onFadeStart={() => setIsTreasureFading(true)}
            onOpenClip={() => setIsClipOpen(true)}
            onInteractionBusyChange={handleInteractionBusyChange}
            keyLabelRef={keyLabelRef}
            chestLabelRef={chestLabelRef}
          />
        </Canvas>
      </div>

      <div ref={keyLabelRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-30 whitespace-nowrap -translate-x-1/2 -translate-y-full rounded-full border border-[#C18B39]/55 bg-[#1A100A]/90 px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-[#E8CEA0] shadow-lg" style={{ display: 'none' }} />
      <div ref={chestLabelRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-30 whitespace-nowrap -translate-x-1/2 -translate-y-full rounded-full border border-[#D3A14B]/75 bg-[#1A100A]/92 px-3 py-1.5 text-xs font-semibold text-[#F8E8C8] shadow-[0_8px_24px_rgba(0,0,0,.38)]" style={{ display: 'none' }} />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-40 bg-[#080503]"
        animate={{ opacity: isTreasureFading ? 0.92 : 0 }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
      />

      {/* 2. CHỈ DẪN TƯƠNG TÁC THƯ VIỆN ẤM ÁP */}
      {!isReading && !isTreasureFading && !isClipOpen && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1A140F]/85 backdrop-blur-md border border-[#E69F00]/60 shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E69F00] animate-ping" />
              <span className="text-xs md:text-sm font-semibold tracking-wide text-[#FAF6F0]">
                Kéo <span className="text-[#E69F00] font-bold">chìa đồng (ngăn giữa bên trái) lên rương gỗ (tầng trên)</span> để mở clip bí mật · Nhấp cuốn sách báo cáo ở giữa để đọc
              </span>
            </div>
            <span className="text-[11px] text-[#FAF6F0]/60 tracking-wider font-mono">
              Cocoon Vietnam & Cam Consumer · Interactive 3D Bookshelf Experience
            </span>
          </motion.div>
        </div>
      )}

      {/* 3. NÚT TRUY CẬP NHANH GÓC PHẢI */}
      {!isReading && !isTreasureFading && !isClipOpen && (
        <button
          onClick={() => {
            playPageTurnSound();
            setIsReading(true);
          }}
          className="absolute top-6 right-6 z-20 px-4 py-2 bg-[#1A140F]/85 hover:bg-[#E69F00] text-[#FAF6F0] hover:text-[#3D2314] border border-[#E69F00]/50 rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#E69F00]" />
          <span>Rút Sách Ra Đọc</span>
        </button>
      )}

      {/* 4. GIAO DIỆN MỞ SÁCH THỰC TẾ & LẬT TRANG CHÂN THẬT */}
      <RealisticBookReader isOpen={isReading} onClose={() => setIsReading(false)} />
      <ClipModal
        isOpen={isClipOpen}
        onClose={() => {
          setIsClipOpen(false);
          setIsTreasureFading(false);
        }}
      />
    </div>
  );
}
