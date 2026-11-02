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
  const channel = channels.find((item) => query.includes(normalize(item.name)));
  if (channel) {
    return {
      text: `${channel.name}: ${channel.churn} (${channel.churned}/${channel.sample} khách). Tỷ lệ toàn bộ bảng sạch là 136/300 = 45,3%.`,
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
    text: 'CLV trung vị theo hạng trong bảng sạch: Member 0,4025 triệu đồng (n=104), Bronze 1,271 triệu (n=98), Silver 2,6045 triệu (n=74), Gold 4,626 triệu (n=24). Có 12/24 khách Gold được đánh dấu rời bỏ (50%).',
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

export function answerCocoonQuestion(input: string): GroundedAnswer {
  const query = normalize(input);
  const asksDataProvenance = hasAny(query, ['du lieu thuc te', 'du lieu that', 'khach hang that', 'synthetic', 'fictional', 'du lieu gia lap', 'nguon du lieu']);
  const asksLoss = hasAny(query, ['thiet hai', 'mat bao nhieu', 'that thoat', 'doanh thu mat', 'mat doanh thu', '55 56']);
  const asksSubscription = hasAny(query, ['subscription', 'dang ky dinh ky', 'goi dang ky', 'hoi vien']);
  const asksChurn = hasAny(query, ['churn', 'roi bo', 'ty le roi', 'ty le churn']);
  const asksThreshold = hasAny(query, ['180 ngay', 'nguong churn', 'moc churn', 'tieu chi churn', 'dinh nghia churn', 'bao lau khong mua']);
  const asksChannelProduct = hasAny(query, ['kenh', 'marketplace', 'instagram', 'tiktok', 'referral', 'search ads', 'in store', 'influencer']) &&
    hasAny(query, ['san pham', 'nhom', 'duong the', 'sua rua mat', 'duong moi', 'mat na', 'kem duong', 'serum', 'chong nang', 'toner', 'heatmap']);

  if (asksDataProvenance) {
    return {
      text: 'Tệp Data Dictionary trong bảng sạch ghi rõ dữ liệu là synthetic (fictional), dùng cho thực hành và có mốc tham chiếu 31/10/2026. Dashboard HTML lại gọi đây là dữ liệu thực tế. Vì hai nguồn mâu thuẫn, chatbot xem các kết quả là dữ liệu mô phỏng của bài tập, không xác nhận là hồ sơ khách hàng thật của Cocoon.',
      sources: [sources.cleanedCustomers, sources.dashboard],
      hasCaveat: true,
    };
  }

  if (asksLoss && hasAny(query, ['gold'])) {
    return {
      text: 'Q&A nêu ước tính khoảng 55,56 triệu đồng, được tính bằng 12 khách rời bỏ × CLV trung vị Gold 4,63 triệu đồng. Trong bảng sạch, tổng CLV của 12 khách Gold bị đánh dấu rời bỏ là 46,908 triệu đồng. Vì vậy 55,56 triệu là phép ước tính trong Q&A, không phải tổng doanh thu mất được đối chiếu trực tiếp từ bảng.',
      sources: [sources.qaPage2, sources.cleanedCustomers],
      hasCaveat: true,
    };
  }

  if (asksSubscription) return subscriptionAnswer();

  if (asksChannelProduct) {
    const answer = channelProductAnswer(query);
    if (answer) return answer;
    return {
      text: 'Ma trận kênh × nhóm sản phẩm trong tài liệu có 7 kênh và 8 nhóm. Hãy hỏi rõ một kênh cùng một nhóm sản phẩm, ví dụ “Marketplace có bao nhiêu khách Dưỡng thể?”.',
      sources: [sources.cleanedCustomers, sources.dashboard],
    };
  }

  if (asksThreshold) {
    return {
      text: 'Data Dictionary định nghĩa khách rời bỏ là người không mua trong hơn 180 ngày. Q&A dùng cách viết “từ 180 ngày”, nên có khác biệt đúng ở mốc 180: trong bảng sạch có 1 bản ghi đúng 180 ngày nhưng chưa được đánh dấu churn. Vì vậy câu trả lời chính xác theo định nghĩa dữ liệu là >180 ngày.',
      sources: [sources.cleanedCustomers, sources.qaPage3],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['khach moi', 'tang truong']) ||
    (hasAny(query, ['q4']) && hasAny(query, ['khach', 'customer', 'tang']) && !asksChurn)) {
    return {
      text: 'Tài liệu báo Q4/2025 có 39 khách mới. Con số 39 khớp với 39 ngày đăng ký trong bảng sạch; nếu đếm theo ngày mua đầu tiên thì bảng có 38. Tài liệu không ghi rõ trường ngày nào dùng cho biểu đồ, nên nên gọi đây là số khách mới theo báo cáo và lưu ý cách đếm.',
      sources: [sources.cleanedCustomers, sources.dashboard, sources.shortDeck],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['ty trong doanh so', 'doanh so theo nhom', '22%', '18%', '40% doanh so', 'danh muc san pham']) ||
    (hasAny(query, ['ty trong', 'bao nhieu phan tram', 'chiem bao nhieu']) &&
      hasAny(query, ['duong the', 'sua rua mat', 'body care', 'cleanser']))) {
    return {
      text: 'Một số tài liệu ghi Dưỡng thể 22% và Sữa rửa mặt 18% doanh số. Bảng sạch không có doanh thu theo từng giao dịch/sản phẩm để kiểm tra các tỷ lệ này. Vì vậy, mình không thể xác nhận 22% và 18% từ bảng dữ liệu.',
      sources: [sources.cleanedCustomers, sources.qaPage2, sources.dashboard],
      hasCaveat: true,
    };
  }

  if (hasAny(query, ['referral']) && hasAny(query, ['tai sao', 'vi sao', 'nguyen nhan', 'khuyen mai', 'voucher', 'khac phuc', 'giai phap'])) {
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

  if (hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien']) && hasAny(query, ['clv', 'trung vi', 'gia tri', 'khach'])) {
    return tierAnswer();
  }

  if (asksChurn && hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien'])) {
    return tierAnswer();
  }

  if (asksChurn) return channelChurnAnswer(query);

  if (hasAny(query, ['clv', 'trung vi', 'trung binh', 'mean', 'median', 'le phai', 'ngoai lai'])) {
    return {
      text: 'Trong bảng sạch, CLV trung vị là 1.406.500 đồng (xấp xỉ 1,41 triệu) và trung bình là 1.741.217 đồng (xấp xỉ 1,74 triệu). Q&A mô tả phân phối lệch phải: một nhóm CLV cao kéo trung bình lên, vì vậy trung vị phù hợp hơn khi mô tả khách hàng điển hình.',
      sources: [sources.cleanedCustomers, sources.qaPage1, sources.report],
    };
  }

  if (hasAny(query, ['recency', 'tu lan mua cuoi', 'tuong quan', 'nhan qua'])) {
    return {
      text: 'Tính trực tiếp từ hai cột days_since_last_order và clv_vnd của bảng sạch cho tương quan Pearson xấp xỉ -0,46. Đây là tương quan âm, không chứng minh ngày không mua gây ra CLV thấp. Riêng các điểm trong scatter của dashboard HTML được tạo bằng Math.random, nên không phải biểu đồ điểm từ 300 bản ghi.',
      sources: [sources.cleanedCustomers, sources.report, sources.dashboard],
      hasCaveat: true,
    };
  }

  return {
    text: 'Mình chỉ trả lời câu hỏi có căn cứ trong báo cáo Cocoon, Q&A hoặc bảng khách hàng đã làm sạch. Câu hỏi này chưa khớp với nội dung đã đối chiếu. Hãy hỏi về CLV, churn theo kênh, khách mới Q4/25, hạng thành viên, nhóm sản phẩm, mốc 180 ngày hoặc subscription.',
    sources: [],
    hasCaveat: true,
  };
}
