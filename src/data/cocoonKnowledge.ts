import { CURATED_COCOON_QA } from './curatedCocoonQa.ts';

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

export const COCOON_KNOWLEDGE_SOURCES = [
  { title: 'Bảng khách hàng đã làm sạch', detail: 'Customers · Data Dictionary' },
  { title: 'Q&A bảo vệ đồ án', detail: '3 trang' },
  { title: 'Báo cáo phân tích khách hàng', detail: '7 trang' },
  { title: 'Dashboard BI Cocoon', detail: 'HTML và biểu đồ đi kèm' },
  { title: 'Câu hỏi nhóm', detail: '35 câu đã gắn nguồn' },
];

const channels = [
  { name: 'Referral', terms: ['referral', 'gioi thieu', 'kenh gioi thieu', 'nguon gioi thieu'], sample: 22, churn: '63,6%', churned: 14 },
  { name: 'TikTok', terms: ['tiktok'], sample: 51, churn: '47,1%', churned: 24 },
  { name: 'Marketplace', terms: ['marketplace', 'san thuong mai dien tu', 'san tmdt', 'tmdt'], sample: 66, churn: '47,0%', churned: 31 },
  { name: 'In-store', terms: ['in store', 'in-store', 'cua hang', 'tai cua hang', 'mua tai cua hang'], sample: 43, churn: '46,5%', churned: 20 },
  { name: 'Influencer', terms: ['influencer', 'nguoi anh huong'], sample: 21, churn: '42,9%', churned: 9 },
  { name: 'Instagram', terms: ['instagram'], sample: 59, churn: '42,4%', churned: 25 },
  { name: 'Search ads', terms: ['search ads', 'searchad', 'quang cao tim kiem', 'tim kiem'], sample: 38, churn: '34,2%', churned: 13 },
];

