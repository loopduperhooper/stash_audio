package sqlite

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"path/filepath"
	"slices"
	"strings"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
	"gopkg.in/guregu/null.v4"
	"gopkg.in/guregu/null.v4/zero"

	"github.com/stashapp/stash_audio/pkg/models"
)

const (
	audioTable         = "audios"
	audiosFilesTable   = "audios_files"
	audioIDColumn      = "audio_id"
	audioURLsTable     = "audio_urls"
	audioURLColumn     = "url"
	performersAudiosTable = "performers_audios"
	audiosTagsTable    = "audios_tags"
	audiosViewDatesTable = "audio_view_dates"
	audioViewDateColumn  = "view_date"
	audiosODatesTable  = "audio_o_dates"
	audioODateColumn   = "date"

	audioCoverBlobColumn = "cover_blob"
)

type audioRow struct {
	ID           int         `db:"id" goqu:"skipinsert"`
	Title        zero.String `db:"title"`
	Details      zero.String `db:"details"`
	Date         NullDate    `db:"date"`
	DatePrecision null.Int   `db:"date_precision"`
	Rating       null.Int    `db:"rating"`
	OCounter     int         `db:"o_counter"`
	Organized    bool        `db:"organized"`
	StudioID     null.Int    `db:"studio_id,omitempty"`
	CreatedAt    Timestamp   `db:"created_at"`
	UpdatedAt    Timestamp   `db:"updated_at"`
	ResumeTime   float64       `db:"resume_time"`
	PlayDuration float64       `db:"play_duration"`
	PlayCount    int           `db:"play_count"`
	LastPlayedAt NullTimestamp `db:"last_played_at"`

	// not used in resolutions or updates
	CoverBlob zero.String `db:"cover_blob"`
}

func (r *audioRow) fromAudio(o models.Audio) {
	r.ID = o.ID
	r.Title = zero.StringFrom(o.Title)
	r.Details = zero.StringFrom(o.Details)
	r.Date = NullDateFromDatePtr(o.Date)
	r.DatePrecision = datePrecisionFromDatePtr(o.Date)
	r.Rating = intFromPtr(o.Rating)
	r.OCounter = o.OCounter
	r.Organized = o.Organized
	r.StudioID = intFromPtr(o.StudioID)
	r.CreatedAt = Timestamp{Timestamp: o.CreatedAt}
	r.UpdatedAt = Timestamp{Timestamp: o.UpdatedAt}
	r.ResumeTime = o.ResumeTime
	r.PlayDuration = o.PlayDuration
	r.PlayCount = o.PlayCount
	r.LastPlayedAt = NullTimestampFromTimePtr(o.LastPlayedAt)
}

type audioQueryRow struct {
	audioRow
	PrimaryFileID         null.Int    `db:"primary_file_id"`
	PrimaryFileFolderPath zero.String `db:"primary_file_folder_path"`
	PrimaryFileBasename   zero.String `db:"primary_file_basename"`
	PrimaryFileChecksum   zero.String `db:"primary_file_checksum"`
}

func (r *audioQueryRow) resolve() *models.Audio {
	ret := &models.Audio{
		ID:        r.ID,
		Title:     r.Title.String,
		Details:   r.Details.String,
		Date:      r.Date.DatePtr(r.DatePrecision),
		Rating:    nullIntPtr(r.Rating),
		OCounter:  r.OCounter,
		Organized: r.Organized,
		StudioID:  nullIntPtr(r.StudioID),

		PrimaryFileID: nullIntFileIDPtr(r.PrimaryFileID),
		Checksum:      r.PrimaryFileChecksum.String,

		CreatedAt: r.CreatedAt.Timestamp,
		UpdatedAt: r.UpdatedAt.Timestamp,

		ResumeTime:   r.ResumeTime,
		PlayDuration: r.PlayDuration,
		PlayCount:    r.PlayCount,
		LastPlayedAt: r.LastPlayedAt.TimePtr(),
	}

	if r.PrimaryFileFolderPath.Valid && r.PrimaryFileBasename.Valid {
		ret.Path = filepath.Join(r.PrimaryFileFolderPath.String, r.PrimaryFileBasename.String)
	}

	return ret
}

type audioRowRecord struct {
	updateRecord
}

func (r *audioRowRecord) fromPartial(o models.AudioPartial) {
	r.setNullString("title", o.Title)
	r.setNullString("details", o.Details)
	r.setNullDate("date", "date_precision", o.Date)
	r.setNullInt("rating", o.Rating)
	r.setInt("o_counter", o.OCounter)
	r.setBool("organized", o.Organized)
	r.setNullInt("studio_id", o.StudioID)
	r.setTimestamp("created_at", o.CreatedAt)
	r.setTimestamp("updated_at", o.UpdatedAt)
	r.setFloat64("resume_time", o.ResumeTime)
	r.setFloat64("play_duration", o.PlayDuration)
	r.setInt("play_count", o.PlayCount)
	r.setNullTimestamp("last_played_at", o.LastPlayedAt)
}

