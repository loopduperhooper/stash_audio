import React from "react";
import { Button } from "react-bootstrap";
import { Icon } from "src/components/Shared/Icon";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { useIntl } from "react-intl";

interface IOrganizedButtonProps {
  loading: boolean;
  organized: boolean;
  onClick: () => void;
}

export const OrganizedButton: React.FC<IOrganizedButtonProps> = ({
  loading,
  organized,
  onClick,
}) => {
  const intl = useIntl();

  return (
    <Button
      className={`organized-button ${organized ? "organized" : ""}`}
      variant="secondary"
      disabled={loading}
      onClick={onClick}
      title={intl.formatMessage({ id: organized ? "organized" : "not_organized" })}
    >
      <Icon icon={faBox} />
    </Button>
  );
};

export default OrganizedButton;
