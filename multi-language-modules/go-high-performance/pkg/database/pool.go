package database

import (
    "context"
    "fmt"
    "sync"
    "sync/atomic"
    "time"

    "github.com/jackc/pgx/v4/pgxpool"
    "github.com/go-redis/redis/v8"
)

type ConnectionPool struct {
    pool       *pgxpool.Pool
    config     *PoolConfig
    stats      PoolStats
    mu         sync.RWMutex
}

type PoolConfig struct {
    MaxConns        int32
    MinConns        int32
    MaxConnLifetime time.Duration
    MaxConnIdleTime time.Duration
    HealthCheckPeriod time.Duration
    ConnectTimeout  time.Duration
}

type PoolStats struct {
    TotalConnections    int64
    IdleConnections     int64
    ActiveConnections   int64
    StaleConnections    int64
    WaitQueueLength     int64
    ConnectionTimeouts  int64
    HealthCheckFailures int64
}

type RedisPool struct {
    client *redis.Client
    config *RedisConfig
    stats  RedisStats
    mu     sync.RWMutex
}

type RedisConfig struct {
    Addr         string
    Password     string
    DB           int
    PoolSize     int
    MinIdleConns int
    MaxConnAge   time.Duration
    ReadTimeout  time.Duration
    WriteTimeout time.Duration
}

type RedisStats struct {
    Hits       int64
    Misses     int64
   Timeouts   int64
    Connections int64
}

func NewConnectionPool(ctx context.Context, connString string, config *PoolConfig) (*ConnectionPool, error) {
    poolConfig, err := pgxpool.ParseConfig(connString)
    if err != nil {
        return nil, fmt.Errorf("failed to parse connection string: %w", err)
    }

    poolConfig.MaxConns = config.MaxConns
    poolConfig.MinConns = config.MinConns
    poolConfig.MaxConnLifetime = config.MaxConnLifetime
    poolConfig.MaxConnIdleTime = config.MaxConnIdleTime

    pool, err := pgxpool.ConnectConfig(ctx, poolConfig)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }

    cp := &ConnectionPool{
        pool:   pool,
        config: config,
    }

    go cp.healthCheckLoop(ctx)

    return cp, nil
}

func (cp *ConnectionPool) Acquire(ctx context.Context) (*pgxpool.Conn, error) {
    start := time.Now()
    
    conn, err := cp.pool.Acquire(ctx)
    if err != nil {
        atomic.AddInt64(&cp.stats.ConnectionTimeouts, 1)
        return nil, fmt.Errorf("failed to acquire connection: %w", err)
    }

    elapsed := time.Since(start)
    if elapsed > time.Second {
        fmt.Printf("Slow connection acquisition: %v\n", elapsed)
    }

    atomic.AddInt64(&cp.stats.TotalConnections, 1)
    
    return conn, nil
}

func (cp *ConnectionPool) WithConnection(ctx context.Context, fn func(*pgxpool.Conn) error) error {
    conn, err := cp.Acquire(ctx)
    if err != nil {
        return err
    }
    defer conn.Release()

    return fn(conn)
}

func (cp *ConnectionPool) Query(ctx context.Context, sql string, args ...interface{}) ([][]interface{}, error) {
    var results [][]interface{}
    
    err := cp.WithConnection(ctx, func(conn *pgxpool.Conn) error {
        rows, err := conn.Query(ctx, sql, args...)
        if err != nil {
            return err
        }
        defer rows.Close()

        for rows.Next() {
            values, err := rows.Values()
            if err != nil {
                return err
            }
            results = append(results, values)
        }

        return rows.Err()
    })

    return results, err
}

func (cp *ConnectionPool) Execute(ctx context.Context, sql string, args ...interface{}) (int64, error) {
    var affected int64
    
    err := cp.WithConnection(ctx, func(conn *pgxpool.Conn) error {
        result, err := conn.Exec(ctx, sql, args...)
        if err != nil {
            return err
        }
        affected = result.RowsAffected()
        return nil
    })

    return affected, err
}

func (cp *ConnectionPool) healthCheckLoop(ctx context.Context) {
    ticker := time.NewTicker(cp.config.HealthCheckPeriod)
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            cp.performHealthCheck(ctx)
        }
    }
}