type audioRepositoryType struct {
	repository
	tags       joinRepository
	performers joinRepository
	groups     joinRepository
	files      filesRepository
	stashIDs   stashIDRepository
}

var (
	audioRepository = audioRepositoryType{
		repository: repository{
			tableName: audioTable,
			idColumn:  idColumn,
		},
		tags: joinRepository{
			repository: repository{
				tableName: audiosTagsTable,
				idColumn:  audioIDColumn,
			},
			fkColumn:     tagIDColumn,
			foreignTable: tagTable,
			orderBy:      tagTableSortSQL,
		},
		performers: joinRepository{
			repository: repository{
				tableName: performersAudiosTable,
				idColumn:  audioIDColumn,
			},
			fkColumn: performerIDColumn,
		},
		groups: joinRepository{
			repository: repository{
				tableName: groupsAudiosTable,
				idColumn:  audioIDColumn,
			},
			fkColumn: groupIDColumn,
		},
		files: filesRepository{
			repository: repository{
				tableName: audiosFilesTable,
				idColumn:  audioIDColumn,
			},
		},
		stashIDs: stashIDRepository{
			repository{
				tableName: "audio_stash_ids",
				idColumn:  audioIDColumn,
			},
		},
	}
)

type AudioStore struct {
	blobJoinQueryBuilder

	tableMgr *table
	oDateManager
	viewDateManager

	repo *storeRepository
}

func NewAudioStore(r *storeRepository, blobStore *BlobStore) *AudioStore {
	return &AudioStore{
		blobJoinQueryBuilder: blobJoinQueryBuilder{
			blobStore: blobStore,
			joinTable: audioTable,
		},

		tableMgr:        audioTableMgr,
		viewDateManager: viewDateManager{audiosViewTableMgr},
		oDateManager:    oDateManager{audiosOTableMgr},
		repo:            r,
	}
}

func (qb *AudioStore) table() exp.IdentifierExpression {
	return qb.tableMgr.table
}

func (qb *AudioStore) selectDataset() *goqu.SelectDataset {
	table := qb.table()
	files := fileTableMgr.table
	folders := folderTableMgr.table
	checksum := fingerprintTableMgr.table.As("fingerprint_md5")

	return dialect.From(table).LeftJoin(
		audiosFilesJoinTable,
		goqu.On(
			audiosFilesJoinTable.Col(audioIDColumn).Eq(table.Col(idColumn)),
			audiosFilesJoinTable.Col("primary").Eq(1),
		),
	).LeftJoin(
		files,
		goqu.On(files.Col(idColumn).Eq(audiosFilesJoinTable.Col(fileIDColumn))),
	).LeftJoin(
		folders,
		goqu.On(folders.Col(idColumn).Eq(files.Col("parent_folder_id"))),
	).LeftJoin(
		checksum,
		goqu.On(
			checksum.Col(fileIDColumn).Eq(audiosFilesJoinTable.Col(fileIDColumn)),
			checksum.Col("type").Eq(models.FingerprintTypeMD5),
		),
	).Select(
		qb.table().All(),
		audiosFilesJoinTable.Col(fileIDColumn).As("primary_file_id"),
		folders.Col("path").As("primary_file_folder_path"),
		files.Col("basename").As("primary_file_basename"),
		checksum.Col("fingerprint").As("primary_file_checksum"),
	)
}

func (qb *AudioStore) Create(ctx context.Context, newObject *models.Audio, fileIDs []models.FileID) error {
	var r audioRow
	r.fromAudio(*newObject)

	id, err := qb.tableMgr.insertID(ctx, r)
	if err != nil {
		return err
	}

	if len(fileIDs) > 0 {
		const firstPrimary = true
		if err := audiosFilesTableMgr.insertJoins(ctx, id, firstPrimary, fileIDs); err != nil {
			return err
		}
	}

	if newObject.URLs.Loaded() {
		const startPos = 0
		if err := audiosURLsTableMgr.insertJoins(ctx, id, startPos, newObject.URLs.List()); err != nil {
			return err
		}
	}

	if newObject.PerformerIDs.Loaded() {
		if err := audiosPerformersTableMgr.insertJoins(ctx, id, newObject.PerformerIDs.List()); err != nil {
			return err
		}
	}
	if newObject.TagIDs.Loaded() {
		if err := audiosTagsTableMgr.insertJoins(ctx, id, newObject.TagIDs.List()); err != nil {
			return err
		}
	}

	if newObject.GroupIDs.Loaded() {
		if err := groupsAudiosTableMgr.insertJoins(ctx, id, newObject.GroupIDs.List()); err != nil {
			return err
		}
	}

	if newObject.StashIDs.Loaded() {
		if err := audiosStashIDsTableMgr.insertJoins(ctx, id, newObject.StashIDs.List()); err != nil {
			return err
		}
	}

	updated, err := qb.find(ctx, id)
	if err != nil {
		return fmt.Errorf("finding after create: %w", err)
	}

	*newObject = *updated

	return nil
}

