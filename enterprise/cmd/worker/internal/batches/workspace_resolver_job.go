package batches

import (
	"context"

	"github.com/inconshreveable/log15"
	"github.com/opentracing/opentracing-go"
	"github.com/prometheus/client_golang/prometheus"

	"github.com/sourcegraph/sourcegraph/cmd/worker/job"
	"github.com/sourcegraph/sourcegraph/enterprise/cmd/worker/internal/batches/workers"
	"github.com/sourcegraph/sourcegraph/internal/actor"
	"github.com/sourcegraph/sourcegraph/internal/env"
	"github.com/sourcegraph/sourcegraph/internal/goroutine"
	"github.com/sourcegraph/sourcegraph/internal/observation"
	"github.com/sourcegraph/sourcegraph/internal/trace"
)

type workspaceResolverJob struct{}

func NewWorkspaceResolverJob() job.Job {
	return &workspaceResolverJob{}
}

func (j *workspaceResolverJob) Config() []env.Config {
	return []env.Config{}
}

func (j *workspaceResolverJob) Routines(_ context.Context) ([]goroutine.BackgroundRoutine, error) {
	observationContext := &observation.Context{
		Logger:     log15.Root(),
		Tracer:     &trace.Tracer{Tracer: opentracing.GlobalTracer()},
		Registerer: prometheus.DefaultRegisterer,
	}
	workCtx := actor.WithInternalActor(context.Background())

	bstore, err := InitStore()
	if err != nil {
		return nil, err
	}

	resStore, err := InitBatchSpecResolutionWorkerStore()
	if err != nil {
		return nil, err
	}

	resolverWorker := workers.NewBatchSpecResolutionWorker(
		workCtx,
		bstore,
		resStore,
		observationContext,
	)

	routines := []goroutine.BackgroundRoutine{
		resolverWorker,
	}

	return routines, nil
}
