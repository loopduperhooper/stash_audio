import React from "react";
import { Route, Switch } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTitleProps } from "src/hooks/title";
import { FilteredAudioList } from "./AudioList";
import { View } from "../List/views";
import { lazyComponent } from "src/utils/lazyComponent";

const AudioLoader = lazyComponent(
  () => import("./AudioDetails/Audio")
);

const Audios: React.FC = () => {
  return <FilteredAudioList view={View.Audios} alterQuery />;
};

const AudioRoutes: React.FC = () => {
  const titleProps = useTitleProps({ id: "audios" });
  return (
    <>
      <Helmet {...titleProps} />
      <Switch>
        <Route exact path="/audios" component={Audios} />
        <Route path="/audios/:id" component={AudioLoader} />
      </Switch>
    </>
  );
};

export default AudioRoutes;
