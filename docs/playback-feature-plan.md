# Playback feature plan

Updated: 2026-10-31.

All four features have initial implementations. Automated behavior checks pass;
full UI checks, browser testing and Handy validation remain pending. Synchronization
changes have not yet been benchmarked against MultiFunPlayer on hardware.

## Feature tracker

| Feature | Implemented | Remaining |
| --- | --- | --- |
| Playback queue | Persistent player, queue actions/panel, group continuation, paused refresh restoration | Browser and device transition checks |
| Funscript synchronization | Media-clock scheduler, upcoming targets, playback-rate handling, interval and offset settings | Handy/MultiFunPlayer comparison, timing diagnostics, evaluation of interpolation/output modes |
| Motion algorithms | Repo-defined generator framework, source selection, 60 BPM preset | Browser/Handy validation; additional presets and parameters are optional follow-ups |
| Stop/resume shortcut | Configurable binding, default Page Down, shared suspension state | Browser shortcut/focus checks and Handy validation |

## 1. Playback queue

### Agreed behavior

- **Play** replaces current playback and clears the explicit queue. **Play next**
  inserts at the front; **Add to queue** appends without interrupting playback.
- Queuing while idle does not start audio or motion. **Start queue** starts the
  first queued entry.
- Both natural end and **Next** consume explicit queued entries first. When the
  queue is empty, continue with the next item in the currently playing track's
  group, using the same order shown on the group page.
- At the last item in a group, or with no applicable group, disable Next and stop
  at natural end. Do not wrap or enqueue the group's remainder automatically.
- After playing a queued track from another group, continuation belongs to that
  track's group. Do not return to the interrupted group's next item.
- Expect one group per track. Group-page actions retain that group context;
  otherwise, choose randomly among multiple memberships and keep that choice
  stable for the playback entry, including across refresh. No database exclusivity
  constraint or membership cleanup is included.
- Preserve playback across navigation. Save the queue, current entry, group
  context and position locally; restore paused after refresh.
- Ordinary Play uses the selected track's server resume position. Queued tracks
  and group continuation start at zero.

### Implementation

- `src/models/audioQueue.ts`: queue reducer, group selection/continuation and
  versioned snapshot validation. Each occurrence has its own key, so duplicate
  tracks can be reordered or removed independently. Stale advance events cannot
  consume a newer current entry.
- `src/hooks/AudioQueueContext.tsx`: app-level queue ownership, metadata loading,
  stable group context and browser-local persistence. Position writes are
  throttled and flushed on pause, seek and page hiding.
- `AudioQueuePlayer`: one native audio element remains mounted across navigation
  and metadata loading. Route content has a separate Suspense boundary. The
  bottom player shows the current track and an expandable queue with move
  earlier/later, remove and clear controls. **Close player** stops playback and
  clears the session.
- Audio cards and detail pages expose all three playback actions; group cards
  forward their group ID. The inherited scene-specific `sceneQueue.ts` remains
  separate from the audio implementation.
- `src/utils/audioPlayback.ts`: removes old listeners, pauses/reloads the media
  element and ignores old-position events until the new source's metadata arrives.
  Script/subtitle loads are invalidated and algorithm selection resets per entry.
- Intiface connection, settings and updates-suspended state remain at app scope.
  Source changes cancel old scheduling. A movement already sent to the device
  may finish; no physical stop command is promised.
- Missing metadata/streams, autoplay rejection and persistence failure are shown
  in the player. Retry or Next allow recovery where applicable. Unavailable entries
  are not silently skipped. Script-fetch failures currently leave motion inactive
  without a dedicated script error message.

### Remaining validation

- Exercise card/detail/group actions, queue editing and duplicate tracks in the UI.
- Verify navigation and refresh preserve the intended session and position.
- Check queued and group transitions, final-group blocking, autoplay rejection and
  missing/unplayable tracks in supported browsers.
- On the Handy, verify script-to-script, script-to-no-script and algorithm-to-track
  transitions retain the connection and respect suspended updates.

## 2. Funscript synchronization performance

### Problem and comparison target

Some apparently steady oscillating scripts feel sporadic in speed. The previous
implementation used variable-frequency HTML audio `timeupdate` events through
React, targeted the most recent past point, used the full segment duration and
ignored playback rate. Those were plausible contributors; hardware diagnosis
remains open.

Validation setup: **Handy v1 through Intiface Central**. Physical transport and
firmware version still need recording for reproducible comparisons.

The comparison checkout is `MultiFunPlayer`, branch `master`, commit `36c08fbb`,
inspected locally on 2026-10-30. Its inspected Buttplug output supports fixed
sampled updates (50 ms default, configurable 16–200 ms) and polled target events.
Its interpolation implementation supports Linear, PCHIP, Makima and Step. These
are reference behaviors from that checkout, not claims about the latest release.

### Implementation

- `src/utils/funscriptScheduler.ts` reads the media clock independently of React
  rendering and `timeupdate`. It targets the first future point with the remaining
  real-time duration adjusted for playback speed.
- Send once per target; skip obsolete points after delayed callbacks instead of
  replaying them in a burst. Targets are identified by absolute timestamp so
  generated rolling windows do not resend the same point.
- Poll every **20 ms** by default, configurable within **10–100 ms**. Polling is a
  clock-check interval, not a fixed device command frequency.
- Signed script offset is configurable within **−1000 to +1000 ms**. Positive runs
  motion ahead of audio; negative delays it. Timing settings persist in the browser
  and can be reset to defaults.
- Pause, buffering, seeking, ending, source replacement, unmount and update
  suspension cancel scheduling. Resume follows the current media position.
