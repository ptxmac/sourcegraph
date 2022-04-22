package resolvers

import (
	"context"
	"fmt"
)

func (r *resolver) RequestLanguageSupport(ctx context.Context, userID int, language string) error {
	// TODO
	return fmt.Errorf("unimplemented - layer two")
}

func (r *resolver) RequestedLanguageSupport(ctx context.Context, userID int) ([]string, error) {
	// TODO
	return nil, fmt.Errorf("unimplemented - layer two")
}
