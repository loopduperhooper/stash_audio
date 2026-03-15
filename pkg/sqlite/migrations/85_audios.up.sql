-- audios: main table for audio file metadata
CREATE TABLE `audios` (
  `id`            integer not null primary key autoincrement,
  `title`         varchar(255),
  `details`       text,
  `date`          date,
  `date_precision` tinyint,
  `rating`        tinyint,
  `o_counter`     tinyint not null default 0,
  `organized`     boolean not null default '0',
  `studio_id`     integer,
  `resume_time`   float not null default 0,
  `play_count`    tinyint not null default 0,
  `play_duration` float not null default 0,
  `last_played_at` datetime default null,
  `cover_blob`    varchar(255) REFERENCES `blobs`(`checksum`),
  `created_at`    datetime not null,
  `updated_at`    datetime not null,
  foreign key(`studio_id`) references `studios`(`id`) on delete SET NULL
);

CREATE INDEX `index_audios_on_studio_id` on `audios` (`studio_id`);

-- audio_files: metadata for audio-specific file properties
CREATE TABLE `audio_files` (
  `file_id`     integer NOT NULL primary key,
  `duration`    float NOT NULL,
  `audio_codec` varchar(255) NOT NULL,
  `format`      varchar(255) NOT NULL,
  `bit_rate`    integer NOT NULL,
  `sample_rate` integer NOT NULL,
  `channels`    integer NOT NULL,
  foreign key(`file_id`) references `files`(`id`) on delete CASCADE
);

-- audios_files: join table linking audios to their associated files
CREATE TABLE `audios_files` (
  `audio_id` integer NOT NULL,
  `file_id`  integer NOT NULL,
  `primary`  boolean NOT NULL,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE,
  foreign key(`file_id`) references `files`(`id`) on delete CASCADE,
  PRIMARY KEY(`audio_id`, `file_id`)
);

CREATE INDEX `index_audios_files_on_file_id` on `audios_files` (`file_id`);
CREATE UNIQUE INDEX `unique_index_audios_files_on_primary` on `audios_files` (`audio_id`) WHERE `primary` = 1;

-- audio_urls: multi-valued URLs for an audio entry
CREATE TABLE `audio_urls` (
  `audio_id` integer NOT NULL,
  `position` integer NOT NULL,
  `url`      varchar(255) NOT NULL,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE,
  PRIMARY KEY(`audio_id`, `position`, `url`)
);

CREATE INDEX `audio_urls_url` on `audio_urls` (`url`);

-- performers_audios: many-to-many performers <-> audios
CREATE TABLE `performers_audios` (
  `performer_id` integer NOT NULL,
  `audio_id`     integer NOT NULL,
  foreign key(`performer_id`) references `performers`(`id`) on delete CASCADE,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE,
  PRIMARY KEY(`audio_id`, `performer_id`)
);

CREATE INDEX `index_performers_audios_on_performer_id` on `performers_audios` (`performer_id`);

-- audios_tags: many-to-many audios <-> tags
CREATE TABLE `audios_tags` (
  `audio_id` integer NOT NULL,
  `tag_id`   integer NOT NULL,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE,
  foreign key(`tag_id`) references `tags`(`id`) on delete CASCADE,
  PRIMARY KEY(`audio_id`, `tag_id`)
);

CREATE INDEX `index_audios_tags_on_tag_id` on `audios_tags` (`tag_id`);

-- audio_stash_ids: StashBox IDs for audios
CREATE TABLE `audio_stash_ids` (
  `audio_id`  integer NOT NULL,
  `endpoint`  varchar(255) NOT NULL,
  `stash_id`  varchar(36) NOT NULL,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE,
  PRIMARY KEY(`audio_id`, `endpoint`)
);

-- audio_o_dates: o-counter history for audios
CREATE TABLE `audio_o_dates` (
  `audio_id` integer NOT NULL,
  `date`     datetime NOT NULL,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE
);

CREATE INDEX `index_audio_o_dates_on_audio_id` on `audio_o_dates` (`audio_id`);

-- audio_view_dates: play history for audios
CREATE TABLE `audio_view_dates` (
  `audio_id` integer NOT NULL,
  `view_date` datetime NOT NULL,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE
);

CREATE INDEX `index_audio_view_dates_on_audio_id` on `audio_view_dates` (`audio_id`);

-- audio_markers: timed annotations within an audio (like scene_markers)
CREATE TABLE `audio_markers` (
  `id`             integer not null primary key autoincrement,
  `title`          varchar(255) not null,
  `seconds`        float not null,
  `end_seconds`    float,
  `primary_tag_id` integer not null,
  `audio_id`       integer,
  `created_at`     datetime not null,
  `updated_at`     datetime not null,
  foreign key(`primary_tag_id`) references `tags`(`id`),
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE
);

CREATE INDEX `index_audio_markers_on_audio_id` on `audio_markers` (`audio_id`);
CREATE INDEX `index_audio_markers_on_primary_tag_id` on `audio_markers` (`primary_tag_id`);

-- audio_markers_tags: additional tags on a marker
CREATE TABLE `audio_markers_tags` (
  `audio_marker_id` integer NOT NULL,
  `tag_id`          integer NOT NULL,
  foreign key(`audio_marker_id`) references `audio_markers`(`id`) on delete CASCADE,
  foreign key(`tag_id`) references `tags`(`id`) on delete CASCADE,
  PRIMARY KEY(`audio_marker_id`, `tag_id`)
);

CREATE INDEX `index_audio_markers_tags_on_tag_id` on `audio_markers_tags` (`tag_id`);
