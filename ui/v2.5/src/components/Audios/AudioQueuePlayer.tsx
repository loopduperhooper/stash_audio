import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAudioQueue } from "src/hooks/AudioQueueContext";
import { AudioPlayer } from "./AudioDetails/AudioPlayer";
import "./styles.scss";

export const AudioQueuePlayer: React.FC = () => {
  const {
    state,
    audio,
    loading,
    error,
    persistenceError,
    canAdvance,
    fallbackTitle,
    advance,
    remove,
    move,
    clear,
    stop,
    retry,
    savePosition,
  } = useAudioQueue();
  const [expanded, setExpanded] = useState(false);
  const viewButton = useRef<HTMLButtonElement>(null);
  const current = state.current;
  const hasSession = !!current || !!state.upcoming.length;

  function minimize() {
    setExpanded(false);
    viewButton.current?.focus();
  }

  useEffect(() => {
    if (!expanded || !hasSession) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      // Let dialogs (such as device settings) handle their own Escape key.
      if (event.key === "Escape" && !document.querySelector(".modal.show")) {
        event.preventDefault();
        setExpanded(false);
        viewButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, hasSession]);

  useEffect(() => {
    if (!hasSession) setExpanded(false);
  }, [hasSession]);
  if (!current && !state.upcoming.length) return null;

  return (
    <section
      className={`audio-queue-player${expanded ? " expanded" : ""}`}
      aria-label="Audio playback and queue"
    >
      <div className="audio-queue-heading">
        <strong className="audio-queue-current">
          {current ? (
            <Link to={`/audios/${current.id}`}>
              {current.title || "Untitled audio"}
            </Link>
          ) : "Audio queue"}
        </strong>
        <Button size="sm" onClick={advance} disabled={!canAdvance}>
          {current ? "Next" : "Start queue"}
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          aria-expanded={expanded}
          ref={viewButton}
          aria-controls="audio-queue-content"
          onClick={() => expanded ? minimize() : setExpanded(true)}
        >
          {expanded ? "Minimize player" : "View player"} ({state.upcoming.length})
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={stop}
          title="Stop playback and clear the queue"
        >
          Close player
        </Button>
      </div>
      {persistenceError && (
        <div role="alert">The queue could not be saved in this browser.</div>
      )}
      {loading && <div role="status">Loading track…</div>}
      {error && (
        <div role="alert">
          {error} <Button size="sm" onClick={retry}>Retry</Button>
        </div>
      )}
      <div id="audio-queue-content" className="audio-queue-content">
        {current && (
          <AudioPlayer
            entryKey={current.key}
            audio={audio}
            initialTime={state.position ?? undefined}
            autoplay={state.autoplay}
            onTimeUpdate={(position, flush) =>
              savePosition(current.key, position, flush)
            }
            onEnded={advance}
          />
        )}
        <div
          id="audio-queue-panel"
          className="audio-queue-panel"
          hidden={!expanded}
        >
          <div className="d-flex justify-content-between align-items-center">
            <strong>Up next</strong>
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={!state.upcoming.length}
              onClick={clear}
            >
              Clear queue
            </Button>
          </div>
          {state.upcoming.length ? (
            <ol className="audio-queue-list">
              {state.upcoming.map((entry, index) => (
                <li key={entry.key}>
                  <Link to={`/audios/${entry.id}`}>
                    {entry.title || "Untitled audio"}
                  </Link>
                  <div className="audio-queue-item-actions">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={index === 0}
                      onClick={() => move(entry.key, -1)}
                      aria-label={`Move ${entry.title} earlier`}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={index === state.upcoming.length - 1}
                      onClick={() => move(entry.key, 1)}
                      aria-label={`Move ${entry.title} later`}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => remove(entry.key)}
                      aria-label={`Remove ${entry.title} from queue`}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-1">No queued tracks.</p>
          )}
          {current && !state.upcoming.length && (
            <p className="text-muted mb-0">
              {fallbackTitle
                ? `When the queue is empty, continue in this track’s group: ${fallbackTitle}`
                : "When the queue is empty, playback stops at the end of this track."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
