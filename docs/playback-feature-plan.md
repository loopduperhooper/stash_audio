# Playback feature planning

Status: all four features have initial implementations; browser/device validation remains pending.

## Feature tracker

1. Playback queue — persistent player, queue actions/panel, group fallback and refresh restoration implemented.
2. Funscript synchronization performance — initial code comparison recorded; measurement and tuning design proposed.
3. Repo-defined motion algorithms — framework, source selection and 60 BPM strokes implemented.
4. Keyboard shortcut for funscript Stop — configurable binding confirmed; default Page Down.

## 1. Playback queue

### Confirmed requirements

- Play next and Add to queue actions.
- Ordinary Play on another track overrides the current playback and clears the existing explicit queue. Resolve group fallback from the newly selected track. Play next and Add to queue preserve current playback.
- Queue panel with current and upcoming audio; reorder, remove, and clear controls.
- Automatically play the next queued item.
- On natural end or manual Next, consume the next explicit queue entry first. If the queue is empty, fall back to the next item in the current audio's group.
- Group continuation is a fallback, not a list of automatically enqueued items. At the last item in the group (or with no applicable group), do not advance or wrap; disable Next and stop on natural end.
- Expect each track to belong to exactly one group. If multiple memberships exist, choose a random group for playback context; keep that choice stable for the current playback entry so Next and natural end agree. This does not require a database exclusivity constraint or membership cleanup.
- Persist queue across navigation and refresh.
- Switch audio and its associated funscript together while preserving the device connection.

### Existing implementation inspected

- `ui/v2.5/src/models/sceneQueue.ts`: inherited SceneQueue supports explicit scene IDs or a cloned list filter, including sorting, filtering, pagination, autoplay, continue, and start-time URL parameters. It still targets scene types/routes; only Wall components reference it. It is a useful precedent, not an integrated audio queue.
- `ui/v2.5/src/components/Audios/AudioDetails/AudioPlayer.tsx`: page-local audio element, resume-time restoration, subtitles, and FunscriptSync. No ended handler or queue integration.
- `ui/v2.5/src/components/Groups/GroupDetails/GroupAudiosPanel.tsx`: renders group.audios as cards without forwarding group playback context.
- `ui/v2.5/src/hooks/IntifaceContext.tsx`: app-level device connection and persisted connection settings; reuse across track changes.
- `ui/v2.5/src/hooks/useFunscript.ts`: cancels stale fetch results but does not immediately clear actions when changing between script URLs.
- `ui/v2.5/src/components/Audios/AudioDetails/FunscriptSync.tsx`: action index/timing is local; transitions need an explicit reset. Playback state and stopping are not currently modeled here.

### Proposed design (not yet confirmed)

- App-level playback provider owning one persistent audio element, active queue entry, upcoming entries, playback state, and source context. Browsing should not unmount playback.
- Reuse inherited queue concepts for explicit IDs and source-list context, adapted to audio; do not reuse scene-specific types/routes.
- Keep group context separately from the explicit queue; do not seed the queue with remaining group items. Resolve the track's sole group, or choose a random group if multiple memberships exist, and retain it for the current playback entry.
- Play next inserts at the front of the upcoming explicit queue; Add to queue appends. When that queue is exhausted, resolve group continuation from the item then playing and its applicable group context. Do not silently jump back to a previously interrupted group's next item.
- Queue entries have independent entry IDs so repeated audio can be reordered/removed reliably.
- Queue panel shows explicit queued items. It may show a separately labeled group fallback when the explicit queue is empty.
- Persist a versioned queue snapshot, current entry, source context, and playback position locally. Restore paused after refresh; handle browser autoplay rejection visibly.
- Ordinary Play replaces current playback and clears upcoming explicit entries; it does not automatically enqueue the selected track's remaining group items.

### Track switching contract

- Invalidate old script/subtitle loads and stop old script scheduling before switching.
- Retain the Intiface connection and device settings.
- Reset playback timing, script action index, and subtitle state for each entry.
- Load the next audio and script, then align device commands to actual media playback time.
- No script, pause, buffering, playback failure, or exhausted queue must not leave old script scheduling active. Define and implement a device stop operation rather than assuming that ceasing commands stops motion.
- Automatic continuation should start the next item at the beginning; separately define resume behavior for an explicit user Play action.
- Define handling of deleted/unplayable entries and script-load failures with visible status and bounded skipping.

### Implementation sequence

1. Settle group ordering and resume semantics; ordinary Play override and group selection rules are confirmed.
2. Add queue state/persistence and move media ownership above page routes.
3. Add actions to cards, lists, details, and group playback entry points.
4. Add queue panel and next/previous controls; wire ended transitions.
5. Implement script transition lifecycle and device stop handling.
6. Verify insertion/reordering, explicit-queue priority on both natural end and Next, empty-queue group fallback, last-in-group blocking without wrapping, persistence, stale asynchronous loads, navigation, autoplay rejection, and script/no-script transitions. Validate device transitions with real hardware.

### Initial implementation

