package concurrency

import (
    "context"
    "fmt"
    "sync"
    "time"
)

type WorkerPool struct {
    workers    int
    jobQueue   chan Job
    wg         sync.WaitGroup
    ctx        context.Context
    cancel     context.CancelFunc
}

type Job func() error

func NewWorkerPool(workers int, bufferSize int) *WorkerPool {
    ctx, cancel := context.WithCancel(context.Background())
    
    return &WorkerPool{
        workers:  workers,
        jobQueue: make(chan Job, bufferSize),
        ctx:      ctx,
        cancel:   cancel,
    }
}

func (wp *WorkerPool) Start() {
    for i := 0; i < wp.workers; i++ {
        wp.wg.Add(1)
        go wp.worker(i)
    }
}

func (wp *WorkerPool) worker(id int) {
    defer wp.wg.Done()
    
    for {
        select {
        case job, ok := <-wp.jobQueue:
            if !ok {
                return
            }
            
            if err := job(); err != nil {
                fmt.Printf("Worker %d: job failed with error: %v\n", id, err)
            }
            
        case <-wp.ctx.Done():
            return
        }
    }
}

func (wp *WorkerPool) Submit(job Job) bool {
    select {
    case wp.jobQueue <- job:
        return true
    case <-wp.ctx.Done():
        return false
    default:
        return false
    }
}

func (wp *WorkerPool) Stop() {
    wp.cancel()
    close(wp.jobQueue)
    wp.wg.Wait()
}

func (wp *WorkerPool) WaitGroup() *sync.WaitGroup {
    return &wp.wg
}

type Semaphore struct {
    sem     chan struct{}
    wg      sync.WaitGroup
}

func NewSemaphore(maxConcurrent int) *Semaphore {
    return &Semaphore{
        sem: make(chan struct{}, maxConcurrent),
    }
}

func (s *Semaphore) Acquire() {
    s.sem <- struct{}{}
    s.wg.Add(1)
}

func (s *Semaphore) Release() {
    <-s.sem
    s.wg.Done()
}

func (s *Semaphore) Wait() {
    s.wg.Wait()
}

type RateLimiter struct {
    rate     int
    burst    int
    tokens   float64
    lastTime time.Time
    mu       sync.Mutex
}

func NewRateLimiter(rate int, burst int) *RateLimiter {
    return &RateLimiter{
        rate:     rate,
        burst:    burst,
        tokens:   float64(burst),
        lastTime: time.Now(),
    }
}

func (rl *RateLimiter) Allow() bool {
    rl.mu.Lock()
    defer rl.mu.Unlock()
    
    now := time.Now()
    elapsed := now.Sub(rl.lastTime).Seconds()
    rl.lastTime = now
    
    rl.tokens += elapsed * float64(rl.rate)
    if rl.tokens > float64(rl.burst) {
        rl.tokens = float64(rl.burst)
    }
    
    if rl.tokens < 1 {
        return false
    }
    
    rl.tokens--
    return true
}

func (rl *RateLimiter) Wait() {
    for !rl.Allow() {
        time.Sleep(time.Millisecond * 10)
    }
}

type OnceRunner struct {
    once   sync.Once
    result interface{}
    err    error
}

func (or *OnceRunner) Run(fn func() (interface{}, error)) (interface{}, error) {
    or.once.Do(func() {
        or.result, or.err = fn()
    })
    return or.result, or.err
}

type Future struct {
    result chan interface{}
    err    chan error
}

func NewFuture() *Future {
    return &Future{
        result: make(chan interface{}, 1),
        err:    make(chan error, 1),
    }
}

func (f *Future) Resolve(value interface{}) {
    f.result <- value
}

func (f *Future) Reject(err error) {
    f.err <- err
}

func (f *Future) Get() (interface{}, error) {
    select {
    case result := <-f.result:
        return result, nil
    case err := <-f.err:
        return nil, err
    }
}

func (f *Future) GetWithTimeout(timeout time.Duration) (interface{}, error) {
    select {
    case result := <-f.result:
        return result, nil
    case err := <-f.err:
        return nil, err
    case <-time.After(timeout):
        return nil, fmt.Errorf("timeout after %v", timeout)
    }
}

type Pipeline struct {
    stages   []Stage
    ctx      context.Context
    cancel   context.CancelFunc
    wg       sync.WaitGroup
}

type Stage struct {
    Process func(interface{}) interface{}
    Buffer  int
}

func NewPipeline(stages []Stage) *Pipeline {
    ctx, cancel := context.WithCancel(context.Background())
    return &Pipeline{
        stages: stages,
        ctx:    ctx,
        cancel: cancel,
    }
}

func (p *Pipeline) Process(input <-chan interface{}, output chan<- interface{}) {
    if len(p.stages) == 0 {
        return
    }
    
    firstStage := p.stages[0]
    currentChan := make(chan interface{}, firstStage.Buffer)
    
    p.wg.Add(1)
    go p.runStage(0, input, currentChan)
    
    for i := 1; i < len(p.stages)-1; i++ {
        nextChan := make(chan interface{}, p.stages[i].Buffer)
        p.wg.Add(1)
        go p.runStage(i, currentChan, nextChan)
        currentChan = nextChan
    }
    
    if len(p.stages) > 1 {
        lastStage := p.stages[len(p.stages)-1]
        p.wg.Add(1)
        go p.runStage(len(p.stages)-1, currentChan, output)
    }
}

func (p *Pipeline) runStage(index int, input <-chan interface{}, output chan<- interface{}) {
    defer p.wg.Done()
    
    stage := p.stages[index]
    
    for {
        select {
        case item, ok := <-input:
            if !ok {
                close(output)
                return
            }
            
            result := stage.Process(item)
            if result != nil {
                select {
                case output <- result:
                case <-p.ctx.Done():
                    return
                }
            }
            
        case <-p.ctx.Done():
            return
        }
    }
}

func (p *Pipeline) Stop() {
    p.cancel()
    p.wg.Wait()
}