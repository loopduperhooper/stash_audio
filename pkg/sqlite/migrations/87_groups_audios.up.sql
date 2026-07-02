CREATE TABLE `groups_audios` (
  `group_id` integer NOT NULL,
  `audio_id` integer NOT NULL,
  `audio_index` tinyint,
  foreign key(`group_id`) references `groups`(`id`) on delete CASCADE,
  foreign key(`audio_id`) references `audios`(`id`) on delete CASCADE,
  PRIMARY KEY(`group_id`, `audio_id`)
);
CREATE INDEX `index_groups_audios_on_group_id` on `groups_audios` (`group_id`);
CREATE INDEX `index_groups_audios_on_audio_id` on `groups_audios` (`audio_id`);
