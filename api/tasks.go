package handler

import (
	"encoding/json"
	"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	// Mengatur header agar merespons JSON
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	switch r.Method {
	case http.MethodGet:
		// Contoh data task sementara atau dari database
		tasks := []map[string]interface{} {
			{"id": 1, "title": "Belajar Go dan React", "completed": false},
		}
		json.NewEncoder(w).Encode(tasks)

	case http.MethodPost:
		// Logika tambah task baru di sini
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Task created successfully"})

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
	}
}