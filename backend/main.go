package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Task struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Done     bool   `json:"done"`
	Priority string `json:"priority"` // Field baru: "high", "medium", atau "low"
}

var tasks = []Task{
	{ID: "1", Title: "Belajar Golang dan Gin", Done: true, Priority: "high"},
	{ID: "2", Title: "Membuat Full-Stack Go & React", Done: false, Priority: "medium"},
}

func main() {
	r := gin.Default()

	// Konfigurasi CORS sederhana agar frontend bisa akses
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Get all tasks
	r.GET("/api/tasks", func(c *gin.Context) {
		c.JSON(http.StatusOK, tasks)
	})

	// Add task
	r.POST("/api/tasks", func(c *gin.Context) {
		var newTask Task
		if err := c.BindJSON(&newTask); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Default priority jika kosong
		if newTask.Priority == "" {
			newTask.Priority = "medium"
		}
		tasks = append(tasks, newTask)
		c.JSON(http.StatusCreated, newTask)
	})

	// Update task (bisa untuk status, title, atau priority)
	r.PUT("/api/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		var updatedData Task
		if err := c.BindJSON(&updatedData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		for i, task := range tasks {
			if task.ID == id {
				if updatedData.Title != "" {
					tasks[i].Title = updatedData.Title
				}
				// Gunakan pointer atau cek logic boolean untuk update 'done'
				tasks[i].Done = updatedData.Done
				if updatedData.Priority != "" {
					tasks[i].Priority = updatedData.Priority
				}
				c.JSON(http.StatusOK, tasks[i])
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Task tidak ditemukan"})
	})

	// Delete task
	r.DELETE("/api/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		for i, task := range tasks {
			if task.ID == id {
				tasks = append(tasks[:i], tasks[i+1:]...)
				c.JSON(http.StatusOK, gin.H{"message": "Task berhasil dihapus"})
				return
			}
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Task tidak ditemukan"})
	})

	r.Run(":8080")
}