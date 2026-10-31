import test from 'node:test';
import assert from 'node:assert/strict';
import { nextFunscriptTarget, startFunscriptScheduler, normalizeSyncTiming } from '../../ui/v2.5/src/utils/funscriptScheduler.ts';

import { sixtyBpm } from '../../ui/v2.5/src/motion/sixtyBpm.ts';

const actions = [{at:0,pos:0},{at:500,pos:100},{at:1000,pos:0},{at:1500,pos:100}];

function harness(source = actions, interpolate = false) {
  const media = Object.assign(new EventTarget(), {currentTime:0, playbackRate:1, paused:false, ended:false, seeking:false, readyState:4});
  let now = 0, id = 0;
  const jobs = new Map(), sent = [];
  const clock = {
    setTimeout(fn, delay) { jobs.set(++id, {fn, at:now+delay}); return id; },
    clearTimeout(id) { jobs.delete(id); },
  };
  const move = delta => { if (!media.paused && !media.seeking && media.readyState >= 3) media.currentTime += delta * media.playbackRate / 1000; };
  function advance(ms) {
    const end = now + ms;
    while (jobs.size) {
      const [key, job] = [...jobs].sort((a,b) => a[1].at-b[1].at)[0];
      if (job.at > end) break;
      move(job.at-now); now=job.at; jobs.delete(key); job.fn();
    }
    move(end-now); now=end;
  }
  function late(ms) {
    move(ms); now+=ms;
    const callbacks = [...jobs.values()]; jobs.clear(); callbacks.forEach(job => job.fn());
  }
  const start = () => startFunscriptScheduler(media, source, (position,durationMs) => sent.push({position,durationMs,at:now}), {intervalMs:20, offsetMs:0, interpolate}, clock);
  const event = name => media.dispatchEvent(new Event(name));
  return {media, jobs, sent, advance, late, start, event};
}

test('targets the upcoming endpoint with remaining real-time duration', () => {
  assert.deepEqual(nextFunscriptTarget(actions, 200, 1), {index:1,at:500,position:1,durationMs:300});
  assert.equal(nextFunscriptTarget(actions, 200, 2).durationMs, 150);
  assert.equal(nextFunscriptTarget(actions, 200, .5).durationMs, 600);
  assert.equal(nextFunscriptTarget(actions, 200, 1, 100).durationMs, 200);
  assert.equal(nextFunscriptTarget(actions, 200, 1, -100).durationMs, 400);
  assert.equal(nextFunscriptTarget(actions, 1500, 1), null);
  assert.equal(nextFunscriptTarget(actions, 0, 0), null);
  assert.equal(nextFunscriptTarget([], 0, 1), null);
});

test('timing settings reject invalid values and bound supported ranges', () => {
  assert.deepEqual(normalizeSyncTiming({intervalMs:NaN,offsetMs:Infinity}), {intervalMs:20,offsetMs:0});
  assert.deepEqual(normalizeSyncTiming({intervalMs:1,offsetMs:9000}), {intervalMs:10,offsetMs:1000});
});

test('steady motion sends once per segment, independently of UI updates', () => {
  const h=harness(), stop=h.start(); h.advance(1100);
  assert.equal(h.sent.length,3);
  assert.deepEqual(h.sent.map(s=>s.position),[1,0,1]);
  assert.ok(h.sent.every(s=>s.durationMs>=480 && s.durationMs<=500));
  stop(); assert.equal(h.jobs.size,0);
});

test('late callback skips obsolete reversals without a catch-up burst', () => {
  const h=harness(), stop=h.start(); h.late(1100);
  assert.equal(h.sent.length,2);
  assert.deepEqual(h.sent[1],{position:1,durationMs:400,at:1100}); stop();
});

