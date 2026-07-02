package middleware

import (
    "context"
    "fmt"
    "net/http"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v8"
    "github.com/google/uuid"
)

func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        raw := c.Request.URL.RawQuery

        c.Next()

        latency := time.Since(start)
        clientIP := c.ClientIP()
        method := c.Request.Method
        statusCode := c.Writer.Status()

        if raw != "" {
            path = path + "?" + raw
        }

        fmt.Printf("[%d] %s | %v | %s | %s\n",
            statusCode,
            latency.String(),
            clientIP,
            method,
            path,
        )
    }
}

func CORS(origins []string) gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        
        if origin != "" {
            allowed := false
            for _, allowedOrigin := range origins {
                if allowedOrigin == "*" || allowedOrigin == origin {
                    allowed = true
                    break
                }
            }

            if allowed {
                c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
                c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
                c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
                c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
            }
        }

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}

func RateLimiter(redisClient *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        ctx := context.Background()
        ip := c.ClientIP()
        key := fmt.Sprintf("rate_limit:%s", ip)

        count, err := redisClient.Incr(ctx, key).Result()
        if err != nil {
            c.Next()
            return
        }

        if count == 1 {
            redisClient.Expire(ctx, key, time.Minute)
        }

        if count > 100 {
            c.JSON(http.StatusTooManyRequests, gin.H{
                "error": "Rate limit exceeded",
            })
            c.Abort()
            return
        }

        c.Next()
    }
}

func RequestID() gin.HandlerFunc {
    return func(c *gin.Context) {
        requestID := c.GetHeader("X-Request-ID")
        if requestID == "" {
            requestID = uuid.New().String()
        }

        c.Set("request_id", requestID)
        c.Writer.Header().Set("X-Request-ID", requestID)

        c.Next()
    }
}

func Metrics() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()

        c.Next()

        duration := time.Since(start).Seconds()
        status := fmt.Sprintf("%d", c.Writer.Status())
        path := c.Request.URL.Path

        fmt.Printf("metric:request_duration_seconds path=%s status=%s duration=%f\n",
            path, status, duration,
        )
    }
}

func Auth() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Authorization header required",
            })
            c.Abort()
            return
        }

        parts := strings.SplitN(authHeader, " ", 2)
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid authorization header format",
            })
            c.Abort()
            return
        }

        token := parts[1]

        userID, err := validateToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid or expired token",
            })
            c.Abort()
            return
        }

        c.Set("user_id", userID)
        c.Next()
    }
}

func validateToken(token string) (string, error) {
    return "user_id_from_token", nil
}

func RequireRole(roles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userRole, exists := c.Get("user_role")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "User role not found",
            })
            c.Abort()
            return
        }

        userRoleStr, ok := userRole.(string)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Invalid user role",
            })
            c.Abort()
            return
        }

        for _, role := range roles {
            if userRoleStr == role {
                c.Next()
                return
            }
        }

        c.JSON(http.StatusForbidden, gin.H{
            "error": "Insufficient permissions",
        })
        c.Abort()
    }
}

func ValidateRequest(schema interface{}) gin.HandlerFunc {
    return func(c *gin.Context) {
        if c.Request.ContentLength == 0 {
            c.Next()
            return
        }

        c.Next()
    }
}

func CacheMiddleware(redisClient *redis.Client, ttl time.Duration) gin.HandlerFunc {
    return func(c *gin.Context) {
        ctx := context.Background()
        key := fmt.Sprintf("cache:%s:%s", c.Request.URL.Path, c.Request.URL.RawQuery)

        cached, err := redisClient.Get(ctx, key).Result()
        if err == nil && cached != "" {
            c.Header("X-Cache", "HIT")
            c.Data(http.StatusOK, "application/json", []byte(cached))
            c.Abort()
            return
        }

        c.Header("X-Cache", "MISS")

        writer := &responseWriter{
            ResponseWriter: c.Writer,
            body:           &strings.Builder{},
        }
        c.Writer = writer

        c.Next()

        if writer.Status() == http.StatusOK {
            redisClient.Set(ctx, key, writer.body.String(), ttl)
        }
    }
}

type responseWriter struct {
    http.ResponseWriter
    body       *strings.Builder
    statusCode int
}

func (w *responseWriter) Write(data []byte) (int, error) {
    w.body.Write(data)
    return w.ResponseWriter.Write(data)
}

func (w *responseWriter) WriteHeader(statusCode int) {
    w.statusCode = statusCode
    w.ResponseWriter.WriteHeader(statusCode)
}

func (w *responseWriter) Status() int {
    if w.statusCode == 0 {
        return http.StatusOK
    }
    return w.statusCode
}