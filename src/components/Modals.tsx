import React from 'react';
import { motion } from 'framer-motion';
import { X, FileSpreadsheet } from 'lucide-react';

export function ImageLightbox({
  image,
  title,
  onClose,
}: {
  image: string | null;
  title: string | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative max-w-4xl max-h-[92vh] bg-[#FAF6F0] p-4 rounded-2xl shadow-2xl border border-[#3D2314]/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#3D2314] text-[#FAF6F0] rounded-full hover:bg-[#E69F00] hover:text-[#3D2314] transition-colors z-10 cursor-pointer shadow-md"
          aria-label="Đóng ảnh"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="overflow-hidden rounded-xl border border-[#3D2314]/15 bg-white">
          <img src={image} alt={title || 'Biểu đồ chi tiết'} className="w-full h-auto object-contain max-h-[75vh]" />
        </div>
        <div className="mt-3 text-center">
          <p className="font-bold text-sm text-[#3D2314]">{title}</p>
          <span className="text-[11px] text-[#3D2314]/70">Dữ liệu nguồn trích từ Báo cáo Phân tích Khách hàng Cocoon</span>
        </div>
      </motion.div>
    </div>
  );
}

export function ExcelPreviewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#FAF6F0] text-[#3D2314] p-6 rounded-2xl shadow-2xl border border-[#3D2314]/25 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 28px 80px rgba(0,0,0,.52), 0 8px 24px rgba(61,35,20,.16), inset 0 1px 0 rgba(255,255,255,.72)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#3D2314]/15 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#3D2314]">Dữ Liệu Đã Làm Sạch: Cocoon_Cleaned_300_Customers.xlsx</h3>
              <p className="text-xs text-[#3D2314]/70">Bao gồm 300 bản ghi chuẩn hóa, 7 kênh tiếp thị, phân hạng RFM và trạng thái Churn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#3D2314]/10 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto flex-1 border border-[#3D2314]/30 rounded-xl text-[13px] shadow-[inset_0_2px_4px_rgba(61,35,20,0.08)] bg-[#FFFDF9]">
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">Bản xem trước 5 khách hàng trong bộ dữ liệu đã làm sạch</caption>
            <thead className="bg-[#2D160A] text-[#FAF6F0] uppercase tracking-wider text-xs shadow-md border-b-2 border-[#E69F00]">
              <tr>
                <th className="py-3 px-3.5 font-bold tracking-wider">CustomerID</th>
                <th className="py-3 px-3.5 font-bold tracking-wider">Kênh Thu Hút</th>
                <th className="py-3 px-3.5 font-bold tracking-wider">Sản Phẩm</th>
                <th className="py-3 px-3.5 font-bold tracking-wider">Hạng Thành Viên</th>
                <th className="py-3 px-3.5 text-right font-bold tracking-wider">CLV (VNĐ)</th>
                <th className="py-3 px-3.5 text-center font-bold tracking-wider">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3D2314]/20 text-[#2D160A]">
              <tr className="bg-[#FFFDF9] hover:bg-[#E69F00]/15 transition-colors">
                <td className="py-3 px-3.5 font-mono font-extrabold text-[#2D160A]">CCN_001</td>
                <td className="py-3 px-3.5 font-semibold text-[#3D2214]">Search ads</td>
                <td className="py-3 px-3.5 font-medium text-[#261309]">Serum Bí Đao</td>
                <td className="py-3 px-3.5 font-extrabold text-[#995C00]">Gold</td>
                <td className="py-3 px-3.5 text-right font-mono font-extrabold text-[#2D160A]">4.850.000</td>
                <td className="py-3 px-3.5 text-center"><span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold shadow-sm">Hoạt động</span></td>
              </tr>
              <tr className="bg-[#F6EFE5] hover:bg-[#E69F00]/15 transition-colors">
                <td className="py-3 px-3.5 font-mono font-extrabold text-[#2D160A]">CCN_002</td>
                <td className="py-3 px-3.5 font-semibold text-[#3D2214]">Referral</td>
                <td className="py-3 px-3.5 font-medium text-[#261309]">Toner Cà Phê</td>
                <td className="py-3 px-3.5 font-bold text-[#5C3720]">Member</td>
                <td className="py-3 px-3.5 text-right font-mono font-extrabold text-[#2D160A]">420.000</td>
                <td className="py-3 px-3.5 text-center"><span className="px-2.5 py-1 rounded-md bg-[#C55375] text-white text-[11px] font-bold shadow-sm">Đã rời bỏ (64%)</span></td>
              </tr>
              <tr className="bg-[#FFFDF9] hover:bg-[#E69F00]/15 transition-colors">
                <td className="py-3 px-3.5 font-mono font-extrabold text-[#2D160A]">CCN_003</td>
                <td className="py-3 px-3.5 font-semibold text-[#3D2214]">Marketplace</td>
                <td className="py-3 px-3.5 font-medium text-[#261309]">Dưỡng thể Cà phê</td>
                <td className="py-3 px-3.5 font-extrabold text-[#A85116]">Bronze</td>
                <td className="py-3 px-3.5 text-right font-mono font-extrabold text-[#2D160A]">1.280.000</td>
                <td className="py-3 px-3.5 text-center"><span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold shadow-sm">Hoạt động (Sub 15)</span></td>
              </tr>
              <tr className="bg-[#F6EFE5] hover:bg-[#E69F00]/15 transition-colors">
                <td className="py-3 px-3.5 font-mono font-extrabold text-[#2D160A]">CCN_004</td>
                <td className="py-3 px-3.5 font-semibold text-[#3D2214]">Instagram</td>
                <td className="py-3 px-3.5 font-medium text-[#261309]">Sữa rửa mặt Nghệ Hưng Yên</td>
                <td className="py-3 px-3.5 font-extrabold text-[#3B4657]">Silver</td>
                <td className="py-3 px-3.5 text-right font-mono font-extrabold text-[#2D160A]">2.640.000</td>
                <td className="py-3 px-3.5 text-center"><span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold shadow-sm">Hoạt động</span></td>
              </tr>
              <tr className="bg-[#FFFDF9] hover:bg-[#E69F00]/15 transition-colors">
                <td className="py-3 px-3.5 font-mono font-extrabold text-[#2D160A]">CCN_005</td>
                <td className="py-3 px-3.5 font-semibold text-[#3D2214]">TikTok</td>
                <td className="py-3 px-3.5 font-medium text-[#261309]">Tẩy da chết Môi</td>
                <td className="py-3 px-3.5 font-extrabold text-[#995C00]">Gold</td>
                <td className="py-3 px-3.5 text-right font-mono font-extrabold text-[#2D160A]">4.630.000</td>
                <td className="py-3 px-3.5 text-center"><span className="px-2.5 py-1 rounded-md bg-[#C55375] text-white text-[11px] font-bold shadow-sm">Đã rời bỏ (50% Gold)</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-[#3D2314]/15 flex items-center justify-between text-xs text-[#3D2314]/80">
          <span>Tổng số mẫu: 300 khách hàng hợp lệ (Đã xử lý ngoại lai & kiểm định IQR)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3D2314] text-[#FAF6F0] rounded-lg font-medium hover:bg-[#E69F00] hover:text-[#3D2314] transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
