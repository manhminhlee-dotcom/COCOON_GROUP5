import React from 'react';
import { Bookmark, Flame, UserMinus, Crown, Users } from 'lucide-react';
import { TEAM_MEMBERS } from '../data/mockData';

export function Chapter1() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner Tiêu Đề Chương */}
      <div className="bg-[#3D2314] text-[#FAF6F0] rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[#4A2E1B] shadow-lg">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-[#E69F00] mb-2">
          <Bookmark className="w-4 h-4" />
          <span>Trang 1 · Tổng Quan Báo Cáo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-[#FAF6F0] leading-tight mb-3">
          Báo Cáo Phân Tích Dữ Liệu Khách Hàng Cocoon Vietnam
        </h1>
        <p className="text-sm sm:text-base text-[#E5D9C5] max-w-3xl leading-relaxed mb-4">
          Nghiên cứu thực chứng chuyên sâu quy luật tiêu dùng, mô hình hóa Churn 180 ngày và định vị chiến lược giữ chân khách hàng cho thương hiệu mỹ phẩm thuần chay hàng đầu Việt Nam.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs pt-3 border-t border-[#4A2E1B]">
          <span className="bg-[#2C1810] text-[#E69F00] px-3 py-1.5 rounded-full border border-[#E69F00]/30 font-semibold">
            Giai đoạn nghiên cứu: Q4/2023 – Q3/2026
          </span>
          <span className="bg-[#2C1810] text-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#4A2E1B]">
            Quy mô: 300 khách hàng chuẩn hóa
          </span>
          <span className="bg-[#2C1810] text-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#4A2E1B]">
            Phương pháp: EDA, RFM, IQR, Survival Churn Analysis
          </span>
        </div>
      </div>

      {/* Tóm tắt 3 Trụ Cột Nghiên Cứu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#E69F00]/20 flex items-center justify-center text-[#E69F00] font-bold mb-3">
            <Flame className="w-5 h-5 text-[#D48800]" />
          </div>
          <h3 className="font-bold text-base text-[#3D2314] mb-1.5">Mùa Vàng Thu Hút Q4/25</h3>
          <p className="text-xs text-[#6B4C38] leading-relaxed">
            Phát hiện lượng khách mới bứt phá đỉnh điểm <strong>39 khách vào Q4/2025</strong> nhờ các chiến dịch Mega Sale và xu hướng tiêu dùng thuần chay cuối năm.
          </p>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#D87093]/20 flex items-center justify-center text-[#D87093] font-bold mb-3">
            <UserMinus className="w-5 h-5 text-[#C2527A]" />
          </div>
          <h3 className="font-bold text-base text-[#3D2314] mb-1.5">Giải Mã Mốc Churn 180 Ngày</h3>
          <p className="text-xs text-[#6B4C38] leading-relaxed">
            Chứng minh bằng biểu đồ tương quan: 100% khách rời bỏ vượt mốc 180 ngày không mua (tương đương 2 chu kỳ tiêu dùng mỹ phẩm). Cần can thiệp ở mốc 90–120 ngày.
          </p>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold mb-3">
            <Crown className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="font-bold text-base text-[#3D2314] mb-1.5">Nghịch Lý Hạng Gold VIP</h3>
          <p className="text-xs text-[#6B4C38] leading-relaxed">
            Nhóm Gold có CLV cao nhất (trung vị 4,63 trđ) nhưng có tới <strong>50% khách đã rời bỏ</strong>. Đây là lỗ rò rỉ doanh thu nghiêm trọng cần chiến lược VIP Care khẩn cấp.
          </p>
        </div>
      </div>

      {/* Hồ sơ Đội Ngũ Thực Hiện (7 Thành Viên) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#E69F00]" />
          <h2 className="text-xl font-bold font-serif text-[#3D2314]">Đội Ngũ Thực Hiện Đồ Án (7 thành viên)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((m, idx) => (
            <div
              key={idx}
              className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#EFE6D5] hover:border-[#E69F00] transition-colors shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-2xl">{m.avatar}</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#3D2314] leading-tight">{m.name}</h4>
                    <span className="text-[11px] text-[#E69F00] font-bold block">{m.role}</span>
                  </div>
                </div>
                <p className="text-xs text-[#6B4C38] leading-relaxed mb-3">{m.desc}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#EFE6D5]">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF6F0] border border-[#EFE6D5] text-[#3D2314] font-medium">
                  MSSV: {m.studentId}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
