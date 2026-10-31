import test from 'node:test';
import assert from 'node:assert/strict';
import { loadQueuedAudio } from '../../ui/v2.5/src/utils/audioPlayback.ts';
import { startFunscriptScheduler } from '../../ui/v2.5/src/utils/funscriptScheduler.ts';

class Media extends EventTarget {
  currentTime = 87;
  duration = 200;
  currentSrc = 'https://example.test/old.mp3';
  src = 'https://example.test/new.mp3';
  readyState = 4;
  paused = false;
  ended = false;
  seeking = false;
  playbackRate = 1;
  playCount = 0;
  loadCount = 0;
  event(name) { this.dispatchEvent(new Event(name)); }
  pause() { this.paused = true; this.event('pause'); }
  load() {
    this.loadCount++;
    this.event('timeupdate'); // Simulate transition events carrying old position.
    this.readyState = 0;
    this.ended = false;
    this.event('emptied');
    this.currentTime = 0;
    this.event('timeupdate');
  }
  play() {
    this.playCount++;
    this.paused = false;
    this.event('playing');
    return Promise.resolve();
  }
  metadata() { this.currentSrc = this.src; this.readyState = 4; this.event('loadedmetadata'); }
}

function session(media, overrides = {}) {
  const positions = [], errors = [];
  let ended = 0, playing = 0;
  const cleanup = loadQueuedAudio(media, {
    source: media.src, initialPosition: 0, autoplay: true,
    onPosition: (position, flush) => positions.push({position, flush}),
    onEnded: () => ended++, onError: error => errors.push(error), onPlaying: () => playing++,
    ...overrides,
  });
  return { cleanup, positions, errors, get ended() { return ended; }, get playing() { return playing; } };
}

test('source replacement ignores old position and ended events until new metadata arrives', () => {
  const media = new Media(), state = session(media, { initialPosition: 12 });
  assert.equal(media.loadCount, 1);
  assert.deepEqual(state.positions, []);
  media.ended = true; media.event('ended');
  assert.equal(state.ended, 0);
  media.ended = false; media.metadata();
  assert.equal(media.currentTime, 12);
  assert.equal(media.playCount, 1);
  assert.equal(state.playing, 1);
  media.currentTime = 15; media.event('timeupdate');
  media.event('seeked'); media.pause();
  assert.deepEqual(state.positions, [{position:15,flush:false},{position:15,flush:true},{position:15,flush:true}]);
  media.ended = true; media.event('ended');
  assert.equal(state.ended, 1);
  state.cleanup();
});

test('restoring after refresh seeks to saved position while leaving audio and motion paused', () => {
  const media = new Media(), state = session(media, {initialPosition:42, autoplay:false});
  media.metadata();
  assert.equal(media.currentTime, 42);
  assert.equal(media.paused, true);
  assert.equal(media.playCount, 0);
  state.cleanup();
});

test('one media element can switch tracks and repeat the same track from zero', () => {
  const media = new Media(), first = session(media);
  media.metadata(); media.currentTime = 180;
  first.cleanup();
  media.src = 'https://example.test/second.mp3';
  const second = session(media);
  media.metadata();
  assert.equal(media.currentTime, 0);
  media.currentTime = 30; media.event('timeupdate');
  assert.deepEqual(first.positions, []);
  assert.deepEqual(second.positions, [{position:30,flush:false}]);
  second.cleanup();
  const repeated = session(media);
  media.metadata();
  assert.equal(media.currentTime, 0);
  assert.equal(media.loadCount, 3);
  assert.equal(media.playCount, 3);
  repeated.cleanup();
});

test('loading another source suspends old funscript updates without reconnecting a device', () => {
  const media = new Media(); media.currentTime = .1;
  let timerId = 0;
  const jobs = new Map(), sent = [];
  const clock = { setTimeout(fn) { jobs.set(++timerId, fn); return timerId; }, clearTimeout(id) { jobs.delete(id); } };
  const stop = startFunscriptScheduler(media, [{at:0,pos:0},{at:500,pos:100}], (...args) => sent.push(args), undefined, clock);
  assert.equal(sent.length, 1);
  const state = session(media, {autoplay:false});
  assert.equal(jobs.size, 0);
  assert.equal(sent.length, 1);
  stop();
  media.metadata();
  const nextSent = [];
  const stopNext = startFunscriptScheduler(media, [{at:0,pos:100},{at:500,pos:0}], (...args) => nextSent.push(args), undefined, clock);
  assert.deepEqual(nextSent, []);
  media.play();
  assert.deepEqual(nextSent, [[0,500]]);
  stopNext(); state.cleanup();
});

test('empty sources and stale metadata do not start playback', () => {
  const media = new Media(), state = session(media, {source:''});
  media.metadata();
  assert.equal(media.playCount, 0);
  state.cleanup();
  const next = session(media);
  media.readyState = 4; media.currentSrc = 'https://example.test/old.mp3'; media.event('loadedmetadata');
  assert.equal(media.playCount, 0);
  next.cleanup();
});

test('autoplay failure is visible, but a previous entry cannot overwrite the new error state', async () => {
  const media = new Media();
  media.play = () => Promise.reject(new Error('autoplay denied'));
  const state = session(media); media.metadata();
  await Promise.resolve();
  assert.equal(state.errors.length, 1);
  assert.match(state.errors[0], /Press Play/);
  state.cleanup();
  let reject;
  media.play = () => new Promise((_, fail) => { reject = fail; });
  const stale = session(media); media.metadata(); stale.cleanup();
  reject(new Error('old failure')); await Promise.resolve();
  assert.deepEqual(stale.errors, []);
});

test('cleanup detaches handlers and seeking beyond duration is clamped', () => {
  const media = new Media(), state = session(media, {initialPosition:999});
  media.metadata();
  assert.equal(media.currentTime, 200);
  state.cleanup();
  media.ended = true; media.event('ended'); media.event('timeupdate');
  assert.equal(state.ended, 0);
  assert.deepEqual(state.positions, []);
});