func (qb *AudioStore) UpdatePartial(ctx context.Context, id int, partial models.AudioPartial) (*models.Audio, error) {
	r := audioRowRecord{
		updateRecord{
			Record: make(exp.Record),
		},
	}

	r.fromPartial(partial)

	if len(r.Record) > 0 {
		if err := qb.tableMgr.updateByID(ctx, id, r.Record); err != nil {
			return nil, err
		}
	}

	if partial.URLs != nil {
		if err := audiosURLsTableMgr.modifyJoins(ctx, id, partial.URLs.Values, partial.URLs.Mode); err != nil {
			return nil, err
		}
	}
	if partial.PerformerIDs != nil {
		if err := audiosPerformersTableMgr.modifyJoins(ctx, id, partial.PerformerIDs.IDs, partial.PerformerIDs.Mode); err != nil {
			return nil, err
		}
	}
	if partial.TagIDs != nil {
		if err := audiosTagsTableMgr.modifyJoins(ctx, id, partial.TagIDs.IDs, partial.TagIDs.Mode); err != nil {
			return nil, err
		}
	}
	if partial.GroupIDs != nil {
		if err := groupsAudiosTableMgr.modifyJoins(ctx, id, partial.GroupIDs.IDs, partial.GroupIDs.Mode); err != nil {
			return nil, err
		}
	}
	if partial.StashIDs != nil {
		if err := audiosStashIDsTableMgr.modifyJoins(ctx, id, partial.StashIDs.StashIDs, partial.StashIDs.Mode); err != nil {
			return nil, err
		}
	}
	if partial.PrimaryFileID != nil {
		if err := audiosFilesTableMgr.setPrimary(ctx, id, *partial.PrimaryFileID); err != nil {
			return nil, err
		}
	}

	return qb.find(ctx, id)
}

func (qb *AudioStore) Update(ctx context.Context, updatedObject *models.Audio) error {
	var r audioRow
	r.fromAudio(*updatedObject)

	if err := qb.tableMgr.updateByID(ctx, updatedObject.ID, r); err != nil {
		return err
	}

	if updatedObject.URLs.Loaded() {
		if err := audiosURLsTableMgr.replaceJoins(ctx, updatedObject.ID, updatedObject.URLs.List()); err != nil {
			return err
		}
	}

	if updatedObject.PerformerIDs.Loaded() {
		if err := audiosPerformersTableMgr.replaceJoins(ctx, updatedObject.ID, updatedObject.PerformerIDs.List()); err != nil {
			return err
		}
	}

	if updatedObject.TagIDs.Loaded() {
		if err := audiosTagsTableMgr.replaceJoins(ctx, updatedObject.ID, updatedObject.TagIDs.List()); err != nil {
			return err
		}
	}

	if updatedObject.GroupIDs.Loaded() {
		if err := groupsAudiosTableMgr.replaceJoins(ctx, updatedObject.ID, updatedObject.GroupIDs.List()); err != nil {
			return err
		}
	}

	if updatedObject.StashIDs.Loaded() {
		if err := audiosStashIDsTableMgr.replaceJoins(ctx, updatedObject.ID, updatedObject.StashIDs.List()); err != nil {
			return err
		}
	}

	if updatedObject.Files.Loaded() {
		fileIDs := make([]models.FileID, len(updatedObject.Files.List()))
		for i, f := range updatedObject.Files.List() {
			fileIDs[i] = f.Base().ID
		}

		if err := audiosFilesTableMgr.replaceJoins(ctx, updatedObject.ID, fileIDs); err != nil {
			return err
		}
	}

	return nil
}

func (qb *AudioStore) Destroy(ctx context.Context, id int) error {
	if err := qb.destroyCover(ctx, id); err != nil {
		return err
	}

	return qb.tableMgr.destroyExisting(ctx, []int{id})
}