func (cp *ConnectionPool) performHealthCheck(ctx context.Context) {
    err := cp.pool.Ping(ctx)
    if err != nil {
        atomic.AddInt64(&cp.stats.HealthCheckFailures, 1)
        fmt.Printf("Health check failed: %v\n", err)
    }
}

func (cp *ConnectionPool) GetStats() PoolStats {
    cp.mu.RLock()
    defer cp.mu.RUnlock()

    stat := PoolStats{}
    stat.TotalConnections = atomic.LoadInt64(&cp.stats.TotalConnections)
    stat.IdleConnections = atomic.LoadInt64(&cp.stats.IdleConnections)
    stat.ActiveConnections = atomic.LoadInt64(&cp.stats.ActiveConnections)
    stat.StaleConnections = atomic.LoadInt64(&cp.stats.StaleConnections)
    stat.WaitQueueLength = atomic.LoadInt64(&cp.stats.WaitQueueLength)
    stat.ConnectionTimeouts = atomic.LoadInt64(&cp.stats.ConnectionTimeouts)
    stat.HealthCheckFailures = atomic.LoadInt64(&cp.stats.HealthCheckFailures)

    return stat
}

func (cp *ConnectionPool) Close() {
    cp.pool.Close()
}

func NewRedisPool(config *RedisConfig) *RedisPool {
    client := redis.NewClient(&redis.Options{
        Addr:         config.Addr,
        Password:     config.Password,
        DB:           config.DB,
        PoolSize:     config.PoolSize,
        MinIdleConns: config.MinIdleConns,
        MaxConnAge:   config.MaxConnAge,
        ReadTimeout:  config.ReadTimeout,
        WriteTimeout: config.WriteTimeout,
    })

    return &RedisPool{
        client: client,
        config: config,
    }
}

func (rp *RedisPool) Get(ctx context.Context, key string) (string, error) {
    val, err := rp.client.Get(ctx, key).Result()
    if err == redis.Nil {
        atomic.AddInt64(&rp.stats.Misses, 1)
        return "", nil
    } else if err != nil {
        return "", err
    }
    
    atomic.AddInt64(&rp.stats.Hits, 1)
    return val, nil
}

func (rp *RedisPool) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
    return rp.client.Set(ctx, key, value, expiration).Err()
}

func (rp *RedisPool) Delete(ctx context.Context, keys ...string) (int64, error) {
    return rp.client.Del(ctx, keys...).Result()
}

func (rp *RedisPool) Exists(ctx context.Context, keys ...string) (int64, error) {
    return rp.client.Exists(ctx, keys...).Result()
}

func (rp *RedisPool) Expire(ctx context.Context, key string, expiration time.Duration) (bool, error) {
    return rp.client.Expire(ctx, key, expiration).Result()
}

func (rp *RedisPool) Incr(ctx context.Context, key string) (int64, error) {
    return rp.client.Incr(ctx, key).Result()
}

func (rp *RedisPool) HSet(ctx context.Context, key string, values ...interface{}) (int64, error) {
    return rp.client.HSet(ctx, key, values...).Result()
}

func (rp *RedisPool) HGet(ctx context.Context, key, field string) (string, error) {
    return rp.client.HGet(ctx, key, field).Result()
}

func (rp *RedisPool) HGetAll(ctx context.Context, key string) (map[string]string, error) {
    return rp.client.HGetAll(ctx, key).Result()
}

func (rp *RedisPool) LPush(ctx context.Context, key string, values ...interface{}) (int64, error) {
    return rp.client.LPush(ctx, key, values...).Result()
}

func (rp *RedisPool) RPop(ctx context.Context, key string) (string, error) {
    return rp.client.RPop(ctx, key).Result()
}

func (rp *RedisPool) SAdd(ctx context.Context, key string, members ...interface{}) (int64, error) {
    return rp.client.SAdd(ctx, key, members...).Result()
}

func (rp *RedisPool) SMembers(ctx context.Context, key string) ([]string, error) {
    return rp.client.SMembers(ctx, key).Result()
}

func (rp *RedisPool) Pipeline() *redis.Pipeline {
    return rp.client.Pipeline()
}

func (rp *RedisPool) Ping(ctx context.Context) error {
    return rp.client.Ping(ctx).Err()
}

func (rp *RedisPool) Close() error {
    return rp.client.Close()
}

func (rp *RedisPool) GetStats() RedisStats {
    rp.mu.RLock()
    defer rp.mu.RUnlock()
    return rp.stats
}