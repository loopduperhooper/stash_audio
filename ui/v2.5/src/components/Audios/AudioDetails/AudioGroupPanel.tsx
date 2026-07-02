import React from "react";
import * as GQL from "src/core/generated-graphql";
import { GroupCard } from "src/components/Groups/GroupCard";

interface IAudioGroupPanelProps {
  audio: GQL.AudioDataFragment;
}

export const AudioGroupPanel: React.FC<IAudioGroupPanelProps> = ({ audio }) => {
  const cards = audio.groups.map((group) => (
    <GroupCard key={group.id} group={group} />
  ));

  return (
    <div className="row justify-content-center">
      {cards}
    </div>
  );
};

export default AudioGroupPanel;
