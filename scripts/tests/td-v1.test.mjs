import test from 'node:test';
import assert from 'node:assert/strict';
import { tdV1, buildTdState, nextTdMode } from '../../ui/v2.5/src/motion/tdV1.ts';

function rng(seed = 1) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

const durations = points => points.slice(1).map((p,i) => p.at - points[i].at);

test('required state transitions and hold exits', () => {
  for (const mode of [2,4]) assert.equal(nextTdMode(mode, rng()), 1);
  assert.equal(nextTdMode(3, rng()), 5);
  for (const mode of [1,5]) {
    assert.deepEqual([0,.4,.9].map(value => nextTdMode(mode, () => value)), [2,3,4]);
  }
});

test('holds allow an approach then preserve position for the specified duration', () => {
  for (let seed = 1; seed <= 100; seed++) {
    for (const mode of [1,5]) {
      const {points} = buildTdState(mode, 0, 100, rng(seed));
      const held = points.at(-1), arrived = points.at(-2);
      assert.equal(held.pos, arrived.pos);
      assert.ok(held.at - arrived.at >= (mode === 1 ? 5000 : 10000));
      assert.ok(held.at - arrived.at <= 15000);
      if (mode === 5) assert.equal(held.pos, 0);
      else assert.ok(held.pos > 0 && held.pos < 100);
      assert.equal(points[1].at, 1000);
    }
  }
});

test('full and half modes alternate endpoints for 1–30 movements', () => {
  const counts = new Set();
  for (let seed = 1; seed <= 1000; seed++) {
    for (const mode of [2,4]) {
      const {points} = buildTdState(mode, 0, 0, rng(seed));
      counts.add(points.length - 1);
      assert.ok(points.length >= 2 && points.length <= 31);
      points.forEach((p,i) => assert.equal(p.pos, i % 2 ? (mode === 2 ? 100 : 50) : 0));
      assert.ok(durations(points).every(ms => ms >= (mode === 2 ? 3000 : 2000) && ms <= (mode === 2 ? 7000 : 4000)));
    }
  }
  assert.ok(counts.has(1));
  assert.ok([...counts].some(count => count >= 25));
});

test('acceleration lasts 15–20s and decreases movement duration linearly to 1s', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const {points} = buildTdState(3, 0, 0, rng(seed));
    const times = durations(points);
    assert.equal(times.length, 5);
    assert.ok(points.at(-1).at >= 15000 && points.at(-1).at <= 20000);
    assert.ok(times[0] >= 5000 && times[0] <= 7000);
    assert.equal(times.at(-1), 1000);
    const step = (times[0] - 1000) / 4;
    times.forEach((ms,i) => assert.ok(Math.abs(ms - (times[0] - step*i)) <= 2));
    points.forEach((p,i) => assert.equal(p.pos, i % 2 ? 100 : 0));
  }
});

test('timeline is bounded, phase-stable across seeks and includes a future target', () => {
  const samples = [0, -1000, 1000, 5000, 15000, 60000, 36000000];
  const expected = samples.map(time => tdV1.generate(time));
  for (let i = samples.length - 1; i >= 0; i--) {
    const points = tdV1.generate(samples[i]);
    assert.deepEqual(points, expected[i]);
    assert.ok(points.length >= 2 && points.length <= 4);
    assert.ok(points.some(p => p.at > samples[i]));
    assert.ok(points.every((p,j) => Number.isFinite(p.at) && p.at >= 0 && p.pos >= 0 && p.pos <= 100 && (!j || p.at > points[j-1].at)));
  }
});
