// Code generated by go-mockgen 1.1.5; DO NOT EDIT.

package policies

import (
	"context"
	"sync"

	store "github.com/sourcegraph/sourcegraph/internal/codeintel/policies/internal/store"
	shared "github.com/sourcegraph/sourcegraph/internal/codeintel/policies/shared"
)

// MockStore is a mock implementation of the Store interface (from the
// package github.com/sourcegraph/sourcegraph/internal/codeintel/policies)
// used for unit testing.
type MockStore struct {
	// ListFunc is an instance of a mock function object controlling the
	// behavior of the method List.
	ListFunc *StoreListFunc
}

// NewMockStore creates a new mock of the Store interface. All methods
// return zero values for all results, unless overwritten.
func NewMockStore() *MockStore {
	return &MockStore{
		ListFunc: &StoreListFunc{
			defaultHook: func(context.Context, store.ListOpts) ([]shared.Policy, error) {
				return nil, nil
			},
		},
	}
}

// NewStrictMockStore creates a new mock of the Store interface. All methods
// panic on invocation, unless overwritten.
func NewStrictMockStore() *MockStore {
	return &MockStore{
		ListFunc: &StoreListFunc{
			defaultHook: func(context.Context, store.ListOpts) ([]shared.Policy, error) {
				panic("unexpected invocation of MockStore.List")
			},
		},
	}
}

// NewMockStoreFrom creates a new mock of the MockStore interface. All
// methods delegate to the given implementation, unless overwritten.
func NewMockStoreFrom(i Store) *MockStore {
	return &MockStore{
		ListFunc: &StoreListFunc{
			defaultHook: i.List,
		},
	}
}

// StoreListFunc describes the behavior when the List method of the parent
// MockStore instance is invoked.
type StoreListFunc struct {
	defaultHook func(context.Context, store.ListOpts) ([]shared.Policy, error)
	hooks       []func(context.Context, store.ListOpts) ([]shared.Policy, error)
	history     []StoreListFuncCall
	mutex       sync.Mutex
}

// List delegates to the next hook function in the queue and stores the
// parameter and result values of this invocation.
func (m *MockStore) List(v0 context.Context, v1 store.ListOpts) ([]shared.Policy, error) {
	r0, r1 := m.ListFunc.nextHook()(v0, v1)
	m.ListFunc.appendCall(StoreListFuncCall{v0, v1, r0, r1})
	return r0, r1
}

// SetDefaultHook sets function that is called when the List method of the
// parent MockStore instance is invoked and the hook queue is empty.
func (f *StoreListFunc) SetDefaultHook(hook func(context.Context, store.ListOpts) ([]shared.Policy, error)) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// List method of the parent MockStore instance invokes the hook at the
// front of the queue and discards it. After the queue is empty, the default
// hook function is invoked for any future action.
func (f *StoreListFunc) PushHook(hook func(context.Context, store.ListOpts) ([]shared.Policy, error)) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *StoreListFunc) SetDefaultReturn(r0 []shared.Policy, r1 error) {
	f.SetDefaultHook(func(context.Context, store.ListOpts) ([]shared.Policy, error) {
		return r0, r1
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *StoreListFunc) PushReturn(r0 []shared.Policy, r1 error) {
	f.PushHook(func(context.Context, store.ListOpts) ([]shared.Policy, error) {
		return r0, r1
	})
}

func (f *StoreListFunc) nextHook() func(context.Context, store.ListOpts) ([]shared.Policy, error) {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *StoreListFunc) appendCall(r0 StoreListFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of StoreListFuncCall objects describing the
// invocations of this function.
func (f *StoreListFunc) History() []StoreListFuncCall {
	f.mutex.Lock()
	history := make([]StoreListFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// StoreListFuncCall is an object that describes an invocation of method
// List on an instance of MockStore.
type StoreListFuncCall struct {
	// Arg0 is the value of the 1st argument passed to this method
	// invocation.
	Arg0 context.Context
	// Arg1 is the value of the 2nd argument passed to this method
	// invocation.
	Arg1 store.ListOpts
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 []shared.Policy
	// Result1 is the value of the 2nd result returned from this method
	// invocation.
	Result1 error
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c StoreListFuncCall) Args() []interface{} {
	return []interface{}{c.Arg0, c.Arg1}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c StoreListFuncCall) Results() []interface{} {
	return []interface{}{c.Result0, c.Result1}
}