// returns nil, nil if not found
func (qb *AudioStore) Find(ctx context.Context, id int) (*models.Audio, error) {
	ret, err := qb.find(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return ret, err
}

func (qb *AudioStore) FindByIDs(ctx context.Context, ids []int) ([]*models.Audio, error) {
	audios := make([]*models.Audio, 0, len(ids))

	table := qb.table()
	if err := batchExec(ids, defaultBatchSize, func(batch []int) error {
		q := qb.selectDataset().Prepared(true).Where(table.Col(idColumn).In(batch))
		unsorted, err := qb.getMany(ctx, q)
		if err != nil {
			return err
		}

		audios = append(audios, unsorted...)

		return nil
	}); err != nil {
		return nil, err
	}

	return audios, nil
}

func (qb *AudioStore) FindMany(ctx context.Context, ids []int) ([]*models.Audio, error) {
	audios := make([]*models.Audio, len(ids))

	unsorted, err := qb.FindByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	for _, s := range unsorted {
		i := slices.Index(ids, s.ID)
		audios[i] = s
	}

	for i := range audios {
		if audios[i] == nil {
			return nil, fmt.Errorf("audio with id %d not found", ids[i])
		}
	}

	return audios, nil
}

// returns nil, sql.ErrNoRows if not found
func (qb *AudioStore) find(ctx context.Context, id int) (*models.Audio, error) {
	q := qb.selectDataset().Where(qb.tableMgr.byID(id))

	ret, err := qb.get(ctx, q)
	if err != nil {
		return nil, err
	}

	return ret, nil
}

func (qb *AudioStore) findBySubquery(ctx context.Context, sq *goqu.SelectDataset) ([]*models.Audio, error) {
	table := qb.table()

	q := qb.selectDataset().Where(
		table.Col(idColumn).Eq(
			sq,
		),
	)

	return qb.getMany(ctx, q)
}

// returns nil, sql.ErrNoRows if not found
func (qb *AudioStore) get(ctx context.Context, q *goqu.SelectDataset) (*models.Audio, error) {
	ret, err := qb.getMany(ctx, q)
	if err != nil {
		return nil, err
	}

	if len(ret) == 0 {
		return nil, sql.ErrNoRows
	}

	return ret[0], nil
}

func (qb *AudioStore) getMany(ctx context.Context, q *goqu.SelectDataset) ([]*models.Audio, error) {
	const single = false
	var ret []*models.Audio
	var lastID int
	if err := queryFunc(ctx, q, single, func(r *sqlx.Rows) error {
		var f audioQueryRow
		if err := r.StructScan(&f); err != nil {
			return err
		}

		s := f.resolve()
		if s.ID == lastID {
			return fmt.Errorf("internal error: multiple rows returned for single audio id %d", s.ID)
		}
		lastID = s.ID

		ret = append(ret, s)
		return nil
	}); err != nil {
		return nil, err
	}

	return ret, nil
}

func (qb *AudioStore) GetFiles(ctx context.Context, id int) ([]models.File, error) {
	fileIDs, err := audioRepository.files.get(ctx, id)
	if err != nil {
		return nil, err
	}

	return qb.repo.File.Find(ctx, fileIDs...)
}

func (qb *AudioStore) GetManyFileIDs(ctx context.Context, ids []int) ([][]models.FileID, error) {
	const primaryOnly = false
	return audioRepository.files.getMany(ctx, ids, primaryOnly)
}

func (qb *AudioStore) FindByFileID(ctx context.Context, fileID models.FileID) ([]*models.Audio, error) {
	sq := dialect.From(audiosFilesJoinTable).Select(audiosFilesJoinTable.Col(audioIDColumn)).Where(
		audiosFilesJoinTable.Col(fileIDColumn).Eq(fileID),
	)

	ret, err := qb.findBySubquery(ctx, sq)
	if err != nil {
		return nil, fmt.Errorf("getting audios by file id %d: %w", fileID, err)
	}

	return ret, nil
}

func (qb *AudioStore) FindByPrimaryFileID(ctx context.Context, fileID models.FileID) ([]*models.Audio, error) {
	sq := dialect.From(audiosFilesJoinTable).Select(audiosFilesJoinTable.Col(audioIDColumn)).Where(
		audiosFilesJoinTable.Col(fileIDColumn).Eq(fileID),
		audiosFilesJoinTable.Col("primary").Eq(1),
	)

	ret, err := qb.findBySubquery(ctx, sq)
	if err != nil {
		return nil, fmt.Errorf("getting audios by primary file id %d: %w", fileID, err)
	}

	return ret, nil
}

func (qb *AudioStore) CountByFileID(ctx context.Context, fileID models.FileID) (int, error) {
	joinTable := audiosFilesJoinTable

	q := dialect.Select(goqu.COUNT("*")).From(joinTable).Where(joinTable.Col(fileIDColumn).Eq(fileID))
	return count(ctx, q)
}

func (qb *AudioStore) FindByFingerprints(ctx context.Context, fp []models.Fingerprint) ([]*models.Audio, error) {
	fingerprintTable := fingerprintTableMgr.table

	var ex []exp.Expression

	for _, v := range fp {
		ex = append(ex, goqu.And(
			fingerprintTable.Col("type").Eq(v.Type),
			fingerprintTable.Col("fingerprint").Eq(v.Fingerprint),
		))
	}

	sq := dialect.From(audiosFilesJoinTable).
		InnerJoin(
			fingerprintTable,
			goqu.On(fingerprintTable.Col(fileIDColumn).Eq(audiosFilesJoinTable.Col(fileIDColumn))),
		).
		Select(audiosFilesJoinTable.Col(audioIDColumn)).Where(goqu.Or(ex...))

	ret, err := qb.findBySubquery(ctx, sq)
	if err != nil {
		return nil, fmt.Errorf("getting audios by fingerprints: %w", err)
	}

	return ret, nil
}

func (qb *AudioStore) FindByChecksum(ctx context.Context, checksum string) ([]*models.Audio, error) {
	return qb.FindByFingerprints(ctx, []models.Fingerprint{
		{
			Type:        models.FingerprintTypeMD5,
			Fingerprint: checksum,
		},
	})
}

func (qb *AudioStore) FindByPath(ctx context.Context, p string) ([]*models.Audio, error) {
	filesTable := fileTableMgr.table
	foldersTable := folderTableMgr.table
	basename := filepath.Base(p)
	dir := filepath.Dir(p)

	// replace wildcards
	basename = strings.ReplaceAll(basename, "*", "%")
	dir = strings.ReplaceAll(dir, "*", "%")

	sq := dialect.From(audiosFilesJoinTable).InnerJoin(
		filesTable,
		goqu.On(filesTable.Col(idColumn).Eq(audiosFilesJoinTable.Col(fileIDColumn))),
	).InnerJoin(
		foldersTable,
		goqu.On(foldersTable.Col(idColumn).Eq(filesTable.Col("parent_folder_id"))),
	).Select(audiosFilesJoinTable.Col(audioIDColumn)).Where(
		foldersTable.Col("path").Like(dir),
		filesTable.Col("basename").Like(basename),
	)

	ret, err := qb.findBySubquery(ctx, sq)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("getting audio by path %s: %w", p, err)
	}

	return ret, nil
}

