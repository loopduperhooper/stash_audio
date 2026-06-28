package models

import (
	"context"

	"github.com/stashapp/stash_audio/pkg/txn"
)

type TxnManager interface {
	txn.Manager
	txn.DatabaseProvider
}

type Repository struct {
	TxnManager TxnManager

	Blob           BlobReader
	File           FileReaderWriter
	Folder         FolderReaderWriter
	Group     GroupReaderWriter
	Performer PerformerReaderWriter
	Audio     AudioReaderWriter
	Studio         StudioReaderWriter
	Tag            TagReaderWriter
	SavedFilter    SavedFilterReaderWriter
}

func (r *Repository) WithTxn(ctx context.Context, fn txn.TxnFunc) error {
	return txn.WithTxn(ctx, r.TxnManager, fn)
}

func (r *Repository) WithReadTxn(ctx context.Context, fn txn.TxnFunc) error {
	return txn.WithReadTxn(ctx, r.TxnManager, fn)
}

func (r *Repository) WithDB(ctx context.Context, fn txn.TxnFunc) error {
	return txn.WithDatabase(ctx, r.TxnManager, fn)
}
