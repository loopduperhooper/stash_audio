CREATE TABLE `performers_groups` (
  `group_id` integer NOT NULL,
  `performer_id` integer NOT NULL,
  foreign key(`group_id`) references `groups`(`id`) on delete CASCADE,
  foreign key(`performer_id`) references `performers`(`id`) on delete CASCADE,
  PRIMARY KEY(`group_id`, `performer_id`)
);
CREATE INDEX `index_performers_groups_on_group_id` on `performers_groups` (`group_id`);
CREATE INDEX `index_performers_groups_on_performer_id` on `performers_groups` (`performer_id`);