func (qb *AudioStore) FindByPerformerID(ctx context.Context, performerID int) ([]*models.Audio, error) {
	sq := dialect.From(audiosPerformersJoinTable).Select(audiosPerformersJoinTable.Col(audioIDColumn)).Where(
		audiosPerformersJoinTable.Col(performerIDColumn).Eq(performerID),
	)
	ret, err := qb.findBySubquery(ctx, sq)

	if err != nil {
		return nil, fmt.Errorf("getting audios for performer %d: %w", performerID, err)
	}

	return ret, nil
}

func (qb *AudioStore) FindByGroupID(ctx context.Context, groupID int) ([]*models.Audio, error) {
	sq := dialect.From(groupsAudiosJoinTable).Select(groupsAudiosJoinTable.Col(audioIDColumn)).Where(
		groupsAudiosJoinTable.Col(groupIDColumn).Eq(groupID),
	)
	ret, err := qb.findBySubquery(ctx, sq)

	if err != nil {
		return nil, fmt.Errorf("getting audios for group %d: %w", groupID, err)
	}

	return ret, nil
}

func (qb *AudioStore) CountByPerformerID(ctx context.Context, performerID int) (int, error) {
	joinTable := audiosPerformersJoinTable

	q := dialect.Select(goqu.COUNT("*")).From(joinTable).Where(joinTable.Col(performerIDColumn).Eq(performerID))
	return count(ctx, q)
}

func (qb *AudioStore) Count(ctx context.Context) (int, error) {
	q := dialect.Select(goqu.COUNT("*")).From(qb.table())
	return count(ctx, q)
}

func (qb *AudioStore) Size(ctx context.Context) (float64, error) {
	table := qb.table()
	fileTable := fileTableMgr.table
	q := dialect.Select(
		goqu.COALESCE(goqu.SUM(fileTableMgr.table.Col("size")), 0),
	).From(table).InnerJoin(
		audiosFilesJoinTable,
		goqu.On(table.Col(idColumn).Eq(audiosFilesJoinTable.Col(audioIDColumn))),
	).InnerJoin(
		fileTable,
		goqu.On(audiosFilesJoinTable.Col(fileIDColumn).Eq(fileTable.Col(idColumn))),
	)
	var ret float64
	if err := querySimple(ctx, q, &ret); err != nil {
		return 0, err
	}

	return ret, nil
}