- `useFunscript` aborts obsolete fetches, immediately hides old-source points,
  filters invalid points and resolves duplicate timestamps to the last point.
- Interpolation remains linear. There is one keyframe-target scheduling mode;
  fixed-rate sampled output, PCHIP/Makima smoothing, speed/range limits and
  per-device profiles are not implemented. Browser timer throttling still applies.

### Next investigation

1. Record firmware, transport and MultiFunPlayer output settings. Compare the same
   steady triangular script, dense script and a reported problematic script at
   matched playback speed and movement range.
2. Add timing diagnostics for intended targets, actual send times/durations,
   scheduler lateness and device errors. Command acknowledgments do not establish
   physical arrival time.
3. Compare the current target scheduler with MultiFunPlayer's polled and fixed
   sampled output, including background-tab behavior and interrupted movements.
4. Evaluate optional smoothing separately from timing. PCHIP/Makima would require
   sampled output or curve subdivision and would change the motion shape.
5. Use measured jitter, phase error, missed reversals, command rate and device feel
   to decide whether more output modes or controls are justified.

Comparison references retained from the initial investigation:

- [MultiFunPlayer Buttplug output source](https://github.com/Yoooi0/MultiFunPlayer/blob/master/Source/MultiFunPlayer/OutputTarget/ViewModels/ButtplugOutputTarget.cs)
- [MultiFunPlayer repository](https://github.com/Yoooi0/MultiFunPlayer)
- [HTML media timeupdate event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event)

## 3. Repo-defined motion algorithms

### Agreed behavior and implementation

- Each algorithm is a repository-defined TypeScript module implementing
  `MotionAlgorithm` in `src/motion/types.ts`, registered in `src/motion/index.ts`.
  It supplies an ID, name, description and deterministic `generate(timeMs)` function.
- Generators return bounded windows of sorted, unique `{ at, pos }` points on the
  absolute media timeline, with a future target. Times are milliseconds and
  positions are 0–100. Long tracks and seeks do not require complete point arrays.
- **Motion source** defaults to the track's funscript. With no script, motion stays
  off until an algorithm is chosen. An algorithm can override an existing script;
  **Use track script** restores it.
- Selection resets per playback entry and on refresh. Queue transitions do not
  silently carry an algorithm override to the next track.
- The initial **60 BPM strokes** preset performs one full 0–100–0 cycle per second
  at normal playback speed, with linear endpoints every 500 ms. Phase is anchored
  to media time zero; playback speed changes tempo.
- Generated motion shares the file-script scheduler, offset, seek, pause/buffering
  lifecycle and Stop/Resume updates controls. It does not modify track files.

### Remaining validation and optional extensions

- Validate source selection, override/restoration and 60 BPM motion in the browser
  and on the Handy, including seeks and suspended updates.
- Additional algorithms, user-adjustable parameters, seeded variation and optional
  source persistence are follow-ups, not part of the initial preset.
- Generic runtime validation and visible errors for invalid generator output are
  not implemented; current repo-defined generators must honor the interface contract.

## 4. Stop/resume keyboard shortcut

### Agreed behavior and implementation

- Default binding is **Page Down** (`PageDown`). A recorder in the Intiface modal
  accepts another key combination and offers reset to default. The binding is
  saved in this browser; no backend file configuration was added.
- Player and modal buttons share the same app-level toggle as the shortcut.
  **Stop updates** suspends commands while audio continues and Intiface stays
  connected. **Resume updates** follows the current media position without catch-up.
- Suspension guards command dispatch immediately, cancels scheduling and survives
  track changes. Refresh starts a new session with updates allowed; audio restores
  paused. Already-issued device movements may finish.
- A capture-phase key listener handles enabled/connected sessions, prevents the
  handled key's page action, ignores editable fields and composition, suppresses
  repeated keydown toggles and cleans up bindings when changed.

### Remaining validation

- Check rebinding, editable-field behavior, held keys, scrolling and shortcut
  conflicts in the browser, including after navigation.
- On the Handy, confirm audio continues, the connection remains open and resuming
  follows the current timeline for both file scripts and generated motion.

## Validation status and next steps

**29 committed automated checks pass:**

| Suite | Checks | Coverage |
| --- | --- | --- |
| `scripts/tests/audio-queue.test.mjs` | 13 | Insertion, override, group fallback, no wrap, duplicates, stale actions, persistence and invalid storage |
| `scripts/tests/audio-playback.test.mjs` | 7 | Source replacement, old-position guards, paused restoration, repeated tracks, sync suspension, autoplay failure and cleanup |
| `scripts/tests/funscript-scheduler.test.mjs` | 9 | Target timing, rate/offset, lifecycle, delayed callbacks and deterministic rolling generators |

Run from the repository root with Node.js 22.18+:

```bash
node scripts/tests/audio-queue.test.mjs
node scripts/tests/audio-playback.test.mjs
node scripts/tests/funscript-scheduler.test.mjs
```

Additional temporary harnesses passed mocked provider/shortcut checks, including
command gating, group continuation, stale metadata/position guards, persistence,
storage failure and connection retention. Those harnesses are not committed test
suites and do not replace UI or hardware validation.

Next steps, in order:

1. Install frontend dependencies and run the required UI checks/build. The current
   environment lacks `tsc`; package-registry access failed, so these checks have
   not passed yet.
2. Complete the browser checks listed above for all four features.
3. Validate on Handy v1 through Intiface Central and run the pinned MultiFunPlayer
   comparison before claiming improved physical smoothness or performance parity.
4. Choose further interpolation modes, diagnostics or algorithm parameters based
   on the results.
