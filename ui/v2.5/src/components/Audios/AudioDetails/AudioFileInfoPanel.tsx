import React from "react";
import { FormattedTime, useIntl } from "react-intl";
import * as GQL from "src/core/generated-graphql";
import { TruncatedText } from "src/components/Shared/TruncatedText";
import { RevealInFilesystemButton } from "src/components/Shared/RevealInFilesystemButton";
import { FileSize } from "src/components/Shared/FileSize";
import { StashIDPill } from "src/components/Shared/StashID";
import { TextField, URLField, URLsField } from "src/utils/field";
import TextUtils from "src/utils/text";
import { FormattedMessage } from "react-intl";

interface IAudioFileInfoPanelProps {
  audio: GQL.AudioDataFragment;
}

export const AudioFileInfoPanel: React.FC<IAudioFileInfoPanelProps> = ({
  audio,
}) => {
  const intl = useIntl();

  const file = audio.files.length > 0 ? audio.files[0] : undefined;
  const checksum = file?.fingerprints.find((f) => f.type === "md5");

  function renderStashIDs() {
    if (!audio.stash_ids.length) return;
    return (
      <>
        <dt>
          <FormattedMessage id="stash_ids" />
        </dt>
        <dd>
          <dl>
            {audio.stash_ids.map((stashID) => (
              <dd key={stashID.stash_id} className="row no-gutters">
                <StashIDPill stashID={stashID} linkType="scenes" />
              </dd>
            ))}
          </dl>
        </dd>
      </>
    );
  }

  return (
    <dl className="container scene-file-info details-list">
      {audio.paths.stream && (
        <URLField
          id="media_info.stream"
          url={audio.paths.stream}
          value={audio.paths.stream}
          truncate
        />
      )}
      <URLsField id="urls" urls={audio.urls} truncate />
      {renderStashIDs()}
      {file && (
        <>
          <TextField id="media_info.md5" value={checksum?.value} truncate />
          <TextField id="path">
            <span className="d-flex align-items-center">
              <TruncatedText text={file.path} />
              <RevealInFilesystemButton fileId={file.id} />
            </span>
          </TextField>
          <TextField id="filesize">
            <span className="text-truncate">
              <FileSize size={file.size} />
            </span>
          </TextField>
          <TextField id="file_mod_time">
            <FormattedTime
              dateStyle="medium"
              timeStyle="medium"
              value={file.mod_time ?? 0}
            />
          </TextField>
          <TextField
            id="duration"
            value={TextUtils.secondsToTimestamp(file.duration ?? 0)}
            truncate
          />
          <TextField id="bitrate">
            <FormattedMessage
              id="megabits_per_second"
              values={{
                value: intl.formatNumber((file.bit_rate ?? 0) / 1000000, {
                  maximumFractionDigits: 2,
                }),
              }}
            />
          </TextField>
          <TextField
            id="media_info.audio_codec"
            value={file.audio_codec ?? ""}
            truncate
          />
        </>
      )}
    </dl>
  );
};

export default AudioFileInfoPanel;
