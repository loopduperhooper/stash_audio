import React from "react";
import { Button } from "react-bootstrap";
import * as GQL from "src/core/generated-graphql";
import { useAudioQueue } from "src/hooks/AudioQueueContext";

export const AudioQueueActions: React.FC<{
  audio: Pick<GQL.SlimAudioDataFragment, "id" | "title" | "files">;
  groupId?: string;
}> = ({ audio, groupId }) => {
  const { play, enqueue } = useAudioQueue();
  return (
    <div className="audio-queue-actions">
      <Button
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          play(audio, groupId);
        }}
        title="Play this track and replace the queue"
      >
        Play
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        onClick={(event) => {
          event.stopPropagation();
          enqueue(audio, true, groupId);
        }}
      >
        Play next
      </Button>
      <Button
        size="sm"
        variant="outline-secondary"
        onClick={(event) => {
          event.stopPropagation();
          enqueue(audio, false, groupId);
        }}
      >
        Add to queue
      </Button>
    </div>
  );
};