func (qb *AudioStore) Duration(ctx context.Context) (float64, error) {
	table := qb.table()
	audioFileTable := goqu.T("audio_files")

	q := dialect.Select(
		goqu.COALESCE(goqu.SUM(audioFileTable.Col("duration")), 0),
	).From(table).InnerJoin(
		audiosFilesJoinTable,
		goqu.On(audiosFilesJoinTable.Col(audioIDColumn).Eq(table.Col(idColumn))),
	).InnerJoin(
		audioFileTable,
		goqu.On(audioFileTable.Col("file_id").Eq(audiosFilesJoinTable.Col(fileIDColumn))),
	)

	var ret float64
	if err := querySimple(ctx, q, &ret); err != nil {
		return 0, err
	}

	return ret, nil
}

func (qb *AudioStore) PlayDuration(ctx context.Context) (float64, error) {
	table := qb.table()

	q := dialect.Select(goqu.COALESCE(goqu.SUM("play_duration"), 0)).From(table)

	var ret float64
	if err := querySimple(ctx, q, &ret); err != nil {
		return 0, err
	}

	return ret, nil
}

func (qb *AudioStore) Wall(ctx context.Context, q *string) ([]*models.Audio, error) {
	s := ""
	if q != nil {
		s = *q
	}

	table := qb.table()
	qq := qb.selectDataset().Prepared(true).Where(table.Col("details").Like("%" + s + "%")).Order(goqu.L("RANDOM()").Asc()).Limit(80)
	return qb.getMany(ctx, qq)
}

func (qb *AudioStore) All(ctx context.Context) ([]*models.Audio, error) {
	fileTable := fileTableMgr.table
	folderTable := folderTableMgr.table

	return qb.getMany(ctx, qb.selectDataset().Order(
		folderTable.Col("path").Asc(),
		fileTable.Col("basename").Asc(),
	))
}

func (qb *AudioStore) makeQuery(ctx context.Context, audioFilter *models.AudioFilterType, findFilter *models.FindFilterType) (*queryBuilder, error) {
	if audioFilter == nil {
		audioFilter = &models.AudioFilterType{}
	}
	if findFilter == nil {
		findFilter = &models.FindFilterType{}
	}

	query := audioRepository.newQuery()
	distinctIDs(&query, audioTable)

	if q := findFilter.Q; q != nil && *q != "" {
		query.addJoins(
			join{
				table:    audiosFilesTable,
				onClause: "audios_files.audio_id = audios.id",
			},
			join{
				table:    fileTable,
				onClause: "audios_files.file_id = files.id",
			},
			join{
				table:    folderTable,
				onClause: "files.parent_folder_id = folders.id",
			},
			join{
				table:    fingerprintTable,
				onClause: "files_fingerprints.file_id = audios_files.file_id",
			},
		)

		filepathColumn := "folders.path || '" + string(filepath.Separator) + "' || files.basename"
		searchColumns := []string{"audios.title", "audios.details", filepathColumn, "files_fingerprints.fingerprint"}
		query.parseQueryString(searchColumns, *q)
	}

	filter := filterBuilderFromHandler(ctx, &audioFilterHandler{
		audioFilter: audioFilter,
	})

	if err := query.addFilter(filter); err != nil {
		return nil, err
	}

	if err := qb.setAudioSort(&query, findFilter); err != nil {
		return nil, err
	}
	query.sortAndPagination += getPagination(findFilter)

	return &query, nil
}

func (qb *AudioStore) Query(ctx context.Context, options models.AudioQueryOptions) (*models.AudioQueryResult, error) {
	query, err := qb.makeQuery(ctx, options.AudioFilter, options.FindFilter)
	if err != nil {
		return nil, err
	}

	result, err := qb.queryGroupedFields(ctx, options, *query)
	if err != nil {
		return nil, fmt.Errorf("error querying aggregate fields: %w", err)
	}

	idsResult, err := query.findIDs(ctx)
	if err != nil {
		return nil, fmt.Errorf("error finding IDs: %w", err)
	}

	result.IDs = idsResult
	return result, nil
}

