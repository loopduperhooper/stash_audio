import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_AUDIO_QUEUE, audioQueueReducer, chooseAudioGroup, nextAudioInGroup,
  restoreAudioQueue, serializeAudioQueue,
} from '../../ui/v2.5/src/models/audioQueue.ts';

const entry = (id, groupId, key = id) => ({ key, id, title: `Track ${id}`, ...(groupId === undefined ? {} : { groupId }) });
const play = (item) => audioQueueReducer(EMPTY_AUDIO_QUEUE, { type: 'play', entry: item });
const add = (state, item, next = false) => audioQueueReducer(state, { type: 'enqueue', entry: item, next });
const advance = (state, fallback = null) => audioQueueReducer(state, { type: 'advance', currentKey: state.current?.key ?? null, fallback });
const groupA = { id: 'A', audios: [{ id: 'A1' }, { id: 'A2' }, { id: 'A3' }] };
const groupB = { id: 'B', audios: [{ id: 'B1' }, { id: 'B2' }] };

test('Play next inserts ahead of queued entries; Add to queue appends without replacing playback', () => {
  let state = play(entry('A1', 'A'));
  state = add(state, entry('B1', 'B'));
  state = add(state, entry('B2', 'B'));
  state = add(state, entry('A3', 'A'), true);
  assert.equal(state.current.id, 'A1');
  assert.deepEqual(state.upcoming.map(item => item.id), ['A3', 'B1', 'B2']);
  assert.equal(state.autoplay, true);
});

test('ordinary Play replaces current playback and clears the explicit queue', () => {
  const queued = add(play(entry('A1', 'A')), entry('A2', 'A'));
  const state = audioQueueReducer(queued, { type: 'play', entry: entry('B1', 'B') });
  assert.equal(state.current.id, 'B1');
  assert.deepEqual(state.upcoming, []);
  assert.equal(state.position, null); // Use the new track's resume position.
});

test('explicit queue wins over group fallback and starts the next track at zero', () => {
  const state = advance(add(play(entry('A1', 'A')), entry('B1', 'B')), entry('A2', 'A'));
  assert.equal(state.current.id, 'B1');
  assert.equal(state.position, 0);
  assert.equal(state.autoplay, true);
  assert.deepEqual(state.upcoming, []);
});

test('after a queued interruption, fallback belongs to the currently playing group', () => {
  let state = advance(add(play(entry('A1', 'A')), entry('B1', 'B')), entry('A2', 'A'));
  const groups = [groupA, groupB];
  const group = groups.find(item => item.id === state.current.groupId);
  const nextId = nextAudioInGroup(state.current.id, group);
  state = advance(state, entry(nextId, group.id));
  assert.equal(state.current.id, 'B2');
  assert.equal(state.current.groupId, 'B');
  assert.deepEqual(state.upcoming, []); // Group remainder was never enqueued.
});

test('empty queue falls back to next item in group, with no wrap at the end', () => {
  assert.equal(nextAudioInGroup('A1', groupA), 'A2');
  assert.equal(nextAudioInGroup('A3', groupA), null);
  assert.equal(nextAudioInGroup('missing', groupA), null);
  assert.equal(nextAudioInGroup('A1', undefined), null);
  const last = play(entry('A3', 'A'));
  assert.equal(advance(last), last);
  assert.equal(advance(EMPTY_AUDIO_QUEUE), EMPTY_AUDIO_QUEUE);
  assert.equal(advance(play(entry('ungrouped', null))).current.id, 'ungrouped');
});

test('explicit queue can advance even from the last item in a group', () => {
  const state = advance(add(play(entry('A3', 'A')), entry('B1', 'B')));
  assert.equal(state.current.id, 'B1');
});

test('enqueue while idle does not start motion; Start queue consumes the first item', () => {
  const queued = add(EMPTY_AUDIO_QUEUE, entry('A1'));
  assert.equal(queued.current, null);
  assert.equal(queued.autoplay, false);
  assert.equal(advance(queued).current.id, 'A1');
});

