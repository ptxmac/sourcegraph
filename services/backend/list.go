// GENERATED CODE - DO NOT EDIT!
// @generated
//
// Generated by:
//
//   go run gen_list.go -o list.go
//
// Called via:
//
//   go generate
//

package backend

import (
	"sourcegraph.com/sourcegraph/sourcegraph/services/svc"
)

// Services contains all services implemented in this package.
var Services = svc.Services{
	Accounts:          Accounts,
	Annotations:       Annotations,
	Async:             Async,
	Auth:              Auth,
	Builds:            Builds,
	Channel:           Channel,
	Defs:              Defs,
	Desktop:           Desktop,
	Meta:              Meta,
	MirrorRepos:       MirrorRepos,
	MultiRepoImporter: Graph,
	Orgs:              Orgs,
	People:            People,
	RepoStatuses:      RepoStatuses,
	RepoTree:          RepoTree,
	Repos:             Repos,
	Search:            Search,
	Users:             Users,
}