test('pause, seek, buffering and playback speed reset scheduling', () => {
  const h=harness(), stop=h.start();
  h.media.paused=true; h.event('pause'); h.advance(1000); assert.equal(h.sent.length,1);
  h.media.paused=false; h.event('playing'); assert.equal(h.sent.length,2);
  h.media.seeking=true; h.event('seeking'); assert.equal(h.jobs.size,0);
  h.media.currentTime=.7; h.media.seeking=false; h.event('seeked');
  assert.equal(h.sent.at(-1).position,0); assert.equal(h.sent.at(-1).durationMs,300);
  h.media.playbackRate=2; h.event('ratechange'); assert.equal(h.sent.at(-1).durationMs,150);
  h.media.readyState=2; h.event('waiting'); const count=h.sent.length;
  h.advance(1000); assert.equal(h.sent.length,count);
  h.media.readyState=4; h.event('playing'); assert.equal(h.sent.length,count+1);
  stop(); h.event('playing'); assert.equal(h.jobs.size,0);
});

test('suspension cleanup and resume use current position, including same segment', () => {
  const h=harness(); let stop=h.start(); h.advance(100); stop();
  h.advance(100); assert.equal(h.sent.length,1);
  stop=h.start(); assert.equal(h.sent.at(-1).durationMs,300);
  stop(); h.advance(600); stop=h.start();
  assert.equal(h.sent.at(-1).position,0); assert.equal(h.sent.at(-1).durationMs,200);
  stop();
});

test('paused media, exhausted script and ended playback send no new commands', () => {
  const h=harness(); h.media.paused=true; const stop=h.start(); assert.equal(h.sent.length,0);
  h.media.paused=false; h.media.currentTime=2; h.event('playing'); assert.equal(h.jobs.size,0);
  h.media.currentTime=.2; h.event('playing'); assert.equal(h.sent.length,1);
  h.media.ended=true; h.event('ended'); h.advance(1000); assert.equal(h.sent.length,1); stop();
});


test('60 BPM generator is bounded, deterministic and phase-stable across seeks', () => {
  for (const time of [0, 200, 500, 999, 36000000, -1000]) {
    const points = sixtyBpm.generate(time);
    assert.equal(points.length, 4);
    assert.deepEqual(points, sixtyBpm.generate(time));
    assert.ok(points.every((p, i) => p.at >= 0 && (i === 0 || p.at > points[i-1].at) && [0,100].includes(p.pos)));
    assert.ok(nextFunscriptTarget(points, time, 1));
  }
  assert.deepEqual(sixtyBpm.generate(0).slice(0,3), [{at:0,pos:0},{at:500,pos:100},{at:1000,pos:0}]);
});

test('rolling algorithm windows keep sending reversals without duplicate commands', () => {
  const h = harness(sixtyBpm.generate), stop = h.start();
  h.advance(10040);
  assert.equal(h.sent.length, 21);
  assert.ok(h.sent.every((s,i) => s.position === (i % 2 === 0 ? 1 : 0)));
  h.media.seeking = true; h.event('seeking');
  h.media.currentTime = 36000.25; h.media.seeking = false; h.event('seeked');
  assert.equal(h.sent.at(-1).durationMs,250);
  assert.equal(h.sent.at(-1).position,1);
  h.media.playbackRate = 2; h.event('ratechange');
  assert.equal(h.sent.at(-1).durationMs,125);
  stop(); assert.equal(h.jobs.size,0);
});


test('streaming interpolates the live curve and recovers after delayed callbacks', () => {
  const h = harness(actions, true), stop = h.start();
  assert.equal(h.sent[0].position, 0);
  h.advance(100);
  assert.ok(Math.abs(h.sent.at(-1).position - .2) < 1e-9);
  h.late(1000);
  assert.ok(Math.abs(h.sent.at(-1).position - .2) < 1e-9);
  assert.equal(h.sent.at(-1).durationMs, 20);
  h.advance(400);
  assert.equal(h.sent.at(-1).position, 1);
  stop(); assert.equal(h.jobs.size, 0);
});
