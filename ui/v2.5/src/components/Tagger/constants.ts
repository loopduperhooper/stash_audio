export const STASH_BOX_PREFIX = "stashbox_";
export const SCRAPER_PREFIX = "scraper_";

export interface ITaggerConfig {
  selectedEndpoint: string;
  mode: string;
  showBatchAdd: boolean;
  tagOperation: string;
  setCoverImage: boolean;
  setTags: boolean;
  markSceneAsOrganizedOnSave: boolean;
  batchSize: number;
}
