import React from "react";
import * as GQL from "src/core/generated-graphql";
import { AudioCard } from "./AudioCard";
import {
  useCardWidth,
  useContainerDimensions,
} from "../Shared/GridCard/GridCard";
import { PatchComponent } from "src/patch";

interface IAudioCardGrid {
  audios: GQL.SlimAudioDataFragment[];
  selectedIds: Set<string>;
  zoomIndex: number;
  onSelectChange: (id: string, selected: boolean, shiftKey: boolean) => void;
}

// Narrower than scenes (16:9) so square cards end up similar total height
const zoomWidths = [175, 220, 300, 400];

export const AudioCardGrid: React.FC<IAudioCardGrid> = PatchComponent(
  "AudioCardGrid",
  ({ audios, selectedIds, zoomIndex, onSelectChange }) => {
    const [componentRef, { width: containerWidth }] = useContainerDimensions();
    const cardWidth = useCardWidth(containerWidth, zoomIndex, zoomWidths);

    return (
      <div className="row justify-content-center" ref={componentRef}>
        {audios.map((audio) => (
          <AudioCard
            key={audio.id}
            cardWidth={cardWidth}
            audio={audio}
            zoomIndex={zoomIndex}
            selecting={selectedIds.size > 0}
            selected={selectedIds.has(audio.id)}
            onSelectedChanged={(selected: boolean, shiftKey: boolean) =>
              onSelectChange(audio.id, selected, shiftKey)
            }
          />
        ))}
      </div>
    );
  }
);