func (qb *AudioStore) queryGroupedFields(ctx context.Context, options models.AudioQueryOptions, query queryBuilder) (*models.AudioQueryResult, error) {
	if !options.Count && !options.TotalDuration && !options.TotalSize {
		return models.NewAudioQueryResult(qb), nil
	}

	aggregateQuery := audioRepository.newQuery()

	if options.Count {
		aggregateQuery.addColumn("COUNT(DISTINCT temp.id) as total")
	}

	if options.TotalDuration {
		query.addJoins(
			join{
				table:    audiosFilesTable,
				onClause: "audios_files.audio_id = audios.id",
			},
			join{
				table:    "audio_files",
				onClause: "audios_files.file_id = audio_files.file_id",
			},
		)
		query.addColumn("COALESCE(audio_files.duration, 0) as duration")
		aggregateQuery.addColumn("SUM(temp.duration) as duration")
	}

	if options.TotalSize {
		query.addJoins(
			join{
				table:    audiosFilesTable,
				onClause: "audios_files.audio_id = audios.id",
			},
			join{
				table:    fileTable,
				onClause: "audios_files.file_id = files.id",
			},
		)
		query.addColumn("COALESCE(files.size, 0) as size")
		aggregateQuery.addColumn("SUM(temp.size) as size")
	}

	const includeSortPagination = false
	aggregateQuery.from = fmt.Sprintf("(%s) as temp", query.toSQL(includeSortPagination))

	out := struct {
		Total    int
		Duration null.Float
		Size     null.Float
	}{}
	if err := audioRepository.queryStruct(ctx, aggregateQuery.toSQL(includeSortPagination), query.allArgs(), &out); err != nil {
		return nil, err
	}

	ret := models.NewAudioQueryResult(qb)
	ret.Count = out.Total
	ret.TotalDuration = out.Duration.Float64
	ret.TotalSize = out.Size.Float64
	return ret, nil
}

func (qb *AudioStore) QueryCount(ctx context.Context, audioFilter *models.AudioFilterType, findFilter *models.FindFilterType) (int, error) {
	query, err := qb.makeQuery(ctx, audioFilter, findFilter)
	if err != nil {
		return 0, err
	}

	return query.executeCount(ctx)
}

var audioSortOptions = sortOptions{
	"bitrate",
	"created_at",
	"date",
	"duration",
	"file_count",
	"file_mod_time",
	"filesize",
	"id",
	"last_o_at",
	"last_played_at",
	"o_counter",
	"organized",
	"path",
	"performer_count",
	"play_count",
	"play_duration",
	"random",
	"rating",
	"resume_time",
	"sample_rate",
	"studio",
	"tag_count",
	"title",
	"updated_at",
}

func (qb *AudioStore) setAudioSort(query *queryBuilder, findFilter *models.FindFilterType) error {
	if findFilter == nil || findFilter.Sort == nil || *findFilter.Sort == "" {
		return nil
	}
	sort := findFilter.GetSort("title")

	if err := audioSortOptions.validateSort(sort); err != nil {
		return err
	}

	addFileTable := func() {
		query.addJoins(
			join{
				sort:     true,
				table:    audiosFilesTable,
				onClause: "audios_files.audio_id = audios.id",
			},
			join{
				sort:     true,
				table:    fileTable,
				onClause: "audios_files.file_id = files.id",
			},
		)
	}

	addAudioFileTable := func() {
		addFileTable()
		query.addJoins(
			join{
				sort:     true,
				table:    "audio_files",
				onClause: "audio_files.file_id = audios_files.file_id",
			},
		)
	}

	addFolderTable := func() {
		query.addJoins(
			join{
				sort:     true,
				table:    folderTable,
				onClause: "files.parent_folder_id = folders.id",
			},
		)
	}

	direction := findFilter.GetDirection()
	switch sort {
	case "tag_count":
		query.sortAndPagination += getCountSort(audioTable, audiosTagsTable, audioIDColumn, direction)
	case "performer_count":
		query.sortAndPagination += getCountSort(audioTable, performersAudiosTable, audioIDColumn, direction)
	case "file_count":
		query.sortAndPagination += getCountSort(audioTable, audiosFilesTable, audioIDColumn, direction)
	case "path":
		addFileTable()
		addFolderTable()
		query.sortAndPagination += fmt.Sprintf(" ORDER BY COALESCE(folders.path, '') || COALESCE(files.basename, '') COLLATE NATURAL_CI %s", direction)
	case "bitrate":
		sort = "bit_rate"
		addAudioFileTable()
		query.sortAndPagination += getSort(sort, direction, "audio_files")
	case "sample_rate":
		addAudioFileTable()
		query.sortAndPagination += getSort(sort, direction, "audio_files")
	case "duration":
		addAudioFileTable()
		query.sortAndPagination += getSort(sort, direction, "audio_files")
	case "file_mod_time":
		sort = "mod_time"
		addFileTable()
		query.sortAndPagination += getSort(sort, direction, fileTable)
	case "filesize":
		addFileTable()
		query.sortAndPagination += getSort(sort, direction, fileTable)
	case "title":
		addFileTable()
		addFolderTable()
		query.sortAndPagination += " ORDER BY COALESCE(audios.title, files.basename) COLLATE NATURAL_CI " + direction + ", folders.path COLLATE NATURAL_CI " + direction
	case "play_count":
		query.sortAndPagination += getCountSort(audioTable, audiosViewDatesTable, audioIDColumn, direction)
	case "last_played_at":
		query.sortAndPagination += fmt.Sprintf(" ORDER BY (SELECT MAX(view_date) FROM %s AS sort WHERE sort.%s = %s.id) %s", audiosViewDatesTable, audioIDColumn, audioTable, getSortDirection(direction))
	case "last_o_at":
		query.sortAndPagination += fmt.Sprintf(" ORDER BY (SELECT MAX(date) FROM %s AS sort WHERE sort.%s = %s.id) %s", audiosODatesTable, audioIDColumn, audioTable, getSortDirection(direction))
	case "o_counter":
		query.sortAndPagination += getCountSort(audioTable, audiosODatesTable, audioIDColumn, direction)
	case "studio":
		query.joinSort(studioTable, "", "audios.studio_id = studios.id")
		query.sortAndPagination += getSort("name", direction, studioTable)
	default:
		query.sortAndPagination += getSort(sort, direction, audioTable)
	}

	return nil
}