- `AudioQueueProvider` owns the explicit queue, current entry and stable group context. The app-level `AudioQueuePlayer` keeps a single native audio element mounted across navigation and metadata loading. Route loading has its own Suspense boundary so it does not hide the player.
- Audio cards and detail pages expose Play, Play next and Add to queue. Group cards pass their group ID. Each queued occurrence has its own key; the panel offers move earlier/later, remove and clear. Close player stops playback and clears the entire session.
- Both ended and Next dispatch the same advancement operation: consume the explicit queue, otherwise use the next item in the current group array (same ordering as GroupAudiosPanel). No wrapping or automatic seeding of group remainders. An idle queue starts only through Start queue.
- Versioned browser-local persistence saves current entry, stable group choice, ordered queue and position; refresh restores paused. Ordinary Play uses server resume_time, while queue/group transitions start at zero. Position writes are throttled and flushed on pause, seek and page hiding.
- Source replacement removes old media listeners, pauses/reloads the same element and ignores transition events until new metadata arrives. Script/subtitle loads are invalidated; algorithm selection resets per playback entry. Intiface connection and updates-suspended state stay at app scope.
- Unavailable metadata/streams and autoplay rejection are shown in the player. Retry or Next allow recovery; missing entries are not silently skipped. Storage failure is surfaced.
- Thirteen queue tests and seven media lifecycle tests pass, alongside nine scheduler/generator checks. Coverage includes interrupted-group fallback, no wrap, duplicates, stale advance events, paused restoration, old-position guards, repeated tracks, autoplay rejection and sync suspension on source replacement. Full UI check remains blocked by missing dependencies/compiler; browser/Handy checks remain pending.

## 2. Funscript synchronization performance

### Reported symptom and intent

Some scripts with apparently consistent oscillation periods feel sporadic in speed. User recollection is approximate; reproduce before attributing the full symptom to software. Compare MultiFunPlayer with our implementation and consider tunable update timing and other useful parameters.

Validation device: Handy v1, connected through Intiface Central. The physical device-to-Intiface transport and firmware version have not been confirmed. Prioritize this setup when evaluating command frequency and interrupted movements; do not assume more frequent commands improve smoothness.

### Initial findings

- Our commands are driven by HTML audio timeupdate events through React state/effects. These events have a variable frequency, documented around 4–66 Hz; they are not a precise motion clock.
- FunscriptSync finds the last action at or before media time, sends that past action's position, and uses the full interval to the following action as movement duration. This can send late targets, omit intermediate reversals, and ignore elapsed segment time. It also does not convert script duration for playback rate. These are plausible contributors, not hardware-validated diagnoses.
- Current public MultiFunPlayer Buttplug output supports fixed updates (50 ms default, configurable 16–200 ms in the inspected source) and polled updates. Fixed output uses sampled values and elapsed update time for movement duration; polled output uses a target-value event and its duration. Compare both end-to-end timing paths before selecting an equivalent design.
- MultiFunPlayer also advertises linear alternatives such as PCHIP/Makima script smoothing and speed limits. Interpolation changes motion shape; evaluate separately from scheduling accuracy.

Sources inspected on 2026-10-30:

- Local comparison checkout: `/Users/scubasteve/projects/MultiFunPlayer`, branch `master`, commit `36c08fbb` (clean when inspected). Use this pinned checkout for further investigation; online master may differ.
- https://raw.githubusercontent.com/Yoooi0/MultiFunPlayer/master/Source/MultiFunPlayer/OutputTarget/ViewModels/ButtplugOutputTarget.cs
- https://github.com/Yoooi0/MultiFunPlayer
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event

### Proposed investigation and implementation plan

1. Capture intended action timestamps/positions, actual command send times/targets/durations, media time, scheduler lateness, and device errors. Distinguish send timing from physical movement; acknowledgments alone do not establish physical arrival time.
2. Compare steady triangular oscillations, sinusoidal/dense scripts, and a reported problematic script using the same device, connection, playback rate, and movement range in both applications. Record MultiFunPlayer version and output settings.
3. Move motion timing outside React rendering and timeupdate events into a cancellable media-clock-based scheduler. Account for late callbacks without replaying bursts of obsolete actions; align targets and remaining durations with playback rate. Evaluate background-tab throttling rather than assuming browser timers are precise.
4. Evaluate keyframe-target scheduling versus fixed-rate interpolated output, including device transport limits and whether frequent commands interrupt ongoing motion. Implement pause, buffering, seek, track change, and stop lifecycle handling.
5. Proposed controls: advanced update interval (initial candidates 16/25/50 ms, defaults chosen after measurement), signed sync offset in ms with explicit direction labels, and linear versus optional smooth interpolation. Distinguish internal scheduler wake frequency from device command frequency. Consider per-device profiles and reset-to-defaults. Speed/range limits are separate optional controls.
6. Validate jitter, phase error, missed reversals, commands per second, and real-device feel. Add deterministic scheduler checks with a fake clock; real-device comparison remains necessary.

### Initial implementation

