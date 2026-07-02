import React, { useState } from "react";
import * as GQL from "src/core/generated-graphql";
import { AudioCard } from "src/components/Audios/AudioCard";

interface IGroupAudiosPanelProps {
  group: GQL.GroupDataFragment;
}

export const GroupAudiosPanel: React.FC<IGroupAudiosPanelProps> = ({
  group,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (group.audios.length === 0) {
    return <></>;
  }

  return (
    <div className="row justify-content-center">
      {group.audios.map((audio) => (
        <AudioCard
          key={audio.id}
          audio={audio}
          zoomIndex={1}
          selected={selectedIds.has(audio.id)}
          selecting={selectedIds.size > 0}
          onSelectedChanged={(selected) => {
            const next = new Set(selectedIds);
            if (selected) {
              next.add(audio.id);
            } else {
              next.delete(audio.id);
            }
            setSelectedIds(next);
          }}
        />
      ))}
    </div>
  );
};

export default GroupAudiosPanel;
