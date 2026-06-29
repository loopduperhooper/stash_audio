package manager

import (
	"context"

	"github.com/stashapp/stash_audio/pkg/group"
	"github.com/stashapp/stash_audio/pkg/models"
)

type GroupService interface {
	Create(ctx context.Context, input *models.CreateGroupInput) error
	UpdatePartial(ctx context.Context, id int, updatedGroup models.GroupPartial, frontImage group.ImageInput, backImage group.ImageInput) (*models.Group, error)

	AddSubGroups(ctx context.Context, groupID int, subGroups []models.GroupIDDescription, insertIndex *int) error
	RemoveSubGroups(ctx context.Context, groupID int, subGroupIDs []int) error
	ReorderSubGroups(ctx context.Context, groupID int, subGroupIDs []int, insertPointID int, insertAfter bool) error
}
