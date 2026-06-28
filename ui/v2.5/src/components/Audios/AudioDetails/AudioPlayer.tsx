import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import * as GQL from "src/core/generated-graphql";
import { objectTitle } from "src/core/files";
import { Icon } from "src/components/Shared/Icon";
import { useIntiface } from "src/hooks/IntifaceContext";
import { FunscriptSync } from "./FunscriptSync";
import { IntifaceModal } from "../IntifaceModal";

interface IAudioPlayerProps {
  audio: GQL.AudioDataFragment;
  onTimeUpdate?: (currentTime: number) => void;
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

  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [showIntiface, setShowIntiface] = useState(false);

  const { enabled, status } = useIntiface();
  const hasFunscript = !!funscriptUrl;
  const syncActive = enabled && status === "connected" && hasFunscript;

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audio.resume_time) return;
    el.currentTime = audio.resume_time;
  }, [audio.resume_time]);

  function handleTimeUpdate() {
    const el = audioRef.current;
    if (!el) return;
    const t = el.currentTime;
    setCurrentTimeMs(t * 1000);
    onTimeUpdate?.(t);
  }

  return (
    <div className="audio-player">
      <div className="audio-player-cover">
        {coverSrc ? (
          <img src={coverSrc} alt={title} className="audio-cover-image" />
        ) : (
          <div className="audio-cover-placeholder" />
        )}
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

      {/* Intiface sync button — only shown when a funscript sidecar exists */}
      {hasFunscript && (
        <div className="audio-intiface-bar">
          <Button
            variant={syncActive ? "success" : "outline-secondary"}
            size="sm"
            onClick={() => setShowIntiface(true)}
            title="Device sync settings"
          >
            <Icon icon={faBolt} className="mr-1" />
            {syncActive ? "Sync active" : "Device sync"}
          </Button>
        </div>
      )}

      <FunscriptSync funscriptUrl={funscriptUrl} currentTimeMs={currentTimeMs} />

      <IntifaceModal show={showIntiface} onHide={() => setShowIntiface(false)} />
    </div>
  );
};

export default AudioPlayer;
