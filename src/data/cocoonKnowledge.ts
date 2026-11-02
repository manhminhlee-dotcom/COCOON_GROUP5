export interface KnowledgeSource {
  label: string;
}

export interface GroundedAnswer {
  text: string;
  sources: KnowledgeSource[];
  hasCaveat?: boolean;
}

const sources = {
  cleanedCustomers: { label: 'cocoon_customers cleaned.xlsx · Customers / Data Dictionary' },
  qaPage1: { label: 'Q_A_HIHI.pdf · trang 1' },
  qaPage2: { label: 'Q_A_HIHI.pdf · trang 2' },
  qaPage3: { label: 'Q_A_HIHI.pdf · trang 3' },
  report: { label: 'Cocoon · Phân tích khách hàng.pdf · trang 1–7' },
  dashboard: { label: 'cocoon_vietnam_marketing_bi_dashboard.html' },
  shortDeck: { label: 'Cocoon.pdf · trang 1–2' },
};

const channels = [
  { name: 'Referral', sample: 22, churn: '63,6%', churned: 14 },
  { name: 'TikTok', sample: 51, churn: '47,1%', churned: 24 },
  { name: 'Marketplace', sample: 66, churn: '47,0%', churned: 31 },
  { name: 'In-store', sample: 43, churn: '46,5%', churned: 20 },
  { name: 'Influencer', sample: 21, churn: '42,9%', churned: 9 },
  { name: 'Instagram', sample: 59, churn: '42,4%', churned: 25 },
  { name: 'Search ads', sample: 38, churn: '34,2%', churned: 13 },
];

const reportedQuarterlyNewCustomers = [
  ['Q4/2023', 19], ['Q1/2024', 28], ['Q2/2024', 23], ['Q3/2024', 24],
  ['Q4/2024', 18], ['Q1/2025', 21], ['Q2/2025', 26], ['Q3/2025', 29],
  ['Q4/2025', 39], ['Q1/2026', 21], ['Q2/2026', 25], ['Q3/2026', 27],
] as const;

const channelProductMatrix = [
  { channel: 'Marketplace', values: [14, 10, 6, 2, 13, 3, 10, 8] },
  { channel: 'Instagram', values: [7, 14, 6, 4, 10, 7, 10, 1] },
  { channel: 'TikTok', values: [7, 6, 6, 5, 5, 6, 7, 9] },
  { channel: 'In-store', values: [5, 7, 9, 2, 8, 2, 4, 6] },
  { channel: 'Search ads', values: [4, 8, 3, 4, 5, 9, 2, 3] },
  { channel: 'Referral', values: [3, 2, 2, 4, 7, 2, 0, 2] },
  { channel: 'Influencer', values: [3, 1, 1, 3, 4, 2, 4, 3] },
];

