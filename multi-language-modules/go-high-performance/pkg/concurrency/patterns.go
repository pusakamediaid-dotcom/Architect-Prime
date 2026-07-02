package concurrency

import (
    "context"
    "sync"
)

// WorkerPool manages a pool of workers
type WorkerPool struct {
    workers int
    jobs    chan func()
    wg      sync.WaitGroup
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(workers int) *WorkerPool {
    return &WorkerPool{
        workers: workers,
        jobs:    make(chan func(), workers*2),
    }
}

// Start starts the worker pool
func (wp *WorkerPool) Start() {
    for i := 0; i < wp.workers; i++ {
        wp.wg.Add(1)
        go func() {
            defer wp.wg.Done()
            for job := range wp.jobs {
                job()
            }
        }()
    }
}

// Submit submits a job to the pool
func (wp *WorkerPool) Submit(job func()) {
    wp.jobs <- job
}

// Stop stops the worker pool
func (wp *WorkerPool) Stop() {
    close(wp.jobs)
    wp.wg.Wait()
}

// ProcessWithRetry retries a function on failure
func ProcessWithRetry(ctx context.Context, maxRetries int, fn func() error) error {
    var err error
    for i := 0; i < maxRetries; i++ {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
            if err = fn(); err == nil {
                return nil
            }
        }
    }
    return err
}

// FanOut executes a function for each item concurrently
func FanOut[T any](ctx context.Context, items []T, fn func(context.Context, T) error) error {
    var wg sync.WaitGroup
    errChan := make(chan error, len(items))

    for _, item := range items {
        wg.Add(1)
        go func(i T) {
            defer wg.Done()
            if err := fn(ctx, i); err != nil {
                errChan <- err
            }
        }(item)
    }

    wg.Wait()
    close(errChan)

    for err := range errChan {
        if err != nil {
            return err
        }
    }

    return nil
}
