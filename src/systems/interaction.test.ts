import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../config';
import { HERO_BOOKS } from '../data/heroBooks';
import { CURATED_COCOON_QA } from '../data/curatedCocoonQa';
import { answerCocoonQuestion } from '../data/cocoonKnowledge';

test('CONFIG parameters are mathematically sound and within physical bounds', () => {
  // Shelf dimensions
  assert.equal(CONFIG.shelf.bays, 4);
  assert.ok(CONFIG.shelf.totalWidth >= 3.0 && CONFIG.shelf.totalWidth <= 4.0);
  assert.ok(CONFIG.shelf.totalHeight >= 2.2 && CONFIG.shelf.totalHeight <= 2.8);
  assert.ok(CONFIG.shelf.shelfThickness > 0.015 && CONFIG.shelf.shelfThickness < 0.035);

  // Camera settings
  assert.ok(CONFIG.camera.restFov >= 28 && CONFIG.camera.restFov <= 35);
  assert.ok(CONFIG.camera.heldDistance >= 0.4 && CONFIG.camera.heldDistance <= 0.8);
  assert.ok(CONFIG.camera.filmOffsetY > 0);

  // Timings
  assert.equal(CONFIG.timings.totalPullDuration, 2200);
  assert.equal(CONFIG.timings.returnDuration, 1600);
  assert.equal(CONFIG.timings.hoverSlideOut, 180);
});

test('Hero books dataset contains 12 verified public domain titles without duplicate IDs or positions', () => {
  assert.equal(HERO_BOOKS.length, 12);

  const ids = new Set<string>();
  const positions = new Set<string>();

  HERO_BOOKS.forEach((book) => {
    // Unique ID
    assert.ok(!ids.has(book.id), `Duplicate book id found: ${book.id}`);
    ids.add(book.id);

    // Shelf & bay validity
    assert.ok(book.bay >= 0 && book.bay < CONFIG.shelf.bays, `Invalid bay: ${book.bay}`);
    assert.ok(book.shelf >= 0 && book.shelf < CONFIG.shelf.shelvesPerBay, `Invalid shelf: ${book.shelf}`);

    // Unique slot
    const slotKey = `${book.bay}_${book.shelf}_${book.slotIndex}`;
    assert.ok(!positions.has(slotKey), `Duplicate book position: ${slotKey}`);
    positions.add(slotKey);

    // Book physical dimensions
    assert.ok(book.height >= 0.20 && book.height <= 0.28);
    assert.ok(book.thickness >= 0.02 && book.thickness <= 0.06);
    assert.ok(book.depth >= 0.14 && book.depth <= 0.20);

    // Verified content
    assert.ok(book.title.length > 0);
    assert.ok(book.author.length > 0);
    assert.ok(book.synopsis.length > 10);
    assert.ok(book.excerpt.length > 10);
    assert.ok(book.year > 0);
  });
});

test('Trajectory math calculates valid quadratic Bezier interpolation', () => {
  const p0 = 0.0;
  const p1 = 0.5;
  const p2 = 1.0;

  const bezier = (t: number) => {
    const inv = 1 - t;
    return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
  };

  assert.equal(bezier(0), 0);
  assert.equal(bezier(0.5), 0.5);
  assert.equal(bezier(1), 1);
});

test('Cocoon chatbot corpus has complete, unique, source-linked entries', () => {
  assert.equal(CURATED_COCOON_QA.length, 35);
  assert.equal(CURATED_COCOON_QA.filter((item) => item.sourceCollection === 'Q&A bảo vệ đồ án').length, 8);
  assert.equal(new Set(CURATED_COCOON_QA.map((item) => item.id)).size, CURATED_COCOON_QA.length);
  CURATED_COCOON_QA.forEach((item) => {
    assert.ok(item.question.trim().length > 10, `Question ${item.id} is too short`);
    assert.ok(item.answer.trim().length > 40, `Answer ${item.id} is too short`);
    assert.ok(item.sources.length > 0, `Question ${item.id} has no source`);
  });
});

test('Cocoon chatbot free questions answer from verified figures and flag source limits', () => {
  const quarter = answerCocoonQuestion('Q4/25 có bao nhiêu khách mới?');
  assert.match(quarter.text, /39 khách mới ở Q4\/2025/);
  assert.equal(quarter.hasCaveat, true);

  const channels = answerCocoonQuestion('So sánh tỷ lệ churn Referral và Search ads');
  assert.match(channels.text, /Referral: 63,6% \(14\/22 khách\)/);
  assert.match(channels.text, /Search ads: 34,2% \(13\/38 khách\)/);

  const product = answerCocoonQuestion('Marketplace có bao nhiêu khách yêu thích Dưỡng thể?');
  assert.match(product.text, /Marketplace 14 khách/);

  const subscription = answerCocoonQuestion('15 hội viên subscription có thuộc Marketplace và Dưỡng thể?');
  assert.match(subscription.text, /Chỉ 2 người/);
  assert.equal(subscription.hasCaveat, true);

  const favorite = answerCocoonQuestion('Nhóm sản phẩm nào được khách yêu thích nhất?');
  assert.match(favorite.text, /Kem dưỡng 52\/300 \(17,3%\)/);
  assert.match(favorite.text, /Sữa rửa mặt 48\/300 \(16%\)/);
  assert.equal(favorite.hasCaveat, true);

  const cause = answerCocoonQuestion('Vì sao tỷ lệ churn của khách Gold cao?');
  assert.match(cause.text, /không thể kết luận vì sao/);
  assert.match(cause.text, /Gold 50%/);
  assert.equal(cause.hasCaveat, true);

  const boundary = answerCocoonQuestion('Khách đúng 180 ngày có bị tính churn không?');
  assert.match(boundary.text, /đúng 180 ngày nhưng chưa được đánh dấu churn/);

  const clvConflict = CURATED_COCOON_QA.find((item) => item.id === 23);
  assert.ok(clvConflict?.answer.includes('không có khách nào vượt 8,4 triệu'));

  const productShareConflict = CURATED_COCOON_QA.find((item) => item.id === 33);
  assert.ok(productShareConflict?.answer.includes('Serum 7%'));
  assert.ok(productShareConflict?.answer.includes('Serum 14%'));

  const unsupported = answerCocoonQuestion('Doanh thu Cocoon năm 2026 là bao nhiêu?');
  assert.equal(unsupported.sources.length, 0);
  assert.match(unsupported.text, /chưa khớp với nội dung đã đối chiếu/);
});