const loyaltyTierChurn = [
  { name: 'Member', sample: 104, churned: 72, rate: '69,2%' },
  { name: 'Bronze', sample: 98, churned: 29, rate: '29,6%' },
  { name: 'Silver', sample: 74, churned: 23, rate: '31,1%' },
  { name: 'Gold', sample: 24, churned: 12, rate: '50,0%' },
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

const RETRIEVAL_STOP_WORDS = new Set([
  'bao', 'biet', 'cac', 'cho', 'co', 'cua', 'gi', 'giua', 'hay', 'la', 'lai', 'lap',
  'nao', 'nhu', 'nhung', 'qua', 'sao', 'the', 'theo', 'thi', 'toi', 'trong', 'tu',
  've', 'voi', 'va', 'mot', 'nhom', 'khach', 'hang', 'cua', 'duoc', 'de', 'vi',
  'nhu', 'ra', 'nao', 'hay', 'so', 'voi', 'co', 'the', 'la', 'giua', 'tai', 'sao',
]);

// Phrase concepts let Vietnamese, English, and colloquial variants reach the same
// source-backed answer without turning the chatbot into open-domain guessing.
const RETRIEVAL_CONCEPTS = [
  { key: 'clv', phrases: ['clv', 'customer lifetime value', 'gia tri vong doi', 'gia tri tron doi', 'gia tri khach hang'] },
  { key: 'churn', phrases: ['churn', 'roi bo', 'roi bo khach hang', 'khong mua lai', 'ngung mua', 'mat khach', 'mat khach hang', 'khach roi di', 'customer attrition'] },
  { key: 'recency', phrases: ['recency', 'ngay tu lan mua cuoi', 'ngay mua gan nhat', 'lan mua gan nhat', 'thoi gian ngung mua'] },
  { key: 'new-customers', phrases: ['khach moi', 'new customer', 'khach hang moi', 'tang truong khach hang'] },
  { key: 'tier', phrases: ['hang thanh vien', 'loyalty tier', 'member', 'bronze', 'silver', 'gold'] },
  { key: 'product-category', phrases: ['nhom san pham', 'danh muc san pham', 'product category', 'category', 'mat hang'] },
  { key: 'channel', phrases: ['kenh thu hut', 'kenh ban hang', 'acquisition channel', 'search ads', 'in store', 'marketplace', 'instagram', 'tiktok', 'referral', 'influencer'] },
  { key: 'referral', phrases: ['referral', 'gioi thieu', 'kenh gioi thieu'] },
  { key: 'search-ads', phrases: ['search ads', 'quang cao tim kiem'] },
  { key: 'in-store', phrases: ['in store', 'cua hang', 'tai cua hang'] },
  { key: 'subscription', phrases: ['subscription', 'dang ky dinh ky', 'thanh vien dang ky'] },
  { key: 'revenue-share', phrases: ['ty trong doanh so', 'doanh so theo san pham', 'ty le doanh thu', 'product revenue'] },
];

function retrievalText(value: string) {
  return normalize(value).replace(/\bq([1-4])\s*[/-]?\s*(?:20)?([2-6]\d)\b/g, (_match, quarter: string, year: string) => `q${quarter} 20${year}`);
}

function retrievalTerms(value: string) {
  const normalized = retrievalText(value);
  const terms = new Set(
    normalized.split(' ').filter((term) => term.length > 1 && !RETRIEVAL_STOP_WORDS.has(term)),
  );
  for (const concept of RETRIEVAL_CONCEPTS) {
    if (concept.phrases.some((phrase) => normalized.includes(normalize(phrase)))) {
      terms.add(`concept:${concept.key}`);
    }
  }
  return terms;
}

function findClosestCuratedAnswer(query: string): GroundedAnswer | null {
  const normalizedQuery = retrievalText(query);
  const queryTerms = retrievalTerms(query);
  if (queryTerms.size < 3) return null;

  const ranked = CURATED_COCOON_QA.map((item) => {
    const questionText = retrievalText(item.question);
    const questionTerms = retrievalTerms(item.question);
    const answerTerms = retrievalTerms(item.answer);
    const evidenceTerms = new Set([...questionTerms, ...answerTerms]);
    const overlap = [...queryTerms].filter((term) => evidenceTerms.has(term)).length;
    const questionOverlap = [...queryTerms].filter((term) => questionTerms.has(term)).length;
    const queryCoverage = overlap / queryTerms.size;
    const questionCoverage = questionOverlap / queryTerms.size;
    const dice = (2 * overlap) / (queryTerms.size + evidenceTerms.size);
    const phraseBonus = normalizedQuery.length > 12 && questionText.includes(normalizedQuery) ? 0.35 : 0;
    // Keep the question itself dominant; answer text is secondary evidence for
    // paraphrases, so a shared generic word cannot win by itself.
    const score = questionCoverage * 0.5 + queryCoverage * 0.32 + dice * 0.18 + phraseBonus;
    return { item, overlap, score, queryCoverage, questionCoverage };
  }).sort((left, right) => right.score - left.score);

  const best = ranked[0];
  const runnerUp = ranked[1];
  if (!best || best.overlap < 2 || best.score < 0.39 || best.queryCoverage < 0.34) return null;
  if (runnerUp && best.score - runnerUp.score < 0.045 && best.questionCoverage < 0.65) return null;

  return {
    text: best.item.answer,
    sources: best.item.sources.map((label) => ({ label })),
    hasCaveat: best.item.hasCaveat,
  };
}

function hasAny(query: string, terms: string[]) {
  return terms.some((term) => query.includes(normalize(term)));
}

function mentionsChannel(query: string, channel: { name: string; terms?: string[] }) {
  return (channel.terms ?? [channel.name]).some((term) => query.includes(normalize(term)));
}

function curatedAnswerById(id: number): GroundedAnswer | null {
  const item = CURATED_COCOON_QA.find((candidate) => candidate.id === id);
  return item ? {
    text: item.answer,
    sources: item.sources.map((label) => ({ label })),
    hasCaveat: item.hasCaveat,
  } : null;
}

function channelProductAnswer(query: string): GroundedAnswer | null {
  const mentionedChannels = channelProductMatrix.filter((item) => {
    const channel = channels.find((candidate) => candidate.name === item.channel);
    return channel ? mentionsChannel(query, channel) : query.includes(normalize(item.channel));
  });
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
  const mentionedChannels = channels.filter((item) => mentionsChannel(query, item));
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

function tierChurnAnswer(query: string): GroundedAnswer {
  const selected = loyaltyTierChurn.filter((tier) => query.includes(normalize(tier.name)));
  const rows = (selected.length ? selected : loyaltyTierChurn).map((tier) =>
    `${tier.name}: ${tier.rate} (${tier.churned}/${tier.sample})`,
  );
  return {
    text: `Tỷ lệ churn theo hạng trong bảng sạch: ${rows.join('; ')}. Cao nhất là Member (69,2%); thấp nhất là Bronze (29,6%). Đây là so sánh mô tả trên dữ liệu mô phỏng, không tự giải thích nguyên nhân khác biệt.`,
    sources: [sources.cleanedCustomers, sources.report],
    hasCaveat: true,
  };
}

function tierRetentionAnswer(query: string): GroundedAnswer {
  const selected = loyaltyTierChurn.filter((tier) => query.includes(normalize(tier.name)));
  const rows = (selected.length ? selected : loyaltyTierChurn).map((tier) => {
    const active = tier.sample - tier.churned;
    const rate = (active / tier.sample * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 });
    return `${tier.name}: ${rate}% (${active}/${tier.sample} còn active)`;
  });
  return {
    text: `Tỷ lệ còn hoạt động trong mẫu theo hạng: ${rows.join('; ')}. Đây là phần bổ sung 100% − tỷ lệ churn theo cờ churned trong workbook; dữ liệu mô phỏng này không cho biết nguyên nhân giữ chân.`,
    sources: [sources.cleanedCustomers],
    hasCaveat: true,
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

const workbookDistributions = {
  gender: 'Nữ 262 (87,3%), nam 29 (9,7%), nhóm Other 9 (3,0%).',
  city: 'TP. Hồ Chí Minh 109 (36,3%), Hà Nội 75 (25,0%), Other 44 (14,7%), Đà Nẵng 22 (7,3%), Cần Thơ 15 (5,0%), Hải Phòng 15 (5,0%), Nha Trang 11 (3,7%), Huế 9 (3,0%).',
  skin: 'Da dầu 83 (27,7%), da hỗn hợp 81 (27,0%), da nhạy cảm 65 (21,7%), da khô 52 (17,3%), da thường 19 (6,3%).',
  concern: 'Mụn 85 (28,3%), xỉn màu 64 (21,3%), mất nước 58 (19,3%), lão hóa 37 (12,3%), đỏ da 30 (10,0%), tăng sắc tố 26 (8,7%).',
  firstProduct: 'Sản phẩm mua đầu tiên: Kem dưỡng 56, Sữa rửa mặt 53, Serum 37, Chống nắng 34, Dưỡng môi 33, Toner 32, Dưỡng thể 31, Mặt nạ 24.',
  preferredChannel: 'Kênh ưu tiên được ghi trong hồ sơ: Marketplace 111, Website 105, In-store 46, App 38. Đây là preferred_channel, khác với kênh thu hút khách hàng lần đầu.',
};

function workbookProfileAnswer(query: string): GroundedAnswer | null {
  if (hasAny(query, ['do tuoi', 'tuoi trung binh', 'age'])) {
    return {
      text: 'Trong 300 hồ sơ mô phỏng, tuổi trung bình là 28,8; trung vị 28; nhỏ nhất 18 và lớn nhất 49. Đây là mô tả mẫu, không đại diện cho toàn bộ khách hàng Cocoon ngoài đời.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  if (hasAny(query, ['gioi tinh', 'gender'])) {
    return { text: workbookDistributions.gender, sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['thanh pho', 'city', 'khu vuc'])) {
    return { text: workbookDistributions.city, sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['loai da', 'skin type', 'da dau', 'da kho', 'da hon hop', 'da nhay cam', 'da thuong'])) {
    return { text: workbookDistributions.skin, sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['van de da', 'moi quan tam', 'main concern', 'mun', 'xi mau', 'mat nuoc', 'lao hoa', 'do da', 'tang sac to'])) {
    return { text: workbookDistributions.concern, sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['san pham mua dau', 'san pham don dau', 'first product'])) {
    return { text: workbookDistributions.firstProduct, sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['kenh uu tien', 'preferred channel', 'kenh thuong dung'])) {
    return { text: workbookDistributions.preferredChannel, sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['so don', 'tan suat mua', 'num orders', 'mua bao nhieu don'])) {
    return {
      text: 'Trong 300 hồ sơ mô phỏng, số đơn trung bình là 2,99; trung vị 2; dao động từ 1 đến 12 đơn (phân vị 90 là 7 đơn). Đây là thống kê mô tả, không chứng minh nguyên nhân tạo CLV cao.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  if (hasAny(query, ['gia tri don hang trung binh', 'average order value', 'aov'])) {
    return {
      text: 'Trường avg_order_value_vnd trong workbook có trung bình 397.520 đồng và trung vị 370.500 đồng trên 300 hồ sơ. Đây là giá trị đơn hàng trung bình theo hồ sơ; không đồng nghĩa với doanh thu đã được kiểm toán.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  if (hasAny(query, ['tong chi tieu', 'chi tieu tron doi', 'total spend', 'tong spend'])) {
    return {
      text: 'Workbook ghi tổng total_spend_vnd của 300 hồ sơ là 354.821.000 đồng; trung bình mỗi hồ sơ 1.182.737 đồng và trung vị 836.500 đồng. Đây là trường chi tiêu tích lũy trong bộ dữ liệu mô phỏng, không phải báo cáo doanh thu kế toán của Cocoon.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  if (hasAny(query, ['don hang giam gia', 'dung giam gia don dau', 'first order discount'])) {
    return {
      text: 'Có 138/300 hồ sơ (46,0%) ghi nhận đơn đầu có giảm giá; 162 hồ sơ (54,0%) không có. Dữ liệu này chỉ cho biết có dùng giảm giá ở đơn đầu, không đo tác động của giảm giá lên churn hay lợi nhuận.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  if (hasAny(query, ['mua combo', 'bundle', 'bo san pham'])) {
    return {
      text: 'Có 58/300 hồ sơ (19,3%) được đánh dấu đã mua bundle/kit. Bảng không có đối chứng để kết luận bundle làm tăng CLV hoặc giữ chân.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  if (hasAny(query, ['email subscriber', 'dang ky email', 'nhan email'])) {
    return { text: 'Có 197/300 hồ sơ (65,7%) đồng ý nhận email; 103 hồ sơ (34,3%) không đăng ký.', sources: [sources.cleanedCustomers] };
  }
  if (hasAny(query, ['danh gia', 'review', 'nhan xet'])) {
    return {
      text: 'Có 166/300 hồ sơ có ít nhất một review (300 trừ 134 hồ sơ review_count = 0). Workbook không ghi nội dung review, nên không thể suy ra chủ đề hài lòng hay phàn nàn từ con số này.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }
  return null;
}

export function answerCocoonQuestion(input: string): GroundedAnswer {
  const query = normalize(input);
  const exactCuratedAnswer = CURATED_COCOON_QA.find(
    (item) => retrievalText(item.question) === retrievalText(input),
  );
  if (exactCuratedAnswer) {
    return {
      text: exactCuratedAnswer.answer,
      sources: exactCuratedAnswer.sources.map((label) => ({ label })),
      hasCaveat: exactCuratedAnswer.hasCaveat,
    };
  }

  const asksDataProvenance = hasAny(query, ['du lieu thuc te', 'du lieu that', 'khach hang that', 'synthetic', 'fictional', 'du lieu gia lap', 'nguon du lieu']);
  const asksLoss = hasAny(query, ['thiet hai', 'mat bao nhieu', 'that thoat', 'doanh thu mat', 'mat doanh thu', '55 56', 'tong clv gold roi']);
  const asksSubscription = hasAny(query, ['subscription', 'dang ky dinh ky', 'goi dang ky']);
  const asksRetentionRate = hasAny(query, ['ty le giu chan', 'giu chan bao nhieu', 'retention rate', 'ty le duy tri', 'con hoat dong bao nhieu', 'active rate', 'ti le retention']);
  const asksChurn = hasAny(query, ['churn', 'roi bo', 'ty le roi', 'ty le churn', 'mat khach', 'quay lai', 'customer attrition']);
  const asksThreshold = hasAny(query, ['180 ngay', 'nguong churn', 'moc churn', 'tieu chi churn', 'dinh nghia churn', 'bao lau khong mua']);
  const asksChannelProduct = hasAny(query, ['kenh', 'marketplace', 'instagram', 'tiktok', 'referral', 'search ads', 'in store', 'influencer']) &&
    hasAny(query, ['san pham', 'product', 'nhom', 'category', 'danh muc', 'duong the', 'sua rua mat', 'duong moi', 'mat na', 'kem duong', 'serum', 'chong nang', 'toner', 'heatmap']);
  const asksWhy = hasAny(query, ['tai sao', 'vi sao', 'nguyen nhan', 'why', 'cause', 'ly do']);
  const asksFavoriteCategory = hasAny(query, ['ua chuong', 'yeu thich', 'pho bien', 'popular', 'favorite', 'nhieu nhat']) &&
    hasAny(query, ['san pham', 'product', 'nhom', 'category', 'danh muc']);
  const asksRevenueShare = hasAny(query, ['ty trong doanh so', 'doanh so theo nhom', 'ty le doanh thu', 'product revenue', 'ty trong san pham']);

  if (asksRetentionRate && !asksWhy) {
    if (hasAny(query, ['gold', 'bronze', 'silver', 'member', 'hang thanh vien'])) return tierRetentionAnswer(query);
    return {
      text: 'Trong 300 hồ sơ mô phỏng, 164 khách còn active (54,7%) và 136 khách được đánh dấu churn (45,3%). Theo định nghĩa workbook, active là chưa vượt quá 180 ngày không mua; đây là tỷ lệ mô tả của mẫu, không chứng minh hiệu quả của một chiến dịch giữ chân.',
      sources: [sources.cleanedCustomers],
      hasCaveat: true,
    };
  }

  if (asksDataProvenance) {
    return {
      text: 'Data Dictionary của workbook ghi rõ bộ dữ liệu là synthetic (fictional), dùng cho thực hành, với ngày tham chiếu 31/10/2026. Vì vậy, các kết quả trong bài nên được hiểu là phân tích trên dữ liệu mô phỏng, không xác nhận đây là hồ sơ khách hàng thật của Cocoon.',
      sources: [sources.cleanedCustomers, sources.dashboard],
      hasCaveat: true,
    };
  }

  const profileAnswer = workbookProfileAnswer(query);
  if (profileAnswer) return profileAnswer;

  if (hasAny(query, ['nguong gold', 'dieu kien gold', '4,5 trieu', 'tieu chi gold']) && hasAny(query, ['don', 'tan suat', 'clv'])) {
    const tierPolicy = curatedAnswerById(25);
    if (tierPolicy) return tierPolicy;
  }

  if (hasAny(query, ['search ads', 'quang cao tim kiem']) && hasAny(query, ['ngan sach', 'budget', 'scale', 'nen tang'])) {
    const recommendation = curatedAnswerById(30);
    if (recommendation) return recommendation;
  }

  if (hasAny(query, ['search ads', 'quang cao tim kiem']) && mentionsChannel(query, channels[0]) &&
    (asksWhy || (hasAny(query, ['giu chan']) && !asksChurn))) {
    const comparison = curatedAnswerById(19);
    if (comparison) return comparison;
  }

  if (mentionsChannel(query, channels[0]) && asksChurn && hasAny(query, ['giai phap', 'xu ly', 'khac phuc', 'nen lam', 'de xuat'])) {
    const referralRecommendation = curatedAnswerById(29);
    if (referralRecommendation) return referralRecommendation;
  }

  if (asksRevenueShare && hasAny(query, ['cross sell', 'cross-sell', 'combo', 'ke hoach', 'xac nhan'])) {
    const conflictAnswer = curatedAnswerById(33);
    if (conflictAnswer) return conflictAnswer;
  }

  if (hasAny(query, ['chan dung', 'khac nhau ra sao']) && hasAny(query, ['marketplace']) && hasAny(query, ['instagram'])) {
    const personaAnswer = curatedAnswerById(32);
    if (personaAnswer) return personaAnswer;
  }

  if (hasAny(query, ['dong deu', 'deu nhat']) && hasAny(query, ['kenh', 'san pham', 'nhom', 'danh muc', 'ma tran'])) {
    const evennessAnswer = curatedAnswerById(18);
    if (evennessAnswer) return evennessAnswer;
  }

  if (hasAny(query, ['tren tung kenh', 'moi kenh', 'tung kenh']) && hasAny(query, ['san pham', 'nhom', 'category'])) {
    const perChannelAnswer = curatedAnswerById(17);
    if (perChannelAnswer) return perChannelAnswer;
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

  if (asksChurn && channels.some((channel) => mentionsChannel(query, channel))) {
    return channelChurnAnswer(query);
  }

  const closestAnswer = findClosestCuratedAnswer(input);
  if (closestAnswer) return closestAnswer;

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
    return tierChurnAnswer(query);
  }

  if (asksChurn) return channelChurnAnswer(query);

  if (hasAny(query, ['bien dao dong', 'khoang bien dong', 'spread', 'range']) &&
    hasAny(query, ['clv', 'gold', 'bronze', 'silver', 'member', 'hang thanh vien', 'rong nhat'])) {
    const item = CURATED_COCOON_QA.find((candidate) => candidate.id === 14);
    if (item) {
      return {
        text: item.answer,
        sources: item.sources.map((label) => ({ label })),
        hasCaveat: item.hasCaveat,
      };
    }
  }

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