func (qb *AudioStore) SaveActivity(ctx context.Context, id int, resumeTime *float64, playDuration *float64) (bool, error) {
	if err := qb.tableMgr.checkIDExists(ctx, id); err != nil {
		return false, err
	}

	record := goqu.Record{}

	if resumeTime != nil {
		record["resume_time"] = resumeTime
	}

	if playDuration != nil {
		record["play_duration"] = goqu.L("play_duration + ?", playDuration)
	}

	if len(record) > 0 {
		if err := qb.tableMgr.updateByID(ctx, id, record); err != nil {
			return false, err
		}
	}

	return true, nil
}

func (qb *AudioStore) ResetActivity(ctx context.Context, id int, resetResume bool, resetDuration bool) (bool, error) {
	if err := qb.tableMgr.checkIDExists(ctx, id); err != nil {
		return false, err
	}

	record := goqu.Record{}

	if resetResume {
		record["resume_time"] = 0.0
	}

	if resetDuration {
		record["play_duration"] = 0.0
	}

	if len(record) > 0 {
		if err := qb.tableMgr.updateByID(ctx, id, record); err != nil {
			return false, err
		}
	}

	return true, nil
}

func (qb *AudioStore) GetURLs(ctx context.Context, audioID int) ([]string, error) {
	return audiosURLsTableMgr.get(ctx, audioID)
}

func (qb *AudioStore) GetCover(ctx context.Context, audioID int) ([]byte, error) {
	return qb.GetImage(ctx, audioID, audioCoverBlobColumn)
}

func (qb *AudioStore) HasCover(ctx context.Context, audioID int) (bool, error) {
	return qb.HasImage(ctx, audioID, audioCoverBlobColumn)
}

func (qb *AudioStore) UpdateCover(ctx context.Context, audioID int, image []byte) error {
	return qb.UpdateImage(ctx, audioID, audioCoverBlobColumn, image)
}

func (qb *AudioStore) destroyCover(ctx context.Context, audioID int) error {
	return qb.DestroyImage(ctx, audioID, audioCoverBlobColumn)
}

func (qb *AudioStore) AssignFiles(ctx context.Context, audioID int, fileIDs []models.FileID) error {
	if err := audiosFilesTableMgr.destroyJoins(ctx, fileIDs); err != nil {
		return err
	}

	existingFileIDs, err := audioRepository.files.get(ctx, audioID)
	if err != nil {
		return err
	}

	firstPrimary := len(existingFileIDs) == 0
	return audiosFilesTableMgr.insertJoins(ctx, audioID, firstPrimary, fileIDs)
}

func (qb *AudioStore) AddFileID(ctx context.Context, id int, fileID models.FileID) error {
	const firstPrimary = false
	return audiosFilesTableMgr.insertJoins(ctx, id, firstPrimary, []models.FileID{fileID})
}

func (qb *AudioStore) GetPerformerIDs(ctx context.Context, id int) ([]int, error) {
	return audioRepository.performers.getIDs(ctx, id)
}

func (qb *AudioStore) GetTagIDs(ctx context.Context, id int) ([]int, error) {
	return audioRepository.tags.getIDs(ctx, id)
}

func (qb *AudioStore) GetGroupIDs(ctx context.Context, id int) ([]int, error) {
	return audioRepository.groups.getIDs(ctx, id)
}

func (qb *AudioStore) GetStashIDs(ctx context.Context, audioID int) ([]models.StashID, error) {
	return audioRepository.stashIDs.get(ctx, audioID)
}