const productColumns = [
  { terms: ['duong the', 'body care'], name: 'Dưỡng thể' },
  { terms: ['sua rua mat', 'cleanser'], name: 'Sữa rửa mặt' },
  { terms: ['duong moi', 'lip care'], name: 'Dưỡng môi' },
  { terms: ['mat na', 'mask'], name: 'Mặt nạ' },
  { terms: ['kem duong', 'moisturizer'], name: 'Kem dưỡng' },
  { terms: ['serum'], name: 'Serum' },
  { terms: ['chong nang', 'sunscreen'], name: 'Chống nắng' },
  { terms: ['toner'], name: 'Toner' },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function hasAny(query: string, terms: string[]) {
  return terms.some((term) => query.includes(normalize(term)));
}

function channelProductAnswer(query: string): GroundedAnswer | null {
  const mentionedChannels = channelProductMatrix.filter((item) => query.includes(normalize(item.channel)));
  const productIndices = productColumns
    .map((item, index) => item.terms.some((term) => query.includes(normalize(term))) ? index : -1)
    .filter((index) => index >= 0);

  if (mentionedChannels.length > 0 && productIndices.length > 0) {
    const comparisons = productIndices.map((productIndex) => {
      const product = productColumns[productIndex];
      const counts = mentionedChannels.map((channel) => `${channel.channel} ${channel.values[productIndex]}`).join(', ');
      return `${product.name}: ${counts} khách`;
    });
    const marketplaceBodyCare = productIndices.some((index) => productColumns[index].name === 'Dưỡng thể') &&
      mentionedChannels.some((item) => item.channel === 'Marketplace');
    const caveat = marketplaceBodyCare
      ? ' Lưu ý: con số Marketplace × Dưỡng thể là số khách trong ma trận; bảng sạch chỉ có 2 người trong giao điểm này được đánh dấu đăng ký subscription.'
      : '';

    return {
      text: `${comparisons.join('; ')}.${caveat}`,
      sources: [sources.cleanedCustomers, sources.dashboard],
      hasCaveat: Boolean(caveat),
    };
  }

  if (mentionedChannels.length > 0) {
    const rows = mentionedChannels.map((channel) => {
      const highest = Math.max(...channel.values);
      const products = productColumns.filter((_, index) => channel.values[index] === highest).map((item) => item.name);
      return `${channel.channel}: ${products.join(', ')} (${highest} khách/nhóm)`;
    });
    return { text: rows.join('; '), sources: [sources.cleanedCustomers, sources.dashboard] };
  }

  if (productIndices.length > 0) {
    const findings = productIndices.map((productIndex) => {
      const product = productColumns[productIndex];
      const highest = Math.max(...channelProductMatrix.map((channel) => channel.values[productIndex]));
      const topChannels = channelProductMatrix
        .filter((channel) => channel.values[productIndex] === highest)
        .map((channel) => channel.channel);
      return `${topChannels.join(' và ')} có số khách cao nhất ở nhóm ${product.name}: ${highest}`;
    });
    return {
      text: `${findings.join('; ')} khách.`,
      sources: [sources.cleanedCustomers, sources.dashboard],
    };
  }

  if (hasAny(query, ['kenh', 'san pham', 'heatmap'])) {
    return {
      text: 'Các ô có số khách cao nhất trong ma trận là Marketplace × Dưỡng thể: 14 và Instagram × Sữa rửa mặt: 14. Đây là số khách theo nhóm sản phẩm yêu thích, không phải doanh thu.',
      sources: [sources.cleanedCustomers, sources.dashboard],
    };
  }

  return null;
}

function channelChurnAnswer(query: string): GroundedAnswer {
  const mentionedChannels = channels.filter((item) => query.includes(normalize(item.name)));
  if (mentionedChannels.length > 0) {
    const detail = mentionedChannels
      .map((channel) => `${channel.name}: ${channel.churn} (${channel.churned}/${channel.sample} khách)`)
      .join('; ');
    return {
      text: `${detail}. Tỷ lệ toàn bộ bảng sạch là 136/300 = 45,3%.`,
      sources: [sources.cleanedCustomers, sources.report],
    };
  }

  const channelSummary = channels.map((item) => `${item.name} ${item.churn} (n=${item.sample})`).join('; ');
  return {
    text: `Bảng sạch có 136/300 khách được đánh dấu rời bỏ, tương đương 45,3% (báo cáo làm tròn 45%). Referral cao nhất ở 63,6% (14/22), Search ads thấp nhất ở 34,2% (13/38). Theo kênh: ${channelSummary}.`,
    sources: [sources.cleanedCustomers, sources.report, sources.dashboard],
  };
}

function tierAnswer(): GroundedAnswer {
  return {
    text: 'Trong bảng sạch, theo thứ tự Member / Bronze / Silver / Gold: số khách là 104 / 98 / 74 / 24; tỷ lệ churn là 72/104 (69,2%) / 29/98 (29,6%) / 23/74 (31,1%) / 12/24 (50%). CLV trung bình tương ứng là 657.702 / 1.429.398 / 2.626.095 / 4.981.333 đồng; CLV trung vị là 402.500 / 1.271.000 / 2.604.500 / 4.626.000 đồng. Đây là thống kê mô tả trên bộ dữ liệu mô phỏng.',
    sources: [sources.cleanedCustomers, sources.report],
  };
}

function subscriptionAnswer(): GroundedAnswer {
  return {
    text: 'Bảng sạch có 15 khách được đánh dấu đang đăng ký subscription và cả 15 đều chưa bị đánh dấu rời bỏ. Tuy nhiên, họ thuộc nhiều kênh khác nhau. Chỉ 2 người đồng thời thuộc Marketplace và có nhóm yêu thích Dưỡng thể, nên tài liệu chưa chứng minh đây là cùng một nhóm thử nghiệm 15 người.',
    sources: [sources.cleanedCustomers, sources.qaPage3, sources.dashboard],
    hasCaveat: true,
  };
}

function favoriteCategoryAnswer(): GroundedAnswer {
  const totals = productColumns
    .map((product, index) => ({
      name: product.name,
      customers: channelProductMatrix.reduce((sum, channel) => sum + channel.values[index], 0),
    }))
    .sort((a, b) => b.customers - a.customers);
  const sampleSize = totals.reduce((sum, item) => sum + item.customers, 0);
  const leaders = totals.slice(0, 3).map((item) =>
    `${item.name} ${item.customers}/${sampleSize} (${(item.customers / sampleSize * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%)`,
  );

  return {
    text: `Cộng ma trận 7 kênh × 8 nhóm yêu thích: ${leaders.join('; ')}. Đây là số khách chọn nhóm yêu thích, không phải doanh số; dashboard và Q&A có tỷ trọng doanh số chưa được đối soát với workbook.`,
    sources: [sources.cleanedCustomers, sources.dashboard, sources.qaPage2],
    hasCaveat: true,
  };
}

export function answerCocoonQuestion(input: string): GroundedAnswer {
  const query = normalize(input);
  const asksDataProvenance = hasAny(query, ['du lieu thuc te', 'du lieu that', 'khach hang that', 'synthetic', 'fictional', 'du lieu gia lap', 'nguon du lieu']);
  const asksLoss = hasAny(query, ['thiet hai', 'mat bao nhieu', 'that thoat', 'doanh thu mat', 'mat doanh thu', '55 56', 'tong clv gold roi']);
  const asksSubscription = hasAny(query, ['subscription', 'dang ky dinh ky', 'goi dang ky']);
  const asksChurn = hasAny(query, ['churn', 'roi bo', 'ty le roi', 'ty le churn']);
  const asksThreshold = hasAny(query, ['180 ngay', 'nguong churn', 'moc churn', 'tieu chi churn', 'dinh nghia churn', 'bao lau khong mua']);
  const asksChannelProduct = hasAny(query, ['kenh', 'marketplace', 'instagram', 'tiktok', 'referral', 'search ads', 'in store', 'influencer']) &&
    hasAny(query, ['san pham', 'product', 'nhom', 'category', 'danh muc', 'duong the', 'sua rua mat', 'duong moi', 'mat na', 'kem duong', 'serum', 'chong nang', 'toner', 'heatmap']);
  const asksWhy = hasAny(query, ['tai sao', 'vi sao', 'nguyen nhan', 'why', 'cause', 'ly do']);
  const asksFavoriteCategory = hasAny(query, ['ua chuong', 'yeu thich', 'pho bien', 'popular', 'favorite', 'nhieu nhat']) &&
    hasAny(query, ['san pham', 'product', 'nhom', 'category', 'danh muc']);

  if (asksDataProvenance) {
    return {
      text: 'Data Dictionary của workbook ghi rõ bộ dữ liệu là synthetic (fictional), dùng cho thực hành, với ngày tham chiếu 31/10/2026. Vì vậy, các kết quả trong bài nên được hiểu là phân tích trên dữ liệu mô phỏng, không xác nhận đây là hồ sơ khách hàng thật của Cocoon.',
      sources: [sources.cleanedCustomers, sources.dashboard],
      hasCaveat: true,
    };
  }

  if (asksLoss && hasAny(query, ['gold'])) {
    return {
      text: 'Q&A ước tính 55,56 triệu đồng bằng 12 khách Gold churn × trung vị Gold đã làm tròn 4,63 triệu. Cộng CLV của đúng 12 bản ghi Gold churn trong workbook được 46,908 triệu đồng. Đây đều là phép quy đổi CLV, không phải doanh thu mất được quan sát trực tiếp; workbook cũng ghi dữ liệu là mô phỏng.',
      sources: [sources.qaPage2, sources.cleanedCustomers],
      hasCaveat: true,
    };
  }

  if (asksSubscription) return subscriptionAnswer();

  if (asksFavoriteCategory && !channelProductMatrix.some((item) => query.includes(normalize(item.channel)))) {
    return favoriteCategoryAnswer();
  }

  if (asksChannelProduct) {
    const answer = channelProductAnswer(query);
    if (answer) return answer;
    return {
      text: 'Ma trận kênh × nhóm sản phẩm trong tài liệu có 7 kênh và 8 nhóm. Hãy hỏi rõ một kênh cùng một nhóm sản phẩm, ví dụ “Marketplace có bao nhiêu khách Dưỡng thể?”.',
      sources: [sources.cleanedCustomers, sources.dashboard],
    };
  }

  if (hasAny(query, ['canh bao', 'vip care', 'crm', 'giu chan']) &&
    hasAny(query, ['gold', 'silver', 'khach hang'])) {
    return {
      text: 'Tài liệu đưa ra hai mốc khuyến nghị khác nhau: PDF đề xuất VIP Care khi Gold/Silver chưa mua 120–150 ngày; câu hỏi nhóm đề xuất theo dõi Gold từ 60 ngày. Đây là ngưỡng đề xuất, chưa được thử nghiệm trên kết quả giữ chân. Quy tắc churn của workbook vẫn là không mua hơn 180 ngày (>180).',
      sources: [sources.qaPage2, sources.report, sources.cleanedCustomers],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['cross sell', 'cross-sell', 'combo', 'ban kem', 'mua kem', 'ban them'])) {
    return {
      text: 'Q&A gợi ý thử combo Sữa rửa mặt + Kem dưỡng hoặc Dưỡng thể + Serum, và sample sản phẩm bổ trợ cho đơn Dưỡng thể/Sữa rửa mặt. Đây là giả thuyết tiếp thị: bảng chỉ ghi nhóm sản phẩm yêu thích, không có dữ liệu giỏ hàng để xác nhận khách thực sự mua chéo. Các tỷ trọng doanh số trong Q&A/dashboard cũng chưa đối soát được với workbook.',
      sources: [sources.qaPage2, sources.cleanedCustomers, sources.dashboard],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['tren 180', 'hon 180', 'qua 180', 'sau 180']) &&
    hasAny(query, ['duoi 90', 'it hon 90', 'chua den 90'])) {
    return {
      text: 'Tính từ workbook: CLV trung bình của 136 khách không mua trên 180 ngày là 1.009.846 đồng; ở 102 khách có Recency dưới 90 ngày là 2.294.353 đồng. Nhóm trên 180 ngày thấp hơn khoảng 56%. Đây là so sánh mô tả, không chứng minh quan hệ nhân quả; Q&A ghi một ước tính khác (0,5 so với 2,5 triệu; thấp hơn 70–80%).',
      sources: [sources.cleanedCustomers, sources.qaPage2],
      hasCaveat: true,
    };
  }

  if (asksThreshold) {
    return {
      text: 'Data Dictionary định nghĩa khách rời bỏ là người không mua trong hơn 180 ngày. Q&A dùng cách viết “từ 180 ngày”, nên có khác biệt đúng ở mốc 180: trong bảng sạch có 1 bản ghi đúng 180 ngày nhưng chưa được đánh dấu churn. Vì vậy câu trả lời chính xác theo định nghĩa dữ liệu là >180 ngày.',
      sources: [sources.cleanedCustomers, sources.qaPage3],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['recency', 'tu lan mua cuoi']) &&
    hasAny(query, ['trung binh', 'trung vi', 'mean', 'average', 'bao nhieu ngay'])) {
    if (hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien'])) {
      return {
        text: 'Recency trung bình theo hạng, tính từ workbook: Member 399,86 ngày (n=104), Bronze 182,22 (n=98), Silver 161,15 (n=74), Gold 185,21 (n=24). Đây là thống kê mô tả; mức trung bình của Member bị kéo lên bởi khách có Recency rất dài.',
        sources: [sources.cleanedCustomers],
      };
    }
    if (hasAny(query, ['churn', 'roi bo', 'da roi'])) {
      return {
        text: 'Trong workbook, 136 khách churn có Recency trung bình 462,60 ngày (trung vị 383,5); 164 khách còn active có trung bình 78,66 ngày (trung vị 71,5). Quy tắc phân loại được ghi là không mua hơn 180 ngày.',
        sources: [sources.cleanedCustomers],
      };
    }
    if (hasAny(query, ['active', 'hoat dong', 'con mua'])) {
      return {
        text: 'Tính trực tiếp từ bảng sạch: 164 khách còn hoạt động (churned = 0) có Recency trung bình 78,66 ngày và trung vị 71,5 ngày. Đây là thống kê mô tả của nhóm active trong bộ dữ liệu mô phỏng.',
        sources: [sources.cleanedCustomers],
      };
    }
    return {
      text: 'Tính trên toàn bộ 300 bản ghi trong workbook, Recency trung bình là 252,71 ngày và trung vị là 159 ngày. Hai thống kê gộp chịu ảnh hưởng bởi 136 khách được đánh dấu churn; nhóm active riêng có trung bình 78,66 ngày.',
      sources: [sources.cleanedCustomers],
    };
  }

  if (hasAny(query, ['khach moi', 'tang truong', 'new customer']) ||
    (hasAny(query, ['q1', 'q2', 'q3', 'q4']) && hasAny(query, ['khach', 'customer', 'tang']) && !asksChurn)) {
    if (hasAny(query, ['cao nhat', 'nhieu nhat', 'peak', 'highest'])) {
      const [quarter, count] = reportedQuarterlyNewCustomers.reduce((top, item) => item[1] > top[1] ? item : top);
      return {
        text: `Cao nhất là ${quarter}: ${count} khách mới theo dashboard. Đây là đỉnh trong 12 quý được trình bày, không đủ để kết luận về chu kỳ tăng trưởng dài hạn.`,
        sources: [sources.cleanedCustomers, sources.dashboard],
      };
    }
    if (hasAny(query, ['thap nhat', 'it nhat', 'lowest'])) {
      const [quarter, count] = reportedQuarterlyNewCustomers.reduce((bottom, item) => item[1] < bottom[1] ? item : bottom);
      return {
        text: `Thấp nhất là ${quarter}: ${count} khách mới theo dashboard trong 12 quý được trình bày.`,
        sources: [sources.cleanedCustomers, sources.dashboard],
      };
    }
    const quarterMatch = query.match(/\bq([1-4])\s*(20)?([2-6][0-9])\b/);
    const selectedQuarter = quarterMatch
      ? `Q${quarterMatch[1]}/${quarterMatch[3].length === 2 ? `20${quarterMatch[3]}` : quarterMatch[3]}`
      : undefined;
    const selectedCount = reportedQuarterlyNewCustomers.find(([quarter]) => quarter === selectedQuarter);
    if (selectedCount) {
      return {
        text: `Dashboard ghi nhận ${selectedCount[1]} khách mới ở ${selectedCount[0]}. Chuỗi trên biểu đồ khớp với số ngày đăng ký theo quý trong workbook; nếu đếm theo ngày mua đầu tiên có thể khác, và dashboard không ghi rõ trường ngày dùng để lập biểu đồ.`,
        sources: [sources.cleanedCustomers, sources.dashboard],
        hasCaveat: true,
      };
    }
    const quarterSummary = reportedQuarterlyNewCustomers.map(([quarter, count]) => `${quarter}: ${count}`).join('; ');
    return {
      text: `Số khách mới theo chuỗi quý trên dashboard: ${quarterSummary}. Đếm theo trường signup_date trong workbook khớp với chuỗi này. Dashboard không nói rõ trường ngày; riêng Q4/2025, đếm theo first_purchase_date được 38 thay vì 39.`,
      sources: [sources.cleanedCustomers, sources.dashboard, sources.shortDeck],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['ty trong doanh so', 'doanh so theo nhom', '22%', '18%', '40% doanh so', 'danh muc san pham']) ||
    (hasAny(query, ['ty trong', 'phan tram', 'ty le', 'percentage', 'share']) &&
      hasAny(query, ['duong the', 'sua rua mat', 'duong moi', 'mat na', 'kem duong', 'serum', 'chong nang', 'toner', 'body care', 'cleanser']))) {
    return {
      text: 'Tỷ lệ hiển thị trên donut của dashboard: Dưỡng thể 22%, Sữa rửa mặt 18%, Dưỡng môi 14%, Mặt nạ 8%, Kem dưỡng 16%, Serum 7%, Chống nắng 10%, Toner 5%. Q&A ghi Serum 14% thay vì 7% (dashboard ghi Dưỡng môi 14%). Workbook không có doanh thu giao dịch theo sản phẩm để xác minh, nên đây là số hiển thị trong tài liệu, chưa được đối soát bằng dữ liệu gốc.',
      sources: [sources.cleanedCustomers, sources.qaPage2, sources.dashboard],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['referral']) && (asksWhy || hasAny(query, ['khuyen mai', 'voucher', 'khac phuc', 'giai phap']))) {
    return {
      text: 'Q&A đưa ra giả thuyết rằng voucher lớn cho đơn đầu có thể thu hút người mua vì ưu đãi ngắn hạn; nhóm đề xuất chuyển thưởng sang đơn thứ hai/tích điểm và rà lại chất lượng nguồn giới thiệu. Đây là phần diễn giải và khuyến nghị trong Q&A, không phải quan hệ nhân quả đã được kiểm định trong bảng khách hàng.',
      sources: [sources.qaPage1, sources.cleanedCustomers],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['search ads', 'searchad']) && hasAny(query, ['tang ngan sach', 'scale', 'san pham', 'khuyen nghi', 'nen lam'])) {
    return {
      text: 'Q&A đề xuất ưu tiên Search Ads vì tỷ lệ rời bỏ thấp nhất: 13/38 = 34,2%. Ma trận kênh × nhóm sản phẩm ghi Search ads có Serum 9 khách, Sữa rửa mặt 8 và Kem dưỡng 5. Chuyển ngân sách từ Referral sang Search Ads là khuyến nghị trong tài liệu, không phải kết quả thử nghiệm ngân sách.',
      sources: [sources.qaPage1, sources.cleanedCustomers],
    };
  }

  if (asksChurn && asksWhy && hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien'])) {
    return {
      text: 'Bảng sạch cho biết tỷ lệ churn theo hạng (Member 69,2%; Bronze 29,6%; Silver 31,1%; Gold 50%), nhưng không có biến giải thích nguyên nhân churn như lý do hủy, giá khuyến mãi hay lịch sử tương tác. Vì vậy có thể mô tả Gold có 12/24 khách churn, nhưng không thể kết luận vì sao từ các nguồn hiện có.',
      sources: [sources.cleanedCustomers, sources.qaPage2],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien']) && hasAny(query, ['clv', 'trung vi', 'trung binh', 'mean', 'average', 'gia tri', 'khach'])) {
    return tierAnswer();
  }

  if (asksChurn && asksWhy) {
    const answer = channelChurnAnswer(query);
    const isSearch = hasAny(query, ['search ads', 'searchad']);
    return {
      text: `${answer.text} ${isSearch ? 'Q&A gợi ý Search Ads có thể tiếp cận người chủ động tìm giải pháp, nhưng đây là giả thuyết chưa được kiểm định.' : 'Bảng không có biến giải thích nguyên nhân theo kênh, nên không thể kết luận vì sao chỉ từ tỷ lệ churn.'}`,
      sources: [...answer.sources, ...(isSearch ? [sources.qaPage1] : [])],
      hasCaveat: true,
    };
  }

  if (asksChurn && hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien'])) {
    return tierAnswer();
  }

  if (asksChurn) return channelChurnAnswer(query);

  if (hasAny(query, ['recency', 'tu lan mua cuoi', 'tuong quan', 'nhan qua'])) {
    return {
      text: 'Tính trực tiếp từ hai cột days_since_last_order và clv_vnd của bảng sạch, tương quan Pearson xấp xỉ -0,46 (n=300). Đây là tương quan âm, không chứng minh ngày không mua gây ra CLV thấp. Scatter của dashboard HTML được tạo bằng Math.random(), nên các điểm trong đó không phải 300 quan sát thật từ workbook.',
      sources: [sources.cleanedCustomers, sources.report, sources.dashboard],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['clv', 'trung vi', 'trung binh', 'mean', 'median', 'le phai', 'ngoai lai'])) {
    return {
      text: 'Trong bảng sạch, CLV trung vị là 1.406.500 đồng (xấp xỉ 1,41 triệu) và trung bình là 1.741.217 đồng (xấp xỉ 1,74 triệu). Q&A mô tả phân phối lệch phải: một nhóm CLV cao kéo trung bình lên, vì vậy trung vị phù hợp hơn khi mô tả khách hàng điển hình.',
      sources: [sources.cleanedCustomers, sources.qaPage1, sources.report],
    };
  }

  return {
    text: 'Mình chỉ trả lời câu hỏi có căn cứ trong báo cáo Cocoon, Q&A hoặc bảng khách hàng đã làm sạch. Câu hỏi này chưa khớp với nội dung đã đối chiếu. Hãy hỏi về CLV, churn theo kênh, khách mới Q4/25, hạng thành viên, nhóm sản phẩm, mốc 180 ngày hoặc subscription.',
    sources: [],
    hasCaveat: true,
  };
}
