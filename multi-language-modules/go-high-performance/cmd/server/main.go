package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
)

func main() {
    // Initialize Gin
    gin.SetMode(gin.ReleaseMode)
    router := gin.New()
    router.Use(gin.Logger())
    router.Use(gin.Recovery())

    // Routes
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "healthy",
            "timestamp": time.Now().Format(time.RFC3339),
        })
    })

    router.GET("/api/users", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "users": []string{},
            "count": 0,
        })
    })

    // Create server
    srv := &http.Server{
        Addr:    ":8080",
        Handler: router,
    }

    // Graceful shutdown
    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Failed to start server: %v", err)
        }
    }()

    // Wait for interrupt signal
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exited")
}
