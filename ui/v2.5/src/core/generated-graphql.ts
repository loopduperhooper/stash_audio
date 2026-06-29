import { SavedObjectFilter } from 'src/models/list-filter/types';
import { SavedUIOptions } from 'src/models/list-filter/types';
import { IUIConfig } from 'src/core/config';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
// Generated on 2026-06-28T14:23:58-04:00

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: unknown; output: unknown; }
  /** A String -> Boolean map */
  BoolMap: { input: { [key: string]: boolean }; output: { [key: string]: boolean }; }
  Int64: { input: number; output: number; }
  /** A String -> Any map */
  Map: { input: { [key: string]: unknown }; output: { [key: string]: unknown }; }
  /** A plugin ID -> Map (String -> Any map) map */
  PluginConfigMap: { input: { [id: string]: { [key: string]: unknown } }; output: { [id: string]: { [key: string]: unknown } }; }
  SavedObjectFilter: { input: SavedObjectFilter; output: SavedObjectFilter; }
  SavedUIOptions: { input: SavedUIOptions; output: SavedUIOptions; }
  /** An RFC3339 timestamp */
  Time: { input: string; output: string; }
  /**
   * Timestamp is a point in time. It is always output as RFC3339-compatible time points.
   * It can be input as a RFC3339 string, or as "<4h" for "4 hours in the past" or ">5m"
   * for "5 minutes in the future"
   */
  Timestamp: { input: string; output: string; }
  UIConfig: { input: IUIConfig; output: IUIConfig; }
  /** A multipart file upload */
  Upload: { input: File; output: File; }
};

export type AddTempDlnaipInput = {
  address: Scalars['String']['input'];
  /** Duration to enable, in minutes. 0 or null for indefinite. */
  duration?: InputMaybe<Scalars['Int']['input']>;
};

export type AnonymiseDatabaseInput = {
  download?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AssignAudioFileInput = {
  audio_id: Scalars['ID']['input'];
  file_id: Scalars['ID']['input'];
};

export type Audio = {
  __typename?: 'Audio';
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  files: Array<AudioFile>;
  groups: Array<Group>;
  id: Scalars['ID']['output'];
  last_played_at?: Maybe<Scalars['Time']['output']>;
  o_counter: Scalars['Int']['output'];
  organized: Scalars['Boolean']['output'];
  paths: AudioPathsType;
  performers: Array<Performer>;
  play_count: Scalars['Int']['output'];
  play_duration: Scalars['Float']['output'];
  rating100?: Maybe<Scalars['Int']['output']>;
  resume_time: Scalars['Float']['output'];
  stash_ids: Array<StashId>;
  studio?: Maybe<Studio>;
  tags: Array<Tag>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Time']['output'];
  urls: Array<Scalars['String']['output']>;
};

export type AudioCreateInput = {
  cover_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  file_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  group_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AudioDestroyInput = {
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};

export type AudioFile = BaseFile & {
  __typename?: 'AudioFile';
  audio_codec: Scalars['String']['output'];
  basename: Scalars['String']['output'];
  bit_rate: Scalars['Int64']['output'];
  channels: Scalars['Int']['output'];
  created_at: Scalars['Time']['output'];
  duration: Scalars['Float']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder: Folder;
  /** @deprecated Use parent_folder instead */
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  sample_rate: Scalars['Int']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


export type AudioFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

export type AudioFilterType = {
  AND?: InputMaybe<AudioFilterType>;
  NOT?: InputMaybe<AudioFilterType>;
  OR?: InputMaybe<AudioFilterType>;
  /** Filter by audio codec */
  audio_codec?: InputMaybe<StringCriterionInput>;
  /** Filter by bit rate */
  bitrate?: InputMaybe<IntCriterionInput>;
  /** Filter by file checksum */
  checksum?: InputMaybe<StringCriterionInput>;
  /** Filter by created at */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  /** Filter by duration (in seconds) */
  duration?: InputMaybe<IntCriterionInput>;
  /** Filter by file count */
  file_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related files that meet this criteria */
  files_filter?: InputMaybe<FileFilterType>;
  /** Filter to only include audios which have markers. `true` or `false` */
  has_markers?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<IntCriterionInput>;
  /** Filter to only include audios missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by last played at */
  last_played_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by o-counter */
  o_counter?: InputMaybe<IntCriterionInput>;
  /** Filter by organized */
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by path */
  path?: InputMaybe<StringCriterionInput>;
  /** Filter by performer count */
  performer_count?: InputMaybe<IntCriterionInput>;
  /** Filter audios that have performers that have been favorited */
  performer_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include audios with performers with these tags */
  performer_tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter to only include audios with these performers */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by related performers that meet this criteria */
  performers_filter?: InputMaybe<PerformerFilterType>;
  /** Filter by play count */
  play_count?: InputMaybe<IntCriterionInput>;
  /** Filter by play duration (in seconds) */
  play_duration?: InputMaybe<IntCriterionInput>;
  /** Filter by rating expressed as 1-100 */
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by resume time */
  resume_time?: InputMaybe<IntCriterionInput>;
  /** Filter by StashID */
  stash_id?: InputMaybe<StringCriterionInput>;
  /** Filter by StashID Endpoint */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter to only include audios with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include audios with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related tags that meet this criteria */
  tags_filter?: InputMaybe<TagFilterType>;
  title?: InputMaybe<StringCriterionInput>;
  /** Filter by updated at */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

export type AudioPathsType = {
  __typename?: 'AudioPathsType';
  cover?: Maybe<Scalars['String']['output']>;
  funscript?: Maybe<Scalars['String']['output']>;
  stream?: Maybe<Scalars['String']['output']>;
  subtitles?: Maybe<Scalars['String']['output']>;
  vtt?: Maybe<Scalars['String']['output']>;
};

export type AudioUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  cover_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  group_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  id: Scalars['ID']['input'];
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  primary_file_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AudiosDestroyInput = {
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

export type AutoTagMetadataInput = {
  /** Paths to tag, null for all files */
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** IDs of performers to tag files with, or "*" for all */
  performers?: InputMaybe<Array<Scalars['String']['input']>>;
  /** IDs of studios to tag files with, or "*" for all */
  studios?: InputMaybe<Array<Scalars['String']['input']>>;
  /** IDs of tags to tag files with, or "*" for all */
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type AutoTagMetadataOptions = {
  __typename?: 'AutoTagMetadataOptions';
  /** IDs of performers to tag files with, or "*" for all */
  performers?: Maybe<Array<Scalars['String']['output']>>;
  /** IDs of studios to tag files with, or "*" for all */
  studios?: Maybe<Array<Scalars['String']['output']>>;
  /** IDs of tags to tag files with, or "*" for all */
  tags?: Maybe<Array<Scalars['String']['output']>>;
};

export type BackupDatabaseInput = {
  download?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, blob files will be included in the backup. This can significantly increase the size of the backup and the time it takes to create it, but allows for a complete backup of the system that can be restored without needing access to the original media files. */
  includeBlobs?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BaseFile = {
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder: Folder;
  /** @deprecated Use parent_folder instead */
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


export type BaseFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

export type BasicFile = BaseFile & {
  __typename?: 'BasicFile';
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder: Folder;
  /** @deprecated Use parent_folder instead */
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


export type BasicFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

export enum BlobsStorageType {
  /** Database */
  Database = 'DATABASE',
  /** Filesystem */
  Filesystem = 'FILESYSTEM'
}

export type BulkAudioUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<BulkUpdateIds>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

export type BulkGroupUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  containing_groups?: InputMaybe<BulkUpdateGroupDescriptionsInput>;
  custom_fields?: InputMaybe<CustomFieldsInput>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  sub_groups?: InputMaybe<BulkUpdateGroupDescriptionsInput>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

export type BulkMovieUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

export type BulkPerformerUpdateInput = {
  /** Duplicate aliases and those equal to name will result in an error (case-insensitive) */
  alias_list?: InputMaybe<BulkUpdateStrings>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_end?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated Use career_start and career_end */
  career_length?: InputMaybe<Scalars['String']['input']>;
  career_start?: InputMaybe<Scalars['Int']['input']>;
  circumcised?: InputMaybe<CircumisedEnum>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  custom_fields?: InputMaybe<CustomFieldsInput>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  gender?: InputMaybe<GenderEnum>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** @deprecated Use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  penis_length?: InputMaybe<Scalars['Float']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type BulkStudioUpdateInput = {
  details?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ids: Array<Scalars['ID']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  parent_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

export type BulkTagUpdateInput = {
  /** Duplicate aliases and those equal to name will result in an error (case-insensitive) */
  aliases?: InputMaybe<BulkUpdateStrings>;
  child_ids?: InputMaybe<BulkUpdateIds>;
  description?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  parent_ids?: InputMaybe<BulkUpdateIds>;
};

export type BulkUpdateGroupDescriptionsInput = {
  groups: Array<GroupDescriptionInput>;
  mode: BulkUpdateIdMode;
};

export enum BulkUpdateIdMode {
  Add = 'ADD',
  Remove = 'REMOVE',
  Set = 'SET'
}

export type BulkUpdateIds = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  mode: BulkUpdateIdMode;
};

export type BulkUpdateStrings = {
  mode: BulkUpdateIdMode;
  values?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CircumcisionCriterionInput = {
  modifier: CriterionModifier;
  value?: InputMaybe<Array<CircumisedEnum>>;
};

export enum CircumisedEnum {
  Cut = 'CUT',
  Uncut = 'UNCUT'
}

export type CleanGeneratedInput = {
  /** Clean blob files without blob entries */
  blobFiles?: InputMaybe<Scalars['Boolean']['input']>;
  /** Do a dry run. Don't delete any files */
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean image thumbnails/clips without image entries */
  imageThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean marker files without marker entries */
  markers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean preview files without scene entries */
  screenshots?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean sprite and vtt files without scene entries */
  sprites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean scene transcodes without scene entries */
  transcodes?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CleanMetadataInput = {
  /** Do a dry run. Don't delete any files */
  dryRun: Scalars['Boolean']['input'];
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ConfigDlnaInput = {
  /** True if DLNA service should be enabled by default */
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of interfaces to run DLNA on. Empty for all */
  interfaces?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Defaults to 1338 */
  port?: InputMaybe<Scalars['Int']['input']>;
  serverName?: InputMaybe<Scalars['String']['input']>;
  /** Order to sort videos */
  videoSortOrder?: InputMaybe<Scalars['String']['input']>;
  /** List of IPs whitelisted for DLNA service */
  whitelistedIPs?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ConfigDlnaResult = {
  __typename?: 'ConfigDLNAResult';
  /** True if DLNA service should be enabled by default */
  enabled: Scalars['Boolean']['output'];
  /** List of interfaces to run DLNA on. Empty for all */
  interfaces: Array<Scalars['String']['output']>;
  /** Defaults to 1338 */
  port: Scalars['Int']['output'];
  serverName: Scalars['String']['output'];
  /** Order to sort videos */
  videoSortOrder: Scalars['String']['output'];
  /** List of IPs whitelisted for DLNA service */
  whitelistedIPs: Array<Scalars['String']['output']>;
};

export type ConfigDefaultSettingsInput = {
  autoTag?: InputMaybe<AutoTagMetadataInput>;
  /** If true, delete file checkbox will be checked by default */
  deleteFile?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, delete generated files checkbox will be checked by default */
  deleteGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  generate?: InputMaybe<GenerateMetadataInput>;
  identify?: InputMaybe<IdentifyMetadataInput>;
  scan?: InputMaybe<ScanMetadataInput>;
};

export type ConfigDefaultSettingsResult = {
  __typename?: 'ConfigDefaultSettingsResult';
  autoTag?: Maybe<AutoTagMetadataOptions>;
  /** If true, delete file checkbox will be checked by default */
  deleteFile?: Maybe<Scalars['Boolean']['output']>;
  /** If true, delete generated supporting files checkbox will be checked by default */
  deleteGenerated?: Maybe<Scalars['Boolean']['output']>;
  generate?: Maybe<GenerateMetadataOptions>;
  identify?: Maybe<IdentifyMetadataTaskOptions>;
  scan?: Maybe<ScanMetadataOptions>;
};

export type ConfigDisableDropdownCreate = {
  __typename?: 'ConfigDisableDropdownCreate';
  gallery: Scalars['Boolean']['output'];
  movie: Scalars['Boolean']['output'];
  performer: Scalars['Boolean']['output'];
  studio: Scalars['Boolean']['output'];
  tag: Scalars['Boolean']['output'];
};

export type ConfigDisableDropdownCreateInput = {
  gallery?: InputMaybe<Scalars['Boolean']['input']>;
  movie?: InputMaybe<Scalars['Boolean']['input']>;
  performer?: InputMaybe<Scalars['Boolean']['input']>;
  studio?: InputMaybe<Scalars['Boolean']['input']>;
  tag?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ConfigGeneralInput = {
  /** Array of file regexp to exclude from Audio Scans */
  audioExcludes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Array of audio file extensions */
  audioExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Path to backup directory */
  backupDirectoryPath?: InputMaybe<Scalars['String']['input']>;
  /** Path to blobs - required for filesystem blob storage */
  blobsPath?: InputMaybe<Scalars['String']['input']>;
  /** Where to store blobs */
  blobsStorage?: InputMaybe<BlobsStorageType>;
  /** Path to cache */
  cachePath?: InputMaybe<Scalars['String']['input']>;
  /** Whether to calculate MD5 checksums for scene video files */
  calculateMD5?: InputMaybe<Scalars['Boolean']['input']>;
  /** True if galleries should be created from folders with images */
  createGalleriesFromFolders?: InputMaybe<Scalars['Boolean']['input']>;
  /** Create Image Clips from Video extensions when Videos are disabled in Library */
  createImageClipsFromVideos?: InputMaybe<Scalars['Boolean']['input']>;
  /** Custom Performer Image Location */
  customPerformerImageLocation?: InputMaybe<Scalars['String']['input']>;
  /** Path to the SQLite database */
  databasePath?: InputMaybe<Scalars['String']['input']>;
  /** Path to trash directory - if set, deleted files will be moved here instead of being permanently deleted */
  deleteTrashPath?: InputMaybe<Scalars['String']['input']>;
  /** whether to include range in generated funscript heatmaps */
  drawFunscriptHeatmapRange?: InputMaybe<Scalars['Boolean']['input']>;
  /** Array of file regexp to exclude from Video Scans */
  excludes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Path to the ffmpeg binary. If empty, stash will attempt to find it in the path or config directory */
  ffmpegPath?: InputMaybe<Scalars['String']['input']>;
  /** Path to the ffprobe binary. If empty, stash will attempt to find it in the path or config directory */
  ffprobePath?: InputMaybe<Scalars['String']['input']>;
  /** Regex used to identify images as gallery covers */
  galleryCoverRegex?: InputMaybe<Scalars['String']['input']>;
  /** Array of gallery zip file extensions */
  galleryExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Path to generated files */
  generatedPath?: InputMaybe<Scalars['String']['input']>;
  /** Array of file regexp to exclude from Image Scans */
  imageExcludes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Array of image file extensions */
  imageExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * ffmpeg stream input args - injected before input file
   * These are applied when live transcoding
   */
  liveTranscodeInputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * ffmpeg stream output args - injected before output file
   * These are applied when live transcoding
   */
  liveTranscodeOutputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether to log http access */
  logAccess?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of the log file */
  logFile?: InputMaybe<Scalars['String']['input']>;
  /** Maximum log size */
  logFileMaxSize?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum log level */
  logLevel?: InputMaybe<Scalars['String']['input']>;
  /** Whether to also output to stderr */
  logOut?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum session cookie age */
  maxSessionAge?: InputMaybe<Scalars['Int']['input']>;
  /** Max streaming transcode size */
  maxStreamingTranscodeSize?: InputMaybe<StreamingResolutionEnum>;
  /** Max generated transcode size */
  maxTranscodeSize?: InputMaybe<StreamingResolutionEnum>;
  /** Minimum number of sprites to be generated - only used if useCustomSpriteInterval is true */
  maximumSprites?: InputMaybe<Scalars['Int']['input']>;
  /** Path to import/export files */
  metadataPath?: InputMaybe<Scalars['String']['input']>;
  /** Minimum number of sprites to be generated - only used if useCustomSpriteInterval is true */
  minimumSprites?: InputMaybe<Scalars['Int']['input']>;
  /** Number of parallel tasks to start during scan/generate */
  parallelTasks?: InputMaybe<Scalars['Int']['input']>;
  /** Password */
  password?: InputMaybe<Scalars['String']['input']>;
  /** Source of plugin packages */
  pluginPackageSources?: InputMaybe<Array<PackageSourceInput>>;
  /** Path to plugins */
  pluginsPath?: InputMaybe<Scalars['String']['input']>;
  /** Include audio stream in previews */
  previewAudio?: InputMaybe<Scalars['Boolean']['input']>;
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd?: InputMaybe<Scalars['String']['input']>;
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart?: InputMaybe<Scalars['String']['input']>;
  /** Preset when generating preview */
  previewPreset?: InputMaybe<PreviewPreset>;
  /** Preview segment duration, in seconds */
  previewSegmentDuration?: InputMaybe<Scalars['Float']['input']>;
  /** Number of segments in a preview file */
  previewSegments?: InputMaybe<Scalars['Int']['input']>;
  /** Python path - resolved using path if unset */
  pythonPath?: InputMaybe<Scalars['String']['input']>;
  /** Source of scraper packages */
  scraperPackageSources?: InputMaybe<Array<PackageSourceInput>>;
  /** Path to scrapers */
  scrapersPath?: InputMaybe<Scalars['String']['input']>;
  /** Time between two different scrubber sprites in seconds - only used if useCustomSpriteInterval is true */
  spriteInterval?: InputMaybe<Scalars['Float']['input']>;
  /** Size of the longest dimension for each sprite in pixels */
  spriteScreenshotSize?: InputMaybe<Scalars['Int']['input']>;
  /** Stash-box instances used for tagging */
  stashBoxes?: InputMaybe<Array<StashBoxInput>>;
  /** Array of file paths to content */
  stashes?: InputMaybe<Array<StashConfigInput>>;
  /** Transcode Hardware Acceleration */
  transcodeHardwareAcceleration?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * ffmpeg transcode input args - injected before input file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeInputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * ffmpeg transcode output args - injected before output file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeOutputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /** True if sprite generation should use the sprite interval and min/max sprites settings instead of the default */
  useCustomSpriteInterval?: InputMaybe<Scalars['Boolean']['input']>;
  /** Username */
  username?: InputMaybe<Scalars['String']['input']>;
  /** Array of video file extensions */
  videoExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Hash algorithm to use for generated file naming */
  videoFileNamingAlgorithm?: InputMaybe<HashAlgorithm>;
  /** Write image thumbnails to disk when generating on the fly */
  writeImageThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ConfigGeneralResult = {
  __typename?: 'ConfigGeneralResult';
  /** API Key */
  apiKey: Scalars['String']['output'];
  /** Array of file regexp to exclude from Audio Scans */
  audioExcludes: Array<Scalars['String']['output']>;
  /** Array of audio file extensions */
  audioExtensions: Array<Scalars['String']['output']>;
  /** Path to backup directory */
  backupDirectoryPath: Scalars['String']['output'];
  /** Path to blobs - required for filesystem blob storage */
  blobsPath: Scalars['String']['output'];
  /** Where to store blobs */
  blobsStorage: BlobsStorageType;
  /** Path to cache */
  cachePath: Scalars['String']['output'];
  /** Whether to calculate MD5 checksums for scene video files */
  calculateMD5: Scalars['Boolean']['output'];
  /** Path to the config file used */
  configFilePath: Scalars['String']['output'];
  /** True if galleries should be created from folders with images */
  createGalleriesFromFolders: Scalars['Boolean']['output'];
  /** Create Image Clips from Video extensions when Videos are disabled in Library */
  createImageClipsFromVideos: Scalars['Boolean']['output'];
  /** Custom Performer Image Location */
  customPerformerImageLocation?: Maybe<Scalars['String']['output']>;
  /** Path to the SQLite database */
  databasePath: Scalars['String']['output'];
  /** Path to trash directory - if set, deleted files will be moved here instead of being permanently deleted */
  deleteTrashPath: Scalars['String']['output'];
  /** whether to include range in generated funscript heatmaps */
  drawFunscriptHeatmapRange: Scalars['Boolean']['output'];
  /** Array of file regexp to exclude from Video Scans */
  excludes: Array<Scalars['String']['output']>;
  /** Path to the ffmpeg binary. If empty, stash will attempt to find it in the path or config directory */
  ffmpegPath: Scalars['String']['output'];
  /** Path to the ffprobe binary. If empty, stash will attempt to find it in the path or config directory */
  ffprobePath: Scalars['String']['output'];
  /** Regex used to identify images as gallery covers */
  galleryCoverRegex: Scalars['String']['output'];
  /** Array of gallery zip file extensions */
  galleryExtensions: Array<Scalars['String']['output']>;
  /** Path to generated files */
  generatedPath: Scalars['String']['output'];
  /** Array of file regexp to exclude from Image Scans */
  imageExcludes: Array<Scalars['String']['output']>;
  /** Array of image file extensions */
  imageExtensions: Array<Scalars['String']['output']>;
  /**
   * ffmpeg stream input args - injected before input file
   * These are applied when live transcoding
   */
  liveTranscodeInputArgs: Array<Scalars['String']['output']>;
  /**
   * ffmpeg stream output args - injected before output file
   * These are applied when live transcoding
   */
  liveTranscodeOutputArgs: Array<Scalars['String']['output']>;
  /** Whether to log http access */
  logAccess: Scalars['Boolean']['output'];
  /** Name of the log file */
  logFile?: Maybe<Scalars['String']['output']>;
  /** Maximum log size */
  logFileMaxSize: Scalars['Int']['output'];
  /** Minimum log level */
  logLevel: Scalars['String']['output'];
  /** Whether to also output to stderr */
  logOut: Scalars['Boolean']['output'];
  /** Maximum session cookie age */
  maxSessionAge: Scalars['Int']['output'];
  /** Max streaming transcode size */
  maxStreamingTranscodeSize?: Maybe<StreamingResolutionEnum>;
  /** Max generated transcode size */
  maxTranscodeSize?: Maybe<StreamingResolutionEnum>;
  /** Maximum number of sprites to be generated - only used if useCustomSpriteInterval is true */
  maximumSprites: Scalars['Int']['output'];
  /** Path to import/export files */
  metadataPath: Scalars['String']['output'];
  /** Minimum number of sprites to be generated - only used if useCustomSpriteInterval is true */
  minimumSprites: Scalars['Int']['output'];
  /** Number of parallel tasks to start during scan/generate */
  parallelTasks: Scalars['Int']['output'];
  /** Password */
  password: Scalars['String']['output'];
  /** Source of plugin packages */
  pluginPackageSources: Array<PackageSource>;
  /** Path to plugins */
  pluginsPath: Scalars['String']['output'];
  /** Include audio stream in previews */
  previewAudio: Scalars['Boolean']['output'];
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd: Scalars['String']['output'];
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart: Scalars['String']['output'];
  /** Preset when generating preview */
  previewPreset: PreviewPreset;
  /** Preview segment duration, in seconds */
  previewSegmentDuration: Scalars['Float']['output'];
  /** Number of segments in a preview file */
  previewSegments: Scalars['Int']['output'];
  /** Python path - resolved using path if unset */
  pythonPath: Scalars['String']['output'];
  /** Source of scraper packages */
  scraperPackageSources: Array<PackageSource>;
  /** Path to scrapers */
  scrapersPath: Scalars['String']['output'];
  /** Time between two different scrubber sprites in seconds - only used if useCustomSpriteInterval is true */
  spriteInterval: Scalars['Float']['output'];
  /** Size of the longest dimension for each sprite in pixels */
  spriteScreenshotSize: Scalars['Int']['output'];
  /** Stash-box instances used for tagging */
  stashBoxes: Array<StashBox>;
  /** Array of file paths to content */
  stashes: Array<StashConfig>;
  /** Transcode Hardware Acceleration */
  transcodeHardwareAcceleration: Scalars['Boolean']['output'];
  /**
   * ffmpeg transcode input args - injected before input file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeInputArgs: Array<Scalars['String']['output']>;
  /**
   * ffmpeg transcode output args - injected before output file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeOutputArgs: Array<Scalars['String']['output']>;
  /** True if sprite generation should use the sprite interval and min/max sprites settings instead of the default */
  useCustomSpriteInterval: Scalars['Boolean']['output'];
  /** Username */
  username: Scalars['String']['output'];
  /** Array of video file extensions */
  videoExtensions: Array<Scalars['String']['output']>;
  /** Hash algorithm to use for generated file naming */
  videoFileNamingAlgorithm: HashAlgorithm;
  /** Write image thumbnails to disk when generating on the fly */
  writeImageThumbnails: Scalars['Boolean']['output'];
};

export type ConfigImageLightboxInput = {
  disableAnimation?: InputMaybe<Scalars['Boolean']['input']>;
  displayMode?: InputMaybe<ImageLightboxDisplayMode>;
  resetZoomOnNav?: InputMaybe<Scalars['Boolean']['input']>;
  scaleUp?: InputMaybe<Scalars['Boolean']['input']>;
  scrollAttemptsBeforeChange?: InputMaybe<Scalars['Int']['input']>;
  scrollMode?: InputMaybe<ImageLightboxScrollMode>;
  slideshowDelay?: InputMaybe<Scalars['Int']['input']>;
};

export type ConfigImageLightboxResult = {
  __typename?: 'ConfigImageLightboxResult';
  disableAnimation?: Maybe<Scalars['Boolean']['output']>;
  displayMode?: Maybe<ImageLightboxDisplayMode>;
  resetZoomOnNav?: Maybe<Scalars['Boolean']['output']>;
  scaleUp?: Maybe<Scalars['Boolean']['output']>;
  scrollAttemptsBeforeChange: Scalars['Int']['output'];
  scrollMode?: Maybe<ImageLightboxScrollMode>;
  slideshowDelay?: Maybe<Scalars['Int']['output']>;
};

export type ConfigInterfaceInput = {
  /** If true, video will autostart on load in the scene player */
  autostartVideo?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, video will autostart when loading from play random or play selected */
  autostartVideoOnPlaySelected?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, next scene in playlist will be played at video end by default */
  continuePlaylistDefault?: InputMaybe<Scalars['Boolean']['input']>;
  /** Custom CSS */
  css?: InputMaybe<Scalars['String']['input']>;
  cssEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Custom Locales */
  customLocales?: InputMaybe<Scalars['String']['input']>;
  customLocalesEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** When true, disables all customizations (plugins, CSS, JavaScript, locales) for troubleshooting */
  disableCustomizations?: InputMaybe<Scalars['Boolean']['input']>;
  /** Set to true to disable creating new objects via the dropdown menus */
  disableDropdownCreate?: InputMaybe<ConfigDisableDropdownCreateInput>;
  /** Funscript Time Offset */
  funscriptOffset?: InputMaybe<Scalars['Int']['input']>;
  /** Handy Connection Key */
  handyKey?: InputMaybe<Scalars['String']['input']>;
  imageLightbox?: InputMaybe<ConfigImageLightboxInput>;
  /** Custom Javascript */
  javascript?: InputMaybe<Scalars['String']['input']>;
  javascriptEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Interface language */
  language?: InputMaybe<Scalars['String']['input']>;
  /** Maximum duration (in seconds) in which a scene video will loop in the scene player */
  maximumLoopDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Ordered list of items that should be shown in the menu */
  menuItems?: InputMaybe<Array<Scalars['String']['input']>>;
  /** True if we should not auto-open a browser window on startup */
  noBrowser?: InputMaybe<Scalars['Boolean']['input']>;
  /** True if we should send notifications to the desktop */
  notificationsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** True if SFW content mode is enabled */
  sfwContentMode?: InputMaybe<Scalars['Boolean']['input']>;
  /** Show scene scrubber by default */
  showScrubber?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, studio overlays will be shown as text instead of logo images */
  showStudioAsText?: InputMaybe<Scalars['Boolean']['input']>;
  /** Enable sound on mouseover previews */
  soundOnPreview?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to use Stash Hosted Funscript */
  useStashHostedFunscript?: InputMaybe<Scalars['Boolean']['input']>;
  /** Wall playback type */
  wallPlayback?: InputMaybe<Scalars['String']['input']>;
  /** Show title and tags in wall view */
  wallShowTitle?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ConfigInterfaceResult = {
  __typename?: 'ConfigInterfaceResult';
  /** If true, video will autostart on load in the scene player */
  autostartVideo?: Maybe<Scalars['Boolean']['output']>;
  /** If true, video will autostart when loading from play random or play selected */
  autostartVideoOnPlaySelected?: Maybe<Scalars['Boolean']['output']>;
  /** If true, next scene in playlist will be played at video end by default */
  continuePlaylistDefault?: Maybe<Scalars['Boolean']['output']>;
  /** Custom CSS */
  css?: Maybe<Scalars['String']['output']>;
  cssEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** Custom Locales */
  customLocales?: Maybe<Scalars['String']['output']>;
  customLocalesEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** When true, disables all customizations (plugins, CSS, JavaScript, locales) for troubleshooting */
  disableCustomizations?: Maybe<Scalars['Boolean']['output']>;
  /** Fields are true if creating via dropdown menus are disabled */
  disableDropdownCreate: ConfigDisableDropdownCreate;
  /** Funscript Time Offset */
  funscriptOffset?: Maybe<Scalars['Int']['output']>;
  /** Handy Connection Key */
  handyKey?: Maybe<Scalars['String']['output']>;
  imageLightbox: ConfigImageLightboxResult;
  /** Custom Javascript */
  javascript?: Maybe<Scalars['String']['output']>;
  javascriptEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** Interface language */
  language?: Maybe<Scalars['String']['output']>;
  /** Maximum duration (in seconds) in which a scene video will loop in the scene player */
  maximumLoopDuration?: Maybe<Scalars['Int']['output']>;
  /** Ordered list of items that should be shown in the menu */
  menuItems?: Maybe<Array<Scalars['String']['output']>>;
  /** True if we should not auto-open a browser window on startup */
  noBrowser?: Maybe<Scalars['Boolean']['output']>;
  /** True if we should send desktop notifications */
  notificationsEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** True if SFW content mode is enabled */
  sfwContentMode: Scalars['Boolean']['output'];
  /** Show scene scrubber by default */
  showScrubber?: Maybe<Scalars['Boolean']['output']>;
  /** If true, studio overlays will be shown as text instead of logo images */
  showStudioAsText?: Maybe<Scalars['Boolean']['output']>;
  /** Enable sound on mouseover previews */
  soundOnPreview?: Maybe<Scalars['Boolean']['output']>;
  /** Whether to use Stash Hosted Funscript */
  useStashHostedFunscript?: Maybe<Scalars['Boolean']['output']>;
  /** Wall playback type */
  wallPlayback?: Maybe<Scalars['String']['output']>;
  /** Show title and tags in wall view */
  wallShowTitle?: Maybe<Scalars['Boolean']['output']>;
};

/** All configuration settings */
export type ConfigResult = {
  __typename?: 'ConfigResult';
  defaults: ConfigDefaultSettingsResult;
  dlna: ConfigDlnaResult;
  general: ConfigGeneralResult;
  interface: ConfigInterfaceResult;
  plugins: Scalars['PluginConfigMap']['output'];
  scraping: ConfigScrapingResult;
  ui: Scalars['UIConfig']['output'];
};


/** All configuration settings */
export type ConfigResultPluginsArgs = {
  include?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type ConfigScrapingInput = {
  /** Tags blacklist during scraping */
  excludeTagPatterns?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Scraper CDP path. Path to chrome executable or remote address */
  scraperCDPPath?: InputMaybe<Scalars['String']['input']>;
  /** Whether the scraper should check for invalid certificates */
  scraperCertCheck?: InputMaybe<Scalars['Boolean']['input']>;
  /** Scraper user agent string */
  scraperUserAgent?: InputMaybe<Scalars['String']['input']>;
};

export type ConfigScrapingResult = {
  __typename?: 'ConfigScrapingResult';
  /** Tags blacklist during scraping */
  excludeTagPatterns: Array<Scalars['String']['output']>;
  /** Scraper CDP path. Path to chrome executable or remote address */
  scraperCDPPath?: Maybe<Scalars['String']['output']>;
  /** Whether the scraper should check for invalid certificates */
  scraperCertCheck: Scalars['Boolean']['output'];
  /** Scraper user agent string */
  scraperUserAgent?: Maybe<Scalars['String']['output']>;
};

export enum CriterionModifier {
  /** >= AND <= */
  Between = 'BETWEEN',
  /** = */
  Equals = 'EQUALS',
  Excludes = 'EXCLUDES',
  /** > */
  GreaterThan = 'GREATER_THAN',
  Includes = 'INCLUDES',
  /** INCLUDES ALL */
  IncludesAll = 'INCLUDES_ALL',
  /** IS NULL */
  IsNull = 'IS_NULL',
  /** < */
  LessThan = 'LESS_THAN',
  /** MATCHES REGEX */
  MatchesRegex = 'MATCHES_REGEX',
  /** < OR > */
  NotBetween = 'NOT_BETWEEN',
  /** != */
  NotEquals = 'NOT_EQUALS',
  /** NOT MATCHES REGEX */
  NotMatchesRegex = 'NOT_MATCHES_REGEX',
  /** IS NOT NULL */
  NotNull = 'NOT_NULL'
}

export type CustomFieldCriterionInput = {
  field: Scalars['String']['input'];
  modifier: CriterionModifier;
  value?: InputMaybe<Array<Scalars['Any']['input']>>;
};

export type CustomFieldsInput = {
  /** If populated, the entire custom fields map will be replaced with this value */
  full?: InputMaybe<Scalars['Map']['input']>;
  /** If populated, only the keys in this map will be updated */
  partial?: InputMaybe<Scalars['Map']['input']>;
  /** Remove any keys in this list */
  remove?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Dlnaip = {
  __typename?: 'DLNAIP';
  ipAddress: Scalars['String']['output'];
  /** Time until IP will be no longer allowed/disallowed */
  until?: Maybe<Scalars['Time']['output']>;
};

export type DlnaStatus = {
  __typename?: 'DLNAStatus';
  allowedIPAddresses: Array<Dlnaip>;
  recentIPAddresses: Array<Scalars['String']['output']>;
  running: Scalars['Boolean']['output'];
  /** If not currently running, time until it will be started. If running, time until it will be stopped */
  until?: Maybe<Scalars['Time']['output']>;
};

export type DateCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
  value2?: InputMaybe<Scalars['String']['input']>;
};

export type DestroyFilterInput = {
  id: Scalars['ID']['input'];
};

/** Directory structure of a path */
export type Directory = {
  __typename?: 'Directory';
  directories: Array<Scalars['String']['output']>;
  parent?: Maybe<Scalars['String']['output']>;
  path: Scalars['String']['output'];
};

export type DisableDlnaInput = {
  /** Duration to enable, in minutes. 0 or null for indefinite. */
  duration?: InputMaybe<Scalars['Int']['input']>;
};

export type EnableDlnaInput = {
  /** Duration to enable, in minutes. 0 or null for indefinite. */
  duration?: InputMaybe<Scalars['Int']['input']>;
};

export type ExportObjectTypeInput = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ExportObjectsInput = {
  galleries?: InputMaybe<ExportObjectTypeInput>;
  groups?: InputMaybe<ExportObjectTypeInput>;
  images?: InputMaybe<ExportObjectTypeInput>;
  includeDependencies?: InputMaybe<Scalars['Boolean']['input']>;
  /** @deprecated Use groups instead */
  movies?: InputMaybe<ExportObjectTypeInput>;
  performers?: InputMaybe<ExportObjectTypeInput>;
  scenes?: InputMaybe<ExportObjectTypeInput>;
  studios?: InputMaybe<ExportObjectTypeInput>;
  tags?: InputMaybe<ExportObjectTypeInput>;
};

export type FileDuplicationCriterionInput = {
  /** Currently unimplemented. Intended for phash distance matching. */
  distance?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated Use phash field instead */
  duplicated?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by phash duplication */
  phash?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FileFilterType = {
  AND?: InputMaybe<FileFilterType>;
  NOT?: InputMaybe<FileFilterType>;
  OR?: InputMaybe<FileFilterType>;
  basename?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  dir?: InputMaybe<StringCriterionInput>;
  /** Filter files by duplication criteria (only phash applies to files) */
  duplicated?: InputMaybe<FileDuplicationCriterionInput>;
  /** find files based on hash */
  hashes?: InputMaybe<Array<FingerprintFilterInput>>;
  /** Filter by modification time */
  mod_time?: InputMaybe<TimestampCriterionInput>;
  parent_folder?: InputMaybe<HierarchicalMultiCriterionInput>;
  path?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  zip_file?: InputMaybe<MultiCriterionInput>;
};

export type FileSetFingerprintsInput = {
  /** only supplied fingerprint types will be modified */
  fingerprints: Array<SetFingerprintsInput>;
  id: Scalars['ID']['input'];
};

export enum FilterMode {
  Audios = 'AUDIOS',
  Galleries = 'GALLERIES',
  Groups = 'GROUPS',
  Images = 'IMAGES',
  Movies = 'MOVIES',
  Performers = 'PERFORMERS',
  Scenes = 'SCENES',
  SceneMarkers = 'SCENE_MARKERS',
  Studios = 'STUDIOS',
  Tags = 'TAGS'
}

export type FindAudiosResultType = {
  __typename?: 'FindAudiosResultType';
  audios: Array<Audio>;
  count: Scalars['Int']['output'];
  /** Total duration in seconds */
  duration: Scalars['Float']['output'];
  /** Total file size in bytes */
  filesize: Scalars['Float']['output'];
};

export type FindFilesResultType = {
  __typename?: 'FindFilesResultType';
  count: Scalars['Int']['output'];
  /** Total duration in seconds of any video files */
  duration: Scalars['Float']['output'];
  files: Array<BaseFile>;
  /** Total megapixels of any image files */
  megapixels: Scalars['Float']['output'];
  /** Total file size in bytes */
  size: Scalars['Int']['output'];
};

export type FindFilterType = {
  direction?: InputMaybe<SortDirectionEnum>;
  page?: InputMaybe<Scalars['Int']['input']>;
  /** use per_page = -1 to indicate all results. Defaults to 25. */
  per_page?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type FindFoldersResultType = {
  __typename?: 'FindFoldersResultType';
  count: Scalars['Int']['output'];
  folders: Array<Folder>;
};

export type FindGroupsResultType = {
  __typename?: 'FindGroupsResultType';
  count: Scalars['Int']['output'];
  groups: Array<Group>;
};

export type FindJobInput = {
  id: Scalars['ID']['input'];
};

export type FindMoviesResultType = {
  __typename?: 'FindMoviesResultType';
  count: Scalars['Int']['output'];
  movies: Array<Movie>;
};

export type FindPerformersResultType = {
  __typename?: 'FindPerformersResultType';
  count: Scalars['Int']['output'];
  performers: Array<Performer>;
};

export type FindStudiosResultType = {
  __typename?: 'FindStudiosResultType';
  count: Scalars['Int']['output'];
  studios: Array<Studio>;
};

export type FindTagsResultType = {
  __typename?: 'FindTagsResultType';
  count: Scalars['Int']['output'];
  tags: Array<Tag>;
};

export type Fingerprint = {
  __typename?: 'Fingerprint';
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type FingerprintFilterInput = {
  /** Hamming distance - defaults to 0 */
  distance?: InputMaybe<Scalars['Int']['input']>;
  type: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type FloatCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['Float']['input'];
  value2?: InputMaybe<Scalars['Float']['input']>;
};

export type Folder = {
  __typename?: 'Folder';
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder?: Maybe<Folder>;
  /** @deprecated Use parent_folder instead */
  parent_folder_id?: Maybe<Scalars['ID']['output']>;
  /** Returns all parent folders in order from immediate parent to top-level */
  parent_folders: Array<Folder>;
  path: Scalars['String']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};

export type FolderFilterType = {
  AND?: InputMaybe<FolderFilterType>;
  NOT?: InputMaybe<FolderFilterType>;
  OR?: InputMaybe<FolderFilterType>;
  basename?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by files that meet this criteria */
  files_filter?: InputMaybe<FileFilterType>;
  /** Filter by modification time */
  mod_time?: InputMaybe<TimestampCriterionInput>;
  parent_folder?: InputMaybe<HierarchicalMultiCriterionInput>;
  path?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  zip_file?: InputMaybe<MultiCriterionInput>;
};

export type GalleryFile = BaseFile & {
  __typename?: 'GalleryFile';
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder: Folder;
  /** @deprecated Use parent_folder instead */
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


export type GalleryFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

export type GenderCriterionInput = {
  modifier: CriterionModifier;
  value?: InputMaybe<GenderEnum>;
  value_list?: InputMaybe<Array<GenderEnum>>;
};

export enum GenderEnum {
  Female = 'FEMALE',
  Intersex = 'INTERSEX',
  Male = 'MALE',
  NonBinary = 'NON_BINARY',
  TransgenderFemale = 'TRANSGENDER_FEMALE',
  TransgenderMale = 'TRANSGENDER_MALE'
}

export type GenerateApiKeyInput = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GenerateMetadataInput = {
  clipPreviews?: InputMaybe<Scalars['Boolean']['input']>;
  covers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate transcodes even if not required */
  forceTranscodes?: InputMaybe<Scalars['Boolean']['input']>;
  /** gallery ids to generate for */
  galleryIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** image ids to generate for */
  imageIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Generate image phashes during scan */
  imagePhashes?: InputMaybe<Scalars['Boolean']['input']>;
  imagePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  imageThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
  interactiveHeatmapsSpeeds?: InputMaybe<Scalars['Boolean']['input']>;
  /** marker ids to generate for */
  markerIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  markerImagePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  markerScreenshots?: InputMaybe<Scalars['Boolean']['input']>;
  markers?: InputMaybe<Scalars['Boolean']['input']>;
  /** overwrite existing media */
  overwrite?: InputMaybe<Scalars['Boolean']['input']>;
  /** paths to run generate on, in addition to the other ID lists */
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Generate video phashes during scan */
  phashes?: InputMaybe<Scalars['Boolean']['input']>;
  previewOptions?: InputMaybe<GeneratePreviewOptionsInput>;
  previews?: InputMaybe<Scalars['Boolean']['input']>;
  /** scene ids to generate for */
  sceneIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  sprites?: InputMaybe<Scalars['Boolean']['input']>;
  transcodes?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GenerateMetadataOptions = {
  __typename?: 'GenerateMetadataOptions';
  clipPreviews?: Maybe<Scalars['Boolean']['output']>;
  covers?: Maybe<Scalars['Boolean']['output']>;
  imagePreviews?: Maybe<Scalars['Boolean']['output']>;
  imageThumbnails?: Maybe<Scalars['Boolean']['output']>;
  interactiveHeatmapsSpeeds?: Maybe<Scalars['Boolean']['output']>;
  markerImagePreviews?: Maybe<Scalars['Boolean']['output']>;
  markerScreenshots?: Maybe<Scalars['Boolean']['output']>;
  markers?: Maybe<Scalars['Boolean']['output']>;
  phashes?: Maybe<Scalars['Boolean']['output']>;
  previewOptions?: Maybe<GeneratePreviewOptions>;
  previews?: Maybe<Scalars['Boolean']['output']>;
  sprites?: Maybe<Scalars['Boolean']['output']>;
  transcodes?: Maybe<Scalars['Boolean']['output']>;
};

export type GeneratePreviewOptions = {
  __typename?: 'GeneratePreviewOptions';
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd?: Maybe<Scalars['String']['output']>;
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart?: Maybe<Scalars['String']['output']>;
  /** Preset when generating preview */
  previewPreset?: Maybe<PreviewPreset>;
  /** Preview segment duration, in seconds */
  previewSegmentDuration?: Maybe<Scalars['Float']['output']>;
  /** Number of segments in a preview file */
  previewSegments?: Maybe<Scalars['Int']['output']>;
};

export type GeneratePreviewOptionsInput = {
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd?: InputMaybe<Scalars['String']['input']>;
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart?: InputMaybe<Scalars['String']['input']>;
  /** Preset when generating preview */
  previewPreset?: InputMaybe<PreviewPreset>;
  /** Preview segment duration, in seconds */
  previewSegmentDuration?: InputMaybe<Scalars['Float']['input']>;
  /** Number of segments in a preview file */
  previewSegments?: InputMaybe<Scalars['Int']['input']>;
};

export type Group = {
  __typename?: 'Group';
  aliases?: Maybe<Scalars['String']['output']>;
  audio_count: Scalars['Int']['output'];
  audios: Array<Audio>;
  back_image_path?: Maybe<Scalars['String']['output']>;
  containing_groups: Array<GroupDescription>;
  created_at: Scalars['Time']['output'];
  custom_fields: Scalars['Map']['output'];
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  /** Duration in seconds */
  duration?: Maybe<Scalars['Int']['output']>;
  front_image_path?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  performer_count: Scalars['Int']['output'];
  performers: Array<Performer>;
  rating100?: Maybe<Scalars['Int']['output']>;
  studio?: Maybe<Studio>;
  sub_group_count: Scalars['Int']['output'];
  sub_groups: Array<GroupDescription>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags: Array<Tag>;
  updated_at: Scalars['Time']['output'];
  urls: Array<Scalars['String']['output']>;
};


export type GroupAudio_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type GroupPerformer_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type GroupSub_Group_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};

export type GroupCreateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  audio_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  containing_groups?: InputMaybe<Array<GroupDescriptionInput>>;
  custom_fields?: InputMaybe<Scalars['Map']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  /** Duration in seconds */
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  sub_groups?: InputMaybe<Array<GroupDescriptionInput>>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** GroupDescription represents a relationship to a group with a description of the relationship */
export type GroupDescription = {
  __typename?: 'GroupDescription';
  description?: Maybe<Scalars['String']['output']>;
  group: Group;
};

export type GroupDescriptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  group_id: Scalars['ID']['input'];
};

export type GroupDestroyInput = {
  id: Scalars['ID']['input'];
};

export type GroupFilterType = {
  AND?: InputMaybe<GroupFilterType>;
  NOT?: InputMaybe<GroupFilterType>;
  OR?: InputMaybe<GroupFilterType>;
  /** Filter by number of containing groups the group has */
  containing_group_count?: InputMaybe<IntCriterionInput>;
  /** Filter by containing groups */
  containing_groups?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by custom fields */
  custom_fields?: InputMaybe<Array<CustomFieldCriterionInput>>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  director?: InputMaybe<StringCriterionInput>;
  /** Filter by duration (in seconds) */
  duration?: InputMaybe<IntCriterionInput>;
  /** Filter to only include groups missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter to only include groups where performer appears in an audio */
  performers?: InputMaybe<MultiCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter to only include groups with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  /** Filter by number of sub-groups the group has */
  sub_group_count?: InputMaybe<IntCriterionInput>;
  /** Filter by sub groups */
  sub_groups?: InputMaybe<HierarchicalMultiCriterionInput>;
  synopsis?: InputMaybe<StringCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include groups with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

export type GroupSubGroupAddInput = {
  containing_group_id: Scalars['ID']['input'];
  /** The index at which to insert the sub groups. If not provided, the sub groups will be appended to the end */
  insert_index?: InputMaybe<Scalars['Int']['input']>;
  sub_groups: Array<GroupDescriptionInput>;
};

export type GroupSubGroupRemoveInput = {
  containing_group_id: Scalars['ID']['input'];
  sub_group_ids: Array<Scalars['ID']['input']>;
};

export type GroupUpdateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  audio_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  containing_groups?: InputMaybe<Array<GroupDescriptionInput>>;
  custom_fields?: InputMaybe<CustomFieldsInput>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  sub_groups?: InputMaybe<Array<GroupDescriptionInput>>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum HashAlgorithm {
  Md5 = 'MD5',
  /** oshash */
  Oshash = 'OSHASH'
}

export type HierarchicalMultiCriterionInput = {
  depth?: InputMaybe<Scalars['Int']['input']>;
  excludes?: InputMaybe<Array<Scalars['ID']['input']>>;
  modifier: CriterionModifier;
  value?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type IdentifyFieldOptions = {
  __typename?: 'IdentifyFieldOptions';
  /** creates missing objects if needed - only applicable for performers, tags and studios */
  createMissing?: Maybe<Scalars['Boolean']['output']>;
  field: Scalars['String']['output'];
  strategy: IdentifyFieldStrategy;
};

export type IdentifyFieldOptionsInput = {
  /** creates missing objects if needed - only applicable for performers, tags and studios */
  createMissing?: InputMaybe<Scalars['Boolean']['input']>;
  field: Scalars['String']['input'];
  strategy: IdentifyFieldStrategy;
};

export enum IdentifyFieldStrategy {
  /** Never sets the field value */
  Ignore = 'IGNORE',
  /**
   * For multi-value fields, merge with existing.
   * For single-value fields, ignore if already set
   */
  Merge = 'MERGE',
  /**
   * Always replaces the value if a value is found.
   * For multi-value fields, any existing values are removed and replaced with the
   * scraped values.
   */
  Overwrite = 'OVERWRITE'
}

export type IdentifyMetadataInput = {
  /** Options defined here override the configured defaults */
  options?: InputMaybe<IdentifyMetadataOptionsInput>;
  /** paths of scenes to identify - ignored if scene ids are set */
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** scene ids to identify */
  sceneIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** An ordered list of sources to identify items with. Only the first source that finds a match is used. */
  sources: Array<IdentifySourceInput>;
};

export type IdentifyMetadataOptions = {
  __typename?: 'IdentifyMetadataOptions';
  /** any fields missing from here are defaulted to MERGE and createMissing false */
  fieldOptions?: Maybe<Array<IdentifyFieldOptions>>;
  /**
   * defaults to true if not provided
   * @deprecated Use performerGenders
   */
  includeMalePerformers?: Maybe<Scalars['Boolean']['output']>;
  /** Filter to only include performers with these genders. If not provided, all genders are included. */
  performerGenders?: Maybe<Array<GenderEnum>>;
  /** defaults to true if not provided */
  setCoverImage?: Maybe<Scalars['Boolean']['output']>;
  setOrganized?: Maybe<Scalars['Boolean']['output']>;
  /** tag to tag skipped multiple matches with */
  skipMultipleMatchTag?: Maybe<Scalars['String']['output']>;
  /** defaults to true if not provided */
  skipMultipleMatches?: Maybe<Scalars['Boolean']['output']>;
  /** tag to tag skipped single name performers with */
  skipSingleNamePerformerTag?: Maybe<Scalars['String']['output']>;
  /** defaults to true if not provided */
  skipSingleNamePerformers?: Maybe<Scalars['Boolean']['output']>;
};

export type IdentifyMetadataOptionsInput = {
  /** any fields missing from here are defaulted to MERGE and createMissing false */
  fieldOptions?: InputMaybe<Array<IdentifyFieldOptionsInput>>;
  /**
   * defaults to true if not provided
   * @deprecated Use performerGenders
   */
  includeMalePerformers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include performers with these genders. If not provided, all genders are included. */
  performerGenders?: InputMaybe<Array<GenderEnum>>;
  /** defaults to true if not provided */
  setCoverImage?: InputMaybe<Scalars['Boolean']['input']>;
  setOrganized?: InputMaybe<Scalars['Boolean']['input']>;
  /** tag to tag skipped multiple matches with */
  skipMultipleMatchTag?: InputMaybe<Scalars['String']['input']>;
  /** defaults to true if not provided */
  skipMultipleMatches?: InputMaybe<Scalars['Boolean']['input']>;
  /** tag to tag skipped single name performers with */
  skipSingleNamePerformerTag?: InputMaybe<Scalars['String']['input']>;
  /** defaults to true if not provided */
  skipSingleNamePerformers?: InputMaybe<Scalars['Boolean']['input']>;
};

export type IdentifyMetadataTaskOptions = {
  __typename?: 'IdentifyMetadataTaskOptions';
  /** Options defined here override the configured defaults */
  options?: Maybe<IdentifyMetadataOptions>;
  /** An ordered list of sources to identify items with. Only the first source that finds a match is used. */
  sources: Array<IdentifySource>;
};

export type IdentifySource = {
  __typename?: 'IdentifySource';
  /** Options defined for a source override the defaults */
  options?: Maybe<IdentifyMetadataOptions>;
  source: ScraperSource;
};

export type IdentifySourceInput = {
  /** Options defined for a source override the defaults */
  options?: InputMaybe<IdentifyMetadataOptionsInput>;
  source: ScraperSourceInput;
};

export type ImageFile = BaseFile & {
  __typename?: 'ImageFile';
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  format: Scalars['String']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder: Folder;
  /** @deprecated Use parent_folder instead */
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  width: Scalars['Int']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


export type ImageFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

export enum ImageLightboxDisplayMode {
  FitX = 'FIT_X',
  FitXy = 'FIT_XY',
  Original = 'ORIGINAL'
}

export enum ImageLightboxScrollMode {
  PanY = 'PAN_Y',
  Zoom = 'ZOOM'
}

export enum ImportDuplicateEnum {
  Fail = 'FAIL',
  Ignore = 'IGNORE',
  Overwrite = 'OVERWRITE'
}

export enum ImportMissingRefEnum {
  Create = 'CREATE',
  Fail = 'FAIL',
  Ignore = 'IGNORE'
}

export type ImportObjectsInput = {
  duplicateBehaviour: ImportDuplicateEnum;
  file: Scalars['Upload']['input'];
  missingRefBehaviour: ImportMissingRefEnum;
};

export type IntCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['Int']['input'];
  value2?: InputMaybe<Scalars['Int']['input']>;
};

export type Job = {
  __typename?: 'Job';
  addTime: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  endTime?: Maybe<Scalars['Time']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  progress?: Maybe<Scalars['Float']['output']>;
  startTime?: Maybe<Scalars['Time']['output']>;
  status: JobStatus;
  subTasks?: Maybe<Array<Scalars['String']['output']>>;
};

export enum JobStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Finished = 'FINISHED',
  Ready = 'READY',
  Running = 'RUNNING',
  Stopping = 'STOPPING'
}

export type JobStatusUpdate = {
  __typename?: 'JobStatusUpdate';
  job: Job;
  type: JobStatusUpdateType;
};

export enum JobStatusUpdateType {
  Add = 'ADD',
  Remove = 'REMOVE',
  Update = 'UPDATE'
}

export type LatestVersion = {
  __typename?: 'LatestVersion';
  release_date: Scalars['String']['output'];
  shorthash: Scalars['String']['output'];
  url: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type LogEntry = {
  __typename?: 'LogEntry';
  level: LogLevel;
  message: Scalars['String']['output'];
  time: Scalars['Time']['output'];
};

export enum LogLevel {
  Debug = 'Debug',
  Error = 'Error',
  Info = 'Info',
  Progress = 'Progress',
  Trace = 'Trace',
  Warning = 'Warning'
}

export type MigrateBlobsInput = {
  deleteOld?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MigrateInput = {
  backupPath: Scalars['String']['input'];
};

export type MigrateSceneScreenshotsInput = {
  deleteFiles?: InputMaybe<Scalars['Boolean']['input']>;
  overwriteExisting?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MoveFilesInput = {
  /** valid only for single file id. If empty, existing basename is used */
  destination_basename?: InputMaybe<Scalars['String']['input']>;
  /** valid for single or multiple file ids */
  destination_folder?: InputMaybe<Scalars['String']['input']>;
  /** valid for single or multiple file ids */
  destination_folder_id?: InputMaybe<Scalars['ID']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

export type Movie = {
  __typename?: 'Movie';
  aliases?: Maybe<Scalars['String']['output']>;
  audio_count: Scalars['Int']['output'];
  back_image_path?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  /** Duration in seconds */
  duration?: Maybe<Scalars['Int']['output']>;
  front_image_path?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rating100?: Maybe<Scalars['Int']['output']>;
  studio?: Maybe<Studio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags: Array<Tag>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls: Array<Scalars['String']['output']>;
};


export type MovieAudio_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};

export type MovieCreateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  /** Duration in seconds */
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MovieDestroyInput = {
  id: Scalars['ID']['input'];
};

export type MovieFilterType = {
  AND?: InputMaybe<MovieFilterType>;
  NOT?: InputMaybe<MovieFilterType>;
  OR?: InputMaybe<MovieFilterType>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  director?: InputMaybe<StringCriterionInput>;
  /** Filter by duration (in seconds) */
  duration?: InputMaybe<IntCriterionInput>;
  /** Filter to only include movies missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter to only include movies where performer appears in an audio */
  performers?: InputMaybe<MultiCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter to only include movies with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  synopsis?: InputMaybe<StringCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include movies with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

export type MovieUpdateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type MultiCriterionInput = {
  excludes?: InputMaybe<Array<Scalars['ID']['input']>>;
  modifier: CriterionModifier;
  value?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addGroupSubGroups: Scalars['Boolean']['output'];
  /** Anonymise the database in a separate file. Optionally returns a link to download the database file */
  anonymiseDatabase?: Maybe<Scalars['String']['output']>;
  audioAssignFile: Scalars['Boolean']['output'];
  audioCreate?: Maybe<Audio>;
  /** Decrements the o-counter for an audio. Returns the new value */
  audioDecrementO: Scalars['Int']['output'];
  audioDestroy: Scalars['Boolean']['output'];
  /** Increments the o-counter for an audio. Returns the new value */
  audioIncrementO: Scalars['Int']['output'];
  /** Increments the play count for the audio. Returns the new play count value. */
  audioIncrementPlayCount: Scalars['Int']['output'];
  /** Resets the o-counter for an audio to 0. Returns the new value */
  audioResetO: Scalars['Int']['output'];
  /** Sets the resume time point (if provided) and adds the provided duration to the audio's play duration */
  audioSaveActivity: Scalars['Boolean']['output'];
  audioUpdate?: Maybe<Audio>;
  audiosDestroy: Scalars['Boolean']['output'];
  audiosUpdate?: Maybe<Array<Maybe<Audio>>>;
  /** Backup the database. Optionally returns a link to download the database file */
  backupDatabase?: Maybe<Scalars['String']['output']>;
  bulkAudioUpdate?: Maybe<Array<Audio>>;
  bulkGroupUpdate?: Maybe<Array<Group>>;
  /** @deprecated Use bulkGroupUpdate instead */
  bulkMovieUpdate?: Maybe<Array<Movie>>;
  bulkPerformerUpdate?: Maybe<Array<Performer>>;
  bulkStudioUpdate?: Maybe<Array<Studio>>;
  bulkTagUpdate?: Maybe<Array<Tag>>;
  configureDLNA: ConfigDlnaResult;
  configureDefaults: ConfigDefaultSettingsResult;
  /** Change general configuration options */
  configureGeneral: ConfigGeneralResult;
  configureInterface: ConfigInterfaceResult;
  /** overwrites the entire plugin configuration for the given plugin */
  configurePlugin: Scalars['Map']['output'];
  configureScraping: ConfigScrapingResult;
  /**
   * overwrites the UI configuration
   * if input is provided, then the entire UI configuration is replaced
   * if partial is provided, then the partial UI configuration is merged into the existing UI configuration
   */
  configureUI: Scalars['UIConfig']['output'];
  /**
   * sets a single UI key value
   * key is a dot separated path to the value
   */
  configureUISetting: Scalars['Map']['output'];
  deleteFiles: Scalars['Boolean']['output'];
  /** Deletes file entries from the database without deleting the files from the filesystem */
  destroyFiles: Scalars['Boolean']['output'];
  destroySavedFilter: Scalars['Boolean']['output'];
  /** Downloads and installs ffmpeg and ffprobe binaries into the configuration directory. Returns the job ID. */
  downloadFFMpeg: Scalars['ID']['output'];
  /** DANGEROUS: Execute an arbitrary SQL statement without returning any rows. */
  execSQL: SqlExecResult;
  /** Returns a link to download the result */
  exportObjects?: Maybe<Scalars['String']['output']>;
  fileSetFingerprints: Scalars['Boolean']['output'];
  /** Generate and set (or clear) API key */
  generateAPIKey: Scalars['String']['output'];
  groupCreate?: Maybe<Group>;
  groupDestroy: Scalars['Boolean']['output'];
  groupUpdate?: Maybe<Group>;
  groupsDestroy: Scalars['Boolean']['output'];
  /** Performs an incremental import. Returns the job ID */
  importObjects: Scalars['ID']['output'];
  /**
   * Installs the given packages.
   * If a package is already installed, it will be updated if needed..
   * If an error occurs when installing a package, the job will continue to install the remaining packages.
   * Returns the job ID
   */
  installPackages: Scalars['ID']['output'];
  /** Start auto-tagging. Returns the job ID */
  metadataAutoTag: Scalars['ID']['output'];
  /** Clean metadata. Returns the job ID */
  metadataClean: Scalars['ID']['output'];
  /** Clean generated files. Returns the job ID */
  metadataCleanGenerated: Scalars['ID']['output'];
  /** Start a full export. Outputs to the metadata directory. Returns the job ID */
  metadataExport: Scalars['ID']['output'];
  /** Start generating content. Returns the job ID */
  metadataGenerate: Scalars['ID']['output'];
  /** Identifies content using scrapers. Returns the job ID */
  metadataIdentify: Scalars['ID']['output'];
  /** Start an full import. Completely wipes the database and imports from the metadata directory. Returns the job ID */
  metadataImport: Scalars['ID']['output'];
  /** Start a scan. Returns the job ID */
  metadataScan: Scalars['ID']['output'];
  /** Migrates the schema to the required version. Returns the job ID */
  migrate: Scalars['ID']['output'];
  /** Migrates blobs from the old storage system to the current one */
  migrateBlobs: Scalars['ID']['output'];
  /**
   * Moves the given files to the given destination. Returns true if successful.
   * Either the destination_folder or destination_folder_id must be provided.
   * If both are provided, the destination_folder_id takes precedence.
   * Destination folder must be a subfolder of one of the stash library paths.
   * If provided, destination_basename must be a valid filename with an extension that
   * matches one of the media extensions.
   * Creates folder hierarchy if needed.
   */
  moveFiles: Scalars['Boolean']['output'];
  /** @deprecated Use groupCreate instead */
  movieCreate?: Maybe<Movie>;
  /** @deprecated Use groupDestroy instead */
  movieDestroy: Scalars['Boolean']['output'];
  /** @deprecated Use groupUpdate instead */
  movieUpdate?: Maybe<Movie>;
  /** @deprecated Use groupsDestroy instead */
  moviesDestroy: Scalars['Boolean']['output'];
  /** Optimises the database. Returns the job ID */
  optimiseDatabase: Scalars['ID']['output'];
  performerCreate?: Maybe<Performer>;
  performerDestroy: Scalars['Boolean']['output'];
  performerMerge: Performer;
  performerUpdate?: Maybe<Performer>;
  performersDestroy: Scalars['Boolean']['output'];
  /** DANGEROUS: Execute an arbitrary SQL statement that returns rows. */
  querySQL: SqlQueryResult;
  reloadPlugins: Scalars['Boolean']['output'];
  /** Reload scrapers */
  reloadScrapers: Scalars['Boolean']['output'];
  removeGroupSubGroups: Scalars['Boolean']['output'];
  /** Reorder sub groups within a group. Returns true if successful. */
  reorderSubGroups: Scalars['Boolean']['output'];
  /** Reveal the file in the system file manager */
  revealFileInFileManager: Scalars['Boolean']['output'];
  /** Reveal the folder in the system file manager */
  revealFolderInFileManager: Scalars['Boolean']['output'];
  /**
   * Runs a plugin operation. The operation is run immediately and does not use the job queue.
   * Returns a map of the result.
   */
  runPluginOperation?: Maybe<Scalars['Any']['output']>;
  /**
   * Run a plugin task.
   * If task_name is provided, then the task must exist in the plugin config and the tasks configuration
   * will be used to run the plugin.
   * If no task_name is provided, then the plugin will be executed with the arguments provided only.
   * Returns the job ID
   */
  runPluginTask: Scalars['ID']['output'];
  saveFilter: SavedFilter;
  /** @deprecated now uses UI config */
  setDefaultFilter: Scalars['Boolean']['output'];
  /**
   * Enable/disable plugins - enabledMap is a map of plugin IDs to enabled booleans.
   * Plugins not in the map are not affected.
   */
  setPluginsEnabled: Scalars['Boolean']['output'];
  setup: Scalars['Boolean']['output'];
  /** Run batch performer tag task. Returns the job ID. */
  stashBoxBatchPerformerTag: Scalars['String']['output'];
  /** Run batch studio tag task. Returns the job ID. */
  stashBoxBatchStudioTag: Scalars['String']['output'];
  /** Run batch tag tag task. Returns the job ID. */
  stashBoxBatchTagTag: Scalars['String']['output'];
  stopAllJobs: Scalars['Boolean']['output'];
  stopJob: Scalars['Boolean']['output'];
  studioCreate?: Maybe<Studio>;
  studioDestroy: Scalars['Boolean']['output'];
  studioUpdate?: Maybe<Studio>;
  studiosDestroy: Scalars['Boolean']['output'];
  /** Submit fingerprints to stash-box instance */
  submitStashBoxFingerprints: Scalars['Boolean']['output'];
  /** Submit performer as draft to stash-box instance */
  submitStashBoxPerformerDraft?: Maybe<Scalars['ID']['output']>;
  tagCreate?: Maybe<Tag>;
  tagDestroy: Scalars['Boolean']['output'];
  tagUpdate?: Maybe<Tag>;
  tagsDestroy: Scalars['Boolean']['output'];
  tagsMerge?: Maybe<Tag>;
  /**
   * Uninstalls the given packages.
   * If an error occurs when uninstalling a package, the job will continue to uninstall the remaining packages.
   * Returns the job ID
   */
  uninstallPackages: Scalars['ID']['output'];
  /**
   * Updates the given packages.
   * If a package is not installed, it will not be updated.
   * If a package does not need to be updated, it will not be updated.
   * If no packages are provided, all packages of the given type will be updated.
   * If an error occurs when updating a package, the job will continue to update the remaining packages.
   * Returns the job ID.
   */
  updatePackages: Scalars['ID']['output'];
};


export type MutationAddGroupSubGroupsArgs = {
  input: GroupSubGroupAddInput;
};


export type MutationAnonymiseDatabaseArgs = {
  input: AnonymiseDatabaseInput;
};


export type MutationAudioAssignFileArgs = {
  input: AssignAudioFileInput;
};


export type MutationAudioCreateArgs = {
  input: AudioCreateInput;
};


export type MutationAudioDecrementOArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAudioDestroyArgs = {
  input: AudioDestroyInput;
};


export type MutationAudioIncrementOArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAudioIncrementPlayCountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAudioResetOArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAudioSaveActivityArgs = {
  id: Scalars['ID']['input'];
  playDuration?: InputMaybe<Scalars['Float']['input']>;
  resume_time?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationAudioUpdateArgs = {
  input: AudioUpdateInput;
};


export type MutationAudiosDestroyArgs = {
  input: AudiosDestroyInput;
};


export type MutationAudiosUpdateArgs = {
  input: Array<AudioUpdateInput>;
};


export type MutationBackupDatabaseArgs = {
  input: BackupDatabaseInput;
};


export type MutationBulkAudioUpdateArgs = {
  input: BulkAudioUpdateInput;
};


export type MutationBulkGroupUpdateArgs = {
  input: BulkGroupUpdateInput;
};


export type MutationBulkMovieUpdateArgs = {
  input: BulkMovieUpdateInput;
};


export type MutationBulkPerformerUpdateArgs = {
  input: BulkPerformerUpdateInput;
};


export type MutationBulkStudioUpdateArgs = {
  input: BulkStudioUpdateInput;
};


export type MutationBulkTagUpdateArgs = {
  input: BulkTagUpdateInput;
};


export type MutationConfigureDlnaArgs = {
  input: ConfigDlnaInput;
};


export type MutationConfigureDefaultsArgs = {
  input: ConfigDefaultSettingsInput;
};


export type MutationConfigureGeneralArgs = {
  input: ConfigGeneralInput;
};


export type MutationConfigureInterfaceArgs = {
  input: ConfigInterfaceInput;
};


export type MutationConfigurePluginArgs = {
  input: Scalars['Map']['input'];
  plugin_id: Scalars['ID']['input'];
};


export type MutationConfigureScrapingArgs = {
  input: ConfigScrapingInput;
};


export type MutationConfigureUiArgs = {
  input?: InputMaybe<Scalars['Map']['input']>;
  partial?: InputMaybe<Scalars['Map']['input']>;
};


export type MutationConfigureUiSettingArgs = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
};


export type MutationDeleteFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationDestroyFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationDestroySavedFilterArgs = {
  input: DestroyFilterInput;
};


export type MutationExecSqlArgs = {
  args?: InputMaybe<Array<InputMaybe<Scalars['Any']['input']>>>;
  sql: Scalars['String']['input'];
};


export type MutationExportObjectsArgs = {
  input: ExportObjectsInput;
};


export type MutationFileSetFingerprintsArgs = {
  input: FileSetFingerprintsInput;
};


export type MutationGenerateApiKeyArgs = {
  input: GenerateApiKeyInput;
};


export type MutationGroupCreateArgs = {
  input: GroupCreateInput;
};


export type MutationGroupDestroyArgs = {
  input: GroupDestroyInput;
};


export type MutationGroupUpdateArgs = {
  input: GroupUpdateInput;
};


export type MutationGroupsDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationImportObjectsArgs = {
  input: ImportObjectsInput;
};


export type MutationInstallPackagesArgs = {
  packages: Array<PackageSpecInput>;
  type: PackageType;
};


export type MutationMetadataAutoTagArgs = {
  input: AutoTagMetadataInput;
};


export type MutationMetadataCleanArgs = {
  input: CleanMetadataInput;
};


export type MutationMetadataCleanGeneratedArgs = {
  input: CleanGeneratedInput;
};


export type MutationMetadataGenerateArgs = {
  input: GenerateMetadataInput;
};


export type MutationMetadataIdentifyArgs = {
  input: IdentifyMetadataInput;
};


export type MutationMetadataScanArgs = {
  input: ScanMetadataInput;
};


export type MutationMigrateArgs = {
  input: MigrateInput;
};


export type MutationMigrateBlobsArgs = {
  input: MigrateBlobsInput;
};


export type MutationMoveFilesArgs = {
  input: MoveFilesInput;
};


export type MutationMovieCreateArgs = {
  input: MovieCreateInput;
};


export type MutationMovieDestroyArgs = {
  input: MovieDestroyInput;
};


export type MutationMovieUpdateArgs = {
  input: MovieUpdateInput;
};


export type MutationMoviesDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationPerformerCreateArgs = {
  input: PerformerCreateInput;
};


export type MutationPerformerDestroyArgs = {
  input: PerformerDestroyInput;
};


export type MutationPerformerMergeArgs = {
  input: PerformerMergeInput;
};


export type MutationPerformerUpdateArgs = {
  input: PerformerUpdateInput;
};


export type MutationPerformersDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationQuerySqlArgs = {
  args?: InputMaybe<Array<InputMaybe<Scalars['Any']['input']>>>;
  sql: Scalars['String']['input'];
};


export type MutationRemoveGroupSubGroupsArgs = {
  input: GroupSubGroupRemoveInput;
};


export type MutationReorderSubGroupsArgs = {
  input: ReorderSubGroupsInput;
};


export type MutationRevealFileInFileManagerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRevealFolderInFileManagerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRunPluginOperationArgs = {
  args?: InputMaybe<Scalars['Map']['input']>;
  plugin_id: Scalars['ID']['input'];
};


export type MutationRunPluginTaskArgs = {
  args?: InputMaybe<Array<PluginArgInput>>;
  args_map?: InputMaybe<Scalars['Map']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  plugin_id: Scalars['ID']['input'];
  task_name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSaveFilterArgs = {
  input: SaveFilterInput;
};


export type MutationSetDefaultFilterArgs = {
  input: SetDefaultFilterInput;
};


export type MutationSetPluginsEnabledArgs = {
  enabledMap: Scalars['BoolMap']['input'];
};


export type MutationSetupArgs = {
  input: SetupInput;
};


export type MutationStashBoxBatchPerformerTagArgs = {
  input: StashBoxBatchTagInput;
};


export type MutationStashBoxBatchStudioTagArgs = {
  input: StashBoxBatchTagInput;
};


export type MutationStashBoxBatchTagTagArgs = {
  input: StashBoxBatchTagInput;
};


export type MutationStopJobArgs = {
  job_id: Scalars['ID']['input'];
};


export type MutationStudioCreateArgs = {
  input: StudioCreateInput;
};


export type MutationStudioDestroyArgs = {
  input: StudioDestroyInput;
};


export type MutationStudioUpdateArgs = {
  input: StudioUpdateInput;
};


export type MutationStudiosDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationSubmitStashBoxFingerprintsArgs = {
  input: StashBoxFingerprintSubmissionInput;
};


export type MutationSubmitStashBoxPerformerDraftArgs = {
  input: StashBoxDraftSubmissionInput;
};


export type MutationTagCreateArgs = {
  input: TagCreateInput;
};


export type MutationTagDestroyArgs = {
  input: TagDestroyInput;
};


export type MutationTagUpdateArgs = {
  input: TagUpdateInput;
};


export type MutationTagsDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationTagsMergeArgs = {
  input: TagsMergeInput;
};


export type MutationUninstallPackagesArgs = {
  packages: Array<PackageSpecInput>;
  type: PackageType;
};


export type MutationUpdatePackagesArgs = {
  packages?: InputMaybe<Array<PackageSpecInput>>;
  type: PackageType;
};

export type Package = {
  __typename?: 'Package';
  date?: Maybe<Scalars['Timestamp']['output']>;
  metadata: Scalars['Map']['output'];
  name: Scalars['String']['output'];
  package_id: Scalars['String']['output'];
  requires: Array<Package>;
  sourceURL: Scalars['String']['output'];
  /** The version of this package currently available from the remote source */
  source_package?: Maybe<Package>;
  version?: Maybe<Scalars['String']['output']>;
};

export type PackageSource = {
  __typename?: 'PackageSource';
  local_path?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type PackageSourceInput = {
  local_path?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type PackageSpecInput = {
  id: Scalars['String']['input'];
  sourceURL: Scalars['String']['input'];
};

export enum PackageType {
  Plugin = 'Plugin',
  Scraper = 'Scraper'
}

export type Performer = {
  __typename?: 'Performer';
  alias_list: Array<Scalars['String']['output']>;
  audio_count: Scalars['Int']['output'];
  birthdate?: Maybe<Scalars['String']['output']>;
  career_end?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use career_start and career_end */
  career_length?: Maybe<Scalars['String']['output']>;
  career_start?: Maybe<Scalars['Int']['output']>;
  circumcised?: Maybe<CircumisedEnum>;
  country?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  custom_fields: Scalars['Map']['output'];
  death_date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  disambiguation?: Maybe<Scalars['String']['output']>;
  ethnicity?: Maybe<Scalars['String']['output']>;
  eye_color?: Maybe<Scalars['String']['output']>;
  fake_tits?: Maybe<Scalars['String']['output']>;
  favorite: Scalars['Boolean']['output'];
  gender?: Maybe<GenderEnum>;
  group_count: Scalars['Int']['output'];
  groups: Array<Group>;
  hair_color?: Maybe<Scalars['String']['output']>;
  height_cm?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  ignore_auto_tag: Scalars['Boolean']['output'];
  image_path?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use urls */
  instagram?: Maybe<Scalars['String']['output']>;
  measurements?: Maybe<Scalars['String']['output']>;
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  /** @deprecated use groups instead */
  movies: Array<Movie>;
  name: Scalars['String']['output'];
  penis_length?: Maybe<Scalars['Float']['output']>;
  performer_count: Scalars['Int']['output'];
  piercings?: Maybe<Scalars['String']['output']>;
  rating100?: Maybe<Scalars['Int']['output']>;
  stash_ids: Array<StashId>;
  tags: Array<Tag>;
  tattoos?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use urls */
  twitter?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
  weight?: Maybe<Scalars['Int']['output']>;
};

export type PerformerCreateInput = {
  /** Duplicate aliases and those equal to name will be ignored (case-insensitive) */
  alias_list?: InputMaybe<Array<Scalars['String']['input']>>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_end?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated Use career_start and career_end */
  career_length?: InputMaybe<Scalars['String']['input']>;
  career_start?: InputMaybe<Scalars['Int']['input']>;
  circumcised?: InputMaybe<CircumisedEnum>;
  country?: InputMaybe<Scalars['String']['input']>;
  custom_fields?: InputMaybe<Scalars['Map']['input']>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  gender?: InputMaybe<GenderEnum>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Int']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  penis_length?: InputMaybe<Scalars['Float']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type PerformerDestroyInput = {
  id: Scalars['ID']['input'];
};

export type PerformerFilterType = {
  AND?: InputMaybe<PerformerFilterType>;
  NOT?: InputMaybe<PerformerFilterType>;
  OR?: InputMaybe<PerformerFilterType>;
  /** Filter by age */
  age?: InputMaybe<IntCriterionInput>;
  /** Filter by aliases */
  aliases?: InputMaybe<StringCriterionInput>;
  /** Filter by audio count */
  audio_count?: InputMaybe<IntCriterionInput>;
  /** Filter by birth year */
  birth_year?: InputMaybe<IntCriterionInput>;
  /** Filter by birthdate */
  birthdate?: InputMaybe<DateCriterionInput>;
  /** Filter by career end year */
  career_end?: InputMaybe<IntCriterionInput>;
  /**
   * Deprecated: use career_start and career_end. This filter is non-functional.
   * @deprecated Use career_start and career_end
   */
  career_length?: InputMaybe<StringCriterionInput>;
  /** Filter by career start year */
  career_start?: InputMaybe<IntCriterionInput>;
  /** Filter by ciricumcision */
  circumcised?: InputMaybe<CircumcisionCriterionInput>;
  /** Filter by country */
  country?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  custom_fields?: InputMaybe<Array<CustomFieldCriterionInput>>;
  /** Filter by death date */
  death_date?: InputMaybe<DateCriterionInput>;
  /** Filter by death year */
  death_year?: InputMaybe<IntCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  disambiguation?: InputMaybe<StringCriterionInput>;
  /** Filter by ethnicity */
  ethnicity?: InputMaybe<StringCriterionInput>;
  /** Filter by eye color */
  eye_color?: InputMaybe<StringCriterionInput>;
  /** Filter by fake tits value */
  fake_tits?: InputMaybe<StringCriterionInput>;
  /** Filter by favorite */
  filter_favorites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by gender */
  gender?: InputMaybe<GenderCriterionInput>;
  /** Filter by group count */
  group_count?: InputMaybe<IntCriterionInput>;
  /** Filter by groups the performer belongs to */
  groups?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by hair color */
  hair_color?: InputMaybe<StringCriterionInput>;
  /** Filter by height in cm */
  height_cm?: InputMaybe<IntCriterionInput>;
  /** Filter by autotag ignore value */
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include performers missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by measurements */
  measurements?: InputMaybe<StringCriterionInput>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter by penis length value */
  penis_length?: InputMaybe<FloatCriterionInput>;
  /** Filter by performers who appear together in audio */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by piercings */
  piercings?: InputMaybe<StringCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /**
   * Filter by StashID
   * @deprecated use stash_ids_endpoint instead
   */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter by StashIDs */
  stash_ids_endpoint?: InputMaybe<StashIDsCriterionInput>;
  /** Filter by studios where performer appears in audio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include performers with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related tags that meet this criteria */
  tags_filter?: InputMaybe<TagFilterType>;
  /** Filter by tattoos */
  tattoos?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
  /** Filter by weight */
  weight?: InputMaybe<IntCriterionInput>;
};

export type PerformerMergeInput = {
  destination: Scalars['ID']['input'];
  source: Array<Scalars['ID']['input']>;
  values?: InputMaybe<PerformerUpdateInput>;
};

export type PerformerUpdateInput = {
  /** Duplicate aliases and those equal to name will be ignored (case-insensitive) */
  alias_list?: InputMaybe<Array<Scalars['String']['input']>>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_end?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated Use career_start and career_end */
  career_length?: InputMaybe<Scalars['String']['input']>;
  career_start?: InputMaybe<Scalars['Int']['input']>;
  circumcised?: InputMaybe<CircumisedEnum>;
  country?: InputMaybe<Scalars['String']['input']>;
  custom_fields?: InputMaybe<CustomFieldsInput>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  gender?: InputMaybe<GenderEnum>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  penis_length?: InputMaybe<Scalars['Float']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type Plugin = {
  __typename?: 'Plugin';
  description?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  hooks?: Maybe<Array<PluginHook>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  paths: PluginPaths;
  /**
   * Plugin IDs of plugins that this plugin depends on.
   * Applies only for UI plugins to indicate css/javascript load order.
   */
  requires?: Maybe<Array<Scalars['ID']['output']>>;
  settings?: Maybe<Array<PluginSetting>>;
  tasks?: Maybe<Array<PluginTask>>;
  url?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

export type PluginArgInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<PluginValueInput>;
};

export type PluginHook = {
  __typename?: 'PluginHook';
  description?: Maybe<Scalars['String']['output']>;
  hooks?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  plugin: Plugin;
};

export type PluginPaths = {
  __typename?: 'PluginPaths';
  css?: Maybe<Array<Scalars['String']['output']>>;
  javascript?: Maybe<Array<Scalars['String']['output']>>;
};

export type PluginResult = {
  __typename?: 'PluginResult';
  error?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
};

export type PluginSetting = {
  __typename?: 'PluginSetting';
  description?: Maybe<Scalars['String']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: PluginSettingTypeEnum;
};

export enum PluginSettingTypeEnum {
  Boolean = 'BOOLEAN',
  Number = 'NUMBER',
  String = 'STRING'
}

export type PluginTask = {
  __typename?: 'PluginTask';
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  plugin: Plugin;
};

export type PluginValueInput = {
  a?: InputMaybe<Array<PluginValueInput>>;
  b?: InputMaybe<Scalars['Boolean']['input']>;
  f?: InputMaybe<Scalars['Float']['input']>;
  i?: InputMaybe<Scalars['Int']['input']>;
  o?: InputMaybe<Array<PluginArgInput>>;
  str?: InputMaybe<Scalars['String']['input']>;
};

export enum PreviewPreset {
  /** X264_FAST */
  Fast = 'fast',
  /** X264_MEDIUM */
  Medium = 'medium',
  /** X264_SLOW */
  Slow = 'slow',
  /** X264_SLOWER */
  Slower = 'slower',
  /** X264_ULTRAFAST */
  Ultrafast = 'ultrafast',
  /** X264_VERYFAST */
  Veryfast = 'veryfast',
  /** X264_VERYSLOW */
  Veryslow = 'veryslow'
}

/** The query root for this schema */
export type Query = {
  __typename?: 'Query';
  /** @deprecated Use findGroups instead */
  allMovies: Array<Movie>;
  allPerformers: Array<Performer>;
  /** @deprecated Use findStudios instead */
  allStudios: Array<Studio>;
  /** @deprecated Use findTags instead */
  allTags: Array<Tag>;
  /** List available packages */
  availablePackages: Array<Package>;
  /** Returns the current, complete configuration */
  configuration: ConfigResult;
  /** Returns an array of paths for the given path */
  directory: Directory;
  /** Find an audio by ID or Checksum */
  findAudio?: Maybe<Audio>;
  /** A function which queries Audio objects */
  findAudios: FindAudiosResultType;
  findAudiosByPathRegex: FindAudiosResultType;
  /** @deprecated default filter now stored in UI config */
  findDefaultFilter?: Maybe<SavedFilter>;
  /** Find a file by its id or path */
  findFile: BaseFile;
  /** Queries for Files */
  findFiles: FindFilesResultType;
  /** Find a file by its id or path */
  findFolder: Folder;
  /** Queries for Files */
  findFolders: FindFoldersResultType;
  /** Find a group by ID */
  findGroup?: Maybe<Group>;
  /** A function which queries Group objects */
  findGroups: FindGroupsResultType;
  findJob?: Maybe<Job>;
  /**
   * Find a movie by ID
   * @deprecated Use findGroup instead
   */
  findMovie?: Maybe<Movie>;
  /**
   * A function which queries Movie objects
   * @deprecated Use findGroups instead
   */
  findMovies: FindMoviesResultType;
  /** Find a performer by ID */
  findPerformer?: Maybe<Performer>;
  /** A function which queries Performer objects */
  findPerformers: FindPerformersResultType;
  findSavedFilter?: Maybe<SavedFilter>;
  findSavedFilters: Array<SavedFilter>;
  /** Find a studio by ID */
  findStudio?: Maybe<Studio>;
  /** A function which queries Studio objects */
  findStudios: FindStudiosResultType;
  findTag?: Maybe<Tag>;
  findTags: FindTagsResultType;
  /** List installed packages */
  installedPackages: Array<Package>;
  jobQueue?: Maybe<Array<Job>>;
  latestversion: LatestVersion;
  /** List available scrapers */
  listScrapers: Array<Scraper>;
  logs: Array<LogEntry>;
  /** List available plugin operations */
  pluginTasks?: Maybe<Array<PluginTask>>;
  /** List loaded plugins */
  plugins?: Maybe<Array<Plugin>>;
  /** Scrapes a complete group record based on a URL */
  scrapeGroupURL?: Maybe<ScrapedGroup>;
  /**
   * Scrapes a complete movie record based on a URL
   * @deprecated Use scrapeGroupURL instead
   */
  scrapeMovieURL?: Maybe<ScrapedMovie>;
  /** Scrape for multiple performers */
  scrapeMultiPerformers: Array<Array<ScrapedPerformer>>;
  /** Scrapes a complete performer record based on a URL */
  scrapePerformerURL?: Maybe<ScrapedPerformer>;
  /** Scrape for a single group */
  scrapeSingleGroup: Array<ScrapedGroup>;
  /**
   * Scrape for a single movie
   * @deprecated Use scrapeSingleGroup instead
   */
  scrapeSingleMovie: Array<ScrapedMovie>;
  /** Scrape for a single performer */
  scrapeSinglePerformer: Array<ScrapedPerformer>;
  /** Scrape for a single studio */
  scrapeSingleStudio: Array<ScrapedStudio>;
  /** Scrape for a single tag */
  scrapeSingleTag: Array<ScrapedTag>;
  /** Scrapes content based on a URL */
  scrapeURL?: Maybe<ScrapedContent>;
  /** Get stats */
  stats: StatsResultType;
  systemStatus: SystemStatus;
  validateStashBoxCredentials: StashBoxValidationResult;
  version: Version;
};


/** The query root for this schema */
export type QueryAvailablePackagesArgs = {
  source: Scalars['String']['input'];
  type: PackageType;
};


/** The query root for this schema */
export type QueryDirectoryArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
export type QueryFindAudioArgs = {
  checksum?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** The query root for this schema */
export type QueryFindAudiosArgs = {
  audio_filter?: InputMaybe<AudioFilterType>;
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** The query root for this schema */
export type QueryFindAudiosByPathRegexArgs = {
  filter?: InputMaybe<FindFilterType>;
};


/** The query root for this schema */
export type QueryFindDefaultFilterArgs = {
  mode: FilterMode;
};


/** The query root for this schema */
export type QueryFindFileArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
export type QueryFindFilesArgs = {
  file_filter?: InputMaybe<FileFilterType>;
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** The query root for this schema */
export type QueryFindFolderArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
export type QueryFindFoldersArgs = {
  filter?: InputMaybe<FindFilterType>;
  folder_filter?: InputMaybe<FolderFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** The query root for this schema */
export type QueryFindGroupArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
export type QueryFindGroupsArgs = {
  filter?: InputMaybe<FindFilterType>;
  group_filter?: InputMaybe<GroupFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** The query root for this schema */
export type QueryFindJobArgs = {
  input: FindJobInput;
};


/** The query root for this schema */
export type QueryFindMovieArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
export type QueryFindMoviesArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  movie_filter?: InputMaybe<MovieFilterType>;
};


/** The query root for this schema */
export type QueryFindPerformerArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
export type QueryFindPerformersArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  performer_filter?: InputMaybe<PerformerFilterType>;
  performer_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};


/** The query root for this schema */
export type QueryFindSavedFilterArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
export type QueryFindSavedFiltersArgs = {
  mode?: InputMaybe<FilterMode>;
};


/** The query root for this schema */
export type QueryFindStudioArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
export type QueryFindStudiosArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  studio_filter?: InputMaybe<StudioFilterType>;
};


/** The query root for this schema */
export type QueryFindTagArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
export type QueryFindTagsArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  tag_filter?: InputMaybe<TagFilterType>;
};


/** The query root for this schema */
export type QueryInstalledPackagesArgs = {
  type: PackageType;
};


/** The query root for this schema */
export type QueryListScrapersArgs = {
  types: Array<ScrapeContentType>;
};


/** The query root for this schema */
export type QueryScrapeGroupUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
export type QueryScrapeMovieUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
export type QueryScrapeMultiPerformersArgs = {
  input: ScrapeMultiPerformersInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
export type QueryScrapePerformerUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
export type QueryScrapeSingleGroupArgs = {
  input: ScrapeSingleGroupInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
export type QueryScrapeSingleMovieArgs = {
  input: ScrapeSingleMovieInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
export type QueryScrapeSinglePerformerArgs = {
  input: ScrapeSinglePerformerInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
export type QueryScrapeSingleStudioArgs = {
  input: ScrapeSingleStudioInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
export type QueryScrapeSingleTagArgs = {
  input: ScrapeSingleTagInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
export type QueryScrapeUrlArgs = {
  ty: ScrapeContentType;
  url: Scalars['String']['input'];
};


/** The query root for this schema */
export type QueryValidateStashBoxCredentialsArgs = {
  input: StashBoxInput;
};

export type RemoveTempDlnaipInput = {
  address: Scalars['String']['input'];
};

export type ReorderSubGroupsInput = {
  /** ID of the group to reorder sub groups for */
  group_id: Scalars['ID']['input'];
  /** If true, the sub groups will be inserted after the insert_index, otherwise they will be inserted before */
  insert_after?: InputMaybe<Scalars['Boolean']['input']>;
  /** The sub-group ID at which to insert the sub groups */
  insert_at_id: Scalars['ID']['input'];
  /**
   * IDs of the sub groups to reorder. These must be a subset of the current sub groups.
   * Sub groups will be inserted in this order at the insert_index
   */
  sub_group_ids: Array<Scalars['ID']['input']>;
};

export type SqlExecResult = {
  __typename?: 'SQLExecResult';
  /**
   * The integer generated by the database in response to a command.
   * Typically this will be from an "auto increment" column when inserting a new row.
   * Not all databases support this feature, and the syntax of such statements varies.
   */
  last_insert_id?: Maybe<Scalars['Int64']['output']>;
  /**
   * The number of rows affected by the query, usually an UPDATE, INSERT, or DELETE.
   * Not all queries or databases support this feature.
   */
  rows_affected?: Maybe<Scalars['Int64']['output']>;
};

export type SqlQueryResult = {
  __typename?: 'SQLQueryResult';
  /** The column names, in the order they appear in the result set. */
  columns: Array<Scalars['String']['output']>;
  /** The returned rows. */
  rows: Array<Array<Maybe<Scalars['Any']['output']>>>;
};

export type SaveFilterInput = {
  find_filter?: InputMaybe<FindFilterType>;
  /** provide ID to overwrite existing filter */
  id?: InputMaybe<Scalars['ID']['input']>;
  mode: FilterMode;
  name: Scalars['String']['input'];
  object_filter?: InputMaybe<Scalars['SavedObjectFilter']['input']>;
  ui_options?: InputMaybe<Scalars['SavedUIOptions']['input']>;
};

export type SavedFilter = {
  __typename?: 'SavedFilter';
  /**
   * JSON-encoded filter string
   * @deprecated use find_filter and object_filter instead
   */
  filter: Scalars['String']['output'];
  find_filter?: Maybe<SavedFindFilterType>;
  id: Scalars['ID']['output'];
  mode: FilterMode;
  name: Scalars['String']['output'];
  object_filter?: Maybe<Scalars['SavedObjectFilter']['output']>;
  ui_options?: Maybe<Scalars['SavedUIOptions']['output']>;
};

export type SavedFindFilterType = {
  __typename?: 'SavedFindFilterType';
  direction?: Maybe<SortDirectionEnum>;
  page?: Maybe<Scalars['Int']['output']>;
  /** use per_page = -1 to indicate all results. Defaults to 25. */
  per_page?: Maybe<Scalars['Int']['output']>;
  q?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['String']['output']>;
};

/** Filter options for meta data scannning */
export type ScanMetaDataFilterInput = {
  /** If set, files with a modification time before this time point are ignored by the scan */
  minModTime?: InputMaybe<Scalars['Timestamp']['input']>;
};

export type ScanMetadataInput = {
  /** Filter options for the scan */
  filter?: InputMaybe<ScanMetaDataFilterInput>;
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Forces a rescan on files even if modification time is unchanged */
  rescan?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image clip previews during scan */
  scanGenerateClipPreviews?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate covers during scan */
  scanGenerateCovers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image phashes during scan */
  scanGenerateImagePhashes?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image previews during scan */
  scanGenerateImagePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate video phashes during scan */
  scanGeneratePhashes?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate previews during scan */
  scanGeneratePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate sprites during scan */
  scanGenerateSprites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image thumbnails during scan */
  scanGenerateThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ScanMetadataOptions = {
  __typename?: 'ScanMetadataOptions';
  /** Forces a rescan on files even if modification time is unchanged */
  rescan: Scalars['Boolean']['output'];
  /** Generate image clip previews during scan */
  scanGenerateClipPreviews: Scalars['Boolean']['output'];
  /** Generate covers during scan */
  scanGenerateCovers: Scalars['Boolean']['output'];
  /** Generate image phashes during scan */
  scanGenerateImagePhashes?: Maybe<Scalars['Boolean']['output']>;
  /** Generate image previews during scan */
  scanGenerateImagePreviews: Scalars['Boolean']['output'];
  /** Generate video phashes during scan */
  scanGeneratePhashes: Scalars['Boolean']['output'];
  /** Generate previews during scan */
  scanGeneratePreviews: Scalars['Boolean']['output'];
  /** Generate sprites during scan */
  scanGenerateSprites: Scalars['Boolean']['output'];
  /** Generate image thumbnails during scan */
  scanGenerateThumbnails: Scalars['Boolean']['output'];
};

/** Type of the content a scraper generates */
export enum ScrapeContentType {
  Gallery = 'GALLERY',
  Group = 'GROUP',
  Image = 'IMAGE',
  Movie = 'MOVIE',
  Performer = 'PERFORMER',
  Scene = 'SCENE'
}

export type ScrapeMultiPerformersInput = {
  /** Instructs to query by scene fingerprints */
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type ScrapeMultiScenesInput = {
  /** Instructs to query by scene fingerprints */
  scene_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type ScrapeSingleGalleryInput = {
  /** Instructs to query by gallery id */
  gallery_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by gallery fragment */
  gallery_input?: InputMaybe<ScrapedGalleryInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapeSingleGroupInput = {
  /** Instructs to query by group id */
  group_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by group fragment */
  group_input?: InputMaybe<ScrapedGroupInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapeSingleImageInput = {
  /** Instructs to query by image id */
  image_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by image fragment */
  image_input?: InputMaybe<ScrapedImageInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapeSingleMovieInput = {
  /** Instructs to query by movie id */
  movie_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by movie fragment */
  movie_input?: InputMaybe<ScrapedMovieInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapeSinglePerformerInput = {
  /** Instructs to query by performer id */
  performer_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by performer fragment */
  performer_input?: InputMaybe<ScrapedPerformerInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapeSingleSceneInput = {
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
  /** Instructs to query by scene fingerprints */
  scene_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by scene fragment */
  scene_input?: InputMaybe<ScrapedSceneInput>;
};

export type ScrapeSingleStudioInput = {
  /** Query can be either a name or a Stash ID */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapeSingleTagInput = {
  /** Query can be either a name or a Stash ID */
  query?: InputMaybe<Scalars['String']['input']>;
};

export enum ScrapeType {
  /** From existing object */
  Fragment = 'FRAGMENT',
  /** From text query */
  Name = 'NAME',
  /** From URL */
  Url = 'URL'
}

/** Scraped Content is the forming union over the different scrapers */
export type ScrapedContent = ScrapedGallery | ScrapedGroup | ScrapedImage | ScrapedMovie | ScrapedPerformer | ScrapedScene | ScrapedStudio | ScrapedTag;

export type ScrapedGallery = {
  __typename?: 'ScrapedGallery';
  code?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  performers?: Maybe<Array<ScrapedPerformer>>;
  photographer?: Maybe<Scalars['String']['output']>;
  studio?: Maybe<ScrapedStudio>;
  tags?: Maybe<Array<ScrapedTag>>;
  title?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapedGalleryInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A group from a scraping operation... */
export type ScrapedGroup = {
  __typename?: 'ScrapedGroup';
  aliases?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  back_image?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  front_image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['String']['output']>;
  stored_id?: Maybe<Scalars['ID']['output']>;
  studio?: Maybe<ScrapedStudio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapedGroupInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['String']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ScrapedImage = {
  __typename?: 'ScrapedImage';
  code?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  performers?: Maybe<Array<ScrapedPerformer>>;
  photographer?: Maybe<Scalars['String']['output']>;
  studio?: Maybe<ScrapedStudio>;
  tags?: Maybe<Array<ScrapedTag>>;
  title?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapedImageInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A movie from a scraping operation... */
export type ScrapedMovie = {
  __typename?: 'ScrapedMovie';
  aliases?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  back_image?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  front_image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['String']['output']>;
  stored_id?: Maybe<Scalars['ID']['output']>;
  studio?: Maybe<ScrapedStudio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapedMovieInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['String']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A performer from a scraping operation... */
export type ScrapedPerformer = {
  __typename?: 'ScrapedPerformer';
  aliases?: Maybe<Scalars['String']['output']>;
  birthdate?: Maybe<Scalars['String']['output']>;
  career_end?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use career_start and career_end */
  career_length?: Maybe<Scalars['String']['output']>;
  career_start?: Maybe<Scalars['Int']['output']>;
  circumcised?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  death_date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  disambiguation?: Maybe<Scalars['String']['output']>;
  ethnicity?: Maybe<Scalars['String']['output']>;
  eye_color?: Maybe<Scalars['String']['output']>;
  fake_tits?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hair_color?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['String']['output']>;
  /**
   * This should be a base64 encoded data URL
   * @deprecated use images instead
   */
  image?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  /** @deprecated use urls */
  instagram?: Maybe<Scalars['String']['output']>;
  measurements?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  penis_length?: Maybe<Scalars['String']['output']>;
  piercings?: Maybe<Scalars['String']['output']>;
  remote_site_id?: Maybe<Scalars['String']['output']>;
  /** Set if performer matched */
  stored_id?: Maybe<Scalars['ID']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  tattoos?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  twitter?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
  weight?: Maybe<Scalars['String']['output']>;
};

export type ScrapedPerformerInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_end?: InputMaybe<Scalars['Int']['input']>;
  /** @deprecated Use career_start and career_end */
  career_length?: InputMaybe<Scalars['String']['input']>;
  career_start?: InputMaybe<Scalars['Int']['input']>;
  circumcised?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  penis_length?: InputMaybe<Scalars['String']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  remote_site_id?: InputMaybe<Scalars['String']['input']>;
  /** Set if performer matched */
  stored_id?: InputMaybe<Scalars['ID']['input']>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  weight?: InputMaybe<Scalars['String']['input']>;
};

export type ScrapedScene = {
  __typename?: 'ScrapedScene';
  code?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  fingerprints?: Maybe<Array<StashBoxFingerprint>>;
  groups?: Maybe<Array<ScrapedGroup>>;
  /** This should be a base64 encoded data URL */
  image?: Maybe<Scalars['String']['output']>;
  /** @deprecated use groups */
  movies?: Maybe<Array<ScrapedMovie>>;
  performers?: Maybe<Array<ScrapedPerformer>>;
  remote_site_id?: Maybe<Scalars['String']['output']>;
  studio?: Maybe<ScrapedStudio>;
  tags?: Maybe<Array<ScrapedTag>>;
  title?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapedSceneInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  remote_site_id?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type ScrapedStudio = {
  __typename?: 'ScrapedStudio';
  /** Aliases must be comma-delimited to be parsed correctly */
  aliases?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  parent?: Maybe<ScrapedStudio>;
  remote_site_id?: Maybe<Scalars['String']['output']>;
  /** Set if studio matched */
  stored_id?: Maybe<Scalars['ID']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type ScrapedTag = {
  __typename?: 'ScrapedTag';
  alias_list?: Maybe<Array<Scalars['String']['output']>>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** Remote site ID, if applicable */
  remote_site_id?: Maybe<Scalars['String']['output']>;
  /** Set if tag matched */
  stored_id?: Maybe<Scalars['ID']['output']>;
};

export type Scraper = {
  __typename?: 'Scraper';
  /** Details for gallery scraper */
  gallery?: Maybe<ScraperSpec>;
  /** Details for group scraper */
  group?: Maybe<ScraperSpec>;
  id: Scalars['ID']['output'];
  /** Details for image scraper */
  image?: Maybe<ScraperSpec>;
  /**
   * Details for movie scraper
   * @deprecated use group
   */
  movie?: Maybe<ScraperSpec>;
  name: Scalars['String']['output'];
  /** Details for performer scraper */
  performer?: Maybe<ScraperSpec>;
  /** Details for scene scraper */
  scene?: Maybe<ScraperSpec>;
};

export type ScraperSource = {
  __typename?: 'ScraperSource';
  /** Scraper ID to scrape with. Should be unset if stash_box_endpoint/stash_box_index is set */
  scraper_id?: Maybe<Scalars['ID']['output']>;
  /** Stash-box endpoint */
  stash_box_endpoint?: Maybe<Scalars['String']['output']>;
  /**
   * Index of the configured stash-box instance to use. Should be unset if scraper_id is set
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: Maybe<Scalars['Int']['output']>;
};

export type ScraperSourceInput = {
  /** Scraper ID to scrape with. Should be unset if stash_box_endpoint/stash_box_index is set */
  scraper_id?: InputMaybe<Scalars['ID']['input']>;
  /** Stash-box endpoint */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /**
   * Index of the configured stash-box instance to use. Should be unset if scraper_id is set
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

export type ScraperSpec = {
  __typename?: 'ScraperSpec';
  supported_scrapes: Array<ScrapeType>;
  /** URLs matching these can be scraped with */
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

export type SetDefaultFilterInput = {
  /** null to clear */
  find_filter?: InputMaybe<FindFilterType>;
  mode: FilterMode;
  object_filter?: InputMaybe<Scalars['Map']['input']>;
  ui_options?: InputMaybe<Scalars['Map']['input']>;
};

export type SetFingerprintsInput = {
  type: Scalars['String']['input'];
  /** an null value will remove the fingerprint */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type SetupInput = {
  /** Empty to indicate default - only applicable if storeBlobsInDatabase is false */
  blobsLocation: Scalars['String']['input'];
  /** Empty to indicate default */
  cacheLocation: Scalars['String']['input'];
  /** Empty to indicate $HOME/.stash/config.yml default */
  configLocation: Scalars['String']['input'];
  /** Empty to indicate default */
  databaseFile: Scalars['String']['input'];
  /** Empty to indicate default */
  generatedLocation: Scalars['String']['input'];
  /** True if SFW content mode is enabled */
  sfwContentMode?: InputMaybe<Scalars['Boolean']['input']>;
  stashes: Array<StashConfigInput>;
  storeBlobsInDatabase: Scalars['Boolean']['input'];
};

export enum SortDirectionEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type StashBox = {
  __typename?: 'StashBox';
  api_key: Scalars['String']['output'];
  endpoint: Scalars['String']['output'];
  max_requests_per_minute: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

/**
 * Accepts either ids, or a combination of names and stash_ids.
 * If none are set, then all existing items will be tagged.
 */
export type StashBoxBatchTagInput = {
  /** If batch adding studios, should their parent studios also be created? */
  createParent: Scalars['Boolean']['input'];
  /**
   * Stash endpoint to use for the tagging
   * @deprecated use stash_box_endpoint
   */
  endpoint?: InputMaybe<Scalars['Int']['input']>;
  /** Fields to exclude when executing the tagging */
  exclude_fields?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * IDs in stash of the items to update.
   * If set, names and stash_ids fields will be ignored.
   */
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Names of the items in the stash-box instance to search for and create */
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * IDs in stash of the performers to update
   * @deprecated use ids
   */
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /**
   * Names of the performers in the stash-box instance to search for and create
   * @deprecated use names
   */
  performer_names?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Refresh items already tagged by StashBox if true. Only tag items with no StashBox tagging if false */
  refresh: Scalars['Boolean']['input'];
  /** Endpoint of the stash-box instance to use */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /** Stash IDs of the items in the stash-box instance to search for and create */
  stash_ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type StashBoxDraftSubmissionInput = {
  id: Scalars['String']['input'];
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use stash_box_endpoint */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

export type StashBoxFingerprint = {
  __typename?: 'StashBoxFingerprint';
  algorithm: Scalars['String']['output'];
  duration: Scalars['Int']['output'];
  hash: Scalars['String']['output'];
};

export type StashBoxFingerprintSubmissionInput = {
  scene_ids: Array<Scalars['String']['input']>;
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use stash_box_endpoint */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

export type StashBoxInput = {
  api_key: Scalars['String']['input'];
  endpoint: Scalars['String']['input'];
  max_requests_per_minute?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type StashBoxPerformerQueryInput = {
  /** Instructs query by scene fingerprints */
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Query by query string */
  q?: InputMaybe<Scalars['String']['input']>;
  /** Endpoint of the stash-box instance to use */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /**
   * Index of the configured stash-box instance to use
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

export type StashBoxPerformerQueryResult = {
  __typename?: 'StashBoxPerformerQueryResult';
  query: Scalars['String']['output'];
  results: Array<ScrapedPerformer>;
};

export type StashBoxSceneQueryInput = {
  /** Query by query string */
  q?: InputMaybe<Scalars['String']['input']>;
  /** Instructs query by scene fingerprints */
  scene_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Endpoint of the stash-box instance to use */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /**
   * Index of the configured stash-box instance to use
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

export type StashBoxValidationResult = {
  __typename?: 'StashBoxValidationResult';
  status: Scalars['String']['output'];
  valid: Scalars['Boolean']['output'];
};

export type StashConfig = {
  __typename?: 'StashConfig';
  excludeAudio: Scalars['Boolean']['output'];
  excludeImage: Scalars['Boolean']['output'];
  excludeVideo: Scalars['Boolean']['output'];
  path: Scalars['String']['output'];
};

/** Stash configuration details */
export type StashConfigInput = {
  excludeAudio: Scalars['Boolean']['input'];
  excludeImage: Scalars['Boolean']['input'];
  excludeVideo: Scalars['Boolean']['input'];
  path: Scalars['String']['input'];
};

export type StashId = {
  __typename?: 'StashID';
  endpoint: Scalars['String']['output'];
  stash_id: Scalars['String']['output'];
  updated_at: Scalars['Time']['output'];
};

export type StashIdCriterionInput = {
  /**
   * If present, this value is treated as a predicate.
   * That is, it will filter based on stash_id with the matching endpoint
   */
  endpoint?: InputMaybe<Scalars['String']['input']>;
  modifier: CriterionModifier;
  stash_id?: InputMaybe<Scalars['String']['input']>;
};

export type StashIdInput = {
  endpoint: Scalars['String']['input'];
  stash_id: Scalars['String']['input'];
  updated_at?: InputMaybe<Scalars['Time']['input']>;
};

export type StashIDsCriterionInput = {
  /**
   * If present, this value is treated as a predicate.
   * That is, it will filter based on stash_ids with the matching endpoint
   */
  endpoint?: InputMaybe<Scalars['String']['input']>;
  modifier: CriterionModifier;
  stash_ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type StatsResultType = {
  __typename?: 'StatsResultType';
  audio_count: Scalars['Int']['output'];
  audios_duration: Scalars['Float']['output'];
  audios_size: Scalars['Float']['output'];
  group_count: Scalars['Int']['output'];
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  performer_count: Scalars['Int']['output'];
  studio_count: Scalars['Int']['output'];
  tag_count: Scalars['Int']['output'];
};

export enum StreamingResolutionEnum {
  /** 4k */
  FourK = 'FOUR_K',
  /** 1080p */
  FullHd = 'FULL_HD',
  /** 240p */
  Low = 'LOW',
  /** Original */
  Original = 'ORIGINAL',
  /** 480p */
  Standard = 'STANDARD',
  /** 720p */
  StandardHd = 'STANDARD_HD'
}

export type StringCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
};

export type Studio = {
  __typename?: 'Studio';
  aliases: Array<Scalars['String']['output']>;
  audio_count: Scalars['Int']['output'];
  child_studios: Array<Studio>;
  created_at: Scalars['Time']['output'];
  custom_fields: Scalars['Map']['output'];
  details?: Maybe<Scalars['String']['output']>;
  favorite: Scalars['Boolean']['output'];
  group_count: Scalars['Int']['output'];
  groups: Array<Group>;
  id: Scalars['ID']['output'];
  ignore_auto_tag: Scalars['Boolean']['output'];
  image_path?: Maybe<Scalars['String']['output']>;
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  /** @deprecated use groups instead */
  movies: Array<Movie>;
  name: Scalars['String']['output'];
  organized: Scalars['Boolean']['output'];
  parent_studio?: Maybe<Studio>;
  performer_count: Scalars['Int']['output'];
  rating100?: Maybe<Scalars['Int']['output']>;
  stash_ids: Array<StashId>;
  tags: Array<Tag>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls: Array<Scalars['String']['output']>;
};


export type StudioAudio_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type StudioGroup_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type StudioMovie_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type StudioPerformer_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};

export type StudioCreateInput = {
  /** Duplicate aliases and those equal to name will be ignored (case-insensitive) */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  custom_fields?: InputMaybe<Scalars['Map']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  parent_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type StudioDestroyInput = {
  id: Scalars['ID']['input'];
};

export type StudioFilterType = {
  AND?: InputMaybe<StudioFilterType>;
  NOT?: InputMaybe<StudioFilterType>;
  OR?: InputMaybe<StudioFilterType>;
  /** Filter by studio aliases */
  aliases?: InputMaybe<StringCriterionInput>;
  /** Filter by subsidiary studio count */
  child_count?: InputMaybe<IntCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  custom_fields?: InputMaybe<Array<CustomFieldCriterionInput>>;
  details?: InputMaybe<StringCriterionInput>;
  /** Filter by favorite */
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by group count */
  group_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related groups that meet this criteria */
  groups_filter?: InputMaybe<GroupFilterType>;
  /** Filter by autotag ignore value */
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include studios missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter by organized */
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include studios with this parent studio */
  parents?: InputMaybe<MultiCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /**
   * Filter by StashID
   * @deprecated use stash_ids_endpoint instead
   */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter by StashIDs */
  stash_ids_endpoint?: InputMaybe<StashIDsCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include studios with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

export type StudioUpdateInput = {
  /** Duplicate aliases and those equal to name will be ignored (case-insensitive) */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  custom_fields?: InputMaybe<CustomFieldsInput>;
  details?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  parent_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Update from the metadata manager */
  jobsSubscribe: JobStatusUpdate;
  loggingSubscribe: Array<LogEntry>;
  scanCompleteSubscribe: Scalars['Boolean']['output'];
};

export type SystemStatus = {
  __typename?: 'SystemStatus';
  appSchema: Scalars['Int']['output'];
  configPath?: Maybe<Scalars['String']['output']>;
  databasePath?: Maybe<Scalars['String']['output']>;
  databaseSchema?: Maybe<Scalars['Int']['output']>;
  ffmpegPath?: Maybe<Scalars['String']['output']>;
  ffprobePath?: Maybe<Scalars['String']['output']>;
  homeDir: Scalars['String']['output'];
  os: Scalars['String']['output'];
  status: SystemStatusEnum;
  workingDir: Scalars['String']['output'];
};

export enum SystemStatusEnum {
  NeedsMigration = 'NEEDS_MIGRATION',
  Ok = 'OK',
  Setup = 'SETUP'
}

export type Tag = {
  __typename?: 'Tag';
  aliases: Array<Scalars['String']['output']>;
  audio_count: Scalars['Int']['output'];
  child_count: Scalars['Int']['output'];
  children: Array<Tag>;
  created_at: Scalars['Time']['output'];
  custom_fields: Scalars['Map']['output'];
  description?: Maybe<Scalars['String']['output']>;
  favorite: Scalars['Boolean']['output'];
  group_count: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  ignore_auto_tag: Scalars['Boolean']['output'];
  image_path?: Maybe<Scalars['String']['output']>;
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parent_count: Scalars['Int']['output'];
  parents: Array<Tag>;
  performer_count: Scalars['Int']['output'];
  /** Value that does not appear in the UI but overrides name for sorting */
  sort_name?: Maybe<Scalars['String']['output']>;
  stash_ids: Array<StashId>;
  studio_count: Scalars['Int']['output'];
  updated_at: Scalars['Time']['output'];
};


export type TagAudio_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type TagGroup_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type TagMovie_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type TagPerformer_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


export type TagStudio_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};

export type TagCreateInput = {
  /** Duplicate aliases and those equal to name will be ignored (case-insensitive) */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  child_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  custom_fields?: InputMaybe<Scalars['Map']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parent_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Value that does not appear in the UI but overrides name for sorting */
  sort_name?: InputMaybe<Scalars['String']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
};

export type TagDestroyInput = {
  id: Scalars['ID']['input'];
};

export type TagFilterType = {
  AND?: InputMaybe<TagFilterType>;
  NOT?: InputMaybe<TagFilterType>;
  OR?: InputMaybe<TagFilterType>;
  /** Filter by tag aliases */
  aliases?: InputMaybe<StringCriterionInput>;
  /** Filter by number f child tags the tag has */
  child_count?: InputMaybe<IntCriterionInput>;
  /** Filter by child tags */
  children?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  custom_fields?: InputMaybe<Array<CustomFieldCriterionInput>>;
  /** Filter by tag description */
  description?: InputMaybe<StringCriterionInput>;
  /** Filter by favorite */
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by number of group with this tag */
  group_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related groups that meet this criteria */
  groups_filter?: InputMaybe<GroupFilterType>;
  /** Filter by autotag ignore value */
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include tags missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by tag name */
  name?: InputMaybe<StringCriterionInput>;
  /** Filter by number of parent tags the tag has */
  parent_count?: InputMaybe<IntCriterionInput>;
  /** Filter by parent tags */
  parents?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by number of performers with this tag */
  performer_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related performers that meet this criteria */
  performers_filter?: InputMaybe<PerformerFilterType>;
  /** Filter by tag sort_name */
  sort_name?: InputMaybe<StringCriterionInput>;
  /**
   * Filter by StashID
   * @deprecated use stash_ids_endpoint instead
   */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter by StashID */
  stash_ids_endpoint?: InputMaybe<StashIDsCriterionInput>;
  /** Filter by number of studios with this tag */
  studio_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
};

export type TagUpdateInput = {
  /** Duplicate aliases and those equal to name will be ignored (case-insensitive) */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  child_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  custom_fields?: InputMaybe<CustomFieldsInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parent_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Value that does not appear in the UI but overrides name for sorting */
  sort_name?: InputMaybe<Scalars['String']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
};

export type TagsMergeInput = {
  destination: Scalars['ID']['input'];
  source: Array<Scalars['ID']['input']>;
  values?: InputMaybe<TagUpdateInput>;
};

export type TimestampCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
  value2?: InputMaybe<Scalars['String']['input']>;
};

export type Version = {
  __typename?: 'Version';
  build_time: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

export type VideoFile = BaseFile & {
  __typename?: 'VideoFile';
  audio_codec: Scalars['String']['output'];
  basename: Scalars['String']['output'];
  bit_rate: Scalars['Int']['output'];
  created_at: Scalars['Time']['output'];
  duration: Scalars['Float']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  format: Scalars['String']['output'];
  frame_rate: Scalars['Float']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder: Folder;
  /** @deprecated Use parent_folder instead */
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  video_codec: Scalars['String']['output'];
  width: Scalars['Int']['output'];
  zip_file?: Maybe<BasicFile>;
  /** @deprecated Use zip_file instead */
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


export type VideoFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

export type VisualFile = ImageFile | VideoFile;

export type SlimAudioDataFragment = { __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> };

export type AudioDataFragment = { __typename?: 'Audio', id: string, title?: string | null, details?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, play_duration: number, resume_time: number, last_played_at?: string | null, created_at: string, updated_at: string, urls: Array<string>, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null, vtt?: string | null, funscript?: string | null, subtitles?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> }>, groups: Array<{ __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> };

export type ConfigGeneralDataFragment = { __typename?: 'ConfigGeneralResult', databasePath: string, backupDirectoryPath: string, deleteTrashPath: string, generatedPath: string, metadataPath: string, scrapersPath: string, pluginsPath: string, cachePath: string, blobsPath: string, blobsStorage: BlobsStorageType, ffmpegPath: string, ffprobePath: string, calculateMD5: boolean, videoFileNamingAlgorithm: HashAlgorithm, parallelTasks: number, previewAudio: boolean, previewSegments: number, previewSegmentDuration: number, previewExcludeStart: string, previewExcludeEnd: string, previewPreset: PreviewPreset, transcodeHardwareAcceleration: boolean, maxTranscodeSize?: StreamingResolutionEnum | null, maxStreamingTranscodeSize?: StreamingResolutionEnum | null, writeImageThumbnails: boolean, createImageClipsFromVideos: boolean, apiKey: string, username: string, password: string, maxSessionAge: number, logFile?: string | null, logOut: boolean, logLevel: string, logAccess: boolean, logFileMaxSize: number, useCustomSpriteInterval: boolean, spriteInterval: number, minimumSprites: number, maximumSprites: number, spriteScreenshotSize: number, createGalleriesFromFolders: boolean, galleryCoverRegex: string, videoExtensions: Array<string>, imageExtensions: Array<string>, galleryExtensions: Array<string>, audioExtensions: Array<string>, excludes: Array<string>, imageExcludes: Array<string>, audioExcludes: Array<string>, customPerformerImageLocation?: string | null, pythonPath: string, transcodeInputArgs: Array<string>, transcodeOutputArgs: Array<string>, liveTranscodeInputArgs: Array<string>, liveTranscodeOutputArgs: Array<string>, drawFunscriptHeatmapRange: boolean, stashes: Array<{ __typename?: 'StashConfig', path: string, excludeVideo: boolean, excludeImage: boolean, excludeAudio: boolean }>, stashBoxes: Array<{ __typename?: 'StashBox', name: string, endpoint: string, api_key: string, max_requests_per_minute: number }>, scraperPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }>, pluginPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }> };

export type ConfigInterfaceDataFragment = { __typename?: 'ConfigInterfaceResult', sfwContentMode: boolean, menuItems?: Array<string> | null, soundOnPreview?: boolean | null, wallShowTitle?: boolean | null, wallPlayback?: string | null, showScrubber?: boolean | null, maximumLoopDuration?: number | null, noBrowser?: boolean | null, notificationsEnabled?: boolean | null, autostartVideo?: boolean | null, autostartVideoOnPlaySelected?: boolean | null, continuePlaylistDefault?: boolean | null, showStudioAsText?: boolean | null, css?: string | null, cssEnabled?: boolean | null, javascript?: string | null, javascriptEnabled?: boolean | null, customLocales?: string | null, customLocalesEnabled?: boolean | null, disableCustomizations?: boolean | null, language?: string | null, handyKey?: string | null, funscriptOffset?: number | null, useStashHostedFunscript?: boolean | null, imageLightbox: { __typename?: 'ConfigImageLightboxResult', slideshowDelay?: number | null, displayMode?: ImageLightboxDisplayMode | null, scaleUp?: boolean | null, resetZoomOnNav?: boolean | null, scrollMode?: ImageLightboxScrollMode | null, scrollAttemptsBeforeChange: number, disableAnimation?: boolean | null }, disableDropdownCreate: { __typename?: 'ConfigDisableDropdownCreate', performer: boolean, tag: boolean, studio: boolean, movie: boolean, gallery: boolean } };

export type ConfigDlnaDataFragment = { __typename?: 'ConfigDLNAResult', serverName: string, enabled: boolean, port: number, whitelistedIPs: Array<string>, interfaces: Array<string>, videoSortOrder: string };

export type ConfigScrapingDataFragment = { __typename?: 'ConfigScrapingResult', scraperUserAgent?: string | null, scraperCertCheck: boolean, scraperCDPPath?: string | null, excludeTagPatterns: Array<string> };

export type IdentifyFieldOptionsDataFragment = { __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null };

export type IdentifyMetadataOptionsDataFragment = { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null };

export type ScraperSourceDataFragment = { __typename?: 'ScraperSource', stash_box_index?: number | null, stash_box_endpoint?: string | null, scraper_id?: string | null };

export type ConfigDefaultSettingsDataFragment = { __typename?: 'ConfigDefaultSettingsResult', deleteFile?: boolean | null, deleteGenerated?: boolean | null, scan?: { __typename?: 'ScanMetadataOptions', scanGenerateCovers: boolean, scanGeneratePreviews: boolean, scanGenerateImagePreviews: boolean, scanGenerateSprites: boolean, scanGeneratePhashes: boolean, scanGenerateThumbnails: boolean, scanGenerateClipPreviews: boolean } | null, identify?: { __typename?: 'IdentifyMetadataTaskOptions', sources: Array<{ __typename?: 'IdentifySource', source: { __typename?: 'ScraperSource', stash_box_index?: number | null, stash_box_endpoint?: string | null, scraper_id?: string | null }, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null }>, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null } | null, autoTag?: { __typename?: 'AutoTagMetadataOptions', performers?: Array<string> | null, studios?: Array<string> | null, tags?: Array<string> | null } | null, generate?: { __typename?: 'GenerateMetadataOptions', covers?: boolean | null, sprites?: boolean | null, previews?: boolean | null, imagePreviews?: boolean | null, markers?: boolean | null, markerImagePreviews?: boolean | null, markerScreenshots?: boolean | null, transcodes?: boolean | null, phashes?: boolean | null, interactiveHeatmapsSpeeds?: boolean | null, clipPreviews?: boolean | null, imageThumbnails?: boolean | null, previewOptions?: { __typename?: 'GeneratePreviewOptions', previewSegments?: number | null, previewSegmentDuration?: number | null, previewExcludeStart?: string | null, previewExcludeEnd?: string | null, previewPreset?: PreviewPreset | null } | null } | null };

export type ConfigDataFragment = { __typename?: 'ConfigResult', ui: IUIConfig, plugins: { [id: string]: { [key: string]: unknown } }, general: { __typename?: 'ConfigGeneralResult', databasePath: string, backupDirectoryPath: string, deleteTrashPath: string, generatedPath: string, metadataPath: string, scrapersPath: string, pluginsPath: string, cachePath: string, blobsPath: string, blobsStorage: BlobsStorageType, ffmpegPath: string, ffprobePath: string, calculateMD5: boolean, videoFileNamingAlgorithm: HashAlgorithm, parallelTasks: number, previewAudio: boolean, previewSegments: number, previewSegmentDuration: number, previewExcludeStart: string, previewExcludeEnd: string, previewPreset: PreviewPreset, transcodeHardwareAcceleration: boolean, maxTranscodeSize?: StreamingResolutionEnum | null, maxStreamingTranscodeSize?: StreamingResolutionEnum | null, writeImageThumbnails: boolean, createImageClipsFromVideos: boolean, apiKey: string, username: string, password: string, maxSessionAge: number, logFile?: string | null, logOut: boolean, logLevel: string, logAccess: boolean, logFileMaxSize: number, useCustomSpriteInterval: boolean, spriteInterval: number, minimumSprites: number, maximumSprites: number, spriteScreenshotSize: number, createGalleriesFromFolders: boolean, galleryCoverRegex: string, videoExtensions: Array<string>, imageExtensions: Array<string>, galleryExtensions: Array<string>, audioExtensions: Array<string>, excludes: Array<string>, imageExcludes: Array<string>, audioExcludes: Array<string>, customPerformerImageLocation?: string | null, pythonPath: string, transcodeInputArgs: Array<string>, transcodeOutputArgs: Array<string>, liveTranscodeInputArgs: Array<string>, liveTranscodeOutputArgs: Array<string>, drawFunscriptHeatmapRange: boolean, stashes: Array<{ __typename?: 'StashConfig', path: string, excludeVideo: boolean, excludeImage: boolean, excludeAudio: boolean }>, stashBoxes: Array<{ __typename?: 'StashBox', name: string, endpoint: string, api_key: string, max_requests_per_minute: number }>, scraperPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }>, pluginPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }> }, interface: { __typename?: 'ConfigInterfaceResult', sfwContentMode: boolean, menuItems?: Array<string> | null, soundOnPreview?: boolean | null, wallShowTitle?: boolean | null, wallPlayback?: string | null, showScrubber?: boolean | null, maximumLoopDuration?: number | null, noBrowser?: boolean | null, notificationsEnabled?: boolean | null, autostartVideo?: boolean | null, autostartVideoOnPlaySelected?: boolean | null, continuePlaylistDefault?: boolean | null, showStudioAsText?: boolean | null, css?: string | null, cssEnabled?: boolean | null, javascript?: string | null, javascriptEnabled?: boolean | null, customLocales?: string | null, customLocalesEnabled?: boolean | null, disableCustomizations?: boolean | null, language?: string | null, handyKey?: string | null, funscriptOffset?: number | null, useStashHostedFunscript?: boolean | null, imageLightbox: { __typename?: 'ConfigImageLightboxResult', slideshowDelay?: number | null, displayMode?: ImageLightboxDisplayMode | null, scaleUp?: boolean | null, resetZoomOnNav?: boolean | null, scrollMode?: ImageLightboxScrollMode | null, scrollAttemptsBeforeChange: number, disableAnimation?: boolean | null }, disableDropdownCreate: { __typename?: 'ConfigDisableDropdownCreate', performer: boolean, tag: boolean, studio: boolean, movie: boolean, gallery: boolean } }, dlna: { __typename?: 'ConfigDLNAResult', serverName: string, enabled: boolean, port: number, whitelistedIPs: Array<string>, interfaces: Array<string>, videoSortOrder: string }, scraping: { __typename?: 'ConfigScrapingResult', scraperUserAgent?: string | null, scraperCertCheck: boolean, scraperCDPPath?: string | null, excludeTagPatterns: Array<string> }, defaults: { __typename?: 'ConfigDefaultSettingsResult', deleteFile?: boolean | null, deleteGenerated?: boolean | null, scan?: { __typename?: 'ScanMetadataOptions', scanGenerateCovers: boolean, scanGeneratePreviews: boolean, scanGenerateImagePreviews: boolean, scanGenerateSprites: boolean, scanGeneratePhashes: boolean, scanGenerateThumbnails: boolean, scanGenerateClipPreviews: boolean } | null, identify?: { __typename?: 'IdentifyMetadataTaskOptions', sources: Array<{ __typename?: 'IdentifySource', source: { __typename?: 'ScraperSource', stash_box_index?: number | null, stash_box_endpoint?: string | null, scraper_id?: string | null }, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null }>, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null } | null, autoTag?: { __typename?: 'AutoTagMetadataOptions', performers?: Array<string> | null, studios?: Array<string> | null, tags?: Array<string> | null } | null, generate?: { __typename?: 'GenerateMetadataOptions', covers?: boolean | null, sprites?: boolean | null, previews?: boolean | null, imagePreviews?: boolean | null, markers?: boolean | null, markerImagePreviews?: boolean | null, markerScreenshots?: boolean | null, transcodes?: boolean | null, phashes?: boolean | null, interactiveHeatmapsSpeeds?: boolean | null, clipPreviews?: boolean | null, imageThumbnails?: boolean | null, previewOptions?: { __typename?: 'GeneratePreviewOptions', previewSegments?: number | null, previewSegmentDuration?: number | null, previewExcludeStart?: string | null, previewExcludeEnd?: string | null, previewPreset?: PreviewPreset | null } | null } | null } };

export type FolderDataFragment = { __typename?: 'Folder', id: string, basename: string, path: string };

export type VideoFileDataFragment = { __typename?: 'VideoFile', id: string, path: string, size: number, mod_time: string, duration: number, video_codec: string, audio_codec: string, width: number, height: number, frame_rate: number, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> };

export type ImageFileDataFragment = { __typename?: 'ImageFile', id: string, path: string, size: number, mod_time: string, width: number, height: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> };

export type GalleryFileDataFragment = { __typename?: 'GalleryFile', id: string, path: string, size: number, mod_time: string, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> };

type VisualFileData_ImageFile_Fragment = { __typename?: 'ImageFile', id: string, path: string, size: number, mod_time: string, width: number, height: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> };

type VisualFileData_VideoFile_Fragment = { __typename?: 'VideoFile', id: string, path: string, size: number, mod_time: string, duration: number, video_codec: string, audio_codec: string, width: number, height: number, frame_rate: number, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> };

export type VisualFileDataFragment = VisualFileData_ImageFile_Fragment | VisualFileData_VideoFile_Fragment;

export type AudioFileDataFragment = { __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> };

export type SelectFolderDataFragment = { __typename?: 'Folder', id: string, path: string, basename: string };

export type RecursiveFolderDataFragment = { __typename?: 'Folder', id: string, path: string, basename: string, parent_folders: Array<{ __typename?: 'Folder', id: string, path: string, basename: string }> };

export type SavedFilterDataFragment = { __typename?: 'SavedFilter', id: string, mode: FilterMode, name: string, object_filter?: SavedObjectFilter | null, ui_options?: SavedUIOptions | null, find_filter?: { __typename?: 'SavedFindFilterType', q?: string | null, page?: number | null, per_page?: number | null, sort?: string | null, direction?: SortDirectionEnum | null } | null };

export type SlimGroupDataFragment = { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null };

export type SelectGroupDataFragment = { __typename?: 'Group', id: string, name: string, aliases?: string | null, date?: string | null, front_image_path?: string | null, studio?: { __typename?: 'Studio', name: string } | null };

export type GroupDataFragment = { __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, custom_fields: { [key: string]: unknown }, performer_count_all: number, sub_group_count_all: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, gender?: GenderEnum | null, urls?: Array<string> | null, image_path?: string | null, favorite: boolean, ignore_auto_tag: boolean, country?: string | null, birthdate?: string | null, ethnicity?: string | null, hair_color?: string | null, eye_color?: string | null, height_cm?: number | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, rating100?: number | null, death_date?: string | null, weight?: number | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> };

export type ListGroupDataFragment = { __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> };

export type JobDataFragment = { __typename?: 'Job', id: string, status: JobStatus, subTasks?: Array<string> | null, description: string, progress?: number | null, startTime?: string | null, endTime?: string | null, addTime: string, error?: string | null };

export type LogEntryDataFragment = { __typename?: 'LogEntry', time: string, level: LogLevel, message: string };

export type PackageDataFragment = { __typename?: 'Package', package_id: string, name: string, version?: string | null, date?: string | null, metadata: { [key: string]: unknown }, sourceURL: string };

export type SlimPerformerDataFragment = { __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, gender?: GenderEnum | null, urls?: Array<string> | null, image_path?: string | null, favorite: boolean, ignore_auto_tag: boolean, country?: string | null, birthdate?: string | null, ethnicity?: string | null, hair_color?: string | null, eye_color?: string | null, height_cm?: number | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, rating100?: number | null, death_date?: string | null, weight?: number | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> };

export type SelectPerformerDataFragment = { __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, alias_list: Array<string>, image_path?: string | null, birthdate?: string | null, death_date?: string | null };

export type PerformerDataFragment = { __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> };

export type SlimStudioDataFragment = { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> };

export type StudioDataFragment = { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, ignore_auto_tag: boolean, organized: boolean, image_path?: string | null, audio_count: number, performer_count: number, group_count: number, details?: string | null, rating100?: number | null, favorite: boolean, aliases: Array<string>, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, group_count_all: number, parent_studio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, image_path?: string | null } | null, child_studios: Array<{ __typename?: 'Studio', id: string, name: string, image_path?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> };

export type SelectStudioDataFragment = { __typename?: 'Studio', id: string, name: string, aliases: Array<string>, details?: string | null, image_path?: string | null, parent_studio?: { __typename?: 'Studio', id: string, name: string } | null };

export type SlimTagDataFragment = { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> };

export type TagDataFragment = { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> };

export type SelectTagDataFragment = { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, favorite: boolean, description?: string | null, aliases: Array<string>, image_path?: string | null, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> };

export type TagListDataFragment = { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> };

export type AudioUpdateMutationVariables = Exact<{
  input: AudioUpdateInput;
}>;


export type AudioUpdateMutation = { __typename?: 'Mutation', audioUpdate?: { __typename?: 'Audio', id: string, title?: string | null, details?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, play_duration: number, resume_time: number, last_played_at?: string | null, created_at: string, updated_at: string, urls: Array<string>, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null, vtt?: string | null, funscript?: string | null, subtitles?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> }>, groups: Array<{ __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> } | null };

export type BulkAudioUpdateMutationVariables = Exact<{
  input: BulkAudioUpdateInput;
}>;


export type BulkAudioUpdateMutation = { __typename?: 'Mutation', bulkAudioUpdate?: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> | null };

export type AudioIncrementOMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AudioIncrementOMutation = { __typename?: 'Mutation', audioIncrementO: number };

export type AudioDecrementOMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AudioDecrementOMutation = { __typename?: 'Mutation', audioDecrementO: number };

export type AudioResetOMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AudioResetOMutation = { __typename?: 'Mutation', audioResetO: number };

export type AudioSaveActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  resume_time?: InputMaybe<Scalars['Float']['input']>;
  playDuration?: InputMaybe<Scalars['Float']['input']>;
}>;


export type AudioSaveActivityMutation = { __typename?: 'Mutation', audioSaveActivity: boolean };

export type AudioIncrementPlayCountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AudioIncrementPlayCountMutation = { __typename?: 'Mutation', audioIncrementPlayCount: number };

export type AudioDestroyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AudioDestroyMutation = { __typename?: 'Mutation', audioDestroy: boolean };

export type AudiosDestroyMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AudiosDestroyMutation = { __typename?: 'Mutation', audiosDestroy: boolean };

export type AudioAssignFileMutationVariables = Exact<{
  input: AssignAudioFileInput;
}>;


export type AudioAssignFileMutation = { __typename?: 'Mutation', audioAssignFile: boolean };

export type SetupMutationVariables = Exact<{
  input: SetupInput;
}>;


export type SetupMutation = { __typename?: 'Mutation', setup: boolean };

export type MigrateMutationVariables = Exact<{
  input: MigrateInput;
}>;


export type MigrateMutation = { __typename?: 'Mutation', migrate: string };

export type DownloadFfMpegMutationVariables = Exact<{ [key: string]: never; }>;


export type DownloadFfMpegMutation = { __typename?: 'Mutation', downloadFFMpeg: string };

export type ConfigureGeneralMutationVariables = Exact<{
  input: ConfigGeneralInput;
}>;


export type ConfigureGeneralMutation = { __typename?: 'Mutation', configureGeneral: { __typename?: 'ConfigGeneralResult', databasePath: string, backupDirectoryPath: string, deleteTrashPath: string, generatedPath: string, metadataPath: string, scrapersPath: string, pluginsPath: string, cachePath: string, blobsPath: string, blobsStorage: BlobsStorageType, ffmpegPath: string, ffprobePath: string, calculateMD5: boolean, videoFileNamingAlgorithm: HashAlgorithm, parallelTasks: number, previewAudio: boolean, previewSegments: number, previewSegmentDuration: number, previewExcludeStart: string, previewExcludeEnd: string, previewPreset: PreviewPreset, transcodeHardwareAcceleration: boolean, maxTranscodeSize?: StreamingResolutionEnum | null, maxStreamingTranscodeSize?: StreamingResolutionEnum | null, writeImageThumbnails: boolean, createImageClipsFromVideos: boolean, apiKey: string, username: string, password: string, maxSessionAge: number, logFile?: string | null, logOut: boolean, logLevel: string, logAccess: boolean, logFileMaxSize: number, useCustomSpriteInterval: boolean, spriteInterval: number, minimumSprites: number, maximumSprites: number, spriteScreenshotSize: number, createGalleriesFromFolders: boolean, galleryCoverRegex: string, videoExtensions: Array<string>, imageExtensions: Array<string>, galleryExtensions: Array<string>, audioExtensions: Array<string>, excludes: Array<string>, imageExcludes: Array<string>, audioExcludes: Array<string>, customPerformerImageLocation?: string | null, pythonPath: string, transcodeInputArgs: Array<string>, transcodeOutputArgs: Array<string>, liveTranscodeInputArgs: Array<string>, liveTranscodeOutputArgs: Array<string>, drawFunscriptHeatmapRange: boolean, stashes: Array<{ __typename?: 'StashConfig', path: string, excludeVideo: boolean, excludeImage: boolean, excludeAudio: boolean }>, stashBoxes: Array<{ __typename?: 'StashBox', name: string, endpoint: string, api_key: string, max_requests_per_minute: number }>, scraperPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }>, pluginPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }> } };

export type ConfigureInterfaceMutationVariables = Exact<{
  input: ConfigInterfaceInput;
}>;


export type ConfigureInterfaceMutation = { __typename?: 'Mutation', configureInterface: { __typename?: 'ConfigInterfaceResult', sfwContentMode: boolean, menuItems?: Array<string> | null, soundOnPreview?: boolean | null, wallShowTitle?: boolean | null, wallPlayback?: string | null, showScrubber?: boolean | null, maximumLoopDuration?: number | null, noBrowser?: boolean | null, notificationsEnabled?: boolean | null, autostartVideo?: boolean | null, autostartVideoOnPlaySelected?: boolean | null, continuePlaylistDefault?: boolean | null, showStudioAsText?: boolean | null, css?: string | null, cssEnabled?: boolean | null, javascript?: string | null, javascriptEnabled?: boolean | null, customLocales?: string | null, customLocalesEnabled?: boolean | null, disableCustomizations?: boolean | null, language?: string | null, handyKey?: string | null, funscriptOffset?: number | null, useStashHostedFunscript?: boolean | null, imageLightbox: { __typename?: 'ConfigImageLightboxResult', slideshowDelay?: number | null, displayMode?: ImageLightboxDisplayMode | null, scaleUp?: boolean | null, resetZoomOnNav?: boolean | null, scrollMode?: ImageLightboxScrollMode | null, scrollAttemptsBeforeChange: number, disableAnimation?: boolean | null }, disableDropdownCreate: { __typename?: 'ConfigDisableDropdownCreate', performer: boolean, tag: boolean, studio: boolean, movie: boolean, gallery: boolean } } };

export type ConfigureDlnaMutationVariables = Exact<{
  input: ConfigDlnaInput;
}>;


export type ConfigureDlnaMutation = { __typename?: 'Mutation', configureDLNA: { __typename?: 'ConfigDLNAResult', serverName: string, enabled: boolean, port: number, whitelistedIPs: Array<string>, interfaces: Array<string>, videoSortOrder: string } };

export type ConfigureScrapingMutationVariables = Exact<{
  input: ConfigScrapingInput;
}>;


export type ConfigureScrapingMutation = { __typename?: 'Mutation', configureScraping: { __typename?: 'ConfigScrapingResult', scraperUserAgent?: string | null, scraperCertCheck: boolean, scraperCDPPath?: string | null, excludeTagPatterns: Array<string> } };

export type ConfigureDefaultsMutationVariables = Exact<{
  input: ConfigDefaultSettingsInput;
}>;


export type ConfigureDefaultsMutation = { __typename?: 'Mutation', configureDefaults: { __typename?: 'ConfigDefaultSettingsResult', deleteFile?: boolean | null, deleteGenerated?: boolean | null, scan?: { __typename?: 'ScanMetadataOptions', scanGenerateCovers: boolean, scanGeneratePreviews: boolean, scanGenerateImagePreviews: boolean, scanGenerateSprites: boolean, scanGeneratePhashes: boolean, scanGenerateThumbnails: boolean, scanGenerateClipPreviews: boolean } | null, identify?: { __typename?: 'IdentifyMetadataTaskOptions', sources: Array<{ __typename?: 'IdentifySource', source: { __typename?: 'ScraperSource', stash_box_index?: number | null, stash_box_endpoint?: string | null, scraper_id?: string | null }, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null }>, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null } | null, autoTag?: { __typename?: 'AutoTagMetadataOptions', performers?: Array<string> | null, studios?: Array<string> | null, tags?: Array<string> | null } | null, generate?: { __typename?: 'GenerateMetadataOptions', covers?: boolean | null, sprites?: boolean | null, previews?: boolean | null, imagePreviews?: boolean | null, markers?: boolean | null, markerImagePreviews?: boolean | null, markerScreenshots?: boolean | null, transcodes?: boolean | null, phashes?: boolean | null, interactiveHeatmapsSpeeds?: boolean | null, clipPreviews?: boolean | null, imageThumbnails?: boolean | null, previewOptions?: { __typename?: 'GeneratePreviewOptions', previewSegments?: number | null, previewSegmentDuration?: number | null, previewExcludeStart?: string | null, previewExcludeEnd?: string | null, previewPreset?: PreviewPreset | null } | null } | null } };

export type ConfigureUiMutationVariables = Exact<{
  input?: InputMaybe<Scalars['Map']['input']>;
  partial?: InputMaybe<Scalars['Map']['input']>;
}>;


export type ConfigureUiMutation = { __typename?: 'Mutation', configureUI: IUIConfig };

export type ConfigureUiSettingMutationVariables = Exact<{
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
}>;


export type ConfigureUiSettingMutation = { __typename?: 'Mutation', configureUISetting: { [key: string]: unknown } };

export type GenerateApiKeyMutationVariables = Exact<{
  input: GenerateApiKeyInput;
}>;


export type GenerateApiKeyMutation = { __typename?: 'Mutation', generateAPIKey: string };

export type DeleteFilesMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type DeleteFilesMutation = { __typename?: 'Mutation', deleteFiles: boolean };

export type RevealFileInFileManagerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RevealFileInFileManagerMutation = { __typename?: 'Mutation', revealFileInFileManager: boolean };

export type RevealFolderInFileManagerMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RevealFolderInFileManagerMutation = { __typename?: 'Mutation', revealFolderInFileManager: boolean };

export type SaveFilterMutationVariables = Exact<{
  input: SaveFilterInput;
}>;


export type SaveFilterMutation = { __typename?: 'Mutation', saveFilter: { __typename?: 'SavedFilter', id: string, mode: FilterMode, name: string, object_filter?: SavedObjectFilter | null, ui_options?: SavedUIOptions | null, find_filter?: { __typename?: 'SavedFindFilterType', q?: string | null, page?: number | null, per_page?: number | null, sort?: string | null, direction?: SortDirectionEnum | null } | null } };

export type DestroySavedFilterMutationVariables = Exact<{
  input: DestroyFilterInput;
}>;


export type DestroySavedFilterMutation = { __typename?: 'Mutation', destroySavedFilter: boolean };

export type GroupCreateMutationVariables = Exact<{
  input: GroupCreateInput;
}>;


export type GroupCreateMutation = { __typename?: 'Mutation', groupCreate?: { __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, custom_fields: { [key: string]: unknown }, performer_count_all: number, sub_group_count_all: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, gender?: GenderEnum | null, urls?: Array<string> | null, image_path?: string | null, favorite: boolean, ignore_auto_tag: boolean, country?: string | null, birthdate?: string | null, ethnicity?: string | null, hair_color?: string | null, eye_color?: string | null, height_cm?: number | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, rating100?: number | null, death_date?: string | null, weight?: number | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> } | null };

export type GroupUpdateMutationVariables = Exact<{
  input: GroupUpdateInput;
}>;


export type GroupUpdateMutation = { __typename?: 'Mutation', groupUpdate?: { __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, custom_fields: { [key: string]: unknown }, performer_count_all: number, sub_group_count_all: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, gender?: GenderEnum | null, urls?: Array<string> | null, image_path?: string | null, favorite: boolean, ignore_auto_tag: boolean, country?: string | null, birthdate?: string | null, ethnicity?: string | null, hair_color?: string | null, eye_color?: string | null, height_cm?: number | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, rating100?: number | null, death_date?: string | null, weight?: number | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> } | null };

export type BulkGroupUpdateMutationVariables = Exact<{
  input: BulkGroupUpdateInput;
}>;


export type BulkGroupUpdateMutation = { __typename?: 'Mutation', bulkGroupUpdate?: Array<{ __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, custom_fields: { [key: string]: unknown }, performer_count_all: number, sub_group_count_all: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, gender?: GenderEnum | null, urls?: Array<string> | null, image_path?: string | null, favorite: boolean, ignore_auto_tag: boolean, country?: string | null, birthdate?: string | null, ethnicity?: string | null, hair_color?: string | null, eye_color?: string | null, height_cm?: number | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, rating100?: number | null, death_date?: string | null, weight?: number | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> }> | null };

export type GroupDestroyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GroupDestroyMutation = { __typename?: 'Mutation', groupDestroy: boolean };

export type GroupsDestroyMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GroupsDestroyMutation = { __typename?: 'Mutation', groupsDestroy: boolean };

export type AddGroupSubGroupsMutationVariables = Exact<{
  input: GroupSubGroupAddInput;
}>;


export type AddGroupSubGroupsMutation = { __typename?: 'Mutation', addGroupSubGroups: boolean };

export type RemoveGroupSubGroupsMutationVariables = Exact<{
  input: GroupSubGroupRemoveInput;
}>;


export type RemoveGroupSubGroupsMutation = { __typename?: 'Mutation', removeGroupSubGroups: boolean };

export type ReorderSubGroupsMutationVariables = Exact<{
  input: ReorderSubGroupsInput;
}>;


export type ReorderSubGroupsMutation = { __typename?: 'Mutation', reorderSubGroups: boolean };

export type StopJobMutationVariables = Exact<{
  job_id: Scalars['ID']['input'];
}>;


export type StopJobMutation = { __typename?: 'Mutation', stopJob: boolean };

export type StopAllJobsMutationVariables = Exact<{ [key: string]: never; }>;


export type StopAllJobsMutation = { __typename?: 'Mutation', stopAllJobs: boolean };

export type MetadataImportMutationVariables = Exact<{ [key: string]: never; }>;


export type MetadataImportMutation = { __typename?: 'Mutation', metadataImport: string };

export type MetadataExportMutationVariables = Exact<{ [key: string]: never; }>;


export type MetadataExportMutation = { __typename?: 'Mutation', metadataExport: string };

export type ExportObjectsMutationVariables = Exact<{
  input: ExportObjectsInput;
}>;


export type ExportObjectsMutation = { __typename?: 'Mutation', exportObjects?: string | null };

export type ImportObjectsMutationVariables = Exact<{
  input: ImportObjectsInput;
}>;


export type ImportObjectsMutation = { __typename?: 'Mutation', importObjects: string };

export type MetadataScanMutationVariables = Exact<{
  input: ScanMetadataInput;
}>;


export type MetadataScanMutation = { __typename?: 'Mutation', metadataScan: string };

export type MetadataGenerateMutationVariables = Exact<{
  input: GenerateMetadataInput;
}>;


export type MetadataGenerateMutation = { __typename?: 'Mutation', metadataGenerate: string };

export type MetadataAutoTagMutationVariables = Exact<{
  input: AutoTagMetadataInput;
}>;


export type MetadataAutoTagMutation = { __typename?: 'Mutation', metadataAutoTag: string };

export type MetadataIdentifyMutationVariables = Exact<{
  input: IdentifyMetadataInput;
}>;


export type MetadataIdentifyMutation = { __typename?: 'Mutation', metadataIdentify: string };

export type MetadataCleanMutationVariables = Exact<{
  input: CleanMetadataInput;
}>;


export type MetadataCleanMutation = { __typename?: 'Mutation', metadataClean: string };

export type MetadataCleanGeneratedMutationVariables = Exact<{
  input: CleanGeneratedInput;
}>;


export type MetadataCleanGeneratedMutation = { __typename?: 'Mutation', metadataCleanGenerated: string };

export type BackupDatabaseMutationVariables = Exact<{
  input: BackupDatabaseInput;
}>;


export type BackupDatabaseMutation = { __typename?: 'Mutation', backupDatabase?: string | null };

export type AnonymiseDatabaseMutationVariables = Exact<{
  input: AnonymiseDatabaseInput;
}>;


export type AnonymiseDatabaseMutation = { __typename?: 'Mutation', anonymiseDatabase?: string | null };

export type OptimiseDatabaseMutationVariables = Exact<{ [key: string]: never; }>;


export type OptimiseDatabaseMutation = { __typename?: 'Mutation', optimiseDatabase: string };

export type MigrateBlobsMutationVariables = Exact<{
  input: MigrateBlobsInput;
}>;


export type MigrateBlobsMutation = { __typename?: 'Mutation', migrateBlobs: string };

export type PerformerCreateMutationVariables = Exact<{
  input: PerformerCreateInput;
}>;


export type PerformerCreateMutation = { __typename?: 'Mutation', performerCreate?: { __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> } | null };

export type PerformerUpdateMutationVariables = Exact<{
  input: PerformerUpdateInput;
}>;


export type PerformerUpdateMutation = { __typename?: 'Mutation', performerUpdate?: { __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> } | null };

export type BulkPerformerUpdateMutationVariables = Exact<{
  input: BulkPerformerUpdateInput;
}>;


export type BulkPerformerUpdateMutation = { __typename?: 'Mutation', bulkPerformerUpdate?: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> }> | null };

export type PerformerDestroyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PerformerDestroyMutation = { __typename?: 'Mutation', performerDestroy: boolean };

export type PerformersDestroyMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type PerformersDestroyMutation = { __typename?: 'Mutation', performersDestroy: boolean };

export type PerformerMergeMutationVariables = Exact<{
  input: PerformerMergeInput;
}>;


export type PerformerMergeMutation = { __typename?: 'Mutation', performerMerge: { __typename?: 'Performer', id: string } };

export type ReloadPluginsMutationVariables = Exact<{ [key: string]: never; }>;


export type ReloadPluginsMutation = { __typename?: 'Mutation', reloadPlugins: boolean };

export type RunPluginTaskMutationVariables = Exact<{
  plugin_id: Scalars['ID']['input'];
  task_name: Scalars['String']['input'];
  args_map?: InputMaybe<Scalars['Map']['input']>;
}>;


export type RunPluginTaskMutation = { __typename?: 'Mutation', runPluginTask: string };

export type ConfigurePluginMutationVariables = Exact<{
  plugin_id: Scalars['ID']['input'];
  input: Scalars['Map']['input'];
}>;


export type ConfigurePluginMutation = { __typename?: 'Mutation', configurePlugin: { [key: string]: unknown } };

export type SetPluginsEnabledMutationVariables = Exact<{
  enabledMap: Scalars['BoolMap']['input'];
}>;


export type SetPluginsEnabledMutation = { __typename?: 'Mutation', setPluginsEnabled: boolean };

export type InstallPluginPackagesMutationVariables = Exact<{
  packages: Array<PackageSpecInput> | PackageSpecInput;
}>;


export type InstallPluginPackagesMutation = { __typename?: 'Mutation', installPackages: string };

export type UpdatePluginPackagesMutationVariables = Exact<{
  packages: Array<PackageSpecInput> | PackageSpecInput;
}>;


export type UpdatePluginPackagesMutation = { __typename?: 'Mutation', updatePackages: string };

export type UninstallPluginPackagesMutationVariables = Exact<{
  packages: Array<PackageSpecInput> | PackageSpecInput;
}>;


export type UninstallPluginPackagesMutation = { __typename?: 'Mutation', uninstallPackages: string };

export type StudioCreateMutationVariables = Exact<{
  input: StudioCreateInput;
}>;


export type StudioCreateMutation = { __typename?: 'Mutation', studioCreate?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, ignore_auto_tag: boolean, organized: boolean, image_path?: string | null, audio_count: number, performer_count: number, group_count: number, details?: string | null, rating100?: number | null, favorite: boolean, aliases: Array<string>, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, group_count_all: number, parent_studio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, image_path?: string | null } | null, child_studios: Array<{ __typename?: 'Studio', id: string, name: string, image_path?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type StudioUpdateMutationVariables = Exact<{
  input: StudioUpdateInput;
}>;


export type StudioUpdateMutation = { __typename?: 'Mutation', studioUpdate?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, ignore_auto_tag: boolean, organized: boolean, image_path?: string | null, audio_count: number, performer_count: number, group_count: number, details?: string | null, rating100?: number | null, favorite: boolean, aliases: Array<string>, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, group_count_all: number, parent_studio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, image_path?: string | null } | null, child_studios: Array<{ __typename?: 'Studio', id: string, name: string, image_path?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type BulkStudioUpdateMutationVariables = Exact<{
  input: BulkStudioUpdateInput;
}>;


export type BulkStudioUpdateMutation = { __typename?: 'Mutation', bulkStudioUpdate?: Array<{ __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, ignore_auto_tag: boolean, organized: boolean, image_path?: string | null, audio_count: number, performer_count: number, group_count: number, details?: string | null, rating100?: number | null, favorite: boolean, aliases: Array<string>, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, group_count_all: number, parent_studio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, image_path?: string | null } | null, child_studios: Array<{ __typename?: 'Studio', id: string, name: string, image_path?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> }> | null };

export type StudioDestroyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type StudioDestroyMutation = { __typename?: 'Mutation', studioDestroy: boolean };

export type StudiosDestroyMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type StudiosDestroyMutation = { __typename?: 'Mutation', studiosDestroy: boolean };

export type TagCreateMutationVariables = Exact<{
  input: TagCreateInput;
}>;


export type TagCreateMutation = { __typename?: 'Mutation', tagCreate?: { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type TagDestroyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type TagDestroyMutation = { __typename?: 'Mutation', tagDestroy: boolean };

export type TagsDestroyMutationVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type TagsDestroyMutation = { __typename?: 'Mutation', tagsDestroy: boolean };

export type TagUpdateMutationVariables = Exact<{
  input: TagUpdateInput;
}>;


export type TagUpdateMutation = { __typename?: 'Mutation', tagUpdate?: { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type BulkTagUpdateMutationVariables = Exact<{
  input: BulkTagUpdateInput;
}>;


export type BulkTagUpdateMutation = { __typename?: 'Mutation', bulkTagUpdate?: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> }> | null };

export type TagsMergeMutationVariables = Exact<{
  source: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  destination: Scalars['ID']['input'];
  values?: InputMaybe<TagUpdateInput>;
}>;


export type TagsMergeMutation = { __typename?: 'Mutation', tagsMerge?: { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type FindAudiosQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  audio_filter?: InputMaybe<AudioFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindAudiosQuery = { __typename?: 'Query', findAudios: { __typename?: 'FindAudiosResultType', count: number, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> } };

export type FindAudiosMetadataQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  audio_filter?: InputMaybe<AudioFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindAudiosMetadataQuery = { __typename?: 'Query', findAudios: { __typename?: 'FindAudiosResultType', duration: number, filesize: number } };

export type FindAudioQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  checksum?: InputMaybe<Scalars['String']['input']>;
}>;


export type FindAudioQuery = { __typename?: 'Query', findAudio?: { __typename?: 'Audio', id: string, title?: string | null, details?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, play_duration: number, resume_time: number, last_played_at?: string | null, created_at: string, updated_at: string, urls: Array<string>, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null, vtt?: string | null, funscript?: string | null, subtitles?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> }>, groups: Array<{ __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> } | null };

export type ConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type ConfigurationQuery = { __typename?: 'Query', configuration: { __typename?: 'ConfigResult', ui: IUIConfig, plugins: { [id: string]: { [key: string]: unknown } }, general: { __typename?: 'ConfigGeneralResult', databasePath: string, backupDirectoryPath: string, deleteTrashPath: string, generatedPath: string, metadataPath: string, scrapersPath: string, pluginsPath: string, cachePath: string, blobsPath: string, blobsStorage: BlobsStorageType, ffmpegPath: string, ffprobePath: string, calculateMD5: boolean, videoFileNamingAlgorithm: HashAlgorithm, parallelTasks: number, previewAudio: boolean, previewSegments: number, previewSegmentDuration: number, previewExcludeStart: string, previewExcludeEnd: string, previewPreset: PreviewPreset, transcodeHardwareAcceleration: boolean, maxTranscodeSize?: StreamingResolutionEnum | null, maxStreamingTranscodeSize?: StreamingResolutionEnum | null, writeImageThumbnails: boolean, createImageClipsFromVideos: boolean, apiKey: string, username: string, password: string, maxSessionAge: number, logFile?: string | null, logOut: boolean, logLevel: string, logAccess: boolean, logFileMaxSize: number, useCustomSpriteInterval: boolean, spriteInterval: number, minimumSprites: number, maximumSprites: number, spriteScreenshotSize: number, createGalleriesFromFolders: boolean, galleryCoverRegex: string, videoExtensions: Array<string>, imageExtensions: Array<string>, galleryExtensions: Array<string>, audioExtensions: Array<string>, excludes: Array<string>, imageExcludes: Array<string>, audioExcludes: Array<string>, customPerformerImageLocation?: string | null, pythonPath: string, transcodeInputArgs: Array<string>, transcodeOutputArgs: Array<string>, liveTranscodeInputArgs: Array<string>, liveTranscodeOutputArgs: Array<string>, drawFunscriptHeatmapRange: boolean, stashes: Array<{ __typename?: 'StashConfig', path: string, excludeVideo: boolean, excludeImage: boolean, excludeAudio: boolean }>, stashBoxes: Array<{ __typename?: 'StashBox', name: string, endpoint: string, api_key: string, max_requests_per_minute: number }>, scraperPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }>, pluginPackageSources: Array<{ __typename?: 'PackageSource', name?: string | null, url: string, local_path?: string | null }> }, interface: { __typename?: 'ConfigInterfaceResult', sfwContentMode: boolean, menuItems?: Array<string> | null, soundOnPreview?: boolean | null, wallShowTitle?: boolean | null, wallPlayback?: string | null, showScrubber?: boolean | null, maximumLoopDuration?: number | null, noBrowser?: boolean | null, notificationsEnabled?: boolean | null, autostartVideo?: boolean | null, autostartVideoOnPlaySelected?: boolean | null, continuePlaylistDefault?: boolean | null, showStudioAsText?: boolean | null, css?: string | null, cssEnabled?: boolean | null, javascript?: string | null, javascriptEnabled?: boolean | null, customLocales?: string | null, customLocalesEnabled?: boolean | null, disableCustomizations?: boolean | null, language?: string | null, handyKey?: string | null, funscriptOffset?: number | null, useStashHostedFunscript?: boolean | null, imageLightbox: { __typename?: 'ConfigImageLightboxResult', slideshowDelay?: number | null, displayMode?: ImageLightboxDisplayMode | null, scaleUp?: boolean | null, resetZoomOnNav?: boolean | null, scrollMode?: ImageLightboxScrollMode | null, scrollAttemptsBeforeChange: number, disableAnimation?: boolean | null }, disableDropdownCreate: { __typename?: 'ConfigDisableDropdownCreate', performer: boolean, tag: boolean, studio: boolean, movie: boolean, gallery: boolean } }, dlna: { __typename?: 'ConfigDLNAResult', serverName: string, enabled: boolean, port: number, whitelistedIPs: Array<string>, interfaces: Array<string>, videoSortOrder: string }, scraping: { __typename?: 'ConfigScrapingResult', scraperUserAgent?: string | null, scraperCertCheck: boolean, scraperCDPPath?: string | null, excludeTagPatterns: Array<string> }, defaults: { __typename?: 'ConfigDefaultSettingsResult', deleteFile?: boolean | null, deleteGenerated?: boolean | null, scan?: { __typename?: 'ScanMetadataOptions', scanGenerateCovers: boolean, scanGeneratePreviews: boolean, scanGenerateImagePreviews: boolean, scanGenerateSprites: boolean, scanGeneratePhashes: boolean, scanGenerateThumbnails: boolean, scanGenerateClipPreviews: boolean } | null, identify?: { __typename?: 'IdentifyMetadataTaskOptions', sources: Array<{ __typename?: 'IdentifySource', source: { __typename?: 'ScraperSource', stash_box_index?: number | null, stash_box_endpoint?: string | null, scraper_id?: string | null }, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null }>, options?: { __typename?: 'IdentifyMetadataOptions', setCoverImage?: boolean | null, setOrganized?: boolean | null, performerGenders?: Array<GenderEnum> | null, skipMultipleMatches?: boolean | null, skipMultipleMatchTag?: string | null, skipSingleNamePerformers?: boolean | null, skipSingleNamePerformerTag?: string | null, fieldOptions?: Array<{ __typename?: 'IdentifyFieldOptions', field: string, strategy: IdentifyFieldStrategy, createMissing?: boolean | null }> | null } | null } | null, autoTag?: { __typename?: 'AutoTagMetadataOptions', performers?: Array<string> | null, studios?: Array<string> | null, tags?: Array<string> | null } | null, generate?: { __typename?: 'GenerateMetadataOptions', covers?: boolean | null, sprites?: boolean | null, previews?: boolean | null, imagePreviews?: boolean | null, markers?: boolean | null, markerImagePreviews?: boolean | null, markerScreenshots?: boolean | null, transcodes?: boolean | null, phashes?: boolean | null, interactiveHeatmapsSpeeds?: boolean | null, clipPreviews?: boolean | null, imageThumbnails?: boolean | null, previewOptions?: { __typename?: 'GeneratePreviewOptions', previewSegments?: number | null, previewSegmentDuration?: number | null, previewExcludeStart?: string | null, previewExcludeEnd?: string | null, previewPreset?: PreviewPreset | null } | null } | null } } };

export type SystemStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type SystemStatusQuery = { __typename?: 'Query', systemStatus: { __typename?: 'SystemStatus', databaseSchema?: number | null, databasePath?: string | null, configPath?: string | null, appSchema: number, status: SystemStatusEnum } };

export type FindSavedFilterQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FindSavedFilterQuery = { __typename?: 'Query', findSavedFilter?: { __typename?: 'SavedFilter', id: string, mode: FilterMode, name: string, object_filter?: SavedObjectFilter | null, ui_options?: SavedUIOptions | null, find_filter?: { __typename?: 'SavedFindFilterType', q?: string | null, page?: number | null, per_page?: number | null, sort?: string | null, direction?: SortDirectionEnum | null } | null } | null };

export type FindSavedFiltersQueryVariables = Exact<{
  mode?: InputMaybe<FilterMode>;
}>;


export type FindSavedFiltersQuery = { __typename?: 'Query', findSavedFilters: Array<{ __typename?: 'SavedFilter', id: string, mode: FilterMode, name: string, object_filter?: SavedObjectFilter | null, ui_options?: SavedUIOptions | null, find_filter?: { __typename?: 'SavedFindFilterType', q?: string | null, page?: number | null, per_page?: number | null, sort?: string | null, direction?: SortDirectionEnum | null } | null }> };

export type DirectoryQueryVariables = Exact<{
  path?: InputMaybe<Scalars['String']['input']>;
}>;


export type DirectoryQuery = { __typename?: 'Query', directory: { __typename?: 'Directory', path: string, parent?: string | null, directories: Array<string> } };

export type FindRootFoldersForSelectQueryVariables = Exact<{ [key: string]: never; }>;


export type FindRootFoldersForSelectQuery = { __typename?: 'Query', findFolders: { __typename?: 'FindFoldersResultType', count: number, folders: Array<{ __typename?: 'Folder', id: string, path: string, basename: string }> } };

export type FindFoldersForQueryQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  folder_filter?: InputMaybe<FolderFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindFoldersForQueryQuery = { __typename?: 'Query', findFolders: { __typename?: 'FindFoldersResultType', count: number, folders: Array<{ __typename?: 'Folder', id: string, path: string, basename: string, parent_folders: Array<{ __typename?: 'Folder', id: string, path: string, basename: string }> }> } };

export type JobQueueQueryVariables = Exact<{ [key: string]: never; }>;


export type JobQueueQuery = { __typename?: 'Query', jobQueue?: Array<{ __typename?: 'Job', id: string, status: JobStatus, subTasks?: Array<string> | null, description: string, progress?: number | null, startTime?: string | null, endTime?: string | null, addTime: string, error?: string | null }> | null };

export type FindJobQueryVariables = Exact<{
  input: FindJobInput;
}>;


export type FindJobQuery = { __typename?: 'Query', findJob?: { __typename?: 'Job', id: string, status: JobStatus, subTasks?: Array<string> | null, description: string, progress?: number | null, startTime?: string | null, endTime?: string | null, addTime: string, error?: string | null } | null };

export type StatsQueryVariables = Exact<{ [key: string]: never; }>;


export type StatsQuery = { __typename?: 'Query', stats: { __typename?: 'StatsResultType', audio_count: number, audios_size: number, audios_duration: number, performer_count: number, studio_count: number, group_count: number, tag_count: number } };

export type LogsQueryVariables = Exact<{ [key: string]: never; }>;


export type LogsQuery = { __typename?: 'Query', logs: Array<{ __typename?: 'LogEntry', time: string, level: LogLevel, message: string }> };

export type VersionQueryVariables = Exact<{ [key: string]: never; }>;


export type VersionQuery = { __typename?: 'Query', version: { __typename?: 'Version', version?: string | null, hash: string, build_time: string } };

export type LatestVersionQueryVariables = Exact<{ [key: string]: never; }>;


export type LatestVersionQuery = { __typename?: 'Query', latestversion: { __typename?: 'LatestVersion', version: string, shorthash: string, release_date: string, url: string } };

export type FindGroupsQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  group_filter?: InputMaybe<GroupFilterType>;
}>;


export type FindGroupsQuery = { __typename?: 'Query', findGroups: { __typename?: 'FindGroupsResultType', count: number, groups: Array<{ __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> }> } };

export type FindGroupQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FindGroupQuery = { __typename?: 'Query', findGroup?: { __typename?: 'Group', id: string, name: string, aliases?: string | null, duration?: number | null, date?: string | null, rating100?: number | null, director?: string | null, synopsis?: string | null, urls: Array<string>, front_image_path?: string | null, back_image_path?: string | null, audio_count: number, performer_count: number, sub_group_count: number, custom_fields: { [key: string]: unknown }, performer_count_all: number, sub_group_count_all: number, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null, details?: string | null, rating100?: number | null, aliases: Array<string>, favorite: boolean, ignore_auto_tag: boolean, organized: boolean, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parent_studio?: { __typename?: 'Studio', id: string } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }> } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, containing_groups: Array<{ __typename?: 'GroupDescription', description?: string | null, group: { __typename?: 'Group', id: string, name: string, front_image_path?: string | null, rating100?: number | null } }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, gender?: GenderEnum | null, urls?: Array<string> | null, image_path?: string | null, favorite: boolean, ignore_auto_tag: boolean, country?: string | null, birthdate?: string | null, ethnicity?: string | null, hair_color?: string | null, eye_color?: string | null, height_cm?: number | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, rating100?: number | null, death_date?: string | null, weight?: number | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, audios: Array<{ __typename?: 'Audio', id: string, title?: string | null, date?: string | null, rating100?: number | null, organized: boolean, o_counter: number, play_count: number, paths: { __typename?: 'AudioPathsType', cover?: string | null, stream?: string | null }, studio?: { __typename?: 'Studio', id: string, name: string, image_path?: string | null } | null, tags: Array<{ __typename?: 'Tag', id: string, name: string }>, performers: Array<{ __typename?: 'Performer', id: string, name: string, gender?: GenderEnum | null, favorite: boolean, image_path?: string | null }>, files: Array<{ __typename?: 'AudioFile', id: string, path: string, size: number, mod_time: string, duration: number, audio_codec: string, bit_rate: number, fingerprints: Array<{ __typename?: 'Fingerprint', type: string, value: string }> }> }> } | null };

export type FindGroupsForSelectQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  group_filter?: InputMaybe<GroupFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindGroupsForSelectQuery = { __typename?: 'Query', findGroups: { __typename?: 'FindGroupsResultType', count: number, groups: Array<{ __typename?: 'Group', id: string, name: string, aliases?: string | null, date?: string | null, front_image_path?: string | null, studio?: { __typename?: 'Studio', name: string } | null }> } };

export type FindPerformersQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  performer_filter?: InputMaybe<PerformerFilterType>;
  performer_ids?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type FindPerformersQuery = { __typename?: 'Query', findPerformers: { __typename?: 'FindPerformersResultType', count: number, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> }> } };

export type FindPerformerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FindPerformerQuery = { __typename?: 'Query', findPerformer?: { __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, urls?: Array<string> | null, gender?: GenderEnum | null, birthdate?: string | null, ethnicity?: string | null, country?: string | null, eye_color?: string | null, height_cm?: number | null, measurements?: string | null, fake_tits?: string | null, penis_length?: number | null, circumcised?: CircumisedEnum | null, career_start?: number | null, career_end?: number | null, tattoos?: string | null, piercings?: string | null, alias_list: Array<string>, favorite: boolean, ignore_auto_tag: boolean, image_path?: string | null, audio_count: number, group_count: number, performer_count: number, rating100?: number | null, details?: string | null, death_date?: string | null, hair_color?: string | null, weight?: number | null, custom_fields: { [key: string]: unknown }, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }> } | null };

export type FindPerformersForSelectQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  performer_filter?: InputMaybe<PerformerFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindPerformersForSelectQuery = { __typename?: 'Query', findPerformers: { __typename?: 'FindPerformersResultType', count: number, performers: Array<{ __typename?: 'Performer', id: string, name: string, disambiguation?: string | null, alias_list: Array<string>, image_path?: string | null, birthdate?: string | null, death_date?: string | null }> } };

export type PluginsQueryVariables = Exact<{ [key: string]: never; }>;


export type PluginsQuery = { __typename?: 'Query', plugins?: Array<{ __typename?: 'Plugin', id: string, name: string, enabled: boolean, description?: string | null, url?: string | null, version?: string | null, requires?: Array<string> | null, tasks?: Array<{ __typename?: 'PluginTask', name: string, description?: string | null }> | null, hooks?: Array<{ __typename?: 'PluginHook', name: string, description?: string | null, hooks?: Array<string> | null }> | null, settings?: Array<{ __typename?: 'PluginSetting', name: string, display_name?: string | null, description?: string | null, type: PluginSettingTypeEnum }> | null, paths: { __typename?: 'PluginPaths', css?: Array<string> | null, javascript?: Array<string> | null } }> | null };

export type PluginTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type PluginTasksQuery = { __typename?: 'Query', pluginTasks?: Array<{ __typename?: 'PluginTask', name: string, description?: string | null, plugin: { __typename?: 'Plugin', id: string, name: string, enabled: boolean } }> | null };

export type InstalledPluginPackagesQueryVariables = Exact<{ [key: string]: never; }>;


export type InstalledPluginPackagesQuery = { __typename?: 'Query', installedPackages: Array<{ __typename?: 'Package', package_id: string, name: string, version?: string | null, date?: string | null, metadata: { [key: string]: unknown }, sourceURL: string }> };

export type InstalledPluginPackagesStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type InstalledPluginPackagesStatusQuery = { __typename?: 'Query', installedPackages: Array<{ __typename?: 'Package', package_id: string, name: string, version?: string | null, date?: string | null, metadata: { [key: string]: unknown }, sourceURL: string, source_package?: { __typename?: 'Package', package_id: string, name: string, version?: string | null, date?: string | null, metadata: { [key: string]: unknown }, sourceURL: string } | null }> };

export type AvailablePluginPackagesQueryVariables = Exact<{
  source: Scalars['String']['input'];
}>;


export type AvailablePluginPackagesQuery = { __typename?: 'Query', availablePackages: Array<{ __typename?: 'Package', package_id: string, name: string, version?: string | null, date?: string | null, metadata: { [key: string]: unknown }, sourceURL: string, requires: Array<{ __typename?: 'Package', package_id: string }> }> };

export type ScraperDataFragment = { __typename?: 'Scraper', id: string, name: string, performer?: { __typename?: 'ScraperSpec', urls?: Array<string> | null, supported_scrapes: Array<ScrapeType> } | null, group?: { __typename?: 'ScraperSpec', urls?: Array<string> | null, supported_scrapes: Array<ScrapeType> } | null };

export type ListPerformerScrapersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPerformerScrapersQuery = { __typename?: 'Query', listScrapers: Array<{ __typename?: 'Scraper', id: string, name: string, performer?: { __typename?: 'ScraperSpec', urls?: Array<string> | null, supported_scrapes: Array<ScrapeType> } | null, group?: { __typename?: 'ScraperSpec', urls?: Array<string> | null, supported_scrapes: Array<ScrapeType> } | null }> };

export type ListGroupScrapersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListGroupScrapersQuery = { __typename?: 'Query', listScrapers: Array<{ __typename?: 'Scraper', id: string, name: string, performer?: { __typename?: 'ScraperSpec', urls?: Array<string> | null, supported_scrapes: Array<ScrapeType> } | null, group?: { __typename?: 'ScraperSpec', urls?: Array<string> | null, supported_scrapes: Array<ScrapeType> } | null }> };

export type FindStudiosQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  studio_filter?: InputMaybe<StudioFilterType>;
}>;


export type FindStudiosQuery = { __typename?: 'Query', findStudios: { __typename?: 'FindStudiosResultType', count: number, studios: Array<{ __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, ignore_auto_tag: boolean, organized: boolean, image_path?: string | null, audio_count: number, performer_count: number, group_count: number, details?: string | null, rating100?: number | null, favorite: boolean, aliases: Array<string>, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, group_count_all: number, parent_studio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, image_path?: string | null } | null, child_studios: Array<{ __typename?: 'Studio', id: string, name: string, image_path?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> }> } };

export type FindStudioQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FindStudioQuery = { __typename?: 'Query', findStudio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, ignore_auto_tag: boolean, organized: boolean, image_path?: string | null, audio_count: number, performer_count: number, group_count: number, details?: string | null, rating100?: number | null, favorite: boolean, aliases: Array<string>, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, group_count_all: number, parent_studio?: { __typename?: 'Studio', id: string, name: string, url?: string | null, urls: Array<string>, image_path?: string | null } | null, child_studios: Array<{ __typename?: 'Studio', id: string, name: string, image_path?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', stash_id: string, endpoint: string, updated_at: string }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type FindStudiosForSelectQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  studio_filter?: InputMaybe<StudioFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindStudiosForSelectQuery = { __typename?: 'Query', findStudios: { __typename?: 'FindStudiosResultType', count: number, studios: Array<{ __typename?: 'Studio', id: string, name: string, aliases: Array<string>, details?: string | null, image_path?: string | null, parent_studio?: { __typename?: 'Studio', id: string, name: string } | null }> } };

export type FindTagsQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  tag_filter?: InputMaybe<TagFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindTagsQuery = { __typename?: 'Query', findTags: { __typename?: 'FindTagsResultType', count: number, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> }> } };

export type FindTagQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type FindTagQuery = { __typename?: 'Query', findTag?: { __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, custom_fields: { [key: string]: unknown }, audio_count_all: number, performer_count_all: number, studio_count_all: number, group_count_all: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } | null };

export type FindTagsForSelectQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  tag_filter?: InputMaybe<TagFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']> | Scalars['ID']['input']>;
}>;


export type FindTagsForSelectQuery = { __typename?: 'Query', findTags: { __typename?: 'FindTagsResultType', count: number, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, favorite: boolean, description?: string | null, aliases: Array<string>, image_path?: string | null, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null }>, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> } };

export type FindTagsForListQueryVariables = Exact<{
  filter?: InputMaybe<FindFilterType>;
  tag_filter?: InputMaybe<TagFilterType>;
}>;


export type FindTagsForListQuery = { __typename?: 'Query', findTags: { __typename?: 'FindTagsResultType', count: number, tags: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, description?: string | null, aliases: Array<string>, ignore_auto_tag: boolean, favorite: boolean, image_path?: string | null, audio_count: number, performer_count: number, studio_count: number, group_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }>, parents: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }>, children: Array<{ __typename?: 'Tag', id: string, name: string, sort_name?: string | null, aliases: Array<string>, image_path?: string | null, parent_count: number, child_count: number, stash_ids: Array<{ __typename?: 'StashID', endpoint: string, stash_id: string, updated_at: string }> }> }> } };

export type JobsSubscribeSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type JobsSubscribeSubscription = { __typename?: 'Subscription', jobsSubscribe: { __typename?: 'JobStatusUpdate', type: JobStatusUpdateType, job: { __typename?: 'Job', id: string, status: JobStatus, subTasks?: Array<string> | null, description: string, progress?: number | null, error?: string | null, startTime?: string | null } } };

export type LoggingSubscribeSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type LoggingSubscribeSubscription = { __typename?: 'Subscription', loggingSubscribe: Array<{ __typename?: 'LogEntry', time: string, level: LogLevel, message: string }> };

export type ScanCompleteSubscribeSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ScanCompleteSubscribeSubscription = { __typename?: 'Subscription', scanCompleteSubscribe: boolean };

export const SlimStudioDataFragmentDoc = gql`
    fragment SlimStudioData on Studio {
  id
  name
  image_path
  stash_ids {
    endpoint
    stash_id
    updated_at
  }
  parent_studio {
    id
  }
  details
  rating100
  aliases
  tags {
    id
    name
  }
  favorite
  ignore_auto_tag
  organized
}
    `;
export const SlimTagDataFragmentDoc = gql`
    fragment SlimTagData on Tag {
  id
  name
  sort_name
  aliases
  image_path
  parent_count
  child_count
  stash_ids {
    endpoint
    stash_id
    updated_at
  }
}
    `;
export const PerformerDataFragmentDoc = gql`
    fragment PerformerData on Performer {
  id
  name
  disambiguation
  urls
  gender
  birthdate
  ethnicity
  country
  eye_color
  height_cm
  measurements
  fake_tits
  penis_length
  circumcised
  career_start
  career_end
  tattoos
  piercings
  alias_list
  favorite
  ignore_auto_tag
  image_path
  audio_count
  group_count
  performer_count
  tags {
    ...SlimTagData
  }
  stash_ids {
    stash_id
    endpoint
    updated_at
  }
  rating100
  details
  death_date
  hair_color
  weight
  custom_fields
}
    ${SlimTagDataFragmentDoc}`;
export const SlimGroupDataFragmentDoc = gql`
    fragment SlimGroupData on Group {
  id
  name
  front_image_path
  rating100
}
    `;
export const AudioFileDataFragmentDoc = gql`
    fragment AudioFileData on AudioFile {
  id
  path
  size
  mod_time
  duration
  audio_codec
  bit_rate
  fingerprints {
    type
    value
  }
}
    `;
export const SlimAudioDataFragmentDoc = gql`
    fragment SlimAudioData on Audio {
  id
  title
  date
  rating100
  organized
  o_counter
  play_count
  paths {
    cover
    stream
  }
  studio {
    id
    name
    image_path
  }
  tags {
    id
    name
  }
  performers {
    id
    name
    gender
    favorite
    image_path
  }
  files {
    ...AudioFileData
  }
}
    ${AudioFileDataFragmentDoc}`;
export const ListGroupDataFragmentDoc = gql`
    fragment ListGroupData on Group {
  id
  name
  aliases
  duration
  date
  rating100
  director
  studio {
    ...SlimStudioData
  }
  tags {
    ...SlimTagData
  }
  containing_groups {
    group {
      ...SlimGroupData
    }
    description
  }
  synopsis
  urls
  front_image_path
  back_image_path
  audio_count
  performer_count
  sub_group_count
  audios {
    ...SlimAudioData
  }
}
    ${SlimStudioDataFragmentDoc}
${SlimTagDataFragmentDoc}
${SlimGroupDataFragmentDoc}
${SlimAudioDataFragmentDoc}`;
export const AudioDataFragmentDoc = gql`
    fragment AudioData on Audio {
  id
  title
  details
  date
  rating100
  organized
  o_counter
  play_count
  play_duration
  resume_time
  last_played_at
  created_at
  updated_at
  urls
  paths {
    cover
    stream
    vtt
    funscript
    subtitles
  }
  studio {
    ...SlimStudioData
  }
  tags {
    ...SlimTagData
  }
  performers {
    ...PerformerData
  }
  groups {
    ...ListGroupData
  }
  stash_ids {
    endpoint
    stash_id
  }
  files {
    ...AudioFileData
  }
}
    ${SlimStudioDataFragmentDoc}
${SlimTagDataFragmentDoc}
${PerformerDataFragmentDoc}
${ListGroupDataFragmentDoc}
${AudioFileDataFragmentDoc}`;
export const ConfigGeneralDataFragmentDoc = gql`
    fragment ConfigGeneralData on ConfigGeneralResult {
  stashes {
    path
    excludeVideo
    excludeImage
    excludeAudio
  }
  databasePath
  backupDirectoryPath
  deleteTrashPath
  generatedPath
  metadataPath
  scrapersPath
  pluginsPath
  cachePath
  blobsPath
  blobsStorage
  ffmpegPath
  ffprobePath
  calculateMD5
  videoFileNamingAlgorithm
  parallelTasks
  previewAudio
  previewSegments
  previewSegmentDuration
  previewExcludeStart
  previewExcludeEnd
  previewPreset
  transcodeHardwareAcceleration
  maxTranscodeSize
  maxStreamingTranscodeSize
  writeImageThumbnails
  createImageClipsFromVideos
  apiKey
  username
  password
  maxSessionAge
  logFile
  logOut
  logLevel
  logAccess
  logFileMaxSize
  useCustomSpriteInterval
  spriteInterval
  minimumSprites
  maximumSprites
  spriteScreenshotSize
  createGalleriesFromFolders
  galleryCoverRegex
  videoExtensions
  imageExtensions
  galleryExtensions
  audioExtensions
  excludes
  imageExcludes
  audioExcludes
  customPerformerImageLocation
  stashBoxes {
    name
    endpoint
    api_key
    max_requests_per_minute
  }
  pythonPath
  transcodeInputArgs
  transcodeOutputArgs
  liveTranscodeInputArgs
  liveTranscodeOutputArgs
  drawFunscriptHeatmapRange
  scraperPackageSources {
    name
    url
    local_path
  }
  pluginPackageSources {
    name
    url
    local_path
  }
}
    `;
export const ConfigInterfaceDataFragmentDoc = gql`
    fragment ConfigInterfaceData on ConfigInterfaceResult {
  sfwContentMode
  menuItems
  soundOnPreview
  wallShowTitle
  wallPlayback
  showScrubber
  maximumLoopDuration
  noBrowser
  notificationsEnabled
  autostartVideo
  autostartVideoOnPlaySelected
  continuePlaylistDefault
  showStudioAsText
  css
  cssEnabled
  javascript
  javascriptEnabled
  customLocales
  customLocalesEnabled
  disableCustomizations
  language
  imageLightbox {
    slideshowDelay
    displayMode
    scaleUp
    resetZoomOnNav
    scrollMode
    scrollAttemptsBeforeChange
    disableAnimation
  }
  disableDropdownCreate {
    performer
    tag
    studio
    movie
    gallery
  }
  handyKey
  funscriptOffset
  useStashHostedFunscript
}
    `;
export const ConfigDlnaDataFragmentDoc = gql`
    fragment ConfigDLNAData on ConfigDLNAResult {
  serverName
  enabled
  port
  whitelistedIPs
  interfaces
  videoSortOrder
}
    `;
export const ConfigScrapingDataFragmentDoc = gql`
    fragment ConfigScrapingData on ConfigScrapingResult {
  scraperUserAgent
  scraperCertCheck
  scraperCDPPath
  excludeTagPatterns
}
    `;
export const ScraperSourceDataFragmentDoc = gql`
    fragment ScraperSourceData on ScraperSource {
  stash_box_index
  stash_box_endpoint
  scraper_id
}
    `;
export const IdentifyFieldOptionsDataFragmentDoc = gql`
    fragment IdentifyFieldOptionsData on IdentifyFieldOptions {
  field
  strategy
  createMissing
}
    `;
export const IdentifyMetadataOptionsDataFragmentDoc = gql`
    fragment IdentifyMetadataOptionsData on IdentifyMetadataOptions {
  fieldOptions {
    ...IdentifyFieldOptionsData
  }
  setCoverImage
  setOrganized
  performerGenders
  skipMultipleMatches
  skipMultipleMatchTag
  skipSingleNamePerformers
  skipSingleNamePerformerTag
}
    ${IdentifyFieldOptionsDataFragmentDoc}`;
export const ConfigDefaultSettingsDataFragmentDoc = gql`
    fragment ConfigDefaultSettingsData on ConfigDefaultSettingsResult {
  scan {
    scanGenerateCovers
    scanGeneratePreviews
    scanGenerateImagePreviews
    scanGenerateSprites
    scanGeneratePhashes
    scanGenerateThumbnails
    scanGenerateClipPreviews
  }
  identify {
    sources {
      source {
        ...ScraperSourceData
      }
      options {
        ...IdentifyMetadataOptionsData
      }
    }
    options {
      ...IdentifyMetadataOptionsData
    }
  }
  autoTag {
    performers
    studios
    tags
  }
  generate {
    covers
    sprites
    previews
    imagePreviews
    previewOptions {
      previewSegments
      previewSegmentDuration
      previewExcludeStart
      previewExcludeEnd
      previewPreset
    }
    markers
    markerImagePreviews
    markerScreenshots
    transcodes
    phashes
    interactiveHeatmapsSpeeds
    clipPreviews
    imageThumbnails
  }
  deleteFile
  deleteGenerated
}
    ${ScraperSourceDataFragmentDoc}
${IdentifyMetadataOptionsDataFragmentDoc}`;
export const ConfigDataFragmentDoc = gql`
    fragment ConfigData on ConfigResult {
  general {
    ...ConfigGeneralData
  }
  interface {
    ...ConfigInterfaceData
  }
  dlna {
    ...ConfigDLNAData
  }
  scraping {
    ...ConfigScrapingData
  }
  defaults {
    ...ConfigDefaultSettingsData
  }
  ui
  plugins
}
    ${ConfigGeneralDataFragmentDoc}
${ConfigInterfaceDataFragmentDoc}
${ConfigDlnaDataFragmentDoc}
${ConfigScrapingDataFragmentDoc}
${ConfigDefaultSettingsDataFragmentDoc}`;
export const FolderDataFragmentDoc = gql`
    fragment FolderData on Folder {
  id
  basename
  path
}
    `;
export const VideoFileDataFragmentDoc = gql`
    fragment VideoFileData on VideoFile {
  id
  path
  size
  mod_time
  duration
  video_codec
  audio_codec
  width
  height
  frame_rate
  bit_rate
  fingerprints {
    type
    value
  }
}
    `;
export const ImageFileDataFragmentDoc = gql`
    fragment ImageFileData on ImageFile {
  id
  path
  size
  mod_time
  width
  height
  fingerprints {
    type
    value
  }
}
    `;
export const GalleryFileDataFragmentDoc = gql`
    fragment GalleryFileData on GalleryFile {
  id
  path
  size
  mod_time
  fingerprints {
    type
    value
  }
}
    `;
export const VisualFileDataFragmentDoc = gql`
    fragment VisualFileData on VisualFile {
  ... on BaseFile {
    id
    path
    size
    mod_time
    fingerprints {
      type
      value
    }
  }
  ... on ImageFile {
    id
    path
    size
    mod_time
    width
    height
    fingerprints {
      type
      value
    }
  }
  ... on VideoFile {
    id
    path
    size
    mod_time
    duration
    video_codec
    audio_codec
    width
    height
    frame_rate
    bit_rate
    fingerprints {
      type
      value
    }
  }
}
    `;
export const SelectFolderDataFragmentDoc = gql`
    fragment SelectFolderData on Folder {
  id
  path
  basename
}
    `;
export const RecursiveFolderDataFragmentDoc = gql`
    fragment RecursiveFolderData on Folder {
  ...SelectFolderData
  parent_folders {
    ...SelectFolderData
  }
}
    ${SelectFolderDataFragmentDoc}`;
export const SavedFilterDataFragmentDoc = gql`
    fragment SavedFilterData on SavedFilter {
  id
  mode
  name
  find_filter {
    q
    page
    per_page
    sort
    direction
  }
  object_filter
  ui_options
}
    `;
export const SelectGroupDataFragmentDoc = gql`
    fragment SelectGroupData on Group {
  id
  name
  aliases
  date
  studio {
    name
  }
  front_image_path
}
    `;
export const SlimPerformerDataFragmentDoc = gql`
    fragment SlimPerformerData on Performer {
  id
  name
  disambiguation
  gender
  urls
  image_path
  favorite
  ignore_auto_tag
  country
  birthdate
  ethnicity
  hair_color
  eye_color
  height_cm
  fake_tits
  penis_length
  circumcised
  career_start
  career_end
  tattoos
  piercings
  alias_list
  tags {
    id
    name
  }
  stash_ids {
    endpoint
    stash_id
    updated_at
  }
  rating100
  death_date
  weight
}
    `;
export const GroupDataFragmentDoc = gql`
    fragment GroupData on Group {
  id
  name
  aliases
  duration
  date
  rating100
  director
  studio {
    ...SlimStudioData
  }
  tags {
    ...SlimTagData
  }
  containing_groups {
    group {
      ...SlimGroupData
    }
    description
  }
  synopsis
  urls
  front_image_path
  back_image_path
  audio_count
  performer_count
  performer_count_all: performer_count(depth: -1)
  sub_group_count
  sub_group_count_all: sub_group_count(depth: -1)
  performers {
    ...SlimPerformerData
  }
  audios {
    ...SlimAudioData
  }
  custom_fields
}
    ${SlimStudioDataFragmentDoc}
${SlimTagDataFragmentDoc}
${SlimGroupDataFragmentDoc}
${SlimPerformerDataFragmentDoc}
${SlimAudioDataFragmentDoc}`;
export const JobDataFragmentDoc = gql`
    fragment JobData on Job {
  id
  status
  subTasks
  description
  progress
  startTime
  endTime
  addTime
  error
}
    `;
export const LogEntryDataFragmentDoc = gql`
    fragment LogEntryData on LogEntry {
  time
  level
  message
}
    `;
export const PackageDataFragmentDoc = gql`
    fragment PackageData on Package {
  package_id
  name
  version
  date
  metadata
  sourceURL
}
    `;
export const SelectPerformerDataFragmentDoc = gql`
    fragment SelectPerformerData on Performer {
  id
  name
  disambiguation
  alias_list
  image_path
  birthdate
  death_date
}
    `;
export const StudioDataFragmentDoc = gql`
    fragment StudioData on Studio {
  id
  name
  url
  urls
  parent_studio {
    id
    name
    url
    urls
    image_path
  }
  child_studios {
    id
    name
    image_path
  }
  ignore_auto_tag
  organized
  image_path
  audio_count
  audio_count_all: audio_count(depth: -1)
  performer_count
  performer_count_all: performer_count(depth: -1)
  group_count
  group_count_all: group_count(depth: -1)
  stash_ids {
    stash_id
    endpoint
    updated_at
  }
  details
  rating100
  favorite
  aliases
  tags {
    ...SlimTagData
  }
  custom_fields
}
    ${SlimTagDataFragmentDoc}`;
export const SelectStudioDataFragmentDoc = gql`
    fragment SelectStudioData on Studio {
  id
  name
  aliases
  details
  image_path
  parent_studio {
    id
    name
  }
}
    `;
export const TagDataFragmentDoc = gql`
    fragment TagData on Tag {
  id
  name
  sort_name
  description
  aliases
  ignore_auto_tag
  favorite
  stash_ids {
    endpoint
    stash_id
    updated_at
  }
  image_path
  audio_count
  audio_count_all: audio_count(depth: -1)
  performer_count
  performer_count_all: performer_count(depth: -1)
  studio_count
  studio_count_all: studio_count(depth: -1)
  group_count
  group_count_all: group_count(depth: -1)
  parents {
    ...SlimTagData
  }
  children {
    ...SlimTagData
  }
  custom_fields
}
    ${SlimTagDataFragmentDoc}`;
export const SelectTagDataFragmentDoc = gql`
    fragment SelectTagData on Tag {
  id
  name
  sort_name
  favorite
  description
  aliases
  image_path
  parents {
    id
    name
    sort_name
  }
  stash_ids {
    endpoint
    stash_id
    updated_at
  }
}
    `;
export const TagListDataFragmentDoc = gql`
    fragment TagListData on Tag {
  id
  name
  sort_name
  description
  aliases
  ignore_auto_tag
  favorite
  stash_ids {
    endpoint
    stash_id
    updated_at
  }
  image_path
  audio_count
  performer_count
  studio_count
  group_count
  parents {
    ...SlimTagData
  }
  children {
    ...SlimTagData
  }
}
    ${SlimTagDataFragmentDoc}`;
export const ScraperDataFragmentDoc = gql`
    fragment ScraperData on Scraper {
  id
  name
  performer {
    urls
    supported_scrapes
  }
  group {
    urls
    supported_scrapes
  }
}
    `;
export const AudioUpdateDocument = gql`
    mutation AudioUpdate($input: AudioUpdateInput!) {
  audioUpdate(input: $input) {
    ...AudioData
  }
}
    ${AudioDataFragmentDoc}`;
export type AudioUpdateMutationFn = Apollo.MutationFunction<AudioUpdateMutation, AudioUpdateMutationVariables>;

/**
 * __useAudioUpdateMutation__
 *
 * To run a mutation, you first call `useAudioUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioUpdateMutation, { data, loading, error }] = useAudioUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAudioUpdateMutation(baseOptions?: Apollo.MutationHookOptions<AudioUpdateMutation, AudioUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioUpdateMutation, AudioUpdateMutationVariables>(AudioUpdateDocument, options);
      }
export type AudioUpdateMutationHookResult = ReturnType<typeof useAudioUpdateMutation>;
export type AudioUpdateMutationResult = Apollo.MutationResult<AudioUpdateMutation>;
export type AudioUpdateMutationOptions = Apollo.BaseMutationOptions<AudioUpdateMutation, AudioUpdateMutationVariables>;
export const BulkAudioUpdateDocument = gql`
    mutation BulkAudioUpdate($input: BulkAudioUpdateInput!) {
  bulkAudioUpdate(input: $input) {
    ...SlimAudioData
  }
}
    ${SlimAudioDataFragmentDoc}`;
export type BulkAudioUpdateMutationFn = Apollo.MutationFunction<BulkAudioUpdateMutation, BulkAudioUpdateMutationVariables>;

/**
 * __useBulkAudioUpdateMutation__
 *
 * To run a mutation, you first call `useBulkAudioUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkAudioUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkAudioUpdateMutation, { data, loading, error }] = useBulkAudioUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBulkAudioUpdateMutation(baseOptions?: Apollo.MutationHookOptions<BulkAudioUpdateMutation, BulkAudioUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkAudioUpdateMutation, BulkAudioUpdateMutationVariables>(BulkAudioUpdateDocument, options);
      }
export type BulkAudioUpdateMutationHookResult = ReturnType<typeof useBulkAudioUpdateMutation>;
export type BulkAudioUpdateMutationResult = Apollo.MutationResult<BulkAudioUpdateMutation>;
export type BulkAudioUpdateMutationOptions = Apollo.BaseMutationOptions<BulkAudioUpdateMutation, BulkAudioUpdateMutationVariables>;
export const AudioIncrementODocument = gql`
    mutation AudioIncrementO($id: ID!) {
  audioIncrementO(id: $id)
}
    `;
export type AudioIncrementOMutationFn = Apollo.MutationFunction<AudioIncrementOMutation, AudioIncrementOMutationVariables>;

/**
 * __useAudioIncrementOMutation__
 *
 * To run a mutation, you first call `useAudioIncrementOMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioIncrementOMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioIncrementOMutation, { data, loading, error }] = useAudioIncrementOMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAudioIncrementOMutation(baseOptions?: Apollo.MutationHookOptions<AudioIncrementOMutation, AudioIncrementOMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioIncrementOMutation, AudioIncrementOMutationVariables>(AudioIncrementODocument, options);
      }
export type AudioIncrementOMutationHookResult = ReturnType<typeof useAudioIncrementOMutation>;
export type AudioIncrementOMutationResult = Apollo.MutationResult<AudioIncrementOMutation>;
export type AudioIncrementOMutationOptions = Apollo.BaseMutationOptions<AudioIncrementOMutation, AudioIncrementOMutationVariables>;
export const AudioDecrementODocument = gql`
    mutation AudioDecrementO($id: ID!) {
  audioDecrementO(id: $id)
}
    `;
export type AudioDecrementOMutationFn = Apollo.MutationFunction<AudioDecrementOMutation, AudioDecrementOMutationVariables>;

/**
 * __useAudioDecrementOMutation__
 *
 * To run a mutation, you first call `useAudioDecrementOMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioDecrementOMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioDecrementOMutation, { data, loading, error }] = useAudioDecrementOMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAudioDecrementOMutation(baseOptions?: Apollo.MutationHookOptions<AudioDecrementOMutation, AudioDecrementOMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioDecrementOMutation, AudioDecrementOMutationVariables>(AudioDecrementODocument, options);
      }
export type AudioDecrementOMutationHookResult = ReturnType<typeof useAudioDecrementOMutation>;
export type AudioDecrementOMutationResult = Apollo.MutationResult<AudioDecrementOMutation>;
export type AudioDecrementOMutationOptions = Apollo.BaseMutationOptions<AudioDecrementOMutation, AudioDecrementOMutationVariables>;
export const AudioResetODocument = gql`
    mutation AudioResetO($id: ID!) {
  audioResetO(id: $id)
}
    `;
export type AudioResetOMutationFn = Apollo.MutationFunction<AudioResetOMutation, AudioResetOMutationVariables>;

/**
 * __useAudioResetOMutation__
 *
 * To run a mutation, you first call `useAudioResetOMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioResetOMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioResetOMutation, { data, loading, error }] = useAudioResetOMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAudioResetOMutation(baseOptions?: Apollo.MutationHookOptions<AudioResetOMutation, AudioResetOMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioResetOMutation, AudioResetOMutationVariables>(AudioResetODocument, options);
      }
export type AudioResetOMutationHookResult = ReturnType<typeof useAudioResetOMutation>;
export type AudioResetOMutationResult = Apollo.MutationResult<AudioResetOMutation>;
export type AudioResetOMutationOptions = Apollo.BaseMutationOptions<AudioResetOMutation, AudioResetOMutationVariables>;
export const AudioSaveActivityDocument = gql`
    mutation AudioSaveActivity($id: ID!, $resume_time: Float, $playDuration: Float) {
  audioSaveActivity(
    id: $id
    resume_time: $resume_time
    playDuration: $playDuration
  )
}
    `;
export type AudioSaveActivityMutationFn = Apollo.MutationFunction<AudioSaveActivityMutation, AudioSaveActivityMutationVariables>;

/**
 * __useAudioSaveActivityMutation__
 *
 * To run a mutation, you first call `useAudioSaveActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioSaveActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioSaveActivityMutation, { data, loading, error }] = useAudioSaveActivityMutation({
 *   variables: {
 *      id: // value for 'id'
 *      resume_time: // value for 'resume_time'
 *      playDuration: // value for 'playDuration'
 *   },
 * });
 */
export function useAudioSaveActivityMutation(baseOptions?: Apollo.MutationHookOptions<AudioSaveActivityMutation, AudioSaveActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioSaveActivityMutation, AudioSaveActivityMutationVariables>(AudioSaveActivityDocument, options);
      }
export type AudioSaveActivityMutationHookResult = ReturnType<typeof useAudioSaveActivityMutation>;
export type AudioSaveActivityMutationResult = Apollo.MutationResult<AudioSaveActivityMutation>;
export type AudioSaveActivityMutationOptions = Apollo.BaseMutationOptions<AudioSaveActivityMutation, AudioSaveActivityMutationVariables>;
export const AudioIncrementPlayCountDocument = gql`
    mutation AudioIncrementPlayCount($id: ID!) {
  audioIncrementPlayCount(id: $id)
}
    `;
export type AudioIncrementPlayCountMutationFn = Apollo.MutationFunction<AudioIncrementPlayCountMutation, AudioIncrementPlayCountMutationVariables>;

/**
 * __useAudioIncrementPlayCountMutation__
 *
 * To run a mutation, you first call `useAudioIncrementPlayCountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioIncrementPlayCountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioIncrementPlayCountMutation, { data, loading, error }] = useAudioIncrementPlayCountMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useAudioIncrementPlayCountMutation(baseOptions?: Apollo.MutationHookOptions<AudioIncrementPlayCountMutation, AudioIncrementPlayCountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioIncrementPlayCountMutation, AudioIncrementPlayCountMutationVariables>(AudioIncrementPlayCountDocument, options);
      }
export type AudioIncrementPlayCountMutationHookResult = ReturnType<typeof useAudioIncrementPlayCountMutation>;
export type AudioIncrementPlayCountMutationResult = Apollo.MutationResult<AudioIncrementPlayCountMutation>;
export type AudioIncrementPlayCountMutationOptions = Apollo.BaseMutationOptions<AudioIncrementPlayCountMutation, AudioIncrementPlayCountMutationVariables>;
export const AudioDestroyDocument = gql`
    mutation AudioDestroy($id: ID!, $delete_file: Boolean, $delete_generated: Boolean) {
  audioDestroy(
    input: {id: $id, delete_file: $delete_file, delete_generated: $delete_generated}
  )
}
    `;
export type AudioDestroyMutationFn = Apollo.MutationFunction<AudioDestroyMutation, AudioDestroyMutationVariables>;

/**
 * __useAudioDestroyMutation__
 *
 * To run a mutation, you first call `useAudioDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioDestroyMutation, { data, loading, error }] = useAudioDestroyMutation({
 *   variables: {
 *      id: // value for 'id'
 *      delete_file: // value for 'delete_file'
 *      delete_generated: // value for 'delete_generated'
 *   },
 * });
 */
export function useAudioDestroyMutation(baseOptions?: Apollo.MutationHookOptions<AudioDestroyMutation, AudioDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioDestroyMutation, AudioDestroyMutationVariables>(AudioDestroyDocument, options);
      }
export type AudioDestroyMutationHookResult = ReturnType<typeof useAudioDestroyMutation>;
export type AudioDestroyMutationResult = Apollo.MutationResult<AudioDestroyMutation>;
export type AudioDestroyMutationOptions = Apollo.BaseMutationOptions<AudioDestroyMutation, AudioDestroyMutationVariables>;
export const AudiosDestroyDocument = gql`
    mutation AudiosDestroy($ids: [ID!]!, $delete_file: Boolean, $delete_generated: Boolean) {
  audiosDestroy(
    input: {ids: $ids, delete_file: $delete_file, delete_generated: $delete_generated}
  )
}
    `;
export type AudiosDestroyMutationFn = Apollo.MutationFunction<AudiosDestroyMutation, AudiosDestroyMutationVariables>;

/**
 * __useAudiosDestroyMutation__
 *
 * To run a mutation, you first call `useAudiosDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudiosDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audiosDestroyMutation, { data, loading, error }] = useAudiosDestroyMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *      delete_file: // value for 'delete_file'
 *      delete_generated: // value for 'delete_generated'
 *   },
 * });
 */
export function useAudiosDestroyMutation(baseOptions?: Apollo.MutationHookOptions<AudiosDestroyMutation, AudiosDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudiosDestroyMutation, AudiosDestroyMutationVariables>(AudiosDestroyDocument, options);
      }
export type AudiosDestroyMutationHookResult = ReturnType<typeof useAudiosDestroyMutation>;
export type AudiosDestroyMutationResult = Apollo.MutationResult<AudiosDestroyMutation>;
export type AudiosDestroyMutationOptions = Apollo.BaseMutationOptions<AudiosDestroyMutation, AudiosDestroyMutationVariables>;
export const AudioAssignFileDocument = gql`
    mutation AudioAssignFile($input: AssignAudioFileInput!) {
  audioAssignFile(input: $input)
}
    `;
export type AudioAssignFileMutationFn = Apollo.MutationFunction<AudioAssignFileMutation, AudioAssignFileMutationVariables>;

/**
 * __useAudioAssignFileMutation__
 *
 * To run a mutation, you first call `useAudioAssignFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAudioAssignFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [audioAssignFileMutation, { data, loading, error }] = useAudioAssignFileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAudioAssignFileMutation(baseOptions?: Apollo.MutationHookOptions<AudioAssignFileMutation, AudioAssignFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AudioAssignFileMutation, AudioAssignFileMutationVariables>(AudioAssignFileDocument, options);
      }
export type AudioAssignFileMutationHookResult = ReturnType<typeof useAudioAssignFileMutation>;
export type AudioAssignFileMutationResult = Apollo.MutationResult<AudioAssignFileMutation>;
export type AudioAssignFileMutationOptions = Apollo.BaseMutationOptions<AudioAssignFileMutation, AudioAssignFileMutationVariables>;
export const SetupDocument = gql`
    mutation Setup($input: SetupInput!) {
  setup(input: $input)
}
    `;
export type SetupMutationFn = Apollo.MutationFunction<SetupMutation, SetupMutationVariables>;

/**
 * __useSetupMutation__
 *
 * To run a mutation, you first call `useSetupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupMutation, { data, loading, error }] = useSetupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetupMutation(baseOptions?: Apollo.MutationHookOptions<SetupMutation, SetupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetupMutation, SetupMutationVariables>(SetupDocument, options);
      }
export type SetupMutationHookResult = ReturnType<typeof useSetupMutation>;
export type SetupMutationResult = Apollo.MutationResult<SetupMutation>;
export type SetupMutationOptions = Apollo.BaseMutationOptions<SetupMutation, SetupMutationVariables>;
export const MigrateDocument = gql`
    mutation Migrate($input: MigrateInput!) {
  migrate(input: $input)
}
    `;
export type MigrateMutationFn = Apollo.MutationFunction<MigrateMutation, MigrateMutationVariables>;

/**
 * __useMigrateMutation__
 *
 * To run a mutation, you first call `useMigrateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMigrateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [migrateMutation, { data, loading, error }] = useMigrateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMigrateMutation(baseOptions?: Apollo.MutationHookOptions<MigrateMutation, MigrateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MigrateMutation, MigrateMutationVariables>(MigrateDocument, options);
      }
export type MigrateMutationHookResult = ReturnType<typeof useMigrateMutation>;
export type MigrateMutationResult = Apollo.MutationResult<MigrateMutation>;
export type MigrateMutationOptions = Apollo.BaseMutationOptions<MigrateMutation, MigrateMutationVariables>;
export const DownloadFfMpegDocument = gql`
    mutation DownloadFFMpeg {
  downloadFFMpeg
}
    `;
export type DownloadFfMpegMutationFn = Apollo.MutationFunction<DownloadFfMpegMutation, DownloadFfMpegMutationVariables>;

/**
 * __useDownloadFfMpegMutation__
 *
 * To run a mutation, you first call `useDownloadFfMpegMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDownloadFfMpegMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [downloadFfMpegMutation, { data, loading, error }] = useDownloadFfMpegMutation({
 *   variables: {
 *   },
 * });
 */
export function useDownloadFfMpegMutation(baseOptions?: Apollo.MutationHookOptions<DownloadFfMpegMutation, DownloadFfMpegMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DownloadFfMpegMutation, DownloadFfMpegMutationVariables>(DownloadFfMpegDocument, options);
      }
export type DownloadFfMpegMutationHookResult = ReturnType<typeof useDownloadFfMpegMutation>;
export type DownloadFfMpegMutationResult = Apollo.MutationResult<DownloadFfMpegMutation>;
export type DownloadFfMpegMutationOptions = Apollo.BaseMutationOptions<DownloadFfMpegMutation, DownloadFfMpegMutationVariables>;
export const ConfigureGeneralDocument = gql`
    mutation ConfigureGeneral($input: ConfigGeneralInput!) {
  configureGeneral(input: $input) {
    ...ConfigGeneralData
  }
}
    ${ConfigGeneralDataFragmentDoc}`;
export type ConfigureGeneralMutationFn = Apollo.MutationFunction<ConfigureGeneralMutation, ConfigureGeneralMutationVariables>;

/**
 * __useConfigureGeneralMutation__
 *
 * To run a mutation, you first call `useConfigureGeneralMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureGeneralMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureGeneralMutation, { data, loading, error }] = useConfigureGeneralMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfigureGeneralMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureGeneralMutation, ConfigureGeneralMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureGeneralMutation, ConfigureGeneralMutationVariables>(ConfigureGeneralDocument, options);
      }
export type ConfigureGeneralMutationHookResult = ReturnType<typeof useConfigureGeneralMutation>;
export type ConfigureGeneralMutationResult = Apollo.MutationResult<ConfigureGeneralMutation>;
export type ConfigureGeneralMutationOptions = Apollo.BaseMutationOptions<ConfigureGeneralMutation, ConfigureGeneralMutationVariables>;
export const ConfigureInterfaceDocument = gql`
    mutation ConfigureInterface($input: ConfigInterfaceInput!) {
  configureInterface(input: $input) {
    ...ConfigInterfaceData
  }
}
    ${ConfigInterfaceDataFragmentDoc}`;
export type ConfigureInterfaceMutationFn = Apollo.MutationFunction<ConfigureInterfaceMutation, ConfigureInterfaceMutationVariables>;

/**
 * __useConfigureInterfaceMutation__
 *
 * To run a mutation, you first call `useConfigureInterfaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureInterfaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureInterfaceMutation, { data, loading, error }] = useConfigureInterfaceMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfigureInterfaceMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureInterfaceMutation, ConfigureInterfaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureInterfaceMutation, ConfigureInterfaceMutationVariables>(ConfigureInterfaceDocument, options);
      }
export type ConfigureInterfaceMutationHookResult = ReturnType<typeof useConfigureInterfaceMutation>;
export type ConfigureInterfaceMutationResult = Apollo.MutationResult<ConfigureInterfaceMutation>;
export type ConfigureInterfaceMutationOptions = Apollo.BaseMutationOptions<ConfigureInterfaceMutation, ConfigureInterfaceMutationVariables>;
export const ConfigureDlnaDocument = gql`
    mutation ConfigureDLNA($input: ConfigDLNAInput!) {
  configureDLNA(input: $input) {
    ...ConfigDLNAData
  }
}
    ${ConfigDlnaDataFragmentDoc}`;
export type ConfigureDlnaMutationFn = Apollo.MutationFunction<ConfigureDlnaMutation, ConfigureDlnaMutationVariables>;

/**
 * __useConfigureDlnaMutation__
 *
 * To run a mutation, you first call `useConfigureDlnaMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureDlnaMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureDlnaMutation, { data, loading, error }] = useConfigureDlnaMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfigureDlnaMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureDlnaMutation, ConfigureDlnaMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureDlnaMutation, ConfigureDlnaMutationVariables>(ConfigureDlnaDocument, options);
      }
export type ConfigureDlnaMutationHookResult = ReturnType<typeof useConfigureDlnaMutation>;
export type ConfigureDlnaMutationResult = Apollo.MutationResult<ConfigureDlnaMutation>;
export type ConfigureDlnaMutationOptions = Apollo.BaseMutationOptions<ConfigureDlnaMutation, ConfigureDlnaMutationVariables>;
export const ConfigureScrapingDocument = gql`
    mutation ConfigureScraping($input: ConfigScrapingInput!) {
  configureScraping(input: $input) {
    ...ConfigScrapingData
  }
}
    ${ConfigScrapingDataFragmentDoc}`;
export type ConfigureScrapingMutationFn = Apollo.MutationFunction<ConfigureScrapingMutation, ConfigureScrapingMutationVariables>;

/**
 * __useConfigureScrapingMutation__
 *
 * To run a mutation, you first call `useConfigureScrapingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureScrapingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureScrapingMutation, { data, loading, error }] = useConfigureScrapingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfigureScrapingMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureScrapingMutation, ConfigureScrapingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureScrapingMutation, ConfigureScrapingMutationVariables>(ConfigureScrapingDocument, options);
      }
export type ConfigureScrapingMutationHookResult = ReturnType<typeof useConfigureScrapingMutation>;
export type ConfigureScrapingMutationResult = Apollo.MutationResult<ConfigureScrapingMutation>;
export type ConfigureScrapingMutationOptions = Apollo.BaseMutationOptions<ConfigureScrapingMutation, ConfigureScrapingMutationVariables>;
export const ConfigureDefaultsDocument = gql`
    mutation ConfigureDefaults($input: ConfigDefaultSettingsInput!) {
  configureDefaults(input: $input) {
    ...ConfigDefaultSettingsData
  }
}
    ${ConfigDefaultSettingsDataFragmentDoc}`;
export type ConfigureDefaultsMutationFn = Apollo.MutationFunction<ConfigureDefaultsMutation, ConfigureDefaultsMutationVariables>;

/**
 * __useConfigureDefaultsMutation__
 *
 * To run a mutation, you first call `useConfigureDefaultsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureDefaultsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureDefaultsMutation, { data, loading, error }] = useConfigureDefaultsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfigureDefaultsMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureDefaultsMutation, ConfigureDefaultsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureDefaultsMutation, ConfigureDefaultsMutationVariables>(ConfigureDefaultsDocument, options);
      }
export type ConfigureDefaultsMutationHookResult = ReturnType<typeof useConfigureDefaultsMutation>;
export type ConfigureDefaultsMutationResult = Apollo.MutationResult<ConfigureDefaultsMutation>;
export type ConfigureDefaultsMutationOptions = Apollo.BaseMutationOptions<ConfigureDefaultsMutation, ConfigureDefaultsMutationVariables>;
export const ConfigureUiDocument = gql`
    mutation ConfigureUI($input: Map, $partial: Map) {
  configureUI(input: $input, partial: $partial)
}
    `;
export type ConfigureUiMutationFn = Apollo.MutationFunction<ConfigureUiMutation, ConfigureUiMutationVariables>;

/**
 * __useConfigureUiMutation__
 *
 * To run a mutation, you first call `useConfigureUiMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureUiMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureUiMutation, { data, loading, error }] = useConfigureUiMutation({
 *   variables: {
 *      input: // value for 'input'
 *      partial: // value for 'partial'
 *   },
 * });
 */
export function useConfigureUiMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureUiMutation, ConfigureUiMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureUiMutation, ConfigureUiMutationVariables>(ConfigureUiDocument, options);
      }
export type ConfigureUiMutationHookResult = ReturnType<typeof useConfigureUiMutation>;
export type ConfigureUiMutationResult = Apollo.MutationResult<ConfigureUiMutation>;
export type ConfigureUiMutationOptions = Apollo.BaseMutationOptions<ConfigureUiMutation, ConfigureUiMutationVariables>;
export const ConfigureUiSettingDocument = gql`
    mutation ConfigureUISetting($key: String!, $value: Any) {
  configureUISetting(key: $key, value: $value)
}
    `;
export type ConfigureUiSettingMutationFn = Apollo.MutationFunction<ConfigureUiSettingMutation, ConfigureUiSettingMutationVariables>;

/**
 * __useConfigureUiSettingMutation__
 *
 * To run a mutation, you first call `useConfigureUiSettingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigureUiSettingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configureUiSettingMutation, { data, loading, error }] = useConfigureUiSettingMutation({
 *   variables: {
 *      key: // value for 'key'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useConfigureUiSettingMutation(baseOptions?: Apollo.MutationHookOptions<ConfigureUiSettingMutation, ConfigureUiSettingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigureUiSettingMutation, ConfigureUiSettingMutationVariables>(ConfigureUiSettingDocument, options);
      }
export type ConfigureUiSettingMutationHookResult = ReturnType<typeof useConfigureUiSettingMutation>;
export type ConfigureUiSettingMutationResult = Apollo.MutationResult<ConfigureUiSettingMutation>;
export type ConfigureUiSettingMutationOptions = Apollo.BaseMutationOptions<ConfigureUiSettingMutation, ConfigureUiSettingMutationVariables>;
export const GenerateApiKeyDocument = gql`
    mutation GenerateAPIKey($input: GenerateAPIKeyInput!) {
  generateAPIKey(input: $input)
}
    `;
export type GenerateApiKeyMutationFn = Apollo.MutationFunction<GenerateApiKeyMutation, GenerateApiKeyMutationVariables>;

/**
 * __useGenerateApiKeyMutation__
 *
 * To run a mutation, you first call `useGenerateApiKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateApiKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateApiKeyMutation, { data, loading, error }] = useGenerateApiKeyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateApiKeyMutation(baseOptions?: Apollo.MutationHookOptions<GenerateApiKeyMutation, GenerateApiKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateApiKeyMutation, GenerateApiKeyMutationVariables>(GenerateApiKeyDocument, options);
      }
export type GenerateApiKeyMutationHookResult = ReturnType<typeof useGenerateApiKeyMutation>;
export type GenerateApiKeyMutationResult = Apollo.MutationResult<GenerateApiKeyMutation>;
export type GenerateApiKeyMutationOptions = Apollo.BaseMutationOptions<GenerateApiKeyMutation, GenerateApiKeyMutationVariables>;
export const DeleteFilesDocument = gql`
    mutation DeleteFiles($ids: [ID!]!) {
  deleteFiles(ids: $ids)
}
    `;
export type DeleteFilesMutationFn = Apollo.MutationFunction<DeleteFilesMutation, DeleteFilesMutationVariables>;

/**
 * __useDeleteFilesMutation__
 *
 * To run a mutation, you first call `useDeleteFilesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFilesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFilesMutation, { data, loading, error }] = useDeleteFilesMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFilesMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFilesMutation, DeleteFilesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFilesMutation, DeleteFilesMutationVariables>(DeleteFilesDocument, options);
      }
export type DeleteFilesMutationHookResult = ReturnType<typeof useDeleteFilesMutation>;
export type DeleteFilesMutationResult = Apollo.MutationResult<DeleteFilesMutation>;
export type DeleteFilesMutationOptions = Apollo.BaseMutationOptions<DeleteFilesMutation, DeleteFilesMutationVariables>;
export const RevealFileInFileManagerDocument = gql`
    mutation RevealFileInFileManager($id: ID!) {
  revealFileInFileManager(id: $id)
}
    `;
export type RevealFileInFileManagerMutationFn = Apollo.MutationFunction<RevealFileInFileManagerMutation, RevealFileInFileManagerMutationVariables>;

/**
 * __useRevealFileInFileManagerMutation__
 *
 * To run a mutation, you first call `useRevealFileInFileManagerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevealFileInFileManagerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revealFileInFileManagerMutation, { data, loading, error }] = useRevealFileInFileManagerMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRevealFileInFileManagerMutation(baseOptions?: Apollo.MutationHookOptions<RevealFileInFileManagerMutation, RevealFileInFileManagerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevealFileInFileManagerMutation, RevealFileInFileManagerMutationVariables>(RevealFileInFileManagerDocument, options);
      }
export type RevealFileInFileManagerMutationHookResult = ReturnType<typeof useRevealFileInFileManagerMutation>;
export type RevealFileInFileManagerMutationResult = Apollo.MutationResult<RevealFileInFileManagerMutation>;
export type RevealFileInFileManagerMutationOptions = Apollo.BaseMutationOptions<RevealFileInFileManagerMutation, RevealFileInFileManagerMutationVariables>;
export const RevealFolderInFileManagerDocument = gql`
    mutation RevealFolderInFileManager($id: ID!) {
  revealFolderInFileManager(id: $id)
}
    `;
export type RevealFolderInFileManagerMutationFn = Apollo.MutationFunction<RevealFolderInFileManagerMutation, RevealFolderInFileManagerMutationVariables>;

/**
 * __useRevealFolderInFileManagerMutation__
 *
 * To run a mutation, you first call `useRevealFolderInFileManagerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevealFolderInFileManagerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revealFolderInFileManagerMutation, { data, loading, error }] = useRevealFolderInFileManagerMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRevealFolderInFileManagerMutation(baseOptions?: Apollo.MutationHookOptions<RevealFolderInFileManagerMutation, RevealFolderInFileManagerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevealFolderInFileManagerMutation, RevealFolderInFileManagerMutationVariables>(RevealFolderInFileManagerDocument, options);
      }
export type RevealFolderInFileManagerMutationHookResult = ReturnType<typeof useRevealFolderInFileManagerMutation>;
export type RevealFolderInFileManagerMutationResult = Apollo.MutationResult<RevealFolderInFileManagerMutation>;
export type RevealFolderInFileManagerMutationOptions = Apollo.BaseMutationOptions<RevealFolderInFileManagerMutation, RevealFolderInFileManagerMutationVariables>;
export const SaveFilterDocument = gql`
    mutation SaveFilter($input: SaveFilterInput!) {
  saveFilter(input: $input) {
    ...SavedFilterData
  }
}
    ${SavedFilterDataFragmentDoc}`;
export type SaveFilterMutationFn = Apollo.MutationFunction<SaveFilterMutation, SaveFilterMutationVariables>;

/**
 * __useSaveFilterMutation__
 *
 * To run a mutation, you first call `useSaveFilterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveFilterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveFilterMutation, { data, loading, error }] = useSaveFilterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSaveFilterMutation(baseOptions?: Apollo.MutationHookOptions<SaveFilterMutation, SaveFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SaveFilterMutation, SaveFilterMutationVariables>(SaveFilterDocument, options);
      }
export type SaveFilterMutationHookResult = ReturnType<typeof useSaveFilterMutation>;
export type SaveFilterMutationResult = Apollo.MutationResult<SaveFilterMutation>;
export type SaveFilterMutationOptions = Apollo.BaseMutationOptions<SaveFilterMutation, SaveFilterMutationVariables>;
export const DestroySavedFilterDocument = gql`
    mutation DestroySavedFilter($input: DestroyFilterInput!) {
  destroySavedFilter(input: $input)
}
    `;
export type DestroySavedFilterMutationFn = Apollo.MutationFunction<DestroySavedFilterMutation, DestroySavedFilterMutationVariables>;

/**
 * __useDestroySavedFilterMutation__
 *
 * To run a mutation, you first call `useDestroySavedFilterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroySavedFilterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroySavedFilterMutation, { data, loading, error }] = useDestroySavedFilterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDestroySavedFilterMutation(baseOptions?: Apollo.MutationHookOptions<DestroySavedFilterMutation, DestroySavedFilterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroySavedFilterMutation, DestroySavedFilterMutationVariables>(DestroySavedFilterDocument, options);
      }
export type DestroySavedFilterMutationHookResult = ReturnType<typeof useDestroySavedFilterMutation>;
export type DestroySavedFilterMutationResult = Apollo.MutationResult<DestroySavedFilterMutation>;
export type DestroySavedFilterMutationOptions = Apollo.BaseMutationOptions<DestroySavedFilterMutation, DestroySavedFilterMutationVariables>;
export const GroupCreateDocument = gql`
    mutation GroupCreate($input: GroupCreateInput!) {
  groupCreate(input: $input) {
    ...GroupData
  }
}
    ${GroupDataFragmentDoc}`;
export type GroupCreateMutationFn = Apollo.MutationFunction<GroupCreateMutation, GroupCreateMutationVariables>;

/**
 * __useGroupCreateMutation__
 *
 * To run a mutation, you first call `useGroupCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGroupCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [groupCreateMutation, { data, loading, error }] = useGroupCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGroupCreateMutation(baseOptions?: Apollo.MutationHookOptions<GroupCreateMutation, GroupCreateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GroupCreateMutation, GroupCreateMutationVariables>(GroupCreateDocument, options);
      }
export type GroupCreateMutationHookResult = ReturnType<typeof useGroupCreateMutation>;
export type GroupCreateMutationResult = Apollo.MutationResult<GroupCreateMutation>;
export type GroupCreateMutationOptions = Apollo.BaseMutationOptions<GroupCreateMutation, GroupCreateMutationVariables>;
export const GroupUpdateDocument = gql`
    mutation GroupUpdate($input: GroupUpdateInput!) {
  groupUpdate(input: $input) {
    ...GroupData
  }
}
    ${GroupDataFragmentDoc}`;
export type GroupUpdateMutationFn = Apollo.MutationFunction<GroupUpdateMutation, GroupUpdateMutationVariables>;

/**
 * __useGroupUpdateMutation__
 *
 * To run a mutation, you first call `useGroupUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGroupUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [groupUpdateMutation, { data, loading, error }] = useGroupUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGroupUpdateMutation(baseOptions?: Apollo.MutationHookOptions<GroupUpdateMutation, GroupUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GroupUpdateMutation, GroupUpdateMutationVariables>(GroupUpdateDocument, options);
      }
export type GroupUpdateMutationHookResult = ReturnType<typeof useGroupUpdateMutation>;
export type GroupUpdateMutationResult = Apollo.MutationResult<GroupUpdateMutation>;
export type GroupUpdateMutationOptions = Apollo.BaseMutationOptions<GroupUpdateMutation, GroupUpdateMutationVariables>;
export const BulkGroupUpdateDocument = gql`
    mutation BulkGroupUpdate($input: BulkGroupUpdateInput!) {
  bulkGroupUpdate(input: $input) {
    ...GroupData
  }
}
    ${GroupDataFragmentDoc}`;
export type BulkGroupUpdateMutationFn = Apollo.MutationFunction<BulkGroupUpdateMutation, BulkGroupUpdateMutationVariables>;

/**
 * __useBulkGroupUpdateMutation__
 *
 * To run a mutation, you first call `useBulkGroupUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkGroupUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkGroupUpdateMutation, { data, loading, error }] = useBulkGroupUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBulkGroupUpdateMutation(baseOptions?: Apollo.MutationHookOptions<BulkGroupUpdateMutation, BulkGroupUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkGroupUpdateMutation, BulkGroupUpdateMutationVariables>(BulkGroupUpdateDocument, options);
      }
export type BulkGroupUpdateMutationHookResult = ReturnType<typeof useBulkGroupUpdateMutation>;
export type BulkGroupUpdateMutationResult = Apollo.MutationResult<BulkGroupUpdateMutation>;
export type BulkGroupUpdateMutationOptions = Apollo.BaseMutationOptions<BulkGroupUpdateMutation, BulkGroupUpdateMutationVariables>;
export const GroupDestroyDocument = gql`
    mutation GroupDestroy($id: ID!) {
  groupDestroy(input: {id: $id})
}
    `;
export type GroupDestroyMutationFn = Apollo.MutationFunction<GroupDestroyMutation, GroupDestroyMutationVariables>;

/**
 * __useGroupDestroyMutation__
 *
 * To run a mutation, you first call `useGroupDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGroupDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [groupDestroyMutation, { data, loading, error }] = useGroupDestroyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupDestroyMutation(baseOptions?: Apollo.MutationHookOptions<GroupDestroyMutation, GroupDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GroupDestroyMutation, GroupDestroyMutationVariables>(GroupDestroyDocument, options);
      }
export type GroupDestroyMutationHookResult = ReturnType<typeof useGroupDestroyMutation>;
export type GroupDestroyMutationResult = Apollo.MutationResult<GroupDestroyMutation>;
export type GroupDestroyMutationOptions = Apollo.BaseMutationOptions<GroupDestroyMutation, GroupDestroyMutationVariables>;
export const GroupsDestroyDocument = gql`
    mutation GroupsDestroy($ids: [ID!]!) {
  groupsDestroy(ids: $ids)
}
    `;
export type GroupsDestroyMutationFn = Apollo.MutationFunction<GroupsDestroyMutation, GroupsDestroyMutationVariables>;

/**
 * __useGroupsDestroyMutation__
 *
 * To run a mutation, you first call `useGroupsDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGroupsDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [groupsDestroyMutation, { data, loading, error }] = useGroupsDestroyMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useGroupsDestroyMutation(baseOptions?: Apollo.MutationHookOptions<GroupsDestroyMutation, GroupsDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GroupsDestroyMutation, GroupsDestroyMutationVariables>(GroupsDestroyDocument, options);
      }
export type GroupsDestroyMutationHookResult = ReturnType<typeof useGroupsDestroyMutation>;
export type GroupsDestroyMutationResult = Apollo.MutationResult<GroupsDestroyMutation>;
export type GroupsDestroyMutationOptions = Apollo.BaseMutationOptions<GroupsDestroyMutation, GroupsDestroyMutationVariables>;
export const AddGroupSubGroupsDocument = gql`
    mutation AddGroupSubGroups($input: GroupSubGroupAddInput!) {
  addGroupSubGroups(input: $input)
}
    `;
export type AddGroupSubGroupsMutationFn = Apollo.MutationFunction<AddGroupSubGroupsMutation, AddGroupSubGroupsMutationVariables>;

/**
 * __useAddGroupSubGroupsMutation__
 *
 * To run a mutation, you first call `useAddGroupSubGroupsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddGroupSubGroupsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addGroupSubGroupsMutation, { data, loading, error }] = useAddGroupSubGroupsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddGroupSubGroupsMutation(baseOptions?: Apollo.MutationHookOptions<AddGroupSubGroupsMutation, AddGroupSubGroupsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddGroupSubGroupsMutation, AddGroupSubGroupsMutationVariables>(AddGroupSubGroupsDocument, options);
      }
export type AddGroupSubGroupsMutationHookResult = ReturnType<typeof useAddGroupSubGroupsMutation>;
export type AddGroupSubGroupsMutationResult = Apollo.MutationResult<AddGroupSubGroupsMutation>;
export type AddGroupSubGroupsMutationOptions = Apollo.BaseMutationOptions<AddGroupSubGroupsMutation, AddGroupSubGroupsMutationVariables>;
export const RemoveGroupSubGroupsDocument = gql`
    mutation RemoveGroupSubGroups($input: GroupSubGroupRemoveInput!) {
  removeGroupSubGroups(input: $input)
}
    `;
export type RemoveGroupSubGroupsMutationFn = Apollo.MutationFunction<RemoveGroupSubGroupsMutation, RemoveGroupSubGroupsMutationVariables>;

/**
 * __useRemoveGroupSubGroupsMutation__
 *
 * To run a mutation, you first call `useRemoveGroupSubGroupsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveGroupSubGroupsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeGroupSubGroupsMutation, { data, loading, error }] = useRemoveGroupSubGroupsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveGroupSubGroupsMutation(baseOptions?: Apollo.MutationHookOptions<RemoveGroupSubGroupsMutation, RemoveGroupSubGroupsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveGroupSubGroupsMutation, RemoveGroupSubGroupsMutationVariables>(RemoveGroupSubGroupsDocument, options);
      }
export type RemoveGroupSubGroupsMutationHookResult = ReturnType<typeof useRemoveGroupSubGroupsMutation>;
export type RemoveGroupSubGroupsMutationResult = Apollo.MutationResult<RemoveGroupSubGroupsMutation>;
export type RemoveGroupSubGroupsMutationOptions = Apollo.BaseMutationOptions<RemoveGroupSubGroupsMutation, RemoveGroupSubGroupsMutationVariables>;
export const ReorderSubGroupsDocument = gql`
    mutation ReorderSubGroups($input: ReorderSubGroupsInput!) {
  reorderSubGroups(input: $input)
}
    `;
export type ReorderSubGroupsMutationFn = Apollo.MutationFunction<ReorderSubGroupsMutation, ReorderSubGroupsMutationVariables>;

/**
 * __useReorderSubGroupsMutation__
 *
 * To run a mutation, you first call `useReorderSubGroupsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReorderSubGroupsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reorderSubGroupsMutation, { data, loading, error }] = useReorderSubGroupsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useReorderSubGroupsMutation(baseOptions?: Apollo.MutationHookOptions<ReorderSubGroupsMutation, ReorderSubGroupsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReorderSubGroupsMutation, ReorderSubGroupsMutationVariables>(ReorderSubGroupsDocument, options);
      }
export type ReorderSubGroupsMutationHookResult = ReturnType<typeof useReorderSubGroupsMutation>;
export type ReorderSubGroupsMutationResult = Apollo.MutationResult<ReorderSubGroupsMutation>;
export type ReorderSubGroupsMutationOptions = Apollo.BaseMutationOptions<ReorderSubGroupsMutation, ReorderSubGroupsMutationVariables>;
export const StopJobDocument = gql`
    mutation StopJob($job_id: ID!) {
  stopJob(job_id: $job_id)
}
    `;
export type StopJobMutationFn = Apollo.MutationFunction<StopJobMutation, StopJobMutationVariables>;

/**
 * __useStopJobMutation__
 *
 * To run a mutation, you first call `useStopJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStopJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [stopJobMutation, { data, loading, error }] = useStopJobMutation({
 *   variables: {
 *      job_id: // value for 'job_id'
 *   },
 * });
 */
export function useStopJobMutation(baseOptions?: Apollo.MutationHookOptions<StopJobMutation, StopJobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StopJobMutation, StopJobMutationVariables>(StopJobDocument, options);
      }
export type StopJobMutationHookResult = ReturnType<typeof useStopJobMutation>;
export type StopJobMutationResult = Apollo.MutationResult<StopJobMutation>;
export type StopJobMutationOptions = Apollo.BaseMutationOptions<StopJobMutation, StopJobMutationVariables>;
export const StopAllJobsDocument = gql`
    mutation StopAllJobs {
  stopAllJobs
}
    `;
export type StopAllJobsMutationFn = Apollo.MutationFunction<StopAllJobsMutation, StopAllJobsMutationVariables>;

/**
 * __useStopAllJobsMutation__
 *
 * To run a mutation, you first call `useStopAllJobsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStopAllJobsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [stopAllJobsMutation, { data, loading, error }] = useStopAllJobsMutation({
 *   variables: {
 *   },
 * });
 */
export function useStopAllJobsMutation(baseOptions?: Apollo.MutationHookOptions<StopAllJobsMutation, StopAllJobsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StopAllJobsMutation, StopAllJobsMutationVariables>(StopAllJobsDocument, options);
      }
export type StopAllJobsMutationHookResult = ReturnType<typeof useStopAllJobsMutation>;
export type StopAllJobsMutationResult = Apollo.MutationResult<StopAllJobsMutation>;
export type StopAllJobsMutationOptions = Apollo.BaseMutationOptions<StopAllJobsMutation, StopAllJobsMutationVariables>;
export const MetadataImportDocument = gql`
    mutation MetadataImport {
  metadataImport
}
    `;
export type MetadataImportMutationFn = Apollo.MutationFunction<MetadataImportMutation, MetadataImportMutationVariables>;

/**
 * __useMetadataImportMutation__
 *
 * To run a mutation, you first call `useMetadataImportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataImportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataImportMutation, { data, loading, error }] = useMetadataImportMutation({
 *   variables: {
 *   },
 * });
 */
export function useMetadataImportMutation(baseOptions?: Apollo.MutationHookOptions<MetadataImportMutation, MetadataImportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataImportMutation, MetadataImportMutationVariables>(MetadataImportDocument, options);
      }
export type MetadataImportMutationHookResult = ReturnType<typeof useMetadataImportMutation>;
export type MetadataImportMutationResult = Apollo.MutationResult<MetadataImportMutation>;
export type MetadataImportMutationOptions = Apollo.BaseMutationOptions<MetadataImportMutation, MetadataImportMutationVariables>;
export const MetadataExportDocument = gql`
    mutation MetadataExport {
  metadataExport
}
    `;
export type MetadataExportMutationFn = Apollo.MutationFunction<MetadataExportMutation, MetadataExportMutationVariables>;

/**
 * __useMetadataExportMutation__
 *
 * To run a mutation, you first call `useMetadataExportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataExportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataExportMutation, { data, loading, error }] = useMetadataExportMutation({
 *   variables: {
 *   },
 * });
 */
export function useMetadataExportMutation(baseOptions?: Apollo.MutationHookOptions<MetadataExportMutation, MetadataExportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataExportMutation, MetadataExportMutationVariables>(MetadataExportDocument, options);
      }
export type MetadataExportMutationHookResult = ReturnType<typeof useMetadataExportMutation>;
export type MetadataExportMutationResult = Apollo.MutationResult<MetadataExportMutation>;
export type MetadataExportMutationOptions = Apollo.BaseMutationOptions<MetadataExportMutation, MetadataExportMutationVariables>;
export const ExportObjectsDocument = gql`
    mutation ExportObjects($input: ExportObjectsInput!) {
  exportObjects(input: $input)
}
    `;
export type ExportObjectsMutationFn = Apollo.MutationFunction<ExportObjectsMutation, ExportObjectsMutationVariables>;

/**
 * __useExportObjectsMutation__
 *
 * To run a mutation, you first call `useExportObjectsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExportObjectsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [exportObjectsMutation, { data, loading, error }] = useExportObjectsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useExportObjectsMutation(baseOptions?: Apollo.MutationHookOptions<ExportObjectsMutation, ExportObjectsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExportObjectsMutation, ExportObjectsMutationVariables>(ExportObjectsDocument, options);
      }
export type ExportObjectsMutationHookResult = ReturnType<typeof useExportObjectsMutation>;
export type ExportObjectsMutationResult = Apollo.MutationResult<ExportObjectsMutation>;
export type ExportObjectsMutationOptions = Apollo.BaseMutationOptions<ExportObjectsMutation, ExportObjectsMutationVariables>;
export const ImportObjectsDocument = gql`
    mutation ImportObjects($input: ImportObjectsInput!) {
  importObjects(input: $input)
}
    `;
export type ImportObjectsMutationFn = Apollo.MutationFunction<ImportObjectsMutation, ImportObjectsMutationVariables>;

/**
 * __useImportObjectsMutation__
 *
 * To run a mutation, you first call `useImportObjectsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportObjectsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importObjectsMutation, { data, loading, error }] = useImportObjectsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useImportObjectsMutation(baseOptions?: Apollo.MutationHookOptions<ImportObjectsMutation, ImportObjectsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ImportObjectsMutation, ImportObjectsMutationVariables>(ImportObjectsDocument, options);
      }
export type ImportObjectsMutationHookResult = ReturnType<typeof useImportObjectsMutation>;
export type ImportObjectsMutationResult = Apollo.MutationResult<ImportObjectsMutation>;
export type ImportObjectsMutationOptions = Apollo.BaseMutationOptions<ImportObjectsMutation, ImportObjectsMutationVariables>;
export const MetadataScanDocument = gql`
    mutation MetadataScan($input: ScanMetadataInput!) {
  metadataScan(input: $input)
}
    `;
export type MetadataScanMutationFn = Apollo.MutationFunction<MetadataScanMutation, MetadataScanMutationVariables>;

/**
 * __useMetadataScanMutation__
 *
 * To run a mutation, you first call `useMetadataScanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataScanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataScanMutation, { data, loading, error }] = useMetadataScanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMetadataScanMutation(baseOptions?: Apollo.MutationHookOptions<MetadataScanMutation, MetadataScanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataScanMutation, MetadataScanMutationVariables>(MetadataScanDocument, options);
      }
export type MetadataScanMutationHookResult = ReturnType<typeof useMetadataScanMutation>;
export type MetadataScanMutationResult = Apollo.MutationResult<MetadataScanMutation>;
export type MetadataScanMutationOptions = Apollo.BaseMutationOptions<MetadataScanMutation, MetadataScanMutationVariables>;
export const MetadataGenerateDocument = gql`
    mutation MetadataGenerate($input: GenerateMetadataInput!) {
  metadataGenerate(input: $input)
}
    `;
export type MetadataGenerateMutationFn = Apollo.MutationFunction<MetadataGenerateMutation, MetadataGenerateMutationVariables>;

/**
 * __useMetadataGenerateMutation__
 *
 * To run a mutation, you first call `useMetadataGenerateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataGenerateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataGenerateMutation, { data, loading, error }] = useMetadataGenerateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMetadataGenerateMutation(baseOptions?: Apollo.MutationHookOptions<MetadataGenerateMutation, MetadataGenerateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataGenerateMutation, MetadataGenerateMutationVariables>(MetadataGenerateDocument, options);
      }
export type MetadataGenerateMutationHookResult = ReturnType<typeof useMetadataGenerateMutation>;
export type MetadataGenerateMutationResult = Apollo.MutationResult<MetadataGenerateMutation>;
export type MetadataGenerateMutationOptions = Apollo.BaseMutationOptions<MetadataGenerateMutation, MetadataGenerateMutationVariables>;
export const MetadataAutoTagDocument = gql`
    mutation MetadataAutoTag($input: AutoTagMetadataInput!) {
  metadataAutoTag(input: $input)
}
    `;
export type MetadataAutoTagMutationFn = Apollo.MutationFunction<MetadataAutoTagMutation, MetadataAutoTagMutationVariables>;

/**
 * __useMetadataAutoTagMutation__
 *
 * To run a mutation, you first call `useMetadataAutoTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataAutoTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataAutoTagMutation, { data, loading, error }] = useMetadataAutoTagMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMetadataAutoTagMutation(baseOptions?: Apollo.MutationHookOptions<MetadataAutoTagMutation, MetadataAutoTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataAutoTagMutation, MetadataAutoTagMutationVariables>(MetadataAutoTagDocument, options);
      }
export type MetadataAutoTagMutationHookResult = ReturnType<typeof useMetadataAutoTagMutation>;
export type MetadataAutoTagMutationResult = Apollo.MutationResult<MetadataAutoTagMutation>;
export type MetadataAutoTagMutationOptions = Apollo.BaseMutationOptions<MetadataAutoTagMutation, MetadataAutoTagMutationVariables>;
export const MetadataIdentifyDocument = gql`
    mutation MetadataIdentify($input: IdentifyMetadataInput!) {
  metadataIdentify(input: $input)
}
    `;
export type MetadataIdentifyMutationFn = Apollo.MutationFunction<MetadataIdentifyMutation, MetadataIdentifyMutationVariables>;

/**
 * __useMetadataIdentifyMutation__
 *
 * To run a mutation, you first call `useMetadataIdentifyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataIdentifyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataIdentifyMutation, { data, loading, error }] = useMetadataIdentifyMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMetadataIdentifyMutation(baseOptions?: Apollo.MutationHookOptions<MetadataIdentifyMutation, MetadataIdentifyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataIdentifyMutation, MetadataIdentifyMutationVariables>(MetadataIdentifyDocument, options);
      }
export type MetadataIdentifyMutationHookResult = ReturnType<typeof useMetadataIdentifyMutation>;
export type MetadataIdentifyMutationResult = Apollo.MutationResult<MetadataIdentifyMutation>;
export type MetadataIdentifyMutationOptions = Apollo.BaseMutationOptions<MetadataIdentifyMutation, MetadataIdentifyMutationVariables>;
export const MetadataCleanDocument = gql`
    mutation MetadataClean($input: CleanMetadataInput!) {
  metadataClean(input: $input)
}
    `;
export type MetadataCleanMutationFn = Apollo.MutationFunction<MetadataCleanMutation, MetadataCleanMutationVariables>;

/**
 * __useMetadataCleanMutation__
 *
 * To run a mutation, you first call `useMetadataCleanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataCleanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataCleanMutation, { data, loading, error }] = useMetadataCleanMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMetadataCleanMutation(baseOptions?: Apollo.MutationHookOptions<MetadataCleanMutation, MetadataCleanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataCleanMutation, MetadataCleanMutationVariables>(MetadataCleanDocument, options);
      }
export type MetadataCleanMutationHookResult = ReturnType<typeof useMetadataCleanMutation>;
export type MetadataCleanMutationResult = Apollo.MutationResult<MetadataCleanMutation>;
export type MetadataCleanMutationOptions = Apollo.BaseMutationOptions<MetadataCleanMutation, MetadataCleanMutationVariables>;
export const MetadataCleanGeneratedDocument = gql`
    mutation MetadataCleanGenerated($input: CleanGeneratedInput!) {
  metadataCleanGenerated(input: $input)
}
    `;
export type MetadataCleanGeneratedMutationFn = Apollo.MutationFunction<MetadataCleanGeneratedMutation, MetadataCleanGeneratedMutationVariables>;

/**
 * __useMetadataCleanGeneratedMutation__
 *
 * To run a mutation, you first call `useMetadataCleanGeneratedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMetadataCleanGeneratedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [metadataCleanGeneratedMutation, { data, loading, error }] = useMetadataCleanGeneratedMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMetadataCleanGeneratedMutation(baseOptions?: Apollo.MutationHookOptions<MetadataCleanGeneratedMutation, MetadataCleanGeneratedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MetadataCleanGeneratedMutation, MetadataCleanGeneratedMutationVariables>(MetadataCleanGeneratedDocument, options);
      }
export type MetadataCleanGeneratedMutationHookResult = ReturnType<typeof useMetadataCleanGeneratedMutation>;
export type MetadataCleanGeneratedMutationResult = Apollo.MutationResult<MetadataCleanGeneratedMutation>;
export type MetadataCleanGeneratedMutationOptions = Apollo.BaseMutationOptions<MetadataCleanGeneratedMutation, MetadataCleanGeneratedMutationVariables>;
export const BackupDatabaseDocument = gql`
    mutation BackupDatabase($input: BackupDatabaseInput!) {
  backupDatabase(input: $input)
}
    `;
export type BackupDatabaseMutationFn = Apollo.MutationFunction<BackupDatabaseMutation, BackupDatabaseMutationVariables>;

/**
 * __useBackupDatabaseMutation__
 *
 * To run a mutation, you first call `useBackupDatabaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBackupDatabaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [backupDatabaseMutation, { data, loading, error }] = useBackupDatabaseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBackupDatabaseMutation(baseOptions?: Apollo.MutationHookOptions<BackupDatabaseMutation, BackupDatabaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BackupDatabaseMutation, BackupDatabaseMutationVariables>(BackupDatabaseDocument, options);
      }
export type BackupDatabaseMutationHookResult = ReturnType<typeof useBackupDatabaseMutation>;
export type BackupDatabaseMutationResult = Apollo.MutationResult<BackupDatabaseMutation>;
export type BackupDatabaseMutationOptions = Apollo.BaseMutationOptions<BackupDatabaseMutation, BackupDatabaseMutationVariables>;
export const AnonymiseDatabaseDocument = gql`
    mutation AnonymiseDatabase($input: AnonymiseDatabaseInput!) {
  anonymiseDatabase(input: $input)
}
    `;
export type AnonymiseDatabaseMutationFn = Apollo.MutationFunction<AnonymiseDatabaseMutation, AnonymiseDatabaseMutationVariables>;

/**
 * __useAnonymiseDatabaseMutation__
 *
 * To run a mutation, you first call `useAnonymiseDatabaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAnonymiseDatabaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [anonymiseDatabaseMutation, { data, loading, error }] = useAnonymiseDatabaseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAnonymiseDatabaseMutation(baseOptions?: Apollo.MutationHookOptions<AnonymiseDatabaseMutation, AnonymiseDatabaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AnonymiseDatabaseMutation, AnonymiseDatabaseMutationVariables>(AnonymiseDatabaseDocument, options);
      }
export type AnonymiseDatabaseMutationHookResult = ReturnType<typeof useAnonymiseDatabaseMutation>;
export type AnonymiseDatabaseMutationResult = Apollo.MutationResult<AnonymiseDatabaseMutation>;
export type AnonymiseDatabaseMutationOptions = Apollo.BaseMutationOptions<AnonymiseDatabaseMutation, AnonymiseDatabaseMutationVariables>;
export const OptimiseDatabaseDocument = gql`
    mutation OptimiseDatabase {
  optimiseDatabase
}
    `;
export type OptimiseDatabaseMutationFn = Apollo.MutationFunction<OptimiseDatabaseMutation, OptimiseDatabaseMutationVariables>;

/**
 * __useOptimiseDatabaseMutation__
 *
 * To run a mutation, you first call `useOptimiseDatabaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOptimiseDatabaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [optimiseDatabaseMutation, { data, loading, error }] = useOptimiseDatabaseMutation({
 *   variables: {
 *   },
 * });
 */
export function useOptimiseDatabaseMutation(baseOptions?: Apollo.MutationHookOptions<OptimiseDatabaseMutation, OptimiseDatabaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OptimiseDatabaseMutation, OptimiseDatabaseMutationVariables>(OptimiseDatabaseDocument, options);
      }
export type OptimiseDatabaseMutationHookResult = ReturnType<typeof useOptimiseDatabaseMutation>;
export type OptimiseDatabaseMutationResult = Apollo.MutationResult<OptimiseDatabaseMutation>;
export type OptimiseDatabaseMutationOptions = Apollo.BaseMutationOptions<OptimiseDatabaseMutation, OptimiseDatabaseMutationVariables>;
export const MigrateBlobsDocument = gql`
    mutation MigrateBlobs($input: MigrateBlobsInput!) {
  migrateBlobs(input: $input)
}
    `;
export type MigrateBlobsMutationFn = Apollo.MutationFunction<MigrateBlobsMutation, MigrateBlobsMutationVariables>;

/**
 * __useMigrateBlobsMutation__
 *
 * To run a mutation, you first call `useMigrateBlobsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMigrateBlobsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [migrateBlobsMutation, { data, loading, error }] = useMigrateBlobsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMigrateBlobsMutation(baseOptions?: Apollo.MutationHookOptions<MigrateBlobsMutation, MigrateBlobsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MigrateBlobsMutation, MigrateBlobsMutationVariables>(MigrateBlobsDocument, options);
      }
export type MigrateBlobsMutationHookResult = ReturnType<typeof useMigrateBlobsMutation>;
export type MigrateBlobsMutationResult = Apollo.MutationResult<MigrateBlobsMutation>;
export type MigrateBlobsMutationOptions = Apollo.BaseMutationOptions<MigrateBlobsMutation, MigrateBlobsMutationVariables>;
export const PerformerCreateDocument = gql`
    mutation PerformerCreate($input: PerformerCreateInput!) {
  performerCreate(input: $input) {
    ...PerformerData
  }
}
    ${PerformerDataFragmentDoc}`;
export type PerformerCreateMutationFn = Apollo.MutationFunction<PerformerCreateMutation, PerformerCreateMutationVariables>;

/**
 * __usePerformerCreateMutation__
 *
 * To run a mutation, you first call `usePerformerCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePerformerCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [performerCreateMutation, { data, loading, error }] = usePerformerCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePerformerCreateMutation(baseOptions?: Apollo.MutationHookOptions<PerformerCreateMutation, PerformerCreateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PerformerCreateMutation, PerformerCreateMutationVariables>(PerformerCreateDocument, options);
      }
export type PerformerCreateMutationHookResult = ReturnType<typeof usePerformerCreateMutation>;
export type PerformerCreateMutationResult = Apollo.MutationResult<PerformerCreateMutation>;
export type PerformerCreateMutationOptions = Apollo.BaseMutationOptions<PerformerCreateMutation, PerformerCreateMutationVariables>;
export const PerformerUpdateDocument = gql`
    mutation PerformerUpdate($input: PerformerUpdateInput!) {
  performerUpdate(input: $input) {
    ...PerformerData
  }
}
    ${PerformerDataFragmentDoc}`;
export type PerformerUpdateMutationFn = Apollo.MutationFunction<PerformerUpdateMutation, PerformerUpdateMutationVariables>;

/**
 * __usePerformerUpdateMutation__
 *
 * To run a mutation, you first call `usePerformerUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePerformerUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [performerUpdateMutation, { data, loading, error }] = usePerformerUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePerformerUpdateMutation(baseOptions?: Apollo.MutationHookOptions<PerformerUpdateMutation, PerformerUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PerformerUpdateMutation, PerformerUpdateMutationVariables>(PerformerUpdateDocument, options);
      }
export type PerformerUpdateMutationHookResult = ReturnType<typeof usePerformerUpdateMutation>;
export type PerformerUpdateMutationResult = Apollo.MutationResult<PerformerUpdateMutation>;
export type PerformerUpdateMutationOptions = Apollo.BaseMutationOptions<PerformerUpdateMutation, PerformerUpdateMutationVariables>;
export const BulkPerformerUpdateDocument = gql`
    mutation BulkPerformerUpdate($input: BulkPerformerUpdateInput!) {
  bulkPerformerUpdate(input: $input) {
    ...PerformerData
  }
}
    ${PerformerDataFragmentDoc}`;
export type BulkPerformerUpdateMutationFn = Apollo.MutationFunction<BulkPerformerUpdateMutation, BulkPerformerUpdateMutationVariables>;

/**
 * __useBulkPerformerUpdateMutation__
 *
 * To run a mutation, you first call `useBulkPerformerUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkPerformerUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkPerformerUpdateMutation, { data, loading, error }] = useBulkPerformerUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBulkPerformerUpdateMutation(baseOptions?: Apollo.MutationHookOptions<BulkPerformerUpdateMutation, BulkPerformerUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkPerformerUpdateMutation, BulkPerformerUpdateMutationVariables>(BulkPerformerUpdateDocument, options);
      }
export type BulkPerformerUpdateMutationHookResult = ReturnType<typeof useBulkPerformerUpdateMutation>;
export type BulkPerformerUpdateMutationResult = Apollo.MutationResult<BulkPerformerUpdateMutation>;
export type BulkPerformerUpdateMutationOptions = Apollo.BaseMutationOptions<BulkPerformerUpdateMutation, BulkPerformerUpdateMutationVariables>;
export const PerformerDestroyDocument = gql`
    mutation PerformerDestroy($id: ID!) {
  performerDestroy(input: {id: $id})
}
    `;
export type PerformerDestroyMutationFn = Apollo.MutationFunction<PerformerDestroyMutation, PerformerDestroyMutationVariables>;

/**
 * __usePerformerDestroyMutation__
 *
 * To run a mutation, you first call `usePerformerDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePerformerDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [performerDestroyMutation, { data, loading, error }] = usePerformerDestroyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePerformerDestroyMutation(baseOptions?: Apollo.MutationHookOptions<PerformerDestroyMutation, PerformerDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PerformerDestroyMutation, PerformerDestroyMutationVariables>(PerformerDestroyDocument, options);
      }
export type PerformerDestroyMutationHookResult = ReturnType<typeof usePerformerDestroyMutation>;
export type PerformerDestroyMutationResult = Apollo.MutationResult<PerformerDestroyMutation>;
export type PerformerDestroyMutationOptions = Apollo.BaseMutationOptions<PerformerDestroyMutation, PerformerDestroyMutationVariables>;
export const PerformersDestroyDocument = gql`
    mutation PerformersDestroy($ids: [ID!]!) {
  performersDestroy(ids: $ids)
}
    `;
export type PerformersDestroyMutationFn = Apollo.MutationFunction<PerformersDestroyMutation, PerformersDestroyMutationVariables>;

/**
 * __usePerformersDestroyMutation__
 *
 * To run a mutation, you first call `usePerformersDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePerformersDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [performersDestroyMutation, { data, loading, error }] = usePerformersDestroyMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function usePerformersDestroyMutation(baseOptions?: Apollo.MutationHookOptions<PerformersDestroyMutation, PerformersDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PerformersDestroyMutation, PerformersDestroyMutationVariables>(PerformersDestroyDocument, options);
      }
export type PerformersDestroyMutationHookResult = ReturnType<typeof usePerformersDestroyMutation>;
export type PerformersDestroyMutationResult = Apollo.MutationResult<PerformersDestroyMutation>;
export type PerformersDestroyMutationOptions = Apollo.BaseMutationOptions<PerformersDestroyMutation, PerformersDestroyMutationVariables>;
export const PerformerMergeDocument = gql`
    mutation PerformerMerge($input: PerformerMergeInput!) {
  performerMerge(input: $input) {
    id
  }
}
    `;
export type PerformerMergeMutationFn = Apollo.MutationFunction<PerformerMergeMutation, PerformerMergeMutationVariables>;

/**
 * __usePerformerMergeMutation__
 *
 * To run a mutation, you first call `usePerformerMergeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePerformerMergeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [performerMergeMutation, { data, loading, error }] = usePerformerMergeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePerformerMergeMutation(baseOptions?: Apollo.MutationHookOptions<PerformerMergeMutation, PerformerMergeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PerformerMergeMutation, PerformerMergeMutationVariables>(PerformerMergeDocument, options);
      }
export type PerformerMergeMutationHookResult = ReturnType<typeof usePerformerMergeMutation>;
export type PerformerMergeMutationResult = Apollo.MutationResult<PerformerMergeMutation>;
export type PerformerMergeMutationOptions = Apollo.BaseMutationOptions<PerformerMergeMutation, PerformerMergeMutationVariables>;
export const ReloadPluginsDocument = gql`
    mutation ReloadPlugins {
  reloadPlugins
}
    `;
export type ReloadPluginsMutationFn = Apollo.MutationFunction<ReloadPluginsMutation, ReloadPluginsMutationVariables>;

/**
 * __useReloadPluginsMutation__
 *
 * To run a mutation, you first call `useReloadPluginsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReloadPluginsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reloadPluginsMutation, { data, loading, error }] = useReloadPluginsMutation({
 *   variables: {
 *   },
 * });
 */
export function useReloadPluginsMutation(baseOptions?: Apollo.MutationHookOptions<ReloadPluginsMutation, ReloadPluginsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReloadPluginsMutation, ReloadPluginsMutationVariables>(ReloadPluginsDocument, options);
      }
export type ReloadPluginsMutationHookResult = ReturnType<typeof useReloadPluginsMutation>;
export type ReloadPluginsMutationResult = Apollo.MutationResult<ReloadPluginsMutation>;
export type ReloadPluginsMutationOptions = Apollo.BaseMutationOptions<ReloadPluginsMutation, ReloadPluginsMutationVariables>;
export const RunPluginTaskDocument = gql`
    mutation RunPluginTask($plugin_id: ID!, $task_name: String!, $args_map: Map) {
  runPluginTask(plugin_id: $plugin_id, task_name: $task_name, args_map: $args_map)
}
    `;
export type RunPluginTaskMutationFn = Apollo.MutationFunction<RunPluginTaskMutation, RunPluginTaskMutationVariables>;

/**
 * __useRunPluginTaskMutation__
 *
 * To run a mutation, you first call `useRunPluginTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRunPluginTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [runPluginTaskMutation, { data, loading, error }] = useRunPluginTaskMutation({
 *   variables: {
 *      plugin_id: // value for 'plugin_id'
 *      task_name: // value for 'task_name'
 *      args_map: // value for 'args_map'
 *   },
 * });
 */
export function useRunPluginTaskMutation(baseOptions?: Apollo.MutationHookOptions<RunPluginTaskMutation, RunPluginTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RunPluginTaskMutation, RunPluginTaskMutationVariables>(RunPluginTaskDocument, options);
      }
export type RunPluginTaskMutationHookResult = ReturnType<typeof useRunPluginTaskMutation>;
export type RunPluginTaskMutationResult = Apollo.MutationResult<RunPluginTaskMutation>;
export type RunPluginTaskMutationOptions = Apollo.BaseMutationOptions<RunPluginTaskMutation, RunPluginTaskMutationVariables>;
export const ConfigurePluginDocument = gql`
    mutation ConfigurePlugin($plugin_id: ID!, $input: Map!) {
  configurePlugin(plugin_id: $plugin_id, input: $input)
}
    `;
export type ConfigurePluginMutationFn = Apollo.MutationFunction<ConfigurePluginMutation, ConfigurePluginMutationVariables>;

/**
 * __useConfigurePluginMutation__
 *
 * To run a mutation, you first call `useConfigurePluginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfigurePluginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [configurePluginMutation, { data, loading, error }] = useConfigurePluginMutation({
 *   variables: {
 *      plugin_id: // value for 'plugin_id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useConfigurePluginMutation(baseOptions?: Apollo.MutationHookOptions<ConfigurePluginMutation, ConfigurePluginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfigurePluginMutation, ConfigurePluginMutationVariables>(ConfigurePluginDocument, options);
      }
export type ConfigurePluginMutationHookResult = ReturnType<typeof useConfigurePluginMutation>;
export type ConfigurePluginMutationResult = Apollo.MutationResult<ConfigurePluginMutation>;
export type ConfigurePluginMutationOptions = Apollo.BaseMutationOptions<ConfigurePluginMutation, ConfigurePluginMutationVariables>;
export const SetPluginsEnabledDocument = gql`
    mutation SetPluginsEnabled($enabledMap: BoolMap!) {
  setPluginsEnabled(enabledMap: $enabledMap)
}
    `;
export type SetPluginsEnabledMutationFn = Apollo.MutationFunction<SetPluginsEnabledMutation, SetPluginsEnabledMutationVariables>;

/**
 * __useSetPluginsEnabledMutation__
 *
 * To run a mutation, you first call `useSetPluginsEnabledMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPluginsEnabledMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPluginsEnabledMutation, { data, loading, error }] = useSetPluginsEnabledMutation({
 *   variables: {
 *      enabledMap: // value for 'enabledMap'
 *   },
 * });
 */
export function useSetPluginsEnabledMutation(baseOptions?: Apollo.MutationHookOptions<SetPluginsEnabledMutation, SetPluginsEnabledMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetPluginsEnabledMutation, SetPluginsEnabledMutationVariables>(SetPluginsEnabledDocument, options);
      }
export type SetPluginsEnabledMutationHookResult = ReturnType<typeof useSetPluginsEnabledMutation>;
export type SetPluginsEnabledMutationResult = Apollo.MutationResult<SetPluginsEnabledMutation>;
export type SetPluginsEnabledMutationOptions = Apollo.BaseMutationOptions<SetPluginsEnabledMutation, SetPluginsEnabledMutationVariables>;
export const InstallPluginPackagesDocument = gql`
    mutation InstallPluginPackages($packages: [PackageSpecInput!]!) {
  installPackages(type: Plugin, packages: $packages)
}
    `;
export type InstallPluginPackagesMutationFn = Apollo.MutationFunction<InstallPluginPackagesMutation, InstallPluginPackagesMutationVariables>;

/**
 * __useInstallPluginPackagesMutation__
 *
 * To run a mutation, you first call `useInstallPluginPackagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInstallPluginPackagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [installPluginPackagesMutation, { data, loading, error }] = useInstallPluginPackagesMutation({
 *   variables: {
 *      packages: // value for 'packages'
 *   },
 * });
 */
export function useInstallPluginPackagesMutation(baseOptions?: Apollo.MutationHookOptions<InstallPluginPackagesMutation, InstallPluginPackagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InstallPluginPackagesMutation, InstallPluginPackagesMutationVariables>(InstallPluginPackagesDocument, options);
      }
export type InstallPluginPackagesMutationHookResult = ReturnType<typeof useInstallPluginPackagesMutation>;
export type InstallPluginPackagesMutationResult = Apollo.MutationResult<InstallPluginPackagesMutation>;
export type InstallPluginPackagesMutationOptions = Apollo.BaseMutationOptions<InstallPluginPackagesMutation, InstallPluginPackagesMutationVariables>;
export const UpdatePluginPackagesDocument = gql`
    mutation UpdatePluginPackages($packages: [PackageSpecInput!]!) {
  updatePackages(type: Plugin, packages: $packages)
}
    `;
export type UpdatePluginPackagesMutationFn = Apollo.MutationFunction<UpdatePluginPackagesMutation, UpdatePluginPackagesMutationVariables>;

/**
 * __useUpdatePluginPackagesMutation__
 *
 * To run a mutation, you first call `useUpdatePluginPackagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePluginPackagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePluginPackagesMutation, { data, loading, error }] = useUpdatePluginPackagesMutation({
 *   variables: {
 *      packages: // value for 'packages'
 *   },
 * });
 */
export function useUpdatePluginPackagesMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePluginPackagesMutation, UpdatePluginPackagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePluginPackagesMutation, UpdatePluginPackagesMutationVariables>(UpdatePluginPackagesDocument, options);
      }
export type UpdatePluginPackagesMutationHookResult = ReturnType<typeof useUpdatePluginPackagesMutation>;
export type UpdatePluginPackagesMutationResult = Apollo.MutationResult<UpdatePluginPackagesMutation>;
export type UpdatePluginPackagesMutationOptions = Apollo.BaseMutationOptions<UpdatePluginPackagesMutation, UpdatePluginPackagesMutationVariables>;
export const UninstallPluginPackagesDocument = gql`
    mutation UninstallPluginPackages($packages: [PackageSpecInput!]!) {
  uninstallPackages(type: Plugin, packages: $packages)
}
    `;
export type UninstallPluginPackagesMutationFn = Apollo.MutationFunction<UninstallPluginPackagesMutation, UninstallPluginPackagesMutationVariables>;

/**
 * __useUninstallPluginPackagesMutation__
 *
 * To run a mutation, you first call `useUninstallPluginPackagesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUninstallPluginPackagesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uninstallPluginPackagesMutation, { data, loading, error }] = useUninstallPluginPackagesMutation({
 *   variables: {
 *      packages: // value for 'packages'
 *   },
 * });
 */
export function useUninstallPluginPackagesMutation(baseOptions?: Apollo.MutationHookOptions<UninstallPluginPackagesMutation, UninstallPluginPackagesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UninstallPluginPackagesMutation, UninstallPluginPackagesMutationVariables>(UninstallPluginPackagesDocument, options);
      }
export type UninstallPluginPackagesMutationHookResult = ReturnType<typeof useUninstallPluginPackagesMutation>;
export type UninstallPluginPackagesMutationResult = Apollo.MutationResult<UninstallPluginPackagesMutation>;
export type UninstallPluginPackagesMutationOptions = Apollo.BaseMutationOptions<UninstallPluginPackagesMutation, UninstallPluginPackagesMutationVariables>;
export const StudioCreateDocument = gql`
    mutation StudioCreate($input: StudioCreateInput!) {
  studioCreate(input: $input) {
    ...StudioData
  }
}
    ${StudioDataFragmentDoc}`;
export type StudioCreateMutationFn = Apollo.MutationFunction<StudioCreateMutation, StudioCreateMutationVariables>;

/**
 * __useStudioCreateMutation__
 *
 * To run a mutation, you first call `useStudioCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStudioCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [studioCreateMutation, { data, loading, error }] = useStudioCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useStudioCreateMutation(baseOptions?: Apollo.MutationHookOptions<StudioCreateMutation, StudioCreateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StudioCreateMutation, StudioCreateMutationVariables>(StudioCreateDocument, options);
      }
export type StudioCreateMutationHookResult = ReturnType<typeof useStudioCreateMutation>;
export type StudioCreateMutationResult = Apollo.MutationResult<StudioCreateMutation>;
export type StudioCreateMutationOptions = Apollo.BaseMutationOptions<StudioCreateMutation, StudioCreateMutationVariables>;
export const StudioUpdateDocument = gql`
    mutation StudioUpdate($input: StudioUpdateInput!) {
  studioUpdate(input: $input) {
    ...StudioData
  }
}
    ${StudioDataFragmentDoc}`;
export type StudioUpdateMutationFn = Apollo.MutationFunction<StudioUpdateMutation, StudioUpdateMutationVariables>;

/**
 * __useStudioUpdateMutation__
 *
 * To run a mutation, you first call `useStudioUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStudioUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [studioUpdateMutation, { data, loading, error }] = useStudioUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useStudioUpdateMutation(baseOptions?: Apollo.MutationHookOptions<StudioUpdateMutation, StudioUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StudioUpdateMutation, StudioUpdateMutationVariables>(StudioUpdateDocument, options);
      }
export type StudioUpdateMutationHookResult = ReturnType<typeof useStudioUpdateMutation>;
export type StudioUpdateMutationResult = Apollo.MutationResult<StudioUpdateMutation>;
export type StudioUpdateMutationOptions = Apollo.BaseMutationOptions<StudioUpdateMutation, StudioUpdateMutationVariables>;
export const BulkStudioUpdateDocument = gql`
    mutation BulkStudioUpdate($input: BulkStudioUpdateInput!) {
  bulkStudioUpdate(input: $input) {
    ...StudioData
  }
}
    ${StudioDataFragmentDoc}`;
export type BulkStudioUpdateMutationFn = Apollo.MutationFunction<BulkStudioUpdateMutation, BulkStudioUpdateMutationVariables>;

/**
 * __useBulkStudioUpdateMutation__
 *
 * To run a mutation, you first call `useBulkStudioUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkStudioUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkStudioUpdateMutation, { data, loading, error }] = useBulkStudioUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBulkStudioUpdateMutation(baseOptions?: Apollo.MutationHookOptions<BulkStudioUpdateMutation, BulkStudioUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkStudioUpdateMutation, BulkStudioUpdateMutationVariables>(BulkStudioUpdateDocument, options);
      }
export type BulkStudioUpdateMutationHookResult = ReturnType<typeof useBulkStudioUpdateMutation>;
export type BulkStudioUpdateMutationResult = Apollo.MutationResult<BulkStudioUpdateMutation>;
export type BulkStudioUpdateMutationOptions = Apollo.BaseMutationOptions<BulkStudioUpdateMutation, BulkStudioUpdateMutationVariables>;
export const StudioDestroyDocument = gql`
    mutation StudioDestroy($id: ID!) {
  studioDestroy(input: {id: $id})
}
    `;
export type StudioDestroyMutationFn = Apollo.MutationFunction<StudioDestroyMutation, StudioDestroyMutationVariables>;

/**
 * __useStudioDestroyMutation__
 *
 * To run a mutation, you first call `useStudioDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStudioDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [studioDestroyMutation, { data, loading, error }] = useStudioDestroyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useStudioDestroyMutation(baseOptions?: Apollo.MutationHookOptions<StudioDestroyMutation, StudioDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StudioDestroyMutation, StudioDestroyMutationVariables>(StudioDestroyDocument, options);
      }
export type StudioDestroyMutationHookResult = ReturnType<typeof useStudioDestroyMutation>;
export type StudioDestroyMutationResult = Apollo.MutationResult<StudioDestroyMutation>;
export type StudioDestroyMutationOptions = Apollo.BaseMutationOptions<StudioDestroyMutation, StudioDestroyMutationVariables>;
export const StudiosDestroyDocument = gql`
    mutation StudiosDestroy($ids: [ID!]!) {
  studiosDestroy(ids: $ids)
}
    `;
export type StudiosDestroyMutationFn = Apollo.MutationFunction<StudiosDestroyMutation, StudiosDestroyMutationVariables>;

/**
 * __useStudiosDestroyMutation__
 *
 * To run a mutation, you first call `useStudiosDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStudiosDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [studiosDestroyMutation, { data, loading, error }] = useStudiosDestroyMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useStudiosDestroyMutation(baseOptions?: Apollo.MutationHookOptions<StudiosDestroyMutation, StudiosDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StudiosDestroyMutation, StudiosDestroyMutationVariables>(StudiosDestroyDocument, options);
      }
export type StudiosDestroyMutationHookResult = ReturnType<typeof useStudiosDestroyMutation>;
export type StudiosDestroyMutationResult = Apollo.MutationResult<StudiosDestroyMutation>;
export type StudiosDestroyMutationOptions = Apollo.BaseMutationOptions<StudiosDestroyMutation, StudiosDestroyMutationVariables>;
export const TagCreateDocument = gql`
    mutation TagCreate($input: TagCreateInput!) {
  tagCreate(input: $input) {
    ...TagData
  }
}
    ${TagDataFragmentDoc}`;
export type TagCreateMutationFn = Apollo.MutationFunction<TagCreateMutation, TagCreateMutationVariables>;

/**
 * __useTagCreateMutation__
 *
 * To run a mutation, you first call `useTagCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTagCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [tagCreateMutation, { data, loading, error }] = useTagCreateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTagCreateMutation(baseOptions?: Apollo.MutationHookOptions<TagCreateMutation, TagCreateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TagCreateMutation, TagCreateMutationVariables>(TagCreateDocument, options);
      }
export type TagCreateMutationHookResult = ReturnType<typeof useTagCreateMutation>;
export type TagCreateMutationResult = Apollo.MutationResult<TagCreateMutation>;
export type TagCreateMutationOptions = Apollo.BaseMutationOptions<TagCreateMutation, TagCreateMutationVariables>;
export const TagDestroyDocument = gql`
    mutation TagDestroy($id: ID!) {
  tagDestroy(input: {id: $id})
}
    `;
export type TagDestroyMutationFn = Apollo.MutationFunction<TagDestroyMutation, TagDestroyMutationVariables>;

/**
 * __useTagDestroyMutation__
 *
 * To run a mutation, you first call `useTagDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTagDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [tagDestroyMutation, { data, loading, error }] = useTagDestroyMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useTagDestroyMutation(baseOptions?: Apollo.MutationHookOptions<TagDestroyMutation, TagDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TagDestroyMutation, TagDestroyMutationVariables>(TagDestroyDocument, options);
      }
export type TagDestroyMutationHookResult = ReturnType<typeof useTagDestroyMutation>;
export type TagDestroyMutationResult = Apollo.MutationResult<TagDestroyMutation>;
export type TagDestroyMutationOptions = Apollo.BaseMutationOptions<TagDestroyMutation, TagDestroyMutationVariables>;
export const TagsDestroyDocument = gql`
    mutation TagsDestroy($ids: [ID!]!) {
  tagsDestroy(ids: $ids)
}
    `;
export type TagsDestroyMutationFn = Apollo.MutationFunction<TagsDestroyMutation, TagsDestroyMutationVariables>;

/**
 * __useTagsDestroyMutation__
 *
 * To run a mutation, you first call `useTagsDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTagsDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [tagsDestroyMutation, { data, loading, error }] = useTagsDestroyMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useTagsDestroyMutation(baseOptions?: Apollo.MutationHookOptions<TagsDestroyMutation, TagsDestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TagsDestroyMutation, TagsDestroyMutationVariables>(TagsDestroyDocument, options);
      }
export type TagsDestroyMutationHookResult = ReturnType<typeof useTagsDestroyMutation>;
export type TagsDestroyMutationResult = Apollo.MutationResult<TagsDestroyMutation>;
export type TagsDestroyMutationOptions = Apollo.BaseMutationOptions<TagsDestroyMutation, TagsDestroyMutationVariables>;
export const TagUpdateDocument = gql`
    mutation TagUpdate($input: TagUpdateInput!) {
  tagUpdate(input: $input) {
    ...TagData
  }
}
    ${TagDataFragmentDoc}`;
export type TagUpdateMutationFn = Apollo.MutationFunction<TagUpdateMutation, TagUpdateMutationVariables>;

/**
 * __useTagUpdateMutation__
 *
 * To run a mutation, you first call `useTagUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTagUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [tagUpdateMutation, { data, loading, error }] = useTagUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTagUpdateMutation(baseOptions?: Apollo.MutationHookOptions<TagUpdateMutation, TagUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TagUpdateMutation, TagUpdateMutationVariables>(TagUpdateDocument, options);
      }
export type TagUpdateMutationHookResult = ReturnType<typeof useTagUpdateMutation>;
export type TagUpdateMutationResult = Apollo.MutationResult<TagUpdateMutation>;
export type TagUpdateMutationOptions = Apollo.BaseMutationOptions<TagUpdateMutation, TagUpdateMutationVariables>;
export const BulkTagUpdateDocument = gql`
    mutation BulkTagUpdate($input: BulkTagUpdateInput!) {
  bulkTagUpdate(input: $input) {
    ...TagData
  }
}
    ${TagDataFragmentDoc}`;
export type BulkTagUpdateMutationFn = Apollo.MutationFunction<BulkTagUpdateMutation, BulkTagUpdateMutationVariables>;

/**
 * __useBulkTagUpdateMutation__
 *
 * To run a mutation, you first call `useBulkTagUpdateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkTagUpdateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkTagUpdateMutation, { data, loading, error }] = useBulkTagUpdateMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBulkTagUpdateMutation(baseOptions?: Apollo.MutationHookOptions<BulkTagUpdateMutation, BulkTagUpdateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkTagUpdateMutation, BulkTagUpdateMutationVariables>(BulkTagUpdateDocument, options);
      }
export type BulkTagUpdateMutationHookResult = ReturnType<typeof useBulkTagUpdateMutation>;
export type BulkTagUpdateMutationResult = Apollo.MutationResult<BulkTagUpdateMutation>;
export type BulkTagUpdateMutationOptions = Apollo.BaseMutationOptions<BulkTagUpdateMutation, BulkTagUpdateMutationVariables>;
export const TagsMergeDocument = gql`
    mutation TagsMerge($source: [ID!]!, $destination: ID!, $values: TagUpdateInput) {
  tagsMerge(input: {source: $source, destination: $destination, values: $values}) {
    ...TagData
  }
}
    ${TagDataFragmentDoc}`;
export type TagsMergeMutationFn = Apollo.MutationFunction<TagsMergeMutation, TagsMergeMutationVariables>;

/**
 * __useTagsMergeMutation__
 *
 * To run a mutation, you first call `useTagsMergeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTagsMergeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [tagsMergeMutation, { data, loading, error }] = useTagsMergeMutation({
 *   variables: {
 *      source: // value for 'source'
 *      destination: // value for 'destination'
 *      values: // value for 'values'
 *   },
 * });
 */
export function useTagsMergeMutation(baseOptions?: Apollo.MutationHookOptions<TagsMergeMutation, TagsMergeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TagsMergeMutation, TagsMergeMutationVariables>(TagsMergeDocument, options);
      }
export type TagsMergeMutationHookResult = ReturnType<typeof useTagsMergeMutation>;
export type TagsMergeMutationResult = Apollo.MutationResult<TagsMergeMutation>;
export type TagsMergeMutationOptions = Apollo.BaseMutationOptions<TagsMergeMutation, TagsMergeMutationVariables>;
export const FindAudiosDocument = gql`
    query FindAudios($filter: FindFilterType, $audio_filter: AudioFilterType, $ids: [ID!]) {
  findAudios(filter: $filter, audio_filter: $audio_filter, ids: $ids) {
    count
    audios {
      ...SlimAudioData
    }
  }
}
    ${SlimAudioDataFragmentDoc}`;

/**
 * __useFindAudiosQuery__
 *
 * To run a query within a React component, call `useFindAudiosQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAudiosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAudiosQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      audio_filter: // value for 'audio_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindAudiosQuery(baseOptions?: Apollo.QueryHookOptions<FindAudiosQuery, FindAudiosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAudiosQuery, FindAudiosQueryVariables>(FindAudiosDocument, options);
      }
export function useFindAudiosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAudiosQuery, FindAudiosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAudiosQuery, FindAudiosQueryVariables>(FindAudiosDocument, options);
        }
export function useFindAudiosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAudiosQuery, FindAudiosQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAudiosQuery, FindAudiosQueryVariables>(FindAudiosDocument, options);
        }
export type FindAudiosQueryHookResult = ReturnType<typeof useFindAudiosQuery>;
export type FindAudiosLazyQueryHookResult = ReturnType<typeof useFindAudiosLazyQuery>;
export type FindAudiosSuspenseQueryHookResult = ReturnType<typeof useFindAudiosSuspenseQuery>;
export type FindAudiosQueryResult = Apollo.QueryResult<FindAudiosQuery, FindAudiosQueryVariables>;
export function refetchFindAudiosQuery(variables?: FindAudiosQueryVariables) {
      return { query: FindAudiosDocument, variables: variables }
    }
export const FindAudiosMetadataDocument = gql`
    query FindAudiosMetadata($filter: FindFilterType, $audio_filter: AudioFilterType, $ids: [ID!]) {
  findAudios(filter: $filter, audio_filter: $audio_filter, ids: $ids) {
    duration
    filesize
  }
}
    `;

/**
 * __useFindAudiosMetadataQuery__
 *
 * To run a query within a React component, call `useFindAudiosMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAudiosMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAudiosMetadataQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      audio_filter: // value for 'audio_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindAudiosMetadataQuery(baseOptions?: Apollo.QueryHookOptions<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>(FindAudiosMetadataDocument, options);
      }
export function useFindAudiosMetadataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>(FindAudiosMetadataDocument, options);
        }
export function useFindAudiosMetadataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>(FindAudiosMetadataDocument, options);
        }
export type FindAudiosMetadataQueryHookResult = ReturnType<typeof useFindAudiosMetadataQuery>;
export type FindAudiosMetadataLazyQueryHookResult = ReturnType<typeof useFindAudiosMetadataLazyQuery>;
export type FindAudiosMetadataSuspenseQueryHookResult = ReturnType<typeof useFindAudiosMetadataSuspenseQuery>;
export type FindAudiosMetadataQueryResult = Apollo.QueryResult<FindAudiosMetadataQuery, FindAudiosMetadataQueryVariables>;
export function refetchFindAudiosMetadataQuery(variables?: FindAudiosMetadataQueryVariables) {
      return { query: FindAudiosMetadataDocument, variables: variables }
    }
export const FindAudioDocument = gql`
    query FindAudio($id: ID!, $checksum: String) {
  findAudio(id: $id, checksum: $checksum) {
    ...AudioData
  }
}
    ${AudioDataFragmentDoc}`;

/**
 * __useFindAudioQuery__
 *
 * To run a query within a React component, call `useFindAudioQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindAudioQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindAudioQuery({
 *   variables: {
 *      id: // value for 'id'
 *      checksum: // value for 'checksum'
 *   },
 * });
 */
export function useFindAudioQuery(baseOptions: Apollo.QueryHookOptions<FindAudioQuery, FindAudioQueryVariables> & ({ variables: FindAudioQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindAudioQuery, FindAudioQueryVariables>(FindAudioDocument, options);
      }
export function useFindAudioLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindAudioQuery, FindAudioQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindAudioQuery, FindAudioQueryVariables>(FindAudioDocument, options);
        }
export function useFindAudioSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindAudioQuery, FindAudioQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindAudioQuery, FindAudioQueryVariables>(FindAudioDocument, options);
        }
export type FindAudioQueryHookResult = ReturnType<typeof useFindAudioQuery>;
export type FindAudioLazyQueryHookResult = ReturnType<typeof useFindAudioLazyQuery>;
export type FindAudioSuspenseQueryHookResult = ReturnType<typeof useFindAudioSuspenseQuery>;
export type FindAudioQueryResult = Apollo.QueryResult<FindAudioQuery, FindAudioQueryVariables>;
export function refetchFindAudioQuery(variables: FindAudioQueryVariables) {
      return { query: FindAudioDocument, variables: variables }
    }
export const ConfigurationDocument = gql`
    query Configuration {
  configuration {
    ...ConfigData
  }
}
    ${ConfigDataFragmentDoc}`;

/**
 * __useConfigurationQuery__
 *
 * To run a query within a React component, call `useConfigurationQuery` and pass it any options that fit your needs.
 * When your component renders, `useConfigurationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConfigurationQuery({
 *   variables: {
 *   },
 * });
 */
export function useConfigurationQuery(baseOptions?: Apollo.QueryHookOptions<ConfigurationQuery, ConfigurationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ConfigurationQuery, ConfigurationQueryVariables>(ConfigurationDocument, options);
      }
export function useConfigurationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConfigurationQuery, ConfigurationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ConfigurationQuery, ConfigurationQueryVariables>(ConfigurationDocument, options);
        }
export function useConfigurationSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ConfigurationQuery, ConfigurationQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ConfigurationQuery, ConfigurationQueryVariables>(ConfigurationDocument, options);
        }
export type ConfigurationQueryHookResult = ReturnType<typeof useConfigurationQuery>;
export type ConfigurationLazyQueryHookResult = ReturnType<typeof useConfigurationLazyQuery>;
export type ConfigurationSuspenseQueryHookResult = ReturnType<typeof useConfigurationSuspenseQuery>;
export type ConfigurationQueryResult = Apollo.QueryResult<ConfigurationQuery, ConfigurationQueryVariables>;
export function refetchConfigurationQuery(variables?: ConfigurationQueryVariables) {
      return { query: ConfigurationDocument, variables: variables }
    }
export const SystemStatusDocument = gql`
    query SystemStatus {
  systemStatus {
    databaseSchema
    databasePath
    configPath
    appSchema
    status
  }
}
    `;

/**
 * __useSystemStatusQuery__
 *
 * To run a query within a React component, call `useSystemStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useSystemStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSystemStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useSystemStatusQuery(baseOptions?: Apollo.QueryHookOptions<SystemStatusQuery, SystemStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SystemStatusQuery, SystemStatusQueryVariables>(SystemStatusDocument, options);
      }
export function useSystemStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SystemStatusQuery, SystemStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SystemStatusQuery, SystemStatusQueryVariables>(SystemStatusDocument, options);
        }
export function useSystemStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SystemStatusQuery, SystemStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SystemStatusQuery, SystemStatusQueryVariables>(SystemStatusDocument, options);
        }
export type SystemStatusQueryHookResult = ReturnType<typeof useSystemStatusQuery>;
export type SystemStatusLazyQueryHookResult = ReturnType<typeof useSystemStatusLazyQuery>;
export type SystemStatusSuspenseQueryHookResult = ReturnType<typeof useSystemStatusSuspenseQuery>;
export type SystemStatusQueryResult = Apollo.QueryResult<SystemStatusQuery, SystemStatusQueryVariables>;
export function refetchSystemStatusQuery(variables?: SystemStatusQueryVariables) {
      return { query: SystemStatusDocument, variables: variables }
    }
export const FindSavedFilterDocument = gql`
    query FindSavedFilter($id: ID!) {
  findSavedFilter(id: $id) {
    ...SavedFilterData
  }
}
    ${SavedFilterDataFragmentDoc}`;

/**
 * __useFindSavedFilterQuery__
 *
 * To run a query within a React component, call `useFindSavedFilterQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSavedFilterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindSavedFilterQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindSavedFilterQuery(baseOptions: Apollo.QueryHookOptions<FindSavedFilterQuery, FindSavedFilterQueryVariables> & ({ variables: FindSavedFilterQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindSavedFilterQuery, FindSavedFilterQueryVariables>(FindSavedFilterDocument, options);
      }
export function useFindSavedFilterLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSavedFilterQuery, FindSavedFilterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindSavedFilterQuery, FindSavedFilterQueryVariables>(FindSavedFilterDocument, options);
        }
export function useFindSavedFilterSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindSavedFilterQuery, FindSavedFilterQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindSavedFilterQuery, FindSavedFilterQueryVariables>(FindSavedFilterDocument, options);
        }
export type FindSavedFilterQueryHookResult = ReturnType<typeof useFindSavedFilterQuery>;
export type FindSavedFilterLazyQueryHookResult = ReturnType<typeof useFindSavedFilterLazyQuery>;
export type FindSavedFilterSuspenseQueryHookResult = ReturnType<typeof useFindSavedFilterSuspenseQuery>;
export type FindSavedFilterQueryResult = Apollo.QueryResult<FindSavedFilterQuery, FindSavedFilterQueryVariables>;
export function refetchFindSavedFilterQuery(variables: FindSavedFilterQueryVariables) {
      return { query: FindSavedFilterDocument, variables: variables }
    }
export const FindSavedFiltersDocument = gql`
    query FindSavedFilters($mode: FilterMode) {
  findSavedFilters(mode: $mode) {
    ...SavedFilterData
  }
}
    ${SavedFilterDataFragmentDoc}`;

/**
 * __useFindSavedFiltersQuery__
 *
 * To run a query within a React component, call `useFindSavedFiltersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindSavedFiltersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindSavedFiltersQuery({
 *   variables: {
 *      mode: // value for 'mode'
 *   },
 * });
 */
export function useFindSavedFiltersQuery(baseOptions?: Apollo.QueryHookOptions<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>(FindSavedFiltersDocument, options);
      }
export function useFindSavedFiltersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>(FindSavedFiltersDocument, options);
        }
export function useFindSavedFiltersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>(FindSavedFiltersDocument, options);
        }
export type FindSavedFiltersQueryHookResult = ReturnType<typeof useFindSavedFiltersQuery>;
export type FindSavedFiltersLazyQueryHookResult = ReturnType<typeof useFindSavedFiltersLazyQuery>;
export type FindSavedFiltersSuspenseQueryHookResult = ReturnType<typeof useFindSavedFiltersSuspenseQuery>;
export type FindSavedFiltersQueryResult = Apollo.QueryResult<FindSavedFiltersQuery, FindSavedFiltersQueryVariables>;
export function refetchFindSavedFiltersQuery(variables?: FindSavedFiltersQueryVariables) {
      return { query: FindSavedFiltersDocument, variables: variables }
    }
export const DirectoryDocument = gql`
    query Directory($path: String) {
  directory(path: $path) {
    path
    parent
    directories
  }
}
    `;

/**
 * __useDirectoryQuery__
 *
 * To run a query within a React component, call `useDirectoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useDirectoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDirectoryQuery({
 *   variables: {
 *      path: // value for 'path'
 *   },
 * });
 */
export function useDirectoryQuery(baseOptions?: Apollo.QueryHookOptions<DirectoryQuery, DirectoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DirectoryQuery, DirectoryQueryVariables>(DirectoryDocument, options);
      }
export function useDirectoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DirectoryQuery, DirectoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DirectoryQuery, DirectoryQueryVariables>(DirectoryDocument, options);
        }
export function useDirectorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DirectoryQuery, DirectoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DirectoryQuery, DirectoryQueryVariables>(DirectoryDocument, options);
        }
export type DirectoryQueryHookResult = ReturnType<typeof useDirectoryQuery>;
export type DirectoryLazyQueryHookResult = ReturnType<typeof useDirectoryLazyQuery>;
export type DirectorySuspenseQueryHookResult = ReturnType<typeof useDirectorySuspenseQuery>;
export type DirectoryQueryResult = Apollo.QueryResult<DirectoryQuery, DirectoryQueryVariables>;
export function refetchDirectoryQuery(variables?: DirectoryQueryVariables) {
      return { query: DirectoryDocument, variables: variables }
    }
export const FindRootFoldersForSelectDocument = gql`
    query FindRootFoldersForSelect {
  findFolders(
    filter: {per_page: -1, sort: "path", direction: ASC}
    folder_filter: {parent_folder: {modifier: IS_NULL}}
  ) {
    count
    folders {
      ...SelectFolderData
    }
  }
}
    ${SelectFolderDataFragmentDoc}`;

/**
 * __useFindRootFoldersForSelectQuery__
 *
 * To run a query within a React component, call `useFindRootFoldersForSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindRootFoldersForSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindRootFoldersForSelectQuery({
 *   variables: {
 *   },
 * });
 */
export function useFindRootFoldersForSelectQuery(baseOptions?: Apollo.QueryHookOptions<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>(FindRootFoldersForSelectDocument, options);
      }
export function useFindRootFoldersForSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>(FindRootFoldersForSelectDocument, options);
        }
export function useFindRootFoldersForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>(FindRootFoldersForSelectDocument, options);
        }
export type FindRootFoldersForSelectQueryHookResult = ReturnType<typeof useFindRootFoldersForSelectQuery>;
export type FindRootFoldersForSelectLazyQueryHookResult = ReturnType<typeof useFindRootFoldersForSelectLazyQuery>;
export type FindRootFoldersForSelectSuspenseQueryHookResult = ReturnType<typeof useFindRootFoldersForSelectSuspenseQuery>;
export type FindRootFoldersForSelectQueryResult = Apollo.QueryResult<FindRootFoldersForSelectQuery, FindRootFoldersForSelectQueryVariables>;
export function refetchFindRootFoldersForSelectQuery(variables?: FindRootFoldersForSelectQueryVariables) {
      return { query: FindRootFoldersForSelectDocument, variables: variables }
    }
export const FindFoldersForQueryDocument = gql`
    query FindFoldersForQuery($filter: FindFilterType, $folder_filter: FolderFilterType, $ids: [ID!]) {
  findFolders(filter: $filter, folder_filter: $folder_filter, ids: $ids) {
    count
    folders {
      ...RecursiveFolderData
    }
  }
}
    ${RecursiveFolderDataFragmentDoc}`;

/**
 * __useFindFoldersForQueryQuery__
 *
 * To run a query within a React component, call `useFindFoldersForQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindFoldersForQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindFoldersForQueryQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      folder_filter: // value for 'folder_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindFoldersForQueryQuery(baseOptions?: Apollo.QueryHookOptions<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>(FindFoldersForQueryDocument, options);
      }
export function useFindFoldersForQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>(FindFoldersForQueryDocument, options);
        }
export function useFindFoldersForQuerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>(FindFoldersForQueryDocument, options);
        }
export type FindFoldersForQueryQueryHookResult = ReturnType<typeof useFindFoldersForQueryQuery>;
export type FindFoldersForQueryLazyQueryHookResult = ReturnType<typeof useFindFoldersForQueryLazyQuery>;
export type FindFoldersForQuerySuspenseQueryHookResult = ReturnType<typeof useFindFoldersForQuerySuspenseQuery>;
export type FindFoldersForQueryQueryResult = Apollo.QueryResult<FindFoldersForQueryQuery, FindFoldersForQueryQueryVariables>;
export function refetchFindFoldersForQueryQuery(variables?: FindFoldersForQueryQueryVariables) {
      return { query: FindFoldersForQueryDocument, variables: variables }
    }
export const JobQueueDocument = gql`
    query JobQueue {
  jobQueue {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;

/**
 * __useJobQueueQuery__
 *
 * To run a query within a React component, call `useJobQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobQueueQuery({
 *   variables: {
 *   },
 * });
 */
export function useJobQueueQuery(baseOptions?: Apollo.QueryHookOptions<JobQueueQuery, JobQueueQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<JobQueueQuery, JobQueueQueryVariables>(JobQueueDocument, options);
      }
export function useJobQueueLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<JobQueueQuery, JobQueueQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<JobQueueQuery, JobQueueQueryVariables>(JobQueueDocument, options);
        }
export function useJobQueueSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<JobQueueQuery, JobQueueQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<JobQueueQuery, JobQueueQueryVariables>(JobQueueDocument, options);
        }
export type JobQueueQueryHookResult = ReturnType<typeof useJobQueueQuery>;
export type JobQueueLazyQueryHookResult = ReturnType<typeof useJobQueueLazyQuery>;
export type JobQueueSuspenseQueryHookResult = ReturnType<typeof useJobQueueSuspenseQuery>;
export type JobQueueQueryResult = Apollo.QueryResult<JobQueueQuery, JobQueueQueryVariables>;
export function refetchJobQueueQuery(variables?: JobQueueQueryVariables) {
      return { query: JobQueueDocument, variables: variables }
    }
export const FindJobDocument = gql`
    query FindJob($input: FindJobInput!) {
  findJob(input: $input) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;

/**
 * __useFindJobQuery__
 *
 * To run a query within a React component, call `useFindJobQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindJobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindJobQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useFindJobQuery(baseOptions: Apollo.QueryHookOptions<FindJobQuery, FindJobQueryVariables> & ({ variables: FindJobQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindJobQuery, FindJobQueryVariables>(FindJobDocument, options);
      }
export function useFindJobLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindJobQuery, FindJobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindJobQuery, FindJobQueryVariables>(FindJobDocument, options);
        }
export function useFindJobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindJobQuery, FindJobQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindJobQuery, FindJobQueryVariables>(FindJobDocument, options);
        }
export type FindJobQueryHookResult = ReturnType<typeof useFindJobQuery>;
export type FindJobLazyQueryHookResult = ReturnType<typeof useFindJobLazyQuery>;
export type FindJobSuspenseQueryHookResult = ReturnType<typeof useFindJobSuspenseQuery>;
export type FindJobQueryResult = Apollo.QueryResult<FindJobQuery, FindJobQueryVariables>;
export function refetchFindJobQuery(variables: FindJobQueryVariables) {
      return { query: FindJobDocument, variables: variables }
    }
export const StatsDocument = gql`
    query Stats {
  stats {
    audio_count
    audios_size
    audios_duration
    performer_count
    studio_count
    group_count
    tag_count
  }
}
    `;

/**
 * __useStatsQuery__
 *
 * To run a query within a React component, call `useStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useStatsQuery(baseOptions?: Apollo.QueryHookOptions<StatsQuery, StatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<StatsQuery, StatsQueryVariables>(StatsDocument, options);
      }
export function useStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<StatsQuery, StatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<StatsQuery, StatsQueryVariables>(StatsDocument, options);
        }
export function useStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<StatsQuery, StatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<StatsQuery, StatsQueryVariables>(StatsDocument, options);
        }
export type StatsQueryHookResult = ReturnType<typeof useStatsQuery>;
export type StatsLazyQueryHookResult = ReturnType<typeof useStatsLazyQuery>;
export type StatsSuspenseQueryHookResult = ReturnType<typeof useStatsSuspenseQuery>;
export type StatsQueryResult = Apollo.QueryResult<StatsQuery, StatsQueryVariables>;
export function refetchStatsQuery(variables?: StatsQueryVariables) {
      return { query: StatsDocument, variables: variables }
    }
export const LogsDocument = gql`
    query Logs {
  logs {
    ...LogEntryData
  }
}
    ${LogEntryDataFragmentDoc}`;

/**
 * __useLogsQuery__
 *
 * To run a query within a React component, call `useLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLogsQuery({
 *   variables: {
 *   },
 * });
 */
export function useLogsQuery(baseOptions?: Apollo.QueryHookOptions<LogsQuery, LogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LogsQuery, LogsQueryVariables>(LogsDocument, options);
      }
export function useLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LogsQuery, LogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LogsQuery, LogsQueryVariables>(LogsDocument, options);
        }
export function useLogsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LogsQuery, LogsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LogsQuery, LogsQueryVariables>(LogsDocument, options);
        }
export type LogsQueryHookResult = ReturnType<typeof useLogsQuery>;
export type LogsLazyQueryHookResult = ReturnType<typeof useLogsLazyQuery>;
export type LogsSuspenseQueryHookResult = ReturnType<typeof useLogsSuspenseQuery>;
export type LogsQueryResult = Apollo.QueryResult<LogsQuery, LogsQueryVariables>;
export function refetchLogsQuery(variables?: LogsQueryVariables) {
      return { query: LogsDocument, variables: variables }
    }
export const VersionDocument = gql`
    query Version {
  version {
    version
    hash
    build_time
  }
}
    `;

/**
 * __useVersionQuery__
 *
 * To run a query within a React component, call `useVersionQuery` and pass it any options that fit your needs.
 * When your component renders, `useVersionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVersionQuery({
 *   variables: {
 *   },
 * });
 */
export function useVersionQuery(baseOptions?: Apollo.QueryHookOptions<VersionQuery, VersionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<VersionQuery, VersionQueryVariables>(VersionDocument, options);
      }
export function useVersionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<VersionQuery, VersionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<VersionQuery, VersionQueryVariables>(VersionDocument, options);
        }
export function useVersionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<VersionQuery, VersionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<VersionQuery, VersionQueryVariables>(VersionDocument, options);
        }
export type VersionQueryHookResult = ReturnType<typeof useVersionQuery>;
export type VersionLazyQueryHookResult = ReturnType<typeof useVersionLazyQuery>;
export type VersionSuspenseQueryHookResult = ReturnType<typeof useVersionSuspenseQuery>;
export type VersionQueryResult = Apollo.QueryResult<VersionQuery, VersionQueryVariables>;
export function refetchVersionQuery(variables?: VersionQueryVariables) {
      return { query: VersionDocument, variables: variables }
    }
export const LatestVersionDocument = gql`
    query LatestVersion {
  latestversion {
    version
    shorthash
    release_date
    url
  }
}
    `;

/**
 * __useLatestVersionQuery__
 *
 * To run a query within a React component, call `useLatestVersionQuery` and pass it any options that fit your needs.
 * When your component renders, `useLatestVersionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLatestVersionQuery({
 *   variables: {
 *   },
 * });
 */
export function useLatestVersionQuery(baseOptions?: Apollo.QueryHookOptions<LatestVersionQuery, LatestVersionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LatestVersionQuery, LatestVersionQueryVariables>(LatestVersionDocument, options);
      }
export function useLatestVersionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LatestVersionQuery, LatestVersionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LatestVersionQuery, LatestVersionQueryVariables>(LatestVersionDocument, options);
        }
export function useLatestVersionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LatestVersionQuery, LatestVersionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LatestVersionQuery, LatestVersionQueryVariables>(LatestVersionDocument, options);
        }
export type LatestVersionQueryHookResult = ReturnType<typeof useLatestVersionQuery>;
export type LatestVersionLazyQueryHookResult = ReturnType<typeof useLatestVersionLazyQuery>;
export type LatestVersionSuspenseQueryHookResult = ReturnType<typeof useLatestVersionSuspenseQuery>;
export type LatestVersionQueryResult = Apollo.QueryResult<LatestVersionQuery, LatestVersionQueryVariables>;
export function refetchLatestVersionQuery(variables?: LatestVersionQueryVariables) {
      return { query: LatestVersionDocument, variables: variables }
    }
export const FindGroupsDocument = gql`
    query FindGroups($filter: FindFilterType, $group_filter: GroupFilterType) {
  findGroups(filter: $filter, group_filter: $group_filter) {
    count
    groups {
      ...ListGroupData
    }
  }
}
    ${ListGroupDataFragmentDoc}`;

/**
 * __useFindGroupsQuery__
 *
 * To run a query within a React component, call `useFindGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGroupsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      group_filter: // value for 'group_filter'
 *   },
 * });
 */
export function useFindGroupsQuery(baseOptions?: Apollo.QueryHookOptions<FindGroupsQuery, FindGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGroupsQuery, FindGroupsQueryVariables>(FindGroupsDocument, options);
      }
export function useFindGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGroupsQuery, FindGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGroupsQuery, FindGroupsQueryVariables>(FindGroupsDocument, options);
        }
export function useFindGroupsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGroupsQuery, FindGroupsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGroupsQuery, FindGroupsQueryVariables>(FindGroupsDocument, options);
        }
export type FindGroupsQueryHookResult = ReturnType<typeof useFindGroupsQuery>;
export type FindGroupsLazyQueryHookResult = ReturnType<typeof useFindGroupsLazyQuery>;
export type FindGroupsSuspenseQueryHookResult = ReturnType<typeof useFindGroupsSuspenseQuery>;
export type FindGroupsQueryResult = Apollo.QueryResult<FindGroupsQuery, FindGroupsQueryVariables>;
export function refetchFindGroupsQuery(variables?: FindGroupsQueryVariables) {
      return { query: FindGroupsDocument, variables: variables }
    }
export const FindGroupDocument = gql`
    query FindGroup($id: ID!) {
  findGroup(id: $id) {
    ...GroupData
  }
}
    ${GroupDataFragmentDoc}`;

/**
 * __useFindGroupQuery__
 *
 * To run a query within a React component, call `useFindGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGroupQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindGroupQuery(baseOptions: Apollo.QueryHookOptions<FindGroupQuery, FindGroupQueryVariables> & ({ variables: FindGroupQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGroupQuery, FindGroupQueryVariables>(FindGroupDocument, options);
      }
export function useFindGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGroupQuery, FindGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGroupQuery, FindGroupQueryVariables>(FindGroupDocument, options);
        }
export function useFindGroupSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGroupQuery, FindGroupQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGroupQuery, FindGroupQueryVariables>(FindGroupDocument, options);
        }
export type FindGroupQueryHookResult = ReturnType<typeof useFindGroupQuery>;
export type FindGroupLazyQueryHookResult = ReturnType<typeof useFindGroupLazyQuery>;
export type FindGroupSuspenseQueryHookResult = ReturnType<typeof useFindGroupSuspenseQuery>;
export type FindGroupQueryResult = Apollo.QueryResult<FindGroupQuery, FindGroupQueryVariables>;
export function refetchFindGroupQuery(variables: FindGroupQueryVariables) {
      return { query: FindGroupDocument, variables: variables }
    }
export const FindGroupsForSelectDocument = gql`
    query FindGroupsForSelect($filter: FindFilterType, $group_filter: GroupFilterType, $ids: [ID!]) {
  findGroups(filter: $filter, group_filter: $group_filter, ids: $ids) {
    count
    groups {
      ...SelectGroupData
    }
  }
}
    ${SelectGroupDataFragmentDoc}`;

/**
 * __useFindGroupsForSelectQuery__
 *
 * To run a query within a React component, call `useFindGroupsForSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGroupsForSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGroupsForSelectQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      group_filter: // value for 'group_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindGroupsForSelectQuery(baseOptions?: Apollo.QueryHookOptions<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>(FindGroupsForSelectDocument, options);
      }
export function useFindGroupsForSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>(FindGroupsForSelectDocument, options);
        }
export function useFindGroupsForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>(FindGroupsForSelectDocument, options);
        }
export type FindGroupsForSelectQueryHookResult = ReturnType<typeof useFindGroupsForSelectQuery>;
export type FindGroupsForSelectLazyQueryHookResult = ReturnType<typeof useFindGroupsForSelectLazyQuery>;
export type FindGroupsForSelectSuspenseQueryHookResult = ReturnType<typeof useFindGroupsForSelectSuspenseQuery>;
export type FindGroupsForSelectQueryResult = Apollo.QueryResult<FindGroupsForSelectQuery, FindGroupsForSelectQueryVariables>;
export function refetchFindGroupsForSelectQuery(variables?: FindGroupsForSelectQueryVariables) {
      return { query: FindGroupsForSelectDocument, variables: variables }
    }
export const FindPerformersDocument = gql`
    query FindPerformers($filter: FindFilterType, $performer_filter: PerformerFilterType, $performer_ids: [Int!]) {
  findPerformers(
    filter: $filter
    performer_filter: $performer_filter
    performer_ids: $performer_ids
  ) {
    count
    performers {
      ...PerformerData
    }
  }
}
    ${PerformerDataFragmentDoc}`;

/**
 * __useFindPerformersQuery__
 *
 * To run a query within a React component, call `useFindPerformersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindPerformersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindPerformersQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      performer_filter: // value for 'performer_filter'
 *      performer_ids: // value for 'performer_ids'
 *   },
 * });
 */
export function useFindPerformersQuery(baseOptions?: Apollo.QueryHookOptions<FindPerformersQuery, FindPerformersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindPerformersQuery, FindPerformersQueryVariables>(FindPerformersDocument, options);
      }
export function useFindPerformersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPerformersQuery, FindPerformersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindPerformersQuery, FindPerformersQueryVariables>(FindPerformersDocument, options);
        }
export function useFindPerformersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindPerformersQuery, FindPerformersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindPerformersQuery, FindPerformersQueryVariables>(FindPerformersDocument, options);
        }
export type FindPerformersQueryHookResult = ReturnType<typeof useFindPerformersQuery>;
export type FindPerformersLazyQueryHookResult = ReturnType<typeof useFindPerformersLazyQuery>;
export type FindPerformersSuspenseQueryHookResult = ReturnType<typeof useFindPerformersSuspenseQuery>;
export type FindPerformersQueryResult = Apollo.QueryResult<FindPerformersQuery, FindPerformersQueryVariables>;
export function refetchFindPerformersQuery(variables?: FindPerformersQueryVariables) {
      return { query: FindPerformersDocument, variables: variables }
    }
export const FindPerformerDocument = gql`
    query FindPerformer($id: ID!) {
  findPerformer(id: $id) {
    ...PerformerData
  }
}
    ${PerformerDataFragmentDoc}`;

/**
 * __useFindPerformerQuery__
 *
 * To run a query within a React component, call `useFindPerformerQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindPerformerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindPerformerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindPerformerQuery(baseOptions: Apollo.QueryHookOptions<FindPerformerQuery, FindPerformerQueryVariables> & ({ variables: FindPerformerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindPerformerQuery, FindPerformerQueryVariables>(FindPerformerDocument, options);
      }
export function useFindPerformerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPerformerQuery, FindPerformerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindPerformerQuery, FindPerformerQueryVariables>(FindPerformerDocument, options);
        }
export function useFindPerformerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindPerformerQuery, FindPerformerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindPerformerQuery, FindPerformerQueryVariables>(FindPerformerDocument, options);
        }
export type FindPerformerQueryHookResult = ReturnType<typeof useFindPerformerQuery>;
export type FindPerformerLazyQueryHookResult = ReturnType<typeof useFindPerformerLazyQuery>;
export type FindPerformerSuspenseQueryHookResult = ReturnType<typeof useFindPerformerSuspenseQuery>;
export type FindPerformerQueryResult = Apollo.QueryResult<FindPerformerQuery, FindPerformerQueryVariables>;
export function refetchFindPerformerQuery(variables: FindPerformerQueryVariables) {
      return { query: FindPerformerDocument, variables: variables }
    }
export const FindPerformersForSelectDocument = gql`
    query FindPerformersForSelect($filter: FindFilterType, $performer_filter: PerformerFilterType, $ids: [ID!]) {
  findPerformers(filter: $filter, performer_filter: $performer_filter, ids: $ids) {
    count
    performers {
      ...SelectPerformerData
    }
  }
}
    ${SelectPerformerDataFragmentDoc}`;

/**
 * __useFindPerformersForSelectQuery__
 *
 * To run a query within a React component, call `useFindPerformersForSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindPerformersForSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindPerformersForSelectQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      performer_filter: // value for 'performer_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindPerformersForSelectQuery(baseOptions?: Apollo.QueryHookOptions<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>(FindPerformersForSelectDocument, options);
      }
export function useFindPerformersForSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>(FindPerformersForSelectDocument, options);
        }
export function useFindPerformersForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>(FindPerformersForSelectDocument, options);
        }
export type FindPerformersForSelectQueryHookResult = ReturnType<typeof useFindPerformersForSelectQuery>;
export type FindPerformersForSelectLazyQueryHookResult = ReturnType<typeof useFindPerformersForSelectLazyQuery>;
export type FindPerformersForSelectSuspenseQueryHookResult = ReturnType<typeof useFindPerformersForSelectSuspenseQuery>;
export type FindPerformersForSelectQueryResult = Apollo.QueryResult<FindPerformersForSelectQuery, FindPerformersForSelectQueryVariables>;
export function refetchFindPerformersForSelectQuery(variables?: FindPerformersForSelectQueryVariables) {
      return { query: FindPerformersForSelectDocument, variables: variables }
    }
export const PluginsDocument = gql`
    query Plugins {
  plugins {
    id
    name
    enabled
    description
    url
    version
    tasks {
      name
      description
    }
    hooks {
      name
      description
      hooks
    }
    settings {
      name
      display_name
      description
      type
    }
    requires
    paths {
      css
      javascript
    }
  }
}
    `;

/**
 * __usePluginsQuery__
 *
 * To run a query within a React component, call `usePluginsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePluginsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePluginsQuery({
 *   variables: {
 *   },
 * });
 */
export function usePluginsQuery(baseOptions?: Apollo.QueryHookOptions<PluginsQuery, PluginsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PluginsQuery, PluginsQueryVariables>(PluginsDocument, options);
      }
export function usePluginsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PluginsQuery, PluginsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PluginsQuery, PluginsQueryVariables>(PluginsDocument, options);
        }
export function usePluginsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PluginsQuery, PluginsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PluginsQuery, PluginsQueryVariables>(PluginsDocument, options);
        }
export type PluginsQueryHookResult = ReturnType<typeof usePluginsQuery>;
export type PluginsLazyQueryHookResult = ReturnType<typeof usePluginsLazyQuery>;
export type PluginsSuspenseQueryHookResult = ReturnType<typeof usePluginsSuspenseQuery>;
export type PluginsQueryResult = Apollo.QueryResult<PluginsQuery, PluginsQueryVariables>;
export function refetchPluginsQuery(variables?: PluginsQueryVariables) {
      return { query: PluginsDocument, variables: variables }
    }
export const PluginTasksDocument = gql`
    query PluginTasks {
  pluginTasks {
    name
    description
    plugin {
      id
      name
      enabled
    }
  }
}
    `;

/**
 * __usePluginTasksQuery__
 *
 * To run a query within a React component, call `usePluginTasksQuery` and pass it any options that fit your needs.
 * When your component renders, `usePluginTasksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePluginTasksQuery({
 *   variables: {
 *   },
 * });
 */
export function usePluginTasksQuery(baseOptions?: Apollo.QueryHookOptions<PluginTasksQuery, PluginTasksQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PluginTasksQuery, PluginTasksQueryVariables>(PluginTasksDocument, options);
      }
export function usePluginTasksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PluginTasksQuery, PluginTasksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PluginTasksQuery, PluginTasksQueryVariables>(PluginTasksDocument, options);
        }
export function usePluginTasksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PluginTasksQuery, PluginTasksQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PluginTasksQuery, PluginTasksQueryVariables>(PluginTasksDocument, options);
        }
export type PluginTasksQueryHookResult = ReturnType<typeof usePluginTasksQuery>;
export type PluginTasksLazyQueryHookResult = ReturnType<typeof usePluginTasksLazyQuery>;
export type PluginTasksSuspenseQueryHookResult = ReturnType<typeof usePluginTasksSuspenseQuery>;
export type PluginTasksQueryResult = Apollo.QueryResult<PluginTasksQuery, PluginTasksQueryVariables>;
export function refetchPluginTasksQuery(variables?: PluginTasksQueryVariables) {
      return { query: PluginTasksDocument, variables: variables }
    }
export const InstalledPluginPackagesDocument = gql`
    query InstalledPluginPackages {
  installedPackages(type: Plugin) {
    ...PackageData
  }
}
    ${PackageDataFragmentDoc}`;

/**
 * __useInstalledPluginPackagesQuery__
 *
 * To run a query within a React component, call `useInstalledPluginPackagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useInstalledPluginPackagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInstalledPluginPackagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useInstalledPluginPackagesQuery(baseOptions?: Apollo.QueryHookOptions<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>(InstalledPluginPackagesDocument, options);
      }
export function useInstalledPluginPackagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>(InstalledPluginPackagesDocument, options);
        }
export function useInstalledPluginPackagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>(InstalledPluginPackagesDocument, options);
        }
export type InstalledPluginPackagesQueryHookResult = ReturnType<typeof useInstalledPluginPackagesQuery>;
export type InstalledPluginPackagesLazyQueryHookResult = ReturnType<typeof useInstalledPluginPackagesLazyQuery>;
export type InstalledPluginPackagesSuspenseQueryHookResult = ReturnType<typeof useInstalledPluginPackagesSuspenseQuery>;
export type InstalledPluginPackagesQueryResult = Apollo.QueryResult<InstalledPluginPackagesQuery, InstalledPluginPackagesQueryVariables>;
export function refetchInstalledPluginPackagesQuery(variables?: InstalledPluginPackagesQueryVariables) {
      return { query: InstalledPluginPackagesDocument, variables: variables }
    }
export const InstalledPluginPackagesStatusDocument = gql`
    query InstalledPluginPackagesStatus {
  installedPackages(type: Plugin) {
    ...PackageData
    source_package {
      ...PackageData
    }
  }
}
    ${PackageDataFragmentDoc}`;

/**
 * __useInstalledPluginPackagesStatusQuery__
 *
 * To run a query within a React component, call `useInstalledPluginPackagesStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useInstalledPluginPackagesStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInstalledPluginPackagesStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useInstalledPluginPackagesStatusQuery(baseOptions?: Apollo.QueryHookOptions<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>(InstalledPluginPackagesStatusDocument, options);
      }
export function useInstalledPluginPackagesStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>(InstalledPluginPackagesStatusDocument, options);
        }
export function useInstalledPluginPackagesStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>(InstalledPluginPackagesStatusDocument, options);
        }
export type InstalledPluginPackagesStatusQueryHookResult = ReturnType<typeof useInstalledPluginPackagesStatusQuery>;
export type InstalledPluginPackagesStatusLazyQueryHookResult = ReturnType<typeof useInstalledPluginPackagesStatusLazyQuery>;
export type InstalledPluginPackagesStatusSuspenseQueryHookResult = ReturnType<typeof useInstalledPluginPackagesStatusSuspenseQuery>;
export type InstalledPluginPackagesStatusQueryResult = Apollo.QueryResult<InstalledPluginPackagesStatusQuery, InstalledPluginPackagesStatusQueryVariables>;
export function refetchInstalledPluginPackagesStatusQuery(variables?: InstalledPluginPackagesStatusQueryVariables) {
      return { query: InstalledPluginPackagesStatusDocument, variables: variables }
    }
export const AvailablePluginPackagesDocument = gql`
    query AvailablePluginPackages($source: String!) {
  availablePackages(source: $source, type: Plugin) {
    ...PackageData
    requires {
      package_id
    }
  }
}
    ${PackageDataFragmentDoc}`;

/**
 * __useAvailablePluginPackagesQuery__
 *
 * To run a query within a React component, call `useAvailablePluginPackagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAvailablePluginPackagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailablePluginPackagesQuery({
 *   variables: {
 *      source: // value for 'source'
 *   },
 * });
 */
export function useAvailablePluginPackagesQuery(baseOptions: Apollo.QueryHookOptions<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables> & ({ variables: AvailablePluginPackagesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables>(AvailablePluginPackagesDocument, options);
      }
export function useAvailablePluginPackagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables>(AvailablePluginPackagesDocument, options);
        }
export function useAvailablePluginPackagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables>(AvailablePluginPackagesDocument, options);
        }
export type AvailablePluginPackagesQueryHookResult = ReturnType<typeof useAvailablePluginPackagesQuery>;
export type AvailablePluginPackagesLazyQueryHookResult = ReturnType<typeof useAvailablePluginPackagesLazyQuery>;
export type AvailablePluginPackagesSuspenseQueryHookResult = ReturnType<typeof useAvailablePluginPackagesSuspenseQuery>;
export type AvailablePluginPackagesQueryResult = Apollo.QueryResult<AvailablePluginPackagesQuery, AvailablePluginPackagesQueryVariables>;
export function refetchAvailablePluginPackagesQuery(variables: AvailablePluginPackagesQueryVariables) {
      return { query: AvailablePluginPackagesDocument, variables: variables }
    }
export const ListPerformerScrapersDocument = gql`
    query ListPerformerScrapers {
  listScrapers(types: [PERFORMER]) {
    ...ScraperData
  }
}
    ${ScraperDataFragmentDoc}`;

/**
 * __useListPerformerScrapersQuery__
 *
 * To run a query within a React component, call `useListPerformerScrapersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPerformerScrapersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPerformerScrapersQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPerformerScrapersQuery(baseOptions?: Apollo.QueryHookOptions<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>(ListPerformerScrapersDocument, options);
      }
export function useListPerformerScrapersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>(ListPerformerScrapersDocument, options);
        }
export function useListPerformerScrapersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>(ListPerformerScrapersDocument, options);
        }
export type ListPerformerScrapersQueryHookResult = ReturnType<typeof useListPerformerScrapersQuery>;
export type ListPerformerScrapersLazyQueryHookResult = ReturnType<typeof useListPerformerScrapersLazyQuery>;
export type ListPerformerScrapersSuspenseQueryHookResult = ReturnType<typeof useListPerformerScrapersSuspenseQuery>;
export type ListPerformerScrapersQueryResult = Apollo.QueryResult<ListPerformerScrapersQuery, ListPerformerScrapersQueryVariables>;
export function refetchListPerformerScrapersQuery(variables?: ListPerformerScrapersQueryVariables) {
      return { query: ListPerformerScrapersDocument, variables: variables }
    }
export const ListGroupScrapersDocument = gql`
    query ListGroupScrapers {
  listScrapers(types: [GROUP]) {
    ...ScraperData
  }
}
    ${ScraperDataFragmentDoc}`;

/**
 * __useListGroupScrapersQuery__
 *
 * To run a query within a React component, call `useListGroupScrapersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListGroupScrapersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListGroupScrapersQuery({
 *   variables: {
 *   },
 * });
 */
export function useListGroupScrapersQuery(baseOptions?: Apollo.QueryHookOptions<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>(ListGroupScrapersDocument, options);
      }
export function useListGroupScrapersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>(ListGroupScrapersDocument, options);
        }
export function useListGroupScrapersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>(ListGroupScrapersDocument, options);
        }
export type ListGroupScrapersQueryHookResult = ReturnType<typeof useListGroupScrapersQuery>;
export type ListGroupScrapersLazyQueryHookResult = ReturnType<typeof useListGroupScrapersLazyQuery>;
export type ListGroupScrapersSuspenseQueryHookResult = ReturnType<typeof useListGroupScrapersSuspenseQuery>;
export type ListGroupScrapersQueryResult = Apollo.QueryResult<ListGroupScrapersQuery, ListGroupScrapersQueryVariables>;
export function refetchListGroupScrapersQuery(variables?: ListGroupScrapersQueryVariables) {
      return { query: ListGroupScrapersDocument, variables: variables }
    }
export const FindStudiosDocument = gql`
    query FindStudios($filter: FindFilterType, $studio_filter: StudioFilterType) {
  findStudios(filter: $filter, studio_filter: $studio_filter) {
    count
    studios {
      ...StudioData
    }
  }
}
    ${StudioDataFragmentDoc}`;

/**
 * __useFindStudiosQuery__
 *
 * To run a query within a React component, call `useFindStudiosQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindStudiosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindStudiosQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      studio_filter: // value for 'studio_filter'
 *   },
 * });
 */
export function useFindStudiosQuery(baseOptions?: Apollo.QueryHookOptions<FindStudiosQuery, FindStudiosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindStudiosQuery, FindStudiosQueryVariables>(FindStudiosDocument, options);
      }
export function useFindStudiosLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindStudiosQuery, FindStudiosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindStudiosQuery, FindStudiosQueryVariables>(FindStudiosDocument, options);
        }
export function useFindStudiosSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindStudiosQuery, FindStudiosQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindStudiosQuery, FindStudiosQueryVariables>(FindStudiosDocument, options);
        }
export type FindStudiosQueryHookResult = ReturnType<typeof useFindStudiosQuery>;
export type FindStudiosLazyQueryHookResult = ReturnType<typeof useFindStudiosLazyQuery>;
export type FindStudiosSuspenseQueryHookResult = ReturnType<typeof useFindStudiosSuspenseQuery>;
export type FindStudiosQueryResult = Apollo.QueryResult<FindStudiosQuery, FindStudiosQueryVariables>;
export function refetchFindStudiosQuery(variables?: FindStudiosQueryVariables) {
      return { query: FindStudiosDocument, variables: variables }
    }
export const FindStudioDocument = gql`
    query FindStudio($id: ID!) {
  findStudio(id: $id) {
    ...StudioData
  }
}
    ${StudioDataFragmentDoc}`;

/**
 * __useFindStudioQuery__
 *
 * To run a query within a React component, call `useFindStudioQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindStudioQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindStudioQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindStudioQuery(baseOptions: Apollo.QueryHookOptions<FindStudioQuery, FindStudioQueryVariables> & ({ variables: FindStudioQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindStudioQuery, FindStudioQueryVariables>(FindStudioDocument, options);
      }
export function useFindStudioLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindStudioQuery, FindStudioQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindStudioQuery, FindStudioQueryVariables>(FindStudioDocument, options);
        }
export function useFindStudioSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindStudioQuery, FindStudioQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindStudioQuery, FindStudioQueryVariables>(FindStudioDocument, options);
        }
export type FindStudioQueryHookResult = ReturnType<typeof useFindStudioQuery>;
export type FindStudioLazyQueryHookResult = ReturnType<typeof useFindStudioLazyQuery>;
export type FindStudioSuspenseQueryHookResult = ReturnType<typeof useFindStudioSuspenseQuery>;
export type FindStudioQueryResult = Apollo.QueryResult<FindStudioQuery, FindStudioQueryVariables>;
export function refetchFindStudioQuery(variables: FindStudioQueryVariables) {
      return { query: FindStudioDocument, variables: variables }
    }
export const FindStudiosForSelectDocument = gql`
    query FindStudiosForSelect($filter: FindFilterType, $studio_filter: StudioFilterType, $ids: [ID!]) {
  findStudios(filter: $filter, studio_filter: $studio_filter, ids: $ids) {
    count
    studios {
      ...SelectStudioData
    }
  }
}
    ${SelectStudioDataFragmentDoc}`;

/**
 * __useFindStudiosForSelectQuery__
 *
 * To run a query within a React component, call `useFindStudiosForSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindStudiosForSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindStudiosForSelectQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      studio_filter: // value for 'studio_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindStudiosForSelectQuery(baseOptions?: Apollo.QueryHookOptions<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>(FindStudiosForSelectDocument, options);
      }
export function useFindStudiosForSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>(FindStudiosForSelectDocument, options);
        }
export function useFindStudiosForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>(FindStudiosForSelectDocument, options);
        }
export type FindStudiosForSelectQueryHookResult = ReturnType<typeof useFindStudiosForSelectQuery>;
export type FindStudiosForSelectLazyQueryHookResult = ReturnType<typeof useFindStudiosForSelectLazyQuery>;
export type FindStudiosForSelectSuspenseQueryHookResult = ReturnType<typeof useFindStudiosForSelectSuspenseQuery>;
export type FindStudiosForSelectQueryResult = Apollo.QueryResult<FindStudiosForSelectQuery, FindStudiosForSelectQueryVariables>;
export function refetchFindStudiosForSelectQuery(variables?: FindStudiosForSelectQueryVariables) {
      return { query: FindStudiosForSelectDocument, variables: variables }
    }
export const FindTagsDocument = gql`
    query FindTags($filter: FindFilterType, $tag_filter: TagFilterType, $ids: [ID!]) {
  findTags(filter: $filter, tag_filter: $tag_filter, ids: $ids) {
    count
    tags {
      ...TagData
    }
  }
}
    ${TagDataFragmentDoc}`;

/**
 * __useFindTagsQuery__
 *
 * To run a query within a React component, call `useFindTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindTagsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      tag_filter: // value for 'tag_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindTagsQuery(baseOptions?: Apollo.QueryHookOptions<FindTagsQuery, FindTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindTagsQuery, FindTagsQueryVariables>(FindTagsDocument, options);
      }
export function useFindTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindTagsQuery, FindTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindTagsQuery, FindTagsQueryVariables>(FindTagsDocument, options);
        }
export function useFindTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindTagsQuery, FindTagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindTagsQuery, FindTagsQueryVariables>(FindTagsDocument, options);
        }
export type FindTagsQueryHookResult = ReturnType<typeof useFindTagsQuery>;
export type FindTagsLazyQueryHookResult = ReturnType<typeof useFindTagsLazyQuery>;
export type FindTagsSuspenseQueryHookResult = ReturnType<typeof useFindTagsSuspenseQuery>;
export type FindTagsQueryResult = Apollo.QueryResult<FindTagsQuery, FindTagsQueryVariables>;
export function refetchFindTagsQuery(variables?: FindTagsQueryVariables) {
      return { query: FindTagsDocument, variables: variables }
    }
export const FindTagDocument = gql`
    query FindTag($id: ID!) {
  findTag(id: $id) {
    ...TagData
  }
}
    ${TagDataFragmentDoc}`;

/**
 * __useFindTagQuery__
 *
 * To run a query within a React component, call `useFindTagQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindTagQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindTagQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindTagQuery(baseOptions: Apollo.QueryHookOptions<FindTagQuery, FindTagQueryVariables> & ({ variables: FindTagQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindTagQuery, FindTagQueryVariables>(FindTagDocument, options);
      }
export function useFindTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindTagQuery, FindTagQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindTagQuery, FindTagQueryVariables>(FindTagDocument, options);
        }
export function useFindTagSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindTagQuery, FindTagQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindTagQuery, FindTagQueryVariables>(FindTagDocument, options);
        }
export type FindTagQueryHookResult = ReturnType<typeof useFindTagQuery>;
export type FindTagLazyQueryHookResult = ReturnType<typeof useFindTagLazyQuery>;
export type FindTagSuspenseQueryHookResult = ReturnType<typeof useFindTagSuspenseQuery>;
export type FindTagQueryResult = Apollo.QueryResult<FindTagQuery, FindTagQueryVariables>;
export function refetchFindTagQuery(variables: FindTagQueryVariables) {
      return { query: FindTagDocument, variables: variables }
    }
export const FindTagsForSelectDocument = gql`
    query FindTagsForSelect($filter: FindFilterType, $tag_filter: TagFilterType, $ids: [ID!]) {
  findTags(filter: $filter, tag_filter: $tag_filter, ids: $ids) {
    count
    tags {
      ...SelectTagData
    }
  }
}
    ${SelectTagDataFragmentDoc}`;

/**
 * __useFindTagsForSelectQuery__
 *
 * To run a query within a React component, call `useFindTagsForSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindTagsForSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindTagsForSelectQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      tag_filter: // value for 'tag_filter'
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useFindTagsForSelectQuery(baseOptions?: Apollo.QueryHookOptions<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>(FindTagsForSelectDocument, options);
      }
export function useFindTagsForSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>(FindTagsForSelectDocument, options);
        }
export function useFindTagsForSelectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>(FindTagsForSelectDocument, options);
        }
export type FindTagsForSelectQueryHookResult = ReturnType<typeof useFindTagsForSelectQuery>;
export type FindTagsForSelectLazyQueryHookResult = ReturnType<typeof useFindTagsForSelectLazyQuery>;
export type FindTagsForSelectSuspenseQueryHookResult = ReturnType<typeof useFindTagsForSelectSuspenseQuery>;
export type FindTagsForSelectQueryResult = Apollo.QueryResult<FindTagsForSelectQuery, FindTagsForSelectQueryVariables>;
export function refetchFindTagsForSelectQuery(variables?: FindTagsForSelectQueryVariables) {
      return { query: FindTagsForSelectDocument, variables: variables }
    }
export const FindTagsForListDocument = gql`
    query FindTagsForList($filter: FindFilterType, $tag_filter: TagFilterType) {
  findTags(filter: $filter, tag_filter: $tag_filter) {
    count
    tags {
      ...TagListData
    }
  }
}
    ${TagListDataFragmentDoc}`;

/**
 * __useFindTagsForListQuery__
 *
 * To run a query within a React component, call `useFindTagsForListQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindTagsForListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindTagsForListQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      tag_filter: // value for 'tag_filter'
 *   },
 * });
 */
export function useFindTagsForListQuery(baseOptions?: Apollo.QueryHookOptions<FindTagsForListQuery, FindTagsForListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindTagsForListQuery, FindTagsForListQueryVariables>(FindTagsForListDocument, options);
      }
export function useFindTagsForListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindTagsForListQuery, FindTagsForListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindTagsForListQuery, FindTagsForListQueryVariables>(FindTagsForListDocument, options);
        }
export function useFindTagsForListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindTagsForListQuery, FindTagsForListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindTagsForListQuery, FindTagsForListQueryVariables>(FindTagsForListDocument, options);
        }
export type FindTagsForListQueryHookResult = ReturnType<typeof useFindTagsForListQuery>;
export type FindTagsForListLazyQueryHookResult = ReturnType<typeof useFindTagsForListLazyQuery>;
export type FindTagsForListSuspenseQueryHookResult = ReturnType<typeof useFindTagsForListSuspenseQuery>;
export type FindTagsForListQueryResult = Apollo.QueryResult<FindTagsForListQuery, FindTagsForListQueryVariables>;
export function refetchFindTagsForListQuery(variables?: FindTagsForListQueryVariables) {
      return { query: FindTagsForListDocument, variables: variables }
    }
export const JobsSubscribeDocument = gql`
    subscription JobsSubscribe {
  jobsSubscribe {
    type
    job {
      id
      status
      subTasks
      description
      progress
      error
      startTime
    }
  }
}
    `;

/**
 * __useJobsSubscribeSubscription__
 *
 * To run a query within a React component, call `useJobsSubscribeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useJobsSubscribeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobsSubscribeSubscription({
 *   variables: {
 *   },
 * });
 */
export function useJobsSubscribeSubscription(baseOptions?: Apollo.SubscriptionHookOptions<JobsSubscribeSubscription, JobsSubscribeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<JobsSubscribeSubscription, JobsSubscribeSubscriptionVariables>(JobsSubscribeDocument, options);
      }
export type JobsSubscribeSubscriptionHookResult = ReturnType<typeof useJobsSubscribeSubscription>;
export type JobsSubscribeSubscriptionResult = Apollo.SubscriptionResult<JobsSubscribeSubscription>;
export const LoggingSubscribeDocument = gql`
    subscription LoggingSubscribe {
  loggingSubscribe {
    ...LogEntryData
  }
}
    ${LogEntryDataFragmentDoc}`;

/**
 * __useLoggingSubscribeSubscription__
 *
 * To run a query within a React component, call `useLoggingSubscribeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useLoggingSubscribeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoggingSubscribeSubscription({
 *   variables: {
 *   },
 * });
 */
export function useLoggingSubscribeSubscription(baseOptions?: Apollo.SubscriptionHookOptions<LoggingSubscribeSubscription, LoggingSubscribeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<LoggingSubscribeSubscription, LoggingSubscribeSubscriptionVariables>(LoggingSubscribeDocument, options);
      }
export type LoggingSubscribeSubscriptionHookResult = ReturnType<typeof useLoggingSubscribeSubscription>;
export type LoggingSubscribeSubscriptionResult = Apollo.SubscriptionResult<LoggingSubscribeSubscription>;
export const ScanCompleteSubscribeDocument = gql`
    subscription ScanCompleteSubscribe {
  scanCompleteSubscribe
}
    `;

/**
 * __useScanCompleteSubscribeSubscription__
 *
 * To run a query within a React component, call `useScanCompleteSubscribeSubscription` and pass it any options that fit your needs.
 * When your component renders, `useScanCompleteSubscribeSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useScanCompleteSubscribeSubscription({
 *   variables: {
 *   },
 * });
 */
export function useScanCompleteSubscribeSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ScanCompleteSubscribeSubscription, ScanCompleteSubscribeSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ScanCompleteSubscribeSubscription, ScanCompleteSubscribeSubscriptionVariables>(ScanCompleteSubscribeDocument, options);
      }
export type ScanCompleteSubscribeSubscriptionHookResult = ReturnType<typeof useScanCompleteSubscribeSubscription>;
export type ScanCompleteSubscribeSubscriptionResult = Apollo.SubscriptionResult<ScanCompleteSubscribeSubscription>;