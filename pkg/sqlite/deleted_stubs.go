// Stub constants for deleted scene/image/gallery tables.
// These are referenced in code that was not yet fully cleaned up.
// Functions that reference these constants are dead code and should be removed over time.
package sqlite

const (
	sceneTable            = "scenes"
	scenesFilesTable      = "scenes_files"
	sceneIDColumn         = "scene_id"
	sceneDateColumn       = "date"
	performersScenesTable = "performers_scenes"
	scenesTagsTable       = "scenes_tags"
	scenesGalleriesTable  = "scenes_galleries"
	groupsScenesTable     = "groups_scenes"
	scenesURLsTable       = "scene_urls"
	sceneURLColumn        = "url"
	scenesViewDatesTable  = "scenes_view_dates"
	sceneViewDateColumn   = "view_date"
	scenesODatesTable     = "scenes_o_dates"
	sceneODateColumn      = "o_date"
	sceneCoverBlobColumn  = "cover_blob"

	imageTable           = "images"
	imagesFilesTable     = "images_files"
	imageIDColumn        = "image_id"
	performersImagesTable = "performers_images"
	imagesTagsTable      = "images_tags"

	galleryTable             = "galleries"
	galleriesFilesTable      = "galleries_files"
	galleryIDColumn          = "gallery_id"
	performersGalleriesTable = "performers_galleries"
	galleriesTagsTable       = "galleries_tags"
	galleriesImagesTable     = "galleries_images"
	galleriesScenesTable     = "galleries_scenes"
	galleriesURLsTable       = "gallery_urls"
	galleriesURLColumn       = "url"
	galleriesChaptersTable   = "galleries_chapters"

	imagesURLsTable  = "image_urls"
	imageURLColumn   = "url"

	sceneMarkersTagsTable = "scene_markers_tags"

	sceneMarkerTable    = "scene_markers"
	sceneMarkerIDColumn = "scene_marker_id"
)
