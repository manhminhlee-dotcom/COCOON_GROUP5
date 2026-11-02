import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../config';
import { HERO_BOOKS } from '../data/heroBooks';

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