test('each occurrence of the same track can be reordered and removed independently', () => {
  let state = add(add(play(entry('A1')), entry('B1', 'B', 'first')), entry('B1', 'B', 'second'));
  state = audioQueueReducer(state, { type: 'move', key: 'second', direction: -1 });
  assert.deepEqual(state.upcoming.map(item => item.key), ['second', 'first']);
  state = audioQueueReducer(state, { type: 'remove', key: 'first' });
  assert.deepEqual(state.upcoming.map(item => item.key), ['second']);
  assert.equal(audioQueueReducer(state, { type: 'move', key: 'second', direction: -1 }), state);
  assert.equal(audioQueueReducer(state, { type: 'move', key: 'second', direction: 1 }), state);
});

test('clear queue leaves current playback intact; close player clears everything', () => {
  const queued = add(play(entry('A1')), entry('B1'));
  const cleared = audioQueueReducer(queued, { type: 'clear' });
  assert.equal(cleared.current, queued.current);
  assert.deepEqual(cleared.upcoming, []);
  assert.deepEqual(audioQueueReducer(cleared, { type: 'stop' }), EMPTY_AUDIO_QUEUE);
});

test('stale ended events and repeated Next dispatches cannot skip a newer current entry', () => {
  const start = add(add(play(entry('A1')), entry('B1')), entry('B2'));
  const event = { type: 'advance', currentKey: 'A1', fallback: null };
  const advanced = audioQueueReducer(start, event);
  assert.equal(audioQueueReducer(advanced, event), advanced);
  assert.equal(advanced.current.id, 'B1');
  assert.equal(advanced.upcoming.length, 1);
  assert.equal(audioQueueReducer(advanced, { type: 'resolve', key: 'A1', title: 'Old result', groupId: 'A' }), advanced);
});

test('choose a group once, honoring group-page context and retaining it through persistence', () => {
  const groups = [groupA, groupB];
  const chosen = chooseAudioGroup(groups, undefined, () => 0.9);
  assert.equal(chosen, 'B');
  assert.equal(chooseAudioGroup(groups, chosen, () => 0), 'B');
  assert.equal(chooseAudioGroup(groups, 'A', () => 0.9), 'A');
  assert.equal(chooseAudioGroup([], undefined), null);
  assert.equal(chooseAudioGroup(groups, null), null);
  assert.equal(chooseAudioGroup(groups, 'deleted-group'), null);
  const resolved = audioQueueReducer(play(entry('B1')), { type: 'resolve', key: 'B1', title: 'Loaded title', groupId: chosen });
  assert.equal(restoreAudioQueue(serializeAudioQueue(resolved)).current.groupId, 'B');
});

test('refresh restores ordered queue, current entry and position, always paused', () => {
  const state = add(play(entry('A1', 'A')), entry('B1', 'B'));
  const restored = restoreAudioQueue(serializeAudioQueue(state, 123.45));
  assert.equal(restored.position, 123.45);
  assert.equal(restored.autoplay, false);
  assert.deepEqual(restored.current, state.current);
  assert.deepEqual(restored.upcoming, state.upcoming);
  assert.equal(restoreAudioQueue(serializeAudioQueue(state, -12)).position, null);
});

test('corrupt or incompatible storage cannot create invalid queue entries', () => {
  for (const raw of [null, '', 'broken', '{}', '{"version":2,"upcoming":[],"current":null}',
    JSON.stringify({ version: 1, current: null, upcoming: [{ id: 'A1' }] }),
    JSON.stringify({ version: 1, current: entry('A1'), upcoming: [entry('A1')] }),
    JSON.stringify({ version: 1, current: entry('A1', 42), upcoming: [] }),
  ]) assert.deepEqual(restoreAudioQueue(raw), EMPTY_AUDIO_QUEUE);
});
