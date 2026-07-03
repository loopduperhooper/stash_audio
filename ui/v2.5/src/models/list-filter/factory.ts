import { FilterMode } from "src/core/generated-graphql";
import { ListFilterOptions } from "./filter-options";
import { AudioListFilterOptions } from "./audios";
import { GroupListFilterOptions } from "./groups";
import { PerformerListFilterOptions } from "./performers";
import { StudioListFilterOptions } from "./studios";
import { TagListFilterOptions } from "./tags";

export function getFilterOptions(mode: FilterMode): ListFilterOptions {
  switch (mode) {
    case FilterMode.Audios:
      return AudioListFilterOptions;
    case FilterMode.Performers:
      return PerformerListFilterOptions;
    case FilterMode.Studios:
      return StudioListFilterOptions;
    case FilterMode.Movies:
    case FilterMode.Groups:
      return GroupListFilterOptions;
    case FilterMode.Tags:
      return TagListFilterOptions;
    default:
      throw new Error(`Unsupported filter mode: ${mode}`);
  }
}