- A cancellable scheduler reads the audio element directly, independently of timeupdate/React rendering. It targets the first future script point with remaining real-time duration adjusted for playback speed, sending once per target rather than repeatedly interrupting a move.
- Default clock polling is 20 ms, configurable 10–100 ms. This is a scheduler check interval, not a fixed command send rate. Signed offset is configurable within ±1000 ms. Settings persist in this browser.
- Pause, buffering, seeking, ending, source changes, unmount, and update suspension cancel scheduling. Resume uses current media position. Already-issued device movement may finish.
- Script fetching is aborted on source change, old-source actions are hidden immediately, invalid points are filtered, and duplicate timestamps collapse to one target.
- Linear movement between keyframes is retained. The local MultiFunPlayer `KeyframeCollection.Interpolate` supports Linear/Pchip/Makima/Step, and its polled `DeviceAxisScriptEvent` targets the next keyframe. Optional curve smoothing would require sampled output or curve subdivision; it is not implemented in this pass and should be evaluated separately on the Handy.
- Seven deterministic fake-clock checks cover target/duration selection, playback rate and offset, bounds, steady oscillation, delayed callbacks, lifecycle events, suspension/resume, and script exhaustion. Full TypeScript check is blocked by absent dependencies/compiler. No hardware benchmark or claim of MultiFunPlayer parity yet.

## 3. Repo-defined motion algorithms

### Confirmed requirements

- Each algorithm is a distinct code snippet/module defined in the repository that programmatically generates timestamped motion points, simulating a funscript.
- Default to the track's funscript when present.
- When no track script exists, allow the user to select an algorithm. Do not automatically start an algorithm merely because the script is missing.
- When a track script exists, allow explicit algorithm override and a Use track script option to return to it.

### Initial implementation

- Repo-defined TypeScript modules in `src/motion` implement `MotionAlgorithm` and register in `index.ts`. The player offers a Motion source selector even without a track script. Selecting an algorithm overrides the track script; selecting Use track script restores it. Selection resets on track changes.
- Initial preset: 60 BPM strokes, one full 0–100–0 cycle per second at normal playback speed, linear endpoints every 500 ms. Phase follows absolute media time; playback speed changes tempo.
- Generators return bounded windows, and the shared scheduler deduplicates targets by absolute timestamp. Pause, seek, buffering, offset and Stop / Resume updates use the existing lifecycle.
- Nine deterministic scheduler/generator checks pass, including long seeks and rolling-window command deduplication. Full UI type check is blocked by missing `tsc`; browser and hardware validation remain pending.

### Future extensions

- Use TypeScript modules in the existing frontend, with stable ID, display name, parameter definitions, and a point generator. Language is an implementation proposal, not a user requirement.
- Feed generated points through the same scheduler and device lifecycle as file-based scripts.
- Generate bounded windows as needed; derive points from media time, parameters, and an optional seed so seeking is reproducible and long tracks do not require unbounded point arrays.
- Validate generated timestamps and positions; handle invalid output visibly and stop scheduling motion.
- Source changes cancel old pending output and align the new source to current playback time.
- Parameter controls, additional algorithms and optional persistence can be added later. Track script remains the default on each track.

## 4. Stop keyboard shortcut

### Confirmed requirements

- Add a configurable keyboard shortcut for the funscript Stop action.
- Default binding: Page Down (`pagedown` in Mousetrap).
- Configuration may be exposed through an application setting, a config file, or both; exact storage/UI remains an implementation choice.
- The Stop button and shortcut toggle device updates off/on without pausing audio or disconnecting Intiface. While suspended, send no further motion updates; this does not promise to halt a movement command already accepted by the device.
- Activating the toggle again resumes updates at the current media position, without replaying points missed while suspended. Applies to both track scripts and generated algorithms.

### Proposed implementation

- Route the button and shortcut through the same update-suspension toggle so behavior cannot diverge. Clearly display suspended/active state and offer Resume updates while suspended.
- Prevent Page Down scrolling when the shortcut is handled. Respect editable fields and shortcut conflicts, and clean up bindings when changed.
- Ensure the binding works wherever persistent playback is available.
- Cancel pending scheduler callbacks on suspension; resume by resolving the current source at current media time. Track transitions must not implicitly resume updates while the toggle is suspended.

### Initial implementation

- App-level suspension state guards command dispatch immediately and suppresses FunscriptSync updates. Resetting the action index allows resume within the same script segment. Suspension survives track changes; refresh starts with updates allowed.
- Stop updates / Resume updates buttons in the player and Intiface modal share the toggle.
- Shortcut recorder in the Intiface modal, browser-local persistence, and reset to Page Down. Listener handles connected/enabled sessions, ignores editable fields and composition, suppresses repeat toggles, and removes the old binding on change.
- Focused Node checks passed for shortcut normalization and provider command gating, repeat handling, editable targets, resume, rebinding, persistence, and connection retention using mocked React hooks and transport. Full TypeScript check could not run because dependencies/compiler are absent. Browser and Handy validation remain pending.
