import React, { useState, useMemo } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { QUARTER_DATA } from '../data/mockData';

export function Chapter2() {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4/2025');

  const currentQ = useMemo(() => {
    return (
      QUARTER_DATA.find((q) => `${q.quarter}/${q.year}` === selectedQuarter) ||
      QUARTER_DATA[8]
    );
  }, [selectedQuarter]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Tiêu đề Chương II */}
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-[#E69F00] mb-1">
          <Calendar className="w-4 h-4" />
          <span>Trang 2 · Dữ Liệu Các Quý (Q4/23 – Q3/26)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#3D2314]">
          Quy Luật Biến Động Khách Hàng Theo Từng Quý
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4C38] mt-1">
          Nhấp chọn bất kỳ quý nào trong 12 quý để xem dữ liệu thu hút khách mới, tỷ lệ rời bỏ, kênh dẫn đầu và kết luận kinh doanh tương ứng.
        </p>
      </div>

      {/* Thanh Chọn 12 Quý Tương Tác */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#EFE6D5] shadow-sm">
        <span className="text-xs font-bold text-[#6B4C38] block mb-2.5 uppercase tracking-wider">
          Chọn Quý khảo sát (12 Quý):
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
          {QUARTER_DATA.map((q) => {
            const key = `${q.quarter}/${q.year}`;
            const isSelected = selectedQuarter === key;
            const isPeak = q.status === 'peak';

            return (
              <button
                key={key}
                onClick={() => setSelectedQuarter(key)}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#3D2314] text-[#FAF6F0] border-[#3D2314] shadow-md scale-105'
                    : isPeak
                    ? 'bg-[#FEF3D6] border-[#E69F00] text-[#3D2314] font-bold'
                    : 'bg-[#FAF6F0] border-[#EFE6D5] text-[#3D2314] hover:border-[#E69F00]'
                }`}
              >
                <span className="block text-xs font-extrabold">{q.quarter}</span>
                <span className="block text-[10px] opacity-75">{q.year.slice(2)}</span>
                {isPeak && <span className="text-[9px] text-[#D48800] font-black block">★ PEAK</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chi Tiết Quý Được Chọn */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 border-2 border-[#E69F00]/40 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE6D5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#E69F00] text-[#3D2314]">
                Kỳ Báo Cáo {currentQ.quarter}/{currentQ.year}
              </span>
              {currentQ.status === 'peak' && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-red-100 text-red-800 animate-pulse">
                  🔥 Đỉnh cao thu hút
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold font-serif text-[#3D2314] mt-2">{currentQ.highlight}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#6B4C38] block">Khách mới trong quý:</span>
            <span className="text-3xl font-black text-[#E69F00] font-mono">{currentQ.newCustomers} khách</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#EFE6D5]">
            <span className="text-[11px] text-[#6B4C38] block font-semibold">Tỷ lệ rời bỏ (Churn)</span>
            <strong className="text-lg font-bold text-[#D87093] font-mono">{currentQ.churnRate}</strong>
          </div>
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#EFE6D5]">
            <span className="text-[11px] text-[#6B4C38] block font-semibold">Kênh thu hút chính</span>
            <strong className="text-xs font-bold text-[#3D2314] truncate block">{currentQ.topChannel}</strong>
          </div>
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#EFE6D5]">
            <span className="text-[11px] text-[#6B4C38] block font-semibold">Sản phẩm chủ lực</span>
            <strong className="text-xs font-bold text-[#3D2314] truncate block">{currentQ.topProduct}</strong>
          </div>
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#EFE6D5]">
            <span className="text-[11px] text-[#6B4C38] block font-semibold">Ước tính doanh thu</span>
            <strong className="text-lg font-bold text-[#3D2314] font-mono">{currentQ.revenueEst}</strong>
          </div>
        </div>

        <div className="p-4 bg-[#FEF3D6] rounded-2xl border border-[#E69F00]/30 text-xs text-[#3D2314] leading-relaxed">
          <strong className="font-bold text-[#D48800] block mb-1">💡 Nhận định kinh doanh (Business Insight):</strong>
          {currentQ.insight}
        </div>
      </div>

      {/* Khung So Sánh H1/2026: Q1 vs Q2 (Cam Consumer Netlify Benchmark) */}
      <div className="bg-[#3D2314] text-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#4A2E1B] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E69F00] bg-[#2C1810] px-3 py-1 rounded-full border border-[#E69F00]/30">
              Đối Chuẩn Thị Trường · Cam Consumer H1/2026
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#FAF6F0] mt-2">
              So Sánh Kết Quả Kinh Doanh Quý 1 vs Quý 2 (2026)
            </h3>
          </div>
          <a
            href="https://lustrous-licorice-891659.netlify.app/#cold-calling"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E69F00] text-[#3D2314] text-xs font-bold hover:bg-[#F5A623] transition-colors self-start sm:self-center"
          >
            <span>Xem Netlify Report</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-5 text-center">
          <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
            <span className="text-xs text-[#E5D9C5] block font-medium">Tổng Doanh Thu H1</span>
            <strong className="text-2xl font-black text-[#E69F00] font-mono">99.24 Tỷ đ</strong>
            <span className="text-[10px] text-emerald-400 block mt-1">Đạt 104% kế hoạch kỳ</span>
          </div>
          <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
            <span className="text-xs text-[#E5D9C5] block font-medium">Tổng Chi Phí H1</span>
            <strong className="text-2xl font-black text-[#FAF6F0] font-mono">70.17 Tỷ đ</strong>
            <span className="text-[10px] text-[#E5D9C5] block mt-1">Kiểm soát COGS & MKT</span>
          </div>
          <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
            <span className="text-xs text-[#E5D9C5] block font-medium">Lợi Nhuận Trước Thuế</span>
            <strong className="text-2xl font-black text-emerald-400 font-mono">29.07 Tỷ đ</strong>
            <span className="text-[10px] text-emerald-400 block mt-1">Vượt 8.2% cùng kỳ</span>
          </div>
          <div className="bg-[#2C1810] p-4 rounded-2xl border border-[#4A2E1B]">
            <span className="text-xs text-[#E5D9C5] block font-medium">Biên Lợi Nhuận Ròng</span>
            <strong className="text-2xl font-black text-[#E69F00] font-mono">29.3%</strong>
            <span className="text-[10px] text-[#E5D9C5] block mt-1">Tỷ suất sinh lời cao</span>
          </div>
        </div>

        <p className="text-xs text-[#E5D9C5] leading-relaxed">
          Số liệu đối chuẩn cho thấy Cocoon Vietnam đóng góp trực tiếp vào chuỗi phân phối mỹ phẩm thiên nhiên, với sự ổn định qua từng quý và tỷ suất lợi nhuận biên thuộc top đầu phân khúc chăm sóc cá nhân (Personal Care).
        </p>
      </div>
    </div>
  );
}
