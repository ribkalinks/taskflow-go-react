package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Task struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

var tasks = []Task{
	{ID: "1", Title: "Belajar Golang dan Gin", Done: true},
	{ID: "2", Title: "Membuat Full-Stack Go & React", Done: false},
}

func main() {
	r := gin.Default()

	// Middleware CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Endpoint GET
	r.GET("/api/tasks", func(c *gin.Context) {
		c.JSON(http.StatusOK, tasks)
	})

	// Endpoint POST
	r.POST("/api/tasks", func(c *gin.Context) {
		var newTask Task
		if err := c.ShouldBindJSON(&newTask); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		tasks = append(tasks, newTask)
		c.JSON(http.StatusCreated, newTask)
	})

	r.Run(":8080")
}