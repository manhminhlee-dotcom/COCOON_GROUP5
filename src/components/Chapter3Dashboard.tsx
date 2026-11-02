import React, { useState } from 'react';
import {
  Sprout,
  Video,
  Calendar,
  FileSpreadsheet,
  Users,
  Wallet,
  UserMinus,
  Crown,
  Maximize2,
  CheckCircle2,
  BellRing,
  ShoppingCart,
  UserCheck,
  Search,
  Layers,
} from 'lucide-react';
import { ORIGINAL_CHARTS, HEATMAP_MATRIX, CATEGORY_NAMES } from '../data/mockData';

export function Chapter3Dashboard({
  onOpenLightbox,
  onOpenExcel,
}: {
  onOpenLightbox: (img: string, title: string) => void;
  onOpenExcel: () => void;
}) {
  const [commercialMode, setCommercialMode] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'Q4_25'>('ALL');

  return (
    <div className={`space-y-8 max-w-5xl mx-auto pb-12 ${commercialMode ? 'contrast-115' : ''}`}>
      {/* 1. HEADER SECTION (COCOON VIETNAM BI DASHBOARD) */}
      <div className="bg-[#3D2314] text-[#FAF6F0] rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[#4A2E1B] shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#E69F00] text-[#3D2314] font-bold text-xl shadow-md">
                <Sprout className="w-6 h-6 stroke-[2.3]" />
              </span>
              <div>
                <span className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase text-[#E69F00] bg-[#2C1810] px-3 py-1 rounded-full border border-[#E69F00]/30">
                  100% Vegan · Commercial Data Analytics Visuals
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#FAF6F0] mt-1">
                  Cocoon Vietnam <span className="text-[#E69F00] text-base sm:text-xl font-normal font-sans">| Báo Cáo Phân Tích Khách Hàng BI</span>
                </h1>
              </div>
            </div>
            <p className="text-[#E5D9C5] text-xs sm:text-sm max-w-3xl font-normal leading-relaxed">
              Số liệu hiển thị <strong className="text-[#E69F00]">trực tiếp trên biểu đồ (Direct Labels)</strong> phục vụ chụp ảnh báo cáo & quay clip giới thiệu dự án Business Intelligence. Dữ liệu thực tế Q4/2023 – Q3/2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setCommercialMode(!commercialMode)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
                commercialMode
                  ? 'bg-[#E69F00] text-[#3D2314] border-[#E69F00]'
                  : 'bg-[#2C1810] text-[#E69F00] border-[#E69F00]/50 hover:bg-[#4A2E1B]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{commercialMode ? 'Tắt Chế Độ Commercial' : 'Bật Mode Commercial'}</span>
            </button>

            <div className="flex items-center space-x-2 bg-[#2C1810] px-3.5 py-2 rounded-xl border border-[#4A2E1B] text-xs text-[#FAF6F0]">
              <Calendar className="w-4 h-4 text-[#E69F00]" />
              <span className="text-[#E5D9C5] font-medium">Kỳ:</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as 'ALL' | 'Q4_25')}
                className="bg-transparent font-bold text-[#E69F00] focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#3D2314] text-[#FAF6F0]">Toàn thời gian (Q4/23 - Q3/26)</option>
                <option value="Q4_25" className="bg-[#3D2314] text-[#FAF6F0]">Đỉnh điểm (Q4/2025)</option>
              </select>
            </div>

            <button
              onClick={onOpenExcel}
              className="flex items-center space-x-1.5 bg-[#E69F00] hover:bg-[#D48800] text-[#3D2314] font-extrabold px-3.5 py-2 rounded-xl transition duration-200 shadow-md text-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mở Excel Sạch</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 THẺ TỔNG HỢP KPI SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B4C38] uppercase tracking-wider">Tổng Khách Tích Lũy</span>
            <span className="p-2 rounded-xl bg-[#E69F00]/20 text-[#3D2314]">
              <Users className="w-4 h-4 text-[#D48800]" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#3D2314] font-mono">
              {timeFilter === 'Q4_25' ? '39' : '300+'}
            </div>
            <span className="inline-flex items-center text-[10px] font-extrabold text-[#3D2314] bg-[#E69F00]/30 px-2.5 py-0.5 rounded-full border border-[#E69F00]/40">
              Peak Q4/25: 39 khách
            </span>
          </div>
          <p className="text-[11px] text-[#6B4C38] mt-2">Tăng mạnh nhất mùa sale cuối năm</p>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B4C38] uppercase tracking-wider">CLV Trung Vị vs Trung Bình</span>
            <span className="p-2 rounded-xl bg-[#3D2314]/10 text-[#3D2314]">
              <Wallet className="w-4 h-4 text-[#3D2314]" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-[#3D2314] font-mono">1,41</span>
              <span className="text-xs font-bold text-[#6B4C38] ml-1">trđ</span>
            </div>
            <span className="text-xs font-bold text-[#D48800] bg-[#E69F00]/15 px-2 py-0.5 rounded-md font-mono">
              Mean: 1,74 trđ
            </span>
          </div>
          <p className="text-[11px] text-[#6B4C38] mt-2">Phân phối lệch phải rõ rệt (Right-skewed)</p>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B4C38] uppercase tracking-wider">Tỷ Lệ Rời Bỏ Trung Bình</span>
            <span className="p-2 rounded-xl bg-[#D87093]/20 text-[#C2527A]">
              <UserMinus className="w-4 h-4 text-[#C2527A]" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-[#D87093] font-mono">45%</div>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Search Ads: 34% Churn
            </span>
          </div>
          <p className="text-[11px] text-[#6B4C38] mt-2">Referral rời bỏ cao nhất (64%)</p>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B4C38] uppercase tracking-wider">Hạng Gold VIP</span>
            <span className="p-2 rounded-xl bg-[#E69F00]/20 text-[#3D2314]">
              <Crown className="w-4 h-4 text-[#D48800]" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-[#3D2314] font-mono">4,63</span>
              <span className="text-xs font-bold text-[#6B4C38] ml-1">trđ</span>
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              50% Đã rời bỏ
            </span>
          </div>
          <p className="text-[11px] text-[#6B4C38] mt-2">Cần chăm sóc trước 180 ngày</p>
        </div>
      </div>

      {/* 3. SECTION 1: TREND & HISTOGRAM WITH DIRECT NUMBERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#D48800] bg-[#E69F00]/15 px-2.5 py-1 rounded-md">
                  Biểu đồ đường xu hướng
                </span>
                <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
                  Khách Hàng Mới Tăng Mạnh Nhất Vào Q4/2025 (39 Khách)
                </h2>
              </div>
              <button
                onClick={() => onOpenLightbox(ORIGINAL_CHARTS[0].src, ORIGINAL_CHARTS[0].title)}
                className="text-xs font-bold text-[#3D2314] bg-[#FAF6F0] hover:bg-[#E69F00] p-1.5 rounded-lg border border-[#EFE6D5] transition-colors flex items-center gap-1 self-start sm:self-center cursor-pointer"
                title="Phóng to biểu đồ gốc"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Gốc</span>
              </button>
            </div>
            <p className="text-xs text-[#6B4C38] mb-4">
              Số liệu ghi nhận theo 12 quý. Điểm màu cam <strong className="text-[#E69F00]">Q4/25 (39 khách)</strong> đánh dấu mùa sale lớn nhất trong năm.
            </p>
          </div>

          <div className="w-full bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D5]">
            <div className="relative h-64 w-full">
              <svg viewBox="0 0 540 240" className="w-full h-full overflow-visible">
                {[0, 10, 20, 30, 40].map((val, idx) => {
                  const y = 200 - (val / 45) * 170;
                  return (
                    <g key={idx}>
                      <line x1="40" y1={y} x2="520" y2={y} stroke="rgba(61, 35, 20, 0.08)" strokeDasharray="3 3" />
                      <text x="32" y={y + 4} fill="#6B4C38" fontSize="10" textAnchor="end" fontFamily="monospace">
                        {val}
                      </text>
                    </g>
                  );
                })}

                <polygon
                  points="40,200 40,128 83,94 127,113 170,109 214,132 257,121 301,102 344,91 388,53 431,121 475,106 518,98 518,200"
                  fill="rgba(230, 159, 0, 0.14)"
                />

                <polyline
                  fill="none"
                  stroke="#3D2314"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="40,128 83,94 127,113 170,109 214,132 257,121 301,102 344,91 388,53 431,121 475,106 518,98"
                />

                {[
                  { x: 40, y: 128, val: 19, q: 'Q4/23' },
                  { x: 83, y: 94, val: 28, q: 'Q1/24' },
                  { x: 127, y: 113, val: 23, q: 'Q2/24' },
                  { x: 170, y: 109, val: 24, q: 'Q3/24' },
                  { x: 214, y: 132, val: 18, q: 'Q4/24' },
                  { x: 257, y: 121, val: 21, q: 'Q1/25' },
                  { x: 301, y: 102, val: 26, q: 'Q2/25' },
                  { x: 344, y: 91, val: 29, q: 'Q3/25' },
                  { x: 388, y: 53, val: 39, q: 'Q4/25', peak: true },
                  { x: 431, y: 121, val: 21, q: 'Q1/26' },
                  { x: 475, y: 106, val: 25, q: 'Q2/26' },
                  { x: 518, y: 98, val: 27, q: 'Q3/26' },
                ].map((pt, i) => (
                  <g key={i}>
                    {pt.peak ? (
                      <>
                        <circle cx={pt.x} cy={pt.y} r="10" fill="#E69F00" stroke="#3D2314" strokeWidth="2.5" />
                        <rect x={pt.x - 24} y={pt.y - 28} width="48" height="18" rx="5" fill="#E69F00" stroke="#3D2314" strokeWidth="1" />
                        <text x={pt.x} y={pt.y - 15} fill="#3D2314" fontSize="11" fontWeight="bold" textAnchor="middle">
                          🔥 39
                        </text>
                      </>
                    ) : (
                      <>
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#FAF6F0" stroke="#3D2314" strokeWidth="2" />
                        <text x={pt.x} y={pt.y - 8} fill="#3D2314" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                          {pt.val}
                        </text>
                      </>
                    )}
                    <text x={pt.x} y="218" fill="#3D2314" fontSize="9" fontWeight="600" textAnchor="middle">
                      {pt.q}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-[#FEF3D6] rounded-2xl border border-[#E69F00]/30 flex items-start space-x-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#D48800] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#3D2314] font-bold">Kết luận báo cáo:</strong>
              <span className="text-[#3D2314]"> Nên chuẩn bị ngân sách tiếp thị và tồn kho trước mùa sale cuối năm để đáp ứng nhu cầu tăng đột biến.</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D2314] bg-[#3D2314]/10 px-2.5 py-1 rounded-md">
                Histogram phân phối
              </span>
              <button
                onClick={() => onOpenLightbox(ORIGINAL_CHARTS[1].src, ORIGINAL_CHARTS[1].title)}
                className="text-xs font-bold text-[#3D2314] bg-[#FAF6F0] hover:bg-[#E69F00] p-1.5 rounded-lg border border-[#EFE6D5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Gốc</span>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
              Phân Phối CLV Mỗi Khách (Lệch Phải)
            </h2>
            <p className="text-xs text-[#6B4C38] mt-1 mb-4">
              Số lượng khách hiển thị trực tiếp trên đỉnh mỗi cột. Vạch đứt vàng là <strong>Trung vị (1,41 trđ)</strong>, vạch chấm là <strong>Trung bình (1,74 trđ)</strong>.
            </p>
          </div>

          <div className="w-full bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D5]">
            <div className="h-60 w-full flex items-end justify-between gap-1.5 pt-6 pb-2 px-1">
              {[
                { range: '0-1tr', count: 108 },
                { range: '1-2tr', count: 93 },
                { range: '2-3tr', count: 49 },
                { range: '3-4tr', count: 30 },
                { range: '4-5tr', count: 10 },
                { range: '5-6tr', count: 4 },
                { range: '6-7tr', count: 3 },
                { range: '7-8tr', count: 1 },
                { range: '8-9tr', count: 2 },
              ].map((bar, i) => {
                const heightPct = (bar.count / 115) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <span className="text-[10px] font-black text-[#3D2314] mb-1 font-mono">
                      {bar.count}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        i === 0
                          ? 'bg-[#3D2314]'
                          : i === 1
                          ? 'bg-[#E69F00]'
                          : 'bg-[#6B4C38]/75 group-hover:bg-[#E69F00]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-[#6B4C38] mt-1 font-semibold truncate w-full text-center">
                      {bar.range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-center">
            <div className="bg-[#E69F00]/20 p-2.5 rounded-xl border border-[#E69F00]/40">
              <span className="block text-[11px] text-[#6B4C38] font-bold">Trung vị (Khách điển hình)</span>
              <strong className="text-lg text-[#3D2314] font-extrabold font-mono">1,41 trđ</strong>
            </div>
            <div className="bg-[#3D2314]/10 p-2.5 rounded-xl border border-[#3D2314]/20">
              <span className="block text-[11px] text-[#6B4C38] font-bold">Trung bình (Tổng doanh thu)</span>
              <strong className="text-lg text-[#3D2314] font-extrabold font-mono">1,74 trđ</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION 2: CHURN THEO 7 KÊNH & MA TRẬN NHIỆT KÊNH × SẢN PHẨM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#C2527A] bg-[#D87093]/15 px-2.5 py-1 rounded-md">
                Tỷ lệ rời bỏ
              </span>
              <button
                onClick={() => onOpenLightbox(ORIGINAL_CHARTS[2].src, ORIGINAL_CHARTS[2].title)}
                className="text-xs font-bold text-[#3D2314] bg-[#FAF6F0] hover:bg-[#E69F00] p-1.5 rounded-lg border border-[#EFE6D5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Gốc</span>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
              Referral Rời Bỏ Cao Nhất, Search Ads Thấp Nhất
            </h2>
            <p className="text-xs text-[#6B4C38] mt-1 mb-3">
              Tỷ lệ % và số lượng mẫu in trực tiếp cạnh mỗi cột. Kênh Referral cần tái cấu trúc.
            </p>
          </div>

          <div className="space-y-2.5 bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D5]">
            {[
              { channel: 'Referral', churn: 64, n: 22, color: 'bg-[#E69F00]' },
              { channel: 'TikTok', churn: 47, n: 51, color: 'bg-[#6B4C38]' },
              { channel: 'Marketplace', churn: 47, n: 66, color: 'bg-[#6B4C38]' },
              { channel: 'In-store', churn: 46, n: 43, color: 'bg-[#6B4C38]' },
              { channel: 'Influencer', churn: 43, n: 21, color: 'bg-[#6B4C38]' },
              { channel: 'Instagram', churn: 42, n: 59, color: 'bg-[#6B4C38]' },
              { channel: 'Search ads', churn: 34, n: 38, color: 'bg-teal-600' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#3D2314]">
                  <span>{item.channel}</span>
                  <span className="font-mono text-[#3D2314]">
                    {item.churn}% <span className="text-[10px] text-[#6B4C38] font-normal">(n={item.n})</span>
                  </span>
                </div>
                <div className="h-4 bg-[#EFE6D5] rounded-full overflow-hidden flex items-center">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.churn}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-[#FDEBF1] rounded-2xl border border-[#D87093]/30 text-xs text-[#3D2314]">
            <strong className="text-[#C2527A] font-bold">Nên làm:</strong> Rà lại chất lượng khách từ Referral (64%, n=22) và tiếp tục đẩy mạnh kênh Search ads (34%).
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D2314] bg-[#E69F00]/20 px-2.5 py-1 rounded-md">
                  Ma trận 7 Kênh × 8 Nhóm Sản Phẩm
                </span>
                <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
                  Kênh Thu Hút Kéo Khách Về Nhóm Sản Phẩm Nào
                </h2>
              </div>
              <button
                onClick={() => onOpenLightbox(ORIGINAL_CHARTS[5].src, ORIGINAL_CHARTS[5].title)}
                className="text-xs font-bold text-[#3D2314] bg-[#FAF6F0] hover:bg-[#E69F00] p-1.5 rounded-lg border border-[#EFE6D5] transition-colors flex items-center gap-1 self-start sm:self-center cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Gốc</span>
              </button>
            </div>
            <p className="text-xs text-[#6B4C38] mb-3">
              Ô màu cam đậm thể hiện số lượng khách hàng cao nhất (Marketplace × Dưỡng thể: 14; Instagram × Sữa rửa mặt: 14).
            </p>
          </div>

          <div className="overflow-x-auto border border-[#E5D9C5] rounded-2xl p-2 bg-[#FAF6F0]/60">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="text-[10.5px] font-extrabold text-[#3D2314] border-b border-[#E5D9C5]">
                  <th className="py-2 px-2 text-left">Kênh</th>
                  {CATEGORY_NAMES.map((cat, i) => (
                    <th key={i} className="py-2 px-1">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs font-bold">
                {HEATMAP_MATRIX.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-[#E5D9C5]/50 hover:bg-[#FAF6F0] transition">
                    <td className="py-2 px-2 text-left font-bold text-[#3D2314] whitespace-nowrap text-[11px]">{row.channel}</td>
                    {row.data.map((val, cIdx) => {
                      let bgStyle = 'bg-transparent text-[#6B4C38]';
                      if (val >= 12) bgStyle = 'bg-[#E69F00] text-[#3D2314] font-black shadow-sm';
                      else if (val >= 9) bgStyle = 'bg-[#FCE8B2] text-[#3D2314] font-bold';
                      else if (val >= 5) bgStyle = 'bg-[#FBF2DE] text-[#3D2314] font-semibold';

                      return (
                        <td key={cIdx} className="py-1 px-1">
                          <div className={`rounded-md py-1 px-1 inline-block w-7 text-center font-mono ${bgStyle}`}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#E5D9C5]">
            <span className="text-[#6B4C38] text-[11px]">Gói đăng ký thử nghiệm: <strong>15 hội viên chưa ai rời bỏ (0% Churn)</strong></span>
            <span className="text-[11px] text-[#D48800] font-extrabold">Dùng kênh mạnh để đẩy đúng nhóm sản phẩm phù hợp</span>
          </div>
        </div>
      </div>

      {/* 5. SECTION 3: MEMBERSHIP BOXPLOT & RECENCY SCATTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D2314] bg-[#3D2314]/10 px-2.5 py-1 rounded-md">
                Box Plot CLV theo Hạng
              </span>
              <button
                onClick={() => onOpenLightbox(ORIGINAL_CHARTS[3].src, ORIGINAL_CHARTS[3].title)}
                className="text-xs font-bold text-[#3D2314] bg-[#FAF6F0] hover:bg-[#E69F00] p-1.5 rounded-lg border border-[#EFE6D5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Gốc</span>
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
              Member Giá Trị Thấp, Gold Cao Nhưng Biên Độ Rộng
            </h2>
            <p className="text-xs text-[#6B4C38] mt-1 mb-3">
              Số dư trung vị in đậm ngay cạnh từng khối hộp. Hạng <strong>Gold trung vị 4,63 trđ</strong> nhưng phân bố kéo dài.
            </p>
          </div>

          <div className="space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D5]">
            {[
              { tier: 'Member (n=104)', median: '0,40 trđ', iqr: '0,20 – 1,20 trđ', max: '2.40 trđ', w: '25%' },
              { tier: 'Bronze (n=98)', median: '1,27 trđ', iqr: '0,90 – 1,95 trđ', max: '3.80 trđ', w: '45%' },
              { tier: 'Silver (n=74)', median: '2,60 trđ', iqr: '1,90 – 3,20 trđ', max: '5.20 trđ', w: '65%' },
              { tier: 'Gold (n=24)', median: '4,63 trđ', iqr: '3,40 – 6,00 trđ', max: '8.50 trđ', w: '95%', isGold: true },
            ].map((b, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-white border border-[#EFE6D5]">
                <div className="flex justify-between items-center text-xs font-bold text-[#3D2314] mb-1">
                  <span>{b.tier}</span>
                  <span className={`font-mono text-sm ${b.isGold ? 'text-[#D48800] font-black' : 'text-[#3D2314]'}`}>
                    Trung vị: {b.median}
                  </span>
                </div>
                <div className="h-4 bg-[#FAF6F0] rounded-full overflow-hidden flex items-center p-0.5 border border-[#EFE6D5]">
                  <div className={`h-full rounded-full ${b.isGold ? 'bg-[#E69F00]' : 'bg-[#6B4C38]'}`} style={{ width: b.w }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#6B4C38] mt-1">
                  <span>Dải 50% giữa (IQR): {b.iqr}</span>
                  <span>Đỉnh: {b.max}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-[#FAF6F0] p-2 rounded-xl border border-[#EFE6D5]">
              <span className="block text-[#6B4C38] text-[9.5px]">Member</span>
              <strong className="text-[#3D2314] font-mono font-bold">0,40 trđ</strong>
            </div>
            <div className="bg-[#FAF6F0] p-2 rounded-xl border border-[#EFE6D5]">
              <span className="block text-[#6B4C38] text-[9.5px]">Bronze</span>
              <strong className="text-[#3D2314] font-mono font-bold">1,27 trđ</strong>
            </div>
            <div className="bg-[#FAF6F0] p-2 rounded-xl border border-[#EFE6D5]">
              <span className="block text-[#6B4C38] text-[9.5px]">Silver</span>
              <strong className="text-[#3D2314] font-mono font-bold">2,60 trđ</strong>
            </div>
            <div className="bg-[#E69F00]/25 p-2 rounded-xl border border-[#E69F00]/40">
              <span className="block text-[#3D2314] text-[9.5px] font-bold">Gold</span>
              <strong className="text-[#D48800] font-mono font-black">4,63 trđ</strong>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#C2527A] bg-[#D87093]/15 px-2.5 py-1 rounded-md">
                Scatter Plot tương quan
              </span>
              <button
                onClick={() => onOpenLightbox(ORIGINAL_CHARTS[4].src, ORIGINAL_CHARTS[4].title)}
                className="text-xs font-bold text-[#3D2314] bg-[#FAF6F0] hover:bg-[#E69F00] p-1.5 rounded-lg border border-[#EFE6D5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom Gốc</span>
              </button>
            </div>
            <div className="flex items-center space-x-3 text-xs font-bold mb-1">
              <span className="flex items-center text-teal-800"><span className="w-2.5 h-2.5 rounded-full bg-teal-600 mr-1.5" />Còn hoạt động (&lt;180 ngày)</span>
              <span className="flex items-center text-[#C2527A]"><span className="w-2.5 h-2.5 rounded-full bg-[#D87093] mr-1.5" />Đã rời bỏ (&gt;=180 ngày)</span>
            </div>
            <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
              Càng Lâu Không Mua, Giá Trị Càng Thấp
            </h2>
            <p className="text-xs text-[#6B4C38] mt-1 mb-4">
              Mỗi chấm là một khách hàng. Toàn bộ khách rời bỏ dồn về bên phải vạch 180 ngày.
            </p>
          </div>

          <div className="w-full bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D5]">
            <div className="relative h-60 w-full">
              <svg viewBox="0 0 450 200" className="w-full h-full overflow-visible">
                <line x1="40" y1="170" x2="430" y2="170" stroke="#3D2314" strokeWidth="1.5" />
                <line x1="40" y1="170" x2="40" y2="20" stroke="#3D2314" strokeWidth="1.5" />

                <line x1="170" y1="20" x2="170" y2="170" stroke="#D87093" strokeWidth="2" strokeDasharray="4 4" />
                <text x="175" y="35" fill="#C2527A" fontSize="10" fontWeight="bold">
                  Mốc Churn 180 ngày
                </text>

                {[
                  [55, 60], [70, 95], [85, 45], [95, 120], [110, 80], [125, 40], [135, 140],
                  [60, 110], [75, 130], [90, 70], [105, 50], [120, 105], [140, 75], [150, 115],
                  [65, 85], [80, 150], [100, 90], [115, 65], [130, 125], [145, 95], [155, 45],
                ].map(([cx, cy], i) => (
                  <circle key={`act-${i}`} cx={cx} cy={cy} r="4" fill="#0D9488" opacity="0.85" />
                ))}

                {[
                  [190, 130], [210, 145], [230, 110], [250, 155], [270, 120], [290, 140], [310, 160],
                  [200, 150], [220, 125], [240, 140], [260, 165], [280, 130], [300, 150], [330, 145],
                  [350, 135], [370, 155], [390, 140], [410, 150], [225, 60], [310, 55],
                ].map(([cx, cy], i) => (
                  <circle key={`churn-${i}`} cx={cx} cy={cy} r="4" fill="#D87093" opacity="0.85" />
                ))}

                <text x="40" y="190" fill="#6B4C38" fontSize="9" textAnchor="middle">0 ngày</text>
                <text x="170" y="190" fill="#C2527A" fontSize="9" fontWeight="bold" textAnchor="middle">180 ngày</text>
                <text x="430" y="190" fill="#6B4C38" fontSize="9" textAnchor="middle">750 ngày</text>
              </svg>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#3D2314] text-[#FAF6F0] rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-[#E69F00] shrink-0" />
              <span>Nên làm: <strong>Chăm lại khách Gold / Silver trước khi họ quá hạn mua.</strong></span>
            </div>
            <span className="text-[10px] font-bold text-[#3D2314] bg-[#E69F00] px-2.5 py-1 rounded-md shrink-0">
              Ghi nhớ
            </span>
          </div>
        </div>
      </div>

      {/* 6. SECTION 4: TỶ TRỌNG SẢN PHẨM & 4 KHỐI KHUYẾN NGHỊ "NÊN LÀM" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#FFFDF9] p-6 rounded-3xl border border-[#EFE6D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#3D2314] bg-[#E69F00]/20 px-2.5 py-1 rounded-md">
                Đóng góp danh mục
              </span>
              <span className="text-xs text-[#6B4C38] font-bold">8 Nhóm mỹ phẩm</span>
            </div>
            <h2 className="text-xl font-bold text-[#3D2314] font-serif mt-1">
              Tỷ Trọng Doanh Số Sản Phẩm
            </h2>
            <p className="text-xs text-[#6B4C38] mt-1 mb-3">
              Dưỡng thể và Sữa rửa mặt dẫn đầu thị phần tiêu dùng của khách hàng Cocoon.
            </p>
          </div>

          <div className="space-y-2 bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D5]">
            {[
              { name: 'Dưỡng thể Cà phê', pct: 22, color: 'bg-[#E69F00]' },
              { name: 'Sữa rửa mặt Nghệ', pct: 18, color: 'bg-[#3D2314]' },
              { name: 'Dưỡng môi Cà phê', pct: 14, color: 'bg-[#D87093]' },
              { name: 'Kem dưỡng Bí đao', pct: 16, color: 'bg-[#4A2E1B]' },
              { name: 'Chống nắng Bí đao', pct: 10, color: 'bg-[#6B4C38]' },
              { name: 'Mặt nạ Hoa hồng', pct: 8, color: 'bg-[#F5A623]' },
              { name: 'Serum Bí đao', pct: 7, color: 'bg-[#C2527A]' },
              { name: 'Toner Cà phê', pct: 5, color: 'bg-[#D48800]' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-semibold text-[#3D2314]">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${p.color}`} />
                  <span>{p.name}</span>
                </div>
                <span className="font-mono font-bold">{p.pct}%</span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center text-xs font-bold text-[#3D2314]">
            Top 2: <span className="text-[#D48800]">Dưỡng thể (22%)</span> & <span className="text-[#3D2314]">Sữa rửa mặt (18%)</span>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#3D2314] text-[#FAF6F0] p-6 sm:p-8 rounded-3xl border border-[#4A2E1B] shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#E69F00] bg-[#2C1810] px-3 py-1 rounded-full border border-[#E69F00]/30">
                Khuyến nghị chiến lược (Tóm tắt BI)
              </span>
              <span className="text-xs text-[#E5D9C5] font-medium">DataCamp Style</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#FAF6F0] mb-4">
              Tổng Hợp Việc "Nên Làm" Cho Thương Hiệu Cocoon
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
              <div className="flex items-center space-x-2 text-[#E69F00] mb-2">
                <ShoppingCart className="w-4 h-4" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">1. Chuẩn bị tồn kho Q4</h3>
              </div>
              <p className="text-xs text-[#E5D9C5] leading-relaxed">
                Khách mới bứt phá mạnh nhất vào <strong>Q4/25 (39 khách)</strong>. Cần chuẩn bị ngân sách tiếp thị & kho hàng trước mùa sale cuối năm.
              </p>
            </div>

            <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
              <div className="flex items-center space-x-2 text-[#E882A6] mb-2">
                <UserCheck className="w-4 h-4" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">2. Giữ chân Member & Gold</h3>
              </div>
              <p className="text-xs text-[#E5D9C5] leading-relaxed">
                Kéo khách Member mua đơn thứ 2 sớm. Chăm lại nhóm Gold/Silver <strong>trước khi họ quá hạn mua (180+ ngày)</strong> vì 50% Gold đã rời bỏ.
              </p>
            </div>

            <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
              <div className="flex items-center space-x-2 text-[#E69F00] mb-2">
                <Search className="w-4 h-4" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">3. Rà soát kênh Referral</h3>
              </div>
              <p className="text-xs text-[#E5D9C5] leading-relaxed">
                Referral rời bỏ nhiều nhất (<strong>64%</strong>), Search Ads thấp nhất (<strong>34%</strong>). Rà lại chất lượng nguồn giới thiệu để tối ưu ROI.
              </p>
            </div>

            <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Layers className="w-4 h-4" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">4. Đẩy mạnh Gói Đăng Ký</h3>
              </div>
              <p className="text-xs text-[#E5D9C5] leading-relaxed">
                Dùng kênh mạnh để đẩy đúng nhóm sản phẩm yêu thích (Marketplace × Dưỡng thể), rồi thử gói đăng ký (<strong>15 hội viên chưa ai rời bỏ</strong>).
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#4A2E1B] flex items-center justify-between text-[11px] text-[#E5D9C5]">
            <span>Cocoon Vietnam · Visual BI Analytics Report</span>
            <span className="text-[#E69F00] font-bold">Presentation & Commercial Clip Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
