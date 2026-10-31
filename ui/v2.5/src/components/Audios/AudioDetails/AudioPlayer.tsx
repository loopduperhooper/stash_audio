import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import * as GQL from "src/core/generated-graphql";
import { objectTitle } from "src/core/files";
import { Icon } from "src/components/Shared/Icon";
import { useIntiface } from "src/hooks/IntifaceContext";
import { motionAlgorithms } from "src/motion";
import { FunscriptSync } from "./FunscriptSync";
import { IntifaceModal } from "../IntifaceModal";

interface IAudioPlayerProps {
  audio: GQL.AudioDataFragment;
  onTimeUpdate?: (currentTime: number) => void;
}

interface IVTTCue {
  start: number;
  end: number;
  text: string;
}

function parseVTTTime(t: string): number {
  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parseFloat(parts[2]);
  return h * 3600 + m * 60 + s;
}

function parseVTT(raw: string): IVTTCue[] {
  const cues: IVTTCue[] = [];
  const lines = raw.replace(/\r/g, "").split("\n");
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^([\d:,.]+)\s+-->\s+([\d:,.]+)/);
    if (m) {
      const start = parseVTTTime(m[1].replace(",", "."));
      const end = parseVTTTime(m[2].replace(",", "."));
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i]);
        i++;
      }
      if (textLines.length > 0) {
        cues.push({ start, end, text: textLines.join("\n") });
      }
    }
    i++;
  }
  return cues;
}

export const AudioPlayer: React.FC<IAudioPlayerProps> = ({
  audio,
  onTimeUpdate,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const title = objectTitle(audio);
  const coverSrc = audio.paths.cover ?? "";
  const streamSrc = audio.paths.stream ?? "";
  const funscriptUrl = audio.paths.funscript ?? undefined;
  const subtitlesUrl = audio.paths.subtitles ?? undefined;

  const [showIntiface, setShowIntiface] = useState(false);
  const [activeCue, setActiveCue] = useState<string | null>(null);

  const { enabled, status, updatesSuspended, toggleUpdates, updateShortcut } = useIntiface();
  const [motionSelection, setMotionSelection] = useState({ trackId: audio.id, source: "track" });
  useEffect(() => {
    setMotionSelection({ trackId: audio.id, source: "track" });
  }, [audio.id]);
  // A new track always defaults to its own script (or no motion if absent).
  const motionSource = motionSelection.trackId === audio.id ? motionSelection.source : "track";
  const algorithm = motionAlgorithms.find((item) => item.id === motionSource);
  const hasFunscript = !!funscriptUrl || !!algorithm;
  const syncConnected = enabled && status === "connected" && hasFunscript;
  const syncActive = syncConnected && !updatesSuspended;

  const cuesRef = useRef<IVTTCue[]>([]);
  const lastCueRef = useRef<string | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audio.resume_time) return;
    el.currentTime = audio.resume_time;
  }, [audio.resume_time]);

  useEffect(() => {
    cuesRef.current = [];
    lastCueRef.current = null;
    setActiveCue(null);
    if (!subtitlesUrl) return;
    const controller = new AbortController();
    fetch(subtitlesUrl, { signal: controller.signal })
      .then((r) => r.text())
      .then((raw) => {
        if (!controller.signal.aborted) cuesRef.current = parseVTT(raw);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [audio.id, subtitlesUrl]);

  function handleTimeUpdate() {
    const el = audioRef.current;
    if (!el) return;
    const t = el.currentTime;
    onTimeUpdate?.(t);

    const cues = cuesRef.current;
    if (cues.length > 0) {
      const cue = cues.find((c) => t >= c.start && t < c.end);
      const text = cue?.text ?? null;
      if (text !== lastCueRef.current) {
        lastCueRef.current = text;
        setActiveCue(text);
      }
    }
  }

  return (
    <div className="audio-player">
      <div className="audio-player-cover">
        {coverSrc ? (
          <img src={coverSrc} alt={title} className="audio-cover-image" />
        ) : (
          <div className="audio-cover-placeholder" />
        )}
        <div className={`audio-subtitle-display${activeCue ? " audio-subtitle-active" : ""}`}>
          {activeCue}
        </div>
      </div>

      {streamSrc && (
        <audio
          ref={audioRef}
          className="audio-player-element"
          controls
          preload="metadata"
          src={streamSrc}
          onTimeUpdate={handleTimeUpdate}
        >
          <track kind="chapters" src={audio.paths.vtt ?? undefined} />
        </audio>
      )}

      <div className="audio-intiface-bar">
        <Form.Group controlId="audio-motion-source">
          <Form.Label>Motion source</Form.Label>
          <Form.Control
            as="select"
            value={motionSource}
            onChange={(event) => setMotionSelection({ trackId: audio.id, source: event.currentTarget.value })}
          >
            <option value="track">{funscriptUrl ? "Use track script" : "No track script — motion off"}</option>
            {motionAlgorithms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Form.Control>
          {algorithm && <Form.Text muted>{algorithm.description}</Form.Text>}
        </Form.Group>
          <Button
            variant={syncActive ? "success" : "outline-secondary"}
            size="sm"
            onClick={() => setShowIntiface(true)}
            title="Device sync settings"
          >
            <Icon icon={faBolt} className="mr-1" />
            {syncConnected && updatesSuspended
              ? "Updates stopped"
              : syncActive ? "Sync active" : "Device sync"}
          </Button>
          {syncConnected && (
            <Button
              variant={updatesSuspended ? "warning" : "outline-danger"}
              size="sm"
              className="ml-2"
              onClick={toggleUpdates}
              aria-pressed={updatesSuspended}
              title={`Toggle device updates (${updateShortcut})`}
            >
              {updatesSuspended ? "Resume updates" : "Stop updates"}
            </Button>
          )}
        </div>

      <FunscriptSync key={audio.id} funscriptUrl={funscriptUrl} audioRef={audioRef} algorithm={algorithm} />

      <IntifaceModal show={showIntiface} onHide={() => setShowIntiface(false)} />
    </div>
  );
};

export default AudioPlayer;
