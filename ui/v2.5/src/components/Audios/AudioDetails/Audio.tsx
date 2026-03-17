import React, { useEffect, useLayoutEffect, useState } from "react";
import { Tab, Nav, Button, Dropdown } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useHistory, RouteComponentProps } from "react-router-dom";
import { Helmet } from "react-helmet";
import Mousetrap from "mousetrap";
import * as GQL from "src/core/generated-graphql";
import {
  useFindAudio,
  useAudioUpdate,
  useAudioIncrementO,
  useAudioIncrementPlayCount,
  useAudioDestroy,
} from "src/core/StashService";
import { ErrorMessage } from "src/components/Shared/ErrorMessage";
import { LoadingIndicator } from "src/components/Shared/LoadingIndicator";
import { Icon } from "src/components/Shared/Icon";
import { useToast } from "src/hooks/Toast";
import { RatingSystem } from "src/components/Shared/Rating/RatingSystem";
import {
  OCounterButton,
  ViewCountButton,
} from "src/components/Shared/CountButton";
import { OrganizedButton } from "src/components/Scenes/SceneDetails/OrganizedButton";
import { objectTitle } from "src/core/files";
import { useRatingKeybinds } from "src/hooks/keybinds";
import { lazyComponent } from "src/utils/lazyComponent";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { TruncatedText } from "src/components/Shared/TruncatedText";
import { FormattedDate } from "src/components/Shared/Date";
import TextUtils from "src/utils/text";
import { goBackOrReplace } from "src/utils/history";
import { AudioPlayer } from "./AudioPlayer";

const AudioDetailPanel = lazyComponent(() => import("./AudioDetailPanel"));
const AudioFileInfoPanel = lazyComponent(() => import("./AudioFileInfoPanel"));
const AudioEditPanel = lazyComponent(() => import("./AudioEditPanel"));
const DeleteAudiosDialog = lazyComponent(
  () => import("../DeleteAudiosDialog")
);

interface IAudioPageProps {
  audio: GQL.AudioDataFragment;
  onDelete: () => void;
}

