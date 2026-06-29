import React from "react";
import { useStats } from "src/core/StashService";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { LoadingIndicator } from "src/components/Shared/LoadingIndicator";
import TextUtils from "src/utils/text";
import { FileSize } from "./Shared/FileSize";

export const Stats: React.FC = () => {
  const { data, error, loading } = useStats();

  if (error) return <span>{error.message}</span>;
  if (loading || !data) return <LoadingIndicator />;

  const audiosDuration = TextUtils.secondsAsTimeString(
    data.stats.audios_duration,
    3
  );

  return (
    <div className="mt-5">
      <div className="col col-sm-8 m-sm-auto row stats">
        <div className="stats-element">
          <p className="title">
            <FileSize size={data.stats.audios_size} />
          </p>
          <p className="heading">
            <FormattedMessage
              id="stats.audios_size"
              defaultMessage="Audio Size"
            />
          </p>
        </div>
        <div className="stats-element">
          <p className="title">
            <FormattedNumber value={data.stats.audio_count} />
          </p>
          <p className="heading">
            <FormattedMessage id="audios" defaultMessage="Audio" />
          </p>
        </div>
        <div className="stats-element">
          <p className="title">{audiosDuration || "-"}</p>
          <p className="heading">
            <FormattedMessage
              id="stats.audios_duration"
              defaultMessage="Audio Duration"
            />
          </p>
        </div>
        <div className="stats-element">
          <p className="title">
            <FormattedNumber value={data.stats.performer_count} />
          </p>
          <p className="heading">
            <FormattedMessage id="performers" />
          </p>
        </div>
        <div className="stats-element">
          <p className="title">
            <FormattedNumber value={data.stats.studio_count} />
          </p>
          <p className="heading">
            <FormattedMessage id="studios" />
          </p>
        </div>
        <div className="stats-element">
          <p className="title">
            <FormattedNumber value={data.stats.group_count} />
          </p>
          <p className="heading">
            <FormattedMessage id="groups" />
          </p>
        </div>
        <div className="stats-element">
          <p className="title">
            <FormattedNumber value={data.stats.tag_count} />
          </p>
          <p className="heading">
            <FormattedMessage id="tags" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
