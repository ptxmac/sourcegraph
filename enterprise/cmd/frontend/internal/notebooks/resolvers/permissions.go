package resolvers

import (
	"context"

	"github.com/cockroachdb/errors"

	"github.com/sourcegraph/sourcegraph/enterprise/internal/notebooks"
	"github.com/sourcegraph/sourcegraph/internal/database"
)

func validateNotebookWritePermissionsForUser(ctx context.Context, db database.DB, notebook *notebooks.Notebook, userID int32) error {
	if notebook.NamespaceUserID != 0 && notebook.NamespaceUserID != userID {
		// Only the creator has write access to the notebook
		return errors.New("user does not match the notebook user namespace")
	} else if notebook.NamespaceOrgID != 0 {
		// Only members of the org have write access to the notebook
		membership, err := db.OrgMembers().GetByOrgIDAndUserID(ctx, notebook.NamespaceOrgID, userID)
		if err != nil {
			return err
		}
		if membership == nil {
			return errors.New("user is not a member of the notebook organization namespace")
		}
	} else if notebook.NamespaceUserID == 0 && notebook.NamespaceOrgID == 0 {
		return errors.New("cannot update notebook without a namespace")
	}
	return nil
}