const AudioPage: React.FC<IAudioPageProps> = ({ audio, onDelete }) => {
  const Toast = useToast();
  const intl = useIntl();

  const [activeTabKey, setActiveTabKey] = useState("audio-details-panel");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [organizedLoading, setOrganizedLoading] = useState(false);

  const [updateAudio] = useAudioUpdate();
  const [incrementO] = useAudioIncrementO();
  const [incrementPlay] = useAudioIncrementPlayCount();
  const [destroyAudio] = useAudioDestroy();

  const title = objectTitle(audio);
  const file = audio.files.length > 0 ? audio.files[0] : undefined;

  function setRating(v: number | null) {
    updateAudio({
      variables: { input: { id: audio.id, rating100: v } },
    });
  }

  useRatingKeybinds(true, undefined, setRating);

  useEffect(() => {
    Mousetrap.bind("a", () => setActiveTabKey("audio-details-panel"));
    Mousetrap.bind("e", () => setActiveTabKey("audio-edit-panel"));
    Mousetrap.bind("i", () => setActiveTabKey("audio-file-info-panel"));
    Mousetrap.bind("o", () => onIncrementO());

    return () => {
      Mousetrap.unbind("a");
      Mousetrap.unbind("e");
      Mousetrap.unbind("i");
      Mousetrap.unbind("o");
    };
  });

  function onIncrementO() {
    incrementO({ variables: { id: audio.id } }).catch((e) => Toast.error(e));
  }

  function onIncrementPlay() {
    incrementPlay({ variables: { id: audio.id } });
  }

  const onOrganizedClick = async () => {
    try {
      setOrganizedLoading(true);
      await updateAudio({
        variables: { input: { id: audio.id, organized: !audio.organized } },
      });
    } catch (e) {
      Toast.error(e);
    } finally {
      setOrganizedLoading(false);
    }
  };

  function onDeleteDialogClosed(deleted: boolean) {
    setIsDeleteAlertOpen(false);
    if (deleted) {
      onDelete();
    }
  }

  const renderOperations = () => (
    <Dropdown>
      <Dropdown.Toggle
        variant="secondary"
        id="operation-menu"
        className="minimal"
        title={intl.formatMessage({ id: "operations" })}
      >
        <Icon icon={faEllipsisV} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="bg-secondary text-white">
        <Dropdown.Item
          key="delete-audio"
          className="bg-secondary text-white"
          onClick={() => setIsDeleteAlertOpen(true)}
        >
          <FormattedMessage
            id="actions.delete"
            values={{ entityType: intl.formatMessage({ id: "audio" }) }}
          />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  async function onSaveAudio(input: GQL.AudioUpdateInput) {
    await updateAudio({ variables: { input } });
  }

  const renderTabs = () => (
    <Tab.Container
      activeKey={activeTabKey}
      onSelect={(k) => k && setActiveTabKey(k)}
    >
      <div>
        <Nav variant="tabs" className="mr-auto">
          <Nav.Item>
            <Nav.Link eventKey="audio-details-panel">
              <FormattedMessage id="details" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="audio-edit-panel">
              <FormattedMessage id="actions.edit" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="audio-file-info-panel">
              <FormattedMessage id="file_info" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
      <Tab.Content>
        <Tab.Pane eventKey="audio-details-panel">
          <AudioDetailPanel audio={audio} />
        </Tab.Pane>
        <Tab.Pane eventKey="audio-edit-panel">
          <AudioEditPanel
            audio={audio}
            isVisible={activeTabKey === "audio-edit-panel"}
            onSubmit={onSaveAudio}
            onDelete={() => setIsDeleteAlertOpen(true)}
          />
        </Tab.Pane>
        <Tab.Pane className="file-info-panel" eventKey="audio-file-info-panel">
          <AudioFileInfoPanel audio={audio} />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {isDeleteAlertOpen && (
        <DeleteAudiosDialog
          selected={[audio]}
          onClose={onDeleteDialogClosed}
        />
      )}
      <div className="scene-tabs order-xl-first order-last">
        <div>
          <div className="scene-header-container">
            {audio.studio && (
              <h1 className="text-center scene-studio-image">
                <Link to={`/studios/${audio.studio.id}`}>
                  <img
                    src={audio.studio.image_path ?? ""}
                    alt={`${audio.studio.name} logo`}
                    className="studio-logo"
                  />
                </Link>
              </h1>
            )}
            <h3 className={`scene-header${audio.studio ? "" : " no-studio"}`}>
              <TruncatedText lineCount={2} text={title} />
            </h3>
          </div>

          <div className="scene-subheader">
            <span className="date" data-value={audio.date}>
              {!!audio.date && <FormattedDate value={audio.date} />}
            </span>
            {file?.duration !== undefined && (
              <span className="duration">
                {TextUtils.secondsToTimestamp(file.duration)}
              </span>
            )}
          </div>

          <div className="scene-toolbar">
            <span className="scene-toolbar-group">
              <RatingSystem
                value={audio.rating100}
                onSetRating={setRating}
                clickToRate
                withoutContext
              />
            </span>
            <span className="scene-toolbar-group">
              <span>
                <ViewCountButton
                  value={audio.play_count ?? 0}
                  onIncrement={onIncrementPlay}
                />
              </span>
              <span>
                <OCounterButton
                  value={audio.o_counter ?? 0}
                  onIncrement={onIncrementO}
                />
              </span>
              <span>
                <OrganizedButton
                  loading={organizedLoading}
                  organized={audio.organized}
                  onClick={onOrganizedClick}
                />
              </span>
              <span>{renderOperations()}</span>
            </span>
          </div>
        </div>
        {renderTabs()}
      </div>
      <div className="scene-divider d-none d-xl-block" />
      <div className="scene-player-container">
        <AudioPlayer audio={audio} />
      </div>
    </>
  );
};

interface IAudioParams {
  id: string;
}

const AudioLoader: React.FC<RouteComponentProps<IAudioParams>> = ({
  match,
  history,
}) => {
  const { id } = match.params;
  const { data, loading, error } = useFindAudio(id);

  const [audio, setAudio] = useState<GQL.AudioDataFragment>();

  useLayoutEffect(() => {
    if (!loading) {
      setAudio(data?.findAudio ?? undefined);
    }
  }, [data, loading]);

  function onDelete() {
    goBackOrReplace(history, "/audios");
  }

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage error={error.message} />;
  if (!audio) return <ErrorMessage error={`No audio found with id ${id}`} />;

  return <AudioPage audio={audio} onDelete={onDelete} />;
};

export default AudioLoader;
