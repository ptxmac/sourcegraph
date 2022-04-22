package dbstore

import (
	"context"

	"github.com/sourcegraph/sourcegraph/lib/errors"
)

func (s *Store) RequestLanguageSupport(ctx context.Context, userID int, language string) error {
	// TODO - implement
	return errors.New("unimplemented - dbstore layer")
}

func (s *Store) LanguagesRequestedBy(ctx context.Context, userID int) ([]string, error) {
	// TODO - implement
	return nil, errors.New("unimplemented - dbstore layer")
}
