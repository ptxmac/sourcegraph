package dbstore

import (
	"context"

	"github.com/keegancsmith/sqlf"

	"github.com/sourcegraph/sourcegraph/internal/database/basestore"
)

func (s *Store) RequestLanguageSupport(ctx context.Context, userID int, language string) error {
	return s.Exec(ctx, sqlf.Sprintf(requestLanguageSupportQuery, userID, language))
}

const requestLanguageSupportQuery = `
-- source: enterprise/internal/codeintel/stores/dbstore/support.go:RequestLanguageSupport
INSERT INTO codeintel_langugage_support_requests (user_id, language_id)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
`

func (s *Store) LanguagesRequestedBy(ctx context.Context, userID int) ([]string, error) {
	return basestore.ScanStrings(s.Query(ctx, sqlf.Sprintf(languagesRequestedByQuery, userID)))
}

const languagesRequestedByQuery = `
-- source: enterprise/internal/codeintel/stores/dbstore/support.go:LanguagesRequestedBy
SELECT language_id
FROM codeintel_langugage_support_requests
WHERE user_id = %s
ORDER BY language_id
`
