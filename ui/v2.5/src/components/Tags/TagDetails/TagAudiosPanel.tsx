import React from "react";
import * as GQL from "src/core/generated-graphql";
import { useTagFilterHook } from "src/core/tags";
import { FilteredAudioList } from "src/components/Audios/AudioList";
import { View } from "src/components/List/views";

export const TagAudiosPanel: React.FC<{
  active: boolean;
  tag: GQL.TagDataFragment;
  showSubTagContent?: boolean;
}> = ({ active, tag, showSubTagContent }) => {
  const filterHook = useTagFilterHook(tag, showSubTagContent);
  return (
    <FilteredAudioList
      filterHook={filterHook}
      alterQuery={active}
      view={View.TagAudios}
    />
  );
};
