import {
  faFilm,
  faMusic,
  faUser,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FormattedNumber, useIntl } from "react-intl";
import { Link } from "react-router-dom";
import { useConfigurationContext } from "src/hooks/Config";
import TextUtils from "src/utils/text";
import { Icon } from "./Icon";

export const Count: React.FC<{
  count: number;
}> = ({ count }) => {
  const { configuration } = useConfigurationContext();
  const abbreviateCounter = configuration?.ui.abbreviateCounters ?? false;

  if (!abbreviateCounter) {
    return <span>{count}</span>;
  }

  const formatted = TextUtils.abbreviateCounter(count);

  return (
    <span>
      <FormattedNumber
        value={formatted.size}
        maximumFractionDigits={formatted.digits}
      />
      {formatted.unit}
    </span>
  );
};

type PopoverLinkType =
  | "audio"
  | "group"
  | "sub_group"
  | "performer"
  | "studio";

interface IProps {
  className?: string;
  url: string;
  type: PopoverLinkType;
  count: number;
  showZero?: boolean;
}

export const PopoverCountButton: React.FC<IProps> = ({
  className,
  url,
  type,
  count,
  showZero = true,
}) => {
  const intl = useIntl();

  if (!showZero && count === 0) {
    return null;
  }

  function getIcon() {
    switch (type) {
      case "audio":
        return faMusic;
      case "group":
      case "sub_group":
        return faFilm;
      case "performer":
        return faUser;
      case "studio":
        return faVideo;
    }
  }

  function getPluralOptions() {
    switch (type) {
      case "audio":
        return {
          one: "audio",
          other: "audios",
        };
      case "group":
        return {
          one: "group",
          other: "groups",
        };
      case "sub_group":
        return {
          one: "sub_group",
          other: "sub_groups",
        };
      case "performer":
        return {
          one: "performer",
          other: "performers",
        };
      case "studio":
        return {
          one: "studio",
          other: "studios",
        };
    }
  }

  function getTitle() {
    const pluralCategory = intl.formatPlural(count);
    const options = getPluralOptions();
    const plural = intl.formatMessage({
      id: options[pluralCategory as "one"] || options.other,
    });
    return `${count} ${plural}`;
  }

  return (
    <>
      <OverlayTrigger
        overlay={<Tooltip id={`${type}-count-tooltip`}>{getTitle()}</Tooltip>}
        placement="bottom"
      >
        <Link className={className} to={url}>
          <Button className="minimal">
            <Icon icon={getIcon()} />
            <Count count={count} />
          </Button>
        </Link>
      </OverlayTrigger>
    </>
  );
};
