import React, { useMemo } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import * as GQL from "src/core/generated-graphql";
import { Icon } from "src/components/Shared/Icon";
import { TagLink } from "src/components/Shared/TagLink";
import { HoverPopover } from "src/components/Shared/HoverPopover";
import { PerformerPopoverButton } from "src/components/Shared/PerformerPopoverButton";
import { GridCard } from "src/components/Shared/GridCard/GridCard";
import { RatingBanner } from "src/components/Shared/RatingBanner";
import { faBox, faTag } from "@fortawesome/free-solid-svg-icons";
import { PatchComponent } from "src/patch";
import { StudioOverlay } from "../Shared/GridCard/StudioOverlay";
import { objectTitle } from "src/core/files";

interface IAudioCardProps {
  audio: GQL.SlimAudioDataFragment;
  cardWidth?: number;
  selecting?: boolean;
  selected?: boolean | undefined;
  zoomIndex: number;
  onSelectedChanged?: (selected: boolean, shiftKey: boolean) => void;
}

const AudioCardPopovers = PatchComponent(
  "AudioCard.Popovers",
  (props: IAudioCardProps) => {
    function maybeRenderTagPopoverButton() {
      if (props.audio.tags.length <= 0) return;

      const popoverContent = props.audio.tags.map((tag) => (
        <TagLink key={tag.id} tag={tag} linkType="details" />
      ));

      return (
        <HoverPopover
          className="tag-count"
          placement="bottom"
          content={popoverContent}
        >
          <Button className="minimal">
            <Icon icon={faTag} />
            <span>{props.audio.tags.length}</span>
          </Button>
        </HoverPopover>
      );
    }

    function maybeRenderPerformerPopoverButton() {
      if (props.audio.performers.length <= 0) return;

      return (
        <PerformerPopoverButton performers={props.audio.performers} />
      );
    }

    function maybeRenderOrganized() {
      if (props.audio.organized) {
        return (
          <div className="organized">
            <Button className="minimal">
              <Icon icon={faBox} />
            </Button>
          </div>
        );
      }
    }

    if (
      props.audio.tags.length > 0 ||
      props.audio.performers.length > 0 ||
      props.audio.organized
    ) {
      return (
        <>
          <hr />
          <ButtonGroup className="card-popovers">
            {maybeRenderTagPopoverButton()}
            {maybeRenderPerformerPopoverButton()}
            {maybeRenderOrganized()}
          </ButtonGroup>
        </>
      );
    }

    return null;
  }
);

const AudioCardDetails = PatchComponent(
  "AudioCard.Details",
  (props: IAudioCardProps) => {
    const primaryFile = props.audio.files[0];
    const duration = primaryFile?.duration;
    const codec = primaryFile?.audio_codec;

    return (
      <div className="audio-card__details">
        <span className="audio-card__date">{props.audio.date}</span>
        {duration !== undefined && (
          <span className="audio-card__duration">
            {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
          </span>
        )}
        {codec && <span className="audio-card__codec">{codec}</span>}
      </div>
    );
  }
);

const AudioCardOverlays = PatchComponent(
  "AudioCard.Overlays",
  (props: IAudioCardProps) => {
    const ret = useMemo(() => {
      return (
        <StudioOverlay studio={props.audio.studio} disabled={props.selecting} />
      );
    }, [props.audio.studio, props.selecting]);

    return ret;
  }
);

const AudioCardImage = PatchComponent(
  "AudioCard.Image",
  (props: IAudioCardProps) => {
    const coverSrc = props.audio.paths.cover ?? "";

    return (
      <>
        <div className="audio-card-preview">
          {coverSrc ? (
            <img
              className="audio-card-preview-image"
              alt={objectTitle(props.audio)}
              src={coverSrc}
            />
          ) : (
            <div className="audio-card-preview-placeholder">
              <span className="audio-card-title-placeholder">
                {objectTitle(props.audio)}
              </span>
            </div>
          )}
        </div>
        <RatingBanner rating={props.audio.rating100} />
      </>
    );
  }
);

export const AudioCard: React.FC<IAudioCardProps> = PatchComponent(
  "AudioCard",
  (props: IAudioCardProps) => {
    return (
      <GridCard
        className={`audio-card zoom-${props.zoomIndex}`}
        url={`/audios/${props.audio.id}`}
        width={props.cardWidth}
        title={objectTitle(props.audio)}
        linkClassName="audio-card-link"
        image={<AudioCardImage {...props} />}
        details={<AudioCardDetails {...props} />}
        overlays={<AudioCardOverlays {...props} />}
        popovers={<AudioCardPopovers {...props} />}
        selected={props.selected}
        selecting={props.selecting}
        onSelectedChanged={props.onSelectedChanged}
      />
    );
  }
);
