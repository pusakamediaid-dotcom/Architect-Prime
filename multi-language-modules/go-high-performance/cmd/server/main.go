package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
    "github.com/jackc/pgx/v4/pgxpool"
    
    "architect-prime/cmd/server/handlers"
    "architect-prime/cmd/server/middleware"
    "architect-prime/internal/config"
    "architect-prime/pkg/logger"
    "architect-prime/pkg/metrics"
)

func main() {
    cfg := config.Load()
    
    logger.Init(cfg.LogLevel)
    defer logger.Sync()

    ctx := context.Background()

    dbPool, err := initDatabase(ctx, cfg)
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer dbPool.Close()

    redisClient := initRedis(ctx, cfg)
    defer redisClient.Close()

    metricsServer := metrics.NewServer(cfg.MetricsPort)
    go metricsServer.Start()

    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    router := setupRouter(cfg, dbPool, redisClient)

    server := &http.Server{
        Addr:         fmt.Sprintf(":%s", cfg.Port),
        Handler:      router,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    go func() {
        logger.Info(fmt.Sprintf("Server starting on port %s", cfg.Port))
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            logger.Fatal(fmt.Sprintf("Server failed: %v", err))
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    logger.Info("Shutting down server...")

    shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(shutdownCtx); err != nil {
        logger.Error(fmt.Sprintf("Server forced to shutdown: %v", err))
    }

    logger.Info("Server exited")
}

func initDatabase(ctx context.Context, cfg *config.Config) (*pgxpool.Pool, error) {
    connString := fmt.Sprintf(
        "postgres://%s:%s@%s:%s/%s?sslmode=%s",
        cfg.Database.User,
        cfg.Database.Password,
        cfg.Database.Host,
        cfg.Database.Port,
        cfg.Database.Name,
        cfg.Database.SSLMode,
    )

    poolConfig, err := pgxpool.ParseConfig(connString)
    if err != nil {
        return nil, fmt.Errorf("failed to parse connection string: %w", err)
    }

    poolConfig.MaxConns = cfg.Database.MaxConns
    poolConfig.MinConns = cfg.Database.MinConns
    poolConfig.MaxConnLifetime = time.Duration(cfg.Database.MaxConnLifetime) * time.Second
    poolConfig.MaxConnIdleTime = time.Duration(cfg.Database.MaxConnIdleTime) * time.Second

    pool, err := pgxpool.ConnectConfig(ctx, poolConfig)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }

    if err := pool.Ping(ctx); err != nil {
        return nil, fmt.Errorf("failed to ping database: %w", err)
    }

    logger.Info("Connected to PostgreSQL database")
    return pool, nil
}

func initRedis(ctx context.Context, cfg *config.Config) *redis.Client {
    client := redis.NewClient(&redis.Options{
        Addr:     cfg.Redis.Addr,
        Password: cfg.Redis.Password,
        DB:       cfg.Redis.DB,
        PoolSize: cfg.Redis.PoolSize,
    })

    if err := client.Ping(ctx).Err(); err != nil {
        logger.Warn(fmt.Sprintf("Redis connection failed: %v", err))
    } else {
        logger.Info("Connected to Redis")
    }

    return client
}

func setupRouter(cfg *config.Config, db *pgxpool.Pool, redis *redis.Client) *gin.Engine {
    router := gin.New()
    
    router.Use(gin.Recovery())
    router.Use(middleware.Logger())
    router.Use(middleware.CORS(cfg.AllowedOrigins))
    router.Use(middleware.RateLimiter(redis))
    router.Use(middleware.RequestID())
    router.Use(middleware.Metrics())

    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":    "healthy",
            "timestamp": time.Now().UTC(),
        })
    })

    v1 := router.Group("/api/v1")
    {
        userHandler := handlers.NewUserHandler(db, redis)
        userRoutes := v1.Group("/users")
        {
            userRoutes.GET("", userHandler.List)
            userRoutes.POST("", userHandler.Create)
            userRoutes.GET("/:id", userHandler.Get)
            userRoutes.PUT("/:id", userHandler.Update)
            userRoutes.DELETE("/:id", userHandler.Delete)
        }

        orderHandler := handlers.NewOrderHandler(db, redis)
        orderRoutes := v1.Group("/orders")
        {
            orderRoutes.GET("", orderHandler.List)
            orderRoutes.POST("", orderHandler.Create)
            orderRoutes.GET("/:id", orderHandler.Get)
            orderRoutes.PUT("/:id/status", orderHandler.UpdateStatus)
        }

        paymentHandler := handlers.NewPaymentHandler(db, redis)
        paymentRoutes := v1.Group("/payments")
        {
            paymentRoutes.POST("/initiate", paymentHandler.Initiate)
            paymentRoutes.POST("/confirm", paymentHandler.Confirm)
        }
    }

    return router
}

type Config struct {
    Port           string
    Environment    string
    LogLevel       string
    MetricsPort    string
    AllowedOrigins []string
    Database       DatabaseConfig
    Redis          RedisConfig
}

type DatabaseConfig struct {
    Host            string
    Port            string
    Name            string
    User            string
    Password        string
    SSLMode         string
    MaxConns        int32
    MinConns        int32
    MaxConnLifetime int
    MaxConnIdleTime int
}

type RedisConfig struct {
    Addr     string
    Password string
    DB       int
    PoolSize int
}

func Load() *Config {
    return &Config{
        Port:           getEnv("PORT", "8080"),
        Environment:    getEnv("ENVIRONMENT", "development"),
        LogLevel:       getEnv("LOG_LEVEL", "info"),
        MetricsPort:    getEnv("METRICS_PORT", "9090"),
        AllowedOrigins: []string{"*"},
        Database: DatabaseConfig{
            Host:            getEnv("DB_HOST", "localhost"),
            Port:            getEnv("DB_PORT", "5432"),
            Name:            getEnv("DB_NAME", "architect_prime"),
            User:            getEnv("DB_USER", "postgres"),
            Password:        getEnv("DB_PASSWORD", "postgres"),
            SSLMode:         getEnv("DB_SSLMODE", "disable"),
            MaxConns:        10,
            MinConns:        2,
            MaxConnLifetime: 3600,
            MaxConnIdleTime: 1800,
        },
        Redis: RedisConfig{
            Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
            Password: getEnv("REDIS_PASSWORD", ""),
            DB:       0,
            PoolSize: 10,
        },
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}