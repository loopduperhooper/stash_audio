import React, { useEffect, useRef } from "react";
import * as GQL from "src/core/generated-graphql";
import { objectTitle } from "src/core/files";

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

  // Restore resume time on mount
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audio.resume_time) return;
    el.currentTime = audio.resume_time;
  }, [audio.resume_time]);

  function handleTimeUpdate() {
    if (audioRef.current && onTimeUpdate) {
      onTimeUpdate(audioRef.current.currentTime);
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
    </div>
  );
};

export default AudioPlayer;
